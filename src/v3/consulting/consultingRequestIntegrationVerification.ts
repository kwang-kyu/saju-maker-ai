import {
    buildDecisionEngineRegressionInput,
  } from "./decision/regression/decisionEngineRegressionFixture";
  import {
    buildConsultingOpenAIRequest,
    type ConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter";
  import {
    runConsulting,
  } from "./consultingRunner";
  import type {
    ConsultingPrompt,
  } from "./explanation/consultingPromptBuilder";
  
  export type ConsultingRequestIntegrationVerificationResult = {
    prompt:
      ConsultingPrompt;
  
    request:
      ConsultingOpenAIRequest;
  
    checks: Record<
      string,
      boolean
    >;
  
    passed: boolean;
  };
  
  function countOccurrences(
    value: string,
    target: string,
  ): number {
    return value
      .split(target)
      .length - 1;
  }
  
  export function verifyConsultingRequestIntegration():
    ConsultingRequestIntegrationVerificationResult {
    const regressionInput =
      buildDecisionEngineRegressionInput();
  
    const prompt =
      runConsulting({
        humanContext:
          regressionInput.humanContext,
  
        lifeContext:
          regressionInput.lifeContext,
  
        question:
          regressionInput.question
            .decisionQuestion,
      });
  
    const request =
      buildConsultingOpenAIRequest(
        prompt,
      );
  
    const checks = {
      configuredModelIsUsed:
        request.model
        === "gpt-5.5",
  
      systemPromptIsPreserved:
        request.systemPrompt
        === prompt.systemPrompt,
  
      userPromptIsPreserved:
        request.userPrompt
        === prompt.userPrompt,
  
      systemPromptLocksVerdict:
        request.systemPrompt
          .includes(
            "엔진의 verdict를 변경하지 않는다.",
          ),
  
      systemPromptForbidsNewJudgement:
        request.systemPrompt
          .includes(
            "새로운 사주 판단을 만들지 않는다.",
          ),
  
      userPromptIncludesVerdict:
        request.userPrompt
          .includes(
            "판단 결과:",
          ),
  
      userPromptIncludesConfidence:
        request.userPrompt
          .includes(
            "판단 신뢰도:",
          ),
  
      userPromptIncludesReaderEffect:
        request.userPrompt
          .includes(
            "사람의 구조가 판단에 미친 영향",
          ),
  
      readerEffectChangesVerdict:
        request.userPrompt
          .includes(
            "판단 결과: conditionallyRecommended",
          ),
  
      userPromptIncludesReaderConditions:
        request.userPrompt
          .includes(
            "필수 조건",
          ),
  
      userPromptIncludesReaderRisks:
        request.userPrompt
          .includes(
            "주의할 위험",
          ),
  
      userPromptIncludesRecommendedDirection:
        request.userPrompt
          .includes(
            "권장 방향",
          ),
  
      userPromptIncludesProhibitedDirection:
        request.userPrompt
          .includes(
            "피해야 할 방향",
          ),
  
      userPromptIncludesFinalDecisionOnce:
        countOccurrences(
          request.userPrompt,
          "최종 판단",
        ) === 1,
  
      finalDecisionHasContent:
        request.userPrompt
          .split("최종 판단")
          .at(1)
          ?.trim()
          .length !== 0,
    };
  
    return {
      prompt,
  
      request,
  
      checks,
  
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }