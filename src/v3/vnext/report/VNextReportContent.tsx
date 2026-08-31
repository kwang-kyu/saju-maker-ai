import type {
  NaturalConsultingResponse,
} from "../gpt/responseGatewayTypes.js";
import {
  VNEXT_REPORT_COPY,
  VNEXT_REPORT_SECTION_LABELS,
} from "./vNextReportCopy.js";
import type {
  VNextReportSessionState,
} from "./vNextReportState.js";

export type VNextReportContentProps = {
  state: VNextReportSessionState;
  isBusy: boolean;
  isStreaming: boolean;
};

function resolveDisplayText(
  state: VNextReportSessionState,
  isStreaming: boolean,
): string | null {
  if (isStreaming && state.streamingText) {
    return state.streamingText;
  }

  if (state.response?.text) {
    return state.response.text;
  }

  return null;
}

function renderCompletedResponse(
  response: NaturalConsultingResponse,
  activeSection: VNextReportSessionState["activeSection"],
) {
  return (
    <article className="vnext-report-content-body">
      {activeSection ? (
        <p className="vnext-report-content-section-kicker">
          {VNEXT_REPORT_SECTION_LABELS[activeSection]}
        </p>
      ) : null}

      <div className="vnext-report-content-text">
        <p>{response.text}</p>
      </div>
    </article>
  );
}

export function VNextReportContent({
  state,
  isBusy,
  isStreaming,
}: VNextReportContentProps) {
  const displayText = resolveDisplayText(state, isStreaming);
  const showEmpty = !displayText
    && !isBusy
    && !isStreaming
    && !state.errorMessage
    && state.phase === "idle";

  if (state.errorMessage) {
    return (
      <section
        className="vnext-report-content"
        aria-label="리포트 내용"
      >
        <p
          className="vnext-report-error"
          role="alert"
        >
          {state.errorMessage}
        </p>
      </section>
    );
  }

  if (isStreaming && displayText) {
    return (
      <section
        className="vnext-report-content"
        aria-label="리포트 내용"
        aria-busy="true"
      >
        <div className="vnext-report-content-text vnext-report-content-text--streaming">
          <p>
            {displayText}
            <span
              className="vnext-report-stream-cursor"
              aria-hidden="true"
            />
          </p>
        </div>
      </section>
    );
  }

  if (state.response && state.phase === "completed") {
    return (
      <section
        className="vnext-report-content"
        aria-label="리포트 내용"
      >
        {renderCompletedResponse(
          state.response,
          state.activeSection,
        )}
      </section>
    );
  }

  if (showEmpty) {
    return (
      <section
        className="vnext-report-content"
        aria-label="리포트 내용"
      >
        <p className="vnext-report-content-empty">
          {VNEXT_REPORT_COPY.emptyContent}
        </p>
      </section>
    );
  }

  return (
    <section
      className="vnext-report-content"
      aria-label="리포트 내용"
      aria-busy={isBusy ? "true" : undefined}
    />
  );
}
