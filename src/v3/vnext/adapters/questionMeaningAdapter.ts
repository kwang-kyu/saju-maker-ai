import type {
  ConclusionNature,
  QuestionAnalysisMode,
  QuestionIntent,
  QuestionReaderResult,
  QuestionTimingType,
  QuestionTopic,
  QuestionUrgency,
} from "../../consulting/question/questionReader.js";
import type {
  LifeFlowTarget,
} from "../../consulting/question/lifeFlowTarget.js";
import type {
  MissingContextItem,
  QuestionDomain,
  QuestionMeaning,
  QuestionMeaningCounterpart,
  QuestionMeaningIntent,
  QuestionMeaningRef,
  QuestionObject,
  QuestionTimeFocus,
  QuestionTimePeriodIdentity,
} from "../types/questionMeaning.js";

export type QuestionMeaningAdapterInput = Pick<
  QuestionReaderResult,
  | "originalQuestion"
  | "normalizedQuestion"
  | "topic"
  | "intent"
  | "decisionTarget"
  | "objectLabel"
  | "urgency"
  | "timingType"
  | "analysisMode"
  | "analysisScope"
  | "counterpartFacts"
  | "asksWhat"
  | "decisionQuestion"
  | "conclusionNature"
> & {
  /**
   * Optional LifeFlowTarget already resolved upstream.
   * Adapter does not parse time; it only preserves identity when provided.
   */
  lifeFlowTarget?: LifeFlowTarget | null;
  /** Optional conversation turn identity */
  sourceTurnId?: string | null;
  /** Optional effective question override (else normalizedQuestion) */
  effectiveQuestion?: string | null;
  /**
   * Conversation follow-up counterpart continuity signal.
   * Report / initial paths omit this; do not invent switch here.
   */
  counterpartContinuity?: "continuity" | "switch" | "unknown";
};

const TOPIC_TO_DOMAIN: Record<
  QuestionTopic,
  QuestionDomain
> = {
  business: "business",
  money: "money",
  job: "career",
  // QuestionDomain has no realEstate member. Mapping to money collapses
  // Reader money ≠ realEstate into one axis cell; use existing "other".
  realEstate: "other",
  relationship: "relationship",
  love: "relationship",
  marriage: "marriage",
  family: "relationship",
  health: "health",
  legal: "legal",
  lifeFlow: "life",
  lifeDirection: "career",
  general: "general",
};

function refineDomainFromQuestionText(
  domain: QuestionDomain,
  normalizedQuestion: string,
): QuestionDomain {
  // Securities / cash markers distinguish money from realEstate-as-other.
  // Do not use 매수/투자 alone — those also appear in realEstate questions.
  if (
    /금전|재물운|재물|수입|매출|돈|주식|채권|ETF|etf|예금/
      .test(normalizedQuestion)
  ) {
    return "money";
  }

  if (/직업|적성|맞는\s*일|역할/.test(normalizedQuestion)) {
    return "career";
  }

  return domain;
}

function resolveIntent(
  input: QuestionMeaningAdapterInput,
): QuestionMeaningIntent {
  if (input.intent !== "generalJudgement") {
    return INTENT_TO_MEANING[input.intent];
  }

  if (/있을까|있나요|있을지|있을\s*수/.test(input.normalizedQuestion)) {
    return "existence";
  }

  if (/어떨까|해도\s*될까|가능할까/.test(input.normalizedQuestion)) {
    return "possibility";
  }

  const conclusionIntent = mapConclusionNatureToIntent(
    input.conclusionNature,
  );

  if (conclusionIntent) {
    return conclusionIntent;
  }

  return INTENT_TO_MEANING[input.intent];
}

function mapConclusionNatureToIntent(
  conclusionNature: ConclusionNature,
): QuestionMeaningIntent | null {
  switch (conclusionNature) {
    case "recommendation":
      return "selection";
    case "existence":
      return "existence";
    case "interpretation":
      return "interpretation";
    case "warning":
      return "risk";
    case "prediction":
      // Preserve Reader prediction; do not collapse to possibility.
      return "prediction";
    case "decision":
      return "possibility";
    default:
      return null;
  }
}

const INTENT_TO_MEANING: Record<
  QuestionIntent,
  QuestionMeaningIntent
> = {
  possibility: "possibility",
  timing: "timing",
  reason: "reason",
  method: "method",
  risk: "risk",
  comparison: "comparison",
  selection: "selection",
  continuation: "direction",
  termination: "direction",
  // Preserve Reader prediction; do not collapse to possibility.
  prediction: "prediction",
  existence: "existence",
  generalJudgement: "general",
};

function mapUrgency(
  urgency: QuestionUrgency,
): QuestionTimeFocus["urgency"] {
  if (urgency === "unknown") {
    return "unspecified";
  }

  return urgency;
}

function mapTimingType(
  timingType: QuestionTimingType,
): QuestionTimeFocus["timingType"] {
  if (timingType === "unknown") {
    return "unspecified";
  }

  return timingType;
}

function resolveDomain(
  topic: QuestionTopic,
  analysisMode: QuestionAnalysisMode,
  normalizedQuestion: string,
): QuestionDomain {
  const topicDomain = TOPIC_TO_DOMAIN[topic];

  // analysisMode is an analysis method, not a signal to erase a clear Reader topic.
  // Preserve TOPIC_TO_DOMAIN for concrete topics (business/career/marriage/…).
  // Keep compatibility domain only for the existing relationship/general 궁합 contract.
  const mayUseCompatibilityDomain =
    topicDomain === "relationship" || topicDomain === "general";

  if (
    mayUseCompatibilityDomain
    && (
      analysisMode === "compatibility"
      || /궁합|합이\s*맞/.test(normalizedQuestion)
    )
  ) {
    return "compatibility";
  }

  return topicDomain;
}

function resolveEvent(
  input: QuestionMeaningAdapterInput,
): string | null {
  const candidate =
    input.asksWhat
    || input.decisionQuestion
    || input.normalizedQuestion;

  return candidate.trim() || null;
}

/**
 * 기존 consumer 호환용 object.
 * label=decisionTarget / category=topic 혼합 표현을 유지한다.
 * 분리된 축은 actionNature / askedObject를 사용한다.
 */
function resolveObject(
  input: QuestionMeaningAdapterInput,
): QuestionObject | null {
  if (input.decisionTarget === "none") {
    return null;
  }

  return {
    label: input.objectLabel ?? input.decisionTarget,
    category: input.topic,
    description: input.decisionQuestion || undefined,
  };
}

function buildMissingContext(
  input: QuestionMeaningAdapterInput,
): MissingContextItem[] {
  const items: MissingContextItem[] = [];

  // Existing compatibility missingContext gate — keep intact.
  if (input.analysisMode === "compatibility") {
    const counterpart = input.counterpartFacts;

    if (!counterpart.birthDate) {
      items.push({
        key: "counterpartBirthDate",
        description: "상대방 생년월일",
        required: true,
      });
    }

    if (
      input.analysisScope === "fullSaju"
      && !counterpart.birthTime
    ) {
      items.push({
        key: "counterpartBirthTime",
        description: "상대방 출생 시간",
        required: false,
      });
    }

    if (!counterpart.gender) {
      items.push({
        key: "counterpartGender",
        description: "상대방 성별",
        required: false,
      });
    }

    if (
      input.analysisScope === "zodiac"
      && !counterpart.zodiac
      && !counterpart.birthDate
    ) {
      items.push({
        key: "counterpartZodiac",
        description: "상대방 띠 또는 출생 정보",
        required: true,
      });
    }

    return items;
  }

  // switch → missing birthDate: enter existing clarification path.
  // Do not force when the new counterpart already has birthDate.
  if (
    input.counterpartContinuity === "switch"
    && !input.counterpartFacts?.birthDate
  ) {
    items.push({
      key: "counterpartBirthDate",
      description: "상대방 생년월일",
      required: true,
    });
  }

  return items;
}

function buildPeriodIdentity(
  lifeFlowTarget: LifeFlowTarget | null | undefined,
): QuestionTimePeriodIdentity | undefined {
  if (!lifeFlowTarget) {
    return undefined;
  }

  const periodKey = buildPeriodKey(lifeFlowTarget);

  return {
    granularity: lifeFlowTarget.scope,
    periodKey,
    year: lifeFlowTarget.targetYear,
    month: lifeFlowTarget.targetMonth,
    day: lifeFlowTarget.targetDay,
    half: lifeFlowTarget.half,
    start: lifeFlowTarget.startDate,
    end: lifeFlowTarget.endDate,
  };
}

function buildPeriodKey(
  lifeFlowTarget: LifeFlowTarget,
): string | undefined {
  const {
    scope,
    targetYear,
    targetMonth,
    targetDay,
    half,
  } = lifeFlowTarget;

  if (scope === "day" && targetYear != null && targetMonth != null && targetDay != null) {
    return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
  }

  if (scope === "month" && targetYear != null && targetMonth != null) {
    return `${targetYear}-${String(targetMonth).padStart(2, "0")}`;
  }

  if (scope === "halfYear" && targetYear != null && half) {
    return `${targetYear}-${half}`;
  }

  if (scope === "year" && targetYear != null) {
    return String(targetYear);
  }

  if (scope === "overall") {
    return "overall";
  }

  return undefined;
}

function buildTimeFocus(
  input: QuestionMeaningAdapterInput,
): QuestionTimeFocus {
  const description =
    input.normalizedQuestion.includes("월")
      ? input.normalizedQuestion
      : undefined;

  const period = buildPeriodIdentity(input.lifeFlowTarget);

  return {
    urgency: mapUrgency(input.urgency),
    timingType: mapTimingType(input.timingType),
    description,
    ...(period ? { period } : {}),
  };
}

function buildCounterpart(
  input: QuestionMeaningAdapterInput,
): QuestionMeaningCounterpart {
  const facts = input.counterpartFacts;
  const hasIdentity = Boolean(
    facts.birthDate
    || facts.birthTime
    || facts.calendarType
    || facts.gender,
  );
  const exists = Boolean(
    hasIdentity
    || facts.relationship
    || facts.zodiac,
  );

  return {
    exists,
    relation: facts.relationship,
    ...(hasIdentity
      ? {
        identity: {
          birthDate: facts.birthDate,
          birthTime: facts.birthTime,
          calendarType: facts.calendarType,
          gender: facts.gender,
        },
      }
      : {}),
  };
}

function buildQuestionRef(
  input: QuestionMeaningAdapterInput,
): QuestionMeaningRef {
  const effectiveQuestion =
    input.effectiveQuestion?.trim()
    || input.normalizedQuestion
    || undefined;

  const sourceTurnId =
    input.sourceTurnId?.trim()
    || undefined;

  return {
    originalQuestion: input.originalQuestion,
    ...(effectiveQuestion
      ? { effectiveQuestion }
      : {}),
    ...(sourceTurnId
      ? { sourceTurnId }
      : {}),
  };
}

/**
 * 기존 QuestionReaderResult를 vNext QuestionMeaning으로 읽기 전용 변환한다.
 * Reader 값이 있으면 보존하고, 없으면 추론하지 않는다.
 */
export function adaptQuestionMeaning(
  input: QuestionMeaningAdapterInput,
): QuestionMeaning {
  const baseDomain = resolveDomain(
    input.topic,
    input.analysisMode,
    input.normalizedQuestion,
  );

  const domain = refineDomainFromQuestionText(
    baseDomain,
    input.normalizedQuestion,
  );

  return {
    domain,
    event: resolveEvent(input),
    intent: resolveIntent(input),
    time: buildTimeFocus(input),
    object: resolveObject(input),
    missingContext: buildMissingContext(input),
    actionNature: input.decisionTarget,
    askedObject: input.topic,
    analysisMode: input.analysisMode,
    conclusionNature: input.conclusionNature,
    counterpart: buildCounterpart(input),
    questionRef: buildQuestionRef(input),
  };
}
