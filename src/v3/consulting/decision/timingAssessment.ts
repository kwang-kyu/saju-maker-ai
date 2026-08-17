import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext";
import type {
  SajuFacts,
} from "../../types/sajuFacts";
import type {
  SajuTargetPeriodLuckFlowFact,
} from "../../types/luckFlowFact";
import type {
  QuestionContext,
} from "../question/questionContext";
import type {
  QuestionTimingType,
} from "../question/questionReader";
import type {
  LifeFlowTarget,
} from "../question/lifeFlowTarget";
import {
  assessLifeFlowInterpretation,
} from "./lifeFlowInterpretationAssessment";

export type TimingEvidenceLevel =
  | "notRequired"
  | "missing"
  | "available";

export type TimingAssessmentScope =
  | "none"
  | "timingEvaluation";

export type TimingFlowDirection =
  | "notAssessed"
  | "supportive"
  | "tension"
  | "mixed"
  | "indeterminate";

export type TimingAssessmentInput = {
  questionContext:
    QuestionContext;

  humanContext:
    HumanDestinyContext;

  selfSajuFacts:
    SajuFacts | null;

  lifeFlowTarget?:
    LifeFlowTarget;

  targetPeriodLuckFlow?:
    SajuTargetPeriodLuckFlowFact;
};

export type TimingAssessment = {
  analysisRequired:
    boolean;

  timingType:
    QuestionTimingType;

  evidenceLevel:
    TimingEvidenceLevel;

  assessmentScope:
    TimingAssessmentScope;

  targetScope:
    LifeFlowTarget["scope"] | null;

  targetStartDate:
    string | null;

  targetEndDate:
    string | null;

  targetYear:
    number | null;

  targetMonth:
    number | null;

  targetDay:
    number | null;

  hasCurrentDaeun:
    boolean;

  hasTargetSeun:
    boolean;

  hasYearSegments:
    boolean;

  hasWolun:
    boolean;

  hasIlun:
    boolean;

  flowInterpretationAvailable:
    boolean;

  flowDirection:
    TimingFlowDirection;

  overallTheme:
    string | null;

  supportiveSignals:
    string[];

  tensionSignals:
    string[];

  cautions:
    string[];

  limitations:
    string[];

  evidenceKeys:
    string[];

  evidenceComplete:
    boolean;
};

function resolveTimingFlowDirection(
  supportiveSignals:
    readonly string[],
  tensionSignals:
    readonly string[],
): TimingFlowDirection {
  const hasSupportive =
    supportiveSignals.length > 0;

  const hasTension =
    tensionSignals.length > 0;

  if (
    hasSupportive
    && hasTension
  ) {
    return "mixed";
  }

  if (hasSupportive) {
    return "supportive";
  }

  if (hasTension) {
    return "tension";
  }

  return "indeterminate";
}

export function assessTiming(
  input:
    TimingAssessmentInput,
): TimingAssessment {
  const {
    questionContext,
    humanContext,
    selfSajuFacts,
    lifeFlowTarget,
    targetPeriodLuckFlow,
  } = input;

  const analysisRequired =
    questionContext
      .requirements
      .timingAnalysisRequired;

  const targetStartDate =
    lifeFlowTarget
      ?.startDate
    ?? targetPeriodLuckFlow
      ?.targetStartDate
    ?? null;

  const targetEndDate =
    lifeFlowTarget
      ?.endDate
    ?? targetPeriodLuckFlow
      ?.targetEndDate
    ?? null;

  if (!analysisRequired) {
    return {
      analysisRequired:
        false,

      timingType:
        questionContext.timingType,

      evidenceLevel:
        "notRequired",

      assessmentScope:
        "none",

      targetScope:
        lifeFlowTarget?.scope
        ?? null,

      targetStartDate,

      targetEndDate,

      targetYear:
        lifeFlowTarget?.targetYear
        ?? null,

      targetMonth:
        lifeFlowTarget?.targetMonth
        ?? null,

      targetDay:
        lifeFlowTarget?.targetDay
        ?? null,

      hasCurrentDaeun:
        false,

      hasTargetSeun:
        false,

      hasYearSegments:
        false,

      hasWolun:
        false,

      hasIlun:
        false,

      flowInterpretationAvailable:
        false,

      flowDirection:
        "notAssessed",

      overallTheme:
        null,

      supportiveSignals:
        [],

      tensionSignals:
        [],

      cautions:
        [],

      limitations:
        [],

      evidenceKeys:
        [],

      evidenceComplete:
        true,
    };
  }

  const hasTargetPeriodLuckFlow =
    targetPeriodLuckFlow
    !== undefined;

  const hasTargetSeun =
    targetPeriodLuckFlow
      ?.targetSeun
    !== undefined;

  const hasYearSegments =
    (
      targetPeriodLuckFlow
        ?.yearSegments.length
      ?? 0
    ) > 0;

  const hasWolun =
    (
      targetPeriodLuckFlow
        ?.wolunSegments.length
      ?? 0
    ) > 0;

  const hasIlun =
    targetPeriodLuckFlow
      ?.targetIlun
    != null;

  const flowInterpretation =
    assessLifeFlowInterpretation({
      humanContext,

      selfSajuFacts,

      target:
        lifeFlowTarget
        ?? null,

      targetPeriodLuckFlow:
        targetPeriodLuckFlow
        ?? null,
    });

  const flowDirection =
    flowInterpretation.available
      ? resolveTimingFlowDirection(
          flowInterpretation
            .supportiveSignals,
          flowInterpretation
            .tensionSignals,
        )
      : "indeterminate";

  const evidenceComplete =
    hasTargetPeriodLuckFlow
    && hasTargetSeun
    && targetStartDate
      !== null
    && targetEndDate
      !== null
    && flowInterpretation
      .available;

  return {
    analysisRequired:
      true,

    timingType:
      questionContext.timingType,

    evidenceLevel:
      evidenceComplete
        ? "available"
        : "missing",

    assessmentScope:
      "timingEvaluation",

    targetScope:
      lifeFlowTarget?.scope
      ?? null,

    targetStartDate,

    targetEndDate,

    targetYear:
      lifeFlowTarget?.targetYear
      ?? null,

    targetMonth:
      lifeFlowTarget?.targetMonth
      ?? null,

    targetDay:
      lifeFlowTarget?.targetDay
      ?? null,

    hasCurrentDaeun:
      targetPeriodLuckFlow
        ?.currentDaeun
      != null,

    hasTargetSeun,

    hasYearSegments,

    hasWolun,

    hasIlun,

    flowInterpretationAvailable:
      flowInterpretation.available,

    flowDirection,

    overallTheme:
      flowInterpretation.available
        ? flowInterpretation
            .overallTheme
        : null,

    supportiveSignals:
      [
        ...flowInterpretation
          .supportiveSignals,
      ],

    tensionSignals:
      [
        ...flowInterpretation
          .tensionSignals,
      ],

    cautions:
      [
        ...flowInterpretation
          .cautions,
      ],

    limitations:
      [
        ...flowInterpretation
          .limitations,
      ],

    evidenceKeys:
      [
        ...flowInterpretation
          .evidenceKeys,
      ],

    evidenceComplete,
  };
}