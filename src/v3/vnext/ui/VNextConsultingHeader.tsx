import {
  resolveVNextConsultingStatusView,
} from "./VNextConsultingStatus.js";
import type {
  VNextConsultingSessionState,
} from "./vNextConsultingState.js";

export type VNextConsultingHeaderProps = {
  authenticated: boolean;
  authLoading: boolean;
  authErrorMessage?: string;
  onSignIn: () => void;
  onSignOut: () => void;
  state?: VNextConsultingSessionState;
  isBusy?: boolean;
  isStreaming?: boolean;
  loadingLabel?: string | null;
  onNewConsultation?: () => void;
  onGoBack?: () => void;
};

export function VNextConsultingHeader({
  authenticated,
  authLoading,
  authErrorMessage,
  onSignIn,
  onSignOut,
  state,
  isBusy = false,
  isStreaming = false,
  loadingLabel = null,
  onNewConsultation,
  onGoBack,
}: VNextConsultingHeaderProps) {
  const status = state
    ? resolveVNextConsultingStatusView(
        state,
        isBusy,
        isStreaming,
        loadingLabel,
      )
    : null;

  const canStartNewConsultation = Boolean(
    onNewConsultation
    && state
    && state.turns.length > 0
    && !isBusy
    && !isStreaming,
  );

  const canGoBack = Boolean(
    onGoBack
    && !isBusy
    && !isStreaming
  );

  return (
    <header className="vnext-consulting-header">
      <div className="vnext-consulting-header-inner">
        <div className="vnext-consulting-header-top">
          <p className="vnext-consulting-brand">
            천운문
          </p>

          <div className="vnext-consulting-header-actions">
            {canStartNewConsultation ? (
              <button
                className="vnext-consulting-new-session-button"
                type="button"
                onClick={onNewConsultation}
              >
                새 상담
              </button>
            ) : null}

            {canGoBack ? (
              <button
                className="vnext-consulting-auth-button"
                type="button"
                onClick={onGoBack}
              >
                이전으로
              </button>
            ) : null}

            <div className="vnext-consulting-auth">
              {authLoading ? (
                <p className="vnext-consulting-auth-status">
                  로그인 확인 중
                </p>
              ) : authenticated ? (
                <button
                  className="vnext-consulting-auth-button"
                  type="button"
                  onClick={onSignOut}
                >
                  로그아웃
                </button>
              ) : (
                <button
                  className="vnext-consulting-auth-button"
                  type="button"
                  onClick={onSignIn}
                >
                  카카오로 로그인
                </button>
              )}
            </div>
          </div>
        </div>

        <h1 className="vnext-consulting-title">
          질문 상담
        </h1>

        <p className="vnext-consulting-subtitle">
          출생 정보를 바탕으로 지금의 질문에 답합니다.
        </p>

        {status ? (
          <div className="vnext-consulting-header-status">
            <span
              className={[
                "vnext-consulting-header-status-badge",
                `vnext-consulting-header-status-badge--${status.tone}`,
              ].join(" ")}
            >
              {status.label}
            </span>
          </div>
        ) : null}

        {authErrorMessage ? (
          <p
            className="vnext-consulting-error"
            role="alert"
          >
            {authErrorMessage}
          </p>
        ) : null}
      </div>
    </header>
  );
}
