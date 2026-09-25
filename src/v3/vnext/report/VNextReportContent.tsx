import {
  useState,
} from "react";

import type {
  NaturalConsultingResponse,
} from "../gpt/responseGatewayTypes.js";
import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  normalizeConsultingDisplayText,
} from "../ui/consultingDisplayText.js";
import {
  VNEXT_REPORT_COPY,
  VNEXT_REPORT_SECTION_LABELS,
} from "./vNextReportCopy.js";
import {
  canDownloadVNextReportDocx,
  downloadVNextReportDocx,
  VNEXT_REPORT_DOCX_ERROR_MESSAGE,
} from "./vNextReportDocx.js";
import {
  resolveVNextReportUxActions,
  type VNextReportSessionState,
} from "./vNextReportState.js";

export type VNextReportContentProps = {
  birthProfile: VNextBirthProfile;
  state: VNextReportSessionState;
  isBusy: boolean;
  isStreaming: boolean;
  onRetry?: () => void;
  onContinueToConsulting?: () => void;
};

function resolveDisplayText(
  state: VNextReportSessionState,
  isStreaming: boolean,
): string | null {
  if (isStreaming && state.streamingText) {
    return normalizeConsultingDisplayText(state.streamingText);
  }

  if (state.response?.text) {
    return normalizeConsultingDisplayText(state.response.text);
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
        <p>{normalizeConsultingDisplayText(response.text)}</p>
      </div>
    </article>
  );
}

export function VNextReportContent({
  birthProfile,
  state,
  isBusy,
  isStreaming,
  onRetry,
  onContinueToConsulting,
}: VNextReportContentProps) {
  const [docxPreparing, setDocxPreparing] = useState(false);
  const [docxErrorMessage, setDocxErrorMessage] = useState<string | null>(
    null,
  );

  const uxActions = resolveVNextReportUxActions(state.phase);
  const displayText = resolveDisplayText(state, isStreaming);
  const showEmpty = !displayText
    && !isBusy
    && !isStreaming
    && !state.errorMessage
    && state.phase === "idle";

  const responseText = state.response?.text ?? "";
  const canDownload = uxActions.canDownloadDocx
    && canDownloadVNextReportDocx(
      state.phase,
      responseText,
    )
    && !state.errorMessage;

  async function handleDocxDownload(): Promise<void> {
    if (!canDownload || docxPreparing || !state.response) {
      return;
    }

    setDocxPreparing(true);
    setDocxErrorMessage(null);

    try {
      const sectionLabels = state.sections.map(
        (section) => VNEXT_REPORT_SECTION_LABELS[section],
      );

      await downloadVNextReportDocx({
        displayName: birthProfile.displayName,
        birthProfile,
        responseText: state.response.text,
        sectionLabels,
      });
    } catch {
      setDocxErrorMessage(VNEXT_REPORT_DOCX_ERROR_MESSAGE);
    } finally {
      setDocxPreparing(false);
    }
  }

  if (state.errorMessage || state.phase === "error") {
    return (
      <section
        className="vnext-report-content"
        aria-label="리포트 내용"
      >
        <p
          className="vnext-report-error"
          role="alert"
        >
          {state.errorMessage ?? VNEXT_REPORT_COPY.errorFallback}
        </p>

        {uxActions.canRetry && onRetry ? (
          <div className="vnext-report-flow-actions">
            <button
              type="button"
              className="vnext-report-auth-button"
              onClick={onRetry}
              disabled={isBusy || isStreaming}
            >
              {VNEXT_REPORT_COPY.retryButton}
            </button>
          </div>
        ) : null}
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

        <div className="vnext-report-flow-actions">
          {canDownload ? (
            <button
              type="button"
              className="vnext-report-docx-button"
              onClick={() => {
                void handleDocxDownload();
              }}
              disabled={docxPreparing}
            >
              {docxPreparing
                ? "문서 준비 중..."
                : "DOCX 다운로드"}
            </button>
          ) : null}

          {uxActions.canContinueToConsulting && onContinueToConsulting ? (
            <button
              type="button"
              className="vnext-report-flow-button"
              onClick={onContinueToConsulting}
            >
              {VNEXT_REPORT_COPY.continueToConsultingButton}
            </button>
          ) : null}

          {docxErrorMessage ? (
            <p
              className="vnext-report-docx-error"
              role="alert"
            >
              {docxErrorMessage}
            </p>
          ) : null}
        </div>
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
