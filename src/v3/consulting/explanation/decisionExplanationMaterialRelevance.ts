import type {
  ActionReadiness,
} from "../decision/decisionTypes.js";

import type {
  QuestionContext,
} from "../question/questionContext.js";

import type {
  DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

import type {
  DecisionExplanationCondition,
  DecisionExplanationInput,
  DecisionExplanationRisk,
} from "./decisionResultReader.js";

export type DecisionExplanationMaterialRelevanceContext = {
  focus:
    DecisionExplanationFocus;

  questionContext?:
    QuestionContext;

  actionReadiness:
    ActionReadiness;

  decisionTarget:
    DecisionExplanationInput["decisionTarget"];
};

const EXECUTION_TYPE_FOCUSES:
  readonly DecisionExplanationFocus[] = [
    "termination",
    "businessStart",
    "realEstateBuy",
    "generalJudgement",
  ];

export function isExecutionTypeFocus(
  focus:
    DecisionExplanationFocus,
): boolean {
  return EXECUTION_TYPE_FOCUSES.includes(
    focus,
  );
}

export function isConditionMaterialRelevant(
  condition:
    DecisionExplanationCondition,
  context:
    DecisionExplanationMaterialRelevanceContext,
): boolean {
  const {
    focus,
    questionContext,
    actionReadiness,
    decisionTarget,
  } = context;

  switch (
    condition.key
  ) {
    case "identifyCompatibilityCounterpart":
      return (
        questionContext
          ?.requirements
          .compatibilityAnalysisRequired
        === true
      );

    case "completeTimingEvidence":
      return (
        questionContext
          ?.requirements
          .timingAnalysisRequired
        === true
      );

    case "clarifyDecisionTarget":
      return (
        actionReadiness
        === "unknown"
      );

    case "confirmExecutionConditions":
      return (
        actionReadiness
        === "readyWithConditions"
        && isExecutionTypeFocus(
          focus,
        )
      );

      case "useGradualGrowth":
        return (
          focus === "businessStart"
          || (
            focus === "termination"
            && (
              decisionTarget === "leaveJob"
              || decisionTarget === "changeJob"
            )
          )
        );

    default:
      return true;
  }
}

export function isRiskMaterialRelevant(
  risk:
    DecisionExplanationRisk,
  context:
    DecisionExplanationMaterialRelevanceContext,
): boolean {
  const {
    focus,
    questionContext,
    decisionTarget,
  } = context;

  switch (
    risk.key
  ) {
    case "compatibilityCounterpartMissing":
      return (
        questionContext
          ?.requirements
          .compatibilityAnalysisRequired
        === true
      );

    case "urgentDecision":
      return (
        questionContext
          ?.question
          .urgency
        === "immediate"
        && isExecutionTypeFocus(
          focus,
        )
      );

      default:
  if (
    risk.key.startsWith(
      "repeatedPattern-",
    )
  ) {
    if (
      focus === "generalJudgement"
    ) {
      return false;
    }

    if (
      focus === "termination"
    ) {
      return true;
    }

    if (
      focus === "realEstateBuy"
    ) {
      return (
        decisionTarget === "buy"
        || decisionTarget === "invest"
      )
      && risk.key === "repeatedPattern-1";
    }

    return isExecutionTypeFocus(
      focus,
    );
  }

  return true;
  }
}

export function filterRelevantConditions(
  conditions:
    readonly DecisionExplanationCondition[],
  context:
    DecisionExplanationMaterialRelevanceContext,
): DecisionExplanationCondition[] {
  return conditions.filter(
    (condition) =>
      isConditionMaterialRelevant(
        condition,
        context,
      ),
  );
}

export function filterRelevantRisks(
  risks:
    readonly DecisionExplanationRisk[],
  context:
    DecisionExplanationMaterialRelevanceContext,
): DecisionExplanationRisk[] {
  return risks.filter(
    (risk) =>
      isRiskMaterialRelevant(
        risk,
        context,
      ),
  );
}
