import type {
    VercelRequest,
    VercelResponse,
  } from "@vercel/node";

  import {
    handleAuthenticatedConsultingSessionTurnHttpRequest,
  } from "../../../src/v3/consulting/authenticatedConsultingSessionTurnHttpHandler";
  import type {
    AuthenticatedConsultingSessionTurnHttpRequest,
    AuthenticatedConsultingSessionTurnHttpResponse,
  } from "../../../src/v3/consulting/authenticatedConsultingSessionTurnHttpHandler";

  export type V3ConsultingSessionTurnApiDependencies = {
    handleRequest(
      request:
        AuthenticatedConsultingSessionTurnHttpRequest,
    ): Promise<AuthenticatedConsultingSessionTurnHttpResponse>;
  };

  const DEFAULT_DEPENDENCIES:
    V3ConsultingSessionTurnApiDependencies = {
      handleRequest(
        request:
          AuthenticatedConsultingSessionTurnHttpRequest,
      ) {
        return handleAuthenticatedConsultingSessionTurnHttpRequest(
          request,
        );
      },
    };

  export function createV3ConsultingSessionTurnApiHandler(
    dependencies:
      V3ConsultingSessionTurnApiDependencies =
        DEFAULT_DEPENDENCIES,
  ) {
    return async function v3ConsultingSessionTurnApiHandler(
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

  export default createV3ConsultingSessionTurnApiHandler();
