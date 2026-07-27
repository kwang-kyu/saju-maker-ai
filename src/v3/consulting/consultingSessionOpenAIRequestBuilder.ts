import {
    buildConsultingSessionPrompt,
  } from "./consultingSessionPromptBuilder";
  import type {
    ConsultingSessionTurnPreparation,
  } from "./consultingSessionTurnBuilder";
  import {
    buildConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter";
  import type {
    ConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter";

  /**
   * 후속 연속 상담을 위한 OpenAI 요청 Payload를 만든다.
   *
   * Decision Engine이 만든 현재 턴 Prompt와
   * 문맥 참고 전용 이전 상담 이력을 먼저 분리된 Prompt로 구성한 뒤,
   * 기존 OpenAI Adapter를 통해 실제 요청 계약으로 변환한다.
   */
  export function buildConsultingSessionOpenAIRequest(
    preparation:
      ConsultingSessionTurnPreparation,
  ): ConsultingOpenAIRequest {
    const prompt =
      buildConsultingSessionPrompt(
        preparation,
      );

    return buildConsultingOpenAIRequest(
      prompt,
    );
  }
