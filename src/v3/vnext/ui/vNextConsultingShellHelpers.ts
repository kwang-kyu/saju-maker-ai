import type {
  VNextConsultingSessionState,
} from "./vNextConsultingState.js";
import type {
  VNextQuestionComposerMode,
} from "./VNextQuestionComposer.js";
import {
  resolveVNextQuestionComposerMode,
} from "./VNextQuestionComposer.js";

export type VNextQuestionSubmitContext = {
  question: string;
  state: VNextConsultingSessionState;
  isSubmitting: boolean;
  isBusy: boolean;
  isStreaming: boolean;
  authenticated: boolean;
};

export function canSubmitVNextQuestion(
  context: VNextQuestionSubmitContext,
): boolean {
  return context.question.trim().length > 0
    && !context.isSubmitting
    && !context.isBusy
    && !context.isStreaming
    && context.authenticated;
}

export function shouldUseInitialQuestionSubmit(
  state: VNextConsultingSessionState,
): boolean {
  return state.turns.length === 0;
}

export function resolveVNextShellComposerPlacement(
  state: VNextConsultingSessionState,
  composerMode: VNextQuestionComposerMode | null,
): "top" | "bottom" {
  if (!composerMode) {
    return "bottom";
  }

  if (
    composerMode === "initial"
    && state.turns.length === 0
  ) {
    return "bottom";
  }

  return "bottom";
}

export function shouldShowVNextQuestionComposer(
  state: VNextConsultingSessionState,
  isBusy: boolean,
  isStreaming: boolean,
): boolean {
  return resolveVNextQuestionComposerMode(
    state,
    isBusy,
    isStreaming,
  ) !== null;
}
