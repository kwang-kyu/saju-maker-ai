/**
 * vNext Consulting UI Adapter.
 *
 * React hook — UI는 NaturalConsultingResponse만 표시한다.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  VNextConsultingController,
} from "./vNextConsultingController.js";
import {
  createRemoteResponseGateway,
  resolveBrowserGatewayMockMode,
  resolveBrowserResponseGateway,
} from "./vNextRemoteResponseGateway.js";
import {
  resolveAnalysisProgressView,
} from "./vNextAnalysisProgress.js";
import {
  resolveLoadingLabel,
  type VNextConsultingSessionState,
} from "./vNextConsultingState.js";

export type UseVNextConsultingOptions = {
  mockGateway?: boolean;
  /**
   * Optional Supabase access token (snapshot).
   * Prefer getAccessToken when auth can change after mount.
   */
  accessToken?: string | null;
  /**
   * Optional Supabase access token getter.
   * Invoked at Remote Gateway request time (not captured at gateway create).
   */
  getAccessToken?: () => string | null;
};

export type UseVNextConsultingResult = {
  state: VNextConsultingSessionState;
  loadingLabel: string | null;
  isBusy: boolean;
  isStreaming: boolean;
  submitQuestion: (request: V3ConsultingRequest) => Promise<void>;
  submitFollowUpQuestion: (
    question: string,
    request: V3ConsultingRequest,
  ) => Promise<void>;
  reset: () => void;
};

function resolveAdapterAccessToken(
  options: UseVNextConsultingOptions,
): string | null {
  if (typeof options.getAccessToken === "function") {
    return options.getAccessToken();
  }

  return options.accessToken ?? null;
}

function createAdapterResponseGateway(
  options: UseVNextConsultingOptions,
  getLatestOptions: () => UseVNextConsultingOptions,
) {
  const mockMode = resolveBrowserGatewayMockMode(options.mockGateway);

  if (mockMode) {
    return resolveBrowserResponseGateway(true);
  }

  return createRemoteResponseGateway({
    getAccessToken: () => resolveAdapterAccessToken(getLatestOptions()),
  });
}

export function useVNextConsulting(
  options: UseVNextConsultingOptions = {},
): UseVNextConsultingResult {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const controllerRef = useRef<VNextConsultingController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new VNextConsultingController({
      gateway: createAdapterResponseGateway(
        options,
        () => optionsRef.current,
      ),
    });
  }

  const [
    state,
    setState,
  ] = useState<VNextConsultingSessionState>(
    () => controllerRef.current!.getState(),
  );

  useEffect(() => {
    const controller = controllerRef.current!;

    return controller.subscribe(setState);
  }, []);

  const submitQuestion = useCallback(
    async (request: V3ConsultingRequest) => {
      await controllerRef.current!.submitQuestion(request);
    },
    [],
  );

  const submitFollowUpQuestion = useCallback(
    async (
      question: string,
      request: V3ConsultingRequest,
    ) => {
      await controllerRef.current!.submitFollowUpQuestion(
        question,
        request,
      );
    },
    [],
  );

  const reset = useCallback(() => {
    controllerRef.current!.reset();
  }, []);

  const loadingLabel = useMemo(
    () => {
      const progressView = resolveAnalysisProgressView(state.progressStep);

      if (progressView) {
        return `${progressView.label}.`;
      }

      return resolveLoadingLabel(state.phase);
    },
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
    submitQuestion,
    submitFollowUpQuestion,
    reset,
  };
}

export {
  isVNextModeEnabled,
} from "./vNextMode.js";
