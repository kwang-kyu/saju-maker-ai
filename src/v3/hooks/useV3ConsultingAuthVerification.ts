import {
    createElement,
  } from "react";
  import {
    renderToStaticMarkup,
  } from "react-dom/server";

  import {
    useV3ConsultingAuth,
  } from "./useV3ConsultingAuth";
  import type {
    UseV3ConsultingAuthResult,
  } from "./useV3ConsultingAuth";

  export type V3ConsultingAuthHookVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  function requireCapturedResult(
    result:
      UseV3ConsultingAuthResult | null,
  ): UseV3ConsultingAuthResult {
    if (
      result
      === null
    ) {
      throw new Error(
        "V3 consulting auth hook result was not captured.",
      );
    }

    return result;
  }

  export function verifyUseV3ConsultingAuth():
    V3ConsultingAuthHookVerificationResult {
    let capturedResult:
      UseV3ConsultingAuthResult | null =
        null;

    let renderCount =
      0;

    function VerificationProbe() {
      renderCount +=
        1;

      const auth =
        useV3ConsultingAuth();

      capturedResult =
        auth;

      return createElement(
        "span",
        null,
        auth.loading
          ? "loading"
          : "ready",
      );
    }

    const renderedMarkup =
      renderToStaticMarkup(
        createElement(
          VerificationProbe,
        ),
      );

    const result =
      requireCapturedResult(
        capturedResult,
      );

    const checks = {
      hookRendersInsideReact:
        renderCount
        === 1,

      initialStateIsLoading:
        result.loading
        === true,

      initialStateIsUnauthenticated:
        result.authenticated
        === false,

      initialAccessTokenIsNull:
        result.accessToken
        === null,

      initialErrorIsNull:
        result.error
        === null,

      refreshFunctionIsExposed:
        typeof result.refresh
        === "function",

      kakaoSignInFunctionIsExposed:
        typeof result.signInWithKakao
        === "function",

      signOutFunctionIsExposed:
        typeof result.signOut
        === "function",

      serverRenderIsStable:
        renderedMarkup
        === "<span>loading</span>",

      serverRenderDoesNotRequireBrowserEnvironment:
        capturedResult
        !== null,
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
