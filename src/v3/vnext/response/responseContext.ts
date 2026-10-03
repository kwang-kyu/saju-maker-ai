/**
 * vNext Response Context 계약.
 *
 * GPT 입력 직전의 최소 상담 데이터. AnalysisResult 전체를 전달하지 않는다.
 */

import type {
  AnswerBlueprint,
  AnswerMode,
} from "../types/answerBlueprint.js";
import type {
  ChangeSignal,
} from "../types/changeSignal.js";
import type {
  ConsultingScenarioType,
} from "../types/consultingScenario.js";
import type {
  VNextEvidenceItem,
} from "../types/humanState.js";
import type {
  MissingContextItem,
  QuestionActionNature,
  QuestionAskedObject,
  QuestionMeaningAnalysisMode,
  QuestionMeaningConclusionNature,
  QuestionMeaningIntent,
  QuestionTimeFocus,
} from "../types/questionMeaning.js";
import type {
  QuestionSpecificMaterialSelection,
} from "../adapters/questionSpecificMaterialAdapter.js";

/** Blueprint block 또는 Report section 단위 컨텍스트 */
export type ResponseBlockContext = {
  id: string;
  relevantFacts: Record<string, string | number | boolean | null>[];
  relevantSignals: ChangeSignal[];
  relevantEvidence: VNextEvidenceItem[];
  emphasis: string[];
};

/**
 * Prompt용 QuestionMeaning 의미축 최소 passthrough.
 *
 * QuestionMeaning 전체 dump가 아니다.
 * objectIdentity / instanceToken / object / counterpart 등은 포함하지 않는다.
 * Reader/Adapter가 확정한 필드명을 그대로 쓰며 재해석하지 않는다.
 *
 * 실제 QuestionMeaning 필드 대응:
 * - askedObject ← QuestionMeaning.askedObject (Reader topic)
 * - intent ← QuestionMeaning.intent
 * - actionNature ← QuestionMeaning.actionNature (Reader decisionTarget)
 * - conclusionNature ← QuestionMeaning.conclusionNature
 * - analysisMode ← QuestionMeaning.analysisMode
 * - timingType ← QuestionMeaning.time.timingType
 */
export type ResponseQuestionMeaningAxes = {
  askedObject: QuestionAskedObject;
  intent: QuestionMeaningIntent;
  actionNature: QuestionActionNature;
  conclusionNature: QuestionMeaningConclusionNature;
  analysisMode: QuestionMeaningAnalysisMode;
  timingType: QuestionTimeFocus["timingType"];
  /**
   * P6-C: QuestionMeaning.prioritySurface passthrough.
   * 표현 지시용이며 Response가 재판단하지 않는다.
   */
  prioritySurface?: boolean;
};

/**
 * vNext Response Context.
 *
 * Blueprint가 요구하는 블록에 필요한 데이터만 포함한다.
 */
export type ResponseContext = {
  originalQuestion: string;
  answerMode: AnswerMode;
  scenario: ConsultingScenarioType;
  blueprint: AnswerBlueprint;
  blocks: ResponseBlockContext[];
  /**
   * DecisionResult.coreDecision 원문.
   * Assessment.evidence.summary에서 그대로 전달하며 재해석하지 않는다.
   */
  lockedDecisionStatement?: string;
  /**
   * DecisionResult.recommendedDirection 원문.
   * Assessment.recommendedDirection에서 그대로 전달하며 재해석하지 않는다.
   */
  recommendedDirection?: string;
  /**
   * DecisionResult.prohibitedDirection 원문.
   * Assessment.prohibitedDirection에서 그대로 전달하며 재해석하지 않는다.
   */
  prohibitedDirection?: string;
  /**
   * lockedDecisionStatement가 non-empty일 때만 true.
   * recommendedDirection / prohibitedDirection 단독 존재로는 잠기지 않는다.
   */
  engineDecisionLocked?: boolean;
  /**
   * QuestionMeaning 의미축 읽기 전용 passthrough.
   * Builder가 채우기 전까지는 없을 수 있다. 재해석·판단하지 않는다.
   */
  questionMeaningAxes?: ResponseQuestionMeaningAxes;
  questionSpecificMaterials?: QuestionSpecificMaterialSelection;
  missingContext?: MissingContextItem[];
};

export type ResponseActionType =
  | "clarification"
  | "direct"
  | "consulting";

export type ResponseAction = {
  type: ResponseActionType;
  reason: string;
  context: ResponseContext | null;
};

export type ResponsePipelineResult = {
  action: ResponseAction;
  context: ResponseContext | null;
};
