export type ScenarioTopic =
  | "business"
  | "money"
  | "financialStrategy"
  | "realEstateInvestment"
  | "job"
  | "love"
  | "marriage"
  | "compatibility"
  | "health"
  | "legalRisk"
  | "lifeTimeline"
  | "currentPhase"
  | "daeun"
  | "seun"
  | "general";

export type ScenarioIntent =
  | "possibility"
  | "timing"
  | "reason"
  | "strategy"
  | "risk"
  | "comparison"
  | "generalJudgement";

export type ScenarioResult = {
  topic: ScenarioTopic;
  intent: ScenarioIntent;
  requiredCores: ScenarioTopic[];
  keywords: string[];
};

const scenarioRules: ScenarioResult[] = [
  {
    topic: "business",
    intent: "timing",
    requiredCores: [
      "business",
      "money",
      "financialStrategy",
      "currentPhase",
      "daeun",
      "seun",
    ],
    keywords: [
      "언제 창업",
      "언제 개업",
      "창업 시기",
      "개업 시기",
      "사업 시기",
      "언제 시작",
    ],
  },
  {
    topic: "business",
    intent: "timing",
    requiredCores: [
      "business",
      "money",
      "financialStrategy",
      "currentPhase",
      "daeun",
      "seun",
    ],
    keywords: [
      "언제 창업",
      "언제 개업",
      "창업 시기",
      "개업 시기",
      "사업 시기",
      "언제 시작",
    ],
  },
  {
    topic: "business",
    intent: "possibility",
    requiredCores: ["business", "money", "currentPhase"],
    keywords: [
      "사업",
      "창업",
      "개업",
      "장사",
      "자영업",
      "가게",
      "매장",
      "점포",
      "프랜차이즈",
      "판매",
      "운영",
      "차리려",
      "차리려고",
      "차리면",
      "하려는데",
      "해보려",
      "해도 될까",
      "해도 될까요",
      "괜찮을까",
      "괜찮을까요",
      "하면 어떨까",
      "하면 어떨까요",
      "집을 하려",
      "점을 하려",
      "운영하려",
    ],
  },
  {
    topic: "money",
    intent: "timing",
    requiredCores: ["money", "financialStrategy", "currentPhase", "lifeTimeline", "daeun", "seun"],
    keywords: ["돈", "재물", "금전", "풀리", "언제", "투자"],
  },
  {
    topic: "financialStrategy",
    intent: "generalJudgement",
    requiredCores: ["money", "financialStrategy", "realEstateInvestment", "currentPhase"],
    keywords: ["부동산", "아파트", "상가", "토지", "건물", "매매", "투자", "재테크"],
  },
  {
    topic: "job",
    intent: "generalJudgement",
    requiredCores: ["job", "money", "currentPhase", "daeun", "seun"],
    keywords: ["이직", "퇴사", "직장", "취업", "승진", "일자리"],
  },
  {
    topic: "legalRisk",
    intent: "risk",
    requiredCores: ["legalRisk", "currentPhase", "daeun", "seun"],
    keywords: ["관재", "관제", "소송", "분쟁", "고소", "계약", "세금", "법"],
  },
  {
    topic: "marriage",
    intent: "timing",
    requiredCores: ["marriage", "love", "currentPhase", "daeun"],
    keywords: ["결혼", "재혼", "언제", "배우자"],
  },
  {
    topic: "compatibility",
    intent: "generalJudgement",
    requiredCores: ["compatibility", "love", "marriage"],
    keywords: ["궁합", "맞나요", "잘 맞", "상대", "연인", "부부"],
  },
  {
    topic: "lifeTimeline",
    intent: "timing",
    requiredCores: ["lifeTimeline", "currentPhase", "daeun", "seun"],
    keywords: ["대운", "세운", "운", "언제", "흐름"],
  },
];

export function analyzeScenario(question: string): ScenarioResult {
  const normalized = question.replace(/\s+/g, "").toLowerCase();

  const matched = scenarioRules.find((rule) =>
    rule.keywords.some((keyword) =>
      normalized.includes(keyword.replace(/\s+/g, "").toLowerCase())
    )
  );

  if (matched) return matched;

  return {
    topic: "general",
    intent: "generalJudgement",
    requiredCores: ["general", "currentPhase"],
    keywords: [],
  };
}