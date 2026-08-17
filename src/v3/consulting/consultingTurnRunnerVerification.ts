import {
  buildDecisionEngineRegressionInput,
} from "./decision/regression/decisionEngineRegressionFixture";

import {
  runConsulting,
  runConsultingTurn,
  type ConsultingTurnRunResult,
} from "./consultingRunner";

export type ConsultingTurnRunnerVerificationResult = {
  turnResult:
    ConsultingTurnRunResult;

  checks: Record<
    string,
    boolean
  >;

  passed:
    boolean;
};

/**
 * 구조화된 상담 실행이 실제 원문 질문을 보존하면서
 * Decision → Explanation → Payload → Prompt 경로까지
 * 동일한 질문과 직접 결론을 전달하는지 검증한다.
 *
 * 기존 runConsulting() 단일 호출 경로와
 * runConsultingTurn() 구조화 경로의 최종 Prompt도
 * 동일해야 한다.
 */
export function verifyConsultingTurnRunner():
  ConsultingTurnRunnerVerificationResult {
  const regressionInput =
    buildDecisionEngineRegressionInput();

  const originalQuestion =
    regressionInput
      .question
      .originalQuestion;

  const consultingInput = {
    humanContext:
      regressionInput.humanContext,

    lifeContext:
      regressionInput.lifeContext,

    question:
      originalQuestion,
  };

  const turnResult =
    runConsultingTurn(
      consultingInput,
    );

  const legacyPrompt =
    runConsulting(
      consultingInput,
    );

  const directAnswerBlock =
    turnResult
      .explanationPlan
      .blocks
      .find(
        (block) =>
          block.step
          === "directAnswer",
      );

  const payloadDirectAnswer =
    turnResult
      .explanationPayload
      .explanationOrder
      .find(
        (item) =>
          item.title
          === "질문에 대한 결론",
      );

  const expectedCoreDecision =
    "지금 시작하는 방향 자체는 가능하지만, 질문한 결과로 이어지려면 필요한 조건과 변수의 영향을 함께 봐야 한다.";

  const checks = {
    originalQuestionIsPreserved:
      turnResult
        .questionReaderResult
        .originalQuestion
      === originalQuestion,

    normalizedDecisionQuestionIsPreserved:
      turnResult
        .questionReaderResult
        .decisionQuestion
      === regressionInput
        .question
        .decisionQuestion,

    questionIntentIsPreserved:
      turnResult
        .questionReaderResult
        .intent
      === regressionInput
        .question
        .intent,

    decisionTargetIsPreserved:
      turnResult
        .questionReaderResult
        .decisionTarget
      === regressionInput
        .question
        .decisionTarget,

    questionContextIsPreserved:
      Object.keys(
        turnResult.questionContext,
      ).length > 0,

    decisionResultIsPreserved:
      turnResult
        .decisionResult
        .finalDecisionSentence
        .trim()
        .length > 0,

    contextualCoreDecisionReachedDecisionResult:
      turnResult
        .decisionResult
        .coreDecision
      === expectedCoreDecision,

    decisionUsesHumanContext:
      turnResult
        .decisionResult
        .humanContextUsed
      === true,

    decisionUsesQuestionContext:
      turnResult
        .decisionResult
        .questionContextUsed
      === true,

    decisionEvidenceIsNotEmpty:
      turnResult
        .decisionResult
        .evidence
        .length > 0,

    explanationIsPreserved:
      Object.keys(
        turnResult.explanation,
      ).length > 0,

    explanationDirectAnswerMatchesDecision:
      turnResult
        .explanation
        .directAnswer
      === turnResult
        .decisionResult
        .coreDecision,

    explanationPlanIsPreserved:
      Object.keys(
        turnResult.explanationPlan,
      ).length > 0,

    explanationPlanPreservesDirectAnswer:
      directAnswerBlock
        ?.content
      === expectedCoreDecision,

    explanationPayloadIsPreserved:
      Object.keys(
        turnResult.explanationPayload,
      ).length > 0,

    explanationPayloadPreservesDirectAnswer:
      payloadDirectAnswer
        ?.content
      === expectedCoreDecision,

    promptIsPreserved:
      turnResult
        .prompt
        .systemPrompt
        .trim()
        .length > 0
      && turnResult
        .prompt
        .userPrompt
        .trim()
        .length > 0,

    promptIncludesOriginalQuestion:
      turnResult
        .prompt
        .userPrompt
        .includes(
          originalQuestion,
        ),

    promptIncludesContextualCoreDecision:
      turnResult
        .prompt
        .userPrompt
        .includes(
          expectedCoreDecision,
        ),

    legacySystemPromptIsUnchanged:
      legacyPrompt.systemPrompt
      === turnResult.prompt.systemPrompt,

    legacyUserPromptIsUnchanged:
      legacyPrompt.userPrompt
      === turnResult.prompt.userPrompt,
  };

  return {
    turnResult,

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}
