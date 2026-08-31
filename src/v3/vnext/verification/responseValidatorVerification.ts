import {
  validateConsultingResponse,
} from "../gpt/responseValidator.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";

export type ResponseValidatorVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
  expectedValid: boolean;
  issueCodes: string[];
};

export type ResponseValidatorVerificationResult = {
  passed: boolean;
  cases: ResponseValidatorVerificationCase[];
};

function buildMockPrompt(
  answerMode: ResponsePrompt["metadata"]["answerMode"] = "question",
): ResponsePrompt {
  return {
    systemInstruction: "test system",
    userPrompt: "test user",
    metadata: {
      answerMode,
      scenario: "generalFlow",
      budget: "standard",
      selectedBlockIds: ["periodOverview"],
      estimatedSize: 100,
      conversationStyle: "conversational",
    },
  };
}

function runValidatorCase(
  id: string,
  text: string,
  expectedValid: boolean,
  expectedIssueCodes: string[] = [],
  answerMode: ResponsePrompt["metadata"]["answerMode"] = "question",
): ResponseValidatorVerificationCase {
  const result = validateConsultingResponse({
    text,
    prompt: buildMockPrompt(answerMode),
  });

  const issueCodes = result.issues.map((item) => item.code);
  const checks = [
    result.valid === expectedValid,
    expectedIssueCodes.every((code) => issueCodes.includes(code)),
  ];

  return {
    id,
    passed: checks.every(Boolean),
    details: [
      `valid=${result.valid}`,
      `expectedValid=${expectedValid}`,
      `issues=${issueCodes.join(",") || "none"}`,
    ],
    expectedValid,
    issueCodes,
  };
}

export function verifyResponseValidator(): ResponseValidatorVerificationResult {
  const validResponse =
    "10월은 시기별로 흐름이 다르게 나타날 수 있어, 한쪽으로 단정하기보다 초·중·말 흐름을 나누어 보는 것이 좋습니다.";

  const cases = [
    runValidatorCase(
      "case-1-valid-natural-response",
      validResponse,
      true,
    ),
    runValidatorCase(
      "case-2-empty-response",
      "   ",
      false,
      ["empty_response"],
    ),
    runValidatorCase(
      "case-3-technical-fragment",
      "일간 辛(金) ↔ 월운",
      false,
      ["technical_fragment"],
    ),
    runValidatorCase(
      "case-4-definite-event",
      "이번 달 반드시 성공합니다.",
      false,
      ["definite_event_assertion"],
    ),
    runValidatorCase(
      "case-5-json-dump",
      '{"dayMaster":"辛","monthLuck":"丁酉"}',
      false,
      ["json_dump"],
    ),
    runValidatorCase(
      "case-6-forbidden-structure-question-mode",
      "결론: 좋습니다.\n근거: 확인됨.\n주의사항: 주의하세요.",
      false,
      ["forbidden_structure_repetition"],
    ),
    runValidatorCase(
      "case-7-report-mode-allows-structure",
      "## 결론\n분석 결과입니다.\n## 근거\n확인된 조건입니다.",
      true,
      [],
      "report",
    ),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeResponseValidatorVerificationResult(
  result: ResponseValidatorVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
