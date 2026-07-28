import {
    createClient,
  } from "@supabase/supabase-js";

  import {
    InvalidConsultingSessionOwnerIdError,
  } from "./consultingSessionOwnerId";
  import {
    SupabaseConsultingSessionAuthenticationError,
    SupabaseConsultingSessionOwnerResolver,
  } from "./supabaseConsultingSessionOwnerResolver";

  export type SupabaseConsultingSessionOwnerResolverVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  type VerificationResponse = {
    status:
      number;

    body:
      unknown;
  };

  type CapturedAuthRequest = {
    url:
      string;

    method:
      string;

    authorization:
      string | null;
  };

  function createVerificationResolver(
    response:
      VerificationResponse,
    requests:
      CapturedAuthRequest[],
  ): SupabaseConsultingSessionOwnerResolver {
    const verificationFetch =
      async (
        input:
          RequestInfo | URL,
        init?:
          RequestInit,
      ): Promise<Response> => {
        const request =
          input
          instanceof Request
            ? input
            : null;

        const headers =
          new Headers(
            request
              ?.headers
            ?? init
              ?.headers,
          );

        requests.push({
          url:
            request
              ?.url
            ?? input.toString(),

          method:
            request
              ?.method
            ?? init
              ?.method
            ?? "GET",

          authorization:
            headers.get(
              "authorization",
            ),
        });

        return new Response(
          JSON.stringify(
            response.body,
          ),
          {
            status:
              response.status,

            headers: {
              "Content-Type":
                "application/json",
            },
          },
        );
      };

    const client =
      createClient(
        "https://verification.supabase.co",
        "verification-publishable-key",
        {
          auth: {
            autoRefreshToken:
              false,

            detectSessionInUrl:
              false,

            persistSession:
              false,
          },

          global: {
            fetch:
              verificationFetch,
          },
        },
      );

    return new SupabaseConsultingSessionOwnerResolver(
      client,
    );
  }

  async function captureAsyncError(
    action:
      () => Promise<unknown>,
  ): Promise<unknown> {
    try {
      await action();

      return null;
    } catch (
      error
    ) {
      return error;
    }
  }

  export async function verifySupabaseConsultingSessionOwnerResolver():
    Promise<SupabaseConsultingSessionOwnerResolverVerificationResult> {
    const canonicalOwnerId =
      "11111111-1111-4111-8111-111111111111";

    const successfulRequests:
      CapturedAuthRequest[] = [];

    const successfulResolver =
      createVerificationResolver(
        {
          status:
            200,

          body: {
            id:
              canonicalOwnerId.toUpperCase(),

            aud:
              "authenticated",

            role:
              "authenticated",

            email:
              "verification@example.com",

            created_at:
              "2026-07-28T15:00:00.000Z",

            updated_at:
              "2026-07-28T15:00:00.000Z",
          },
        },
        successfulRequests,
      );

    const resolvedOwnerId =
      await successfulResolver
        .resolveOwnerId(
          "verified-access-token",
        );

    const failedRequests:
      CapturedAuthRequest[] = [];

    const failedResolver =
      createVerificationResolver(
        {
          status:
            401,

          body: {
            code:
              "bad_jwt",

            message:
              "Invalid JWT",
          },
        },
        failedRequests,
      );

    const authenticationError =
      await captureAsyncError(
        () =>
          failedResolver
            .resolveOwnerId(
              "invalid-access-token",
            ),
      );

      let missingUserCallCount =
      0;

    const missingUserResolver =
      new SupabaseConsultingSessionOwnerResolver(
        successfulResolver.client,
        async (
          accessToken:
            string,
        ) => {
          missingUserCallCount +=
            1;

          return {
            data: {
              user:
                null,
            },

            error:
              accessToken
              === "missing-user-token"
                ? null
                : {
                  code:
                    "UNEXPECTED_TOKEN",
                },
          };
        },
      );

    const missingUserError =
      await captureAsyncError(
        () =>
          missingUserResolver
            .resolveOwnerId(
              "missing-user-token",
            ),
      );

    const invalidOwnerRequests:
      CapturedAuthRequest[] = [];

    const invalidOwnerResolver =
      createVerificationResolver(
        {
          status:
            200,

          body: {
            id:
              "not-a-canonical-uuid",

            aud:
              "authenticated",

            role:
              "authenticated",

            created_at:
              "2026-07-28T15:00:00.000Z",

            updated_at:
              "2026-07-28T15:00:00.000Z",
          },
        },
        invalidOwnerRequests,
      );

    const invalidOwnerError =
      await captureAsyncError(
        () =>
          invalidOwnerResolver
            .resolveOwnerId(
              "invalid-owner-token",
            ),
      );

    const checks = {
      authEndpointIsCalledExactlyOnce:
        successfulRequests
          .length
        === 1,

      authUserEndpointIsUsed:
        successfulRequests[0]
          ?.url
          .includes(
            "/auth/v1/user",
          )
        === true,

      authRequestUsesGet:
        successfulRequests[0]
          ?.method
        === "GET",

      accessTokenIsDeliveredAsBearerToken:
        successfulRequests[0]
          ?.authorization
        === "Bearer verified-access-token",

      authenticatedUserIdIsReturned:
        resolvedOwnerId
          .value
        === canonicalOwnerId,

      authenticatedUserIdIsNormalized:
        resolvedOwnerId
          .toString()
        === canonicalOwnerId,

      authenticationFailureUsesTypedError:
        authenticationError
        instanceof SupabaseConsultingSessionAuthenticationError
        && authenticationError
          .reason
        === "authenticationFailed",

      failedAuthenticationCallsAuthOnce:
        failedRequests
          .length
        === 1,

      missingAuthenticatedUserUsesTypedError:
        missingUserError
        instanceof SupabaseConsultingSessionAuthenticationError
        && missingUserError
          .reason
        === "missingAuthenticatedUser",

        missingUserCallsAuthOnce:
        missingUserCallCount
        === 1,

      invalidAuthenticatedUserIdIsRejected:
        invalidOwnerError
        instanceof InvalidConsultingSessionOwnerIdError,

      invalidOwnerCallsAuthOnce:
        invalidOwnerRequests
          .length
        === 1,
    };

    return {
      checks,

      passed:
        Object
          .values(
            checks,
          )
          .every(
            Boolean,
          ),
    };
  }
