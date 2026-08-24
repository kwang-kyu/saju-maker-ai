import type {
    ConsultingAnswerRequestFunction,
  } from "./consultingSessionAnswerRequester.js";
  import type {
    InitialConsultingExecutionResult,
  } from "./initialConsultingExecutionBuilder.js";
  import {
    buildConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter.js";
  import type {
    ConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter.js";

  async function requestWithProductionClient(
    request:
      ConsultingOpenAIRequest,
  ): Promise<string> {
    const {
      requestConsultingAnswer,
    } = await import(
      "./openai/consultingOpenAIClient.js"
    );

    return requestConsultingAnswer(
      request,
    );
  }

  /**
   * 최초 상담의 Decision Engine 결과를 GPT 설명 답변으로 변환한다.
   *
   * GPT는 초기 실행이 만든 Prompt만 전달받으며,
   * 판정을 다시 만들거나 엔진의 결론을 변경할 수 없다.
   */
  export async function requestInitialConsultingAnswer(
    execution:
      InitialConsultingExecutionResult,
    requestAnswer:
      ConsultingAnswerRequestFunction =
        requestWithProductionClient,
  ): Promise<string> {
    const request =
      buildConsultingOpenAIRequest(
        execution
          .turnResult
          .prompt,
      );

    const assistantAnswer =
      await requestAnswer(
        request,
      );

    if (
      assistantAnswer
        .trim()
        .length
      === 0
    ) {
      throw new Error(
        "Initial consulting assistant answer must not be empty.",
      );
    }

    return assistantAnswer;
  }
