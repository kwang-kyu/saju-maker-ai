import {
    GatewayConsultingSessionRepository,
  } from "./gatewayConsultingSessionRepository";
  import {
    InvalidSupabaseServerEnvironmentError,
    createSupabaseConsultingSessionRepository,
  } from "./supabaseConsultingSessionRepositoryFactory";
  import {
    SupabaseConsultingSessionPersistenceGateway,
  } from "./supabaseConsultingSessionPersistenceGateway";

  export type SupabaseConsultingSessionRepositoryFactoryVerificationResult = {
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

  export function verifySupabaseConsultingSessionRepositoryFactory():
    SupabaseConsultingSessionRepositoryFactoryVerificationResult {
    const missingUrlError =
      captureError(
        () =>
          createSupabaseConsultingSessionRepository({
            SUPABASE_SECRET_KEY:
              "verification-server-secret",
          }),
      );

    const missingSecretError =
      captureError(
        () =>
          createSupabaseConsultingSessionRepository({
            SUPABASE_URL:
              "https://verification.supabase.co",
          }),
      );

    const invalidUrlError =
      captureError(
        () =>
          createSupabaseConsultingSessionRepository({
            SUPABASE_URL:
              "not-a-url",

            SUPABASE_SECRET_KEY:
              "verification-server-secret",
          }),
      );

    const insecureRemoteUrlError =
      captureError(
        () =>
          createSupabaseConsultingSessionRepository({
            SUPABASE_URL:
              "http://verification.supabase.co",

            SUPABASE_SECRET_KEY:
              "verification-server-secret",
          }),
      );

    const publishableKeyError =
      captureError(
        () =>
          createSupabaseConsultingSessionRepository({
            SUPABASE_URL:
              "https://verification.supabase.co",

            SUPABASE_SECRET_KEY:
              "sb_publishable_verification",
          }),
      );

    const anonKeyError =
      captureError(
        () =>
          createSupabaseConsultingSessionRepository({
            SUPABASE_URL:
              "https://verification.supabase.co",

            SUPABASE_SECRET_KEY:
              "sb_anon_verification",
          }),
      );

    const conflictingKeysError =
      captureError(
        () =>
          createSupabaseConsultingSessionRepository({
            SUPABASE_URL:
              "https://verification.supabase.co",

            SUPABASE_SECRET_KEY:
              "new-server-secret",

            SUPABASE_SERVICE_ROLE_KEY:
              "different-legacy-secret",
          }),
      );

    const secretRepository =
      createSupabaseConsultingSessionRepository({
        SUPABASE_URL:
          "https://verification.supabase.co/",

        SUPABASE_SECRET_KEY:
          "verification-server-secret",
      });

    const legacyRepository =
      createSupabaseConsultingSessionRepository({
        SUPABASE_URL:
          "https://verification.supabase.co",

        SUPABASE_SERVICE_ROLE_KEY:
          "verification-legacy-service-role-secret",
      });

    const sameKeysRepository =
      createSupabaseConsultingSessionRepository({
        SUPABASE_URL:
          "https://verification.supabase.co",

        SUPABASE_SECRET_KEY:
          "same-server-secret",

        SUPABASE_SERVICE_ROLE_KEY:
          "same-server-secret",
      });

    const localRepository =
      createSupabaseConsultingSessionRepository({
        SUPABASE_URL:
          "http://127.0.0.1:54321",

        SUPABASE_SECRET_KEY:
          "local-server-secret",
      });

    const secretGateway =
      secretRepository
        .gateway;

    const checks = {
      missingUrlIsRejected:
        missingUrlError
        instanceof InvalidSupabaseServerEnvironmentError
        && missingUrlError
          .field
        === "SUPABASE_URL",

      missingSecretIsRejected:
        missingSecretError
        instanceof InvalidSupabaseServerEnvironmentError
        && missingSecretError
          .field
        === "SUPABASE_SECRET_KEY",

      invalidUrlIsRejected:
        invalidUrlError
        instanceof InvalidSupabaseServerEnvironmentError
        && invalidUrlError
          .field
        === "SUPABASE_URL",

      insecureRemoteUrlIsRejected:
        insecureRemoteUrlError
        instanceof InvalidSupabaseServerEnvironmentError,

      publishableKeyIsRejected:
        publishableKeyError
        instanceof InvalidSupabaseServerEnvironmentError,

      anonKeyIsRejected:
        anonKeyError
        instanceof InvalidSupabaseServerEnvironmentError,

      conflictingServerKeysAreRejected:
        conflictingKeysError
        instanceof InvalidSupabaseServerEnvironmentError,

      secretKeyCreatesRepository:
        secretRepository
        instanceof GatewayConsultingSessionRepository,

      secretKeyCreatesSupabaseGateway:
        secretGateway
        instanceof SupabaseConsultingSessionPersistenceGateway,

      legacyServiceRoleKeyIsSupported:
        legacyRepository
        instanceof GatewayConsultingSessionRepository,

      identicalServerKeysAreAccepted:
        sameKeysRepository
        instanceof GatewayConsultingSessionRepository,

      localHttpDevelopmentIsAccepted:
        localRepository
        instanceof GatewayConsultingSessionRepository,
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
