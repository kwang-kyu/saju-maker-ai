import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture.js";

import {
  runDecisionEngine,
} from "../decision/decisionEngine.js";

import {
  selectReaderDecisionSources,
  type ReaderDecisionSource,
} from "../decision/readerDecisionSelectionBuilder.js";

import type {
  QuestionContext,
} from "../question/questionContext.js";

import {
  buildQuestionContext,
} from "../question/questionContextBuilder.js";

import {
  readQuestion,
} from "../question/questionReader.js";

import {
  readDecisionResult,
  type DecisionExplanationCondition,
  type DecisionExplanationEvidence,
  type DecisionExplanationInput,
  type DecisionExplanationRisk,
} from "./decisionResultReader.js";

import {
  resolveDecisionExplanationFocus,
  type DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

import {
  filterRelevantConditions,
  filterRelevantEvidence,
  filterRelevantRisks,
  type DecisionExplanationMaterialRelevanceContext,
} from "./decisionExplanationMaterialRelevance.js";

import {
  selectQuestionSpecificMaterials,
  type QuestionSpecificMaterialSelection,
  type QuestionSpecificMaterialTier,
  type QuestionSpecificMaterialTierKey,
} from "./questionSpecificMaterialSelector.js";

/**
 * decisionExplanationMaterialRelevanceVerification.ts 와
 * 동일한 대표 질문 fixture.
 */
const SELECTOR_CASE_FIXTURES = [
  {
    name: "A_businessStart",
    questionText:
      "통닭집 창업을 해도 될까요?",
    category:
      "businessStart",
  },
  {
    name: "F_businessTiming",
    questionText:
      "지금 통닭집을 시작하면 성공할까요?",
    category:
      "businessTiming",
  },
  {
    name: "G_businessFieldFit",
    questionText:
      "어떤 사업 분야가 나에게 맞을까요?",
    category:
      "businessFieldFit",
  },
  {
    name: "B_moneyRecovery",
    questionText:
      "이번에 빌려준 돈을 받을 수 있을까요?",
    category:
      "moneyRecovery",
  },
  {
    name: "C_continuation",
    questionText:
      "남자친구와 계속 만나야 할까요?",
    category:
      "relationshipContinuation",
  },
  {
    name: "D_lifeFlowYear",
    questionText:
      "올해 총운을 봐주세요",
    category:
      "lifeFlowYear",
  },
  {
    name: "D_lifeFlowMonth",
    questionText:
      "2026년 12월 운세는 어떨까요?",
    category:
      "specificTimingFortune",
  },
  {
    name: "E_compatibility",
    questionText:
      "우리 둘의 궁합은 어떤가요?",
    category:
      "compatibility",
  },
] as const;

export type QuestionSpecificMaterialSelectorCaseName =
  typeof SELECTOR_CASE_FIXTURES[number]["name"];

const ALL_READER_SOURCES =
  selectReaderDecisionSources(
    "general",
  );

export type QuestionSpecificMaterialSelectorCaseResult = {
  name:
    QuestionSpecificMaterialSelectorCaseName;

  questionText:
    string;

  category:
    typeof SELECTOR_CASE_FIXTURES[number]["category"];

  focus:
    DecisionExplanationFocus;

  inputCounts: {
    evidence:
      number;

    conditions:
      number;

    risks:
      number;
  };

  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export type QuestionSpecificMaterialSelectorSpecialPathNote = {
  path:
    "lifeFlowInterpretation"
    | "roleRecommendation";

  includedInSelectorVerification:
    boolean;

  reason:
    string;
};

export type QuestionSpecificMaterialSelectorVerificationResult = {
  cases:
    QuestionSpecificMaterialSelectorCaseResult[];

  specialPathNotes:
    QuestionSpecificMaterialSelectorSpecialPathNote[];

  passed:
    boolean;
};

function buildRelevanceContext(
  explanationInput:
    DecisionExplanationInput,
  questionContext:
    QuestionContext,
  originalQuestion:
    string,
): {
  context:
    DecisionExplanationMaterialRelevanceContext;

  focus:
    DecisionExplanationFocus;
} {
  const focus =
    resolveDecisionExplanationFocus({
      intent:
        explanationInput.intent,
      decisionTarget:
        explanationInput.decisionTarget,
      topic:
        explanationInput.topic,
      originalQuestion,
      questionContext,
    });

  return {
    focus,
    context: {
      focus,
      questionContext,
      actionReadiness:
        explanationInput.actionReadiness,
      decisionTarget:
        explanationInput.decisionTarget,
    },
  };
}

function resolveDefaultSelectedReaderSources(
  topic:
    DecisionExplanationInput["topic"],
): ReaderDecisionSource[] {
  return selectReaderDecisionSources(
    topic,
  ).slice(
    0,
    2,
  );
}

function isReaderDecisionSource(
  source:
    DecisionExplanationEvidence["source"],
): source is ReaderDecisionSource {
  return ALL_READER_SOURCES.some(
    (item) =>
      item === source,
  );
}

function isFoundationalSupportingSource(
  source:
    DecisionExplanationEvidence["source"],
): boolean {
  return (
    source
    === "humanIdentity"
    || source
    === "lifePhase"
    || source
    === "lifeDriver"
    || source
    === "survivalStyle"
    || source
    === "repeatedPattern"
    || source
    === "questionIntent"
  );
}

function resolveExpectedEvidenceTier(
  evidence:
    DecisionExplanationEvidence,
  selectedReaderSources:
    readonly ReaderDecisionSource[],
): QuestionSpecificMaterialTierKey {
  if (
    isFoundationalSupportingSource(
      evidence.source,
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

function resolveExpectedConditionTier(
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

function resolveExpectedRiskTier(
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

function flattenTierMaterials<
  TMaterial,
>(
  tier:
    QuestionSpecificMaterialTier<
      TMaterial
    >,
): TMaterial[] {
  return [
    ...tier.primary,
    ...tier.secondary,
    ...tier.supporting,
  ];
}

function findMaterialTier<
  TMaterial,
>(
  material:
    TMaterial,
  tier:
    QuestionSpecificMaterialTier<
      TMaterial
    >,
): QuestionSpecificMaterialTierKey
  | null {
  if (
    tier.primary.includes(
      material,
    )
  ) {
    return "primary";
  }

  if (
    tier.secondary.includes(
      material,
    )
  ) {
    return "secondary";
  }

  if (
    tier.supporting.includes(
      material,
    )
  ) {
    return "supporting";
  }

  return null;
}

function hasDuplicateAcrossTiers<
  TMaterial,
>(
  tier:
    QuestionSpecificMaterialTier<
      TMaterial
    >,
): boolean {
  const seen =
    new Set<TMaterial>();

  for (const material of flattenTierMaterials(
    tier,
  )) {
    if (
      seen.has(
        material,
      )
    ) {
      return true;
    }

    seen.add(
      material,
    );
  }

  return false;
}

function preservesRelativeInputOrder<
  TMaterial,
>(
  tierItems:
    readonly TMaterial[],
  inputMaterials:
    readonly TMaterial[],
): boolean {
  const indices =
    tierItems.map(
      (material) =>
        inputMaterials.indexOf(
          material,
        ),
    );

  if (
    indices.some(
      (index) =>
        index < 0,
    )
  ) {
    return false;
  }

  for (
    let index = 1;
    index
    < indices.length;
    index += 1
  ) {
    if (
      indices[index]
      <= indices[index - 1]
    ) {
      return false;
    }
  }

  return true;
}

function areStringMultisetsEqual(
  left:
    readonly string[],
  right:
    readonly string[],
): boolean {
  if (
    left.length
    !== right.length
  ) {
    return false;
  }

  const sortedLeft =
    [...left].sort();
  const sortedRight =
    [...right].sort();

  return sortedLeft.every(
    (
      value,
      index,
    ) =>
      value
      === sortedRight[index],
  );
}

function preservesAllInputMaterials<
  TMaterial,
>(
  inputMaterials:
    readonly TMaterial[],
  outputMaterials:
    readonly TMaterial[],
): boolean {
  if (
    inputMaterials.length
    !== outputMaterials.length
  ) {
    return false;
  }

  return inputMaterials.every(
    (material) =>
      outputMaterials.includes(
        material,
      ),
  );
}

function buildConditionKeys(
  conditions:
    readonly DecisionExplanationCondition[],
): string[] {
  return conditions.map(
    (item) =>
      item.key,
  );
}

function buildRiskKeys(
  risks:
    readonly DecisionExplanationRisk[],
): string[] {
  return risks.map(
    (item) =>
      item.key,
  );
}

function buildSelectorChecks(
  input: {
    evidence:
      readonly DecisionExplanationEvidence[];

    conditions:
      readonly DecisionExplanationCondition[];

    risks:
      readonly DecisionExplanationRisk[];

    topic:
      DecisionExplanationInput["topic"];
  },
  selection:
    QuestionSpecificMaterialSelection,
): Record<
  string,
  boolean
> {
  const selectedReaderSources =
    resolveDefaultSelectedReaderSources(
      input.topic,
    );

  const flattenedEvidence =
    flattenTierMaterials(
      selection.evidence,
    );
  const flattenedConditions =
    flattenTierMaterials(
      selection.conditions,
    );
  const flattenedRisks =
    flattenTierMaterials(
      selection.risks,
    );

  const inputConditionKeys =
    buildConditionKeys(
      input.conditions,
    );
  const outputConditionKeys =
    buildConditionKeys(
      flattenedConditions,
    );

  const inputRiskKeys =
    buildRiskKeys(
      input.risks,
    );
  const outputRiskKeys =
    buildRiskKeys(
      flattenedRisks,
    );

  const checks: Record<
    string,
    boolean
  > = {
    evidenceMaterialsPreserved:
      preservesAllInputMaterials(
        input.evidence,
        flattenedEvidence,
      ),

    conditionMaterialsPreserved:
      preservesAllInputMaterials(
        input.conditions,
        flattenedConditions,
      ),

    riskMaterialsPreserved:
      preservesAllInputMaterials(
        input.risks,
        flattenedRisks,
      ),

    conditionKeysPreserved:
      areStringMultisetsEqual(
        inputConditionKeys,
        outputConditionKeys,
      ),

    riskKeysPreserved:
      areStringMultisetsEqual(
        inputRiskKeys,
        outputRiskKeys,
      ),

    evidenceHasNoDuplicateAcrossTiers:
      !hasDuplicateAcrossTiers(
        selection.evidence,
      ),

    conditionsHaveNoDuplicateAcrossTiers:
      !hasDuplicateAcrossTiers(
        selection.conditions,
      ),

    risksHaveNoDuplicateAcrossTiers:
      !hasDuplicateAcrossTiers(
        selection.risks,
      ),

    evidencePrimaryOrderPreserved:
      preservesRelativeInputOrder(
        selection.evidence.primary,
        input.evidence,
      ),

    evidenceSecondaryOrderPreserved:
      preservesRelativeInputOrder(
        selection.evidence.secondary,
        input.evidence,
      ),

    evidenceSupportingOrderPreserved:
      preservesRelativeInputOrder(
        selection.evidence.supporting,
        input.evidence,
      ),

    conditionPrimaryOrderPreserved:
      preservesRelativeInputOrder(
        selection.conditions.primary,
        input.conditions,
      ),

    conditionSecondaryOrderPreserved:
      preservesRelativeInputOrder(
        selection.conditions.secondary,
        input.conditions,
      ),

    conditionSupportingOrderPreserved:
      preservesRelativeInputOrder(
        selection.conditions.supporting,
        input.conditions,
      ),

    riskPrimaryOrderPreserved:
      preservesRelativeInputOrder(
        selection.risks.primary,
        input.risks,
      ),

    riskSecondaryOrderPreserved:
      preservesRelativeInputOrder(
        selection.risks.secondary,
        input.risks,
      ),

    riskSupportingOrderPreserved:
      preservesRelativeInputOrder(
        selection.risks.supporting,
        input.risks,
      ),

    allEvidenceTiersMatchMaterialCriteria:
      input.evidence.every(
        (evidence) => {
          const actualTier =
            findMaterialTier(
              evidence,
              selection.evidence,
            );
          const expectedTier =
            resolveExpectedEvidenceTier(
              evidence,
              selectedReaderSources,
            );

          return (
            actualTier
            === expectedTier
          );
        },
      ),

    allConditionTiersMatchMaterialCriteria:
      input.conditions.every(
        (condition) => {
          const actualTier =
            findMaterialTier(
              condition,
              selection.conditions,
            );
          const expectedTier =
            resolveExpectedConditionTier(
              condition,
            );

          return (
            actualTier
            === expectedTier
          );
        },
      ),

    allRiskTiersMatchMaterialCriteria:
      input.risks.every(
        (risk) => {
          const actualTier =
            findMaterialTier(
              risk,
              selection.risks,
            );
          const expectedTier =
            resolveExpectedRiskTier(
              risk,
            );

          return (
            actualTier
            === expectedTier
          );
        },
      ),
  };

  return checks;
}

function buildCaseResult(
  fixture:
    typeof SELECTOR_CASE_FIXTURES[number],
): QuestionSpecificMaterialSelectorCaseResult {
  const regressionInput =
    buildDecisionEngineRegressionInput({
      questionText:
        fixture.questionText,
    });

  const question =
    readQuestion(
      regressionInput.humanContext,
      fixture.questionText,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const decisionResult =
    runDecisionEngine({
      ...regressionInput,
      question,
      questionContext,
    });

  const explanationInput =
    readDecisionResult(
      decisionResult,
    );

  const {
    context,
    focus,
  } = buildRelevanceContext(
    explanationInput,
    questionContext,
    fixture.questionText,
  );

  const filteredEvidence =
    filterRelevantEvidence(
      explanationInput.evidence,
      context,
    );
  const filteredConditions =
    filterRelevantConditions(
      explanationInput.conditions,
      context,
    );
  const filteredRisks =
    filterRelevantRisks(
      explanationInput.risks,
      context,
    );

  const selection =
    selectQuestionSpecificMaterials({
      evidence:
        filteredEvidence,
      conditions:
        filteredConditions,
      risks:
        filteredRisks,
      focus,
      intent:
        explanationInput.intent,
      topic:
        explanationInput.topic,
      decisionTarget:
        explanationInput.decisionTarget,
      actionReadiness:
        explanationInput.actionReadiness,
      questionContext,
      originalQuestion:
        fixture.questionText,
    });

  const checks =
    buildSelectorChecks(
      {
        evidence:
          filteredEvidence,
        conditions:
          filteredConditions,
        risks:
          filteredRisks,
        topic:
          explanationInput.topic,
      },
      selection,
    );

  return {
    name:
      fixture.name,

    questionText:
      fixture.questionText,

    category:
      fixture.category,

    focus,

    inputCounts: {
      evidence:
        filteredEvidence.length,
      conditions:
        filteredConditions.length,
      risks:
        filteredRisks.length,
    },

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function buildSpecialPathNotes():
  QuestionSpecificMaterialSelectorSpecialPathNote[] {
  return [
    {
      path:
        "lifeFlowInterpretation",

      includedInSelectorVerification:
        true,

      reason:
        "D_lifeFlowYear / D_lifeFlowMonth case는 Decision Engine → P4-1 relevance filter 이후 questionIntent 중심의 최소 material을 제공한다. lifeFlowInterpretation plan special path는 이번 verification 범위 밖이며, selector는 relevance-filtered material에 대해 정상 검증한다.",
    },
    {
      path:
        "roleRecommendation",

      includedInSelectorVerification:
        false,

      reason:
        "roleRecommendation special path는 별도 assessment 기반 explanation flow를 사용하며, 이번 STEP의 8개 대표 질문 fixture 범주에 포함되지 않는다. Decision material tier selector verification 대상에서 제외한다.",
    },
  ];
}

export function verifyQuestionSpecificMaterialSelector():
  QuestionSpecificMaterialSelectorVerificationResult {
  const cases =
    SELECTOR_CASE_FIXTURES.map(
      buildCaseResult,
    );

  return {
    cases,
    specialPathNotes:
      buildSpecialPathNotes(),

    passed:
      cases.every(
        (caseResult) =>
          caseResult.passed,
      ),
  };
}
