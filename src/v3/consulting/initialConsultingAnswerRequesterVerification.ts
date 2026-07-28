import type {
    ConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter";
  import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification";
  import {
    requestInitialConsultingAnswer,
  } from "./initialConsultingAnswerRequester";

  export type InitialConsultingAnswerRequesterVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  export async function verifyInitialConsultingAnswerRequester():
    Promise<InitialConsultingAnswerRequesterVerificationResult> {
    const sourceRequest =
      createSourceRequest();

    const execution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    const deliveredRequests:
      ConsultingOpenAIRequest[] = [];

    let requestCallCount =
      0;

    const expectedAnswer =
      "현재 판정의 조건과 위험을 기준으로 행동 방향을 설명합니다.";

    const assistantAnswer =
      await requestInitialConsultingAnswer(
        execution,
        async (
          request,
        ) => {
          requestCallCount +=
            1;

          deliveredRequests.push(
            request,
          );

          return expectedAnswer;
        },
      );

    const deliveredRequest =
      deliveredRequests[0];

    let emptyAnswerCallCount =
      0;

    let emptyAnswerError:
      unknown =
        null;

    try {
      await requestInitialConsultingAnswer(
        execution,
        async () => {
          emptyAnswerCallCount +=
            1;

          return "   ";
        },
      );
    } catch (
      error
    ) {
      emptyAnswerError =
        error;
    }

    const clientError =
      new Error(
        "verification OpenAI failure",
      );

    let propagatedClientError:
      unknown =
        null;

    try {
      await requestInitialConsultingAnswer(
        execution,
        async () => {
          throw clientError;
        },
      );
    } catch (
      error
    ) {
      propagatedClientError =
        error;
    }

    const checks = {
      clientIsCalledExactlyOnce:
        requestCallCount
        === 1,

      configuredModelIsDelivered:
        deliveredRequest
          ?.model
        === "gpt-5.5",

      currentSystemPromptIsDelivered:
        deliveredRequest
          ?.systemPrompt
        === execution
          .turnResult
          .prompt
          .systemPrompt,

      currentUserPromptIsDelivered:
        deliveredRequest
          ?.userPrompt
        === execution
          .turnResult
          .prompt
          .userPrompt,

      engineVerdictIsIncluded:
        deliveredRequest
          ?.userPrompt
          .includes(
            execution
              .turnResult
              .decisionResult
              .verdict,
          )
        === true,

      assistantAnswerIsPreserved:
        assistantAnswer
        === expectedAnswer,

      emptyAnswerIsRejected:
        emptyAnswerError
        instanceof Error,

      emptyAnswerClientIsCalledOnce:
        emptyAnswerCallCount
        === 1,

      clientFailureIsPropagated:
        propagatedClientError
        === clientError,
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
