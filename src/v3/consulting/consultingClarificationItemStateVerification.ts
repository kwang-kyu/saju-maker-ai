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

export type ConsultingClarificationItemStateVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

const INTERNET_AD_QUESTION =
  "인터넷 광고 사업을 하려고 하는데 어떨까요?";

const UNAVAILABLE_FINANCIAL_RESPONSE =
  "아직 구체적인 자금 규모는 정하지 않았습니다. 인터넷 광고 사업 자체가 나에게 맞는지, 수익을 만들 수 있는지가 궁금합니다.";

const ACTUAL_AMOUNT_RESPONSE =
  "5천만 원 정도입니다";

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

  return buildConsultingClarification({
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
  });
}

function withPendingClarification(
  session:
    ConsultingSession,
  items:
    ConsultingClarificationRequest["items"],
): ConsultingSession {
  return {
    ...session,

    pendingClarification: {
      decisionTurnId:
        session
          .turns[0]
          .id,

      items,
    },
  };
}

export async function verifyConsultingClarificationItemState():
  Promise<ConsultingClarificationItemStateVerificationResult> {
  const sourceRequest =
    createSourceRequest();

  const internetAdRequest:
    V3ConsultingRequest = {
      ...sourceRequest,

      question:
        INTERNET_AD_QUESTION,
    };

  const internetAdClarification =
    buildForcedInsufficientClarification(
      internetAdRequest,
      "turn-internet-ad-clarification",
    );

  const internetAdExecution =
    buildInitialConsultingExecution(
      internetAdRequest,
    );

  const internetAdSession =
    withPendingClarification(
      buildInitialConsultingSession({
        sessionId:
          "session-clarification-item-state",

        initialTurnId:
          "turn-internet-ad-initial",

        createdAt:
          "2026-08-24T03:00:00+09:00",

        request:
          internetAdRequest,

        execution:
          internetAdExecution,

        assistantAnswer:
          "실행에 사용할 자기자금과 차입 범위를 먼저 확인하겠습니다.",
      }),
      [
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
      ],
    );

  const productionPendingKeys =
    internetAdSession
      .pendingClarification
      ?.items
      .map(
        (item) =>
          item.key,
      )
    ?? [];

  let unavailableAnswerRequestCount =
    0;

  const unavailableSession =
    await executeConsultingSessionTurn({
      preparationInput: {
        session:
          internetAdSession,

        kind:
          "clarification",

        question:
          UNAVAILABLE_FINANCIAL_RESPONSE,

        preparedAt:
          "2026-08-24T03:01:00+09:00",
      },

      turnId:
        "turn-unavailable-financial",

      createdAt:
        "2026-08-24T03:01:00+09:00",

      requestClarificationInterpretation:
        async () =>
          JSON.stringify({
            matches: [],
          }),

      requestAnswer:
        async () => {
          unavailableAnswerRequestCount +=
            1;

          return "호출되면 안 되는 일반 GPT 답변";
        },
    });

  let gptOverrideAnswerRequestCount =
    0;

  const gptOverrideSession =
    await executeConsultingSessionTurn({
      preparationInput: {
        session:
          internetAdSession,

        kind:
          "clarification",

        question:
          UNAVAILABLE_FINANCIAL_RESPONSE,

        preparedAt:
          "2026-08-24T03:01:30+09:00",
      },

      turnId:
        "turn-gpt-override-financial",

      createdAt:
        "2026-08-24T03:01:30+09:00",

      requestClarificationInterpretation:
        async () =>
          JSON.stringify({
            matches: [
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
                      "인터넷 광고 사업",
                    ],
                  },
                ],

                confidence:
                  0.96,
              },
              {
                key:
                  "financialExecutionCapacity",

                description:
                  "자금 규모는 아직 정하지 않았다.",

                fields: [
                  {
                    key:
                      "selfFunds",

                    value:
                      "미정",

                    evidence: [
                      "아직 구체적인 자금 규모는 정하지 않았습니다",
                    ],
                  },
                ],

                confidence:
                  0.91,
              },
            ],
          }),

      requestAnswer:
        async () => {
          gptOverrideAnswerRequestCount +=
            1;

          return "호출되면 안 되는 일반 GPT 답변";
        },
    });

  const allSettledSession =
    unavailableSession;

  const actualAmountSession =
    await executeConsultingSessionTurn({
      preparationInput: {
        session:
          internetAdSession,

        kind:
          "clarification",

        question:
          ACTUAL_AMOUNT_RESPONSE,

        preparedAt:
          "2026-08-24T03:03:00+09:00",
      },

      turnId:
        "turn-actual-amount-ambiguous",

      createdAt:
        "2026-08-24T03:03:00+09:00",

      requestClarificationInterpretation:
        async () =>
          JSON.stringify({
            matches: [],
          }),

      requestAnswer:
        async () => {
          return "확인된 조건만으로 인터넷 광고 사업 적합성을 판단합니다.";
        },
    });

  const extractedAmountSession =
    await executeConsultingSessionTurn({
      preparationInput: {
        session:
          internetAdSession,

        kind:
          "clarification",

        question:
          ACTUAL_AMOUNT_RESPONSE,

        preparedAt:
          "2026-08-24T03:04:00+09:00",
      },

      turnId:
        "turn-actual-amount-extracted",

      createdAt:
        "2026-08-24T03:04:00+09:00",

      requestClarificationInterpretation:
        async () =>
          JSON.stringify({
            matches: [
              {
                key:
                  "financialExecutionCapacity",

                description:
                  "자기자금은 5천만 원 정도다.",

                fields: [
                  {
                    key:
                      "selfFunds",

                    value:
                      "50000000",

                    evidence: [
                      "5천만 원 정도입니다",
                    ],
                  },
                ],

                confidence:
                  0.95,
              },
            ],
          }),

      requestAnswer:
        async () => {
          return "확인된 자기자금만으로 인터넷 광고 사업 적합성을 판단합니다.";
        },
    });

  const compatibilityRequest:
    V3ConsultingRequest = {
      ...sourceRequest,

      question:
        "1967년 4월 10일 양력 여성과 궁합이 맞나요?",
    };

  const compatibilityExecution =
    buildInitialConsultingExecution(
      compatibilityRequest,
    );

  const compatibilityClarification =
    (() => {
      try {
        return buildForcedInsufficientClarification(
          compatibilityRequest,
          "turn-compatibility-item-state",
        );
      } catch (
        error
      ) {
        if (
          error instanceof Error
          && error.message.includes(
            "no clarification item was built",
          )
        ) {
          return null;
        }

        throw error;
      }
    })();

  const boyfriendClarification =
    buildForcedInsufficientClarification(
      {
        ...sourceRequest,

        question:
          "남자친구와 계속 만나야 할까요?",
      },
      "turn-boyfriend-item-state",
    );

  const marriageClarification =
    buildForcedInsufficientClarification(
      {
        ...sourceRequest,

        question:
          "현재 연인과 결혼을 결정해도 될까요?",
      },
      "turn-marriage-item-state",
    );

  const extractedFinancialFact =
    extractedAmountSession
      .confirmedFacts
      .find(
        (fact) =>
          fact.key
          === "financialExecutionCapacity",
      );

  const checks = {
    productionPendingKeepsOriginalOrder:
      productionPendingKeys
        .length
      === 3
      && productionPendingKeys[0]
      === "concreteDecisionTarget"
      && productionPendingKeys[1]
      === "financialExecutionCapacity"
      && productionPendingKeys[2]
      === "decisionDeadline",

    internetAdDoesNotAutoAskFinancialExecutionCapacity:
      internetAdClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "financialExecutionCapacity",
        )
      !== true,

    unavailableDoesNotReaskFinancialExecutionCapacity:
      unavailableSession
        .pendingClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "financialExecutionCapacity",
        )
      !== true,

    unavailableMarksTargetSettled:
      unavailableSession
        .pendingClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "concreteDecisionTarget",
        )
      !== true,

    unavailableDoesNotMoveToNextLeftoverPendingItem:
      unavailableSession
        .pendingClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "decisionDeadline",
        )
      !== true,

    unavailableContinuesDecisionWhenNoBlockingNeed:
      unavailableAnswerRequestCount
      === 1
      && unavailableSession
        .pendingClarification
      === null,

    gptMatchesDoNotReaskFinancialExecutionCapacity:
      gptOverrideSession
        .pendingClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "financialExecutionCapacity",
        )
      !== true,

    gptMatchesDoNotLeaveDeadlinePending:
      gptOverrideSession
        .pendingClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "decisionDeadline",
        )
      !== true
      && gptOverrideAnswerRequestCount
      === 1
      && gptOverrideSession
        .pendingClarification
      === null,

    allUnavailableClearsPending:
      allSettledSession
        .pendingClarification
      === null,

    allUnavailableContinuesDecisionPath:
      unavailableAnswerRequestCount
      === 1
      && allSettledSession
        .turns[
          allSettledSession
            .turns
            .length
          - 1
        ]
        .assistantAnswer
      === "호출되면 안 되는 일반 GPT 답변",

    leftoverPendingIsNotUsedAsNextQuestionSource:
      actualAmountSession
        .pendingClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "financialExecutionCapacity",
        )
      !== true
      && actualAmountSession
        .pendingClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "decisionDeadline",
        )
      !== true
      && actualAmountSession
        .confirmedFacts
        .length
      === 0,

    extractedAmountIsStoredAsActualValue:
      extractedFinancialFact
        ?.fields
        .some(
          (field) =>
            field.key
            === "selfFunds"
            && field.value
            === "50000000",
        )
      === true,

    extractedAmountDoesNotKeepLeftoverFinancialPending:
      extractedAmountSession
        .pendingClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "financialExecutionCapacity",
        )
      !== true
      && extractedAmountSession
        .pendingClarification
      === null,

    compatibilityKeepsExistingBirthDataFlow:
      compatibilityExecution
        .turnResult
        .questionReaderResult
        .counterpartFacts
        .birthDate
      === "1967-04-10"
      && compatibilityExecution
        .turnResult
        .questionReaderResult
        .counterpartFacts
        .calendarType
      === "solar"
      && compatibilityExecution
        .turnResult
        .questionReaderResult
        .counterpartFacts
        .gender
      === "female"
      && (
        compatibilityClarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "counterpartBirthData",
          )
        ?? true
      )
      && (
        compatibilityClarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "counterpartIdentity"
              && item.key
              !== "currentRelationshipSituation",
          )
        ?? true
      ),

    compatibilityDoesNotAskDecisionDeadline:
      compatibilityClarification
        ?.items
        .every(
          (item) =>
            item.key
            !== "decisionDeadline",
        )
      === true
      || compatibilityClarification
      === null,

    boyfriendDoesNotAutoAskDecisionDeadline:
      boyfriendClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "decisionDeadline",
        )
      !== true,

    marriageDoesNotAutoAskDecisionDeadline:
      marriageClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "decisionDeadline",
        )
      !== true,

    boyfriendDoesNotAutoAskRelationshipClarification:
      boyfriendClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "counterpartIdentity",
        )
      !== true
      && boyfriendClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "currentRelationshipSituation",
        )
      !== true,

    marriageDoesNotAutoAskRelationshipClarification:
      marriageClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "counterpartIdentity",
        )
      !== true
      && marriageClarification
        ?.items
        .some(
          (item) =>
            item.key
            === "currentRelationshipSituation",
        )
      !== true,
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
