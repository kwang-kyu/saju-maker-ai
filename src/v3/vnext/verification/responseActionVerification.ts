import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "../../consulting/decision/decisionEngine.js";
import {
  runVNextOrchestrator,
} from "../orchestration/vNextOrchestrator.js";
import {
  resolveResponseAction,
} from "../response/responseActionResolver.js";
import type {
  AnalysisRequest,
  AnalysisResult,
} from "../types/index.js";
import type {
  ResponseActionType,
} from "../response/responseContext.js";
import type {
  SajuCurrentSeunFact,
  SajuTargetPeriodLuckFlowFact,
  SajuWolunSegmentFact,
} from "../../types/luckFlowFact.js";

export type ResponseActionVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
  actionType: ResponseActionType | null;
};

export type ResponseActionVerificationResult = {
  passed: boolean;
  cases: ResponseActionVerificationCase[];
};

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
    answerMode: "question",
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

function verifyConsultingAction(
  id: string,
  questionText: string,
  options?: {
    includeLuckFlow?: boolean;
  },
): ResponseActionVerificationCase {
  const analysisResult = runAnalysisCase(questionText, options);
  const action = resolveResponseAction({
    analysisResult,
    originalQuestion: questionText,
    answerMode: "question",
  });

  const checks = [
    action.type === "consulting",
    action.context !== null,
    (action.context?.blocks.length ?? 0) > 0,
  ];

  return {
    id,
    passed: checks.every(Boolean),
    details: [
      `action=${action.type}`,
      `reason=${action.reason}`,
      `blockCount=${action.context?.blocks.length ?? 0}`,
    ],
    actionType: action.type,
  };
}

function verifyClarificationAction(): ResponseActionVerificationCase {
  const questionText = "상대방과 궁합은 어떤가요?";
  const analysisResult = runAnalysisCase(questionText);
  const action = resolveResponseAction({
    analysisResult,
    originalQuestion: questionText,
    answerMode: "question",
  });

  const checks = [
    action.type === "clarification",
    action.context !== null,
    (action.context?.missingContext?.length ?? 0) > 0,
    (action.context?.blocks.length ?? 0) <= 2,
  ];

  return {
    id: "case-4-compatibility-clarification",
    passed: checks.every(Boolean),
    details: [
      `action=${action.type}`,
      `reason=${action.reason}`,
      `missingContext=${action.context?.missingContext?.map((item) => item.key).join(",") ?? "none"}`,
    ],
    actionType: action.type,
  };
}

export function verifyResponseActions(): ResponseActionVerificationResult {
  const cases = [
    verifyConsultingAction(
      "case-1-career-consulting",
      "나에게 맞는 직업은 무엇인가요?",
    ),
    verifyConsultingAction(
      "case-2-money-flow-consulting",
      "10월 금전운이 있을까요?",
      { includeLuckFlow: true },
    ),
    verifyConsultingAction(
      "case-3-store-opening-consulting",
      "10월에 가게를 오픈하려고 하는데 어떨까요?",
      { includeLuckFlow: true },
    ),
    verifyClarificationAction(),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeResponseActionVerificationResult(
  result: ResponseActionVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
