import {
  buildConsultingFallback,
} from "../gpt/responseFallbackBuilder.js";
import {
  normalizeConsultingDisplayText,
} from "../ui/consultingDisplayText.js";
import {
  mapNaturalResponseToMessage,
} from "../ui/vNextResponseMapper.js";
import {
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";
import {
  verifyResponseFallback,
} from "./responseFallbackVerification.js";

export type ResponseDisplayVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type ResponseDisplayVerificationResult = {
  passed: boolean;
  cases: ResponseDisplayVerificationCase[];
};

const FORMAT_LEAK_PATTERNS = [
  /\\\*\\\*/,
  /&#x[0-9a-fA-F]+;/,
  /&nbsp;/i,
  /&amp;/,
  /&lt;/,
  /&gt;/,
  /\*\*[^*\n]+\*\*/,
] as const;

function assertNoFormatLeak(text: string): boolean {
  return !FORMAT_LEAK_PATTERNS.some((pattern) => pattern.test(text));
}

function assertKoreanPreserved(
  original: string,
  normalized: string,
): boolean {
  const koreanMatches = original.match(/[\uAC00-\uD7A3]+/g) ?? [];

  return koreanMatches.every((token) => normalized.includes(token));
}

export function verifyResponseDisplay(): ResponseDisplayVerificationResult {
  const cases: ResponseDisplayVerificationCase[] = [];

  const escapedMarkdownSample =
    "현재는 \\*\\*확장 국면\\*\\*으로,&#x20;기존의 기반을 넓히는 흐름입니다.";
  const normalizedEscapedMarkdown = normalizeConsultingDisplayText(
    escapedMarkdownSample,
  );

  cases.push({
    id: "case-1-escaped-markdown-and-html-entity",
    passed: assertNoFormatLeak(normalizedEscapedMarkdown)
      && normalizedEscapedMarkdown.includes("확장 국면")
      && !normalizedEscapedMarkdown.includes("\\")
      && !normalizedEscapedMarkdown.includes("*")
      && assertKoreanPreserved(escapedMarkdownSample, normalizedEscapedMarkdown),
    details: [
      `sample=${normalizedEscapedMarkdown}`,
    ],
  });

  const whitespaceSample =
    "첫   문장입니다.\n\n\n\n\n두번째 문장입니다.&nbsp;&nbsp;";
  const normalizedWhitespace = normalizeConsultingDisplayText(
    whitespaceSample,
  );

  cases.push({
    id: "case-2-whitespace-and-nbsp-normalization",
    passed: assertNoFormatLeak(normalizedWhitespace)
      && normalizedWhitespace.includes("첫 문장입니다.")
      && normalizedWhitespace.includes("두번째 문장입니다.")
      && !/\n{3,}/.test(normalizedWhitespace)
      && !/ {2,}/.test(normalizedWhitespace),
    details: [
      `sample=${JSON.stringify(normalizedWhitespace)}`,
    ],
  });

  const plainKorean = "현재는 새로운 기회를 실행으로 연결해 보기 좋은 흐름입니다.";
  const normalizedPlainKorean = normalizeConsultingDisplayText(plainKorean);

  cases.push({
    id: "case-3-plain-korean-preserved",
    passed: normalizedPlainKorean === plainKorean,
    details: [
      `sample=${normalizedPlainKorean}`,
    ],
  });

  const mappedMessage = mapNaturalResponseToMessage({
    text: "&#x20;**중요**한&#x20;시기입니다.",
    source: "gpt",
    validated: true,
    apiCallCount: 1,
    latencyMs: 10,
  });

  cases.push({
    id: "case-4-mapper-applies-display-normalization",
    passed: assertNoFormatLeak(mappedMessage.text)
      && mappedMessage.text.includes("중요한 시기입니다."),
    details: [
      `mapped=${mappedMessage.text}`,
    ],
  });

  const moneyFlow = runPromptPipelineCase(
    "10월 금전운이 있을까요?",
    { includeLuckFlow: true },
  );

  if (moneyFlow.context) {
    const fallback = buildConsultingFallback(moneyFlow.context);
    const normalizedFallback = normalizeConsultingDisplayText(fallback);

    cases.push({
      id: "case-5-fallback-display-normalization",
      passed: assertNoFormatLeak(normalizedFallback)
        && normalizedFallback.length > 0
        && assertKoreanPreserved(fallback, normalizedFallback),
      details: [
        `length=${normalizedFallback.length}`,
        `sample=${normalizedFallback.slice(0, 120)}`,
      ],
    });
  } else {
    cases.push({
      id: "case-5-fallback-display-normalization",
      passed: false,
      details: ["context unavailable"],
    });
  }

  const doubleEscapedListMarker = "\\- 항목";
  const normalizedDoubleEscapedListMarker = normalizeConsultingDisplayText(
    doubleEscapedListMarker,
  );

  cases.push({
    id: "case-6-double-escaped-list-marker",
    passed: normalizedDoubleEscapedListMarker === "- 항목",
    details: [
      `input=${JSON.stringify(doubleEscapedListMarker)}`,
      `output=${JSON.stringify(normalizedDoubleEscapedListMarker)}`,
    ],
  });

  const quadrupleEscapedListMarker = "\\\\- 항목";
  const normalizedQuadrupleEscapedListMarker = normalizeConsultingDisplayText(
    quadrupleEscapedListMarker,
  );

  cases.push({
    id: "case-7-quadruple-escaped-list-marker",
    passed: normalizedQuadrupleEscapedListMarker === "- 항목",
    details: [
      `input=${JSON.stringify(quadrupleEscapedListMarker)}`,
      `output=${JSON.stringify(normalizedQuadrupleEscapedListMarker)}`,
    ],
  });

  const doubleEscapedBold = "\\*\\*중요\\*\\*";
  const normalizedDoubleEscapedBold = normalizeConsultingDisplayText(
    doubleEscapedBold,
  );

  cases.push({
    id: "case-8-double-escaped-bold",
    passed: normalizedDoubleEscapedBold === "중요",
    details: [
      `input=${JSON.stringify(doubleEscapedBold)}`,
      `output=${JSON.stringify(normalizedDoubleEscapedBold)}`,
    ],
  });

  const quadrupleEscapedBold = "\\\\*\\\\*중요\\\\*\\\\*";
  const normalizedQuadrupleEscapedBold = normalizeConsultingDisplayText(
    quadrupleEscapedBold,
  );

  cases.push({
    id: "case-9-quadruple-escaped-bold",
    passed: normalizedQuadrupleEscapedBold === "중요",
    details: [
      `input=${JSON.stringify(quadrupleEscapedBold)}`,
      `output=${JSON.stringify(normalizedQuadrupleEscapedBold)}`,
    ],
  });

  const fallbackVerification = verifyResponseFallback();

  cases.push({
    id: "case-10-response-fallback-regression",
    passed: fallbackVerification.passed,
    details: [
      `passedCases=${fallbackVerification.cases.filter((item) => item.passed).length}`,
      `totalCases=${fallbackVerification.cases.length}`,
    ],
  });

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeResponseDisplayVerificationResult(
  result: ResponseDisplayVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
