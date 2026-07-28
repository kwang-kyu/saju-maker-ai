import type {
    VercelRequest,
    VercelResponse,
  } from "@vercel/node";

  import {
    createV3ConsultingSessionTurnApiHandler,
  } from "../../../api/v3/consulting/session-turn";
  import type {
    AuthenticatedConsultingSessionTurnHttpRequest,
  } from "./authenticatedConsultingSessionTurnHttpHandler";

  export type V3ConsultingSessionTurnApiVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  type CapturedHeader = {
    name:
      string;

    value:
      number | string | readonly string[];
  };

  type ResponseCapture = {
    statuses:
      number[];

    bodies:
      unknown[];

    headers:
      CapturedHeader[];

    response:
      VercelResponse;
  };

  function createVerificationRequest(
    input: {
      method:
        string;

      authorization:
        string;

      body:
        unknown;
    },
  ): VercelRequest {
    return {
      method:
        input.method,

      headers: {
        authorization:
          input.authorization,
      },

      body:
        input.body,
    } as VercelRequest;
  }

  function createResponseCapture():
    ResponseCapture {
    const statuses:
      number[] = [];

    const bodies:
      unknown[] = [];

    const headers:
      CapturedHeader[] = [];

    let response:
      VercelResponse;

    const responseImplementation = {
      setHeader(
        name:
          string,
        value:
          number | string | readonly string[],
      ) {
        headers.push({
          name,

          value,
        });

        return response;
      },

      status(
        status:
          number,
      ) {
        statuses.push(
          status,
        );

        return response;
      },

      json(
        body:
          unknown,
      ) {
        bodies.push(
          body,
        );

        return response;
      },
    };

    response =
      responseImplementation as VercelResponse;

    return {
      statuses,

      bodies,

      headers,

      response,
    };
  }

  export async function verifyV3ConsultingSessionTurnApi():
    Promise<V3ConsultingSessionTurnApiVerificationResult> {
    const authorizationHeader =
      "Bearer api-verification-token";

    const requestBody = {
      sessionId:
        "session-api-001",

      kind:
        "followUp",

      question:
        "지금 매수를 계속 검토해도 될까요?",
    };

    const deliveredRequests:
      AuthenticatedConsultingSessionTurnHttpRequest[] = [];

    let handlerCallCount =
      0;

    const successBody = {
      sessionId:
        "session-api-001",

      status:
        "active" as const,

      updatedAt:
        "2026-07-29T05:40:00.000Z",

      turn: {
        id:
          "turn-api-002",

        sequence:
          2,

        kind:
          "followUp" as const,

        question:
          requestBody.question,

        assistantAnswer:
          "현재 조건에서는 자금 안전성을 먼저 확인해야 합니다.",

        createdAt:
          "2026-07-29T05:40:00.000Z",
      },

      pendingClarification:
        null,
    };

    const successHandler =
      createV3ConsultingSessionTurnApiHandler({
        async handleRequest(
          request,
        ) {
          handlerCallCount +=
            1;

          deliveredRequests.push(
            request,
          );

          return {
            status:
              200,

            body:
              successBody,
          };
        },
      });

    const successCapture =
      createResponseCapture();

    await successHandler(
      createVerificationRequest({
        method:
          "POST",

        authorization:
          authorizationHeader,

        body:
          requestBody,
      }),
      successCapture.response,
    );

    const deliveredRequest =
      deliveredRequests[0];

    const methodFailureHandler =
      createV3ConsultingSessionTurnApiHandler({
        async handleRequest() {
          return {
            status:
              405,

            body: {
              error:
                "methodNotAllowed",
            },
          };
        },
      });

    const methodFailureCapture =
      createResponseCapture();

    await methodFailureHandler(
      createVerificationRequest({
        method:
          "GET",

        authorization:
          authorizationHeader,

        body:
          requestBody,
      }),
      methodFailureCapture.response,
    );

    const allowHeader =
      methodFailureCapture
        .headers[0];

    const checks = {
      coreHandlerIsCalledExactlyOnce:
        handlerCallCount
        === 1,

      methodIsPreserved:
        deliveredRequest
          ?.method
        === "POST",

      authorizationHeaderIsPreserved:
        deliveredRequest
          ?.authorizationHeader
        === authorizationHeader,

      requestBodyIsPreserved:
        deliveredRequest
          ?.body
        === requestBody,

      serverEnvironmentIsDelivered:
        deliveredRequest
          ?.environment
        === process.env,

      successStatusIsWritten:
        successCapture
          .statuses[0]
        === 200,

      successBodyIsWritten:
        successCapture
          .bodies[0]
        === successBody,

      methodFailureStatusIsWritten:
        methodFailureCapture
          .statuses[0]
        === 405,

      methodFailureBodyIsWritten:
        methodFailureCapture
          .bodies[0]
        !== null
        && typeof methodFailureCapture
          .bodies[0]
        === "object",

      methodFailureSetsAllowHeader:
        allowHeader
          ?.name
        === "Allow"
        && allowHeader
          .value
        === "POST",

      successDoesNotSetAllowHeader:
        successCapture
          .headers
          .length
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
