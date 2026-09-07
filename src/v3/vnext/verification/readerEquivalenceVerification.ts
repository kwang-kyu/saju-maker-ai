/**
 * F0 Reader Equivalence Verification.
 *
 * 자연어 표면 문자열이 아니라
 * Question Reader가 만든 primaryAxis
 * (topic|intent|decisionTarget)의
 * cell 내 동등성과 cell 간 구분성을 검증한다.
 *
 * Adapter projection(domain / intent / object.label)은
 * 관측값으로만 유지하며 PASS 조건에 사용하지 않는다.
 *
 * Oracle: QUESTION_MEANING_CELLS fixture grouping.
 * 외부 의미 오라클 없이 "인간에게 의미가 같은가"를 증명하지 않는다.
 *
 * Variation PASS: seed(canonical Reader primaryAxis)와
 * paraphrase Reader primaryAxis가 동일.
 * seed와 다르면 FAIL로 고정한다.
 * keyword miss / 축 불일치를 NOT_COVERED로 숨기지 않는다.
 *
 * 현재 confirmed seed-mismatch FAIL oracle: 없음.
 * (과거 추적 항목 money-invest-timing /
 * relationship-compatibility /
 * marriage-spouse-compatibility 는 현재 F0에서 PASS)
 *
 * Boundary PASS(구조): 선언된 target primaryAxis와
 * variant Reader primaryAxis가 일치 (현재 F0 실행 범위는
 * canonical + paraphrase; target/timing/composite는 NOT_COVERED).
 *
 * 범위 밖: conversation pipeline, followUp, reuse, cache, assessment.
 */

import {
  buildHumanDestinyContextPipeline,
} from "../../builders/humanDestinyContextPipelineBuilder.js";
import {
  QUESTION_MEANING_CELLS,
} from "../../consulting/questionMeaningRegressionFixtures.js";
import type {
  QuestionMeaningCell,
  QuestionMeaningExpectation,
  QuestionMeaningPrimaryAxis,
  QuestionMeaningVariation,
} from "../../consulting/questionMeaningRegressionFixtures.js";
import {
  readQuestion,
} from "../../consulting/question/questionReader.js";
import type {
  DecisionTarget,
  QuestionIntent,
  QuestionReaderResult,
  QuestionTopic,
} from "../../consulting/question/questionReader.js";
import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext.js";
import {
  adaptQuestionMeaning,
} from "../adapters/questionMeaningAdapter.js";
import {
  routeScenario,
} from "../routing/scenarioRouter.js";
import type {
  QuestionDomain,
  QuestionMeaningIntent,
} from "../types/questionMeaning.js";

export type ReaderEquivalenceStatus =
  | "PASS"
  | "FAIL"
  | "NOT_COVERED";

/**
 * F0 최소 Adapter projection 관측값.
 * scenarioType은 참고 관찰값이며 PASS 조건에 포함하지 않는다.
 */
export type ReaderProjectedAxis = {
  domain: QuestionDomain;
  intent: QuestionMeaningIntent;
  objectLabel: string | null;
  scenarioType: string | null;
};

/**
 * Reader 실제 primaryAxis 관측값.
 * PASS/FAIL oracle의 기준 축이다.
 */
export type ReaderPrimaryAxisObservation = {
  topic: QuestionTopic;
  intent: QuestionIntent;
  decisionTarget: DecisionTarget;
  primaryAxis: QuestionMeaningPrimaryAxis;
};

export type ReaderEquivalenceObservationFlags = {
  /** A. 표면 문자열이 다른지 */
  surfaceDifferent: boolean;
  /** B. 같은 declared fixture cell인지 */
  sameDeclaredCell: boolean;
  /** C. Reader→Adapter projection이 같은지 (관측) */
  readerProjectionSame: boolean;
  /** D. Reader→Adapter projection이 다른지 (관측) */
  readerProjectionDifferent: boolean;
  /**
   * E. seed(canonical) vs surface Reader primaryAxis가 같은지.
   * Intra paraphrase PASS oracle.
   */
  readerPrimaryAxisSame: boolean;
  /** F. seed(canonical) vs surface Reader primaryAxis가 다른지 */
  readerPrimaryAxisDifferent: boolean;
  /**
   * G. paraphrase Reader primaryAxis가 seed와 일치하는지.
   * E와 동일 값이지만 seed 기준 oracle임을 결과 구조에 명시한다.
   */
  readerPrimaryAxisMatchesSeed: boolean;
};

export type ReaderEquivalenceCaseKind =
  | "intra_cell_paraphrase"
  | "inter_cell_primary_axis"
  | "coverage_gap";

export type ReaderEquivalenceSurfaceRecord = {
  cellId: string;
  canonical: string;
  surface: string;
  projectedDomain: QuestionDomain;
  projectedIntent: QuestionMeaningIntent;
  projectedObjectLabel: string | null;
  scenarioType: string | null;
  projectionEqual: boolean;
  readerPrimaryAxisEqual: boolean;
  leftReaderPrimaryAxis: QuestionMeaningPrimaryAxis | null;
  rightReaderPrimaryAxis: QuestionMeaningPrimaryAxis | null;
  differingAxes: readonly string[];
  differingReaderPrimaryAxisFields: readonly string[];
};

export type ReaderEquivalenceCase = {
  id: string;
  kind: ReaderEquivalenceCaseKind;
  status: ReaderEquivalenceStatus;
  passed: boolean;
  cellId: string | null;
  otherCellId: string | null;
  primaryAxis: QuestionMeaningPrimaryAxis | null;
  otherPrimaryAxis: QuestionMeaningPrimaryAxis | null;
  canonical: string | null;
  surface: string | null;
  flags: ReaderEquivalenceObservationFlags;
  leftProjection: ReaderProjectedAxis | null;
  rightProjection: ReaderProjectedAxis | null;
  leftReaderPrimaryAxis: ReaderPrimaryAxisObservation | null;
  rightReaderPrimaryAxis: ReaderPrimaryAxisObservation | null;
  /**
   * Intra paraphrase: seed = canonical Reader primaryAxis.
   * Inter/coverage: null.
   */
  seedReaderPrimaryAxis: QuestionMeaningPrimaryAxis | null;
  /**
   * Intra paraphrase FAIL 시 seed vs surface 축 불일치 사유.
   * NOT_COVERED로 강등하지 않는다.
   */
  failReason: string | null;
  differingAxes: readonly string[];
  differingReaderPrimaryAxisFields: readonly string[];
  details: readonly string[];
  notCoveredReason?: string;
};

export type ReaderEquivalenceVerificationResult = {
  step: "F0";
  passed: boolean;
  cases: readonly ReaderEquivalenceCase[];
  coverage: {
    fixtureCellCount: number;
    paraphraseSurfaceCount: number;
    projectedDomainCoverage: readonly QuestionDomain[];
    projectedIntentCoverage: readonly QuestionMeaningIntent[];
    readerPrimaryAxisCoverage: readonly QuestionMeaningPrimaryAxis[];
    notCoveredDomains: readonly QuestionDomain[];
    notCoveredIntents: readonly QuestionMeaningIntent[];
    excludedVariationKinds: readonly string[];
  };
  summary: {
    passCount: number;
    failCount: number;
    notCoveredCount: number;
  };
};

const ALL_QUESTION_DOMAINS: readonly QuestionDomain[] = [
  "money",
  "career",
  "business",
  "relationship",
  "marriage",
  "compatibility",
  "health",
  "legal",
  "life",
  "general",
  "other",
] as const;

const ALL_QUESTION_MEANING_INTENTS: readonly QuestionMeaningIntent[] = [
  "possibility",
  "timing",
  "direction",
  "reason",
  "method",
  "risk",
  "comparison",
  "selection",
  "interpretation",
  "existence",
  "general",
] as const;

/**
 * F0 실행 범위 밖 Operator 샘플.
 * target/timing/composite는 Boundary/Variation 구조는 지원하되
 * 이번 F0 PASS suite에는 포함하지 않는다 (NOT_COVERED).
 */
const EXCLUDED_VARIATION_KINDS = [
  "target",
  "timing",
  "composite",
] as const;

/**
 * seed(canonical Reader primaryAxis) ≠ paraphrase 로 확인된
 * 우선 FAIL oracle cell id 목록.
 * FAIL 판정 자체는 primaryAxisSame 여부로만 결정되며,
 * 이 Set은 failReason 주석(confirmed_fail_oracle)용이다.
 * 현재 F0 결과(failCount=0) 기준으로 stale 항목을 비운 상태.
 * keyword miss를 NOT_COVERED로 숨기지 않는다.
 */
const CONFIRMED_SEED_MISMATCH_FAIL_CELL_IDS: ReadonlySet<string> = new Set([
  // 현재 활성 confirmed seed-mismatch FAIL 없음.
]);

function buildVerificationHumanContext(): HumanDestinyContext {
  return buildHumanDestinyContextPipeline({
    name: "김천운",
    birthDate: "1984-03-15",
    birthTime: "14:30",
    gender: "male",
    calendarType: "solar",
    referenceDate: "2026-10-01",
    luckStartMethod: "minuteBased",
  }).humanContext;
}

function toReaderPrimaryAxis(
  readerResult: Pick<
    QuestionReaderResult,
    "topic" | "intent" | "decisionTarget"
  >,
): ReaderPrimaryAxisObservation {
  return {
    topic: readerResult.topic,
    intent: readerResult.intent,
    decisionTarget: readerResult.decisionTarget,
    primaryAxis:
      `${readerResult.topic}|${readerResult.intent}|${readerResult.decisionTarget}` as QuestionMeaningPrimaryAxis,
  };
}

/**
 * fixture expected(+override)에서 선언된 target primaryAxis.
 * Boundary PASS 판정용 구조 헬퍼 (현재 F0 suite는 paraphrase만 실행).
 */
export function toDeclaredPrimaryAxis(
  expected: Pick<
    QuestionMeaningExpectation,
    "topic" | "intent" | "decisionTarget"
  >,
): QuestionMeaningPrimaryAxis {
  return `${expected.topic}|${expected.intent}|${expected.decisionTarget}` as QuestionMeaningPrimaryAxis;
}

export function toVariationTargetPrimaryAxis(
  cell: QuestionMeaningCell,
  variation: QuestionMeaningVariation,
): QuestionMeaningPrimaryAxis {
  return toDeclaredPrimaryAxis({
    topic: variation.expectedOverride?.topic ?? cell.expected.topic,
    intent: variation.expectedOverride?.intent ?? cell.expected.intent,
    decisionTarget:
      variation.expectedOverride?.decisionTarget
      ?? cell.expected.decisionTarget,
  });
}

/**
 * expectedOverride가 topic|intent|decisionTarget을 바꾸면 Boundary 후보.
 * timingType/analysisMode만 바꾸면 Variation(축 불변) 후보.
 */
export function isPrimaryAxisBoundaryVariation(
  cell: QuestionMeaningCell,
  variation: QuestionMeaningVariation,
): boolean {
  return toVariationTargetPrimaryAxis(cell, variation) !== cell.primaryAxis;
}

type QuestionAxisObservation = {
  readerPrimaryAxis: ReaderPrimaryAxisObservation;
  projection: ReaderProjectedAxis;
};

/**
 * Reader primaryAxis + Adapter projection(+ scenario 참고)을 함께 관측한다.
 */
function observeQuestionAxes(
  humanContext: HumanDestinyContext,
  question: string,
): QuestionAxisObservation {
  const readerResult = readQuestion(humanContext, question);
  const meaning = adaptQuestionMeaning(readerResult);
  const scenario = routeScenario(meaning);

  return {
    readerPrimaryAxis: toReaderPrimaryAxis(readerResult),
    projection: {
      domain: meaning.domain,
      intent: meaning.intent,
      objectLabel: meaning.object?.label ?? null,
      scenarioType: scenario.type,
    },
  };
}

/**
 * semanticAxisReuseVerification.meaningAxesEqual 과 동일 기준
 * (domain / intent / object.label) — 관측 전용.
 */
function meaningAxesEqual(
  left: ReaderProjectedAxis,
  right: ReaderProjectedAxis,
): boolean {
  return left.domain === right.domain
    && left.intent === right.intent
    && left.objectLabel === right.objectLabel;
}

function diffMeaningAxes(
  left: ReaderProjectedAxis,
  right: ReaderProjectedAxis,
): string[] {
  const differing: string[] = [];

  if (left.domain !== right.domain) {
    differing.push("domain");
  }

  if (left.intent !== right.intent) {
    differing.push("intent");
  }

  if (left.objectLabel !== right.objectLabel) {
    differing.push("object.label");
  }

  return differing;
}

function readerPrimaryAxesEqual(
  left: ReaderPrimaryAxisObservation,
  right: ReaderPrimaryAxisObservation,
): boolean {
  return left.primaryAxis === right.primaryAxis;
}

function diffReaderPrimaryAxisFields(
  left: ReaderPrimaryAxisObservation,
  right: ReaderPrimaryAxisObservation,
): string[] {
  const differing: string[] = [];

  if (left.topic !== right.topic) {
    differing.push("topic");
  }

  if (left.intent !== right.intent) {
    differing.push("intent");
  }

  if (left.decisionTarget !== right.decisionTarget) {
    differing.push("decisionTarget");
  }

  return differing;
}

function buildFlags(params: {
  surfaceDifferent: boolean;
  sameDeclaredCell: boolean;
  readerProjectionSame: boolean;
  readerPrimaryAxisSame: boolean;
}): ReaderEquivalenceObservationFlags {
  return {
    surfaceDifferent: params.surfaceDifferent,
    sameDeclaredCell: params.sameDeclaredCell,
    readerProjectionSame: params.readerProjectionSame,
    readerProjectionDifferent: !params.readerProjectionSame,
    readerPrimaryAxisSame: params.readerPrimaryAxisSame,
    readerPrimaryAxisDifferent: !params.readerPrimaryAxisSame,
    readerPrimaryAxisMatchesSeed: params.readerPrimaryAxisSame,
  };
}

function buildCase(params: {
  id: string;
  kind: ReaderEquivalenceCaseKind;
  status: ReaderEquivalenceStatus;
  cellId: string | null;
  otherCellId?: string | null;
  primaryAxis: QuestionMeaningPrimaryAxis | null;
  otherPrimaryAxis?: QuestionMeaningPrimaryAxis | null;
  canonical: string | null;
  surface: string | null;
  flags: ReaderEquivalenceObservationFlags;
  leftProjection: ReaderProjectedAxis | null;
  rightProjection: ReaderProjectedAxis | null;
  leftReaderPrimaryAxis: ReaderPrimaryAxisObservation | null;
  rightReaderPrimaryAxis: ReaderPrimaryAxisObservation | null;
  seedReaderPrimaryAxis?: QuestionMeaningPrimaryAxis | null;
  failReason?: string | null;
  differingAxes: readonly string[];
  differingReaderPrimaryAxisFields: readonly string[];
  details: readonly string[];
  notCoveredReason?: string;
}): ReaderEquivalenceCase {
  return {
    id: params.id,
    kind: params.kind,
    status: params.status,
    passed: params.status === "PASS",
    cellId: params.cellId,
    otherCellId: params.otherCellId ?? null,
    primaryAxis: params.primaryAxis,
    otherPrimaryAxis: params.otherPrimaryAxis ?? null,
    canonical: params.canonical,
    surface: params.surface,
    flags: params.flags,
    leftProjection: params.leftProjection,
    rightProjection: params.rightProjection,
    leftReaderPrimaryAxis: params.leftReaderPrimaryAxis,
    rightReaderPrimaryAxis: params.rightReaderPrimaryAxis,
    seedReaderPrimaryAxis: params.seedReaderPrimaryAxis ?? null,
    failReason: params.failReason ?? null,
    differingAxes: params.differingAxes,
    differingReaderPrimaryAxisFields: params.differingReaderPrimaryAxisFields,
    details: params.details,
    ...(params.notCoveredReason
      ? { notCoveredReason: params.notCoveredReason }
      : {}),
  };
}

function collectIntraCellCases(
  humanContext: HumanDestinyContext,
  cells: readonly QuestionMeaningCell[],
): ReaderEquivalenceCase[] {
  const cases: ReaderEquivalenceCase[] = [];

  for (const cell of cells) {
    const canonicalObservation = observeQuestionAxes(
      humanContext,
      cell.canonicalQuestion,
    );

    if (cell.paraphrases.length === 0) {
      cases.push(buildCase({
        id: `f0-intra-${cell.id}__no-paraphrase`,
        kind: "intra_cell_paraphrase",
        status: "NOT_COVERED",
        cellId: cell.id,
        primaryAxis: cell.primaryAxis,
        canonical: cell.canonicalQuestion,
        surface: null,
        flags: buildFlags({
          surfaceDifferent: false,
          sameDeclaredCell: true,
          readerProjectionSame: true,
          readerPrimaryAxisSame: true,
        }),
        leftProjection: canonicalObservation.projection,
        rightProjection: null,
        leftReaderPrimaryAxis: canonicalObservation.readerPrimaryAxis,
        rightReaderPrimaryAxis: null,
        seedReaderPrimaryAxis:
          canonicalObservation.readerPrimaryAxis.primaryAxis,
        differingAxes: [],
        differingReaderPrimaryAxisFields: [],
        details: [
          `cellId=${cell.id}`,
          `declaredPrimaryAxis=${cell.primaryAxis}`,
          `seedReaderPrimaryAxis=${canonicalObservation.readerPrimaryAxis.primaryAxis}`,
          `projectedDomain=${canonicalObservation.projection.domain}`,
          `projectedIntent=${canonicalObservation.projection.intent}`,
          `projectedObjectLabel=${canonicalObservation.projection.objectLabel ?? "null"}`,
          `scenarioType=${canonicalObservation.projection.scenarioType ?? "null"}`,
        ],
        notCoveredReason:
          "paraphrase surface가 없어 cell 내 Reader Equivalence를 검증할 수 없음",
      }));
      continue;
    }

    for (const paraphrase of cell.paraphrases) {
      const surfaceObservation = observeQuestionAxes(
        humanContext,
        paraphrase.question,
      );
      const surfaceDifferent =
        paraphrase.question !== cell.canonicalQuestion;
      const projectionSame = meaningAxesEqual(
        canonicalObservation.projection,
        surfaceObservation.projection,
      );
      const primaryAxisSame = readerPrimaryAxesEqual(
        canonicalObservation.readerPrimaryAxis,
        surfaceObservation.readerPrimaryAxis,
      );
      const differingAxes = diffMeaningAxes(
        canonicalObservation.projection,
        surfaceObservation.projection,
      );
      const differingReaderPrimaryAxisFields = diffReaderPrimaryAxisFields(
        canonicalObservation.readerPrimaryAxis,
        surfaceObservation.readerPrimaryAxis,
      );
      const flags = buildFlags({
        surfaceDifferent,
        sameDeclaredCell: true,
        readerProjectionSame: projectionSame,
        readerPrimaryAxisSame: primaryAxisSame,
      });

      const details = [
        `cellId=${cell.id}`,
        `declaredPrimaryAxis=${cell.primaryAxis}`,
        `canonical=${cell.canonicalQuestion}`,
        `surface=${paraphrase.question}`,
        `A.surfaceDifferent=${flags.surfaceDifferent}`,
        `B.sameDeclaredCell=${flags.sameDeclaredCell}`,
        `C.readerProjectionSame=${flags.readerProjectionSame}`,
        `D.readerProjectionDifferent=${flags.readerProjectionDifferent}`,
        `E.readerPrimaryAxisSame=${flags.readerPrimaryAxisSame}`,
        `F.readerPrimaryAxisDifferent=${flags.readerPrimaryAxisDifferent}`,
        `G.readerPrimaryAxisMatchesSeed=${flags.readerPrimaryAxisMatchesSeed}`,
        `seedReaderPrimaryAxis=${canonicalObservation.readerPrimaryAxis.primaryAxis}`,
        `surfaceReaderPrimaryAxis=${surfaceObservation.readerPrimaryAxis.primaryAxis}`,
        `canonicalDomain=${canonicalObservation.projection.domain}`,
        `canonicalIntent=${canonicalObservation.projection.intent}`,
        `canonicalObjectLabel=${canonicalObservation.projection.objectLabel ?? "null"}`,
        `surfaceDomain=${surfaceObservation.projection.domain}`,
        `surfaceIntent=${surfaceObservation.projection.intent}`,
        `surfaceObjectLabel=${surfaceObservation.projection.objectLabel ?? "null"}`,
        `scenarioTypeCanonical=${canonicalObservation.projection.scenarioType ?? "null"}`,
        `scenarioTypeSurface=${surfaceObservation.projection.scenarioType ?? "null"}`,
        `differingAxes=${differingAxes.join(",") || "none"}`,
        `differingReaderPrimaryAxisFields=${
          differingReaderPrimaryAxisFields.join(",") || "none"
        }`,
      ];

      if (!surfaceDifferent) {
        cases.push(buildCase({
          id: `f0-intra-${cell.id}__${paraphrase.idSuffix}`,
          kind: "intra_cell_paraphrase",
          status: "NOT_COVERED",
          cellId: cell.id,
          primaryAxis: cell.primaryAxis,
          canonical: cell.canonicalQuestion,
          surface: paraphrase.question,
          flags,
          leftProjection: canonicalObservation.projection,
          rightProjection: surfaceObservation.projection,
          leftReaderPrimaryAxis: canonicalObservation.readerPrimaryAxis,
          rightReaderPrimaryAxis: surfaceObservation.readerPrimaryAxis,
          seedReaderPrimaryAxis:
            canonicalObservation.readerPrimaryAxis.primaryAxis,
          differingAxes,
          differingReaderPrimaryAxisFields,
          details,
          notCoveredReason:
            "surface 문자열이 canonical과 동일하여 "
            + "문자열 독립 equivalence를 관찰할 수 없음",
        }));
        continue;
      }

      // LOCKED: seed(canonical Reader primaryAxis) ≠ paraphrase → FAIL.
      // keyword miss / 축 불일치를 NOT_COVERED로 숨기지 않는다.
      // CONFIRMED_SEED_MISMATCH_FAIL_CELL_IDS는 failReason 주석용이며
      // 현재는 비어 있다 (활성 confirmed FAIL oracle 없음).
      const status: ReaderEquivalenceStatus = primaryAxisSame
        ? "PASS"
        : "FAIL";
      const failReason = status === "FAIL"
        ? (
          `paraphrase_reader_primary_axis_differs_from_seed:`
          + ` expected=${canonicalObservation.readerPrimaryAxis.primaryAxis}`
          + ` actual=${surfaceObservation.readerPrimaryAxis.primaryAxis}`
          + (
            CONFIRMED_SEED_MISMATCH_FAIL_CELL_IDS.has(cell.id)
              ? "; confirmed_fail_oracle=true"
              : ""
          )
        )
        : null;

      cases.push(buildCase({
        id: `f0-intra-${cell.id}__${paraphrase.idSuffix}`,
        kind: "intra_cell_paraphrase",
        status,
        cellId: cell.id,
        primaryAxis: cell.primaryAxis,
        canonical: cell.canonicalQuestion,
        surface: paraphrase.question,
        flags,
        leftProjection: canonicalObservation.projection,
        rightProjection: surfaceObservation.projection,
        leftReaderPrimaryAxis: canonicalObservation.readerPrimaryAxis,
        rightReaderPrimaryAxis: surfaceObservation.readerPrimaryAxis,
        seedReaderPrimaryAxis:
          canonicalObservation.readerPrimaryAxis.primaryAxis,
        failReason,
        differingAxes,
        differingReaderPrimaryAxisFields,
        details: failReason
          ? [...details, `failReason=${failReason}`]
          : details,
      }));
    }
  }

  return cases;
}

function collectInterCellCases(
  humanContext: HumanDestinyContext,
  cells: readonly QuestionMeaningCell[],
): ReaderEquivalenceCase[] {
  const cases: ReaderEquivalenceCase[] = [];
  const observations = cells.map((cell) => ({
    cell,
    observation: observeQuestionAxes(
      humanContext,
      cell.canonicalQuestion,
    ),
  }));

  for (let leftIndex = 0; leftIndex < observations.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < observations.length;
      rightIndex += 1
    ) {
      const left = observations[leftIndex];
      const right = observations[rightIndex];

      if (left.cell.primaryAxis === right.cell.primaryAxis) {
        // 동일 declared primaryAxis cell pair는 F0 구분성 oracle 대상 아님
        cases.push(buildCase({
          id: `f0-inter-${left.cell.id}__vs__${right.cell.id}`,
          kind: "inter_cell_primary_axis",
          status: "NOT_COVERED",
          cellId: left.cell.id,
          otherCellId: right.cell.id,
          primaryAxis: left.cell.primaryAxis,
          otherPrimaryAxis: right.cell.primaryAxis,
          canonical: left.cell.canonicalQuestion,
          surface: right.cell.canonicalQuestion,
          flags: buildFlags({
            surfaceDifferent:
              left.cell.canonicalQuestion !== right.cell.canonicalQuestion,
            sameDeclaredCell: false,
            readerProjectionSame: meaningAxesEqual(
              left.observation.projection,
              right.observation.projection,
            ),
            readerPrimaryAxisSame: readerPrimaryAxesEqual(
              left.observation.readerPrimaryAxis,
              right.observation.readerPrimaryAxis,
            ),
          }),
          leftProjection: left.observation.projection,
          rightProjection: right.observation.projection,
          leftReaderPrimaryAxis: left.observation.readerPrimaryAxis,
          rightReaderPrimaryAxis: right.observation.readerPrimaryAxis,
          differingAxes: diffMeaningAxes(
            left.observation.projection,
            right.observation.projection,
          ),
          differingReaderPrimaryAxisFields: diffReaderPrimaryAxisFields(
            left.observation.readerPrimaryAxis,
            right.observation.readerPrimaryAxis,
          ),
          details: [
            `leftCellId=${left.cell.id}`,
            `rightCellId=${right.cell.id}`,
            `declaredPrimaryAxis=${left.cell.primaryAxis}`,
            "note=declared primaryAxis가 같아 구분성 검증 대상 아님",
          ],
          notCoveredReason:
            "declared primaryAxis가 동일하여 inter-cell 구분성 oracle 미적용",
        }));
        continue;
      }

      const surfaceDifferent =
        left.cell.canonicalQuestion !== right.cell.canonicalQuestion;
      const projectionSame = meaningAxesEqual(
        left.observation.projection,
        right.observation.projection,
      );
      const primaryAxisSame = readerPrimaryAxesEqual(
        left.observation.readerPrimaryAxis,
        right.observation.readerPrimaryAxis,
      );
      const differingAxes = diffMeaningAxes(
        left.observation.projection,
        right.observation.projection,
      );
      const differingReaderPrimaryAxisFields = diffReaderPrimaryAxisFields(
        left.observation.readerPrimaryAxis,
        right.observation.readerPrimaryAxis,
      );
      const flags = buildFlags({
        surfaceDifferent,
        sameDeclaredCell: false,
        readerProjectionSame: projectionSame,
        readerPrimaryAxisSame: primaryAxisSame,
      });

      const details = [
        `leftCellId=${left.cell.id}`,
        `rightCellId=${right.cell.id}`,
        `leftDeclaredPrimaryAxis=${left.cell.primaryAxis}`,
        `rightDeclaredPrimaryAxis=${right.cell.primaryAxis}`,
        `leftCanonical=${left.cell.canonicalQuestion}`,
        `rightCanonical=${right.cell.canonicalQuestion}`,
        `A.surfaceDifferent=${flags.surfaceDifferent}`,
        `B.sameDeclaredCell=${flags.sameDeclaredCell}`,
        `C.readerProjectionSame=${flags.readerProjectionSame}`,
        `D.readerProjectionDifferent=${flags.readerProjectionDifferent}`,
        `E.readerPrimaryAxisSame=${flags.readerPrimaryAxisSame}`,
        `F.readerPrimaryAxisDifferent=${flags.readerPrimaryAxisDifferent}`,
        `leftReaderPrimaryAxis=${left.observation.readerPrimaryAxis.primaryAxis}`,
        `rightReaderPrimaryAxis=${right.observation.readerPrimaryAxis.primaryAxis}`,
        `leftDomain=${left.observation.projection.domain}`,
        `leftIntent=${left.observation.projection.intent}`,
        `leftObjectLabel=${left.observation.projection.objectLabel ?? "null"}`,
        `rightDomain=${right.observation.projection.domain}`,
        `rightIntent=${right.observation.projection.intent}`,
        `rightObjectLabel=${right.observation.projection.objectLabel ?? "null"}`,
        `leftScenarioType=${left.observation.projection.scenarioType ?? "null"}`,
        `rightScenarioType=${right.observation.projection.scenarioType ?? "null"}`,
        `differingAxes=${differingAxes.join(",") || "none"}`,
        `differingReaderPrimaryAxisFields=${
          differingReaderPrimaryAxisFields.join(",") || "none"
        }`,
      ];

      if (!surfaceDifferent) {
        cases.push(buildCase({
          id: `f0-inter-${left.cell.id}__vs__${right.cell.id}`,
          kind: "inter_cell_primary_axis",
          status: "NOT_COVERED",
          cellId: left.cell.id,
          otherCellId: right.cell.id,
          primaryAxis: left.cell.primaryAxis,
          otherPrimaryAxis: right.cell.primaryAxis,
          canonical: left.cell.canonicalQuestion,
          surface: right.cell.canonicalQuestion,
          flags,
          leftProjection: left.observation.projection,
          rightProjection: right.observation.projection,
          leftReaderPrimaryAxis: left.observation.readerPrimaryAxis,
          rightReaderPrimaryAxis: right.observation.readerPrimaryAxis,
          differingAxes,
          differingReaderPrimaryAxisFields,
          details,
          notCoveredReason:
            "두 cell canonical 표면 문자열이 동일하여 구분성 관찰 전제 미성립",
        }));
        continue;
      }

      // declared primaryAxis가 다르면 Reader primaryAxis도 구분되어야 PASS
      cases.push(buildCase({
        id: `f0-inter-${left.cell.id}__vs__${right.cell.id}`,
        kind: "inter_cell_primary_axis",
        status: primaryAxisSame ? "FAIL" : "PASS",
        cellId: left.cell.id,
        otherCellId: right.cell.id,
        primaryAxis: left.cell.primaryAxis,
        otherPrimaryAxis: right.cell.primaryAxis,
        canonical: left.cell.canonicalQuestion,
        surface: right.cell.canonicalQuestion,
        flags,
        leftProjection: left.observation.projection,
        rightProjection: right.observation.projection,
        leftReaderPrimaryAxis: left.observation.readerPrimaryAxis,
        rightReaderPrimaryAxis: right.observation.readerPrimaryAxis,
        differingAxes,
        differingReaderPrimaryAxisFields,
        details,
      }));
    }
  }

  return cases;
}

function collectCoverageGapCases(
  observedDomains: ReadonlySet<QuestionDomain>,
  observedIntents: ReadonlySet<QuestionMeaningIntent>,
): ReaderEquivalenceCase[] {
  const cases: ReaderEquivalenceCase[] = [];

  for (const domain of ALL_QUESTION_DOMAINS) {
    if (observedDomains.has(domain)) {
      continue;
    }

    cases.push(buildCase({
      id: `f0-coverage-domain-${domain}`,
      kind: "coverage_gap",
      status: "NOT_COVERED",
      cellId: null,
      primaryAxis: null,
      canonical: null,
      surface: null,
      flags: buildFlags({
        surfaceDifferent: false,
        sameDeclaredCell: false,
        readerProjectionSame: false,
        readerPrimaryAxisSame: false,
      }),
      leftProjection: null,
      rightProjection: null,
      leftReaderPrimaryAxis: null,
      rightReaderPrimaryAxis: null,
      differingAxes: [],
      differingReaderPrimaryAxisFields: [],
      details: [`missingProjectedDomain=${domain}`],
      notCoveredReason:
        `QUESTION_MEANING_CELLS canonical/paraphrase projection에 `
        + `domain=${domain} fixture가 없음`,
    }));
  }

  for (const intent of ALL_QUESTION_MEANING_INTENTS) {
    if (observedIntents.has(intent)) {
      continue;
    }

    cases.push(buildCase({
      id: `f0-coverage-intent-${intent}`,
      kind: "coverage_gap",
      status: "NOT_COVERED",
      cellId: null,
      primaryAxis: null,
      canonical: null,
      surface: null,
      flags: buildFlags({
        surfaceDifferent: false,
        sameDeclaredCell: false,
        readerProjectionSame: false,
        readerPrimaryAxisSame: false,
      }),
      leftProjection: null,
      rightProjection: null,
      leftReaderPrimaryAxis: null,
      rightReaderPrimaryAxis: null,
      differingAxes: [],
      differingReaderPrimaryAxisFields: [],
      details: [`missingProjectedIntent=${intent}`],
      notCoveredReason:
        `QUESTION_MEANING_CELLS canonical/paraphrase projection에 `
        + `intent=${intent} fixture가 없음`,
    }));
  }

  for (const variationKind of EXCLUDED_VARIATION_KINDS) {
    cases.push(buildCase({
      id: `f0-coverage-variation-${variationKind}`,
      kind: "coverage_gap",
      status: "NOT_COVERED",
      cellId: null,
      primaryAxis: null,
      canonical: null,
      surface: null,
      flags: buildFlags({
        surfaceDifferent: false,
        sameDeclaredCell: false,
        readerProjectionSame: false,
        readerPrimaryAxisSame: false,
      }),
      leftProjection: null,
      rightProjection: null,
      leftReaderPrimaryAxis: null,
      rightReaderPrimaryAxis: null,
      differingAxes: [],
      differingReaderPrimaryAxisFields: [],
      details: [`excludedVariationKind=${variationKind}`],
      notCoveredReason:
        `variationKind=${variationKind}는 현재 F0 실행 범위 밖 `
        + "(canonical + paraphrase만 PASS/FAIL 대상; "
        + "Boundary/Variation 헬퍼는 toVariationTargetPrimaryAxis로 준비됨)",
    }));
  }

  return cases;
}

/**
 * F0 Reader Equivalence 검증을 실행한다.
 * 질문 원문 문자열 identity 비교를 하지 않으며 pipeline을 호출하지 않는다.
 */
export function verifyReaderEquivalence(
  cells: readonly QuestionMeaningCell[] = QUESTION_MEANING_CELLS,
): ReaderEquivalenceVerificationResult {
  const humanContext = buildVerificationHumanContext();

  const intraCases = collectIntraCellCases(humanContext, cells);
  const interCases = collectInterCellCases(humanContext, cells);

  const observedDomains = new Set<QuestionDomain>();
  const observedIntents = new Set<QuestionMeaningIntent>();
  const observedReaderPrimaryAxes = new Set<QuestionMeaningPrimaryAxis>();
  let paraphraseSurfaceCount = 0;

  for (const cell of cells) {
    const canonicalObservation = observeQuestionAxes(
      humanContext,
      cell.canonicalQuestion,
    );
    observedDomains.add(canonicalObservation.projection.domain);
    observedIntents.add(canonicalObservation.projection.intent);
    observedReaderPrimaryAxes.add(
      canonicalObservation.readerPrimaryAxis.primaryAxis,
    );

    for (const paraphrase of cell.paraphrases) {
      paraphraseSurfaceCount += 1;
      const surfaceObservation = observeQuestionAxes(
        humanContext,
        paraphrase.question,
      );
      observedDomains.add(surfaceObservation.projection.domain);
      observedIntents.add(surfaceObservation.projection.intent);
      observedReaderPrimaryAxes.add(
        surfaceObservation.readerPrimaryAxis.primaryAxis,
      );
    }
  }

  const coverageCases = collectCoverageGapCases(
    observedDomains,
    observedIntents,
  );

  const cases = [
    ...intraCases,
    ...interCases,
    ...coverageCases,
  ];

  const passCount = cases.filter((item) => item.status === "PASS").length;
  const failCount = cases.filter((item) => item.status === "FAIL").length;
  const notCoveredCount = cases.filter(
    (item) => item.status === "NOT_COVERED",
  ).length;

  return {
    step: "F0",
    // NOT_COVERED는 커버리지 공백이며 suite 실패로 취급하지 않는다.
    passed: cases.every((item) => item.status !== "FAIL"),
    cases,
    coverage: {
      fixtureCellCount: cells.length,
      paraphraseSurfaceCount,
      projectedDomainCoverage: Array.from(observedDomains).sort(),
      projectedIntentCoverage: Array.from(observedIntents).sort(),
      readerPrimaryAxisCoverage: Array.from(observedReaderPrimaryAxes).sort(),
      notCoveredDomains: ALL_QUESTION_DOMAINS.filter(
        (domain) => !observedDomains.has(domain),
      ),
      notCoveredIntents: ALL_QUESTION_MEANING_INTENTS.filter(
        (intent) => !observedIntents.has(intent),
      ),
      excludedVariationKinds: [...EXCLUDED_VARIATION_KINDS],
    },
    summary: {
      passCount,
      failCount,
      notCoveredCount,
    },
  };
}

export function toSurfaceRecords(
  result: ReaderEquivalenceVerificationResult,
): ReaderEquivalenceSurfaceRecord[] {
  return result.cases
    .filter((item) => item.kind === "intra_cell_paraphrase")
    .filter((item) => item.surface !== null && item.rightProjection !== null)
    .map((item) => ({
      cellId: item.cellId ?? "unknown",
      canonical: item.canonical ?? "",
      surface: item.surface ?? "",
      projectedDomain: item.rightProjection!.domain,
      projectedIntent: item.rightProjection!.intent,
      projectedObjectLabel: item.rightProjection!.objectLabel,
      scenarioType: item.rightProjection!.scenarioType,
      projectionEqual: item.flags.readerProjectionSame,
      readerPrimaryAxisEqual: item.flags.readerPrimaryAxisSame,
      leftReaderPrimaryAxis: item.leftReaderPrimaryAxis?.primaryAxis ?? null,
      rightReaderPrimaryAxis: item.rightReaderPrimaryAxis?.primaryAxis ?? null,
      differingAxes: item.differingAxes,
      differingReaderPrimaryAxisFields: item.differingReaderPrimaryAxisFields,
    }));
}

export function serializeReaderEquivalenceVerificationResult(
  result: ReaderEquivalenceVerificationResult,
): string {
  return JSON.stringify(
    {
      step: result.step,
      passed: result.passed,
      summary: result.summary,
      coverage: result.coverage,
      surfaceRecords: toSurfaceRecords(result),
      cases: result.cases.map((item) => ({
        id: item.id,
        kind: item.kind,
        status: item.status,
        passed: item.passed,
        cellId: item.cellId,
        otherCellId: item.otherCellId,
        primaryAxis: item.primaryAxis,
        otherPrimaryAxis: item.otherPrimaryAxis,
        canonical: item.canonical,
        surface: item.surface,
        flags: item.flags,
        leftProjection: item.leftProjection,
        rightProjection: item.rightProjection,
        leftReaderPrimaryAxis: item.leftReaderPrimaryAxis,
        rightReaderPrimaryAxis: item.rightReaderPrimaryAxis,
        seedReaderPrimaryAxis: item.seedReaderPrimaryAxis,
        failReason: item.failReason,
        differingAxes: item.differingAxes,
        differingReaderPrimaryAxisFields: item.differingReaderPrimaryAxisFields,
        details: item.details,
        ...(item.notCoveredReason
          ? { notCoveredReason: item.notCoveredReason }
          : {}),
      })),
    },
    null,
    2,
  );
}
