import {
    createAuthenticatedInitialConsultingSession,
  } from "./authenticatedInitialConsultingSessionService";
  import type {
    ConsultingSession,
  } from "./consultingSession";
  import type {
    ConsultingSessionRepository,
  } from "./consultingSessionRepository";
  import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification";

  export type AuthenticatedInitialConsultingClarificationVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  /**
   * 최초 상담에서 판단 근거가 부족한 경우
   * GPT 일반 설명을 호출하지 않고 구체적인 보충질문을 저장하는지 검증한다.
   */
  export async function verifyAuthenticatedInitialConsultingClarification():
    Promise<AuthenticatedInitialConsultingClarificationVerificationResult> {
    const question =
      "1967년 4월 10일 생과 동업은 어떤가요?";

    const request = {
      ...createSourceRequest(),

      question,
    };

    const execution =
      buildInitialConsultingExecution(
        request,
      );

    const persistedSessions:
      ConsultingSession[] = [];

    const repository:
      ConsultingSessionRepository = {
        async findById() {
          return null;
        },

        async create(
          session,
        ) {
          persistedSessions.push(
            session,
          );

          return {
            status:
              "created",
          };
        },

        async update() {
          return {
            status:
              "updated",
          };
        },
      };

    let answerRequestCount =
      0;

    const session =
      await createAuthenticatedInitialConsultingSession(
        {
          authorizationHeader:
            "Bearer clarification-verification-token",

          request,

          environment: {
            SUPABASE_URL:
              "https://verification.supabase.co",

            SUPABASE_SECRET_KEY:
              "verification-server-secret",
          },
        },
        {
          async createRepository() {
            return repository;
          },

          createSessionId() {
            return "initial-clarification-session";
          },

          createTurnId() {
            return "initial-clarification-turn";
          },

          now() {
            return "2026-08-03T06:00:00.000Z";
          },

          async interpretQuestion() {
            return execution
              .turnResult
              .questionReaderResult;
          },

          buildExecution() {
            return execution;
          },

          async requestAnswer() {
            answerRequestCount +=
              1;

            return "호출되면 안 되는 최초 상담 정형 GPT 답변";
          },

          buildSession(
            input,
          ) {
            return buildInitialConsultingSession(
              input,
            );
          },
        },
      );

    const initialTurn =
      session.turns[0];

    const checks = {
      insufficientEvidenceIsPreserved:
        initialTurn
          ?.decisionResult
          .verdict
        === "insufficientEvidence",

      openAIAnswerIsNotRequested:
        answerRequestCount
        === 0,

      originalQuestionIsAddressed:
        initialTurn
          ?.assistantAnswer
          .includes(
            question,
          )
        === true,

      providedBirthDateIsAcknowledged:
        initialTurn
          ?.assistantAnswer
          .includes(
            "말씀하신 생년월일은 확인했습니다.",
          )
        === true,

      remainingBirthDetailsAreRequested:
        initialTurn
          ?.assistantAnswer
          .includes(
            "양력·음력 여부",
          )
        === true
        && initialTurn
          .assistantAnswer
          .includes(
            "성별",
          )
        && initialTurn
          .assistantAnswer
          .includes(
            "출생시간",
          ),

      genericAnswerIsNotStored:
        initialTurn !== undefined
        && !initialTurn
          .assistantAnswer
          .includes(
            "호출되면 안 되는 최초 상담 정형 GPT 답변",
          ),

      sessionAwaitsClarification:
        session.status
        === "awaitingClarification"
        && session.pendingClarification
        !== null,

        clarificationItemsAreStored:
        (
          session
            .pendingClarification
            ?.items
            .length
          ?? 0
        ) > 0,

      sessionIsPersisted:
        persistedSessions.length
        === 1
        && persistedSessions[0]
        === session,
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
