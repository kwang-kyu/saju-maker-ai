import type {
  ActionReadiness,
  DecisionCondition,
  DecisionEvidence,
  DecisionRisk,
} from "./decisionTypes.js";

import type {
  QuestionContext,
} from "../question/questionContext.js";

import type {
  QuestionReaderResult,
} from "../question/questionReader.js";

import {
  resolveDecisionExplanationFocus,
} from "../explanation/decisionExplanationFocus.js";

import {
  filterRelevantConditions,
  filterRelevantEvidence,
  filterRelevantRisks,
  type DecisionExplanationMaterialRelevanceContext,
} from "../explanation/decisionExplanationMaterialRelevance.js";

import type {
  DecisionExplanationCondition,
  DecisionExplanationEvidence,
  DecisionExplanationRisk,
} from "../explanation/decisionResultReader.js";

export type DecisionMaterialRelevanceGateInput = {
  evidence:
    DecisionEvidence[];

  conditions:
    DecisionCondition[];

  risks:
    DecisionRisk[];

  actionReadiness:
    ActionReadiness;

  decisionTarget:
    QuestionReaderResult["decisionTarget"];

  intent:
    QuestionReaderResult["intent"];

  topic:
    QuestionReaderResult["topic"];

  originalQuestion:
    string;

  questionContext:
    QuestionContext;
};

export type DecisionMaterialRelevanceGateResult = {
  evidence:
    DecisionEvidence[];

  conditions:
    DecisionCondition[];

  risks:
    DecisionRisk[];
};

export type DecisionMaterialRelevanceContextInput = {
  actionReadiness:
    ActionReadiness;

  decisionTarget:
    QuestionReaderResult["decisionTarget"];

  intent:
    QuestionReaderResult["intent"];

  topic:
    QuestionReaderResult["topic"];

  originalQuestion:
    string;

  questionContext:
    QuestionContext;
};

/**
 * Explanation layer와 동일한 focus 기준으로
 * material relevance context를 만든다.
 */
export function resolveDecisionMaterialRelevanceContext(
  input:
    DecisionMaterialRelevanceContextInput,
): DecisionExplanationMaterialRelevanceContext {
  const focus =
    resolveDecisionExplanationFocus({
      intent:
        input.intent,

      decisionTarget:
        input.decisionTarget,

      topic:
        input.topic,

      originalQuestion:
        input.originalQuestion,

      questionContext:
        input.questionContext,
    });

  return {
    focus,
    questionContext:
      input.questionContext,
    actionReadiness:
      input.actionReadiness,
    decisionTarget:
      input.decisionTarget,
  };
}

function adaptEvidenceForRelevanceFilter(
  evidence:
    DecisionEvidence,
): DecisionExplanationEvidence {
  return {
    source:
      evidence.source,
    description:
      evidence.description,
    importance:
      evidence.weight >= 4
        ? "core"
        : "supporting",
  };
}

function adaptConditionForRelevanceFilter(
  condition:
    DecisionCondition,
): DecisionExplanationCondition {
  return {
    key:
      condition.key,
    description:
      condition.description,
    required:
      condition.required,
    satisfied:
      condition.satisfied,
  };
}

function adaptRiskForRelevanceFilter(
  risk:
    DecisionRisk,
): DecisionExplanationRisk {
  return {
    key:
      risk.key,
    source:
      risk.source,
    description:
      risk.description,
    severity:
      risk.severity,
  };
}

function filterDecisionMaterial<
  TDecision,
  TExplanation,
>(
  items:
    readonly TDecision[],
  adapt:
    (item: TDecision) => TExplanation,
  filter:
    (
      adaptedItems:
        readonly TExplanation[],
      context:
        DecisionExplanationMaterialRelevanceContext,
    ) => TExplanation[],
  context:
    DecisionExplanationMaterialRelevanceContext,
): TDecision[] {
  if (
    items.length
    === 0
  ) {
    return [];
  }

  const adapted =
    items.map(
      adapt,
    );

  const filteredAdapted =
    filter(
      adapted,
      context,
    );

  const keptSet =
    new Set(
      filteredAdapted,
    );

  return items.filter(
    (
      _item,
      index,
    ) =>
      keptSet.has(
        adapted[index],
      ),
  );
}

function filterDecisionEvidence(
  evidence:
    readonly DecisionEvidence[],
  context:
    DecisionExplanationMaterialRelevanceContext,
): DecisionEvidence[] {
  return filterDecisionMaterial(
    evidence,
    adaptEvidenceForRelevanceFilter,
    filterRelevantEvidence,
    context,
  );
}

function filterDecisionConditions(
  conditions:
    readonly DecisionCondition[],
  context:
    DecisionExplanationMaterialRelevanceContext,
): DecisionCondition[] {
  return filterDecisionMaterial(
    conditions,
    adaptConditionForRelevanceFilter,
    filterRelevantConditions,
    context,
  );
}

function filterDecisionRisks(
  risks:
    readonly DecisionRisk[],
  context:
    DecisionExplanationMaterialRelevanceContext,
): DecisionRisk[] {
  return filterDecisionMaterial(
    risks,
    adaptRiskForRelevanceFilter,
    filterRelevantRisks,
    context,
  );
}

/**
 * Decision Engine material을
 * Explanation relevance 규칙으로 filtering한다.
 *
 * Verdict / Direction / coreDecision 판단은 변경하지 않는다.
 */
export function applyDecisionMaterialRelevanceGate(
  input:
    DecisionMaterialRelevanceGateInput,
): DecisionMaterialRelevanceGateResult {
  const context =
    resolveDecisionMaterialRelevanceContext(
      input,
    );

  return {
    evidence:
      filterDecisionEvidence(
        input.evidence,
        context,
      ),
    conditions:
      filterDecisionConditions(
        input.conditions,
        context,
      ),
    risks:
      filterDecisionRisks(
        input.risks,
        context,
      ),
  };
}
