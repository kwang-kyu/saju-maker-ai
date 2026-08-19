import {
  buildV3TargetPeriodLuckFlow,
  assertV3LuckFlowGender,
} from "../../builders/luckFlowCalculationBuilder";
import {
  buildSajuTargetPeriodLuckFlowFact,
} from "../../builders/luckFlowFactBuilder";
import type {
  SajuFactsPipelineResult,
} from "../../builders/sajuFactsPipelineBuilder";
import type {
  SajuTargetPeriodLuckFlowFact,
} from "../../types/luckFlowFact";
import {
  isLifeFlowInterpretationQuestion,
} from "../question/lifeFlowInterpretationQuestionDetector";
import {
  resolveLifeFlowTarget,
} from "../question/lifeFlowTargetResolver";
import type {
  LifeFlowTarget,
} from "../question/lifeFlowTarget";

export type TargetPeriodLuckFlowBuildPurpose =
  | "lifeFlowInterpretation"
  | "decisionTiming";

export type TargetPeriodLuckFlowBuildInput = {
  sajuFacts:
    SajuFactsPipelineResult;

  normalizedQuestion:
    string;

  purpose?:
    TargetPeriodLuckFlowBuildPurpose;

  timingSearchRequired?:
    boolean;
};

export type TargetPeriodLuckFlowBuildResult = {
  target:
    LifeFlowTarget;

  fact:
    SajuTargetPeriodLuckFlowFact | null;
};

function buildDecisionTimingFallbackTarget(
  referenceDate:
    string,
): LifeFlowTarget {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      referenceDate,
    );

  if (!match) {
    throw new Error(
      "Decision timing referenceDate must use YYYY-MM-DD format.",
    );
  }

  const year =
    Number(
      match[1],
    );

  if (
    !Number.isInteger(
      year,
    )
  ) {
    throw new Error(
      "Decision timing reference year could not be resolved.",
    );
  }

  return {
    scope:
      "year",

    referenceDate,

    targetYear:
      year,

    targetMonth:
      null,

    targetDay:
      null,

    half:
      null,

    startDate:
      `${year}-01-01`,

    endDate:
      `${year}-12-31`,

    yearExplicit:
      false,

    evidence: [
      `referenceDate ${referenceDate}를 기준으로 결정 시기를 해석했다.`,
      "질문에 명시적인 연·월·일 기간은 없지만 시기 판단이 필요한 결정 질문이므로 referenceDate가 속한 연도를 기본 판단기간으로 적용했다.",
    ],

    limitations: [
      "질문에 판단 연도가 명시되지 않아 referenceDate가 속한 연도를 기본 시기 분석 범위로 사용했다.",
    ],
  };
}

function resolveTargetForPurpose(
  normalizedQuestion:
    string,
  referenceDate:
    string,
  purpose:
    TargetPeriodLuckFlowBuildPurpose,
): LifeFlowTarget {
  try {
    return resolveLifeFlowTarget(
      normalizedQuestion,
      referenceDate,
    );
  } catch (error) {
    if (
      purpose
        !== "decisionTiming"
      || !(
        error
        instanceof Error
      )
      || error.message
        !== "Life flow target scope could not be resolved."
    ) {
      throw error;
    }

    return buildDecisionTimingFallbackTarget(
      referenceDate,
    );
  }
}

export function buildTargetPeriodLuckFlowForQuestion(
  input:
    TargetPeriodLuckFlowBuildInput,
): TargetPeriodLuckFlowBuildResult | null {
  const purpose =
    input.purpose
    ?? "lifeFlowInterpretation";

  if (
    purpose
      === "lifeFlowInterpretation"
    && !isLifeFlowInterpretationQuestion(
      input.normalizedQuestion,
    )
  ) {
    return null;
  }

  const referenceDate =
    input
      .sajuFacts
      .luckFlowFact
      .referenceDate;

  const target =
    resolveTargetForPurpose(
      input.normalizedQuestion,
      referenceDate,
      purpose,
    );

  if (
    target.ambiguity
      ?.needsClarification
  ) {
    return {
      target,
      fact:
        null,
    };
  }

  const calculatedSaju =
    input
      .sajuFacts
      .calculatedSaju;

  const gender =
    assertV3LuckFlowGender(
      calculatedSaju.gender,
    );

  const calculation =
    buildV3TargetPeriodLuckFlow({
      solarBirthDate:
        calculatedSaju.solarDateIso,

      birthTime:
        calculatedSaju.birthTime,

      gender,

      luckStartMethod:
        input
          .sajuFacts
          .luckFlowFact
          .luckStartMethod,

      targetStartDate:
        target.startDate,

      targetEndDate:
        target.endDate,

      scope:
        target.scope,

      targetYear:
        target.targetYear,

      targetMonth:
        target.targetMonth,

      targetDay:
        target.targetDay,

        includeWolunSegments:
        input.timingSearchRequired
        === true,
    });

  const mergedTarget:
    LifeFlowTarget = {
      ...target,

      limitations: [
        ...target.limitations,
        ...calculation.limitations,
      ],
    };

  const fact =
    buildSajuTargetPeriodLuckFlowFact({
      dayMaster:
        calculatedSaju.dayMaster,

      calculation,
    });

  return {
    target:
      mergedTarget,

    fact,
  };
}
