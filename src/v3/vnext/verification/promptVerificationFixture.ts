/**
 * vNext Prompt Verification 공통 fixture.
 */

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
import type {
  AnalysisRequest,
  AnalysisResult,
} from "../types/index.js";
import type {
  ResponseAction,
  ResponseContext,
} from "../response/responseContext.js";
import type {
  SajuCurrentSeunFact,
  SajuTargetPeriodLuckFlowFact,
  SajuWolunSegmentFact,
} from "../../types/luckFlowFact.js";

export function buildMockTargetPeriodLuckFlow(): SajuTargetPeriodLuckFlowFact {
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

export function buildMockSeptember2026LuckFlow(): SajuTargetPeriodLuckFlowFact {
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
    targetMonth: 9,
    ganZhi: "丙申",
    heavenlyStem: "丙",
    earthlyBranch: "申",
    tenGod: "편재",
    element: "metal",
    startDate: "2026-09-07",
    endDate: "2026-10-07",
    jieQiBoundary: {
      name: "白露",
      date: "2026-09-07",
    },
  };

  return {
    targetStartDate: "2026-09-01",
    targetEndDate: "2026-09-30",
    currentDaeun: null,
    targetSeun,
    yearSegments: [],
    wolunSegments: [wolunSegment],
    targetIlun: null,
    limitations: [],
  };
}

export function runAnalysisCase(
  questionText: string,
  options?: {
    includeLuckFlow?: boolean;
    answerMode?: AnalysisRequest["answerMode"];
    luckFlow?: SajuTargetPeriodLuckFlowFact;
    targetPeriod?: AnalysisRequest["targetPeriod"];
  },
): AnalysisResult {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });

  const decisionResult = runDecisionEngine(regressionInput);

  const defaultTargetPeriod = options?.includeLuckFlow
    ? {
        start: "2026-10-01",
        end: "2026-10-31",
        granularity: "month" as const,
        label: "2026-10",
      }
    : undefined;

  const targetPeriod = options?.targetPeriod ?? defaultTargetPeriod;

  const analysisRequest: AnalysisRequest = {
    sources: ["saju"],
    humanInput: {},
    question: regressionInput.question.originalQuestion,
    answerMode: options?.answerMode ?? "question",
    targetPeriod,
  };

  return runVNextOrchestrator({
    analysisRequest,
    humanDestinyContext: regressionInput.humanContext,
    targetPeriodLuckFlow: options?.luckFlow
      ?? (options?.includeLuckFlow
        ? buildMockTargetPeriodLuckFlow()
        : undefined),
    questionReaderResult: regressionInput.question,
    decisionResult,
    targetPeriod: targetPeriod?.start
      && targetPeriod.end
      && targetPeriod.granularity
      ? {
          start: targetPeriod.start,
          end: targetPeriod.end,
          granularity: targetPeriod.granularity,
          label: targetPeriod.label,
        }
      : null,
  });
}

export function runPromptPipelineCase(
  questionText: string,
  options?: Parameters<typeof runAnalysisCase>[1],
): {
  analysisResult: AnalysisResult;
  action: ResponseAction;
  context: ResponseContext | null;
} {
  const analysisResult = runAnalysisCase(questionText, options);
  const pipeline = runResponsePipeline({
    analysisResult,
    originalQuestion: questionText,
    answerMode: options?.answerMode ?? "question",
  });

  return {
    analysisResult,
    action: pipeline.action,
    context: pipeline.context,
  };
}

export function includesAll<T extends string>(
  actual: readonly T[],
  expected: readonly T[],
): boolean {
  return expected.every((item) => actual.includes(item));
}
