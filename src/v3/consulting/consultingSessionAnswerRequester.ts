import {
    buildConsultingSessionOpenAIRequest,
  } from "./consultingSessionOpenAIRequestBuilder.js";
  import type {
    ConsultingSessionTurnPreparation,
  } from "./consultingSessionTurnBuilder.js";
  import type {
    ConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter.js";

  export type ConsultingAnswerRequestFunction = (
    request:
      ConsultingOpenAIRequest,
  ) => Promise<string>;

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
   * 후속 연속 상담의 GPT 설명 답변을 요청한다.
   *
   * 현재 Decision Engine 결과와 문맥 참고 전용 이전 이력으로
   * OpenAI 요청 Payload를 만든 뒤 GPT Client에 전달한다.
   *
   * GPT는 설명만 담당하며 새 판단을 만들 수 없다.
   */
  export async function requestConsultingSessionAnswer(
    preparation:
      ConsultingSessionTurnPreparation,

    requestAnswer:
      ConsultingAnswerRequestFunction =
        requestWithProductionClient,
  ): Promise<string> {
    const request =
      buildConsultingSessionOpenAIRequest(
        preparation,
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
        "Consulting session assistant answer must not be empty.",
      );
    }

    return assistantAnswer;
  }
