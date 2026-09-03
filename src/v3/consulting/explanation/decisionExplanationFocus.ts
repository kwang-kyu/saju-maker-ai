import type {
  QuestionContext,
  QuestionActionObjectType,
} from "../question/questionContext.js";

import {
  isCompatibilityAnalysisQuestion,
} from "../question/questionReader.js";

import type {
  QuestionAnalysisMode,
  QuestionTimingType,
} from "../question/questionReader.js";

import type {
  DecisionExplanationInput,
} from "./decisionResultReader.js";

export type DecisionExplanationFocus =
  | "compatibility"
  | "continuation"
  | "termination"
  | "businessStart"
  | "businessTiming"
  | "businessFieldFit"
  | "realEstateBuy"
  | "generalJudgement";

export type DecisionExplanationFocusResolverInput = {
  intent:
    DecisionExplanationInput["intent"];

  decisionTarget:
    DecisionExplanationInput["decisionTarget"];

  topic:
    DecisionExplanationInput["topic"];

  originalQuestion:
    string;

  questionContext?:
    QuestionContext;
};

const TERMINATION_TARGETS:
  readonly DecisionExplanationInput["decisionTarget"][] = [
    "stop",
    "leaveJob",
    "separate",
    "move",
    "changeJob",
    "sell",
  ];

const REAL_ESTATE_BUY_TARGETS:
  readonly DecisionExplanationInput["decisionTarget"][] = [
    "buy",
    "invest",
  ];

const BUSINESS_TIMING_SIGNAL_PATTERN =
  /(?:좋은|유리한|적(?:절|합)한)\s*(?:시(?:기|점)|때)|(?:언제|몇\s*월|몇월)(?:\s*(?:에|쯤|부터|에\s*시작|에\s*창업|에\s*개업|이\s*좋|가\s*좋|하면))|사업\s*(?:을\s*)?(?:시작\s*)?(?:하기\s*)?(?:좋은|유리한)\s*시(?:기|점)|(?:시작|창업|개업)\s*(?:하기\s*)?(?:좋은|유리한)\s*시(?:기|점)/;

const BUSINESS_FIELD_FIT_SIGNAL_PATTERN =
  /(?:어떤|무슨)\s*(?:사업\s*)?(?:분야|업종|업체|종류|아이템|일)|(?:분야|업종)\s*(?:가\s*)?(?:나|저|내)(?:에게|한테|와)\s*(?:맞|어울)|나(?:에게|한테)\s*(?:맞는|어울리는)\s*(?:사업|창업|업종|분야)|(?:사업|창업)\s*(?:분야|업종)\s*(?:선택|추천|정해)/;

const BUSINESS_TIMING_TYPES =
  new Set<QuestionTimingType>([
    "bestTiming",
    "executionTiming",
    "waitingTiming",
  ]);

type BusinessExplanationFocus =
  | "businessStart"
  | "businessTiming"
  | "businessFieldFit";

function isBusinessQuestionContext(
  input:
    DecisionExplanationFocusResolverInput,
  actionObjectType:
    QuestionActionObjectType
    | undefined,
): boolean {
  return (
    input.topic
    === "business"
    || actionObjectType
    === "business"
  );
}

function resolveBusinessExplanationFocus(
  input:
    DecisionExplanationFocusResolverInput,
  questionSignals:
    string,
  analysisMode:
    QuestionAnalysisMode
    | undefined,
  timingType:
    QuestionTimingType
    | undefined,
): BusinessExplanationFocus {
  if (
    input.intent
    === "timing"
    || (
      timingType
      !== undefined
      && BUSINESS_TIMING_TYPES.has(
        timingType,
      )
    )
    || BUSINESS_TIMING_SIGNAL_PATTERN.test(
      questionSignals,
    )
  ) {
    return "businessTiming";
  }

  if (
    input.intent
    === "selection"
    || input.intent
    === "comparison"
    || input.decisionTarget
    === "choose"
    || analysisMode
    === "selection"
    || BUSINESS_FIELD_FIT_SIGNAL_PATTERN.test(
      questionSignals,
    )
  ) {
    return "businessFieldFit";
  }

  return "businessStart";
}

function collectQuestionSignals(
  originalQuestion:
    string,
  questionContext?:
    QuestionContext,
): string {
  const question =
    questionContext
      ?.question;

  return [
    originalQuestion,
    question?.asksWhat
      ?? "",
    question?.asksWhy
      ?? "",
    question?.decisionQuestion
      ?? "",
  ].join(
    " ",
  );
}

/**
 * QuestionContext와 DecisionResult 필드로
 * 설명 구조만 고른다.
 *
 * 새로운 Decision 판단을 만들지 않는다.
 */
export function resolveDecisionExplanationFocus(
  input:
    DecisionExplanationFocusResolverInput,
): DecisionExplanationFocus {
  const analysisMode =
    input
      .questionContext
      ?.question
      .analysisMode;

  const actionObjectType =
    input
      .questionContext
      ?.actionObject
      .type;

  const questionSignals =
    collectQuestionSignals(
      input.originalQuestion,
      input.questionContext,
    );

  if (
    analysisMode
    === "compatibility"
    || input.decisionTarget
    === "partner"
    || isCompatibilityAnalysisQuestion(
      input.originalQuestion,
      input.decisionTarget,
    )
    || /궁합|합이\s*맞/.test(
      questionSignals,
    )
  ) {
    return "compatibility";
  }

  if (
    input.intent
    === "continuation"
    || input.decisionTarget
    === "continue"
  ) {
    return "continuation";
  }

  if (
    input.intent
    === "termination"
    || TERMINATION_TARGETS.includes(
      input.decisionTarget,
    )
  ) {
    return "termination";
  }

  if (
    isBusinessQuestionContext(
      input,
      actionObjectType,
    )
  ) {
    return resolveBusinessExplanationFocus(
      input,
      questionSignals,
      analysisMode,
      input
        .questionContext
        ?.timingType,
    );
  }

  if (
    (
      input.topic
      === "realEstate"
      || actionObjectType
      === "realEstate"
    )
    && REAL_ESTATE_BUY_TARGETS.includes(
      input.decisionTarget,
    )
  ) {
    return "realEstateBuy";
  }

  return "generalJudgement";
}
