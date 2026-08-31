import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  readQuestion,
} from "../../consulting/question/questionReader.js";
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
  runVNextOrchestrator,
} from "../orchestration/vNextOrchestrator.js";
import {
  routeScenario,
} from "../routing/scenarioRouter.js";
import type {
  SajuCurrentSeunFact,
  SajuTargetPeriodLuckFlowFact,
  SajuWolunSegmentFact,
} from "../../types/luckFlowFact.js";
import type {
  AnalysisRequest,
} from "../types/analysisRequest.js";

export type VNextAdapterVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextAdapterVerificationResult = {
  passed: boolean;
  cases: VNextAdapterVerificationCase[];
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

function verifyCase1CareerAptitude(): VNextAdapterVerificationCase {
  const regressionInput =
    buildDecisionEngineRegressionInput({
      questionText: "나에게 맞는 직업은 무엇인가요?",
    });

  const questionMeaning = adaptQuestionMeaning(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);

  const checks = [
    questionMeaning.domain === "career",
    scenario.type === "aptitudeRecommendation",
    includesAll(scenario.requiredDomains, [
      "career",
      "ability",
      "capacity",
    ]),
    !scenario.requiredTimeGranularity.includes("month"),
    scenario.requiredSignals.length === 0,
  ];

  return {
    id: "case-1-career-aptitude",
    passed: checks.every(Boolean),
    details: [
      `domain=${questionMeaning.domain}`,
      `scenario=${scenario.type}`,
      `requiredDomains=${scenario.requiredDomains.join(",")}`,
      `requiredTimeGranularity=${scenario.requiredTimeGranularity.join(",") || "none"}`,
    ],
  };
}

function verifyCase2OctoberMoneyFlow(): VNextAdapterVerificationCase {
  const regressionInput =
    buildDecisionEngineRegressionInput({
      questionText: "10월 금전운이 있을까요?",
    });

  const questionMeaning = adaptQuestionMeaning(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);

  const checks = [
    questionMeaning.domain === "money",
    scenario.type === "generalFlow",
    includesAll(scenario.requiredDomains, [
      "money",
      "capacity",
      "risk",
    ]),
    scenario.requiredTimeGranularity.includes("month"),
    includesAll(scenario.requiredSignals, [
      "opportunity",
      "inflow",
      "expense",
      "pressure",
      "risk",
    ]),
  ];

  return {
    id: "case-2-october-money-flow",
    passed: checks.every(Boolean),
    details: [
      `domain=${questionMeaning.domain}`,
      `scenario=${scenario.type}`,
      `requiredDomains=${scenario.requiredDomains.join(",")}`,
      `requiredTimeGranularity=${scenario.requiredTimeGranularity.join(",")}`,
      `requiredSignals=${scenario.requiredSignals.join(",")}`,
    ],
  };
}

function verifyCase3OctoberStoreOpening(): VNextAdapterVerificationCase {
  const regressionInput =
    buildDecisionEngineRegressionInput({
      questionText: "10월에 가게를 오픈하려고 하는데 어떨까요?",
    });

  const questionMeaning = adaptQuestionMeaning(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);

  const checks = [
    questionMeaning.domain === "business",
    scenario.type === "actionDecision",
    includesAll(scenario.requiredDomains, [
      "career",
      "money",
      "capacity",
      "risk",
    ]),
    scenario.requiredTimeGranularity.includes("month"),
    includesAll(scenario.requiredSignals, [
      "opportunity",
      "pressure",
      "responsibility",
      "expansion",
      "risk",
    ]),
  ];

  return {
    id: "case-3-october-store-opening",
    passed: checks.every(Boolean),
    details: [
      `domain=${questionMeaning.domain}`,
      `scenario=${scenario.type}`,
      `requiredDomains=${scenario.requiredDomains.join(",")}`,
      `requiredTimeGranularity=${scenario.requiredTimeGranularity.join(",")}`,
      `requiredSignals=${scenario.requiredSignals.join(",")}`,
    ],
  };
}

function verifyCase4Compatibility(): VNextAdapterVerificationCase {
  const regressionInput =
    buildDecisionEngineRegressionInput({
      questionText:
        "1967년 4월 2일 음력 여성과 궁합은 어떨까요?",
    });

  const questionMeaning = adaptQuestionMeaning(
    regressionInput.question,
  );
  const scenario = routeScenario(questionMeaning);

  const checks = [
    questionMeaning.domain === "compatibility",
    scenario.type === "relationshipAssessment",
    includesAll(scenario.requiredDomains, [
      "relationship",
      "personality",
      "capacity",
    ]),
    questionMeaning.missingContext.length === 0
      || questionMeaning.missingContext.every(
        (item) => item.key.length > 0,
      ),
  ];

  return {
    id: "case-4-compatibility",
    passed: checks.every(Boolean),
    details: [
      `domain=${questionMeaning.domain}`,
      `scenario=${scenario.type}`,
      `requiredDomains=${scenario.requiredDomains.join(",")}`,
      `missingContext=${questionMeaning.missingContext.map((item) => item.key).join(",") || "none"}`,
    ],
  };
}

export function verifyVNextAdapters(): VNextAdapterVerificationResult {
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

export type VNextAdapterExecutionVerificationResult = {
  humanStateAdapter: boolean;
  timeStateAdapter: boolean;
  questionMeaningAdapter: boolean;
  assessmentAdapter: boolean;
  scenarioRouter: boolean;
  orchestrator: boolean;
};

export function verifyVNextAdapterExecution(): VNextAdapterExecutionVerificationResult {
  const regressionInput =
    buildDecisionEngineRegressionInput({
      questionText: "10월 금전운이 있을까요?",
    });

  const humanContext = regressionInput.humanContext;
  const questionResult = regressionInput.question;

  const questionMeaning = adaptQuestionMeaning(questionResult);
  const questionMeaningAdapter =
    questionMeaning.domain === "money";

  const scenario = routeScenario(questionMeaning);
  const scenarioRouter =
    scenario.type === "generalFlow"
    && scenario.requiredTimeGranularity.includes("month");

  const humanState = adaptHumanState(
    {
      explanation: humanContext.identity.explanation,
      humanSummary: humanContext.identity.humanSummary,
      currentPhase: humanContext.currentPhase,
    },
    scenario.requiredDomains,
  );
  const humanStateAdapter =
    humanState.domains.length === scenario.requiredDomains.length
    && humanState.identity.label.length > 0;

  const timeState = adaptTimeState({
    targetPeriodLuckFlow: buildMockTargetPeriodLuckFlow(),
  });
  const timeStateAdapter =
    timeState.wolun !== null
    && timeState.targetPeriod.start === "2026-10-01";

  const decisionResult = runDecisionEngine(regressionInput);
  const assessment = adaptAssessment(decisionResult);
  const assessmentAdapter =
    assessment.possibility !== "insufficient"
    || decisionResult.verdict === "insufficientEvidence";

  const analysisRequest: AnalysisRequest = {
    sources: ["saju"],
    humanInput: {},
    question: regressionInput.question.originalQuestion,
    answerMode: "question",
    targetPeriod: {
      start: "2026-10-01",
      end: "2026-10-31",
      granularity: "month",
      label: "2026-10",
    },
  };

  const orchestrated = runVNextOrchestrator({
    analysisRequest,
    humanDestinyContext: humanContext,
    targetPeriodLuckFlow: buildMockTargetPeriodLuckFlow(),
    questionReaderResult: questionResult,
    decisionResult,
  });

  const orchestrator =
    orchestrated.questionMeaning?.status === "ready"
    && orchestrated.consultingScenario?.status === "ready"
    && orchestrated.humanState?.status === "ready"
    && orchestrated.timeState?.status === "ready"
    && orchestrated.assessment?.status === "ready"
    && orchestrated.changeSignals?.status === "ready"
    && orchestrated.answerBlueprint?.status === "ready";

  return {
    humanStateAdapter,
    timeStateAdapter,
    questionMeaningAdapter,
    assessmentAdapter,
    scenarioRouter,
    orchestrator,
  };
}

export function verifyVNextAdapterBoundaryWithReadQuestion(): boolean {
  const humanContext =
    buildDecisionEngineRegressionInput().humanContext;

  const question = readQuestion(
    humanContext,
    "나에게 맞는 직업은 무엇인가요?",
  );

  const meaning = adaptQuestionMeaning(question);
  const scenario = routeScenario(meaning);

  return (
    meaning.domain === "career"
    && scenario.type === "aptitudeRecommendation"
  );
}
