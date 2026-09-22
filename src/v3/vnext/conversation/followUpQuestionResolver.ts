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
  type QuestionCounterpartFacts,
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

/**
 * 이전 세션 상대 대비 현재 질문의 상대 연속/전환 축.
 * FollowUpQuestionType과 직교한다.
 */
export type CounterpartContinuitySignal =
  | "continuity"
  | "switch"
  | "unknown";

export type FollowUpQuestionResolution = {
  type: FollowUpQuestionType;
  reason: string;
  /** Question Reader read-only 스냅샷 — domain 비교에만 사용 */
  questionReaderResult: QuestionReaderResult | null;
  /** 이전 상대 유지/전환 — FollowUpQuestionType과 독립 */
  counterpartContinuity: CounterpartContinuitySignal;
};

export type FollowUpQuestionResolverInput = {
  newQuestion: string;
  previousTurn: ConversationTurn | null;
  contextMetadata: ConversationContextMetadata;
  /** domain 비교용 — 없으면 휴리스틱만 사용 */
  humanContext?: HumanDestinyContext | null;
  /**
   * merge 이전 세션 counterpart.
   * 미지정 시 contextMetadata.counterpartFacts 사용.
   * merged facts를 넘기지 않는다.
   */
  previousCounterpartFacts?: QuestionCounterpartFacts | null;
  /**
   * 현재 질문 raw counterpart (merge 전).
   * 있으면 continuity 판정에 재사용한다.
   */
  currentCounterpartFacts?: QuestionCounterpartFacts | null;
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

/**
 * BIRTH_TIME_PATTERN 부분일치·short-answer fallback이
 * 명백한 질문형 입력까지 clarificationAnswer로 확정하지 않도록 하는 post-guard.
 * factual short answer("유시입니다." 등)는 통과시킨다.
 */
function isObviousQuestionForm(normalizedQuestion: string): boolean {
  if (/[?？]/.test(normalizedQuestion)) {
    return true;
  }

  return /(?:나요|까요|가요|습니까)\s*\.?$/.test(normalizedQuestion);
}

function isClarificationAnswer(
  normalizedQuestion: string,
  contextMetadata: ConversationContextMetadata,
): boolean {
  if (!contextMetadata.awaitingClarification) {
    return false;
  }

  if (CLARIFICATION_ANSWER_PATTERN.test(normalizedQuestion)) {
    return !isObviousQuestionForm(normalizedQuestion);
  }

  if (BIRTH_TIME_PATTERN.test(normalizedQuestion)) {
    return !isObviousQuestionForm(normalizedQuestion);
  }

  if (
    contextMetadata.pendingMissingContextKeys.length > 0
    && normalizedQuestion.length <= 30
  ) {
    return !isObviousQuestionForm(normalizedQuestion);
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

function hasStoredCounterpartFacts(
  facts: QuestionCounterpartFacts | null | undefined,
): facts is QuestionCounterpartFacts {
  if (!facts) {
    return false;
  }

  return Boolean(
    facts.birthDate
    || facts.birthTime
    || facts.calendarType
    || facts.gender
    || facts.zodiac
    || facts.relationship,
  );
}

function normalizeCounterpartIdentityAxis(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

/** Soft: 양쪽 identity 축이 모두 있을 때만 불일치. */
function counterpartIdentityAxesDiffer(
  current: QuestionCounterpartFacts,
  previous: QuestionCounterpartFacts,
): boolean {
  const axes: Array<keyof Pick<
    QuestionCounterpartFacts,
    "birthDate" | "birthTime" | "calendarType" | "gender"
  >> = ["birthDate", "calendarType", "gender", "birthTime"];

  return axes.some((axis) => {
    const left = normalizeCounterpartIdentityAxis(current[axis]);
    const right = normalizeCounterpartIdentityAxis(previous[axis]);
    return left !== null && right !== null && left !== right;
  });
}

function hasCounterpartIdentityAxes(
  facts: QuestionCounterpartFacts,
): boolean {
  return Boolean(
    normalizeCounterpartIdentityAxis(facts.birthDate)
    || normalizeCounterpartIdentityAxis(facts.birthTime)
    || normalizeCounterpartIdentityAxis(facts.calendarType)
    || normalizeCounterpartIdentityAxis(facts.gender),
  );
}

/**
 * 기존 continuation evidence 중 "이전 상대를 지시"하는 구조만 재사용.
 * topic/intent 동일만으로는 counterpart continuity로 보지 않는다.
 */
function indicatesSameCounterpartContinuation(
  normalizedQuestion: string,
  currentFacts: QuestionCounterpartFacts | null | undefined,
): boolean {
  if (
    /(?:그(?:\s*사람|\s*분)|이(?:\s*사람|\s*분))/.test(normalizedQuestion)
  ) {
    return true;
  }

  const relationship = currentFacts?.relationship?.trim() ?? "";
  if (/^(?:그|이)\s*사람$/.test(relationship)) {
    return true;
  }

  return false;
}

function resolveCounterpartContinuitySignal(params: {
  previousCounterpartFacts: QuestionCounterpartFacts | null | undefined;
  currentCounterpartFacts: QuestionCounterpartFacts | null | undefined;
  indicatesSameCounterpart: boolean;
}): CounterpartContinuitySignal {
  const previous = params.previousCounterpartFacts;

  if (!hasStoredCounterpartFacts(previous)) {
    return "unknown";
  }

  const current = params.currentCounterpartFacts;
  const identityMismatch = Boolean(
    current
    && hasCounterpartIdentityAxes(current)
    && counterpartIdentityAxesDiffer(current, previous),
  );

  if (identityMismatch) {
    return "switch";
  }

  // Reader referent: different → switch (unspecified는 switch로 취급하지 않음)
  if (current?.counterpartReferent === "different") {
    return "switch";
  }

  if (params.indicatesSameCounterpart) {
    return "continuity";
  }

  if (current?.counterpartReferent === "same") {
    return "continuity";
  }

  return "unknown";
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
  const previousCounterpartFacts =
    input.previousCounterpartFacts
    ?? input.contextMetadata.counterpartFacts
    ?? null;

  const resolveContinuity = (
    currentFacts: QuestionCounterpartFacts | null | undefined,
    indicatesSameCounterpart: boolean,
  ): CounterpartContinuitySignal =>
    resolveCounterpartContinuitySignal({
      previousCounterpartFacts,
      currentCounterpartFacts:
        currentFacts
        ?? input.currentCounterpartFacts
        ?? null,
      indicatesSameCounterpart,
    });

  if (!normalizedQuestion) {
    return {
      type: "newQuestion",
      reason: "empty question treated as new question",
      questionReaderResult: null,
      counterpartContinuity: resolveContinuity(
        input.currentCounterpartFacts,
        false,
      ),
    };
  }

  if (
    isClarificationAnswer(
      normalizedQuestion,
      input.contextMetadata,
    )
  ) {
    const questionReaderResult = readQuestionReadOnly(
      input.humanContext,
      input.newQuestion,
    );

    return {
      type: "clarificationAnswer",
      reason: "awaiting clarification with short factual answer",
      questionReaderResult,
      counterpartContinuity: resolveContinuity(
        questionReaderResult?.counterpartFacts
          ?? input.currentCounterpartFacts,
        true,
      ),
    };
  }

  if (isContinuationQuestion(normalizedQuestion)) {
    const questionReaderResult = readQuestionReadOnly(
      input.humanContext,
      input.newQuestion,
    );

    return {
      type: "continuation",
      reason: "continuation phrase detected",
      questionReaderResult,
      counterpartContinuity: resolveContinuity(
        questionReaderResult?.counterpartFacts
          ?? input.currentCounterpartFacts,
        true,
      ),
    };
  }

  if (
    isTimeRefinementQuestion(
      normalizedQuestion,
      previousQuestionMeaning,
    )
  ) {
    const questionReaderResult = readQuestionReadOnly(
      input.humanContext,
      input.newQuestion,
    );
    const currentFacts =
      questionReaderResult?.counterpartFacts
      ?? input.currentCounterpartFacts;

    return {
      type: "timeRefinement",
      reason: "time period refinement detected",
      questionReaderResult,
      counterpartContinuity: resolveContinuity(
        currentFacts,
        indicatesSameCounterpartContinuation(
          normalizedQuestion,
          currentFacts,
        ),
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
    const questionReaderResult = readQuestionReadOnly(
      input.humanContext,
      input.newQuestion,
    );
    const currentFacts =
      questionReaderResult?.counterpartFacts
      ?? input.currentCounterpartFacts;

    return {
      type: "timeRefinement",
      reason: "structured time meaning shift via LifeFlowTarget",
      questionReaderResult,
      counterpartContinuity: resolveContinuity(
        currentFacts,
        indicatesSameCounterpartContinuation(
          normalizedQuestion,
          currentFacts,
        ),
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

  const currentFacts =
    input.currentCounterpartFacts
    ?? questionReaderResult?.counterpartFacts
    ?? null;
  const sameCounterpart = indicatesSameCounterpartContinuation(
    normalizedQuestion,
    currentFacts,
  );
  const counterpartContinuity = resolveContinuity(
    currentFacts,
    sameCounterpart,
  );

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
      counterpartContinuity,
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
      counterpartContinuity,
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
      counterpartContinuity,
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
      counterpartContinuity,
    };
  }

  if (input.previousTurn) {
    return {
      type: "newQuestion",
      reason: "no continuation evidence — treated as new question",
      questionReaderResult,
      counterpartContinuity,
    };
  }

  return {
    type: "newQuestion",
    reason: "no previous turn — treated as new question",
    questionReaderResult,
    counterpartContinuity,
  };
}
