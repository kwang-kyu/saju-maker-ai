/**
 * vNext Report UI 상태 계약.
 *
 * Question Mode ConsultingSessionState와 분리한다.
 */

import type {
  NaturalConsultingResponse,
} from "../gpt/responseGatewayTypes.js";
import type {
  ResponseStreamMetadata,
} from "../gpt/responseStreamingTypes.js";
import type {
  ReportAnswerSection,
} from "../types/answerBlueprint.js";
import type {
  ResponseActionType,
} from "../response/responseContext.js";
import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext.js";
import type {
  TimeState,
} from "../types/timeState.js";
import type {
  VNextAnalysisProgressStep,
} from "../ui/vNextAnalysisProgress.js";
import {
  resolveReportProgressLabel,
} from "../ui/vNextAnalysisProgress.js";
import type {
  ProductReportMenu,
} from "./vNextReportMenu.js";
import type {
  VNextReportPeriodLuckFlowFacts,
} from "./vNextReportPeriodLuckFlowBuilder.js";

export type VNextReportPhase =
  | "idle"
  | "analyzing"
  | "generating"
  | "streaming"
  | "completed"
  | "error";

export type VNextReportSessionState = {
  phase: VNextReportPhase;
  sections: ReportAnswerSection[];
  activeSection: ProductReportMenu;
  response: NaturalConsultingResponse | null;
  actionType: ResponseActionType | null;
  streamingText: string | null;
  errorMessage: string | null;
  streamMetadata: ResponseStreamMetadata | null;
  progressStep: VNextAnalysisProgressStep | null;
  humanContext: HumanDestinyContext | null;
  timeState: TimeState | null;
  /**
   * Report-only additive year/day period luck-flow facts.
   * UI year/today 렌더링은 후속 STEP에서 연결한다.
   */
  periodLuckFlowFacts: VNextReportPeriodLuckFlowFacts | null;
};

export const INITIAL_VNEXT_REPORT_SESSION_STATE: VNextReportSessionState = {
  phase: "idle",
  sections: [],
  activeSection: "chongun",
  response: null,
  actionType: null,
  streamingText: null,
  errorMessage: null,
  streamMetadata: null,
  progressStep: null,
  humanContext: null,
  timeState: null,
  periodLuckFlowFacts: null,
};

export type VNextReportUxActions = {
  canRetry: boolean;
  canDownloadDocx: boolean;
  canContinueToConsulting: boolean;
  canNewReport: boolean;
  canGoBack: boolean;
};

/**
 * Report UX 버튼 활성 규칙 (UI orchestration only).
 */
export function resolveVNextReportUxActions(
  phase: VNextReportPhase,
): VNextReportUxActions {
  return {
    canRetry: phase === "error",
    canDownloadDocx: phase === "completed",
    canContinueToConsulting: phase === "completed",
    canNewReport: phase === "completed",
    canGoBack: phase === "idle"
      || phase === "completed"
      || phase === "error",
  };
}

export function resolveReportLoadingLabel(
  phase: VNextReportPhase,
  progressStep: VNextAnalysisProgressStep | null = null,
): string | null {
  const fallback = phase === "analyzing"
    ? "사주 정보를 분석하고 있습니다."
    : phase === "generating"
      ? "리포트를 작성하고 있습니다."
      : null;

  return resolveReportProgressLabel(
    progressStep ?? (
      phase === "generating"
        ? "generating"
        : phase === "streaming"
          ? "streaming"
          : null
    ),
    fallback,
  );
}
