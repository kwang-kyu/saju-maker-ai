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
