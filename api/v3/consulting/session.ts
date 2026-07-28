import type {
    VercelRequest,
    VercelResponse,
  } from "@vercel/node";

  import {
    handleAuthenticatedInitialConsultingSessionHttpRequest,
  } from "../../../src/v3/consulting/authenticatedInitialConsultingSessionHttpHandler";
  import type {
    AuthenticatedInitialConsultingSessionHttpRequest,
    AuthenticatedInitialConsultingSessionHttpResponse,
  } from "../../../src/v3/consulting/authenticatedInitialConsultingSessionHttpHandler";

  export type V3InitialConsultingSessionApiDependencies = {
    handleRequest(
      request:
        AuthenticatedInitialConsultingSessionHttpRequest,
    ): Promise<AuthenticatedInitialConsultingSessionHttpResponse>;
  };

  const DEFAULT_DEPENDENCIES:
    V3InitialConsultingSessionApiDependencies = {
      handleRequest(
        request:
          AuthenticatedInitialConsultingSessionHttpRequest,
      ) {
        return handleAuthenticatedInitialConsultingSessionHttpRequest(
          request,
        );
      },
    };

  export function createV3InitialConsultingSessionApiHandler(
    dependencies:
      V3InitialConsultingSessionApiDependencies =
        DEFAULT_DEPENDENCIES,
  ) {
    return async function v3InitialConsultingSessionApiHandler(
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

  export default createV3InitialConsultingSessionApiHandler();
