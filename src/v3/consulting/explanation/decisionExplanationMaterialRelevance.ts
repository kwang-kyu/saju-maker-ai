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
    "businessTiming",
    "realEstateBuy",
    "generalJudgement",
  ];

const BUSINESS_EXPLANATION_FOCUSES:
  readonly DecisionExplanationFocus[] = [
    "businessStart",
    "businessTiming",
    "businessFieldFit",
  ];

function isBusinessExplanationFocus(
  focus:
    DecisionExplanationFocus,
): boolean {
  return BUSINESS_EXPLANATION_FOCUSES.includes(
    focus,
  );
}

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
          || focus === "businessTiming"
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

    if (
      focus === "businessFieldFit"
    ) {
      return true;
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

const GENERAL_JUDGEMENT_EXECUTION_EVIDENCE_SOURCES:
  readonly DecisionExplanationEvidence["source"][] = [
    "career",
    "lifeDriver",
    "lifePhase",
    "repeatedPattern",
    "survivalStyle",
  ];

const GENERAL_JUDGEMENT_EXECUTION_ACTION_OBJECT_TYPES:
  readonly NonNullable<
    DecisionExplanationMaterialRelevanceContext["questionContext"]
  >["actionObject"]["type"][] = [
    "business",
    "job",
  ];

function isExecutionEvidenceSourceForGeneralJudgement(
  source:
    DecisionExplanationEvidence["source"],
): boolean {
  return GENERAL_JUDGEMENT_EXECUTION_EVIDENCE_SOURCES.some(
    (item) =>
      item === source,
  );
}

function isExecutionActionObjectForGeneralJudgement(
  context:
    DecisionExplanationMaterialRelevanceContext,
): boolean {
  const actionObjectType =
    context
      .questionContext
      ?.actionObject
      .type;

  if (
    !actionObjectType
  ) {
    return false;
  }

  return GENERAL_JUDGEMENT_EXECUTION_ACTION_OBJECT_TYPES.some(
    (item) =>
      item
      === actionObjectType,
  );
}

/**
 * generalJudgement focus에서 decisionTarget/actionObject 기준으로
 * execution·business 관련 evidence만 걸른다.
 *
 * null이면 기존 topic/focus relevance 로직에 위임한다.
 */
function resolveDecisionTargetEvidenceRelevance(
  source:
    DecisionExplanationEvidence["source"],
  context:
    DecisionExplanationMaterialRelevanceContext,
): boolean | null {
  if (
    context.focus
    !== "generalJudgement"
  ) {
    return null;
  }

  const {
    decisionTarget,
  } = context;

  if (
    decisionTarget
    === "none"
  ) {
    return (
      source
      === "questionIntent"
    );
  }

  if (
    decisionTarget
    === "manageMoney"
  ) {
    if (
      isExecutionEvidenceSourceForGeneralJudgement(
        source,
      )
    ) {
      return false;
    }

    if (
      isExecutionActionObjectForGeneralJudgement(
        context,
      )
      && (
        source
        === "career"
        || source
        === "capacity"
      )
    ) {
      return false;
    }

    return null;
  }

  return null;
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
  const decisionTargetRelevance =
    resolveDecisionTargetEvidenceRelevance(
      source,
      context,
    );

  if (
    decisionTargetRelevance
    !== null
  ) {
    return decisionTargetRelevance;
  }

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
      isBusinessExplanationFocus(
        context.focus,
      )
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
        isBusinessExplanationFocus(
          context.focus,
        )
        || context.focus
        === "termination"
        || topic
        === "job"
        || topic
        === "business"
      );

    case "capacity":
      return (
        isBusinessExplanationFocus(
          context.focus,
        )
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
  const decisionTargetRelevance =
    resolveDecisionTargetEvidenceRelevance(
      evidence.source,
      context,
    );

  if (
    decisionTargetRelevance
    !== null
  ) {
    return decisionTargetRelevance;
  }

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
        || focus === "businessTiming"
        || focus === "termination"
        || focus === "realEstateBuy"
      );

    case "lifeDriver":
      return (
        isBusinessExplanationFocus(
          focus,
        )
        || focus === "termination"
      );

    case "survivalStyle":
      return (
        isBusinessExplanationFocus(
          focus,
        )
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

      if (
        focus === "businessFieldFit"
      ) {
        return true;
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
