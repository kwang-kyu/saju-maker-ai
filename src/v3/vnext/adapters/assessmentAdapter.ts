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
  | "lifeFlowInterpretationAssessment"
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

function buildLifeFlowTimeDifferences(
  lifeFlow: NonNullable<
    AssessmentAdapterInput["lifeFlowInterpretationAssessment"]
  >,
): Assessment["timeDifferences"] {
  // overallTheme + periodSegments(periodLabel/theme)만 전달한다.
  // key / ganZhi / tenGod / element / signalContributions는 TimeDifference에 넣지 않는다.
  const differences: Assessment["timeDifferences"] = [
    {
      label: "target period",
      granularity: "period",
      summary: lifeFlow.overallTheme || "life flow assessment available",
      relativeTo: "target",
      evidence: emptyVNextEvidence(),
    },
  ];

  for (const segment of lifeFlow.periodSegments) {
    differences.push({
      label: segment.periodLabel,
      granularity: "period",
      summary: segment.theme,
      relativeTo: "target",
      evidence: emptyVNextEvidence(),
    });
  }

  return differences;
}

function buildTimeDifferences(
  input: AssessmentAdapterInput,
): Assessment["timeDifferences"] {
  const timing = input.timingAssessment;

  // timingAssessment가 있으면 기존 경로만 사용한다.
  // lifeFlowInterpretationAssessment와 합치지 않는다.
  if (timing) {
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

  const lifeFlow = input.lifeFlowInterpretationAssessment;
  if (lifeFlow) {
    return buildLifeFlowTimeDifferences(lifeFlow);
  }

  return [];
}

/**
 * DecisionResult 방향 원문을 그대로 보존한다.
 * 비어 있으면 필드를 생략한다. 요약·재해석하지 않는다.
 */
function readDirectionOriginal(
  value: string,
): string | undefined {
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }

  return value;
}

/**
 * 기존 DecisionResult를 vNext Assessment로 읽기 전용 변환한다.
 */
export function adaptAssessment(
  input: AssessmentAdapterInput,
): Assessment {
  const recommendedDirection = readDirectionOriginal(
    input.recommendedDirection,
  );
  const prohibitedDirection = readDirectionOriginal(
    input.prohibitedDirection,
  );

  return {
    possibility: VERDICT_TO_POSSIBILITY[input.verdict],
    direction: mapDirection(
      input.actionReadiness,
      input.recommendedDirection,
    ),
    ...(recommendedDirection !== undefined
      ? { recommendedDirection }
      : {}),
    ...(prohibitedDirection !== undefined
      ? { prohibitedDirection }
      : {}),
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
