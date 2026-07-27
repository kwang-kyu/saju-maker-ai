import {
    requestConsultingSessionAnswer,
  } from "./consultingSessionAnswerRequester";
  import type {
    ConsultingAnswerRequestFunction,
  } from "./consultingSessionAnswerRequester";
  import {
    buildConsultingSessionTurn,
    prepareConsultingSessionTurn,
  } from "./consultingSessionTurnBuilder";
  import type {
    BuildConsultingSessionTurnInput,
    PrepareConsultingSessionTurnInput,
  } from "./consultingSessionTurnBuilder";
  import type {
    ConsultingSession,
  } from "./consultingSession";

  export type ExecuteConsultingSessionTurnInput = {
    preparationInput:
      PrepareConsultingSessionTurnInput;

    turnId:
      BuildConsultingSessionTurnInput["turnId"];

    createdAt:
      BuildConsultingSessionTurnInput["createdAt"];

    confirmedFacts?:
      BuildConsultingSessionTurnInput["confirmedFacts"];

    requestAnswer?:
      ConsultingAnswerRequestFunction;
  };

  /**
   * 후속 연속 상담 한 턴을 처음부터 끝까지 실행한다.
   *
   * 1. 최신 세션을 기준으로 질문·현실을 다시 판단한다.
   * 2. 이전 대화는 문맥 참고 전용으로 분리하여 GPT 설명을 요청한다.
   * 3. GPT 답변과 새 Decision Result를 같은 턴에 저장한다.
   *
   * GPT 호출 중 세션이 바뀌었다면 buildConsultingSessionTurn()의
   * stale preparation 검증이 저장을 거부한다.
   */
  export async function executeConsultingSessionTurn(
    input:
      ExecuteConsultingSessionTurnInput,
  ): Promise<ConsultingSession> {
    const preparation =
      prepareConsultingSessionTurn(
        input.preparationInput,
      );

    const assistantAnswer =
      await requestConsultingSessionAnswer(
        preparation,
        input.requestAnswer,
      );

    return buildConsultingSessionTurn({
      session:
        input
          .preparationInput
          .session,

      preparation,

      turnId:
        input.turnId,

      createdAt:
        input.createdAt,

      assistantAnswer,

      confirmedFacts:
        input.confirmedFacts,
    });
  }
