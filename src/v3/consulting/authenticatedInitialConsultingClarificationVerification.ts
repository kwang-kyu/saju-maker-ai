import {
    createAuthenticatedInitialConsultingSession,
  } from "./authenticatedInitialConsultingSessionService";
  import type {
    ConsultingClarificationRequest,
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

    marriageChecks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  const MARRIAGE_QUESTION =
    "현재 연인과 결혼을 결정해도 될까요?";

  const MARRIAGE_FAKE_OPENAI_ANSWER =
    "호출되면 안 되는 결혼 상담 정형 GPT 답변";

  type MarriageClarificationInspectionItem = {
    key:
      string;

    description:
      string;

    question:
      string;
  };

  type MarriageClarificationInspectionInput = {
    topic:
      string;

    verdict:
      string;

    answerRequestCount:
      number;

    initialTurnCount:
      number;

    initialTurnKind:
      string | undefined;

    initialTurnQuestion:
      string | undefined;

    initialTurnOriginalQuestion:
      string | undefined;

    assistantAnswer:
      string;

    originalQuestion:
      string;

    sessionStatus:
      string;

    pendingClarification: {
      decisionTurnId:
        string;

      items:
        readonly MarriageClarificationInspectionItem[];
    } | null;

    expectedDecisionTurnId:
      string;

    createCount:
      number;

    updateCount:
      number;

    persistedSession:
      ConsultingSession | null;

    returnedSession:
      ConsultingSession;
  };

  function everyCheckPassed(
    checks:
      Record<
        string,
        boolean
      >,
  ): boolean {
    return Object
      .values(
        checks,
      )
      .every(
        (value) =>
          value
          === true,
      );
  }

  function findCounterpartBirthDataItem(
    pendingClarification:
      MarriageClarificationInspectionInput["pendingClarification"],
  ):
    MarriageClarificationInspectionItem | undefined {
    return pendingClarification
      ?.items
      .find(
        (item) =>
          item.key
          === "counterpartBirthData",
      );
  }

  function countItemsMentioning(
    items:
      readonly MarriageClarificationInspectionItem[],
    text:
      string,
  ): number {
    return items
      .filter(
        (item) =>
          item.question.includes(
            text,
          )
          || item.description.includes(
            text,
          ),
      )
      .length;
  }

  function toClarificationInspectionItems(
    pendingClarification:
      ConsultingClarificationRequest | null,
  ):
    MarriageClarificationInspectionInput["pendingClarification"] {
    if (
      pendingClarification
      === null
    ) {
      return null;
    }

    return {
      decisionTurnId:
        pendingClarification
          .decisionTurnId,

      items:
        pendingClarification
          .items,
    };
  }

  function evaluateMarriageClarificationChecks(
    input:
      MarriageClarificationInspectionInput,
  ):
    Record<
      string,
      boolean
    > {
    const counterpartBirthDataItem =
      findCounterpartBirthDataItem(
        input.pendingClarification,
      );

    const counterpartBirthText = [
      counterpartBirthDataItem
        ?.question
      ?? "",
      counterpartBirthDataItem
        ?.description
      ?? "",
    ].join(
      "\n",
    );

    const clarificationItems =
      input.pendingClarification
        ?.items
      ?? [];

    const uniqueQuestionCount =
      new Set(
        clarificationItems.map(
          (item) =>
            item.question,
        ),
      ).size;

    const uniqueKeyCount =
      new Set(
        clarificationItems.map(
          (item) =>
            item.key,
        ),
      ).size;

    return {
      topicIsMarriage:
        input.topic
        === "marriage",

      verdictIsInsufficientEvidence:
        input.verdict
        === "insufficientEvidence",

      openAIAnswerIsNotRequested:
        input.answerRequestCount
        === 0,

      initialTurnCountIsOne:
        input.initialTurnCount
        === 1,

      initialTurnKindIsInitial:
        input.initialTurnKind
        === "initial",

      originalQuestionIsPreserved:
        input.initialTurnQuestion
        === input.originalQuestion
        && input.initialTurnOriginalQuestion
        === input.originalQuestion,

      originalQuestionIsIncludedInAssistantAnswer:
        input.assistantAnswer.includes(
          input.originalQuestion,
        ),

      genericMarriageConclusionIsNotStored:
        input.assistantAnswer.includes(
          "결론을 확정하지 않",
        )
        && !input
          .assistantAnswer
          .includes(
            MARRIAGE_FAKE_OPENAI_ANSWER,
          )
        && !input
          .assistantAnswer
          .includes(
            "결혼을 추천",
          )
        && !input
          .assistantAnswer
          .includes(
            "결혼해도 됩니다",
          )
        && !input
          .assistantAnswer
          .includes(
            "결혼하지 마세요",
          )
        && !input
          .assistantAnswer
          .includes(
            "conditionallyRecommended",
          )
        && !input
          .assistantAnswer
          .includes(
            "recommended",
          )
        && !input
          .assistantAnswer
          .includes(
            "notRecommended",
          ),

      sessionAwaitsClarification:
        input.sessionStatus
        === "awaitingClarification",

      pendingClarificationExists:
        input.pendingClarification
        !== null,

      originalDecisionTurnIdIsPreserved:
        input.pendingClarification
          ?.decisionTurnId
        === input.expectedDecisionTurnId,

      counterpartBirthDataItemExists:
        counterpartBirthDataItem
        !== undefined,

      counterpartBirthDateIsRequested:
        counterpartBirthText.includes(
          "생년월일",
        ),

      counterpartCalendarTypeIsRequested:
        counterpartBirthText.includes(
          "양력·음력 여부",
        )
        || (
          counterpartBirthText.includes(
            "양력",
          )
          && counterpartBirthText.includes(
            "음력",
          )
        ),

      counterpartGenderIsRequested:
        counterpartBirthText.includes(
          "성별",
        ),

      counterpartBirthTimeIsRequestedOrOptional:
        counterpartBirthText.includes(
          "출생시간",
        )
        || counterpartBirthText.includes(
          "가능한 경우",
        )
        || (
          counterpartBirthDataItem
          !== undefined
          && counterpartBirthText.includes(
            "생년월일",
          )
          && !counterpartBirthText.includes(
            "출생시간",
          )
        ),

      clarificationQuestionsAreUnique:
        clarificationItems.length
        > 0
        && uniqueQuestionCount
        === clarificationItems.length
        && uniqueKeyCount
        === clarificationItems.length
        && countItemsMentioning(
          clarificationItems,
          "생년월일",
        ) <= 1
        && countItemsMentioning(
          clarificationItems,
          "양력·음력 여부",
        ) <= 1
        && countItemsMentioning(
          clarificationItems,
          "성별",
        ) <= 1,

      sessionIsCreatedOnce:
        input.createCount
        === 1,

      persistedSessionMatchesReturnedSession:
        input.persistedSession
        === input.returnedSession,

      repositoryUpdateIsNotCalled:
        input.updateCount
        === 0,

      openAIAndSupabaseClientsAreNotCalled:
        input.answerRequestCount
        === 0
        && input.updateCount
        === 0
        && input.createCount
        === 1,
    };
  }

  function evaluateMarriageClarificationNegativeChecks(
    input:
      MarriageClarificationInspectionInput,
  ):
    Record<
      string,
      boolean
    > {
    const actualChecks =
      evaluateMarriageClarificationChecks(
        input,
      );

    const pendingWithoutCounterpartBirthData =
      input.pendingClarification === null
        ? null
        : {
            decisionTurnId:
              input
                .pendingClarification
                .decisionTurnId,

            items:
              input
                .pendingClarification
                .items
                .filter(
                  (item) =>
                    item.key
                    !== "counterpartBirthData",
                ),
          };

    return {
      wrongTopicFails:
        evaluateMarriageClarificationChecks({
          ...input,

          topic:
            "love",
        }).topicIsMarriage
        === false,

      wrongVerdictFails:
        evaluateMarriageClarificationChecks({
          ...input,

          verdict:
            "conditionallyRecommended",
        }).verdictIsInsufficientEvidence
        === false,

      answerRequestCountOfOneFails:
        evaluateMarriageClarificationChecks({
          ...input,

          answerRequestCount:
            1,
        }).openAIAnswerIsNotRequested
        === false,

      missingCounterpartBirthDataFails:
        evaluateMarriageClarificationChecks({
          ...input,

          pendingClarification:
            pendingWithoutCounterpartBirthData,
        }).counterpartBirthDataItemExists
        === false,

      nonAwaitingClarificationFails:
        evaluateMarriageClarificationChecks({
          ...input,

          sessionStatus:
            "active",
        }).sessionAwaitsClarification
        === false,

      missingOriginalQuestionInAnswerFails:
        evaluateMarriageClarificationChecks({
          ...input,

          assistantAnswer:
            input.assistantAnswer.replaceAll(
              input.originalQuestion,
              "",
            ),
        }).originalQuestionIsIncludedInAssistantAnswer
        === false,

      missingPersistedSessionFails:
        evaluateMarriageClarificationChecks({
          ...input,

          persistedSession:
            null,

          createCount:
            0,
        }).persistedSessionMatchesReturnedSession
        === false,

      twoInitialTurnsFail:
        evaluateMarriageClarificationChecks({
          ...input,

          initialTurnCount:
            2,
        }).initialTurnCountIsOne
        === false,

      actualMarriageChecksPassBeforeNegatives:
        everyCheckPassed(
          actualChecks,
        ),
    };
  }

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

    const marriageRequest = {
      ...createSourceRequest(),

      question:
        MARRIAGE_QUESTION,
    };

    const marriageExecution =
      buildInitialConsultingExecution(
        marriageRequest,
      );

    const marriagePersistedSessions:
      ConsultingSession[] = [];

    let marriageCreateCount =
      0;

    let marriageUpdateCount =
      0;

    const marriageRepository:
      ConsultingSessionRepository = {
        async findById() {
          return null;
        },

        async create(
          createdSession,
        ) {
          marriageCreateCount +=
            1;

          marriagePersistedSessions.push(
            createdSession,
          );

          return {
            status:
              "created",
          };
        },

        async update() {
          marriageUpdateCount +=
            1;

          return {
            status:
              "updated",
          };
        },
      };

    let marriageAnswerRequestCount =
      0;

    const marriageSession =
      await createAuthenticatedInitialConsultingSession(
        {
          authorizationHeader:
            "Bearer marriage-clarification-verification-token",

          request:
            marriageRequest,

          environment: {
            SUPABASE_URL:
              "https://verification.supabase.co",

            SUPABASE_SECRET_KEY:
              "verification-server-secret",
          },
        },
        {
          async createRepository() {
            return marriageRepository;
          },

          createSessionId() {
            return "initial-marriage-clarification-session";
          },

          createTurnId() {
            return "initial-marriage-clarification-turn";
          },

          now() {
            return "2026-08-03T06:00:00.000Z";
          },

          async interpretQuestion() {
            return marriageExecution
              .turnResult
              .questionReaderResult;
          },

          buildExecution() {
            return marriageExecution;
          },

          async requestAnswer() {
            marriageAnswerRequestCount +=
              1;

            return MARRIAGE_FAKE_OPENAI_ANSWER;
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

    const marriageInitialTurns =
      marriageSession
        .turns
        .filter(
          (turn) =>
            turn.kind
            === "initial",
        );

    const marriageInitialTurn =
      marriageInitialTurns[0];

    const marriageInspectionInput:
      MarriageClarificationInspectionInput = {
        topic:
          marriageInitialTurn
            ?.questionReaderResult
            .topic
          ?? "",

        verdict:
          marriageInitialTurn
            ?.decisionResult
            .verdict
          ?? "",

        answerRequestCount:
          marriageAnswerRequestCount,

        initialTurnCount:
          marriageInitialTurns.length,

        initialTurnKind:
          marriageInitialTurn
            ?.kind,

        initialTurnQuestion:
          marriageInitialTurn
            ?.question,

        initialTurnOriginalQuestion:
          marriageInitialTurn
            ?.questionReaderResult
            .originalQuestion,

        assistantAnswer:
          marriageInitialTurn
            ?.assistantAnswer
          ?? "",

        originalQuestion:
          MARRIAGE_QUESTION,

        sessionStatus:
          marriageSession.status,

        pendingClarification:
          toClarificationInspectionItems(
            marriageSession
              .pendingClarification,
          ),

        expectedDecisionTurnId:
          marriageInitialTurn
            ?.id
          ?? "",

        createCount:
          marriageCreateCount,

        updateCount:
          marriageUpdateCount,

        persistedSession:
          marriagePersistedSessions[0]
          ?? null,

        returnedSession:
          marriageSession,
      };

    const marriageChecks = {
      ...evaluateMarriageClarificationChecks(
        marriageInspectionInput,
      ),

      ...evaluateMarriageClarificationNegativeChecks(
        marriageInspectionInput,
      ),
    };

    return {
      checks,

      marriageChecks,

      passed:
        everyCheckPassed(
          checks,
        )
        && everyCheckPassed(
          marriageChecks,
        ),
    };
  }
