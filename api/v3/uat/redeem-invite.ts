import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  handleUatInviteRedeemRequest,
} from "../../../src/v3/consulting/subscription/uatInviteRedeemHandler.js";
import type {
  UatInviteRedeemHttpRequest,
  UatInviteRedeemHttpResponse,
} from "../../../src/v3/consulting/subscription/uatInviteRedeemHandler.js";

export type V3UatInviteRedeemApiDependencies = {
  handleRequest(
    request:
      UatInviteRedeemHttpRequest,
  ): Promise<UatInviteRedeemHttpResponse>;
};

const DEFAULT_DEPENDENCIES:
  V3UatInviteRedeemApiDependencies = {
    handleRequest(
      request,
    ) {
      return handleUatInviteRedeemRequest(
        request,
      );
    },
  };

export function createV3UatInviteRedeemApiHandler(
  dependencies:
    V3UatInviteRedeemApiDependencies =
      DEFAULT_DEPENDENCIES,
) {
  return async function v3UatInviteRedeemApiHandler(
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

export default createV3UatInviteRedeemApiHandler();
