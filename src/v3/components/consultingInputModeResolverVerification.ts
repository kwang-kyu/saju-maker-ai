import {
  resolveDefaultInputMode,
  resolveInputModeAfterResponse,
  resolveRequestKind,
  resolveTurnUserLabel,
} from "./consultingInputModeResolver";
import type {
  V3ConsultingPendingClarification,
} from "../services/v3ConsultingSessionApiClient";

export type ConsultingInputModeResolverVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

const pendingClarification:
  V3ConsultingPendingClarification = {
    decisionTurnId:
      "turn-001",

    items: [
      {
        key:
          "monthlyLivingCost",

        description:
          "현재 고정 생활비",

        question:
          "생활비를 제외하고 사용할 수 있는 여유자금은 얼마인가요?",
      },
    ],
  };

export function verifyConsultingInputModeResolver():
  ConsultingInputModeResolverVerificationResult {
  const checks = {
    pendingDefaultsToClarification:
      resolveDefaultInputMode(
        pendingClarification,
      ) === "clarification",

    noPendingDefaultsToFollowUp:
      resolveDefaultInputMode(
        null,
      ) === "followUp",

    clarificationModeSendsClarificationKind:
      resolveRequestKind(
        "clarification",
      ) === "clarification",

    followUpModeSendsFollowUpKind:
      resolveRequestKind(
        "followUp",
      ) === "followUp",

    responseWithPendingReturnsClarification:
      resolveInputModeAfterResponse(
        pendingClarification,
      ) === "clarification",

    responseWithoutPendingReturnsFollowUp:
      resolveInputModeAfterResponse(
        null,
      ) === "followUp",

    awaitingClarificationFollowUpSelectionStaysFollowUp:
      resolveRequestKind(
        "followUp",
      ) === "followUp",

    initialTurnLabelIsQuestion:
      resolveTurnUserLabel(
        "initial",
        1,
      ) === "질문 1",

    followUpTurnLabelIsQuestion:
      resolveTurnUserLabel(
        "followUp",
        2,
      ) === "질문 2",

    clarificationTurnLabelIsAnswer:
      resolveTurnUserLabel(
        "clarification",
        3,
      ) === "답변 3",
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
