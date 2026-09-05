/**
 * vNext Follow-up Question Resolver.
 *
 * 새 질문과 이전 Conversation Context를 비교해 질문 변화 유형만 판단한다.
 * 사주 판단을 하지 않으며, Question Reader는 read-only로 선택적 활용한다.
 */

import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext.js";
import {
  readQuestion,
  type QuestionReaderResult,
} from "../../consulting/question/questionReader.js";
import type {
  LifeFlowTarget,
} from "../../consulting/question/lifeFlowTarget.js";
import {
  resolveLifeFlowTarget,
} from "../../consulting/question/lifeFlowTargetResolver.js";
import type {
  QuestionMeaning,
} from "../types/questionMeaning.js";
import type {
  ConversationContextMetadata,
} from "./conversationTypes.js";
import type {
  ConversationTurn,
} from "./conversationTurn.js";

export type FollowUpQuestionType =
  | "continuation"
  | "clarificationAnswer"
  | "timeRefinement"
  | "scenarioRefinement"
  | "newQuestion";

export type FollowUpQuestionResolution = {
  type: FollowUpQuestionType;
  reason: string;
  /** Question Reader read-only 스냅샷 — domain 비교에만 사용 */
  questionReaderResult: QuestionReaderResult | null;
};

export type FollowUpQuestionResolverInput = {
  newQuestion: string;
  previousTurn: ConversationTurn | null;
  contextMetadata: ConversationContextMetadata;
  /** domain 비교용 — 없으면 휴리스틱만 사용 */
  humanContext?: HumanDestinyContext | null;
};

const CONTINUATION_PATTERN =
  /^(조금\s*)?(더\s*)?(자세히|설명|말해|알려|풀어|구체적)/;

const TIME_REFINEMENT_PATTERN =
  /(?:그러면|그럼|만약)?\s*(?:\d{1,4}년?\s*)?(?:\d{1,2}월|월\s*초|월\s*중|월\s*말|중순|초순|말순|상순|하순|상반기|하반기|\d{1,2}일|\d{1,2}월)/;

const SCENARIO_REFINEMENT_PATTERN =
  /(?:작게|크게|적게|많이|줄이|늘리|다르게|만약|~면|하면|경우|규모|규모를|방식|조건)/;

const CLARIFICATION_ANSWER_PATTERN =
  /^(?:유|무|갑|을|병|정|무|기|경|신|임|계)(?:시|술|해|자|축|인|묘|진|사|오|미|申|酉|戌|亥)?(?:입니다|이에요|예요|이요|요)?\.?$/;

const BIRTH_TIME_PATTERN =
  /(?:유|무|갑|을|병|정|무|기|경|신|임|계)(?:시|술|해|자|축|인|묘|진|사|오|미|申|酉|戌|亥)?(?:\s*(?:출생|태어난|생)?\s*시간)?/;

function normalizeForMatch(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function isContinuationQuestion(normalizedQuestion: string): boolean {
  if (CONTINUATION_PATTERN.test(normalizedQuestion)) {
    return true;
  }

  return /조금\s*더|더\s*자세|좀\s*더\s*말|이어서|계속\s*말/.test(
    normalizedQuestion,
  );
}

function isTimeRefinementQuestion(
  normalizedQuestion: string,
  previousQuestionMeaning: QuestionMeaning | null,
): boolean {
  if (!TIME_REFINEMENT_PATTERN.test(normalizedQuestion)) {
    return false;
  }

  if (previousQuestionMeaning?.intent === "timing") {
    return true;
  }

  if (
    previousQuestionMeaning?.time.urgency !== "unspecified"
    || previousQuestionMeaning?.time.timingType !== "unspecified"
  ) {
    return true;
  }

  return /월|일|년|중순|초|말|시기|때|언제/.test(normalizedQuestion);
}

function isScenarioRefinementQuestion(
  normalizedQuestion: string,
  previousQuestionMeaning: QuestionMeaning | null,
): boolean {
  if (!SCENARIO_REFINEMENT_PATTERN.test(normalizedQuestion)) {
    return false;
  }

  if (previousQuestionMeaning?.domain) {
    return true;
  }

  return /하면|경우|만약|규모|작게|크게/.test(normalizedQuestion);
}

function isClarificationAnswer(
  normalizedQuestion: string,
  contextMetadata: ConversationContextMetadata,
): boolean {
  if (!contextMetadata.awaitingClarification) {
    return false;
  }

  if (CLARIFICATION_ANSWER_PATTERN.test(normalizedQuestion)) {
    return true;
  }

  if (BIRTH_TIME_PATTERN.test(normalizedQuestion)) {
    return true;
  }

  if (
    contextMetadata.pendingMissingContextKeys.length > 0
    && normalizedQuestion.length <= 30
  ) {
    return true;
  }

  return false;
}

function isNewQuestionByDomain(
  newReaderResult: QuestionReaderResult,
  previousQuestionMeaning: QuestionMeaning | null,
): boolean {
  if (!previousQuestionMeaning) {
    return false;
  }

  const previousDomain = previousQuestionMeaning.domain;
  const newTopic = newReaderResult.topic;

  const topicToDomain: Record<string, string> = {
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

  const newDomain = topicToDomain[newTopic] ?? "general";

  if (
    previousDomain === "general"
    && newDomain !== "general"
  ) {
    return true;
  }

  if (newDomain === "general" || previousDomain === "general") {
    return false;
  }

  return newDomain !== previousDomain;
}

function readQuestionReadOnly(
  humanContext: HumanDestinyContext | null | undefined,
  question: string,
): QuestionReaderResult | null {
  if (!humanContext) {
    return null;
  }

  try {
    return readQuestion(humanContext, question);
  } catch {
    return null;
  }
}

function hasDecisionFrameShift(
  current: QuestionReaderResult,
  previous: QuestionReaderResult,
  normalizedQuestion: string,
): boolean {
  const continuesExplicitDecisionFrame =
    previous.decisionTarget !== "none"
    && current.decisionTarget === "none"
    && /^(?:그(?:럼|러면)|그러면)/.test(normalizedQuestion);

  if (continuesExplicitDecisionFrame) {
    return false;
  }

  if (current.analysisMode !== previous.analysisMode) {
    if (
      current.decisionTarget !== "none"
      && current.decisionTarget === previous.decisionTarget
    ) {
      return false;
    }

    return true;
  }

  if (
    current.decisionTarget !== "none"
    && previous.decisionTarget !== "none"
    && current.decisionTarget !== previous.decisionTarget
  ) {
    return true;
  }

  const currentDecision = current.decisionQuestion.trim();
  const previousDecision = previous.decisionQuestion.trim();

  if (
    currentDecision
    && previousDecision
    && currentDecision !== previousDecision
    && current.decisionTarget === "none"
    && previous.decisionTarget === "none"
  ) {
    return true;
  }

  return false;
}

function isSameDecisionFrameScenarioRefinement(
  normalizedQuestion: string,
  current: QuestionReaderResult,
  previous: QuestionReaderResult,
  previousQuestionMeaning: QuestionMeaning | null,
): boolean {
  if (hasDecisionFrameShift(current, previous, normalizedQuestion)) {
    return false;
  }

  if (current.intent !== previous.intent) {
    return true;
  }

  if (
    isScenarioRefinementQuestion(
      normalizedQuestion,
      previousQuestionMeaning,
    )
  ) {
    return true;
  }

  if (/^(?:그(?:럼|러면)|그러면)/.test(normalizedQuestion)) {
    return true;
  }

  return false;
}

function toReferenceDateIso(value: string): string | null {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1] : null;
}

function tryResolveLifeFlowTarget(
  question: string,
  referenceDateIso: string,
): LifeFlowTarget | null {
  try {
    return resolveLifeFlowTarget(question, referenceDateIso);
  } catch {
    return null;
  }
}

/** 질문 문자열이 아니라 LifeFlowTarget의 구조화된 기간 필드로 명시적 시간 의미 여부를 본다. */
function hasExplicitLifeFlowTime(target: LifeFlowTarget): boolean {
  return (
    target.scope === "year"
    || target.scope === "halfYear"
    || target.scope === "month"
    || target.scope === "day"
    || target.targetYear !== null
    || target.targetMonth !== null
    || target.targetDay !== null
    || target.half !== null
  );
}

function lifeFlowTimeMeaningSignature(target: LifeFlowTarget): string {
  return [
    target.scope,
    String(target.targetYear),
    String(target.targetMonth),
    String(target.targetDay),
    String(target.half),
    target.startDate,
    target.endDate,
  ].join("|");
}

/**
 * 이전/현재 질문의 LifeFlowTarget 시간 의미가 달라졌는지 판단한다.
 * 현재 질문에 명시적 시간 구조가 있을 때만 비교한다.
 * (시간 없는 continuation 문구는 false — 기존 continuation 유지)
 */
function hasStructuredTimeMeaningShift(
  currentQuestion: string,
  previousQuestion: string,
  referenceDateIso: string,
): boolean {
  const current = tryResolveLifeFlowTarget(
    currentQuestion,
    referenceDateIso,
  );

  if (!current || !hasExplicitLifeFlowTime(current)) {
    return false;
  }

  const previous = tryResolveLifeFlowTarget(
    previousQuestion,
    referenceDateIso,
  );

  if (!previous || !hasExplicitLifeFlowTime(previous)) {
    return true;
  }

  return (
    lifeFlowTimeMeaningSignature(current)
    !== lifeFlowTimeMeaningSignature(previous)
  );
}

function hasContinuationEvidence(
  normalizedQuestion: string,
  current: QuestionReaderResult | null,
  previous: QuestionReaderResult | null,
  previousQuestion: string | null,
  referenceDateIso: string | null,
): boolean {
  if (
    previousQuestion
    && referenceDateIso
    && hasStructuredTimeMeaningShift(
      normalizedQuestion,
      previousQuestion,
      referenceDateIso,
    )
  ) {
    return false;
  }

  if (
    /^(?:그(?:럼|러면|거)|그(?:\s*사람|\s*분)|그것|이것|저것|거기|또\s|왜\s|어떻게\s)/.test(
      normalizedQuestion,
    )
  ) {
    return true;
  }

  if (current && previous && !hasDecisionFrameShift(current, previous, normalizedQuestion)) {
    return (
      current.topic === previous.topic
      && current.intent === previous.intent
    );
  }

  return false;
}

/**
 * 새 질문의 follow-up 유형을 판단한다.
 *
 * 우선순위: clarificationAnswer → continuation → timeRefinement
 * → newQuestion(domain) → newQuestion(frame shift)
 * → scenarioRefinement(same frame) → continuation fallback(evidence) → newQuestion
 */
export function resolveFollowUpQuestionType(
  input: FollowUpQuestionResolverInput,
): FollowUpQuestionResolution {
  const normalizedQuestion = normalizeForMatch(input.newQuestion);
  const previousQuestionMeaning =
    input.previousTurn?.questionMeaning ?? null;
  const previousQuestionText = input.previousTurn
    ? normalizeForMatch(input.previousTurn.question)
    : null;
  const referenceDateIso = input.previousTurn
    ? toReferenceDateIso(input.previousTurn.createdAt)
      ?? toReferenceDateIso(input.contextMetadata.updatedAt)
      ?? toReferenceDateIso(input.contextMetadata.createdAt)
    : null;

  if (!normalizedQuestion) {
    return {
      type: "newQuestion",
      reason: "empty question treated as new question",
      questionReaderResult: null,
    };
  }

  if (
    isClarificationAnswer(
      normalizedQuestion,
      input.contextMetadata,
    )
  ) {
    return {
      type: "clarificationAnswer",
      reason: "awaiting clarification with short factual answer",
      questionReaderResult: readQuestionReadOnly(
        input.humanContext,
        input.newQuestion,
      ),
    };
  }

  if (isContinuationQuestion(normalizedQuestion)) {
    return {
      type: "continuation",
      reason: "continuation phrase detected",
      questionReaderResult: readQuestionReadOnly(
        input.humanContext,
        input.newQuestion,
      ),
    };
  }

  if (
    isTimeRefinementQuestion(
      normalizedQuestion,
      previousQuestionMeaning,
    )
  ) {
    return {
      type: "timeRefinement",
      reason: "time period refinement detected",
      questionReaderResult: readQuestionReadOnly(
        input.humanContext,
        input.newQuestion,
      ),
    };
  }

  if (
    previousQuestionText
    && referenceDateIso
    && hasStructuredTimeMeaningShift(
      normalizedQuestion,
      previousQuestionText,
      referenceDateIso,
    )
  ) {
    return {
      type: "timeRefinement",
      reason: "structured time meaning shift via LifeFlowTarget",
      questionReaderResult: readQuestionReadOnly(
        input.humanContext,
        input.newQuestion,
      ),
    };
  }

  const questionReaderResult = readQuestionReadOnly(
    input.humanContext,
    input.newQuestion,
  );

  const previousReaderResult =
    input.previousTurn && input.humanContext
      ? readQuestionReadOnly(
          input.humanContext,
          input.previousTurn.question,
        )
      : null;

  if (
    questionReaderResult
    && isNewQuestionByDomain(
      questionReaderResult,
      previousQuestionMeaning,
    )
  ) {
    return {
      type: "newQuestion",
      reason: "domain shift detected via Question Reader",
      questionReaderResult,
    };
  }

  if (
    questionReaderResult
    && previousReaderResult
    && hasDecisionFrameShift(
      questionReaderResult,
      previousReaderResult,
      normalizedQuestion,
    )
  ) {
    return {
      type: "newQuestion",
      reason: "decision frame shift detected via Question Reader",
      questionReaderResult,
    };
  }

  if (
    questionReaderResult
    && previousReaderResult
    && isSameDecisionFrameScenarioRefinement(
      normalizedQuestion,
      questionReaderResult,
      previousReaderResult,
      previousQuestionMeaning,
    )
  ) {
    return {
      type: "scenarioRefinement",
      reason: "scenario refinement within same decision frame",
      questionReaderResult,
    };
  }

  if (
    input.previousTurn
    && hasContinuationEvidence(
      normalizedQuestion,
      questionReaderResult,
      previousReaderResult,
      previousQuestionText,
      referenceDateIso,
    )
  ) {
    return {
      type: "continuation",
      reason: "follow-up within same session without meaning shift",
      questionReaderResult,
    };
  }

  if (input.previousTurn) {
    return {
      type: "newQuestion",
      reason: "no continuation evidence — treated as new question",
      questionReaderResult,
    };
  }

  return {
    type: "newQuestion",
    reason: "no previous turn — treated as new question",
    questionReaderResult,
  };
}
