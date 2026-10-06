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
  QuestionActionNature,
  QuestionMeaning,
  QuestionMeaningIntent,
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

/**
 * 실행·결정 성격의 actionNature.
 * manageMoney는 money topic 기본값으로 자주 붙으므로
 * prediction flow를 actionDecision으로 끌어가지 않도록 제외한다.
 */
const EXECUTION_ACTION_NATURES: ReadonlySet<QuestionActionNature> = new Set([
  "start",
  "continue",
  "stop",
  "wait",
  "choose",
  "invest",
  "buy",
  "sell",
  "move",
  "partner",
  "separate",
  "changeJob",
  "leaveJob",
  "marry",
  "reconcile",
  "protectHealth",
  "respondToConflict",
  "confirmDirection",
]);

/** prediction 아래에서도 actionDecision 후보가 되는 강한 실행 행동 */
const STRONG_EXECUTION_UNDER_PREDICTION: ReadonlySet<QuestionActionNature> =
  new Set([
    "start",
    "stop",
    "buy",
    "sell",
    "changeJob",
    "leaveJob",
    "marry",
    "move",
    "invest",
    "choose",
  ]);

const ACTIONABLE_INTENTS: ReadonlySet<QuestionMeaningIntent> = new Set([
  "possibility",
  "timing",
  "direction",
  "selection",
  "comparison",
  "method",
  "risk",
]);

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

const LIFE_FLOW_SIGNALS: ChangeSignalType[] = [
  "opportunity",
  "pressure",
  "risk",
];

function hasExecutionActionNature(
  questionMeaning: QuestionMeaning,
): boolean {
  return EXECUTION_ACTION_NATURES.has(questionMeaning.actionNature);
}

/**
 * Open lifeDirection direction-selection.
 * confirmDirection is execution-listed, but this shape must not enter
 * career/business isActionBearing action-decision rules.
 * Dedicated positive route: action-decision-open-life-direction.
 * askedObject + intent + analysisMode + actionNature only.
 */
function isOpenLifeDirectionConfirmSelection(
  questionMeaning: QuestionMeaning,
): boolean {
  return (
    questionMeaning.askedObject === "lifeDirection"
    && questionMeaning.intent === "selection"
    && questionMeaning.analysisMode === "selection"
    && questionMeaning.actionNature === "confirmDirection"
  );
}

/**
 * Adapter may project Reader evaluation + conclusionNature=decision
 * → intent=possibility. Open/general with no action is not a real
 * possibility/existence ask.
 *
 * Recover evaluation speech-act via asksWhat residual in event
 * (Reader intentText template), not question-literal matching.
 */
function isProjectedOpenGeneralEvaluation(
  questionMeaning: QuestionMeaning,
): boolean {
  if (questionMeaning.intent !== "possibility") {
    return false;
  }

  if (questionMeaning.actionNature !== "none") {
    return false;
  }

  if (
    questionMeaning.askedObject !== "general"
    || questionMeaning.domain !== "general"
  ) {
    return false;
  }

  if (questionMeaning.analysisMode !== "decision") {
    return false;
  }

  if (questionMeaning.conclusionNature !== "decision") {
    return false;
  }

  // Reader buildAsksWhat(general, evaluation) residual.
  return (
    questionMeaning.event
    === "현재 고민에 대한 종합 판단이 전체적으로 어떻게 판단해야 하는지를 묻고 있다."
  );
}

/**
 * action-bearing routing 여부.
 * prediction + actionNature=none → false.
 * prediction + 강한 실행행동 → true 가능.
 * possibility/timing/direction 등 + 실행행동 → true.
 * open lifeDirection confirmDirection selection → false.
 */
function isActionBearingQuestion(
  questionMeaning: QuestionMeaning,
): boolean {
  if (isOpenLifeDirectionConfirmSelection(questionMeaning)) {
    return false;
  }

  if (!hasExecutionActionNature(questionMeaning)) {
    return false;
  }

  if (questionMeaning.intent === "prediction") {
    return STRONG_EXECUTION_UNDER_PREDICTION.has(
      questionMeaning.actionNature,
    );
  }

  return ACTIONABLE_INTENTS.has(questionMeaning.intent)
    || questionMeaning.analysisMode === "decision";
}

export function hasTimeIdentity(
  questionMeaning: QuestionMeaning,
): boolean {
  const { time } = questionMeaning;

  if (time.period) {
    return true;
  }

  if (time.urgency !== "unspecified") {
    return true;
  }

  if (time.timingType !== "unspecified") {
    return true;
  }

  if (time.description && time.description.trim().length > 0) {
    return (
      /\d{1,2}\s*월/.test(time.description)
      || /\d{4}\s*년/.test(time.description)
    );
  }

  return false;
}

function mapPeriodGranularity(
  questionMeaning: QuestionMeaning,
): TimeGranularity | null {
  const period = questionMeaning.time.period;

  if (!period) {
    return null;
  }

  switch (period.granularity) {
    case "day":
      return "day";
    case "month":
      return "month";
    case "halfYear":
      return "period";
    case "year":
      return "year";
    case "overall":
      return "life";
    default:
      return null;
  }
}

function mentionsMonth(
  questionMeaning: QuestionMeaning,
): boolean {
  if (questionMeaning.time.period?.month != null) {
    return true;
  }

  if (questionMeaning.time.period?.granularity === "month") {
    return true;
  }

  const description = questionMeaning.time.description;

  return Boolean(description && /\d{1,2}\s*월/.test(description));
}

function mentionsYear(
  questionMeaning: QuestionMeaning,
): boolean {
  if (questionMeaning.time.period?.year != null) {
    return true;
  }

  if (questionMeaning.time.period?.granularity === "year") {
    return true;
  }

  const description = questionMeaning.time.description;

  return Boolean(description && /\d{4}\s*년/.test(description));
}

export function resolveTimeGranularity(
  questionMeaning: QuestionMeaning,
): TimeGranularity[] {
  const fromPeriod = mapPeriodGranularity(questionMeaning);

  if (fromPeriod) {
    return [fromPeriod];
  }

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

function isCompatibilityAssessment(
  questionMeaning: QuestionMeaning,
): boolean {
  // analysisMode=compatibility가 primary.
  // domain=compatibility는 Adapter가 이미 보존한 compatibility 계약.
  // 단순 relationship + counterpart만으로 compatibility로 올리지 않는다.
  return (
    questionMeaning.analysisMode === "compatibility"
    || questionMeaning.domain === "compatibility"
  );
}

function isBusinessSelectionAptitude(
  questionMeaning: QuestionMeaning,
): boolean {
  return (
    questionMeaning.domain === "business"
    && (
      questionMeaning.intent === "selection"
      || questionMeaning.analysisMode === "selection"
    )
  );
}

function isAptitudeRecommendation(
  questionMeaning: QuestionMeaning,
): boolean {
  // Career aptitude plus business selection without execution action.
  // Business start/stop stay on action-decision via isActionBearingQuestion.
  if (
    questionMeaning.domain !== "career"
    && !isBusinessSelectionAptitude(questionMeaning)
  ) {
    return false;
  }

  // Open lifeDirection confirmDirection is not role/aptitude recommendation.
  if (isOpenLifeDirectionConfirmSelection(questionMeaning)) {
    return false;
  }

  if (isActionBearingQuestion(questionMeaning)) {
    return false;
  }

  return (
    questionMeaning.intent === "selection"
    || questionMeaning.intent === "interpretation"
    || questionMeaning.analysisMode === "selection"
    || (
      questionMeaning.analysisMode === "interpretation"
      && questionMeaning.intent !== "prediction"
    )
  );
}

export const SCENARIO_ROUTE_RULES: readonly ScenarioRouteRule[] = [
  {
    id: "relationship-assessment",
    priority: 10,
    matches: (questionMeaning) =>
      isCompatibilityAssessment(questionMeaning),
    scenarioType: "relationshipAssessment",
    requiredDomains: ["relationship", "personality", "capacity"],
    requiredTimeGranularity: [],
    requiredSignals: RELATIONSHIP_SIGNALS,
  },
  {
    id: "aptitude-recommendation",
    priority: 20,
    matches: (questionMeaning) =>
      isAptitudeRecommendation(questionMeaning),
    scenarioType: "aptitudeRecommendation",
    requiredDomains: ["career", "ability", "capacity"],
    requiredTimeGranularity: [],
    requiredSignals: [],
  },
  {
    id: "action-decision-business",
    priority: 30,
    matches: (questionMeaning) =>
      isActionBearingQuestion(questionMeaning)
      && questionMeaning.domain === "business",
    scenarioType: "actionDecision",
    requiredDomains: ["career", "money", "capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: BUSINESS_ACTION_SIGNALS,
  },
  {
    id: "action-decision-money",
    priority: 31,
    matches: (questionMeaning) =>
      questionMeaning.domain === "money"
      && (
        isActionBearingQuestion(questionMeaning)
        // manageMoney는 전역 실행 행동으로 등록하지 않고
        // money + method만 기존 actionDecision으로 보낸다.
        || questionMeaning.intent === "method"
      ),
    scenarioType: "actionDecision",
    requiredDomains: ["money", "capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: MONEY_FLOW_SIGNALS,
  },
  {
    id: "action-decision-career",
    priority: 32,
    matches: (questionMeaning) =>
      isActionBearingQuestion(questionMeaning)
      && (
        questionMeaning.domain === "career"
        || questionMeaning.askedObject === "lifeDirection"
      ),
    scenarioType: "actionDecision",
    requiredDomains: ["career", "ability", "capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: ["opportunity", "pressure", "risk"],
  },
  {
    id: "action-decision-relationship",
    priority: 33,
    matches: (questionMeaning) =>
      isActionBearingQuestion(questionMeaning)
      && (
        questionMeaning.domain === "relationship"
        || questionMeaning.domain === "marriage"
      ),
    scenarioType: "actionDecision",
    requiredDomains: ["relationship", "personality", "capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: RELATIONSHIP_SIGNALS,
  },
  {
    id: "action-decision-generic",
    priority: 34,
    matches: (questionMeaning) =>
      isActionBearingQuestion(questionMeaning),
    scenarioType: "actionDecision",
    requiredDomains: ["career", "money", "capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: BUSINESS_ACTION_SIGNALS,
  },
  {
    // Open lifeDirection is excluded from isActionBearing career/business
    // rules; this positive route reuses actionDecision answer-shape.
    id: "action-decision-open-life-direction",
    priority: 35,
    matches: (questionMeaning) =>
      isOpenLifeDirectionConfirmSelection(questionMeaning),
    scenarioType: "actionDecision",
    requiredDomains: ["personality", "capacity", "risk"],
    requiredTimeGranularity: [],
    requiredSignals: LIFE_FLOW_SIGNALS,
  },
  {
    id: "general-money-flow",
    priority: 40,
    matches: (questionMeaning) =>
      questionMeaning.domain === "money"
      && (
        questionMeaning.intent === "prediction"
        || questionMeaning.intent === "timing"
        || questionMeaning.intent === "existence"
        || questionMeaning.intent === "general"
      ),
    scenarioType: "generalFlow",
    requiredDomains: ["money", "capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: MONEY_FLOW_SIGNALS,
  },
  {
    id: "general-business-flow",
    priority: 42,
    matches: (questionMeaning) =>
      questionMeaning.domain === "business"
      && questionMeaning.intent === "prediction"
      && !isActionBearingQuestion(questionMeaning),
    scenarioType: "generalFlow",
    requiredDomains: ["career", "money", "capacity", "risk"],
    requiredTimeGranularity: [],
    requiredSignals: BUSINESS_ACTION_SIGNALS,
  },
  {
    id: "general-life-prediction-flow",
    priority: 44,
    matches: (questionMeaning) =>
      (
        questionMeaning.domain === "life"
        || questionMeaning.askedObject === "lifeFlow"
      )
      && questionMeaning.intent === "prediction"
      && !isActionBearingQuestion(questionMeaning),
    scenarioType: "generalFlow",
    requiredDomains: ["personality", "capacity", "risk"],
    requiredTimeGranularity: [],
    requiredSignals: LIFE_FLOW_SIGNALS,
  },
  {
    id: "timing-assessment",
    priority: 50,
    matches: (questionMeaning) =>
      questionMeaning.intent === "timing"
      && questionMeaning.domain !== "money"
      && questionMeaning.time.timingType !== "executionTiming",
    scenarioType: "timingAssessment",
    requiredDomains: ["capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: ["opportunity", "pressure", "risk"],
  },
  {
    id: "specific-event",
    priority: 55,
    matches: (questionMeaning) =>
      questionMeaning.intent === "timing"
      && questionMeaning.time.timingType === "executionTiming"
      && questionMeaning.askedObject !== "general"
      && questionMeaning.askedObject !== "lifeFlow"
      && !isActionBearingQuestion(questionMeaning),
    scenarioType: "specificEvent",
    requiredDomains: ["capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: ["opportunity", "pressure", "risk"],
  },
  {
    id: "domain-aware-period-flow",
    priority: 58,
    matches: (questionMeaning) =>
      questionMeaning.intent === "prediction"
      && hasTimeIdentity(questionMeaning)
      && !isActionBearingQuestion(questionMeaning),
    scenarioType: "generalFlow",
    requiredDomains: ["personality", "capacity", "risk"],
    requiredTimeGranularity: ["month"],
    requiredSignals: LIFE_FLOW_SIGNALS,
  },
  {
    id: "possibility-check",
    priority: 60,
    matches: (questionMeaning) =>
      (
        questionMeaning.intent === "possibility"
        || questionMeaning.intent === "existence"
      )
      && !isActionBearingQuestion(questionMeaning)
      && !isProjectedOpenGeneralEvaluation(questionMeaning),
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
      || questionMeaning.intent === "reason"
      || (
        questionMeaning.analysisMode === "interpretation"
        && questionMeaning.intent !== "prediction"
        && questionMeaning.intent !== "possibility"
        && questionMeaning.intent !== "timing"
        && questionMeaning.intent !== "existence"
      ),
    scenarioType: "interpretation",
    requiredDomains: ["personality", "repeatedPattern"],
    requiredTimeGranularity: [],
    requiredSignals: [],
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
