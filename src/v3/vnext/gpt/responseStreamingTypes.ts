/**
 * vNext GPT Streaming 계약.
 *
 * OpenAI 고유 event format은 UI에 노출하지 않는다.
 * ResponseGateway → Normalized ResponseStreamEvent → Controller → React UI.
 */

import type {
  ResponseGenerationError,
  ResponseGenerationUsage,
} from "./responseGatewayTypes.js";

export type ResponseStreamEventType =
  | "start"
  | "delta"
  | "complete"
  | "error";

export type ResponseStreamEvent = {
  type: ResponseStreamEventType;
  /** delta 이벤트일 때 증분 텍스트 */
  text?: string;
  /** complete 이벤트일 때 누적 전체 텍스트 */
  fullText?: string;
  usage?: ResponseGenerationUsage;
  model?: string;
  latencyMs?: number;
  firstChunkLatencyMs?: number;
  error?: ResponseGenerationError;
};

export type ResponseStreamListener = {
  onEvent: (event: ResponseStreamEvent) => void;
};

/** @deprecated STEP 5B 이후 ResponseStreamEvent 사용 */
export type ResponseStreamChunk = {
  delta: string;
  index: number;
  finished: boolean;
};

/** @deprecated STEP 5B 이후 ResponseStreamListener 사용 */
export type ResponseStreamHandler = {
  onChunk: (chunk: ResponseStreamChunk) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
};

/** @deprecated STEP 5B 이후 generateStream 사용 */
export type ResponseStreamingOptions = {
  streaming: true;
  streamHandler: ResponseStreamHandler;
};

export type ResponseStreamMetadata = {
  analysisLatencyMs: number;
  firstChunkLatencyMs: number | null;
  totalLatencyMs: number;
  apiCallCount: number;
};
