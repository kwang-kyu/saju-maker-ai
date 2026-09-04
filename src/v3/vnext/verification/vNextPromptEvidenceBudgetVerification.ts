/**
 * P4-2 STEP 4-E-2-C — Prompt Evidence Budget Verification.
 *
 * resolvePromptEvidencePolicy(budget) → buildPromptSections(... evidencePolicy)
 * production Prompt 생성 경로에서 Budget별 Evidence 직렬화 정책이
 * ResponseBlockContext.relevantEvidence 기준으로 정확히 적용되는지 검증한다.
 *
 * Verification-only. Production 파일은 수정하지 않는다.
 */

import {
  applyPromptBudget,
  resolveBudgetEvidenceLimit,
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
} from "../types/responsePrompt.js";
import type {
  ResponseBlockContext,
  ResponseContext,
} from "../response/responseContext.js";
import type {
  VNextEvidenceItem,
} from "../types/humanState.js";

const EVIDENCE_BUDGET_CASE_FIXTURES = [
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

const BUDGET_LEVELS: readonly PromptBudgetLevel[] = [
  "minimal",
  "standard",
  "detailed",
];

function buildEvidenceIdentity(
  sourceKey: string,
  description: string,
): string {
  return `${sourceKey}\0${description}`;
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

function resolveBlockSection(
  sections: readonly PromptSection[],
  blockId: string,
): PromptSection | undefined {
  return sections.find((section) => section.blockIds.includes(blockId));
}

function countSerializedEvidenceForBlock(
  block: ResponseBlockContext,
  section: PromptSection | undefined,
): number {
  if (!section) {
    return 0;
  }

  return extractSerializedEvidenceIdentities(
    section.content,
    block.relevantEvidence,
  ).length;
}

export type BlockEvidenceBudgetResult = {
  blockId: string;
  relevantEvidenceCount: number;
  serializedCount: number;
  expectedIdentities: string[];
  actualIdentities: string[];
  passed: boolean;
  details: string[];
};

export type BudgetEvidenceVerificationResult = {
  budget: PromptBudgetLevel;
  passed: boolean;
  totalSerializedCount: number;
  blockResults: BlockEvidenceBudgetResult[];
  details: string[];
};

export type VNextPromptEvidenceBudgetVerificationCase = {
  id: string;
  category: string;
  questionText: string;
  passed: boolean;
  actionType: string;
  promptGenerated: boolean;
  budgets: Record<PromptBudgetLevel, BudgetEvidenceVerificationResult>;
  monotonicPassed: boolean;
  includeEvidenceFallbackPassed: boolean;
  details: string[];
};

export type VNextPromptEvidenceBudgetVerificationResult = {
  passed: boolean;
  cases: VNextPromptEvidenceBudgetVerificationCase[];
};

function verifyBudgetEvidenceForContext(
  context: ResponseContext,
  budget: PromptBudgetLevel,
): BudgetEvidenceVerificationResult {
  const strategy = resolvePromptStrategy(context);
  const evidencePolicy = resolvePromptEvidencePolicy(budget);
  const allSections = buildPromptSections(context, strategy, {
    evidencePolicy,
  });
  const selectedSections = applyPromptBudget(
    allSections,
    budget,
    strategy,
  );

  const blockResults: BlockEvidenceBudgetResult[] = [];
  let totalSerializedCount = 0;

  for (const block of context.blocks) {
    const limit = resolveBudgetEvidenceLimit(budget, block.id);
    const expectedIdentities = buildExpectedEvidenceIdentities(
      block.relevantEvidence,
      limit,
    );
    const section = resolveBlockSection(selectedSections, block.id);
    const actualIdentities = section
      ? extractSerializedEvidenceIdentities(
          section.content,
          block.relevantEvidence,
        )
      : [];

    totalSerializedCount += actualIdentities.length;

    const details: string[] = [
      `block=${block.id}`,
      `limit=${limit === Number.POSITIVE_INFINITY ? "Infinity" : limit}`,
      `relevantEvidenceCount=${block.relevantEvidence.length}`,
      `serializedCount=${actualIdentities.length}`,
    ];

    const checks: boolean[] = [];

    if (budget === "minimal") {
      checks.push(actualIdentities.length === 0);
      if (actualIdentities.length !== 0) {
        details.push("minimalExpectedZeroEvidence");
      }
    }

    if (budget === "standard") {
      if (block.id === "directAnswer") {
        checks.push(actualIdentities.length <= 1);

        if (actualIdentities.length > 0) {
          const firstExpected = expectedIdentities[0] ?? null;
          checks.push(actualIdentities[0] === firstExpected);
          details.push(
            `standardDirectAnswerFirstIdentityMatch=${actualIdentities[0] === firstExpected}`,
          );
        }
      } else {
        checks.push(actualIdentities.length === 0);
        if (actualIdentities.length !== 0) {
          details.push("standardOtherBlockExpectedZeroEvidence");
        }
      }
    }

    if (budget === "detailed") {
      checks.push(
        actualIdentities.length === expectedIdentities.length,
      );
      checks.push(
        actualIdentities.every(
          (identity, index) => identity === expectedIdentities[index],
        ),
      );
      if (
        actualIdentities.join("|") !== expectedIdentities.join("|")
      ) {
        details.push("detailedSequenceMismatch");
      }
    }

    checks.push(
      actualIdentities.join("|") === expectedIdentities.join("|"),
    );

    blockResults.push({
      blockId: block.id,
      relevantEvidenceCount: block.relevantEvidence.length,
      serializedCount: actualIdentities.length,
      expectedIdentities,
      actualIdentities,
      passed: checks.every(Boolean),
      details,
    });
  }

  return {
    budget,
    passed: blockResults.every((item) => item.passed),
    totalSerializedCount,
    blockResults,
    details: [
      `budget=${budget}`,
      `totalSerializedCount=${totalSerializedCount}`,
      `blockCount=${blockResults.length}`,
    ],
  };
}

function verifyMonotonicEvidenceCounts(
  budgets: Record<PromptBudgetLevel, BudgetEvidenceVerificationResult>,
  context: ResponseContext,
): boolean {
  for (const block of context.blocks) {
    const minimalCount = countSerializedEvidenceForBlock(
      block,
      resolveBlockSection(
        buildSelectedSections(context, "minimal"),
        block.id,
      ),
    );
    const standardCount = countSerializedEvidenceForBlock(
      block,
      resolveBlockSection(
        buildSelectedSections(context, "standard"),
        block.id,
      ),
    );
    const detailedCount = countSerializedEvidenceForBlock(
      block,
      resolveBlockSection(
        buildSelectedSections(context, "detailed"),
        block.id,
      ),
    );

    if (
      minimalCount > standardCount
      || standardCount > detailedCount
    ) {
      return false;
    }
  }

  const minimalTotal = budgets.minimal.totalSerializedCount;
  const standardTotal = budgets.standard.totalSerializedCount;
  const detailedTotal = budgets.detailed.totalSerializedCount;

  return minimalTotal <= standardTotal && standardTotal <= detailedTotal;
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

function verifyIncludeEvidenceFallback(
  context: ResponseContext,
): boolean {
  const strategy = resolvePromptStrategy(context);

  const minimalLikeSections = buildPromptSections(context, strategy, {
    includeEvidence: false,
  });
  const detailedLikeSections = buildPromptSections(context, strategy, {
    includeEvidence: true,
  });

  for (const block of context.blocks) {
    const minimalLikeSection = resolveBlockSection(
      minimalLikeSections,
      block.id,
    );
    const detailedLikeSection = resolveBlockSection(
      detailedLikeSections,
      block.id,
    );

    const minimalLikeCount = minimalLikeSection
      ? extractSerializedEvidenceIdentities(
          minimalLikeSection.content,
          block.relevantEvidence,
        ).length
      : 0;
    const detailedLikeCount = detailedLikeSection
      ? extractSerializedEvidenceIdentities(
          detailedLikeSection.content,
          block.relevantEvidence,
        ).length
      : 0;

    const expectedMinimalCount = buildExpectedEvidenceIdentities(
      block.relevantEvidence,
      resolveBudgetEvidenceLimit("minimal", block.id),
    ).length;
    const expectedDetailedCount = buildExpectedEvidenceIdentities(
      block.relevantEvidence,
      resolveBudgetEvidenceLimit("detailed", block.id),
    ).length;

    if (
      minimalLikeCount !== expectedMinimalCount
      || detailedLikeCount !== expectedDetailedCount
    ) {
      return false;
    }
  }

  return true;
}

function verifyEvidenceBudgetCase(
  fixture: (typeof EVIDENCE_BUDGET_CASE_FIXTURES)[number],
): VNextPromptEvidenceBudgetVerificationCase {
  const { action, context } = runPromptPipelineCase(fixture.questionText);

  if (action.type !== "consulting" || !context) {
    return {
      id: fixture.id,
      category: fixture.category,
      questionText: fixture.questionText,
      passed: false,
      actionType: action.type,
      promptGenerated: false,
      budgets: {
        minimal: {
          budget: "minimal",
          passed: false,
          totalSerializedCount: 0,
          blockResults: [],
          details: ["context missing"],
        },
        standard: {
          budget: "standard",
          passed: false,
          totalSerializedCount: 0,
          blockResults: [],
          details: ["context missing"],
        },
        detailed: {
          budget: "detailed",
          passed: false,
          totalSerializedCount: 0,
          blockResults: [],
          details: ["context missing"],
        },
      },
      monotonicPassed: false,
      includeEvidenceFallbackPassed: false,
      details: [`action=${action.type}`, "expected consulting context"],
    };
  }

  const budgets = {} as Record<
    PromptBudgetLevel,
    BudgetEvidenceVerificationResult
  >;

  for (const budget of BUDGET_LEVELS) {
    const prompt = buildResponsePrompt({
      responseContext: context,
      budget,
    });

    const budgetResult = verifyBudgetEvidenceForContext(context, budget);
    budgets[budget] = {
      ...budgetResult,
      passed: budgetResult.passed && prompt.metadata.budget === budget,
      details: [
        ...budgetResult.details,
        `buildResponsePromptBudget=${prompt.metadata.budget}`,
      ],
    };
  }

  const monotonicPassed = verifyMonotonicEvidenceCounts(
    budgets,
    context,
  );
  const includeEvidenceFallbackPassed = verifyIncludeEvidenceFallback(
    context,
  );

  const passed = BUDGET_LEVELS.every((budget) => budgets[budget].passed)
    && monotonicPassed
    && includeEvidenceFallbackPassed;

  return {
    id: fixture.id,
    category: fixture.category,
    questionText: fixture.questionText,
    passed,
    actionType: action.type,
    promptGenerated: true,
    budgets,
    monotonicPassed,
    includeEvidenceFallbackPassed,
    details: [
      `action=${action.type}`,
      `minimalTotal=${budgets.minimal.totalSerializedCount}`,
      `standardTotal=${budgets.standard.totalSerializedCount}`,
      `detailedTotal=${budgets.detailed.totalSerializedCount}`,
      `monotonicPassed=${monotonicPassed}`,
      `includeEvidenceFallbackPassed=${includeEvidenceFallbackPassed}`,
    ],
  };
}

export function verifyPromptEvidenceBudget(): VNextPromptEvidenceBudgetVerificationResult {
  const cases = EVIDENCE_BUDGET_CASE_FIXTURES.map(verifyEvidenceBudgetCase);

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializePromptEvidenceBudgetVerificationResult(
  result: VNextPromptEvidenceBudgetVerificationResult,
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
        monotonicPassed: item.monotonicPassed,
        includeEvidenceFallbackPassed: item.includeEvidenceFallbackPassed,
        details: item.details,
        budgets: {
          minimal: summarizeBudgetResult(item.budgets.minimal),
          standard: summarizeBudgetResult(item.budgets.standard),
          detailed: summarizeBudgetResult(item.budgets.detailed),
        },
      })),
    },
    null,
    2,
  );
}

function summarizeBudgetResult(
  budgetResult: BudgetEvidenceVerificationResult,
) {
  return {
    budget: budgetResult.budget,
    passed: budgetResult.passed,
    totalSerializedCount: budgetResult.totalSerializedCount,
    details: budgetResult.details,
    blocks: budgetResult.blockResults.map((block) => ({
      blockId: block.blockId,
      passed: block.passed,
      relevantEvidenceCount: block.relevantEvidenceCount,
      serializedCount: block.serializedCount,
      expectedIdentities: block.expectedIdentities,
      actualIdentities: block.actualIdentities,
      details: block.details,
    })),
  };
}
