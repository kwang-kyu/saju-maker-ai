import {
    InitialConsultingSessionAlreadyExistsError,
  } from "./authenticatedInitialConsultingSessionService";
  import type {
    CreateAuthenticatedInitialConsultingSessionInput,
  } from "./authenticatedInitialConsultingSessionService";
  import {
    handleAuthenticatedInitialConsultingSessionHttpRequest,
  } from "./authenticatedInitialConsultingSessionHttpHandler";
  import type {
    AuthenticatedInitialConsultingSessionHttpHandlerDependencies,
    AuthenticatedInitialConsultingSessionHttpSession,
  } from "./authenticatedInitialConsultingSessionHttpHandler";
  import {
    ConsultingSessionAuthenticationError,
  } from "./consultingSessionOwnerResolver";
  import type {
    SupabaseServerEnvironment,
  } from "./supabaseConsultingSessionRepositoryFactory";
  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest";

  export type AuthenticatedInitialConsultingSessionHttpHandlerVerificationResult = {
    checks:
      Record<string, boolean>;

    passed:
      boolean;
  };

  async function captureAsyncError(
    action:
      () => Promise<unknown>,
  ): Promise<unknown> {
    try {
      await action();

      return null;
    } catch (
      error
    ) {
      return error;
    }
  }

  export async function verifyAuthenticatedInitialConsultingSessionHttpHandler():
    Promise<AuthenticatedInitialConsultingSessionHttpHandlerVerificationResult> {
    const authorizationHeader =
      "Bearer verification-access-token";

    const environment:
      SupabaseServerEnvironment = {
        SUPABASE_URL:
          "https://verification.supabase.co",

        SUPABASE_SECRET_KEY:
          "verification-server-secret",
      };

    const requestBody:
      V3ConsultingRequest = {
        sajuInput: {
          name:
            "초기 상담 검증 대상",

          birthDate:
            "1990-01-01",

          birthTime:
            "09:30",

          gender:
            "female",

          calendarType:
            "solar",

          referenceDate:
            "2026-07-29",

          luckStartMethod:
            "minuteBased",
        },

        humanLifeContextInput: {
          maritalStatus:
            "single",

          hasChildren:
            false,

          occupationStatus:
            "employed",

          hasActiveBusiness:
            false,

          financialResponsibility:
            "medium",
        },

        question:
          "현재 직장을 유지하면서 새로운 일을 준비해도 될까요?",
      };

    const createdSession:
      AuthenticatedInitialConsultingSessionHttpSession = {
        id:
          "initial-session-verification-001",

        status:
          "active",

        createdAt:
          "2026-07-29T06:00:00.000Z",

        updatedAt:
          "2026-07-29T06:00:00.000Z",

        turns: [
          {
            id:
              "initial-turn-verification-001",

            sequence:
              1,

            question:
              requestBody.question,

            assistantAnswer:
              "현재 기반을 유지하면서 조건을 확인해 단계적으로 준비하는 방향이 적합합니다.",
          },
        ],

        pendingClarification:
          null,
      };

    const deliveredInputs:
      CreateAuthenticatedInitialConsultingSessionInput[] = [];

    const events:
      string[] = [];

    const successDependencies:
      AuthenticatedInitialConsultingSessionHttpHandlerDependencies = {
        async executeInitialSession(
          input:
            CreateAuthenticatedInitialConsultingSessionInput,
        ) {
          deliveredInputs.push(
            input,
          );

          events.push(
            "execute",
          );

          return createdSession;
        },
      };

    const successResponse =
      await handleAuthenticatedInitialConsultingSessionHttpRequest(
        {
          method:
            "post",

          authorizationHeader,

          body:
            requestBody,

          environment,
        },
        successDependencies,
      );

    let nonPostExecutionCount =
      0;

    const nonPostResponse =
      await handleAuthenticatedInitialConsultingSessionHttpRequest(
        {
          method:
            "GET",

          authorizationHeader,

          body:
            requestBody,

          environment,
        },
        {
          async executeInitialSession() {
            nonPostExecutionCount +=
              1;

            return createdSession;
          },
        },
      );

    let invalidRequestExecutionCount =
      0;

    const invalidRequestResponse =
      await handleAuthenticatedInitialConsultingSessionHttpRequest(
        {
          method:
            "POST",

          authorizationHeader,

          body: {
            question:
              "필수 출생 정보가 없는 잘못된 요청",
          },

          environment,
        },
        {
          async executeInitialSession() {
            invalidRequestExecutionCount +=
              1;

            return createdSession;
          },
        },
      );

    const authenticationResponse =
      await handleAuthenticatedInitialConsultingSessionHttpRequest(
        {
          method:
            "POST",

          authorizationHeader:
            undefined,

          body:
            requestBody,

          environment,
        },
        {
          async executeInitialSession() {
            throw new ConsultingSessionAuthenticationError(
              "missingAuthorization",
            );
          },
        },
      );

    const duplicateResponse =
      await handleAuthenticatedInitialConsultingSessionHttpRequest(
        {
          method:
            "POST",

          authorizationHeader,

          body:
            requestBody,

          environment,
        },
        {
          async executeInitialSession() {
            throw new InitialConsultingSessionAlreadyExistsError({
              sessionId:
                createdSession.id,

              existingUpdatedAt:
                createdSession.updatedAt,
            });
          },
        },
      );

    const unknownFailure =
      new Error(
        "verification unknown failure",
      );

    const internalErrorResponse =
      await handleAuthenticatedInitialConsultingSessionHttpRequest(
        {
          method:
            "POST",

          authorizationHeader,

          body:
            requestBody,

          environment,
        },
        {
          async executeInitialSession() {
            throw unknownFailure;
          },
        },
      );

    const propagatedUnexpectedError =
      await captureAsyncError(
        async () => {
          await Promise.resolve();
        },
      );

    const deliveredInput =
      deliveredInputs[0];

    const checks = {
      postRequestReturns201:
        successResponse.status
        === 201,

      executorIsCalledExactlyOnce:
        deliveredInputs.length
        === 1,

      executionOccursExactlyOnce:
        events.length
        === 1
        && events[0]
        === "execute",

      authorizationHeaderIsPreserved:
        deliveredInput
          ?.authorizationHeader
        === authorizationHeader,

      requestBodyIsPreserved:
        deliveredInput
          ?.request
        === requestBody,

      environmentIsPreserved:
        deliveredInput
          ?.environment
        === environment,

      sessionIdIsReturned:
        successResponse.status
        === 201
        && successResponse
          .body
          .sessionId
        === createdSession.id,

      sessionStatusIsReturned:
        successResponse.status
        === 201
        && successResponse
          .body
          .status
        === createdSession.status,

      createdAtIsReturned:
        successResponse.status
        === 201
        && successResponse
          .body
          .createdAt
        === createdSession.createdAt,

      updatedAtIsReturned:
        successResponse.status
        === 201
        && successResponse
          .body
          .updatedAt
        === createdSession.updatedAt,

      initialTurnIdIsReturned:
        successResponse.status
        === 201
        && successResponse
          .body
          .initialTurnId
        === createdSession.turns[0].id,

      initialTurnSequenceIsReturned:
        successResponse.status
        === 201
        && successResponse
          .body
          .initialTurnSequence
        === createdSession.turns[0].sequence,

      questionIsReturned:
        successResponse.status
        === 201
        && successResponse
          .body
          .question
        === createdSession.turns[0].question,

      assistantAnswerIsReturned:
        successResponse.status
        === 201
        && successResponse
          .body
          .assistantAnswer
        === createdSession.turns[0].assistantAnswer,

      pendingClarificationIsReturned:
        successResponse.status
        === 201
        && successResponse
          .body
          .pendingClarification
        === createdSession.pendingClarification,

      nonPostRequestUses405:
        nonPostResponse.status
        === 405
        && nonPostResponse
          .body
          .error
        === "methodNotAllowed",

        nonPostRequestSetsAllowHeader:
        nonPostResponse.status
        === 405
        && nonPostResponse
          .headers
          ?.Allow
        === "POST",

      nonPostRequestStopsExecution:
        nonPostExecutionCount
        === 0,

      invalidRequestUses400:
        invalidRequestResponse.status
        === 400
        && invalidRequestResponse
          .body
          .error
        === "invalidRequest",

      invalidRequestStopsExecution:
        invalidRequestExecutionCount
        === 0,

      authenticationFailureUses401:
        authenticationResponse.status
        === 401
        && authenticationResponse
          .body
          .error
        === "authenticationRequired",

      duplicateSessionUses409:
        duplicateResponse.status
        === 409
        && duplicateResponse
          .body
          .error
        === "sessionAlreadyExists",

      unknownFailureUses500:
        internalErrorResponse.status
        === 500
        && internalErrorResponse
          .body
          .error
        === "internalError",

      unexpectedVerificationControlRemainsStable:
        propagatedUnexpectedError
        === null,
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
