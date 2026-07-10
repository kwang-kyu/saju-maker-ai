import type { IntentAnalysisResult } from "./intentAnalyzer";

export type CoreWeight = {
  coreName: string;
  weight: number;
  priority: number;
};

export type ConsultingStrategy = {
  intent: string;
  purpose: string;

  ruleId: string;

  primaryCore?: string;
  supportingCores: string[];

  coreWeights: CoreWeight[];

  timingCore?: string;

  sections: string[];

  synthesisOrder: string[];
  reasoningOrder: string[];
  decisionFocus: string[];

  summaryFocus: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
};

type StrategyRule = {
  ruleId: string;
  primaryCore: string;
  supportingCores: string[];
  coreWeights: CoreWeight[];
  reasoningOrder: string[];
  decisionFocus: string[];
  summaryFocus: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
  sections?: string[];
};

const STRATEGY_RULES = {
  business: {
    ruleId: "business-general",
    primaryCore: "business",
    supportingCores: ["money", "currentPhase"],
    coreWeights: [
      {
        coreName: "business",
        weight: 60,
        priority: 1,
      },
      {
        coreName: "money",
        weight: 20,
        priority: 2,
      },
      {
        coreName: "currentPhase",
        weight: 20,
        priority: 3,
      },
    ],
    reasoningOrder: [
      "사업 적성과 운영 능력을 먼저 판단",
      "투자금과 현금흐름 위험을 확인",
      "현재 시작하거나 확장해도 되는 흐름인지 확인",
    ],
    decisionFocus: [
      "사업 가능 여부",
      "잘 맞는 운영 방식",
      "주의해야 할 사업 위험",
      "지금 필요한 실행 조건",
    ],
    summaryFocus: "businessDecision",
    recommendedAction: "validateBeforeExpansion",
    riskLevel: "medium",
  },

  businessTiming: {
    ruleId: "business-timing",
    primaryCore: "business",
    supportingCores: [
      "currentPhase",
      "money",
      "lifeTimeline",
    ],
    coreWeights: [
      {
        coreName: "business",
        weight: 40,
        priority: 1,
      },
      {
        coreName: "currentPhase",
        weight: 30,
        priority: 2,
      },
      {
        coreName: "money",
        weight: 20,
        priority: 3,
      },
      {
        coreName: "lifeTimeline",
        weight: 10,
        priority: 4,
      },
    ],
    reasoningOrder: [
      "사업 자체가 맞는지 먼저 판단",
      "현재 실행 시기의 안정성을 확인",
      "초기 자금과 현금흐름을 확인",
      "중장기 흐름에서 확장 시점을 확인",
    ],
    decisionFocus: [
      "시작 가능 여부",
      "준비해야 할 기간",
      "좋은 시작 방식",
      "피해야 할 시기와 행동",
    ],
    summaryFocus: "businessTiming",
    recommendedAction: "timingFirst",
    riskLevel: "high",
  },

  partnership: {
    ruleId: "business-partnership",
    primaryCore: "compatibility",
    supportingCores: ["business", "money"],
    coreWeights: [
      {
        coreName: "compatibility",
        weight: 60,
        priority: 1,
      },
      {
        coreName: "business",
        weight: 20,
        priority: 2,
      },
      {
        coreName: "money",
        weight: 20,
        priority: 3,
      },
    ],
    reasoningOrder: [
      "두 사람의 의사결정 방식과 역할 균형을 판단",
      "함께 사업할 때의 실행력과 운영 방식을 확인",
      "돈 관리와 수익 배분에서 충돌 가능성을 확인",
    ],
    decisionFocus: [
      "동업 가능 여부",
      "대표자와 실무자 역할",
      "금전 충돌 가능성",
      "계약과 수익 배분 조건",
    ],
    summaryFocus: "partnershipDecision",
    recommendedAction: "defineRolesAndMoneyRules",
    riskLevel: "high",
  },

  money: {
    ruleId: "money-general",
    primaryCore: "money",
    supportingCores: [
      "currentPhase",
      "financialStrategy",
    ],
    coreWeights: [
      {
        coreName: "money",
        weight: 60,
        priority: 1,
      },
      {
        coreName: "currentPhase",
        weight: 25,
        priority: 2,
      },
      {
        coreName: "financialStrategy",
        weight: 15,
        priority: 3,
      },
    ],
    reasoningOrder: [
      "돈을 벌고 유지하는 기본 구조를 판단",
      "현재 재물 흐름의 강약을 확인",
      "투자와 지출 전략을 확인",
    ],
    decisionFocus: [
      "재물 가능성",
      "돈이 들어오는 방식",
      "돈이 새는 위험",
      "현실적인 자금 관리 방법",
    ],
    summaryFocus: "moneyDecision",
    recommendedAction: "protectCashFlow",
    riskLevel: "medium",
  },

  job: {
    ruleId: "job-general",
    primaryCore: "job",
    supportingCores: ["money", "currentPhase"],
    coreWeights: [
      {
        coreName: "job",
        weight: 60,
        priority: 1,
      },
      {
        coreName: "money",
        weight: 20,
        priority: 2,
      },
      {
        coreName: "currentPhase",
        weight: 20,
        priority: 3,
      },
    ],
    reasoningOrder: [
      "직업 적성과 업무 방식을 판단",
      "소득 안정성과 수익 구조를 확인",
      "현재 이직하거나 변화해도 되는지 확인",
    ],
    decisionFocus: [
      "적합한 직업 방향",
      "직장과 독립 중 유리한 방향",
      "수입 안정성",
      "이직 또는 변화 시기",
    ],
    summaryFocus: "jobDecision",
    recommendedAction: "chooseSustainableWork",
    riskLevel: "medium",
  },

  love: {
    ruleId: "love-general",
    primaryCore: "love",
    supportingCores: [
      "compatibility",
      "currentPhase",
    ],
    coreWeights: [
      {
        coreName: "love",
        weight: 50,
        priority: 1,
      },
      {
        coreName: "compatibility",
        weight: 30,
        priority: 2,
      },
      {
        coreName: "currentPhase",
        weight: 20,
        priority: 3,
      },
    ],
    reasoningOrder: [
      "본인의 연애 성향과 감정 표현 방식을 판단",
      "상대방과의 감정적 궁합을 확인",
      "현재 관계가 발전하기 좋은 흐름인지 확인",
    ],
    decisionFocus: [
      "관계 발전 가능성",
      "서로 끌리는 이유",
      "갈등이 생기는 지점",
      "관계를 이어가기 위한 방법",
    ],
    summaryFocus: "loveDecision",
    recommendedAction: "improveEmotionalCommunication",
    riskLevel: "medium",
  },

  marriage: {
    ruleId: "marriage-general",
    primaryCore: "marriage",
    supportingCores: ["love", "currentPhase"],
    coreWeights: [
      {
        coreName: "marriage",
        weight: 50,
        priority: 1,
      },
      {
        coreName: "love",
        weight: 20,
        priority: 2,
      },
      {
        coreName: "currentPhase",
        weight: 30,
        priority: 3,
      },
    ],
    reasoningOrder: [
      "결혼생활의 안정성과 책임 구조를 판단",
      "감정적 결합과 애정 표현 방식을 확인",
      "현재 결혼을 결정하기 좋은 흐름인지 확인",
    ],
    decisionFocus: [
      "결혼 가능성",
      "결혼 후 생활 안정성",
      "경제관과 생활 방식",
      "결혼 결정 시기",
    ],
    summaryFocus: "marriageDecision",
    recommendedAction: "confirmLifeCompatibility",
    riskLevel: "medium",
  },

  marriageCompatibility: {
    ruleId: "marriage-compatibility",
    primaryCore: "compatibility",
    supportingCores: ["marriage", "love"],
    coreWeights: [
      {
        coreName: "compatibility",
        weight: 50,
        priority: 1,
      },
      {
        coreName: "marriage",
        weight: 30,
        priority: 2,
      },
      {
        coreName: "love",
        weight: 20,
        priority: 3,
      },
    ],
    reasoningOrder: [
      "두 사람의 생활 방식과 관계 균형을 판단",
      "결혼 후 안정성과 책임 분담을 확인",
      "감정 표현과 애정 유지 방식을 확인",
    ],
    decisionFocus: [
      "결혼 궁합",
      "생활 궁합",
      "경제관 차이",
      "장기적인 갈등 가능성",
    ],
    summaryFocus: "marriageCompatibility",
    recommendedAction: "alignLifeAndMoneyRules",
    riskLevel: "high",
  },

  compatibility: {
    ruleId: "compatibility-general",
    primaryCore: "compatibility",
    supportingCores: ["love", "marriage"],
    coreWeights: [
      {
        coreName: "compatibility",
        weight: 60,
        priority: 1,
      },
      {
        coreName: "love",
        weight: 20,
        priority: 2,
      },
      {
        coreName: "marriage",
        weight: 20,
        priority: 3,
      },
    ],
    reasoningOrder: [
      "두 사람의 기본 성향과 상호작용을 판단",
      "감정적으로 가까워지는 방식을 확인",
      "장기 관계의 안정성을 확인",
    ],
    decisionFocus: [
      "전체 궁합",
      "서로 보완되는 부분",
      "충돌 가능성이 큰 부분",
      "관계를 유지하는 방법",
    ],
    summaryFocus: "compatibilityDecision",
    recommendedAction: "useStrengthsAndManageConflicts",
    riskLevel: "medium",
  },

  health: {
    ruleId: "health-general",
    primaryCore: "health",
    supportingCores: ["currentPhase"],
    coreWeights: [
      {
        coreName: "health",
        weight: 70,
        priority: 1,
      },
      {
        coreName: "currentPhase",
        weight: 30,
        priority: 2,
      },
    ],
    reasoningOrder: [
      "타고난 건강 취약점과 생활 습관을 판단",
      "현재 흐름에서 피로와 부담이 커지는 부분을 확인",
    ],
    decisionFocus: [
      "주의할 건강 영역",
      "악화되기 쉬운 생활 습관",
      "현재 건강 관리 우선순위",
      "예방 중심의 실천 방법",
    ],
    summaryFocus: "healthDecision",
    recommendedAction: "preventiveManagement",
    riskLevel: "medium",
  },

  lifeTimeline: {
    ruleId: "life-timeline",
    primaryCore: "lifeTimeline",
    supportingCores: ["currentPhase"],
    coreWeights: [
      {
        coreName: "lifeTimeline",
        weight: 60,
        priority: 1,
      },
      {
        coreName: "currentPhase",
        weight: 40,
        priority: 2,
      },
    ],
    reasoningOrder: [
      "인생의 장기적인 변화 흐름을 판단",
      "현재 어느 단계에 있는지 확인",
    ],
    decisionFocus: [
      "현재 인생 단계",
      "변화가 강해지는 시기",
      "준비해야 할 방향",
      "지금 우선해야 할 선택",
    ],
    summaryFocus: "lifeTimeline",
    recommendedAction: "prepareForNextPhase",
    riskLevel: "medium",
  },

  currentPhase: {
    ruleId: "current-phase",
    primaryCore: "currentPhase",
    supportingCores: [],
    coreWeights: [
      {
        coreName: "currentPhase",
        weight: 100,
        priority: 1,
      },
    ],
    reasoningOrder: [
      "현재 운의 방향과 행동 가능 범위를 판단",
    ],
    decisionFocus: [
      "현재 상황의 핵심",
      "지금 해야 할 일",
      "지금 피해야 할 일",
    ],
    summaryFocus: "currentPhase",
    recommendedAction: "followCurrentPhase",
    riskLevel: "low",
  },

  general: {
    ruleId: "general-consulting",
    primaryCore: "currentPhase",
    supportingCores: ["lifeTimeline"],
    coreWeights: [
      {
        coreName: "currentPhase",
        weight: 60,
        priority: 1,
      },
      {
        coreName: "lifeTimeline",
        weight: 40,
        priority: 2,
      },
    ],
    reasoningOrder: [
      "현재 가장 중요한 문제를 우선 판단",
      "장기적인 흐름에서 선택의 방향을 확인",
    ],
    decisionFocus: [
      "현재 핵심 문제",
      "우선순위",
      "현실적인 행동 방향",
    ],
    summaryFocus: "generalDecision",
    recommendedAction: "clarifyPriority",
    riskLevel: "low",
  },
} satisfies Record<string, StrategyRule>;

function normalizeQuestion(question: string): string {
  return question
    .replace(/\s+/g, "")
    .toLowerCase();
}

function includesAny(
  question: string,
  keywords: string[]
): boolean {
  return keywords.some((keyword) =>
    question.includes(
      keyword.replace(/\s+/g, "").toLowerCase()
    )
  );
}

function selectStrategyRule(
  intentAnalysis: IntentAnalysisResult
): StrategyRule {
  const normalizedQuestion = normalizeQuestion(
    intentAnalysis.question
  );

  const isPartnershipQuestion = includesAny(
    normalizedQuestion,
    [
      "동업",
      "공동사업",
      "공동창업",
      "사업파트너",
      "파트너와사업",
      "같이사업",
      "함께사업",
      "둘이사업",
    ]
  );

  if (isPartnershipQuestion) {
    return STRATEGY_RULES.partnership;
  }

  const isHealthQuestion =
    intentAnalysis.intent === "health" ||
    includesAny(normalizedQuestion, [
      "건강",
      "질병",
      "몸이",
      "아픈",
      "수술",
      "병원",
      "체력",
      "피로",
    ]);

  if (isHealthQuestion) {
    return STRATEGY_RULES.health;
  }

  const isMarriageCompatibilityQuestion =
    includesAny(normalizedQuestion, [
      "결혼궁합",
      "부부궁합",
      "남편과",
      "아내와",
      "배우자와",
      "이사람과결혼",
      "우리둘이결혼",
    ]);

  if (isMarriageCompatibilityQuestion) {
    return STRATEGY_RULES.marriageCompatibility;
  }

  if (intentAnalysis.intent === "compatibility") {
    return STRATEGY_RULES.compatibility;
  }

  if (
    intentAnalysis.intent === "business" &&
    (
      intentAnalysis.purpose === "startBusiness" ||
      intentAnalysis.scenario.intent === "timing"
    )
  ) {
    return STRATEGY_RULES.businessTiming;
  }

  switch (intentAnalysis.intent) {
    case "business":
      return STRATEGY_RULES.business;

    case "money":
    case "financialStrategy":
    case "realEstateInvestment":
      return STRATEGY_RULES.money;

    case "job":
      return STRATEGY_RULES.job;

    case "love":
      return STRATEGY_RULES.love;

    case "marriage":
      return STRATEGY_RULES.marriage;

    case "health":
      return STRATEGY_RULES.health;

    case "lifeTimeline":
    case "daeun":
    case "seun":
      return STRATEGY_RULES.lifeTimeline;

    case "currentPhase":
      return STRATEGY_RULES.currentPhase;

    default:
      return STRATEGY_RULES.general;
  }
}

export function buildConsultingStrategy(
  intentAnalysis: IntentAnalysisResult
): ConsultingStrategy {
  const rule = selectStrategyRule(intentAnalysis);

  const synthesisOrder = [...rule.coreWeights]
    .sort((a, b) => a.priority - b.priority)
    .map((item) => item.coreName);

  const timingCore = synthesisOrder.find((core) =>
    [
      "lifeTimeline",
      "currentPhase",
      "daeun",
      "seun",
    ].includes(core)
  );

  return {
    intent: intentAnalysis.intent,
    purpose: intentAnalysis.purpose,

    ruleId: rule.ruleId,

    primaryCore: rule.primaryCore,
    supportingCores: rule.supportingCores,

    coreWeights: rule.coreWeights,

    timingCore,

    sections:
      rule.sections ??
      resolveSections(intentAnalysis.intent),

    synthesisOrder,
    reasoningOrder: rule.reasoningOrder,
    decisionFocus: rule.decisionFocus,

    summaryFocus: rule.summaryFocus,
    recommendedAction: rule.recommendedAction,
    riskLevel: rule.riskLevel,
  };
}

function resolveSections(intent: string): string[] {
  switch (intent) {
    case "business":
      return [
        "currentSituation",
        "strengths",
        "risks",
        "timing",
        "recommendedStrategies",
      ];

    case "money":
    case "financialStrategy":
    case "realEstateInvestment":
      return [
        "moneyType",
        "investmentDecision",
        "risks",
        "timing",
        "recommendedStrategies",
      ];

    case "job":
      return [
        "jobType",
        "strengths",
        "risks",
        "timing",
        "recommendedStrategies",
      ];

    case "love":
      return [
        "loveType",
        "matchingPartner",
        "conflictPoint",
        "timing",
      ];

    case "marriage":
      return [
        "marriageType",
        "stability",
        "financialView",
        "timing",
      ];

    case "compatibility":
      return [
        "overallCompatibility",
        "strengths",
        "conflictPoints",
        "relationshipAdvice",
      ];

    case "health":
      return [
        "healthPattern",
        "weakPoints",
        "currentRisks",
        "recommendedManagement",
      ];

    default:
      return [];
  }
}