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
    buildConsultingSessionTurn,
    prepareConsultingSessionTurn,
  } from "./consultingSessionTurnBuilder.js";
  import type {
    ConsultingSession,
  } from "./consultingSession.js";

  export type ConsultingSessionTurnBuilderVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    initialSession:
      ConsultingSession;

    clarificationSession:
      ConsultingSession;

    changedRealitySession:
      ConsultingSession;

    passed:
      boolean;
  };

  function actionThrows(
    action:
      () => unknown,
  ): boolean {
    try {
      action();

      return false;
    } catch {
      return true;
    }
  }

  export function verifyConsultingSessionTurnBuilder():
    ConsultingSessionTurnBuilderVerificationResult {
    const request =
      createSourceRequest();

    const initialExecution =
      buildInitialConsultingExecution(
        request,
      );

    const initialAssistantAnswer =
      "현재 정보만으로 매수를 확정할 수 없습니다. 대출 상환능력과 실제 결정기한을 먼저 확인해야 합니다.";

    const generatedInitialSession =
      buildInitialConsultingSession({
        sessionId:
          "session-continuous-001",

        initialTurnId:
          "turn-001",

        createdAt:
          "2026-07-27T18:30:00+09:00",

        request,

        execution:
          initialExecution,

        assistantAnswer:
          initialAssistantAnswer,
      });

    const initialSession:
      ConsultingSession = {
        ...generatedInitialSession,

        status:
          "awaitingClarification",

        pendingClarification: {
          decisionTurnId:
            "turn-001",

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

    const clarificationQuestion =
      "대출 잔액은 2억 원이고 월 상환액은 180만 원입니다. 월 고정지출은 250만 원, 안정적인 월소득은 900만 원이며 실제 결정 마감은 두 달 뒤입니다.";

    const clarificationPreparation =
      prepareConsultingSessionTurn({
        session:
          initialSession,

        kind:
          "clarification",

        question:
          clarificationQuestion,

        preparedAt:
          "2026-07-27T18:40:00+09:00",
      });

    const clarificationAssistantAnswer =
      "확인된 상환 부담과 소득 조건을 기준으로 새 판정의 조건과 위험을 설명합니다.";

    const clarificationSession =
      buildConsultingSessionTurn({
        session:
          initialSession,

        preparation:
          clarificationPreparation,

        turnId:
          "turn-002",

        createdAt:
          "2026-07-27T18:41:00+09:00",

        assistantAnswer:
          clarificationAssistantAnswer,

        confirmedFacts: [
          {
            key:
              "loanBalance",

            description:
              "대출 잔액은 2억 원이다.",
          },
          {
            key:
              "monthlyLoanPayment",

            description:
              "월 대출 상환액은 180만 원이다.",
          },
          {
            key:
              "decisionDeadline",

            description:
              "실제 결정 마감 시점은 두 달 뒤다.",
          },
        ],
      });

    const unchangedRealityPreparation =
      prepareConsultingSessionTurn({
        session:
          clarificationSession,

        kind:
          "followUp",

        question:
          "같은 현실 조건에서 매수 규모는 어느 정도로 제한해야 할까요?",

        preparedAt:
          "2026-07-27T18:45:00+09:00",

        lifeContextUpdate: {},
      });

    const sameValueRealityPreparation =
      prepareConsultingSessionTurn({
        session:
          clarificationSession,

        kind:
          "followUp",

        question:
          "가족 책임을 그대로 유지하면 어떤 조건이 필요할까요?",

        preparedAt:
          "2026-07-27T18:46:00+09:00",

        lifeContextUpdate: {
          financialResponsibility:
            "high",
        },
      });

    const changedRealityPreparation =
      prepareConsultingSessionTurn({
        session:
          clarificationSession,

        kind:
          "followUp",

        question:
          "직장을 그만두고 직접 사업을 운영하면서 상가를 매수해도 될까요?",

        preparedAt:
          "2026-07-27T19:00:00+09:00",

        lifeContextUpdate: {
          occupationStatus:
            "businessOwner",

          hasActiveBusiness:
            true,
        },
      });

    const changedRealityAssistantAnswer =
      "변경된 사업 운영 현실을 반영한 새 판정의 실행 조건과 금지 방향을 설명합니다.";

    const changedRealitySession =
      buildConsultingSessionTurn({
        session:
          clarificationSession,

        preparation:
          changedRealityPreparation,

        turnId:
          "turn-003",

        createdAt:
          "2026-07-27T19:01:00+09:00",

        assistantAnswer:
          changedRealityAssistantAnswer,
      });

    const stalePreparation =
      prepareConsultingSessionTurn({
        session:
          initialSession,

        kind:
          "followUp",

        question:
          "상가 대신 다른 자산을 검토하면 어떨까요?",

        preparedAt:
          "2026-07-27T18:42:00+09:00",
      });

    const stalePreparationIsRejected =
      actionThrows(
        () =>
          buildConsultingSessionTurn({
            session:
              clarificationSession,

            preparation:
              stalePreparation,

            turnId:
              "turn-stale",

            createdAt:
              "2026-07-27T18:50:00+09:00",

            assistantAnswer:
              "오래된 실행 결과입니다.",
          }),
      );

    const emptyAssistantAnswerIsRejected =
      actionThrows(
        () =>
          buildConsultingSessionTurn({
            session:
              initialSession,

            preparation:
              clarificationPreparation,

            turnId:
              "turn-empty-answer",

            createdAt:
              "2026-07-27T18:41:00+09:00",

            assistantAnswer:
              "   ",
          }),
      );

    const duplicateTurnIdIsRejected =
      actionThrows(
        () =>
          buildConsultingSessionTurn({
            session:
              initialSession,

            preparation:
              clarificationPreparation,

            turnId:
              "turn-001",

            createdAt:
              "2026-07-27T18:41:00+09:00",

            assistantAnswer:
              clarificationAssistantAnswer,
          }),
      );

    const closedSessionIsRejected =
      actionThrows(
        () =>
          prepareConsultingSessionTurn({
            session: {
              ...initialSession,

              status:
                "closed",
            },

            kind:
              "followUp",

            question:
              "종료된 상담에 질문을 추가합니다.",

            preparedAt:
              "2026-07-27T20:00:00+09:00",
          }),
      );

    const clarificationWithoutRequestIsRejected =
      actionThrows(
        () =>
          prepareConsultingSessionTurn({
            session: {
              ...initialSession,

              status:
                "active",

              pendingClarification:
                null,
            },

            kind:
              "clarification",

            question:
              "요청되지 않은 확인 답변입니다.",

            preparedAt:
              "2026-07-27T20:01:00+09:00",
          }),
      );

    const clarificationStateMatchesDecision =
      clarificationSession.status
      === "active"
      && clarificationSession
        .pendingClarification
      === null;

    const latestChangedRevision =
      changedRealitySession
        .lifeContextHistory[
          changedRealitySession
            .lifeContextHistory
            .length - 1
        ];

    const checks = {
      originalSajuFactsAreReused:
        clarificationSession.sajuFacts
        === initialSession.sajuFacts
        && changedRealitySession.sajuFacts
        === initialSession.sajuFacts,

      originalReaderEvidenceIsReused:
        clarificationSession.readerEvidence
        === initialSession.readerEvidence
        && changedRealitySession.readerEvidence
        === initialSession.readerEvidence,

      originalHumanContextIsReused:
        clarificationSession.humanContext
        === initialSession.humanContext
        && changedRealitySession.humanContext
        === initialSession.humanContext,

      followUpRunsQuestionReaderAgain:
        clarificationPreparation
          .turnResult
          .questionReaderResult
          !== initialSession
            .turns[0]
            .questionReaderResult
        && clarificationPreparation
          .turnResult
          .questionReaderResult
          .originalQuestion
          === clarificationQuestion,

      followUpRunsDecisionAgain:
        clarificationPreparation
          .turnResult
          .decisionResult
          !== initialSession
            .turns[0]
            .decisionResult,

      previousGptAnswerIsSeparatedFromDecisionInput:
        clarificationPreparation
          .conversationHistory
          .length
          === 1
        && clarificationPreparation
          .conversationHistory[0]
          .assistantAnswer
          === initialAssistantAnswer
        && !JSON.stringify(
          clarificationPreparation
            .turnResult,
        ).includes(
          initialAssistantAnswer,
        ),

      unchangedRealityKeepsRevision:
        clarificationPreparation
          .lifeContextChanged
          === false
        && clarificationPreparation
          .lifeContextRevision
          === 1
        && clarificationPreparation
          .newLifeContextRevision
          === null
        && clarificationSession
          .lifeContextHistory
          .length
          === 1
        && clarificationSession
          .turns[1]
          .lifeContextRevision
          === 1,

      emptyRealityUpdateDoesNotCreateRevision:
        unchangedRealityPreparation
          .lifeContextChanged
          === false
        && unchangedRealityPreparation
          .lifeContextRevision
          === 1
        && unchangedRealityPreparation
          .newLifeContextRevision
          === null,

      sameRealityValueDoesNotCreateRevision:
        sameValueRealityPreparation
          .lifeContextChanged
          === false
        && sameValueRealityPreparation
          .lifeContextRevision
          === 1
        && sameValueRealityPreparation
          .newLifeContextRevision
          === null,

      changedRealityCreatesExactlyOneRevision:
        changedRealityPreparation
          .lifeContextChanged
          === true
        && changedRealityPreparation
          .lifeContextRevision
          === 2
        && changedRealityPreparation
          .newLifeContextRevision
          ?.revision
          === 2
        && changedRealitySession
          .lifeContextHistory
          .length
          === 2
        && latestChangedRevision
          .revision
          === 2,

      partialRealityUpdatePreservesExistingValues:
        latestChangedRevision
          .sourceInput
          .maritalStatus
          === "married"
        && latestChangedRevision
          .sourceInput
          .financialResponsibility
          === "high"
        && latestChangedRevision
          .sourceInput
          .occupationStatus
          === "businessOwner"
        && latestChangedRevision
          .sourceInput
          .hasActiveBusiness
          === true,

      changedRealityIsUsedByNewDecisionTurn:
        changedRealitySession
          .turns[2]
          .lifeContextRevision
          === 2
        && changedRealitySession
          .turns[2]
          .question
          === changedRealityPreparation
            .question
        && changedRealitySession
          .turns[2]
          .decisionResult
          === changedRealityPreparation
            .turnResult
            .decisionResult,

      previousTurnsArePreserved:
        clarificationSession
          .turns[0]
          === initialSession
            .turns[0]
        && changedRealitySession
          .turns[0]
          === initialSession
            .turns[0]
        && changedRealitySession
          .turns[1]
          === clarificationSession
            .turns[1],

      newTurnsUseContinuousSequence:
        clarificationSession
          .turns
          .length
          === 2
        && clarificationSession
          .turns[1]
          .sequence
          === 2
        && clarificationSession
          .turns[1]
          .kind
          === "clarification"
        && changedRealitySession
          .turns
          .length
          === 3
        && changedRealitySession
          .turns[2]
          .sequence
          === 3
        && changedRealitySession
          .turns[2]
          .kind
          === "followUp",

      assistantAnswersArePreserved:
        clarificationSession
          .turns[1]
          .assistantAnswer
          === clarificationAssistantAnswer
        && changedRealitySession
          .turns[2]
          .assistantAnswer
          === changedRealityAssistantAnswer,

      confirmedFactsAreLinkedToSourceTurn:
        clarificationSession
          .confirmedFacts
          .length
          === 3
        && clarificationSession
          .confirmedFacts
          .every(
            (fact) =>
              fact.sourceTurnId
              === "turn-002"
              && fact.confirmedAt
              === "2026-07-27T18:41:00+09:00",
          ),

      clarificationStateMatchesNewDecision:
        clarificationStateMatchesDecision,

      stalePreparationIsRejected:
        stalePreparationIsRejected,

      emptyAssistantAnswerIsRejected:
        emptyAssistantAnswerIsRejected,

      duplicateTurnIdIsRejected:
        duplicateTurnIdIsRejected,

      closedSessionIsRejected:
        closedSessionIsRejected,

      clarificationWithoutRequestIsRejected:
        clarificationWithoutRequestIsRejected,
    };

    return {
      checks,

      initialSession,

      clarificationSession,

      changedRealitySession,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }