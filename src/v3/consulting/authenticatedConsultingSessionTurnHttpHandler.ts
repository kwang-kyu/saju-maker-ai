import type {
    ConsultingSession,
    ConsultingSessionStatus,
    ConsultingTurnKind,
  } from "./consultingSession";
  import {
    InvalidAuthenticatedConsultingSessionTurnRequestError,
  } from "./authenticatedConsultingSessionTurnRequest";
  import {
    ConsultingSessionAuthenticationError,
  } from "./consultingSessionOwnerResolver";
  import {
    ConsultingSessionConflictError,
    ConsultingSessionNotFoundError,
  } from "./persistedConsultingSessionTurnService";
  import {
    executeAuthenticatedConsultingSessionTurnRequest,
  } from "./authenticatedConsultingSessionTurnService";
  import type {
    ExecuteAuthenticatedConsultingSessionTurnRequestInput,
  } from "./authenticatedConsultingSessionTurnService";
  import type {
    ConsultingSessionAuthorizationHeader,
  } from "./consultingSessionOwnerResolver";
  import type {
    SupabaseServerEnvironment,
  } from "./supabaseConsultingSessionRepositoryFactory";

  export type AuthenticatedConsultingSessionTurnHttpRequest = {
    method:
      string | undefined;

    authorizationHeader:
      ConsultingSessionAuthorizationHeader;

    body:
      unknown;

    environment?:
      SupabaseServerEnvironment;
  };

  export type AuthenticatedConsultingSessionTurnHttpSuccessBody = {
    sessionId:
      string;

    status:
      ConsultingSessionStatus;

    updatedAt:
      string;

    turn: {
      id:
        string;

      sequence:
        number;

      kind:
        ConsultingTurnKind;

      question:
        string;

      assistantAnswer:
        string;

      createdAt:
        string;
    };

    pendingClarification:
      ConsultingSession["pendingClarification"];
  };

  export type AuthenticatedConsultingSessionTurnHttpErrorCode =
    | "methodNotAllowed"
    | "invalidRequest"
    | "unauthorized"
    | "sessionNotFound"
    | "sessionConflict"
    | "internalError";

  export type AuthenticatedConsultingSessionTurnHttpResponse =
    | {
        status:
          200;

        body:
          AuthenticatedConsultingSessionTurnHttpSuccessBody;
      }
    | {
        status:
          400 | 401 | 404 | 405 | 409 | 500;

        body: {
          error:
            AuthenticatedConsultingSessionTurnHttpErrorCode;
        };
      };

  export type AuthenticatedConsultingSessionTurnHttpHandlerDependencies = {
    executeTurnRequest(
      input:
        ExecuteAuthenticatedConsultingSessionTurnRequestInput,
    ): Promise<ConsultingSession>;
  };

  const DEFAULT_DEPENDENCIES:
    AuthenticatedConsultingSessionTurnHttpHandlerDependencies = {
      executeTurnRequest(
        input:
          ExecuteAuthenticatedConsultingSessionTurnRequestInput,
      ) {
        return executeAuthenticatedConsultingSessionTurnRequest(
          input,
        );
      },
    };

  function buildSuccessBody(
    session:
      ConsultingSession,
  ): AuthenticatedConsultingSessionTurnHttpSuccessBody {
    const latestTurn =
      session.turns[
        session.turns.length - 1
      ];

    return {
      sessionId:
        session.id,

      status:
        session.status,

      updatedAt:
        session.updatedAt,

      turn: {
        id:
          latestTurn.id,

        sequence:
          latestTurn.sequence,

        kind:
          latestTurn.kind,

        question:
          latestTurn.question,

        assistantAnswer:
          latestTurn.assistantAnswer,

        createdAt:
          latestTurn.createdAt,
      },

      pendingClarification:
        session.pendingClarification,
    };
  }

  function buildErrorResponse(
    status:
      400 | 401 | 404 | 405 | 409 | 500,
    error:
      AuthenticatedConsultingSessionTurnHttpErrorCode,
  ): AuthenticatedConsultingSessionTurnHttpResponse {
    return {
      status,

      body: {
        error,
      },
    };
  }

  /**
   * 인증된 연속 상담 후속 턴의 HTTP 계약이다.
   *
   * 내부 엔진 결과와 저장소 구조는 외부로 노출하지 않고,
   * 화면에 필요한 최신 상담 턴과 세션 상태만 반환한다.
   */
  export async function handleAuthenticatedConsultingSessionTurnHttpRequest(
    request:
      AuthenticatedConsultingSessionTurnHttpRequest,
    dependencies:
      AuthenticatedConsultingSessionTurnHttpHandlerDependencies =
        DEFAULT_DEPENDENCIES,
  ): Promise<AuthenticatedConsultingSessionTurnHttpResponse> {
    if (
      request.method
        ?.toUpperCase()
      !== "POST"
    ) {
      return buildErrorResponse(
        405,
        "methodNotAllowed",
      );
    }

    const serviceInput:
      ExecuteAuthenticatedConsultingSessionTurnRequestInput = {
        authorizationHeader:
          request.authorizationHeader,

        request:
          request.body,
    };

    if (
      request.environment
      !== undefined
    ) {
      serviceInput.environment =
        request.environment;
    }

    try {
      const session =
        await dependencies
          .executeTurnRequest(
            serviceInput,
          );

      return {
        status:
          200,

        body:
          buildSuccessBody(
            session,
          ),
      };
    } catch (
      error
    ) {
      if (
        error
        instanceof InvalidAuthenticatedConsultingSessionTurnRequestError
      ) {
        return buildErrorResponse(
          400,
          "invalidRequest",
        );
      }

      if (
        error
        instanceof ConsultingSessionAuthenticationError
      ) {
        return buildErrorResponse(
          401,
          "unauthorized",
        );
      }

      if (
        error
        instanceof ConsultingSessionNotFoundError
      ) {
        return buildErrorResponse(
          404,
          "sessionNotFound",
        );
      }

      if (
        error
        instanceof ConsultingSessionConflictError
      ) {
        return buildErrorResponse(
          409,
          "sessionConflict",
        );
      }

      return buildErrorResponse(
        500,
        "internalError",
      );
    }
  }
