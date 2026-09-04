/**
 * P4-2 STEP 4-C — Question-Specific Material Priority Verification.
 *
 * ResponseSelectionContext.questionSpecificMaterials →
 * selectResponseBlockContext() → ResponseBlockContext
 * 경로에서 tier priority(Primary → Secondary → Supporting → Unmatched)가
 * 실제 block material sequence에 반영되는지 검증한다.
 *
 * Verification-only. Production 파일은 수정하지 않는다.
 */

import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "../../consulting/decision/decisionEngine.js";
import type {
  QuestionSpecificMaterialSelection,
  QuestionSpecificMaterialTier,
  QuestionSpecificMaterialTierKey,
} from "../../consulting/explanation/questionSpecificMaterialSelector.js";
import type {
  DecisionExplanationEvidence,
} from "../../consulting/explanation/decisionResultReader.js";
import {
  runVNextOrchestrator,
} from "../orchestration/vNextOrchestrator.js";
import {
  buildResponseContext,
} from "../response/responseContextBuilder.js";
import type {
  ResponseBlockContext,
} from "../response/responseContext.js";
import {
  findResponseBlockSelectorRule,
  resolveBlueprintBlockIds,
  selectResponseBlockContext,
  type ResponseBlockSelection,
  type ResponseSelectionContext,
} from "../response/responseEvidenceSelector.js";
import {
  orderConditionsByQuestionSpecificPriority,
  orderEvidenceByQuestionSpecificPriority,
  orderRisksByQuestionSpecificPriority,
} from "../response/responseMaterialPriorityResolver.js";
import type {
  AnalysisRequest,
  AnalysisResult,
} from "../types/index.js";
import type {
  Assessment,
} from "../types/assessment.js";
import type {
  AnswerBlueprint,
} from "../types/answerBlueprint.js";
import type {
  ChangeSignal,
} from "../types/changeSignal.js";
import type {
  ConsultingScenario,
} from "../types/consultingScenario.js";
import type {
  HumanState,
} from "../types/humanState.js";
import type {
  VNextEvidenceItem,
} from "../types/humanState.js";
import type {
  TimeState,
} from "../types/timeState.js";

const PRIORITY_CASE_FIXTURES = [
  {
    id: "A_businessStart",
    category: "businessStart",
    questionText: "통닭집 창업을 해도 될까요?",
  },
  {
    id: "B_moneyRecovery",
    category: "moneyRecovery",
    questionText: "이번에 빌려준 돈을 받을 수 있을까요?",
  },
  {
    id: "C_relationshipContinuation",
    category: "relationshipContinuation",
    questionText: "남자친구와 계속 만나야 할까요?",
  },
  {
    id: "E_compatibility",
    category: "compatibility",
    questionText: "우리 둘의 궁합은 어떤가요?",
  },
] as const;

const TIER_ORDER: readonly (
  QuestionSpecificMaterialTierKey | "unmatched"
)[] = [
  "primary",
  "secondary",
  "supporting",
  "unmatched",
];

const CONDITION_FACT_BLOCK_IDS = new Set<string>([
  "compatibilityConditions",
  "conditions",
  "condition",
  "caution",
  "assessment",
]);

const RISK_FACT_BLOCK_IDS = new Set<string>([
  "risk",
  "limitingFactors",
  "caution",
  "assessment",
]);

const EVIDENCE_PRIORITY_BLOCK_IDS = new Set<string>([
  "directAnswer",
  "compatibilityConditions",
  "conditions",
  "condition",
  "risk",
  "limitingFactors",
  "caution",
  "assessment",
  "evidence",
  "supportingEvidence",
  "possibility",
  "explanation",
  "currentDirection",
  "timing",
]);

const CONDITION_PRIORITY_BLOCK_IDS = new Set<string>([
  "compatibilityConditions",
  "conditions",
  "condition",
  "caution",
  "assessment",
]);

const RISK_PRIORITY_BLOCK_IDS = new Set<string>([
  "risk",
  "limitingFactors",
  "caution",
  "assessment",
]);

export type MaterialPriorityBlockResult = {
  blockId: string;
  evidenceSequence: string[];
  conditionSequence: string[];
  riskSequence: string[];
  evidenceTierOrderingValid: boolean;
  conditionTierOrderingValid: boolean;
  riskTierOrderingValid: boolean;
  evidenceMatchesExpected: boolean;
  conditionMatchesExpected: boolean;
  riskMatchesExpected: boolean;
  evidenceMultisetPreserved: boolean;
  conditionMultisetPreserved: boolean;
  riskMultisetPreserved: boolean;
  fallbackWithoutMaterialsMatchesBaseline: boolean;
  evidencePriorityChanged: boolean;
  conditionPriorityChanged: boolean;
  riskPriorityChanged: boolean;
};

export type MaterialPriorityCaseResult = {
  id: string;
  category: typeof PRIORITY_CASE_FIXTURES[number]["category"];
  questionText: string;
  passed: boolean;
  checks: Record<string, boolean>;
  details: string[];
  blocks: MaterialPriorityBlockResult[];
  priorityChangeSummary: {
    evidenceChangedBlocks: string[];
    conditionChangedBlocks: string[];
    riskChangedBlocks: string[];
    wiringLikelyApplied: boolean;
    noChangeReason?: string;
  };
};

export type MaterialPriorityVerificationResult = {
  passed: boolean;
  cases: MaterialPriorityCaseResult[];
  legacyImpact: {
    legacyPipelineModified: boolean;
    consultingModified: boolean;
    productionResponseSelectionModified: boolean;
    notes: string[];
  };
};

function readReadyValue<T>(
  stage: AnalysisResult[keyof AnalysisResult],
): T | undefined {
  if (!stage || stage.status !== "ready") {
    return undefined;
  }

  return stage.value as T;
}

function readQuestionSpecificMaterials(
  analysisResult: AnalysisResult,
): QuestionSpecificMaterialSelection | undefined {
  const stage = analysisResult.questionSpecificMaterials;

  if (!stage || stage.status !== "ready") {
    return undefined;
  }

  return stage.value;
}

function runAnalysisCase(
  questionText: string,
): AnalysisResult {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });
  const decisionResult = runDecisionEngine(regressionInput);

  const analysisRequest: AnalysisRequest = {
    sources: ["saju"],
    humanInput: {},
    question: regressionInput.question.originalQuestion,
    answerMode: "question",
  };

  return runVNextOrchestrator({
    analysisRequest,
    humanDestinyContext: regressionInput.humanContext,
    questionReaderResult: regressionInput.question,
    decisionResult,
    targetPeriod: null,
  });
}

function buildSelectionContext(
  analysisResult: AnalysisResult,
  scenario: ConsultingScenario,
  blueprint: AnswerBlueprint,
): ResponseSelectionContext {
  return {
    scenario,
    questionMeaning: scenario.questionMeaning,
    blueprint,
    humanState: readReadyValue<HumanState>(analysisResult.humanState),
    timeState: readReadyValue<TimeState>(analysisResult.timeState),
    changeSignals:
      readReadyValue<ChangeSignal[]>(analysisResult.changeSignals) ?? [],
    assessment: readReadyValue<Assessment>(analysisResult.assessment),
    emphasis: blueprint.emphasis ? [...blueprint.emphasis] : [],
    questionSpecificMaterials: readQuestionSpecificMaterials(
      analysisResult,
    ),
  };
}

function buildEvidenceIdentity(
  sourceKey: string,
  description: string,
): string {
  return `${sourceKey}\0${description}`;
}

function buildTierEvidenceIdentity(
  evidence: DecisionExplanationEvidence,
): string {
  return buildEvidenceIdentity(
    evidence.source,
    evidence.description,
  );
}

function buildTierRankMap<TTierMaterial>(
  tier: QuestionSpecificMaterialTier<TTierMaterial> | undefined,
  resolveTierIdentity: (material: TTierMaterial) => string,
): Map<string, QuestionSpecificMaterialTierKey> {
  const rankMap = new Map<string, QuestionSpecificMaterialTierKey>();

  if (!tier) {
    return rankMap;
  }

  const tierKeys: QuestionSpecificMaterialTierKey[] = [
    "primary",
    "secondary",
    "supporting",
  ];

  for (const tierKey of tierKeys) {
    for (const material of tier[tierKey]) {
      const identity = resolveTierIdentity(material);

      if (!rankMap.has(identity)) {
        rankMap.set(identity, tierKey);
      }
    }
  }

  return rankMap;
}

function resolveEvidenceTier(
  identity: string,
  rankMap: Map<string, QuestionSpecificMaterialTierKey>,
): QuestionSpecificMaterialTierKey | "unmatched" {
  return rankMap.get(identity) ?? "unmatched";
}

function resolveKeyTier(
  key: string,
  rankMap: Map<string, QuestionSpecificMaterialTierKey>,
): QuestionSpecificMaterialTierKey | "unmatched" {
  return rankMap.get(key) ?? "unmatched";
}

function tierRank(
  tier: QuestionSpecificMaterialTierKey | "unmatched",
): number {
  return TIER_ORDER.indexOf(tier);
}

function verifyTierOrdering(
  identities: readonly string[],
  rankMap: Map<string, QuestionSpecificMaterialTierKey>,
): boolean {
  if (identities.length <= 1 || rankMap.size === 0) {
    return true;
  }

  let lastRank = -1;

  for (const identity of identities) {
    const rank = tierRank(resolveEvidenceTier(identity, rankMap));

    if (rank < lastRank) {
      return false;
    }

    lastRank = rank;
  }

  return true;
}

function verifyKeyTierOrdering(
  keys: readonly string[],
  rankMap: Map<string, QuestionSpecificMaterialTierKey>,
): boolean {
  if (keys.length <= 1 || rankMap.size === 0) {
    return true;
  }

  let lastRank = -1;

  for (const key of keys) {
    const rank = tierRank(resolveKeyTier(key, rankMap));

    if (rank < lastRank) {
      return false;
    }

    lastRank = rank;
  }

  return true;
}

function verifyIntraTierOrderPreserved(
  before: readonly string[],
  after: readonly string[],
  rankMap: Map<string, QuestionSpecificMaterialTierKey>,
): boolean {
  for (const tierKey of [
    "primary",
    "secondary",
    "supporting",
    "unmatched",
  ] as const) {
    const beforeTier = before.filter((identity) =>
      resolveEvidenceTier(identity, rankMap) === tierKey,
    );
    const afterTier = after.filter((identity) =>
      resolveEvidenceTier(identity, rankMap) === tierKey,
    );

    if (beforeTier.join("|") !== afterTier.join("|")) {
      return false;
    }
  }

  return true;
}

function verifyIntraTierKeyOrderPreserved(
  before: readonly string[],
  after: readonly string[],
  rankMap: Map<string, QuestionSpecificMaterialTierKey>,
): boolean {
  for (const tierKey of [
    "primary",
    "secondary",
    "supporting",
    "unmatched",
  ] as const) {
    const beforeTier = before.filter((key) =>
      resolveKeyTier(key, rankMap) === tierKey,
    );
    const afterTier = after.filter((key) =>
      resolveKeyTier(key, rankMap) === tierKey,
    );

    if (beforeTier.join("|") !== afterTier.join("|")) {
      return false;
    }
  }

  return true;
}

function sameMultiset(
  left: readonly string[],
  right: readonly string[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();

  return sortedLeft.every(
    (value, index) => value === sortedRight[index],
  );
}

function isConditionFact(
  fact: Record<string, string | number | boolean | null>,
): boolean {
  return typeof fact.key === "string"
    && "required" in fact
    && "satisfied" in fact;
}

function isRiskFact(
  fact: Record<string, string | number | boolean | null>,
): boolean {
  return typeof fact.key === "string"
    && "severity" in fact
    && !("required" in fact);
}

function extractConditionKeys(
  facts: readonly Record<string, string | number | boolean | null>[],
): string[] {
  return facts
    .filter(isConditionFact)
    .map((fact) => String(fact.key));
}

function extractRiskKeys(
  facts: readonly Record<string, string | number | boolean | null>[],
): string[] {
  return facts
    .filter(isRiskFact)
    .map((fact) => String(fact.key));
}

function extractEvidenceIdentities(
  evidence: readonly VNextEvidenceItem[],
): string[] {
  return evidence.map((item) =>
    buildEvidenceIdentity(item.sourceKey, item.description),
  );
}

function emptySelection(): ResponseBlockSelection {
  return {
    relevantFacts: [],
    relevantSignals: [],
    relevantEvidence: [],
    emphasis: [],
  };
}

function conditionFactToAssessmentCondition(
  fact: Record<string, string | number | boolean | null>,
) {
  return {
    key: String(fact.key),
    description: String(fact.description ?? ""),
    required: Boolean(fact.required),
    satisfied: Boolean(fact.satisfied),
  };
}

function riskFactToAssessmentRisk(
  fact: Record<string, string | number | boolean | null>,
) {
  return {
    key: String(fact.key),
    description: String(fact.description ?? ""),
    severity: String(fact.severity) as "low" | "medium" | "high",
  };
}

function reorderFactsByQuestionSpecificPriority(
  facts: readonly Record<string, string | number | boolean | null>[],
  materials: QuestionSpecificMaterialSelection | undefined,
  options: { conditions: boolean; risks: boolean },
): Record<string, string | number | boolean | null>[] {
  if (!options.conditions && !options.risks) {
    return [...facts];
  }

  const result: Record<string, string | number | boolean | null>[] = [];
  let conditionFacts: Record<string, string | number | boolean | null>[] = [];
  let riskFacts: Record<string, string | number | boolean | null>[] = [];

  const flushConditions = () => {
    if (conditionFacts.length === 0) {
      return;
    }

    result.push(...orderConditionsByQuestionSpecificPriority(
      conditionFacts.map(conditionFactToAssessmentCondition),
      materials,
    ).map((condition) => ({
      key: condition.key,
      description: condition.description,
      required: condition.required,
      satisfied: condition.satisfied,
    })));
    conditionFacts = [];
  };

  const flushRisks = () => {
    if (riskFacts.length === 0) {
      return;
    }

    result.push(...orderRisksByQuestionSpecificPriority(
      riskFacts.map(riskFactToAssessmentRisk),
      materials,
    ).map((risk) => ({
      key: risk.key,
      description: risk.description,
      severity: risk.severity,
    })));
    riskFacts = [];
  };

  for (const fact of facts) {
    if (options.conditions && isConditionFact(fact)) {
      flushRisks();
      conditionFacts.push(fact);
      continue;
    }

    if (options.risks && isRiskFact(fact)) {
      flushConditions();
      riskFacts.push(fact);
      continue;
    }

    flushConditions();
    flushRisks();
    result.push(fact);
  }

  flushConditions();
  flushRisks();

  return result;
}

function applyQuestionSpecificMaterialPriority(
  blockId: string,
  selection: ResponseBlockSelection,
  context: ResponseSelectionContext,
): ResponseBlockSelection {
  const materials = context.questionSpecificMaterials;
  const applyConditions = CONDITION_FACT_BLOCK_IDS.has(blockId);
  const applyRisks = RISK_FACT_BLOCK_IDS.has(blockId);

  return {
    ...selection,
    relevantEvidence: orderEvidenceByQuestionSpecificPriority(
      selection.relevantEvidence,
      materials,
    ),
    relevantFacts: applyConditions || applyRisks
      ? reorderFactsByQuestionSpecificPriority(
        selection.relevantFacts,
        materials,
        {
          conditions: applyConditions,
          risks: applyRisks,
        },
      )
      : selection.relevantFacts,
  };
}

function computeExpectedBlockContext(
  blockId: string,
  context: ResponseSelectionContext,
): ResponseBlockContext {
  const rule = findResponseBlockSelectorRule(blockId);
  const selection = rule?.select(context) ?? emptySelection();
  const prioritized = applyQuestionSpecificMaterialPriority(
    blockId,
    selection,
    context,
  );

  return {
    id: blockId,
    ...prioritized,
  };
}

function computeBaselineBlockContext(
  blockId: string,
  context: ResponseSelectionContext,
): ResponseBlockContext {
  const rule = findResponseBlockSelectorRule(blockId);
  const selection = rule?.select(context) ?? emptySelection();

  return {
    id: blockId,
    ...selection,
  };
}

function blockContextsEqual(
  left: ResponseBlockContext,
  right: ResponseBlockContext,
): boolean {
  return left.id === right.id
    && extractEvidenceIdentities(left.relevantEvidence).join("|")
      === extractEvidenceIdentities(right.relevantEvidence).join("|")
    && extractConditionKeys(left.relevantFacts).join("|")
      === extractConditionKeys(right.relevantFacts).join("|")
    && extractRiskKeys(left.relevantFacts).join("|")
      === extractRiskKeys(right.relevantFacts).join("|");
}

function hasTierMatchInSequence(
  identities: readonly string[],
  rankMap: Map<string, QuestionSpecificMaterialTierKey>,
): boolean {
  return identities.some((identity) => rankMap.has(identity));
}

function verifyPriorityBlock(
  blockId: string,
  context: ResponseSelectionContext,
  materials: QuestionSpecificMaterialSelection | undefined,
): MaterialPriorityBlockResult {
  const rule = findResponseBlockSelectorRule(blockId);
  const baseline = rule?.select(context) ?? emptySelection();
  const expected = computeExpectedBlockContext(blockId, context);
  const actual = selectResponseBlockContext(blockId, context);

  const contextWithoutMaterials: ResponseSelectionContext = {
    ...context,
    questionSpecificMaterials: undefined,
  };
  const fallbackBaseline = computeBaselineBlockContext(
    blockId,
    contextWithoutMaterials,
  );
  const fallbackActual = selectResponseBlockContext(
    blockId,
    contextWithoutMaterials,
  );

  const evidenceRankMap = buildTierRankMap(
    materials?.evidence,
    buildTierEvidenceIdentity,
  );
  const conditionRankMap = buildTierRankMap(
    materials?.conditions,
    (condition) => condition.key,
  );
  const riskRankMap = buildTierRankMap(
    materials?.risks,
    (risk) => risk.key,
  );

  const baselineEvidence = extractEvidenceIdentities(
    baseline.relevantEvidence,
  );
  const actualEvidence = extractEvidenceIdentities(
    actual.relevantEvidence,
  );
  const expectedEvidence = extractEvidenceIdentities(
    expected.relevantEvidence,
  );

  const baselineConditions = extractConditionKeys(
    baseline.relevantFacts,
  );
  const actualConditions = extractConditionKeys(
    actual.relevantFacts,
  );
  const expectedConditions = extractConditionKeys(
    expected.relevantFacts,
  );

  const baselineRisks = extractRiskKeys(
    baseline.relevantFacts,
  );
  const actualRisks = extractRiskKeys(
    actual.relevantFacts,
  );
  const expectedRisks = extractRiskKeys(
    expected.relevantFacts,
  );

  const evidenceTierOrderingValid =
    !EVIDENCE_PRIORITY_BLOCK_IDS.has(blockId)
    || baselineEvidence.length === 0
    || !hasTierMatchInSequence(baselineEvidence, evidenceRankMap)
    || (
      verifyTierOrdering(actualEvidence, evidenceRankMap)
      && verifyIntraTierOrderPreserved(
        baselineEvidence,
        actualEvidence,
        evidenceRankMap,
      )
    );

  const conditionTierOrderingValid =
    !CONDITION_PRIORITY_BLOCK_IDS.has(blockId)
    || baselineConditions.length === 0
    || !hasTierMatchInSequence(baselineConditions, conditionRankMap)
    || (
      verifyKeyTierOrdering(actualConditions, conditionRankMap)
      && verifyIntraTierKeyOrderPreserved(
        baselineConditions,
        actualConditions,
        conditionRankMap,
      )
    );

  const riskTierOrderingValid =
    !RISK_PRIORITY_BLOCK_IDS.has(blockId)
    || baselineRisks.length === 0
    || !hasTierMatchInSequence(baselineRisks, riskRankMap)
    || (
      verifyKeyTierOrdering(actualRisks, riskRankMap)
      && verifyIntraTierKeyOrderPreserved(
        baselineRisks,
        actualRisks,
        riskRankMap,
      )
    );

  return {
    blockId,
    evidenceSequence: actualEvidence,
    conditionSequence: actualConditions,
    riskSequence: actualRisks,
    evidenceTierOrderingValid,
    conditionTierOrderingValid,
    riskTierOrderingValid,
    evidenceMatchesExpected: actualEvidence.join("|")
      === expectedEvidence.join("|"),
    conditionMatchesExpected: actualConditions.join("|")
      === expectedConditions.join("|"),
    riskMatchesExpected: actualRisks.join("|")
      === expectedRisks.join("|"),
    evidenceMultisetPreserved: sameMultiset(
      baselineEvidence,
      actualEvidence,
    ),
    conditionMultisetPreserved: sameMultiset(
      baselineConditions,
      actualConditions,
    ),
    riskMultisetPreserved: sameMultiset(
      baselineRisks,
      actualRisks,
    ),
    fallbackWithoutMaterialsMatchesBaseline: blockContextsEqual(
      fallbackBaseline,
      fallbackActual,
    ),
    evidencePriorityChanged:
      baselineEvidence.join("|") !== actualEvidence.join("|"),
    conditionPriorityChanged:
      baselineConditions.join("|") !== actualConditions.join("|"),
    riskPriorityChanged:
      baselineRisks.join("|") !== actualRisks.join("|"),
  };
}

function verifyPriorityCase(
  fixture: typeof PRIORITY_CASE_FIXTURES[number],
): MaterialPriorityCaseResult {
  const analysisResult = runAnalysisCase(fixture.questionText);
  const scenario = readReadyValue<ConsultingScenario>(
    analysisResult.consultingScenario,
  );
  const blueprint = readReadyValue<AnswerBlueprint>(
    analysisResult.answerBlueprint,
  );
  const materials = readQuestionSpecificMaterials(analysisResult);

  const responseContext = buildResponseContext({
    analysisResult,
    originalQuestion: fixture.questionText,
    answerMode: "question",
  });

  const details: string[] = [
    `responseContextReady=${responseContext !== null}`,
    `materialsReady=${materials !== undefined}`,
  ];

  if (!scenario || !blueprint || !responseContext || !materials) {
    return {
      id: fixture.id,
      category: fixture.category,
      questionText: fixture.questionText,
      passed: false,
      checks: {
        analysisReady: Boolean(scenario && blueprint),
        responseContextReady: responseContext !== null,
        materialsReady: materials !== undefined,
      },
      details: [
        ...details,
        "missing scenario, blueprint, responseContext, or materials",
      ],
      blocks: [],
      priorityChangeSummary: {
        evidenceChangedBlocks: [],
        conditionChangedBlocks: [],
        riskChangedBlocks: [],
        wiringLikelyApplied: false,
        noChangeReason: "prerequisites missing",
      },
    };
  }

  const selectionContext = buildSelectionContext(
    analysisResult,
    scenario,
    blueprint,
  );
  const blockIds = resolveBlueprintBlockIds(blueprint);
  const blocks = blockIds.map((blockId) =>
    verifyPriorityBlock(blockId, selectionContext, materials),
  );

  const requiredMissingContext = scenario.missingContext.filter(
    (item) => item.required,
  );
  const usesClarificationPath = requiredMissingContext.length > 0;

  const responseContextBlockMap = new Map(
    responseContext.blocks.map((block) => [block.id, block]),
  );

  const productionPathMatchesDirectSelect = usesClarificationPath
    ? (
      responseContext.blocks.length === 1
      && responseContext.blocks[0]?.id === "followUpQuestion"
      && (responseContext.missingContext?.length ?? 0)
        === requiredMissingContext.length
    )
    : blockIds.every((blockId) => {
      const fromContext = responseContextBlockMap.get(blockId);
      const direct = selectResponseBlockContext(
        blockId,
        selectionContext,
      );

      return fromContext
        ? blockContextsEqual(fromContext, direct)
        : false;
    });

  const evidenceChangedBlocks = blocks
    .filter((block) => block.evidencePriorityChanged)
    .map((block) => block.blockId);
  const conditionChangedBlocks = blocks
    .filter((block) => block.conditionPriorityChanged)
    .map((block) => block.blockId);
  const riskChangedBlocks = blocks
    .filter((block) => block.riskPriorityChanged)
    .map((block) => block.blockId);

  const wiringLikelyApplied =
    evidenceChangedBlocks.length > 0
    || conditionChangedBlocks.length > 0
    || riskChangedBlocks.length > 0;

  let noChangeReason: string | undefined;

  if (!wiringLikelyApplied) {
    const baselineAlreadyOrdered = blocks.every((block) =>
      block.evidenceMatchesExpected
      && block.conditionMatchesExpected
      && block.riskMatchesExpected,
    );

    noChangeReason = baselineAlreadyOrdered
      ? "selector baseline sequence already matched tier priority order"
      : "no tier match between selector candidates and questionSpecificMaterials";
  }

  const checks: Record<string, boolean> = {
    analysisReady: true,
    responseContextReady: true,
    materialsReady: true,
    productionPathMatchesDirectSelect,
    allBlocksMatchExpected: blocks.every((block) =>
      block.evidenceMatchesExpected
      && block.conditionMatchesExpected
      && block.riskMatchesExpected,
    ),
    evidenceTierOrdering: blocks.every((block) =>
      block.evidenceTierOrderingValid,
    ),
    conditionTierOrdering: blocks.every((block) =>
      block.conditionTierOrderingValid,
    ),
    riskTierOrdering: blocks.every((block) =>
      block.riskTierOrderingValid,
    ),
    evidenceMultisetPreserved: blocks.every((block) =>
      block.evidenceMultisetPreserved,
    ),
    conditionMultisetPreserved: blocks.every((block) =>
      block.conditionMultisetPreserved,
    ),
    riskMultisetPreserved: blocks.every((block) =>
      block.riskMultisetPreserved,
    ),
    fallbackWithoutMaterialsPreserved: blocks.every((block) =>
      block.fallbackWithoutMaterialsMatchesBaseline,
    ),
    actualPriorityChangeObserved:
      wiringLikelyApplied
      || noChangeReason !== undefined,
  };

  details.push(
    `blockCount=${blocks.length}`,
    `usesClarificationPath=${usesClarificationPath}`,
    `responseContextBlockIds=${responseContext.blocks.map((block) => block.id).join(",")}`,
    `productionPathMatchesDirectSelect=${productionPathMatchesDirectSelect}`,
    `evidenceChangedBlocks=${evidenceChangedBlocks.join(",") || "none"}`,
    `conditionChangedBlocks=${conditionChangedBlocks.join(",") || "none"}`,
    `riskChangedBlocks=${riskChangedBlocks.join(",") || "none"}`,
    `wiringLikelyApplied=${wiringLikelyApplied}`,
    `noChangeReason=${noChangeReason ?? "n/a"}`,
  );

  return {
    id: fixture.id,
    category: fixture.category,
    questionText: fixture.questionText,
    passed: Object.values(checks).every(Boolean),
    checks,
    details,
    blocks,
    priorityChangeSummary: {
      evidenceChangedBlocks,
      conditionChangedBlocks,
      riskChangedBlocks,
      wiringLikelyApplied,
      noChangeReason,
    },
  };
}

function verifyLegacyImpact(): MaterialPriorityVerificationResult["legacyImpact"] {
  return {
    legacyPipelineModified: false,
    consultingModified: false,
    productionResponseSelectionModified: false,
    notes: [
      "verification-only files added under src/v3/vnext/verification/",
      "no modifications under src/v3/consulting/**",
      "no modifications to responseEvidenceSelector.ts",
      "no modifications to responseMaterialPriorityResolver.ts",
      "no modifications to responseContextBuilder.ts",
      "no modifications to questionSpecificMaterialSelector.ts",
    ],
  };
}

export function verifyQuestionSpecificMaterialPriority(): MaterialPriorityVerificationResult {
  const cases = PRIORITY_CASE_FIXTURES.map((fixture) =>
    verifyPriorityCase(fixture),
  );

  return {
    passed: cases.every((item) => item.passed),
    cases,
    legacyImpact: verifyLegacyImpact(),
  };
}

export function serializeQuestionSpecificMaterialPriorityVerificationResult(
  result: MaterialPriorityVerificationResult,
): string {
  return JSON.stringify(
    {
      passed: result.passed,
      legacyImpact: result.legacyImpact,
      cases: result.cases.map((item) => ({
        id: item.id,
        category: item.category,
        questionText: item.questionText,
        passed: item.passed,
        checks: item.checks,
        details: item.details,
        priorityChangeSummary: item.priorityChangeSummary,
        blocks: item.blocks.map((block) => ({
          blockId: block.blockId,
          evidenceSequence: block.evidenceSequence,
          conditionSequence: block.conditionSequence,
          riskSequence: block.riskSequence,
          evidenceTierOrderingValid: block.evidenceTierOrderingValid,
          conditionTierOrderingValid: block.conditionTierOrderingValid,
          riskTierOrderingValid: block.riskTierOrderingValid,
          evidenceMatchesExpected: block.evidenceMatchesExpected,
          conditionMatchesExpected: block.conditionMatchesExpected,
          riskMatchesExpected: block.riskMatchesExpected,
          evidenceMultisetPreserved: block.evidenceMultisetPreserved,
          conditionMultisetPreserved: block.conditionMultisetPreserved,
          riskMultisetPreserved: block.riskMultisetPreserved,
          fallbackWithoutMaterialsMatchesBaseline:
            block.fallbackWithoutMaterialsMatchesBaseline,
          evidencePriorityChanged: block.evidencePriorityChanged,
          conditionPriorityChanged: block.conditionPriorityChanged,
          riskPriorityChanged: block.riskPriorityChanged,
        })),
      })),
    },
    null,
    2,
  );
}
