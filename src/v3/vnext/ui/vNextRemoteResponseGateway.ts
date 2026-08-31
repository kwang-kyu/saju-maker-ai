/**
 * vNext Remote Response Gateway.
 *
 * UI는 API key를 알지 않는다. GPT 호출은 서버 프록시를 통해 수행한다.
 */

import {
  createMockResponseGateway,
  type ResponseGateway,
} from "../gpt/responseGateway.js";
import {
  consumeFetchResponseStream,
} from "../gpt/responseStreamUtils.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";
import type {
  ResponseGenerationOptions,
  ResponseGenerationResult,
} from "../gpt/responseGatewayTypes.js";
import type {
  ResponseStreamListener,
} from "../gpt/responseStreamingTypes.js";

export type VNextRemoteGatewayOptions = {
  endpoint?: string;
  streamEndpoint?: string;
  fetchImpl?: typeof fetch;
};

const DEFAULT_ENDPOINT = "/api/v3/vnext/consulting-generate";
const DEFAULT_STREAM_ENDPOINT = "/api/v3/vnext/consulting-stream";

export function createRemoteResponseGateway(
  options: VNextRemoteGatewayOptions = {},
): ResponseGateway {
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
  const streamEndpoint = options.streamEndpoint ?? DEFAULT_STREAM_ENDPOINT;
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async generate(
      prompt: ResponsePrompt,
      genOptions?: ResponseGenerationOptions,
    ): Promise<ResponseGenerationResult> {
      const startedAt = Date.now();

      try {
        const response = await fetchImpl(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            options: genOptions,
          }),
        });

        if (!response.ok) {
          return {
            text: "",
            status: "error",
            latencyMs: Date.now() - startedAt,
            error: {
              code: "remote_gateway_error",
              message: `Remote gateway returned ${response.status}`,
            },
          };
        }

        const body = await response.json() as ResponseGenerationResult;

        return {
          ...body,
          latencyMs: body.latencyMs ?? Date.now() - startedAt,
        };
      } catch (error) {
        return {
          text: "",
          status: "error",
          latencyMs: Date.now() - startedAt,
          error: {
            code: "remote_gateway_network_error",
            message: error instanceof Error
              ? error.message
              : "Remote gateway network error",
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
      let accumulated = "";
      let result: ResponseGenerationResult = {
        text: "",
        status: "error",
        latencyMs: 0,
        error: {
          code: "remote_stream_incomplete",
          message: "Stream ended without completion event",
        },
      };

      try {
        const response = await fetchImpl(streamEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            options: genOptions,
          }),
        });

        if (!response.ok) {
          listener.onEvent({
            type: "error",
            error: {
              code: "remote_gateway_error",
              message: `Remote stream gateway returned ${response.status}`,
            },
          });

          return {
            text: "",
            status: "error",
            latencyMs: Date.now() - startedAt,
            error: {
              code: "remote_gateway_error",
              message: `Remote stream gateway returned ${response.status}`,
            },
          };
        }

        await consumeFetchResponseStream(response, (event) => {
          if (event.type === "delta" && event.text) {
            accumulated += event.text;
          }

          if (event.type === "complete") {
            result = {
              text: event.fullText ?? accumulated,
              status: "success",
              usage: event.usage,
              model: event.model,
              latencyMs: event.latencyMs ?? Date.now() - startedAt,
            };
          }

          if (event.type === "error") {
            result = {
              text: accumulated,
              status: "error",
              latencyMs: event.latencyMs ?? Date.now() - startedAt,
              error: event.error ?? {
                code: "remote_stream_error",
                message: "Remote stream error",
              },
            };
          }

          listener.onEvent(event);
        });

        if (result.status === "success") {
          return {
            ...result,
            text: result.text || accumulated,
            latencyMs: result.latencyMs ?? Date.now() - startedAt,
          };
        }

        return {
          ...result,
          text: accumulated,
          latencyMs: result.latencyMs ?? Date.now() - startedAt,
        };
      } catch (error) {
        listener.onEvent({
          type: "error",
          error: {
            code: "remote_gateway_network_error",
            message: error instanceof Error
              ? error.message
              : "Remote gateway network error",
          },
        });

        return {
          text: accumulated,
          status: "error",
          latencyMs: Date.now() - startedAt,
          error: {
            code: "remote_gateway_network_error",
            message: error instanceof Error
              ? error.message
              : "Remote gateway network error",
          },
        };
      }
    },
  };
}

/**
 * 브라우저 환경에서 사용할 Gateway를 결정한다.
 * mockMode=true이면 Mock Gateway, 아니면 Remote Gateway.
 */
export function resolveBrowserResponseGateway(
  mockMode: boolean,
): ResponseGateway {
  if (mockMode) {
    return createMockResponseGateway();
  }

  return createRemoteResponseGateway();
}
