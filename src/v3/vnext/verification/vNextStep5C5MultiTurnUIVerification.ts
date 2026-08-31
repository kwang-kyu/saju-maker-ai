/**
 * vNext STEP 5C-5 Multi-turn Conversation UI Verification.
 */

import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  createMockResponseGateway,
} from "../gpt/responseGateway.js";
import {
  simulateVNextConversationFlow,
  VNextConsultingController,
} from "../ui/vNextConsultingController.js";
import type {
  VNextConsultingPhase,
} from "../ui/vNextConsultingState.js";

export type VNextStep5C5MultiTurnUICase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep5C5MultiTurnUIVerificationResult = {
  passed: boolean;
  cases: VNextStep5C5MultiTurnUICase[];
};

function buildVerificationRequest(
  question: string,
): V3ConsultingRequest {
  return {
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
    question,
  };
}

function includesPhaseSequence(
  phases: VNextConsultingPhase[],
  expected: VNextConsultingPhase[],
): boolean {
  let searchFrom = 0;

  for (const phase of expected) {
    const index = phases.indexOf(phase, searchFrom);

    if (index === -1) {
      return false;
    }

    searchFrom = index + 1;
  }

  return true;
}

async function runCase(
  id: string,
  run: () => Promise<{
    passed: boolean;
    details: string[];
  }>,
): Promise<VNextStep5C5MultiTurnUICase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

export async function verifyVNextStep5C5MultiTurnUI(): Promise<VNextStep5C5MultiTurnUIVerificationResult> {
  const cases = await Promise.all([
    runCase("case-1-controller-multi-turn", async () => {
      const request = buildVerificationRequest(
        "10월 금전운은?",
      );
      const controller = new VNextConsultingController({
        gateway: createMockResponseGateway(),
      });

      await controller.submitQuestion(request);

      const afterFirst = controller.getState();
      const sessionAfterFirst = controller.getConversationSession();

      await controller.submitFollowUpQuestion(
        "그러면 10월 중순은?",
        buildVerificationRequest("그러면 10월 중순은?"),
      );

      const afterSecond = controller.getState();
      const sessionAfterSecond = controller.getConversationSession();

      return {
        passed: afterFirst.turns.length === 1
          && afterSecond.turns.length === 2
          && afterFirst.turns[0].question === "10월 금전운은?"
          && afterSecond.turns[1].question === "그러면 10월 중순은?"
          && sessionAfterFirst !== null
          && sessionAfterSecond !== null
          && sessionAfterFirst.sessionId === sessionAfterSecond.sessionId
          && sessionAfterSecond.turns.length === 2
          && afterSecond.phase === "completed",
        details: [
          `turnCount=${afterSecond.turns.length}`,
          `sessionId=${sessionAfterSecond?.sessionId ?? "null"}`,
          `sameSession=${sessionAfterFirst?.sessionId === sessionAfterSecond?.sessionId}`,
        ],
      };
    }),

    runCase("case-2-follow-up-streaming-phases", async () => {
      const request = buildVerificationRequest(
        "10월 금전운은?",
      );
      const phases: VNextConsultingPhase[] = [];
      const controller = new VNextConsultingController({
        gateway: createMockResponseGateway(),
      });

      controller.subscribe((state) => {
        if (!phases.includes(state.phase)) {
          phases.push(state.phase);
        }
      });

      await controller.submitQuestion(request);
      await controller.submitFollowUpQuestion(
        "그러면 10월 중순은?",
        buildVerificationRequest("그러면 10월 중순은?"),
      );

      const finalState = controller.getState();

      return {
        passed: includesPhaseSequence(phases, [
          "analyzing",
          "generating",
          "streaming",
          "completed",
        ])
          && finalState.turns.length === 2
          && finalState.streamingText === null,
        details: [
          `phases=${phases.join("→")}`,
          `turnCount=${finalState.turns.length}`,
        ],
      };
    }),

    runCase("case-3-first-question-resets-session", async () => {
      const controller = new VNextConsultingController({
        gateway: createMockResponseGateway(),
      });

      await controller.submitQuestion(
        buildVerificationRequest("10월 금전운은?"),
      );

      const firstSessionId = controller.getConversationSession()?.sessionId;

      await controller.submitFollowUpQuestion(
        "그러면 10월 중순은?",
        buildVerificationRequest("그러면 10월 중순은?"),
      );

      await controller.submitQuestion(
        buildVerificationRequest("올해 이직운은?"),
      );

      const finalState = controller.getState();
      const finalSessionId = controller.getConversationSession()?.sessionId;

      return {
        passed: finalState.turns.length === 1
          && finalState.turns[0].question === "올해 이직운은?"
          && firstSessionId !== undefined
          && finalSessionId !== undefined
          && firstSessionId !== finalSessionId,
        details: [
          `turnCount=${finalState.turns.length}`,
          `firstSession=${firstSessionId}`,
          `finalSession=${finalSessionId}`,
        ],
      };
    }),

    runCase("case-4-conversation-pipeline-follow-up-type", async () => {
      const request = buildVerificationRequest(
        "10월 금전운은?",
      );

      const { initialResult, followUpResult } =
        await simulateVNextConversationFlow(
          request,
          "그러면 10월 중순은?",
          createMockResponseGateway(),
        );

      return {
        passed: initialResult.followUpType === "initial"
          && followUpResult.followUpType === "timeRefinement"
          && initialResult.session.turns.length === 1
          && followUpResult.session.turns.length === 2
          && initialResult.session.sessionId
            === followUpResult.session.sessionId,
        details: [
          `initialFollowUpType=${initialResult.followUpType}`,
          `followUpType=${followUpResult.followUpType}`,
          `turnCount=${followUpResult.session.turns.length}`,
        ],
      };
    }),

    runCase("case-5-clarification-preserves-turns", async () => {
      const controller = new VNextConsultingController({
        gateway: createMockResponseGateway(),
      });

      await controller.submitQuestion(
        buildVerificationRequest("상대방과 궁합은 어떤가요?"),
      );

      const afterClarification = controller.getState();

      await controller.submitFollowUpQuestion(
        "1988년 5월 10일",
        buildVerificationRequest("1988년 5월 10일"),
      );

      const afterAnswer = controller.getState();

      return {
        passed: afterClarification.turns.length === 1
          && afterClarification.awaitingClarification === true
          && afterAnswer.turns.length === 2
          && afterAnswer.turns[0].question === "상대방과 궁합은 어떤가요?",
        details: [
          `awaitingClarification=${afterClarification.awaitingClarification}`,
          `turnCount=${afterAnswer.turns.length}`,
          `secondQuestion=${afterAnswer.turns[1]?.question ?? "null"}`,
        ],
      };
    }),
  ]);

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep5C5MultiTurnUIResult(
  result: VNextStep5C5MultiTurnUIVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
