/**
 * vNext OpenAI Gateway Adapter.
 *
 * 기존 v3 consulting OpenAI adapter를 수정하지 않고
 * vNext ResponsePrompt → OpenAI 호출을 독립 구현한다.
 */

import OpenAI from "openai";

import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";
import type {
  ResponseGateway,
} from "./responseGateway.js";
import type {
  ResponseGenerationOptions,
  ResponseGenerationResult,
} from "./responseGatewayTypes.js";
import type {
  ResponseStreamListener,
} from "./responseStreamingTypes.js";

const DEFAULT_MODEL = "gpt-5.5";
const DEFAULT_TIMEOUT_MS = 60_000;

export type VNextOpenAIRequest = {
  model: string;
  systemPrompt: string;
  userPrompt: string;
};

export function buildVNextOpenAIRequest(
  prompt: ResponsePrompt,
  model: string = DEFAULT_MODEL,
): VNextOpenAIRequest {
  return {
    model,
    systemPrompt: prompt.systemInstruction,
    userPrompt: prompt.userPrompt,
  };
}

export type OpenAIResponseGatewayOptions = {
  model?: string;
  apiKey?: string;
  defaultTimeoutMs?: number;
};

async function callOpenAIWithTimeout(
  client: OpenAI,
  request: VNextOpenAIRequest,
  timeoutMs: number,
): Promise<{ text: string; model: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await client.responses.create(
      {
        model: request.model,
        input: [
          {
            role: "system",
            content: request.systemPrompt,
          },
          {
            role: "user",
            content: request.userPrompt,
          },
        ],
      },
      { signal: controller.signal },
    );

    return {
      text: response.output_text ?? "",
      model: request.model,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * OpenAI Response Gateway — 서버 환경에서만 사용한다.
 * API key는 process.env.OPENAI_API_KEY를 따른다.
 */
export function createOpenAIResponseGateway(
  options: OpenAIResponseGatewayOptions = {},
): ResponseGateway {
  const model = options.model ?? DEFAULT_MODEL;
  const defaultTimeoutMs = options.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;

  const client = new OpenAI({
    apiKey: options.apiKey ?? process.env.OPENAI_API_KEY,
  });

  return {
    async generate(
      prompt: ResponsePrompt,
      genOptions?: ResponseGenerationOptions,
    ): Promise<ResponseGenerationResult> {
      const startedAt = Date.now();
      const timeoutMs = genOptions?.timeout ?? defaultTimeoutMs;
      const request = buildVNextOpenAIRequest(prompt, model);

      try {
        const result = await callOpenAIWithTimeout(
          client,
          request,
          timeoutMs,
        );

        return {
          text: result.text,
          status: "success",
          model: result.model,
          latencyMs: Date.now() - startedAt,
        };
      } catch (error) {
        const isTimeout = error instanceof Error
          && (error.name === "AbortError" || error.message.includes("abort"));

        return {
          text: "",
          status: isTimeout ? "timeout" : "error",
          latencyMs: Date.now() - startedAt,
          error: {
            code: isTimeout ? "timeout" : "openai_error",
            message: error instanceof Error ? error.message : "Unknown OpenAI error",
          },
        };
      }
    },

    async generateStream(
      prompt: ResponsePrompt,
      genOptions: ResponseGenerationOptions | undefined,
      listener: ResponseStreamListener,
    ): Promise<ResponseGenerationResult> {
      const startedAt = Date.now();
      const timeoutMs = genOptions?.timeout ?? defaultTimeoutMs;
      const request = buildVNextOpenAIRequest(prompt, model);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let accumulated = "";
      let firstChunkLatencyMs: number | null = null;

      listener.onEvent({
        type: "start",
        model: request.model,
      });

      try {
        const stream = await client.responses.create(
          {
            model: request.model,
            input: [
              {
                role: "system",
                content: request.systemPrompt,
              },
              {
                role: "user",
                content: request.userPrompt,
              },
            ],
            stream: true,
          },
          {
            signal: controller.signal,
          },
        );

        for await (const event of stream) {
          if (event.type === "response.output_text.delta") {
            const delta = event.delta ?? "";

            if (delta) {
              if (firstChunkLatencyMs === null) {
                firstChunkLatencyMs = Date.now() - startedAt;
              }

              accumulated += delta;

              listener.onEvent({
                type: "delta",
                text: delta,
              });
            }
          }
        }

        const latencyMs = Date.now() - startedAt;

        listener.onEvent({
          type: "complete",
          fullText: accumulated,
          model: request.model,
          latencyMs,
          firstChunkLatencyMs: firstChunkLatencyMs ?? undefined,
        });

        return {
          text: accumulated,
          status: "success",
          model: request.model,
          latencyMs,
        };
      } catch (error) {
        const isTimeout = error instanceof Error
          && (error.name === "AbortError" || error.message.includes("abort"));
        const latencyMs = Date.now() - startedAt;

        listener.onEvent({
          type: "error",
          error: {
            code: isTimeout ? "timeout" : "openai_error",
            message: error instanceof Error ? error.message : "Unknown OpenAI error",
          },
        });

        return {
          text: accumulated,
          status: isTimeout ? "timeout" : "error",
          latencyMs,
          error: {
            code: isTimeout ? "timeout" : "openai_error",
            message: error instanceof Error ? error.message : "Unknown OpenAI error",
          },
        };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

/**
 * OpenAI Gateway 사용 가능 여부 — API key 존재 확인.
 */
export function isOpenAIResponseGatewayAvailable(
  apiKey?: string,
): boolean {
  const key = apiKey ?? process.env.OPENAI_API_KEY;
  return Boolean(key && key.trim().length > 0);
}
