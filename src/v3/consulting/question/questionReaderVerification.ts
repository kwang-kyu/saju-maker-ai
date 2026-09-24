import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture.js";
import {
  buildQuestionContext,
} from "./questionContextBuilder.js";
import {
  readQuestion,
} from "./questionReader.js";
import type {
  ConclusionNature,
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntentOrLegacy,
  QuestionMotive,
  QuestionTopic,
} from "./questionReader.js";
import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext.js";
import {
  applyRoleRecommendationNormalization,
  isRoleRecommendationQuestion,
} from "./roleRecommendationQuestionDetector.js";

const CONCLUSION_NATURE_STAGE2_CASES:
  readonly {
    question:
      string;

    expectedConclusionNature:
      ConclusionNature;
  }[] = [
    {
      question:
        "왜 일이 잘 안 풀리나요?",

      expectedConclusionNature:
        "interpretation",
    },
    {
      question:
        "내 사주의 특징은 무엇인가요?",

      expectedConclusionNature:
        "interpretation",
    },
    {
      question:
        "나는 어떤 성향인가요?",

      expectedConclusionNature:
        "interpretation",
    },
    {
      question:
        "어떤 직업이 맞나요?",

      expectedConclusionNature:
        "recommendation",
    },
    {
      question:
        "연극에서 어떤 역할이 맞나요?",

      expectedConclusionNature:
        "recommendation",
    },
    {
      question:
        "무엇을 조심해야 하나요?",

      expectedConclusionNature:
        "warning",
    },
    {
      question:
        "지금 사업을 계속할까요?",

      expectedConclusionNature:
        "decision",
    },
    {
      question:
        "지금 주식에 투자해도 될까요?",

      expectedConclusionNature:
        "decision",
    },
    {
      question:
        "재물운이 있나요?",

      expectedConclusionNature:
        "existence",
    },
  ];

function buildConclusionNatureStage2Checks(
  humanContext:
    HumanDestinyContext,
) {
  const checks:
    Record<
      string,
      boolean
    > = {};

  for (
    const verificationCase
    of CONCLUSION_NATURE_STAGE2_CASES
  ) {
    const question =
      readQuestion(
        humanContext,
        verificationCase
          .question,
      );

    const id =
      verificationCase
        .question
        .slice(
          0,
          24,
        )
        .replace(
          /[^\w가-힣]+/g,
          "_",
        );

    checks[
      `conclusionNatureStage2_${id}`
    ] =
      question
        .conclusionNature
      === verificationCase
        .expectedConclusionNature;
  }

  const traitQuestion =
    readQuestion(
      humanContext,
      "내 사주의 특징은 무엇인가요?",
    );

  checks[
    "sajuTraitQuestionAvoidsRiskIntentFalsePositive"
  ] =
    traitQuestion
      .intent
    !== "risk";

  checks[
    "investmentRiskQuestionStaysDecisionConclusion"
  ] =
    readQuestion(
      humanContext,
      "가상자산 투자는 손실 위험이 클까요?",
    )
      .conclusionNature
    === "decision";

  return checks;
}

const ROLE_QUESTION =
  "내가 연극을 하면 어떤 역할이 어울릴까요?";

const ACTOR_START_QUESTION =
  "배우를 시작해도 될까요?";

const TAKE_ROLE_QUESTION =
  "그 배역을 맡아도 될까요?";

const ROLE_RECOMMENDATION_POSITIVE_QUESTIONS =
  [
    ROLE_QUESTION,
    "영화에 나온다면 어떤 배역이 맞을까요?",
    "내 성격을 캐릭터로 표현하면 어떤 인물인가요?",
    "드라마라면 주인공·악역·조연 중 무엇이 어울릴까요?",
  ] as const;

type QuestionReaderPathExpectation = {
  topic:
    QuestionTopic;

  intent:
    QuestionIntentOrLegacy;

  decisionTarget:
    DecisionTarget;

  analysisMode:
    QuestionAnalysisMode;

  roleRecommendationAnalysisRequired:
    boolean;
};

type NegativeRoleRecommendationCase = {
  question:
    string;

  expected: {
    topic:
      QuestionTopic;

    intent:
      QuestionIntentOrLegacy;

    decisionTarget:
      DecisionTarget;

    analysisMode:
      QuestionAnalysisMode;

    motive:
      QuestionMotive;
  };
};

const ROLE_RECOMMENDATION_NEGATIVE_CASES:
  readonly NegativeRoleRecommendationCase[] = [
    {
      question:
        "나에게 어울리는 직업은 무엇인가요?",

      expected: {
        topic:
          "job",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        motive:
          "unspecified",
      },
    },
    {
      question:
        "이 직업이 나와 잘 맞나요?",

      expected: {
        topic:
          "job",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        motive:
          "relationshipConfirmation",
      },
    },
    {
      question:
        "이 사람과 잘 어울릴까요?",

      expected: {
        topic:
          "relationship",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",

        motive:
          "unspecified",
      },
    },
    {
      question:
        "어떤 사업이 나에게 맞나요?",

      expected: {
        topic:
          "business",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        motive:
          "relationshipConfirmation",
      },
    },
    {
      question:
        "나에게 맞는 투자 방식은 무엇인가요?",

      expected: {
        topic:
          "money",

        intent:
          "generalJudgement",

        decisionTarget:
          "invest",

        analysisMode:
          "decision",

        motive:
          "selfUnderstanding",
      },
    },
    {
      question:
        "회사에서 어떤 역할을 맡아야 하나요?",

      expected: {
        topic:
          "job",

        intent:
          "generalJudgement",

        decisionTarget:
          "choose",

        analysisMode:
          "selection",

        motive:
          "unspecified",
      },
    },
    {
      question:
        ACTOR_START_QUESTION,

      expected: {
        topic:
          "general",

        intent:
          "possibility",

        decisionTarget:
          "start",

        analysisMode:
          "decision",

        motive:
          "unspecified",
      },
    },
    {
      question:
        "연기를 언제 시작할까요?",

      expected: {
        topic:
          "job",

        intent:
          "timing",

        decisionTarget:
          "start",

        analysisMode:
          "decision",

        motive:
          "unspecified",
      },
    },
    {
      question:
        "배우로 전향해도 될까요?",

      expected: {
        topic:
          "job",

        intent:
          "possibility",

        decisionTarget:
          "start",

        analysisMode:
          "decision",

        motive:
          "unspecified",
      },
    },
    {
      question:
        TAKE_ROLE_QUESTION,

      expected: {
        topic:
          "job",

        intent:
          "possibility",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        motive:
          "unspecified",
      },
    },
  ];

const COMPATIBILITY_POSITIVE_CASES:
  readonly {
    question:
      string;

    expected:
      QuestionReaderPathExpectation;
  }[] = [
    {
      question:
        "이 사람과 잘 어울릴까요?",

      expected: {
        topic:
          "relationship",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "상대방과 제가 잘 맞나요?",

      expected: {
        topic:
          "general",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "우리 둘의 궁합은 어떤가요?",

      expected: {
        topic:
          "relationship",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "이 동업자와 서로 잘 맞을까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "partner",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "그 여자와 제가 잘 맞나요?",

      expected: {
        topic:
          "general",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "이 남자와 잘 어울릴까요?",

      expected: {
        topic:
          "general",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "현재 배우자와 제가 잘 맞나요?",

      expected: {
        topic:
          "marriage",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "제 동업자와 서로 잘 맞을까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "partner",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "1970년생 여성 개띠와 궁합",

      expected: {
        topic:
          "relationship",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "나는 연애운이 있나요 지금 1970년생 여성 개띠하고 궁합 성격은 맞는지요",

      expected: {
        topic:
          "love",

        intent:
          "existence",

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "1970년생 여성과 궁합",

      expected: {
        topic:
          "relationship",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "개띠 여성과 궁합",

      expected: {
        topic:
          "relationship",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
  ];

const COMPATIBILITY_NEGATIVE_CASES:
  readonly {
    question:
      string;

    expected:
      QuestionReaderPathExpectation;
  }[] = [
    {
      question:
        "나에게 어울리는 직업은 무엇인가요?",

      expected: {
        topic:
          "job",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "이 직업이 나와 잘 맞나요?",

      expected: {
        topic:
          "job",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "어떤 사업이 나에게 맞나요?",

      expected: {
        topic:
          "business",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "나에게 맞는 투자 방식은 무엇인가요?",

      expected: {
        topic:
          "money",

        intent:
          "generalJudgement",

        decisionTarget:
          "invest",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        ROLE_QUESTION,

      expected: {
        topic:
          "job",

        intent:
          "reason",

        decisionTarget:
          "none",

        analysisMode:
          "interpretation",

        roleRecommendationAnalysisRequired:
          true,
      },
    },
    {
      question:
        "여자에게 어울리는 직업은 무엇인가요?",

      expected: {
        topic:
          "job",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "남자에게 맞는 사업은 무엇인가요?",

      expected: {
        topic:
          "business",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "어떤 남자가 나에게 어울리나요?",

      expected: {
        topic:
          "general",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "나에게 어울리는 배우자 유형은 무엇인가요?",

      expected: {
        topic:
          "marriage",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "나는 연애와 잘 맞나요?",

      expected: {
        topic:
          "love",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "나는 연애운이 있나요",

      expected: {
        topic:
          "love",

        intent:
          "existence",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "내 성격에 맞는 취미는 무엇인가요?",

      expected: {
        topic:
          "general",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "이 집이 나와 잘 맞나요?",

      expected: {
        topic:
          "general",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "부동산 투자가 나에게 어울리나요?",

      expected: {
        topic:
          "realEstate",

        intent:
          "generalJudgement",

        decisionTarget:
          "invest",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
  ];

const DECISION_PATH_PRESERVATION_CASES:
  readonly {
    question:
      string;

    expected:
      QuestionReaderPathExpectation;
  }[] = [
    {
      question:
        "그 사람과 헤어져야 하나요?",

      expected: {
        topic:
          "relationship",

        intent:
          "termination",

        decisionTarget:
          "separate",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "이 관계를 계속 유지해야 하나요?",

      expected: {
        topic:
          "relationship",

        intent:
          "continuation",

        decisionTarget:
          "continue",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "이 사람과 결혼해야 하나요?",

      expected: {
        topic:
          "marriage",

        intent:
          "method",

        decisionTarget:
          "marry",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "지금 부동산을 사는 게 맞을까요?",

      expected: {
        topic:
          "realEstate",

        intent:
          "possibility",

        decisionTarget:
          "buy",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "지금 주식에 투자해도 될까요?",

      expected: {
        topic:
          "money",

        intent:
          "possibility",

        decisionTarget:
          "invest",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "올해 사업 시작해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "timing",

        decisionTarget:
          "start",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "내년에 부동산 투자를 시작해도 될까요?",

      expected: {
        topic:
          "realEstate",

        intent:
          "timing",

        decisionTarget:
          "invest",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
          "지금 동업을 시작해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "partner",

        analysisMode:
          "compatibility",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
    {
      question:
        "지금 아파트를 팔아야 할까요?",

      expected: {
        topic:
          "realEstate",

        intent:
          "generalJudgement",

        decisionTarget:
          "sell",

        analysisMode:
          "decision",

        roleRecommendationAnalysisRequired:
          false,
      },
    },
  ];

const EXISTENCE_POSITIVE_CASES:
  readonly {
    question:
      string;

    expectedIntent:
      QuestionIntentOrLegacy;
  }[] = [
    {
      question:
        "재물운이 있나요?",

      expectedIntent:
        "existence",
    },
    {
      question:
        "사업운이 있나요?",

      expectedIntent:
        "existence",
    },
    {
      question:
        "직장운이 있나요?",

      expectedIntent:
        "existence",
    },
    {
      question:
        "배우자운이 있나요?",

      expectedIntent:
        "existence",
    },
    {
      question:
        "자식운이 있나요?",

      expectedIntent:
        "existence",
    },
    {
      question:
        "내가 관재수가 있나요?",

      expectedIntent:
        "existence",
    },
  ];

const EXISTENCE_NEGATIVE_CASES:
  readonly {
    question:
      string;

    expectedIntent:
      QuestionIntentOrLegacy;
  }[] = [
    {
      question:
        "올해 재물운이 있나요?",

      expectedIntent:
        "existence",
    },
    {
      question:
        "언제 재물운이 들어오나요?",

      expectedIntent:
        "timing",
    },
    {
      question:
        "지금 투자하면 돈을 벌 수 있을까?",

      expectedIntent:
        "generalJudgement",
    },
    {
      question:
        "소송을 해도 될까요?",

      expectedIntent:
        "possibility",
    },
  ];

const FUTURE_OUTCOME_PREDICTION_CASES:
  readonly {
    question:
      string;

    expectedIntent:
      QuestionIntentOrLegacy;

    expectedConclusionNature:
      ConclusionNature;
  }[] = [
    {
      question:
        "올해 사업은 어떻게 될까요?",

      expectedIntent:
        "prediction",

      expectedConclusionNature:
        "prediction",
    },
    {
      question:
        "올해 사업운은 어떨까요?",

      expectedIntent:
        "prediction",

      expectedConclusionNature:
        "prediction",
    },
    {
      question:
        "앞으로 사업은 어떻게 될까요?",

      expectedIntent:
        "prediction",

      expectedConclusionNature:
        "prediction",
    },
    {
      question:
        "앞으로 연애운은 어떨까요?",

      expectedIntent:
        "prediction",

      expectedConclusionNature:
        "prediction",
    },
    {
      question:
        "내년 재물운은 어떨까요?",

      expectedIntent:
        "prediction",

      expectedConclusionNature:
        "prediction",
    },
    {
      question:
        "올해 직장운은 어떻게 될까요?",

      expectedIntent:
        "prediction",

      expectedConclusionNature:
        "prediction",
    },
    {
      question:
        "앞으로 인간관계는 어떻게 될까요?",

      expectedIntent:
        "prediction",

      expectedConclusionNature:
        "prediction",
    },
    {
      question:
        "앞으로 결혼운은 어떨까요?",

      expectedIntent:
        "prediction",

      expectedConclusionNature:
        "prediction",
    },
    {
      question:
        "앞으로 내 삶은 어떻게 될까요?",

      expectedIntent:
        "prediction",

      expectedConclusionNature:
        "prediction",
    },
  ];

const TIMING_METHOD_PROTECTION_CASES:
  readonly {
    question:
      string;

    expectedIntent:
      QuestionIntentOrLegacy;
  }[] = [
    {
      question:
        "언제 사업을 시작해야 하나요?",

      expectedIntent:
        "timing",
    },
    {
      question:
        "어떻게 사업을 해야 하나요?",

      expectedIntent:
        "method",
    },
    {
      question:
        "지금 사업을 계속할까요?",

      expectedIntent:
        "continuation",
    },
  ];

export type QuestionReaderVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

function buildRoleRecommendationPathSnapshot(
  question:
    ReturnType<
      typeof readQuestion
    >,
) {
  return JSON.stringify({
    analysisMode:
      question.analysisMode,

    decisionTarget:
      question.decisionTarget,

    motive:
      question.motive,

    intent:
      question.intent,
  });
}

function buildQuestionPathSnapshot(
  question:
    ReturnType<
      typeof readQuestion
    >,
  context:
    ReturnType<
      typeof buildQuestionContext
    >,
) {
  return JSON.stringify({
    topic:
      question.topic,

    intent:
      question.intent,

    decisionTarget:
      question.decisionTarget,

    analysisMode:
      question.analysisMode,

    roleRecommendationAnalysisRequired:
      context
        .requirements
        .roleRecommendationAnalysisRequired,
  });
}

function buildCompatibilityVerificationChecks(
  humanContext:
    HumanDestinyContext,
  cases:
    readonly {
      question:
        string;

      expected:
        QuestionReaderPathExpectation;
    }[],
  prefix:
    string,
) {
  return Object.fromEntries(
    cases.flatMap(
      (verificationCase) => {
        const question =
          readQuestion(
            humanContext,
            verificationCase
              .question,
          );

        const context =
          buildQuestionContext(
            question,
          );

        const id =
          verificationCase
            .question
            .slice(
              0,
              24,
            )
            .replace(
              /[^\w가-힣]+/g,
              "_",
            );

        return [
          [
            `${prefix}_${id}`,
            buildQuestionPathSnapshot(
              question,
              context,
            )
            === JSON.stringify(
              verificationCase.expected,
            ),
          ],
        ];
      },
    ),
  );
}

export function verifyQuestionReader():
  QuestionReaderVerificationResult {
  const regressionInput =
    buildDecisionEngineRegressionInput();

  const humanContext =
    regressionInput
      .humanContext;

  const roleQuestion =
    readQuestion(
      humanContext,
      ROLE_QUESTION,
    );

  const roleQuestionContext =
    buildQuestionContext(
      roleQuestion,
    );

  const normalizedSemanticFallback =
    applyRoleRecommendationNormalization({
      normalizedQuestion:
        "연극을 한다면 어떤 배역이 맞을까요?",

      topic:
        "job",

      intent:
        "selection" as const,

      motive:
        "unspecified" as const,

      decisionTarget:
        "choose" as const,

      analysisMode:
        "selection" as const,

      asksWhat:
        "placeholder",

      asksWhy:
        "placeholder",

      decisionQuestion:
        "여러 선택지 중 무엇을 선택할 것인가",
    });

  const positiveChecks =
    Object.fromEntries(
      ROLE_RECOMMENDATION_POSITIVE_QUESTIONS.map(
        (questionText) => {
          const question =
            readQuestion(
              humanContext,
              questionText,
            );

          const context =
            buildQuestionContext(
              question,
            );

          const id =
            questionText
              .slice(
                0,
                24,
              )
              .replace(
                /[^\w가-힣]+/g,
                "_",
              );

          return [
            [
              `positiveDetectsRoleRecommendation_${id}`,
              isRoleRecommendationQuestion(
                question
                  .normalizedQuestion,
              ),
            ],
            [
              `positiveRequiresRoleRecommendationAnalysis_${id}`,
              context
                .requirements
                .roleRecommendationAnalysisRequired,
            ],
            [
              `positiveUsesInterpretationPath_${id}`,
              buildRoleRecommendationPathSnapshot(
                question,
              )
              === JSON.stringify({
                analysisMode:
                  "interpretation",

                decisionTarget:
                  "none",

                motive:
                  "selfUnderstanding",

                intent:
                  "reason",
              }),
            ],
          ];
        },
      ).flat(),
    );

  const negativeChecks =
    Object.fromEntries(
      ROLE_RECOMMENDATION_NEGATIVE_CASES.flatMap(
        (verificationCase) => {
          const question =
            readQuestion(
              humanContext,
              verificationCase
                .question,
            );

          const context =
            buildQuestionContext(
              question,
            );

          const id =
            verificationCase
              .question
              .slice(
                0,
                24,
              )
              .replace(
                /[^\w가-힣]+/g,
                "_",
              );

          return [
            [
              `negativeIsNotRoleRecommendation_${id}`,
              !isRoleRecommendationQuestion(
                question
                  .normalizedQuestion,
              ),
            ],
            [
              `negativeRoleRecommendationAnalysisNotRequired_${id}`,
              !context
                .requirements
                .roleRecommendationAnalysisRequired,
            ],
            [
              `negativeKeepsTopicIntentDecisionPath_${id}`,
              JSON.stringify({
                topic:
                  question.topic,

                intent:
                  question.intent,

                decisionTarget:
                  question.decisionTarget,

                analysisMode:
                  question.analysisMode,

                motive:
                  question.motive,
              })
              === JSON.stringify(
                verificationCase.expected,
              ),
            ],
          ];
        },
      ),
    );

  const compatibilityPositiveChecks =
    buildCompatibilityVerificationChecks(
      humanContext,
      COMPATIBILITY_POSITIVE_CASES,
      "compatibilityPositive",
    );

  const compatibilityNegativeChecks =
    buildCompatibilityVerificationChecks(
      humanContext,
      COMPATIBILITY_NEGATIVE_CASES,
      "compatibilityNegative",
    );

  const decisionPathPreservationChecks =
    buildCompatibilityVerificationChecks(
      humanContext,
      DECISION_PATH_PRESERVATION_CASES,
      "decisionPathPreservation",
    );

  const existencePositiveChecks =
    Object.fromEntries(
      EXISTENCE_POSITIVE_CASES.map(
        (verificationCase) => {
          const question =
            readQuestion(
              humanContext,
              verificationCase
                .question,
            );

          const id =
            verificationCase
              .question
              .slice(
                0,
                24,
              )
              .replace(
                /[^\w가-힣]+/g,
                "_",
              );

          return [
            `existencePositive_${id}`,
            question.intent
              === verificationCase
                .expectedIntent,
          ] as const;
        },
      ),
    );

  const existenceNegativeChecks =
    Object.fromEntries(
      EXISTENCE_NEGATIVE_CASES.map(
        (verificationCase) => {
          const question =
            readQuestion(
              humanContext,
              verificationCase
                .question,
            );

          const id =
            verificationCase
              .question
              .slice(
                0,
                24,
              )
              .replace(
                /[^\w가-힣]+/g,
                "_",
              );

          return [
            `existenceNegative_${id}`,
            question.intent
              === verificationCase
                .expectedIntent,
          ] as const;
        },
      ),
    );

  const futureOutcomePredictionChecks =
    Object.fromEntries(
      FUTURE_OUTCOME_PREDICTION_CASES.flatMap(
        (verificationCase) => {
          const question =
            readQuestion(
              humanContext,
              verificationCase
                .question,
            );

          const id =
            verificationCase
              .question
              .slice(
                0,
                24,
              )
              .replace(
                /[^\w가-힣]+/g,
                "_",
              );

          return [
            [
              `futureOutcomePredictionIntent_${id}`,
              question.intent
                === verificationCase
                  .expectedIntent,
            ],
            [
              `futureOutcomePredictionConclusionNature_${id}`,
              question
                .conclusionNature
              === verificationCase
                .expectedConclusionNature,
            ],
          ] as const;
        },
      ),
    );

  const timingMethodProtectionChecks =
    Object.fromEntries(
      TIMING_METHOD_PROTECTION_CASES.map(
        (verificationCase) => {
          const question =
            readQuestion(
              humanContext,
              verificationCase
                .question,
            );

          const id =
            verificationCase
              .question
              .slice(
                0,
                24,
              )
              .replace(
                /[^\w가-힣]+/g,
                "_",
              );

          return [
            `timingMethodProtection_${id}`,
            question.intent
              === verificationCase
                .expectedIntent,
          ] as const;
        },
      ),
    );

  const decisionQuestionText =
    "지금 사업을 계속할까요?";

  const decisionQuestion =
    readQuestion(
      humanContext,
      decisionQuestionText,
    );

  const decisionQuestionContext =
    buildQuestionContext(
      decisionQuestion,
    );

  const existenceQuestionText =
    "재물운이 있나요?";

  const existenceQuestion =
    readQuestion(
      humanContext,
      existenceQuestionText,
    );

  const existenceQuestionContext =
    buildQuestionContext(
      existenceQuestion,
    );

  const predictionQuestionText =
    "앞으로 돈이 들어올까요?";

  const predictionQuestion =
    readQuestion(
      humanContext,
      predictionQuestionText,
    );

  const predictionQuestionContext =
    buildQuestionContext(
      predictionQuestion,
    );

  const conclusionNatureChecks: Record<
    string,
    boolean
  > = {
    decisionQuestionUsesDecisionConclusionNature:
      decisionQuestion
        .conclusionNature
      === "decision",

    decisionQuestionContextPreservesConclusionNature:
      decisionQuestionContext
        .question
        .conclusionNature
      === "decision",

    existenceQuestionUsesExistenceIntent:
      existenceQuestion
        .intent
      === "existence",

    existenceQuestionUsesExistenceConclusionNature:
      existenceQuestion
        .conclusionNature
      === "existence",

    existenceQuestionContextPreservesConclusionNature:
      existenceQuestionContext
        .question
        .conclusionNature
      === "existence",

    predictionQuestionContextPreservesConclusionNature:
      predictionQuestionContext
        .question
        .conclusionNature
      === predictionQuestion
        .conclusionNature,
  };

  if (
    predictionQuestion.intent
    === "prediction"
  ) {
    conclusionNatureChecks
      .predictionQuestionUsesPredictionConclusionNature =
      predictionQuestion
        .conclusionNature
      === "prediction";

    conclusionNatureChecks
      .predictionQuestionContextUsesPredictionConclusionNature =
      predictionQuestionContext
        .question
        .conclusionNature
      === "prediction";
  }

  const conclusionNatureStage2Checks =
    buildConclusionNatureStage2Checks(
      humanContext,
    );

  const checks = {
    detectsRoleRecommendationQuestion:
      isRoleRecommendationQuestion(
        roleQuestion
          .normalizedQuestion,
      ),

    roleQuestionIsInterpretation:
      roleQuestion
        .analysisMode
      === "interpretation",

    roleQuestionDecisionTargetIsNone:
      roleQuestion
        .decisionTarget
      === "none",

    roleQuestionMotiveIsSelfUnderstanding:
      roleQuestion
        .motive
      === "selfUnderstanding",

    roleQuestionAvoidsGenericChooseDecisionQuestion:
      !roleQuestion
        .decisionQuestion
        .includes(
          "여러 선택지 중",
        ),

    roleQuestionContextRequiresRoleRecommendation:
      roleQuestionContext
        .requirements
        .roleRecommendationAnalysisRequired,

    semanticFallbackNormalizationMatchesReader:
      JSON.stringify({
        analysisMode:
          normalizedSemanticFallback
            .analysisMode,

        decisionTarget:
          normalizedSemanticFallback
            .decisionTarget,

        motive:
          normalizedSemanticFallback
            .motive,

        intent:
          normalizedSemanticFallback
            .intent,
      })
      === JSON.stringify({
        analysisMode:
          "interpretation",

        decisionTarget:
          "none",

        motive:
          "selfUnderstanding",

        intent:
          "reason",
      }),

    ...positiveChecks,

    ...negativeChecks,

    ...compatibilityPositiveChecks,

    ...compatibilityNegativeChecks,

    ...decisionPathPreservationChecks,

    ...existencePositiveChecks,

    ...existenceNegativeChecks,

    ...futureOutcomePredictionChecks,

    ...timingMethodProtectionChecks,

    ...conclusionNatureChecks,

    ...conclusionNatureStage2Checks,
  };

  return {
    checks,

    passed:
      Object
        .values(
          checks,
        )
        .every(Boolean),
  };
}
