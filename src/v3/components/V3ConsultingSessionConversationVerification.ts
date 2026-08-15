import {
  createElement,
} from "react";
import {
  renderToStaticMarkup,
} from "react-dom/server";

import {
  resolveTurnUserLabel,
} from "./consultingInputModeResolver";
import {
  V3ConsultingSessionConversation,
} from "./V3ConsultingSessionConversation";
import type {
  V3InitialConsultingSessionResponse,
} from "../services/v3ConsultingSessionApiClient";

export type V3ConsultingSessionConversationVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export function verifyV3ConsultingSessionConversation():
  V3ConsultingSessionConversationVerificationResult {
  const initialSession:
    V3InitialConsultingSessionResponse = {
      sessionId:
        "session-conversation-001",

      status:
        "active",

      createdAt:
        "2026-07-29T10:30:00.000Z",

      updatedAt:
        "2026-07-29T10:30:00.000Z",

      initialTurnId:
        "turn-conversation-001",

      initialTurnSequence:
        1,

      question:
        "현재 직장을 유지하면서 창업을 준비해도 될까요?",

      assistantAnswer:
        "현재 현금흐름을 보호하면서 단계적으로 준비하는 방향이 적합합니다.",

      pendingClarification:
        null,
    };

  const activeMarkup =
    renderToStaticMarkup(
      createElement(
        V3ConsultingSessionConversation,
        {
          accessToken:
            "verification-access-token",

          initialSession,
        },
      ),
    );

  const clarificationSession:
    V3InitialConsultingSessionResponse = {
      ...initialSession,

      status:
        "awaitingClarification",

      pendingClarification: {
        decisionTurnId:
          initialSession.initialTurnId,

        items: [
          {
            key:
              "monthlyLivingCost",

            description:
              "현재 고정 생활비",

            question:
              "생활비를 제외하고 사용할 수 있는 여유자금은 얼마인가요?",
          },
          {
            key:
              "businessFunds",

            description:
              "창업에 사용할 자금의 성격",

            question:
              "현재 직장을 유지한 채 준비할 수 있나요?",
          },
        ],
      },
    };

  const clarificationMarkup =
    renderToStaticMarkup(
      createElement(
        V3ConsultingSessionConversation,
        {
          accessToken:
            "verification-access-token",

          initialSession:
            clarificationSession,
        },
      ),
    );

  const checks = {
    conversationRenders:
      activeMarkup.includes(
        'class="v3-consulting-conversation"',
      ),

    activeSessionStatusIsRendered:
      activeMarkup.includes(
        "상담 진행 중",
      ),

    initialQuestionIsRendered:
      activeMarkup.includes(
        initialSession.question,
      ),

    initialAnswerIsRendered:
      activeMarkup.includes(
        initialSession.assistantAnswer,
      ),

    initialTurnSequenceIsRendered:
      activeMarkup.includes(
        "질문 1",
      ),

    activeFollowUpLabelIsRendered:
      activeMarkup.includes(
        "이어서 질문하기",
      ),

    activeFollowUpSubmitIsRendered:
      activeMarkup.includes(
        "새 질문 보내기",
      ),

    activeSessionHasNoClarificationPanel:
      !activeMarkup.includes(
        "판단을 위해 확인이 필요한 현실 정보",
      ),

    activeSessionHasNoInputModeButtons:
      !activeMarkup.includes(
        'class="v3-consulting-input-mode"',
      ),

    clarificationStatusIsRendered:
      clarificationMarkup.includes(
        "추가 현실 정보 확인 중",
      ),

    clarificationInputModeButtonsAreRendered:
      clarificationMarkup.includes(
        'class="v3-consulting-input-mode"',
      ),

    clarificationAnswerModeButtonIsRendered:
      clarificationMarkup.includes(
        "현재 질문에 답하기",
      ),

    clarificationFollowUpModeButtonIsRendered:
      clarificationMarkup.includes(
        "새 질문 시작하기",
      ),

    clarificationAnswerModeIsDefault:
      /v3-consulting-input-mode-button v3-consulting-input-mode-button--active[^>]*>현재 질문에 답하기/u
        .test(
          clarificationMarkup,
        ),

    clarificationFollowUpModeIsNotActive:
      !/v3-consulting-input-mode-button--active[^>]*>새 질문 시작하기/u
        .test(
          clarificationMarkup,
        ),

    clarificationInputLabelIsRendered:
      clarificationMarkup.includes(
        "현재 질문에 답하기",
      ),

    clarificationInputPlaceholderIsRendered:
      clarificationMarkup.includes(
        "천운문이 요청한 내용을 입력해 주세요.",
      ),

    clarificationSubmitButtonIsRendered:
      clarificationMarkup.includes(
        "답변 보내기",
      ),

    internalMissingInformationIsNotRendered:
      !clarificationMarkup.includes(
        "현재 고정 생활비",
      )
      && !clarificationMarkup.includes(
        "창업에 사용할 자금의 성격",
      ),

    duplicateClarificationQuestionsAreNotRendered:
      !clarificationMarkup.includes(
        "생활비를 제외하고 사용할 수 있는 여유자금은 얼마인가요?",
      )
      && !clarificationMarkup.includes(
        "현재 직장을 유지한 채 준비할 수 있나요?",
      ),

    initialTurnLabelUsesQuestionPrefix:
      resolveTurnUserLabel(
        "initial",
        1,
      ) === "질문 1",

    followUpTurnLabelUsesQuestionPrefix:
      resolveTurnUserLabel(
        "followUp",
        2,
      ) === "질문 2",

    clarificationTurnLabelUsesAnswerPrefix:
      resolveTurnUserLabel(
        "clarification",
        3,
      ) === "답변 3",

    serverRenderDoesNotRequestNetwork:
      activeMarkup.length
      > 0
      && clarificationMarkup.length
      > 0,
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
