import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "../../consulting/decision/decisionEngine.js";
import {
  adaptAssessment,
} from "../adapters/assessmentAdapter.js";
import {
  adaptHumanState,
} from "../adapters/humanStateAdapter.js";
import {
  adaptQuestionMeaning,
} from "../adapters/questionMeaningAdapter.js";
import {
  adaptTimeState,
} from "../adapters/timeStateAdapter.js";
import {
  routeScenario,
} from "../routing/scenarioRouter.js";
import {
  extractChangeSignals,
  shouldExtractChangeSignals,
} from "../signals/changeSignalExtractor.js";
import type {
  ChangeSignalType,
} from "../types/changeSignal.js";
import type {
  SajuCurrentSeunFact,
  SajuTargetPeriodLuckFlowFact,
  SajuWolunSegmentFact,
} from "../../types/luckFlowFact.js";

export type ChangeSignalVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type ChangeSignalVerificationResult = {
  passed: boolean;
  cases: ChangeSignalVerificationCase[];
};

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

function verifyCase1CareerAptitude(): ChangeSignalVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "나에게 맞는 직업은 무엇인가요?",
  });

  const questionMeaning = adaptQuestionMeaning(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);

  const shouldSkip = !shouldExtractChangeSignals(
    scenario.requiredSignals,
  );
  const signals = extractChangeSignals({
    requiredSignals: scenario.requiredSignals,
  });

  const checks = [
    scenario.type === "aptitudeRecommendation",
    scenario.requiredSignals.length === 0,
    shouldSkip,
    signals.length === 0,
  ];

  return {
    id: "case-1-career-aptitude",
    passed: checks.every(Boolean),
    details: [
      `scenario=${scenario.type}`,
      `requiredSignals=${scenario.requiredSignals.join(",") || "none"}`,
      `extractedSignals=${signals.length}`,
      `shouldSkip=${shouldSkip}`,
    ],
  };
}

function verifyCase2OctoberMoneyFlow(): ChangeSignalVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "10월 금전운이 있을까요?",
  });

  const questionMeaning = adaptQuestionMeaning(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const humanState = adaptHumanState(
    {
      explanation: regressionInput.humanContext.identity.explanation,
      humanSummary: regressionInput.humanContext.identity.humanSummary,
      currentPhase: regressionInput.humanContext.currentPhase,
    },
    scenario.requiredDomains,
  );
  const timeState = adaptTimeState({
    targetPeriodLuckFlow: buildMockTargetPeriodLuckFlow(),
  });
  const assessment = adaptAssessment(
    runDecisionEngine(regressionInput),
  );

  const expectedSignals: ChangeSignalType[] = [
    "opportunity",
    "inflow",
    "expense",
    "pressure",
    "risk",
  ];

  const signals = extractChangeSignals({
    humanState,
    timeState,
    assessment,
    requiredSignals: scenario.requiredSignals,
  });

  const extractedTypes = signals.map((signal) => signal.type);
  const hasMonthGranularity = signals.some(
    (signal) => signal.timeSegment.granularity === "month",
  );

  const checks = [
    scenario.type === "generalFlow",
    includesAll(scenario.requiredSignals, expectedSignals),
    includesAll(extractedTypes, expectedSignals),
    hasMonthGranularity,
    signals.every((signal) =>
      !/(돈이 들어온다|성공|결혼|이직|발생)/.test(signal.summary),
    ),
  ];

  return {
    id: "case-2-october-money-flow",
    passed: checks.every(Boolean),
    details: [
      `scenario=${scenario.type}`,
      `requiredSignals=${scenario.requiredSignals.join(",")}`,
      `extractedTypes=${extractedTypes.join(",")}`,
      `timeGranularity=${signals[0]?.timeSegment.granularity ?? "none"}`,
      `signalCount=${signals.length}`,
    ],
  };
}

function verifyCase3OctoberStoreOpening(): ChangeSignalVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "10월에 가게를 오픈하려고 하는데 어떨까요?",
  });

  const questionMeaning = adaptQuestionMeaning(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const humanState = adaptHumanState(
    {
      explanation: regressionInput.humanContext.identity.explanation,
      humanSummary: regressionInput.humanContext.identity.humanSummary,
      currentPhase: regressionInput.humanContext.currentPhase,
    },
    scenario.requiredDomains,
  );
  const timeState = adaptTimeState({
    targetPeriodLuckFlow: buildMockTargetPeriodLuckFlow(),
  });
  const assessment = adaptAssessment(
    runDecisionEngine(regressionInput),
  );

  const expectedSignals: ChangeSignalType[] = [
    "opportunity",
    "pressure",
    "responsibility",
    "expansion",
    "risk",
  ];

  const signals = extractChangeSignals({
    humanState,
    timeState,
    assessment,
    requiredSignals: scenario.requiredSignals,
  });

  const extractedTypes = signals.map((signal) => signal.type);
  const aggregated = new Set(
    signals.map((signal) => `${signal.type}:${signal.direction}`),
  );

  const checks = [
    scenario.type === "actionDecision",
    includesAll(scenario.requiredSignals, expectedSignals),
    includesAll(extractedTypes, expectedSignals),
    scenario.requiredTimeGranularity.includes("month"),
    aggregated.size === signals.length,
  ];

  return {
    id: "case-3-october-store-opening",
    passed: checks.every(Boolean),
    details: [
      `scenario=${scenario.type}`,
      `requiredSignals=${scenario.requiredSignals.join(",")}`,
      `extractedTypes=${extractedTypes.join(",")}`,
      `requiredTimeGranularity=${scenario.requiredTimeGranularity.join(",")}`,
      `aggregatedUnique=${aggregated.size}`,
    ],
  };
}

function verifyCase4Compatibility(): ChangeSignalVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "1967년 4월 2일 음력 여성과 궁합은 어떨까요?",
  });

  const questionMeaning = adaptQuestionMeaning(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);
  const humanState = adaptHumanState(
    {
      explanation: regressionInput.humanContext.identity.explanation,
      humanSummary: regressionInput.humanContext.identity.humanSummary,
      currentPhase: regressionInput.humanContext.currentPhase,
    },
    scenario.requiredDomains,
  );

  const signals = extractChangeSignals({
    humanState,
    requiredSignals: scenario.requiredSignals,
  });

  const relationshipSignals: ChangeSignalType[] = [
    "relationshipChange",
    "conflict",
    "stability",
  ];

  const checks = [
    scenario.type === "relationshipAssessment",
    includesAll(scenario.requiredSignals, relationshipSignals),
    shouldExtractChangeSignals(scenario.requiredSignals),
    questionMeaning.missingContext.length >= 0,
  ];

  return {
    id: "case-4-compatibility",
    passed: checks.every(Boolean),
    details: [
      `scenario=${scenario.type}`,
      `requiredSignals=${scenario.requiredSignals.join(",")}`,
      `extractedTypes=${signals.map((signal) => signal.type).join(",")}`,
      `missingContext=${questionMeaning.missingContext.map((item) => item.key).join(",") || "none"}`,
    ],
  };
}

export function verifyChangeSignals(): ChangeSignalVerificationResult {
  const cases = [
    verifyCase1CareerAptitude(),
    verifyCase2OctoberMoneyFlow(),
    verifyCase3OctoberStoreOpening(),
    verifyCase4Compatibility(),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function verifyChangeSignalAggregation(): boolean {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "10월 금전운이 있을까요?",
  });

  const scenario = routeScenario(
    adaptQuestionMeaning(regressionInput.question),
  );

  const humanState = adaptHumanState(
    {
      explanation: regressionInput.humanContext.identity.explanation,
      humanSummary: regressionInput.humanContext.identity.humanSummary,
      currentPhase: regressionInput.humanContext.currentPhase,
    },
    scenario.requiredDomains,
  );

  const timeState = adaptTimeState({
    targetPeriodLuckFlow: buildMockTargetPeriodLuckFlow(),
  });

  const signals = extractChangeSignals({
    humanState,
    timeState,
    requiredSignals: scenario.requiredSignals,
  });

  const opportunitySignals = signals.filter(
    (signal) => signal.type === "opportunity",
  );

  return opportunitySignals.length <= 1
    && opportunitySignals.every((signal) =>
      signal.evidence.items.length >= 1,
    );
}

export function verifyRequiredSignalsFiltering(): boolean {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "10월 금전운이 있을까요?",
  });

  const humanState = adaptHumanState({
    explanation: regressionInput.humanContext.identity.explanation,
    humanSummary: regressionInput.humanContext.identity.humanSummary,
    currentPhase: regressionInput.humanContext.currentPhase,
  });

  const limitedSignals = extractChangeSignals({
    humanState,
    requiredSignals: ["risk"],
  });

  return limitedSignals.every((signal) => signal.type === "risk");
}
