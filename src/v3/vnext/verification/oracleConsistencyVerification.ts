/**
 * P10-A Oracle Consistency Diagnostic.
 *
 * Purpose: separate three voices — meaning fixture expected,
 * exhaustive100 fixture expected, and Reader actual — without
 * declaring any of them gold.
 *
 * Does NOT modify Reader / Decision Engine / Adapter / fixtures.
 * Does NOT use fixtureExpectationMatchesReader pre-filter.
 * Does NOT promote expectedOverride or Reader actual to gold.
 * Strong Anchor gate is untouched; anchorCovered is metadata only.
 */

import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  QUESTION_MEANING_CELLS,
  type QuestionMeaningCell,
  type QuestionMeaningExpectation,
  type QuestionMeaningVariation,
  type QuestionMeaningVariationKind,
} from "../../consulting/questionMeaningRegressionFixtures.js";
import {
  QUESTION_READER_EXHAUSTIVE_100_FIXTURES,
  type QuestionReaderExhaustive100Expectation,
  type QuestionReaderExhaustive100Fixture,
  type QuestionReaderExhaustive100VariationKind,
} from "../../consulting/questionReaderExhaustive100Fixtures.js";
import {
  readQuestion,
} from "../../consulting/question/questionReader.js";
import type {
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntentOrLegacy,
  QuestionTimingType,
  QuestionTopic,
} from "../../consulting/question/questionReader.js";
import {
  P10_3_STRONG_ANCHOR_CELL_IDS,
} from "./strongAnchorEquivalenceVerification.js";

export type OracleConsistencyStatus =
  | "EXPECTED_MATCH_READER"
  | "EXPECTED_READER_MISMATCH"
  | "CROSS_SUITE_ORACLE_CONFLICT"
  | "EXPECTED_OVERRIDE_PRESENT"
  | "NOT_COVERED";

export type OracleSemanticSnapshot = {
  topic: QuestionTopic;
  intent: QuestionIntentOrLegacy;
  decisionTarget: DecisionTarget;
  timingType?: QuestionTimingType;
  analysisMode?: QuestionAnalysisMode;
};

export type OraclePrimaryAxisKey =
  `${QuestionTopic}|${QuestionIntentOrLegacy}|${DecisionTarget}`;

export type OracleDiagnosticFlags = {
  crossSuiteConflict: boolean;
  meaningReaderMismatch: boolean;
  exhaustiveReaderMismatch: boolean;
  expectedOverridePresent: boolean;
  primaryConflict: boolean;
  fullSignatureConflict: boolean;
  timingConflict: boolean;
  analysisModeConflict: boolean;
  anchorCovered: boolean;
};

export type OracleConsistencyCase = {
  question: string;
  meaningCellId: string | null;
  meaningCaseId: string | null;
  exhaustiveId: string | null;
  variationKind:
    | "canonical"
    | QuestionMeaningVariationKind
    | QuestionReaderExhaustive100VariationKind
    | "mixed"
    | null;
  meaningExpected: OracleSemanticSnapshot | null;
  exhaustiveExpected: OracleSemanticSnapshot | null;
  readerActual: OracleSemanticSnapshot | null;
  meaningPrimaryAxis: OraclePrimaryAxisKey | null;
  exhaustivePrimaryAxis: OraclePrimaryAxisKey | null;
  readerPrimaryAxis: OraclePrimaryAxisKey | null;
  meaningFullSignature: string | null;
  exhaustiveFullSignature: string | null;
  readerFullSignature: string | null;
  statuses: readonly OracleConsistencyStatus[];
  flags: OracleDiagnosticFlags;
};

export type OracleConsistencyMetrics = {
  totalMeaningCases: number;
  totalExhaustiveCases: number;
  overlapCount: number;
  notCoveredCount: number;
  fullSignatureConflictCount: number;
  primaryConflictCount: number;
  timingConflictCount: number;
  analysisModeConflictCount: number;
  meaningExpectedReaderMismatchCount: number;
  exhaustiveExpectedReaderMismatchCount: number;
  expectedOverrideCount: number;
};

export type OracleConsistencyVerificationResult = {
  /**
   * Diagnostic execution completed successfully.
   * Oracle conflicts do NOT flip this to false.
   */
  passed: boolean;
  executionSuccess: boolean;
  metrics: OracleConsistencyMetrics;
  overlapCases: readonly OracleConsistencyCase[];
  notCoveredCases: readonly OracleConsistencyCase[];
  crossSuiteConflictCases: readonly OracleConsistencyCase[];
  readerMismatchCases: readonly OracleConsistencyCase[];
};

type MeaningDiagnosticRow = {
  caseId: string;
  cellId: string;
  question: string;
  joinKey: string;
  variationKind: "canonical" | QuestionMeaningVariationKind;
  expected: QuestionMeaningExpectation;
  expectedOverridePresent: boolean;
};

type ExhaustiveDiagnosticRow = {
  id: string;
  question: string;
  joinKey: string;
  variationKind: QuestionReaderExhaustive100VariationKind;
  expected: QuestionReaderExhaustive100Expectation;
};

function joinKeyOf(question: string): string {
  return question.trim();
}

function toPrimaryAxisKey(
  snapshot: OracleSemanticSnapshot,
): OraclePrimaryAxisKey {
  return `${snapshot.topic}|${snapshot.intent}|${snapshot.decisionTarget}`;
}

function toFullSignatureKey(
  snapshot: OracleSemanticSnapshot,
): string {
  return [
    snapshot.topic,
    snapshot.intent,
    snapshot.decisionTarget,
    snapshot.timingType ?? "∅",
    snapshot.analysisMode ?? "∅",
  ].join("|");
}

function toSnapshotFromExpectation(
  expected:
    | QuestionMeaningExpectation
    | QuestionReaderExhaustive100Expectation
    | OracleSemanticSnapshot,
): OracleSemanticSnapshot {
  return {
    topic: expected.topic,
    intent: expected.intent,
    decisionTarget: expected.decisionTarget,
    ...(expected.timingType !== undefined
      ? { timingType: expected.timingType }
      : {}),
    ...(expected.analysisMode !== undefined
      ? { analysisMode: expected.analysisMode }
      : {}),
  };
}

function mergeMeaningExpected(
  base: QuestionMeaningExpectation,
  override: Partial<QuestionMeaningExpectation> | undefined,
): QuestionMeaningExpectation {
  if (!override) {
    return base;
  }

  return {
    topic: override.topic ?? base.topic,
    intent: override.intent ?? base.intent,
    decisionTarget: override.decisionTarget ?? base.decisionTarget,
    timingType: override.timingType ?? base.timingType,
    analysisMode: override.analysisMode ?? base.analysisMode,
  };
}

function expandMeaningRows(
  cells: readonly QuestionMeaningCell[],
): MeaningDiagnosticRow[] {
  const rows: MeaningDiagnosticRow[] = [];

  for (const cell of cells) {
    rows.push({
      caseId: `${cell.id}__canonical`,
      cellId: cell.id,
      question: cell.canonicalQuestion,
      joinKey: joinKeyOf(cell.canonicalQuestion),
      variationKind: "canonical",
      expected: cell.expected,
      expectedOverridePresent: false,
    });

    const variations: readonly QuestionMeaningVariation[] = [
      ...cell.paraphrases,
      ...cell.targetVariants,
      ...cell.timingVariants,
      ...cell.compositeVariants,
    ];

    for (const variation of variations) {
      rows.push({
        caseId: `${cell.id}__${variation.idSuffix}`,
        cellId: cell.id,
        question: variation.question,
        joinKey: joinKeyOf(variation.question),
        variationKind: variation.variationKind,
        expected: mergeMeaningExpected(
          cell.expected,
          variation.expectedOverride,
        ),
        expectedOverridePresent: variation.expectedOverride !== undefined,
      });
    }
  }

  return rows;
}

function expandExhaustiveRows(
  fixtures: readonly QuestionReaderExhaustive100Fixture[],
): ExhaustiveDiagnosticRow[] {
  return fixtures.map((fixture) => ({
    id: fixture.id,
    question: fixture.question,
    joinKey: joinKeyOf(fixture.question),
    variationKind: fixture.variationKind,
    expected: fixture.expected,
  }));
}

function expectationMatchesReader(
  expected: OracleSemanticSnapshot,
  actual: OracleSemanticSnapshot,
): boolean {
  if (actual.topic !== expected.topic) {
    return false;
  }
  if (actual.intent !== expected.intent) {
    return false;
  }
  if (actual.decisionTarget !== expected.decisionTarget) {
    return false;
  }
  if (
    expected.timingType !== undefined
    && actual.timingType !== expected.timingType
  ) {
    return false;
  }
  if (
    expected.analysisMode !== undefined
    && actual.analysisMode !== expected.analysisMode
  ) {
    return false;
  }
  return true;
}

function isStrongAnchorCell(cellId: string): boolean {
  return (P10_3_STRONG_ANCHOR_CELL_IDS as readonly string[])
    .includes(cellId);
}

function buildStatuses(
  flags: OracleDiagnosticFlags,
  covered: boolean,
): OracleConsistencyStatus[] {
  const statuses: OracleConsistencyStatus[] = [];

  if (!covered) {
    statuses.push("NOT_COVERED");
    return statuses;
  }

  if (flags.crossSuiteConflict) {
    statuses.push("CROSS_SUITE_ORACLE_CONFLICT");
  }

  if (
    flags.meaningReaderMismatch
    || flags.exhaustiveReaderMismatch
  ) {
    statuses.push("EXPECTED_READER_MISMATCH");
  }

  if (flags.expectedOverridePresent) {
    statuses.push("EXPECTED_OVERRIDE_PRESENT");
  }

  if (
    !flags.crossSuiteConflict
    && !flags.meaningReaderMismatch
    && !flags.exhaustiveReaderMismatch
  ) {
    statuses.push("EXPECTED_MATCH_READER");
  }

  return statuses;
}

function resolveVariationKind(
  meaningKind: MeaningDiagnosticRow["variationKind"] | null,
  exhaustiveKind: ExhaustiveDiagnosticRow["variationKind"] | null,
): OracleConsistencyCase["variationKind"] {
  if (meaningKind !== null && exhaustiveKind !== null) {
    if (meaningKind === exhaustiveKind) {
      return meaningKind;
    }
    return "mixed";
  }
  return meaningKind ?? exhaustiveKind;
}

function buildOverlapCase(params: {
  meaning: MeaningDiagnosticRow;
  exhaustive: ExhaustiveDiagnosticRow;
  readerActual: OracleSemanticSnapshot;
}): OracleConsistencyCase {
  const meaningExpected = toSnapshotFromExpectation(params.meaning.expected);
  const exhaustiveExpected = toSnapshotFromExpectation(
    params.exhaustive.expected,
  );
  const readerActual = params.readerActual;

  const meaningPrimaryAxis = toPrimaryAxisKey(meaningExpected);
  const exhaustivePrimaryAxis = toPrimaryAxisKey(exhaustiveExpected);
  const readerPrimaryAxis = toPrimaryAxisKey(readerActual);

  const meaningFullSignature = toFullSignatureKey(meaningExpected);
  const exhaustiveFullSignature = toFullSignatureKey(exhaustiveExpected);
  const readerFullSignature = toFullSignatureKey(readerActual);

  const primaryConflict = meaningPrimaryAxis !== exhaustivePrimaryAxis;
  const fullSignatureConflict =
    meaningFullSignature !== exhaustiveFullSignature;
  const timingConflict =
    (meaningExpected.timingType ?? null)
    !== (exhaustiveExpected.timingType ?? null);
  const analysisModeConflict =
    (meaningExpected.analysisMode ?? null)
    !== (exhaustiveExpected.analysisMode ?? null);

  const meaningReaderMismatch = !expectationMatchesReader(
    meaningExpected,
    readerActual,
  );
  const exhaustiveReaderMismatch = !expectationMatchesReader(
    exhaustiveExpected,
    readerActual,
  );

  const flags: OracleDiagnosticFlags = {
    crossSuiteConflict: primaryConflict || fullSignatureConflict,
    meaningReaderMismatch,
    exhaustiveReaderMismatch,
    expectedOverridePresent: params.meaning.expectedOverridePresent,
    primaryConflict,
    fullSignatureConflict,
    timingConflict,
    analysisModeConflict,
    anchorCovered: isStrongAnchorCell(params.meaning.cellId),
  };

  return {
    question: params.meaning.question,
    meaningCellId: params.meaning.cellId,
    meaningCaseId: params.meaning.caseId,
    exhaustiveId: params.exhaustive.id,
    variationKind: resolveVariationKind(
      params.meaning.variationKind,
      params.exhaustive.variationKind,
    ),
    meaningExpected,
    exhaustiveExpected,
    readerActual,
    meaningPrimaryAxis,
    exhaustivePrimaryAxis,
    readerPrimaryAxis,
    meaningFullSignature,
    exhaustiveFullSignature,
    readerFullSignature,
    statuses: buildStatuses(flags, true),
    flags,
  };
}

function buildNotCoveredMeaningCase(
  meaning: MeaningDiagnosticRow,
  readerActual: OracleSemanticSnapshot,
): OracleConsistencyCase {
  const meaningExpected = toSnapshotFromExpectation(meaning.expected);
  const meaningReaderMismatch = !expectationMatchesReader(
    meaningExpected,
    readerActual,
  );

  const flags: OracleDiagnosticFlags = {
    crossSuiteConflict: false,
    meaningReaderMismatch,
    exhaustiveReaderMismatch: false,
    expectedOverridePresent: meaning.expectedOverridePresent,
    primaryConflict: false,
    fullSignatureConflict: false,
    timingConflict: false,
    analysisModeConflict: false,
    anchorCovered: isStrongAnchorCell(meaning.cellId),
  };

  return {
    question: meaning.question,
    meaningCellId: meaning.cellId,
    meaningCaseId: meaning.caseId,
    exhaustiveId: null,
    variationKind: meaning.variationKind,
    meaningExpected,
    exhaustiveExpected: null,
    readerActual,
    meaningPrimaryAxis: toPrimaryAxisKey(meaningExpected),
    exhaustivePrimaryAxis: null,
    readerPrimaryAxis: toPrimaryAxisKey(readerActual),
    meaningFullSignature: toFullSignatureKey(meaningExpected),
    exhaustiveFullSignature: null,
    readerFullSignature: toFullSignatureKey(readerActual),
    statuses: buildStatuses(flags, false),
    flags,
  };
}

function buildNotCoveredExhaustiveCase(
  exhaustive: ExhaustiveDiagnosticRow,
  readerActual: OracleSemanticSnapshot,
): OracleConsistencyCase {
  const exhaustiveExpected = toSnapshotFromExpectation(exhaustive.expected);
  const exhaustiveReaderMismatch = !expectationMatchesReader(
    exhaustiveExpected,
    readerActual,
  );

  const flags: OracleDiagnosticFlags = {
    crossSuiteConflict: false,
    meaningReaderMismatch: false,
    exhaustiveReaderMismatch,
    expectedOverridePresent: false,
    primaryConflict: false,
    fullSignatureConflict: false,
    timingConflict: false,
    analysisModeConflict: false,
    anchorCovered: false,
  };

  return {
    question: exhaustive.question,
    meaningCellId: null,
    meaningCaseId: null,
    exhaustiveId: exhaustive.id,
    variationKind: exhaustive.variationKind,
    meaningExpected: null,
    exhaustiveExpected,
    readerActual,
    meaningPrimaryAxis: null,
    exhaustivePrimaryAxis: toPrimaryAxisKey(exhaustiveExpected),
    readerPrimaryAxis: toPrimaryAxisKey(readerActual),
    meaningFullSignature: null,
    exhaustiveFullSignature: toFullSignatureKey(exhaustiveExpected),
    readerFullSignature: toFullSignatureKey(readerActual),
    statuses: buildStatuses(flags, false),
    flags,
  };
}

function groupByJoinKey<T extends { joinKey: string }>(
  rows: readonly T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const existing = map.get(row.joinKey);
    if (existing) {
      existing.push(row);
    } else {
      map.set(row.joinKey, [row]);
    }
  }
  return map;
}

/**
 * Run Oracle Consistency Diagnostic.
 * Conflicts are reported in metrics/cases; `passed` means execution success only.
 */
export function verifyOracleConsistency(
  cells: readonly QuestionMeaningCell[] = QUESTION_MEANING_CELLS,
  exhaustiveFixtures:
    readonly QuestionReaderExhaustive100Fixture[] =
      QUESTION_READER_EXHAUSTIVE_100_FIXTURES,
): OracleConsistencyVerificationResult {
  const meaningRows = expandMeaningRows(cells);
  const exhaustiveRows = expandExhaustiveRows(exhaustiveFixtures);

  const meaningByKey = groupByJoinKey(meaningRows);
  const exhaustiveByKey = groupByJoinKey(exhaustiveRows);

  const humanContext = buildDecisionEngineRegressionInput().humanContext;
  const readerCache = new Map<string, OracleSemanticSnapshot>();

  const readActual = (question: string): OracleSemanticSnapshot => {
    const key = joinKeyOf(question);
    const cached = readerCache.get(key);
    if (cached) {
      return cached;
    }
    const readerResult = readQuestion(humanContext, question);
    const snapshot: OracleSemanticSnapshot = {
      topic: readerResult.topic,
      intent: readerResult.intent,
      decisionTarget: readerResult.decisionTarget,
      timingType: readerResult.timingType,
      analysisMode: readerResult.analysisMode,
    };
    readerCache.set(key, snapshot);
    return snapshot;
  };

  const overlapKeys = [...meaningByKey.keys()].filter((key) =>
    exhaustiveByKey.has(key)
  );

  const overlapCases: OracleConsistencyCase[] = [];
  for (const key of overlapKeys) {
    const meaningList = meaningByKey.get(key) ?? [];
    const exhaustiveList = exhaustiveByKey.get(key) ?? [];
    const readerActual = readActual(meaningList[0]?.question ?? key);

    for (const meaning of meaningList) {
      for (const exhaustive of exhaustiveList) {
        overlapCases.push(
          buildOverlapCase({
            meaning,
            exhaustive,
            readerActual,
          }),
        );
      }
    }
  }

  const notCoveredCases: OracleConsistencyCase[] = [];
  for (const [key, meaningList] of meaningByKey) {
    if (exhaustiveByKey.has(key)) {
      continue;
    }
    for (const meaning of meaningList) {
      notCoveredCases.push(
        buildNotCoveredMeaningCase(meaning, readActual(meaning.question)),
      );
    }
  }
  for (const [key, exhaustiveList] of exhaustiveByKey) {
    if (meaningByKey.has(key)) {
      continue;
    }
    for (const exhaustive of exhaustiveList) {
      notCoveredCases.push(
        buildNotCoveredExhaustiveCase(
          exhaustive,
          readActual(exhaustive.question),
        ),
      );
    }
  }

  let meaningExpectedReaderMismatchCount = 0;
  for (const meaning of meaningRows) {
    const actual = readActual(meaning.question);
    if (
      !expectationMatchesReader(
        toSnapshotFromExpectation(meaning.expected),
        actual,
      )
    ) {
      meaningExpectedReaderMismatchCount += 1;
    }
  }

  let exhaustiveExpectedReaderMismatchCount = 0;
  for (const exhaustive of exhaustiveRows) {
    const actual = readActual(exhaustive.question);
    if (
      !expectationMatchesReader(
        toSnapshotFromExpectation(exhaustive.expected),
        actual,
      )
    ) {
      exhaustiveExpectedReaderMismatchCount += 1;
    }
  }

  const expectedOverrideCount = meaningRows.filter(
    (row) => row.expectedOverridePresent,
  ).length;

  const crossSuiteConflictCases = overlapCases.filter(
    (item) => item.flags.crossSuiteConflict,
  );
  const readerMismatchCases = overlapCases.filter(
    (item) =>
      item.flags.meaningReaderMismatch
      || item.flags.exhaustiveReaderMismatch,
  );

  const metrics: OracleConsistencyMetrics = {
    totalMeaningCases: meaningRows.length,
    totalExhaustiveCases: exhaustiveRows.length,
    overlapCount: overlapCases.length,
    notCoveredCount: notCoveredCases.length,
    fullSignatureConflictCount: overlapCases.filter(
      (item) => item.flags.fullSignatureConflict,
    ).length,
    primaryConflictCount: overlapCases.filter(
      (item) => item.flags.primaryConflict,
    ).length,
    timingConflictCount: overlapCases.filter(
      (item) => item.flags.timingConflict,
    ).length,
    analysisModeConflictCount: overlapCases.filter(
      (item) => item.flags.analysisModeConflict,
    ).length,
    meaningExpectedReaderMismatchCount,
    exhaustiveExpectedReaderMismatchCount,
    expectedOverrideCount,
  };

  return {
    passed: true,
    executionSuccess: true,
    metrics,
    overlapCases,
    notCoveredCases,
    crossSuiteConflictCases,
    readerMismatchCases,
  };
}

export type OracleKeyCaseProbe = {
  label: string;
  kind: "question" | "id";
  query: string;
  found: boolean;
  matches: readonly OracleConsistencyCase[];
};

/**
 * Probe key diagnostic examples A–G without hardcoding oracle answers.
 */
export function probeOracleKeyCases(
  result: OracleConsistencyVerificationResult,
): readonly OracleKeyCaseProbe[] {
  const allCases = [
    ...result.overlapCases,
    ...result.notCoveredCases,
  ];

  const probes: Array<{
    label: string;
    kind: "question" | "id";
    query: string;
  }> = [
    {
      label: "A",
      kind: "question",
      query: "A사업과 B사업 중 무엇이 더 맞을까요?",
    },
    {
      label: "B",
      kind: "question",
      query: "아파트를 매수하는 게 가능할까요?",
    },
    {
      label: "C",
      kind: "id",
      query: "business-option-comparison",
    },
    {
      label: "D",
      kind: "id",
      query: "job-leave-possibility",
    },
    {
      label: "E",
      kind: "id",
      query: "realEstate-buy-possibility",
    },
    {
      label: "F",
      kind: "id",
      query: "relationship-compatibility",
    },
    {
      label: "G",
      kind: "id",
      query: "marriage-spouse-compatibility",
    },
  ];

  return probes.map((probe) => {
    const matches = allCases.filter((item) => {
      if (probe.kind === "question") {
        return joinKeyOf(item.question) === joinKeyOf(probe.query);
      }
      return (
        item.meaningCellId === probe.query
        || item.meaningCaseId?.startsWith(`${probe.query}__`) === true
        || item.exhaustiveId === probe.query
        || item.exhaustiveId?.startsWith(`${probe.query}--`) === true
        || item.exhaustiveId?.startsWith(`${probe.query}__`) === true
      );
    });

    return {
      label: probe.label,
      kind: probe.kind,
      query: probe.query,
      found: matches.length > 0,
      matches,
    };
  });
}

export function serializeOracleConsistencyVerificationResult(
  result: OracleConsistencyVerificationResult,
): string {
  const keyCases = probeOracleKeyCases(result);

  const summarizeCase = (item: OracleConsistencyCase) => ({
    question: item.question,
    meaningCellId: item.meaningCellId,
    meaningCaseId: item.meaningCaseId,
    exhaustiveId: item.exhaustiveId,
    variationKind: item.variationKind,
    statuses: item.statuses,
    flags: item.flags,
    meaningExpected: item.meaningExpected,
    exhaustiveExpected: item.exhaustiveExpected,
    readerActual: item.readerActual,
    meaningPrimaryAxis: item.meaningPrimaryAxis,
    exhaustivePrimaryAxis: item.exhaustivePrimaryAxis,
    readerPrimaryAxis: item.readerPrimaryAxis,
  });

  return JSON.stringify(
    {
      passed: result.passed,
      executionSuccess: result.executionSuccess,
      metrics: result.metrics,
      crossSuiteConflictCount: result.crossSuiteConflictCases.length,
      readerMismatchCount: result.readerMismatchCases.length,
      crossSuiteConflictCases: result.crossSuiteConflictCases.map(
        summarizeCase,
      ),
      readerMismatchCases: result.readerMismatchCases.map(summarizeCase),
      keyCases: keyCases.map((probe) => ({
        label: probe.label,
        kind: probe.kind,
        query: probe.query,
        found: probe.found,
        matchCount: probe.matches.length,
        matches: probe.matches.map(summarizeCase),
      })),
      note:
        "Oracle diagnostic only. Conflict does not imply Strong Anchor gate failure.",
    },
    null,
    2,
  );
}
