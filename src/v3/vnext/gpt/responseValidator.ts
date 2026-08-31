/**
 * vNext Response Validator.
 *
 * GPT 응답을 UI에 전달하기 전 검증한다.
 */

import type {
  AnswerMode,
} from "../types/answerBlueprint.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";
import {
  QUESTION_MODE_FORBIDDEN_STRUCTURES,
} from "../prompt/promptTemplate.js";

export type ResponseValidationIssue = {
  code: string;
  message: string;
};

export type ResponseValidationResult = {
  valid: boolean;
  issues: ResponseValidationIssue[];
};

const TECHNICAL_FRAGMENT_PATTERN =
  /(?:일간|월운|년운|시운|대운|십신|편관|정관|편재|정재|비견|겁재|식신|상관|편인|정인)\s*[^.!?]*(?:↔|→|←|\(|\)|\[)[^.!?]*$/u;

const JSON_DUMP_PATTERN =
  /^\s*[\[{]|"\w+"\s*:\s*[\[{"]/u;

const DEFINITE_EVENT_PATTERNS = [
  /반드시\s+(?:일어나|성공|실패|이루어)/u,
  /100%\s*(?:성공|실패|확실)/u,
  /(?:틀림없이|확실히)\s+(?:됩니다|일어납니다|이루어집니다)/u,
  /(?:무조건|반드시)\s+(?:된다|된다고)/u,
] as const;

const STRUCTURED_TITLE_PATTERN =
  /^(?:#{1,3}\s*)?(?:결론|근거|주의사항|실행방안)\s*[:：]/mu;

function detectEmptyResponse(text: string): ResponseValidationIssue | null {
  if (!text.trim()) {
    return {
      code: "empty_response",
      message: "응답이 비어 있습니다.",
    };
  }

  return null;
}

function detectTechnicalFragment(text: string): ResponseValidationIssue | null {
  const trimmed = text.trim();

  if (TECHNICAL_FRAGMENT_PATTERN.test(trimmed)) {
    return {
      code: "technical_fragment",
      message: "응답이 미완성 technical fragment로 끝납니다.",
    };
  }

  return null;
}

function detectDefiniteEventAssertion(
  text: string,
): ResponseValidationIssue | null {
  for (const pattern of DEFINITE_EVENT_PATTERNS) {
    if (pattern.test(text)) {
      return {
        code: "definite_event_assertion",
        message: "확정적인 사건 단정 표현이 감지되었습니다.",
      };
    }
  }

  return null;
}

function detectJsonDump(text: string): ResponseValidationIssue | null {
  const trimmed = text.trim();

  if (JSON_DUMP_PATTERN.test(trimmed)) {
    return {
      code: "json_dump",
      message: "사주 원문 JSON dump 형태가 감지되었습니다.",
    };
  }

  if (
    (trimmed.match(/"\w+"\s*:/gu)?.length ?? 0) >= 3
    && (trimmed.includes("{") || trimmed.includes("["))
  ) {
    return {
      code: "json_dump",
      message: "사주 원문 JSON dump 형태가 감지되었습니다.",
    };
  }

  return null;
}

function detectForbiddenStructureRepetition(
  text: string,
  answerMode: AnswerMode,
): ResponseValidationIssue | null {
  if (answerMode === "report") {
    return null;
  }

  const matchedTitles = QUESTION_MODE_FORBIDDEN_STRUCTURES.filter(
    (title) => {
      const regex = new RegExp(
        `(?:^|\\n)\\s*(?:#{1,3}\\s*)?${title}\\s*[:：]`,
        "mu",
      );
      return regex.test(text);
    },
  );

  if (matchedTitles.length >= 2) {
    return {
      code: "forbidden_structure_repetition",
      message:
        `Question Mode에서 금지된 정형화 제목이 반복됩니다: ${matchedTitles.join(", ")}`,
    };
  }

  const structuredTitleCount = text
    .split("\n")
    .filter((line) => STRUCTURED_TITLE_PATTERN.test(line.trim()))
    .length;

  if (structuredTitleCount >= 3) {
    return {
      code: "forbidden_structure_repetition",
      message: "Question Mode에서 정형화 제목이 과도하게 반복됩니다.",
    };
  }

  return null;
}

export type ResponseValidatorInput = {
  text: string;
  prompt: ResponsePrompt;
};

/**
 * GPT 응답을 검증한다. 실패 시 fallback으로 전환한다.
 */
export function validateConsultingResponse(
  input: ResponseValidatorInput,
): ResponseValidationResult {
  const issues: ResponseValidationIssue[] = [];

  const checks = [
    detectEmptyResponse(input.text),
    detectTechnicalFragment(input.text),
    detectDefiniteEventAssertion(input.text),
    detectJsonDump(input.text),
    detectForbiddenStructureRepetition(
      input.text,
      input.prompt.metadata.answerMode,
    ),
  ];

  for (const issue of checks) {
    if (issue) {
      issues.push(issue);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function serializeValidationIssues(
  issues: ResponseValidationIssue[],
): string[] {
  return issues.map((item) => `${item.code}: ${item.message}`);
}
