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
  runResponsePipeline,
} from "../response/responseActionResolver.js";
import {
  verifyResponseContextReduction,
} from "./responseContextVerification.js";
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

export type VNextStep4AE2ECase = {
  id: string;
  questionText: string;
  passed: boolean;
  actionType: ResponseActionType | null;
  blockIds: string[];
  details: string[];
};

export type VNextStep4AE2EVerificationResult = {
  passed: boolean;
  cases: VNextStep4AE2ECase[];
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

function includesAll<T extends string>(
  actual: readonly T[],
  expected: readonly T[],
): boolean {
  return expected.every((item) => actual.includes(item));
}

function runE2ECase(
  id: string,
  questionText: string,
  validate: (
    analysisResult: AnalysisResult,
    actionType: ResponseActionType | null,
    blockIds: string[],
  ) => {
    passed: boolean;
    details: string[];
  },
  options?: {
    includeLuckFlow?: boolean;
  },
): VNextStep4AE2ECase {
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

  const analysisResult = runVNextOrchestrator({
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

  const pipeline = runResponsePipeline({
    analysisResult,
    originalQuestion: questionText,
    answerMode: "question",
  });

  const blockIds = pipeline.context?.blocks.map((block) => block.id) ?? [];
  const validation = validate(
    analysisResult,
    pipeline.action.type,
    blockIds,
  );

  return {
    id,
    questionText,
    passed: validation.passed,
    actionType: pipeline.action.type,
    blockIds,
    details: [
      `action=${pipeline.action.type}`,
      `reason=${pipeline.action.reason}`,
      ...validation.details,
    ],
  };
}

export function verifyVNextStep4AE2E(): VNextStep4AE2EVerificationResult {
  const cases: VNextStep4AE2ECase[] = [
    runE2ECase(
      "case-1-career-aptitude",
      "나에게 맞는 직업은 무엇인가요?",
      (analysisResult, actionType, blockIds) => {
        const pipelineContext = runResponsePipeline({
          analysisResult,
          originalQuestion: "나에게 맞는 직업은 무엇인가요?",
          answerMode: "question",
        }).context;

        const reduction = pipelineContext
          ? verifyResponseContextReduction(
              pipelineContext,
              analysisResult,
            )
          : { passed: false, details: ["context missing"] };

        const checks = [
          analysisResult.questionMeaning?.status === "ready",
          analysisResult.consultingScenario?.status === "ready",
          analysisResult.answerBlueprint?.status === "ready",
          actionType === "consulting",
          includesAll(blockIds, [
            "ability",
            "suitableRole",
            "workingEnvironment",
            "caution",
            "nextAction",
          ]),
          reduction.passed,
        ];

        return {
          passed: checks.every(Boolean),
          details: [
            `blocks=${blockIds.join(",")}`,
            ...reduction.details,
          ],
        };
      },
    ),
    runE2ECase(
      "case-2-october-money-flow",
      "10월 금전운이 있을까요?",
      (analysisResult, actionType, blockIds) => {
        const checks = [
          actionType === "consulting",
          includesAll(blockIds, [
            "periodOverview",
            "earlyPeriod",
            "middlePeriod",
            "latePeriod",
            "opportunity",
            "pressure",
            "moneyOrDomainEffect",
            "caution",
          ]),
          analysisResult.changeSignals?.status === "ready",
          analysisResult.timeState?.status === "ready",
        ];

        return {
          passed: checks.every(Boolean),
          details: [`blocks=${blockIds.join(",")}`],
        };
      },
      { includeLuckFlow: true },
    ),
    runE2ECase(
      "case-3-october-store-opening",
      "10월에 가게를 오픈하려고 하는데 어떨까요?",
      (analysisResult, actionType, blockIds) => {
        const checks = [
          actionType === "consulting",
          includesAll(blockIds, [
            "directAnswer",
            "currentDirection",
            "conditions",
            "risk",
            "scale",
            "timing",
            "nextAction",
          ]),
          analysisResult.assessment?.status === "ready",
        ];

        return {
          passed: checks.every(Boolean),
          details: [`blocks=${blockIds.join(",")}`],
        };
      },
      { includeLuckFlow: true },
    ),
    runE2ECase(
      "case-4-compatibility-missing-context",
      "상대방과 궁합은 어떤가요?",
      (_analysisResult, actionType, blockIds) => {
        const checks = [
          actionType === "clarification",
          blockIds.includes("followUpQuestion"),
          blockIds.length <= 2,
        ];

        return {
          passed: checks.every(Boolean),
          details: [`blocks=${blockIds.join(",")}`],
        };
      },
    ),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep4AE2EResult(
  result: VNextStep4AE2EVerificationResult,
): string {
  return JSON.stringify(
    {
      passed: result.passed,
      cases: result.cases.map((item) => ({
        id: item.id,
        questionText: item.questionText,
        passed: item.passed,
        actionType: item.actionType,
        blockIds: item.blockIds,
        details: item.details,
      })),
    },
    null,
    2,
  );
}
