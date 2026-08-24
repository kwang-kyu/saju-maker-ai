import type {
    ConsultingPrompt,
  } from "../explanation/consultingPromptBuilder.js";
  import {
    buildConsultingOpenAIRequest,
    type ConsultingOpenAIRequest,
  } from "./consultingOpenAIAdapter.js";
  
  export type ConsultingOpenAIAdapterVerificationResult = {
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
  
  export function verifyConsultingOpenAIAdapter():
    ConsultingOpenAIAdapterVerificationResult {
    const prompt:
      ConsultingPrompt = {
        systemPrompt:
          "엔진의 verdict를 변경하지 않는다.",
  
        userPrompt:
          "판단 결과와 최종 판단을 엔진 결과 그대로 설명한다.",
      };
  
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
  
      promptsAreNotSwapped:
        request.systemPrompt
        !== prompt.userPrompt
        && request.userPrompt
        !== prompt.systemPrompt,
  
      requestContainsExpectedFieldsOnly:
        Object.keys(request)
          .sort()
          .join(",")
        === [
          "model",
          "systemPrompt",
          "userPrompt",
        ]
          .sort()
          .join(","),
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