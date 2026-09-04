/**
 * P4-2 STEP 4-E-3 — Prompt Budget Payload Measurement.
 *
 * minimal / standard / detailed Budget이 실제 buildResponsePrompt() Payload 크기에
 * 어떤 차이를 만드는지 측정한다.
 *
 * Verification-only. Production 파일은 수정하지 않는다.
 */

import {
  applyPromptBudget,
  resolvePromptEvidencePolicy,
} from "../prompt/promptBudgetController.js";
import {
  buildPromptSections,
} from "../prompt/promptSectionBuilder.js";
import {
  buildResponsePrompt,
} from "../prompt/responsePromptBuilder.js";
import {
  resolvePromptStrategy,
} from "../prompt/promptStrategyResolver.js";
import {
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";
import type {
  PromptBudgetLevel,
  PromptSection,
  ResponsePrompt,
} from "../types/responsePrompt.js";
import type {
  ResponseBlockContext,
  ResponseContext,
} from "../response/responseContext.js";
import type {
  VNextEvidenceItem,
} from "../types/humanState.js";

const PAYLOAD_MEASUREMENT_FIXTURES = [
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
] as const;

function formatEvidenceItemForMeasurement(item: VNextEvidenceItem): string {
  return `- ${item.key}: ${item.description}`;
}

function resolveBlockSection(
  sections: readonly PromptSection[],
  blockId: string,
): PromptSection | undefined {
  return sections.find((section) => section.blockIds.includes(blockId));
}

function extractSerializedEvidenceItems(
  content: string,
  relevantEvidence: readonly VNextEvidenceItem[],
): VNextEvidenceItem[] {
  const found: { index: number; item: VNextEvidenceItem }[] = [];

  for (const item of relevantEvidence) {
    const marker = formatEvidenceItemForMeasurement(item);
    const index = content.indexOf(marker);

    if (index >= 0) {
      found.push({ index, item });
    }
  }

  return found
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.item);
}

function countSerializedEvidenceForBlock(
  block: ResponseBlockContext,
  section: PromptSection | undefined,
): number {
  if (!section) {
    return 0;
  }

  return extractSerializedEvidenceItems(
    section.content,
    block.relevantEvidence,
  ).length;
}

function measureEvidencePayloadChars(
  sections: readonly PromptSection[],
  context: ResponseContext,
): number {
  let totalChars = 0;

  for (const block of context.blocks) {
    const section = resolveBlockSection(sections, block.id);

    if (!section) {
      continue;
    }

    const serializedItems = extractSerializedEvidenceItems(
      section.content,
      block.relevantEvidence,
    );

    for (const item of serializedItems) {
      totalChars += formatEvidenceItemForMeasurement(item).length;
    }

    if (serializedItems.length > 1) {
      totalChars += serializedItems.length - 1;
    }
  }

  return totalChars;
}

function countTotalSerializedEvidence(
  sections: readonly PromptSection[],
  context: ResponseContext,
): number {
  return context.blocks.reduce(
    (total, block) =>
      total + countSerializedEvidenceForBlock(
        block,
        resolveBlockSection(sections, block.id),
      ),
    0,
  );
}

function buildSelectedSections(
  context: ResponseContext,
  budget: PromptBudgetLevel,
): PromptSection[] {
  const strategy = resolvePromptStrategy(context);
  const evidencePolicy = resolvePromptEvidencePolicy(budget);
  const allSections = buildPromptSections(context, strategy, {
    evidencePolicy,
  });

  return applyPromptBudget(allSections, budget, strategy);
}

function resolvePromptLength(prompt: ResponsePrompt): number {
  return prompt.systemInstruction.length + prompt.userPrompt.length;
}

function safeRatio(
  numerator: number,
  denominator: number,
): number | null {
  if (denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

export type BudgetPayloadMeasurementMetrics = {
  promptLength: number;
  sectionCount: number;
  evidenceCount: number;
  evidencePayloadChars: number;
  evidencePayloadRatio: number | null;
};

export type BudgetPayloadMeasurementSavings = {
  standardVsDetailedChars: number;
  standardVsDetailedPercent: number | null;
  minimalVsStandardChars: number;
  minimalVsStandardPercent: number | null;
};

export type VNextPromptBudgetPayloadMeasurementCase = {
  id: string;
  category: string;
  questionText: string;
  minimal: BudgetPayloadMeasurementMetrics;
  standard: BudgetPayloadMeasurementMetrics;
  detailed: BudgetPayloadMeasurementMetrics;
  savings: BudgetPayloadMeasurementSavings;
  monotonicPromptLength: boolean;
  monotonicEvidenceCount: boolean;
};

export type VNextPromptBudgetPayloadMeasurementAggregate = {
  minimalTotalLength: number;
  standardTotalLength: number;
  detailedTotalLength: number;
  standardSavingsChars: number;
  standardSavingsPercent: number | null;
};

export type VNextPromptBudgetPayloadMeasurementResult = {
  cases: VNextPromptBudgetPayloadMeasurementCase[];
  aggregate: VNextPromptBudgetPayloadMeasurementAggregate;
};

function measureBudgetPayload(
  context: ResponseContext,
  budget: PromptBudgetLevel,
): BudgetPayloadMeasurementMetrics {
  const prompt = buildResponsePrompt({
    responseContext: context,
    budget,
  });
  const selectedSections = buildSelectedSections(context, budget);
  const promptLength = resolvePromptLength(prompt);
  const evidenceCount = countTotalSerializedEvidence(
    selectedSections,
    context,
  );
  const evidencePayloadChars = measureEvidencePayloadChars(
    selectedSections,
    context,
  );

  return {
    promptLength,
    sectionCount: selectedSections.length,
    evidenceCount,
    evidencePayloadChars,
    evidencePayloadRatio: safeRatio(evidencePayloadChars, promptLength),
  };
}

function buildSavings(
  minimal: BudgetPayloadMeasurementMetrics,
  standard: BudgetPayloadMeasurementMetrics,
  detailed: BudgetPayloadMeasurementMetrics,
): BudgetPayloadMeasurementSavings {
  const standardVsDetailedChars = detailed.promptLength - standard.promptLength;
  const minimalVsStandardChars = standard.promptLength - minimal.promptLength;

  return {
    standardVsDetailedChars,
    standardVsDetailedPercent: safeRatio(
      standardVsDetailedChars,
      detailed.promptLength,
    ),
    minimalVsStandardChars,
    minimalVsStandardPercent: safeRatio(
      minimalVsStandardChars,
      standard.promptLength,
    ),
  };
}

function measurePayloadCase(
  fixture: (typeof PAYLOAD_MEASUREMENT_FIXTURES)[number],
): VNextPromptBudgetPayloadMeasurementCase | null {
  const { action, context } = runPromptPipelineCase(fixture.questionText);

  if (action.type !== "consulting" || !context) {
    return null;
  }

  const minimal = measureBudgetPayload(context, "minimal");
  const standard = measureBudgetPayload(context, "standard");
  const detailed = measureBudgetPayload(context, "detailed");

  return {
    id: fixture.id,
    category: fixture.category,
    questionText: fixture.questionText,
    minimal,
    standard,
    detailed,
    savings: buildSavings(minimal, standard, detailed),
    monotonicPromptLength:
      minimal.promptLength <= standard.promptLength
      && standard.promptLength <= detailed.promptLength,
    monotonicEvidenceCount:
      minimal.evidenceCount <= standard.evidenceCount
      && standard.evidenceCount <= detailed.evidenceCount,
  };
}

function buildAggregate(
  cases: VNextPromptBudgetPayloadMeasurementCase[],
): VNextPromptBudgetPayloadMeasurementAggregate {
  const minimalTotalLength = cases.reduce(
    (total, item) => total + item.minimal.promptLength,
    0,
  );
  const standardTotalLength = cases.reduce(
    (total, item) => total + item.standard.promptLength,
    0,
  );
  const detailedTotalLength = cases.reduce(
    (total, item) => total + item.detailed.promptLength,
    0,
  );
  const standardSavingsChars = detailedTotalLength - standardTotalLength;

  return {
    minimalTotalLength,
    standardTotalLength,
    detailedTotalLength,
    standardSavingsChars,
    standardSavingsPercent: safeRatio(
      standardSavingsChars,
      detailedTotalLength,
    ),
  };
}

export function measurePromptBudgetPayload(): VNextPromptBudgetPayloadMeasurementResult {
  const cases = PAYLOAD_MEASUREMENT_FIXTURES
    .map(measurePayloadCase)
    .filter(
      (item): item is VNextPromptBudgetPayloadMeasurementCase =>
        item !== null,
    );

  return {
    cases,
    aggregate: buildAggregate(cases),
  };
}

export function serializePromptBudgetPayloadMeasurementResult(
  result: VNextPromptBudgetPayloadMeasurementResult,
): string {
  return JSON.stringify(
    {
      cases: result.cases.map((item) => ({
        id: item.id,
        category: item.category,
        questionText: item.questionText,
        minimal: {
          promptLength: item.minimal.promptLength,
          sectionCount: item.minimal.sectionCount,
          evidenceCount: item.minimal.evidenceCount,
          evidencePayloadChars: item.minimal.evidencePayloadChars,
          evidencePayloadRatio: item.minimal.evidencePayloadRatio,
        },
        standard: {
          promptLength: item.standard.promptLength,
          sectionCount: item.standard.sectionCount,
          evidenceCount: item.standard.evidenceCount,
          evidencePayloadChars: item.standard.evidencePayloadChars,
          evidencePayloadRatio: item.standard.evidencePayloadRatio,
        },
        detailed: {
          promptLength: item.detailed.promptLength,
          sectionCount: item.detailed.sectionCount,
          evidenceCount: item.detailed.evidenceCount,
          evidencePayloadChars: item.detailed.evidencePayloadChars,
          evidencePayloadRatio: item.detailed.evidencePayloadRatio,
        },
        savings: item.savings,
        monotonicPromptLength: item.monotonicPromptLength,
        monotonicEvidenceCount: item.monotonicEvidenceCount,
      })),
      aggregate: result.aggregate,
    },
    null,
    2,
  );
}
