/**
 * Novel Holdout — Gold Authoring Contract × FSV1 Gold 160
 * (READ / VERIFICATION-ONLY).
 *
 * Question: does the sealed FSV1 Gold 160 structurally satisfy
 * novel-holdout-gold-authoring-contract-r1?
 *
 * Does NOT:
 * - mutate / re-label FSV1 Gold
 * - run QuestionReader / ReaderObservation
 * - invent typed secondarySpeechAct
 * - treat decisionAxisHint / goldRationale / boundaryAgainst as intent oracles
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  doesDecisionAxisHintForceExpectedIntent,
  goldAuthoringRecordHasSecondarySpeechActField,
  isSelectionPrimaryPositiveFixtureReservedEmpty,
  matchNovelHoldoutGoldPrimaryIntentExact,
  NOVEL_HOLDOUT_DECISION_AXIS_HINT_POLICY,
  NOVEL_HOLDOUT_GOLD_AUTHORING_CONTRACT_REVISION,
  NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY,
  NOVEL_HOLDOUT_SECONDARY_SPEECH_ACT_TYPED_FIELD_POLICY,
  NOVEL_HOLDOUT_SELECTION_PRIMARY_CARVE_OUT_STATUS,
  resolveNovelHoldoutGoldExpectedIntent,
  type NovelHoldoutGoldAuthoringPrimaryIntent,
} from "./novelHoldoutGoldAuthoringContract.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
  selfCheckNovelHoldoutFrozenSetV1Gold,
  type NovelHoldoutFrozenSetV1GoldRow,
} from "./novelHoldoutFrozenSetV1Gold.js";

export const NOVEL_HOLDOUT_GOLD_AUTHORING_CONTRACT_FSV1_STEP =
  "GOLD-AUTHORING-CONTRACT-FSV1" as const;

export type NovelHoldoutGoldAuthoringContractFsv1Check = {
  id: string;
  passed: boolean;
  actual: unknown;
  expected: unknown;
  note: string;
};

export type NovelHoldoutGoldAuthoringContractFsv1Verdict =
  | "CONTRACT_FSV1_ALREADY_SATISFIED"
  | "CONTRACT_FSV1_VERIFICATION_PASS"
  | "CONTRACT_FSV1_VIOLATION_FOUND";

export type NovelHoldoutGoldAuthoringContractFsv1VerificationResult = {
  step: typeof NOVEL_HOLDOUT_GOLD_AUTHORING_CONTRACT_FSV1_STEP;
  contractRevision: typeof NOVEL_HOLDOUT_GOLD_AUTHORING_CONTRACT_REVISION;
  passed: boolean;
  verdict: NovelHoldoutGoldAuthoringContractFsv1Verdict;
  violations: readonly string[];
  checks: readonly NovelHoldoutGoldAuthoringContractFsv1Check[];
  goldCount: number;
  selectionPrimaryCount: number;
  reasonPrimaryCount: number;
  decisionAxisHintMismatchCount: number;
  secondarySpeechActFieldCount: number;
  readerExecuted: false;
  sourceMutated: boolean;
};

const ALLOWED_PRIMARY_INTENTS = new Set<string>([
  "possibility",
  "evaluation",
  "selection",
  "comparison",
  "timing",
  "reason",
  "method",
  "risk",
  "prediction",
  "existence",
  "permission",
  "continuation",
  "termination",
  "generalJudgement",
]);

const SECONDARY_TYPED_FIELD_KEYS = [
  "secondarySpeechAct",
  "secondaryIntent",
  "secondaryIntents",
  "expectedSecondaryIntent",
  "typedSecondarySpeechAct",
] as const;

function checkOf(
  id: string,
  passed: boolean,
  actual: unknown,
  expected: unknown,
  note: string,
): NovelHoldoutGoldAuthoringContractFsv1Check {
  return { id, passed, actual, expected, note };
}

function goldSourcePath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "novelHoldoutFrozenSetV1Gold.ts");
}

function blindProtocolSourcePath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "novelHoldoutBlindGoldProtocol.ts");
}

function parseDecisionAxisHintIntent(hint: string): string | null {
  const parts = hint.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  return parts[1] ?? null;
}

function fingerprintGoldRows(
  rows: readonly NovelHoldoutFrozenSetV1GoldRow[],
): string {
  return JSON.stringify(
    rows.map((row) => ({
      slotId: row.slotId,
      expectedIntent: row.gold.expectedIntent,
      expectedDecisionTarget: row.gold.expectedDecisionTarget,
      matchPolicy: row.gold.matchPolicy,
      goldConfidence: row.gold.goldConfidence,
      goldRationale: row.gold.goldRationale,
      compositeNote: row.gold.compositeNote ?? null,
      boundaryAgainst: row.gold.boundaryAgainst ?? null,
      decisionAxisHint: row.slot.decisionAxisHint,
    })),
  );
}

function collectSecondaryTypedFieldHits(
  rows: readonly NovelHoldoutFrozenSetV1GoldRow[],
): readonly string[] {
  const hits: string[] = [];
  for (const row of rows) {
    const goldBlob = row.gold as unknown as Record<string, unknown>;
    const rowBlob = row as unknown as Record<string, unknown>;
    if (goldAuthoringRecordHasSecondarySpeechActField(goldBlob)) {
      hits.push(`${row.slotId}:gold.secondarySpeechAct`);
    }
    if (goldAuthoringRecordHasSecondarySpeechActField(rowBlob)) {
      hits.push(`${row.slotId}:row.secondarySpeechAct`);
    }
    for (const key of SECONDARY_TYPED_FIELD_KEYS) {
      if (Object.prototype.hasOwnProperty.call(goldBlob, key)) {
        hits.push(`${row.slotId}:gold.${key}`);
      }
      if (Object.prototype.hasOwnProperty.call(rowBlob, key)) {
        hits.push(`${row.slotId}:row.${key}`);
      }
    }
  }
  return hits;
}

/**
 * Structural verification: FSV1 Gold 160 vs Gold Authoring Contract r1.
 * Read-only over NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD.
 */
export function verifyNovelHoldoutGoldAuthoringContractFsv1(
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
): NovelHoldoutGoldAuthoringContractFsv1VerificationResult {
  const violations: string[] = [];
  const checks: NovelHoldoutGoldAuthoringContractFsv1Check[] = [];

  const beforeFingerprint = fingerprintGoldRows(goldRows);

  const goldCount = goldRows.length;
  const selectionPrimaryCount = goldRows.filter(
    (row) => row.gold.expectedIntent === "selection",
  ).length;
  const reasonPrimaryCount = goldRows.filter(
    (row) => row.gold.expectedIntent === "reason",
  ).length;

  let decisionAxisHintMismatchCount = 0;
  for (const row of goldRows) {
    const hintIntent = parseDecisionAxisHintIntent(row.slot.decisionAxisHint);
    if (hintIntent != null && hintIntent !== row.gold.expectedIntent) {
      decisionAxisHintMismatchCount += 1;
    }
  }

  const secondaryHits = collectSecondaryTypedFieldHits(goldRows);
  const secondarySpeechActFieldCount = secondaryHits.length;

  // 1. gold-count-160
  {
    const passed = goldCount === 160;
    if (!passed) {
      violations.push(`gold-count-160: actual=${goldCount}`);
    }
    checks.push(checkOf(
      "gold-count-160",
      passed,
      goldCount,
      160,
      "FSV1 sealed Gold row count must be exactly 160",
    ));
  }

  // 2. expected-intent-single-primary-sot
  {
    const nonSingle: string[] = [];
    for (const row of goldRows) {
      const intent = row.gold.expectedIntent as unknown;
      if (typeof intent !== "string" || intent.trim().length === 0) {
        nonSingle.push(`${row.slotId}:type=${typeof intent}`);
        continue;
      }
      if (Array.isArray(intent)) {
        nonSingle.push(`${row.slotId}:array`);
      }
    }
    const policyOk =
      NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.sot
        === "single_primary_speech_act";
    const passed = nonSingle.length === 0 && policyOk;
    if (!passed) {
      violations.push(
        `expected-intent-single-primary-sot: nonSingle=${nonSingle.length}`,
      );
    }
    checks.push(checkOf(
      "expected-intent-single-primary-sot",
      passed,
      { nonSingleCount: nonSingle.length, sample: nonSingle.slice(0, 5) },
      { nonSingleCount: 0, sot: "single_primary_speech_act" },
      "Every Gold row has exactly one string primary expectedIntent",
    ));
  }

  // 3. expected-intent-allowed-value
  {
    const invalid: string[] = [];
    for (const row of goldRows) {
      if (!ALLOWED_PRIMARY_INTENTS.has(row.gold.expectedIntent)) {
        invalid.push(`${row.slotId}:${row.gold.expectedIntent}`);
      }
    }
    const passed = invalid.length === 0;
    if (!passed) {
      violations.push(
        `expected-intent-allowed-value: invalid=${invalid.length}`,
      );
    }
    checks.push(checkOf(
      "expected-intent-allowed-value",
      passed,
      { invalidCount: invalid.length, sample: invalid.slice(0, 5) },
      { invalidCount: 0 },
      "expectedIntent ∈ Gold Authoring primary intent set / QuestionIntentOrLegacy",
    ));
  }

  // 4. no-secondary-speech-act-field
  {
    const goldTs = readFileSync(goldSourcePath(), "utf8");
    const protocolTs = readFileSync(blindProtocolSourcePath(), "utf8");
    const typedInGoldSource =
      /secondarySpeechAct\s*[?:]/.test(goldTs)
      || /secondarySpeechAct\s*:/.test(goldTs);
    const typedInProtocol =
      /secondarySpeechAct\s*[?:]/.test(protocolTs)
      || /secondarySpeechAct\s*:/.test(protocolTs);
    const policyOk =
      NOVEL_HOLDOUT_SECONDARY_SPEECH_ACT_TYPED_FIELD_POLICY === "PROHIBITED";
    const passed =
      secondarySpeechActFieldCount === 0
      && typedInGoldSource === false
      && typedInProtocol === false
      && policyOk;
    if (!passed) {
      violations.push(
        `no-secondary-speech-act-field: hits=${secondarySpeechActFieldCount}`,
      );
    }
    checks.push(checkOf(
      "no-secondary-speech-act-field",
      passed,
      {
        secondarySpeechActFieldCount,
        typedInGoldSource,
        typedInProtocol,
        sample: secondaryHits.slice(0, 5),
      },
      {
        secondarySpeechActFieldCount: 0,
        typedInGoldSource: false,
        typedInProtocol: false,
        policy: "PROHIBITED",
      },
      "Typed secondarySpeechAct (or equivalent typed field) must be absent",
    ));
  }

  // 5. decision-axis-hint-soft
  {
    const forces = doesDecisionAxisHintForceExpectedIntent();
    const policySoft =
      NOVEL_HOLDOUT_DECISION_AXIS_HINT_POLICY === "SOFT_GUIDANCE";
    // Sample: hint may differ from expectedIntent without being a violation.
    let sampleResolvedOk = true;
    for (const row of goldRows) {
      const authored = row.gold
        .expectedIntent as NovelHoldoutGoldAuthoringPrimaryIntent;
      if (!ALLOWED_PRIMARY_INTENTS.has(authored)) continue;
      const resolved = resolveNovelHoldoutGoldExpectedIntent({
        authoredPrimaryIntent: authored,
        decisionAxisHint: row.slot.decisionAxisHint,
      });
      if (resolved !== authored) {
        sampleResolvedOk = false;
        break;
      }
    }
    const passed =
      forces === false
      && policySoft
      && sampleResolvedOk
      && NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY
        .decisionAxisHintForcesExpectedIntent === false;
    // mismatch count is observational — never a fail by itself.
    if (!passed) {
      violations.push("decision-axis-hint-soft: hint forces expectedIntent");
    }
    checks.push(checkOf(
      "decision-axis-hint-soft",
      passed,
      {
        forces,
        policy: NOVEL_HOLDOUT_DECISION_AXIS_HINT_POLICY,
        decisionAxisHintMismatchCount,
        sampleResolvedOk,
      },
      {
        forces: false,
        policy: "SOFT_GUIDANCE",
        mismatchAllowed: true,
      },
      "decisionAxisHint is SOFT_GUIDANCE; mismatch with expectedIntent is allowed",
    ));
  }

  // 6. exact-match-primary-only
  {
    const same = matchNovelHoldoutGoldPrimaryIntentExact(
      "possibility",
      "possibility",
    );
    const different = matchNovelHoldoutGoldPrimaryIntentExact(
      "possibility",
      "evaluation",
    );
    const policyOk =
      NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.exactMatchCompares
        === "primary_intent_only";
    const multiPrimaryShape: string[] = [];
    for (const row of goldRows) {
      const g = row.gold as unknown as Record<string, unknown>;
      if (Array.isArray(g.expectedIntent)) {
        multiPrimaryShape.push(row.slotId);
      }
      if (
        Object.prototype.hasOwnProperty.call(g, "expectedIntents")
        || Object.prototype.hasOwnProperty.call(g, "secondarySpeechAct")
      ) {
        multiPrimaryShape.push(`${row.slotId}:multi-field`);
      }
    }
    const passed =
      same === true
      && different === false
      && policyOk
      && multiPrimaryShape.length === 0;
    if (!passed) {
      violations.push("exact-match-primary-only: secondary compare axis present");
    }
    checks.push(checkOf(
      "exact-match-primary-only",
      passed,
      {
        same,
        different,
        policy: NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.exactMatchCompares,
        multiPrimaryShapeCount: multiPrimaryShape.length,
      },
      {
        same: true,
        different: false,
        policy: "primary_intent_only",
        multiPrimaryShapeCount: 0,
      },
      "Exact Match uses a single primary expectedIntent only",
    ));
  }

  // 7. selection-primary-reserved-empty
  {
    const reservedOk = isSelectionPrimaryPositiveFixtureReservedEmpty();
    const statusOk =
      NOVEL_HOLDOUT_SELECTION_PRIMARY_CARVE_OUT_STATUS
        === "RESERVED_FUTURE_EMPTY";
    const passed =
      selectionPrimaryCount === 0 && reservedOk && statusOk;
    // selection=0 is RESERVED_FUTURE_EMPTY confirmation — not a violation.
    if (!passed) {
      violations.push(
        `selection-primary-reserved-empty: count=${selectionPrimaryCount}`,
      );
    }
    checks.push(checkOf(
      "selection-primary-reserved-empty",
      passed,
      {
        selectionPrimaryCount,
        status: NOVEL_HOLDOUT_SELECTION_PRIMARY_CARVE_OUT_STATUS,
        reservedOk,
      },
      {
        selectionPrimaryCount: 0,
        status: "RESERVED_FUTURE_EMPTY",
        reservedOk: true,
      },
      "FSV1 selection-primary count=0 confirms RESERVED_FUTURE_EMPTY",
    ));
  }

  // 8. reason-primary-carve-out
  {
    const passed = reasonPrimaryCount === 0;
    // reason=0 means R1–R4 carve-out is not auto-applied on FSV1 Gold.
    if (!passed) {
      violations.push(
        `reason-primary-carve-out: unexpected reason count=${reasonPrimaryCount}`,
      );
    }
    checks.push(checkOf(
      "reason-primary-carve-out",
      passed,
      { reasonPrimaryCount, autoApplied: reasonPrimaryCount > 0 },
      { reasonPrimaryCount: 0, autoApplied: false },
      "FSV1 reason-primary count=0; R1–R4 carve-out not auto-applied",
    ));
  }

  // 9. dual-surface-not-secondary-typed
  {
    const compositeAsTypedSecondary: string[] = [];
    for (const row of goldRows) {
      const g = row.gold as unknown as Record<string, unknown>;
      // Free-text "primary/secondary" in compositeNote is allowed.
      // Violation only if compositeNote/boundaryAgainst are typed fields
      // standing in for secondarySpeechAct storage shape.
      if (typeof g.compositeNote === "object" && g.compositeNote !== null) {
        compositeAsTypedSecondary.push(`${row.slotId}:compositeNote-object`);
      }
      if (
        typeof g.boundaryAgainst === "object" && g.boundaryAgainst !== null
      ) {
        compositeAsTypedSecondary.push(`${row.slotId}:boundaryAgainst-object`);
      }
      if (
        typeof g.compositeNote === "string"
        && /secondarySpeechAct\s*[:=]/.test(g.compositeNote)
      ) {
        compositeAsTypedSecondary.push(
          `${row.slotId}:compositeNote-typed-marker`,
        );
      }
    }
    const passed =
      compositeAsTypedSecondary.length === 0
      && secondarySpeechActFieldCount === 0;
    if (!passed) {
      violations.push(
        `dual-surface-not-secondary-typed: hits=${compositeAsTypedSecondary.length}`,
      );
    }
    checks.push(checkOf(
      "dual-surface-not-secondary-typed",
      passed,
      {
        typedHits: compositeAsTypedSecondary.slice(0, 5),
        typedHitCount: compositeAsTypedSecondary.length,
      },
      { typedHitCount: 0 },
      "compositeNote/boundaryAgainst are free-text, not typed secondarySpeechAct stores",
    ));
  }

  // 10. reader-not-gold-oracle
  {
    const self = selfCheckNovelHoldoutFrozenSetV1Gold(goldRows);
    const policyOk =
      NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.readerKeywordIsOracle === false
      && NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.readerPriorityIsOracle
        === false;
    const readerPayloadHits: string[] = [];
    for (const row of goldRows) {
      const g = row.gold as unknown as Record<string, unknown>;
      for (const key of [
        "readerActual",
        "actual",
        "actualIntent",
        "readerIntent",
      ] as const) {
        if (Object.prototype.hasOwnProperty.call(g, key)) {
          readerPayloadHits.push(`${row.slotId}:${key}`);
        }
      }
    }
    const passed =
      policyOk
      && self.readerCallTraces.length === 0
      && readerPayloadHits.length === 0;
    if (!passed) {
      violations.push("reader-not-gold-oracle: reader path influences Gold");
    }
    checks.push(checkOf(
      "reader-not-gold-oracle",
      passed,
      {
        readerCallTraces: self.readerCallTraces.length,
        readerPayloadHits: readerPayloadHits.slice(0, 5),
        readerKeywordIsOracle:
          NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.readerKeywordIsOracle,
        readerPriorityIsOracle:
          NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.readerPriorityIsOracle,
        readerExecuted: false,
      },
      {
        readerCallTraces: 0,
        readerPayloadHits: [],
        readerKeywordIsOracle: false,
        readerPriorityIsOracle: false,
        readerExecuted: false,
      },
      "FSV1 Gold does not use Reader actual as expectedIntent oracle",
    ));
  }

  // 11. gold-rationale-not-intent-oracle
  {
    // Structural: resolver ignores rationale; no auto-reclassify from words.
    let rewriteCount = 0;
    for (const row of goldRows) {
      const authored = row.gold
        .expectedIntent as NovelHoldoutGoldAuthoringPrimaryIntent;
      if (!ALLOWED_PRIMARY_INTENTS.has(authored)) continue;
      const resolved = resolveNovelHoldoutGoldExpectedIntent({
        authoredPrimaryIntent: authored,
        // rationale is intentionally not a resolver input
        dualSurfaces: row.gold.compositeNote
          ? [row.gold.compositeNote]
          : undefined,
      });
      if (resolved !== authored) rewriteCount += 1;
    }
    const passed = rewriteCount === 0;
    if (!passed) {
      violations.push(
        `gold-rationale-not-intent-oracle: rewriteCount=${rewriteCount}`,
      );
    }
    checks.push(checkOf(
      "gold-rationale-not-intent-oracle",
      passed,
      { rewriteCount },
      { rewriteCount: 0 },
      "goldRationale is authoring explanation; does not auto-reclassify expectedIntent",
    ));
  }

  // 12. boundary-against-not-intent-oracle
  {
    let rewriteCount = 0;
    const boundaryPresent = goldRows.filter(
      (row) =>
        typeof row.gold.boundaryAgainst === "string"
        && row.gold.boundaryAgainst.trim().length > 0,
    ).length;
    for (const row of goldRows) {
      const authored = row.gold
        .expectedIntent as NovelHoldoutGoldAuthoringPrimaryIntent;
      if (!ALLOWED_PRIMARY_INTENTS.has(authored)) continue;
      // boundaryAgainst is not a resolver input — authored intent must stick.
      const resolved = resolveNovelHoldoutGoldExpectedIntent({
        authoredPrimaryIntent: authored,
        dualSurfaces: row.gold.boundaryAgainst
          ? [row.gold.boundaryAgainst]
          : undefined,
      });
      if (resolved !== authored) rewriteCount += 1;
    }
    const passed = rewriteCount === 0;
    if (!passed) {
      violations.push(
        `boundary-against-not-intent-oracle: rewriteCount=${rewriteCount}`,
      );
    }
    checks.push(checkOf(
      "boundary-against-not-intent-oracle",
      passed,
      { rewriteCount, boundaryPresent },
      { rewriteCount: 0 },
      "boundaryAgainst does not auto-change expectedIntent / Exact Match axis",
    ));
  }

  // 13. match-policy-primary-contract
  {
    let sotPreserved = true;
    for (const row of goldRows) {
      const authored = row.gold.expectedIntent;
      if (typeof authored !== "string" || authored.trim().length === 0) {
        sotPreserved = false;
        break;
      }
      // matchPolicy / compositeNote / boundaryAgainst may exist; SoT stays.
      void row.gold.matchPolicy;
      void row.gold.compositeNote;
      void row.gold.boundaryAgainst;
      if (!ALLOWED_PRIMARY_INTENTS.has(authored)) {
        sotPreserved = false;
        break;
      }
    }
    const passed = sotPreserved && goldCount === goldRows.length;
    if (!passed) {
      violations.push(
        "match-policy-primary-contract: primary expectedIntent SoT replaced",
      );
    }
    checks.push(checkOf(
      "match-policy-primary-contract",
      passed,
      { sotPreserved, goldCount },
      { sotPreserved: true },
      "matchPolicy/compositeNote/boundaryAgainst do not replace primary expectedIntent SoT",
    ));
  }

  // 14. source-data-immutable
  {
    const afterFingerprint = fingerprintGoldRows(goldRows);
    const sourceMutated = afterFingerprint !== beforeFingerprint;
    const passed = sourceMutated === false;
    if (!passed) {
      violations.push("source-data-immutable: FSV1 Gold fingerprint changed");
    }
    checks.push(checkOf(
      "source-data-immutable",
      passed,
      { sourceMutated },
      { sourceMutated: false },
      "Verification must not mutate FSV1 Gold source objects",
    ));
  }

  const afterFingerprint = fingerprintGoldRows(goldRows);
  const sourceMutated = afterFingerprint !== beforeFingerprint;
  if (sourceMutated) {
    // Ensure top-level flag stays consistent even if check 14 already recorded.
    if (!violations.some((v) => v.startsWith("source-data-immutable"))) {
      violations.push("source-data-immutable: top-level fingerprint drift");
    }
  }

  const passed =
    checks.every((c) => c.passed) && violations.length === 0 && !sourceMutated;

  const verdict: NovelHoldoutGoldAuthoringContractFsv1Verdict = passed
    ? "CONTRACT_FSV1_ALREADY_SATISFIED"
    : "CONTRACT_FSV1_VIOLATION_FOUND";

  return {
    step: NOVEL_HOLDOUT_GOLD_AUTHORING_CONTRACT_FSV1_STEP,
    contractRevision: NOVEL_HOLDOUT_GOLD_AUTHORING_CONTRACT_REVISION,
    passed,
    verdict,
    violations,
    checks,
    goldCount,
    selectionPrimaryCount,
    reasonPrimaryCount,
    decisionAxisHintMismatchCount,
    secondarySpeechActFieldCount,
    readerExecuted: false,
    sourceMutated,
  };
}

export function serializeNovelHoldoutGoldAuthoringContractFsv1VerificationResult(
  result: NovelHoldoutGoldAuthoringContractFsv1VerificationResult,
): string {
  return JSON.stringify(
    {
      step: result.step,
      contractRevision: result.contractRevision,
      passed: result.passed,
      verdict: result.verdict,
      violations: result.violations,
      checks: result.checks,
      goldCount: result.goldCount,
      selectionPrimaryCount: result.selectionPrimaryCount,
      reasonPrimaryCount: result.reasonPrimaryCount,
      decisionAxisHintMismatchCount: result.decisionAxisHintMismatchCount,
      secondarySpeechActFieldCount: result.secondarySpeechActFieldCount,
      readerExecuted: result.readerExecuted,
      sourceMutated: result.sourceMutated,
    },
    null,
    2,
  );
}
