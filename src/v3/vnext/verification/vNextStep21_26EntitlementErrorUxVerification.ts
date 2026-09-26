/**
 * STEP 21-26 — Consulting entitlement/auth error UX preservation.
 *
 * Access/auth API errors must reach controller error phase,
 * not be absorbed into fallback completed answers.
 */

import {
  ConsultingAccessAuthError,
  createMockResponseGateway,
  generateNaturalConsultingResponse,
  generateNaturalConsultingResponseStreaming,
  isConsultingAccessAuthErrorCode,
} from "../gpt/responseGateway.js";
import type {
  ResponseGateway,
} from "../gpt/responseGateway.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";
import type {
  ResponseGenerationResult,
} from "../gpt/responseGatewayTypes.js";
import {
  buildResponsePromptFromAction,
} from "../prompt/responsePromptBuilder.js";
import {
  createRemoteResponseGateway,
} from "../ui/vNextRemoteResponseGateway.js";
import {
  resolveConsultingControllerErrorMessage,
  isConsultingAccessAuthRetryAllowed,
  VNextConsultingController,
} from "../ui/vNextConsultingController.js";
import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";

export type VNextStep21_26EntitlementErrorUxCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep21_26EntitlementErrorUxVerificationResult = {
  passed: boolean;
  cases: VNextStep21_26EntitlementErrorUxCase[];
};

const ACCESS_CODES = [
  "authenticationRequired",
  "subscriptionRequired",
  "paymentRequired",
  "inactive",
  "subscriptionUnavailable",
] as const;

const EXPECTED_MESSAGES: Record<(typeof ACCESS_CODES)[number], string> = {
  authenticationRequired:
    "로그인이 필요합니다. 로그인 후 다시 이용해 주세요.",
  subscriptionRequired:
    "이 상담은 프리미엄 구독이 필요합니다.",
  paymentRequired:
    "구독 결제에 문제가 있어 상담을 진행할 수 없습니다.",
  inactive:
    "현재 구독이 활성화되어 있지 않아 상담을 이용할 수 없습니다.",
  subscriptionUnavailable:
    "잠시 후 다시 시도해 주세요.",
};

function buildPrompt(): ResponsePrompt {
  return {
    systemInstruction: "Engine judges, GPT explains.",
    userPrompt: "10월 금전운을 설명해 주세요.",
    metadata: {
      answerMode: "question",
      scenario: "timingAssessment",
      budget: "standard",
      selectedBlockIds: ["assessmentSummary"],
      estimatedSize: 1200,
      conversationStyle: "consulting",
    },
  };
}

function buildRequest(question: string): V3ConsultingRequest {
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

function createErrorGateway(
  code: string,
): ResponseGateway & {
  getCallRecord: () => {
    promptReceived: boolean;
    metadataReceived: boolean;
    callCount: number;
  };
} {
  let callCount = 0;

  return {
    getCallRecord() {
      return {
        promptReceived: callCount > 0,
        metadataReceived: callCount > 0,
        callCount,
      };
    },
    async generate(): Promise<ResponseGenerationResult> {
      callCount += 1;

      return {
        text: "",
        status: "error",
        latencyMs: 1,
        error: {
          code,
          message: `Remote gateway returned 403`,
        },
      };
    },
    async generateStream(_prompt, _options, listener) {
      callCount += 1;
      const error = {
        code,
        message: `Remote stream gateway returned 403`,
      };
      listener.onEvent({
        type: "error",
        error,
      });

      return {
        text: "",
        status: "error",
        latencyMs: 1,
        error,
      };
    },
  };
}

async function runCase(
  id: string,
  run: () => Promise<{
    passed: boolean;
    details: string[];
  }>,
): Promise<VNextStep21_26EntitlementErrorUxCase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

export async function verifyVNextStep21_26EntitlementErrorUx(): Promise<
  VNextStep21_26EntitlementErrorUxVerificationResult
> {
  const cases: VNextStep21_26EntitlementErrorUxCase[] = [];
  const { action } = runPromptPipelineCase(
    "10월 금전운이 있을까요?",
    { includeLuckFlow: true },
  );
  const prompt = buildResponsePromptFromAction(action);

  if (action.type !== "consulting" || !prompt || !action.context) {
    return {
      passed: false,
      cases: [{
        id: "fixture-consulting-action",
        passed: false,
        details: [
          `action=${action.type}`,
          `hasPrompt=${Boolean(prompt)}`,
          `hasContext=${Boolean(action.context)}`,
        ],
      }],
    };
  }

  for (const code of ACCESS_CODES) {
    cases.push(await runCase(`remote-preserve-${code}`, async () => {
      const gateway = createRemoteResponseGateway({
        fetchImpl: async () => new Response(
          JSON.stringify({ error: code }),
          {
            status: code === "authenticationRequired"
              ? 401
              : code === "subscriptionUnavailable"
                ? 503
                : 403,
            headers: { "Content-Type": "application/json" },
          },
        ),
      });

      const result = await gateway.generate(buildPrompt());

      return {
        passed: result.status === "error"
          && result.error?.code === code
          && typeof result.error.message === "string"
          && /returned \d+/.test(result.error.message),
        details: [
          `status=${result.status}`,
          `code=${result.error?.code ?? "none"}`,
          `message=${result.error?.message ?? "none"}`,
        ],
      };
    }));

    cases.push(await runCase(`no-fallback-${code}`, async () => {
      let thrown: unknown;

      try {
        await generateNaturalConsultingResponse({
          action,
          prompt,
          gateway: createErrorGateway(code),
        });
      } catch (error) {
        thrown = error;
      }

      const isAccessError = thrown instanceof ConsultingAccessAuthError
        && thrown.code === code;

      return {
        passed: isAccessError,
        details: [
          `thrown=${thrown instanceof Error ? thrown.name : typeof thrown}`,
          `code=${
            thrown instanceof ConsultingAccessAuthError
              ? thrown.code
              : "none"
          }`,
        ],
      };
    }));

    cases.push(await runCase(`controller-ux-${code}`, async () => {
      const controller = new VNextConsultingController({
        gateway: createErrorGateway(code),
      });

      await controller.submitQuestion(
        buildRequest("10월 금전운이 있을까요?"),
      );

      const state = controller.getState();
      const expected = EXPECTED_MESSAGES[code];
      const retryAllowed = isConsultingAccessAuthRetryAllowed(code);
      const retryExpected = code === "subscriptionUnavailable";
      // Same gate as VNextConversationArea retry CTA.
      const showRetryCta = !isConsultingAccessAuthErrorCode(state.errorCode)
        || isConsultingAccessAuthRetryAllowed(state.errorCode);

      return {
        passed: state.phase === "error"
          && state.errorMessage === expected
          && state.errorCode === code
          && state.turns.length === 0
          && retryAllowed === retryExpected
          && showRetryCta === retryExpected,
        details: [
          `phase=${state.phase}`,
          `message=${state.errorMessage ?? "none"}`,
          `errorCode=${state.errorCode ?? "none"}`,
          `turns=${state.turns.length}`,
          `retryAllowed=${retryAllowed}`,
          `showRetryCta=${showRetryCta}`,
        ],
      };
    }));
  }

  cases.push(await runCase("ordinary-controller-error-keeps-retry-cta", async () => {
    const controller = new VNextConsultingController({
      gateway: {
        async generate() {
          throw new Error("ordinary boom");
        },
        async generateStream() {
          throw new Error("ordinary boom");
        },
      },
    });

    await controller.submitQuestion(
      buildRequest("10월 금전운이 있을까요?"),
    );

    const state = controller.getState();
    const showRetryCta = !isConsultingAccessAuthErrorCode(state.errorCode)
      || isConsultingAccessAuthRetryAllowed(state.errorCode);

    return {
      passed: state.phase === "error"
        && state.errorMessage
          === "상담을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
        && state.errorCode === null
        && showRetryCta === true,
      details: [
        `phase=${state.phase}`,
        `message=${state.errorMessage ?? "none"}`,
        `errorCode=${state.errorCode ?? "none"}`,
        `showRetryCta=${showRetryCta}`,
      ],
    };
  }));

  cases.push(await runCase("ordinary-remote-keeps-fallback", async () => {
    const response = await generateNaturalConsultingResponse({
      action,
      prompt,
      gateway: createErrorGateway("remote_gateway_error"),
    });

    return {
      passed: response.source === "fallback"
        && response.validated === false
        && (response.validationIssues ?? []).includes("remote_gateway_error")
        && response.text.trim().length > 0,
      details: [
        `source=${response.source}`,
        `issues=${(response.validationIssues ?? []).join(",")}`,
      ],
    };
  }));

  cases.push(await runCase("ordinary-network-keeps-fallback-stream", async () => {
    const response = await generateNaturalConsultingResponseStreaming({
      action,
      prompt,
      gateway: createErrorGateway("remote_gateway_network_error"),
    });

    return {
      passed: response.source === "fallback"
        && (response.validationIssues ?? [])
          .includes("remote_gateway_network_error"),
      details: [
        `source=${response.source}`,
        `issues=${(response.validationIssues ?? []).join(",")}`,
      ],
    };
  }));

  cases.push(await runCase("json-parse-failure-keeps-remote-gateway-error", async () => {
    const gateway = createRemoteResponseGateway({
      fetchImpl: async () => new Response("not-json", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      }),
    });

    const result = await gateway.generate(buildPrompt());

    return {
      passed: result.status === "error"
        && result.error?.code === "remote_gateway_error",
      details: [
        `code=${result.error?.code ?? "none"}`,
        `message=${result.error?.message ?? "none"}`,
      ],
    };
  }));

  cases.push(await runCase("message-mapping-helpers", async () => {
    const mapped = ACCESS_CODES.every((code) => {
      const error = new ConsultingAccessAuthError(code);
      return resolveConsultingControllerErrorMessage(error)
        === EXPECTED_MESSAGES[code]
        && isConsultingAccessAuthErrorCode(code) === true;
    });

    const defaultMessage = resolveConsultingControllerErrorMessage(
      new Error("boom"),
    );

    return {
      passed: mapped
        && defaultMessage
          === "상담을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
        && isConsultingAccessAuthErrorCode("remote_gateway_error") === false,
      details: [
        `mapped=${mapped}`,
        `default=${defaultMessage}`,
      ],
    };
  }));

  cases.push(await runCase("mock-success-unaffected", async () => {
    const gateway = createMockResponseGateway();
    const response = await generateNaturalConsultingResponse({
      action,
      prompt,
      gateway,
    });

    return {
      passed: response.source === "gpt"
        && response.validated === true
        && response.text.trim().length > 0,
      details: [
        `source=${response.source}`,
        `validated=${response.validated}`,
      ],
    };
  }));

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep21_26EntitlementErrorUxVerificationResult(
  result: VNextStep21_26EntitlementErrorUxVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
