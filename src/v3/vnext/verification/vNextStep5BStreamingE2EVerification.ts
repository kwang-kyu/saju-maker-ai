/**
 * vNext STEP 5B Streaming E2E Verification.
 */

import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  createMockResponseGateway,
  generateNaturalConsultingResponseStreaming,
} from "../gpt/responseGateway.js";
import {
  appendStreamDelta,
} from "../gpt/responseStreamUtils.js";
import {
  VNextConsultingController,
} from "../ui/vNextConsultingController.js";
import {
  runVNextConsultingPipeline,
} from "../ui/vNextConsultingPipeline.js";
import type {
  VNextConsultingPhase,
} from "../ui/vNextConsultingState.js";
import type {
  ResponseStreamEvent,
} from "../gpt/responseStreamingTypes.js";

export type VNextStep5BStreamingCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep5BStreamingVerificationResult = {
  passed: boolean;
  cases: VNextStep5BStreamingCase[];
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
): Promise<VNextStep5BStreamingCase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

function includesEventSequence(
  events: ResponseStreamEvent[],
  expected: ResponseStreamEvent["type"][],
): boolean {
  const types = events.map((item) => item.type);
  let searchFrom = 0;

  for (const type of expected) {
    const index = types.indexOf(type, searchFrom);

    if (index === -1) {
      return false;
    }

    searchFrom = index + 1;
  }

  return true;
}

export async function verifyVNextStep5BStreaming(): Promise<VNextStep5BStreamingVerificationResult> {
  const cases = await Promise.all([
    runCase("case-1-career-stream-accumulation", async () => {
      const request = buildVerificationRequest(
        "나에게 맞는 직업은 무엇인가요?",
      );
      const events: ResponseStreamEvent[] = [];
      let accumulated = "";
      const gateway = createMockResponseGateway({
        defaultResponse: "직업 적성은 현재 구조와 흐름을 함께 보는 것이 좋습니다.",
      });

      const result = await runVNextConsultingPipeline({
        request,
        gateway,
        onStreamEvent: (event) => {
          events.push(event);

          if (event.type === "delta" && event.text) {
            accumulated = appendStreamDelta(accumulated, event.text);
          }
        },
      });

      return {
        passed: includesEventSequence(
          events,
          ["start", "delta", "complete"],
        )
          && accumulated.length > 0
          && accumulated === result.response.text
          && result.actionType === "consulting"
          && gateway.getCallRecord().callCount === 1,
        details: [
          `events=${events.map((item) => item.type).join("→")}`,
          `accumulatedLength=${accumulated.length}`,
          `gatewayCalls=${gateway.getCallRecord().callCount}`,
        ],
      };
    }),

    runCase("case-2-october-money-stream-content", async () => {
      const request = buildVerificationRequest(
        "10월 금전운이 있을까요?",
      );
      const gateway = createMockResponseGateway({
        defaultResponse:
          "10월 금전 흐름은 초순과 중순, 말순으로 나누어 보시면 "
          + "시기별 차이를 균형 있게 확인하실 수 있습니다.",
      });

      const result = await runVNextConsultingPipeline({
        request,
        gateway,
      });

      return {
        passed: result.actionType === "consulting"
          && result.response.text.includes("초순")
          && result.response.text.includes("중순")
          && result.response.apiCallCount === 1,
        details: [
          `textLength=${result.response.text.length}`,
          `source=${result.response.source}`,
        ],
      };
    }),

    runCase("case-3-compatibility-clarification-zero-api", async () => {
      const request = buildVerificationRequest(
        "상대방과 궁합은 어떤가요?",
      );
      const gateway = createMockResponseGateway();
      const events: ResponseStreamEvent[] = [];

      const result = await runVNextConsultingPipeline({
        request,
        gateway,
        onStreamEvent: (event) => events.push(event),
      });

      return {
        passed: result.actionType === "clarification"
          && result.response.apiCallCount === 0
          && gateway.getCallRecord().callCount === 0
          && events.length === 0,
        details: [
          `action=${result.actionType}`,
          `streamEvents=${events.length}`,
          `gatewayCalls=${gateway.getCallRecord().callCount}`,
        ],
      };
    }),

    runCase("case-4-direct-zero-api", async () => {
      const gateway = createMockResponseGateway();
      const pipeline = runVNextConsultingPipeline({
        request: buildVerificationRequest(
          "상대방과 궁합은 어떤가요?",
        ),
        gateway,
      }).then(() => null);

      const directResponse = await generateNaturalConsultingResponseStreaming({
        action: {
          type: "direct",
          reason: "test",
          context: null,
        },
        prompt: null,
        gateway,
      });

      await pipeline;

      return {
        passed: directResponse.apiCallCount === 0
          && directResponse.source === "direct"
          && gateway.getCallRecord().callCount === 0,
        details: [
          `source=${directResponse.source}`,
          `gatewayCalls=${gateway.getCallRecord().callCount}`,
        ],
      };
    }),

    runCase("case-5-stream-error-fallback-no-retry", async () => {
      const request = buildVerificationRequest(
        "10월 금전운이 있을까요?",
      );
      const gateway = createMockResponseGateway({
        simulateStreamErrorAfterChunks: 1,
        defaultResponse:
          "10월 금전 흐름은 초순과 중순, 말순으로 나누어 보시면 "
          + "시기별 차이를 균형 있게 확인하실 수 있습니다.",
      });

      const result = await runVNextConsultingPipeline({
        request,
        gateway,
      });

      return {
        passed: gateway.getCallRecord().callCount === 1
          && result.response.text.length > 0
          && (
            result.response.source === "fallback"
            || result.response.source === "gpt"
          ),
        details: [
          `source=${result.response.source}`,
          `gatewayCalls=${gateway.getCallRecord().callCount}`,
          `textLength=${result.response.text.length}`,
        ],
      };
    }),

    runCase("case-6-validation-failure-fallback-single-call", async () => {
      const request = buildVerificationRequest(
        "10월 금전운이 있을까요?",
      );
      const gateway = createMockResponseGateway({
        defaultResponse: "이번 달 반드시 성공합니다.",
      });

      const result = await runVNextConsultingPipeline({
        request,
        gateway,
      });

      return {
        passed: result.response.source === "fallback"
          && result.response.validated === false
          && gateway.getCallRecord().callCount === 1
          && result.response.apiCallCount === 1,
        details: [
          `source=${result.response.source}`,
          `validated=${result.response.validated}`,
          `gatewayCalls=${gateway.getCallRecord().callCount}`,
        ],
      };
    }),

    runCase("case-7-ui-state-transition", async () => {
      const request = buildVerificationRequest(
        "나에게 맞는 직업은 무엇인가요?",
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

      const finalState = controller.getState();

      return {
        passed: includesPhaseSequence(phases, [
          "analyzing",
          "generating",
          "streaming",
          "completed",
        ])
          && finalState.phase === "completed"
          && finalState.streamingText === null
          && finalState.turns.length === 1
          && (finalState.streamMetadata?.apiCallCount ?? 0) === 1,
        details: [
          `phases=${phases.join("→")}`,
          `finalPhase=${finalState.phase}`,
          `apiCallCount=${finalState.streamMetadata?.apiCallCount ?? "null"}`,
        ],
      };
    }),
  ]);

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep5BStreamingResult(
  result: VNextStep5BStreamingVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
