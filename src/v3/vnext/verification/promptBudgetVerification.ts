import {
  applyPromptBudget,
  estimatePromptSectionsSize,
} from "../prompt/promptBudgetController.js";
import {
  buildPromptSections,
} from "../prompt/promptSectionBuilder.js";
import {
  resolvePromptStrategy,
} from "../prompt/promptStrategyResolver.js";
import {
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";

export type PromptBudgetVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
  minimalSize: number;
  standardSize: number;
  detailedSize: number;
};

export type PromptBudgetVerificationResult = {
  passed: boolean;
  cases: PromptBudgetVerificationCase[];
};

function verifyBudgetCase(
  id: string,
  questionText: string,
  options?: Parameters<typeof runPromptPipelineCase>[1],
): PromptBudgetVerificationCase {
  const { context } = runPromptPipelineCase(questionText, options);

  if (!context) {
    return {
      id,
      passed: false,
      details: ["context missing"],
      minimalSize: 0,
      standardSize: 0,
      detailedSize: 0,
    };
  }

  const strategy = resolvePromptStrategy(context);
  const allSections = buildPromptSections(context, strategy, {
    includeEvidence: false,
  });
  const detailedSections = buildPromptSections(context, strategy, {
    includeEvidence: true,
  });

  const minimalSections = applyPromptBudget(
    allSections,
    "minimal",
    strategy,
  );
  const standardSections = applyPromptBudget(
    allSections,
    "standard",
    strategy,
  );
  const detailedBudgetSections = applyPromptBudget(
    detailedSections,
    "detailed",
    strategy,
  );

  const minimalSize = estimatePromptSectionsSize(minimalSections);
  const standardSize = estimatePromptSectionsSize(standardSections);
  const detailedSize = estimatePromptSectionsSize(detailedBudgetSections);

  const checks = [
    minimalSize <= standardSize,
    standardSize <= detailedSize,
    minimalSections.some((section) => section.id === "question"),
    minimalSections.some((section) => section.id === "explanationRules"),
    standardSections.length >= minimalSections.length,
  ];

  return {
    id,
    passed: checks.every(Boolean),
    details: [
      `minimalSize=${minimalSize}`,
      `standardSize=${standardSize}`,
      `detailedSize=${detailedSize}`,
      `minimalSections=${minimalSections.length}`,
      `standardSections=${standardSections.length}`,
      `detailedSections=${detailedBudgetSections.length}`,
    ],
    minimalSize,
    standardSize,
    detailedSize,
  };
}

export function verifyPromptBudgets(): PromptBudgetVerificationResult {
  const cases = [
    verifyBudgetCase(
      "case-1-career-aptitude",
      "나에게 맞는 직업은 무엇인가요?",
    ),
    verifyBudgetCase(
      "case-2-october-money-flow",
      "10월 금전운이 있을까요?",
      { includeLuckFlow: true },
    ),
    verifyBudgetCase(
      "case-3-store-opening",
      "10월에 가게를 오픈하려고 하는데 어떨까요?",
      { includeLuckFlow: true },
    ),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializePromptBudgetVerificationResult(
  result: PromptBudgetVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
