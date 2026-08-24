import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder.js";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder.js";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification.js";
  import {
    buildAuthenticatedConsultingSessionTurnCommand,
  } from "./authenticatedConsultingSessionTurnCommandBuilder.js";
  import type {
    AuthenticatedConsultingSessionTurnCommandBuilderDependencies,
    BuildAuthenticatedConsultingSessionTurnCommandInput,
  } from "./authenticatedConsultingSessionTurnCommandBuilder.js";
  import type {
    ExecuteAuthenticatedPersistedConsultingSessionTurnInput,
  } from "./authenticatedPersistedConsultingSessionTurnService.js";
  import {
    executeAuthenticatedConsultingSessionTurnRequest,
  } from "./authenticatedConsultingSessionTurnService.js";

  export type AuthenticatedConsultingSessionTurnServiceVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  export async function verifyAuthenticatedConsultingSessionTurnService():
    Promise<AuthenticatedConsultingSessionTurnServiceVerificationResult> {
    const authorizationHeader =
      "Bearer authenticated-turn-service-token";

    const environment = {
      SUPABASE_URL:
        "https://verification.supabase.co",

      SUPABASE_SECRET_KEY:
        "verification-server-secret",
    };

    const input:
      BuildAuthenticatedConsultingSessionTurnCommandInput = {
        authorizationHeader,

        environment,

        request: {
          sessionId:
            "session-service-001",

          kind:
            "followUp",

          question:
            "현재 조건에서 상가 매수를 계속 검토해도 될까요?",
        },
      };

    const commandBuilderDependencies:
      AuthenticatedConsultingSessionTurnCommandBuilderDependencies = {
        createTurnId() {
          return "turn-service-002";
        },

        now() {
          return "2026-07-29T05:00:00.000Z";
        },
      };

    const expectedCommand =
      buildAuthenticatedConsultingSessionTurnCommand(
        input,
        commandBuilderDependencies,
      );

    const sourceRequest =
      createSourceRequest();

    const initialExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    const returnedSession =
      buildInitialConsultingSession({
        sessionId:
          "session-service-001",

        initialTurnId:
          "turn-service-001",

        createdAt:
          "2026-07-29T04:50:00.000Z",

        request:
          sourceRequest,

        execution:
          initialExecution,

        assistantAnswer:
          "현재 조건을 먼저 확인해야 합니다.",
      });

    let buildCommandCallCount =
      0;

    let executeTurnCallCount =
      0;

    let operationSequence =
      0;

    let buildCommandSequence =
      0;

    let executeTurnSequence =
      0;

    let deliveredBuildInput:
      BuildAuthenticatedConsultingSessionTurnCommandInput | null =
        null;

    let deliveredBuilderDependencies:
      AuthenticatedConsultingSessionTurnCommandBuilderDependencies | undefined;

      const deliveredCommands:
    ExecuteAuthenticatedPersistedConsultingSessionTurnInput[] = [];

    const result =
      await executeAuthenticatedConsultingSessionTurnRequest(
        input,
        {
          buildCommand(
            buildInput,
            builderDependencies,
          ) {
            buildCommandCallCount +=
              1;

            operationSequence +=
              1;

            buildCommandSequence =
              operationSequence;

            deliveredBuildInput =
              buildInput;

            deliveredBuilderDependencies =
              builderDependencies;

            return expectedCommand;
          },

          async executeTurn(
            command,
          ) {
            executeTurnCallCount +=
              1;

            operationSequence +=
              1;

            executeTurnSequence =
              operationSequence;

              deliveredCommands.push(
                command,
              );

            return returnedSession;
          },
        },
        commandBuilderDependencies,
      );
      const deliveredCommand =
      deliveredCommands[0];

    const builderError =
      new Error(
        "verification builder failure",
      );

    let builderFailureExecuteCallCount =
      0;

    let propagatedBuilderError:
      unknown =
        null;

    try {
      await executeAuthenticatedConsultingSessionTurnRequest(
        input,
        {
          buildCommand() {
            throw builderError;
          },

          async executeTurn() {
            builderFailureExecuteCallCount +=
              1;

            return returnedSession;
          },
        },
      );
    } catch (
      error
    ) {
      propagatedBuilderError =
        error;
    }

    const executionError =
      new Error(
        "verification execution failure",
      );

    let executionFailureBuildCallCount =
      0;

    let executionFailureExecuteCallCount =
      0;

    let propagatedExecutionError:
      unknown =
        null;

    try {
      await executeAuthenticatedConsultingSessionTurnRequest(
        input,
        {
          buildCommand() {
            executionFailureBuildCallCount +=
              1;

            return expectedCommand;
          },

          async executeTurn() {
            executionFailureExecuteCallCount +=
              1;

            throw executionError;
          },
        },
      );
    } catch (
      error
    ) {
      propagatedExecutionError =
        error;
    }

    const checks = {
      commandBuilderIsCalledExactlyOnce:
        buildCommandCallCount
        === 1,

      turnExecutorIsCalledExactlyOnce:
        executeTurnCallCount
        === 1,

      originalInputIsDeliveredToBuilder:
        deliveredBuildInput
        === input,

      builderDependenciesArePreserved:
        deliveredBuilderDependencies
        === commandBuilderDependencies,

      builtCommandIsDeliveredToExecutor:
        deliveredCommand
        === expectedCommand,

      commandIsBuiltBeforeExecution:
        buildCommandSequence
        > 0
        && executeTurnSequence
        > buildCommandSequence,

      authorizationHeaderIsPreserved:
        deliveredCommand
        ?.authorizationHeader
        === authorizationHeader,

      environmentIsPreserved:
        deliveredCommand
        ?.environment
        === environment,

      sessionIdIsPreserved:
        deliveredCommand
        ?.sessionId
        === "session-service-001",

      serverTurnIdIsPreserved:
        deliveredCommand
        ?.turnId
        === "turn-service-002",

      serverTimestampIsPreserved:
        deliveredCommand
        ?.createdAt
        === "2026-07-29T05:00:00.000Z",

      returnedSessionIsPreserved:
        result
        === returnedSession,

      builderFailureIsPropagated:
        propagatedBuilderError
        === builderError,

      builderFailureStopsExecution:
        builderFailureExecuteCallCount
        === 0,

      executionFailureIsPropagated:
        propagatedExecutionError
        === executionError,

      executionFailureBuildsCommandOnce:
        executionFailureBuildCallCount
        === 1,

      executionFailureCallsExecutorOnce:
        executionFailureExecuteCallCount
        === 1,
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
