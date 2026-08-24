import type {
  ConsultingClarificationFact,
} from "./consultingInput.js";
import {
  buildConsultingClarification,
} from "./consultingClarificationBuilder.js";
import type {
  DecisionResult,
} from "./decision/decisionTypes.js";
import {
  buildDecisionEngineRegressionInput,
} from "./decision/regression/decisionEngineRegressionFixture.js";
import {
  buildQuestionContext,
} from "./question/questionContextBuilder.js";
import {
  readQuestion,
} from "./question/questionReader.js";
import type {
  QuestionContext,
} from "./question/questionContext.js";

export type ConsultingClarificationBuilderAdapterVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

const COMPATIBILITY_QUESTION =
  "우리 둘의 궁합은 어떤가요?";

const COMPATIBILITY_WITH_BIRTH_DATA_QUESTION =
  "1967년 4월 10일 양력 여성과 궁합이 어떤가요?";

const INTERNET_AD_QUESTION =
  "인터넷 광고 사업을 하려고 하는데 어떨까요?";

const PARTNERSHIP_DECISION_QUESTION =
  "친구와 통닭집을 동업해도 될까요?";

const REAL_ESTATE_INVESTMENT_QUESTION =
  "부동산 투자를 해도 될까요?";

const BOYFRIEND_QUESTION =
  "남자친구와 계속 만나야 할까요?";

const MARRIAGE_QUESTION =
  "현재 연인과 결혼을 결정해도 될까요?";

function createDecisionResult(
  questionContext:
    QuestionContext,
  verdict:
    DecisionResult["verdict"] = "insufficientEvidence",
): DecisionResult {
  return {
    verdict,

    confidence:
      "low",

    contextAlignment:
      "unknown",

    actionReadiness:
      "unknown",

    decisionTarget:
      questionContext
        .question
        .decisionTarget,

    topic:
      questionContext
        .question
        .topic,

    intent:
      questionContext
        .question
        .intent,

    coreDecision:
      "현재 정보만으로는 결론을 확정하지 않는다.",

    decisionReason:
      "추가 확인이 필요하다.",

    evidence: [],

    conditions: [],

    risks: [],

    conflict: {
      exists:
        false,

      description:
        "충돌이 확인되지 않았다.",

      humanContextSide:
        "현재 삶의 국면",

      questionSide:
        "질문의 선택",
    },

    recommendedDirection:
      "확인된 조건만으로 판단한다.",

    prohibitedDirection:
      "부족한 정보를 추정하지 않는다.",

    finalDecisionSentence:
      "지금은 추가 확인이 필요하다.",

    humanContextUsed:
      true,

    questionContextUsed:
      true,
  };
}

function createBirthDataFact():
  ConsultingClarificationFact {
  return {
    key:
      "counterpartBirthData",

    description:
      "사용자가 상대방 출생정보를 직접 확인했다.",

    fields: [
      {
        key:
          "birthDate",

        value:
          "1967-04-10",

        evidence: [
          "1967-04-10",
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
  };
}

function collectItemKeys(
  clarification:
    ReturnType<
      typeof buildConsultingClarification
    >,
):
  string[] {
  return clarification
    ?.items
    .map(
      (item) =>
        item.key,
    )
    ?? [];
}

export function verifyConsultingClarificationBuilderAdapter():
  ConsultingClarificationBuilderAdapterVerificationResult {
  const regressionInput =
    buildDecisionEngineRegressionInput();

  const humanContext =
    regressionInput
      .humanContext;

  const lifeContext =
    regressionInput
      .lifeContext;

  const buildForQuestion = (
    question:
      string,
    clarificationFacts:
      readonly ConsultingClarificationFact[] = [],
    verdict:
      DecisionResult["verdict"] = "insufficientEvidence",
  ) => {
    const questionContext =
      buildQuestionContext(
        readQuestion(
          humanContext,
          question,
        ),
        clarificationFacts,
      );

    return buildConsultingClarification({
      decisionTurnId:
        "turn-adapter-001",

      lifeContext,

      questionContext,

      decisionResult:
        createDecisionResult(
          questionContext,
          verdict,
        ),
    });
  };

  const compatibilityClarification =
    buildForQuestion(
      COMPATIBILITY_QUESTION,
    );

  const compatibilityKeys =
    collectItemKeys(
      compatibilityClarification,
    );

  const compatibilityWithFacts =
    buildForQuestion(
      COMPATIBILITY_QUESTION,
      [
        createBirthDataFact(),
      ],
    );

  const compatibilityWithQuestionBirthData =
    buildForQuestion(
      COMPATIBILITY_WITH_BIRTH_DATA_QUESTION,
    );

  const internetAdClarification =
    buildForQuestion(
      INTERNET_AD_QUESTION,
    );

  const partnershipClarification =
    buildForQuestion(
      PARTNERSHIP_DECISION_QUESTION,
    );

  const realEstateClarification =
    buildForQuestion(
      REAL_ESTATE_INVESTMENT_QUESTION,
    );

  const boyfriendClarification =
    buildForQuestion(
      BOYFRIEND_QUESTION,
    );

  const marriageClarification =
    buildForQuestion(
      MARRIAGE_QUESTION,
    );

  const recommendedCompatibility =
    buildForQuestion(
      COMPATIBILITY_QUESTION,
      [],
      "recommended",
    );

  const checks = {
    selectedCounterpartBirthDataCreatesExactlyOneItem:
      compatibilityKeys.length
      === 1
      && compatibilityKeys[0]
      === "counterpartBirthData"
      && compatibilityClarification
        ?.decisionTurnId
      === "turn-adapter-001",

    selectedNullReturnsNull:
      compatibilityWithFacts
      === null
      && compatibilityWithQuestionBirthData
      === null
      && internetAdClarification
      === null
      && partnershipClarification
      === null
      && realEstateClarification
      === null
      && boyfriendClarification
      === null
      && marriageClarification
      === null,

    itemsLengthIsAtMostOne:
      (
        compatibilityClarification
          ?.items
          .length
        ?? 0
      ) <= 1
      && (
        internetAdClarification
          ?.items
          .length
        ?? 0
      ) <= 1,

    businessDoesNotAutoRegisterFinancialExecutionCapacity:
      collectItemKeys(
        internetAdClarification,
      )
        .every(
          (key) =>
            key
            !== "financialExecutionCapacity",
        )
      && collectItemKeys(
        partnershipClarification,
      )
        .every(
          (key) =>
            key
            !== "financialExecutionCapacity",
        )
      && collectItemKeys(
        realEstateClarification,
      )
        .every(
          (key) =>
            key
            !== "financialExecutionCapacity",
        ),

    urgencyUnknownDoesNotAutoRegisterDecisionDeadline:
      collectItemKeys(
        internetAdClarification,
      )
        .every(
          (key) =>
            key
            !== "decisionDeadline",
        )
      && collectItemKeys(
        boyfriendClarification,
      )
        .every(
          (key) =>
            key
            !== "decisionDeadline",
        )
      && collectItemKeys(
        marriageClarification,
      )
        .every(
          (key) =>
            key
            !== "decisionDeadline",
        ),

    relationshipDoesNotAutoRegisterCurrentSituation:
      collectItemKeys(
        boyfriendClarification,
      )
        .every(
          (key) =>
            key
            !== "currentRelationshipSituation",
        )
      && collectItemKeys(
        marriageClarification,
      )
        .every(
          (key) =>
            key
            !== "currentRelationshipSituation",
        ),

    partnershipWordDoesNotAddFundQuestion:
      collectItemKeys(
        partnershipClarification,
      )
        .every(
          (key) =>
            key
            !== "financialExecutionCapacity"
            && key
            !== "debtRepaymentCapacity",
        ),

    clarificationFactsPreventCounterpartReask:
      compatibilityWithFacts
      === null,

    nonInsufficientVerdictAsksNothing:
      recommendedCompatibility
      === null,
  };

  return {
    checks,

    passed:
      Object.values(
        checks,
      )
        .every(
          (value) =>
            value,
        ),
  };
}
