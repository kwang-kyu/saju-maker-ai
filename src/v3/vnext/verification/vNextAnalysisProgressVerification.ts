/**
 * vNext Analysis Progress Verification.
 *
 * resolveAnalysisProgressView 단계 정의와
 * analyzeVNextConsultingRequest progress callback 연결을 검증한다.
 */

import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  resolveAnalysisProgressView,
  type VNextAnalysisProgressStep,
  type VNextAnalysisProgressView,
} from "../ui/vNextAnalysisProgress.js";
import {
  analyzeVNextConsultingRequest,
  type VNextConsultingAnalysisResult,
} from "../ui/vNextConsultingPipeline.js";
import type {
  AnalysisResult,
} from "../types/analysisResult.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";
import type {
  TimePeriodRef,
} from "../types/timeState.js";

export type VNextAnalysisProgressVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextAnalysisProgressVerificationResult = {
  passed: boolean;
  cases: VNextAnalysisProgressVerificationCase[];
};


const EXPECTED_PROGRESS_VIEWS: Record<
  VNextAnalysisProgressStep,
  Omit<VNextAnalysisProgressView, "step">
> = {
  birthInputValidated: {
    percent: 5,
    label: "생년정보를 확인하고 있습니다",
  },
  sajuCalculated: {
    percent: 20,
    label: "사주 정보를 계산하고 있습니다",
  },
  humanContextReady: {
    percent: 40,
    label: "사람의 구조와 흐름을 정리하고 있습니다",
  },
  consultingTurnComplete: {
    percent: 55,
    label: "질문과 판단 흐름을 분석하고 있습니다",
  },
  targetPeriodResolved: {
    percent: 65,
    label: "현재 운의 흐름을 정리하고 있습니다",
  },
  orchestrationComplete: {
    percent: 75,
    label: "상담 구조를 준비하고 있습니다",
  },
  responsePrepared: {
    percent: 85,
    label: "상담을 준비하고 있습니다",
  },
  generating: {
    percent: 92,
    label: "상담 내용을 정리하고 있습니다",
  },
  streaming: {
    percent: 97,
    label: "답변을 작성하고 있습니다",
  },
  completed: {
    percent: 100,
    label: "준비 완료",
  },
};

function buildVerificationRequest(
  question: string,
): V3ConsultingRequest {
  return {
    sajuInput: {
      name: "김천운",
      birthDate: "1984-03-15",
      birthTime: "14:30",
      gender: "male",
      calendarType: "solar",
      referenceDate: "2026-10-01",
      luckStartMethod: "minuteBased",
    },
    humanLifeContextInput: {
      maritalStatus: "married",
      hasChildren: true,
      occupationStatus: "employed",
      hasActiveBusiness: false,
      financialResponsibility: "high",
    },
    question,
  };
}

function readTargetPeriodFromAnalysisResult(
  analysisResult: AnalysisResult,
): TimePeriodRef | null {
  const timeState = analysisResult.timeState;

  if (!timeState || timeState.status !== "ready") {
    return null;
  }

  return timeState.value.targetPeriod;
}

function assertProgressStepOrder(
  actual: readonly VNextAnalysisProgressStep[],
  expected: readonly VNextAnalysisProgressStep[],
): boolean {
  let lastIndex = -1;

  for (const step of expected) {
    const index = actual.indexOf(step, lastIndex + 1);

    if (index === -1) {
      return false;
    }

    lastIndex = index;
  }

  return true;
}

function buildProgressRegressionSnapshot(
  analysis: VNextConsultingAnalysisResult,
): {
  actionType: VNextConsultingAnalysisResult["action"]["type"];
  questionContext: {
    consultingScenario: AnalysisResult["consultingScenario"];
    questionMeaning: AnalysisResult["questionMeaning"];
  };
  decisionResult: AnalysisResult["assessment"];
  targetPeriod: TimePeriodRef | null;
  prompt: ResponsePrompt | null;
} {
  return {
    actionType: analysis.action.type,
    questionContext: {
      consultingScenario: analysis.analysisResult.consultingScenario,
      questionMeaning: analysis.analysisResult.questionMeaning,
    },
    decisionResult: analysis.analysisResult.assessment,
    targetPeriod: readTargetPeriodFromAnalysisResult(
      analysis.analysisResult,
    ),
    prompt: analysis.prompt,
  };
}

function runSyncCase(
  id: string,
  run: () => {
    passed: boolean;
    details: string[];
  },
): VNextAnalysisProgressVerificationCase {
  const result = run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

export function verifyVNextAnalysisProgress(): VNextAnalysisProgressVerificationResult {
  const cases: VNextAnalysisProgressVerificationCase[] = [];

  cases.push(runSyncCase(
    "case-1-resolve-analysis-progress-view-all-steps",
    () => {
      const stepKeys = Object.keys(
        EXPECTED_PROGRESS_VIEWS,
      ) as VNextAnalysisProgressStep[];
      const mismatches = stepKeys.filter((step) => {
        const view = resolveAnalysisProgressView(step);
        const expected = EXPECTED_PROGRESS_VIEWS[step];

        return !view
          || view.step !== step
          || view.percent !== expected.percent
          || view.label !== expected.label;
      });

      return {
        passed: mismatches.length === 0,
        details: [
          `stepCount=${stepKeys.length}`,
          `mismatches=${mismatches.join(",") || "none"}`,
        ],
      };
    },
  ));

  cases.push(runSyncCase(
    "case-2-resolve-analysis-progress-view-null",
    () => ({
      passed: resolveAnalysisProgressView(null) === null,
      details: ["nullInputReturnsNull=true"],
    }),
  ));

  cases.push(runSyncCase(
    "case-3-analyze-progress-callback-fires",
    () => {
      const request = buildVerificationRequest(
        "나에게 맞는 직업은 무엇인가요?",
      );
      const progressSteps: VNextAnalysisProgressStep[] = [];

      analyzeVNextConsultingRequest(
        request,
        "question",
        {
          onProgress: (step) => {
            progressSteps.push(step);
          },
        },
      );

      return {
        passed: progressSteps.length > 0,
        details: [
          `progressStepCount=${progressSteps.length}`,
          `firstStep=${progressSteps[0] ?? "none"}`,
        ],
      };
    },
  ));

  cases.push(runSyncCase(
    "case-4-analyze-progress-order-without-target-period",
    () => {
      const request = buildVerificationRequest(
        "나에게 맞는 직업은 무엇인가요?",
      );
      const progressSteps: VNextAnalysisProgressStep[] = [];

      analyzeVNextConsultingRequest(
        request,
        "question",
        {
          onProgress: (step) => {
            progressSteps.push(step);
          },
        },
      );

      const expectedOrder: VNextAnalysisProgressStep[] = [
        "birthInputValidated",
        "sajuCalculated",
        "humanContextReady",
        "consultingTurnComplete",
        "orchestrationComplete",
        "responsePrepared",
      ];

      return {
        passed: assertProgressStepOrder(
          progressSteps,
          expectedOrder,
        )
          && !progressSteps.includes("targetPeriodResolved"),
        details: [
          `progressSteps=${progressSteps.join(">")}`,
          `includesTargetPeriodResolved=${progressSteps.includes("targetPeriodResolved")}`,
        ],
      };
    },
  ));

  cases.push(runSyncCase(
    "case-5-analyze-progress-order-with-target-period",
    () => {
      const request = buildVerificationRequest(
        "2026년 9월 운세",
      );
      const progressSteps: VNextAnalysisProgressStep[] = [];

      analyzeVNextConsultingRequest(
        request,
        "question",
        {
          onProgress: (step) => {
            progressSteps.push(step);
          },
        },
      );

      const expectedOrder: VNextAnalysisProgressStep[] = [
        "birthInputValidated",
        "sajuCalculated",
        "humanContextReady",
        "consultingTurnComplete",
        "targetPeriodResolved",
        "orchestrationComplete",
        "responsePrepared",
      ];

      return {
        passed: assertProgressStepOrder(
          progressSteps,
          expectedOrder,
        )
          && progressSteps.includes("targetPeriodResolved"),
        details: [
          `progressSteps=${progressSteps.join(">")}`,
          `includesTargetPeriodResolved=${progressSteps.includes("targetPeriodResolved")}`,
        ],
      };
    },
  ));

  cases.push(runSyncCase(
    "case-6-analyze-progress-pipeline-step-coverage",
    () => {
      const request = buildVerificationRequest(
        "2026년 12월 운세는 어떨까요?",
      );
      const progressSteps: VNextAnalysisProgressStep[] = [];

      analyzeVNextConsultingRequest(
        request,
        "question",
        {
          onProgress: (step) => {
            progressSteps.push(step);
          },
        },
      );

      const requiredSteps: VNextAnalysisProgressStep[] = [
        "birthInputValidated",
        "sajuCalculated",
        "humanContextReady",
        "consultingTurnComplete",
        "targetPeriodResolved",
        "orchestrationComplete",
        "responsePrepared",
      ];

      return {
        passed: assertProgressStepOrder(
          progressSteps,
          requiredSteps,
        )
          && requiredSteps.every((step) =>
            progressSteps.includes(step),
          ),
        details: [
          `progressSteps=${progressSteps.join(">")}`,
          `requiredSteps=${requiredSteps.join(",")}`,
        ],
      };
    },
  ));

  cases.push(runSyncCase(
    "case-7-analyze-progress-regression-without-callback",
    () => {
      const request = buildVerificationRequest(
        "사업을 시작하려고 하는데 어떨까요",
      );
      const withoutProgress = analyzeVNextConsultingRequest(
        request,
        "question",
      );
      const progressSteps: VNextAnalysisProgressStep[] = [];
      const withProgress = analyzeVNextConsultingRequest(
        request,
        "question",
        {
          onProgress: (step) => {
            progressSteps.push(step);
          },
        },
      );

      const baselineSnapshot = buildProgressRegressionSnapshot(
        withoutProgress,
      );
      const progressSnapshot = buildProgressRegressionSnapshot(
        withProgress,
      );

      const actionTypeMatch =
        baselineSnapshot.actionType === progressSnapshot.actionType;
      const questionContextMatch =
        JSON.stringify(baselineSnapshot.questionContext)
        === JSON.stringify(progressSnapshot.questionContext);
      const decisionResultMatch =
        JSON.stringify(baselineSnapshot.decisionResult)
        === JSON.stringify(progressSnapshot.decisionResult);
      const targetPeriodMatch =
        JSON.stringify(baselineSnapshot.targetPeriod)
        === JSON.stringify(progressSnapshot.targetPeriod);
      const promptMatch =
        JSON.stringify(baselineSnapshot.prompt)
        === JSON.stringify(progressSnapshot.prompt);
      const analysisResultMatch =
        JSON.stringify(withoutProgress.analysisResult)
        === JSON.stringify(withProgress.analysisResult);

      return {
        passed: actionTypeMatch
          && questionContextMatch
          && decisionResultMatch
          && targetPeriodMatch
          && promptMatch
          && analysisResultMatch
          && progressSteps.length > 0,
        details: [
          `actionTypeMatch=${actionTypeMatch}`,
          `questionContextMatch=${questionContextMatch}`,
          `decisionResultMatch=${decisionResultMatch}`,
          `targetPeriodMatch=${targetPeriodMatch}`,
          `promptMatch=${promptMatch}`,
          `analysisResultMatch=${analysisResultMatch}`,
          `progressStepCount=${progressSteps.length}`,
        ],
      };
    },
  ));

  cases.push(runSyncCase(
    "case-8-analyze-progress-regression-life-flow-question",
    () => {
      const request = buildVerificationRequest(
        "2026년 9월 운세",
      );
      const withoutProgress = analyzeVNextConsultingRequest(
        request,
        "question",
      );
      const withProgress = analyzeVNextConsultingRequest(
        request,
        "question",
        {
          onProgress: () => {},
        },
      );

      const baselineSnapshot = buildProgressRegressionSnapshot(
        withoutProgress,
      );
      const progressSnapshot = buildProgressRegressionSnapshot(
        withProgress,
      );

      return {
        passed: JSON.stringify(baselineSnapshot)
          === JSON.stringify(progressSnapshot)
          && baselineSnapshot.targetPeriod !== null,
        details: [
          `actionType=${baselineSnapshot.actionType}`,
          `targetPeriod=${baselineSnapshot.targetPeriod?.label ?? "null"}`,
          `promptGenerated=${baselineSnapshot.prompt !== null}`,
        ],
      };
    },
  ));

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextAnalysisProgressVerificationResult(
  result: VNextAnalysisProgressVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
