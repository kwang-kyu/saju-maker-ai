import type {
    SupabaseClient,
  } from "@supabase/supabase-js";

  import {
    parseConsultingSessionOwnerId,
  } from "./consultingSessionOwnerId";
  import type {
    ConsultingSessionOwnerId,
  } from "./consultingSessionOwnerId";
  import type {
    ConsultingSessionOwnerResolver,
  } from "./consultingSessionOwnerResolver";

  export type SupabaseConsultingSessionAuthenticationFailureReason =
    | "authenticationFailed"
    | "missingAuthenticatedUser";

  export type SupabaseConsultingSessionAuthUserResult = {
    data: {
      user: {
        id:
          string;
      } | null;
    };

    error: {
      code?:
        string;
    } | null;
  };

  export type SupabaseConsultingSessionGetUser = (
    accessToken:
      string,
  ) => Promise<SupabaseConsultingSessionAuthUserResult>;

  export class SupabaseConsultingSessionAuthenticationError
    extends Error {
    readonly reason:
      SupabaseConsultingSessionAuthenticationFailureReason;

    readonly code:
      string | null;

    constructor(
      input: {
        reason:
          SupabaseConsultingSessionAuthenticationFailureReason;

        code?:
          string;
      },
    ) {
      super(
        "Supabase consulting session authentication failed.",
      );

      this.name =
        "SupabaseConsultingSessionAuthenticationError";

      this.reason =
        input.reason;

      this.code =
        input.code
        ?? null;
    }
  }

  export class SupabaseConsultingSessionOwnerResolver
  implements ConsultingSessionOwnerResolver {
    readonly client:
      SupabaseClient;

    readonly getUser:
      SupabaseConsultingSessionGetUser;

    constructor(
      client:
        SupabaseClient,
      getUser?:
        SupabaseConsultingSessionGetUser,
    ) {
      this.client =
        client;

      this.getUser =
        getUser
        ?? (
          async (
            accessToken:
              string,
          ) => {
            const {
              data,
              error,
            } = await client
              .auth
              .getUser(
                accessToken,
              );

            return {
              data: {
                user:
                  data.user
                  === null
                    ? null
                    : {
                      id:
                        data
                          .user
                          .id,
                    },
              },

              error:
                error
                === null
                  ? null
                  : {
                    code:
                      error.code,
                  },
            };
          }
        );
    }

    async resolveOwnerId(
      accessToken:
        string,
    ): Promise<ConsultingSessionOwnerId> {
      const {
        data,
        error,
      } = await this
        .getUser(
          accessToken,
        );

      if (
        error
        !== null
      ) {
        throw new SupabaseConsultingSessionAuthenticationError({
          reason:
            "authenticationFailed",

          code:
            error.code,
        });
      }

      if (
        data.user
        === null
      ) {
        throw new SupabaseConsultingSessionAuthenticationError({
          reason:
            "missingAuthenticatedUser",
        });
      }

      return parseConsultingSessionOwnerId(
        data
          .user
          .id,
      );
    }
  }
