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
    ConsultingSessionConflictError,
    ConsultingSessionNotFoundError,
    executePersistedConsultingSessionTurn,
  } from "./persistedConsultingSessionTurnService";
  import type {
    ConsultingSession,
  } from "./consultingSession";
  import type {
    ConsultingSessionRepository,
    CreateConsultingSessionResult,
    UpdateConsultingSessionInput,
    UpdateConsultingSessionResult,
  } from "./consultingSessionRepository";

  export type PersistedConsultingSessionTurnServiceVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  class VerificationConsultingSessionRepository
  implements ConsultingSessionRepository {
    storedSession:
      ConsultingSession | null;

    findByIdCallCount =
      0;

    updateCallCount =
      0;

    lastFindById:
      string | null =
        null;

    lastUpdateInput:
      UpdateConsultingSessionInput | null =
        null;

    forcedUpdateResult:
      UpdateConsultingSessionResult | null =
        null;

    constructor(
      session:
        ConsultingSession | null,
    ) {
      this.storedSession =
        session;
    }

    async findById(
      sessionId:
        string,
    ): Promise<ConsultingSession | null> {
      this.findByIdCallCount +=
        1;

      this.lastFindById =
        sessionId;

      return this.storedSession;
    }

    async create(
      session:
        ConsultingSession,
    ): Promise<CreateConsultingSessionResult> {
      if (
        this.storedSession
        !== null
      ) {
        return {
          status:
            "alreadyExists",

          existingUpdatedAt:
            this.storedSession
              .updatedAt,
        };
      }

      this.storedSession =
        session;

      return {
        status:
          "created",
      };
    }

    async update(
      input:
        UpdateConsultingSessionInput,
    ): Promise<UpdateConsultingSessionResult> {
      this.updateCallCount +=
        1;

      this.lastUpdateInput =
        input;

      if (
        this.forcedUpdateResult
        !== null
      ) {
        return this.forcedUpdateResult;
      }

      if (
        this.storedSession
        === null
      ) {
        return {
          status:
            "notFound",
        };
      }

      if (
        this.storedSession
          .updatedAt
        !== input
          .expectedUpdatedAt
      ) {
        return {
          status:
            "conflict",

          currentUpdatedAt:
            this.storedSession
              .updatedAt,
        };
      }

      this.storedSession =
        input.session;

      return {
        status:
          "updated",
      };
    }
  }

  function createInitialSession(
    sessionId:
      string,
  ): ConsultingSession {
    const sourceRequest =
      createSourceRequest();

    const initialExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    return buildInitialConsultingSession({
      sessionId,

      initialTurnId:
        `${sessionId}-turn-001`,

      createdAt:
        "2026-07-28T09:00:00+09:00",

      request:
        sourceRequest,

      execution:
        initialExecution,

      assistantAnswer:
        "현재 정보만으로 상가 매수를 확정할 수 없습니다. 상환능력과 결정기한을 먼저 확인해야 합니다.",
    });
  }

  async function captureRejectedError(
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

  export async function verifyPersistedConsultingSessionTurnService():
    Promise<PersistedConsultingSessionTurnServiceVerificationResult> {
    const normalSession =
      createInitialSession(
        "session-persisted-normal",
      );

    const normalRepository =
      new VerificationConsultingSessionRepository(
        normalSession,
      );

    const normalInitialTurnCount =
      normalSession
        .turns
        .length;

    let normalClientCallCount =
      0;

    const normalAnswer =
      "현재 엔진 판정에 따라 현금흐름을 보호하고 매수 규모를 제한하는 조건에서만 검토할 수 있습니다.";

    const savedSession =
      await executePersistedConsultingSessionTurn({
        repository:
          normalRepository,

        sessionId:
          normalSession.id,

        preparationInput: {
          kind:
            "clarification",

          question:
            "대출 잔액은 2억 원이고 월소득은 900만 원입니다. 두 달 뒤까지 상가 매수를 결정해야 합니다.",

          preparedAt:
            "2026-07-28T09:10:00+09:00",
        },

        turnId:
          "session-persisted-normal-turn-002",

        createdAt:
          "2026-07-28T09:11:00+09:00",

        requestAnswer:
          async () => {
            normalClientCallCount +=
              1;

            return normalAnswer;
          },
      });

    const normalUpdateInput =
      normalRepository
        .lastUpdateInput;

    const missingRepository =
      new VerificationConsultingSessionRepository(
        null,
      );

    let missingClientCallCount =
      0;

    const missingError =
      await captureRejectedError(
        () =>
          executePersistedConsultingSessionTurn({
            repository:
              missingRepository,

            sessionId:
              "session-not-found",

            preparationInput: {
              kind:
                "followUp",

              question:
                "추가 질문입니다.",

              preparedAt:
                "2026-07-28T09:20:00+09:00",
            },

            turnId:
              "session-not-found-turn-001",

            createdAt:
              "2026-07-28T09:21:00+09:00",

            requestAnswer:
              async () => {
                missingClientCallCount +=
                  1;

                return normalAnswer;
              },
          }),
      );

    const conflictSession =
      createInitialSession(
        "session-persisted-conflict",
      );

    const conflictRepository =
      new VerificationConsultingSessionRepository(
        conflictSession,
      );

    const conflictCurrentUpdatedAt =
      "2026-07-28T09:31:00+09:00";

    conflictRepository
      .forcedUpdateResult = {
        status:
          "conflict",

        currentUpdatedAt:
          conflictCurrentUpdatedAt,
      };

    const conflictError =
      await captureRejectedError(
        () =>
          executePersistedConsultingSessionTurn({
            repository:
              conflictRepository,

            sessionId:
              conflictSession.id,

            preparationInput: {
              kind:
                "followUp",

              question:
                "동시에 들어온 후속 질문입니다.",

              preparedAt:
                "2026-07-28T09:30:00+09:00",
            },

            turnId:
              "session-persisted-conflict-turn-002",

            createdAt:
              "2026-07-28T09:31:00+09:00",

            requestAnswer:
              async () =>
                normalAnswer,
          }),
      );

    const deletedSession =
      createInitialSession(
        "session-deleted-during-request",
      );

    const deletedRepository =
      new VerificationConsultingSessionRepository(
        deletedSession,
      );

    deletedRepository
      .forcedUpdateResult = {
        status:
          "notFound",
      };

    const deletedError =
      await captureRejectedError(
        () =>
          executePersistedConsultingSessionTurn({
            repository:
              deletedRepository,

            sessionId:
              deletedSession.id,

            preparationInput: {
              kind:
                "followUp",

              question:
                "저장 전에 세션이 삭제된 상황입니다.",

              preparedAt:
                "2026-07-28T09:40:00+09:00",
            },

            turnId:
              "session-deleted-during-request-turn-002",

            createdAt:
              "2026-07-28T09:41:00+09:00",

            requestAnswer:
              async () =>
                normalAnswer,
          }),
      );

    const failureSession =
      createInitialSession(
        "session-client-failure",
      );

    const failureRepository =
      new VerificationConsultingSessionRepository(
        failureSession,
      );

    const clientFailure =
      new Error(
        "Injected persisted service client failure.",
      );

    const clientFailureError =
      await captureRejectedError(
        () =>
          executePersistedConsultingSessionTurn({
            repository:
              failureRepository,

            sessionId:
              failureSession.id,

            preparationInput: {
              kind:
                "followUp",

              question:
                "Client 실패 검증 질문입니다.",

              preparedAt:
                "2026-07-28T09:50:00+09:00",
            },

            turnId:
              "session-client-failure-turn-002",

            createdAt:
              "2026-07-28T09:51:00+09:00",

            requestAnswer:
              async () => {
                throw clientFailure;
              },
          }),
      );

    const emptyIdRepository =
      new VerificationConsultingSessionRepository(
        normalSession,
      );

    const emptyIdError =
      await captureRejectedError(
        () =>
          executePersistedConsultingSessionTurn({
            repository:
              emptyIdRepository,

            sessionId:
              " ",

            preparationInput: {
              kind:
                "followUp",

              question:
                "빈 세션 ID 검증 질문입니다.",

              preparedAt:
                "2026-07-28T10:00:00+09:00",
            },

            turnId:
              "empty-id-turn",

            createdAt:
              "2026-07-28T10:01:00+09:00",

            requestAnswer:
              async () =>
                normalAnswer,
          }),
      );

    const checks = {
      repositoryIsQueriedOnce:
        normalRepository
          .findByIdCallCount
        === 1,

      requestedSessionIdIsPreserved:
        normalRepository
          .lastFindById
        === normalSession.id,

      gptClientIsCalledOnce:
        normalClientCallCount
        === 1,

      repositoryIsUpdatedOnce:
        normalRepository
          .updateCallCount
        === 1,

      expectedUpdatedAtUsesLoadedSession:
        normalUpdateInput !== null
        && normalUpdateInput
          .expectedUpdatedAt
        === normalSession
          .updatedAt,

      updatedSessionIsPassedToRepository:
        normalUpdateInput !== null
        && normalUpdateInput
          .session
        === savedSession,

      repositoryStoresReturnedSession:
        normalRepository
          .storedSession
        === savedSession,

      exactlyOneTurnIsPersisted:
        savedSession
          .turns
          .length
        === normalInitialTurnCount
        + 1,

      persistedTurnStoresAssistantAnswer:
        savedSession
          .turns[
            savedSession
              .turns
              .length
            - 1
          ]
          .assistantAnswer
        === normalAnswer,

      missingSessionUsesTypedError:
        missingError
        instanceof ConsultingSessionNotFoundError,

      missingSessionDoesNotCallClient:
        missingClientCallCount
        === 0,

      missingSessionDoesNotUpdateRepository:
        missingRepository
          .updateCallCount
        === 0,

      conflictUsesTypedError:
        conflictError
        instanceof ConsultingSessionConflictError,

      conflictKeepsSessionId:
        conflictError
        instanceof ConsultingSessionConflictError
        && conflictError
          .sessionId
        === conflictSession.id,

      conflictKeepsExpectedUpdatedAt:
        conflictError
        instanceof ConsultingSessionConflictError
        && conflictError
          .expectedUpdatedAt
        === conflictSession
          .updatedAt,

      conflictKeepsCurrentUpdatedAt:
        conflictError
        instanceof ConsultingSessionConflictError
        && conflictError
          .currentUpdatedAt
        === conflictCurrentUpdatedAt,

      conflictDoesNotReplaceStoredSession:
        conflictRepository
          .storedSession
        === conflictSession,

      deletedDuringRequestUsesNotFoundError:
        deletedError
        instanceof ConsultingSessionNotFoundError,

      clientFailureIsPropagated:
        clientFailureError
        === clientFailure,

      clientFailureDoesNotUpdateRepository:
        failureRepository
          .updateCallCount
        === 0,

      clientFailureDoesNotMutateStoredSession:
        failureRepository
          .storedSession
        === failureSession,

      emptySessionIdIsRejected:
        emptyIdError
        instanceof Error,

      emptySessionIdIsRejectedBeforeLookup:
        emptyIdRepository
          .findByIdCallCount
        === 0,

      emptySessionIdDoesNotUpdateRepository:
        emptyIdRepository
          .updateCallCount
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
