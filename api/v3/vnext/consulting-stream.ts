import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  assertVNextConsultingAuthenticated,
} from "../../../src/v3/vnext/gpt/assertVNextConsultingAuthenticated.js";
import {
  assertVNextConsultingEntitled,
} from "../../../src/v3/vnext/gpt/assertVNextConsultingEntitled.js";
import {
  createOpenAIResponseGateway,
  isOpenAIResponseGatewayAvailable,
} from "../../../src/v3/vnext/gpt/responseGatewayAdapter.js";
import {
  createMockResponseGateway,
} from "../../../src/v3/vnext/gpt/responseGateway.js";
import {
  formatSseEvent,
} from "../../../src/v3/vnext/gpt/responseStreamUtils.js";
import type {
  ResponsePrompt,
} from "../../../src/v3/vnext/types/responsePrompt.js";
import type {
  ResponseGenerationOptions,
} from "../../../src/v3/vnext/gpt/responseGatewayTypes.js";

type ConsultingStreamRequestBody = {
  prompt?: ResponsePrompt;
  options?: ResponseGenerationOptions;
};

export async function handleVNextConsultingStreamRequest(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({
      error: "Method not allowed",
    });
    return;
  }

  const authResult = await assertVNextConsultingAuthenticated({
    authorizationHeader: request.headers.authorization,
    environment: process.env,
  });

  if (!authResult.ok) {
    response.status(authResult.status).json({
      error: authResult.error,
    });
    return;
  }

  const entitlementResult = await assertVNextConsultingEntitled({
    ownerId: authResult.ownerId,
    environment: process.env,
  });

  if (!entitlementResult.ok) {
    response.status(entitlementResult.status).json({
      error: entitlementResult.error,
    });
    return;
  }

  const body = request.body as ConsultingStreamRequestBody | undefined;

  if (
    !body?.prompt?.systemInstruction
    || !body.prompt.userPrompt
  ) {
    response.status(400).json({
      error: "prompt with systemInstruction and userPrompt is required",
    });
    return;
  }

  const gateway = isOpenAIResponseGatewayAvailable()
    ? createOpenAIResponseGateway()
    : createMockResponseGateway();

  if (!gateway.generateStream) {
    response.status(500).json({
      error: "Streaming gateway is unavailable",
    });
    return;
  }

  response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");

  await gateway.generateStream(
    body.prompt,
    body.options,
    {
      onEvent: (event) => {
        response.write(formatSseEvent(event));
      },
    },
  );

  response.end();
}

export default handleVNextConsultingStreamRequest;
