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
  loadingLabel,
}: VNextReportProgressProps) {
  const showProgress = isBusy || isStreaming;

  if (!showProgress) {
    return null;
  }

  const label = loadingLabel
    ?? (isStreaming
      ? VNEXT_REPORT_COPY.progressStreaming
      : null);

  return (
    <div
      className="vnext-report-progress"
      role="status"
      aria-live="polite"
    >
      <div
        className="vnext-report-progress-spinner"
        aria-hidden="true"
      />

      {label ? (
        <p className="vnext-report-progress-label">
          {label}
        </p>
      ) : null}

      {isStreaming && state.streamingText ? (
        <p className="vnext-report-progress-stream-hint">
          {VNEXT_REPORT_COPY.progressStreaming}
        </p>
      ) : null}
    </div>
  );
}
