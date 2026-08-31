import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "../../consulting/decision/decisionEngine.js";
import {
  runVNextOrchestrator,
} from "../orchestration/vNextOrchestrator.js";
import type {
  AnalysisRequest,
  AnalysisResult,
} from "../types/index.js";
import type {
  ChangeSignalType,
} from "../types/changeSignal.js";
import type {
  HumanStateDomain,
} from "../types/humanState.js";
import type {
  SajuCurrentSeunFact,
  SajuTargetPeriodLuckFlowFact,
  SajuWolunSegmentFact,
} from "../../types/luckFlowFact.js";
import {
  buildResponseContext,
  estimateResponseBlocksPayloadSize,
  estimateResponseContextPayloadSize,
  estimateSelectableAnalysisSize,
} from "../response/responseContextBuilder.js";
import type {
  ResponseContext,
} from "../response/responseContext.js";

export type ResponseContextVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
  responseContext: ResponseContext | null;
  payloadSize: number;
  analysisPayloadSize: number;
};

export type ResponseContextVerificationResult = {
  passed: boolean;
  cases: ResponseContextVerificationCase[];
};

const ALL_HUMAN_DOMAINS: HumanStateDomain[] = [
  "personality",
  "ability",
  "repeatedPattern",
  "money",
  "career",
  "relationship",
  "capacity",
  "risk",
];

function includesAll<T extends string>(
  actual: readonly T[],
  expected: readonly T[],
): boolean {
  return expected.every((item) => actual.includes(item));
}

function buildMockTargetPeriodLuckFlow(): SajuTargetPeriodLuckFlowFact {
  const targetSeun: SajuCurrentSeunFact = {
    year: 2026,
    age: 42,
    ganZhi: "丙午",
    heavenlyStem: "丙",
    earthlyBranch: "午",
    tenGod: "편관",
    element: "fire",
  };

  const wolunSegment: SajuWolunSegmentFact = {
    targetYear: 2026,
    targetMonth: 10,
    ganZhi: "丁酉",
    heavenlyStem: "丁",
    earthlyBranch: "酉",
    tenGod: "편재",
    element: "metal",
    startDate: "2026-10-08",
    endDate: "2026-11-07",
    jieQiBoundary: {
      name: "寒露",
      date: "2026-10-08",
    },
  };

  return {
    targetStartDate: "2026-10-01",
    targetEndDate: "2026-10-31",
    currentDaeun: null,
    targetSeun,
    yearSegments: [],
    wolunSegments: [wolunSegment],
    targetIlun: null,
    limitations: [],
  };
}

function runAnalysisCase(
  questionText: string,
  options?: {
    includeLuckFlow?: boolean;
    answerMode?: AnalysisRequest["answerMode"];
  },
): AnalysisResult {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });

  const decisionResult = runDecisionEngine(regressionInput);

  const analysisRequest: AnalysisRequest = {
    sources: ["saju"],
    humanInput: {},
    question: regressionInput.question.originalQuestion,
    answerMode: options?.answerMode ?? "question",
    targetPeriod: options?.includeLuckFlow
      ? {
          start: "2026-10-01",
          end: "2026-10-31",
          granularity: "month",
          label: "2026-10",
        }
      : undefined,
  };

  return runVNextOrchestrator({
    analysisRequest,
    humanDestinyContext: regressionInput.humanContext,
    targetPeriodLuckFlow: options?.includeLuckFlow
      ? buildMockTargetPeriodLuckFlow()
      : undefined,
    questionReaderResult: regressionInput.question,
    decisionResult,
    targetPeriod: options?.includeLuckFlow
      ? {
          start: "2026-10-01",
          end: "2026-10-31",
          granularity: "month",
          label: "2026-10",
        }
      : null,
  });
}

function estimateAnalysisPayloadSize(
  analysisResult: AnalysisResult,
): number {
  return JSON.stringify(analysisResult).length;
}

function collectBlockIds(
  context: ResponseContext,
): string[] {
  return context.blocks.map((block) => block.id);
}

function collectSignalTypes(
  context: ResponseContext,
): ChangeSignalType[] {
  return context.blocks.flatMap((block) =>
    block.relevantSignals.map((signal) => signal.type),
  );
}

function containsFullHumanStateDump(
  context: ResponseContext,
): boolean {
  const serialized = JSON.stringify(context);

  const domainCount = ALL_HUMAN_DOMAINS.filter((domain) =>
    serialized.includes(`"domain":"${domain}"`),
  ).length;

  return domainCount >= ALL_HUMAN_DOMAINS.length
    || serialized.includes("currentLifePhase");
}

function containsFullTimeStateDump(
  context: ResponseContext,
): boolean {
  const serialized = JSON.stringify(context);

  return [
    "daeunLabel",
    "ilunLabel",
    "jieQiBoundaries",
  ].some((token) => serialized.includes(token));
}

function containsFullAssessmentDump(
  context: ResponseContext,
): boolean {
  const serialized = JSON.stringify(context);

  return serialized.includes("timeDifferences")
    && serialized.includes("changeIntensity")
    && serialized.includes("conditions")
    && serialized.includes("risks")
    && context.blocks.length <= 2;
}

function hasUnexpectedSignals(
  context: ResponseContext,
  allowedTypes: readonly ChangeSignalType[],
): boolean {
  const signalTypes = collectSignalTypes(context);

  return signalTypes.some(
    (signalType) => !allowedTypes.includes(signalType),
  );
}

function containsTimeStateLeak(
  context: ResponseContext,
): boolean {
  const serialized = JSON.stringify(context.blocks);

  return [
    "wolunLabel",
    "wolunSummary",
    "seunLabel",
    "granularity",
  ].some((token) => serialized.includes(token));
}

function containsChangeSignalLeak(
  context: ResponseContext,
): boolean {
  return collectSignalTypes(context).length > 0;
}

export function verifyResponseContextReduction(
  context: ResponseContext,
  analysisResult: AnalysisResult,
): {
  passed: boolean;
  details: string[];
} {
  const payloadSize = estimateResponseContextPayloadSize(context);
  const blocksPayloadSize = estimateResponseBlocksPayloadSize(context);
  const analysisPayloadSize = estimateAnalysisPayloadSize(analysisResult);
  const selectableAnalysisSize = estimateSelectableAnalysisSize(
    analysisResult,
  );

  const hasTimeState = analysisResult.timeState?.status === "ready";
  const hasChangeSignals = analysisResult.changeSignals?.status === "ready";

  const checks = [
    !containsFullHumanStateDump(context),
    !containsFullTimeStateDump(context),
    !containsFullAssessmentDump(context),
  ];

  if (hasTimeState || hasChangeSignals) {
    checks.push(blocksPayloadSize <= selectableAnalysisSize);
  } else {
    checks.push(!containsTimeStateLeak(context));
    checks.push(!containsChangeSignalLeak(context));
  }

  return {
    passed: checks.every(Boolean),
    details: [
      `payloadSize=${payloadSize}`,
      `blocksPayloadSize=${blocksPayloadSize}`,
      `analysisPayloadSize=${analysisPayloadSize}`,
      `selectableAnalysisSize=${selectableAnalysisSize}`,
      `timeStateLeak=${containsTimeStateLeak(context)}`,
      `changeSignalLeak=${containsChangeSignalLeak(context)}`,
      `fullHumanStateDump=${containsFullHumanStateDump(context)}`,
      `fullTimeStateDump=${containsFullTimeStateDump(context)}`,
      `fullAssessmentDump=${containsFullAssessmentDump(context)}`,
    ],
  };
}

function verifyCase1CareerAptitude(): ResponseContextVerificationCase {
  const questionText = "나에게 맞는 직업은 무엇인가요?";
  const analysisResult = runAnalysisCase(questionText);
  const responseContext = buildResponseContext({
    analysisResult,
    originalQuestion: questionText,
    answerMode: "question",
  });

  const expectedBlocks = [
    "ability",
    "suitableRole",
    "workingEnvironment",
    "caution",
    "nextAction",
  ];

  const blockIds = responseContext
    ? collectBlockIds(responseContext)
    : [];

  const signalTypes = responseContext
    ? collectSignalTypes(responseContext)
    : [];

  const reduction = responseContext
    ? verifyResponseContextReduction(responseContext, analysisResult)
    : { passed: false, details: ["responseContext is null"] };

  const checks = [
    responseContext !== null,
    includesAll(blockIds, expectedBlocks),
    signalTypes.length === 0,
    !blockIds.some((blockId) =>
      ["periodOverview", "earlyPeriod", "opportunity"].includes(blockId),
    ),
    reduction.passed,
  ];

  return {
    id: "case-1-career-aptitude",
    passed: checks.every(Boolean),
    details: [
      `blocks=${blockIds.join(",")}`,
      `signalTypes=${signalTypes.join(",") || "none"}`,
      ...reduction.details,
    ],
    responseContext,
    payloadSize: responseContext
      ? estimateResponseContextPayloadSize(responseContext)
      : 0,
    analysisPayloadSize: estimateAnalysisPayloadSize(analysisResult),
  };
}

function verifyCase2OctoberMoneyFlow(): ResponseContextVerificationCase {
  const questionText = "10월 금전운이 있을까요?";
  const analysisResult = runAnalysisCase(questionText, {
    includeLuckFlow: true,
  });
  const responseContext = buildResponseContext({
    analysisResult,
    originalQuestion: questionText,
    answerMode: "question",
  });

  const expectedBlocks = [
    "periodOverview",
    "earlyPeriod",
    "middlePeriod",
    "latePeriod",
    "opportunity",
    "pressure",
    "moneyOrDomainEffect",
    "caution",
  ];

  const blockIds = responseContext
    ? collectBlockIds(responseContext)
    : [];

  const signalTypes = responseContext
    ? collectSignalTypes(responseContext)
    : [];

  const allowedSignals: ChangeSignalType[] = [
    "opportunity",
    "inflow",
    "expense",
    "pressure",
    "risk",
  ];

  const reduction = responseContext
    ? verifyResponseContextReduction(responseContext, analysisResult)
    : { passed: false, details: ["responseContext is null"] };

  const checks = [
    responseContext !== null,
    includesAll(blockIds, expectedBlocks),
    !hasUnexpectedSignals(responseContext!, allowedSignals),
    !blockIds.includes("ability"),
    !blockIds.includes("suitableRole"),
    reduction.passed,
  ];

  return {
    id: "case-2-october-money-flow",
    passed: checks.every(Boolean),
    details: [
      `blocks=${blockIds.join(",")}`,
      `signalTypes=${signalTypes.join(",") || "none"}`,
      ...reduction.details,
    ],
    responseContext,
    payloadSize: responseContext
      ? estimateResponseContextPayloadSize(responseContext)
      : 0,
    analysisPayloadSize: estimateAnalysisPayloadSize(analysisResult),
  };
}

function verifyCase3StoreOpening(): ResponseContextVerificationCase {
  const questionText = "10월에 가게를 오픈하려고 하는데 어떨까요?";
  const analysisResult = runAnalysisCase(questionText, {
    includeLuckFlow: true,
  });
  const responseContext = buildResponseContext({
    analysisResult,
    originalQuestion: questionText,
    answerMode: "question",
  });

  const expectedBlocks = [
    "directAnswer",
    "currentDirection",
    "conditions",
    "risk",
    "scale",
    "timing",
    "nextAction",
  ];

  const blockIds = responseContext
    ? collectBlockIds(responseContext)
    : [];

  const reduction = responseContext
    ? verifyResponseContextReduction(responseContext, analysisResult)
    : { passed: false, details: ["responseContext is null"] };

  const checks = [
    responseContext !== null,
    includesAll(blockIds, expectedBlocks),
    !blockIds.includes("periodOverview"),
    !blockIds.includes("ability"),
    reduction.passed,
  ];

  return {
    id: "case-3-store-opening",
    passed: checks.every(Boolean),
    details: [
      `blocks=${blockIds.join(",")}`,
      ...reduction.details,
    ],
    responseContext,
    payloadSize: responseContext
      ? estimateResponseContextPayloadSize(responseContext)
      : 0,
    analysisPayloadSize: estimateAnalysisPayloadSize(analysisResult),
  };
}

function verifyCase4CompatibilityMissingContext(): ResponseContextVerificationCase {
  const questionText = "상대방과 궁합은 어떤가요?";
  const analysisResult = runAnalysisCase(questionText);
  const responseContext = buildResponseContext({
    analysisResult,
    originalQuestion: questionText,
    answerMode: "question",
  });

  const missingContext = responseContext?.missingContext ?? [];
  const blockIds = responseContext
    ? collectBlockIds(responseContext)
    : [];

  const checks = [
    responseContext !== null,
    missingContext.some((item) => item.required),
    blockIds.includes("followUpQuestion"),
    blockIds.length <= 2,
  ];

  return {
    id: "case-4-compatibility-missing-context",
    passed: checks.every(Boolean),
    details: [
      `missingContext=${missingContext.map((item) => item.key).join(",") || "none"}`,
      `blocks=${blockIds.join(",")}`,
    ],
    responseContext,
    payloadSize: responseContext
      ? estimateResponseContextPayloadSize(responseContext)
      : 0,
    analysisPayloadSize: estimateAnalysisPayloadSize(analysisResult),
  };
}

function verifyReportModeUsesSections(): ResponseContextVerificationCase {
  const questionText = "10월 금전운이 있을까요?";
  const analysisResult = runAnalysisCase(questionText, {
    includeLuckFlow: true,
    answerMode: "report",
  });
  const responseContext = buildResponseContext({
    analysisResult,
    originalQuestion: questionText,
    answerMode: "report",
  });

  const blockIds = responseContext
    ? collectBlockIds(responseContext)
    : [];

  const questionModeResult = runAnalysisCase(questionText, {
    includeLuckFlow: true,
    answerMode: "question",
  });
  const questionModeContext = buildResponseContext({
    analysisResult: questionModeResult,
    originalQuestion: questionText,
    answerMode: "question",
  });

  const checks = [
    responseContext?.answerMode === "report",
    includesAll(blockIds, [
      "humanState",
      "timeState",
      "changeSignals",
      "assessment",
      "conclusion",
    ]),
    questionModeContext !== null,
    responseContext !== null,
    estimateResponseContextPayloadSize(responseContext!)
      !== estimateResponseContextPayloadSize(questionModeContext!),
  ];

  return {
    id: "report-mode-section-context",
    passed: checks.every(Boolean),
    details: [
      `reportBlocks=${blockIds.join(",")}`,
      `reportPayload=${responseContext
        ? estimateResponseContextPayloadSize(responseContext)
        : 0}`,
      `questionPayload=${questionModeContext
        ? estimateResponseContextPayloadSize(questionModeContext)
        : 0}`,
    ],
    responseContext,
    payloadSize: responseContext
      ? estimateResponseContextPayloadSize(responseContext)
      : 0,
    analysisPayloadSize: estimateAnalysisPayloadSize(analysisResult),
  };
}

export function verifyResponseContexts(): ResponseContextVerificationResult {
  const cases = [
    verifyCase1CareerAptitude(),
    verifyCase2OctoberMoneyFlow(),
    verifyCase3StoreOpening(),
    verifyCase4CompatibilityMissingContext(),
    verifyReportModeUsesSections(),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeResponseContextVerificationResult(
  result: ResponseContextVerificationResult,
): string {
  return JSON.stringify(
    {
      passed: result.passed,
      cases: result.cases.map((item) => ({
        id: item.id,
        passed: item.passed,
        details: item.details,
        payloadSize: item.payloadSize,
        analysisPayloadSize: item.analysisPayloadSize,
      })),
    },
    null,
    2,
  );
}
