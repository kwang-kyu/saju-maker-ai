import {
    buildConsultingClarification,
  } from "./consultingClarificationBuilder.js";
  import type {
    ConsultingSession,
  } from "./consultingSession.js";
  import type {
    InitialConsultingExecutionResult,
  } from "./initialConsultingExecutionBuilder.js";
  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest.js";

  export type InitialConsultingSessionBuilderInput = {
    sessionId:
      string;

    initialTurnId:
      string;

    createdAt:
      string;

    request:
      V3ConsultingRequest;

    execution:
      InitialConsultingExecutionResult;

    assistantAnswer:
      string;
  };

  function requireNonEmptyValue(
    value:
      string,
    fieldName:
      string,
  ): void {
    if (
      value.trim().length
      === 0
    ) {
      throw new Error(
        `${fieldName} must not be empty.`,
      );
    }
  }

  /**
   * 최초 상담의 구조화된 실행 결과와 GPT 설명을 결합해
   * 연속 상담 세션의 첫 상태를 만든다.
   *
   * Calculator·Facts·Reader·Decision은 다시 실행하지 않으며,
   * buildInitialConsultingExecution이 만든 결과만 보존한다.
   */
  export function buildInitialConsultingSession(
    input:
      InitialConsultingSessionBuilderInput,
  ): ConsultingSession {
    requireNonEmptyValue(
      input.sessionId,
      "sessionId",
    );

    requireNonEmptyValue(
      input.initialTurnId,
      "initialTurnId",
    );

    requireNonEmptyValue(
      input.createdAt,
      "createdAt",
    );

    requireNonEmptyValue(
      input.assistantAnswer,
      "assistantAnswer",
    );

    const turnResult =
      input.execution
        .turnResult;

    if (
      turnResult
        .questionReaderResult
        .originalQuestion
      !== input.request.question
    ) {
      throw new Error(
        "Initial consulting execution does not match the source question.",
      );
    }

    const pendingClarification =
      buildConsultingClarification({
        decisionTurnId:
          input.initialTurnId,

        lifeContext:
          input.execution
            .lifeContext,

        questionContext:
          turnResult
            .questionContext,

        decisionResult:
          turnResult
            .decisionResult,
      });

    return {
      id:
        input.sessionId,

      status:
        pendingClarification
          ? "awaitingClarification"
          : "active",

      createdAt:
        input.createdAt,

      updatedAt:
        input.createdAt,

      sajuInput:
        input.request
          .sajuInput,

      sajuFacts:
        input.execution
          .humanDestinyPipeline
          .sajuFactsPipeline,

      readerEvidence:
        input.execution
          .humanDestinyPipeline
          .evidenceBundle,

      humanContext:
        input.execution
          .humanDestinyPipeline
          .humanContext,

      lifeContextHistory: [
        {
          revision:
            1,

          sourceInput:
            input.request
              .humanLifeContextInput,

          lifeContext:
            input.execution
              .lifeContext,

          updatedAt:
            input.createdAt,
        },
      ],

      turns: [
        {
          id:
            input.initialTurnId,

          sequence:
            1,

          kind:
            "initial",

          question:
            input.request
              .question,

          lifeContextRevision:
            1,

          questionReaderResult:
            turnResult
              .questionReaderResult,

          questionContext:
            turnResult
              .questionContext,

          decisionResult:
            turnResult
              .decisionResult,

          assistantAnswer:
            input.assistantAnswer,

          createdAt:
            input.createdAt,
        },
      ],

      confirmedFacts:
        [],

      pendingClarification,
    };
  }