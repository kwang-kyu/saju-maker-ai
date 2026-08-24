import {
    getConsultingClarificationFieldDefinition,
  } from "./consultingClarificationFieldDefinitions.js";
  import {
    executeConsultingSessionTurn,
  } from "./consultingSessionTurnExecutor.js";
  import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder.js";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder.js";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification.js";
  import type {
    ConsultingSession,
  } from "./consultingSession.js";

  export type ConsultingClarificationResponseIntegrationVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  export async function verifyConsultingClarificationResponseIntegration():
    Promise<ConsultingClarificationResponseIntegrationVerificationResult> {
    const sourceRequest =
      createSourceRequest();

    const initialExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    const generatedInitialSession =
      buildInitialConsultingSession({
        sessionId:
          "clarification-response-session",

        initialTurnId:
          "clarification-response-initial-turn",

        createdAt:
          "2026-08-03T07:10:00+09:00",

        request:
          sourceRequest,

        execution:
          initialExecution,

        assistantAnswer:
          "판단에 필요한 현실 정보를 먼저 확인하겠습니다.",
      });

    const initialSession:
      ConsultingSession = {
      ...generatedInitialSession,

      status:
        "awaitingClarification",

      pendingClarification: {
        decisionTurnId:
          "clarification-response-initial-turn",

        items: [
          {
            key:
              "debtRepaymentCapacity",

            description:
              "대출 부담은 확인됐지만 잔액·월 상환액·상환 재원이 확인되지 않았다.",

            question:
              "현재 대출 잔액, 월 상환액, 월 고정지출과 안정적으로 들어오는 월소득은 각각 얼마인가요?",
          },
          {
            key:
              "decisionDeadline",

            description:
              "결정을 내려야 하는 현실적인 기한이 확인되지 않았다.",

            question:
              "이 결정을 내려야 하는 실제 마감 시점이나 예정일이 있나요?",
          },
        ],
      },
    };

    const pendingClarification =
      initialSession
        .pendingClarification;

    if (
      pendingClarification
      === null
    ) {
      throw new Error(
        "Verification fixture must begin with pending clarification.",
      );
    }

    const originalDecisionTurn =
      initialSession
        .turns
        .find(
          (turn) =>
            turn.id
            === pendingClarification
              .decisionTurnId,
        );

    if (
      !originalDecisionTurn
    ) {
      throw new Error(
        "Verification fixture must contain the original decision turn.",
      );
    }

    const targetItem =
      pendingClarification
        .items[0];

    const targetDefinition =
      getConsultingClarificationFieldDefinition(
        targetItem.key,
      );

    const requiredTargetFields =
      targetDefinition
        .fields
        .filter(
          (field) =>
            field.required,
        );

    if (
      requiredTargetFields.length
      === 0
    ) {
      throw new Error(
        "Verification target must contain at least one required field.",
      );
    }

    const targetField =
      requiredTargetFields[0];

    const userResponse =
      "확인할 정보에 대한 실제 답변은 검증된 내용입니다.";

    let interpretationRequestCount =
      0;

    let answerRequestCount =
      0;

    const nextSession =
      await executeConsultingSessionTurn({
        preparationInput: {
          session:
            initialSession,

          kind:
            "clarification",

          question:
            userResponse,

          preparedAt:
            "2026-08-03T07:11:00+09:00",
        },

        turnId:
          "clarification-response-turn",

        createdAt:
          "2026-08-03T07:11:00+09:00",

        requestClarificationInterpretation:
          async (
            request,
          ) => {
            interpretationRequestCount +=
              1;

            if (
              !request
                .allowedKeys
                .includes(
                  targetItem.key,
                )
            ) {
              throw new Error(
                "Pending clarification key was not delivered to the interpreter.",
              );
            }

            return JSON.stringify({
              matches: [
                {
                  key:
                    targetItem.key,

                  description:
                    "사용자가 대기 중인 확인 항목에 대한 사실을 명시했다.",

                  fields:
                    requiredTargetFields
                      .map(
                        (
                          field,
                          index,
                        ) => ({
                          key:
                            field.key,

                          value:
                            `검증된 값 ${index + 1}`,

                          evidence: [
                            "검증된 내용입니다",
                          ],
                        }),
                      ),

                  confidence:
                    0.99,
                },
              ],
            });
          },

        requestAnswer:
          async () => {
            answerRequestCount +=
              1;

            return "호출되면 안 되는 일반 GPT 답변";
          },
      });

    const newTurn =
      nextSession
        .turns[
          nextSession
            .turns
            .length - 1
        ];

    const storedFact =
      nextSession
        .confirmedFacts
        .find(
          (fact) =>
            fact.key
            === targetItem.key,
        );

    const deliveredClarificationFact =
      newTurn
        .questionContext
        .clarificationFacts
        ?.find(
          (fact) =>
            fact.key
            === targetItem.key,
        );

    const rebuiltPendingClarification =
      nextSession
        .pendingClarification;

    const checks = {
      clarificationInterpreterIsCalledExactlyOnce:
        interpretationRequestCount
        === 1,

      pendingKeyIsStoredAsConfirmedFact:
        storedFact
        !== undefined,

      confirmedFactUsesInterpretedDescription:
        storedFact
          ?.description
        === "사용자가 대기 중인 확인 항목에 대한 사실을 명시했다.",

      confirmedFieldIsStored:
        storedFact
          ?.fields
          .some(
            (field) =>
              field.key
              === targetField.key
              && field.value
              === "검증된 값 1"
              && field.evidence.includes(
                "검증된 내용입니다",
              ),
          )
        === true,

      allRequiredTargetFieldsAreStored:
        requiredTargetFields
          .every(
            (requiredField) =>
              storedFact
                ?.fields
                .some(
                  (storedField) =>
                    storedField.key
                    === requiredField.key,
                )
              === true,
          ),

      confirmedFactIsLinkedToResponseTurn:
        storedFact
          ?.sourceTurnId
        === newTurn.id
        && storedFact
          .confirmedAt
        === newTurn.createdAt,

      confirmedFactIsLinkedToOriginalDecision:
        storedFact
          ?.decisionTurnId
        === pendingClarification
          .decisionTurnId,

      clarificationResponseIsStoredAsTurnQuestion:
        newTurn.question
        === userResponse,

      originalDecisionQuestionIsRestored:
        newTurn.decisionQuestion
        === originalDecisionTurn.question,

      decisionEngineReceivesOriginalQuestion:
        newTurn
          .questionReaderResult
          .originalQuestion
        === originalDecisionTurn.question,

      confirmedFactsAreDeliveredToQuestionContext:
        deliveredClarificationFact
          ?.fields
          .length
        === requiredTargetFields
          .length,

      completedItemIsRemovedFromPending:
        rebuiltPendingClarification
          ?.items
          .every(
            (item) =>
              item.key
              !== targetItem.key,
          )
        ?? true,

      genericAnswerIsNotRequested:
        answerRequestCount
        === 0,

      originalSessionIsNotMutated:
        initialSession
          .confirmedFacts
          .length
        === 0
        && initialSession
          .turns
          .length
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
