import {
  VNextAnalysisProgressBar,
} from "../ui/VNextAnalysisProgressBar.js";
import type {
  VNextReportSessionState,
} from "./vNextReportState.js";
import {
  VNEXT_REPORT_COPY,
} from "./vNextReportCopy.js";

export type VNextReportProgressProps = {
  state: VNextReportSessionState;
  isBusy: boolean;
  isStreaming: boolean;
  loadingLabel: string | null;
};

export function VNextReportProgress({
  state,
  isBusy,
  isStreaming,
}: VNextReportProgressProps) {
  const showProgress = isBusy || isStreaming;

  if (!showProgress) {
    return null;
  }

  return (
    <div
      className="vnext-report-progress"
      role="status"
      aria-live="polite"
    >
      <VNextAnalysisProgressBar
        progressStep={state.progressStep}
        className="vnext-analysis-progress vnext-analysis-progress--report"
      />

      {isStreaming && state.streamingText ? (
        <p className="vnext-report-progress-stream-hint">
          {VNEXT_REPORT_COPY.progressStreaming}
        </p>
      ) : null}
    </div>
  );
}
