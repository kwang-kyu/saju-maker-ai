/**
 * vNext Response Streaming Verification.
 */

import {
  createMockResponseGateway,
  generateNaturalConsultingResponseStreaming,
} from "../gpt/responseGateway.js";
import {
  appendStreamDelta,
  formatSseEvent,
  parseSseDataLines,
  splitTextIntoStreamChunks,
} from "../gpt/responseStreamUtils.js";
import {
  buildResponsePromptFromAction,
} from "../prompt/responsePromptBuilder.js";
import {
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";
import type {
  ResponseStreamEvent,
} from "../gpt/responseStreamingTypes.js";

export type ResponseStreamingVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type ResponseStreamingVerificationResult = {
  passed: boolean;
  cases: ResponseStreamingVerificationCase[];
};

export async function verifyResponseStreaming(): Promise<ResponseStreamingVerificationResult> {
  const cases: ResponseStreamingVerificationCase[] = [];

  const appendResult = appendStreamDelta("10월의 흐름", "을 보면");
  cases.push({
    id: "case-append-delta",
    passed: appendResult === "10월의 흐름을 보면",
    details: [`text=${appendResult}`],
  });

  const chunks = splitTextIntoStreamChunks("abcdef", 2);
  cases.push({
    id: "case-split-chunks",
    passed: chunks.join("") === "abcdef" && chunks.length === 3,
    details: [`chunks=${chunks.join("|")}`],
  });

  const sse = [
    formatSseEvent({ type: "start" }),
    formatSseEvent({ type: "delta", text: "hello" }),
    formatSseEvent({ type: "complete", fullText: "hello" }),
  ].join("");
  const parsed = parseSseDataLines(sse);
  cases.push({
    id: "case-parse-sse",
    passed: parsed.events.length === 3
      && parsed.events[0]?.type === "start"
      && parsed.events[1]?.text === "hello",
    details: [
      `eventCount=${parsed.events.length}`,
      `types=${parsed.events.map((item) => item.type).join("→")}`,
    ],
  });

  const career = runPromptPipelineCase(
    "나에게 맞는 직업은 무엇인가요?",
  );
  const careerPrompt = buildResponsePromptFromAction(career.action);
  const careerGateway = createMockResponseGateway({
    defaultResponse: "직업 적성은 현재 구조와 흐름을 함께 보는 것이 좋습니다.",
  });
  const careerEvents: ResponseStreamEvent[] = [];
  let careerAccumulated = "";

  const careerResponse = await generateNaturalConsultingResponseStreaming({
    action: career.action,
    prompt: careerPrompt,
    gateway: careerGateway,
    onStreamEvent: (event) => {
      careerEvents.push(event);

      if (event.type === "delta" && event.text) {
        careerAccumulated = appendStreamDelta(careerAccumulated, event.text);
      }
    },
  });

  cases.push({
    id: "case-mock-stream-events",
    passed: careerEvents.some((item) => item.type === "start")
      && careerEvents.some((item) => item.type === "delta")
      && careerEvents.some((item) => item.type === "complete")
      && careerAccumulated === careerResponse.text
      && careerResponse.apiCallCount === 1,
    details: [
      `events=${careerEvents.map((item) => item.type).join("→")}`,
      `accumulatedLength=${careerAccumulated.length}`,
      `apiCallCount=${careerResponse.apiCallCount}`,
    ],
  });

  const clarification = runPromptPipelineCase(
    "상대방과 궁합은 어떤가요?",
  );
  const clarificationGateway = createMockResponseGateway();
  const clarificationResponse = await generateNaturalConsultingResponseStreaming({
    action: clarification.action,
    prompt: buildResponsePromptFromAction(clarification.action),
    gateway: clarificationGateway,
  });

  cases.push({
    id: "case-clarification-zero-stream",
    passed: clarificationResponse.apiCallCount === 0
      && clarificationGateway.getCallRecord().callCount === 0
      && clarificationResponse.source === "clarification",
    details: [
      `apiCallCount=${clarificationResponse.apiCallCount}`,
      `gatewayCalls=${clarificationGateway.getCallRecord().callCount}`,
    ],
  });

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeResponseStreamingVerificationResult(
  result: ResponseStreamingVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
