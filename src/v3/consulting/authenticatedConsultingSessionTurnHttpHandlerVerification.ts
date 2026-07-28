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
    InvalidAuthenticatedConsultingSessionTurnRequestError,
  } from "./authenticatedConsultingSessionTurnRequest";
  import {
    ConsultingSessionAuthenticationError,
  } from "./consultingSessionOwnerResolver";
  import {
    ConsultingSessionConflictError,
    ConsultingSessionNotFoundError,
  } from "./persistedConsultingSessionTurnService";
  import {
    handleAuthenticatedConsultingSessionTurnHttpRequest,
  } from "./authenticatedConsultingSessionTurnHttpHandler";
  import type {
    AuthenticatedConsultingSessionTurnHttpResponse,
  } from "./authenticatedConsultingSessionTurnHttpHandler";
  import type {
    ExecuteAuthenticatedConsultingSessionTurnRequestInput,
  } from "./authenticatedConsultingSessionTurnService";

  export type AuthenticatedConsultingSessionTurnHttpHandlerVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  export async function verifyAuthenticatedConsultingSessionTurnHttpHandler():
    Promise<AuthenticatedConsultingSessionTurnHttpHandlerVerificationResult> {
    const authorizationHeader =
      "Bearer http-handler-access-token";

    const environment = {
      SUPABASE_URL:
        "https://verification.supabase.co",

      SUPABASE_SECRET_KEY:
        "verification-server-secret",
    };

    const body = {
      sessionId:
        "session-http-001",

      kind:
        "followUp",

      question:
        "현재 조건에서 매수를 계속 검토해도 될까요?",
    };

    const sourceRequest =
      createSourceRequest();

    const initialExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    const returnedSession =
      buildInitialConsultingSession({
        sessionId:
          "session-http-001",

        initialTurnId:
          "turn-http-001",

        createdAt:
          "2026-07-29T05:20:00.000Z",

        request:
          sourceRequest,

        execution:
          initialExecution,

        assistantAnswer:
          "현재 조건에서는 자금 안전성을 먼저 확인해야 합니다.",
      });

    const deliveredInputs:
      ExecuteAuthenticatedConsultingSessionTurnRequestInput[] = [];

    let successExecutorCallCount =
      0;

    const successResponse =
      await handleAuthenticatedConsultingSessionTurnHttpRequest(
        {
          method:
            "post",

          authorizationHeader,

          body,

          environment,
        },
        {
          async executeTurnRequest(
            input,
          ) {
            successExecutorCallCount +=
              1;

            deliveredInputs.push(
              input,
            );

            return returnedSession;
          },
        },
      );

    const deliveredInput =
      deliveredInputs[0];

    const successBody =
      successResponse.status
      === 200
        ? successResponse.body
        : null;

    const latestTurn =
      returnedSession.turns[
        returnedSession.turns.length - 1
      ];

    let methodFailureExecutorCallCount =
      0;

    const methodFailureResponse =
      await handleAuthenticatedConsultingSessionTurnHttpRequest(
        {
          method:
            "GET",

          authorizationHeader,

          body,

          environment,
        },
        {
          async executeTurnRequest() {
            methodFailureExecutorCallCount +=
              1;

            return returnedSession;
          },
        },
      );

    async function captureMappedResponse(
      error:
        Error,
    ): Promise<AuthenticatedConsultingSessionTurnHttpResponse> {
      return handleAuthenticatedConsultingSessionTurnHttpRequest(
        {
          method:
            "POST",

          authorizationHeader,

          body,

          environment,
        },
        {
          async executeTurnRequest() {
            throw error;
          },
        },
      );
    }

    const invalidRequestResponse =
      await captureMappedResponse(
        new InvalidAuthenticatedConsultingSessionTurnRequestError(),
      );

    const authenticationResponse =
      await captureMappedResponse(
        new ConsultingSessionAuthenticationError(
          "missingAuthorization",
        ),
      );

    const notFoundResponse =
      await captureMappedResponse(
        new ConsultingSessionNotFoundError(
          "session-http-missing",
        ),
      );

    const conflictResponse =
      await captureMappedResponse(
        new ConsultingSessionConflictError({
          sessionId:
            "session-http-conflict",

          expectedUpdatedAt:
            "2026-07-29T05:20:00.000Z",

          currentUpdatedAt:
            "2026-07-29T05:21:00.000Z",
        }),
      );

    const internalErrorResponse =
      await captureMappedResponse(
        new Error(
          "verification internal failure",
        ),
      );

    const checks = {
      postRequestReturnsSuccess:
        successResponse.status
        === 200,

      executorIsCalledExactlyOnce:
        successExecutorCallCount
        === 1,

      authorizationHeaderIsPreserved:
        deliveredInput
          ?.authorizationHeader
        === authorizationHeader,

      requestBodyIsPreserved:
        deliveredInput
          ?.request
        === body,

      environmentIsPreserved:
        deliveredInput
          ?.environment
        === environment,

      sessionIdIsReturned:
        successBody
          ?.sessionId
        === returnedSession.id,

      sessionStatusIsReturned:
        successBody
          ?.status
        === returnedSession.status,

      updatedAtIsReturned:
        successBody
          ?.updatedAt
        === returnedSession.updatedAt,

      latestTurnIdIsReturned:
        successBody
          ?.turn
          .id
        === latestTurn.id,

      latestTurnSequenceIsReturned:
        successBody
          ?.turn
          .sequence
        === latestTurn.sequence,

      latestQuestionIsReturned:
        successBody
          ?.turn
          .question
        === latestTurn.question,

      assistantAnswerIsReturned:
        successBody
          ?.turn
          .assistantAnswer
        === latestTurn.assistantAnswer,

      pendingClarificationIsReturned:
        successBody
          ?.pendingClarification
        === returnedSession.pendingClarification,

      engineDecisionIsNotExposed:
        successBody
        !== null
        && !(
          "decisionResult"
          in successBody.turn
        ),

      nonPostRequestUses405:
        methodFailureResponse.status
        === 405
        && methodFailureResponse.body.error
        === "methodNotAllowed",

      nonPostRequestStopsExecution:
        methodFailureExecutorCallCount
        === 0,

      invalidRequestUses400:
        invalidRequestResponse.status
        === 400
        && invalidRequestResponse.body.error
        === "invalidRequest",

      authenticationFailureUses401:
        authenticationResponse.status
        === 401
        && authenticationResponse.body.error
        === "unauthorized",

      missingSessionUses404:
        notFoundResponse.status
        === 404
        && notFoundResponse.body.error
        === "sessionNotFound",

      sessionConflictUses409:
        conflictResponse.status
        === 409
        && conflictResponse.body.error
        === "sessionConflict",

      unknownFailureUses500:
        internalErrorResponse.status
        === 500
        && internalErrorResponse.body.error
        === "internalError",
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
