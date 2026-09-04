/**
 * 상담 응답 사용자 표시용 텍스트 정규화.
 *
 * GPT/fallback 생성 결과는 변경하지 않고 UI 출력 직전에만 적용한다.
 * Markdown 렌더러가 없으므로 강조 문법은 plain text로 정리한다.
 */

const UNICODE_SPACE_PATTERN =
  /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;

function decodeHtmlEntities(text: string): string {
  const decoded = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);

      if (!Number.isFinite(code)) {
        return _;
      }

      try {
        return String.fromCodePoint(code);
      } catch {
        return " ";
      }
    })
    .replace(/&#(\d+);/g, (_, dec: string) => {
      const code = Number.parseInt(dec, 10);

      if (!Number.isFinite(code)) {
        return _;
      }

      try {
        return String.fromCodePoint(code);
      } catch {
        return " ";
      }
    })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  return decoded.replace(UNICODE_SPACE_PATTERN, " ");
}

const MAX_UNESCAPE_ITERATIONS = 10;

function unescapeMarkdownEscapes(text: string): string {
  let result = text;

  for (let i = 0; i < MAX_UNESCAPE_ITERATIONS; i++) {
    const next = result.replace(
      /\\([\\`*_{}[\]()#+.!\-|>])/g,
      "$1",
    );

    if (next === result) {
      break;
    }

    result = next;
  }

  return result;
}

function stripMarkdownFormatting(text: string): string {
  let result = text;

  result = result.replace(/\*\*([^*\n]+)\*\*/g, "$1");
  result = result.replace(/__([^_\n]+)__/g, "$1");
  result = result.replace(/`([^`\n]+)`/g, "$1");
  result = result.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  result = result.replace(/^#{1,6}\s+/gm, "");
  result = result.replace(
    /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
    "$1",
  );
  result = result.replace(
    /(?<!_)_([^_\n]+)_(?!_)/g,
    "$1",
  );

  return result;
}

function normalizeWhitespace(text: string): string {
  const normalizedLines = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trimEnd());

  let joined = normalizedLines.join("\n");
  joined = joined.replace(/\n{3,}/g, "\n\n");

  return joined.trim();
}

export function normalizeConsultingDisplayText(
  text: string,
): string {
  if (!text) {
    return text;
  }

  let result = decodeHtmlEntities(text);
  result = unescapeMarkdownEscapes(result);
  result = stripMarkdownFormatting(result);
  result = normalizeWhitespace(result);

  return result;
}
