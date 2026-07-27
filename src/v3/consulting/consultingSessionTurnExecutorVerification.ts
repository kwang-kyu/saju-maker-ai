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
    executeConsultingSessionTurn,
  } from "./consultingSessionTurnExecutor";
  import {
    prepareConsultingSessionTurn,
  } from "./consultingSessionTurnBuilder";
  import type {
    ConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter";

  export type ConsultingSessionTurnExecutorVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  async function actionRejects(
    action:
      () => Promise<unknown>,
  ): Promise<boolean> {
    try {
      await action();

      return false;
    } catch {
      return true;
    }
  }

  export async function verifyConsultingSessionTurnExecutor():
    Promise<ConsultingSessionTurnExecutorVerificationResult> {
    const sourceRequest =
      createSourceRequest();

    const initialExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    const initialAssistantAnswer =
      "현재 정보만으로 상가 매수를 확정할 수 없습니다. 대출 상환능력과 실제 결정기한을 먼저 확인해야 합니다.";

    const initialSession =
      buildInitialConsultingSession({
        sessionId:
          "session-turn-executor-001",

        initialTurnId:
          "turn-executor-001",

        createdAt:
          "2026-07-28T08:00:00+09:00",

        request:
          sourceRequest,

        execution:
          initialExecution,

        assistantAnswer:
          initialAssistantAnswer,
      });

    const initialTurnCount =
      initialSession
        .turns
        .length;

    const initialLifeContextRevisionCount =
      initialSession
        .lifeContextHistory
        .length;

    const followUpQuestion =
      "대출 잔액은 2억 원이고 월 상환액은 180만 원입니다. 월소득은 900만 원이며 두 달 뒤까지 상가 매수를 결정해야 합니다.";

    const preparationInput = {
      session:
        initialSession,

      kind:
        "clarification" as const,

      question:
        followUpQuestion,

      preparedAt:
        "2026-07-28T08:10:00+09:00",
    };

    const expectedPreparation =
      prepareConsultingSessionTurn(
        preparationInput,
      );

    const expectedAssistantAnswer =
      "현재 엔진 판정에 따라 기존 현금흐름을 보호하고 매수 규모를 제한하는 조건에서만 진행 방향을 검토할 수 있습니다.";

    const capturedRequests:
      ConsultingOpenAIRequest[] =
        [];

    const nextSession =
      await executeConsultingSessionTurn({
        preparationInput,

        turnId:
          "turn-executor-002",

        createdAt:
          "2026-07-28T08:11:00+09:00",

        confirmedFacts: [
          {
            key:
              "loanBalance",

            description:
              "대출 잔액 2억 원",
          },
          {
            key:
              "stableMonthlyIncome",

            description:
              "안정적인 월소득 900만 원",
          },
        ],

        requestAnswer:
          async (
            request,
          ) => {
            capturedRequests.push(
              request,
            );

            return expectedAssistantAnswer;
          },
      });

    const deliveredRequest =
      capturedRequests[0];

    const newTurn =
      nextSession
        .turns[
          nextSession
            .turns
            .length
          - 1
        ];

    const originalInitialTurn =
      initialSession
        .turns[0];

    const preservedInitialTurn =
      nextSession
        .turns[0];

    const expectedDecision =
      expectedPreparation
        .turnResult
        .decisionResult;

    const emptyAnswerRejected =
      await actionRejects(
        () =>
          executeConsultingSessionTurn({
            preparationInput,

            turnId:
              "turn-executor-empty-answer",

            createdAt:
              "2026-07-28T08:12:00+09:00",

            requestAnswer:
              async () =>
                "   ",
          }),
      );

    const injectedClientFailure =
      new Error(
        "Injected turn executor client failure.",
      );

    let propagatedFailure:
      unknown =
        null;

    try {
      await executeConsultingSessionTurn({
        preparationInput,

        turnId:
          "turn-executor-client-failure",

        createdAt:
          "2026-07-28T08:13:00+09:00",

        requestAnswer:
          async () => {
            throw injectedClientFailure;
          },
      });
    } catch (
      error
    ) {
      propagatedFailure =
        error;
    }

    const duplicateTurnIdRejected =
      await actionRejects(
        () =>
          executeConsultingSessionTurn({
            preparationInput,

            turnId:
              initialSession
                .turns[0]
                .id,

            createdAt:
              "2026-07-28T08:14:00+09:00",

            requestAnswer:
              async () =>
                expectedAssistantAnswer,
          }),
      );

    const checks = {
      openAIRequestIsSentExactlyOnce:
        capturedRequests
          .length
        === 1,

      requestUsesConfiguredModel:
        deliveredRequest !== undefined
        && deliveredRequest
          .model
        === "gpt-5.5",

      currentDecisionPromptIsDelivered:
        deliveredRequest !== undefined
        && deliveredRequest
          .userPrompt
          .includes(
            expectedPreparation
              .turnResult
              .prompt
              .userPrompt,
          ),

      previousConversationIsDeliveredAsContext:
        deliveredRequest !== undefined
        && deliveredRequest
          .userPrompt
          .includes(
            initialAssistantAnswer,
          )
        && deliveredRequest
          .userPrompt
          .includes(
            initialSession
              .turns[0]
              .question,
          ),

      previousConversationCannotBecomeEvidence:
        deliveredRequest !== undefined
        && deliveredRequest
          .systemPrompt
          .includes(
            "이전 사용자 질문과 GPT 답변을 새로운 판단 근거로 사용하지 않는다.",
          ),

      originalSessionIsNotMutated:
        initialSession
          .turns
          .length
        === initialTurnCount
        && initialSession
          .lifeContextHistory
          .length
        === initialLifeContextRevisionCount,

      originalSajuFactsAreReused:
        nextSession
          .sajuFacts
        === initialSession
          .sajuFacts,

      originalReaderEvidenceIsReused:
        nextSession
          .readerEvidence
        === initialSession
          .readerEvidence,

      originalHumanContextIsReused:
        nextSession
          .humanContext
        === initialSession
          .humanContext,

      previousTurnIsPreserved:
        preservedInitialTurn
        === originalInitialTurn,

      exactlyOneNewTurnIsAdded:
        nextSession
          .turns
          .length
        === initialTurnCount
        + 1,

      newTurnUsesContinuousSequence:
        newTurn
          .sequence
        === originalInitialTurn
          .sequence
        + 1,

      newTurnStoresFollowUpQuestion:
        newTurn
          .question
        === followUpQuestion,

      newTurnStoresAssistantAnswer:
        newTurn
          .assistantAnswer
        === expectedAssistantAnswer,

      newTurnStoresCurrentDecisionResult:
        JSON.stringify(
          newTurn
            .decisionResult,
        )
        === JSON.stringify(
          expectedDecision,
        ),

      newTurnStoresCurrentQuestionReaderResult:
        JSON.stringify(
          newTurn
            .questionReaderResult,
        )
        === JSON.stringify(
          expectedPreparation
            .turnResult
            .questionReaderResult,
        ),

      newTurnStoresCurrentQuestionContext:
        JSON.stringify(
          newTurn
            .questionContext,
        )
        === JSON.stringify(
          expectedPreparation
            .turnResult
            .questionContext,
        ),

      unchangedRealityKeepsRevision:
        nextSession
          .lifeContextHistory
          .length
        === initialLifeContextRevisionCount
        && newTurn
          .lifeContextRevision
        === initialSession
          .lifeContextHistory[
            initialLifeContextRevisionCount
            - 1
          ]
          .revision,

      confirmedFactsAreStored:
        nextSession
          .confirmedFacts
          .length
        === 2,

      confirmedFactsAreLinkedToNewTurn:
        nextSession
          .confirmedFacts
          .every(
            (fact) =>
              fact.sourceTurnId
              === newTurn.id
              && fact.confirmedAt
              === newTurn.createdAt,
          ),

      emptyAssistantAnswerIsRejected:
        emptyAnswerRejected,

      clientFailureIsPropagated:
        propagatedFailure
        === injectedClientFailure,

      failedRequestsDoNotMutateOriginalSession:
        initialSession
          .turns
          .length
        === initialTurnCount
        && initialSession
          .confirmedFacts
          .length
        === 0,

      duplicateTurnIdIsRejected:
        duplicateTurnIdRejected,
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
