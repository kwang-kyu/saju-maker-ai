/**
 * vNext STEP 6-4 Consulting Shell UX Verification.
 */

import {
  createMockResponseGateway,
} from "../gpt/responseGateway.js";
import {
  isVNextModeEnabled,
} from "../ui/vNextConsultingUIAdapter.js";
import {
  VNextConsultingController,
} from "../ui/vNextConsultingController.js";
import {
  INITIAL_VNEXT_CONSULTING_SESSION_STATE,
  type VNextConsultingSessionState,
} from "../ui/vNextConsultingState.js";
import {
  canSubmitVNextQuestion,
  shouldShowVNextQuestionComposer,
  shouldUseInitialQuestionSubmit,
} from "../ui/vNextConsultingShellHelpers.js";
import {
  resolveVNextQuestionComposerMode,
} from "../ui/VNextQuestionComposer.js";
import {
  resolveVNextConsultingStatusView,
} from "../ui/VNextConsultingStatus.js";

export type VNextStep6A4ConsultingShellCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep6A4ConsultingShellVerificationResult = {
  passed: boolean;
  cases: VNextStep6A4ConsultingShellCase[];
};

function runSyncCase(
  id: string,
  run: () => {
    passed: boolean;
    details: string[];
  },
): VNextStep6A4ConsultingShellCase {
  const result = run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

async function runAsyncCase(
  id: string,
  run: () => Promise<{
    passed: boolean;
    details: string[];
  }>,
): Promise<VNextStep6A4ConsultingShellCase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

function buildIdleState(): VNextConsultingSessionState {
  return {
    ...INITIAL_VNEXT_CONSULTING_SESSION_STATE,
  };
}

function buildCompletedState(): VNextConsultingSessionState {
  return {
    ...INITIAL_VNEXT_CONSULTING_SESSION_STATE,
    phase: "completed",
    turns: [
      {
        id: "turn-1",
        question: "10월 금전운은?",
        actionType: "consulting",
        response: null,
        messages: [
          {
            id: "msg-1",
            role: "user",
            text: "10월 금전운은?",
            source: "engine",
            createdAt: "2026-09-01T00:00:00.000Z",
            status: "complete",
          },
          {
            id: "msg-2",
            role: "assistant",
            text: "10월 금전 흐름은 초순과 중순으로 나누어 보시면 좋습니다.",
            source: "gpt",
            createdAt: "2026-09-01T00:00:01.000Z",
            status: "complete",
          },
        ],
        latencyMs: 1200,
      },
    ],
  };
}

function buildStreamingState(): VNextConsultingSessionState {
  return {
    ...buildCompletedState(),
    phase: "streaming",
    activeQuestion: "그러면 10월 중순은?",
    streamingText: "10월 중순에는",
    activeTurnId: "turn-2",
  };
}

function buildClarificationState(): VNextConsultingSessionState {
  return {
    ...buildCompletedState(),
    phase: "completed",
    awaitingClarification: true,
    turns: [
      {
        id: "turn-1",
        question: "상대방과 궁합은 어떤가요?",
        actionType: "clarification",
        response: null,
        messages: [
          {
            id: "msg-1",
            role: "user",
            text: "상대방과 궁합은 어떤가요?",
            source: "engine",
            createdAt: "2026-09-01T00:00:00.000Z",
            status: "complete",
          },
          {
            id: "msg-2",
            role: "assistant",
            text: "상대방의 생년월일을 알려주시면 궁합을 확인할 수 있습니다.",
            source: "clarification",
            createdAt: "2026-09-01T00:00:01.000Z",
            status: "complete",
          },
        ],
        latencyMs: 800,
      },
    ],
  };
}

export async function verifyVNextStep6A4ConsultingShell(): Promise<VNextStep6A4ConsultingShellVerificationResult> {
  const cases: VNextStep6A4ConsultingShellCase[] = [
    runSyncCase("case-1-initial-composer-mode", () => {
      const mode = resolveVNextQuestionComposerMode(
        buildIdleState(),
        false,
        false,
      );

      return {
        passed: mode === "initial"
          && shouldShowVNextQuestionComposer(
            buildIdleState(),
            false,
            false,
          ) === true
          && shouldUseInitialQuestionSubmit(buildIdleState()) === true,
        details: [
          `mode=${String(mode)}`,
          `showComposer=true`,
        ],
      };
    }),

    runSyncCase("case-2-streaming-hides-composer", () => {
      const streamingState = buildStreamingState();

      return {
        passed: resolveVNextQuestionComposerMode(
          streamingState,
          false,
          true,
        ) === null
          && shouldShowVNextQuestionComposer(
            streamingState,
            false,
            true,
          ) === false
          && streamingState.activeQuestion !== null
          && streamingState.streamingText !== null,
        details: [
          `activeQuestion=${streamingState.activeQuestion}`,
          `streamingTextLength=${streamingState.streamingText?.length ?? 0}`,
        ],
      };
    }),

    runSyncCase("case-3-completed-shows-follow-up", () => {
      const completedState = buildCompletedState();
      const mode = resolveVNextQuestionComposerMode(
        completedState,
        false,
        false,
      );

      return {
        passed: mode === "followUp"
          && shouldShowVNextQuestionComposer(
            completedState,
            false,
            false,
          ) === true
          && shouldUseInitialQuestionSubmit(completedState) === false,
        details: [
          `mode=${String(mode)}`,
          `turnCount=${completedState.turns.length}`,
        ],
      };
    }),

    runSyncCase("case-4-clarification-composer-mode", () => {
      const clarificationState = buildClarificationState();
      const mode = resolveVNextQuestionComposerMode(
        clarificationState,
        false,
        false,
      );

      return {
        passed: mode === "clarification"
          && clarificationState.awaitingClarification === true,
        details: [
          `mode=${String(mode)}`,
          `awaitingClarification=${clarificationState.awaitingClarification}`,
        ],
      };
    }),

    runSyncCase("case-5-empty-question-prevention", () => {
      const canSubmitEmpty = canSubmitVNextQuestion({
        question: "   ",
        state: buildIdleState(),
        isSubmitting: false,
        isBusy: false,
        isStreaming: false,
        authenticated: true,
      });
      const canSubmitWhileBusy = canSubmitVNextQuestion({
        question: "10월 금전운은?",
        state: buildIdleState(),
        isSubmitting: false,
        isBusy: true,
        isStreaming: false,
        authenticated: true,
      });
      const canSubmitValid = canSubmitVNextQuestion({
        question: "10월 금전운은?",
        state: buildIdleState(),
        isSubmitting: false,
        isBusy: false,
        isStreaming: false,
        authenticated: true,
      });

      return {
        passed: canSubmitEmpty === false
          && canSubmitWhileBusy === false
          && canSubmitValid === true,
        details: [
          `empty=${canSubmitEmpty}`,
          `busy=${canSubmitWhileBusy}`,
          `valid=${canSubmitValid}`,
        ],
      };
    }),

    runSyncCase("case-6-status-labels-for-phases", () => {
      const analyzing = resolveVNextConsultingStatusView(
        {
          ...buildIdleState(),
          phase: "analyzing",
        },
        true,
        false,
        "질문의 흐름을 확인하고 있습니다.",
      );
      const streaming = resolveVNextConsultingStatusView(
        buildStreamingState(),
        false,
        true,
        null,
      );
      const waiting = resolveVNextConsultingStatusView(
        buildClarificationState(),
        false,
        false,
        null,
      );

      return {
        passed: analyzing.label === "질문 확인 중"
          && analyzing.showSpinner === true
          && streaming.label === "답변 표시 중"
          && waiting.label === "추가 정보 필요",
        details: [
          `analyzing=${analyzing.label}`,
          `streaming=${streaming.label}`,
          `waiting=${waiting.label}`,
        ],
      };
    }),

    runSyncCase("case-7-legacy-v3-path-unchanged", () => {
      const legacyEnabled = isVNextModeEnabled({
        hash: "#v3",
        search: "",
      });
      const vNextEnabled = isVNextModeEnabled({
        hash: "#v3?vnext=1",
        search: "",
      });

      return {
        passed: legacyEnabled === false
          && vNextEnabled === true,
        details: [
          `legacy=#v3 → ${legacyEnabled}`,
          `vnext=#v3?vnext=1 → ${vNextEnabled}`,
        ],
      };
    }),

    await runAsyncCase("case-8-multi-turn-submit-boundary", async () => {
      const controller = new VNextConsultingController({
        gateway: createMockResponseGateway(),
      });

      await controller.submitQuestion({
        sajuInput: {
          name: "김천운",
          birthDate: "1984-03-15",
          birthTime: "14:30",
          gender: "male",
          calendarType: "solar",
          referenceDate: "2026-10-01",
          luckStartMethod: "minuteBased",
        },
        humanLifeContextInput: {
          maritalStatus: "married",
          hasChildren: true,
          occupationStatus: "employed",
          hasActiveBusiness: false,
          financialResponsibility: "high",
        },
        question: "10월 금전운은?",
      });

      const afterFirst = controller.getState();

      await controller.submitFollowUpQuestion(
        "그러면 10월 중순은?",
        {
          sajuInput: {
            name: "김천운",
            birthDate: "1984-03-15",
            birthTime: "14:30",
            gender: "male",
            calendarType: "solar",
            referenceDate: "2026-10-01",
            luckStartMethod: "minuteBased",
          },
          humanLifeContextInput: {
            maritalStatus: "married",
            hasChildren: true,
            occupationStatus: "employed",
            hasActiveBusiness: false,
            financialResponsibility: "high",
          },
          question: "그러면 10월 중순은?",
        },
      );

      const afterSecond = controller.getState();

      return {
        passed: afterFirst.turns.length === 1
          && afterSecond.turns.length === 2
          && afterSecond.phase === "completed"
          && resolveVNextQuestionComposerMode(
            afterSecond,
            false,
            false,
          ) === "followUp",
        details: [
          `turnCount=${afterSecond.turns.length}`,
          `phase=${afterSecond.phase}`,
        ],
      };
    }),

    await runAsyncCase("case-9-direct-action-completed-composer", async () => {
      const controller = new VNextConsultingController({
        gateway: createMockResponseGateway(),
      });

      await controller.submitQuestion({
        sajuInput: {
          name: "김천운",
          birthDate: "1984-03-15",
          birthTime: "14:30",
          gender: "male",
          calendarType: "solar",
          referenceDate: "2026-10-01",
          luckStartMethod: "minuteBased",
        },
        humanLifeContextInput: {
          maritalStatus: "married",
          hasChildren: true,
          occupationStatus: "employed",
          hasActiveBusiness: false,
          financialResponsibility: "high",
        },
        question: "상대방과 궁합은 어떤가요?",
      });

      const state = controller.getState();
      const turn = state.turns[0];

      return {
        passed: state.phase === "completed"
          && state.awaitingClarification === true
          && turn?.actionType === "clarification"
          && resolveVNextQuestionComposerMode(
            state,
            false,
            false,
          ) === "clarification",
        details: [
          `action=${String(turn?.actionType)}`,
          `mode=clarification`,
        ],
      };
    }),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep6A4ConsultingShellResult(
  result: VNextStep6A4ConsultingShellVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
