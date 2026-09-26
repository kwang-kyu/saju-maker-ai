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

  /**
   * Optional Supabase access token getter for Remote API Authorization.
   * Callers supply the token; this gateway does not read storage itself.
   */
  getAccessToken?: () => string | null;

};



export const VNEXT_CONSULTING_GENERATE_ENDPOINT =
  "/api/v3/vnext/consulting-generate";

export const VNEXT_CONSULTING_STREAM_ENDPOINT =
  "/api/v3/vnext/consulting-stream";

export const VNEXT_REPORT_GENERATE_ENDPOINT =
  "/api/v3/vnext/report-generate";

export const VNEXT_REPORT_STREAM_ENDPOINT =
  "/api/v3/vnext/report-stream";

const DEFAULT_ENDPOINT = VNEXT_CONSULTING_GENERATE_ENDPOINT;

const DEFAULT_STREAM_ENDPOINT = VNEXT_CONSULTING_STREAM_ENDPOINT;

function readVNextUrlSearchParams(
  location: Pick<Location, "hash" | "search">,
): URLSearchParams {
  const hashQuery = location.hash.includes("?")
    ? location.hash.split("?")[1]
    : "";

  return new URLSearchParams(
    hashQuery || location.search.replace(/^\?/, ""),
  );
}

/**
 * Mock Gateway opt-in — verification/로컬 테스트 전용.
 * #v3?vnext=1&mock=1 또는 mockGateway=1 일 때만 true.
 */
export function isVNextMockGatewayEnabled(
  location: Pick<Location, "hash" | "search"> = globalThis.location,
): boolean {
  const params = readVNextUrlSearchParams(location);

  return params.get("mock") === "1"
    || params.get("mockGateway") === "1";
}

export function resolveBrowserGatewayMockMode(
  mockGateway?: boolean,
  location: Pick<Location, "hash" | "search"> = globalThis.location,
): boolean {
  return mockGateway ?? isVNextMockGatewayEnabled(location);
}

function buildRemoteRequestHeaders(
  getAccessToken?: () => string | null,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const accessToken = getAccessToken?.();

  if (typeof accessToken === "string" && accessToken.length > 0) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}



function buildRemoteGatewayHttpError(

  response: Response,

  body: unknown,

  kind: "generate" | "stream",

): { code: string; message: string } {

  const statusMessage = kind === "stream"

    ? `Remote stream gateway returned ${response.status}`

    : `Remote gateway returned ${response.status}`;



  if (

    body

    && typeof body === "object"

    && "error" in body

    && typeof (body as { error: unknown }).error === "string"

    && (body as { error: string }).error.trim().length > 0

  ) {

    return {

      code: (body as { error: string }).error.trim(),

      message: statusMessage,

    };

  }



  return {

    code: "remote_gateway_error",

    message: statusMessage,

  };

}



async function readRemoteErrorBody(

  response: Response,

): Promise<unknown> {

  try {

    return await response.json();

  } catch {

    return null;

  }

}


export function createRemoteResponseGateway(

  options: VNextRemoteGatewayOptions = {},

): ResponseGateway {

  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;

  const streamEndpoint = options.streamEndpoint ?? DEFAULT_STREAM_ENDPOINT;

  const fetchImpl = options.fetchImpl ?? fetch;

  const getAccessToken = options.getAccessToken;



  return {

    async generate(

      prompt: ResponsePrompt,

      genOptions?: ResponseGenerationOptions,

    ): Promise<ResponseGenerationResult> {

      const startedAt = Date.now();



      try {

        const response = await fetchImpl(endpoint, {

          method: "POST",

          headers: buildRemoteRequestHeaders(getAccessToken),

          body: JSON.stringify({

            prompt,

            options: genOptions,

          }),

        });



                if (!response.ok) {

          const errorBody = await readRemoteErrorBody(response);

          const remoteError = buildRemoteGatewayHttpError(

            response,

            errorBody,

            "generate",

          );



          return {

            text: "",

            status: "error",

            latencyMs: Date.now() - startedAt,

            error: remoteError,

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

          headers: buildRemoteRequestHeaders(getAccessToken),

          body: JSON.stringify({

            prompt,

            options: genOptions,

          }),

        });



                if (!response.ok) {

          const errorBody = await readRemoteErrorBody(response);

          const remoteError = buildRemoteGatewayHttpError(

            response,

            errorBody,

            "stream",

          );



          listener.onEvent({

            type: "error",

            error: remoteError,

          });



          return {

            text: "",

            status: "error",

            latencyMs: Date.now() - startedAt,

            error: remoteError,

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
 * mockMode=true이면 Mock Gateway(verification 전용), 아니면 Remote Gateway.
 */

export function resolveBrowserResponseGateway(

  mockMode: boolean,

): ResponseGateway {

  if (mockMode) {

    return createMockResponseGateway();

  }



  return createRemoteResponseGateway();

}
