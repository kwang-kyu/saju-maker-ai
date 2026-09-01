/**
 * vNext STEP 6-6 Remote Gateway Wiring Verification.
 *
 * 실제 상담 경로는 Remote Gateway, Mock은 URL opt-in / verification 전용.
 */

import {
  createMockResponseGateway,
} from "../gpt/responseGateway.js";
import {
  isVNextModeEnabled,
} from "../ui/vNextConsultingUIAdapter.js";
import {
  createRemoteResponseGateway,
  isVNextMockGatewayEnabled,
  resolveBrowserGatewayMockMode,
  resolveBrowserResponseGateway,
  VNEXT_CONSULTING_GENERATE_ENDPOINT,
  VNEXT_CONSULTING_STREAM_ENDPOINT,
} from "../ui/vNextRemoteResponseGateway.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";

export type VNextStep6A6RemoteGatewayCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep6A6RemoteGatewayVerificationResult = {
  passed: boolean;
  cases: VNextStep6A6RemoteGatewayCase[];
};

function runSyncCase(
  id: string,
  run: () => {
    passed: boolean;
    details: string[];
  },
): VNextStep6A6RemoteGatewayCase {
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
): Promise<VNextStep6A6RemoteGatewayCase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

function buildVerificationPrompt(): ResponsePrompt {
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

export async function verifyVNextStep6A6RemoteGateway(): Promise<VNextStep6A6RemoteGatewayVerificationResult> {
  const cases: VNextStep6A6RemoteGatewayCase[] = [
    runSyncCase("case-1-vnext-without-mock-uses-remote", () => {
      const vNextEnabled = isVNextModeEnabled({
        hash: "#v3?vnext=1",
        search: "",
      });
      const mockEnabled = isVNextMockGatewayEnabled({
        hash: "#v3?vnext=1",
        search: "",
      });
      const resolvedMode = resolveBrowserGatewayMockMode(
        undefined,
        {
          hash: "#v3?vnext=1",
          search: "",
        },
      );

      return {
        passed: vNextEnabled === true
          && mockEnabled === false
          && resolvedMode === false,
        details: [
          `vnext=${vNextEnabled}`,
          `mock=${mockEnabled}`,
          `resolvedMode=${resolvedMode}`,
        ],
      };
    }),

    runSyncCase("case-2-mock-param-opt-in", () => {
      const mockParam = isVNextMockGatewayEnabled({
        hash: "#v3?vnext=1&mock=1",
        search: "",
      });
      const mockGatewayParam = isVNextMockGatewayEnabled({
        hash: "#v3?vnext=1&mockGateway=1",
        search: "",
      });

      return {
        passed: mockParam === true
          && mockGatewayParam === true,
        details: [
          `mock=1 → ${mockParam}`,
          `mockGateway=1 → ${mockGatewayParam}`,
        ],
      };
    }),

    runSyncCase("case-3-explicit-mockGateway-override", () => {
      const forcedMock = resolveBrowserGatewayMockMode(
        true,
        {
          hash: "#v3?vnext=1",
          search: "",
        },
      );
      const forcedRemote = resolveBrowserGatewayMockMode(
        false,
        {
          hash: "#v3?vnext=1&mock=1",
          search: "",
        },
      );

      return {
        passed: forcedMock === true
          && forcedRemote === false,
        details: [
          `forcedMock=${forcedMock}`,
          `forcedRemote=${forcedRemote}`,
        ],
      };
    }),

    runSyncCase("case-4-endpoint-constants", () => {
      return {
        passed: VNEXT_CONSULTING_GENERATE_ENDPOINT
            === "/api/v3/vnext/consulting-generate"
          && VNEXT_CONSULTING_STREAM_ENDPOINT
            === "/api/v3/vnext/consulting-stream",
        details: [
          `generate=${VNEXT_CONSULTING_GENERATE_ENDPOINT}`,
          `stream=${VNEXT_CONSULTING_STREAM_ENDPOINT}`,
        ],
      };
    }),

    runSyncCase("case-5-legacy-v3-unchanged", () => {
      const legacyEnabled = isVNextModeEnabled({
        hash: "#v3",
        search: "",
      });
      const legacyMock = isVNextMockGatewayEnabled({
        hash: "#v3",
        search: "",
      });

      return {
        passed: legacyEnabled === false
          && legacyMock === false,
        details: [
          `legacyVNext=${legacyEnabled}`,
          `legacyMock=${legacyMock}`,
        ],
      };
    }),

    await runAsyncCase("case-6-remote-generate-calls-api", async () => {
      const calls: string[] = [];
      const gateway = createRemoteResponseGateway({
        fetchImpl: async (input) => {
          calls.push(String(input));

          return new Response(
            JSON.stringify({
              text: "원격 GPT 응답",
              status: "success",
              model: "gpt-test",
              latencyMs: 120,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        },
      });

      const result = await gateway.generate(buildVerificationPrompt());

      return {
        passed: calls.length === 1
          && calls[0] === VNEXT_CONSULTING_GENERATE_ENDPOINT
          && result.status === "success"
          && result.text === "원격 GPT 응답",
        details: [
          `calls=${calls.join(",")}`,
          `status=${result.status}`,
        ],
      };
    }),

    await runAsyncCase("case-7-remote-stream-calls-api", async () => {
      const calls: string[] = [];
      const events: string[] = [];
      const gateway = createRemoteResponseGateway({
        fetchImpl: async (input) => {
          calls.push(String(input));

          const body = [
            'data: {"type":"start","model":"gpt-test"}',
            "",
            'data: {"type":"delta","text":"스트림 "}',
            "",
            'data: {"type":"delta","text":"응답"}',
            "",
            'data: {"type":"complete","fullText":"스트림 응답","model":"gpt-test","latencyMs":150}',
            "",
          ].join("\n");

          return new Response(body, {
            status: 200,
            headers: {
              "Content-Type": "text/event-stream; charset=utf-8",
            },
          });
        },
      });

      const result = await gateway.generateStream!(
        buildVerificationPrompt(),
        undefined,
        {
          onEvent: (event) => {
            events.push(event.type);
          },
        },
      );

      return {
        passed: calls.length === 1
          && calls[0] === VNEXT_CONSULTING_STREAM_ENDPOINT
          && events.includes("delta")
          && events.includes("complete")
          && result.status === "success"
          && result.text === "스트림 응답",
        details: [
          `calls=${calls.join(",")}`,
          `events=${events.join(",")}`,
          `status=${result.status}`,
        ],
      };
    }),

    await runAsyncCase("case-8-browser-gateway-mock-vs-remote", async () => {
      const mockGateway = resolveBrowserResponseGateway(true);
      const mockResult = await mockGateway.generate(buildVerificationPrompt());

      const remoteFetchState = { called: false };
      const remoteGateway = createRemoteResponseGateway({
        fetchImpl: async () => {
          remoteFetchState.called = true;

          return new Response(
            JSON.stringify({
              text: "remote",
              status: "success",
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        },
      });
      const remoteResult = await remoteGateway.generate(buildVerificationPrompt());

      return {
        passed: mockResult.text.includes("현재 확인된 분석 결과")
          && remoteFetchState.called
          && remoteResult.status === "success"
          && remoteResult.text === "remote",
        details: [
          `mockContainsDefault=${mockResult.text.includes("현재 확인된 분석 결과")}`,
          `remoteFetchCalled=${remoteFetchState.called}`,
          `remoteText=${remoteResult.text}`,
        ],
      };
    }),

    await runAsyncCase("case-9-mock-gateway-for-verification-only", async () => {
      const gateway = createMockResponseGateway({
        defaultResponse: "verification mock",
      });
      const result = await gateway.generate(buildVerificationPrompt());
      const callRecord = gateway.getCallRecord();

      return {
        passed: result.text === "verification mock"
          && callRecord.callCount === 1
          && callRecord.promptReceived === true,
        details: [
          `text=${result.text}`,
          `callCount=${callRecord.callCount}`,
          `promptReceived=${callRecord.promptReceived}`,
        ],
      };
    }),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep6A6RemoteGatewayResult(
  result: VNextStep6A6RemoteGatewayVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
