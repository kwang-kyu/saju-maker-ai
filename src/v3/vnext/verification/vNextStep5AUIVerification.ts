/**
 * vNext STEP 5A UI Integration Verification.
 */

import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  createMockResponseGateway,
} from "../gpt/responseGateway.js";
import {
  buildExpectedPhasesForAction,
  simulateVNextConsultingFlow,
} from "../ui/vNextConsultingController.js";
import {
  INITIAL_VNEXT_CONSULTING_SESSION_STATE,
  type VNextConsultingPhase,
} from "../ui/vNextConsultingState.js";
import {
  mapNaturalResponseToMessage,
} from "../ui/vNextResponseMapper.js";
import {
  runVNextConsultingPipeline,
} from "../ui/vNextConsultingPipeline.js";
import {
  buildResponsePromptFromAction,
} from "../prompt/responsePromptBuilder.js";
import {
  generateNaturalConsultingResponse,
} from "../gpt/responseGateway.js";
export type VNextStep5AUICase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep5AUIVerificationResult = {
  passed: boolean;
  cases: VNextStep5AUICase[];
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
): Promise<VNextStep5AUICase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

export async function verifyVNextStep5AUI(): Promise<VNextStep5AUIVerificationResult> {
  const cases = await Promise.all([
    runCase("case-1-career-question", async () => {
      const request = buildVerificationRequest(
        "나에게 맞는 직업은 무엇인가요?",
      );
      const phases: VNextConsultingPhase[] = [];

      const { result } = await simulateVNextConsultingFlow(
        request,
        createMockResponseGateway(),
        (phase) => phases.push(phase),
      );

      return {
        passed: includesPhaseSequence(phases, [
          "analyzing",
          "generating",
          "streaming",
          "completed",
        ])
          && result.actionType === "consulting"
          && result.response.text.length > 0
          && result.response.apiCallCount === 1,
        details: [
          `phases=${phases.join("→")}`,
          `action=${result.actionType}`,
          `apiCallCount=${result.response.apiCallCount}`,
        ],
      };
    }),

    runCase("case-2-october-money", async () => {
      const request = buildVerificationRequest(
        "10월 금전운이 있을까요?",
      );
      const phases: VNextConsultingPhase[] = [];

      const { result } = await simulateVNextConsultingFlow(
        request,
        createMockResponseGateway(),
        (phase) => phases.push(phase),
      );

      return {
        passed: includesPhaseSequence(phases, [
          "analyzing",
          "generating",
          "streaming",
          "completed",
        ])
          && result.actionType === "consulting"
          && result.response.text.length > 0,
        details: [
          `phases=${phases.join("→")}`,
          `source=${result.response.source}`,
        ],
      };
    }),

    runCase("case-3-compatibility-clarification", async () => {
      const request = buildVerificationRequest(
        "상대방과 궁합은 어떤가요?",
      );
      const phases: VNextConsultingPhase[] = [];

      const { result } = await simulateVNextConsultingFlow(
        request,
        createMockResponseGateway(),
        (phase) => phases.push(phase),
      );

      return {
        passed: includesPhaseSequence(phases, [
          "analyzing",
          "clarifying",
          "completed",
        ])
          && result.actionType === "clarification"
          && result.response.apiCallCount === 0
          && result.response.source === "clarification"
          && result.response.text.length > 0,
        details: [
          `phases=${phases.join("→")}`,
          `apiCallCount=${result.response.apiCallCount}`,
        ],
      };
    }),

    runCase("case-4-direct-action", async () => {
      const gateway = createMockResponseGateway();
      const response = await generateNaturalConsultingResponse({
        action: {
          type: "direct",
          reason: "test direct",
          context: null,
        },
        prompt: null,
        gateway,
      });

      const expectedPhases = buildExpectedPhasesForAction("direct");
      const consultingPhases = buildExpectedPhasesForAction("consulting");

      return {
        passed: response.apiCallCount === 0
          && response.source === "direct"
          && gateway.getCallRecord().callCount === 0
          && response.text.length > 0
          && expectedPhases.join("→") === "analyzing→completed"
          && consultingPhases.includes("generating")
          && !expectedPhases.includes("generating"),
        details: [
          `source=${response.source}`,
          `gatewayCalls=${gateway.getCallRecord().callCount}`,
          `directPhases=${expectedPhases.join("→")}`,
        ],
      };
    }),

    runCase("case-5-gateway-error-fallback", async () => {
      const request = buildVerificationRequest(
        "10월 금전운이 있을까요?",
      );

      const errorGateway = createMockResponseGateway({
        simulateError: true,
      });

      const result = await runVNextConsultingPipeline({
        request,
        gateway: errorGateway,
      });

      const mappedMessage = mapNaturalResponseToMessage(
        result.response,
      );

      return {
        passed: result.response.source === "fallback"
          && result.response.text.length > 0
          && mappedMessage.text.length > 0
          && mappedMessage.source === "fallback"
          && INITIAL_VNEXT_CONSULTING_SESSION_STATE.phase === "idle",
        details: [
          `source=${result.response.source}`,
          `validated=${result.response.validated}`,
          `textLength=${result.response.text.length}`,
          `mappedSource=${mappedMessage.source}`,
        ],
      };
    }),

    runCase("case-6-clarification-panel-ui", async () => {
      const request = buildVerificationRequest(
        "상대방과 궁합은 어떤가요?",
      );

      const result = await runVNextConsultingPipeline({
        request,
        gateway: createMockResponseGateway(),
      });

      const prompt = buildResponsePromptFromAction({
        type: "clarification",
        reason: "test",
        context: null,
      });

      const clarificationMessage = mapNaturalResponseToMessage(
        result.response,
      );

      return {
        passed: result.actionType === "clarification"
          && clarificationMessage.source === "clarification"
          && clarificationMessage.text.length > 0
          && prompt === null,
        details: [
          `action=${result.actionType}`,
          `messageSource=${clarificationMessage.source}`,
          `promptGenerated=${prompt !== null}`,
        ],
      };
    }),
  ]);

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep5AUIResult(
  result: VNextStep5AUIVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
