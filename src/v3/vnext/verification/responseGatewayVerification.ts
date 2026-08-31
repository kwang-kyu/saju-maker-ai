import {
  buildResponsePromptFromAction,
} from "../prompt/responsePromptBuilder.js";
import {
  createMockResponseGateway,
  generateNaturalConsultingResponse,
} from "../gpt/responseGateway.js";
import {
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";
import type {
  ResponseActionType,
} from "../response/responseContext.js";

export type ResponseGatewayVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
  actionType: ResponseActionType;
  apiCallCount: number;
};

export type ResponseGatewayVerificationResult = {
  passed: boolean;
  cases: ResponseGatewayVerificationCase[];
};

async function runGatewayCase(
  id: string,
  questionText: string,
  expectedAction: ResponseActionType,
  expectedApiCalls: number,
  options?: Parameters<typeof runPromptPipelineCase>[1],
): Promise<ResponseGatewayVerificationCase> {
  const { action } = runPromptPipelineCase(questionText, options);
  const prompt = buildResponsePromptFromAction(action);
  const gateway = createMockResponseGateway();

  const response = await generateNaturalConsultingResponse({
    action,
    prompt,
    gateway,
  });

  const callRecord = gateway.getCallRecord();
  const gateWouldCall = action.type === "consulting" && prompt !== null;

  const checks = [
    action.type === expectedAction,
    response.apiCallCount === expectedApiCalls,
    callRecord.callCount === expectedApiCalls,
    gateWouldCall === (expectedApiCalls > 0),
    expectedApiCalls === 0 || callRecord.promptReceived,
    expectedApiCalls === 0 || callRecord.metadataReceived,
    response.text.trim().length > 0,
  ];

  return {
    id,
    passed: checks.every(Boolean),
    details: [
      `action=${action.type}`,
      `expectedAction=${expectedAction}`,
      `apiCallCount=${response.apiCallCount}`,
      `gatewayCallCount=${callRecord.callCount}`,
      `promptReceived=${callRecord.promptReceived}`,
      `metadataReceived=${callRecord.metadataReceived}`,
      `source=${response.source}`,
    ],
    actionType: action.type,
    apiCallCount: response.apiCallCount,
  };
}

export async function verifyResponseGateway(): Promise<ResponseGatewayVerificationResult> {
  const cases = await Promise.all([
    runGatewayCase(
      "case-1-career-consulting",
      "나에게 맞는 직업은 무엇인가요?",
      "consulting",
      1,
    ),
    runGatewayCase(
      "case-2-october-money-flow",
      "10월 금전운이 있을까요?",
      "consulting",
      1,
      { includeLuckFlow: true },
    ),
    runGatewayCase(
      "case-3-store-opening",
      "10월에 가게를 오픈하려고 하는데 어떨까요?",
      "consulting",
      1,
      { includeLuckFlow: true },
    ),
    runGatewayCase(
      "case-4-compatibility-clarification",
      "상대방과 궁합은 어떤가요?",
      "clarification",
      0,
    ),
    (async (): Promise<ResponseGatewayVerificationCase> => {
      const action = {
        type: "direct" as const,
        reason: "assessment is insufficient and blueprint is unavailable",
        context: null,
      };
      const gateway = createMockResponseGateway();
      const response = await generateNaturalConsultingResponse({
        action,
        prompt: null,
        gateway,
      });
      const callRecord = gateway.getCallRecord();

      const checks = [
        action.type === "direct",
        response.apiCallCount === 0,
        callRecord.callCount === 0,
        response.source === "direct",
        response.text.length > 0,
      ];

      return {
        id: "case-5-direct-bypass",
        passed: checks.every(Boolean),
        details: [
          `action=${action.type}`,
          `apiCallCount=${response.apiCallCount}`,
          `source=${response.source}`,
        ],
        actionType: action.type,
        apiCallCount: response.apiCallCount,
      };
    })(),
  ]);

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeResponseGatewayVerificationResult(
  result: ResponseGatewayVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
