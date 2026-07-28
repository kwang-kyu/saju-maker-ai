import type {
    SupabaseClient,
  } from "@supabase/supabase-js";

  import {
    parseConsultingSessionBearerToken,
  } from "./consultingSessionOwnerResolver";
  import type {
    ConsultingSessionAuthorizationHeader,
    ConsultingSessionOwnerResolver,
  } from "./consultingSessionOwnerResolver";
  import {
    GatewayConsultingSessionRepository,
  } from "./gatewayConsultingSessionRepository";
  import {
    SupabaseConsultingSessionPersistenceGateway,
  } from "./supabaseConsultingSessionPersistenceGateway";
  import {
    createSupabaseConsultingSessionServerClient,
  } from "./supabaseConsultingSessionRepositoryFactory";
  import type {
    SupabaseServerEnvironment,
  } from "./supabaseConsultingSessionRepositoryFactory";
  import {
    SupabaseConsultingSessionOwnerResolver,
  } from "./supabaseConsultingSessionOwnerResolver";

  export type CreateAuthenticatedSupabaseConsultingSessionRepositoryInput = {
    authorizationHeader:
      ConsultingSessionAuthorizationHeader;

    environment?:
      SupabaseServerEnvironment;
  };

  export type AuthenticatedSupabaseConsultingSessionRepositoryDependencies = {
    createServerClient(
      environment:
        SupabaseServerEnvironment | undefined,
    ): SupabaseClient;

    createOwnerResolver(
      client:
        SupabaseClient,
    ): ConsultingSessionOwnerResolver;
  };

  const DEFAULT_DEPENDENCIES:
    AuthenticatedSupabaseConsultingSessionRepositoryDependencies = {
      createServerClient(
        environment:
          SupabaseServerEnvironment | undefined,
      ) {
        return createSupabaseConsultingSessionServerClient(
          environment,
        );
      },

      createOwnerResolver(
        client:
          SupabaseClient,
      ) {
        return new SupabaseConsultingSessionOwnerResolver(
          client,
        );
      },
    };

  export async function createAuthenticatedSupabaseConsultingSessionRepository(
    input:
      CreateAuthenticatedSupabaseConsultingSessionRepositoryInput,
    dependencies:
      AuthenticatedSupabaseConsultingSessionRepositoryDependencies =
        DEFAULT_DEPENDENCIES,
  ): Promise<GatewayConsultingSessionRepository> {
    const accessToken =
  parseConsultingSessionBearerToken(
    input.authorizationHeader,
  );
    const client =
      dependencies
        .createServerClient(
          input.environment,
        );

    const ownerResolver =
      dependencies
        .createOwnerResolver(
          client,
        );

        const ownerId =
        await ownerResolver
          .resolveOwnerId(
            accessToken,
          );

    const gateway =
      new SupabaseConsultingSessionPersistenceGateway({
        client,

        ownerId,
      });

    return new GatewayConsultingSessionRepository(
      gateway,
    );
  }
