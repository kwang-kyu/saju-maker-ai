/**
 * vNext Entry UI Adapter.
 *
 * React hook — Entry Navigation State만 노출한다.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  VNextEntryController,
} from "./vNextEntryController.js";
import {
  INITIAL_VNEXT_ENTRY_STATE,
} from "./vNextEntryState.js";
import type {
  VNextBirthProfile,
} from "./vNextBirthProfile.js";
import type {
  VNextConsultingMode,
  VNextEntryState,
} from "./vNextEntryTypes.js";

export type UseVNextEntryResult = {
  state: VNextEntryState;
  startConsulting: () => void;
  selectMode: (mode: VNextConsultingMode) => void;
  completeBirthInput: (profile: VNextBirthProfile) => void;
  goBack: () => void;
  continueToConsulting: () => void;
  reset: () => void;
};

export function useVNextEntry(): UseVNextEntryResult {
  const controllerRef = useRef<VNextEntryController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new VNextEntryController();
  }

  const [
    state,
    setState,
  ] = useState<VNextEntryState>(
    () => controllerRef.current!.getState(),
  );

  useEffect(() => {
    const controller = controllerRef.current!;

    return controller.subscribe(setState);
  }, []);

  const startConsulting = useCallback(() => {
    controllerRef.current!.startConsulting();
  }, []);

  const selectMode = useCallback(
    (mode: VNextConsultingMode) => {
      controllerRef.current!.selectMode(mode);
    },
    [],
  );

  const completeBirthInput = useCallback(
    (profile: VNextBirthProfile) => {
      controllerRef.current!.completeBirthInput(profile);
    },
    [],
  );

  const goBack = useCallback(() => {
    controllerRef.current!.goBack();
  }, []);

  const continueToConsulting = useCallback(() => {
    controllerRef.current!.continueToConsulting();
  }, []);

  const reset = useCallback(() => {
    controllerRef.current!.reset();
  }, []);

  return {
    state,
    startConsulting,
    selectMode,
    completeBirthInput,
    goBack,
    continueToConsulting,
    reset,
  };
}

export {
  INITIAL_VNEXT_ENTRY_STATE,
};
