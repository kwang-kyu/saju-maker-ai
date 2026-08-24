import type {
    ConsultingSession,
  } from "./consultingSession.js";
  import {
    createAuthenticatedInitialConsultingSession,
    InitialConsultingSessionAlreadyExistsError,
  } from "./authenticatedInitialConsultingSessionService.js";
  import type {
    CreateAuthenticatedInitialConsultingSessionInput,
  } from "./authenticatedInitialConsultingSessionService.js";
  import {
    ConsultingSessionAuthenticationError,
  } from "./consultingSessionOwnerResolver.js";
  import type {
    ConsultingSessionAuthorizationHeader,
  } from "./consultingSessionOwnerResolver.js";
  import type {
    SupabaseServerEnvironment,
  } from "./supabaseConsultingSessionRepositoryFactory.js";
  import {
    isV3ConsultingRequest,
  } from "./v3ConsultingRequest.js";

  export type AuthenticatedInitialConsultingSessionHttpRequest = {
    method:
      string | undefined;

    authorizationHeader:
      ConsultingSessionAuthorizationHeader;

    body:
      unknown;

    environment?:
      SupabaseServerEnvironment;
  };

  export type AuthenticatedInitialConsultingSessionHttpSuccessBody = {
    sessionId:
      string;

    status:
      ConsultingSession["status"];

    createdAt:
      string;

    updatedAt:
      string;

    initialTurnId:
      string;

    initialTurnSequence:
      number;

    question:
      string;

    assistantAnswer:
      string;

    pendingClarification:
      ConsultingSession["pendingClarification"];
  };

  export type AuthenticatedInitialConsultingSessionHttpErrorCode =
    | "methodNotAllowed"
    | "invalidRequest"
    | "authenticationRequired"
    | "sessionAlreadyExists"
    | "internalError";

  export type AuthenticatedInitialConsultingSessionHttpErrorBody = {
    error:
      AuthenticatedInitialConsultingSessionHttpErrorCode;
  };

  export type AuthenticatedInitialConsultingSessionHttpResponse =
    | {
        status:
          201;

        body:
          AuthenticatedInitialConsultingSessionHttpSuccessBody;
      }
    | {
        status:
          400 | 401 | 405 | 409 | 500;

        body:
          AuthenticatedInitialConsultingSessionHttpErrorBody;

        headers?:
          Readonly<Record<string, string>>;
      };
      export type AuthenticatedInitialConsultingSessionHttpSession = {
        id:
          ConsultingSession["id"];

        status:
          ConsultingSession["status"];

        createdAt:
          ConsultingSession["createdAt"];

        updatedAt:
          ConsultingSession["updatedAt"];

        turns:
          [
            Pick<
              ConsultingSession["turns"][number],
              | "id"
              | "sequence"
              | "question"
              | "assistantAnswer"
            >,
            ...Array<
              Pick<
                ConsultingSession["turns"][number],
                | "id"
                | "sequence"
                | "question"
                | "assistantAnswer"
              >
            >,
          ];

        pendingClarification:
          ConsultingSession["pendingClarification"];
      };

  export type AuthenticatedInitialConsultingSessionHttpHandlerDependencies = {
    executeInitialSession(
      input:
        CreateAuthenticatedInitialConsultingSessionInput,
    ): Promise<AuthenticatedInitialConsultingSessionHttpSession>;
  };

  const DEFAULT_DEPENDENCIES:
    AuthenticatedInitialConsultingSessionHttpHandlerDependencies = {
      executeInitialSession(
        input:
          CreateAuthenticatedInitialConsultingSessionInput,
      ) {
        return createAuthenticatedInitialConsultingSession(
          input,
        );
      },
    };

    function buildSuccessBody(
        session:
          AuthenticatedInitialConsultingSessionHttpSession,
      ): AuthenticatedInitialConsultingSessionHttpSuccessBody {
    const initialTurn =
      session.turns[0];

    if (
      initialTurn
      === undefined
    ) {
      throw new Error(
        "Created consulting session must contain an initial turn.",
      );
    }

    return {
      sessionId:
        session.id,

      status:
        session.status,

      createdAt:
        session.createdAt,

      updatedAt:
        session.updatedAt,

      initialTurnId:
        initialTurn.id,

      initialTurnSequence:
        initialTurn.sequence,

      question:
        initialTurn.question,

      assistantAnswer:
        initialTurn.assistantAnswer,

      pendingClarification:
        session.pendingClarification,
    };
  }

  function buildErrorResponse(
    status:
      400 | 401 | 405 | 409 | 500,
    error:
      AuthenticatedInitialConsultingSessionHttpErrorCode,
    headers?:
      Readonly<Record<string, string>>,
  ): AuthenticatedInitialConsultingSessionHttpResponse {
    const response:
      AuthenticatedInitialConsultingSessionHttpResponse = {
        status,

        body: {
          error,
        },
      };

    if (
      headers
      !== undefined
    ) {
      response.headers =
        headers;
    }

    return response;
  }

  export async function handleAuthenticatedInitialConsultingSessionHttpRequest(
    request:
      AuthenticatedInitialConsultingSessionHttpRequest,
    dependencies:
      AuthenticatedInitialConsultingSessionHttpHandlerDependencies =
        DEFAULT_DEPENDENCIES,
  ): Promise<AuthenticatedInitialConsultingSessionHttpResponse> {
    if (
      request.method
        ?.toUpperCase()
      !== "POST"
    ) {
      return buildErrorResponse(
        405,
        "methodNotAllowed",
        {
          Allow:
            "POST",
        },
      );
    }

    if (
      !isV3ConsultingRequest(
        request.body,
      )
    ) {
      return buildErrorResponse(
        400,
        "invalidRequest",
      );
    }

    try {
      const serviceInput:
        CreateAuthenticatedInitialConsultingSessionInput = {
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

      const session =
        await dependencies
          .executeInitialSession(
            serviceInput,
          );

      return {
        status:
          201,

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
        instanceof ConsultingSessionAuthenticationError
      ) {
        return buildErrorResponse(
          401,
          "authenticationRequired",
        );
      }

      if (
        error
        instanceof InitialConsultingSessionAlreadyExistsError
      ) {
        return buildErrorResponse(
          409,
          "sessionAlreadyExists",
        );
      }

      const errorRecord =
  typeof error
    === "object"
  && error
    !== null
    ? error as Record<string, unknown>
    : null;

console.error(
  "Authenticated initial consulting session failed.",
  {
    name:
      error
        instanceof Error
        ? error.name
        : "UnknownError",

    message:
      error
        instanceof Error
        ? error.message
        : "A non-Error value was thrown.",

    code:
      typeof errorRecord?.code
        === "string"
        ? errorRecord.code
        : null,

    operation:
      typeof errorRecord?.operation
        === "string"
        ? errorRecord.operation
        : null,
  },
);

      return buildErrorResponse(
        500,
        "internalError",
      );
    }
  }
