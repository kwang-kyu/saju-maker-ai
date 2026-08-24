import type {
    ConsultingSession,
  } from "./consultingSession.js";
  import {
    buildAuthenticatedConsultingSessionTurnCommand,
  } from "./authenticatedConsultingSessionTurnCommandBuilder.js";
  import type {
    AuthenticatedConsultingSessionTurnCommandBuilderDependencies,
    BuildAuthenticatedConsultingSessionTurnCommandInput,
  } from "./authenticatedConsultingSessionTurnCommandBuilder.js";
  import {
    executeAuthenticatedPersistedConsultingSessionTurn,
  } from "./authenticatedPersistedConsultingSessionTurnService.js";
  import type {
    ExecuteAuthenticatedPersistedConsultingSessionTurnInput,
  } from "./authenticatedPersistedConsultingSessionTurnService.js";

  export type ExecuteAuthenticatedConsultingSessionTurnRequestInput =
    BuildAuthenticatedConsultingSessionTurnCommandInput;

  export type AuthenticatedConsultingSessionTurnServiceDependencies = {
    buildCommand(
      input:
        BuildAuthenticatedConsultingSessionTurnCommandInput,
      dependencies?:
        AuthenticatedConsultingSessionTurnCommandBuilderDependencies,
    ): ExecuteAuthenticatedPersistedConsultingSessionTurnInput;

    executeTurn(
      input:
        ExecuteAuthenticatedPersistedConsultingSessionTurnInput,
    ): Promise<ConsultingSession>;
  };

  const DEFAULT_DEPENDENCIES:
    AuthenticatedConsultingSessionTurnServiceDependencies = {
      buildCommand(
        input:
          BuildAuthenticatedConsultingSessionTurnCommandInput,
        dependencies?:
          AuthenticatedConsultingSessionTurnCommandBuilderDependencies,
      ) {
        return buildAuthenticatedConsultingSessionTurnCommand(
          input,
          dependencies,
        );
      },

      executeTurn(
        input:
          ExecuteAuthenticatedPersistedConsultingSessionTurnInput,
      ) {
        return executeAuthenticatedPersistedConsultingSessionTurn(
          input,
        );
      },
    };

  /**
   * 인증된 외부 후속 질문을 검증하고 서버 명령으로 변환한 뒤,
   * 소유자 범위가 적용된 영속 상담 세션에서 실제 턴을 실행한다.
   *
   * 외부 요청은 내부 저장소·판정 결과·turnId·시간을 전달할 수 없다.
   */
  export async function executeAuthenticatedConsultingSessionTurnRequest(
    input:
      ExecuteAuthenticatedConsultingSessionTurnRequestInput,
    dependencies:
      AuthenticatedConsultingSessionTurnServiceDependencies =
        DEFAULT_DEPENDENCIES,
    commandBuilderDependencies?:
      AuthenticatedConsultingSessionTurnCommandBuilderDependencies,
  ): Promise<ConsultingSession> {
    const command =
      dependencies
        .buildCommand(
          input,
          commandBuilderDependencies,
        );

    return dependencies
      .executeTurn(
        command,
      );
  }
