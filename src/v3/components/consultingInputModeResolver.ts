import type {
  ConsultingTurnKind,
} from "../consulting/consultingSession";
import type {
  V3ConsultingPendingClarification,
} from "../services/v3ConsultingSessionApiClient";

export type V3ConsultingInputMode =
  | "clarification"
  | "followUp";

export type V3ConsultingRequestKind =
  | "clarification"
  | "followUp";

export function resolveDefaultInputMode(
  pendingClarification:
    V3ConsultingPendingClarification | null,
): V3ConsultingInputMode {
  if (
    pendingClarification
    !== null
  ) {
    return "clarification";
  }

  return "followUp";
}

export function resolveInputModeAfterResponse(
  pendingClarification:
    V3ConsultingPendingClarification | null,
): V3ConsultingInputMode {
  return resolveDefaultInputMode(
    pendingClarification,
  );
}

export function resolveRequestKind(
  inputMode:
    V3ConsultingInputMode,
): V3ConsultingRequestKind {
  if (
    inputMode
    === "clarification"
  ) {
    return "clarification";
  }

  return "followUp";
}

export function resolveTurnUserLabel(
  kind:
    ConsultingTurnKind,
  sequence:
    number,
): string {
  if (
    kind
    === "clarification"
  ) {
    return `답변 ${sequence}`;
  }

  return `질문 ${sequence}`;
}

export function resolveInputLabel(
  inputMode:
    V3ConsultingInputMode,
  hasPendingClarification:
    boolean,
): string {
  if (
    inputMode
    === "clarification"
  ) {
    return "현재 질문에 답하기";
  }

  if (
    hasPendingClarification
  ) {
    return "새 질문 시작하기";
  }

  return "이어서 질문하기";
}

export function resolveInputPlaceholder(
  inputMode:
    V3ConsultingInputMode,
): string {
  if (
    inputMode
    === "clarification"
  ) {
    return "천운문이 요청한 내용을 입력해 주세요.";
  }

  return "새로 상담받을 질문을 입력해 주세요.";
}

export function resolveSubmitButtonLabel(
  inputMode:
    V3ConsultingInputMode,
  isSubmitting:
    boolean,
): string {
  if (
    isSubmitting
  ) {
    if (
      inputMode
      === "clarification"
    ) {
      return "답변을 확인하고 있습니다";
    }

    return "새 질문을 판단하고 있습니다";
  }

  if (
    inputMode
    === "clarification"
  ) {
    return "답변 보내기";
  }

  return "새 질문 보내기";
}
