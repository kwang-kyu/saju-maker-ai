/**
 * Question Meaning Adapter — taxonomy projection boundary.
 *
 * Model B QuestionIntent (speech-act)
 *   → QuestionMeaningIntent (vNext scenario-routing taxonomy)
 *
 * Reader axes를 QuestionMeaning으로 투영한다. 두 Intent taxonomy를 병합하지 않으며
 * 새 판단을 만들지 않는다.
 */

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
  | "objectReferent"
  | "urgency"
  | "timingType"
  | "analysisMode"
  | "analysisScope"
  | "counterpartFacts"
  | "asksWhat"
  | "decisionQuestion"
  | "conclusionNature"
  | "prioritySurface"
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
  lifeDirection: "life",
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
  // Former continuation/termination speech-acts map to evaluation;
  // action meaning is recovered from DecisionTarget.
  if (input.intent === "evaluation") {
    if (
      input.decisionTarget === "continue"
      || input.decisionTarget === "stop"
      || input.decisionTarget === "leaveJob"
      || input.decisionTarget === "separate"
      || input.decisionTarget === "sell"
    ) {
      return "direction";
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

/** QuestionIntent (speech-act) → QuestionMeaningIntent (scenario-routing) projection. */
const INTENT_TO_MEANING: Record<
  QuestionIntent,
  QuestionMeaningIntent
> = {
  permission: "possibility",
  timing: "timing",
  reason: "reason",
  method: "method",
  risk: "risk",
  comparison: "comparison",
  selection: "selection",
  // Preserve Reader prediction; do not collapse to possibility.
  prediction: "prediction",
  existence: "existence",
  evaluation: "general",
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
 * label은 objectLabel만 사용하고, 없으면 "". category=topic 혼합 표현을 유지한다.
 * 분리된 축은 actionNature / askedObject를 사용한다.
 */
function resolveObject(
  input: QuestionMeaningAdapterInput,
): QuestionObject | null {
  if (input.decisionTarget === "none") {
    return null;
  }

  return {
    label: input.objectLabel ?? "",
    category: input.topic,
    description: input.decisionQuestion || undefined,
  };
}

/**
 * UQ-3: open zodiac recommendation ask.
 * Reader local helpers와 같은 Fit+Class 조합만 본다. export/새 축 없음.
 */
function isOpenZodiacRecommendationAsk(
  question: string,
): boolean {
  const asksZodiacClass =
    /(?:무슨|어떤)\s*띠/.test(question)
    || /(?:맞는|좋은)\s*띠/.test(question)
    || /띠를\s*(?:알려|추천)/.test(question)
    || /띠\s*(?:알려|추천)/.test(question)
    || /(?:여자|여성|남자|남성)?\s*띠는\b/.test(question)
    || /(?:의\s*)?띠는\?/.test(question)
    || /띠는\s*\?/.test(question);

  if (!asksZodiacClass) {
    return false;
  }

  if (/(?:나에게|내게)\s*(?:어울|맞)/.test(question)) {
    return false;
  }

  return (
    /궁합|합이\s*맞/.test(question)
    || /잘\s*맞|어울/.test(question)
    || /맞/.test(question)
  );
}

/**
 * Pair-compatibility signal from existing Reader fields only.
 * marry DecisionTarget alone is not pair; relationship / referent is.
 */
function hasPairCounterpartSignal(
  input: QuestionMeaningAdapterInput,
): boolean {
  const facts = input.counterpartFacts;

  if (facts.relationship) {
    return true;
  }

  const referent = facts.counterpartReferent;
  return referent === "same" || referent === "different";
}

function buildMissingContext(
  input: QuestionMeaningAdapterInput,
): MissingContextItem[] {
  const items: MissingContextItem[] = [];

  // Compatibility analysis keeps the counterpart birth contract.
  // marry requires counterpart birth only when pair semantic is present.
  // Self-permission marry (no pair signal) must not short-circuit to clarification.
  const requiresCounterpartBirthContract =
    input.analysisMode === "compatibility"
    || (
      input.decisionTarget === "marry"
      && hasPairCounterpartSignal(input)
    );

  if (requiresCounterpartBirthContract) {
    const counterpart = input.counterpartFacts;

    // Zodiac-only gate: skip birthDate/calendar/gender required items.
    // Non-zodiac compatibility / marry birth contract stays unchanged below.
    if (input.analysisScope !== "zodiac") {
      if (!counterpart.birthDate) {
        items.push({
          key: "counterpartBirthDate",
          description: "상대방 생년월일",
          required: true,
        });
      }

      if (!counterpart.calendarType) {
        items.push({
          key: "counterpartCalendarType",
          description: "상대방 양력/음력",
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
          required: true,
        });
      }
    }

    // UQ-3: open (+ self-anchored) zodiac recommendation은
    // counterpartZodiac을 요구하지 않는다.
    // 특정 상대 pair에서 concrete counterpart zodiac이 없으면 기존 요구 유지.
    const openZodiacRecommendation = isOpenZodiacRecommendationAsk(
      input.normalizedQuestion || input.originalQuestion,
    );

    if (
      input.analysisScope === "zodiac"
      && !counterpart.zodiac
      && !counterpart.birthDate
      && !openZodiacRecommendation
    ) {
      items.push({
        key: "counterpartZodiac",
        description: "상대방 띠 또는 출생 정보",
        required: true,
      });
    }

    return items;
  }

  // switch → missing birth-data: enter existing clarification path.
  // Align with compatibility birth-data contract
  // (birthDate + calendarType + gender required; birthTime optional).
  // clarificationAnswer turns may drop continuity==="switch" after the
  // initial switch turn; keep the same contract while birthDate is present
  // but calendarType/gender are still incomplete.
  const counterpart = input.counterpartFacts;
  const requiresSwitchBirthDataContract =
    input.counterpartContinuity === "switch"
    || (
      Boolean(counterpart?.birthDate)
      && (
        !counterpart?.calendarType
        || !counterpart?.gender
      )
    );

  if (requiresSwitchBirthDataContract) {
    if (!counterpart?.birthDate) {
      items.push({
        key: "counterpartBirthDate",
        description: "상대방 생년월일",
        required: true,
      });
    }

    if (!counterpart?.calendarType) {
      items.push({
        key: "counterpartCalendarType",
        description: "상대방 양력/음력",
        required: true,
      });
    }

    if (!counterpart?.gender) {
      items.push({
        key: "counterpartGender",
        description: "상대방 성별",
        required: true,
      });
    }
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

/** Existing business generic nouns — exact match only. */
const BUSINESS_GENERIC_NOUNS = new Set<string>([
  "사업",
  "창업",
  "장사",
  "가게",
  "개업",
  "매장",
  "자영업",
  "프랜차이즈",
]);

/** Existing business specific nouns — exact match only. */
const BUSINESS_SPECIFIC_NOUNS = new Set<string>([
  "식당",
  "카페",
  "치킨",
  "통닭",
]);

/**
 * Resolve objectIdentity.specificity from objectLabel.
 * Exact equality only — no includes / substring matching.
 */
function resolveObjectSpecificity(
  objectLabel: string | null | undefined,
): "generic" | "specific" | "unknown" {
  if (!objectLabel) {
    return "unknown";
  }

  if (BUSINESS_GENERIC_NOUNS.has(objectLabel)) {
    return "generic";
  }

  if (BUSINESS_SPECIFIC_NOUNS.has(objectLabel)) {
    return "specific";
  }

  return "unknown";
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
    objectIdentity: {
      family: input.topic,
      specificity: resolveObjectSpecificity(input.objectLabel),
      surface: input.objectLabel ?? "",
      referentKind: input.objectReferent,
    },
    missingContext: buildMissingContext(input),
    actionNature: input.decisionTarget,
    askedObject: input.topic,
    analysisMode: input.analysisMode,
    // Reader analysisScope passthrough — 새 축이 아니다.
    analysisScope: input.analysisScope,
    conclusionNature: input.conclusionNature,
    counterpart: buildCounterpart(input),
    questionRef: buildQuestionRef(input),
    // P6-C: expression-only passthrough. Adapter does not judge priority.
    ...(input.prioritySurface === true
      ? { prioritySurface: true as const }
      : {}),
  };
}
