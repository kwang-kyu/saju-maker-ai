import type {
  DecisionResult,
} from "../../consulting/decision/decisionTypes.js";
import {
  resolveDecisionExplanationFocus,
} from "../../consulting/explanation/decisionExplanationFocus.js";
import {
  readDecisionResult,
} from "../../consulting/explanation/decisionResultReader.js";
import {
  selectQuestionSpecificMaterials,
  type QuestionSpecificMaterialSelection,
} from "../../consulting/explanation/questionSpecificMaterialSelector.js";
import type {
  QuestionContext,
} from "../../consulting/question/questionContext.js";

export type {
  QuestionSpecificMaterialSelection,
} from "../../consulting/explanation/questionSpecificMaterialSelector.js";

export type QuestionSpecificMaterialAdapterInput = {
  decisionResult: DecisionResult;
  originalQuestion: string;
  questionContext?: QuestionContext;
};

/**
 * P4-1 relevance gate를 통과한 DecisionResult material을
 * Question-Specific Material tier로 읽기 전용 변환한다.
 *
 * relevance를 다시 판단하거나 material을 새로 생성하지 않는다.
 */
export function adaptQuestionSpecificMaterials(
  input: QuestionSpecificMaterialAdapterInput,
): QuestionSpecificMaterialSelection {
  const explanationInput = readDecisionResult(
    input.decisionResult,
  );

  const focus = resolveDecisionExplanationFocus({
    intent: explanationInput.intent,
    decisionTarget: explanationInput.decisionTarget,
    topic: explanationInput.topic,
    originalQuestion: input.originalQuestion,
    questionContext: input.questionContext,
  });

  return selectQuestionSpecificMaterials({
    evidence: explanationInput.evidence,
    conditions: explanationInput.conditions,
    risks: explanationInput.risks,
    focus,
    intent: explanationInput.intent,
    topic: explanationInput.topic,
    decisionTarget: explanationInput.decisionTarget,
    actionReadiness: explanationInput.actionReadiness,
    questionContext: input.questionContext,
    originalQuestion: input.originalQuestion,
  });
}
