import type {
  QuestionContext,
} from "../question/questionContext.js";

import {
  isCompatibilityAnalysisQuestion,
} from "../question/questionReader.js";

import type {
  DecisionExplanationInput,
} from "./decisionResultReader.js";

export type DecisionExplanationFocus =
  | "compatibility"
  | "continuation"
  | "termination"
  | "businessStart"
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
    input.topic
    === "business"
    || actionObjectType
    === "business"
  ) {
    return "businessStart";
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
