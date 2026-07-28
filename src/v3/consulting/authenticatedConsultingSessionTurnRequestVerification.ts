import {
    InvalidAuthenticatedConsultingSessionTurnRequestError,
    isAuthenticatedConsultingSessionTurnRequest,
    parseAuthenticatedConsultingSessionTurnRequest,
  } from "./authenticatedConsultingSessionTurnRequest";

  export type AuthenticatedConsultingSessionTurnRequestVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  function captureError(
    action:
      () => unknown,
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

  export function verifyAuthenticatedConsultingSessionTurnRequest():
    AuthenticatedConsultingSessionTurnRequestVerificationResult {
    const validFollowUpRequest = {
      sessionId:
        "  session-request-001  ",

      kind:
        "followUp",

      question:
        "  현재 조건에서 다음 선택은 무엇인가요?  ",
    };

    const parsedFollowUpRequest =
      parseAuthenticatedConsultingSessionTurnRequest(
        validFollowUpRequest,
      );

    const validClarificationRequest = {
      sessionId:
        "session-request-002",

      kind:
        "clarification",

      question:
        "월 소득과 고정지출을 추가로 알려드립니다.",

      lifeContextUpdate: {
        occupationStatus:
          "employed",

        financialResponsibility:
          "high",

        hasChildren:
          true,
      },
    };

    const parsedClarificationRequest =
      parseAuthenticatedConsultingSessionTurnRequest(
        validClarificationRequest,
      );

    const invalidParseError =
      captureError(
        () =>
          parseAuthenticatedConsultingSessionTurnRequest({
            sessionId:
              "",

            kind:
              "followUp",

            question:
              "질문",
          }),
      );

    const checks = {
      validFollowUpIsAccepted:
        isAuthenticatedConsultingSessionTurnRequest(
          validFollowUpRequest,
        ),

      validClarificationIsAccepted:
        isAuthenticatedConsultingSessionTurnRequest(
          validClarificationRequest,
        ),

      sessionIdIsNormalized:
        parsedFollowUpRequest
          .sessionId
        === "session-request-001",

      questionIsNormalized:
        parsedFollowUpRequest
          .question
        === "현재 조건에서 다음 선택은 무엇인가요?",

      kindIsPreserved:
        parsedFollowUpRequest
          .kind
        === "followUp",

      omittedLifeContextStaysOmitted:
        !Object.hasOwn(
          parsedFollowUpRequest,
          "lifeContextUpdate",
        ),

      lifeContextUpdateIsPreserved:
        parsedClarificationRequest
          .lifeContextUpdate
          ?.occupationStatus
        === "employed"
        && parsedClarificationRequest
          .lifeContextUpdate
          ?.financialResponsibility
        === "high"
        && parsedClarificationRequest
          .lifeContextUpdate
          ?.hasChildren
        === true,

      nullRequestIsRejected:
        !isAuthenticatedConsultingSessionTurnRequest(
          null,
        ),

      arrayRequestIsRejected:
        !isAuthenticatedConsultingSessionTurnRequest(
          [],
        ),

      emptySessionIdIsRejected:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "   ",

          kind:
            "followUp",

          question:
            "질문",
        }),

      emptyQuestionIsRejected:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "session-request-003",

          kind:
            "followUp",

          question:
            "   ",
        }),

      initialKindIsRejected:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "session-request-004",

          kind:
            "initial",

          question:
            "질문",
        }),

      unknownKindIsRejected:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "session-request-005",

          kind:
            "unknown",

          question:
            "질문",
        }),

      nullLifeContextIsRejected:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "session-request-006",

          kind:
            "followUp",

          question:
            "질문",

          lifeContextUpdate:
            null,
        }),

      invalidLifeContextValueIsRejected:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "session-request-007",

          kind:
            "followUp",

          question:
            "질문",

          lifeContextUpdate: {
            financialResponsibility:
              "unlimited",
          },
        }),

      unknownLifeContextFieldIsRejected:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "session-request-008",

          kind:
            "followUp",

          question:
            "질문",

          lifeContextUpdate: {
            internalScore:
              100,
          },
        }),

      ownerIdCannotBeTransported:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "session-request-009",

          kind:
            "followUp",

          question:
            "질문",

          ownerId:
            "11111111-1111-4111-8111-111111111111",
        }),

      turnIdCannotBeTransported:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "session-request-010",

          kind:
            "followUp",

          question:
            "질문",

          turnId:
            "client-created-turn-id",
        }),

      timestampsCannotBeTransported:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "session-request-011",

          kind:
            "followUp",

          question:
            "질문",

          preparedAt:
            "2026-07-29T05:00:00+09:00",

          createdAt:
            "2026-07-29T05:00:00+09:00",
        }),

      repositoryCannotBeTransported:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "session-request-012",

          kind:
            "followUp",

          question:
            "질문",

          repository: {},
        }),

      engineResultCannotBeTransported:
        !isAuthenticatedConsultingSessionTurnRequest({
          sessionId:
            "session-request-013",

          kind:
            "followUp",

          question:
            "질문",

          decisionResult: {
            verdict:
              "recommended",
          },
        }),

      invalidParseUsesTypedError:
        invalidParseError
        instanceof InvalidAuthenticatedConsultingSessionTurnRequestError,
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
