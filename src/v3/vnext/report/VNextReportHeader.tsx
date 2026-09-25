import {
  VNEXT_REPORT_COPY,
} from "./vNextReportCopy.js";

export type VNextReportHeaderProps = {
  authenticated: boolean;
  authLoading: boolean;
  authErrorMessage?: string;
  onSignIn: () => void;
  onSignOut: () => void;
  displayName: string;
  canNewReport?: boolean;
  canGoBack?: boolean;
  onNewReport?: () => void;
  onGoBack?: () => void;
};

export function VNextReportHeader({
  authenticated,
  authLoading,
  authErrorMessage,
  onSignIn,
  onSignOut,
  displayName,
  canNewReport = false,
  canGoBack = false,
  onNewReport,
  onGoBack,
}: VNextReportHeaderProps) {
  return (
    <header className="vnext-report-header">
      <div className="vnext-report-header-inner">
        <div className="vnext-report-header-top">
          <p className="vnext-report-brand">
            천운문
          </p>

          <div className="vnext-report-header-actions">
            {canNewReport && onNewReport ? (
              <button
                className="vnext-report-new-session-button"
                type="button"
                onClick={onNewReport}
              >
                {VNEXT_REPORT_COPY.newReportButton}
              </button>
            ) : null}

            {canGoBack && onGoBack ? (
              <button
                className="vnext-report-auth-button"
                type="button"
                onClick={onGoBack}
              >
                {VNEXT_REPORT_COPY.goBackButton}
              </button>
            ) : null}

            <div className="vnext-report-auth">
              {authLoading ? (
                <p className="vnext-report-auth-status">
                  로그인 확인 중
                </p>
              ) : authenticated ? (
                <button
                  className="vnext-report-auth-button"
                  type="button"
                  onClick={onSignOut}
                >
                  로그아웃
                </button>
              ) : (
                <button
                  className="vnext-report-auth-button"
                  type="button"
                  onClick={onSignIn}
                >
                  카카오로 로그인
                </button>
              )}
            </div>
          </div>
        </div>

        <h1 className="vnext-report-title">
          {VNEXT_REPORT_COPY.title}
        </h1>

        <p className="vnext-report-subtitle">
          {displayName}님 · {VNEXT_REPORT_COPY.subtitle}
        </p>

        {authErrorMessage ? (
          <p
            className="vnext-report-error"
            role="alert"
          >
            {authErrorMessage}
          </p>
        ) : null}
      </div>
    </header>
  );
}
