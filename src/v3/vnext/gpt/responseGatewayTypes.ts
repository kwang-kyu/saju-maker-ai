/**
 * vNext Response Gateway 계약.
 *
 * OpenAI에 직접 의존하지 않는 GPT 호출 인터페이스.
 */

import type {
  PromptBudgetLevel,
} from "../types/responsePrompt.js";

export type ResponseGenerationStatus =
  | "success"
  | "error"
  | "timeout"
  | "skipped";

export type ResponseGenerationUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type ResponseGenerationError = {
  code: string;
  message: string;
};

export type ResponseGenerationOptions = {
  budget?: PromptBudgetLevel;
  streaming?: boolean;
  timeout?: number;
  requestId?: string;
};

export type ResponseGenerationResult = {
  text: string;
  status: ResponseGenerationStatus;
  usage?: ResponseGenerationUsage;
  model?: string;
  latencyMs: number;
  error?: ResponseGenerationError;
};

export type NaturalConsultingResponseSource =
  | "gpt"
  | "fallback"
  | "direct"
  | "clarification";

/**
 * 최종 자연어 상담 응답 — UI 전달 직전 계약.
 */
export type NaturalConsultingResponse = {
  text: string;
  source: NaturalConsultingResponseSource;
  validated: boolean;
  validationIssues?: string[];
  apiCallCount: number;
  latencyMs: number;
  requestId?: string;
  firstChunkLatencyMs?: number | null;
  analysisLatencyMs?: number;
};

export type ResponseGatewayCallRecord = {
  promptReceived: boolean;
  metadataReceived: boolean;
  callCount: number;
  lastPrompt?: {
    systemInstructionLength: number;
    userPromptLength: number;
    scenario: string;
    budget: string;
  };
};
