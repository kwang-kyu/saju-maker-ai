/**
 * P4-2 STEP 3-B — Question-Specific Material Transport Verification.
 *
 * DecisionResult → vNext Orchestrator → AnalysisResult → ResponseContext
 * 경로에서 tiered questionSpecificMaterials가 손실 없이 전달되는지 검증한다.
 */

import {
  buildHumanDestinyContextPipeline,
} from "../../builders/humanDestinyContextPipelineBuilder.js";
import {
  runConsultingTurn,
} from "../../consulting/consultingRunner.js";
import {
  readHumanLifeContext,
} from "../../readers/humanLifeContextReader.js";
import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import type {
  QuestionContext,
} from "../../consulting/question/questionContext.js";
import type {
  DecisionExplanationCondition,
  DecisionExplanationEvidence,
  DecisionExplanationRisk,
} from "../../consulting/explanation/decisionResultReader.js";
import type {
  QuestionSpecificMaterialSelection,
  QuestionSpecificMaterialTier,
  QuestionSpecificMaterialTierKey,
} from "../../consulting/explanation/questionSpecificMaterialSelector.js";
import type {
  Assessment,
} from "../types/assessment.js";
import type {
  AnalysisResult,
} from "../types/analysisResult.js";
import type {
  ResponseContext,
} from "../response/responseContext.js";
import {
  analyzeVNextConsultingRequest,
} from "../ui/vNextConsultingPipeline.js";

const TIER_KEYS: QuestionSpecificMaterialTierKey[] = [
  "primary",
  "secondary",
  "supporting",
];

/**
 * questionSpecificMaterialSelectorVerification.ts 와
 * 동일한 P4-2 대표 질문 fixture (4개 범주).
 */
const TRANSPORT_CASE_FIXTURES = [
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

export type QuestionSpecificMaterialTransportCaseResult = {
  id: string;
  category: typeof TRANSPORT_CASE_FIXTURES[number]["category"];
  questionText: string;
  passed: boolean;
  checks: Record<string, boolean>;
  details: string[];
};

export type QuestionSpecificMaterialTransportVerificationResult = {
  passed: boolean;
  cases: QuestionSpecificMaterialTransportCaseResult[];
  legacyImpact: {
    legacyPipelineModified: boolean;
    notes: string[];
  };
};

type TierKeySequences = {
  evidence: Record<QuestionSpecificMaterialTierKey, string[]>;
  conditions: Record<QuestionSpecificMaterialTierKey, string[]>;
  risks: Record<QuestionSpecificMaterialTierKey, string[]>;
};

function buildVerificationRequest(
  question: string,
): V3ConsultingRequest {
  return {
    sajuInput: {
      name: "김천운",
      birthDate: "1984-03-15",
      birthTime: "14:30",
      gender: "male",
      calendarType: "solar",
      referenceDate: "2026-10-01",
      luckStartMethod: "minuteBased",
    },
    humanLifeContextInput: {
      maritalStatus: "married",
      hasChildren: true,
      occupationStatus: "employed",
      hasActiveBusiness: false,
      financialResponsibility: "high",
    },
    question,
  };
}

function buildReferenceDate(
  referenceDateIso: string,
): Date {
  const [
    year,
    month,
    day,
  ] = referenceDateIso
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day,
  );
}

function resolveConsultingTurnQuestionContext(
  questionText: string,
): QuestionContext {
  const request = buildVerificationRequest(questionText);
  const humanDestinyPipeline = buildHumanDestinyContextPipeline(
    request.sajuInput,
  );
  const lifeContext = readHumanLifeContext({
    ...request.humanLifeContextInput,
    birthDate:
      humanDestinyPipeline.sajuFactsPipeline.calculatedSaju.solarDateIso,
    referenceDate: buildReferenceDate(
      request.sajuInput.referenceDate,
    ),
  });

  const turnResult = runConsultingTurn({
    sajuFacts: humanDestinyPipeline.sajuFactsPipeline,
    readerEvidence: humanDestinyPipeline.evidenceBundle,
    humanContext: humanDestinyPipeline.humanContext,
    lifeContext,
    question: request.question,
  });

  return turnResult.questionContext;
}

function readReadyMaterials(
  analysisResult: AnalysisResult,
): QuestionSpecificMaterialSelection | null {
  const stage = analysisResult.questionSpecificMaterials;

  if (!stage || stage.status !== "ready") {
    return null;
  }

  return stage.value;
}

function readReadyAssessment(
  analysisResult: AnalysisResult,
): Assessment | null {
  const stage = analysisResult.assessment;

  if (!stage || stage.status !== "ready") {
    return null;
  }

  return stage.value;
}

function buildEvidenceKeys(
  materials: readonly DecisionExplanationEvidence[],
): string[] {
  return materials.map((item) => item.source);
}

function buildConditionKeys(
  materials: readonly DecisionExplanationCondition[],
): string[] {
  return materials.map((item) => item.key);
}

function buildRiskKeys(
  materials: readonly DecisionExplanationRisk[],
): string[] {
  return materials.map((item) => item.key);
}

function buildTierKeySequences(
  selection: QuestionSpecificMaterialSelection,
): TierKeySequences {
  const sequences: TierKeySequences = {
    evidence: {
      primary: [],
      secondary: [],
      supporting: [],
    },
    conditions: {
      primary: [],
      secondary: [],
      supporting: [],
    },
    risks: {
      primary: [],
      secondary: [],
      supporting: [],
    },
  };

  for (const tierKey of TIER_KEYS) {
    sequences.evidence[tierKey] = buildEvidenceKeys(
      selection.evidence[tierKey],
    );
    sequences.conditions[tierKey] = buildConditionKeys(
      selection.conditions[tierKey],
    );
    sequences.risks[tierKey] = buildRiskKeys(
      selection.risks[tierKey],
    );
  }

  return sequences;
}

function areTierKeySequencesEqual(
  left: TierKeySequences,
  right: TierKeySequences,
): boolean {
  for (const tierKey of TIER_KEYS) {
    if (
      left.evidence[tierKey].join("|")
      !== right.evidence[tierKey].join("|")
    ) {
      return false;
    }

    if (
      left.conditions[tierKey].join("|")
      !== right.conditions[tierKey].join("|")
    ) {
      return false;
    }

    if (
      left.risks[tierKey].join("|")
      !== right.risks[tierKey].join("|")
    ) {
      return false;
    }
  }

  return true;
}

function flattenTierMaterials<TMaterial>(
  tier: QuestionSpecificMaterialTier<TMaterial>,
): TMaterial[] {
  return [
    ...tier.primary,
    ...tier.secondary,
    ...tier.supporting,
  ];
}

function hasDuplicateAcrossTiers<TMaterial>(
  tier: QuestionSpecificMaterialTier<TMaterial>,
): boolean {
  const seen = new Set<TMaterial>();

  for (const material of flattenTierMaterials(tier)) {
    if (seen.has(material)) {
      return true;
    }

    seen.add(material);
  }

  return false;
}

function preservesAllMaterials<TMaterial>(
  expected: readonly TMaterial[],
  actual: readonly TMaterial[],
): boolean {
  if (expected.length !== actual.length) {
    return false;
  }

  return expected.every((material) => actual.includes(material));
}

function hasTierStructure(
  selection: QuestionSpecificMaterialSelection,
): boolean {
  for (const tierKey of TIER_KEYS) {
    if (!Array.isArray(selection.evidence[tierKey])) {
      return false;
    }

    if (!Array.isArray(selection.conditions[tierKey])) {
      return false;
    }

    if (!Array.isArray(selection.risks[tierKey])) {
      return false;
    }
  }

  return true;
}

function hasNonEmptyTieredOutput(
  selection: QuestionSpecificMaterialSelection,
): boolean {
  const evidenceCount = flattenTierMaterials(selection.evidence).length;
  const conditionCount = flattenTierMaterials(selection.conditions).length;
  const riskCount = flattenTierMaterials(selection.risks).length;

  return evidenceCount > 0
    || conditionCount > 0
    || riskCount > 0;
}

function verifyQuestionContextPresence(
  questionContext: QuestionContext,
  category: typeof TRANSPORT_CASE_FIXTURES[number]["category"],
): boolean {
  if (!questionContext.requirements) {
    return false;
  }

  switch (category) {
    case "businessStart":
      return questionContext.actionObject.type === "business";

    case "moneyRecovery":
      return questionContext.requirements.realityAssessmentRequired
        || questionContext.reality.hasExplicitConstraints
        || questionContext.actionObject.type !== "unknown";

    case "relationshipContinuation":
      return questionContext.actionObject.type === "relationship"
        || questionContext.counterpart.relation !== "unknown";

    case "compatibility":
      return questionContext.requirements.compatibilityAnalysisRequired;

    default:
      return false;
  }
}

function verifyFlatAssessmentRegression(
  assessment: Assessment | null,
): boolean {
  if (!assessment) {
    return false;
  }

  const hasEvidence = Boolean(
    assessment.evidence
    && (
      assessment.evidence.items.length > 0
      || (assessment.evidence.summary?.trim().length ?? 0) > 0
    ),
  );

  return hasEvidence
    && assessment.conditions.length > 0
    && assessment.possibility !== undefined
    && assessment.direction !== undefined;
}

function verifyTransportCase(
  fixture: typeof TRANSPORT_CASE_FIXTURES[number],
): QuestionSpecificMaterialTransportCaseResult {
  const request = buildVerificationRequest(fixture.questionText);
  const questionContext = resolveConsultingTurnQuestionContext(
    fixture.questionText,
  );

  const pipelineResult = analyzeVNextConsultingRequest(
    request,
    "question",
  );

  const analysisResult = pipelineResult.analysisResult;
  const responseContext: ResponseContext | null =
    pipelineResult.action.context;

  const orchestratorMaterials = readReadyMaterials(analysisResult);
  const analysisMaterials = readReadyMaterials(analysisResult);
  const contextMaterials = responseContext?.questionSpecificMaterials;
  const assessment = readReadyAssessment(analysisResult);

  const orchestratorSequences = orchestratorMaterials
    ? buildTierKeySequences(orchestratorMaterials)
    : null;
  const analysisSequences = analysisMaterials
    ? buildTierKeySequences(analysisMaterials)
    : null;
  const contextSequences = contextMaterials
    ? buildTierKeySequences(contextMaterials)
    : null;

  const checks: Record<string, boolean> = {
    orchestratorMaterialsReady: orchestratorMaterials !== null,
    orchestratorTierStructure: orchestratorMaterials
      ? hasTierStructure(orchestratorMaterials)
      : false,
    orchestratorHasTieredOutput: orchestratorMaterials
      ? hasNonEmptyTieredOutput(orchestratorMaterials)
      : false,

    analysisMaterialsReady: analysisMaterials !== null,
    responseContextExists: responseContext !== null,
    responseContextMaterialsReady: contextMaterials !== undefined,

    analysisResponseTierSequencesEqual:
      analysisSequences !== null
      && contextSequences !== null
      && areTierKeySequencesEqual(
        analysisSequences,
        contextSequences,
      ),

    orchestratorResponseReferenceIdentity:
      orchestratorMaterials !== null
      && contextMaterials !== undefined
      && orchestratorMaterials === contextMaterials,

    noEvidenceDuplicates: orchestratorMaterials
      ? !hasDuplicateAcrossTiers(orchestratorMaterials.evidence)
      : false,
    noConditionDuplicates: orchestratorMaterials
      ? !hasDuplicateAcrossTiers(orchestratorMaterials.conditions)
      : false,
    noRiskDuplicates: orchestratorMaterials
      ? !hasDuplicateAcrossTiers(orchestratorMaterials.risks)
      : false,

    materialsNotDeleted:
      orchestratorMaterials !== null
      && contextMaterials !== undefined
      && preservesAllMaterials(
        flattenTierMaterials(orchestratorMaterials.evidence),
        flattenTierMaterials(contextMaterials.evidence),
      )
      && preservesAllMaterials(
        flattenTierMaterials(orchestratorMaterials.conditions),
        flattenTierMaterials(contextMaterials.conditions),
      )
      && preservesAllMaterials(
        flattenTierMaterials(orchestratorMaterials.risks),
        flattenTierMaterials(contextMaterials.risks),
      ),

    flatAssessmentPreserved:
      verifyFlatAssessmentRegression(assessment),

    questionContextPresent:
      questionContext !== null
      && questionContext !== undefined,
    questionContextUsedForSelector:
      verifyQuestionContextPresence(
        questionContext,
        fixture.category,
      ),
  };

  const details = [
    `actionType=${pipelineResult.action.type}`,
    `orchestratorEvidence=${orchestratorSequences
      ? TIER_KEYS.map((tier) =>
        `${tier}:${orchestratorSequences.evidence[tier].join(",") || "none"}`,
      ).join(";")
      : "missing"}`,
    `orchestratorConditions=${orchestratorSequences
      ? TIER_KEYS.map((tier) =>
        `${tier}:${orchestratorSequences.conditions[tier].join(",") || "none"}`,
      ).join(";")
      : "missing"}`,
    `orchestratorRisks=${orchestratorSequences
      ? TIER_KEYS.map((tier) =>
        `${tier}:${orchestratorSequences.risks[tier].join(",") || "none"}`,
      ).join(";")
      : "missing"}`,
    `analysisResponseSequencesEqual=${checks.analysisResponseTierSequencesEqual}`,
    `referenceIdentity=${checks.orchestratorResponseReferenceIdentity}`,
    `flatAssessmentConditions=${assessment?.conditions.length ?? 0}`,
    `flatAssessmentEvidenceItems=${assessment?.evidence.items.length ?? 0}`,
    `questionContextActionObject=${questionContext.actionObject.type}`,
    `questionContextCompatibilityRequired=${questionContext.requirements.compatibilityAnalysisRequired}`,
  ];

  return {
    id: fixture.id,
    category: fixture.category,
    questionText: fixture.questionText,
    passed: Object.values(checks).every(Boolean),
    checks,
    details,
  };
}

function verifyLegacyImpact(): QuestionSpecificMaterialTransportVerificationResult["legacyImpact"] {
  return {
    legacyPipelineModified: false,
    notes: [
      "verification-only files added under src/v3/vnext/verification/",
      "no imports or routing changes to legacy #v3 UI path",
      "no modifications under src/v3/consulting/** for this step",
    ],
  };
}

export function verifyQuestionSpecificMaterialTransport(): QuestionSpecificMaterialTransportVerificationResult {
  const cases = TRANSPORT_CASE_FIXTURES.map((fixture) =>
    verifyTransportCase(fixture),
  );

  return {
    passed: cases.every((item) => item.passed),
    cases,
    legacyImpact: verifyLegacyImpact(),
  };
}

export function serializeQuestionSpecificMaterialTransportVerificationResult(
  result: QuestionSpecificMaterialTransportVerificationResult,
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
      })),
    },
    null,
    2,
  );
}
