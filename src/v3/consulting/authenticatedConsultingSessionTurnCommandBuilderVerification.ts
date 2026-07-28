import {
    InvalidAuthenticatedConsultingSessionTurnCommandError,
    buildAuthenticatedConsultingSessionTurnCommand,
  } from "./authenticatedConsultingSessionTurnCommandBuilder";
  import {
    InvalidAuthenticatedConsultingSessionTurnRequestError,
  } from "./authenticatedConsultingSessionTurnRequest";

  export type AuthenticatedConsultingSessionTurnCommandBuilderVerificationResult = {
    checks: Record<string, boolean>;
    passed: boolean;
  };

  function captureError(
    action: () => unknown,
  ): unknown {
    try {
      action();

      return null;
    } catch (
      error
    ) {
      return error;
    }
  }

  export function verifyAuthenticatedConsultingSessionTurnCommandBuilder():
    AuthenticatedConsultingSessionTurnCommandBuilderVerificationResult {
    const authorizationHeader =
      "Bearer authenticated-access-token";

    const environment = {
      SUPABASE_URL:
        "https://verification.supabase.co",

      SUPABASE_SECRET_KEY:
        "verification-server-secret",
    };

    let turnIdCallCount =
      0;

    let clockCallCount =
      0;

    const command =
      buildAuthenticatedConsultingSessionTurnCommand(
        {
          authorizationHeader,

          environment,

          request: {
            sessionId:
              "  session-command-001  ",

            kind:
              "followUp",

            question:
              "  상가 대신 다른 자산을 검토하면 어떨까요?  ",
          },
        },
        {
          createTurnId() {
            turnIdCallCount +=
              1;

            return "  server-turn-001  ";
          },

          now() {
            clockCallCount +=
              1;

            return "2026-07-29T04:30:00.000Z";
          },
        },
      );

    const lifeContextUpdate = {
      maritalStatus:
        "married" as const,

      hasChildren:
        true,

      occupationStatus:
        "selfEmployed" as const,

      hasActiveBusiness:
        true,

      financialResponsibility:
        "high" as const,
    };

    const clarificationCommand =
      buildAuthenticatedConsultingSessionTurnCommand(
        {
          authorizationHeader,

          request: {
            sessionId:
              "session-command-002",

            kind:
              "clarification",

            question:
              "월 고정지출은 250만 원입니다.",

            lifeContextUpdate,
          },
        },
        {
          createTurnId() {
            return "server-turn-002";
          },

          now() {
            return "2026-07-29T04:31:00.000Z";
          },
        },
      );

    let rejectedTurnIdCalls =
      0;

    let rejectedClockCalls =
      0;

    const transportedFieldError =
      captureError(
        () =>
          buildAuthenticatedConsultingSessionTurnCommand(
            {
              authorizationHeader,

              request: {
                sessionId:
                  "session-command-003",

                kind:
                  "followUp",

                question:
                  "후속 질문입니다.",

                turnId:
                  "client-turn-id",

                createdAt:
                  "2026-07-29T04:32:00.000Z",
              },
            },
            {
              createTurnId() {
                rejectedTurnIdCalls +=
                  1;

                return "unused-turn";
              },

              now() {
                rejectedClockCalls +=
                  1;

                return "2026-07-29T04:32:00.000Z";
              },
            },
          ),
      );

    const emptyTurnIdError =
      captureError(
        () =>
          buildAuthenticatedConsultingSessionTurnCommand(
            {
              authorizationHeader,

              request: {
                sessionId:
                  "session-command-004",

                kind:
                  "followUp",

                question:
                  "후속 질문입니다.",
              },
            },
            {
              createTurnId() {
                return "   ";
              },

              now() {
                return "2026-07-29T04:33:00.000Z";
              },
            },
          ),
      );

    const invalidTimestampError =
      captureError(
        () =>
          buildAuthenticatedConsultingSessionTurnCommand(
            {
              authorizationHeader,

              request: {
                sessionId:
                  "session-command-005",

                kind:
                  "followUp",

                question:
                  "후속 질문입니다.",
              },
            },
            {
              createTurnId() {
                return "server-turn-005";
              },

              now() {
                return "invalid-time";
              },
            },
          ),
      );

    const checks = {
      authorizationHeaderIsPreserved:
        command.authorizationHeader
        === authorizationHeader,

      environmentIsPreserved:
        command.environment
        === environment,

      sessionIdIsNormalized:
        command.sessionId
        === "session-command-001",

      questionIsNormalized:
        command.preparationInput.question
        === "상가 대신 다른 자산을 검토하면 어떨까요?",

      kindIsPreserved:
        command.preparationInput.kind
        === "followUp",

      turnIdIsGeneratedAndNormalized:
        command.turnId
        === "server-turn-001",

      timestampIsGeneratedByServer:
        command.preparationInput.preparedAt
        === "2026-07-29T04:30:00.000Z"
        && command.createdAt
        === "2026-07-29T04:30:00.000Z",

      generatorsAreCalledExactlyOnce:
        turnIdCallCount
        === 1
        && clockCallCount
        === 1,

      omittedLifeContextStaysOmitted:
        command.preparationInput.lifeContextUpdate
        === undefined,

      clarificationIsPreserved:
        clarificationCommand.preparationInput.kind
        === "clarification",

      lifeContextUpdateIsPreserved:
        clarificationCommand.preparationInput.lifeContextUpdate
        === lifeContextUpdate,

      clientServerFieldsAreRejected:
        transportedFieldError
        instanceof InvalidAuthenticatedConsultingSessionTurnRequestError,

      invalidRequestStopsServerGenerators:
        rejectedTurnIdCalls
        === 0
        && rejectedClockCalls
        === 0,

      emptyGeneratedTurnIdUsesTypedError:
        emptyTurnIdError
        instanceof InvalidAuthenticatedConsultingSessionTurnCommandError
        && emptyTurnIdError.field
        === "turnId",

      invalidGeneratedTimestampUsesTypedError:
        invalidTimestampError
        instanceof InvalidAuthenticatedConsultingSessionTurnCommandError
        && invalidTimestampError.field
        === "timestamp",
    };

    return {
      checks,

      passed:
        Object.values(
          checks,
        ).every(
          Boolean,
        ),
    };
  }
