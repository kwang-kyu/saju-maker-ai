import {
    buildConsultingClarification,
  } from "./consultingClarificationBuilder.js";
  import {
    buildConsultingClarificationAnswer,
  } from "./consultingClarificationAnswerBuilder.js";
  import {
    executeConsultingSessionTurn,
  } from "./consultingSessionTurnExecutor.js";
  import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder.js";
  import {
    buildConsultingSessionTurn,
    prepareConsultingSessionTurn,
  } from "./consultingSessionTurnBuilder.js";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder.js";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification.js";
  import type {
    ConsultingClarificationRequest,
    ConsultingSession,
  } from "./consultingSession.js";
  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest.js";

  export type ConsultingCompatibilityRelationshipClarificationVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  const COMPATIBILITY_QUESTION =
    "지금 새로 만난 사람과 궁합이 맞나요?";

  const BOYFRIEND_QUESTION =
    "남자친구와 계속 만나야 할까요?";

  const MARRIAGE_QUESTION =
    "현재 연인과 결혼을 결정해도 될까요?";

  function hasPendingItemKey(
    pendingClarification:
      ConsultingClarificationRequest | null,
    key:
      string,
  ): boolean {
    return pendingClarification
      ?.items
      .some(
        (item) =>
          item.key
          === key,
      )
      === true;
  }

  function buildForcedInsufficientClarification(
    request:
      V3ConsultingRequest,
    decisionTurnId:
      string,
  ) {
    const execution =
      buildInitialConsultingExecution(
        request,
      );

    return {
      execution,

      clarification:
        buildConsultingClarification({
          decisionTurnId,

          lifeContext:
            execution.lifeContext,

          questionContext:
            execution
              .turnResult
              .questionContext,

          decisionResult: {
            ...execution
              .turnResult
              .decisionResult,

            verdict:
              "insufficientEvidence",
          },
        }),
    };
  }

  function withDecisionAnalysisMode(
    session:
      ConsultingSession,
  ):
    ConsultingSession {
    const [
      firstTurn,
      ...restTurns
    ] = session.turns;

    const applyDecisionMode = (
      turn:
        ConsultingSession["turns"][number],
    ) => ({
      ...turn,

      questionReaderResult: {
        ...turn.questionReaderResult,

        analysisMode:
          "decision" as const,
      },

      questionContext: {
        ...turn.questionContext,

        question: {
          ...turn.questionContext
            .question,

          analysisMode:
            "decision" as const,
        },
      },
    });

    return {
      ...session,

      turns: [
        applyDecisionMode(
          firstTurn,
        ),
        ...restTurns.map(
          applyDecisionMode,
        ),
      ],
    };
  }

  function withLeftoverRelationshipItems(
    session:
      ConsultingSession,
  ):
    ConsultingSession {
    const pendingClarification =
      session.pendingClarification;

    if (
      pendingClarification
      === null
    ) {
      throw new Error(
        "Compatibility session requires a pending clarification.",
      );
    }

    return {
      ...session,

      pendingClarification: {
        decisionTurnId:
          pendingClarification
            .decisionTurnId,

        items: [
          pendingClarification
            .items[0],
          ...pendingClarification
            .items
            .slice(
              1,
            ),
          {
            key:
              "counterpartIdentity",

            description:
              "관계 판단의 상대방과 현재 관계 상태가 확인되지 않았다.",

            question:
              "상대방과의 관계, 현재 관계 상태, 지금 가장 고민되는 갈등은 무엇인가요?",
          },
          {
            key:
              "currentRelationshipSituation",

            description:
              "현재 관계에서 실제로 발생한 사건과 상대방의 입장이 충분히 확인되지 않았다.",

            question:
              "최근 관계가 달라진 구체적인 사건, 상대방의 현재 입장, 본인이 원하는 결과를 알려주세요.",
          },
        ],
      },
    };
  }

  export async function verifyConsultingCompatibilityRelationshipClarification():
    Promise<ConsultingCompatibilityRelationshipClarificationVerificationResult> {
    const sourceRequest =
      createSourceRequest();

    const compatibilityRequest:
      V3ConsultingRequest = {
        ...sourceRequest,

        question:
          COMPATIBILITY_QUESTION,
      };

    const compatibilityExecution =
      buildInitialConsultingExecution(
        compatibilityRequest,
      );

    const compatibilityClarification =
      buildConsultingClarification({
        decisionTurnId:
          "turn-compatibility-relationship-001",

        lifeContext:
          compatibilityExecution
            .lifeContext,

        questionContext:
          compatibilityExecution
            .turnResult
            .questionContext,

        decisionResult:
          compatibilityExecution
            .turnResult
            .decisionResult,
      });

    if (
      compatibilityClarification
      === null
    ) {
      throw new Error(
        "Compatibility relationship question must create a clarification request.",
      );
    }

    const compatibilitySession =
      buildInitialConsultingSession({
        sessionId:
          "session-compatibility-relationship-001",

        initialTurnId:
          "turn-compatibility-relationship-001",

        createdAt:
          "2026-08-23T12:00:00+09:00",

        request:
          compatibilityRequest,

        execution:
          compatibilityExecution,

        assistantAnswer:
          buildConsultingClarificationAnswer({
            originalQuestion:
              COMPATIBILITY_QUESTION,

            clarification:
              compatibilityClarification,
          }),
      });

    const initialPending =
      compatibilitySession
        .pendingClarification;

    const leftoverSession =
      withLeftoverRelationshipItems(
        compatibilitySession,
      );

    const decisionModeLeftoverSession =
      withDecisionAnalysisMode(
        leftoverSession,
      );

    const rejectGenericAnswer =
      async () => {
        throw new Error(
          "Compatibility clarification must not request a generic GPT answer while birth data is incomplete.",
        );
      };

    const fullBirthConfirmedFacts = [
      {
        key:
          "counterpartBirthData",

        description:
          "상대방은 1990년 5월 12일 양력 출생 여성이다.",

        fields: [
          {
            key:
              "birthDate",

            value:
              "1990-05-12",

            evidence: [
              "1990년 5월 12일",
            ],
          },
          {
            key:
              "calendarType",

            value:
              "solar",

            evidence: [
              "양력",
            ],
          },
          {
            key:
              "gender",

            value:
              "female",

            evidence: [
              "여성",
            ],
          },
        ],
      },
    ];

    let fullBirthAnswerCount =
      0;

    const fullBirthSession =
      await executeConsultingSessionTurn({
        preparationInput: {
          session:
            leftoverSession,

          kind:
            "clarification",

          question:
            "상대방은 1990년 5월 12일 양력 여성입니다.",

          preparedAt:
            "2026-08-23T12:10:00+09:00",
        },

        turnId:
          "turn-compatibility-full-birth",

        createdAt:
          "2026-08-23T12:11:00+09:00",

        confirmedFacts:
          fullBirthConfirmedFacts,

        requestClarificationInterpretation:
          async () => {
            throw new Error(
              "Injected counterpart birth facts must not call the interpreter.",
            );
          },

        requestAnswer:
          async () => {
            fullBirthAnswerCount +=
              1;

            return "확인된 상대 사주를 기준으로 궁합 방향을 설명합니다.";
          },
      });

    const fullBirthTurn =
      fullBirthSession
        .turns[
          fullBirthSession
            .turns
            .length
          - 1
        ];

    const partialBirthSession =
      await executeConsultingSessionTurn({
        preparationInput: {
          session:
            leftoverSession,

          kind:
            "clarification",

          question:
            "상대방은 1990년 5월 12일생입니다.",

          preparedAt:
            "2026-08-23T12:20:00+09:00",
        },

        turnId:
          "turn-compatibility-partial-birth",

        createdAt:
          "2026-08-23T12:21:00+09:00",

        confirmedFacts: [
          {
            key:
              "counterpartBirthData",

            description:
              "상대방 생년월일은 1990-05-12이다.",

            fields: [
              {
                key:
                  "birthDate",

                value:
                  "1990-05-12",

                evidence: [
                  "1990년 5월 12일",
                ],
              },
            ],
          },
        ],

        requestClarificationInterpretation:
          async () => {
            throw new Error(
              "Injected partial birth facts must not call the interpreter.",
            );
          },

        requestAnswer:
          rejectGenericAnswer,
      });

    const partialPending =
      partialBirthSession
        .pendingClarification;

    let zodiacAnswerCount =
      0;

    const zodiacOnlySession =
      await executeConsultingSessionTurn({
        preparationInput: {
          session:
            leftoverSession,

          kind:
            "clarification",

          question:
            "상대방은 말띠입니다.",

          preparedAt:
            "2026-08-23T12:30:00+09:00",
        },

        turnId:
          "turn-compatibility-zodiac-only",

        createdAt:
          "2026-08-23T12:31:00+09:00",

        confirmedFacts: [
          {
            key:
              "counterpartBirthData",

            description:
              "상대방은 말띠이다.",

            fields: [
              {
                key:
                  "zodiacSign",

                value:
                  "말띠",

                evidence: [
                  "말띠",
                ],
              },
            ],
          },
        ],

        requestClarificationInterpretation:
          async () => {
            throw new Error(
              "Injected zodiac facts must not call the interpreter.",
            );
          },

        requestAnswer:
          async () => {
            zodiacAnswerCount +=
              1;

            return "띠 기준 간이 궁합을 기준으로 방향을 설명합니다.";
          },
      });

    const zodiacTurn =
      zodiacOnlySession
        .turns[
          zodiacOnlySession
            .turns
            .length
          - 1
        ];

    const productionBirthConfirmedFacts = [
      {
        key:
          "counterpartBirthData",

        description:
          "상대방은 1967년 4월 10일 양력 출생 여성이다.",

        fields: [
          {
            key:
              "birthDate",

            value:
              "1967-04-10",

            evidence: [
              "1967년 4월 10일",
            ],
          },
          {
            key:
              "calendarType",

            value:
              "solar",

            evidence: [
              "양력",
            ],
          },
          {
            key:
              "gender",

            value:
              "female",

            evidence: [
              "여성",
            ],
          },
        ],
      },
    ];

    let productionBirthAnswerCount =
      0;

    const productionDecisionModeSession =
      await executeConsultingSessionTurn({
        preparationInput: {
          session:
            decisionModeLeftoverSession,

          kind:
            "clarification",

          question:
            "1967년 4월 10일 양력 여성",

          preparedAt:
            "2026-08-24T02:10:00+09:00",
        },

        turnId:
          "turn-compatibility-production-birth",

        createdAt:
          "2026-08-24T02:11:00+09:00",

        confirmedFacts:
          productionBirthConfirmedFacts,

        requestClarificationInterpretation:
          async () => {
            throw new Error(
              "Injected production birth facts must not call the interpreter.",
            );
          },

        requestAnswer:
          async () => {
            productionBirthAnswerCount +=
              1;

            return "확인된 상대 사주를 기준으로 궁합 방향을 설명합니다.";
          },
      });

    const productionBirthTurn =
      productionDecisionModeSession
        .turns[
          productionDecisionModeSession
            .turns
            .length
          - 1
        ];

    const nullOverridePreparation =
      prepareConsultingSessionTurn({
        session:
          leftoverSession,

        kind:
          "clarification",

        question:
          "1967년 4월 10일 양력 여성",

        decisionQuestion:
          leftoverSession
            .turns[0]
            ?.decisionQuestion
          ?? leftoverSession
            .turns[0]
            ?.question
          ?? COMPATIBILITY_QUESTION,

        questionInterpretation:
          leftoverSession
            .turns[0]
            ?.questionReaderResult,

        preparedAt:
          "2026-08-24T02:20:00+09:00",
      });

    const nullOverrideSession =
      buildConsultingSessionTurn({
        session:
          leftoverSession,

        preparation:
          nullOverridePreparation,

        turnId:
          "turn-null-override",

        createdAt:
          "2026-08-24T02:21:00+09:00",

        assistantAnswer:
          "완료된 clarification은 다시 만들지 않습니다.",

        pendingClarificationOverride:
          null,
      });

    const boyfriendClarification =
      buildForcedInsufficientClarification(
        {
          ...sourceRequest,

          question:
            BOYFRIEND_QUESTION,
        },
        "turn-boyfriend-relationship",
      ).clarification;

    const marriageClarification =
      buildForcedInsufficientClarification(
        {
          ...sourceRequest,

          question:
            MARRIAGE_QUESTION,
        },
        "turn-marriage-relationship",
      ).clarification;

    const checks = {
      compatibilityAnalysisIsRequired:
        compatibilityExecution
          .turnResult
          .questionContext
          .requirements
          .compatibilityAnalysisRequired
        === true
        && compatibilityExecution
          .turnResult
          .questionContext
          .question
          .analysisMode
        === "compatibility",

      firstPendingItemIsCounterpartBirthData:
        initialPending
          ?.items[0]
          ?.key
        === "counterpartBirthData",

      initialPendingDoesNotIncludeCurrentRelationshipSituation:
        hasPendingItemKey(
          initialPending,
          "currentRelationshipSituation",
        )
        === false,

      initialPendingDoesNotIncludeCounterpartIdentity:
        hasPendingItemKey(
          initialPending,
          "counterpartIdentity",
        )
        === false,

      initialPendingDoesNotIncludeDecisionDeadline:
        hasPendingItemKey(
          initialPending,
          "decisionDeadline",
        )
        === false,

      fullBirthDataCompletesCounterpartBirthData:
        fullBirthSession
          .confirmedFacts
          .some(
            (fact) =>
              fact.key
              === "counterpartBirthData",
          ),

      fullBirthDataDoesNotReaskCurrentRelationshipSituation:
        hasPendingItemKey(
          fullBirthSession
            .pendingClarification,
          "currentRelationshipSituation",
        )
        === false
        && !fullBirthTurn
          .assistantAnswer
          .includes(
            "최근 관계가 달라진 구체적인 사건",
          ),

      fullBirthDataDoesNotReaskCounterpartIdentity:
        hasPendingItemKey(
          fullBirthSession
            .pendingClarification,
          "counterpartIdentity",
        )
        === false
        && !fullBirthTurn
          .assistantAnswer
          .includes(
            "상대방과의 관계, 현재 관계 상태",
          ),

      fullBirthDataDoesNotAskDecisionDeadline:
        hasPendingItemKey(
          fullBirthSession
            .pendingClarification,
          "decisionDeadline",
        )
        === false
        && !fullBirthTurn
          .assistantAnswer
          .includes(
            "실제 결정 마감일 또는 예정 시점",
          )
        && !fullBirthTurn
          .assistantAnswer
          .includes(
            "실제 마감 시점이나 예정일",
          ),

      fullBirthDataClearsPendingClarification:
        fullBirthSession
          .pendingClarification
        === null,

      fullBirthDataUsesCompatibilityDecisionPath:
        fullBirthAnswerCount
        === 1
        && fullBirthTurn
          .decisionResult
          .evidence
          .some(
            (evidence) =>
              evidence.source
              === "compatibility",
          )
        && fullBirthTurn
          .decisionResult
          .verdict
        !== "insufficientEvidence",

      partialBirthAsksOnlyMissingBirthFields:
        partialPending
          ?.items
          .length
        === 1
        && partialPending
          .items[0]
          .key
        === "counterpartBirthData"
        && hasPendingItemKey(
          partialPending,
          "currentRelationshipSituation",
        )
        === false
        && hasPendingItemKey(
          partialPending,
          "counterpartIdentity",
        )
        === false
        && (
          partialPending
            .items[0]
            .question
            .includes(
              "양력",
            )
          || partialPending
            .items[0]
            .question
            .includes(
              "성별",
            )
        )
        && !partialPending
          .items[0]
          .question
          .includes(
            "최근 관계가 달라진 구체적인 사건",
          ),

      zodiacOnlyClearsPendingClarification:
        zodiacOnlySession
          .pendingClarification
        === null,

      zodiacOnlyDoesNotAskGeneralRelationshipClarification:
        hasPendingItemKey(
          zodiacOnlySession
            .pendingClarification,
          "currentRelationshipSituation",
        )
        === false
        && hasPendingItemKey(
          zodiacOnlySession
            .pendingClarification,
          "counterpartIdentity",
        )
        === false
        && !zodiacTurn
          .assistantAnswer
          .includes(
            "최근 관계가 달라진 구체적인 사건",
          ),

      zodiacOnlyUsesCompatibilityDecisionPath:
        zodiacAnswerCount
        === 1
        && zodiacTurn
          .decisionResult
          .evidence
          .some(
            (evidence) =>
              evidence.source
              === "compatibility",
          )
        && zodiacTurn
          .decisionResult
          .verdict
        !== "insufficientEvidence",

      boyfriendDoesNotAutoAskCounterpartIdentity:
        boyfriendClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "counterpartIdentity",
          )
        !== true,

      boyfriendDoesNotAutoAskCurrentRelationshipSituation:
        boyfriendClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "currentRelationshipSituation",
          )
        !== true,

      marriageDoesNotAutoAskCounterpartIdentity:
        marriageClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "counterpartIdentity",
          )
        !== true,

      marriageDoesNotAutoAskCurrentRelationshipSituation:
        marriageClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "currentRelationshipSituation",
          )
        !== true,

      productionDecisionModeDoesNotReaskCurrentRelationshipSituation:
        hasPendingItemKey(
          productionDecisionModeSession
            .pendingClarification,
          "currentRelationshipSituation",
        )
        === false
        && !productionBirthTurn
          .assistantAnswer
          .includes(
            "최근 관계가 달라진 구체적인 사건",
          ),

      productionDecisionModeDoesNotReaskCounterpartIdentity:
        hasPendingItemKey(
          productionDecisionModeSession
            .pendingClarification,
          "counterpartIdentity",
        )
        === false
        && !productionBirthTurn
          .assistantAnswer
          .includes(
            "상대방과의 관계, 현재 관계 상태",
          ),

      productionDecisionModeDoesNotReaskCounterpartBirthData:
        hasPendingItemKey(
          productionDecisionModeSession
            .pendingClarification,
          "counterpartBirthData",
        )
        === false
        && !productionBirthTurn
          .assistantAnswer
          .includes(
            "이미 알려주신 정보는 다시 적지 않아도 됩니다",
          ),

      productionDecisionModeDoesNotAskDecisionDeadline:
        hasPendingItemKey(
          productionDecisionModeSession
            .pendingClarification,
          "decisionDeadline",
        )
        === false
        && !productionBirthTurn
          .assistantAnswer
          .includes(
            "실제 결정 마감일 또는 예정 시점",
          )
        && !productionBirthTurn
          .assistantAnswer
          .includes(
            "실제 마감 시점이나 예정일",
          ),

      productionDecisionModeCompletesClarification:
        productionDecisionModeSession
          .pendingClarification
        === null,

      productionDecisionModeUsesCompatibilityDecisionPath:
        productionBirthAnswerCount
        === 1
        && productionBirthTurn
          .decisionResult
          .evidence
          .some(
            (evidence) =>
              evidence.source
              === "compatibility",
          )
        && productionBirthTurn
          .decisionResult
          .verdict
        !== "insufficientEvidence",

      rebuildPendingNullDoesNotRegenerateGeneratedClarification:
        nullOverridePreparation
          .turnResult
          .decisionResult
          .verdict
        === "insufficientEvidence"
        && nullOverrideSession
          .pendingClarification
        === null
        && nullOverrideSession
          .status
        === "active",
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
