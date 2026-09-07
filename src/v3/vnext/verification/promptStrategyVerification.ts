import {
  resolvePromptStrategy,
} from "../prompt/promptStrategyResolver.js";
import {
  runPromptPipelineCase,
  includesAll,
} from "./promptVerificationFixture.js";
import type {
  ConversationStyle,
} from "../types/responsePrompt.js";

export type PromptStrategyVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
  conversationStyle: ConversationStyle | null;
  requiredBlocks: string[];
};

export type PromptStrategyVerificationResult = {
  passed: boolean;
  cases: PromptStrategyVerificationCase[];
};

function verifyCase1CareerAptitude(): PromptStrategyVerificationCase {
  const { context } = runPromptPipelineCase(
    "나에게 맞는 직업은 무엇인가요?",
  );

  if (!context) {
    return {
      id: "case-1-career-aptitude",
      passed: false,
      details: ["context missing"],
      conversationStyle: null,
      requiredBlocks: [],
    };
  }

  const strategy = resolvePromptStrategy(context);

  const checks = [
    strategy.conversationStyle === "conversational",
    strategy.scenario === "aptitudeRecommendation",
    includesAll(strategy.requiredBlocks, [
      "ability",
      "suitableRole",
      "workingEnvironment",
      "caution",
      "nextAction",
    ]),
    strategy.forbiddenPatterns.some((item) =>
      item.includes("직업명"),
    ),
  ];

  return {
    id: "case-1-career-aptitude",
    passed: checks.every(Boolean),
    details: [
      `conversationStyle=${strategy.conversationStyle}`,
      `requiredBlocks=${strategy.requiredBlocks.join(",")}`,
      `forbiddenPatterns=${strategy.forbiddenPatterns.join(",")}`,
    ],
    conversationStyle: strategy.conversationStyle,
    requiredBlocks: strategy.requiredBlocks,
  };
}

function verifyCase2OctoberMoneyFlow(): PromptStrategyVerificationCase {
  const { context } = runPromptPipelineCase(
    "10월 금전운이 있을까요?",
    { includeLuckFlow: true },
  );

  if (!context) {
    return {
      id: "case-2-october-money-flow",
      passed: false,
      details: ["context missing"],
      conversationStyle: null,
      requiredBlocks: [],
    };
  }

  const strategy = resolvePromptStrategy(context);

  const checks = [
    strategy.conversationStyle === "conversational",
    strategy.scenario === "generalFlow",
    includesAll(strategy.requiredBlocks, [
      "periodOverview",
      "earlyPeriod",
      "middlePeriod",
      "latePeriod",
    ]),
    strategy.forbiddenPatterns.some((item) =>
      item.includes("재무"),
    ),
  ];

  return {
    id: "case-2-october-money-flow",
    passed: checks.every(Boolean),
    details: [
      `conversationStyle=${strategy.conversationStyle}`,
      `requiredBlocks=${strategy.requiredBlocks.join(",")}`,
    ],
    conversationStyle: strategy.conversationStyle,
    requiredBlocks: strategy.requiredBlocks,
  };
}

function verifyCase3StoreOpening(): PromptStrategyVerificationCase {
  const { context } = runPromptPipelineCase(
    "10월에 가게를 오픈하려고 하는데 어떨까요?",
    { includeLuckFlow: true },
  );

  if (!context) {
    return {
      id: "case-3-store-opening",
      passed: false,
      details: ["context missing"],
      conversationStyle: null,
      requiredBlocks: [],
    };
  }

  const strategy = resolvePromptStrategy(context);

  const checks = [
    strategy.conversationStyle === "conversational",
    strategy.scenario === "generalFlow",
    includesAll(strategy.requiredBlocks, [
      "periodOverview",
      "earlyPeriod",
      "middlePeriod",
      "latePeriod",
      "opportunity",
      "pressure",
      "moneyOrDomainEffect",
      "caution",
    ]),
  ];

  return {
    id: "case-3-store-opening",
    passed: checks.every(Boolean),
    details: [
      `conversationStyle=${strategy.conversationStyle}`,
      `requiredBlocks=${strategy.requiredBlocks.join(",")}`,
    ],
    conversationStyle: strategy.conversationStyle,
    requiredBlocks: strategy.requiredBlocks,
  };
}

function verifyReportModeStrategy(): PromptStrategyVerificationCase {
  const { context } = runPromptPipelineCase(
    "10월 금전운이 있을까요?",
    {
      includeLuckFlow: true,
      answerMode: "report",
    },
  );

  if (!context) {
    return {
      id: "case-6-report-mode-strategy",
      passed: false,
      details: ["context missing"],
      conversationStyle: null,
      requiredBlocks: [],
    };
  }

  const strategy = resolvePromptStrategy(context);

  const checks = [
    strategy.answerMode === "report",
    strategy.conversationStyle === "analyticalReport",
    includesAll(strategy.requiredBlocks, [
      "humanState",
      "timeState",
      "changeSignals",
      "assessment",
      "conclusion",
    ]),
  ];

  return {
    id: "case-6-report-mode-strategy",
    passed: checks.every(Boolean),
    details: [
      `conversationStyle=${strategy.conversationStyle}`,
      `requiredBlocks=${strategy.requiredBlocks.join(",")}`,
    ],
    conversationStyle: strategy.conversationStyle,
    requiredBlocks: strategy.requiredBlocks,
  };
}

export function verifyPromptStrategies(): PromptStrategyVerificationResult {
  const cases = [
    verifyCase1CareerAptitude(),
    verifyCase2OctoberMoneyFlow(),
    verifyCase3StoreOpening(),
    verifyReportModeStrategy(),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializePromptStrategyVerificationResult(
  result: PromptStrategyVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
