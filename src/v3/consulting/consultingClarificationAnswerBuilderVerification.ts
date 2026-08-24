import type {
  ConsultingClarificationRequest,
} from "./consultingSession.js";
import {
  buildConsultingClarificationAnswer,
} from "./consultingClarificationAnswerBuilder.js";

export type ConsultingClarificationAnswerBuilderVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

function buildClarificationFixture(
  items:
    ConsultingClarificationRequest[
      "items"
    ],
): ConsultingClarificationRequest {
  return {
    decisionTurnId:
      "verification-turn-001",

    items,
  };
}

export function verifyConsultingClarificationAnswerBuilder():
  ConsultingClarificationAnswerBuilderVerificationResult {
  const originalQuestion =
    "현재 직장을 유지하면서 창업을 준비해도 될까요?";

  const multiItemClarification =
    buildClarificationFixture([
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
    ]);

  const multiItemAnswer =
    buildConsultingClarificationAnswer({
      originalQuestion,

      clarification:
        multiItemClarification,
    });

  const firstItemOnlyClarification =
    buildClarificationFixture([
      {
        key:
          "businessFunds",

        description:
          "창업에 사용할 자금의 성격",

        question:
          "현재 직장을 유지한 채 준비할 수 있나요?",
      },
    ]);

  const rebuiltAnswer =
    buildConsultingClarificationAnswer({
      originalQuestion,

      clarification:
        firstItemOnlyClarification,
    });

  const birthDateQuestion =
    "1990년 3월 15일생인데 궁합이 맞을까요?";

  const birthDateAnswer =
    buildConsultingClarificationAnswer({
      originalQuestion:
        birthDateQuestion,

      clarification:
        buildClarificationFixture([
          {
            key:
              "counterpartBirthData",

            description:
              "상대방 생년월일",

            question:
              "상대방의 생년월일을 알려주세요.",
          },
          {
            key:
              "monthlyLivingCost",

            description:
              "현재 고정 생활비",

            question:
              "생활비를 제외하고 사용할 수 있는 여유자금은 얼마인가요?",
          },
        ]),
    });

  const checks = {
    firstPendingQuestionIsIncluded:
      multiItemAnswer.includes(
        "생활비를 제외하고 사용할 수 있는 여유자금은 얼마인가요?",
      ),

    secondPendingQuestionIsExcluded:
      !multiItemAnswer.includes(
        "현재 직장을 유지한 채 준비할 수 있나요?",
      ),

    numberedListIsNotUsed:
      !/\n\n1\.\s/.test(
        multiItemAnswer,
      )
      && !multiItemAnswer.includes(
        "2.",
      ),

    conclusionIsNotConfirmedYet:
      multiItemAnswer.includes(
        "결론을 확정하지 않",
      ),

    rebuiltPendingShowsNextQuestionOnly:
      rebuiltAnswer.includes(
        "현재 직장을 유지한 채 준비할 수 있나요?",
      )
      && !rebuiltAnswer.includes(
        "생활비를 제외하고 사용할 수 있는 여유자금은 얼마인가요?",
      ),

    birthDateAcknowledgementIsPreserved:
      birthDateAnswer.includes(
        "말씀하신 생년월일은 확인했습니다.",
      ),

    birthDateDetailsAreRequested:
      birthDateAnswer.includes(
        "양력·음력 여부",
      )
      && birthDateAnswer.includes(
        "성별",
      )
      && birthDateAnswer.includes(
        "출생시간",
      ),

    birthDateFlowDoesNotListSecondQuestion:
      !birthDateAnswer.includes(
        "생활비를 제외하고 사용할 수 있는 여유자금은 얼마인가요?",
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
