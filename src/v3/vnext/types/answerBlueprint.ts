/**
 * vNext Answer Blueprint 계약.
 *
 * GPT Prompt가 아니다. GPT 이전 단계에서 "무엇을 설명할 것인가"만 결정한다.
 */

import type {
  ConsultingScenarioType,
} from "./consultingScenario.js";

export type AnswerMode = "question" | "report";

/** Question Answer에서 선택 가능한 블록 — 정형화 강제 없음 */
export type QuestionAnswerBlock =
  | "directAnswer"
  | "explanation"
  | "evidence"
  | "condition"
  | "risk"
  | "timeDifference"
  | "followUpQuestion";

export type QuestionAnswerBlueprint = {
  mode: "question";
  blocks: QuestionAnswerBlock[];
  emphasis?: string[];
};

/** aptitudeRecommendation 시나리오 설명 블록 */
export type AptitudeRecommendationBlock =
  | "directAnswer"
  | "ability"
  | "suitableRole"
  | "workingEnvironment"
  | "caution"
  | "nextAction";

/** generalFlow 시나리오 설명 블록 */
export type GeneralFlowBlock =
  | "periodOverview"
  | "earlyPeriod"
  | "middlePeriod"
  | "latePeriod"
  | "opportunity"
  | "pressure"
  | "moneyOrDomainEffect"
  | "caution";

/** actionDecision 시나리오 설명 블록 */
export type ActionDecisionBlock =
  | "directAnswer"
  | "currentDirection"
  | "conditions"
  | "risk"
  | "scale"
  | "timing"
  | "nextAction";

/** relationshipAssessment 시나리오 설명 블록 */
export type RelationshipAssessmentBlock =
  | "directAnswer"
  | "connection"
  | "conflict"
  | "compatibilityConditions"
  | "caution";

/** possibilityCheck 시나리오 설명 블록 */
export type PossibilityCheckBlock =
  | "directAnswer"
  | "possibility"
  | "supportingEvidence"
  | "limitingFactors"
  | "conditions"
  | "caution";

/** interpretation 시나리오 설명 블록 */
export type InterpretationBlock =
  | "mainInterpretation"
  | "humanContext"
  | "timeContext"
  | "change"
  | "evidence";

/** timingAssessment / specificEvent 등 공통 타이밍 블록 */
export type TimingAssessmentBlock =
  | "directAnswer"
  | "timing"
  | "opportunity"
  | "pressure"
  | "risk"
  | "conditions"
  | "caution";

export type ScenarioAnswerBlock =
  | AptitudeRecommendationBlock
  | GeneralFlowBlock
  | ActionDecisionBlock
  | RelationshipAssessmentBlock
  | PossibilityCheckBlock
  | InterpretationBlock
  | TimingAssessmentBlock;

/**
 * Scenario별 Question Mode Blueprint.
 * 고정 문장이 아니라 설명 순서와 범위만 결정한다.
 *
 * generalFlow flowTimeStructure는 블록 재조합·promptStrategy
 * answerGoal 정렬용 메타이며 새로운 QuestionReader semantic axis가 아니다.
 */
export type GeneralFlowTimeStructure =
  | "day"
  | "month"
  | "year"
  | "overview";

export type ScenarioAnswerBlueprint = {
  mode: "question";
  scenarioType: ConsultingScenarioType;
  blocks: ScenarioAnswerBlock[];
  emphasis?: string[];
  /** generalFlow only — 선택된 시간 구조 */
  flowTimeStructure?: GeneralFlowTimeStructure;
};

/** Report Answer에서 선택 가능한 섹션 */
export type ReportAnswerSection =
  | "humanState"
  | "timeState"
  | "changeSignals"
  | "assessment"
  | "conclusion";

export type ReportAnswerBlueprint = {
  mode: "report";
  scenarioType: ConsultingScenarioType;
  sections: ReportAnswerSection[];
  emphasis?: string[];
};

export type AnswerBlueprint =
  | QuestionAnswerBlueprint
  | ScenarioAnswerBlueprint
  | ReportAnswerBlueprint;
