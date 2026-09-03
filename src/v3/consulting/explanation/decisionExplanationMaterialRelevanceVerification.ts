import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture.js";

import {
  runDecisionEngine,
} from "../decision/decisionEngine.js";

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
  type DecisionExplanationEvidence,
  type DecisionExplanationInput,
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

const RELEVANCE_CASE_FIXTURES = [
  {
    name: "A_businessStart",
    questionText:
      "통닭집 창업을 해도 될까요?",
  },
  {
    name: "F_businessTiming",
    questionText:
      "지금 통닭집을 시작하면 성공할까요?",
  },
  {
    name: "G_businessFieldFit",
    questionText:
      "어떤 사업 분야가 나에게 맞을까요?",
  },
  {
    name: "B_moneyRecovery",
    questionText:
      "이번에 빌려준 돈을 받을 수 있을까요?",
  },
  {
    name: "C_continuation",
    questionText:
      "남자친구와 계속 만나야 할까요?",
  },
  {
    name: "D_lifeFlowYear",
    questionText:
      "올해 총운을 봐주세요",
  },
  {
    name: "D_lifeFlowMonth",
    questionText:
      "2026년 12월 운세는 어떨까요?",
  },
  {
    name: "E_compatibility",
    questionText:
      "우리 둘의 궁합은 어떤가요?",
  },
] as const;

export type MaterialRelevanceCaseName =
  typeof RELEVANCE_CASE_FIXTURES[number]["name"];

type MaterialKeySnapshot = {
  evidenceSources:
    readonly string[];

  conditionKeys:
    readonly string[];

  riskKeys:
    readonly string[];
};

/**
 * filterRelevant* 함수의 현재 동작을 regression으로 고정한다.
 * 정책 변경이 아니라 측정 기준선(baseline)이다.
 */
const FILTERED_MATERIAL_REGRESSION_BASELINE:
  Record<
    MaterialRelevanceCaseName,
    MaterialKeySnapshot
  > = {
  A_businessStart: {
    evidenceSources: [
      "capacity",
      "career",
      "destiny",
      "lifeDriver",
      "lifePhase",
      "questionIntent",
      "repeatedPattern",
      "survivalStyle",
    ],
    conditionKeys: [
      "useGradualGrowth",
    ],
    riskKeys: [
      "repeatedPattern-1",
      "repeatedPattern-2",
    ],
  },

  F_businessTiming: {
    evidenceSources: [
      "capacity",
      "career",
      "destiny",
      "lifeDriver",
      "lifePhase",
      "questionIntent",
      "repeatedPattern",
      "survivalStyle",
    ],
    conditionKeys: [
      "completeTimingEvidence",
      "confirmExecutionConditions",
      "useGradualGrowth",
    ],
    riskKeys: [
      "repeatedPattern-1",
      "repeatedPattern-2",
      "urgentDecision",
    ],
  },

  G_businessFieldFit: {
    evidenceSources: [
      "capacity",
      "career",
      "destiny",
      "lifeDriver",
      "questionIntent",
      "repeatedPattern",
      "survivalStyle",
    ],
    conditionKeys: [
      "clarifyDecisionTarget",
    ],
    riskKeys: [
      "repeatedPattern-1",
      "repeatedPattern-2",
    ],
  },

  B_moneyRecovery: {
    evidenceSources: [
      "capacity",
      "money",
      "questionIntent",
    ],
    conditionKeys: [
      "completePreparation",
    ],
    riskKeys: [],
  },

  C_continuation: {
    evidenceSources: [
      "blessing",
      "destiny",
      "questionIntent",
      "relationship",
    ],
    conditionKeys: [
      "completePreparation",
      "readerDecisionCondition-relationship-emotionalExchange",
    ],
    riskKeys: [
      "readerDecisionRisk-relationship-emotionalExchange",
    ],
  },

  D_lifeFlowYear: {
    evidenceSources: [
      "questionIntent",
    ],
    conditionKeys: [],
    riskKeys: [],
  },

  D_lifeFlowMonth: {
    evidenceSources: [
      "questionIntent",
    ],
    conditionKeys: [],
    riskKeys: [],
  },

  E_compatibility: {
    evidenceSources: [
      "questionIntent",
      "relationship",
    ],
    conditionKeys: [
      "clarifyDecisionTarget",
      "identifyCompatibilityCounterpart",
      "readerDecisionCondition-relationship-emotionalExchange",
    ],
    riskKeys: [
      "compatibilityCounterpartMissing",
      "readerDecisionRisk-relationship-emotionalExchange",
    ],
  },
};

export type MaterialRelevanceCaseResult = {
  name:
    MaterialRelevanceCaseName;

  questionText:
    string;

  classification: {
    focus:
      DecisionExplanationFocus;

    topic:
      DecisionExplanationInput["topic"];

    intent:
      DecisionExplanationInput["intent"];

    decisionTarget:
      DecisionExplanationInput["decisionTarget"];
  };

  raw: MaterialKeySnapshot;

  filtered: MaterialKeySnapshot;

  regressionMatch: {
    evidenceSources:
      boolean;

    conditionKeys:
      boolean;

    riskKeys:
      boolean;
  };

  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export type CrossCaseMaterialOverlap = {
  caseA:
    MaterialRelevanceCaseName;

  caseB:
    MaterialRelevanceCaseName;

  commonEvidenceSources:
    string[];

  commonConditionKeys:
    string[];

  commonRiskKeys:
    string[];
};

export type DecisionExplanationMaterialRelevanceVerificationResult = {
  cases:
    MaterialRelevanceCaseResult[];

  crossCaseOverlaps:
    CrossCaseMaterialOverlap[];

  passed:
    boolean;
};

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
  ].sort();
}

function extractKeys(
  items:
    readonly { key: string }[],
): string[] {
  return items.map(
    (item) =>
      item.key,
  ).sort();
}

function areStringSetsEqual(
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

function intersectSortedKeys(
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

function buildCaseChecks(
  name:
    MaterialRelevanceCaseName,
  focus:
    DecisionExplanationFocus,
  filtered:
    MaterialKeySnapshot,
  raw:
    MaterialKeySnapshot,
  regressionMatch:
    MaterialRelevanceCaseResult["regressionMatch"],
): Record<
  string,
  boolean
> {
  const checks: Record<
    string,
    boolean
  > = {
    filteredEvidenceSourcesAreSubsetOfRaw:
      filtered.evidenceSources.every(
        (source) =>
          raw.evidenceSources.includes(
            source,
          ),
      ),

    filteredConditionKeysAreSubsetOfRaw:
      filtered.conditionKeys.every(
        (key) =>
          raw.conditionKeys.includes(
            key,
          ),
      ),

    filteredRiskKeysAreSubsetOfRaw:
      filtered.riskKeys.every(
        (key) =>
          raw.riskKeys.includes(
            key,
          ),
      ),

    evidenceRegressionMatchesBaseline:
      regressionMatch.evidenceSources,

    conditionRegressionMatchesBaseline:
      regressionMatch.conditionKeys,

    riskRegressionMatchesBaseline:
      regressionMatch.riskKeys,
  };

  switch (
    name
  ) {
    case "A_businessStart":
      checks.resolvesToBusinessStartFocus =
        focus
        === "businessStart";
      checks.includesCapacityEvidence =
        filtered.evidenceSources.includes(
          "capacity",
        );
      checks.includesLifePhaseEvidence =
        filtered.evidenceSources.includes(
          "lifePhase",
        );
      checks.excludesHumanIdentityEvidence =
        !filtered.evidenceSources.includes(
          "humanIdentity",
        );
      checks.excludesRelationshipEvidence =
        !filtered.evidenceSources.includes(
          "relationship",
        );
      checks.includesUseGradualGrowthCondition =
        filtered.conditionKeys.includes(
          "useGradualGrowth",
        );
      checks.excludesCompleteTimingEvidenceCondition =
        !filtered.conditionKeys.includes(
          "completeTimingEvidence",
        );
      break;

    case "F_businessTiming":
      checks.resolvesToBusinessTimingFocus =
        focus
        === "businessTiming";
      checks.includesCapacityEvidence =
        filtered.evidenceSources.includes(
          "capacity",
        );
      checks.includesLifePhaseEvidence =
        filtered.evidenceSources.includes(
          "lifePhase",
        );
      checks.excludesHumanIdentityEvidence =
        !filtered.evidenceSources.includes(
          "humanIdentity",
        );
      checks.excludesRelationshipEvidence =
        !filtered.evidenceSources.includes(
          "relationship",
        );
      checks.includesCompleteTimingEvidenceCondition =
        filtered.conditionKeys.includes(
          "completeTimingEvidence",
        );
      checks.includesConfirmExecutionConditions =
        filtered.conditionKeys.includes(
          "confirmExecutionConditions",
        );
      checks.includesUrgentDecisionRisk =
        filtered.riskKeys.includes(
          "urgentDecision",
        );
      break;

    case "G_businessFieldFit":
      checks.resolvesToBusinessFieldFitFocus =
        focus
        === "businessFieldFit";
      checks.includesCapacityEvidence =
        filtered.evidenceSources.includes(
          "capacity",
        );
      checks.includesRepeatedPatternEvidence =
        filtered.evidenceSources.includes(
          "repeatedPattern",
        );
      checks.excludesLifePhaseEvidence =
        !filtered.evidenceSources.includes(
          "lifePhase",
        );
      checks.excludesHumanIdentityEvidence =
        !filtered.evidenceSources.includes(
          "humanIdentity",
        );
      checks.excludesRelationshipEvidence =
        !filtered.evidenceSources.includes(
          "relationship",
        );
      checks.includesClarifyDecisionTargetCondition =
        filtered.conditionKeys.includes(
          "clarifyDecisionTarget",
        );
      checks.includesRepeatedPatternRisks =
        filtered.riskKeys.includes(
          "repeatedPattern-1",
        )
        && filtered.riskKeys.includes(
          "repeatedPattern-2",
        );
      break;

    case "B_moneyRecovery":
      checks.includesMoneyEvidence =
        filtered.evidenceSources.includes(
          "money",
        );
      checks.includesQuestionIntentEvidence =
        filtered.evidenceSources.includes(
          "questionIntent",
        );
      checks.excludesBusinessStartOnlyEvidence =
        !filtered.evidenceSources.includes(
          "career",
        )
        && !filtered.evidenceSources.includes(
          "lifePhase",
        )
        && !filtered.evidenceSources.includes(
          "repeatedPattern",
        );
      break;

    case "C_continuation":
      checks.includesRelationshipEvidence =
        filtered.evidenceSources.includes(
          "relationship",
        );
      checks.excludesCareerEvidence =
        !filtered.evidenceSources.includes(
          "career",
        );
      checks.excludesMoneyEvidence =
        !filtered.evidenceSources.includes(
          "money",
        );
      break;

    case "D_lifeFlowYear":
    case "D_lifeFlowMonth":
      checks.onlyQuestionIntentEvidencePasses =
        filtered.evidenceSources.length
        === 1
        && filtered.evidenceSources[0]
        === "questionIntent";
      checks.noConditionsPass =
        filtered.conditionKeys.length
        === 0;
      checks.noRisksPass =
        filtered.riskKeys.length
        === 0;
      break;

    case "E_compatibility":
      checks.includesRelationshipEvidence =
        filtered.evidenceSources.includes(
          "relationship",
        );
      checks.excludesMoneyEvidence =
        !filtered.evidenceSources.includes(
          "money",
        );
      checks.excludesCareerEvidence =
        !filtered.evidenceSources.includes(
          "career",
        );
      checks.includesCompatibilityCondition =
        filtered.conditionKeys.includes(
          "identifyCompatibilityCounterpart",
        );
      break;

    default:
      break;
  }

  return checks;
}

function buildCaseResult(
  fixture:
    typeof RELEVANCE_CASE_FIXTURES[number],
): MaterialRelevanceCaseResult {
  const input =
    buildDecisionEngineRegressionInput({
      questionText:
        fixture.questionText,
    });

  const question =
    readQuestion(
      input.humanContext,
      fixture.questionText,
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

  const raw: MaterialKeySnapshot = {
    evidenceSources:
      extractEvidenceSources(
        explanationInput.evidence,
      ),
    conditionKeys:
      extractKeys(
        explanationInput.conditions,
      ),
    riskKeys:
      extractKeys(
        explanationInput.risks,
      ),
  };

  const filtered: MaterialKeySnapshot = {
    evidenceSources:
      extractEvidenceSources(
        filteredEvidence,
      ),
    conditionKeys:
      extractKeys(
        filteredConditions,
      ),
    riskKeys:
      extractKeys(
        filteredRisks,
      ),
  };

  const baseline =
    FILTERED_MATERIAL_REGRESSION_BASELINE[
      fixture.name
    ];

  const regressionMatch = {
    evidenceSources:
      areStringSetsEqual(
        filtered.evidenceSources,
        baseline.evidenceSources,
      ),
    conditionKeys:
      areStringSetsEqual(
        filtered.conditionKeys,
        baseline.conditionKeys,
      ),
    riskKeys:
      areStringSetsEqual(
        filtered.riskKeys,
        baseline.riskKeys,
      ),
  };

  const checks =
    buildCaseChecks(
      fixture.name,
      focus,
      filtered,
      raw,
      regressionMatch,
    );

  return {
    name:
      fixture.name,

    questionText:
      fixture.questionText,

    classification: {
      focus,
      topic:
        explanationInput.topic,
      intent:
        explanationInput.intent,
      decisionTarget:
        explanationInput.decisionTarget,
    },

    raw,
    filtered,
    regressionMatch,
    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function buildCrossCaseOverlaps(
  cases:
    MaterialRelevanceCaseResult[],
): CrossCaseMaterialOverlap[] {
  const targetNames:
    MaterialRelevanceCaseName[] = [
    "A_businessStart",
    "B_moneyRecovery",
    "C_continuation",
  ];

  const targetCases =
    cases.filter(
      (caseResult) =>
        targetNames.includes(
          caseResult.name,
        ),
    );

  const overlaps:
    CrossCaseMaterialOverlap[] = [];

  for (
    let indexA = 0;
    indexA
    < targetCases.length;
    indexA += 1
  ) {
    for (
      let indexB = indexA + 1;
      indexB
      < targetCases.length;
      indexB += 1
    ) {
      const left =
        targetCases[indexA];
      const right =
        targetCases[indexB];

      overlaps.push({
        caseA:
          left.name,

        caseB:
          right.name,

        commonEvidenceSources:
          intersectSortedKeys(
            left.filtered.evidenceSources,
            right.filtered.evidenceSources,
          ),

        commonConditionKeys:
          intersectSortedKeys(
            left.filtered.conditionKeys,
            right.filtered.conditionKeys,
          ),

        commonRiskKeys:
          intersectSortedKeys(
            left.filtered.riskKeys,
            right.filtered.riskKeys,
          ),
      });
    }
  }

  return overlaps;
}

export function verifyDecisionExplanationMaterialRelevance():
  DecisionExplanationMaterialRelevanceVerificationResult {
  const cases =
    RELEVANCE_CASE_FIXTURES.map(
      buildCaseResult,
    );

  const crossCaseOverlaps =
    buildCrossCaseOverlaps(
      cases,
    );

  return {
    cases,
    crossCaseOverlaps,

    passed:
      cases.every(
        (caseResult) =>
          caseResult.passed,
      ),
  };
}
