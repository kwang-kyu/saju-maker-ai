import {
    createElement,
  } from "react";
  import {
    renderToStaticMarkup,
  } from "react-dom/server";

  import {
    V3ConsultingApp,
  } from "./V3ConsultingApp";

  export type V3ConsultingAppAuthIntegrationVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  export function verifyV3ConsultingAppAuthIntegration():
    V3ConsultingAppAuthIntegrationVerificationResult {
    const markup =
      renderToStaticMarkup(
        createElement(
          V3ConsultingApp,
        ),
      );

    const checks = {
      appRenders:
        markup.length
        > 0,

      consultingTitleIsRendered:
        markup.includes(
          "사람을 먼저 읽는 천운문 상담",
        ),

      authenticationLoadingStateIsRendered:
        markup.includes(
          "로그인 상태를 확인하고 있습니다.",
        ),

      submitWaitsForAuthentication:
        markup.includes(
          "로그인 상태 확인 중",
        ),

      submitIsDisabledDuringAuthenticationCheck:
        markup.includes(
          "disabled",
        ),

      sourceInformationFormIsPreserved:
        markup.includes(
          "출생 원천 정보",
        ),

      lifeContextFormIsPreserved:
        markup.includes(
          "현재 삶의 현실",
        ),

      consultingQuestionFormIsPreserved:
        markup.includes(
          "지금 판단할 질문",
        ),

      decisionExplanationPanelIsPreserved:
        markup.includes(
          "ENGINE DECISION EXPLANATION",
        ),

      initialEmptyStateIsPreserved:
        markup.includes(
          "아직 상담을 시작하지 않았습니다",
        ),

        serverRenderDoesNotRequireBrowserAuth:
        markup.startsWith(
          '<div class="v3-consulting-app">',
        ),
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
