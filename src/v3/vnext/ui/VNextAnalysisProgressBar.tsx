import {
  resolveAnalysisProgressView,
  type VNextAnalysisProgressStep,
} from "./vNextAnalysisProgress.js";

export type VNextAnalysisProgressBarProps = {
  progressStep: VNextAnalysisProgressStep | null;
  className?: string;
};

export function VNextAnalysisProgressBar({
  progressStep,
  className = "vnext-analysis-progress",
}: VNextAnalysisProgressBarProps) {
  const progress = resolveAnalysisProgressView(progressStep);

  if (!progress) {
    return null;
  }

  return (
    <div
      className={className}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress.percent}
      aria-label={progress.label}
    >
      <div className="vnext-analysis-progress-header">
        <span className="vnext-analysis-progress-percent">
          {progress.percent}
          %
        </span>

        <p className="vnext-analysis-progress-label">
          {progress.label}
        </p>
      </div>

      <div className="vnext-analysis-progress-track">
        <div
          className="vnext-analysis-progress-fill"
          style={{
            width: `${progress.percent}%`,
          }}
        />
      </div>
    </div>
  );
}
