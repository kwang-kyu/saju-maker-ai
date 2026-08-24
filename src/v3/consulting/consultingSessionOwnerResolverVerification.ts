import {
    parseConsultingSessionOwnerId,
  } from "./consultingSessionOwnerId.js";
  import {
    ConsultingSessionAuthenticationError,
    parseConsultingSessionBearerToken,
    resolveConsultingSessionOwner,
  } from "./consultingSessionOwnerResolver.js";
  import type {
    ConsultingSessionOwnerResolver,
  } from "./consultingSessionOwnerResolver.js";

  export type ConsultingSessionOwnerResolverVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  function captureError(
    action:
      () => unknown,
  ): unknown {
    try {
      action();

      return null;
    } catch (
      error
    ) {
      return error;
    }
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

  export async function verifyConsultingSessionOwnerResolver():
    Promise<ConsultingSessionOwnerResolverVerificationResult> {
    const ownerId =
      parseConsultingSessionOwnerId(
        "11111111-1111-4111-8111-111111111111",
      );

    const standardToken =
      parseConsultingSessionBearerToken(
        "Bearer verification-access-token",
      );

    const lowercaseSchemeToken =
      parseConsultingSessionBearerToken(
        "bearer lowercase-scheme-token",
      );

    const normalizedToken =
      parseConsultingSessionBearerToken(
        "  Bearer   trimmed-token   ",
      );

    const missingAuthorizationError =
      captureError(
        () =>
          parseConsultingSessionBearerToken(
            undefined,
          ),
      );

    const emptyAuthorizationError =
      captureError(
        () =>
          parseConsultingSessionBearerToken(
            "   ",
          ),
      );

    const multipleAuthorizationError =
      captureError(
        () =>
          parseConsultingSessionBearerToken([
            "Bearer first-token",
            "Bearer second-token",
          ]),
      );

    const unsupportedSchemeError =
      captureError(
        () =>
          parseConsultingSessionBearerToken(
            "Basic credentials",
          ),
      );

    const missingSeparatorError =
      captureError(
        () =>
          parseConsultingSessionBearerToken(
            "Bearer",
          ),
      );

    const emptyTokenError =
      captureError(
        () =>
          parseConsultingSessionBearerToken(
            "Bearer   ",
          ),
      );

    const tokenWithWhitespaceError =
      captureError(
        () =>
          parseConsultingSessionBearerToken(
            "Bearer first-token second-token",
          ),
      );

    const deliveredTokens:
      string[] = [];

    const resolver:
      ConsultingSessionOwnerResolver = {
        async resolveOwnerId(
          accessToken:
            string,
        ) {
          deliveredTokens.push(
            accessToken,
          );

          return ownerId;
        },
      };

    const resolvedOwnerId =
      await resolveConsultingSessionOwner({
        authorizationHeader:
          "Bearer verified-owner-token",

        resolver,
      });

    let rejectedRequestCallCount =
      0;

    const resolverForRejectedRequest:
      ConsultingSessionOwnerResolver = {
        async resolveOwnerId() {
          rejectedRequestCallCount +=
            1;

          return ownerId;
        },
      };

    const rejectedRequestError =
      await captureAsyncError(
        () =>
          resolveConsultingSessionOwner({
            authorizationHeader:
              "Basic rejected-token",

            resolver:
              resolverForRejectedRequest,
          }),
      );

    const resolverFailure =
      new Error(
        "Verification resolver failure.",
      );

    const failingResolver:
      ConsultingSessionOwnerResolver = {
        async resolveOwnerId() {
          throw resolverFailure;
        },
      };

    const propagatedResolverError =
      await captureAsyncError(
        () =>
          resolveConsultingSessionOwner({
            authorizationHeader:
              "Bearer resolver-failure-token",

            resolver:
              failingResolver,
          }),
      );

    const checks = {
      standardBearerTokenIsParsed:
        standardToken
        === "verification-access-token",

      lowercaseBearerSchemeIsAccepted:
        lowercaseSchemeToken
        === "lowercase-scheme-token",

      surroundingWhitespaceIsRemoved:
        normalizedToken
        === "trimmed-token",

      missingAuthorizationIsRejected:
        missingAuthorizationError
        instanceof ConsultingSessionAuthenticationError
        && missingAuthorizationError
          .reason
        === "missingAuthorization",

      emptyAuthorizationIsRejected:
        emptyAuthorizationError
        instanceof ConsultingSessionAuthenticationError
        && emptyAuthorizationError
          .reason
        === "missingAuthorization",

      multipleAuthorizationValuesAreRejected:
        multipleAuthorizationError
        instanceof ConsultingSessionAuthenticationError
        && multipleAuthorizationError
          .reason
        === "multipleAuthorizationValues",

      unsupportedSchemeIsRejected:
        unsupportedSchemeError
        instanceof ConsultingSessionAuthenticationError
        && unsupportedSchemeError
          .reason
        === "unsupportedAuthorizationScheme",

        bearerWithoutTokenIsRejected:
        missingSeparatorError
        instanceof ConsultingSessionAuthenticationError
        && missingSeparatorError
          .reason
        === "missingAccessToken",

      emptyAccessTokenIsRejected:
        emptyTokenError
        instanceof ConsultingSessionAuthenticationError
        && emptyTokenError
          .reason
        === "missingAccessToken",

      tokenContainingWhitespaceIsRejected:
        tokenWithWhitespaceError
        instanceof ConsultingSessionAuthenticationError
        && tokenWithWhitespaceError
          .reason
        === "missingAccessToken",

      resolverIsCalledExactlyOnce:
        deliveredTokens
          .length
        === 1,

      bearerTokenIsDeliveredWithoutScheme:
        deliveredTokens[0]
        === "verified-owner-token",

      resolvedOwnerIdIsPreserved:
        resolvedOwnerId
        === ownerId,

      invalidHeaderIsRejectedBeforeResolver:
        rejectedRequestError
        instanceof ConsultingSessionAuthenticationError
        && rejectedRequestCallCount
        === 0,

      resolverFailureIsPropagated:
        propagatedResolverError
        === resolverFailure,
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
