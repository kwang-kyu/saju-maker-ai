import {
    createClient,
  } from "@supabase/supabase-js";
  import type {
    SupabaseClient,
  } from "@supabase/supabase-js";

  import {
    createAuthenticatedSupabaseConsultingSessionRepository,
  } from "./authenticatedSupabaseConsultingSessionRepositoryFactory.js";
  import type {
    AuthenticatedSupabaseConsultingSessionRepositoryDependencies,
  } from "./authenticatedSupabaseConsultingSessionRepositoryFactory.js";
  import {
    ConsultingSessionAuthenticationError,
  } from "./consultingSessionOwnerResolver.js";
  import type {
    ConsultingSessionOwnerResolver,
  } from "./consultingSessionOwnerResolver.js";
  import {
    parseConsultingSessionOwnerId,
  } from "./consultingSessionOwnerId.js";
  import {
    GatewayConsultingSessionRepository,
  } from "./gatewayConsultingSessionRepository.js";
  import {
    SupabaseConsultingSessionPersistenceGateway,
  } from "./supabaseConsultingSessionPersistenceGateway.js";
  import type {
    SupabaseServerEnvironment,
  } from "./supabaseConsultingSessionRepositoryFactory.js";

  export type AuthenticatedSupabaseConsultingSessionRepositoryFactoryVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

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

  function createVerificationClient():
    SupabaseClient {
    return createClient(
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
      },
    );
  }

  export async function verifyAuthenticatedSupabaseConsultingSessionRepositoryFactory():
    Promise<AuthenticatedSupabaseConsultingSessionRepositoryFactoryVerificationResult> {
    const ownerId =
      parseConsultingSessionOwnerId(
        "11111111-1111-4111-8111-111111111111",
      );

    const environment:
      SupabaseServerEnvironment = {
        SUPABASE_URL:
          "https://verification.supabase.co",

        SUPABASE_SECRET_KEY:
          "verification-server-secret",
      };

    const verificationClient =
      createVerificationClient();

    const deliveredEnvironments:
      (
        SupabaseServerEnvironment
        | undefined
      )[] = [];

    const deliveredClients:
      SupabaseClient[] = [];

    const deliveredTokens:
      string[] = [];

    let createServerClientCallCount =
      0;

    let createOwnerResolverCallCount =
      0;

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

    const dependencies:
      AuthenticatedSupabaseConsultingSessionRepositoryDependencies = {
        createServerClient(
          deliveredEnvironment:
            SupabaseServerEnvironment | undefined,
        ) {
          createServerClientCallCount +=
            1;

          deliveredEnvironments.push(
            deliveredEnvironment,
          );

          return verificationClient;
        },

        createOwnerResolver(
          client:
            SupabaseClient,
        ) {
          createOwnerResolverCallCount +=
            1;

          deliveredClients.push(
            client,
          );

          return resolver;
        },
      };

    const repository =
      await createAuthenticatedSupabaseConsultingSessionRepository(
        {
          authorizationHeader:
            "Bearer authenticated-factory-token",

          environment,
        },
        dependencies,
      );

    const gateway =
      repository
        .gateway;

    let invalidHeaderClientCallCount =
      0;

    let invalidHeaderResolverCallCount =
      0;

    const invalidHeaderDependencies:
      AuthenticatedSupabaseConsultingSessionRepositoryDependencies = {
        createServerClient() {
          invalidHeaderClientCallCount +=
            1;

          return verificationClient;
        },

        createOwnerResolver() {
          invalidHeaderResolverCallCount +=
            1;

          return resolver;
        },
      };

    const invalidHeaderError =
      await captureAsyncError(
        () =>
          createAuthenticatedSupabaseConsultingSessionRepository(
            {
              authorizationHeader:
                "Basic rejected-token",

              environment,
            },
            invalidHeaderDependencies,
          ),
      );

    const resolverFailure =
      new Error(
        "Verification owner resolver failure.",
      );

    const failingResolver:
      ConsultingSessionOwnerResolver = {
        async resolveOwnerId() {
          throw resolverFailure;
        },
      };

    const failingDependencies:
      AuthenticatedSupabaseConsultingSessionRepositoryDependencies = {
        createServerClient() {
          return verificationClient;
        },

        createOwnerResolver() {
          return failingResolver;
        },
      };

    const propagatedResolverError =
      await captureAsyncError(
        () =>
          createAuthenticatedSupabaseConsultingSessionRepository(
            {
              authorizationHeader:
                "Bearer resolver-failure-token",

              environment,
            },
            failingDependencies,
          ),
      );

    const checks = {
      repositoryIsCreated:
        repository
        instanceof GatewayConsultingSessionRepository,

      gatewayIsCreated:
        gateway
        instanceof SupabaseConsultingSessionPersistenceGateway,

      serverClientIsCreatedExactlyOnce:
        createServerClientCallCount
        === 1,

      ownerResolverIsCreatedExactlyOnce:
        createOwnerResolverCallCount
        === 1,

      environmentIsDeliveredUnchanged:
        deliveredEnvironments[0]
        === environment,

      sameClientIsDeliveredToResolver:
        deliveredClients[0]
        === verificationClient,

      sameClientIsDeliveredToGateway:
        gateway
        instanceof SupabaseConsultingSessionPersistenceGateway
        && gateway
          .client
        === verificationClient,

      bearerTokenIsDeliveredWithoutScheme:
        deliveredTokens[0]
        === "authenticated-factory-token",

      ownerResolverIsCalledExactlyOnce:
        deliveredTokens
          .length
        === 1,

      authenticatedOwnerIsDeliveredToGateway:
        gateway
        instanceof SupabaseConsultingSessionPersistenceGateway
        && gateway
          .ownerId
        === ownerId,

      invalidHeaderUsesTypedError:
        invalidHeaderError
        instanceof ConsultingSessionAuthenticationError,

      invalidHeaderIsRejectedBeforeClientCreation:
        invalidHeaderClientCallCount
        === 0,

      invalidHeaderIsRejectedBeforeResolverCreation:
        invalidHeaderResolverCallCount
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
