/**
 * P4-2 STEP 4-F-1 — Standard Prompt Core Information Preservation Verification.
 *
 * standard Budget Prompt가 detailed의 모든 내용을 담지는 않더라도
 * 질문 답변에 필요한 핵심 판단 정보(facts / signals / emphasis / directAnswer evidence)
 * 는 보존하는지 검증한다.
 *
 * Verification-only. Production 파일은 수정하지 않는다.
 */

import {
  resolveBudgetEvidenceLimit,
} from "../prompt/promptBudgetController.js";
import {
  buildResponsePrompt,
} from "../prompt/responsePromptBuilder.js";
import {
  resolvePromptStrategy,
} from "../prompt/promptStrategyResolver.js";
import {
  includesAll,
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";
import type {
  ResponseBlockContext,
  ResponseContext,
} from "../response/responseContext.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";
import type {
  VNextEvidenceItem,
} from "../types/humanState.js";

const CORE_PRESERVATION_FIXTURES = [
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
    id: "D_octoberMoneyFlow",
    category: "generalFlow",
    questionText: "10월 금전운이 있을까요?",
    options: { includeLuckFlow: true as const },
  },
  {
    id: "E_careerAptitude",
    category: "aptitudeRecommendation",
    questionText: "나에게 맞는 직업은 무엇인가요?",
  },
  {
    id: "F_storeOpening",
    category: "actionDecision",
    questionText: "10월에 가게를 오픈하려고 하는데 어떨까요?",
    options: { includeLuckFlow: true as const },
  },
] as const;

export type CorePreservationMarkerType =
  | "fact"
  | "signalSummary"
  | "signalDirection"
  | "emphasis"
  | "directAnswerEvidence";

export type CorePreservationMarker = {
  type: CorePreservationMarkerType;
  blockId: string;
  text: string;
};

export type CorePreservationCheckResult = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStandardPromptCorePreservationCase = {
  id: string;
  category: string;
  questionText: string;
  passed: boolean;
  actionType: string;
  promptGenerated: boolean;
  requiredBlocksPreserved: boolean;
  structuralSectionsPreserved: boolean;
  coreMarkersPreserved: boolean;
  standardNotLargerThanDetailed: boolean;
  evidenceReducedOrEqual: boolean;
  missingCoreMarkers: CorePreservationMarker[];
  standardSize: number;
  detailedSize: number;
  standardEvidenceCount: number;
  detailedEvidenceCount: number;
  checks: CorePreservationCheckResult[];
  details: string[];
};

export type VNextStandardPromptCorePreservationResult = {
  passed: boolean;
  cases: VNextStandardPromptCorePreservationCase[];
};

function formatEvidenceMarker(item: VNextEvidenceItem): string {
  return `${item.key}: ${item.description}`;
}

function extractCorePreservationMarkers(
  context: ResponseContext,
): CorePreservationMarker[] {
  const markers: CorePreservationMarker[] = [];

  for (const block of context.blocks) {
    appendFactMarkers(markers, block);
    appendSignalMarkers(markers, block);
    appendEmphasisMarkers(markers, block);
    appendDirectAnswerEvidenceMarker(markers, block);
  }

  return markers;
}

function appendFactMarkers(
  markers: CorePreservationMarker[],
  block: ResponseBlockContext,
): void {
  for (const fact of block.relevantFacts) {
    for (const value of Object.values(fact)) {
      if (value === null || value === "") {
        continue;
      }

      markers.push({
        type: "fact",
        blockId: block.id,
        text: String(value),
      });
    }
  }
}

function appendSignalMarkers(
  markers: CorePreservationMarker[],
  block: ResponseBlockContext,
): void {
  for (const signal of block.relevantSignals) {
    markers.push({
      type: "signalSummary",
      blockId: block.id,
      text: signal.summary,
    });

    if (signal.direction) {
      markers.push({
        type: "signalDirection",
        blockId: block.id,
        text: signal.direction,
      });
    }
  }
}

function appendEmphasisMarkers(
  markers: CorePreservationMarker[],
  block: ResponseBlockContext,
): void {
  for (const emphasis of block.emphasis) {
    markers.push({
      type: "emphasis",
      blockId: block.id,
      text: emphasis,
    });
  }
}

function appendDirectAnswerEvidenceMarker(
  markers: CorePreservationMarker[],
  block: ResponseBlockContext,
): void {
  const evidenceLimit = resolveBudgetEvidenceLimit("standard", block.id);

  if (evidenceLimit <= 0 || block.relevantEvidence.length === 0) {
    return;
  }

  markers.push({
    type: "directAnswerEvidence",
    blockId: block.id,
    text: block.relevantEvidence[0].description,
  });
}

function countSerializedEvidence(
  prompt: ResponsePrompt,
  context: ResponseContext,
): number {
  let total = 0;

  for (const block of context.blocks) {
    for (const item of block.relevantEvidence) {
      if (prompt.userPrompt.includes(formatEvidenceMarker(item))) {
        total += 1;
      }
    }
  }

  return total;
}

function resolveMissingCoreMarkers(
  standardPrompt: ResponsePrompt,
  markers: readonly CorePreservationMarker[],
): CorePreservationMarker[] {
  return markers.filter(
    (marker) => !standardPrompt.userPrompt.includes(marker.text),
  );
}

function hasStructuralSections(prompt: ResponsePrompt): boolean {
  return prompt.userPrompt.includes("[질문]")
    && prompt.userPrompt.includes("[답변 목적]")
    && prompt.userPrompt.includes("[설명 규칙]");
}

function verifyCorePreservationCase(
  fixture: (typeof CORE_PRESERVATION_FIXTURES)[number],
): VNextStandardPromptCorePreservationCase {
  const { action, context } = runPromptPipelineCase(
    fixture.questionText,
    "options" in fixture ? fixture.options : undefined,
  );

  if (action.type !== "consulting" || !context) {
    return {
      id: fixture.id,
      category: fixture.category,
      questionText: fixture.questionText,
      passed: false,
      actionType: action.type,
      promptGenerated: false,
      requiredBlocksPreserved: false,
      structuralSectionsPreserved: false,
      coreMarkersPreserved: false,
      standardNotLargerThanDetailed: false,
      evidenceReducedOrEqual: false,
      missingCoreMarkers: [],
      standardSize: 0,
      detailedSize: 0,
      standardEvidenceCount: 0,
      detailedEvidenceCount: 0,
      checks: [{
        id: "consulting-context",
        passed: false,
        details: [`action=${action.type}`, "expected consulting context"],
      }],
      details: [`action=${action.type}`, "expected consulting context"],
    };
  }

  const strategy = resolvePromptStrategy(context);
  const standardPrompt = buildResponsePrompt({
    responseContext: context,
    budget: "standard",
  });
  const detailedPrompt = buildResponsePrompt({
    responseContext: context,
    budget: "detailed",
  });
  const coreMarkers = extractCorePreservationMarkers(context);
  const missingCoreMarkers = resolveMissingCoreMarkers(
    standardPrompt,
    coreMarkers,
  );
  const standardEvidenceCount = countSerializedEvidence(
    standardPrompt,
    context,
  );
  const detailedEvidenceCount = countSerializedEvidence(
    detailedPrompt,
    context,
  );

  const requiredBlocksPreserved = includesAll(
    standardPrompt.metadata.selectedBlockIds,
    strategy.requiredBlocks,
  );
  const structuralSectionsPreserved = hasStructuralSections(standardPrompt);
  const coreMarkersPreserved = missingCoreMarkers.length === 0;
  const standardNotLargerThanDetailed =
    standardPrompt.metadata.estimatedSize
    <= detailedPrompt.metadata.estimatedSize;
  const evidenceReducedOrEqual =
    standardEvidenceCount <= detailedEvidenceCount;

  const checks: CorePreservationCheckResult[] = [
    {
      id: "required-blocks",
      passed: requiredBlocksPreserved,
      details: [
        `required=${strategy.requiredBlocks.join(",")}`,
        `selected=${standardPrompt.metadata.selectedBlockIds.join(",")}`,
      ],
    },
    {
      id: "structural-sections",
      passed: structuralSectionsPreserved,
      details: [
        `question=${standardPrompt.userPrompt.includes("[질문]")}`,
        `answerGoal=${standardPrompt.userPrompt.includes("[답변 목적]")}`,
        `explanationRules=${standardPrompt.userPrompt.includes("[설명 규칙]")}`,
      ],
    },
    {
      id: "core-markers",
      passed: coreMarkersPreserved,
      details: [
        `coreMarkerCount=${coreMarkers.length}`,
        `missingCount=${missingCoreMarkers.length}`,
        `missing=${missingCoreMarkers
          .slice(0, 3)
          .map((marker) => `${marker.blockId}:${marker.type}`)
          .join(",") || "none"}`,
      ],
    },
    {
      id: "standard-size",
      passed: standardNotLargerThanDetailed,
      details: [
        `standardSize=${standardPrompt.metadata.estimatedSize}`,
        `detailedSize=${detailedPrompt.metadata.estimatedSize}`,
      ],
    },
    {
      id: "evidence-reduction",
      passed: evidenceReducedOrEqual,
      details: [
        `standardEvidenceCount=${standardEvidenceCount}`,
        `detailedEvidenceCount=${detailedEvidenceCount}`,
      ],
    },
  ];

  const passed = checks.every((check) => check.passed);

  return {
    id: fixture.id,
    category: fixture.category,
    questionText: fixture.questionText,
    passed,
    actionType: action.type,
    promptGenerated: true,
    requiredBlocksPreserved,
    structuralSectionsPreserved,
    coreMarkersPreserved,
    standardNotLargerThanDetailed,
    evidenceReducedOrEqual,
    missingCoreMarkers,
    standardSize: standardPrompt.metadata.estimatedSize,
    detailedSize: detailedPrompt.metadata.estimatedSize,
    standardEvidenceCount,
    detailedEvidenceCount,
    checks,
    details: [
      `action=${action.type}`,
      `coreMarkerCount=${coreMarkers.length}`,
      `missingCoreMarkers=${missingCoreMarkers.length}`,
      `standardSize=${standardPrompt.metadata.estimatedSize}`,
      `detailedSize=${detailedPrompt.metadata.estimatedSize}`,
      `standardEvidenceCount=${standardEvidenceCount}`,
      `detailedEvidenceCount=${detailedEvidenceCount}`,
    ],
  };
}

export function verifyStandardPromptCorePreservation():
  VNextStandardPromptCorePreservationResult {
  const cases = CORE_PRESERVATION_FIXTURES.map(verifyCorePreservationCase);

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeStandardPromptCorePreservationResult(
  result: VNextStandardPromptCorePreservationResult,
): string {
  return JSON.stringify(
    {
      passed: result.passed,
      cases: result.cases.map((item) => ({
        id: item.id,
        category: item.category,
        questionText: item.questionText,
        passed: item.passed,
        actionType: item.actionType,
        promptGenerated: item.promptGenerated,
        requiredBlocksPreserved: item.requiredBlocksPreserved,
        structuralSectionsPreserved: item.structuralSectionsPreserved,
        coreMarkersPreserved: item.coreMarkersPreserved,
        standardNotLargerThanDetailed: item.standardNotLargerThanDetailed,
        evidenceReducedOrEqual: item.evidenceReducedOrEqual,
        missingCoreMarkers: item.missingCoreMarkers,
        standardSize: item.standardSize,
        detailedSize: item.detailedSize,
        standardEvidenceCount: item.standardEvidenceCount,
        detailedEvidenceCount: item.detailedEvidenceCount,
        checks: item.checks,
        details: item.details,
      })),
    },
    null,
    2,
  );
}
