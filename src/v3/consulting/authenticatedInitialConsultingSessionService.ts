import {
    randomUUID,
  } from "node:crypto";

  import type {
    ConsultingSession,
  } from "./consultingSession";
  import type {
    ConsultingSessionAuthorizationHeader,
  } from "./consultingSessionOwnerResolver";
  import type {
    ConsultingSessionRepository,
  } from "./consultingSessionRepository";
  import {
    createAuthenticatedSupabaseConsultingSessionRepository,
  } from "./authenticatedSupabaseConsultingSessionRepositoryFactory";
  import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import type {
    InitialConsultingExecutionResult,
  } from "./initialConsultingExecutionBuilder";
  import {
    requestInitialConsultingAnswer,
  } from "./initialConsultingAnswerRequester";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder";
  import type {
    InitialConsultingSessionBuilderInput,
  } from "./initialConsultingSessionBuilder";
  import type {
    SupabaseServerEnvironment,
  } from "./supabaseConsultingSessionRepositoryFactory";
  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest";

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

    buildExecution(
      request:
        V3ConsultingRequest,
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

      buildExecution(
        request,
      ) {
        return buildInitialConsultingExecution(
          request,
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

    const execution =
      dependencies
        .buildExecution(
          input.request,
        );

    const assistantAnswer =
      await dependencies
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
