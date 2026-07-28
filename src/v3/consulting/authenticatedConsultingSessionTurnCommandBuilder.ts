import {
    randomUUID,
  } from "node:crypto";

  import {
    parseAuthenticatedConsultingSessionTurnRequest,
  } from "./authenticatedConsultingSessionTurnRequest";
  import type {
    ConsultingSessionAuthorizationHeader,
  } from "./consultingSessionOwnerResolver";
  import type {
    ExecuteAuthenticatedPersistedConsultingSessionTurnInput,
  } from "./authenticatedPersistedConsultingSessionTurnService";
  import type {
    SupabaseServerEnvironment,
  } from "./supabaseConsultingSessionRepositoryFactory";

  export type BuildAuthenticatedConsultingSessionTurnCommandInput = {
    authorizationHeader:
      ConsultingSessionAuthorizationHeader;

    request:
      unknown;

    environment?:
      SupabaseServerEnvironment;
  };

  export type AuthenticatedConsultingSessionTurnCommandBuilderDependencies = {
    createTurnId():
      string;

    now():
      string;
  };

  export class InvalidAuthenticatedConsultingSessionTurnCommandError
    extends Error {
    readonly field:
      "turnId" | "timestamp";

    constructor(
      field:
        "turnId" | "timestamp",
    ) {
      super(
        `Server-generated authenticated consulting turn ${field} is invalid.`,
      );

      this.name =
        "InvalidAuthenticatedConsultingSessionTurnCommandError";

      this.field =
        field;
    }
  }

  const DEFAULT_DEPENDENCIES:
    AuthenticatedConsultingSessionTurnCommandBuilderDependencies = {
      createTurnId() {
        return randomUUID();
      },

      now() {
        return new Date()
          .toISOString();
      },
    };

  function requireServerTurnId(
    value:
      string,
  ): string {
    const normalizedValue =
      value.trim();

    if (
      normalizedValue.length
      === 0
    ) {
      throw new InvalidAuthenticatedConsultingSessionTurnCommandError(
        "turnId",
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
      throw new InvalidAuthenticatedConsultingSessionTurnCommandError(
        "timestamp",
      );
    }

    return normalizedValue;
  }

  /**
   * 인증된 외부 후속 질문을 내부 세션 실행 명령으로 변환한다.
   *
   * 클라이언트는 sessionId·kind·question·lifeContextUpdate만 전달한다.
   * turnId와 시간은 서버에서만 생성하며 외부 입력을 사용하지 않는다.
   */
  export function buildAuthenticatedConsultingSessionTurnCommand(
    input:
      BuildAuthenticatedConsultingSessionTurnCommandInput,
    dependencies:
      AuthenticatedConsultingSessionTurnCommandBuilderDependencies =
        DEFAULT_DEPENDENCIES,
  ): ExecuteAuthenticatedPersistedConsultingSessionTurnInput {
    const request =
      parseAuthenticatedConsultingSessionTurnRequest(
        input.request,
      );

    const turnId =
      requireServerTurnId(
        dependencies.createTurnId(),
      );

    const timestamp =
      requireServerTimestamp(
        dependencies.now(),
      );

    const command:
      ExecuteAuthenticatedPersistedConsultingSessionTurnInput = {
        authorizationHeader:
          input.authorizationHeader,

        sessionId:
          request.sessionId,

        preparationInput: {
          kind:
            request.kind,

          question:
            request.question,

          preparedAt:
            timestamp,
        },

        turnId,

        createdAt:
          timestamp,
      };

    if (
      request.lifeContextUpdate
      !== undefined
    ) {
      command.preparationInput.lifeContextUpdate =
        request.lifeContextUpdate;
    }

    if (
      input.environment
      !== undefined
    ) {
      command.environment =
        input.environment;
    }

    return command;
  }
