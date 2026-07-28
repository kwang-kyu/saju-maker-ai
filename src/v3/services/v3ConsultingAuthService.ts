import {
    createClient,
  } from "@supabase/supabase-js";
  import type {
    SupabaseClient,
  } from "@supabase/supabase-js";

  export type V3ConsultingBrowserEnvironment = {
    VITE_SUPABASE_URL?:
      string;

    VITE_SUPABASE_PUBLISHABLE_KEY?:
      string;

    VITE_SUPABASE_ANON_KEY?:
      string;
  };

  export type SignInV3ConsultingWithKakaoInput = {
    redirectTo?:
      string;
  };

  export class InvalidV3ConsultingAuthEnvironmentError
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
        "InvalidV3ConsultingAuthEnvironmentError";

      this.field =
        field;
    }
  }

  export class V3ConsultingAuthenticationRequiredError
    extends Error {
    constructor() {
      super(
        "천운문 상담을 계속하려면 로그인이 필요합니다.",
      );

      this.name =
        "V3ConsultingAuthenticationRequiredError";
    }
  }

  export class V3ConsultingAuthOperationError
    extends Error {
    readonly operation:
      "getSession" | "signInWithKakao" | "signOut";

    readonly code:
      string | null;

    constructor(
      input: {
        operation:
          "getSession" | "signInWithKakao" | "signOut";

        code?:
          string;

        message:
          string;
      },
    ) {
      super(
        input.message,
      );

      this.name =
        "V3ConsultingAuthOperationError";

      this.operation =
        input.operation;

      this.code =
        input.code
        ?? null;
    }
  }

  function requireNonEmptyValue(
    value:
      string | undefined,
    field:
      string,
  ): string {
    const normalizedValue =
      value
        ?.trim();

    if (
      normalizedValue
      === undefined
      || normalizedValue.length
      === 0
    ) {
      throw new InvalidV3ConsultingAuthEnvironmentError(
        field,
        `${field} 환경변수가 필요합니다.`,
      );
    }

    return normalizedValue;
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
      throw new InvalidV3ConsultingAuthEnvironmentError(
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_URL 형식이 올바르지 않습니다.",
      );
    }

    const isLocalDevelopment =
      (
        url.hostname
        === "localhost"
        || url.hostname
        === "127.0.0.1"
        || url.hostname
        === "::1"
      )
      && url.protocol
      === "http:";

    if (
      url.protocol
      !== "https:"
      && !isLocalDevelopment
    ) {
      throw new InvalidV3ConsultingAuthEnvironmentError(
        "VITE_SUPABASE_URL",
        "원격 Supabase URL은 HTTPS를 사용해야 합니다.",
      );
    }

    return url
      .toString()
      .replace(
        /\/+$/,
        "",
      );
  }

  function resolveBrowserKey(
    environment:
      V3ConsultingBrowserEnvironment,
  ): string {
    const publishableKey =
      environment
        .VITE_SUPABASE_PUBLISHABLE_KEY
        ?.trim();

    const anonKey =
      environment
        .VITE_SUPABASE_ANON_KEY
        ?.trim();

    if (
      publishableKey
      && anonKey
      && publishableKey
      !== anonKey
    ) {
      throw new InvalidV3ConsultingAuthEnvironmentError(
        "VITE_SUPABASE_PUBLISHABLE_KEY",
        "브라우저용 Supabase 키 환경변수가 서로 충돌합니다.",
      );
    }

    const resolvedKey =
      publishableKey
      || anonKey;

    return requireNonEmptyValue(
      resolvedKey,
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  export function createV3ConsultingSupabaseBrowserClient(
    environment:
  V3ConsultingBrowserEnvironment =
    import.meta.env as unknown as
      V3ConsultingBrowserEnvironment,
  ): SupabaseClient {
    const url =
      validateSupabaseUrl(
        requireNonEmptyValue(
          environment
            .VITE_SUPABASE_URL,
          "VITE_SUPABASE_URL",
        ),
      );

    const browserKey =
      resolveBrowserKey(
        environment,
      );

    return createClient(
      url,
      browserKey,
      {
        auth: {
          autoRefreshToken:
            true,

          detectSessionInUrl:
            true,

          persistSession:
            true,
        },
      },
    );
  }

  let defaultBrowserClient:
    SupabaseClient | null =
      null;

  export function getV3ConsultingSupabaseBrowserClient():
    SupabaseClient {
    if (
      defaultBrowserClient
      === null
    ) {
      defaultBrowserClient =
        createV3ConsultingSupabaseBrowserClient();
    }

    return defaultBrowserClient;
  }

  export async function getV3ConsultingAccessToken(
    client:
      SupabaseClient =
        getV3ConsultingSupabaseBrowserClient(),
  ): Promise<string> {
    const {
      data,
      error,
    } = await client
      .auth
      .getSession();

    if (
      error
      !== null
    ) {
      throw new V3ConsultingAuthOperationError({
        operation:
          "getSession",

        code:
          error.code,

        message:
          "로그인 정보를 확인하지 못했습니다.",
      });
    }

    const accessToken =
      data
        .session
        ?.access_token
        ?.trim();

    if (
      !accessToken
    ) {
      throw new V3ConsultingAuthenticationRequiredError();
    }

    return accessToken;
  }

  export async function signInV3ConsultingWithKakao(
    input:
      SignInV3ConsultingWithKakaoInput = {},
    client:
      SupabaseClient =
        getV3ConsultingSupabaseBrowserClient(),
  ): Promise<void> {
    const redirectTo =
      input.redirectTo
        ?.trim();

    const {
      error,
    } = await client
      .auth
      .signInWithOAuth({
        provider:
          "kakao",

        options:
          redirectTo
            ? {
                redirectTo,
              }
            : {},
      });

    if (
      error
      !== null
    ) {
      throw new V3ConsultingAuthOperationError({
        operation:
          "signInWithKakao",

        code:
          error.code,

        message:
          "카카오 로그인을 시작하지 못했습니다.",
      });
    }
  }

  export async function signOutV3Consulting(
    client:
      SupabaseClient =
        getV3ConsultingSupabaseBrowserClient(),
  ): Promise<void> {
    const {
      error,
    } = await client
      .auth
      .signOut();

    if (
      error
      !== null
    ) {
      throw new V3ConsultingAuthOperationError({
        operation:
          "signOut",

        code:
          error.code,

        message:
          "로그아웃을 완료하지 못했습니다.",
      });
    }
}
