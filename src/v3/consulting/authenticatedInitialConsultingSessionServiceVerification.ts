import type {
    ConsultingSession,
  } from "./consultingSession";
  import type {
    ConsultingSessionRepository,
  } from "./consultingSessionRepository";
  import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import type {
    InitialConsultingSessionBuilderInput,
  } from "./initialConsultingSessionBuilder";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification";
  import {
    ConsultingSessionAuthenticationError,
  } from "./consultingSessionOwnerResolver";
  import {
    InitialConsultingSessionAlreadyExistsError,
    InvalidAuthenticatedInitialConsultingSessionCommandError,
    createAuthenticatedInitialConsultingSession,
  } from "./authenticatedInitialConsultingSessionService";
  import type {
    AuthenticatedInitialConsultingSessionServiceDependencies,
    CreateAuthenticatedInitialConsultingSessionInput,
  } from "./authenticatedInitialConsultingSessionService";

  export type AuthenticatedInitialConsultingSessionServiceVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  export async function verifyAuthenticatedInitialConsultingSessionService():
    Promise<AuthenticatedInitialConsultingSessionServiceVerificationResult> {
    const request =
      createSourceRequest();

    const execution =
      buildInitialConsultingExecution(
        request,
      );

    const authorizationHeader =
      "Bearer initial-session-access-token";

    const environment = {
      SUPABASE_URL:
        "https://verification.supabase.co",

      SUPABASE_SECRET_KEY:
        "verification-server-secret",
    };

    const serviceInput:
      CreateAuthenticatedInitialConsultingSessionInput = {
        authorizationHeader,

        request,

        environment,
      };

    const assistantAnswer =
      "현재 판단 결과를 기준으로 조건과 위험을 설명합니다.";

    const createdSessions:
      ConsultingSession[] = [];

    const repository:
      ConsultingSessionRepository = {
        async findById() {
          return null;
        },

        async create(
          session,
        ) {
          createdSessions.push(
            session,
          );

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

    let operationSequence =
      0;

    let repositorySequence =
      0;

    let executionSequence =
      0;

    let answerSequence =
      0;

    let sessionBuildSequence =
      0;

    let createSequence =
      0;

    let repositoryCallCount =
      0;

    let executionCallCount =
      0;

    let answerCallCount =
      0;

    let sessionBuildCallCount =
      0;

    let repositoryCreateCallCount =
      0;

      const deliveredRepositoryInputs:
    Parameters<
      AuthenticatedInitialConsultingSessionServiceDependencies[
        "createRepository"
      ]
    >[0][] = [];

    const deliveredRequests:
      typeof request[] = [];

    const deliveredSessionInputs:
      InitialConsultingSessionBuilderInput[] = [];

    const result =
      await createAuthenticatedInitialConsultingSession(
        serviceInput,
        {
          async createRepository(
            input,
          ) {
            repositoryCallCount +=
              1;

            operationSequence +=
              1;

            repositorySequence =
              operationSequence;

            deliveredRepositoryInputs.push({
              authorizationHeader:
                input.authorizationHeader,

              environment:
                input.environment,
            });

            return {
              ...repository,

              async create(
                session,
              ) {
                repositoryCreateCallCount +=
                  1;

                operationSequence +=
                  1;

                createSequence =
                  operationSequence;

                return repository.create(
                  session,
                );
              },
            };
          },

          createSessionId() {
            return "  session-initial-001  ";
          },

          createTurnId() {
            return "  turn-initial-001  ";
          },

          now() {
            return "2026-07-29T06:00:00.000Z";
          },

          buildExecution(
            sourceRequest,
          ) {
            executionCallCount +=
              1;

            operationSequence +=
              1;

            executionSequence =
              operationSequence;

            deliveredRequests.push(
              sourceRequest,
            );

            return execution;
          },

          async requestAnswer(
            deliveredExecution,
          ) {
            answerCallCount +=
              1;

            operationSequence +=
              1;

            answerSequence =
              operationSequence;

            if (
              deliveredExecution
              !== execution
            ) {
              throw new Error(
                "Unexpected initial execution.",
              );
            }

            return assistantAnswer;
          },

          buildSession(
            input,
          ) {
            sessionBuildCallCount +=
              1;

            operationSequence +=
              1;

            sessionBuildSequence =
              operationSequence;

            deliveredSessionInputs.push(
              input,
            );

            return buildInitialConsultingSession(
              input,
            );
          },
        },
      );

    const deliveredRepositoryInput =
      deliveredRepositoryInputs[0];

    const deliveredSessionInput =
      deliveredSessionInputs[0];

    const persistedSession =
      createdSessions[0];

    const authenticationError =
      new ConsultingSessionAuthenticationError(
        "missingAuthorization",
      );

    let authenticationFailureExecutionCalls =
      0;

    let authenticationFailureAnswerCalls =
      0;

    let authenticationFailureCreateCalls =
      0;

    let propagatedAuthenticationError:
      unknown =
        null;

    try {
      await createAuthenticatedInitialConsultingSession(
        serviceInput,
        {
          async createRepository() {
            throw authenticationError;
          },

          createSessionId() {
            return "unused-session";
          },

          createTurnId() {
            return "unused-turn";
          },

          now() {
            return "2026-07-29T06:01:00.000Z";
          },

          buildExecution() {
            authenticationFailureExecutionCalls +=
              1;

            return execution;
          },

          async requestAnswer() {
            authenticationFailureAnswerCalls +=
              1;

            return assistantAnswer;
          },

          buildSession(
            input,
          ) {
            authenticationFailureCreateCalls +=
              1;

            return buildInitialConsultingSession(
              input,
            );
          },
        },
      );
    } catch (
      error
    ) {
      propagatedAuthenticationError =
        error;
    }

    const answerError =
      new Error(
        "verification initial answer failure",
      );

    let answerFailureCreateCalls =
      0;

    let answerFailurePersistCalls =
      0;

    let propagatedAnswerError:
      unknown =
        null;

    try {
      await createAuthenticatedInitialConsultingSession(
        serviceInput,
        {
          async createRepository() {
            return {
              ...repository,

              async create(
                session,
              ) {
                answerFailurePersistCalls +=
                  1;

                return repository.create(
                  session,
                );
              },
            };
          },

          createSessionId() {
            return "session-answer-failure";
          },

          createTurnId() {
            return "turn-answer-failure";
          },

          now() {
            return "2026-07-29T06:02:00.000Z";
          },

          buildExecution() {
            return execution;
          },

          async requestAnswer() {
            throw answerError;
          },

          buildSession(
            input,
          ) {
            answerFailureCreateCalls +=
              1;

            return buildInitialConsultingSession(
              input,
            );
          },
        },
      );
    } catch (
      error
    ) {
      propagatedAnswerError =
        error;
    }

    const duplicateRepository:
      ConsultingSessionRepository = {
        ...repository,

        async create() {
          return {
            status:
              "alreadyExists",

            existingUpdatedAt:
              "2026-07-29T05:59:00.000Z",
          };
        },
      };

    let duplicateError:
      unknown =
        null;

    try {
      await createAuthenticatedInitialConsultingSession(
        serviceInput,
        {
          async createRepository() {
            return duplicateRepository;
          },

          createSessionId() {
            return "session-duplicate";
          },

          createTurnId() {
            return "turn-duplicate";
          },

          now() {
            return "2026-07-29T06:03:00.000Z";
          },

          buildExecution() {
            return execution;
          },

          async requestAnswer() {
            return assistantAnswer;
          },

          buildSession(
            input,
          ) {
            return buildInitialConsultingSession(
              input,
            );
          },
        },
      );
    } catch (
      error
    ) {
      duplicateError =
        error;
    }

    const invalidSessionIdError =
      await captureAsyncError(
        () =>
          createAuthenticatedInitialConsultingSession(
            serviceInput,
            {
              async createRepository() {
                return repository;
              },

              createSessionId() {
                return "   ";
              },

              createTurnId() {
                return "unused-turn";
              },

              now() {
                return "2026-07-29T06:04:00.000Z";
              },

              buildExecution() {
                return execution;
              },

              async requestAnswer() {
                return assistantAnswer;
              },

              buildSession(
                input,
              ) {
                return buildInitialConsultingSession(
                  input,
                );
              },
            },
          ),
      );

    const checks = {
      repositoryIsCreatedExactlyOnce:
        repositoryCallCount
        === 1,

      authenticationRunsBeforeExecution:
        repositorySequence
        > 0
        && executionSequence
        > repositorySequence,

      executionRunsBeforeAnswer:
        answerSequence
        > executionSequence,

      answerRunsBeforeSessionBuild:
        sessionBuildSequence
        > answerSequence,

      sessionBuildRunsBeforePersistence:
        createSequence
        > sessionBuildSequence,

      authorizationHeaderIsPreserved:
        deliveredRepositoryInput
          ?.authorizationHeader
        === authorizationHeader,

      environmentIsPreserved:
        deliveredRepositoryInput
          ?.environment
        === environment,

      executionIsBuiltExactlyOnce:
        executionCallCount
        === 1,

      sourceRequestIsPreserved:
        deliveredRequests[0]
        === request,

      answerIsRequestedExactlyOnce:
        answerCallCount
        === 1,

      sessionIsBuiltExactlyOnce:
        sessionBuildCallCount
        === 1,

      sessionIdIsServerGeneratedAndNormalized:
        deliveredSessionInput
          ?.sessionId
        === "session-initial-001",

      turnIdIsServerGeneratedAndNormalized:
        deliveredSessionInput
          ?.initialTurnId
        === "turn-initial-001",

      timestampIsServerGenerated:
        deliveredSessionInput
          ?.createdAt
        === "2026-07-29T06:00:00.000Z",

      assistantAnswerIsPreserved:
        deliveredSessionInput
          ?.assistantAnswer
        === assistantAnswer,

      repositoryCreateIsCalledExactlyOnce:
        repositoryCreateCallCount
        === 1,

      builtSessionIsPersisted:
        persistedSession
        === result,

      returnedSessionIsPreserved:
        result.id
        === "session-initial-001",

      authenticationFailureIsPropagated:
        propagatedAuthenticationError
        === authenticationError,

      authenticationFailureStopsExecution:
        authenticationFailureExecutionCalls
        === 0,

      authenticationFailureStopsAnswer:
        authenticationFailureAnswerCalls
        === 0,

      authenticationFailureStopsSessionBuild:
        authenticationFailureCreateCalls
        === 0,

      answerFailureIsPropagated:
        propagatedAnswerError
        === answerError,

      answerFailureStopsSessionBuild:
        answerFailureCreateCalls
        === 0,

      answerFailureStopsPersistence:
        answerFailurePersistCalls
        === 0,

      duplicateSessionUsesTypedError:
        duplicateError
        instanceof InitialConsultingSessionAlreadyExistsError,

      invalidSessionIdUsesTypedError:
        invalidSessionIdError
        instanceof InvalidAuthenticatedInitialConsultingSessionCommandError
        && invalidSessionIdError.field
        === "sessionId",
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
