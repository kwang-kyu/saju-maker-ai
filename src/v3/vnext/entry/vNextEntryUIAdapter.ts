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
  clearVNextEntryDraft,
  fromVNextEntryDraft,
  loadVNextEntryDraft,
  saveVNextEntryDraft,
} from "./vNextEntryPersistence.js";
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
  editBirthInfo: () => void;
  continueToConsulting: () => void;
  reset: () => void;
};

function isInitialEntryState(
  state: VNextEntryState,
): boolean {
  return state.phase === "landing"
    && state.selectedMode === null
    && state.birthProfile === null;
}

/**
 * Mount 초기화 시 sessionStorage draft를 controller state에 hydrate한다.
 * Persistence 실패 / 무효 draft는 INITIAL(landing)을 유지한다.
 *
 * NOTE: VNextEntryController에 restore API가 없어 mount 시점에만
 * getState() 참조의 phase/selectedMode/birthProfile을 직접 주입한다.
 * controller 구조 변경은 STEP 42 범위 밖이다.
 */
function hydrateEntryControllerFromDraft(
  controller: VNextEntryController,
): void {
  try {
    const draft = loadVNextEntryDraft();
    const hydrated = fromVNextEntryDraft(draft);

    if (hydrated === null) {
      return;
    }

    const state = controller.getState();
    state.phase = hydrated.phase;
    state.selectedMode = hydrated.selectedMode;
    state.birthProfile = hydrated.birthProfile;
  } catch {
    // Persistence failure must not break Entry UI.
  }
}

/**
 * Controller emit마다 draft를 저장한다.
 * landing 초기 상태(reset / goBack-to-landing)는 draft를 폐기한다.
 */
function persistEntryDraftSafely(
  state: VNextEntryState,
): void {
  try {
    if (isInitialEntryState(state)) {
      clearVNextEntryDraft();
      return;
    }

    saveVNextEntryDraft(state);
  } catch {
    // Persistence failure must not break Entry UI.
  }
}

export function useVNextEntry(): UseVNextEntryResult {
  const controllerRef = useRef<VNextEntryController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new VNextEntryController();
    hydrateEntryControllerFromDraft(controllerRef.current);
  }

  const [
    state,
    setState,
  ] = useState<VNextEntryState>(
    () => controllerRef.current!.getState(),
  );

  useEffect(() => {
    const controller = controllerRef.current!;

    return controller.subscribe((nextState) => {
      persistEntryDraftSafely(nextState);
      setState(nextState);
    });
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

  const editBirthInfo = useCallback(() => {
    controllerRef.current!.editBirthInfo();
  }, []);

  const continueToConsulting = useCallback(() => {
    controllerRef.current!.continueToConsulting();
  }, []);

  const reset = useCallback(() => {
    controllerRef.current!.reset();
    clearVNextEntryDraft();
  }, []);

  return {
    state,
    startConsulting,
    selectMode,
    completeBirthInput,
    goBack,
    editBirthInfo,
    continueToConsulting,
    reset,
  };
}

export {
  INITIAL_VNEXT_ENTRY_STATE,
};
