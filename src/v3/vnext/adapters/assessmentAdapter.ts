import type {
  ActionReadiness,
  DecisionConfidence,
  DecisionResult,
  DecisionVerdict,
} from "../../consulting/decision/decisionTypes.js";
import type {
  Assessment,
  AssessmentConfidence,
  AssessmentDirection,
  AssessmentPossibility,
  ChangeIntensity,
} from "../types/assessment.js";
import type {
  TimeGranularity,
} from "../types/timeState.js";
import {
  emptyVNextEvidence,
  toVNextEvidenceFromStrings,
} from "./adapterEvidence.js";

export type AssessmentAdapterInput = Pick<
  DecisionResult,
  | "verdict"
  | "confidence"
  | "actionReadiness"
  | "conditions"
  | "risks"
  | "evidence"
  | "recommendedDirection"
  | "prohibitedDirection"
  | "coreDecision"
  | "decisionReason"
  | "timingAssessment"
>;

const VERDICT_TO_POSSIBILITY: Record<
  DecisionVerdict,
  AssessmentPossibility
> = {
  recommended: "favorable",
  conditionallyRecommended: "conditionallyFavorable",
  wait: "neutral",
  notRecommended: "unfavorable",
  insufficientEvidence: "insufficient",
  interpreted: "neutral",
};

function mapConfidence(
  confidence: DecisionConfidence,
): AssessmentConfidence {
  return confidence;
}

function mapDirection(
  actionReadiness: ActionReadiness,
  recommendedDirection: string,
): AssessmentDirection {
  switch (actionReadiness) {
    case "ready":
      return "proceed";
    case "readyWithConditions":
      return "prepare";
    case "preparationRequired":
      return "prepare";
    case "delayRequired":
      return "wait";
    case "stopRequired":
      return "avoid";
    case "unknown":
      if (/관망|대기|기다/.test(recommendedDirection)) {
        return "wait";
      }

      if (/진행|실행|시작/.test(recommendedDirection)) {
        return "proceed";
      }

      return "unknown";
    default:
      return "unknown";
  }
}

function buildChangeIntensity(
  input: AssessmentAdapterInput,
): ChangeIntensity {
  const timingSummary =
    input.timingAssessment?.overallTheme
    ?? input.decisionReason;

  return {
    level: "moderate",
    summary: timingSummary || input.coreDecision,
    evidence: emptyVNextEvidence(),
  };
}

function resolveTimingGranularity(
  timing: NonNullable<AssessmentAdapterInput["timingAssessment"]>,
): TimeGranularity {
  if (timing.targetMonth !== null) {
    return "month";
  }

  if (timing.targetYear !== null) {
    return "year";
  }

  if (timing.targetDay !== null) {
    return "day";
  }

  return "period";
}

function buildTimingLabel(
  timing: NonNullable<AssessmentAdapterInput["timingAssessment"]>,
): string {
  if (timing.targetMonth !== null && timing.targetYear !== null) {
    return `${timing.targetYear}-${String(timing.targetMonth).padStart(2, "0")}`;
  }

  if (timing.targetYear !== null) {
    return `${timing.targetYear}년`;
  }

  if (timing.targetStartDate && timing.targetEndDate) {
    return `${timing.targetStartDate} ~ ${timing.targetEndDate}`;
  }

  return "target period";
}

function buildTimeDifferences(
  input: AssessmentAdapterInput,
): Assessment["timeDifferences"] {
  const timing = input.timingAssessment;

  if (!timing) {
    return [];
  }

  const granularity = resolveTimingGranularity(timing);
  const hasPeriodSegments = timing.periodSegments.length > 0;

  // 월 전체 판단(overallTheme)은 항상 별도 entry로 보존한다.
  // periodSegments가 있으면 overall evidence(supportive/tension/cautions/
  // limitations)를 같은 peer에 붙이지 않아, 날짜 있는 구간 theme과 섞이지 않게 한다.
  // periodSegments가 없을 때만 overall evidence를 월 전체 entry에 실는다.
  const overallEvidence = hasPeriodSegments
    ? emptyVNextEvidence()
    : toVNextEvidenceFromStrings(
      [
        ...timing.supportiveSignals,
        ...timing.tensionSignals,
        ...timing.cautions,
        ...timing.limitations,
      ],
      "decision.timingAssessment",
    );

  const differences: Assessment["timeDifferences"] = [
    {
      label: buildTimingLabel(timing),
      granularity,
      summary: timing.overallTheme || "timing assessment available",
      relativeTo: "target",
      evidence: overallEvidence,
    },
  ];

  // 구간별 판단은 periodLabel + theme만 전달한다.
  // overall evidence를 복사·재배치하거나 theme과 합치지 않는다.
  for (const segment of timing.periodSegments) {
    differences.push({
      label: segment.periodLabel,
      granularity,
      summary: segment.theme,
      relativeTo: "target",
      evidence: emptyVNextEvidence(),
    });
  }

  return differences;
}

/**
 * 기존 DecisionResult를 vNext Assessment로 읽기 전용 변환한다.
 */
export function adaptAssessment(
  input: AssessmentAdapterInput,
): Assessment {
  return {
    possibility: VERDICT_TO_POSSIBILITY[input.verdict],
    direction: mapDirection(
      input.actionReadiness,
      input.recommendedDirection,
    ),
    conditions: input.conditions.map((condition) => ({
      key: condition.key,
      description: condition.description,
      required: condition.required,
      satisfied: condition.satisfied,
    })),
    risks: input.risks.map((risk) => ({
      key: risk.key,
      description: risk.description,
      severity: risk.severity,
    })),
    changeIntensity: buildChangeIntensity(input),
    timeDifferences: buildTimeDifferences(input),
    evidence: {
      items: input.evidence.map((item) => ({
        key: item.key,
        description: item.description,
        sourceKey: item.source,
        weight: item.weight,
      })),
      summary: input.coreDecision,
    },
    confidence: mapConfidence(input.confidence),
  };
}
