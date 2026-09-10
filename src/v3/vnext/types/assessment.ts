/**
 * vNext Assessment 계약.
 *
 * Decision Engine 결과를 향후 AssessmentAdapter가 이 타입으로 변환한다.
 * DecisionVerdict를 직접 import하거나 수정하지 않는다.
 */

import type {
  VNextEvidence,
} from "./humanState.js";
import type {
  TimeGranularity,
} from "./timeState.js";

export type AssessmentConfidence = "high" | "medium" | "low";

/** 가능성 수준 — DecisionVerdict와 독립적인 vNext 계약 */
export type AssessmentPossibility =
  | "favorable"
  | "conditionallyFavorable"
  | "neutral"
  | "unfavorable"
  | "insufficient";

/** 방향성 판단 — 실행·대기·회피 등 */
export type AssessmentDirection =
  | "proceed"
  | "wait"
  | "avoid"
  | "prepare"
  | "observe"
  | "mixed"
  | "unknown";

export type AssessmentCondition = {
  key: string;
  description: string;
  required: boolean;
  satisfied: boolean;
};

export type AssessmentRisk = {
  key: string;
  description: string;
  severity: "high" | "medium" | "low";
};

/** 변화 강도 */
export type ChangeIntensity = {
  level: "low" | "moderate" | "high";
  summary: string;
  evidence: VNextEvidence;
};

/** 시간대별 차이 */
export type TimeDifference = {
  label: string;
  granularity: TimeGranularity;
  summary: string;
  relativeTo: "current" | "target" | "comparison";
  evidence: VNextEvidence;
};

/**
 * vNext Assessment.
 *
 * possibility / direction / conditions / risks / changeIntensity /
 * timeDifferences / evidence / confidence를 표현한다.
 *
 * recommendedDirection / prohibitedDirection은 DecisionResult 원문 보존용이다.
 * direction(taxonomy)과 별개이며, 재해석하지 않는다.
 */
export type Assessment = {
  possibility: AssessmentPossibility;
  direction: AssessmentDirection;
  /**
   * DecisionResult.recommendedDirection 원문.
   * direction taxonomy projection과 별개로 보존한다.
   */
  recommendedDirection?: string;
  /**
   * DecisionResult.prohibitedDirection 원문.
   * direction taxonomy projection과 별개로 보존한다.
   */
  prohibitedDirection?: string;
  conditions: AssessmentCondition[];
  risks: AssessmentRisk[];
  changeIntensity: ChangeIntensity;
  timeDifferences: TimeDifference[];
  evidence: VNextEvidence;
  confidence: AssessmentConfidence;
};
