import type {
    AuthenticatedConsultingSessionTurnRequest,
  } from "../consulting/authenticatedConsultingSessionTurnRequest";
  import type {
    V3ConsultingRequest,
  } from "../consulting/v3ConsultingRequest";
  import {
    createV3InitialConsultingSession,
    requestV3ConsultingSessionTurn,
    V3ConsultingSessionApiError,
  } from "./v3ConsultingSessionApiClient";

  export type V3ConsultingSessionApiClientVerificationResult = {
    checks:
      Record<string, boolean>;

    passed:
      boolean;
  };

  type CapturedRequest = {
    path:
      string;

    method:
      string;

    authorization:
      string | null;

    contentType:
      string | null;

    body:
      unknown;
  };

  function createJsonResponse(
    status:
      number,
    body:
      unknown,
  ): Response {
    return new Response(
      JSON.stringify(
        body,
      ),
      {
        status,

        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );
  }

  function captureRequest(
    requests:
      CapturedRequest[],
    input:
      RequestInfo | URL,
    init:
      RequestInit | undefined,
  ): void {
    const headers =
      new Headers(
        init?.headers,
      );

    const rawBody =
      typeof init?.body
      === "string"
        ? init.body
        : null;

    requests.push({
      path:
        input.toString(),

      method:
        init?.method
        ?? "GET",

      authorization:
        headers.get(
          "Authorization",
        ),

      contentType:
        headers.get(
          "Content-Type",
        ),

      body:
        rawBody
        === null
          ? null
          : JSON.parse(
              rawBody,
            ),
    });
  }

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

  export async function verifyV3ConsultingSessionApiClient():
    Promise<V3ConsultingSessionApiClientVerificationResult> {
    const accessToken =
      "verification-browser-access-token";

    const initialRequest:
      V3ConsultingRequest = {
        sajuInput: {
          name:
            "브라우저 API 검증 대상",

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

    const initialResponseBody = {
      sessionId:
        "browser-session-001",

        status:
        "active",

      createdAt:
        "2026-07-29T07:00:00.000Z",

      updatedAt:
        "2026-07-29T07:00:00.000Z",

      initialTurnId:
        "browser-turn-001",

      initialTurnSequence:
        1,

      question:
        initialRequest.question,

      assistantAnswer:
        "현재 기반을 유지하면서 단계적으로 준비하는 방향이 적합합니다.",

      pendingClarification:
        null,
    };

    const initialRequests:
      CapturedRequest[] = [];

    const initialResult =
      await createV3InitialConsultingSession(
        {
          accessToken,

          request:
            initialRequest,
        },
        async (
          input,
          init,
        ) => {
          captureRequest(
            initialRequests,
            input,
            init,
          );

          return createJsonResponse(
            201,
            initialResponseBody,
          );
        },
      );

    const turnRequest:
      AuthenticatedConsultingSessionTurnRequest = {
        sessionId:
          initialResult.sessionId,

        kind:
          "followUp",

        question:
          "그러면 준비 기간은 어느 정도로 잡는 것이 좋을까요?",
      };

    const turnResponseBody = {
      sessionId:
        initialResult.sessionId,

      status:
        "awaitingClarification",

      updatedAt:
        "2026-07-29T07:05:00.000Z",

      turn: {
        id:
          "browser-turn-002",

        sequence:
          2,

        kind:
          "followUp",

        question:
          turnRequest.question,

        assistantAnswer:
          "현재 책임과 현금흐름을 고려해 단계별 검증 기간을 두는 것이 적합합니다.",

        createdAt:
          "2026-07-29T07:05:00.000Z",
      },

      pendingClarification: {
        decisionTurnId:
          "browser-turn-002",

        items: [
          {
            key:
              "counterpartBirthTime",

            description:
              "상대방 출생시간",

            question:
              "상대방의 출생시간을 알고 계신가요?",
          },
        ],
      },
    };

    const turnRequests:
      CapturedRequest[] = [];

    const turnResult =
      await requestV3ConsultingSessionTurn(
        {
          accessToken,

          request:
            turnRequest,
        },
        async (
          input,
          init,
        ) => {
          captureRequest(
            turnRequests,
            input,
            init,
          );

          return createJsonResponse(
            200,
            turnResponseBody,
          );
        },
      );

    let emptyTokenFetchCalls =
      0;

    const emptyTokenError =
      await captureAsyncError(
        () =>
          createV3InitialConsultingSession(
            {
              accessToken:
                "   ",

              request:
                initialRequest,
            },
            async () => {
              emptyTokenFetchCalls +=
                1;

              return createJsonResponse(
                201,
                initialResponseBody,
              );
            },
          ),
      );

    const authenticationError =
      await captureAsyncError(
        () =>
          createV3InitialConsultingSession(
            {
              accessToken,

              request:
                initialRequest,
            },
            async () =>
              createJsonResponse(
                401,
                {
                  error:
                    "authenticationRequired",
                },
              ),
          ),
      );

    const missingSessionError =
      await captureAsyncError(
        () =>
          requestV3ConsultingSessionTurn(
            {
              accessToken,

              request:
                turnRequest,
            },
            async () =>
              createJsonResponse(
                404,
                {
                  error:
                    "sessionNotFound",
                },
              ),
          ),
      );

    const conflictError =
      await captureAsyncError(
        () =>
          requestV3ConsultingSessionTurn(
            {
              accessToken,

              request:
                turnRequest,
            },
            async () =>
              createJsonResponse(
                409,
                {
                  error:
                    "sessionConflict",
                },
              ),
          ),
      );

    const malformedSuccessError =
      await captureAsyncError(
        () =>
          createV3InitialConsultingSession(
            {
              accessToken,

              request:
                initialRequest,
            },
            async () =>
              createJsonResponse(
                201,
                {
                  sessionId:
                    "incomplete-session",
                },
              ),
          ),
      );

    const invalidJsonError =
      await captureAsyncError(
        () =>
          createV3InitialConsultingSession(
            {
              accessToken,

              request:
                initialRequest,
            },
            async () =>
              new Response(
                "not-json",
                {
                  status:
                    500,
                },
              ),
          ),
      );

    const networkError =
      await captureAsyncError(
        () =>
          createV3InitialConsultingSession(
            {
              accessToken,

              request:
                initialRequest,
            },
            async () => {
              throw new Error(
                "verification network failure",
              );
            },
          ),
      );

    const initialCapturedRequest =
      initialRequests[0];

    const turnCapturedRequest =
      turnRequests[0];

    const checks = {
      initialEndpointIsCalledExactlyOnce:
        initialRequests.length
        === 1,

      initialEndpointPathIsCorrect:
        initialCapturedRequest
          ?.path
        === "/api/v3/consulting/session",

      initialRequestUsesPost:
        initialCapturedRequest
          ?.method
        === "POST",

      initialAuthorizationUsesBearerToken:
        initialCapturedRequest
          ?.authorization
        === `Bearer ${accessToken}`,

      initialContentTypeIsJson:
        initialCapturedRequest
          ?.contentType
        === "application/json",

      initialBodyIsPreserved:
        JSON.stringify(
          initialCapturedRequest
            ?.body,
        )
        === JSON.stringify(
          initialRequest,
        ),

      initialSessionIdIsReturned:
        initialResult.sessionId
        === initialResponseBody.sessionId,

      initialAnswerIsReturned:
        initialResult.assistantAnswer
        === initialResponseBody.assistantAnswer,

      initialStatusIsReturned:
        initialResult.status
        === initialResponseBody.status,

      turnEndpointIsCalledExactlyOnce:
        turnRequests.length
        === 1,

      turnEndpointPathIsCorrect:
        turnCapturedRequest
          ?.path
        === "/api/v3/consulting/session-turn",

      turnRequestUsesPost:
        turnCapturedRequest
          ?.method
        === "POST",

      turnAuthorizationUsesBearerToken:
        turnCapturedRequest
          ?.authorization
        === `Bearer ${accessToken}`,

      turnBodyIsPreserved:
        JSON.stringify(
          turnCapturedRequest
            ?.body,
        )
        === JSON.stringify(
          turnRequest,
        ),

      followUpTurnIsReturned:
        turnResult.turn.id
        === turnResponseBody.turn.id
        && turnResult.turn.sequence
        === 2,

      followUpAnswerIsReturned:
        turnResult.turn.assistantAnswer
        === turnResponseBody.turn.assistantAnswer,

        followUpClarificationStatusIsReturned:
  turnResult.status
  === "awaitingClarification",

followUpClarificationItemsAreReturned:
  turnResult.pendingClarification
    ?.decisionTurnId
  === turnResponseBody
    .pendingClarification
    .decisionTurnId
  && turnResult
    .pendingClarification
    .items[0]
    .key
  === "counterpartBirthTime"
  && turnResult
    .pendingClarification
    .items[0]
    .description
  === "상대방 출생시간"
  && turnResult
    .pendingClarification
    .items[0]
    .question
  === "상대방의 출생시간을 알고 계신가요?",

      emptyAccessTokenUsesTypedError:
        emptyTokenError
        instanceof V3ConsultingSessionApiError
        && emptyTokenError.code
        === "invalidAccessToken",

      emptyAccessTokenStopsFetch:
        emptyTokenFetchCalls
        === 0,

      authenticationFailureUsesTypedError:
        authenticationError
        instanceof V3ConsultingSessionApiError
        && authenticationError.code
        === "authenticationRequired"
        && authenticationError.status
        === 401,

      missingSessionUsesTypedError:
        missingSessionError
        instanceof V3ConsultingSessionApiError
        && missingSessionError.code
        === "sessionNotFound"
        && missingSessionError.status
        === 404,

      sessionConflictUsesTypedError:
        conflictError
        instanceof V3ConsultingSessionApiError
        && conflictError.code
        === "sessionConflict"
        && conflictError.status
        === 409,

      malformedSuccessUsesTypedError:
        malformedSuccessError
        instanceof V3ConsultingSessionApiError
        && malformedSuccessError.code
        === "invalidResponse",

      invalidJsonUsesTypedError:
        invalidJsonError
        instanceof V3ConsultingSessionApiError
        && invalidJsonError.code
        === "invalidResponse",

      networkFailureUsesTypedError:
        networkError
        instanceof V3ConsultingSessionApiError
        && networkError.code
        === "networkFailure",
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
