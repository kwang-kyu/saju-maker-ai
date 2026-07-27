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
   * 구조화된 상담 실행이 기존 단일 상담 경로와
   * 동일한 최종 Prompt를 만들면서,
   * 세션에 필요한 중간 판단 결과를 보존하는지 검증한다.
   */
  export function verifyConsultingTurnRunner():
    ConsultingTurnRunnerVerificationResult {
    const regressionInput =
      buildDecisionEngineRegressionInput();
  
    const consultingInput = {
      humanContext:
        regressionInput.humanContext,
  
      lifeContext:
        regressionInput.lifeContext,
  
      question:
        regressionInput.question
          .decisionQuestion,
    };
  
    const turnResult =
      runConsultingTurn(
        consultingInput,
      );
  
    const legacyPrompt =
      runConsulting(
        consultingInput,
      );
  
    const checks = {
      questionReaderResultIsPreserved:
        turnResult
          .questionReaderResult
          .decisionQuestion
        === consultingInput.question,
  
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
  
      explanationPlanIsPreserved:
        Object.keys(
          turnResult.explanationPlan,
        ).length > 0,
  
      explanationPayloadIsPreserved:
        Object.keys(
          turnResult.explanationPayload,
        ).length > 0,
  
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
        Object.values(checks)
          .every(Boolean),
    };
  }