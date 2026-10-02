import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  useVNextConsulting,
} from "./vNextConsultingUIAdapter.js";
import {
  VNextConsultingShell,
} from "./VNextConsultingShell.js";

export type VNextConsultingPhaseRootProps = {
  birthProfile: VNextBirthProfile;
  authenticated: boolean;
  authLoading: boolean;
  authError: unknown;
  onSignIn: () => void;
  onSignOut: () => void;
  accessToken?: string | null;
  onGoBack?: () => void;
  onEditBirthInfo?: () => void;
};

export function VNextConsultingPhaseRoot({
  birthProfile,
  authenticated,
  authLoading,
  authError,
  onSignIn,
  onSignOut,
  accessToken,
  onGoBack,
  onEditBirthInfo,
}: VNextConsultingPhaseRootProps) {
  const {
    state,
    loadingLabel,
    isBusy,
    isStreaming,
    submitQuestion,
    submitFollowUpQuestion,
    reset,
  } = useVNextConsulting({
    accessToken,
  });

  return (
    <VNextConsultingShell
      birthProfile={birthProfile}
      authenticated={authenticated}
      authLoading={authLoading}
      authError={authError}
      accessToken={accessToken}
      onSignIn={onSignIn}
      onSignOut={onSignOut}
      state={state}
      loadingLabel={loadingLabel}
      isBusy={isBusy}
      isStreaming={isStreaming}
      submitQuestion={submitQuestion}
      submitFollowUpQuestion={submitFollowUpQuestion}
      onNewConsultation={reset}
      onGoBack={onGoBack}
      onEditBirthInfo={onEditBirthInfo}
    />
  );
}
