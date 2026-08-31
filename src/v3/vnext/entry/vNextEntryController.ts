/**
 * vNext Entry Controller.
 *
 * landing / modeSelection / birthInput / consulting / report 진입 흐름을 관리한다.
 * Consulting Response State(idle/analyzing/...)와 혼합하지 않는다.
 */

import {
  INITIAL_VNEXT_ENTRY_STATE,
  resolvePhaseAfterBirthInput,
  resolvePhaseAfterModeSelection,
} from "./vNextEntryState.js";
import type {
  VNextBirthProfile,
} from "./vNextBirthProfile.js";
import type {
  VNextConsultingMode,
  VNextEntryState,
} from "./vNextEntryTypes.js";

export type VNextEntryControllerListener = (
  state: VNextEntryState,
) => void;

export class VNextEntryController {
  private state: VNextEntryState = {
    ...INITIAL_VNEXT_ENTRY_STATE,
  };

  private readonly listeners = new Set<VNextEntryControllerListener>();

  getState(): VNextEntryState {
    return this.state;
  }

  subscribe(
    listener: VNextEntryControllerListener,
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.state = {
      ...INITIAL_VNEXT_ENTRY_STATE,
    };
    this.emit();
  }

  startConsulting(): void {
    this.state = {
      ...this.state,
      phase: "modeSelection",
    };
    this.emit();
  }

  selectMode(
    mode: VNextConsultingMode,
  ): void {
    this.state = {
      phase: resolvePhaseAfterModeSelection(mode),
      selectedMode: mode,
      birthProfile: this.state.birthProfile,
    };
    this.emit();
  }

  completeBirthInput(
    profile: VNextBirthProfile,
  ): void {
    if (this.state.selectedMode === null) {
      return;
    }

    this.state = {
      phase: resolvePhaseAfterBirthInput(
        this.state.selectedMode,
      ),
      selectedMode: this.state.selectedMode,
      birthProfile: profile,
    };
    this.emit();
  }

  goBack(): void {
    if (this.state.phase === "modeSelection") {
      this.state = {
        ...INITIAL_VNEXT_ENTRY_STATE,
      };
      this.emit();
      return;
    }

    if (this.state.phase === "birthInput") {
      this.state = {
        phase: "modeSelection",
        selectedMode: this.state.selectedMode,
        birthProfile: null,
      };
      this.emit();
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
