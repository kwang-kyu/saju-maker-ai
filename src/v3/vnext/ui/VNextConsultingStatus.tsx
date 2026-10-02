import type {
  VNextConsultingSessionState,
} from "./vNextConsultingState.js";
import {
  VNextAnalysisProgressBar,
} from "./VNextAnalysisProgressBar.js";
import {
  isConsultingAccessAuthErrorCode,
} from "../gpt/responseGateway.js";

export type VNextConsultingStatusTone =
  | "idle"
  | "active"
  | "waiting"
  | "error";

export type VNextConsultingStatusView = {
  label: string;
  description: string | null;
  tone: VNextConsultingStatusTone;
  showSpinner: boolean;
};

export function resolveVNextConsultingStatusView(
  state: VNextConsultingSessionState,
  isBusy: boolean,
  isStreaming: boolean,
  loadingLabel: string | null,
): VNextConsultingStatusView {
  if (state.phase === "analyzing") {
    return {
      label: "질문 확인 중",
      description: loadingLabel ?? "질문의 흐름을 확인하고 있습니다.",
      tone: "active",
      showSpinner: true,
    };
  }

  if (state.phase === "generating") {
    return {
      label: "상담 정리 중",
      description: loadingLabel ?? "상담 내용을 정리하고 있습니다.",
      tone: "active",
      showSpinner: true,
    };
  }

  if (state.phase === "streaming" || isStreaming) {
    return {
      label: "답변 표시 중",
      description: "천운문이 답변을 작성하고 있습니다.",
      tone: "active",
      showSpinner: false,
    };
  }

  if (state.awaitingClarification) {
    return {
      label: "추가 정보 필요",
      description: "천운문이 요청한 내용을 입력해 주세요.",
      tone: "waiting",
      showSpinner: false,
    };
  }

  // Entitlement/auth errors: keep conversation-area messaging; do not
  // surface Header/status "처리 오류" badge (real system errors still do).
  if (
    state.phase === "error"
    && !isConsultingAccessAuthErrorCode(state.errorCode)
  ) {
    return {
      label: "처리 오류",
      description: state.errorMessage,
      tone: "error",
      showSpinner: false,
    };
  }

  if (state.turns.length > 0) {
    return {
      label: "상담 진행 중",
      description: isBusy
        ? loadingLabel
        : "추가 질문을 입력해 대화를 이어갈 수 있습니다.",
      tone: "idle",
      showSpinner: isBusy,
    };
  }

  return {
    label: "상담 준비",
    description: "질문을 입력하면 천운문이 답변합니다.",
    tone: "idle",
    showSpinner: false,
  };
}

export type VNextConsultingStatusProps = {
  state: VNextConsultingSessionState;
  isBusy: boolean;
  isStreaming: boolean;
  loadingLabel: string | null;
  compact?: boolean;
};

export function VNextConsultingStatus({
  state,
  isBusy,
  isStreaming,
  loadingLabel,
  compact = false,
}: VNextConsultingStatusProps) {
  const status = resolveVNextConsultingStatusView(
    state,
    isBusy,
    isStreaming,
    loadingLabel,
  );

  return (
    <div
      className={[
        "vnext-consulting-status",
        `vnext-consulting-status--${status.tone}`,
        compact
          ? "vnext-consulting-status--compact"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
    >
      {(isBusy || isStreaming) ? (
        <VNextAnalysisProgressBar
          progressStep={state.progressStep}
          className="vnext-analysis-progress vnext-analysis-progress--status"
        />
      ) : null}

      <div className="vnext-consulting-status-copy">
        <strong className="vnext-consulting-status-label">
          {status.label}
        </strong>

        {status.description ? (
          <p className="vnext-consulting-status-description">
            {status.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
