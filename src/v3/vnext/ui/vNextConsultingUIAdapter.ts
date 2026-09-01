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
  resolveBrowserGatewayMockMode,
  resolveBrowserResponseGateway,
} from "./vNextRemoteResponseGateway.js";
import {
  resolveLoadingLabel,
  type VNextConsultingSessionState,
} from "./vNextConsultingState.js";

export type UseVNextConsultingOptions = {
  mockGateway?: boolean;
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

export function useVNextConsulting(
  options: UseVNextConsultingOptions = {},
): UseVNextConsultingResult {
  const controllerRef = useRef<VNextConsultingController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new VNextConsultingController({
      gateway: resolveBrowserResponseGateway(
        resolveBrowserGatewayMockMode(options.mockGateway),
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
    () => resolveLoadingLabel(state.phase),
    [state.phase],
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

export function isVNextModeEnabled(
  location: Pick<Location, "hash" | "search"> = globalThis.location,
): boolean {
  const hashQuery = location.hash.includes("?")
    ? location.hash.split("?")[1]
    : "";

  const params = new URLSearchParams(
    hashQuery || location.search.replace(/^\?/, ""),
  );

  return params.get("vnext") === "1";
}
