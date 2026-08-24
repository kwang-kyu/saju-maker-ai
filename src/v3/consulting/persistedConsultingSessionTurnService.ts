import type {
    ConsultingSession,
  } from "./consultingSession.js";
  import type {
    ConsultingAnswerRequestFunction,
  } from "./consultingSessionAnswerRequester.js";
  import type {
    ConsultingSessionRepository,
  } from "./consultingSessionRepository.js";
  import {
    executeConsultingSessionTurn,
  } from "./consultingSessionTurnExecutor.js";
  import type {
    BuildConsultingSessionTurnInput,
    PrepareConsultingSessionTurnInput,
  } from "./consultingSessionTurnBuilder.js";

  export class ConsultingSessionNotFoundError
    extends Error {
    readonly sessionId:
      string;

    constructor(
      sessionId:
        string,
    ) {
      super(
        `Consulting session was not found: ${sessionId}`,
      );

      this.name =
        "ConsultingSessionNotFoundError";

      this.sessionId =
        sessionId;
    }
  }

  export class ConsultingSessionConflictError
    extends Error {
    readonly sessionId:
      string;

    readonly expectedUpdatedAt:
      string;

    readonly currentUpdatedAt:
      string;

    constructor(
      input: {
        sessionId:
          string;

        expectedUpdatedAt:
          string;

        currentUpdatedAt:
          string;
      },
    ) {
      super(
        `Consulting session update conflict: ${input.sessionId}`,
      );

      this.name =
        "ConsultingSessionConflictError";

      this.sessionId =
        input.sessionId;

      this.expectedUpdatedAt =
        input.expectedUpdatedAt;

      this.currentUpdatedAt =
        input.currentUpdatedAt;
    }
  }

  export type ExecutePersistedConsultingSessionTurnInput = {
    repository:
      ConsultingSessionRepository;

    sessionId:
      string;

    preparationInput:
      Omit<
        PrepareConsultingSessionTurnInput,
        "session"
      >;

    turnId:
      BuildConsultingSessionTurnInput["turnId"];

    createdAt:
      BuildConsultingSessionTurnInput["createdAt"];

    confirmedFacts?:
      BuildConsultingSessionTurnInput["confirmedFacts"];

    requestAnswer?:
      ConsultingAnswerRequestFunction;
  };

  function requireNonEmptyValue(
    value:
      string,
    fieldName:
      string,
  ): void {
    if (
      value
        .trim()
        .length
      === 0
    ) {
      throw new Error(
        `${fieldName} must not be empty.`,
      );
    }
  }

  /**
   * 영속 저장된 연속 상담 세션에 후속 턴을 실행한다.
   *
   * 조회 당시 updatedAt을 저장 조건으로 사용하여,
   * 동시에 실행된 다른 요청이 먼저 세션을 갱신했다면
   * 현재 결과가 기존 턴을 덮어쓰지 못하도록 conflict로 중단한다.
   */
  export async function executePersistedConsultingSessionTurn(
    input:
      ExecutePersistedConsultingSessionTurnInput,
  ): Promise<ConsultingSession> {
    requireNonEmptyValue(
      input.sessionId,
      "sessionId",
    );

    const currentSession =
      await input
        .repository
        .findById(
          input.sessionId,
        );

    if (
      currentSession
      === null
    ) {
      throw new ConsultingSessionNotFoundError(
        input.sessionId,
      );
    }

    const expectedUpdatedAt =
      currentSession
        .updatedAt;

    const nextSession =
      await executeConsultingSessionTurn({
        preparationInput: {
          ...input
            .preparationInput,

          session:
            currentSession,
        },

        turnId:
          input.turnId,

        createdAt:
          input.createdAt,

        confirmedFacts:
          input.confirmedFacts,

        requestAnswer:
          input.requestAnswer,
      });

    const updateResult =
      await input
        .repository
        .update({
          session:
            nextSession,

          expectedUpdatedAt,
        });

    if (
      updateResult.status
      === "notFound"
    ) {
      throw new ConsultingSessionNotFoundError(
        input.sessionId,
      );
    }

    if (
      updateResult.status
      === "conflict"
    ) {
      throw new ConsultingSessionConflictError({
        sessionId:
          input.sessionId,

        expectedUpdatedAt,

        currentUpdatedAt:
          updateResult
            .currentUpdatedAt,
      });
    }

    return nextSession;
  }
