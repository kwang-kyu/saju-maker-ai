import {
    useCallback,
    useEffect,
    useRef,
    useState,
  } from "react";
  import type {
    Session,
    SupabaseClient,
  } from "@supabase/supabase-js";

  import {
    getV3ConsultingSupabaseBrowserClient,
    signInV3ConsultingWithKakao,
    signOutV3Consulting,
  } from "../services/v3ConsultingAuthService";

  export type V3ConsultingAuthState = {
    accessToken:
      string | null;

    authenticated:
      boolean;

    loading:
      boolean;

    error:
      Error | null;
  };

  export type UseV3ConsultingAuthResult =
    V3ConsultingAuthState & {
      refresh():
        Promise<void>;

      signInWithKakao(
        redirectTo?:
          string,
      ): Promise<void>;

      signOut():
        Promise<void>;
    };

  const INITIAL_AUTH_STATE:
    V3ConsultingAuthState = {
      accessToken:
        null,

      authenticated:
        false,

      loading:
        true,

      error:
        null,
    };

    const V3_AUTH_CALLBACK_PATH =
  "/v3-auth-callback";

const V3_CONSULTING_LOCATION =
  "/#v3";

function normalizePathname(
  pathname:
    string,
): string {
  const normalizedPathname =
    pathname
      .trim()
      .toLowerCase()
      .replace(
        /\/+$/,
        "",
      );

  return normalizedPathname
    || "/";
}

function completeV3AuthCallback(
  session:
    Session | null,
): void {
  const authenticated =
    readAccessToken(
      session,
    )
    !== null;

  const isAuthCallback =
    normalizePathname(
      globalThis.location.pathname,
    )
    === V3_AUTH_CALLBACK_PATH;

  if (
    !authenticated
    || !isAuthCallback
  ) {
    return;
  }

  globalThis.location.replace(
    V3_CONSULTING_LOCATION,
  );
}

  function normalizeError(
    error:
      unknown,
  ): Error {
    if (
      error
      instanceof Error
    ) {
      return error;
    }

    return new Error(
      "상담 로그인 상태를 처리하지 못했습니다.",
    );
  }

  function readAccessToken(
    session:
      Session | null,
  ): string | null {
    const accessToken =
      session
        ?.access_token
        ?.trim();

    return accessToken
      ? accessToken
      : null;
  }

  function buildAuthenticatedState(
    session:
      Session | null,
  ): V3ConsultingAuthState {
    const accessToken =
      readAccessToken(
        session,
      );

    return {
      accessToken,

      authenticated:
        accessToken
        !== null,

      loading:
        false,

      error:
        null,
    };
  }

  /**
   * v3 상담 화면에서 Supabase 로그인 상태를 관리한다.
   *
   * 브라우저 세션을 최초 한 번 읽고,
   * 이후 로그인·토큰 갱신·로그아웃 변경을 실시간으로 반영한다.
   */
  export function useV3ConsultingAuth():
    UseV3ConsultingAuthResult {
    const clientRef =
      useRef<SupabaseClient | null>(
        null,
      );

    const [
      authState,
      setAuthState,
    ] = useState<V3ConsultingAuthState>(
      INITIAL_AUTH_STATE,
    );

    const requireClient =
      useCallback(
        (): SupabaseClient => {
          if (
            clientRef.current
            === null
          ) {
            clientRef.current =
              getV3ConsultingSupabaseBrowserClient();
          }

          return clientRef.current;
        },
        [],
      );

    const refresh =
      useCallback(
        async (): Promise<void> => {
          setAuthState(
            (currentState) => ({
              ...currentState,

              loading:
                true,

              error:
                null,
            }),
          );

          try {
            const client =
              requireClient();

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
              throw error;
            }

            setAuthState(
              buildAuthenticatedState(
                data.session,
              ),
            );
            completeV3AuthCallback(
                data.session,
              );
          } catch (
            error
          ) {
            setAuthState({
              accessToken:
                null,

              authenticated:
                false,

              loading:
                false,

              error:
                normalizeError(
                  error,
                ),
            });
          }
        },
        [
          requireClient,
        ],
      );

    const signInWithKakao =
      useCallback(
        async (
          redirectTo?:
            string,
        ): Promise<void> => {
          setAuthState(
            (currentState) => ({
              ...currentState,

              error:
                null,
            }),
          );

          try {
            const client =
              requireClient();

            await signInV3ConsultingWithKakao(
              redirectTo
                ? {
                    redirectTo,
                  }
                : {},
              client,
            );
          } catch (
            error
          ) {
            const normalizedError =
              normalizeError(
                error,
              );

            setAuthState(
              (currentState) => ({
                ...currentState,

                error:
                  normalizedError,
              }),
            );

            throw normalizedError;
          }
        },
        [
          requireClient,
        ],
      );

    const signOut =
      useCallback(
        async (): Promise<void> => {
          setAuthState(
            (currentState) => ({
              ...currentState,

              error:
                null,
            }),
          );

          try {
            const client =
              requireClient();

            await signOutV3Consulting(
              client,
            );

            setAuthState(
              buildAuthenticatedState(
                null,
              ),
            );
          } catch (
            error
          ) {
            const normalizedError =
              normalizeError(
                error,
              );

            setAuthState(
              (currentState) => ({
                ...currentState,

                error:
                  normalizedError,
              }),
            );

            throw normalizedError;
          }
        },
        [
          requireClient,
        ],
      );

    useEffect(
      () => {
        let active =
          true;

        let client:
          SupabaseClient;

        try {
          client =
            requireClient();
        } catch (
          error
        ) {
          setAuthState({
            accessToken:
              null,

            authenticated:
              false,

            loading:
              false,

            error:
              normalizeError(
                error,
              ),
          });

          return;
        }

        const {
          data: {
            subscription,
          },
        } = client
          .auth
          .onAuthStateChange(
            (
              _event,
              session,
            ) => {
              if (
                !active
              ) {
                return;
              }

              completeV3AuthCallback(
                session,
              );

              setAuthState(
                buildAuthenticatedState(
                  session,
                ),
              );
            },
          );

        void refresh();

        return () => {
          active =
            false;

          subscription
            .unsubscribe();
        };
      },
      [
        refresh,
        requireClient,
      ],
    );

    return {
      ...authState,

      refresh,

      signInWithKakao,

      signOut,
    };
  }
