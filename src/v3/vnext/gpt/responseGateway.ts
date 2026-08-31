/**
 * vNext Response Gateway.
 *
 * ResponseAction API Gate + Gateway Contract + Mock Gateway.
 */

import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";
import type {
  ResponseAction,
} from "../response/responseContext.js";
import {
  buildClarificationResponse,
  buildConsultingFallback,
  buildDirectResponse,
} from "./responseFallbackBuilder.js";
import {
  serializeValidationIssues,
  validateConsultingResponse,
} from "./responseValidator.js";
import type {
  ResponseStreamEvent,
  ResponseStreamListener,
} from "./responseStreamingTypes.js";
import {
  isStreamingDeltaSafe,
  splitTextIntoStreamChunks,
} from "./responseStreamUtils.js";
import type {
  NaturalConsultingResponse,
  ResponseGatewayCallRecord,
  ResponseGenerationOptions,
  ResponseGenerationResult,
} from "./responseGatewayTypes.js";

export interface ResponseGateway {
  generate(
    prompt: ResponsePrompt,
    options?: ResponseGenerationOptions,
  ): Promise<ResponseGenerationResult>;

  generateStream?(
    prompt: ResponsePrompt,
    options: ResponseGenerationOptions | undefined,
    listener: ResponseStreamListener,
  ): Promise<ResponseGenerationResult>;
}

export type MockResponseGatewayOptions = {
  defaultResponse?: string;
  responsesByScenario?: Record<string, string>;
  simulateError?: boolean;
  simulateTimeout?: boolean;
  simulateStreamErrorAfterChunks?: number;
  simulateValidationFailure?: boolean;
  latencyMs?: number;
  streamChunkDelayMs?: number;
};

const DEFAULT_MOCK_RESPONSE =
  "현재 확인된 분석 결과를 기준으로, 조건과 변화를 함께 고려해 보시는 것이 좋습니다. "
  + "한쪽으로 단정하기보다 시기별 차이와 주의 요소를 균형 있게 살펴보시길 권합니다.";

/**
 * Mock Gateway — 실제 API 호출 없이 Prompt 전달과 metadata를 검증한다.
 */
export function createMockResponseGateway(
  options: MockResponseGatewayOptions = {},
): ResponseGateway & { getCallRecord: () => ResponseGatewayCallRecord } {
  const callRecord: ResponseGatewayCallRecord = {
    promptReceived: false,
    metadataReceived: false,
    callCount: 0,
  };

  return {
    async generate(
      prompt: ResponsePrompt,
      _genOptions?: ResponseGenerationOptions,
    ): Promise<ResponseGenerationResult> {
      const startedAt = Date.now();
      callRecord.callCount += 1;
      callRecord.promptReceived = Boolean(
        prompt.systemInstruction && prompt.userPrompt,
      );
      callRecord.metadataReceived = Boolean(
        prompt.metadata?.scenario && prompt.metadata?.budget,
      );
      callRecord.lastPrompt = {
        systemInstructionLength: prompt.systemInstruction.length,
        userPromptLength: prompt.userPrompt.length,
        scenario: prompt.metadata.scenario,
        budget: prompt.metadata.budget,
      };

      if (options.simulateTimeout) {
        return {
          text: "",
          status: "timeout",
          latencyMs: options.latencyMs ?? Date.now() - startedAt,
          error: {
            code: "timeout",
            message: "Mock gateway timeout",
          },
        };
      }

      if (options.simulateError) {
        return {
          text: "",
          status: "error",
          latencyMs: options.latencyMs ?? Date.now() - startedAt,
          error: {
            code: "mock_error",
            message: "Mock gateway error",
          },
        };
      }

      const scenarioResponse = options.responsesByScenario?.[
        prompt.metadata.scenario
      ];
      const text = scenarioResponse
        ?? options.defaultResponse
        ?? DEFAULT_MOCK_RESPONSE;

      const latencyMs = options.latencyMs ?? Math.max(1, Date.now() - startedAt);

      return {
        text,
        status: "success",
        model: "mock-gpt",
        latencyMs,
        usage: {
          promptTokens: Math.ceil(
            (prompt.systemInstruction.length + prompt.userPrompt.length) / 4,
          ),
          completionTokens: Math.ceil(text.length / 4),
          totalTokens: Math.ceil(
            (prompt.systemInstruction.length + prompt.userPrompt.length + text.length) / 4,
          ),
        },
      };
    },

    async generateStream(
      prompt: ResponsePrompt,
      _genOptions: ResponseGenerationOptions | undefined,
      listener: ResponseStreamListener,
    ): Promise<ResponseGenerationResult> {
      const startedAt = Date.now();
      callRecord.callCount += 1;
      callRecord.promptReceived = Boolean(
        prompt.systemInstruction && prompt.userPrompt,
      );
      callRecord.metadataReceived = Boolean(
        prompt.metadata?.scenario && prompt.metadata?.budget,
      );
      callRecord.lastPrompt = {
        systemInstructionLength: prompt.systemInstruction.length,
        userPromptLength: prompt.userPrompt.length,
        scenario: prompt.metadata.scenario,
        budget: prompt.metadata.budget,
      };

      if (options.simulateTimeout) {
        listener.onEvent({
          type: "error",
          error: {
            code: "timeout",
            message: "Mock gateway timeout",
          },
        });

        return {
          text: "",
          status: "timeout",
          latencyMs: options.latencyMs ?? Date.now() - startedAt,
          error: {
            code: "timeout",
            message: "Mock gateway timeout",
          },
        };
      }

      if (options.simulateError) {
        listener.onEvent({
          type: "start",
          model: "mock-gpt",
        });
        listener.onEvent({
          type: "error",
          error: {
            code: "mock_error",
            message: "Mock gateway error",
          },
        });

        return {
          text: "",
          status: "error",
          latencyMs: options.latencyMs ?? Date.now() - startedAt,
          error: {
            code: "mock_error",
            message: "Mock gateway error",
          },
        };
      }

      const scenarioResponse = options.responsesByScenario?.[
        prompt.metadata.scenario
      ];
      const text = scenarioResponse
        ?? options.defaultResponse
        ?? DEFAULT_MOCK_RESPONSE;
      const chunks = splitTextIntoStreamChunks(text);
      let accumulated = "";
      let firstChunkLatencyMs: number | null = null;

      listener.onEvent({
        type: "start",
        model: "mock-gpt",
      });

      for (let index = 0; index < chunks.length; index += 1) {
        if (
          options.simulateStreamErrorAfterChunks !== undefined
          && index >= options.simulateStreamErrorAfterChunks
        ) {
          listener.onEvent({
            type: "error",
            error: {
              code: "mock_stream_error",
              message: "Mock stream interrupted",
            },
          });

          return {
            text: accumulated,
            status: "error",
            model: "mock-gpt",
            latencyMs: Date.now() - startedAt,
            error: {
              code: "mock_stream_error",
              message: "Mock stream interrupted",
            },
          };
        }

        const delta = chunks[index]!;

        if (firstChunkLatencyMs === null) {
          firstChunkLatencyMs = Date.now() - startedAt;
        }

        accumulated += delta;

        listener.onEvent({
          type: "delta",
          text: delta,
        });

        if (options.streamChunkDelayMs && options.streamChunkDelayMs > 0) {
          await new Promise((resolve) => {
            setTimeout(resolve, options.streamChunkDelayMs);
          });
        }
      }

      const latencyMs = options.latencyMs ?? Math.max(1, Date.now() - startedAt);
      const usage = {
        promptTokens: Math.ceil(
          (prompt.systemInstruction.length + prompt.userPrompt.length) / 4,
        ),
        completionTokens: Math.ceil(text.length / 4),
        totalTokens: Math.ceil(
          (prompt.systemInstruction.length + prompt.userPrompt.length + text.length) / 4,
        ),
      };

      listener.onEvent({
        type: "complete",
        fullText: accumulated,
        usage,
        model: "mock-gpt",
        latencyMs,
        firstChunkLatencyMs: firstChunkLatencyMs ?? undefined,
      });

      if (options.simulateValidationFailure) {
        return {
          text: accumulated,
          status: "success",
          model: "mock-gpt",
          latencyMs,
          usage,
        };
      }

      return {
        text: accumulated,
        status: "success",
        model: "mock-gpt",
        latencyMs,
        usage,
      };
    },

    getCallRecord(): ResponseGatewayCallRecord {
      return { ...callRecord, lastPrompt: callRecord.lastPrompt
        ? { ...callRecord.lastPrompt }
        : undefined };
    },
  };
}

export type GenerateNaturalResponseInput = {
  action: ResponseAction;
  prompt: ResponsePrompt | null;
  gateway: ResponseGateway;
  options?: ResponseGenerationOptions;
};

export type GenerateNaturalResponseStreamingInput =
  GenerateNaturalResponseInput & {
    onStreamEvent?: (event: ResponseStreamEvent) => void;
    analysisLatencyMs?: number;
  };

const MIN_PARTIAL_TEXT_LENGTH = 20;

function emitStreamEvent(
  listener: ResponseStreamListener | undefined,
  event: ResponseStreamEvent,
): void {
  listener?.onEvent(event);
}

function buildFallbackNaturalResponse(
  input: GenerateNaturalResponseInput,
  issues: string[],
  apiCallCount: number,
  latencyMs: number,
  firstChunkLatencyMs?: number | null,
  analysisLatencyMs?: number,
): NaturalConsultingResponse {
  const fallbackText = input.action.context
    ? buildConsultingFallback(input.action.context)
    : buildDirectResponse(input.action);

  return {
    text: fallbackText,
    source: "fallback",
    validated: false,
    validationIssues: issues,
    apiCallCount,
    latencyMs,
    requestId: input.options?.requestId,
    firstChunkLatencyMs,
    analysisLatencyMs,
  };
}

/**
 * ResponseAction API Gate.
 *
 * clarification / direct → GPT 호출 금지
 * consulting → Gateway 1회 호출 → Validation → 실패 시 fallback
 */
export async function generateNaturalConsultingResponse(
  input: GenerateNaturalResponseInput,
): Promise<NaturalConsultingResponse> {
  const requestId = input.options?.requestId;

  if (input.action.type === "clarification") {
    return {
      text: buildClarificationResponse(input.action),
      source: "clarification",
      validated: true,
      apiCallCount: 0,
      latencyMs: 0,
      requestId,
    };
  }

  if (input.action.type === "direct") {
    return {
      text: buildDirectResponse(input.action),
      source: "direct",
      validated: true,
      apiCallCount: 0,
      latencyMs: 0,
      requestId,
    };
  }

  if (!input.prompt || !input.action.context) {
    const fallbackText = input.action.context
      ? buildConsultingFallback(input.action.context)
      : buildDirectResponse(input.action);

    return {
      text: fallbackText,
      source: "fallback",
      validated: false,
      validationIssues: ["missing_prompt_or_context"],
      apiCallCount: 0,
      latencyMs: 0,
      requestId,
    };
  }

  const generation = await input.gateway.generate(
    input.prompt,
    input.options,
  );

  if (
    generation.status === "error"
    || generation.status === "timeout"
    || !generation.text.trim()
  ) {
    return {
      text: buildConsultingFallback(input.action.context),
      source: "fallback",
      validated: false,
      validationIssues: [
        generation.error?.code ?? generation.status,
      ],
      apiCallCount: 1,
      latencyMs: generation.latencyMs,
      requestId,
    };
  }

  const validation = validateConsultingResponse({
    text: generation.text,
    prompt: input.prompt,
  });

  if (!validation.valid) {
    return {
      text: buildConsultingFallback(input.action.context),
      source: "fallback",
      validated: false,
      validationIssues: serializeValidationIssues(validation.issues),
      apiCallCount: 1,
      latencyMs: generation.latencyMs,
      requestId,
    };
  }

  return {
    text: generation.text,
    source: "gpt",
    validated: true,
    apiCallCount: 1,
    latencyMs: generation.latencyMs,
    requestId,
  };
}

/**
 * consulting action일 때 streaming Gateway를 사용한다.
 * clarification / direct → GPT 호출 금지
 * consulting → Gateway 1회 streaming → complete 후 Validation → 실패 시 fallback
 */
export async function generateNaturalConsultingResponseStreaming(
  input: GenerateNaturalResponseStreamingInput,
): Promise<NaturalConsultingResponse> {
  const requestId = input.options?.requestId;
  const streamListener: ResponseStreamListener = {
    onEvent: (event) => {
      input.onStreamEvent?.(event);
    },
  };

  if (input.action.type === "clarification") {
    return {
      text: buildClarificationResponse(input.action),
      source: "clarification",
      validated: true,
      apiCallCount: 0,
      latencyMs: 0,
      requestId,
      analysisLatencyMs: input.analysisLatencyMs,
    };
  }

  if (input.action.type === "direct") {
    return {
      text: buildDirectResponse(input.action),
      source: "direct",
      validated: true,
      apiCallCount: 0,
      latencyMs: 0,
      requestId,
      analysisLatencyMs: input.analysisLatencyMs,
    };
  }

  if (!input.prompt || !input.action.context) {
    return buildFallbackNaturalResponse(
      input,
      ["missing_prompt_or_context"],
      0,
      0,
      null,
      input.analysisLatencyMs,
    );
  }

  const generationStartedAt = Date.now();
  let accumulatedText = "";
  let firstChunkLatencyMs: number | null = null;
  let streamError: ResponseGenerationResult["error"] | undefined;

  const finalizeFromAccumulated = async (
    generation: ResponseGenerationResult,
  ): Promise<NaturalConsultingResponse> => {
    const latencyMs = generation.latencyMs
      ?? Date.now() - generationStartedAt;

    if (
      generation.status === "error"
      || generation.status === "timeout"
      || !accumulatedText.trim()
    ) {
      return buildFallbackNaturalResponse(
        input,
        [
          generation.error?.code ?? generation.status,
        ],
        1,
        latencyMs,
        firstChunkLatencyMs,
        input.analysisLatencyMs,
      );
    }

    const validation = validateConsultingResponse({
      text: accumulatedText,
      prompt: input.prompt!,
    });

    if (!validation.valid) {
      return buildFallbackNaturalResponse(
        input,
        serializeValidationIssues(validation.issues),
        1,
        latencyMs,
        firstChunkLatencyMs,
        input.analysisLatencyMs,
      );
    }

    return {
      text: accumulatedText,
      source: "gpt",
      validated: true,
      apiCallCount: 1,
      latencyMs,
      requestId,
      firstChunkLatencyMs,
      analysisLatencyMs: input.analysisLatencyMs,
    };
  };

  const handleDelta = (delta: string): void => {
    if (!isStreamingDeltaSafe(delta)) {
      return;
    }

    if (firstChunkLatencyMs === null && delta.trim().length > 0) {
      firstChunkLatencyMs = Date.now() - generationStartedAt;
    }

    accumulatedText += delta;
  };

  if (input.gateway.generateStream) {
    const generation = await input.gateway.generateStream(
      input.prompt,
      input.options,
      {
        onEvent: (event) => {
          if (event.type === "delta" && event.text) {
            handleDelta(event.text);
          }

          if (event.type === "error") {
            streamError = event.error;
          }

          if (event.type === "complete") {
            if (event.firstChunkLatencyMs !== undefined) {
              firstChunkLatencyMs = event.firstChunkLatencyMs;
            }
          }

          emitStreamEvent(streamListener, event);
        },
      },
    );

    if (
      generation.status === "error"
      || generation.status === "timeout"
    ) {
      if (accumulatedText.trim().length >= MIN_PARTIAL_TEXT_LENGTH) {
        const partialValidation = validateConsultingResponse({
          text: accumulatedText,
          prompt: input.prompt,
        });

        if (partialValidation.valid) {
          return {
            text: accumulatedText,
            source: "gpt",
            validated: true,
            apiCallCount: 1,
            latencyMs: generation.latencyMs,
            requestId,
            firstChunkLatencyMs,
            analysisLatencyMs: input.analysisLatencyMs,
          };
        }
      }

      return buildFallbackNaturalResponse(
        input,
        [
          generation.error?.code ?? generation.status,
        ],
        1,
        generation.latencyMs,
        firstChunkLatencyMs,
        input.analysisLatencyMs,
      );
    }

    return finalizeFromAccumulated(generation);
  }

  emitStreamEvent(streamListener, {
    type: "start",
    model: "fallback-non-stream",
  });

  const generation = await input.gateway.generate(
    input.prompt,
    input.options,
  );

  if (generation.text) {
    const chunks = splitTextIntoStreamChunks(generation.text);

    for (const delta of chunks) {
      handleDelta(delta);
      emitStreamEvent(streamListener, {
        type: "delta",
        text: delta,
      });
    }
  }

  emitStreamEvent(streamListener, {
    type: "complete",
    fullText: accumulatedText,
    usage: generation.usage,
    model: generation.model,
    latencyMs: generation.latencyMs,
    firstChunkLatencyMs: firstChunkLatencyMs ?? undefined,
  });

  if (
    (generation.status === "error" || generation.status === "timeout")
    && accumulatedText.trim().length >= MIN_PARTIAL_TEXT_LENGTH
  ) {
    const partialValidation = validateConsultingResponse({
      text: accumulatedText,
      prompt: input.prompt,
    });

    if (partialValidation.valid) {
      return {
        text: accumulatedText,
        source: "gpt",
        validated: true,
        apiCallCount: 1,
        latencyMs: generation.latencyMs,
        requestId,
        firstChunkLatencyMs,
        analysisLatencyMs: input.analysisLatencyMs,
      };
    }
  }

  if (streamError) {
    return buildFallbackNaturalResponse(
      input,
      [streamError.code],
      1,
      generation.latencyMs,
      firstChunkLatencyMs,
      input.analysisLatencyMs,
    );
  }

  return finalizeFromAccumulated(generation);
}

/**
 * consulting action일 때만 Gateway.generate를 호출한다.
 */
export async function generateWithActionGate(
  action: ResponseAction,
  prompt: ResponsePrompt | null,
  gateway: ResponseGateway,
  options?: ResponseGenerationOptions,
): Promise<ResponseGenerationResult | null> {
  if (action.type !== "consulting" || !prompt) {
    return null;
  }

  return gateway.generate(prompt, options);
}
