/**
 * vNext Entry Flow 초기 상태 및 phase 전환 헬퍼.
 */

import type {
  VNextConsultingMode,
  VNextEntryPhase,
  VNextEntryState,
} from "./vNextEntryTypes.js";

export const INITIAL_VNEXT_ENTRY_STATE: VNextEntryState = {
  phase: "landing",
  selectedMode: null,
  birthProfile: null,
};

/**
 * STEP 6-2 이후 birthInput → consulting/report 전환에 사용할 예약 헬퍼.
 */
export function resolvePhaseAfterBirthInput(
  mode: VNextConsultingMode,
): VNextEntryPhase {
  if (mode === "question") {
    return "consulting";
  }

  return "report";
}

export function resolvePhaseAfterModeSelection(
  _mode: VNextConsultingMode,
): VNextEntryPhase {
  return "birthInput";
}

export function isVNextEntryScreenPhase(
  phase: VNextEntryPhase,
): boolean {
  return phase === "landing"
    || phase === "modeSelection"
    || phase === "birthInput";
}
