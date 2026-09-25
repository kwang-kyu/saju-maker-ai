/**
 * vNext Report Controller.
 *
 * answerMode="report" 단일 턴 파이프라인 — Conversation Pipeline과 분리한다.
 */

import {
  appendStreamDelta,
} from "../gpt/responseStreamUtils.js";
import {
  createMockResponseGateway,
  generateNaturalConsultingResponseStreaming,
  type ResponseGateway,
} from "../gpt/responseGateway.js";
import type {
  AnalysisResult,
} from "../types/analysisResult.js";
import type {
  ReportAnswerSection,
} from "../types/answerBlueprint.js";
import {
  buildVNextRequestFromBirthContext,
  createVNextBirthContext,
} from "../entry/vNextBirthContext.js";
import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  analyzeVNextConsultingRequest,
} from "../ui/vNextConsultingPipeline.js";
import {
  VNEXT_REPORT_DEFAULT_QUESTION,
} from "./vNextReportCopy.js";
import {
  INITIAL_VNEXT_REPORT_SESSION_STATE,
  type VNextReportSessionState,
} from "./vNextReportState.js";
import type {
  VNextAnalysisProgressStep,
} from "../ui/vNextAnalysisProgress.js";

export type VNextReportControllerOptions = {
  gateway?: ResponseGateway;
  useMockGateway?: boolean;
};

export type VNextReportControllerListener = (
  state: VNextReportSessionState,
) => void;

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function extractReportSections(
  analysisResult: AnalysisResult,
): ReportAnswerSection[] {
  const blueprintStage = analysisResult.answerBlueprint;

  if (
    blueprintStage?.status !== "ready"
    || blueprintStage.value.mode !== "report"
  ) {
    return [];
  }

  return [...blueprintStage.value.sections];
}

export class VNextReportController {
  private state: VNextReportSessionState = {
    ...INITIAL_VNEXT_REPORT_SESSION_STATE,
  };

  private readonly gateway: ResponseGateway;

  private readonly listeners = new Set<VNextReportControllerListener>();

  constructor(
    options: VNextReportControllerOptions = {},
  ) {
    if (options.gateway) {
      this.gateway = options.gateway;
    } else if (options.useMockGateway ?? true) {
      this.gateway = createMockResponseGateway();
    } else {
      throw new Error(
        "VNextReportController requires gateway or useMockGateway.",
      );
    }
  }

  getState(): VNextReportSessionState {
    return this.state;
  }

  subscribe(
    listener: VNextReportControllerListener,
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.state = {
      ...INITIAL_VNEXT_REPORT_SESSION_STATE,
    };
    this.emit();
  }

  /**
   * Error 상태에서만 동일 birthProfile로 report generation을 재실행한다.
   */
  async retryReport(
    birthProfile: VNextBirthProfile,
  ): Promise<void> {
    if (this.state.phase !== "error") {
      return;
    }

    this.reset();
    await this.startReport(birthProfile);
  }

  /**
   * Completed 상태에서만 session을 초기화하고 새 report를 시작한다.
   * Entry birthProfile은 호출측에서 유지한다.
   */
  async restartReport(
    birthProfile: VNextBirthProfile,
  ): Promise<void> {
    if (this.state.phase !== "completed") {
      return;
    }

    this.reset();
    await this.startReport(birthProfile);
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

  async startReport(
    birthProfile: VNextBirthProfile,
  ): Promise<void> {
    if (this.state.phase !== "idle") {
      return;
    }

    const request = buildVNextRequestFromBirthContext(
      createVNextBirthContext(birthProfile),
      VNEXT_REPORT_DEFAULT_QUESTION,
      getTodayIsoDate(),
      { answerMode: "report" },
    );

    this.state = {
      ...INITIAL_VNEXT_REPORT_SESSION_STATE,
      phase: "analyzing",
      errorMessage: null,
      streamingText: null,
      streamMetadata: null,
      progressStep: "birthInputValidated",
    };
    this.emit();

    const pipelineStartedAt = Date.now();
    let streamingText = "";
    let firstChunkLatencyMs: number | null = null;
    let hasEnteredStreaming = false;

    try {
      const analysis = analyzeVNextConsultingRequest(
        request,
        "report",
        {
          onProgress: (step) => {
            this.updateProgressStep(step);
          },
        },
      );
      const sections = extractReportSections(
        analysis.analysisResult,
      );
      const analysisLatencyMs = Date.now() - pipelineStartedAt;

      if (analysis.action.type === "consulting") {
        this.state = {
          ...this.state,
          phase: "generating",
          sections,
          activeSection: sections[0] ?? null,
          progressStep: "generating",
        };
        this.emit();
      } else {
        this.state = {
          ...this.state,
          sections,
          activeSection: sections[0] ?? null,
        };
        this.emit();
      }

      const response = await generateNaturalConsultingResponseStreaming({
        action: analysis.action,
        prompt: analysis.prompt,
        gateway: this.gateway,
        analysisLatencyMs,
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
      });

      const totalLatencyMs = Date.now() - pipelineStartedAt;

      this.state = {
        phase: "completed",
        sections,
        activeSection: sections[0] ?? null,
        response: {
          ...response,
          latencyMs: response.latencyMs
            || totalLatencyMs,
        },
        actionType: analysis.action.type,
        streamingText: null,
        errorMessage: null,
        streamMetadata: {
          analysisLatencyMs,
          firstChunkLatencyMs:
            response.firstChunkLatencyMs
            ?? firstChunkLatencyMs,
          totalLatencyMs,
          apiCallCount: response.apiCallCount,
        },
        progressStep: "completed",
      };
      this.emit();
    } catch {
      this.state = {
        ...this.state,
        phase: "error",
        errorMessage: "리포트를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        streamingText: null,
        streamMetadata: null,
        progressStep: null,
      };
      this.emit();
    }
  }

  setActiveSection(
    section: ReportAnswerSection,
  ): void {
    if (!this.state.sections.includes(section)) {
      return;
    }

    this.state = {
      ...this.state,
      activeSection: section,
    };
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
