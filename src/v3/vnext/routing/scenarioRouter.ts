import type {
  ChangeSignalType,
} from "../types/changeSignal.js";
import type {
  ConsultingScenario,
  ConsultingScenarioType,
} from "../types/consultingScenario.js";
import type {
  HumanStateDomain,
} from "../types/humanState.js";
import type {
  QuestionMeaning,
} from "../types/questionMeaning.js";
import type {
  TimeGranularity,
} from "../types/timeState.js";

export type ScenarioRouteRule = {
  id: string;
  priority: number;
  matches: (questionMeaning: QuestionMeaning) => boolean;
  scenarioType: ConsultingScenarioType;
  requiredDomains: HumanStateDomain[];
  requiredTimeGranularity: TimeGranularity[];
  requiredSignals: ChangeSignalType[];
};

function containsAny(
  text: string | null | undefined,
  keywords: readonly string[],
): boolean {
  if (!text) {
    return false;
  }

  return keywords.some((keyword) => text.includes(keyword));
}

function mentionsMonth(
  questionMeaning: QuestionMeaning,
): boolean {
  const sources = [
    questionMeaning.event,
    questionMeaning.time.description,
  ].filter(Boolean) as string[];

  return sources.some((text) => /\d{1,2}\s*월/.test(text));
}

function mentionsYear(
  questionMeaning: QuestionMeaning,
): boolean {
  const sources = [
    questionMeaning.event,
    questionMeaning.time.description,
  ].filter(Boolean) as string[];

  return sources.some((text) => /\d{4}\s*년/.test(text));
}

function resolveTimeGranularity(
  questionMeaning: QuestionMeaning,
): TimeGranularity[] {
  if (mentionsMonth(questionMeaning)) {
    return ["month"];
  }

  if (mentionsYear(questionMeaning)) {
    return ["year"];
  }

  if (questionMeaning.intent === "timing") {
    return ["month"];
  }

  return [];
}

const MONEY_FLOW_SIGNALS: ChangeSignalType[] = [
  "opportunity",
  "inflow",
  "expense",
  "pressure",
  "risk",
];

const BUSINESS_ACTION_SIGNALS: ChangeSignalType[] = [
  "opportunity",
  "pressure",
  "responsibility",
  "expansion",
  "risk",
];

const RELATIONSHIP_SIGNALS: ChangeSignalType[] = [
  "relationshipChange",
  "conflict",
  "stability",
];

export const SCENARIO_ROUTE_RULES: readonly ScenarioRouteRule[] = [
  {
    id: "relationship-assessment",
    priority: 10,
    matches: (questionMeaning) =>
      questionMeaning.domain === "compatibility"
      || (
        ["relationship", "marriage"].includes(questionMeaning.domain)
        && containsAny(questionMeaning.event, ["궁합", "합"])
      ),
    scenarioType: "relationshipAssessment",
    requiredDomains: ["relationship", "personality", "capacity"],
    requiredTimeGranularity: [],
    requiredSignals: RELATIONSHIP_SIGNALS,
  },
  {
    id: "aptitude-recommendation",
    priority: 20,
    matches: (questionMeaning) =>
      questionMeaning.domain === "career"
      && (
        questionMeaning.intent === "selection"
        || questionMeaning.intent === "interpretation"
      )
      && containsAny(questionMeaning.event, [
        "직업",
        "적성",
        "맞는",
        "역할",
        "일",
      ]),
    scenarioType: "aptitudeRecommendation",
    requiredDomains: ["career", "ability", "capacity"],
    requiredTimeGranularity: [],
    requiredSignals: [],
  },
  {
    id: "action-decision",
    priority: 30,
    matches: (questionMeaning) =>
      questionMeaning.domain === "business"
      && (
        questionMeaning.intent === "timing"
        || questionMeaning.intent === "possibility"
        || questionMeaning.intent === "direction"
      )
      && containsAny(questionMeaning.event, [
        "오픈",
        "개업",
        "시작",
        "창업",
        "가게",
        "매장",
        "사업",
      ]),
    scenarioType: "actionDecision",
    requiredDomains: ["career", "money", "capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: BUSINESS_ACTION_SIGNALS,
  },
  {
    id: "general-money-flow",
    priority: 40,
    matches: (questionMeaning) =>
      questionMeaning.domain === "money"
      && (
        questionMeaning.intent === "possibility"
        || questionMeaning.intent === "timing"
        || questionMeaning.intent === "existence"
      ),
    scenarioType: "generalFlow",
    requiredDomains: ["money", "capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: MONEY_FLOW_SIGNALS,
  },
  {
    id: "timing-assessment",
    priority: 50,
    matches: (questionMeaning) =>
      questionMeaning.intent === "timing"
      && questionMeaning.domain !== "money",
    scenarioType: "timingAssessment",
    requiredDomains: ["capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: ["opportunity", "pressure", "risk"],
  },
  {
    id: "monthly-fortune-flow",
    priority: 55,
    matches: (questionMeaning) =>
      containsAny(questionMeaning.event, ["운세", "흐름"])
      && (
        mentionsMonth(questionMeaning)
        || mentionsYear(questionMeaning)
      ),
    scenarioType: "generalFlow",
    requiredDomains: ["personality", "capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: ["opportunity", "pressure", "risk"],
  },
  {
    id: "possibility-check",
    priority: 60,
    matches: (questionMeaning) =>
      questionMeaning.intent === "possibility"
      || questionMeaning.intent === "existence",
    scenarioType: "possibilityCheck",
    requiredDomains: ["capacity", "risk"],
    requiredTimeGranularity: [],
    requiredSignals: ["opportunity", "risk"],
  },
  {
    id: "interpretation",
    priority: 70,
    matches: (questionMeaning) =>
      questionMeaning.intent === "interpretation"
      || questionMeaning.intent === "reason",
    scenarioType: "interpretation",
    requiredDomains: ["personality", "repeatedPattern"],
    requiredTimeGranularity: [],
    requiredSignals: [],
  },
  {
    id: "specific-event",
    priority: 80,
    matches: (questionMeaning) =>
      Boolean(questionMeaning.event)
      && questionMeaning.intent === "timing",
    scenarioType: "specificEvent",
    requiredDomains: ["capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: ["opportunity", "pressure", "risk"],
  },
  {
    id: "general-fallback",
    priority: 100,
    matches: () => true,
    scenarioType: "generalFlow",
    requiredDomains: ["personality", "capacity"],
    requiredTimeGranularity: [],
    requiredSignals: [],
  },
] as const;

function applyDynamicTimeGranularity(
  rule: ScenarioRouteRule,
  questionMeaning: QuestionMeaning,
): TimeGranularity[] {
  if (rule.requiredTimeGranularity.length > 0) {
    return [...rule.requiredTimeGranularity];
  }

  return resolveTimeGranularity(questionMeaning);
}

function selectScenarioRule(
  questionMeaning: QuestionMeaning,
): ScenarioRouteRule {
  const sortedRules = [...SCENARIO_ROUTE_RULES].sort(
    (left, right) => left.priority - right.priority,
  );

  return (
    sortedRules.find((rule) => rule.matches(questionMeaning))
    ?? sortedRules[sortedRules.length - 1]
  );
}

/**
 * QuestionMeaning을 기반으로 필요한 분석 범위만 선언한다.
 * 사주 판단을 수행하지 않는다.
 */
export function routeScenario(
  questionMeaning: QuestionMeaning,
): ConsultingScenario {
  const rule = selectScenarioRule(questionMeaning);

  return {
    type: rule.scenarioType,
    questionMeaning,
    requiredDomains: [...rule.requiredDomains],
    requiredTimeGranularity: applyDynamicTimeGranularity(
      rule,
      questionMeaning,
    ),
    requiredSignals: [...rule.requiredSignals],
    missingContext: [...questionMeaning.missingContext],
  };
}

export function findScenarioRuleById(
  ruleId: string,
): ScenarioRouteRule | undefined {
  return SCENARIO_ROUTE_RULES.find((rule) => rule.id === ruleId);
}
