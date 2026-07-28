import type {
    ConsultingSessionOwnerId,
  } from "./consultingSessionOwnerId";

  export type ConsultingSessionAuthenticationFailureReason =
    | "missingAuthorization"
    | "multipleAuthorizationValues"
    | "unsupportedAuthorizationScheme"
    | "missingAccessToken";

  export class ConsultingSessionAuthenticationError
    extends Error {
    readonly reason:
      ConsultingSessionAuthenticationFailureReason;

    constructor(
      reason:
        ConsultingSessionAuthenticationFailureReason,
    ) {
      super(
        "Consulting session authentication failed.",
      );

      this.name =
        "ConsultingSessionAuthenticationError";

      this.reason =
        reason;
    }
  }

  export type ConsultingSessionAuthorizationHeader =
    | string
    | readonly string[]
    | undefined;

  export type ConsultingSessionOwnerResolver = {
    resolveOwnerId(
      accessToken:
        string,
    ): Promise<ConsultingSessionOwnerId>;
  };

  export function parseConsultingSessionBearerToken(
    authorizationHeader:
      ConsultingSessionAuthorizationHeader,
  ): string {
    if (
      authorizationHeader
      === undefined
    ) {
      throw new ConsultingSessionAuthenticationError(
        "missingAuthorization",
      );
    }

    if (
        typeof authorizationHeader
        !== "string"
      ) {
        throw new ConsultingSessionAuthenticationError(
          "multipleAuthorizationValues",
        );
      }

    const normalizedHeader =
      authorizationHeader
        .trim();

    if (
      normalizedHeader
        .length
      === 0
    ) {
      throw new ConsultingSessionAuthenticationError(
        "missingAuthorization",
      );
    }

    const separatorIndex =
      normalizedHeader
        .indexOf(
          " ",
        );

        if (
            separatorIndex
            < 0
          ) {
            if (
              normalizedHeader
                .toLowerCase()
              === "bearer"
            ) {
              throw new ConsultingSessionAuthenticationError(
                "missingAccessToken",
              );
            }

            throw new ConsultingSessionAuthenticationError(
              "unsupportedAuthorizationScheme",
            );
          }

    const scheme =
      normalizedHeader
        .slice(
          0,
          separatorIndex,
        )
        .trim();

    if (
      scheme
        .toLowerCase()
      !== "bearer"
    ) {
      throw new ConsultingSessionAuthenticationError(
        "unsupportedAuthorizationScheme",
      );
    }

    const accessToken =
      normalizedHeader
        .slice(
          separatorIndex + 1,
        )
        .trim();

    if (
      accessToken
        .length
      === 0
    ) {
      throw new ConsultingSessionAuthenticationError(
        "missingAccessToken",
      );
    }

    if (
      accessToken
        .includes(
          " ",
        )
    ) {
      throw new ConsultingSessionAuthenticationError(
        "missingAccessToken",
      );
    }

    return accessToken;
  }

  export async function resolveConsultingSessionOwner(
    input: {
      authorizationHeader:
        ConsultingSessionAuthorizationHeader;

      resolver:
        ConsultingSessionOwnerResolver;
    },
  ): Promise<ConsultingSessionOwnerId> {
    const accessToken =
      parseConsultingSessionBearerToken(
        input.authorizationHeader,
      );

    return input
      .resolver
      .resolveOwnerId(
        accessToken,
      );
  }
