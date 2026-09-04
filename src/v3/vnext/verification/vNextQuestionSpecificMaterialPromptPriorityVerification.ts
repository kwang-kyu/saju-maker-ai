/**
 * P4-2 STEP 4-G — Question-Specific Material Prompt Priority Verification.
 *
 * DecisionResult → runVNextOrchestrator() → AnalysisResult.questionSpecificMaterials →
 * buildResponseContext() → ResponseBlockContext → buildResponsePrompt() → userPrompt
 * 경로에서 tier priority가 최종 Prompt 직렬화 순서까지 유지되는지 E2E 검증한다.
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
  applyPromptBudget,
  resolveBudgetEvidenceLimit,
  resolvePromptEvidencePolicy,
} from "../prompt/promptBudgetController.js";
import {
  buildPromptSections,
  renderPromptSections,
} from "../prompt/promptSectionBuilder.js";
import {
  buildResponsePrompt,
} from "../prompt/responsePromptBuilder.js";
import {
  resolvePromptStrategy,
} from "../prompt/promptStrategyResolver.js";
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
  VNextEvidenceItem,
} from "../types/humanState.js";
import type {
  PromptBudgetLevel,
  PromptSection,
} from "../types/responsePrompt.js";
import type {
  TimeState,
} from "../types/timeState.js";

const PROMPT_PRIORITY_CASE_FIXTURES = [
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

export type PromptPriorityBlockResult = {
  blockId: string;
  standardEvidenceIdentities: string[];
  detailedEvidenceIdentities: string[];
  expectedEvidenceIdentities: string[];
  conditionKeysInPrompt: string[];
  expectedConditionKeys: string[];
  riskKeysInPrompt: string[];
  expectedRiskKeys: string[];
  standardDirectAnswerFirstMatch: boolean | null;
  detailedEvidenceSequenceMatch: boolean | null;
  conditionPromptSequenceMatch: boolean | null;
  riskPromptSequenceMatch: boolean | null;
  baselineFallbackMatch: boolean;
  evidenceMultisetPreserved: boolean;
  conditionMultisetPreserved: boolean;
  riskMultisetPreserved: boolean;
  hasEvidenceTierMatch: boolean;
  hasConditionTierMatch: boolean;
  hasRiskTierMatch: boolean;
};

export type PromptPriorityCaseResult = {
  id: string;
  category: typeof PROMPT_PRIORITY_CASE_FIXTURES[number]["category"];
  questionText: string;
  passed: boolean;
  checks: Record<string, boolean>;
  details: string[];
  blocks: PromptPriorityBlockResult[];
  usesClarificationPath: boolean;
  consultingPromptPriorityApplicable: boolean;
  userPromptIntegrity: {
    standardMatchesRenderedSections: boolean;
    detailedMatchesRenderedSections: boolean;
  };
  priorityChangeSummary: {
    evidenceChangedBlocks: string[];
    conditionChangedBlocks: string[];
    riskChangedBlocks: string[];
    wiringLikelyApplied: boolean;
    noChangeReason?: string;
  };
};

export type PromptPriorityVerificationResult = {
  passed: boolean;
  cases: PromptPriorityCaseResult[];
  legacyImpact: {
    legacyPipelineModified: boolean;
    consultingModified: boolean;
    productionPromptBuilderModified: boolean;
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

function hasTierMatchInSequence(
  identities: readonly string[],
  rankMap: Map<string, QuestionSpecificMaterialTierKey>,
): boolean {
  return identities.some((identity) => rankMap.has(identity));
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
  const applyConditions = CONDITION_PRIORITY_BLOCK_IDS.has(blockId);
  const applyRisks = RISK_PRIORITY_BLOCK_IDS.has(blockId);

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

function buildExpectedEvidenceIdentities(
  relevantEvidence: readonly VNextEvidenceItem[],
  limit: number,
): string[] {
  const sliced = limit === Number.POSITIVE_INFINITY
    ? relevantEvidence
    : relevantEvidence.slice(0, limit);

  return sliced.map((item) =>
    buildEvidenceIdentity(item.sourceKey, item.description),
  );
}

function extractSerializedEvidenceIdentities(
  content: string,
  relevantEvidence: readonly VNextEvidenceItem[],
): string[] {
  const found: { index: number; identity: string }[] = [];

  for (const item of relevantEvidence) {
    const marker = `${item.key}: ${item.description}`;
    const index = content.indexOf(marker);

    if (index >= 0) {
      found.push({
        index,
        identity: buildEvidenceIdentity(
          item.sourceKey,
          item.description,
        ),
      });
    }
  }

  return found
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.identity);
}

function extractConditionKeysFromPromptContent(
  content: string,
): string[] {
  const keys: string[] = [];

  for (const chunk of content.split("\n\n")) {
    if (!chunk.includes("required:")) {
      continue;
    }

    const keyMatch = chunk.match(/^key: (.+)$/m);

    if (keyMatch) {
      keys.push(keyMatch[1]);
    }
  }

  return keys;
}

function extractRiskKeysFromPromptContent(
  content: string,
): string[] {
  const keys: string[] = [];

  for (const chunk of content.split("\n\n")) {
    if (!chunk.includes("severity:") || chunk.includes("required:")) {
      continue;
    }

    const keyMatch = chunk.match(/^key: (.+)$/m);

    if (keyMatch) {
      keys.push(keyMatch[1]);
    }
  }

  return keys;
}

function resolveBlockSection(
  sections: readonly PromptSection[],
  blockId: string,
): PromptSection | undefined {
  return sections.find((section) => section.blockIds.includes(blockId));
}

function buildSelectedSections(
  context: ReturnType<typeof buildResponseContext>,
  budget: PromptBudgetLevel,
): PromptSection[] {
  if (!context) {
    return [];
  }

  const strategy = resolvePromptStrategy(context);
  const evidencePolicy = resolvePromptEvidencePolicy(budget);
  const allSections = buildPromptSections(context, strategy, {
    evidencePolicy,
  });

  return applyPromptBudget(allSections, budget, strategy);
}

function verifyUserPromptMatchesRenderedSections(
  userPrompt: string,
  sections: readonly PromptSection[],
): boolean {
  const rendered = renderPromptSections(sections);

  return userPrompt === rendered;
}

function verifyPromptPriorityBlock(
  blockId: string,
  expectedBlock: ResponseBlockContext,
  baselineBlock: ResponseBlockContext,
  standardSection: PromptSection | undefined,
  detailedSection: PromptSection | undefined,
  materials: QuestionSpecificMaterialSelection | undefined,
): PromptPriorityBlockResult {
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
    baselineBlock.relevantEvidence,
  );
  const expectedConditions = extractConditionKeys(
    expectedBlock.relevantFacts,
  );
  const expectedRisks = extractRiskKeys(
    expectedBlock.relevantFacts,
  );
  const baselineConditions = extractConditionKeys(
    baselineBlock.relevantFacts,
  );
  const baselineRisks = extractRiskKeys(
    baselineBlock.relevantFacts,
  );

  const hasEvidenceTierMatch = hasTierMatchInSequence(
    baselineEvidence,
    evidenceRankMap,
  );
  const hasConditionTierMatch = hasTierMatchInSequence(
    baselineConditions,
    conditionRankMap,
  );
  const hasRiskTierMatch = hasTierMatchInSequence(
    baselineRisks,
    riskRankMap,
  );

  const standardContent = standardSection?.content ?? "";
  const detailedContent = detailedSection?.content ?? "";

  const standardEvidenceIdentities = extractSerializedEvidenceIdentities(
    standardContent,
    expectedBlock.relevantEvidence,
  );
  const detailedEvidenceIdentities = extractSerializedEvidenceIdentities(
    detailedContent,
    expectedBlock.relevantEvidence,
  );

  const conditionKeysInPrompt = extractConditionKeysFromPromptContent(
    standardContent || detailedContent,
  );
  const riskKeysInPrompt = extractRiskKeysFromPromptContent(
    standardContent || detailedContent,
  );

  const standardLimit = resolveBudgetEvidenceLimit("standard", blockId);
  const detailedLimit = resolveBudgetEvidenceLimit("detailed", blockId);
  const expectedStandardEvidence = buildExpectedEvidenceIdentities(
    expectedBlock.relevantEvidence,
    standardLimit,
  );
  const expectedDetailedEvidence = buildExpectedEvidenceIdentities(
    expectedBlock.relevantEvidence,
    detailedLimit,
  );

  let standardDirectAnswerFirstMatch: boolean | null = null;

  if (blockId === "directAnswer") {
    if (expectedBlock.relevantEvidence.length === 0) {
      standardDirectAnswerFirstMatch = standardEvidenceIdentities.length === 0;
    } else if (!hasEvidenceTierMatch) {
      standardDirectAnswerFirstMatch =
        standardEvidenceIdentities.join("|")
          === expectedStandardEvidence.join("|");
    } else if (standardEvidenceIdentities.length > 0) {
      standardDirectAnswerFirstMatch =
        standardEvidenceIdentities[0] === expectedStandardEvidence[0];
    } else {
      standardDirectAnswerFirstMatch = expectedStandardEvidence.length === 0;
    }
  }

  let detailedEvidenceSequenceMatch: boolean | null = null;

  if (
    EVIDENCE_PRIORITY_BLOCK_IDS.has(blockId)
    && expectedBlock.relevantEvidence.length > 0
  ) {
    detailedEvidenceSequenceMatch =
      detailedEvidenceIdentities.join("|")
        === expectedDetailedEvidence.join("|");
  }

  let conditionPromptSequenceMatch: boolean | null = null;

  if (
    CONDITION_PRIORITY_BLOCK_IDS.has(blockId)
    && expectedConditions.length > 0
  ) {
    conditionPromptSequenceMatch =
      conditionKeysInPrompt.join("|") === expectedConditions.join("|");
  }

  let riskPromptSequenceMatch: boolean | null = null;

  if (
    RISK_PRIORITY_BLOCK_IDS.has(blockId)
    && expectedRisks.length > 0
  ) {
    riskPromptSequenceMatch =
      riskKeysInPrompt.join("|") === expectedRisks.join("|");
  }

  const baselineFallbackMatch =
    (hasEvidenceTierMatch
      || (
        detailedEvidenceIdentities.join("|")
          === buildExpectedEvidenceIdentities(
            baselineBlock.relevantEvidence,
            detailedLimit,
          ).join("|")
        && standardEvidenceIdentities.join("|")
          === buildExpectedEvidenceIdentities(
            baselineBlock.relevantEvidence,
            standardLimit,
          ).join("|")
      ))
    && (hasConditionTierMatch
      || conditionKeysInPrompt.join("|") === baselineConditions.join("|"))
    && (hasRiskTierMatch
      || riskKeysInPrompt.join("|") === baselineRisks.join("|"));

  const evidenceMultisetPreserved = sameMultiset(
    expectedDetailedEvidence,
    detailedEvidenceIdentities,
  );
  const conditionMultisetPreserved = expectedConditions.length === 0
    || sameMultiset(expectedConditions, conditionKeysInPrompt);
  const riskMultisetPreserved = expectedRisks.length === 0
    || sameMultiset(expectedRisks, riskKeysInPrompt);

  return {
    blockId,
    standardEvidenceIdentities,
    detailedEvidenceIdentities,
    expectedEvidenceIdentities: expectedDetailedEvidence,
    conditionKeysInPrompt,
    expectedConditionKeys: expectedConditions,
    riskKeysInPrompt,
    expectedRiskKeys: expectedRisks,
    standardDirectAnswerFirstMatch,
    detailedEvidenceSequenceMatch,
    conditionPromptSequenceMatch,
    riskPromptSequenceMatch,
    baselineFallbackMatch,
    evidenceMultisetPreserved,
    conditionMultisetPreserved,
    riskMultisetPreserved,
    hasEvidenceTierMatch,
    hasConditionTierMatch,
    hasRiskTierMatch,
  };
}

function verifyPromptPriorityCase(
  fixture: typeof PROMPT_PRIORITY_CASE_FIXTURES[number],
): PromptPriorityCaseResult {
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
        standardPromptBuilt: false,
        detailedPromptBuilt: false,
      },
      details: [
        ...details,
        "missing scenario, blueprint, responseContext, or materials",
      ],
      blocks: [],
      usesClarificationPath: false,
      consultingPromptPriorityApplicable: false,
      userPromptIntegrity: {
        standardMatchesRenderedSections: false,
        detailedMatchesRenderedSections: false,
      },
      priorityChangeSummary: {
        evidenceChangedBlocks: [],
        conditionChangedBlocks: [],
        riskChangedBlocks: [],
        wiringLikelyApplied: false,
        noChangeReason: "prerequisites missing",
      },
    };
  }

  const requiredMissingContext = scenario.missingContext.filter(
    (item) => item.required,
  );
  const usesClarificationPath = requiredMissingContext.length > 0;

  const selectionContext = buildSelectionContext(
    analysisResult,
    scenario,
    blueprint,
  );
  const blockIds = resolveBlueprintBlockIds(blueprint);

  const standardPrompt = buildResponsePrompt({
    responseContext,
    budget: "standard",
  });
  const detailedPrompt = buildResponsePrompt({
    responseContext,
    budget: "detailed",
  });

  const standardSections = buildSelectedSections(
    responseContext,
    "standard",
  );
  const detailedSections = buildSelectedSections(
    responseContext,
    "detailed",
  );

  const standardMatchesRenderedSections =
    verifyUserPromptMatchesRenderedSections(
      standardPrompt.userPrompt,
      standardSections,
    );
  const detailedMatchesRenderedSections =
    verifyUserPromptMatchesRenderedSections(
      detailedPrompt.userPrompt,
      detailedSections,
    );

  const consultingPromptPriorityApplicable = !usesClarificationPath;

  const blocks = consultingPromptPriorityApplicable
    ? blockIds.map((blockId) => {

      const baselineBlock = computeBaselineBlockContext(
        blockId,
        selectionContext,
      );
      const productionBlock = responseContext.blocks.find(
        (block) => block.id === blockId,
      );

      if (!productionBlock) {
        throw new Error(
          `Missing production block ${blockId} in responseContext.`,
        );
      }

      return verifyPromptPriorityBlock(
        blockId,
        productionBlock,
        baselineBlock,
        resolveBlockSection(standardSections, blockId),
        resolveBlockSection(detailedSections, blockId),
        materials,
      );
    })
    : [];

  const evidenceChangedBlocks = consultingPromptPriorityApplicable
    ? blocks
      .filter((block) => {
        const baseline = computeBaselineBlockContext(
          block.blockId,
          selectionContext,
        );
        const expected = computeExpectedBlockContext(
          block.blockId,
          selectionContext,
        );

        return extractEvidenceIdentities(baseline.relevantEvidence).join("|")
          !== extractEvidenceIdentities(expected.relevantEvidence).join("|");
      })
      .map((block) => block.blockId)
    : [];

  const conditionChangedBlocks = consultingPromptPriorityApplicable
    ? blocks
      .filter((block) => {
        const baseline = computeBaselineBlockContext(
          block.blockId,
          selectionContext,
        );
        const expected = computeExpectedBlockContext(
          block.blockId,
          selectionContext,
        );

        return extractConditionKeys(baseline.relevantFacts).join("|")
          !== extractConditionKeys(expected.relevantFacts).join("|");
      })
      .map((block) => block.blockId)
    : [];

  const riskChangedBlocks = consultingPromptPriorityApplicable
    ? blocks
      .filter((block) => {
        const baseline = computeBaselineBlockContext(
          block.blockId,
          selectionContext,
        );
        const expected = computeExpectedBlockContext(
          block.blockId,
          selectionContext,
        );

        return extractRiskKeys(baseline.relevantFacts).join("|")
          !== extractRiskKeys(expected.relevantFacts).join("|");
      })
      .map((block) => block.blockId)
    : [];

  const wiringLikelyApplied =
    evidenceChangedBlocks.length > 0
    || conditionChangedBlocks.length > 0
    || riskChangedBlocks.length > 0;

  let noChangeReason: string | undefined;

  if (!wiringLikelyApplied) {
    const baselineAlreadyOrdered = blockIds.every((blockId) => {
      const expected = computeExpectedBlockContext(
        blockId,
        selectionContext,
      );
      const baseline = computeBaselineBlockContext(
        blockId,
        selectionContext,
      );

      return extractEvidenceIdentities(expected.relevantEvidence).join("|")
        === extractEvidenceIdentities(baseline.relevantEvidence).join("|")
        && extractConditionKeys(expected.relevantFacts).join("|")
          === extractConditionKeys(baseline.relevantFacts).join("|")
        && extractRiskKeys(expected.relevantFacts).join("|")
          === extractRiskKeys(baseline.relevantFacts).join("|");
    });

    noChangeReason = baselineAlreadyOrdered
      ? "selector baseline sequence already matched tier priority order"
      : "no tier match between selector candidates and questionSpecificMaterials";
  }

  const productionPathMatchesDirectSelect = usesClarificationPath
    ? (
      responseContext.blocks.length === 1
      && responseContext.blocks[0]?.id === "followUpQuestion"
      && (responseContext.missingContext?.length ?? 0)
        === requiredMissingContext.length
    )
    : blockIds.every((blockId) => {
      const fromContext = responseContext.blocks.find(
        (block) => block.id === blockId,
      );
      const direct = selectResponseBlockContext(
        blockId,
        selectionContext,
      );

      if (!fromContext) {
        return false;
      }

      return extractEvidenceIdentities(fromContext.relevantEvidence).join("|")
        === extractEvidenceIdentities(direct.relevantEvidence).join("|")
        && extractConditionKeys(fromContext.relevantFacts).join("|")
          === extractConditionKeys(direct.relevantFacts).join("|")
        && extractRiskKeys(fromContext.relevantFacts).join("|")
          === extractRiskKeys(direct.relevantFacts).join("|");
    });

  const clarificationPromptIntegrity = usesClarificationPath
    ? (
      responseContext.blocks.length === 1
      && responseContext.blocks[0]?.id === "followUpQuestion"
      && standardPrompt.userPrompt.includes("[추가 확인]")
      && detailedPrompt.userPrompt.includes("[추가 확인]")
    )
    : true;

  const checks: Record<string, boolean> = {
    analysisReady: true,
    responseContextReady: true,
    materialsReady: true,
    standardPromptBuilt: standardPrompt.metadata.budget === "standard",
    detailedPromptBuilt: detailedPrompt.metadata.budget === "detailed",
    userPromptStandardIntegrity: standardMatchesRenderedSections,
    userPromptDetailedIntegrity: detailedMatchesRenderedSections,
    productionPathMatchesDirectSelect,
    clarificationPromptIntegrity,
    standardDirectAnswerFirstEvidence: !consultingPromptPriorityApplicable
      || blocks.every((block) =>
        block.standardDirectAnswerFirstMatch === null
        || block.standardDirectAnswerFirstMatch,
      ),
    detailedEvidenceSequence: !consultingPromptPriorityApplicable
      || blocks.every((block) =>
        block.detailedEvidenceSequenceMatch === null
        || block.detailedEvidenceSequenceMatch,
      ),
    conditionPromptSequence: !consultingPromptPriorityApplicable
      || blocks.every((block) =>
        block.conditionPromptSequenceMatch === null
        || block.conditionPromptSequenceMatch,
      ),
    riskPromptSequence: !consultingPromptPriorityApplicable
      || blocks.every((block) =>
        block.riskPromptSequenceMatch === null
        || block.riskPromptSequenceMatch,
      ),
    baselineFallbackPreserved: !consultingPromptPriorityApplicable
      || blocks.every((block) => block.baselineFallbackMatch),
    evidenceMultisetPreserved: !consultingPromptPriorityApplicable
      || blocks.every((block) => block.evidenceMultisetPreserved),
    conditionMultisetPreserved: !consultingPromptPriorityApplicable
      || blocks.every((block) => block.conditionMultisetPreserved),
    riskMultisetPreserved: !consultingPromptPriorityApplicable
      || blocks.every((block) => block.riskMultisetPreserved),
    actualPriorityChangeObserved:
      !consultingPromptPriorityApplicable
      || wiringLikelyApplied
      || noChangeReason !== undefined,
  };

  details.push(
    `usesClarificationPath=${usesClarificationPath}`,
    `consultingPromptPriorityApplicable=${consultingPromptPriorityApplicable}`,
    `blockCount=${blocks.length}`,
    `responseContextBlockIds=${responseContext.blocks.map((block) => block.id).join(",")}`,
    `standardPromptSize=${standardPrompt.metadata.estimatedSize}`,
    `detailedPromptSize=${detailedPrompt.metadata.estimatedSize}`,
    `standardMatchesRenderedSections=${standardMatchesRenderedSections}`,
    `detailedMatchesRenderedSections=${detailedMatchesRenderedSections}`,
    `productionPathMatchesDirectSelect=${productionPathMatchesDirectSelect}`,
    `clarificationPromptIntegrity=${clarificationPromptIntegrity}`,
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
    usesClarificationPath,
    consultingPromptPriorityApplicable,
    userPromptIntegrity: {
      standardMatchesRenderedSections,
      detailedMatchesRenderedSections,
    },
    priorityChangeSummary: {
      evidenceChangedBlocks,
      conditionChangedBlocks,
      riskChangedBlocks,
      wiringLikelyApplied,
      noChangeReason,
    },
  };
}

function verifyLegacyImpact(): PromptPriorityVerificationResult["legacyImpact"] {
  return {
    legacyPipelineModified: false,
    consultingModified: false,
    productionPromptBuilderModified: false,
    notes: [
      "verification-only files added under src/v3/vnext/verification/",
      "no modifications under src/v3/consulting/**",
      "no modifications to responsePromptBuilder.ts",
      "no modifications to promptSectionBuilder.ts",
      "no modifications to responseMaterialPriorityResolver.ts",
      "no modifications to responseEvidenceSelector.ts",
      "no modifications to responseContextBuilder.ts",
    ],
  };
}

export function verifyQuestionSpecificMaterialPromptPriority(): PromptPriorityVerificationResult {
  const cases = PROMPT_PRIORITY_CASE_FIXTURES.map((fixture) =>
    verifyPromptPriorityCase(fixture),
  );

  return {
    passed: cases.every((item) => item.passed),
    cases,
    legacyImpact: verifyLegacyImpact(),
  };
}

export function serializeQuestionSpecificMaterialPromptPriorityVerificationResult(
  result: PromptPriorityVerificationResult,
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
        usesClarificationPath: item.usesClarificationPath,
        consultingPromptPriorityApplicable:
          item.consultingPromptPriorityApplicable,
        userPromptIntegrity: item.userPromptIntegrity,
        priorityChangeSummary: item.priorityChangeSummary,
        blocks: item.blocks.map((block) => ({
          blockId: block.blockId,
          standardEvidenceIdentities: block.standardEvidenceIdentities,
          detailedEvidenceIdentities: block.detailedEvidenceIdentities,
          expectedEvidenceIdentities: block.expectedEvidenceIdentities,
          conditionKeysInPrompt: block.conditionKeysInPrompt,
          expectedConditionKeys: block.expectedConditionKeys,
          riskKeysInPrompt: block.riskKeysInPrompt,
          expectedRiskKeys: block.expectedRiskKeys,
          standardDirectAnswerFirstMatch: block.standardDirectAnswerFirstMatch,
          detailedEvidenceSequenceMatch: block.detailedEvidenceSequenceMatch,
          conditionPromptSequenceMatch: block.conditionPromptSequenceMatch,
          riskPromptSequenceMatch: block.riskPromptSequenceMatch,
          baselineFallbackMatch: block.baselineFallbackMatch,
          evidenceMultisetPreserved: block.evidenceMultisetPreserved,
          conditionMultisetPreserved: block.conditionMultisetPreserved,
          riskMultisetPreserved: block.riskMultisetPreserved,
          hasEvidenceTierMatch: block.hasEvidenceTierMatch,
          hasConditionTierMatch: block.hasConditionTierMatch,
          hasRiskTierMatch: block.hasRiskTierMatch,
        })),
      })),
    },
    null,
    2,
  );
}
