import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture.js";

import {
  runDecisionEngine,
} from "../decision/decisionEngine.js";

import type {
  DecisionResult,
} from "../decision/decisionTypes.js";

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
  buildDecisionExplanationPlan,
  type DecisionExplanationPlan,
} from "./decisionExplanationPlan.js";

import {
  resolveDecisionExplanationFocus,
  type DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

import {
  filterRelevantConditions,
  filterRelevantEvidence,
  filterRelevantRisks,
} from "./decisionExplanationMaterialRelevance.js";

import {
  buildDecisionExplanationPayload,
  type DecisionExplanationPayload,
} from "./decisionExplanationPayload.js";

const QUESTION_FIXTURES = [
  {
    name: "businessStart",
    questionText:
      "통닭집 창업을 해도 될까요?",
  },
  {
    name: "money",
    questionText:
      "이번에 빌려준 돈을 받을 수 있을까요?",
  },
  {
    name: "continuation",
    questionText:
      "남자친구와 계속 만나야 할까요?",
  },
  {
    name: "compatibility",
    questionText:
      "우리 둘의 궁합은 어떤가요?",
  },
  {
    name: "termination",
    questionText:
      "현재 직장을 옮겨 이직해도 될까요?",
  },
  {
    name: "realEstateBuy",
    questionText:
      "대출 부담이 있는데 상가를 매수해도 될까요?",
  },
  {
    name: "lifeFlowInterpretation",
    questionText:
      "올해 총운을 봐주세요",
  },
] as const;

const DECISION_QUESTION_NAMES = new Set<
  QuestionTypeFixtureName
>([
  "businessStart",
  "money",
  "continuation",
  "compatibility",
  "termination",
  "realEstateBuy",
]);

const COMPATIBILITY_KEYS = new Set([
  "identifyCompatibilityCounterpart",
  "compatibilityCounterpartMissing",
]);

export type QuestionTypeFixtureName =
  typeof QUESTION_FIXTURES[number]["name"];

export type QuestionTypeObservation = {
  name:
    QuestionTypeFixtureName;

  questionText:
    string;

  topic:
    DecisionExplanationInput["topic"];

  intent:
    DecisionExplanationInput["intent"];

  decisionTarget:
    DecisionExplanationInput["decisionTarget"];

  verdict:
    DecisionExplanationInput["verdict"];

  explanationFocus:
    DecisionExplanationFocus
    | null;

  evidence:
    DecisionExplanationEvidence[];

  filteredEvidence:
    DecisionExplanationEvidence[];

  rawEvidenceCount:
    number;

  filteredEvidenceCount:
    number;

  rawEvidenceSources:
    string[];

  filteredEvidenceSources:
    string[];

  filteredEvidenceDescriptions:
    string[];

  promptEvidenceDescriptions:
    string[];

  uniquePromptEvidenceDescriptions:
    string[];

  conditions:
    DecisionExplanationCondition[];

  risks:
    DecisionExplanationRisk[];

  rawConditionCount:
    number;

  rawRiskCount:
    number;

  rawConditionKeys:
    string[];

  rawRiskKeys:
    string[];

  conditionCount:
    number;

  riskCount:
    number;

  conditionKeys:
    string[];

  riskKeys:
    string[];

  uniqueConditionKeys:
    string[];

  uniqueRiskKeys:
    string[];

  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export type PairwiseOverlapObservation = {
  questionA:
    QuestionTypeFixtureName;

  questionB:
    QuestionTypeFixtureName;

  commonConditionKeys:
    string[];

  commonConditionCount:
    number;

  commonRiskKeys:
    string[];

  commonRiskCount:
    number;

  commonEvidenceDescriptions:
    string[];

  commonEvidenceCount:
    number;

  conditionOverlapRatio:
    number;

  riskOverlapRatio:
    number;

  evidenceOverlapRatio:
    number;
};

export type PairwiseDifferentiationAssertion = {
  name:
    string;

  questionA:
    QuestionTypeFixtureName;

  questionB:
    QuestionTypeFixtureName;

  materialKind:
    "condition"
    | "risk"
    | "evidence";

  leftKeys:
    string[];

  rightKeys:
    string[];

  keySetsAreIdentical:
    boolean;

  leftDescriptions?:
    string[];

  rightDescriptions?:
    string[];

  descriptionSetsAreIdentical?:
    boolean;

  passed:
    boolean;
};

export type DecisionExplanationQuestionTypeDifferentiationVerificationResult = {
  observations:
    QuestionTypeObservation[];

  rawDecisionQuestionPairwiseOverlaps:
    PairwiseOverlapObservation[];

  decisionQuestionPairwiseOverlaps:
    PairwiseOverlapObservation[];

  pairwiseDifferentiationAssertions:
    PairwiseDifferentiationAssertion[];

  summary: {
    decisionQuestionCount:
      number;

    pairwiseComparisonCount:
      number;

    rawAverageCommonConditionCount:
      number;

    rawAverageCommonRiskCount:
      number;

    rawAverageConditionOverlapRatio:
      number;

    rawAverageRiskOverlapRatio:
      number;

    averageCommonConditionCount:
      number;

    averageCommonRiskCount:
      number;

    averageConditionOverlapRatio:
      number;

    averageRiskOverlapRatio:
      number;

    averageCommonEvidenceCount:
      number;

    averageEvidenceOverlapRatio:
      number;

    rawAverageCommonEvidenceCount:
      number;

    rawAverageEvidenceOverlapRatio:
      number;

    pairwiseDifferentiationAssertionCount:
      number;

    pairwiseDifferentiationPassedCount:
      number;
  };

  passed:
    boolean;
};

const PAIRWISE_DIFFERENTIATION_REGRESSION_CONTRACTS = [
  {
    questionA:
      "termination",
    questionB:
      "realEstateBuy",
    assertConditionKeysAreNotIdentical:
      true,
    assertRiskKeysAreNotIdentical:
      true,
  },
  {
    questionA:
      "money",
    questionB:
      "termination",
    assertRiskKeysAreNotIdentical:
      true,
  },
  {
    questionA:
      "money",
    questionB:
      "realEstateBuy",
    assertRiskKeysAreNotIdentical:
      true,
  },
  {
    questionA:
      "money",
    questionB:
      "continuation",
    assertEvidenceDescriptionsAreNotIdentical:
      true,
  },
  {
    questionA:
      "money",
    questionB:
      "businessStart",
    assertEvidenceDescriptionsAreNotIdentical:
      true,
  },
  {
    questionA:
      "continuation",
    questionB:
      "termination",
    assertEvidenceDescriptionsAreNotIdentical:
      true,
  },
] as const satisfies readonly {
  questionA:
    QuestionTypeFixtureName;

  questionB:
    QuestionTypeFixtureName;

  assertConditionKeysAreNotIdentical?:
    true;

  assertRiskKeysAreNotIdentical?:
    true;

  assertEvidenceDescriptionsAreNotIdentical?:
    true;
}[];

type BuiltArtifacts = {
  fixture:
    typeof QUESTION_FIXTURES[number];

  decisionResult:
    DecisionResult;

  questionContext:
    QuestionContext;

  explanationInput:
    DecisionExplanationInput;

  plan:
    DecisionExplanationPlan;

  payload:
    DecisionExplanationPayload;
};

function buildArtifacts(
  questionText:
    string,
): Omit<
  BuiltArtifacts,
  "fixture"
> {
  const input =
    buildDecisionEngineRegressionInput({
      questionText,
    });

  const question =
    readQuestion(
      input.humanContext,
      questionText,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const decisionResult =
    runDecisionEngine({
      ...input,
      question,
      questionContext,
    });

  const explanationInput =
    readDecisionResult(
      decisionResult,
    );

  const plan =
    buildDecisionExplanationPlan(
      explanationInput,
      question.originalQuestion,
      questionContext,
    );

  const payload =
    buildDecisionExplanationPayload(
      plan,
    );

  return {
    decisionResult,
    questionContext,
    explanationInput,
    plan,
    payload,
  };
}

function extractEvidenceSources(
  evidence:
    readonly DecisionExplanationEvidence[],
): string[] {
  return [
    ...new Set(
      evidence.map(
        (item) =>
          item.source,
      ),
    ),
  ];
}

function extractEvidenceDescriptions(
  evidence:
    readonly DecisionExplanationEvidence[],
): string[] {
  return evidence.map(
    (item) =>
      item.description.trim(),
  ).filter(
    (description) =>
      description.length
      > 0,
  );
}

function extractPromptEvidenceDescriptions(
  plan:
    DecisionExplanationPlan,
): string[] {
  const evidenceBlock =
    plan.blocks.find(
      (block) =>
        block.step
        === "evidence",
    );

  if (
    !evidenceBlock
    || evidenceBlock.content.trim()
      .length
    === 0
  ) {
    return [];
  }

  return evidenceBlock.content
    .split(
      /\r?\n/,
    )
    .map(
      (line) =>
        line.trim(),
    )
    .filter(
      (line) =>
        line.length
        > 0,
    );
}

function extractKeys(
  items:
    readonly { key: string }[],
): string[] {
  return items.map(
    (item) =>
      item.key,
  );
}

function isSubsetOf(
  subset:
    readonly string[],
  superset:
    readonly string[],
): boolean {
  const supersetSet =
    new Set(
      superset,
    );

  return subset.every(
    (key) =>
      supersetSet.has(
        key,
      ),
  );
}

function isRepeatedPatternKey(
  key:
    string,
): boolean {
  return key.startsWith(
    "repeatedPattern-",
  );
}

function isCompatibilityKey(
  key:
    string,
): boolean {
  return COMPATIBILITY_KEYS.has(
    key,
  );
}

function computeFilteredKeys(
  artifacts:
    Omit<
      BuiltArtifacts,
      "fixture"
    >,
): {
  filteredConditions:
    DecisionExplanationCondition[];

  filteredRisks:
    DecisionExplanationRisk[];

  filteredEvidence:
    DecisionExplanationEvidence[];
} {
  const explanationFocus =
    artifacts.plan.explanationFocus
    ?? resolveDecisionExplanationFocus({
      intent:
        artifacts.explanationInput.intent,
      decisionTarget:
        artifacts.explanationInput.decisionTarget,
      topic:
        artifacts.explanationInput.topic,
      originalQuestion:
        artifacts.plan.originalQuestion,
      questionContext:
        artifacts.questionContext,
    });

  const relevanceContext = {
    focus:
      explanationFocus,
    questionContext:
      artifacts.questionContext,
    actionReadiness:
      artifacts.explanationInput.actionReadiness,
    decisionTarget:
      artifacts.explanationInput.decisionTarget,
  };

  return {
    filteredConditions:
      filterRelevantConditions(
        artifacts.explanationInput.conditions,
        relevanceContext,
      ),
    filteredRisks:
      filterRelevantRisks(
        artifacts.explanationInput.risks,
        relevanceContext,
      ),
    filteredEvidence:
      filterRelevantEvidence(
        artifacts.explanationInput.evidence,
        relevanceContext,
      ),
  };
}

function intersectKeys(
  left:
    readonly string[],
  right:
    readonly string[],
): string[] {
  const rightSet =
    new Set(
      right,
    );

  return left.filter(
    (key) =>
      rightSet.has(
        key,
      ),
  );
}

function computeOverlapRatio(
  commonCount:
    number,
  leftCount:
    number,
  rightCount:
    number,
): number {
  const unionCount =
    leftCount
    + rightCount
    - commonCount;

  if (
    unionCount
    === 0
  ) {
    return 0;
  }

  return (
    commonCount
    / unionCount
  );
}

function computeUniqueKeys(
  ownKeys:
    readonly string[],
  otherKeysList:
    readonly (readonly string[])[], 
): string[] {
  const otherKeySet =
    new Set(
      otherKeysList.flat(),
    );

  return ownKeys.filter(
    (key) =>
      !otherKeySet.has(
        key,
      ),
  );
}

function isDecisionQuestion(
  name:
    QuestionTypeFixtureName,
): boolean {
  return DECISION_QUESTION_NAMES.has(
    name,
  );
}

function buildBasicChecks(
  observation:
    Pick<
      QuestionTypeObservation,
      | "topic"
      | "intent"
      | "decisionTarget"
      | "verdict"
      | "evidence"
      | "conditions"
      | "risks"
      | "name"
    >,
): Record<
  string,
  boolean
> {
  const isLifeFlow =
    observation.name
    === "lifeFlowInterpretation";

  return {
    topicIsDefined:
      observation.topic
      !== undefined
      && observation.topic
        !== null,

    intentIsDefined:
      observation.intent
      !== undefined
      && observation.intent
        !== null,

    decisionTargetIsDefined:
      observation.decisionTarget
      !== undefined
      && observation.decisionTarget
        !== null,

    verdictIsDefined:
      observation.verdict
      !== undefined
      && observation.verdict
        !== null,

    evidenceIsCollected:
      Array.isArray(
        observation.evidence,
      ),

    conditionsAreCollected:
      Array.isArray(
        observation.conditions,
      ),

    risksAreCollected:
      Array.isArray(
        observation.risks,
      ),

    decisionQuestionHasEvidence:
      isLifeFlow
      || observation.evidence.length
        > 0,

    decisionQuestionHasConditionsOrRisks:
      isLifeFlow
      || observation.conditions.length
        > 0
      || observation.risks.length
        > 0,
  };
}

function buildRelevanceChecks(
  name:
    QuestionTypeFixtureName,
  filteredConditionKeys:
    readonly string[],
  filteredRiskKeys:
    readonly string[],
  rawConditionKeys:
    readonly string[],
  rawRiskKeys:
    readonly string[],
  questionContext:
    QuestionContext,
  engineVerdict:
    DecisionExplanationInput["verdict"],
  payloadVerdict:
    DecisionExplanationPayload["verdict"],
): Record<
  string,
  boolean
> {
  const allFilteredKeys = [
    ...filteredConditionKeys,
    ...filteredRiskKeys,
  ];

  const checks: Record<
    string,
    boolean
  > = {
    filteredConditionKeysAreSubsetOfRaw:
      isSubsetOf(
        filteredConditionKeys,
        rawConditionKeys,
      ),

    filteredRiskKeysAreSubsetOfRaw:
      isSubsetOf(
        filteredRiskKeys,
        rawRiskKeys,
      ),

    verdictIsUnchanged:
      engineVerdict
      === payloadVerdict,
  };

  if (
    name
    === "lifeFlowInterpretation"
  ) {
    return checks;
  }

  const hasRepeatedPattern =
    filteredRiskKeys.some(
      isRepeatedPatternKey,
    );
  const hasUseGradualGrowth =
    filteredConditionKeys.includes(
      "useGradualGrowth",
    );
  const hasConfirmExecutionConditions =
    filteredConditionKeys.includes(
      "confirmExecutionConditions",
    );
  const hasUrgentDecision =
    filteredRiskKeys.includes(
      "urgentDecision",
    );
  const hasCompatibilityKey =
    allFilteredKeys.some(
      isCompatibilityKey,
    );

  switch (
    name
  ) {
    case "compatibility":
      checks.excludesUseGradualGrowth =
        !hasUseGradualGrowth;
      checks.excludesRepeatedPatternRisks =
        !hasRepeatedPattern;
      if (
        questionContext
          .requirements
          .compatibilityAnalysisRequired
      ) {
        checks.allowsCompatibilityKeysWhenRequired =
          filteredConditionKeys.includes(
            "identifyCompatibilityCounterpart",
          )
          || filteredRiskKeys.includes(
            "compatibilityCounterpartMissing",
          )
          || !rawConditionKeys.includes(
            "identifyCompatibilityCounterpart",
          )
          && !rawRiskKeys.includes(
            "compatibilityCounterpartMissing",
          );
      }
      break;

    case "continuation":
      checks.excludesUseGradualGrowth =
        !hasUseGradualGrowth;
      checks.excludesRepeatedPatternRisks =
        !hasRepeatedPattern;
      checks.excludesConfirmExecutionConditions =
        !hasConfirmExecutionConditions;
      checks.excludesUrgentDecision =
        !hasUrgentDecision;
      break;

    case "businessStart":
    case "money":
      checks.excludesCompatibilityKeys =
        !hasCompatibilityKey;
      break;

    case "termination":
    case "realEstateBuy":
      checks.excludesCompatibilityKeys =
        !hasCompatibilityKey;
      break;

    default:
      break;
  }

  return checks;
}

function buildEvidenceRelevanceChecks(
  name:
    QuestionTypeFixtureName,
  filteredEvidence:
    readonly DecisionExplanationEvidence[],
  rawEvidence:
    readonly DecisionExplanationEvidence[],
  promptEvidenceDescriptions:
    readonly string[],
  engineVerdict:
    DecisionExplanationInput["verdict"],
  payloadVerdict:
    DecisionExplanationPayload["verdict"],
): Record<
  string,
  boolean
> {
  const filteredSources =
    extractEvidenceSources(
      filteredEvidence,
    );
  const rawSources =
    extractEvidenceSources(
      rawEvidence,
    );

  const checks: Record<
    string,
    boolean
  > = {
    filteredEvidenceSourcesAreSubsetOfRaw:
      isSubsetOf(
        filteredSources,
        rawSources,
      ),

    filteredEvidenceDescriptionsAreSubsetOfRaw:
      isSubsetOf(
        extractEvidenceDescriptions(
          filteredEvidence,
        ),
        extractEvidenceDescriptions(
          rawEvidence,
        ),
      ),

    engineEvidencePoolIsUnchanged:
      rawEvidence.length
      > 0,

    promptEvidenceIsAvailableForDecisionQuestion:
      name
      === "lifeFlowInterpretation"
      || !isDecisionQuestion(
        name,
      )
      || promptEvidenceDescriptions.length
        > 0,

    verdictIsUnchangedAfterEvidenceFiltering:
      engineVerdict
      === payloadVerdict,
  };

  if (
    name
    === "lifeFlowInterpretation"
  ) {
    return checks;
  }

  switch (
    name
  ) {
    case "money":
      checks.includesMoneyEvidence =
        filteredSources.includes(
          "money",
        );
      break;

    case "continuation":
      checks.includesRelationshipEvidence =
        filteredSources.includes(
          "relationship",
        );
      break;

    case "compatibility":
      checks.includesRelationshipEvidence =
        filteredSources.includes(
          "relationship",
        )
        || filteredSources.includes(
          "compatibility",
        );
      break;

    case "businessStart":
      checks.includesBusinessRelatedEvidence =
        filteredSources.some(
          (source) =>
            source
            === "capacity"
            || source
            === "money"
            || source
            === "career"
            || source
            === "relationship",
        );
      break;

    case "realEstateBuy":
      checks.includesMoneyOrContextEvidence =
        filteredSources.includes(
          "money",
        )
        || filteredSources.includes(
          "currentContext",
        )
        || filteredSources.includes(
          "lifeContext",
        );
      break;

    case "termination":
      checks.includesCareerOrContextEvidence =
        filteredSources.includes(
          "career",
        )
        || filteredSources.includes(
          "currentContext",
        );
      break;

    default:
      break;
  }

  return checks;
}

function buildObservation(
  artifacts:
    BuiltArtifacts,
  filteredConditions:
    DecisionExplanationCondition[],
  filteredRisks:
    DecisionExplanationRisk[],
  filteredEvidence:
    DecisionExplanationEvidence[],
  uniqueConditionKeys:
    string[],
  uniqueRiskKeys:
    string[],
  uniquePromptEvidenceDescriptions:
    string[],
): QuestionTypeObservation {
  const {
    fixture,
    decisionResult,
    questionContext,
    explanationInput,
    plan,
    payload,
  } = artifacts;

  const rawConditionKeys =
    extractKeys(
      explanationInput.conditions,
    );
  const rawRiskKeys =
    extractKeys(
      explanationInput.risks,
    );
  const conditionKeys =
    extractKeys(
      filteredConditions,
    );
  const riskKeys =
    extractKeys(
      filteredRisks,
    );
  const rawEvidenceSources =
    extractEvidenceSources(
      explanationInput.evidence,
    );
  const filteredEvidenceSources =
    extractEvidenceSources(
      filteredEvidence,
    );
  const filteredEvidenceDescriptions =
    extractEvidenceDescriptions(
      filteredEvidence,
    );
  const promptEvidenceDescriptions =
    extractPromptEvidenceDescriptions(
      plan,
    );

  const observation: QuestionTypeObservation = {
    name:
      fixture.name,

    questionText:
      fixture.questionText,

    topic:
      payload.topic,

    intent:
      payload.intent,

    decisionTarget:
      payload.decisionTarget,

    verdict:
      payload.verdict,

    explanationFocus:
      plan.explanationFocus
      ?? null,

    evidence:
      explanationInput.evidence,

    filteredEvidence,

    rawEvidenceCount:
      explanationInput.evidence.length,

    filteredEvidenceCount:
      filteredEvidence.length,

    rawEvidenceSources,
    filteredEvidenceSources,
    filteredEvidenceDescriptions,
    promptEvidenceDescriptions,
    uniquePromptEvidenceDescriptions,

    conditions:
      filteredConditions,

    risks:
      filteredRisks,

    rawConditionCount:
      explanationInput.conditions.length,

    rawRiskCount:
      explanationInput.risks.length,

    rawConditionKeys,
    rawRiskKeys,

    conditionCount:
      filteredConditions.length,

    riskCount:
      filteredRisks.length,

    conditionKeys,
    riskKeys,
    uniqueConditionKeys,
    uniqueRiskKeys,

    checks: {},
    passed:
      false,
  };

  observation.checks = {
    ...buildBasicChecks(
      observation,
    ),
    ...buildRelevanceChecks(
      fixture.name,
      conditionKeys,
      riskKeys,
      rawConditionKeys,
      rawRiskKeys,
      questionContext,
      decisionResult.verdict,
      payload.verdict,
    ),
    ...buildEvidenceRelevanceChecks(
      fixture.name,
      filteredEvidence,
      explanationInput.evidence,
      promptEvidenceDescriptions,
      decisionResult.verdict,
      payload.verdict,
    ),
  };

  observation.passed =
    Object.values(
      observation.checks,
    ).every(
      Boolean,
    );

  return observation;
}

function buildPairwiseOverlaps(
  observations:
    QuestionTypeObservation[],
  keySelector: (
    observation:
      QuestionTypeObservation,
  ) => {
    conditionKeys:
      string[];

    riskKeys:
      string[];

    evidenceDescriptions:
      string[];

    conditionCount:
      number;

    riskCount:
      number;

    evidenceCount:
      number;
  },
): PairwiseOverlapObservation[] {
  const decisionObservations =
    observations.filter(
      (observation) =>
        isDecisionQuestion(
          observation.name,
        ),
    );

  const overlaps:
    PairwiseOverlapObservation[] = [];

  for (
    let indexA = 0;
    indexA
    < decisionObservations.length;
    indexA += 1
  ) {
    for (
      let indexB = indexA + 1;
      indexB
      < decisionObservations.length;
      indexB += 1
    ) {
      const left =
        decisionObservations[indexA];
      const right =
        decisionObservations[indexB];

      const leftKeys =
        keySelector(
          left,
        );
      const rightKeys =
        keySelector(
          right,
        );

      const commonConditionKeys =
        intersectKeys(
          leftKeys.conditionKeys,
          rightKeys.conditionKeys,
        );
      const commonRiskKeys =
        intersectKeys(
          leftKeys.riskKeys,
          rightKeys.riskKeys,
        );
      const commonEvidenceDescriptions =
        intersectKeys(
          leftKeys.evidenceDescriptions,
          rightKeys.evidenceDescriptions,
        );

      overlaps.push({
        questionA:
          left.name,

        questionB:
          right.name,

        commonConditionKeys,
        commonConditionCount:
          commonConditionKeys.length,

        commonRiskKeys,
        commonRiskCount:
          commonRiskKeys.length,

        commonEvidenceDescriptions,
        commonEvidenceCount:
          commonEvidenceDescriptions.length,

        conditionOverlapRatio:
          computeOverlapRatio(
            commonConditionKeys.length,
            leftKeys.conditionCount,
            rightKeys.conditionCount,
          ),

        riskOverlapRatio:
          computeOverlapRatio(
            commonRiskKeys.length,
            leftKeys.riskCount,
            rightKeys.riskCount,
          ),

        evidenceOverlapRatio:
          computeOverlapRatio(
            commonEvidenceDescriptions.length,
            leftKeys.evidenceCount,
            rightKeys.evidenceCount,
          ),
      });
    }
  }

  return overlaps;
}

function areKeySetsIdentical(
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

  const rightSet =
    new Set(
      right,
    );

  return left.every(
    (key) =>
      rightSet.has(
        key,
      ),
  );
}

function areDescriptionSetsIdentical(
  left:
    readonly string[],
  right:
    readonly string[],
): boolean {
  return areKeySetsIdentical(
    left,
    right,
  );
}

function buildPairwiseDifferentiationCheckName(
  questionA:
    QuestionTypeFixtureName,
  questionB:
    QuestionTypeFixtureName,
  materialKind:
    "condition"
    | "risk"
    | "evidence",
): string {
  const materialLabel =
    materialKind
    === "evidence"
      ? "EvidenceDescriptions"
      : `${materialKind.charAt(0).toUpperCase()}${materialKind.slice(1)}Keys`;

  return (
    `${questionA}${questionB.charAt(0).toUpperCase()}${questionB.slice(1)}`
    + `Filtered${materialLabel}`
    + "AreNotIdentical"
  );
}

function buildPairwiseDifferentiationAssertions(
  observations:
    QuestionTypeObservation[],
): PairwiseDifferentiationAssertion[] {
  const observationByName =
    new Map(
      observations.map(
        (observation) =>
          [
            observation.name,
            observation,
          ] as const,
      ),
    );

  const assertions:
    PairwiseDifferentiationAssertion[] = [];

  for (
    const contract
    of PAIRWISE_DIFFERENTIATION_REGRESSION_CONTRACTS
  ) {
    const left =
      observationByName.get(
        contract.questionA,
      );
    const right =
      observationByName.get(
        contract.questionB,
      );

    if (
      !left
      || !right
    ) {
      throw new Error(
        `Missing observation for pairwise differentiation contract: ${contract.questionA} ↔ ${contract.questionB}`,
      );
    }

    if (
      "assertConditionKeysAreNotIdentical"
      in contract
      && contract.assertConditionKeysAreNotIdentical
    ) {
      const keySetsAreIdentical =
        areKeySetsIdentical(
          left.conditionKeys,
          right.conditionKeys,
        );

      assertions.push({
        name:
          buildPairwiseDifferentiationCheckName(
            contract.questionA,
            contract.questionB,
            "condition",
          ),

        questionA:
          contract.questionA,

        questionB:
          contract.questionB,

        materialKind:
          "condition",

        leftKeys:
          left.conditionKeys,

        rightKeys:
          right.conditionKeys,

        keySetsAreIdentical,

        passed:
          !keySetsAreIdentical,
      });
    }

    if (
      "assertRiskKeysAreNotIdentical"
      in contract
      && contract.assertRiskKeysAreNotIdentical
    ) {
      const keySetsAreIdentical =
        areKeySetsIdentical(
          left.riskKeys,
          right.riskKeys,
        );

      assertions.push({
        name:
          buildPairwiseDifferentiationCheckName(
            contract.questionA,
            contract.questionB,
            "risk",
          ),

        questionA:
          contract.questionA,

        questionB:
          contract.questionB,

        materialKind:
          "risk",

        leftKeys:
          left.riskKeys,

        rightKeys:
          right.riskKeys,

        keySetsAreIdentical,

        passed:
          !keySetsAreIdentical,
      });
    }

    if (
      "assertEvidenceDescriptionsAreNotIdentical"
      in contract
      && contract.assertEvidenceDescriptionsAreNotIdentical
    ) {
      const descriptionSetsAreIdentical =
        areDescriptionSetsIdentical(
          left.promptEvidenceDescriptions,
          right.promptEvidenceDescriptions,
        );

      assertions.push({
        name:
          buildPairwiseDifferentiationCheckName(
            contract.questionA,
            contract.questionB,
            "evidence",
          ),

        questionA:
          contract.questionA,

        questionB:
          contract.questionB,

        materialKind:
          "evidence",

        leftKeys:
          left.promptEvidenceDescriptions,

        rightKeys:
          right.promptEvidenceDescriptions,

        keySetsAreIdentical:
          descriptionSetsAreIdentical,

        leftDescriptions:
          left.promptEvidenceDescriptions,

        rightDescriptions:
          right.promptEvidenceDescriptions,

        descriptionSetsAreIdentical,

        passed:
          !descriptionSetsAreIdentical,
      });
    }
  }

  return assertions;
}

function average(
  values:
    readonly number[],
): number {
  if (
    values.length
    === 0
  ) {
    return 0;
  }

  const total =
    values.reduce(
      (
        sum,
        value,
      ) =>
        sum + value,
      0,
    );

  return (
    total
    / values.length
  );
}

function buildOverlapSummary(
  overlaps:
    PairwiseOverlapObservation[],
): {
  averageCommonConditionCount:
    number;

  averageCommonRiskCount:
    number;

  averageConditionOverlapRatio:
    number;

  averageRiskOverlapRatio:
    number;

  averageCommonEvidenceCount:
    number;

  averageEvidenceOverlapRatio:
    number;
} {
  return {
    averageCommonConditionCount:
      average(
        overlaps.map(
          (overlap) =>
            overlap.commonConditionCount,
        ),
      ),

    averageCommonRiskCount:
      average(
        overlaps.map(
          (overlap) =>
            overlap.commonRiskCount,
        ),
      ),

    averageConditionOverlapRatio:
      average(
        overlaps.map(
          (overlap) =>
            overlap.conditionOverlapRatio,
        ),
      ),

    averageRiskOverlapRatio:
      average(
        overlaps.map(
          (overlap) =>
            overlap.riskOverlapRatio,
        ),
      ),

    averageCommonEvidenceCount:
      average(
        overlaps.map(
          (overlap) =>
            overlap.commonEvidenceCount,
        ),
      ),

    averageEvidenceOverlapRatio:
      average(
        overlaps.map(
          (overlap) =>
            overlap.evidenceOverlapRatio,
        ),
      ),
  };
}

export function verifyDecisionExplanationQuestionTypeDifferentiation():
  DecisionExplanationQuestionTypeDifferentiationVerificationResult {
  const builtArtifacts =
    QUESTION_FIXTURES.map(
      (fixture) => {
        const artifacts =
          buildArtifacts(
            fixture.questionText,
          );

        const {
          filteredConditions,
          filteredRisks,
          filteredEvidence,
        } = computeFilteredKeys(
          artifacts,
        );

        return {
          fixture,
          decisionResult:
            artifacts.decisionResult,
          questionContext:
            artifacts.questionContext,
          explanationInput:
            artifacts.explanationInput,
          plan:
            artifacts.plan,
          payload:
            artifacts.payload,
          filteredConditions,
          filteredRisks,
          filteredEvidence,
        };
      },
    );

  const decisionArtifacts =
    builtArtifacts.filter(
      (artifacts) =>
        isDecisionQuestion(
          artifacts.fixture.name,
        ),
    );

  const observations =
    builtArtifacts.map(
      (artifacts) => {
        const ownConditionKeys =
          extractKeys(
            artifacts.filteredConditions,
          );
        const ownRiskKeys =
          extractKeys(
            artifacts.filteredRisks,
          );

        const ownPromptEvidenceDescriptions =
          extractPromptEvidenceDescriptions(
            artifacts.plan,
          );

        const otherDecisionConditionKeys =
          isDecisionQuestion(
            artifacts.fixture.name,
          )
            ? decisionArtifacts
              .filter(
                (other) =>
                  other.fixture.name
                  !== artifacts.fixture.name,
              )
              .map(
                (other) =>
                  extractKeys(
                    other.filteredConditions,
                  ),
              )
            : [];

        const otherDecisionRiskKeys =
          isDecisionQuestion(
            artifacts.fixture.name,
          )
            ? decisionArtifacts
              .filter(
                (other) =>
                  other.fixture.name
                  !== artifacts.fixture.name,
              )
              .map(
                (other) =>
                  extractKeys(
                    other.filteredRisks,
                  ),
              )
            : [];

        const uniqueConditionKeys =
          isDecisionQuestion(
            artifacts.fixture.name,
          )
            ? computeUniqueKeys(
              ownConditionKeys,
              otherDecisionConditionKeys,
            )
            : ownConditionKeys;

        const uniqueRiskKeys =
          isDecisionQuestion(
            artifacts.fixture.name,
          )
            ? computeUniqueKeys(
              ownRiskKeys,
              otherDecisionRiskKeys,
            )
            : ownRiskKeys;

        const otherDecisionPromptEvidenceDescriptions =
          isDecisionQuestion(
            artifacts.fixture.name,
          )
            ? decisionArtifacts
              .filter(
                (other) =>
                  other.fixture.name
                  !== artifacts.fixture.name,
              )
              .map(
                (other) =>
                  extractPromptEvidenceDescriptions(
                    other.plan,
                  ),
              )
            : [];

        const uniquePromptEvidenceDescriptions =
          isDecisionQuestion(
            artifacts.fixture.name,
          )
            ? computeUniqueKeys(
              ownPromptEvidenceDescriptions,
              otherDecisionPromptEvidenceDescriptions,
            )
            : ownPromptEvidenceDescriptions;

        return buildObservation(
          {
            fixture:
              artifacts.fixture,
            decisionResult:
              artifacts.decisionResult,
            questionContext:
              artifacts.questionContext,
            explanationInput:
              artifacts.explanationInput,
            plan:
              artifacts.plan,
            payload:
              artifacts.payload,
          },
          artifacts.filteredConditions,
          artifacts.filteredRisks,
          artifacts.filteredEvidence,
          uniqueConditionKeys,
          uniqueRiskKeys,
          uniquePromptEvidenceDescriptions,
        );
      },
    );

  const rawDecisionQuestionPairwiseOverlaps =
    buildPairwiseOverlaps(
      observations,
      (observation) => ({
        conditionKeys:
          observation.rawConditionKeys,
        riskKeys:
          observation.rawRiskKeys,
        evidenceDescriptions:
          extractEvidenceDescriptions(
            observation.evidence,
          ),
        conditionCount:
          observation.rawConditionCount,
        riskCount:
          observation.rawRiskCount,
        evidenceCount:
          observation.rawEvidenceCount,
      }),
    );

  const decisionQuestionPairwiseOverlaps =
    buildPairwiseOverlaps(
      observations,
      (observation) => ({
        conditionKeys:
          observation.conditionKeys,
        riskKeys:
          observation.riskKeys,
        evidenceDescriptions:
          observation.promptEvidenceDescriptions,
        conditionCount:
          observation.conditionCount,
        riskCount:
          observation.riskCount,
        evidenceCount:
          observation.promptEvidenceDescriptions.length,
      }),
    );

  const rawOverlapSummary =
    buildOverlapSummary(
      rawDecisionQuestionPairwiseOverlaps,
    );
  const filteredOverlapSummary =
    buildOverlapSummary(
      decisionQuestionPairwiseOverlaps,
    );

  const pairwiseDifferentiationAssertions =
    buildPairwiseDifferentiationAssertions(
      observations,
    );

  const summary = {
    decisionQuestionCount:
      decisionArtifacts.length,

    pairwiseComparisonCount:
      decisionQuestionPairwiseOverlaps.length,

    rawAverageCommonConditionCount:
      rawOverlapSummary.averageCommonConditionCount,

    rawAverageCommonRiskCount:
      rawOverlapSummary.averageCommonRiskCount,

    rawAverageConditionOverlapRatio:
      rawOverlapSummary.averageConditionOverlapRatio,

    rawAverageRiskOverlapRatio:
      rawOverlapSummary.averageRiskOverlapRatio,

    rawAverageCommonEvidenceCount:
      rawOverlapSummary.averageCommonEvidenceCount,

    rawAverageEvidenceOverlapRatio:
      rawOverlapSummary.averageEvidenceOverlapRatio,

    ...filteredOverlapSummary,

    pairwiseDifferentiationAssertionCount:
      pairwiseDifferentiationAssertions.length,

    pairwiseDifferentiationPassedCount:
      pairwiseDifferentiationAssertions.filter(
        (assertion) =>
          assertion.passed,
      ).length,
  };

  return {
    observations,
    rawDecisionQuestionPairwiseOverlaps,
    decisionQuestionPairwiseOverlaps,
    pairwiseDifferentiationAssertions,
    summary,
    passed:
      observations.every(
        (observation) =>
          observation.passed,
      )
      && pairwiseDifferentiationAssertions.every(
        (assertion) =>
          assertion.passed,
      ),
  };
}
