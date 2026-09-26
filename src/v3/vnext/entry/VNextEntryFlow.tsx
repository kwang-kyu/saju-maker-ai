import {
  VNextBirthInputScreen,
} from "./VNextBirthInputScreen.js";
import {
  VNextLandingScreen,
} from "./VNextLandingScreen.js";
import {
  VNextModeSelectionScreen,
} from "./VNextModeSelectionScreen.js";
import type {
  VNextBirthProfile,
} from "./vNextBirthProfile.js";
import type {
  VNextConsultingMode,
  VNextEntryPhase,
} from "./vNextEntryTypes.js";
import {
  VNEXT_ENTRY_CLASSES,
} from "./vNextEntryContent.js";

export type VNextEntryFlowProps = {
  phase: VNextEntryPhase;
  selectedMode: VNextConsultingMode | null;
  birthProfile?: VNextBirthProfile | null;
  onStartConsulting: () => void;
  onSelectMode: (mode: VNextConsultingMode) => void;
  onCompleteBirthInput: (profile: VNextBirthProfile) => void;
  onGoBack: () => void;
};

export function VNextEntryFlow({
  phase,
  selectedMode,
  birthProfile = null,
  onStartConsulting,
  onSelectMode,
  onCompleteBirthInput,
  onGoBack,
}: VNextEntryFlowProps) {
  return (
    <div className={VNEXT_ENTRY_CLASSES.flow}>
      {phase === "landing" ? (
        <VNextLandingScreen
          onStartConsulting={onStartConsulting}
        />
      ) : null}

      {phase === "modeSelection" ? (
        <VNextModeSelectionScreen
          selectedMode={selectedMode}
          onSelectMode={onSelectMode}
          onGoBack={onGoBack}
        />
      ) : null}

      {phase === "birthInput" ? (
        <VNextBirthInputScreen
          initialProfile={birthProfile}
          onSubmit={onCompleteBirthInput}
          onGoBack={onGoBack}
        />
      ) : null}
    </div>
  );
}
