import type {
    VercelRequest,
    VercelResponse,
  } from "@vercel/node";

  import {
    createV3ConsultingHandler,
  } from "../../../api/v3ConsultingRoute";

  import {
    buildV3ConsultingRequest,
  } from "../../../api/v3Consulting";

  import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";

  import type {
    ConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter";

  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest";

  type MockResponseState = {
    statusCode:
      number | null;

    headers:
      Record<string, string>;

    body:
      unknown;
  };

  export type V3ConsultingRouteIntegrationVerificationResult = {
    checks: {
      nonPostRequestIsRejected:
        boolean;

      nonPostResponseAllowsPost:
        boolean;

      invalidPostRequestIsRejected:
        boolean;

      invalidRequestDoesNotReachPipeline:
        boolean;

      validSourceRequestIsAccepted:
        boolean;

      validRequestRunsPipelineOnce:
        boolean;

      gptRequestReachesClientBoundary:
        boolean;

      gptRequestContainsDecision:
        boolean;

      gptRequestLocksEngineVerdict:
        boolean;

      answerIsTrimmed:
        boolean;

      emptyAnswerIsRejected:
        boolean;
    };

    crossChecks: {
      missingExpectedFinalDecisionFails:
        boolean;

      duplicatedExpectedFinalDecisionFails:
        boolean;

      missingFinalDecisionSectionTitleFails:
        boolean;

      otherFinalDecisionFails:
        boolean;
    };

    passed:
      boolean;
  };

  const FINAL_DECISION_SECTION_TITLE =
    "엔진이 확정한 최종 결론";

  const OTHER_FINAL_DECISION =
    "검증 전용 다른 최종 결론 문장입니다.";

  function createSourceRequest():
    V3ConsultingRequest {
    return {
      sajuInput: {
        name:
          "김천운",

        birthDate:
          "1984-03-15",

        birthTime:
          "14:30",

        gender:
          "male",

        calendarType:
          "solar",

        referenceDate:
          "2026-07-26",

        luckStartMethod:
          "minuteBased",
      },

      humanLifeContextInput: {
        maritalStatus:
          "married",

        hasChildren:
          true,

        occupationStatus:
          "employed",

        hasActiveBusiness:
          false,

        financialResponsibility:
          "high",
      },

      question:
        "대출 부담이 있는데 상가를 매수해도 될까요?",
    };
  }

  function createMockRequest(
    method: string,
    body: unknown,
  ): VercelRequest {
    return {
      method,

      body,
    } as VercelRequest;
  }

  function createMockResponse(): {
    response:
      VercelResponse;

    state:
      MockResponseState;
  } {
    const state:
      MockResponseState = {
        statusCode:
          null,

        headers: {},

        body:
          null,
      };

    const response = {
      setHeader(
        name: string,
        value: string | number | readonly string[],
      ) {
        state.headers[name] =
          Array.isArray(value)
            ? value.join(", ")
            : String(value);

        return response;
      },

      status(
        statusCode: number,
      ) {
        state.statusCode =
          statusCode;

        return response;
      },

      json(
        body: unknown,
      ) {
        state.body =
          body;

        return response;
      },
    } as unknown as VercelResponse;

    return {
      response,

      state,
    };
  }

  function isRecord(
    value: unknown,
  ): value is Record<string, unknown> {
    return (
      typeof value === "object"
      && value !== null
      && !Array.isArray(value)
    );
  }

  function readBodyValue(
    body: unknown,
    key: string,
  ): unknown {
    return isRecord(body)
      ? body[key]
      : undefined;
  }

  function countOccurrences(
    value: string,
    target: string,
  ): number {
    if (!target) {
      return 0;
    }

    return value
      .split(target)
      .length - 1;
  }

  function replaceAllOccurrences(
    value: string,
    target: string,
    replacement: string,
  ): string {
    if (!target) {
      return value;
    }

    return value
      .split(target)
      .join(
        replacement,
      );
  }

  function withUserPrompt(
    request:
      ConsultingOpenAIRequest | undefined,
    userPrompt: string,
  ): ConsultingOpenAIRequest | undefined {
    if (!request) {
      return undefined;
    }

    return {
      model:
        request.model,

      systemPrompt:
        request.systemPrompt,

      userPrompt,
    };
  }

  function gptRequestContainsDecision(
    deliveredRequest:
      ConsultingOpenAIRequest | undefined,
    expectedFinalDecision: string,
  ): boolean {
    if (!deliveredRequest) {
      return false;
    }

    if (
      expectedFinalDecision
        .trim()
        .length === 0
    ) {
      return false;
    }

    const userPrompt =
      deliveredRequest.userPrompt;

    return (
      userPrompt.includes(
        FINAL_DECISION_SECTION_TITLE,
      )
      && userPrompt.includes(
        expectedFinalDecision,
      )
      && countOccurrences(
        userPrompt,
        expectedFinalDecision,
      ) === 1
    );
  }

  export async function verifyV3ConsultingRouteIntegration():
    Promise<
      V3ConsultingRouteIntegrationVerificationResult
    > {
    const sourceRequest =
      createSourceRequest();

    const expectedExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    const expectedFinalDecision =
      expectedExecution
        .turnResult
        .decisionResult
        .finalDecisionSentence;

    let pipelineCallCount = 0;

    const capturedRequests:
      ConsultingOpenAIRequest[] = [];

    const handler =
      createV3ConsultingHandler({
        buildRequest:
          async (params) => {
            pipelineCallCount += 1;

            return buildV3ConsultingRequest(
              params,
            );
          },

        requestAnswer:
          async (request) => {
            capturedRequests.push(
              request,
            );

            return "  엔진 판단을 설명한 상담 답변입니다.  ";
          },
      });

    const nonPost =
      createMockResponse();

    await handler(
      createMockRequest(
        "GET",
        null,
      ),
      nonPost.response,
    );

    const callsAfterNonPost =
      pipelineCallCount;

    const invalidPost =
      createMockResponse();

    await handler(
      createMockRequest(
        "POST",
        {
          question:
            "상가를 매수해도 될까요?",
        },
      ),
      invalidPost.response,
    );

    const callsAfterInvalidPost =
      pipelineCallCount;

    const validPost =
      createMockResponse();

    await handler(
      createMockRequest(
        "POST",
        sourceRequest,
      ),
      validPost.response,
    );

    const deliveredRequest =
      capturedRequests[0];

    const deliveredUserPrompt =
      deliveredRequest
        ?.userPrompt
        ?? "";

    const emptyAnswerHandler =
      createV3ConsultingHandler({
        buildRequest:
          buildV3ConsultingRequest,

        requestAnswer:
          async () => "   ",
      });

    const emptyAnswer =
      createMockResponse();

    await emptyAnswerHandler(
      createMockRequest(
        "POST",
        sourceRequest,
      ),
      emptyAnswer.response,
    );

    const checks = {
      nonPostRequestIsRejected:
        nonPost.state.statusCode
          === 405
        && readBodyValue(
          nonPost.state.body,
          "success",
        ) === false,

      nonPostResponseAllowsPost:
        nonPost.state.headers.Allow
          === "POST",

      invalidPostRequestIsRejected:
        invalidPost.state.statusCode
          === 400
        && readBodyValue(
          invalidPost.state.body,
          "success",
        ) === false,

      invalidRequestDoesNotReachPipeline:
        callsAfterNonPost === 0
        && callsAfterInvalidPost === 0,

      validSourceRequestIsAccepted:
        validPost.state.statusCode
          === 200
        && readBodyValue(
          validPost.state.body,
          "success",
        ) === true,

      validRequestRunsPipelineOnce:
        pipelineCallCount === 1,

      gptRequestReachesClientBoundary:
        capturedRequests.length === 1
        && Boolean(
          deliveredRequest,
        ),

      gptRequestContainsDecision:
        gptRequestContainsDecision(
          deliveredRequest,
          expectedFinalDecision,
        ),

      gptRequestLocksEngineVerdict:
        deliveredRequest
          ?.systemPrompt
          .includes(
            "엔진의 verdict를 변경하지 않는다.",
          ) === true,

      answerIsTrimmed:
        readBodyValue(
          validPost.state.body,
          "answer",
        ) ===
          "엔진 판단을 설명한 상담 답변입니다.",

      emptyAnswerIsRejected:
        emptyAnswer.state.statusCode
          === 500
        && readBodyValue(
          emptyAnswer.state.body,
          "success",
        ) === false,
    };

    const crossChecks = {
      missingExpectedFinalDecisionFails:
        Boolean(
          deliveredRequest,
        )
        && gptRequestContainsDecision(
          withUserPrompt(
            deliveredRequest,
            replaceAllOccurrences(
              deliveredUserPrompt,
              expectedFinalDecision,
              "",
            ),
          ),
          expectedFinalDecision,
        ) === false,

      duplicatedExpectedFinalDecisionFails:
        Boolean(
          deliveredRequest,
        )
        && gptRequestContainsDecision(
          withUserPrompt(
            deliveredRequest,
            deliveredUserPrompt
              + expectedFinalDecision,
          ),
          expectedFinalDecision,
        ) === false,

      missingFinalDecisionSectionTitleFails:
        Boolean(
          deliveredRequest,
        )
        && gptRequestContainsDecision(
          withUserPrompt(
            deliveredRequest,
            replaceAllOccurrences(
              deliveredUserPrompt,
              FINAL_DECISION_SECTION_TITLE,
              "",
            ),
          ),
          expectedFinalDecision,
        ) === false,

      otherFinalDecisionFails:
        Boolean(
          deliveredRequest,
        )
        && OTHER_FINAL_DECISION
          !== expectedFinalDecision
        && gptRequestContainsDecision(
          withUserPrompt(
            deliveredRequest,
            replaceAllOccurrences(
              deliveredUserPrompt,
              expectedFinalDecision,
              OTHER_FINAL_DECISION,
            ),
          ),
          expectedFinalDecision,
        ) === false,
    };

    return {
      checks,

      crossChecks,

      passed:
        Object.values(checks)
          .every(Boolean)
        && Object.values(crossChecks)
          .every(Boolean),
    };
  }
