import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification";
  import {
    CONSULTING_SESSION_SCHEMA_VERSION,
    InvalidConsultingSessionPersistenceRecordError,
    deserializeConsultingSession,
    isConsultingSession,
    serializeConsultingSession,
  } from "./consultingSessionPersistenceRecord";

  export type ConsultingSessionPersistenceRecordVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  function actionThrowsInvalidRecordError(
    action:
      () => unknown,
  ): boolean {
    try {
      action();

      return false;
    } catch (
      error
    ) {
      return error
        instanceof InvalidConsultingSessionPersistenceRecordError;
    }
  }

  export function verifyConsultingSessionPersistenceRecord():
    ConsultingSessionPersistenceRecordVerificationResult {
    const sourceRequest =
      createSourceRequest();

    const initialExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    const session =
      buildInitialConsultingSession({
        sessionId:
          "session-persistence-record-001",

        initialTurnId:
          "turn-persistence-record-001",

        createdAt:
          "2026-07-28T10:30:00+09:00",

        request:
          sourceRequest,

        execution:
          initialExecution,

        assistantAnswer:
          "현재 정보만으로 판단을 확정할 수 없습니다. 실제 자금과 결정기한을 먼저 확인해야 합니다.",
      });

    const record =
      serializeConsultingSession(
        session,
      );

    const restoredSession =
      deserializeConsultingSession(
        record,
      );

    const jsonRoundTripValue =
      JSON.parse(
        JSON.stringify(
          record,
        ),
      );

    const jsonRoundTripSession =
      deserializeConsultingSession(
        jsonRoundTripValue,
      );

    const firstTurn =
      session
        .turns[0];

    const firstRevision =
      session
        .lifeContextHistory[0];

    const unsupportedVersionRejected =
      actionThrowsInvalidRecordError(
        () =>
          deserializeConsultingSession({
            ...record,

            schemaVersion:
              2,
          }),
      );

    const mismatchedSessionIdRejected =
      actionThrowsInvalidRecordError(
        () =>
          deserializeConsultingSession({
            ...record,

            sessionId:
              "different-session-id",
          }),
      );

    const mismatchedUpdatedAtRejected =
      actionThrowsInvalidRecordError(
        () =>
          deserializeConsultingSession({
            ...record,

            updatedAt:
              "2026-07-28T10:31:00+09:00",
          }),
      );

    const emptyTurnsRejected =
      actionThrowsInvalidRecordError(
        () =>
          deserializeConsultingSession({
            ...record,

            session: {
              ...session,

              turns:
                [],
            },
          }),
      );

    const duplicateTurnIdsRejected =
      actionThrowsInvalidRecordError(
        () =>
          deserializeConsultingSession({
            ...record,

            session: {
              ...session,

              turns: [
                firstTurn,

                {
                  ...firstTurn,

                  sequence:
                    2,
                },
              ],
            },
          }),
      );

    const nonContinuousTurnSequenceRejected =
      actionThrowsInvalidRecordError(
        () =>
          deserializeConsultingSession({
            ...record,

            session: {
              ...session,

              turns: [
                firstTurn,

                {
                  ...firstTurn,

                  id:
                    "turn-persistence-record-002",

                  sequence:
                    3,
                },
              ],
            },
          }),
      );

    const nonContinuousRevisionRejected =
      actionThrowsInvalidRecordError(
        () =>
          deserializeConsultingSession({
            ...record,

            session: {
              ...session,

              lifeContextHistory: [
                {
                  ...firstRevision,

                  revision:
                    2,
                },
              ],
            },
          }),
      );

    const unknownLifeContextRevisionRejected =
      actionThrowsInvalidRecordError(
        () =>
          deserializeConsultingSession({
            ...record,

            session: {
              ...session,

              turns: [
                {
                  ...firstTurn,

                  lifeContextRevision:
                    99,
                },
              ],
            },
          }),
      );

      const validConfirmedFact = {
        key:
          "loanBalance",

        description:
          "대출 잔액 2억 원",

        fields: [
          {
            key:
              "loanBalance",

            value:
              "200000000",

            evidence: [
              "대출 잔액은 2억 원입니다.",
            ],
          },
        ],

        decisionTurnId:
          firstTurn.id,

        sourceTurnId:
          firstTurn.id,

        confirmedAt:
          "2026-07-28T10:32:00+09:00",
      };

      const unknownConfirmedFactSourceTurnRejected =
        actionThrowsInvalidRecordError(
          () =>
            deserializeConsultingSession({
              ...record,

              session: {
                ...session,

                confirmedFacts: [
                  {
                    ...validConfirmedFact,

                    sourceTurnId:
                      "unknown-turn",
                  },
                ],
              },
            }),
        );

      const unknownConfirmedFactDecisionTurnRejected =
        actionThrowsInvalidRecordError(
          () =>
            deserializeConsultingSession({
              ...record,

              session: {
                ...session,

                confirmedFacts: [
                  {
                    ...validConfirmedFact,

                    decisionTurnId:
                      "unknown-turn",
                  },
                ],
              },
            }),
        );

      const invalidConfirmedFactFieldRejected =
        actionThrowsInvalidRecordError(
          () =>
            deserializeConsultingSession({
              ...record,

              session: {
                ...session,

                confirmedFacts: [
                  {
                    ...validConfirmedFact,

                    fields: [
                      {
                        key:
                          "loanBalance",

                        value:
                          "200000000",

                        evidence: [
                          " ",
                        ],
                      },
                    ],
                  },
                ],
              },
            }),
        );

        const validClarificationItem = {
            key:
              "availableFunds",

            description:
              "실제 사용 가능한 자금",

            question:
              "실제로 사용할 수 있는 자금은 얼마입니까?",
          };

          const unknownClarificationTurnRejected =
            actionThrowsInvalidRecordError(
              () =>
                deserializeConsultingSession({
                  ...record,

                  session: {
                    ...session,

                    pendingClarification: {
                      decisionTurnId:
                        "unknown-turn",

                      items: [
                        validClarificationItem,
                      ],
                    },
                  },
                }),
            );

          const emptyClarificationItemsRejected =
            actionThrowsInvalidRecordError(
              () =>
                deserializeConsultingSession({
                  ...record,

                  session: {
                    ...session,

                    pendingClarification: {
                      decisionTurnId:
                        firstTurn.id,

                      items:
                        [],
                    },
                  },
                }),
            );

          const invalidClarificationItemRejected =
            actionThrowsInvalidRecordError(
              () =>
                deserializeConsultingSession({
                  ...record,

                  session: {
                    ...session,

                    pendingClarification: {
                      decisionTurnId:
                        firstTurn.id,

                      items: [
                        {
                          ...validClarificationItem,

                          question:
                            " ",
                        },
                      ],
                    },
                  },
                }),
            );

    const emptyAssistantAnswerRejected =
      actionThrowsInvalidRecordError(
        () =>
          deserializeConsultingSession({
            ...record,

            session: {
              ...session,

              turns: [
                {
                  ...firstTurn,

                  assistantAnswer:
                    " ",
                },
              ],
            },
          }),
      );

    const nonObjectRecordRejected =
      actionThrowsInvalidRecordError(
        () =>
          deserializeConsultingSession(
            "invalid-record",
          ),
      );

    const checks = {
      validSessionIsAccepted:
        isConsultingSession(
          session,
        ),

      schemaVersionIsPreserved:
        record
          .schemaVersion
        === CONSULTING_SESSION_SCHEMA_VERSION,

      recordSessionIdMatchesSession:
        record
          .sessionId
        === session.id,

      recordUpdatedAtMatchesSession:
        record
          .updatedAt
        === session.updatedAt,

      directRestorePreservesSession:
        restoredSession
        === session,

      jsonRoundTripPreservesSession:
        JSON.stringify(
          jsonRoundTripSession,
        )
        === JSON.stringify(
          session,
        ),

      unsupportedVersionIsRejected:
        unsupportedVersionRejected,

      mismatchedSessionIdIsRejected:
        mismatchedSessionIdRejected,

      mismatchedUpdatedAtIsRejected:
        mismatchedUpdatedAtRejected,

      emptyTurnsAreRejected:
        emptyTurnsRejected,

      duplicateTurnIdsAreRejected:
        duplicateTurnIdsRejected,

      nonContinuousTurnSequenceIsRejected:
        nonContinuousTurnSequenceRejected,

      nonContinuousRevisionIsRejected:
        nonContinuousRevisionRejected,

      unknownLifeContextRevisionIsRejected:
        unknownLifeContextRevisionRejected,

        unknownConfirmedFactSourceTurnIsRejected:
        unknownConfirmedFactSourceTurnRejected,

      unknownConfirmedFactDecisionTurnIsRejected:
        unknownConfirmedFactDecisionTurnRejected,

      invalidConfirmedFactFieldIsRejected:
        invalidConfirmedFactFieldRejected,

      unknownClarificationTurnIsRejected:
        unknownClarificationTurnRejected,

        emptyClarificationItemsAreRejected:
        emptyClarificationItemsRejected,

      invalidClarificationItemIsRejected:
        invalidClarificationItemRejected,

      emptyAssistantAnswerIsRejected:
        emptyAssistantAnswerRejected,

      nonObjectRecordIsRejected:
        nonObjectRecordRejected,
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
