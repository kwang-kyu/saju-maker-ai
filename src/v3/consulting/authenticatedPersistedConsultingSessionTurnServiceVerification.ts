import {
    executeAuthenticatedPersistedConsultingSessionTurn,
  } from "./authenticatedPersistedConsultingSessionTurnService";
  import type {
    AuthenticatedPersistedConsultingSessionTurnDependencies,
  } from "./authenticatedPersistedConsultingSessionTurnService";
  import type {
    CreateAuthenticatedSupabaseConsultingSessionRepositoryInput,
  } from "./authenticatedSupabaseConsultingSessionRepositoryFactory";
  import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification";
  import type {
    ExecutePersistedConsultingSessionTurnInput,
  } from "./persistedConsultingSessionTurnService";
  import type {
    ConsultingSessionRepository,
  } from "./consultingSessionRepository";
  import type {
    SupabaseServerEnvironment,
  } from "./supabaseConsultingSessionRepositoryFactory";

  export type AuthenticatedPersistedConsultingSessionTurnServiceVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

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

  export async function verifyAuthenticatedPersistedConsultingSessionTurnService():
    Promise<AuthenticatedPersistedConsultingSessionTurnServiceVerificationResult> {
    const request =
      createSourceRequest();

    const execution =
      buildInitialConsultingExecution(
        request,
      );

    const returnedSession =
      buildInitialConsultingSession({
        sessionId:
          "session-authenticated-turn-001",

        initialTurnId:
          "turn-authenticated-initial-001",

        createdAt:
          "2026-07-29T04:10:00+09:00",

        request,

        execution,

        assistantAnswer:
          "인증된 세션 서비스 검증용 최초 답변입니다.",
      });

    const repository:
      ConsultingSessionRepository = {
        async findById() {
          return null;
        },

        async create() {
          return {
            status:
              "created",
          };
        },

        async update() {
          return {
            status:
              "updated",
          };
        },
      };

    const environment:
      SupabaseServerEnvironment = {
        SUPABASE_URL:
          "https://verification.supabase.co",

        SUPABASE_SECRET_KEY:
          "verification-server-secret",
      };

    const repositoryInputs:
      CreateAuthenticatedSupabaseConsultingSessionRepositoryInput[] = [];

    const executeInputs:
      ExecutePersistedConsultingSessionTurnInput[] = [];

    let createRepositoryCallCount =
      0;

    let executeTurnCallCount =
      0;

    const dependencies:
      AuthenticatedPersistedConsultingSessionTurnDependencies = {
        async createRepository(
          input:
            CreateAuthenticatedSupabaseConsultingSessionRepositoryInput,
        ) {
          createRepositoryCallCount +=
            1;

          repositoryInputs.push(
            input,
          );

          return repository;
        },

        async executeTurn(
          input:
            ExecutePersistedConsultingSessionTurnInput,
        ) {
          executeTurnCallCount +=
            1;

          executeInputs.push(
            input,
          );

          return returnedSession;
        },
      };

    const requestAnswer =
      async () =>
        "검증용 후속 상담 답변입니다.";

    const result =
      await executeAuthenticatedPersistedConsultingSessionTurn(
        {
          authorizationHeader:
            "Bearer authenticated-turn-token",

          environment,

          sessionId:
            returnedSession.id,

          preparationInput: {
            kind:
              "followUp",

            question:
              "현재 조건에서 다음 선택은 무엇인가요?",

            preparedAt:
              "2026-07-29T04:20:00+09:00",
          },

          turnId:
            "turn-authenticated-follow-up-002",

          createdAt:
            "2026-07-29T04:21:00+09:00",

          confirmedFacts: [
            {
              key:
                "current-income",

              description:
                "현재 소득 조건이 유지되고 있다.",
            },
          ],

          requestAnswer,
        },
        dependencies,
      );

    const repositoryInput =
      repositoryInputs[0];

    const executeInput =
      executeInputs[0];

    const repositoryFailure =
      new Error(
        "Verification repository creation failure.",
      );

    let executeAfterRepositoryFailureCallCount =
      0;

    const repositoryFailureError =
      await captureAsyncError(
        () =>
          executeAuthenticatedPersistedConsultingSessionTurn(
            {
              authorizationHeader:
                "Bearer repository-failure-token",

              environment,

              sessionId:
                returnedSession.id,

              preparationInput: {
                kind:
                  "followUp",

                question:
                  "Repository 실패 검증 질문",

                preparedAt:
                  "2026-07-29T04:30:00+09:00",
              },

              turnId:
                "turn-repository-failure",

              createdAt:
                "2026-07-29T04:31:00+09:00",
            },
            {
              async createRepository() {
                throw repositoryFailure;
              },

              async executeTurn() {
                executeAfterRepositoryFailureCallCount +=
                  1;

                return returnedSession;
              },
            },
          ),
      );

    const executeFailure =
      new Error(
        "Verification persisted turn execution failure.",
      );

    let repositoryBeforeExecuteFailureCallCount =
      0;

    const executeFailureError =
      await captureAsyncError(
        () =>
          executeAuthenticatedPersistedConsultingSessionTurn(
            {
              authorizationHeader:
                "Bearer execute-failure-token",

              environment,

              sessionId:
                returnedSession.id,

              preparationInput: {
                kind:
                  "followUp",

                question:
                  "턴 실행 실패 검증 질문",

                preparedAt:
                  "2026-07-29T04:40:00+09:00",
              },

              turnId:
                "turn-execute-failure",

              createdAt:
                "2026-07-29T04:41:00+09:00",
            },
            {
              async createRepository() {
                repositoryBeforeExecuteFailureCallCount +=
                  1;

                return repository;
              },

              async executeTurn() {
                throw executeFailure;
              },
            },
          ),
      );

    const checks = {
      repositoryIsCreatedExactlyOnce:
        createRepositoryCallCount
        === 1,

      persistedTurnIsExecutedExactlyOnce:
        executeTurnCallCount
        === 1,

      authorizationHeaderIsPreserved:
        repositoryInput
          ?.authorizationHeader
        === "Bearer authenticated-turn-token",

      environmentIsPreserved:
        repositoryInput
          ?.environment
        === environment,

      authenticatedRepositoryIsDelivered:
        executeInput
          ?.repository
        === repository,

      sessionIdIsPreserved:
        executeInput
          ?.sessionId
        === returnedSession.id,

      preparationKindIsPreserved:
        executeInput
          ?.preparationInput
          .kind
        === "followUp",

      preparationQuestionIsPreserved:
        executeInput
          ?.preparationInput
          .question
        === "현재 조건에서 다음 선택은 무엇인가요?",

      preparationTimeIsPreserved:
        executeInput
          ?.preparationInput
          .preparedAt
        === "2026-07-29T04:20:00+09:00",

      turnIdIsPreserved:
        executeInput
          ?.turnId
        === "turn-authenticated-follow-up-002",

      createdAtIsPreserved:
        executeInput
          ?.createdAt
        === "2026-07-29T04:21:00+09:00",

      confirmedFactsArePreserved:
        executeInput
          ?.confirmedFacts
          ?.[0]
          ?.key
        === "current-income",

      answerRequesterIsPreserved:
        executeInput
          ?.requestAnswer
        === requestAnswer,

      returnedSessionIsPreserved:
        result
        === returnedSession,

      repositoryFailureIsPropagated:
        repositoryFailureError
        === repositoryFailure,

      repositoryFailureStopsTurnExecution:
        executeAfterRepositoryFailureCallCount
        === 0,

      repositoryIsCreatedBeforeTurnExecution:
        repositoryBeforeExecuteFailureCallCount
        === 1,

      turnExecutionFailureIsPropagated:
        executeFailureError
        === executeFailure,
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
