import type {
    VercelRequest,
    VercelResponse,
  } from "@vercel/node";

  import {
    createV3InitialConsultingSessionApiHandler,
  } from "../../../api/v3/consulting/session";
  import type {
    AuthenticatedInitialConsultingSessionHttpRequest,
  } from "./authenticatedInitialConsultingSessionHttpHandler";

  export type V3InitialConsultingSessionApiVerificationResult = {
    checks:
      Record<string, boolean>;

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

  export async function verifyV3InitialConsultingSessionApi():
    Promise<V3InitialConsultingSessionApiVerificationResult> {
    const authorizationHeader =
      "Bearer initial-api-verification-token";

    const requestBody = {
      sajuInput: {
        name:
          "최초 상담 API 검증 대상",

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

    const deliveredRequests:
      AuthenticatedInitialConsultingSessionHttpRequest[] = [];

    let handlerCallCount =
      0;

    const successBody = {
      sessionId:
        "initial-session-api-001",

      status:
        "active" as const,

      createdAt:
        "2026-07-29T06:30:00.000Z",

      updatedAt:
        "2026-07-29T06:30:00.000Z",

      initialTurnId:
        "initial-turn-api-001",

      initialTurnSequence:
        1,

      question:
        requestBody.question,

      assistantAnswer:
        "현재 기반을 유지하면서 조건을 확인해 단계적으로 준비하는 방향이 적합합니다.",

      pendingClarification:
        null,
    };

    const successHandler =
      createV3InitialConsultingSessionApiHandler({
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
              201,

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
      createV3InitialConsultingSessionApiHandler({
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
        === 201,

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
