import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  handleUatPremiumGrantRequest,
} from "../../../src/v3/consulting/subscription/uatPremiumGrantHandler.js";
import type {
  UatPremiumGrantHttpRequest,
  UatPremiumGrantHttpResponse,
} from "../../../src/v3/consulting/subscription/uatPremiumGrantHandler.js";

export type V3UatPremiumGrantApiDependencies = {
  handleRequest(
    request:
      UatPremiumGrantHttpRequest,
  ): Promise<UatPremiumGrantHttpResponse>;
};

const DEFAULT_DEPENDENCIES:
  V3UatPremiumGrantApiDependencies = {
    handleRequest(
      request,
    ) {
      return handleUatPremiumGrantRequest(
        request,
      );
    },
  };

export function createV3UatPremiumGrantApiHandler(
  dependencies:
    V3UatPremiumGrantApiDependencies =
      DEFAULT_DEPENDENCIES,
) {
  return async function v3UatPremiumGrantApiHandler(
    request:
      VercelRequest,
    response:
      VercelResponse,
  ): Promise<void> {
    const result =
      await dependencies
        .handleRequest({
          method:
            request.method,

          authorizationHeader:
            request.headers.authorization,

          body:
            request.body,

          environment:
            process.env,
        });

    if (
      result.status
      === 405
    ) {
      response.setHeader(
        "Allow",
        "POST",
      );
    }

    response
      .status(
        result.status,
      )
      .json(
        result.body,
      );
  };
}

export default createV3UatPremiumGrantApiHandler();
