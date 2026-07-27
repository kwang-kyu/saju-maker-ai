import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder";
  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest";

  export type InitialConsultingSessionBuilderVerificationResult = {
    checks: Record<
      string,
      boolean
    >;

    session:
      ReturnType<
        typeof buildInitialConsultingSession
      >;

    passed:
      boolean;
  };

  function createSourceRequest():
    V3ConsultingRequest {
    return {
      sajuInput: {
        name:
          "김천운",

        birthDate:
          "1984-03-15",

        birthTime:
          "14:30",

        gender:
          "male",

        calendarType:
          "solar",

        referenceDate:
          "2026-07-26",

        luckStartMethod:
          "minuteBased",
      },

      humanLifeContextInput: {
        maritalStatus:
          "married",

        hasChildren:
          true,

        occupationStatus:
          "employed",

        hasActiveBusiness:
          false,

        financialResponsibility:
          "high",
      },

      question:
        "대출 부담이 있는데 상가를 매수해도 될까요?",
    };
  }

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

  export function verifyInitialConsultingSessionBuilder():
    InitialConsultingSessionBuilderVerificationResult {
    const request =
      createSourceRequest();

    const execution =
      buildInitialConsultingExecution(
        request,
      );

    const assistantAnswer =
      "현재 정보만으로 매수를 확정할 수 없습니다. 대출 상환능력과 실행기한을 먼저 확인해야 합니다.";

    const session =
      buildInitialConsultingSession({
        sessionId:
          "session-001",

        initialTurnId:
          "turn-001",

        createdAt:
          "2026-07-27T18:30:00+09:00",

        request,

        execution,

        assistantAnswer,
      });

    const emptyAnswerIsRejected =
      actionThrows(
        () =>
          buildInitialConsultingSession({
            sessionId:
              "session-empty-answer",

            initialTurnId:
              "turn-empty-answer",

            createdAt:
              "2026-07-27T18:31:00+09:00",

            request,

            execution,

            assistantAnswer:
              "   ",
          }),
      );

    const mismatchedQuestionIsRejected =
      actionThrows(
        () =>
          buildInitialConsultingSession({
            sessionId:
              "session-mismatch",

            initialTurnId:
              "turn-mismatch",

            createdAt:
              "2026-07-27T18:32:00+09:00",

            request: {
              ...request,

              question:
                "다른 질문을 해도 될까요?",
            },

            execution,

            assistantAnswer,
          }),
      );

    const clarificationQuestions =
      session
        .pendingClarification
        ?.questions
        .join("\n")
        ?? "";

    const checks = {
      sessionIdIsPreserved:
        session.id
        === "session-001",

      timestampsArePreserved:
        session.createdAt
        === "2026-07-27T18:30:00+09:00"
        && session.updatedAt
        === session.createdAt,

      sajuInputIsPreserved:
        session.sajuInput
        === request.sajuInput,

      sajuFactsAreNotRecalculated:
        session.sajuFacts
        === execution
          .humanDestinyPipeline
          .sajuFactsPipeline,

      readerEvidenceIsNotRebuilt:
        session.readerEvidence
        === execution
          .humanDestinyPipeline
          .evidenceBundle,

      humanContextIsNotRebuilt:
        session.humanContext
        === execution
          .humanDestinyPipeline
          .humanContext,

      lifeContextIsNotRebuilt:
        session
          .lifeContextHistory[0]
          .lifeContext
        === execution.lifeContext,

      decisionResultIsNotRebuilt:
        session
          .turns[0]
          .decisionResult
        === execution
          .turnResult
          .decisionResult,

      initialLifeContextRevisionIsOne:
        session
          .lifeContextHistory[0]
          .revision
        === 1
        && session
          .turns[0]
          .lifeContextRevision
        === 1,

      exactlyOneInitialTurnExists:
        session.turns.length
        === 1
        && session
          .turns[0]
          .kind
        === "initial"
        && session
          .turns[0]
          .sequence
        === 1,

      initialQuestionIsPreserved:
        session
          .turns[0]
          .question
        === request.question,

      assistantAnswerIsPreserved:
        session
          .turns[0]
          .assistantAnswer
        === assistantAnswer,

      insufficientEvidenceAwaitsClarification:
        session
          .turns[0]
          .decisionResult
          .verdict
        === "insufficientEvidence"
        && session.status
        === "awaitingClarification",

      clarificationIsLinkedToInitialTurn:
        session
          .pendingClarification
          ?.decisionTurnId
        === "turn-001",

      debtClarificationIsPreserved:
        clarificationQuestions
          .includes(
            "대출 잔액",
          )
        && clarificationQuestions
          .includes(
            "월 상환액",
          ),

      deadlineClarificationIsPreserved:
        clarificationQuestions
          .includes(
            "마감 시점",
          ),

      emptyAssistantAnswerIsRejected:
        emptyAnswerIsRejected,

      mismatchedQuestionIsRejected:
        mismatchedQuestionIsRejected,
    };

    return {
      checks,

      session,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }