import {
  buildConsultingClarificationAnswer,
} from "./consultingClarificationAnswerBuilder.js";
import {
  buildConsultingClarification,
} from "./consultingClarificationBuilder.js";
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
  ConsultingClarificationRequest,
  ConsultingSession,
} from "./consultingSession.js";
import type {
  V3ConsultingRequest,
} from "./v3ConsultingRequest.js";

export type ConsultingClarificationFollowUpDecisionVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

const INTERNET_AD_QUESTION =
  "인터넷 광고 사업을 새로 해보려고 하는데 어떨까";

const PARTNERSHIP_QUESTION =
  "동업은 어때요";

const COMPATIBILITY_QUESTION =
  "지금 새로 만난 사람과 궁합이 맞나요?";

const UNAVAILABLE_RESPONSE =
  "그 정보는 아직 정하지 않았어요. 답하기 어렵습니다.";

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

function withLeftoverFinancialItems(
  session:
    ConsultingSession,
):
  ConsultingSession {
  const pendingClarification =
    session.pendingClarification;

  const leftoverItems:
    ConsultingClarificationRequest["items"] = [
      {
        key:
          "concreteDecisionTarget",

        description:
          "실제로 결정하려는 행동이나 선택지가 구체적으로 확인되지 않았다.",

        question:
          "이번 상담에서 실제로 결정하려는 행동이나 선택지는 무엇인가요?",
      },
      {
        key:
          "financialExecutionCapacity",

        description:
          "실행에 사용할 자기자금과 차입 범위가 확인되지 않았다.",

        question:
          "이번 선택에 투입할 자기자금, 추가 대출 예정액, 반드시 남겨둘 비상자금은 각각 얼마인가요?",
      },
      {
        key:
          "decisionDeadline",

        description:
          "결정을 내려야 하는 현실적인 기한이 확인되지 않았다.",

        question:
          "이 결정을 내려야 하는 실제 마감 시점이나 예정일이 있나요?",
      },
    ];

  return {
    ...session,

    status:
      "awaitingClarification",

    pendingClarification: {
      decisionTurnId:
        pendingClarification
          ?.decisionTurnId
        ?? session
          .turns[0]
          .id,

      items:
        leftoverItems,
    },
  };
}

export async function verifyConsultingClarificationFollowUpDecision():
  Promise<ConsultingClarificationFollowUpDecisionVerificationResult> {
  const sourceRequest =
    createSourceRequest();

  const internetAdRequest:
    V3ConsultingRequest = {
      ...sourceRequest,

      question:
        INTERNET_AD_QUESTION,
    };

  const internetAdExecution =
    buildInitialConsultingExecution(
      internetAdRequest,
    );

  const internetAdSession =
    buildInitialConsultingSession({
      sessionId:
        "session-follow-up-decision-internet-ad",

      initialTurnId:
        "turn-follow-up-decision-internet-ad",

      createdAt:
        "2026-08-24T08:00:00+09:00",

      request:
        internetAdRequest,

      execution:
        internetAdExecution,

      assistantAnswer:
        "확인된 조건만으로 인터넷 광고 사업 적합성을 판단합니다.",
    });

  const leftoverInternetAdSession =
    withLeftoverFinancialItems(
      internetAdSession,
    );

  let answeredFactAnswerCount =
    0;

  const answeredFactSession =
    await executeConsultingSessionTurn({
      preparationInput: {
        session:
          leftoverInternetAdSession,

        kind:
          "clarification",

        question:
          "인터넷 광고 사업 자체 적합성이 궁금합니다.",

        preparedAt:
          "2026-08-24T08:10:00+09:00",
      },

      turnId:
        "turn-follow-up-decision-answered-fact",

      createdAt:
        "2026-08-24T08:11:00+09:00",

      confirmedFacts: [
        {
          key:
            "concreteDecisionTarget",

          description:
            "인터넷 광고 사업 적합성을 판단하려고 한다.",

          fields: [
            {
              key:
                "decisionTarget",

              value:
                "인터넷 광고 사업",

              evidence: [
                "인터넷 광고 사업 자체 적합성",
              ],
            },
          ],
        },
      ],

      requestClarificationInterpretation:
        async () => {
          throw new Error(
            "Injected decision-target facts must not call the interpreter.",
          );
        },

      requestAnswer:
        async () => {
          answeredFactAnswerCount +=
            1;

          return "확인된 조건만으로 인터넷 광고 사업 적합성을 판단합니다.";
        },
    });

  const partnershipRequest:
    V3ConsultingRequest = {
      ...sourceRequest,

      question:
        PARTNERSHIP_QUESTION,
    };

  const partnershipExecution =
    buildInitialConsultingExecution(
      partnershipRequest,
    );

  const partnershipSession =
    buildInitialConsultingSession({
      sessionId:
        "session-follow-up-decision-partnership",

      initialTurnId:
        "turn-follow-up-decision-partnership",

      createdAt:
        "2026-08-24T08:20:00+09:00",

      request:
        partnershipRequest,

      execution:
        partnershipExecution,

      assistantAnswer:
        "동업이라는 이유만으로 자금을 먼저 묻지 않습니다.",
    });

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
        "turn-follow-up-decision-compatibility",

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
      "Compatibility question must create a counterpart birth-data clarification.",
    );
  }

  const compatibilitySession =
    buildInitialConsultingSession({
      sessionId:
        "session-follow-up-decision-compatibility",

      initialTurnId:
        "turn-follow-up-decision-compatibility",

      createdAt:
        "2026-08-24T08:30:00+09:00",

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

  const compatibilityPending =
    compatibilitySession
      .pendingClarification;

  let fullBirthAnswerCount =
    0;

  const fullBirthSession =
    await executeConsultingSessionTurn({
      preparationInput: {
        session:
          compatibilitySession,

        kind:
          "clarification",

        question:
          "상대방은 1990년 5월 12일 양력 여성입니다.",

        preparedAt:
          "2026-08-24T08:40:00+09:00",
      },

      turnId:
        "turn-follow-up-decision-full-birth",

      createdAt:
        "2026-08-24T08:41:00+09:00",

      confirmedFacts: [
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
      ],

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
          compatibilitySession,

        kind:
          "clarification",

        question:
          "상대방은 1990년 5월 12일생입니다.",

        preparedAt:
          "2026-08-24T08:50:00+09:00",
      },

      turnId:
        "turn-follow-up-decision-partial-birth",

      createdAt:
        "2026-08-24T08:51:00+09:00",

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
        async () => {
          throw new Error(
            "Partial counterpart birth data must not request a GPT explanation yet.",
          );
        },
    });

  const partialPending =
    partialBirthSession
      .pendingClarification;

  let unavailableAnswerCount =
    0;

  const unavailableSession =
    await executeConsultingSessionTurn({
      preparationInput: {
        session:
          compatibilitySession,

        kind:
          "clarification",

        question:
          UNAVAILABLE_RESPONSE,

        preparedAt:
          "2026-08-24T09:00:00+09:00",
      },

      turnId:
        "turn-follow-up-decision-unavailable",

      createdAt:
        "2026-08-24T09:01:00+09:00",

      requestClarificationInterpretation:
        async () =>
          JSON.stringify({
            matches: [],
          }),

      requestAnswer:
        async () => {
          unavailableAnswerCount +=
            1;

          return "확인된 조건만으로 궁합 방향을 설명합니다.";
        },
    });

  const unavailableTurn =
    unavailableSession
      .turns[
        unavailableSession
          .turns
          .length
        - 1
      ];

  let redirectedAnswerCount =
    0;

  const redirectedSession =
    await executeConsultingSessionTurn({
      preparationInput: {
        session:
          compatibilitySession,

        kind:
          "clarification",

        question:
          "상대 출생정보보다는 지금 관계가 맞는지가 궁금합니다.",

        preparedAt:
          "2026-08-24T09:10:00+09:00",
      },

      turnId:
        "turn-follow-up-decision-redirected",

      createdAt:
        "2026-08-24T09:11:00+09:00",

      requestClarificationInterpretation:
        async () =>
          JSON.stringify({
            matches: [],
          }),

      requestAnswer:
        async () => {
          redirectedAnswerCount +=
            1;

          return "확인된 조건만으로 궁합 방향을 설명합니다.";
        },
    });

  const redirectedTurn =
    redirectedSession
      .turns[
        redirectedSession
          .turns
          .length
        - 1
      ];

  const checks = {
    scenarioA_doesNotAutoAskFinancialExecutionCapacity:
      hasPendingItemKey(
        internetAdSession
          .pendingClarification,
        "financialExecutionCapacity",
      )
      === false
      && hasPendingItemKey(
        internetAdSession
          .pendingClarification,
        "decisionDeadline",
      )
      === false,

    scenarioA_doesNotCreateLeftoverPendingChecklist:
      (
        internetAdSession
          .pendingClarification
          ?.items
          .length
        ?? 0
      )
      <= 1,

    scenarioB_reusesDecisionInsteadOfNextLeftoverItem:
      answeredFactAnswerCount
      === 1
      && answeredFactSession
        .pendingClarification
      === null
      && hasPendingItemKey(
        answeredFactSession
          .pendingClarification,
        "financialExecutionCapacity",
      )
      === false
      && hasPendingItemKey(
        answeredFactSession
          .pendingClarification,
        "decisionDeadline",
      )
      === false,

    scenarioC_partnershipDoesNotAutoAskFunds:
      hasPendingItemKey(
        partnershipSession
          .pendingClarification,
        "financialExecutionCapacity",
      )
      === false
      && (
        partnershipSession
          .pendingClarification
          ?.items
          .length
        ?? 0
      )
      <= 1,

    scenarioD_asksOnlyCounterpartBirthData:
      compatibilityPending
        ?.items
        .length
      === 1
      && compatibilityPending
        .items[0]
        .key
      === "counterpartBirthData",

    scenarioD_fullBirthClearsPendingAndExplains:
      fullBirthSession
        .pendingClarification
      === null
      && fullBirthAnswerCount
      === 1
      && fullBirthTurn
        .decisionResult
        .verdict
      !== "insufficientEvidence"
      && fullBirthTurn
        .assistantAnswer
      === "확인된 상대 사주를 기준으로 궁합 방향을 설명합니다.",

    scenarioE_partialBirthAsksOnlyMissingBirthFields:
      partialPending
        ?.items
        .length
      === 1
      && partialPending
        .items[0]
        .key
      === "counterpartBirthData"
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
          "생년월일",
        ),

    scenarioF_unavailableDoesNotRepeatSameKey:
      hasPendingItemKey(
        unavailableSession
          .pendingClarification,
        "counterpartBirthData",
      )
      === false
      && !unavailableTurn
        .assistantAnswer
        .includes(
          "이미 알려주신 정보는 다시 적지 않아도 됩니다",
        ),

    scenarioF_unavailableEndsClarification:
      unavailableSession
        .pendingClarification
      === null
      && unavailableAnswerCount
      === 1,

    scenarioF_redirectedDoesNotRepeatSameKey:
      hasPendingItemKey(
        redirectedSession
          .pendingClarification,
        "counterpartBirthData",
      )
      === false
      && !redirectedTurn
        .assistantAnswer
        .includes(
          "이미 알려주신 정보는 다시 적지 않아도 됩니다",
        )
      && redirectedSession
        .pendingClarification
      === null
      && redirectedAnswerCount
      === 1,

    scenarioG_sufficientDecisionEndsClarification:
      fullBirthSession
        .status
      === "active"
      && fullBirthSession
        .pendingClarification
      === null
      && fullBirthAnswerCount
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
