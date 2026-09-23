/**
 * vNext Consulting Controller.
 *
 * UI 상태 머신 — analyzing / clarifying / generating / streaming / completed를 분리한다.
 */

import type {
  ConversationSession,
} from "../conversation/conversationSession.js";
import {
  createMockResponseGateway,
  type ResponseGateway,
} from "../gpt/responseGateway.js";
import {
  appendStreamDelta,
} from "../gpt/responseStreamUtils.js";
import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  buildConsultingTurn,
} from "./vNextResponseMapper.js";
import type {
  VNextAnalysisProgressStep,
} from "./vNextAnalysisProgress.js";
import {
  INITIAL_VNEXT_CONSULTING_SESSION_STATE,
  type VNextConsultingPhase,
  type VNextConsultingSessionState,
} from "./vNextConsultingState.js";

type VNextConversationPipelineResult = Awaited<
  ReturnType<
    typeof import("../conversation/conversationPipeline.js").runVNextConversationPipeline
  >
>;

type VNextConsultingPipelineResult = Awaited<
  ReturnType<
    typeof import("./vNextConsultingPipeline.js").runVNextConsultingPipeline
  >
>;

export type VNextConsultingControllerOptions = {
  gateway?: ResponseGateway;
  useMockGateway?: boolean;
};

export type VNextConsultingControllerListener = (
  state: VNextConsultingSessionState,
) => void;

export class VNextConsultingController {
  private state: VNextConsultingSessionState = {
    ...INITIAL_VNEXT_CONSULTING_SESSION_STATE,
  };

  private conversationSession: ConversationSession | null = null;

  private readonly gateway: ResponseGateway;

  private readonly listeners = new Set<VNextConsultingControllerListener>();

  constructor(
    options: VNextConsultingControllerOptions = {},
  ) {
    if (options.gateway) {
      this.gateway = options.gateway;
    } else if (options.useMockGateway ?? true) {
      this.gateway = createMockResponseGateway();
    } else {
      throw new Error(
        "VNextConsultingController requires gateway or useMockGateway.",
      );
    }
  }

  getState(): VNextConsultingSessionState {
    return this.state;
  }

  getConversationSession(): ConversationSession | null {
    return this.conversationSession;
  }

  subscribe(
    listener: VNextConsultingControllerListener,
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.conversationSession = null;
    this.state = {
      ...INITIAL_VNEXT_CONSULTING_SESSION_STATE,
    };
    this.emit();
  }

  private updateProgressStep(
    progressStep: VNextAnalysisProgressStep,
  ): void {
    this.state = {
      ...this.state,
      progressStep,
    };
    this.emit();
  }

  async submitQuestion(
    request: V3ConsultingRequest,
  ): Promise<void> {
    if (this.isBusy()) {
      return;
    }

    const question = request.question.trim();

    this.conversationSession = null;
    this.state = {
      ...INITIAL_VNEXT_CONSULTING_SESSION_STATE,
      phase: "analyzing",
      errorMessage: null,
      activeTurnId: null,
      activeQuestion: question,
      streamingText: null,
      streamMetadata: null,
      progressStep: "birthInputValidated",
    };
    this.emit();

    await this.runConversationTurn(question, request);
  }

  async submitFollowUpQuestion(
    question: string,
    request: V3ConsultingRequest,
  ): Promise<void> {
    if (this.isBusy()) {
      return;
    }

    const trimmedQuestion = question.trim();

    if (trimmedQuestion.length === 0) {
      return;
    }

    this.state = {
      ...this.state,
      phase: "analyzing",
      errorMessage: null,
      activeTurnId: null,
      activeQuestion: trimmedQuestion,
      streamingText: null,
      streamMetadata: null,
      progressStep: "birthInputValidated",
    };
    this.emit();

    await this.runConversationTurn(trimmedQuestion, request);
  }

  private isBusy(): boolean {
    return this.state.phase === "analyzing"
      || this.state.phase === "generating"
      || this.state.phase === "streaming";
  }

  private async runConversationTurn(
    question: string,
    request: V3ConsultingRequest,
  ): Promise<void> {
    const pipelineStartedAt = Date.now();
    let streamingText = "";
    let firstChunkLatencyMs: number | null = null;
    let hasEnteredStreaming = false;
    const previousTurns = this.state.turns;

    try {
      const {
        runVNextConversationPipeline,
      } = await import("../conversation/conversationPipeline.js");

      const pipelineResult = await runVNextConversationPipeline({
        session: this.conversationSession ?? undefined,
        question,
        input: {
          request,
          gateway: this.gateway,
        },
        options: {
          streaming: true,
          answerMode: "question",
          analysisStartedAt: pipelineStartedAt,
          onAnalysisProgress: (step) => {
            this.updateProgressStep(step);
          },
          onGenerating: () => {
            this.state = {
              ...this.state,
              phase: "generating",
              progressStep: "generating",
            };
            this.emit();
          },
          onStreamEvent: (event) => {
            if (event.type === "delta" && event.text) {
              streamingText = appendStreamDelta(streamingText, event.text);

              if (!hasEnteredStreaming) {
                hasEnteredStreaming = true;
                firstChunkLatencyMs = Date.now() - pipelineStartedAt;
              }

              this.state = {
                ...this.state,
                phase: "streaming",
                streamingText,
                progressStep: "streaming",
              };
              this.emit();
            }
          },
        },
      });

      this.conversationSession = pipelineResult.session;

      const totalLatencyMs = Date.now() - pipelineStartedAt;
      const analysisLatencyMs = pipelineResult.response.analysisLatencyMs
        ?? totalLatencyMs;
      const actionType = pipelineResult.turn.responseAction?.type
        ?? "consulting";

      const turn = buildConsultingTurn(
        pipelineResult.turn.question,
        actionType,
        {
          ...pipelineResult.response,
          latencyMs: pipelineResult.response.latencyMs
            || totalLatencyMs,
        },
        pipelineResult.turn.turnId,
      );

      this.state = {
        phase: "completed",
        turns: [
          ...previousTurns,
          turn,
        ],
        activeTurnId: turn.id,
        errorMessage: null,
        awaitingClarification:
          pipelineResult.session.contextMetadata.awaitingClarification,
        activeQuestion: null,
        streamingText: null,
        streamMetadata: {
          analysisLatencyMs,
          firstChunkLatencyMs:
            pipelineResult.response.firstChunkLatencyMs
            ?? firstChunkLatencyMs,
          totalLatencyMs,
          apiCallCount: pipelineResult.response.apiCallCount,
        },
        progressStep: "completed",
      };
      this.emit();
    } catch {
      this.state = {
        ...this.state,
        phase: "error",
        errorMessage: "상담을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        activeQuestion: null,
        streamingText: null,
        streamMetadata: null,
        progressStep: null,
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

export function buildExpectedPhasesForAction(
  actionType: "clarification" | "direct" | "consulting",
  streaming: boolean = true,
): VNextConsultingPhase[] {
  const phases: VNextConsultingPhase[] = ["analyzing"];

  if (actionType === "consulting") {
    phases.push("generating");

    if (streaming) {
      phases.push("streaming");
    }
  }

  if (actionType === "clarification") {
    phases.push("clarifying");
  }

  phases.push("completed");

  return phases;
}

/**
 * 테스트/검증용 — phase 전환 시뮬레이션.
 */
export async function simulateVNextConsultingFlow(
  request: V3ConsultingRequest,
  gateway?: ResponseGateway,
  onPhaseChange?: (phase: VNextConsultingPhase) => void,
): Promise<{
  phases: VNextConsultingPhase[];
  result: VNextConsultingPipelineResult;
}> {
  const phases: VNextConsultingPhase[] = ["idle"];
  const resolvedGateway = gateway ?? createMockResponseGateway();
  let hasStreamed = false;

  onPhaseChange?.("analyzing");
  phases.push("analyzing");

  const {
    runVNextConsultingPipeline,
  } = await import("./vNextConsultingPipeline.js");

  const pipelineResult = await runVNextConsultingPipeline({
    request,
    gateway: resolvedGateway,
    answerMode: "question",
    onGenerating: () => {
      onPhaseChange?.("generating");
      phases.push("generating");
    },
    onStreamEvent: (event) => {
      if (event.type === "delta" && event.text && !hasStreamed) {
        hasStreamed = true;
        onPhaseChange?.("streaming");
        phases.push("streaming");
      }
    },
  });

  if (pipelineResult.actionType === "clarification") {
    onPhaseChange?.("clarifying");
    phases.push("clarifying");
  }

  onPhaseChange?.("completed");
  phases.push("completed");

  return {
    phases,
    result: pipelineResult,
  };
}

/**
 * 테스트/검증용 — multi-turn conversation phase 시뮬레이션.
 */
export async function simulateVNextConversationFlow(
  request: V3ConsultingRequest,
  followUpQuestion: string,
  gateway?: ResponseGateway,
  onPhaseChange?: (phase: VNextConsultingPhase) => void,
): Promise<{
  phases: VNextConsultingPhase[];
  initialResult: VNextConversationPipelineResult;
  followUpResult: VNextConversationPipelineResult;
}> {
  const phases: VNextConsultingPhase[] = ["idle"];
  const resolvedGateway = gateway ?? createMockResponseGateway();
  const {
    createConversationSession,
    runVNextConversationPipeline,
  } = await import("../conversation/conversationPipeline.js");
  let session = createConversationSession();
  let hasStreamed = false;

  const trackPhase = (phase: VNextConsultingPhase) => {
    if (!phases.includes(phase)) {
      phases.push(phase);
    }

    onPhaseChange?.(phase);
  };

  trackPhase("analyzing");

  const initialResult = await runVNextConversationPipeline({
    session,
    question: request.question.trim(),
    input: {
      request,
      gateway: resolvedGateway,
    },
    options: {
      streaming: true,
      answerMode: "question",
      onGenerating: () => trackPhase("generating"),
      onStreamEvent: (event) => {
        if (event.type === "delta" && event.text && !hasStreamed) {
          hasStreamed = true;
          trackPhase("streaming");
        }
      },
    },
  });

  session = initialResult.session;

  if (initialResult.turn.responseAction?.type === "clarification") {
    trackPhase("clarifying");
  }

  trackPhase("completed");

  hasStreamed = false;
  trackPhase("analyzing");

  const followUpResult = await runVNextConversationPipeline({
    session,
    question: followUpQuestion.trim(),
    input: {
      request,
      gateway: resolvedGateway,
    },
    options: {
      streaming: true,
      answerMode: "question",
      onGenerating: () => trackPhase("generating"),
      onStreamEvent: (event) => {
        if (event.type === "delta" && event.text && !hasStreamed) {
          hasStreamed = true;
          trackPhase("streaming");
        }
      },
    },
  });

  trackPhase("completed");

  return {
    phases,
    initialResult,
    followUpResult,
  };
}
