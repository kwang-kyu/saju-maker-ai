import type {
  ConsultingClarificationFact,
} from "./consultingInput.js";
import {
  assessConsultingClarificationNeed,
} from "./consultingClarificationNeedAssessment.js";
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

export type ConsultingClarificationNeedAssessmentVerificationResult = {
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

const PARTNERSHIP_COMPATIBILITY_QUESTION =
  "이 동업자와 서로 잘 맞을까요?";

const REAL_ESTATE_INVESTMENT_QUESTION =
  "부동산 투자를 해도 될까요?";

function createDecisionResult(
  questionContext:
    QuestionContext,
): DecisionResult {
  return {
    verdict:
      "insufficientEvidence",

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

    conclusionNature:
      questionContext
        .question
        .conclusionNature,

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

function collectNeedKeys(
  assessment:
    ReturnType<
      typeof assessConsultingClarificationNeed
    >,
):
  string[] {
  return assessment
    .blockingNeeds
    .map(
      (need) =>
        need.key,
    );
}

export function verifyConsultingClarificationNeedAssessment():
  ConsultingClarificationNeedAssessmentVerificationResult {
  const regressionInput =
    buildDecisionEngineRegressionInput();

  const humanContext =
    regressionInput
      .humanContext;

  const assessQuestion = (
    question:
      string,
    clarificationFacts:
      readonly ConsultingClarificationFact[] = [],
  ) => {
    const questionContext =
      buildQuestionContext(
        readQuestion(
          humanContext,
          question,
        ),
        clarificationFacts,
      );

    return assessConsultingClarificationNeed({
      decisionResult:
        createDecisionResult(
          questionContext,
        ),

      questionContext,

      clarificationFacts,
    });
  };

  const scenarioA =
    assessQuestion(
      COMPATIBILITY_QUESTION,
    );

  const scenarioAKeys =
    collectNeedKeys(
      scenarioA,
    );

  const scenarioBWithFacts =
    assessQuestion(
      COMPATIBILITY_QUESTION,
      [
        createBirthDataFact(),
      ],
    );

  const scenarioBWithQuestion =
    assessQuestion(
      COMPATIBILITY_WITH_BIRTH_DATA_QUESTION,
    );

  const scenarioC =
    assessQuestion(
      INTERNET_AD_QUESTION,
    );

  const scenarioCKeys =
    collectNeedKeys(
      scenarioC,
    );

  const scenarioDDecision =
    assessQuestion(
      PARTNERSHIP_DECISION_QUESTION,
    );

  const scenarioDDecisionKeys =
    collectNeedKeys(
      scenarioDDecision,
    );

  const scenarioDCompatibility =
    assessQuestion(
      PARTNERSHIP_COMPATIBILITY_QUESTION,
    );

  const scenarioDCompatibilityKeys =
    collectNeedKeys(
      scenarioDCompatibility,
    );

  const scenarioDDecisionContext =
    buildQuestionContext(
      readQuestion(
        humanContext,
        PARTNERSHIP_DECISION_QUESTION,
      ),
    );

  const scenarioE =
    assessQuestion(
      REAL_ESTATE_INVESTMENT_QUESTION,
    );

  const scenarioEKeys =
    collectNeedKeys(
      scenarioE,
    );

  const compatibilityContext =
    buildQuestionContext(
      readQuestion(
        humanContext,
        COMPATIBILITY_QUESTION,
      ),
    );

  const unavailableBirthData =
    assessConsultingClarificationNeed({
      decisionResult:
        createDecisionResult(
          compatibilityContext,
        ),

      questionContext:
        compatibilityContext,

      itemStates: [
        {
          key:
            "counterpartBirthData",

          status:
            "unavailable",
        },
      ],
    });

  const redirectedBirthData =
    assessConsultingClarificationNeed({
      decisionResult:
        createDecisionResult(
          compatibilityContext,
        ),

      questionContext:
        compatibilityContext,

      itemStates: [
        {
          key:
            "counterpartBirthData",

          status:
            "redirected",
        },
      ],
    });

  const checks = {
    scenarioA_selectsOnlyCounterpartBirthData:
      scenarioAKeys.length
      === 1
      && scenarioAKeys[0]
      === "counterpartBirthData"
      && scenarioA.selected
        ?.key
      === "counterpartBirthData",

    scenarioB_selectsNullWhenBirthDataExists:
      scenarioBWithFacts.selected
      === null
      && scenarioBWithFacts
        .blockingNeeds
        .length
      === 0
      && scenarioBWithQuestion.selected
      === null
      && scenarioBWithQuestion
        .blockingNeeds
        .length
      === 0,

    scenarioC_doesNotAutoSelectFinancialExecutionCapacity:
      scenarioC.selected
        ?.key
      !== "financialExecutionCapacity"
      && scenarioCKeys.every(
        (key) =>
          key
          !== "financialExecutionCapacity",
      ),

    scenarioC_doesNotAutoSelectDecisionDeadline:
      scenarioC.selected
        ?.key
      !== "decisionDeadline"
      && scenarioCKeys.every(
        (key) =>
          key
          !== "decisionDeadline",
      ),

    scenarioD_doesNotSelectFinancialBecauseBusiness:
      scenarioDDecisionKeys.every(
        (key) =>
          key
          !== "financialExecutionCapacity",
      )
      && scenarioDCompatibilityKeys.every(
        (key) =>
          key
          !== "financialExecutionCapacity",
      )
      && scenarioDDecision.selected
        ?.key
      !== "financialExecutionCapacity"
      && scenarioDCompatibility.selected
        ?.key
      !== "financialExecutionCapacity",

    scenarioD_selectsCounterpartBirthDataOnlyWhenCompatibilityRequired:
      scenarioDDecisionContext
        .question
        .topic
      === "business"
      && scenarioDDecisionKeys.every(
        (key) =>
          key
          !== "counterpartBirthData",
      )
      && scenarioDCompatibilityKeys.length
      === 1
      && scenarioDCompatibilityKeys[0]
      === "counterpartBirthData"
      && scenarioDCompatibility.selected
        ?.key
      === "counterpartBirthData",

    scenarioE_doesNotRequireFunds:
      scenarioE.selected
        ?.key
      !== "financialExecutionCapacity"
      && scenarioEKeys.every(
        (key) =>
          key
          !== "financialExecutionCapacity",
      ),

    scenarioE_doesNotRequireDeadline:
      scenarioE.selected
        ?.key
      !== "decisionDeadline"
      && scenarioEKeys.every(
        (key) =>
          key
          !== "decisionDeadline",
      ),

    unavailableCounterpartBirthDataIsNotReselected:
      unavailableBirthData.selected
      === null
      && unavailableBirthData
        .blockingNeeds
        .every(
          (need) =>
            need.key
            !== "counterpartBirthData",
        ),

    redirectedCounterpartBirthDataIsNotReselected:
      redirectedBirthData.selected
      === null
      && redirectedBirthData
        .blockingNeeds
        .every(
          (need) =>
            need.key
            !== "counterpartBirthData",
        ),
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
