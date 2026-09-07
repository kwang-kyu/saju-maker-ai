/**
 * F0 Reader Equivalence Verification.
 *
 * 자연어 표면 문자열이 아니라
 * Question Reader → QuestionMeaning Adapter가 만든
 * structured semantic axis(domain / intent / object.label)의
 * cell 내 동등성과 cell 간 구분성을 검증한다.
 *
 * Oracle: QUESTION_MEANING_CELLS fixture grouping.
 * 외부 의미 오라클 없이 "인간에게 의미가 같은가"를 증명하지 않는다.
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
  QuestionMeaningPrimaryAxis,
} from "../../consulting/questionMeaningRegressionFixtures.js";
import {
  readQuestion,
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
 * F0 최소 projection axis.
 * scenarioType은 참고 관찰값이며 PASS 조건에 포함하지 않는다.
 */
export type ReaderProjectedAxis = {
  domain: QuestionDomain;
  intent: QuestionMeaningIntent;
  objectLabel: string | null;
  scenarioType: string | null;
};

export type ReaderEquivalenceObservationFlags = {
  /** A. 표면 문자열이 다른지 */
  surfaceDifferent: boolean;
  /** B. 같은 declared fixture cell인지 */
  sameDeclaredCell: boolean;
  /** C. Reader→Adapter projection이 같은지 */
  readerProjectionSame: boolean;
  /** D. Reader→Adapter projection이 다른지 */
  readerProjectionDifferent: boolean;
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
  differingAxes: readonly string[];
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
  differingAxes: readonly string[];
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

const EXCLUDED_VARIATION_KINDS = [
  "target",
  "timing",
  "composite",
] as const;

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

/**
 * semanticAxisReuseVerification.observeAxesFromReaderAdapter 와 동일 경로:
 * readQuestion → adaptQuestionMeaning (+ scenario는 참고 관찰).
 */
function projectReaderAdapterAxis(
  humanContext: HumanDestinyContext,
  question: string,
): ReaderProjectedAxis {
  const readerResult = readQuestion(humanContext, question);
  const meaning = adaptQuestionMeaning(readerResult);
  const scenario = routeScenario(meaning);

  return {
    domain: meaning.domain,
    intent: meaning.intent,
    objectLabel: meaning.object?.label ?? null,
    scenarioType: scenario.type,
  };
}

/**
 * semanticAxisReuseVerification.meaningAxesEqual 과 동일 기준
 * (domain / intent / object.label).
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

function buildFlags(params: {
  surfaceDifferent: boolean;
  sameDeclaredCell: boolean;
  readerProjectionSame: boolean;
}): ReaderEquivalenceObservationFlags {
  return {
    surfaceDifferent: params.surfaceDifferent,
    sameDeclaredCell: params.sameDeclaredCell,
    readerProjectionSame: params.readerProjectionSame,
    readerProjectionDifferent: !params.readerProjectionSame,
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
  differingAxes: readonly string[];
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
    differingAxes: params.differingAxes,
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
    const canonicalProjection = projectReaderAdapterAxis(
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
        }),
        leftProjection: canonicalProjection,
        rightProjection: null,
        differingAxes: [],
        details: [
          `cellId=${cell.id}`,
          `primaryAxis=${cell.primaryAxis}`,
          `projectedDomain=${canonicalProjection.domain}`,
          `projectedIntent=${canonicalProjection.intent}`,
          `projectedObjectLabel=${canonicalProjection.objectLabel ?? "null"}`,
          `scenarioType=${canonicalProjection.scenarioType ?? "null"}`,
        ],
        notCoveredReason:
          "paraphrase surface가 없어 cell 내 Reader Equivalence를 검증할 수 없음",
      }));
      continue;
    }

    for (const paraphrase of cell.paraphrases) {
      const surfaceProjection = projectReaderAdapterAxis(
        humanContext,
        paraphrase.question,
      );
      const surfaceDifferent =
        paraphrase.question !== cell.canonicalQuestion;
      const projectionSame = meaningAxesEqual(
        canonicalProjection,
        surfaceProjection,
      );
      const differingAxes = diffMeaningAxes(
        canonicalProjection,
        surfaceProjection,
      );
      const flags = buildFlags({
        surfaceDifferent,
        sameDeclaredCell: true,
        readerProjectionSame: projectionSame,
      });

      const details = [
        `cellId=${cell.id}`,
        `primaryAxis=${cell.primaryAxis}`,
        `canonical=${cell.canonicalQuestion}`,
        `surface=${paraphrase.question}`,
        `A.surfaceDifferent=${flags.surfaceDifferent}`,
        `B.sameDeclaredCell=${flags.sameDeclaredCell}`,
        `C.readerProjectionSame=${flags.readerProjectionSame}`,
        `D.readerProjectionDifferent=${flags.readerProjectionDifferent}`,
        `canonicalDomain=${canonicalProjection.domain}`,
        `canonicalIntent=${canonicalProjection.intent}`,
        `canonicalObjectLabel=${canonicalProjection.objectLabel ?? "null"}`,
        `surfaceDomain=${surfaceProjection.domain}`,
        `surfaceIntent=${surfaceProjection.intent}`,
        `surfaceObjectLabel=${surfaceProjection.objectLabel ?? "null"}`,
        `scenarioTypeCanonical=${canonicalProjection.scenarioType ?? "null"}`,
        `scenarioTypeSurface=${surfaceProjection.scenarioType ?? "null"}`,
        `differingAxes=${differingAxes.join(",") || "none"}`,
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
          leftProjection: canonicalProjection,
          rightProjection: surfaceProjection,
          differingAxes,
          details,
          notCoveredReason:
            "surface 문자열이 canonical과 동일하여 "
            + "문자열 독립 equivalence를 관찰할 수 없음",
        }));
        continue;
      }

      // 같은 declared cell + 다른 surface → projection 동일해야 PASS
      cases.push(buildCase({
        id: `f0-intra-${cell.id}__${paraphrase.idSuffix}`,
        kind: "intra_cell_paraphrase",
        status: projectionSame ? "PASS" : "FAIL",
        cellId: cell.id,
        primaryAxis: cell.primaryAxis,
        canonical: cell.canonicalQuestion,
        surface: paraphrase.question,
        flags,
        leftProjection: canonicalProjection,
        rightProjection: surfaceProjection,
        differingAxes,
        details,
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
  const projections = cells.map((cell) => ({
    cell,
    projection: projectReaderAdapterAxis(
      humanContext,
      cell.canonicalQuestion,
    ),
  }));

  for (let leftIndex = 0; leftIndex < projections.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < projections.length;
      rightIndex += 1
    ) {
      const left = projections[leftIndex];
      const right = projections[rightIndex];

      if (left.cell.primaryAxis === right.cell.primaryAxis) {
        // 동일 declared primaryAxis cell pair는 F0 구분성 oracle 대상이 아님
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
              left.projection,
              right.projection,
            ),
          }),
          leftProjection: left.projection,
          rightProjection: right.projection,
          differingAxes: diffMeaningAxes(left.projection, right.projection),
          details: [
            `leftCellId=${left.cell.id}`,
            `rightCellId=${right.cell.id}`,
            `primaryAxis=${left.cell.primaryAxis}`,
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
        left.projection,
        right.projection,
      );
      const differingAxes = diffMeaningAxes(
        left.projection,
        right.projection,
      );
      const flags = buildFlags({
        surfaceDifferent,
        sameDeclaredCell: false,
        readerProjectionSame: projectionSame,
      });

      const details = [
        `leftCellId=${left.cell.id}`,
        `rightCellId=${right.cell.id}`,
        `leftPrimaryAxis=${left.cell.primaryAxis}`,
        `rightPrimaryAxis=${right.cell.primaryAxis}`,
        `leftCanonical=${left.cell.canonicalQuestion}`,
        `rightCanonical=${right.cell.canonicalQuestion}`,
        `A.surfaceDifferent=${flags.surfaceDifferent}`,
        `B.sameDeclaredCell=${flags.sameDeclaredCell}`,
        `C.readerProjectionSame=${flags.readerProjectionSame}`,
        `D.readerProjectionDifferent=${flags.readerProjectionDifferent}`,
        `leftDomain=${left.projection.domain}`,
        `leftIntent=${left.projection.intent}`,
        `leftObjectLabel=${left.projection.objectLabel ?? "null"}`,
        `rightDomain=${right.projection.domain}`,
        `rightIntent=${right.projection.intent}`,
        `rightObjectLabel=${right.projection.objectLabel ?? "null"}`,
        `leftScenarioType=${left.projection.scenarioType ?? "null"}`,
        `rightScenarioType=${right.projection.scenarioType ?? "null"}`,
        `differingAxes=${differingAxes.join(",") || "none"}`,
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
          leftProjection: left.projection,
          rightProjection: right.projection,
          differingAxes,
          details,
          notCoveredReason:
            "두 cell canonical 표면 문자열이 동일하여 구분성 관찰 전제 미성립",
        }));
        continue;
      }

      // declared primaryAxis가 다르면 projection도 구분되어야 PASS
      cases.push(buildCase({
        id: `f0-inter-${left.cell.id}__vs__${right.cell.id}`,
        kind: "inter_cell_primary_axis",
        status: projectionSame ? "FAIL" : "PASS",
        cellId: left.cell.id,
        otherCellId: right.cell.id,
        primaryAxis: left.cell.primaryAxis,
        otherPrimaryAxis: right.cell.primaryAxis,
        canonical: left.cell.canonicalQuestion,
        surface: right.cell.canonicalQuestion,
        flags,
        leftProjection: left.projection,
        rightProjection: right.projection,
        differingAxes,
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
      }),
      leftProjection: null,
      rightProjection: null,
      differingAxes: [],
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
      }),
      leftProjection: null,
      rightProjection: null,
      differingAxes: [],
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
      }),
      leftProjection: null,
      rightProjection: null,
      differingAxes: [],
      details: [`excludedVariationKind=${variationKind}`],
      notCoveredReason:
        `variationKind=${variationKind}는 F0 범위 밖 `
        + "(canonical + paraphrase만 검증)",
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
  let paraphraseSurfaceCount = 0;

  for (const cell of cells) {
    const canonicalProjection = projectReaderAdapterAxis(
      humanContext,
      cell.canonicalQuestion,
    );
    observedDomains.add(canonicalProjection.domain);
    observedIntents.add(canonicalProjection.intent);

    for (const paraphrase of cell.paraphrases) {
      paraphraseSurfaceCount += 1;
      const surfaceProjection = projectReaderAdapterAxis(
        humanContext,
        paraphrase.question,
      );
      observedDomains.add(surfaceProjection.domain);
      observedIntents.add(surfaceProjection.intent);
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
      differingAxes: item.differingAxes,
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
        differingAxes: item.differingAxes,
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
