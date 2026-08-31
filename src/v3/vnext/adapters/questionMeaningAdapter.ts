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
  MissingContextItem,
  QuestionDomain,
  QuestionMeaning,
  QuestionMeaningIntent,
  QuestionObject,
  QuestionTimeFocus,
} from "../types/questionMeaning.js";

export type QuestionMeaningAdapterInput = Pick<
  QuestionReaderResult,
  | "originalQuestion"
  | "normalizedQuestion"
  | "topic"
  | "intent"
  | "decisionTarget"
  | "urgency"
  | "timingType"
  | "analysisMode"
  | "analysisScope"
  | "counterpartFacts"
  | "asksWhat"
  | "decisionQuestion"
  | "conclusionNature"
>;

const TOPIC_TO_DOMAIN: Record<
  QuestionTopic,
  QuestionDomain
> = {
  business: "business",
  money: "money",
  job: "career",
  realEstate: "money",
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
  if (/금전|재물운|재물|수입|매출|돈/.test(normalizedQuestion)) {
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
  const conclusionIntent = mapConclusionNatureToIntent(
    input.conclusionNature,
  );

  if (conclusionIntent) {
    return conclusionIntent;
  }

  if (/있을까|있나요|있을지|있을\s*수/.test(input.normalizedQuestion)) {
    return "existence";
  }

  if (/어떨까|해도\s*될까|가능할까/.test(input.normalizedQuestion)) {
    return "possibility";
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
      return "possibility";
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
  prediction: "possibility",
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
  if (analysisMode === "compatibility") {
    return "compatibility";
  }

  if (/궁합|합이\s*맞/.test(normalizedQuestion)) {
    return "compatibility";
  }

  return TOPIC_TO_DOMAIN[topic];
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

function resolveObject(
  input: QuestionMeaningAdapterInput,
): QuestionObject | null {
  if (input.decisionTarget === "none") {
    return null;
  }

  return {
    label: input.decisionTarget,
    category: input.topic,
    description: input.decisionQuestion || undefined,
  };
}

function buildMissingContext(
  input: QuestionMeaningAdapterInput,
): MissingContextItem[] {
  const items: MissingContextItem[] = [];

  if (input.analysisMode !== "compatibility") {
    return items;
  }

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

function buildTimeFocus(
  input: QuestionMeaningAdapterInput,
): QuestionTimeFocus {
  const description =
    input.normalizedQuestion.includes("월")
      ? input.normalizedQuestion
      : undefined;

  return {
    urgency: mapUrgency(input.urgency),
    timingType: mapTimingType(input.timingType),
    description,
  };
}

/**
 * 기존 QuestionReaderResult를 vNext QuestionMeaning으로 읽기 전용 변환한다.
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
  };
}
