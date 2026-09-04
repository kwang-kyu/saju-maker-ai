/**
 * vNext Report UI Adapter.
 *
 * React hook — Report SessionState만 노출한다.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  resolveBrowserGatewayMockMode,
  resolveBrowserResponseGateway,
} from "../ui/vNextRemoteResponseGateway.js";
import {
  VNextReportController,
} from "./vNextReportController.js";
import {
  resolveReportLoadingLabel,
  type VNextReportSessionState,
} from "./vNextReportState.js";

export type UseVNextReportOptions = {
  mockGateway?: boolean;
};

export type UseVNextReportResult = {
  state: VNextReportSessionState;
  loadingLabel: string | null;
  isBusy: boolean;
  isStreaming: boolean;
  startReport: (birthProfile: VNextBirthProfile) => Promise<void>;
  setActiveSection: (
    section: VNextReportSessionState["sections"][number],
  ) => void;
  reset: () => void;
};

export function useVNextReport(
  options: UseVNextReportOptions = {},
): UseVNextReportResult {
  const controllerRef = useRef<VNextReportController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new VNextReportController({
      gateway: resolveBrowserResponseGateway(
        resolveBrowserGatewayMockMode(options.mockGateway),
      ),
    });
  }

  const [
    state,
    setState,
  ] = useState<VNextReportSessionState>(
    () => controllerRef.current!.getState(),
  );

  useEffect(() => {
    const controller = controllerRef.current!;

    return controller.subscribe(setState);
  }, []);

  const startReport = useCallback(
    async (birthProfile: VNextBirthProfile) => {
      await controllerRef.current!.startReport(birthProfile);
    },
    [],
  );

  const setActiveSection = useCallback(
    (section: VNextReportSessionState["sections"][number]) => {
      controllerRef.current!.setActiveSection(section);
    },
    [],
  );

  const reset = useCallback(() => {
    controllerRef.current!.reset();
  }, []);

  const loadingLabel = useMemo(
    () => resolveReportLoadingLabel(
      state.phase,
      state.progressStep,
    ),
    [state.phase, state.progressStep],
  );

  const isBusy = state.phase === "analyzing"
    || state.phase === "generating";

  const isStreaming = state.phase === "streaming";

  return {
    state,
    loadingLabel,
    isBusy,
    isStreaming,
    startReport,
    setActiveSection,
    reset,
  };
}
