import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  useVNextReport,
} from "./vNextReportUIAdapter.js";
import {
  VNextReportShell,
} from "./VNextReportShell.js";

export type VNextReportPhaseRootProps = {
  birthProfile: VNextBirthProfile;
  authenticated: boolean;
  authLoading: boolean;
  authError: unknown;
  onSignIn: () => void;
  onSignOut: () => void;
  accessToken?: string | null;
};

export function VNextReportPhaseRoot({
  birthProfile,
  authenticated,
  authLoading,
  authError,
  onSignIn,
  onSignOut,
  accessToken,
}: VNextReportPhaseRootProps) {
  const {
    state,
    loadingLabel,
    isBusy,
    isStreaming,
    startReport,
    setActiveSection,
  } = useVNextReport({
    accessToken,
  });

  return (
    <VNextReportShell
      birthProfile={birthProfile}
      authenticated={authenticated}
      authLoading={authLoading}
      authError={authError}
      onSignIn={onSignIn}
      onSignOut={onSignOut}
      state={state}
      loadingLabel={loadingLabel}
      isBusy={isBusy}
      isStreaming={isStreaming}
      startReport={startReport}
      setActiveSection={setActiveSection}
    />
  );
}
