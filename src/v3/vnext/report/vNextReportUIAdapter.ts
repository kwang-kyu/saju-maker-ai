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
  createRemoteResponseGateway,
  resolveBrowserGatewayMockMode,
  resolveBrowserResponseGateway,
  VNEXT_REPORT_GENERATE_ENDPOINT,
  VNEXT_REPORT_STREAM_ENDPOINT,
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
  /**
   * Optional Supabase access token (snapshot).
   * Passed through to Remote Gateway at request time via optionsRef.
   */
  accessToken?: string | null;
};

export type UseVNextReportResult = {
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
  reset: () => void;
};

function resolveReportAdapterAccessToken(
  options: UseVNextReportOptions,
): string | null {
  return options.accessToken ?? null;
}

function createReportAdapterResponseGateway(
  options: UseVNextReportOptions,
  getLatestOptions: () => UseVNextReportOptions,
) {
  const mockMode = resolveBrowserGatewayMockMode(options.mockGateway);

  if (mockMode) {
    return resolveBrowserResponseGateway(true);
  }

  return createRemoteResponseGateway({
    endpoint: VNEXT_REPORT_GENERATE_ENDPOINT,
    streamEndpoint: VNEXT_REPORT_STREAM_ENDPOINT,
    getAccessToken: () => resolveReportAdapterAccessToken(getLatestOptions()),
  });
}

export function useVNextReport(
  options: UseVNextReportOptions = {},
): UseVNextReportResult {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const controllerRef = useRef<VNextReportController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new VNextReportController({
      gateway: createReportAdapterResponseGateway(
        options,
        () => optionsRef.current,
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

  const retryReport = useCallback(
    async (birthProfile: VNextBirthProfile) => {
      await controllerRef.current!.retryReport(birthProfile);
    },
    [],
  );

  const restartReport = useCallback(
    async (birthProfile: VNextBirthProfile) => {
      await controllerRef.current!.restartReport(birthProfile);
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
    retryReport,
    restartReport,
    setActiveSection,
    reset,
  };
}
