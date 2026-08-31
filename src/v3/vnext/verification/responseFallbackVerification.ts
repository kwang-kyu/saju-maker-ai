import {
  buildClarificationResponse,
  buildConsultingFallback,
  buildDirectResponse,
} from "../gpt/responseFallbackBuilder.js";
import {
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";
import type {
  ResponseAction,
} from "../response/responseContext.js";

export type ResponseFallbackVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type ResponseFallbackVerificationResult = {
  passed: boolean;
  cases: ResponseFallbackVerificationCase[];
};

function assertNoNewJudgment(text: string): boolean {
  const forbidden = [
    "반드시 성공",
    "100% 확실",
    "새로운 사주 계산",
    "일간 辛",
  ];

  return !forbidden.some((item) => text.includes(item));
}

export function verifyResponseFallback(): ResponseFallbackVerificationResult {
  const cases: ResponseFallbackVerificationCase[] = [];

  const moneyFlow = runPromptPipelineCase(
    "10월 금전운이 있을까요?",
    { includeLuckFlow: true },
  );

  if (moneyFlow.context) {
    const fallback = buildConsultingFallback(moneyFlow.context);
    cases.push({
      id: "case-1-october-money-fallback",
      passed: fallback.includes("10월")
        && fallback.includes("시기별")
        && assertNoNewJudgment(fallback),
      details: [
        `length=${fallback.length}`,
        `containsPeriod=${fallback.includes("10월")}`,
      ],
    });
  } else {
    cases.push({
      id: "case-1-october-money-fallback",
      passed: false,
      details: ["context unavailable"],
    });
  }

  const clarificationPipeline = runPromptPipelineCase(
    "상대방과 궁합은 어떤가요?",
  );
  const clarificationAction: ResponseAction = clarificationPipeline.action;
  const clarificationText = buildClarificationResponse(clarificationAction);

  cases.push({
    id: "case-2-clarification-response",
    passed: clarificationAction.type === "clarification"
      && clarificationText.includes("필요")
      && assertNoNewJudgment(clarificationText),
    details: [
      `action=${clarificationAction.type}`,
      `length=${clarificationText.length}`,
    ],
  });

  const directAction: ResponseAction = {
    type: "direct",
    reason: "assessment is insufficient and blueprint is unavailable",
    context: null,
  };
  const directText = buildDirectResponse(directAction);

  cases.push({
    id: "case-3-direct-response",
    passed: directText.length > 0 && assertNoNewJudgment(directText),
    details: [`length=${directText.length}`],
  });

  const career = runPromptPipelineCase("나에게 맞는 직업은 무엇인가요?");

  if (career.context) {
    const careerFallback = buildConsultingFallback(career.context);
    cases.push({
      id: "case-4-career-fallback",
      passed: careerFallback.length > 0 && assertNoNewJudgment(careerFallback),
      details: [`length=${careerFallback.length}`],
    });
  } else {
    cases.push({
      id: "case-4-career-fallback",
      passed: false,
      details: ["context unavailable"],
    });
  }

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeResponseFallbackVerificationResult(
  result: ResponseFallbackVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
