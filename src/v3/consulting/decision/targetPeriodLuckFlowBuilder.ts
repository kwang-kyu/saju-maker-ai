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

export type TargetPeriodLuckFlowBuildInput = {
  sajuFacts:
    SajuFactsPipelineResult;

  normalizedQuestion:
    string;
};

export type TargetPeriodLuckFlowBuildResult = {
  target:
    LifeFlowTarget;

  fact:
    SajuTargetPeriodLuckFlowFact | null;
};

export function buildTargetPeriodLuckFlowForQuestion(
  input:
    TargetPeriodLuckFlowBuildInput,
): TargetPeriodLuckFlowBuildResult | null {
  if (
    !isLifeFlowInterpretationQuestion(
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
    resolveLifeFlowTarget(
      input.normalizedQuestion,
      referenceDate,
    );

  if (
    target.ambiguity
      ?.needsClarification
  ) {
    return {
      target,
      fact: null,
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
