import type {
    SupabaseClient,
  } from "@supabase/supabase-js";

  import {
    createV3ConsultingSupabaseBrowserClient,
    getV3ConsultingAccessToken,
    InvalidV3ConsultingAuthEnvironmentError,
    signInV3ConsultingWithKakao,
    signOutV3Consulting,
    V3ConsultingAuthenticationRequiredError,
    V3ConsultingAuthOperationError,
  } from "./v3ConsultingAuthService";

  export type V3ConsultingAuthServiceVerificationResult = {
    checks:
      Record<string, boolean>;

    passed:
      boolean;
  };

  type FakeAuthClientInput = {
    accessToken?:
      string | null;

    getSessionErrorCode?:
      string;

    signInErrorCode?:
      string;

    signOutErrorCode?:
      string;

    oauthInputs:
      unknown[];

    counters: {
      getSession:
        number;

      signIn:
        number;

      signOut:
        number;
    };
  };

  function isObjectRecord(
    value:
      unknown,
  ): value is Record<string, unknown> {
    return (
      typeof value
      === "object"
      && value
      !== null
      && !Array.isArray(
        value,
      )
    );
  }

  function createFakeSupabaseClient(
    input:
      FakeAuthClientInput,
  ): SupabaseClient {
    const auth = {
      async getSession() {
        input.counters.getSession +=
          1;

        if (
          input.getSessionErrorCode
        ) {
          return {
            data: {
              session:
                null,
            },

            error: {
              code:
                input.getSessionErrorCode,

              message:
                "verification get session failure",
            },
          };
        }

        return {
          data: {
            session:
              input.accessToken
              === null
              || input.accessToken
              === undefined
                ? null
                : {
                    access_token:
                      input.accessToken,
                  },
          },

          error:
            null,
        };
      },

      async signInWithOAuth(
        oauthInput:
          unknown,
      ) {
        input.counters.signIn +=
          1;

        input.oauthInputs.push(
          oauthInput,
        );

        if (
          input.signInErrorCode
        ) {
          return {
            data: {
              provider:
                "kakao",

              url:
                null,
            },

            error: {
              code:
                input.signInErrorCode,

              message:
                "verification sign in failure",
            },
          };
        }

        return {
          data: {
            provider:
              "kakao",

            url:
              "https://verification.supabase.co/auth/v1/authorize",
          },

          error:
            null,
        };
      },

      async signOut() {
        input.counters.signOut +=
          1;

        if (
          input.signOutErrorCode
        ) {
          return {
            error: {
              code:
                input.signOutErrorCode,

              message:
                "verification sign out failure",
            },
          };
        }

        return {
          error:
            null,
        };
      },
    };

    return {
      auth,
    } as unknown as SupabaseClient;
  }

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

  export async function verifyV3ConsultingAuthService():
    Promise<V3ConsultingAuthServiceVerificationResult> {
    const missingUrlError =
      captureError(
        () =>
          createV3ConsultingSupabaseBrowserClient({
            VITE_SUPABASE_PUBLISHABLE_KEY:
              "verification-publishable-key",
          }),
      );

    const missingKeyError =
      captureError(
        () =>
          createV3ConsultingSupabaseBrowserClient({
            VITE_SUPABASE_URL:
              "https://verification.supabase.co",
          }),
      );

    const invalidUrlError =
      captureError(
        () =>
          createV3ConsultingSupabaseBrowserClient({
            VITE_SUPABASE_URL:
              "not-a-url",

            VITE_SUPABASE_PUBLISHABLE_KEY:
              "verification-publishable-key",
          }),
      );

    const insecureRemoteUrlError =
      captureError(
        () =>
          createV3ConsultingSupabaseBrowserClient({
            VITE_SUPABASE_URL:
              "http://verification.supabase.co",

            VITE_SUPABASE_PUBLISHABLE_KEY:
              "verification-publishable-key",
          }),
      );

    const conflictingKeysError =
      captureError(
        () =>
          createV3ConsultingSupabaseBrowserClient({
            VITE_SUPABASE_URL:
              "https://verification.supabase.co",

            VITE_SUPABASE_PUBLISHABLE_KEY:
              "verification-publishable-key",

            VITE_SUPABASE_ANON_KEY:
              "different-verification-anon-key",
          }),
      );

    const publishableClient =
      createV3ConsultingSupabaseBrowserClient({
        VITE_SUPABASE_URL:
          "https://verification.supabase.co/",

        VITE_SUPABASE_PUBLISHABLE_KEY:
          "verification-publishable-key",
      });

    const legacyAnonClient =
      createV3ConsultingSupabaseBrowserClient({
        VITE_SUPABASE_URL:
          "https://verification.supabase.co",

        VITE_SUPABASE_ANON_KEY:
          "verification-anon-key",
      });

    const localClient =
      createV3ConsultingSupabaseBrowserClient({
        VITE_SUPABASE_URL:
          "http://127.0.0.1:54321",

        VITE_SUPABASE_PUBLISHABLE_KEY:
          "local-verification-key",
      });

    const tokenCounters = {
      getSession:
        0,

      signIn:
        0,

      signOut:
        0,
    };

    const tokenClient =
      createFakeSupabaseClient({
        accessToken:
          "  verification-access-token  ",

        oauthInputs:
          [],

        counters:
          tokenCounters,
      });

    const accessToken =
      await getV3ConsultingAccessToken(
        tokenClient,
      );

    const missingSessionCounters = {
      getSession:
        0,

      signIn:
        0,

      signOut:
        0,
    };

    const missingSessionError =
      await captureAsyncError(
        () =>
          getV3ConsultingAccessToken(
            createFakeSupabaseClient({
              accessToken:
                null,

              oauthInputs:
                [],

              counters:
                missingSessionCounters,
            }),
          ),
      );

    const sessionFailureCounters = {
      getSession:
        0,

      signIn:
        0,

      signOut:
        0,
    };

    const sessionFailureError =
      await captureAsyncError(
        () =>
          getV3ConsultingAccessToken(
            createFakeSupabaseClient({
              getSessionErrorCode:
                "session_verification_failure",

              oauthInputs:
                [],

              counters:
                sessionFailureCounters,
            }),
          ),
      );

    const oauthInputs:
      unknown[] = [];

    const kakaoCounters = {
      getSession:
        0,

      signIn:
        0,

      signOut:
        0,
    };

    await signInV3ConsultingWithKakao(
      {
        redirectTo:
          " https://cheonunmun.example.com/consulting ",
      },
      createFakeSupabaseClient({
        oauthInputs,

        counters:
          kakaoCounters,
      }),
    );

    const oauthInput =
      oauthInputs[0];

    const oauthOptions =
      isObjectRecord(
        oauthInput,
      )
      && isObjectRecord(
        oauthInput.options,
      )
        ? oauthInput.options
        : null;

    const kakaoFailureCounters = {
      getSession:
        0,

      signIn:
        0,

      signOut:
        0,
    };

    const kakaoFailureError =
      await captureAsyncError(
        () =>
          signInV3ConsultingWithKakao(
            {},
            createFakeSupabaseClient({
              signInErrorCode:
                "oauth_verification_failure",

              oauthInputs:
                [],

              counters:
                kakaoFailureCounters,
            }),
          ),
      );

    const signOutCounters = {
      getSession:
        0,

      signIn:
        0,

      signOut:
        0,
    };

    await signOutV3Consulting(
      createFakeSupabaseClient({
        oauthInputs:
          [],

        counters:
          signOutCounters,
      }),
    );

    const signOutFailureCounters = {
      getSession:
        0,

      signIn:
        0,

      signOut:
        0,
    };

    const signOutFailureError =
      await captureAsyncError(
        () =>
          signOutV3Consulting(
            createFakeSupabaseClient({
              signOutErrorCode:
                "signout_verification_failure",

              oauthInputs:
                [],

              counters:
                signOutFailureCounters,
            }),
          ),
      );

    const checks = {
      missingUrlIsRejected:
        missingUrlError
        instanceof InvalidV3ConsultingAuthEnvironmentError
        && missingUrlError.field
        === "VITE_SUPABASE_URL",

      missingBrowserKeyIsRejected:
        missingKeyError
        instanceof InvalidV3ConsultingAuthEnvironmentError
        && missingKeyError.field
        === "VITE_SUPABASE_PUBLISHABLE_KEY",

      invalidUrlIsRejected:
        invalidUrlError
        instanceof InvalidV3ConsultingAuthEnvironmentError,

      insecureRemoteUrlIsRejected:
        insecureRemoteUrlError
        instanceof InvalidV3ConsultingAuthEnvironmentError,

      conflictingBrowserKeysAreRejected:
        conflictingKeysError
        instanceof InvalidV3ConsultingAuthEnvironmentError,

      publishableKeyCreatesClient:
        publishableClient.auth
        !== undefined,

      legacyAnonKeyCreatesClient:
        legacyAnonClient.auth
        !== undefined,

      localHttpDevelopmentCreatesClient:
        localClient.auth
        !== undefined,

      accessTokenIsNormalized:
        accessToken
        === "verification-access-token",

      sessionIsReadExactlyOnce:
        tokenCounters.getSession
        === 1,

      missingSessionUsesTypedError:
        missingSessionError
        instanceof V3ConsultingAuthenticationRequiredError,

      missingSessionIsReadExactlyOnce:
        missingSessionCounters.getSession
        === 1,

      sessionFailureUsesTypedError:
        sessionFailureError
        instanceof V3ConsultingAuthOperationError
        && sessionFailureError.operation
        === "getSession"
        && sessionFailureError.code
        === "session_verification_failure",

      sessionFailureIsReadExactlyOnce:
        sessionFailureCounters.getSession
        === 1,

      kakaoSignInIsCalledExactlyOnce:
        kakaoCounters.signIn
        === 1,

      kakaoProviderIsDelivered:
        isObjectRecord(
          oauthInput,
        )
        && oauthInput.provider
        === "kakao",

      kakaoRedirectIsNormalized:
        oauthOptions
          ?.redirectTo
        === "https://cheonunmun.example.com/consulting",

      kakaoFailureUsesTypedError:
        kakaoFailureError
        instanceof V3ConsultingAuthOperationError
        && kakaoFailureError.operation
        === "signInWithKakao"
        && kakaoFailureError.code
        === "oauth_verification_failure",

      kakaoFailureCallsAuthOnce:
        kakaoFailureCounters.signIn
        === 1,

      signOutIsCalledExactlyOnce:
        signOutCounters.signOut
        === 1,

      signOutFailureUsesTypedError:
        signOutFailureError
        instanceof V3ConsultingAuthOperationError
        && signOutFailureError.operation
        === "signOut"
        && signOutFailureError.code
        === "signout_verification_failure",

      signOutFailureCallsAuthOnce:
        signOutFailureCounters.signOut
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
