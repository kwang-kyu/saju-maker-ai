/**
 * vNext Consulting Scenario 계약.
 *
 * 판단하지 않는다. 어떤 분석을 해야 하는지 결정하는 라우팅 계약이다.
 */

import type {
  HumanStateDomain,
} from "./humanState.js";
import type {
  ChangeSignalType,
} from "./changeSignal.js";
import type {
  QuestionMeaning,
  MissingContextItem,
} from "./questionMeaning.js";
import type {
  TimeGranularity,
} from "./timeState.js";

export type ConsultingScenarioType =
  | "generalFlow"
  | "specificEvent"
  | "actionDecision"
  | "possibilityCheck"
  | "relationshipAssessment"
  | "timingAssessment"
  | "aptitudeRecommendation"
  | "interpretation";

/**
 * vNext Consulting Scenario.
 *
 * Scenario는 requiredDomains / requiredTimeGranularity / requiredSignals로
 * 필요한 엔진만 실행하도록 라우팅한다.
 */
export type ConsultingScenario = {
  type: ConsultingScenarioType;
  questionMeaning: QuestionMeaning;
  requiredDomains: HumanStateDomain[];
  requiredTimeGranularity: TimeGranularity[];
  requiredSignals: ChangeSignalType[];
  missingContext: MissingContextItem[];
};
