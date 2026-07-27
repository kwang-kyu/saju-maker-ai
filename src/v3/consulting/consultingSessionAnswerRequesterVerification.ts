import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification";
  import {
    requestConsultingSessionAnswer,
  } from "./consultingSessionAnswerRequester";
  import {
    prepareConsultingSessionTurn,
  } from "./consultingSessionTurnBuilder";
  import type {
    ConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter";

  export type ConsultingSessionAnswerRequesterVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  async function actionRejects(
    action:
      () => Promise<unknown>,
  ): Promise<boolean> {
    try {
      await action();

      return false;
    } catch {
      return true;
    }
  }

  export async function verifyConsultingSessionAnswerRequester():
    Promise<ConsultingSessionAnswerRequesterVerificationResult> {
    const sourceRequest =
      createSourceRequest();

    const initialExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    const previousAssistantAnswer =
      "현재 정보만으로 매수를 확정할 수 없습니다. 대출 상환능력과 결정기한을 먼저 확인해야 합니다.";

    const initialSession =
      buildInitialConsultingSession({
        sessionId:
          "session-answer-requester-001",

        initialTurnId:
          "turn-answer-requester-001",

        createdAt:
          "2026-07-28T07:30:00+09:00",

        request:
          sourceRequest,

        execution:
          initialExecution,

        assistantAnswer:
          previousAssistantAnswer,
      });

    const preparation =
      prepareConsultingSessionTurn({
        session:
          initialSession,

        kind:
          "clarification",

        question:
          "대출 잔액은 2억 원이고 월소득은 900만 원입니다. 두 달 뒤까지 상가 매수를 결정해야 하는데 진행해도 될까요?",

        preparedAt:
          "2026-07-28T07:40:00+09:00",
      });

    const expectedAssistantAnswer =
      "현재 엔진 판정에 따라 기존 현금흐름을 보호하고 매수 규모를 제한하는 조건에서만 진행 방향을 검토할 수 있습니다.";

      const capturedRequests:
    ConsultingOpenAIRequest[] =
      [];

    const assistantAnswer =
      await requestConsultingSessionAnswer(
        preparation,
        async (
          request,
        ) => {
            capturedRequests.push(
                request,
              );

          return expectedAssistantAnswer;
        },
      );

      const deliveredRequest =
    capturedRequests[0];

    let emptyAnswerCallCount =
      0;

    const emptyAnswerIsRejected =
      await actionRejects(
        () =>
          requestConsultingSessionAnswer(
            preparation,
            async () => {
              emptyAnswerCallCount +=
                1;

              return "   ";
            },
          ),
      );

    const clientFailure =
      new Error(
        "Injected client failure.",
      );

    let propagatedFailure:
      unknown =
        null;

    try {
      await requestConsultingSessionAnswer(
        preparation,
        async () => {
          throw clientFailure;
        },
      );
    } catch (
      error
    ) {
      propagatedFailure =
        error;
    }

    let invalidPreparationCallCount =
      0;

    const invalidPreparationIsRejectedBeforeClient =
      await actionRejects(
        () =>
          requestConsultingSessionAnswer(
            {
              ...preparation,

              turnResult: {
                ...preparation
                  .turnResult,

                prompt: {
                  ...preparation
                    .turnResult
                    .prompt,

                  userPrompt:
                    " ",
                },
              },
            },
            async () => {
              invalidPreparationCallCount +=
                1;

              return expectedAssistantAnswer;
            },
          ),
      );

    const checks = {
      clientIsCalledExactlyOnce:
      capturedRequests
      .length
    === 1,

      assistantAnswerIsPreserved:
        assistantAnswer
        === expectedAssistantAnswer,

      requestModelIsDelivered:
        deliveredRequest !== undefined
        && deliveredRequest
          .model
        === "gpt-5.5",

      currentPromptIsDelivered:
        deliveredRequest !== undefined
        && deliveredRequest
          .userPrompt
          .includes(
            preparation
              .turnResult
              .prompt
              .userPrompt,
          ),

      previousQuestionIsDeliveredAsContext:
        deliveredRequest !== undefined
        && preparation
          .conversationHistory
          .every(
            (entry) =>
              deliveredRequest
                .userPrompt
                .includes(
                  entry.question,
                ),
          ),

      previousAnswerIsDeliveredAsContext:
        deliveredRequest !== undefined
        && deliveredRequest
          .userPrompt
          .includes(
            previousAssistantAnswer,
          ),

      currentDecisionRemainsOnlyBasis:
        deliveredRequest !== undefined
        && deliveredRequest
          .userPrompt
          .includes(
            "현재 엔진 판정 — 이번 답변의 유일한 판단 기준",
          ),

      previousAnswersCannotBecomeEvidence:
        deliveredRequest !== undefined
        && deliveredRequest
          .systemPrompt
          .includes(
            "이전 사용자 질문과 GPT 답변을 새로운 판단 근거로 사용하지 않는다.",
          ),

      engineDecisionCannotBeChanged:
        deliveredRequest !== undefined
        && deliveredRequest
          .systemPrompt
          .includes(
            "현재 엔진의 verdict, 조건, 위험, 권장 방향, 금지 방향을 변경하지 않는다.",
          ),

      emptyAssistantAnswerIsRejected:
        emptyAnswerIsRejected,

      emptyAnswerClientIsCalledOnce:
        emptyAnswerCallCount
        === 1,

      clientFailureIsPropagated:
        propagatedFailure
        === clientFailure,

      invalidPreparationIsRejected:
        invalidPreparationIsRejectedBeforeClient,

      invalidPreparationDoesNotCallClient:
        invalidPreparationCallCount
        === 0,
    };

    return {
      checks,

      passed:
        Object
          .values(
            checks,
          )
          .every(
            Boolean,
          ),
    };
  }
