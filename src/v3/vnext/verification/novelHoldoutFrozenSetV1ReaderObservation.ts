/**
 * Frozen Set v1 — READER OBSERVATION (verification-only).
 *
 * Runs Freeze-accepted FSV1 questions through Production QuestionReader
 * once, then compares Actual vs Independent Gold.
 *
 * Source of truth for iteration:
 *   Freeze acceptedRows / acceptedRowIds (deterministic sorted order)
 *
 * Order (Blind Gold independence):
 *   QUESTION → READER → ACTUAL
 *   then ACTUAL + GOLD → COMPARISON / failure classification
 *
 * Forbidden:
 * - Mutating Freeze / Selection / Question / Gold / Gate
 * - Mutating Production QuestionReader / DecisionEngine / consulting
 * - Injecting Gold expected axes into Reader input
 * - Using Gold to steer Reader execution path
 * - Blind A1–A5 / 50-quota fixtures
 */

import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  readQuestion,
} from "../../consulting/question/questionReader.js";
import type {
  DecisionTarget,
  QuestionActionRelation,
  QuestionAnalysisMode,
  QuestionIntent,
  QuestionIntentOrLegacy,
  QuestionTimingType,
  QuestionTopic,
} from "../../consulting/question/questionReader.js";
import type {
  NovelHoldoutFamily,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";
import {
  compareBlindGoldToReaderActual,
  type NovelHoldoutBlindGoldSnapshot,
  type NovelHoldoutGoldVsActualCompare,
  type NovelHoldoutReaderActualSnapshot,
} from "./novelHoldoutBlindGoldProtocol.js";
import {
  classifyNovelHoldoutGoldVsActualFailure,
  type NovelHoldoutFailureClassification,
  type NovelHoldoutFailureLabel,
} from "./novelHoldoutFailureClassification.js";
import {
  buildFrozenSetV1FreezeSnapshot,
  NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION,
  type FrozenSetV1FreezeSnapshot,
} from "./novelHoldoutFrozenSetV1Freeze.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
  type NovelHoldoutFrozenSetV1GoldRow,
} from "./novelHoldoutFrozenSetV1Gold.js";

export const FROZEN_SET_V1_READER_OBSERVATION_STEP =
  "FSV1-READER-OBSERVATION" as const;

export const FROZEN_SET_V1_READER_OBSERVATION_EXPECTED_COUNT = 160 as const;

export type FrozenSetV1ReaderDiagnostics = {
  objectLabel?: string;
  objectSurfaceRemnant?: string;
  objectReferent?: unknown;
  primaryAxis: string;
  actionRelations: readonly QuestionActionRelation[];
};

export type FrozenSetV1ReaderActualRecord = {
  id: string;
  question: string;
  actualTopic: QuestionTopic;
  actualIntent: QuestionIntentOrLegacy;
  actualDecisionTarget: DecisionTarget;
  actualTimingType?: QuestionTimingType;
  actualAnalysisMode?: QuestionAnalysisMode;
  diagnostics: FrozenSetV1ReaderDiagnostics;
  /**
   * Protocol snapshot used for Gold comparison only (after Reader run).
   */
  protocolActual: NovelHoldoutReaderActualSnapshot;
};

export type FrozenSetV1ReaderObservationRow = {
  id: string;
  family: NovelHoldoutFamily;
  taxonomyPrimary: NovelHoldoutTaxonomy;
  question: string;
  matchPolicy: NovelHoldoutBlindGoldSnapshot["matchPolicy"];
  gold: NovelHoldoutBlindGoldSnapshot;
  actual: FrozenSetV1ReaderActualRecord;
  compare: NovelHoldoutGoldVsActualCompare;
  failureClassification: NovelHoldoutFailureClassification | null;
  topicMatch: boolean;
  intentMatch: boolean;
  decisionTargetMatch: boolean;
  timingMatch: boolean;
  analysisModeMatch: boolean;
  /**
   * Primary-axis Exact Match (topic|intent|decisionTarget).
   */
  exactMatch: boolean;
  /**
   * Clean match: no failure classification.
   */
  match: boolean;
  reason: string | null;
};

export type FrozenSetV1FailureClassificationCounts = Record<
  NovelHoldoutFailureLabel,
  number
>;

export type FrozenSetV1FreezeIntegrityFingerprint = {
  freezeRevision: string;
  contentHash: string;
  acceptedCount: number;
  rowCount: number;
  rejectedCount: number;
  draftExcludedCount: number;
  acceptedRowIds: readonly string[];
  sealed: boolean;
  readerExecuted: false;
};

export type FrozenSetV1ReaderObservationResult = {
  step: typeof FROZEN_SET_V1_READER_OBSERVATION_STEP;
  freezeRevision: typeof NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION;
  /**
   * Harness integrity (freeze / independence / execution completeness).
   * Does NOT require Reader Exact Match == 160/160.
   */
  passed: boolean;
  reader: "EXECUTED" | "NOT RUN";
  readerExecuted: boolean;
  abortReason: string | null;
  acceptedCount: number;
  observedCount: number;
  missingCount: number;
  duplicateCount: number;
  total: number;
  exactMatch: number;
  topicMatch: number;
  intentMatch: number;
  decisionTargetMatch: number;
  timingMatch: number;
  analysisModeMatch: number;
  match: number;
  mismatch: number;
  failureClassification: FrozenSetV1FailureClassificationCounts;
  freezeIntegrity: "PASS" | "FAIL";
  freezeBefore: FrozenSetV1FreezeIntegrityFingerprint | null;
  freezeAfter: FrozenSetV1FreezeIntegrityFingerprint | null;
  goldSeparation: "PASS" | "FAIL";
  production: "UNCHANGED";
  rows: readonly FrozenSetV1ReaderObservationRow[];
  mismatchRows: readonly FrozenSetV1ReaderObservationRow[];
  checks: Readonly<Record<string, boolean>>;
};

function emptyFailureCounts(): FrozenSetV1FailureClassificationCounts {
  return {
    VOCABULARY_GAP: 0,
    SEMANTIC_RULE_GAP: 0,
    BOUNDARY_ERROR: 0,
    ORACLE_CONFLICT: 0,
    DESIGN_LIMIT: 0,
    AMBIGUOUS: 0,
    TIMING_ONLY_DRIFT: 0,
    COMPOSITE_LIMIT: 0,
  };
}

function axisOf(
  topic: string,
  intent: string,
  decisionTarget: string,
): string {
  return `${topic}|${intent}|${decisionTarget}`;
}

function sameStringList(
  left: readonly string[],
  right: readonly string[],
): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function captureFreezeIntegrity(
  snapshot: FrozenSetV1FreezeSnapshot,
): FrozenSetV1FreezeIntegrityFingerprint {
  const manifest = snapshot.frozenSetManifest;
  return {
    freezeRevision: snapshot.freezeRevision,
    contentHash: manifest.contentHash,
    acceptedCount: manifest.acceptedCount,
    rowCount: manifest.rowCount,
    rejectedCount: manifest.rejectedCount,
    draftExcludedCount: manifest.draftExcludedCount,
    acceptedRowIds: [...manifest.acceptedRowIds],
    sealed: snapshot.sealed,
    readerExecuted: false,
  };
}

function freezeIntegrityEqual(
  left: FrozenSetV1FreezeIntegrityFingerprint,
  right: FrozenSetV1FreezeIntegrityFingerprint,
): boolean {
  return (
    left.freezeRevision === right.freezeRevision
    && left.contentHash === right.contentHash
    && left.acceptedCount === right.acceptedCount
    && left.rowCount === right.rowCount
    && left.rejectedCount === right.rejectedCount
    && left.draftExcludedCount === right.draftExcludedCount
    && left.sealed === right.sealed
    && left.readerExecuted === right.readerExecuted
    && sameStringList(left.acceptedRowIds, right.acceptedRowIds)
  );
}

function evaluateFreezeIntegrityBeforeReader(
  snapshot: FrozenSetV1FreezeSnapshot,
): {
  freezeIntegrity: "PASS" | "FAIL";
  fingerprint: FrozenSetV1FreezeIntegrityFingerprint;
  reasons: readonly string[];
} {
  const fingerprint = captureFreezeIntegrity(snapshot);
  const manifest = snapshot.frozenSetManifest;
  const reasons: string[] = [];

  if (snapshot.freezeRevision !== NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION) {
    reasons.push(
      `freezeRevision=${snapshot.freezeRevision} expected=${NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION}`,
    );
  }
  if (snapshot.sealed !== true) {
    reasons.push(`sealed=${snapshot.sealed}`);
  }
  if (snapshot.readerExecuted !== false) {
    reasons.push(`readerExecuted=${String(snapshot.readerExecuted)}`);
  }
  if (snapshot.readerActualAttached !== false) {
    reasons.push(
      `readerActualAttached=${String(snapshot.readerActualAttached)}`,
    );
  }
  if (manifest.acceptedCount !== FROZEN_SET_V1_READER_OBSERVATION_EXPECTED_COUNT) {
    reasons.push(
      `acceptedCount=${manifest.acceptedCount} expected=${FROZEN_SET_V1_READER_OBSERVATION_EXPECTED_COUNT}`,
    );
  }
  if (manifest.rowCount !== FROZEN_SET_V1_READER_OBSERVATION_EXPECTED_COUNT) {
    reasons.push(
      `rowCount=${manifest.rowCount} expected=${FROZEN_SET_V1_READER_OBSERVATION_EXPECTED_COUNT}`,
    );
  }
  if (manifest.rejectedCount !== 0) {
    reasons.push(`rejectedCount=${manifest.rejectedCount}`);
  }
  if (manifest.draftExcludedCount !== 0) {
    reasons.push(`draftExcludedCount=${manifest.draftExcludedCount}`);
  }
  if (
    manifest.acceptedRowIds.length
      !== FROZEN_SET_V1_READER_OBSERVATION_EXPECTED_COUNT
  ) {
    reasons.push(
      `acceptedRowIds.length=${manifest.acceptedRowIds.length}`,
    );
  }

  const uniqueIds = new Set(manifest.acceptedRowIds);
  if (uniqueIds.size !== manifest.acceptedRowIds.length) {
    reasons.push("acceptedRowIds contain duplicates");
  }

  const sortedIds = [...manifest.acceptedRowIds].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0
  );
  if (!sameStringList(manifest.acceptedRowIds, sortedIds)) {
    reasons.push("acceptedRowIds are not deterministically sorted");
  }

  if (snapshot.acceptedRows.length !== manifest.acceptedCount) {
    reasons.push(
      `acceptedRows.length=${snapshot.acceptedRows.length} != acceptedCount=${manifest.acceptedCount}`,
    );
  }

  return {
    freezeIntegrity: reasons.length === 0 ? "PASS" : "FAIL",
    fingerprint,
    reasons,
  };
}

/**
 * Run Production QuestionReader on the raw question text.
 * No synonym rewrite / pre-normalization beyond what Reader itself does.
 * Gold expected axes are never passed into Reader input.
 */
function observeReaderActual(
  question: string,
): Omit<FrozenSetV1ReaderActualRecord, "id"> {
  const humanContext = buildDecisionEngineRegressionInput().humanContext;
  const result = readQuestion(humanContext, question);

  const protocolActual: NovelHoldoutReaderActualSnapshot = {
    topic: result.topic as QuestionTopic,
    intent: result.intent as QuestionIntent,
    decisionTarget: result.decisionTarget as DecisionTarget,
    timingType: result.timingType as QuestionTimingType | undefined,
    analysisMode: result.analysisMode as QuestionAnalysisMode | undefined,
    provenance: "reader_runtime_observation",
  };

  return {
    question,
    actualTopic: protocolActual.topic,
    actualIntent: protocolActual.intent,
    actualDecisionTarget: protocolActual.decisionTarget,
    actualTimingType: protocolActual.timingType,
    actualAnalysisMode: protocolActual.analysisMode,
    diagnostics: {
      objectLabel: result.objectLabel,
      objectSurfaceRemnant: result.objectSurfaceRemnant,
      objectReferent: result.objectReferent,
      primaryAxis: axisOf(
        protocolActual.topic,
        protocolActual.intent,
        protocolActual.decisionTarget,
      ),
      actionRelations:
        result.readerMatchDiagnostics?.actionRelations ?? [],
    },
    protocolActual,
  };
}

function buildMismatchReason(
  gold: NovelHoldoutBlindGoldSnapshot,
  actual: NovelHoldoutReaderActualSnapshot,
  classification: NovelHoldoutFailureClassification | null,
): string | null {
  if (!classification) {
    return null;
  }

  const diffs: string[] = [];
  if (gold.expectedTopic !== actual.topic) {
    diffs.push(`topic ${gold.expectedTopic}→${actual.topic}`);
  }
  if (gold.expectedIntent !== actual.intent) {
    diffs.push(`intent ${gold.expectedIntent}→${actual.intent}`);
  }
  if (gold.expectedDecisionTarget !== actual.decisionTarget) {
    diffs.push(
      `decisionTarget ${gold.expectedDecisionTarget}→${actual.decisionTarget}`,
    );
  }
  if ((gold.expectedTimingType ?? null) !== (actual.timingType ?? null)) {
    diffs.push(
      `timing ${(gold.expectedTimingType ?? "none")}→${actual.timingType ?? "none"}`,
    );
  }
  if (
    (gold.expectedAnalysisMode ?? null) !== (actual.analysisMode ?? null)
  ) {
    diffs.push(
      `analysisMode ${(gold.expectedAnalysisMode ?? "none")}→${
        actual.analysisMode ?? "none"
      }`,
    );
  }

  const goldAxis = axisOf(
    gold.expectedTopic,
    gold.expectedIntent,
    gold.expectedDecisionTarget,
  );
  const actualAxis = axisOf(
    actual.topic,
    actual.intent,
    actual.decisionTarget,
  );

  return [
    classification.primaryFailure,
    `gold=${goldAxis}`,
    `actual=${actualAxis}`,
    diffs.length > 0 ? `diffs=${diffs.join("; ")}` : "diffs=none",
  ].join(" | ");
}

function abortResult(input: {
  freezeIntegrity: "PASS" | "FAIL";
  freezeBefore: FrozenSetV1FreezeIntegrityFingerprint | null;
  abortReason: string;
  checks: Readonly<Record<string, boolean>>;
}): FrozenSetV1ReaderObservationResult {
  return {
    step: FROZEN_SET_V1_READER_OBSERVATION_STEP,
    freezeRevision: NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION,
    passed: false,
    reader: "NOT RUN",
    readerExecuted: false,
    abortReason: input.abortReason,
    acceptedCount: input.freezeBefore?.acceptedCount ?? 0,
    observedCount: 0,
    missingCount: 0,
    duplicateCount: 0,
    total: 0,
    exactMatch: 0,
    topicMatch: 0,
    intentMatch: 0,
    decisionTargetMatch: 0,
    timingMatch: 0,
    analysisModeMatch: 0,
    match: 0,
    mismatch: 0,
    failureClassification: emptyFailureCounts(),
    freezeIntegrity: input.freezeIntegrity,
    freezeBefore: input.freezeBefore,
    freezeAfter: null,
    goldSeparation: "PASS",
    production: "UNCHANGED",
    rows: [],
    mismatchRows: [],
    checks: input.checks,
  };
}

/**
 * Observe Production Reader on Frozen Set v1 accepted rows (160).
 * Aborts without Reader execution if Freeze Integrity fails.
 */
export function observeNovelHoldoutFrozenSetV1Reader():
  FrozenSetV1ReaderObservationResult {
  const freezeBeforeSnapshot = buildFrozenSetV1FreezeSnapshot();
  const before = evaluateFreezeIntegrityBeforeReader(freezeBeforeSnapshot);

  if (before.freezeIntegrity !== "PASS") {
    return abortResult({
      freezeIntegrity: "FAIL",
      freezeBefore: before.fingerprint,
      abortReason:
        `Freeze Integrity mismatch — Reader Observation aborted before readQuestion (${before.reasons.join("; ")})`,
      checks: {
        "freeze-integrity-before-reader": false,
        "accepted-row-ids-length-160": false,
        "accepted-row-ids-unique": false,
        "accepted-row-ids-sorted": false,
        "reader-executed-all-160": false,
        "observed-ids-match-accepted": false,
        "no-missing-ids": false,
        "no-duplicate-observed-ids": false,
        "deterministic-order": false,
        "gold-reader-independence": true,
        "freeze-integrity-after-reader": false,
        "freeze-revision-unchanged": false,
        "content-hash-unchanged": false,
        "freeze-readerExecuted-remains-false":
          freezeBeforeSnapshot.readerExecuted === false,
      },
    });
  }

  const acceptedRowIds = freezeBeforeSnapshot.frozenSetManifest.acceptedRowIds;
  const acceptedById = new Map(
    freezeBeforeSnapshot.acceptedRows.map((row) => [row.id, row] as const),
  );
  const goldBySlot = new Map(
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD.map((row) => [row.slotId, row] as const),
  );

  // Phase 1: QUESTION → READER → ACTUAL (Gold unused for steering).
  const actualById = new Map<string, FrozenSetV1ReaderActualRecord>();
  const observedOrder: string[] = [];
  let missingAcceptedLookup = 0;

  for (const id of acceptedRowIds) {
    const freezeRow = acceptedById.get(id);
    if (!freezeRow) {
      missingAcceptedLookup += 1;
      continue;
    }
    const observed = observeReaderActual(freezeRow.question);
    actualById.set(id, {
      ...observed,
      id,
    });
    observedOrder.push(id);
  }

  // Phase 2: ACTUAL + GOLD → COMPARISON.
  const rows: FrozenSetV1ReaderObservationRow[] = [];
  const failureClassification: FrozenSetV1FailureClassificationCounts =
    emptyFailureCounts();

  let exactMatch = 0;
  let topicMatch = 0;
  let intentMatch = 0;
  let decisionTargetMatch = 0;
  let timingMatch = 0;
  let analysisModeMatch = 0;
  let matchCount = 0;
  let mismatchCount = 0;
  let goldSeparationOk = true;

  for (const id of acceptedRowIds) {
    const freezeRow = acceptedById.get(id);
    const goldRow: NovelHoldoutFrozenSetV1GoldRow | undefined =
      goldBySlot.get(id);
    const actualRecord = actualById.get(id);

    if (!freezeRow || !goldRow || !actualRecord) {
      goldSeparationOk = false;
      continue;
    }

    // Gold question text must remain identical to freeze-accepted question.
    if (goldRow.question !== freezeRow.question) {
      goldSeparationOk = false;
    }
    if (goldRow.question !== actualRecord.question) {
      goldSeparationOk = false;
    }

    const gold = goldRow.gold;
    const actual = actualRecord.protocolActual;

    if (actual.provenance !== "reader_runtime_observation") {
      goldSeparationOk = false;
    }

    const preliminary = compareBlindGoldToReaderActual(gold, actual, null);
    const classification = classifyNovelHoldoutGoldVsActualFailure({
      gold,
      actual,
      taxonomyPrimary: goldRow.taxonomyPrimary,
      match: preliminary.match === true,
      primaryAxisMatch: preliminary.primaryAxisMatch === true,
      timingMatch: preliminary.timingMatch,
      analysisModeMatch: preliminary.analysisModeMatch,
    });
    const compare = compareBlindGoldToReaderActual(
      gold,
      actual,
      classification,
    );

    const topicOk = gold.expectedTopic === actual.topic;
    const intentOk = gold.expectedIntent === actual.intent;
    const decisionTargetOk =
      gold.expectedDecisionTarget === actual.decisionTarget;
    const timingOk =
      (gold.expectedTimingType ?? null) === (actual.timingType ?? null);
    const analysisModeOk =
      (gold.expectedAnalysisMode ?? null) === (actual.analysisMode ?? null);
    const exactOk = compare.primaryAxisMatch === true;
    const isMatch = classification === null;
    const reason = buildMismatchReason(gold, actual, classification);

    if (topicOk) topicMatch += 1;
    if (intentOk) intentMatch += 1;
    if (decisionTargetOk) decisionTargetMatch += 1;
    if (timingOk) timingMatch += 1;
    if (analysisModeOk) analysisModeMatch += 1;
    if (exactOk) exactMatch += 1;

    if (isMatch) {
      matchCount += 1;
    } else {
      mismatchCount += 1;
      if (classification) {
        failureClassification[classification.primaryFailure] += 1;
      }
    }

    rows.push({
      id,
      family: goldRow.family,
      taxonomyPrimary: goldRow.taxonomyPrimary,
      question: freezeRow.question,
      matchPolicy: gold.matchPolicy,
      gold,
      actual: actualRecord,
      compare,
      failureClassification: classification,
      topicMatch: topicOk,
      intentMatch: intentOk,
      decisionTargetMatch: decisionTargetOk,
      timingMatch: timingOk,
      analysisModeMatch: analysisModeOk,
      exactMatch: exactOk,
      match: isMatch,
      reason,
    });
  }

  const freezeAfterSnapshot = buildFrozenSetV1FreezeSnapshot();
  const afterFingerprint = captureFreezeIntegrity(freezeAfterSnapshot);
  const freezeUnchanged = freezeIntegrityEqual(
    before.fingerprint,
    afterFingerprint,
  );
  const freezeReaderFlagUnchanged =
    freezeAfterSnapshot.readerExecuted === false
    && freezeAfterSnapshot.readerActualAttached === false;

  const observedIds = rows.map((row) => row.id);
  const observedUnique = new Set(observedIds);
  const acceptedSet = new Set(acceptedRowIds);
  const missingIds = acceptedRowIds.filter((id) => !observedUnique.has(id));
  const extraIds = observedIds.filter((id) => !acceptedSet.has(id));
  const duplicateCount = observedIds.length - observedUnique.size;
  const missingCount = missingIds.length + missingAcceptedLookup;

  const acceptedRowIdsSorted = sameStringList(
    acceptedRowIds,
    [...acceptedRowIds].sort((left, right) =>
      left < right ? -1 : left > right ? 1 : 0
    ),
  );
  const deterministicOrder = sameStringList(observedOrder, acceptedRowIds);
  const observedIdsMatchAccepted =
    observedUnique.size === acceptedSet.size
    && [...acceptedSet].every((id) => observedUnique.has(id))
    && extraIds.length === 0;

  const readerExecutedAll160 =
    rows.length === FROZEN_SET_V1_READER_OBSERVATION_EXPECTED_COUNT
    && actualById.size === FROZEN_SET_V1_READER_OBSERVATION_EXPECTED_COUNT
    && acceptedRowIds.length === FROZEN_SET_V1_READER_OBSERVATION_EXPECTED_COUNT
    && missingAcceptedLookup === 0;

  const checks = {
    "freeze-integrity-before-reader": before.freezeIntegrity === "PASS",
    "accepted-row-ids-length-160":
      acceptedRowIds.length === FROZEN_SET_V1_READER_OBSERVATION_EXPECTED_COUNT,
    "accepted-row-ids-unique":
      new Set(acceptedRowIds).size === acceptedRowIds.length,
    "accepted-row-ids-sorted": acceptedRowIdsSorted,
    "reader-executed-all-160": readerExecutedAll160,
    "observed-ids-match-accepted": observedIdsMatchAccepted,
    "no-missing-ids": missingIds.length === 0 && missingAcceptedLookup === 0,
    "no-duplicate-observed-ids": duplicateCount === 0,
    "deterministic-order": deterministicOrder,
    "gold-reader-independence": goldSeparationOk,
    "freeze-integrity-after-reader": freezeUnchanged,
    "freeze-revision-unchanged":
      before.fingerprint.freezeRevision === afterFingerprint.freezeRevision,
    "content-hash-unchanged":
      before.fingerprint.contentHash === afterFingerprint.contentHash,
    "freeze-readerExecuted-remains-false": freezeReaderFlagUnchanged,
  };

  const passed = Object.values(checks).every(Boolean);

  return {
    step: FROZEN_SET_V1_READER_OBSERVATION_STEP,
    freezeRevision: NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION,
    passed,
    reader: "EXECUTED",
    readerExecuted: true,
    abortReason: null,
    acceptedCount: before.fingerprint.acceptedCount,
    observedCount: rows.length,
    missingCount,
    duplicateCount,
    total: rows.length,
    exactMatch,
    topicMatch,
    intentMatch,
    decisionTargetMatch,
    timingMatch,
    analysisModeMatch,
    match: matchCount,
    mismatch: mismatchCount,
    failureClassification,
    freezeIntegrity:
      before.freezeIntegrity === "PASS" && freezeUnchanged
        ? "PASS"
        : "FAIL",
    freezeBefore: before.fingerprint,
    freezeAfter: afterFingerprint,
    goldSeparation: goldSeparationOk ? "PASS" : "FAIL",
    production: "UNCHANGED",
    rows,
    mismatchRows: rows.filter((row) => !row.match),
    checks,
  };
}

export function serializeNovelHoldoutFrozenSetV1ReaderObservationResult(
  result: FrozenSetV1ReaderObservationResult,
): string {
  return JSON.stringify(
    {
      step: result.step,
      freezeRevision: result.freezeRevision,
      passed: result.passed,
      reader: result.reader,
      readerExecuted: result.readerExecuted,
      abortReason: result.abortReason,
      acceptedCount: result.acceptedCount,
      observedCount: result.observedCount,
      missingCount: result.missingCount,
      duplicateCount: result.duplicateCount,
      total: result.total,
      exactMatch: result.exactMatch,
      topicMatch: result.topicMatch,
      intentMatch: result.intentMatch,
      decisionTargetMatch: result.decisionTargetMatch,
      timingMatch: result.timingMatch,
      analysisModeMatch: result.analysisModeMatch,
      match: result.match,
      mismatch: result.mismatch,
      failureClassification: result.failureClassification,
      freezeIntegrity: result.freezeIntegrity,
      freezeBefore: result.freezeBefore,
      freezeAfter: result.freezeAfter,
      goldSeparation: result.goldSeparation,
      production: result.production,
      checks: result.checks,
      mismatchRows: result.mismatchRows.map((row) => ({
        id: row.id,
        family: row.family,
        taxonomyPrimary: row.taxonomyPrimary,
        question: row.question,
        matchPolicy: row.matchPolicy,
        gold: {
          topic: row.gold.expectedTopic,
          intent: row.gold.expectedIntent,
          decisionTarget: row.gold.expectedDecisionTarget,
          timingType: row.gold.expectedTimingType ?? null,
          analysisMode: row.gold.expectedAnalysisMode ?? null,
        },
        actual: {
          topic: row.actual.actualTopic,
          intent: row.actual.actualIntent,
          decisionTarget: row.actual.actualDecisionTarget,
          timingType: row.actual.actualTimingType ?? null,
          analysisMode: row.actual.actualAnalysisMode ?? null,
          diagnostics: {
            objectLabel: row.actual.diagnostics.objectLabel ?? null,
            primaryAxis: row.actual.diagnostics.primaryAxis,
            actionRelationCount:
              row.actual.diagnostics.actionRelations.length,
          },
        },
        exactMatch: row.exactMatch,
        match: row.match,
        failureClassification:
          row.failureClassification?.primaryFailure ?? null,
        reason: row.reason,
      })),
      rows: result.rows.map((row) => ({
        id: row.id,
        family: row.family,
        taxonomyPrimary: row.taxonomyPrimary,
        question: row.question,
        matchPolicy: row.matchPolicy,
        gold: {
          topic: row.gold.expectedTopic,
          intent: row.gold.expectedIntent,
          decisionTarget: row.gold.expectedDecisionTarget,
          timingType: row.gold.expectedTimingType ?? null,
          analysisMode: row.gold.expectedAnalysisMode ?? null,
          matchPolicy: row.gold.matchPolicy,
          ambiguityLabel: row.gold.ambiguityLabel ?? null,
          compositeNote: row.gold.compositeNote ?? null,
        },
        actual: {
          topic: row.actual.actualTopic,
          intent: row.actual.actualIntent,
          decisionTarget: row.actual.actualDecisionTarget,
          timingType: row.actual.actualTimingType ?? null,
          analysisMode: row.actual.actualAnalysisMode ?? null,
          objectLabel: row.actual.diagnostics.objectLabel ?? null,
          primaryAxis: row.actual.diagnostics.primaryAxis,
          actionRelations: row.actual.diagnostics.actionRelations,
        },
        topicMatch: row.topicMatch,
        intentMatch: row.intentMatch,
        decisionTargetMatch: row.decisionTargetMatch,
        timingMatch: row.timingMatch,
        analysisModeMatch: row.analysisModeMatch,
        exactMatch: row.exactMatch,
        match: row.match,
        failureClassification:
          row.failureClassification?.primaryFailure ?? null,
        reason: row.reason,
      })),
    },
    null,
    2,
  );
}
