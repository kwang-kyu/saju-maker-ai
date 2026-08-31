/**
 * vNext Entry Flow 타입.
 *
 * Entry Navigation State는 Consulting Response State와 분리한다.
 */

import type {
  VNextBirthProfile,
} from "./vNextBirthProfile.js";

export type VNextEntryPhase =
  | "landing"
  | "modeSelection"
  | "birthInput"
  | "consulting"
  | "report";

export type VNextConsultingMode =
  | "question"
  | "report";

export type VNextEntryState = {
  phase: VNextEntryPhase;
  selectedMode: VNextConsultingMode | null;
  birthProfile: VNextBirthProfile | null;
};
