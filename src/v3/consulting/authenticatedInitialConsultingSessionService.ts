import {
    randomUUID,
  } from "node:crypto";

  import type {
    ConsultingSession,
  } from "./consultingSession.js";
  import type {
    ConsultingSessionAuthorizationHeader,
  } from "./consultingSessionOwnerResolver.js";
  import type {
    ConsultingSessionRepository,
  } from "./consultingSessionRepository.js";
  import {
    createAuthenticatedSupabaseConsultingSessionRepository,
  } from "./authenticatedSupabaseConsultingSessionRepositoryFactory.js";
  import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder.js";
  import {
    interpretQuestionSemantics,
  } from "./question/questionSemanticInterpreter.js";
  import type {
    QuestionReaderResult,
  } from "./question/questionReader.js";
  import type {
    InitialConsultingExecutionResult,
  } from "./initialConsultingExecutionBuilder.js";
  import {
    requestInitialConsultingAnswer,
  } from "./initialConsultingAnswerRequester.js";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder.js";
  import type {
    InitialConsultingSessionBuilderInput,
  } from "./initialConsultingSessionBuilder.js";
  import type {
    SupabaseServerEnvironment,
  } from "./supabaseConsultingSessionRepositoryFactory.js";
  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest.js";
  import {
    buildConsultingClarificationAnswer,
  } from "./consultingClarificationAnswerBuilder.js";
  import {
    buildConsultingClarification,
  } from "./consultingClarificationBuilder.js";

  export type CreateAuthenticatedInitialConsultingSessionInput = {
    authorizationHeader:
      ConsultingSessionAuthorizationHeader;

    request:
      V3ConsultingRequest;

    environment?:
      SupabaseServerEnvironment;
  };

  export type AuthenticatedInitialConsultingSessionServiceDependencies = {
    createRepository(
      input: {
        authorizationHeader:
          ConsultingSessionAuthorizationHeader;

        environment?:
          SupabaseServerEnvironment;
      },
    ): Promise<ConsultingSessionRepository>;

    createSessionId():
      string;

    createTurnId():
      string;

    now():
      string;

      interpretQuestion(
      question:
      string,
    ): Promise<QuestionReaderResult>;

    buildExecution(
        request:
          V3ConsultingRequest,
        questionInterpretation?:
          QuestionReaderResult,
      ): InitialConsultingExecutionResult;

    requestAnswer(
      execution:
        InitialConsultingExecutionResult,
    ): Promise<string>;

    buildSession(
      input:
        InitialConsultingSessionBuilderInput,
    ): ConsultingSession;
  };

  export class InvalidAuthenticatedInitialConsultingSessionCommandError
    extends Error {
    readonly field:
      "sessionId" | "turnId" | "timestamp";

    constructor(
      field:
        "sessionId" | "turnId" | "timestamp",
    ) {
      super(
        `Server-generated initial consulting ${field} is invalid.`,
      );

      this.name =
        "InvalidAuthenticatedInitialConsultingSessionCommandError";

      this.field =
        field;
    }
  }

  export class InitialConsultingSessionAlreadyExistsError
    extends Error {
    readonly sessionId:
      string;

    readonly existingUpdatedAt:
      string;

    constructor(
      input: {
        sessionId:
          string;

        existingUpdatedAt:
          string;
      },
    ) {
      super(
        `Initial consulting session already exists: ${input.sessionId}`,
      );

      this.name =
        "InitialConsultingSessionAlreadyExistsError";

      this.sessionId =
        input.sessionId;

      this.existingUpdatedAt =
        input.existingUpdatedAt;
    }
  }

  const DEFAULT_DEPENDENCIES:
    AuthenticatedInitialConsultingSessionServiceDependencies = {
      createRepository(
        input,
      ) {
        return createAuthenticatedSupabaseConsultingSessionRepository(
          input,
        );
      },

      createSessionId() {
        return randomUUID();
      },

      createTurnId() {
        return randomUUID();
      },

      now() {
        return new Date()
          .toISOString();
      },

      interpretQuestion(
        question,
      ) {
        return interpretQuestionSemantics(
          question,
        );
      },

      buildExecution(
        request,
        questionInterpretation,
      ) {
        return buildInitialConsultingExecution(
          request,
          questionInterpretation,
        );
      },

      requestAnswer(
        execution,
      ) {
        return requestInitialConsultingAnswer(
          execution,
        );
      },

      buildSession(
        input,
      ) {
        return buildInitialConsultingSession(
          input,
        );
      },
    };

  function requireServerIdentifier(
    value:
      string,
    field:
      "sessionId" | "turnId",
  ): string {
    const normalizedValue =
      value.trim();

    if (
      normalizedValue.length
      === 0
    ) {
      throw new InvalidAuthenticatedInitialConsultingSessionCommandError(
        field,
      );
    }

    return normalizedValue;
  }

  function requireServerTimestamp(
    value:
      string,
  ): string {
    const normalizedValue =
      value.trim();

    if (
      normalizedValue.length
      === 0
      || !Number.isFinite(
        Date.parse(
          normalizedValue,
        ),
      )
    ) {
      throw new InvalidAuthenticatedInitialConsultingSessionCommandError(
        "timestamp",
      );
    }

    return normalizedValue;
  }

  /**
   * 인증된 사용자의 최초 상담을 실행하고 소유자 범위 저장소에 생성한다.
   *
   * 인증 성공 전에는 사주 계산과 OpenAI 요청을 실행하지 않는다.
   * sessionId·initialTurnId·createdAt은 서버에서만 생성한다.
   */
  export async function createAuthenticatedInitialConsultingSession(
    input:
      CreateAuthenticatedInitialConsultingSessionInput,
    dependencies:
      AuthenticatedInitialConsultingSessionServiceDependencies =
        DEFAULT_DEPENDENCIES,
  ): Promise<ConsultingSession> {
    const repository =
      await dependencies
        .createRepository({
          authorizationHeader:
            input.authorizationHeader,

          environment:
            input.environment,
        });

    const sessionId =
      requireServerIdentifier(
        dependencies.createSessionId(),
        "sessionId",
      );

    const initialTurnId =
      requireServerIdentifier(
        dependencies.createTurnId(),
        "turnId",
      );

    const createdAt =
      requireServerTimestamp(
        dependencies.now(),
      );

      const questionInterpretation =
      await dependencies
        .interpretQuestion(
          input.request
            .question,
        );

    const execution =
      dependencies
        .buildExecution(
          input.request,
          questionInterpretation,
        );

        const clarification =
        buildConsultingClarification({
          decisionTurnId:
            initialTurnId,

          lifeContext:
            execution
              .lifeContext,

          questionContext:
            execution
              .turnResult
              .questionContext,

          decisionResult:
            execution
              .turnResult
              .decisionResult,
        });

      const assistantAnswer =
        clarification
          ? buildConsultingClarificationAnswer({
              originalQuestion:
                execution
                  .turnResult
                  .questionReaderResult
                  .originalQuestion,

              clarification,
            })
          : await dependencies
              .requestAnswer(
                execution,
              );

    const session =
      dependencies
        .buildSession({
          sessionId,

          initialTurnId,

          createdAt,

          request:
            input.request,

          execution,

          assistantAnswer,
        });

    const createResult =
      await repository
        .create(
          session,
        );

    if (
      createResult.status
      === "alreadyExists"
    ) {
      throw new InitialConsultingSessionAlreadyExistsError({
        sessionId,

        existingUpdatedAt:
          createResult.existingUpdatedAt,
      });
    }

    return session;
  }
