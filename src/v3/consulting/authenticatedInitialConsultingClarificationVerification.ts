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
  import {
    buildConsultingClarification,
  } from "./consultingClarificationBuilder";
  import type {
    QuestionReaderResult,
  } from "./question/questionReader";

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

    completeCounterpartChecks:
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

  const COMPLETE_COUNTERPART_QUESTION =
    "1967년 4월 10일 양력 출생 여성과 동업은 어떤가요?";

  const COMPLETE_COUNTERPART_FAKE_OPENAI_ANSWER =
    "완전정보 동업 상담 정형 GPT 답변";

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

  type CompleteCounterpartInspectionInput = {
    counterpartExists:
      boolean;

    identityProvided:
      boolean;

    birthDataProvided:
      boolean;

    decisionEvidence: readonly {
      source:
        string;
    }[];

    verdict:
      string;

    answerRequestCount:
      number;

    sessionStatus:
      string;

    pendingClarification: {
      decisionTurnId:
        string;

      items:
        readonly MarriageClarificationInspectionItem[];
    } | null;

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

    mockAnswer:
      string;

    createCount:
      number;

    updateCount:
      number;

    persistedSession:
      ConsultingSession | null;

    returnedSession:
      ConsultingSession;

    missingCalendarTypeBirthDataProvided:
      boolean;

    missingCalendarTypeVerdict:
      string;

    missingCalendarTypeClarificationItems: readonly {
      key:
        string;
    }[];
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

  function evaluateCompleteCounterpartChecks(
    input:
      CompleteCounterpartInspectionInput,
  ):
    Record<
      string,
      boolean
    > {
    return {
      counterpartExists:
        input.counterpartExists
        === true,

      identityProvided:
        input.identityProvided
        === true,

      birthDataProvided:
        input.birthDataProvided
        === true,

      compatibilityEvidenceExists:
        input
          .decisionEvidence
          .some(
            (evidence) =>
              evidence.source
              === "compatibility",
          ),

      verdictIsNotInsufficientEvidence:
        input.verdict
        !== "insufficientEvidence",

      openAIAnswerIsRequestedOnce:
        input.answerRequestCount
        === 1,

      sessionIsActive:
        input.sessionStatus
        === "active",

      pendingClarificationIsNull:
        input.pendingClarification
        === null,

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

      mockFinalAnswerIsStored:
        input.assistantAnswer
        === input.mockAnswer,

      assistantAnswerDoesNotRequestCounterpartBirthData:
        !input
          .assistantAnswer
          .includes(
            "말씀하신 생년월일은 확인했습니다.",
          )
        && !input
          .assistantAnswer
          .includes(
            "양력·음력 여부",
          )
        && !input
          .assistantAnswer
          .includes(
            "이미 알려주신 정보는 다시 적지 않아도 됩니다.",
          )
        && !input
          .assistantAnswer
          .includes(
            "상대방의 생년월일",
          )
        && !input
          .assistantAnswer
          .includes(
            "출생시간",
          ),

      sessionIsCreatedOnce:
        input.createCount
        === 1,

      repositoryUpdateIsNotCalled:
        input.updateCount
        === 0,

      persistedSessionMatchesReturnedSession:
        input.persistedSession
        === input.returnedSession,
    };
  }

  function evaluateCompleteCounterpartNegativeChecks(
    input:
      CompleteCounterpartInspectionInput,
  ):
    Record<
      string,
      boolean
    > {
    const actualChecks =
      evaluateCompleteCounterpartChecks(
        input,
      );

    const evidenceWithoutCompatibility =
      input
        .decisionEvidence
        .filter(
          (evidence) =>
            evidence.source
            !== "compatibility",
        );

    return {
      missingCalendarTypeBirthDataIsNotProvided:
        input
          .missingCalendarTypeBirthDataProvided
        === false,

      missingCalendarTypeVerdictIsInsufficientEvidence:
        input.missingCalendarTypeVerdict
        === "insufficientEvidence",

      missingCalendarTypeCounterpartBirthDataItemExists:
        input
          .missingCalendarTypeClarificationItems
          .some(
            (item) =>
              item.key
              === "counterpartBirthData",
          ),

      wrongVerdictFails:
        evaluateCompleteCounterpartChecks({
          ...input,

          verdict:
            "insufficientEvidence",
        }).verdictIsNotInsufficientEvidence
        === false,

      nonActiveStatusFails:
        evaluateCompleteCounterpartChecks({
          ...input,

          sessionStatus:
            "awaitingClarification",
        }).sessionIsActive
        === false,

      pendingClarificationObjectFails:
        evaluateCompleteCounterpartChecks({
          ...input,

          pendingClarification: {
            decisionTurnId:
              "injected-complete-counterpart-decision-turn",

            items:
              [],
          },
        }).pendingClarificationIsNull
        === false,

      wrongAnswerRequestCountFails:
        evaluateCompleteCounterpartChecks({
          ...input,

          answerRequestCount:
            0,
        }).openAIAnswerIsRequestedOnce
        === false,

      missingCompatibilityEvidenceFails:
        evaluateCompleteCounterpartChecks({
          ...input,

          decisionEvidence:
            evidenceWithoutCompatibility,
        }).compatibilityEvidenceExists
        === false,

      actualCompleteCounterpartChecksPassBeforeNegatives:
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

    const completeCounterpartRequest = {
      ...createSourceRequest(),

      question:
        COMPLETE_COUNTERPART_QUESTION,
    };

    const actualCompleteQuestionReaderResult =
      buildInitialConsultingExecution(
        completeCounterpartRequest,
      )
        .turnResult
        .questionReaderResult;

    const completeCounterpartInterpretation:
      QuestionReaderResult = {
        ...actualCompleteQuestionReaderResult,

        evidence: [
          ...actualCompleteQuestionReaderResult
            .evidence,
        ],

        counterpartFacts: {
          birthDate:
            "1967-04-10",

          birthTime:
            null,

          calendarType:
            "solar",

          gender:
            "female",

          zodiac:
            actualCompleteQuestionReaderResult
              .counterpartFacts
              .zodiac,

          relationship:
            actualCompleteQuestionReaderResult
              .counterpartFacts
              .relationship,

          evidence: [
            "1967년 4월 10일",
            "양력",
            "여성",
          ],
        },
      };

    const completeCounterpartPersistedSessions:
      ConsultingSession[] = [];

    let completeCounterpartCreateCount =
      0;

    let completeCounterpartUpdateCount =
      0;

    const completeCounterpartRepository:
      ConsultingSessionRepository = {
        async findById() {
          return null;
        },

        async create(
          createdSession,
        ) {
          completeCounterpartCreateCount +=
            1;

          completeCounterpartPersistedSessions.push(
            createdSession,
          );

          return {
            status:
              "created",
          };
        },

        async update() {
          completeCounterpartUpdateCount +=
            1;

          return {
            status:
              "updated",
          };
        },
      };

    let completeCounterpartAnswerRequestCount =
      0;

    const completeCounterpartSession =
      await createAuthenticatedInitialConsultingSession(
        {
          authorizationHeader:
            "Bearer complete-counterpart-verification-token",

          request:
            completeCounterpartRequest,

          environment: {
            SUPABASE_URL:
              "https://verification.supabase.co",

            SUPABASE_SECRET_KEY:
              "verification-server-secret",
          },
        },
        {
          async createRepository() {
            return completeCounterpartRepository;
          },

          createSessionId() {
            return "initial-complete-counterpart-session";
          },

          createTurnId() {
            return "initial-complete-counterpart-turn";
          },

          now() {
            return "2026-08-03T06:00:00.000Z";
          },

          async interpretQuestion() {
            return completeCounterpartInterpretation;
          },

          buildExecution(
            request,
            questionInterpretation,
          ) {
            return buildInitialConsultingExecution(
              request,
              questionInterpretation,
            );
          },

          async requestAnswer() {
            completeCounterpartAnswerRequestCount +=
              1;

            return COMPLETE_COUNTERPART_FAKE_OPENAI_ANSWER;
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

    const completeCounterpartInitialTurns =
      completeCounterpartSession
        .turns
        .filter(
          (turn) =>
            turn.kind
            === "initial",
        );

    const completeCounterpartInitialTurn =
      completeCounterpartInitialTurns[0];

    const missingCalendarTypeInterpretation:
      QuestionReaderResult = {
        ...completeCounterpartInterpretation,

        evidence: [
          ...completeCounterpartInterpretation
            .evidence,
        ],

        counterpartFacts: {
          ...completeCounterpartInterpretation
            .counterpartFacts,

          evidence: [
            ...completeCounterpartInterpretation
              .counterpartFacts
              .evidence,
          ],

          calendarType:
            null,
        },
      };

    const missingCalendarTypeExecution =
      buildInitialConsultingExecution(
        completeCounterpartRequest,
        missingCalendarTypeInterpretation,
      );

    const missingCalendarTypeClarification =
      buildConsultingClarification({
        decisionTurnId:
          "initial-complete-counterpart-missing-calendar-turn",

        lifeContext:
          missingCalendarTypeExecution
            .lifeContext,

        questionContext:
          missingCalendarTypeExecution
            .turnResult
            .questionContext,

        decisionResult:
          missingCalendarTypeExecution
            .turnResult
            .decisionResult,
      });

    const completeCounterpartInspectionInput:
      CompleteCounterpartInspectionInput = {
        counterpartExists:
          completeCounterpartInitialTurn
            ?.questionContext
            .counterpart
            .exists
          === true,

        identityProvided:
          completeCounterpartInitialTurn
            ?.questionContext
            .counterpart
            .identityProvided
          === true,

        birthDataProvided:
          completeCounterpartInitialTurn
            ?.questionContext
            .counterpart
            .birthDataProvided
          === true,

        decisionEvidence:
          completeCounterpartInitialTurn
            ?.decisionResult
            .evidence
          ?? [],

        verdict:
          completeCounterpartInitialTurn
            ?.decisionResult
            .verdict
          ?? "",

        answerRequestCount:
          completeCounterpartAnswerRequestCount,

        sessionStatus:
          completeCounterpartSession.status,

        pendingClarification:
          toClarificationInspectionItems(
            completeCounterpartSession
              .pendingClarification,
          ),

        initialTurnCount:
          completeCounterpartInitialTurns.length,

        initialTurnKind:
          completeCounterpartInitialTurn
            ?.kind,

        initialTurnQuestion:
          completeCounterpartInitialTurn
            ?.question,

        initialTurnOriginalQuestion:
          completeCounterpartInitialTurn
            ?.questionReaderResult
            .originalQuestion,

        assistantAnswer:
          completeCounterpartInitialTurn
            ?.assistantAnswer
          ?? "",

        originalQuestion:
          COMPLETE_COUNTERPART_QUESTION,

        mockAnswer:
          COMPLETE_COUNTERPART_FAKE_OPENAI_ANSWER,

        createCount:
          completeCounterpartCreateCount,

        updateCount:
          completeCounterpartUpdateCount,

        persistedSession:
          completeCounterpartPersistedSessions[0]
          ?? null,

        returnedSession:
          completeCounterpartSession,

        missingCalendarTypeBirthDataProvided:
          missingCalendarTypeExecution
            .turnResult
            .questionContext
            .counterpart
            .birthDataProvided,

        missingCalendarTypeVerdict:
          missingCalendarTypeExecution
            .turnResult
            .decisionResult
            .verdict,

        missingCalendarTypeClarificationItems:
          missingCalendarTypeClarification
            ?.items
          ?? [],
      };

    const completeCounterpartChecks = {
      ...evaluateCompleteCounterpartChecks(
        completeCounterpartInspectionInput,
      ),

      ...evaluateCompleteCounterpartNegativeChecks(
        completeCounterpartInspectionInput,
      ),
    };

    return {
      checks,

      marriageChecks,

      completeCounterpartChecks,

      passed:
        everyCheckPassed(
          checks,
        )
        && everyCheckPassed(
          marriageChecks,
        )
        && everyCheckPassed(
          completeCounterpartChecks,
        ),
    };
  }
