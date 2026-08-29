import type {
  ActionReadiness,
} from "../decision/decisionTypes.js";

import type {
  QuestionContext,
} from "../question/questionContext.js";

import type {
  DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

import {
  selectReaderDecisionSources,
  type ReaderDecisionSource,
} from "../decision/readerDecisionSelectionBuilder.js";

import type {
  QuestionTopic,
} from "../question/questionReader.js";

import type {
  DecisionExplanationCondition,
  DecisionExplanationEvidence,
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

const READER_EVIDENCE_SOURCES:
  readonly ReaderDecisionSource[] = [
    "capacity",
    "money",
    "career",
    "relationship",
    "health",
    "blessing",
    "destiny",
  ];

function isReaderEvidenceSource(
  source:
    DecisionExplanationEvidence["source"],
): source is ReaderDecisionSource {
  return READER_EVIDENCE_SOURCES.some(
    (item) =>
      item === source,
  );
}

function resolveQuestionTopic(
  context:
    DecisionExplanationMaterialRelevanceContext,
): QuestionTopic | undefined {
  return context
    .questionContext
    ?.question
    .topic;
}

function isMoneyRelatedContext(
  context:
    DecisionExplanationMaterialRelevanceContext,
): boolean {
  const topic =
    resolveQuestionTopic(
      context,
    );

  return (
    topic === "money"
    || context.focus
    === "realEstateBuy"
    || context
      .questionContext
      ?.actionObject
      .type
    === "investment"
  );
}

function isReaderEvidenceSourceRelevant(
  source:
    ReaderDecisionSource,
  context:
    DecisionExplanationMaterialRelevanceContext,
): boolean {
  const topic =
    resolveQuestionTopic(
      context,
    );

  if (
    topic
  ) {
    const topicSources =
      selectReaderDecisionSources(
        topic,
      );

    if (
      !topicSources.includes(
        source,
      )
    ) {
      return false;
    }
  }

  if (
    source
    === "destiny"
  ) {
    return (
      context.focus
      === "businessStart"
      || context.focus
      === "continuation"
    );
  }

  switch (
    source
  ) {
    case "money":
      return isMoneyRelatedContext(
        context,
      );

    case "relationship":
      return (
        context.focus
        === "compatibility"
        || context.focus
        === "continuation"
        || topic
        === "love"
        || topic
        === "relationship"
        || topic
        === "marriage"
      );

    case "career":
      return (
        context.focus
        === "termination"
        || context.focus
        === "businessStart"
        || topic
        === "job"
        || topic
        === "business"
      );

    case "capacity":
      return (
        context.focus
        === "businessStart"
        || context.focus
        === "termination"
        || context.focus
        === "realEstateBuy"
        || topic
        === "money"
        || topic
        === "business"
        || topic
        === "realEstate"
      );

    case "blessing":
      return (
        context.focus
        === "continuation"
        || topic
        === "love"
      );

    case "health":
      return (
        topic
        === "health"
      );

    default:
      return true;
  }
}

export function isEvidenceMaterialRelevant(
  evidence:
    DecisionExplanationEvidence,
  context:
    DecisionExplanationMaterialRelevanceContext,
): boolean {
  const {
    focus,
    decisionTarget,
  } = context;

  switch (
    evidence.source
  ) {
    case "questionIntent":
      return true;

    case "humanIdentity":
      return false;

    case "lifePhase":
      return (
        focus === "businessStart"
        || focus === "termination"
        || focus === "realEstateBuy"
      );

    case "lifeDriver":
      return (
        focus === "businessStart"
        || focus === "termination"
      );

    case "survivalStyle":
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

    case "repeatedPattern":
      if (
        focus === "generalJudgement"
        || focus === "compatibility"
        || focus === "continuation"
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
        );
      }

      return isExecutionTypeFocus(
        focus,
      );

    case "compatibility":
      return (
        focus === "compatibility"
      );

    case "currentContext":
      return (
        isMoneyRelatedContext(
          context,
        )
        || focus === "termination"
        || context
          .questionContext
          ?.actionObject
          .type
        === "investment"
      );

    case "lifeContext":
      return (
        isMoneyRelatedContext(
          context,
        )
        || focus === "realEstateBuy"
      );

    case "roleRecommendation":
      return false;

    default:
      if (
        isReaderEvidenceSource(
          evidence.source,
        )
      ) {
        return isReaderEvidenceSourceRelevant(
          evidence.source,
          context,
        );
      }

      return true;
  }
}

export function filterRelevantEvidence(
  evidence:
    readonly DecisionExplanationEvidence[],
  context:
    DecisionExplanationMaterialRelevanceContext,
): DecisionExplanationEvidence[] {
  return evidence.filter(
    (item) =>
      isEvidenceMaterialRelevant(
        item,
        context,
      ),
  );
}
