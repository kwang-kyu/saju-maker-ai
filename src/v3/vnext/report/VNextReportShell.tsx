import {
  useEffect,
} from "react";

import {
  VNextBirthProfileSummary,
} from "../ui/VNextBirthProfileSummary.js";
import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  VNextReportContent,
} from "./VNextReportContent.js";
import {
  VNextReportHeader,
} from "./VNextReportHeader.js";
import {
  VNextReportProgress,
} from "./VNextReportProgress.js";
import {
  VNextReportSectionNavigation,
} from "./VNextReportSectionNavigation.js";
import {
  resolveVNextReportUxActions,
  type VNextReportSessionState,
} from "./vNextReportState.js";

import "./vNextReport.css";

function readErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
    && error.message.trim()
  ) {
    return error.message;
  }

  return "천운문 v3 상담 요청을 처리하지 못했습니다.";
}

export type VNextReportShellProps = {
  birthProfile: VNextBirthProfile;
  authenticated: boolean;
  authLoading: boolean;
  authError: unknown;
  onSignIn: () => void;
  onSignOut: () => void;
  state: VNextReportSessionState;
  loadingLabel: string | null;
  isBusy: boolean;
  isStreaming: boolean;
  startReport: (birthProfile: VNextBirthProfile) => Promise<void>;
  retryReport: (birthProfile: VNextBirthProfile) => Promise<void>;
  restartReport: (birthProfile: VNextBirthProfile) => Promise<void>;
  setActiveSection: (
    section: VNextReportSessionState["sections"][number],
  ) => void;
  onContinueToConsulting?: () => void;
  onGoBack?: () => void;
};

export function VNextReportShell({
  birthProfile,
  authenticated,
  authLoading,
  authError,
  onSignIn,
  onSignOut,
  state,
  loadingLabel,
  isBusy,
  isStreaming,
  startReport,
  retryReport,
  restartReport,
  setActiveSection,
  onContinueToConsulting,
  onGoBack,
}: VNextReportShellProps) {
  const displayName = birthProfile.displayName?.trim()
    || "상담자";
  const uxActions = resolveVNextReportUxActions(state.phase);

  useEffect(() => {
    if (authenticated && !authLoading) {
      void startReport(birthProfile);
    }
  }, [
    authenticated,
    authLoading,
    birthProfile,
    startReport,
  ]);

  const showSectionNav = state.sections.length > 0
    && (
      state.phase === "generating"
      || state.phase === "completed"
      || isStreaming
    );

  return (
    <div className="vnext-report-shell">
      <VNextReportHeader
        authenticated={authenticated}
        authLoading={authLoading}
        authErrorMessage={
          authError
            ? readErrorMessage(authError)
            : undefined
        }
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        displayName={displayName}
        canNewReport={uxActions.canNewReport}
        canGoBack={uxActions.canGoBack}
        onNewReport={
          uxActions.canNewReport
            ? () => {
                void restartReport(birthProfile);
              }
            : undefined
        }
        onGoBack={
          uxActions.canGoBack
            ? onGoBack
            : undefined
        }
      />

      <main className="vnext-report-main">
        <VNextBirthProfileSummary
          profile={birthProfile}
        />

        <VNextReportProgress
          state={state}
          isBusy={isBusy}
          isStreaming={isStreaming}
          loadingLabel={loadingLabel}
        />

        <div className="vnext-report-layout">
          {showSectionNav ? (
            <VNextReportSectionNavigation
              sections={state.sections}
              activeSection={state.activeSection}
              onSelectSection={setActiveSection}
              disabled={isBusy}
            />
          ) : null}

          <VNextReportContent
            birthProfile={birthProfile}
            state={state}
            isBusy={isBusy}
            isStreaming={isStreaming}
            onRetry={
              uxActions.canRetry
                ? () => {
                    void retryReport(birthProfile);
                  }
                : undefined
            }
            onContinueToConsulting={
              uxActions.canContinueToConsulting
                ? onContinueToConsulting
                : undefined
            }
          />
        </div>
      </main>
    </div>
  );
}
