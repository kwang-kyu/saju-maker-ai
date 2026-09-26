/**
 * vNext UI 상태 계약.
 *
 * UI는 단일 loading 플래그 대신 phase별 상태를 사용한다.
 */

import type {
  NaturalConsultingResponse,
} from "../gpt/responseGatewayTypes.js";
import type {
  ResponseActionType,
} from "../response/responseContext.js";
import type {
  VNextAnalysisProgressStep,
} from "./vNextAnalysisProgress.js";

export type VNextConsultingPhase =
  | "idle"
  | "analyzing"
  | "clarifying"
  | "generating"
  | "streaming"
  | "completed"
  | "error";

export type VNextConsultingMessageSource =
  | "engine"
  | "gpt"
  | "fallback"
  | "clarification"
  | "direct";

export type VNextConsultingMessageStatus =
  | "pending"
  | "complete"
  | "error";

export type VNextConsultingMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  source: VNextConsultingMessageSource;
  createdAt: string;
  status: VNextConsultingMessageStatus;
};

export type VNextConsultingTurn = {
  id: string;
  question: string;
  actionType: ResponseActionType | null;
  response: NaturalConsultingResponse | null;
  messages: VNextConsultingMessage[];
  latencyMs: number;
};

import type {
  ResponseStreamMetadata,
} from "../gpt/responseStreamingTypes.js";

export type VNextConsultingSessionState = {
  phase: VNextConsultingPhase;
  turns: VNextConsultingTurn[];
  activeTurnId: string | null;
  errorMessage: string | null;
  /**
   * Access/auth (or other) error code from the thrown error, when present.
   * Used to gate retry CTA via isConsultingAccessAuthRetryAllowed — not for UX copy.
   */
  errorCode: string | null;
  awaitingClarification: boolean;
  activeQuestion: string | null;
  streamingText: string | null;
  streamMetadata: ResponseStreamMetadata | null;
  progressStep: VNextAnalysisProgressStep | null;
};

export const INITIAL_VNEXT_CONSULTING_SESSION_STATE: VNextConsultingSessionState = {
  phase: "idle",
  turns: [],
  activeTurnId: null,
  errorMessage: null,
  errorCode: null,
  awaitingClarification: false,
  activeQuestion: null,
  streamingText: null,
  streamMetadata: null,
  progressStep: null,
};

export function resolveLoadingLabel(
  phase: VNextConsultingPhase,
): string | null {
  if (phase === "analyzing") {
    return "질문의 흐름을 확인하고 있습니다.";
  }

  if (phase === "generating") {
    return "상담 내용을 정리하고 있습니다.";
  }

  if (phase === "streaming") {
    return null;
  }

  return null;
}

export function mapResponseSourceToMessageSource(
  source: NaturalConsultingResponse["source"],
): VNextConsultingMessageSource {
  if (source === "gpt") {
    return "gpt";
  }

  if (source === "fallback") {
    return "fallback";
  }

  if (source === "clarification") {
    return "clarification";
  }

  if (source === "direct") {
    return "direct";
  }

  return "engine";
}
