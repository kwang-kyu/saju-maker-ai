import {
    createClient,
  } from "@supabase/supabase-js";

  import {
    GatewayConsultingSessionRepository,
  } from "./gatewayConsultingSessionRepository";
  import {
    SupabaseConsultingSessionPersistenceGateway,
  } from "./supabaseConsultingSessionPersistenceGateway";

  export type SupabaseServerEnvironment = {
    SUPABASE_URL?:
      string;

    SUPABASE_SECRET_KEY?:
      string;

    SUPABASE_SERVICE_ROLE_KEY?:
      string;
  };

  export class InvalidSupabaseServerEnvironmentError
    extends Error {
    readonly field:
      string;

    constructor(
      field:
        string,
      message:
        string,
    ) {
      super(
        message,
      );

      this.name =
        "InvalidSupabaseServerEnvironmentError";

      this.field =
        field;
    }
  }

  function requireNonEmptyValue(
    value:
      string | undefined,
    fieldName:
      string,
  ): string {
    if (
      value
      === undefined
      || value
        .trim()
        .length
      === 0
    ) {
      throw new InvalidSupabaseServerEnvironmentError(
        fieldName,
        `${fieldName} must be configured on the server.`,
      );
    }

    return value.trim();
  }

  function validateSupabaseUrl(
    value:
      string,
  ): string {
    let url:
      URL;

    try {
      url =
        new URL(
          value,
        );
    } catch {
      throw new InvalidSupabaseServerEnvironmentError(
        "SUPABASE_URL",
        "SUPABASE_URL must be a valid URL.",
      );
    }

    if (
      url.protocol
      !== "https:"
      && url.hostname
      !== "localhost"
      && url.hostname
      !== "127.0.0.1"
    ) {
      throw new InvalidSupabaseServerEnvironmentError(
        "SUPABASE_URL",
        "SUPABASE_URL must use HTTPS outside local development.",
      );
    }

    return url
      .toString()
      .replace(
        /\/$/,
        "",
      );
  }

  function resolveSecretKey(
    environment:
      SupabaseServerEnvironment,
  ): string {
    const secretKey =
      environment
        .SUPABASE_SECRET_KEY
        ?.trim();

    const legacyServiceRoleKey =
      environment
        .SUPABASE_SERVICE_ROLE_KEY
        ?.trim();

    if (
      secretKey
      && legacyServiceRoleKey
      && secretKey
      !== legacyServiceRoleKey
    ) {
      throw new InvalidSupabaseServerEnvironmentError(
        "SUPABASE_SECRET_KEY",
        "Configure only one Supabase server secret key.",
      );
    }

    const resolvedKey =
      requireNonEmptyValue(
        secretKey
        || legacyServiceRoleKey,
        "SUPABASE_SECRET_KEY",
      );

    if (
      resolvedKey
        .startsWith(
          "sb_publishable_",
        )
      || resolvedKey
        .startsWith(
          "sb_anon_",
        )
    ) {
      throw new InvalidSupabaseServerEnvironmentError(
        "SUPABASE_SECRET_KEY",
        "A browser publishable or anon key cannot be used for session persistence.",
      );
    }

    return resolvedKey;
  }

  /**
   * 서버 전용 Supabase 세션 Repository를 만든다.
   *
   * VITE_SUPABASE_* 환경변수는 의도적으로 읽지 않는다.
   * Secret 또는 service-role 키는 API 서버 환경에만 보관해야 한다.
   */
  export function createSupabaseConsultingSessionRepository(
    environment:
      SupabaseServerEnvironment =
        process.env,
  ): GatewayConsultingSessionRepository {
    const url =
      validateSupabaseUrl(
        requireNonEmptyValue(
          environment
            .SUPABASE_URL,
          "SUPABASE_URL",
        ),
      );

    const secretKey =
      resolveSecretKey(
        environment,
      );

    const client =
      createClient(
        url,
        secretKey,
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

    const gateway =
      new SupabaseConsultingSessionPersistenceGateway({
        client,
      });

    return new GatewayConsultingSessionRepository(
      gateway,
    );
  }
