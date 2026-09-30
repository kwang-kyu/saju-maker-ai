import type {
  ActionReadiness,
} from "../decision/decisionTypes.js";

import {
  selectReaderDecisionSources,
  type ReaderDecisionSource,
} from "../decision/readerDecisionSelectionBuilder.js";

import type {
  QuestionContext,
} from "../question/questionContext.js";

import type {
  DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

import type {
  DecisionExplanationCondition,
  DecisionExplanationEvidence,
  DecisionExplanationInput,
  DecisionExplanationRisk,
} from "./decisionResultReader.js";

export type QuestionSpecificMaterialTierKey =
  | "primary"
  | "secondary"
  | "supporting";

export type QuestionSpecificMaterialTier<
  TMaterial,
> = {
  primary:
    TMaterial[];

  secondary:
    TMaterial[];

  supporting:
    TMaterial[];
};

export type QuestionSpecificMaterialSelection = {
  evidence:
    QuestionSpecificMaterialTier<
      DecisionExplanationEvidence
    >;

  conditions:
    QuestionSpecificMaterialTier<
      DecisionExplanationCondition
    >;

  risks:
    QuestionSpecificMaterialTier<
      DecisionExplanationRisk
    >;
};

export type QuestionSpecificMaterialSelectionInput = {
  evidence:
    readonly DecisionExplanationEvidence[];

  conditions:
    readonly DecisionExplanationCondition[];

  risks:
    readonly DecisionExplanationRisk[];

  focus:
    DecisionExplanationFocus;

  intent:
    DecisionExplanationInput["intent"];

  topic:
    DecisionExplanationInput["topic"];

  decisionTarget:
    DecisionExplanationInput["decisionTarget"];

  actionReadiness:
    ActionReadiness;

  questionContext?:
    QuestionContext;

  originalQuestion:
    string;

  readerEffectSources?:
    readonly ReaderDecisionSource[];
};

const READER_SOURCES:
  readonly ReaderDecisionSource[] = [
    "capacity",
    "money",
    "career",
    "relationship",
    "health",
    "blessing",
    "destiny",
  ];

/**
 * Foundational / common boilerplate evidence sources.
 *
 * These remain available for explanation (supporting tier) but must not
 * outrank question-selected person-diff reader evidence under standard
 * prompt budget (directAnswer evidence slice).
 *
 * B4: demote humanIdentity / lifePhase / lifeDriver so person-specific
 * capacity·money·career·relationship evidence can win serialization priority.
 * DecisionResult itself is unchanged — only explanation-material tiering.
 */
const FOUNDATIONAL_SUPPORTING_SOURCES:
  readonly DecisionExplanationEvidence["source"][] = [
    "humanIdentity",
    "lifePhase",
    "lifeDriver",
    "survivalStyle",
    "repeatedPattern",
    "questionIntent",
  ];

function createEmptyMaterialTier<
  TMaterial,
>(): QuestionSpecificMaterialTier<
  TMaterial
> {
  return {
    primary: [],
    secondary: [],
    supporting: [],
  };
}

function isReaderDecisionSource(
  source:
    DecisionExplanationEvidence["source"],
): source is ReaderDecisionSource {
  return READER_SOURCES.some(
    (item) =>
      item === source,
  );
}

function isFoundationalSupportingEvidence(
  evidence:
    DecisionExplanationEvidence,
): boolean {
  return FOUNDATIONAL_SUPPORTING_SOURCES.includes(
    evidence.source,
  );
}

function uniqueReaderSources(
  sources:
    readonly ReaderDecisionSource[],
): ReaderDecisionSource[] {
  const selected:
    ReaderDecisionSource[] = [];

  for (const source of sources) {
    if (
      selected.includes(
        source,
      )
    ) {
      continue;
    }

    selected.push(
      source,
    );
  }

  return selected;
}

function resolveSelectedReaderSources(
  input:
    QuestionSpecificMaterialSelectionInput,
): ReaderDecisionSource[] {
  if (
    input.readerEffectSources
    && input.readerEffectSources.length
      > 0
  ) {
    return uniqueReaderSources(
      input.readerEffectSources,
    );
  }

  return selectReaderDecisionSources(
    input.topic,
  ).slice(
    0,
    2,
  );
}

function classifyEvidenceTier(
  evidence:
    DecisionExplanationEvidence,
  selectedReaderSources:
    readonly ReaderDecisionSource[],
): QuestionSpecificMaterialTierKey {
  if (
    isFoundationalSupportingEvidence(
      evidence,
    )
  ) {
    return "supporting";
  }

  if (
    evidence.importance
    === "supporting"
  ) {
    return "supporting";
  }

  if (
    isReaderDecisionSource(
      evidence.source,
    )
  ) {
    return selectedReaderSources.includes(
      evidence.source,
    )
      ? "primary"
      : "secondary";
  }

  return "primary";
}

function classifyConditionTier(
  condition:
    DecisionExplanationCondition,
): QuestionSpecificMaterialTierKey {
  if (
    condition.required
    && !condition.satisfied
  ) {
    return "primary";
  }

  if (
    condition.required
    && condition.satisfied
  ) {
    return "secondary";
  }

  return "supporting";
}

function classifyRiskTier(
  risk:
    DecisionExplanationRisk,
): QuestionSpecificMaterialTierKey {
  switch (
    risk.severity
  ) {
    case "high":
      return "primary";

    case "medium":
      return "secondary";

    case "low":
    default:
      return "supporting";
  }
}

function assignMaterialToTier<
  TMaterial,
>(
  tier:
    QuestionSpecificMaterialTier<
      TMaterial
    >,
  material:
    TMaterial,
  tierKey:
    QuestionSpecificMaterialTierKey,
): void {
  tier[tierKey].push(
    material,
  );
}

/**
 * P4-1 relevance filtering을 통과한 material을
 * 이번 질문에서 설명할 우선순위 tier로 분류한다.
 *
 * 관련성(relevance)을 다시 판단하지 않으며,
 * Verdict / Direction / Evidence 생성 기준을 변경하지 않는다.
 *
 * 각 tier 내부의 material 순서는
 * 입력 배열의 기존 순서를 그대로 유지한다.
 */
export function selectQuestionSpecificMaterials(
  input:
    QuestionSpecificMaterialSelectionInput,
): QuestionSpecificMaterialSelection {
  const evidence =
    createEmptyMaterialTier<
      DecisionExplanationEvidence
    >();

  const conditions =
    createEmptyMaterialTier<
      DecisionExplanationCondition
    >();

  const risks =
    createEmptyMaterialTier<
      DecisionExplanationRisk
    >();

  const selectedReaderSources =
    resolveSelectedReaderSources(
      input,
    );

  for (const item of input.evidence) {
    assignMaterialToTier(
      evidence,
      item,
      classifyEvidenceTier(
        item,
        selectedReaderSources,
      ),
    );
  }

  for (const item of input.conditions) {
    assignMaterialToTier(
      conditions,
      item,
      classifyConditionTier(
        item,
      ),
    );
  }

  for (const item of input.risks) {
    assignMaterialToTier(
      risks,
      item,
      classifyRiskTier(
        item,
      ),
    );
  }

  return {
    evidence,
    conditions,
    risks,
  };
}
