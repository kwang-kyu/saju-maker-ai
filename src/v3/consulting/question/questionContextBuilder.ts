import type {
  ConsultingClarificationFact,
} from "../consultingInput";
import type {
  QuestionContext,
  QuestionCounterpartRelation,
  QuestionRealityConstraint,
  QuestionRealityContext,
} from "./questionContext";
import type {
  QuestionReaderResult,
} from "./questionReader";
import {
  isRoleRecommendationQuestion,
} from "./roleRecommendationQuestionDetector";
import {
  isLifeFlowInterpretationQuestion,
} from "./lifeFlowInterpretationQuestionDetector";

  type QuestionRealitySignalRule = {
    area:
      QuestionRealityConstraint["area"];

    signal:
      QuestionRealityConstraint["signal"];

    description: string;

    expressions:
      readonly string[];
  };

  const QUESTION_REALITY_SIGNAL_RULES:
    readonly QuestionRealitySignalRule[] = [
      {
        area: "financial",
        signal: "debtBurden",
        description:
          "대출·채무 또는 상환 부담이 질문에 명시되어 있다.",
        expressions: [
          "대출",
          "빚",
          "채무",
          "상환 부담",
          "원리금",
        ],
      },
      {
        area: "financial",
        signal: "livingCostPressure",
        description:
          "생활비 또는 생계 유지 부담이 질문에 명시되어 있다.",
        expressions: [
          "생활비",
          "생계비",
          "생계 부담",
          "먹고살",
        ],
      },
      {
        area: "financial",
        signal: "incomeInstability",
        description:
          "수입·소득 또는 매출의 불안정이 질문에 명시되어 있다.",
        expressions: [
          "수입이 불안",
          "소득이 불안",
          "매출이 불안",
          "수입이 없",
          "소득이 없",
          "수입 감소",
          "소득 감소",
          "매출 감소",
        ],
      },
      {
        area: "financial",
        signal: "fixedCostPressure",
        description:
          "고정비 또는 정기 지출 부담이 질문에 명시되어 있다.",
        expressions: [
          "고정비",
          "고정 지출",
          "임대료 부담",
          "월세 부담",
          "보유세 부담",
          "관리비 부담",
        ],
      },
      {
        area: "financial",
        signal: "lossConcern",
        description:
          "자금 손실 또는 원금 훼손 우려가 질문에 명시되어 있다.",
        expressions: [
          "손실",
          "손해",
          "원금 손실",
          "돈을 잃",
          "자금을 잃",
        ],
      },
      {
        area: "financial",
        signal: "essentialFundsExposure",
        description:
          "퇴직금·비상금·전 재산 또는 생활 기반 자금을 투자에 사용하는 현실이 질문에 명시되어 있다.",
        expressions: [
          "퇴직금으로 투자",
          "퇴직금을 투자",
          "퇴직금 전부",
          "비상금으로 투자",
          "비상금을 투자",
          "비상금 전부",
          "전 재산",
          "전재산",
          "생활비까지 투자",
          "노후자금으로 투자",
          "노후 자금으로 투자",
        ],
      },
      {
        area: "financial",
        signal: "liquidityConstraint",
        description:
          "투입한 자금의 중도 회수·환매·현금화가 어려운 현실이 질문에 명시되어 있다.",
        expressions: [
          "자금이 묶",
          "돈이 묶",
          "중도 환매가 어렵",
          "중도환매가 어렵",
          "중도 해지가 어렵",
          "중도해지가 어렵",
          "현금화가 어렵",
          "회수가 어렵",
          "매도가 어렵",
        ],
      },
      {
        area: "financial",
        signal: "assetConcentration",
        description:
          "한 종목이나 한 자산에 자금이 집중되는 현실이 질문에 명시되어 있다.",
        expressions: [
          "몰빵",
          "한 종목에 전부",
          "한 종목에 집중",
          "한 자산에 전부",
          "한 자산에 집중",
          "전액 투자",
          "전부 투자",
          "모두 투자",
        ],
      },
      {
        area: "family",
        signal: "familyResponsibility",
        description:
          "가족 부양 또는 돌봄 책임이 질문에 명시되어 있다.",
        expressions: [
          "가족 부양",
          "부양 책임",
          "자녀 부담",
          "돌봄 책임",
        ],
      },
      {
        area: "work",
        signal: "currentWorkResponsibility",
        description:
          "현재 직업이나 본업의 책임이 질문에 명시되어 있다.",
        expressions: [
          "현재 직장",
          "직장을 다니",
          "재직 중",
          "본업",
          "현재 사업",
        ],
      },
      {
        area: "work",
        signal: "transitionDifficulty",
        description:
          "퇴사·이직 또는 새로운 직업으로 전환하는 과정의 현실적 어려움이 질문에 명시되어 있다.",
        expressions: [
          "인수인계",
          "퇴사가 어렵",
          "퇴사하기 어렵",
          "퇴사할 수 없",
          "직장을 바로 그만두기 어렵",
          "이직이 어렵",
          "이직하기 어렵",
          "이직할 수 없",
          "이직 준비가 부족",
          "직업 전환 준비가 부족",
          "새로운 일로 바로 옮기기 어렵",
        ],
      },
      {
        area: "time",
        signal: "timeConstraint",
        description:
          "실행에 사용할 수 있는 시간의 제약이 질문에 명시되어 있다.",
          expressions: [
            "시간이 없",
            "시간 부족",
            "시간이 부족",
            "시간을 내기 어렵",
            "병행하기 어렵",
          ],
      },
      {
        area: "health",
        signal: "healthConstraint",
        description:
          "건강·치료 또는 회복 제약이 질문에 명시되어 있다.",
        expressions: [
          "치료 중",
          "수술 예정",
          "회복 중",
          "건강 문제",
          "몸이 아",
        ],
      },
      {
        area: "relationship",
        signal: "relationshipConstraint",
        description:
          "관계 갈등 또는 관계 책임이 질문에 명시되어 있다.",
        expressions: [
          "관계 갈등",
          "가족 갈등",
          "배우자 반대",
          "파트너 갈등",
        ],
      },
    ];

  export function buildQuestionRealityContext(
    question:
      QuestionReaderResult,
  ): QuestionRealityContext {
    const constraints:
      QuestionRealityConstraint[] = [];

    for (
      const rule
      of QUESTION_REALITY_SIGNAL_RULES
    ) {
      const evidence =
        rule.expressions.filter(
          (expression) =>
            question.normalizedQuestion
              .includes(expression),
        );

      if (evidence.length === 0) {
        continue;
      }

      const constraint:
        QuestionRealityConstraint = {
          area:
            rule.area,

          signal:
            rule.signal,

          description:
            rule.description,

          evidence,

          explicit: true,
        };

      constraints.push(
        constraint,
      );
    }

    return {
      constraints,

      hasExplicitConstraints:
        constraints.length > 0,
    };
  }

  function detectCounterpartRelation(
    question: string,
  ): QuestionCounterpartRelation {
    if (
      question.includes("남편") ||
      question.includes("아내") ||
      question.includes("배우자")
    ) {
      return "spouse";
    }

    if (
      question.includes("남자친구") ||
      question.includes("여자친구") ||
      question.includes("연인") ||
      question.includes("애인")
    ) {
      return "lover";
    }

    if (question.includes("친구")) {
      return "friend";
    }

    if (
      question.includes("아버지") ||
      question.includes("어머니") ||
      question.includes("부모")
    ) {
      return "parent";
    }

    if (
      question.includes("아들") ||
      question.includes("딸") ||
      question.includes("자식") ||
      question.includes("자녀")
    ) {
      return "child";
    }

    if (
      question.includes("형제") ||
      question.includes("누나") ||
      question.includes("언니") ||
      question.includes("오빠") ||
      question.includes("동생")
    ) {
      return "sibling";
    }

    if (
      question.includes("직장동료") ||
      question.includes("동료")
    ) {
      return "coworker";
    }

    if (
      question.includes("동업") ||
      question.includes("공동창업") ||
      question.includes("사업 파트너")
    ) {
      return "businessPartner";
    }

    if (
      question.includes("상대") ||
      question.includes("사람") ||
      question.includes("파트너")
    ) {
      return "other";
    }

    return "unknown";
  }

  function mapActionObjectType(
    topic: QuestionReaderResult["topic"],
  ): QuestionContext["actionObject"]["type"] {
    switch (topic) {
      case "business":
        return "business";

      case "job":
        return "job";

      case "money":
        return "investment";

      case "realEstate":
        return "realEstate";

      case "marriage":
        return "marriage";

      case "relationship":
      case "love":
      case "family":
        return "relationship";

      case "health":
        return "health";

      case "legal":
        return "legal";

      case "lifeFlow":
      case "lifeDirection":
        return "lifeDirection";

      case "general":
        return "unknown";
    }
  }

  function getClarificationFieldKeys(
    clarificationFacts:
      readonly ConsultingClarificationFact[],
    itemKey:
      string,
  ): Set<string> {
    return new Set(
      clarificationFacts
        .filter(
          (fact) =>
            fact.key
            === itemKey,
        )
        .flatMap(
          (fact) =>
            fact.fields,
        )
        .filter(
          (field) =>
            field.value
              .trim()
              .length
            > 0,
        )
        .map(
          (field) =>
            field.key,
        ),
    );
  }
  export function buildQuestionContext(
    question:
      QuestionReaderResult,
    clarificationFacts:
      readonly ConsultingClarificationFact[] = [],
  ): QuestionContext {
    const normalizedQuestion =
  question.normalizedQuestion;

const counterpartIdentityFieldKeys =
  getClarificationFieldKeys(
    clarificationFacts,
    "counterpartIdentity",
  );

const counterpartBirthFieldKeys =
  getClarificationFieldKeys(
    clarificationFacts,
    "counterpartBirthData",
  );

const identityProvided =
  counterpartIdentityFieldKeys.has(
    "relation",
  )
  && counterpartIdentityFieldKeys.has(
    "currentStatus",
  );

  const birthDataProvided =
  (
    counterpartBirthFieldKeys.has(
      "birthDate",
    )
    && counterpartBirthFieldKeys.has(
      "calendarType",
    )
    && counterpartBirthFieldKeys.has(
      "gender",
    )
  )
  || (
    question
      .counterpartFacts
      .birthDate
    !== null
    && question
      .counterpartFacts
      .calendarType
    !== null
    && question
      .counterpartFacts
      .gender
    !== null
  );

const zodiacProvided =
  counterpartBirthFieldKeys.has(
    "zodiacSign",
  )
  || question
    .counterpartFacts
    .zodiac
  !== null;

const relation =
      detectCounterpartRelation(
        normalizedQuestion,
      );

      const counterpartExists =
      relation !== "unknown"
      || identityProvided
      || birthDataProvided
      || zodiacProvided
      || question.decisionTarget
        === "partner"
      || question.decisionTarget
        === "marry"
      || question.decisionTarget
        === "separate"
      || question.decisionTarget
        === "reconcile";

      const reality =
      buildQuestionRealityContext(
        question,
      );

      const lifeFlowInterpretationAnalysisRequired =
      isLifeFlowInterpretationQuestion(
        question.normalizedQuestion,
        question.decisionTarget,
  );

      const context:
  QuestionContext = {
    question,

    clarificationFacts:
      clarificationFacts.map(
        (fact) => ({
          key:
            fact.key,

          description:
            fact.description,

          fields:
            fact.fields.map(
              (field) => ({
                key:
                  field.key,

                value:
                  field.value,

                evidence: [
                  ...field.evidence,
                ],
              }),
            ),
        }),
      ),

    reality,
      timingType:
        question.timingType,
      counterpart: {
        exists: counterpartExists,
        relation,

        identityProvided,
        birthDataProvided,
        zodiacProvided,
      },

      actionObject: {
        type:
          mapActionObjectType(
            question.topic,
          ),

        subtype: null,
        description: null,
      },

      comparisonTargets: [],

      requirements: {
        counterpartReadingRequired:
          counterpartExists,

          compatibilityAnalysisRequired:
          question.analysisMode
            === "compatibility"
          || question.decisionTarget
            === "partner"
          || question.decisionTarget
            === "marry",
            timingAnalysisRequired:
          !lifeFlowInterpretationAnalysisRequired
          && (
            question.intent === "timing"
          || question.urgency !== "unknown"
          || question.timingType !== "unknown"
  ),

        realityAssessmentRequired:
          question.topic === "business" ||
          question.topic === "money" ||
          question.topic === "job" ||
          question.topic === "realEstate" ||
          question.topic === "marriage",

        comparisonAnalysisRequired:
          question.intent === "comparison" ||
          (
            question.intent === "selection"
            && !isRoleRecommendationQuestion(
              question.normalizedQuestion,
            )
          ),

        roleRecommendationAnalysisRequired:
          isRoleRecommendationQuestion(
            question.normalizedQuestion,
          ),

          lifeFlowInterpretationAnalysisRequired,
        },
      };

      return context;
    }
