/**
 * vNext 분석/상담 준비 진행 단계.
 *
 * 각 단계는 실제 파이프라인 함수 호출 완료 시점에만 전환된다.
 */

export type VNextAnalysisProgressStep =
  | "birthInputValidated"
  | "sajuCalculated"
  | "humanContextReady"
  | "consultingTurnComplete"
  | "targetPeriodResolved"
  | "orchestrationComplete"
  | "responsePrepared"
  | "generating"
  | "streaming"
  | "completed";

export type VNextAnalysisProgressView = {
  step: VNextAnalysisProgressStep;
  percent: number;
  label: string;
};

export type VNextAnalysisProgressCallback = (
  step: VNextAnalysisProgressStep,
) => void;

const VNEXT_ANALYSIS_PROGRESS_STEPS: Record<
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

export function resolveAnalysisProgressView(
  step: VNextAnalysisProgressStep | null,
): VNextAnalysisProgressView | null {
  if (!step) {
    return null;
  }

  const resolved = VNEXT_ANALYSIS_PROGRESS_STEPS[step];

  return {
    step,
    percent: resolved.percent,
    label: resolved.label,
  };
}

export function resolveReportProgressLabel(
  step: VNextAnalysisProgressStep | null,
  fallbackLabel: string | null,
): string | null {
  if (step === "generating") {
    return "리포트를 작성하고 있습니다.";
  }

  if (step === "streaming") {
    return "리포트를 표시하고 있습니다.";
  }

  const view = resolveAnalysisProgressView(step);

  if (view) {
    return `${view.label}.`;
  }

  return fallbackLabel;
}
