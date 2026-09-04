/**
 * vNext Response Fallback Builder.
 *
 * GPT 실패·timeout·validation 실패 시 엔진 결과만으로 최소 자연어를 반환한다.
 * 새로운 판단을 만들지 않는다.
 */

import type {
  ResponseContext,
} from "../response/responseContext.js";
import type {
  ResponseAction,
} from "../response/responseContext.js";
import type {
  ResponseBlockContext,
} from "../response/responseContext.js";
import type {
  VNextEvidenceItem,
} from "../types/humanState.js";

/** fallback 출력에 사용할 human-readable fact 필드만 허용한다. */
const HUMAN_READABLE_FACT_KEYS = new Set([
  "description",
  "summary",
  "label",
  "changeIntensitySummary",
  "wolunSummary",
  "seunSummary",
  "strengths",
  "pressures",
  "risks",
]);

const ACTION_DECISION_BLOCK_ORDER = [
  "directAnswer",
  "currentDirection",
  "conditions",
  "risk",
  "scale",
  "timing",
  "nextAction",
] as const;

const BARE_READER_LABELS = new Set([
  "안정형",
  "독립형",
  "성취형",
  "돌파형",
]);

const EXCLUDED_EVIDENCE_KEYS = new Set([
  "lifeDriver",
  "survivalStyle",
]);

const DIRECT_ANSWER_EVIDENCE_KEYS = [
  "currentPhase",
  "repeatedPattern-primary-1",
  "repeatedPattern-primary-2",
] as const;

const INTERNAL_ANALYSIS_PATTERNS = [
  "묻고 있다",
  "숨은 동기",
  "질문에서 실제로 결정하려는 것은",
  "질문 속",
  "현재 인생 국면은",
  "강하게 맞는다",
  "서로 강하게 맞는다",
  "확장과 성장을 요구하며",
  "질문 속 선택도",
] as const;

const SAJU_TERMINOLOGY_PATTERNS = [
  "일간",
  "월령",
  "생조",
  "십신",
  "대운",
  "오행",
] as const;

/** 오행·기운 결합 등 명리 내부 표현 — 문자열 치환 없이 선별한다. */
const SAJU_TERMINOLOGY_REGEX_PATTERNS = [
  /(?:목|화|토|금|수)\s*기운/,
] as const;

const IDENTITY_PROFILE_PATTERNS = [
  /(?:안정형|독립형|성취형|돌파형)(?:을|를)\s*삶의/,
  /(?:안정형|독립형|성취형|돌파형)\s*방식/,
  /(?:안정형|독립형|성취형|돌파형)(?:$|[.!?](?:\s|$))/,
] as const;

const FALLBACK_EXCLUDED_EVIDENCE_KEYS = new Set([
  "questionIntent",
  "identity",
  "lifeDriver",
  "survivalStyle",
  "money-summary",
  "career-summary",
  "relationship-summary",
  "destiny-summary",
]);

const ACTION_DECISION_BLOCK_LINE_LIMITS: Record<
  (typeof ACTION_DECISION_BLOCK_ORDER)[number],
  number
> = {
  directAnswer: 2,
  currentDirection: 1,
  conditions: 1,
  risk: 2,
  scale: 1,
  timing: 1,
  nextAction: 1,
};

const ENGLISH_PLACEHOLDER_PATTERNS = [
  "timing assessment available",
  "target period",
  "opportunity increase",
  "pressure increase",
  "risk increase",
  "career domain supportive",
  "responsibility increase",
  "expansion increase",
] as const;

function collectHumanReadableFromFact(
  fact: Record<string, string | number | boolean | null>,
): string[] {
  const lines: string[] = [];

  for (const key of HUMAN_READABLE_FACT_KEYS) {
    const value = fact[key];

    if (value === null || value === undefined || value === "") {
      continue;
    }

    lines.push(String(value));
  }

  return lines;
}

function collectBlockSummary(block: ResponseContext["blocks"][number]): string[] {
  const lines: string[] = [];

  for (const fact of block.relevantFacts) {
    lines.push(...collectHumanReadableFromFact(fact));
  }

  for (const signal of block.relevantSignals) {
    if (signal.summary) {
      lines.push(signal.summary);
    }
  }

  for (const evidence of block.relevantEvidence) {
    if (evidence.description) {
      lines.push(evidence.description);
    }
  }

  return lines.filter(Boolean);
}

function containsKorean(text: string): boolean {
  return /[\uAC00-\uD7A3]/.test(text);
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const PHASE_TITLE_LABELS = [
  "확장기",
  "준비기",
  "전환기",
  "수확기",
  "안정기",
  "도전기",
  "회복기",
  "재정비기",
] as const;

const PHASE_REGION_LABELS = [
  "성장",
  "확장",
  "정체",
  "전환",
  "회복",
  "준비",
] as const;

function stripLeadingPhaseTitleLabel(text: string): string | null {
  for (const label of PHASE_TITLE_LABELS) {
    const prefix = `${label} `;

    if (text.startsWith(prefix)) {
      return text.slice(prefix.length).trim();
    }
  }

  return null;
}

function stripLeadingPhaseRegionLabel(text: string): string | null {
  for (const label of PHASE_REGION_LABELS) {
    const match = text.match(
      new RegExp(`^${label}\\s*국면\\s+([\\s\\S]+)$`),
    );

    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

function convertPhaseDescriptionToConsultingSentence(
  body: string,
): string {
  let sentence = body.trim();

  sentence = sentence
    .replace(
      /(.+?)키워(?:야|야만)\s*하는\s*국면(?:입니다|이다)\.?$/,
      "$1키워갈 수 있는 시기입니다.",
    )
    .replace(
      /(.+?)해야(?:만)?\s*하는\s*국면(?:입니다|이다)\.?$/,
      "$1할 수 있는 시기입니다.",
    )
    .replace(
      /(.+?)먼저(?:인)?\s*국면(?:입니다|이다)\.?$/,
      "$1이 먼저인 시기입니다.",
    )
    .replace(/국면(?:입니다|이다)\.?$/, "시기입니다.");

  if (!/^현재/.test(sentence)) {
    sentence = `현재는 ${sentence}`;
  }

  return sentence;
}

function normalizePhasePrefixedConsultingLine(text: string): string {
  const trimmed = text.trim();
  const currentPhaseMatch = trimmed.match(/현재(?:는|인생국면은)[\s\S]+/);

  if (currentPhaseMatch) {
    return currentPhaseMatch[0].trim();
  }

  const titleBody = stripLeadingPhaseTitleLabel(trimmed);

  if (titleBody) {
    return convertPhaseDescriptionToConsultingSentence(titleBody);
  }

  const regionBody = stripLeadingPhaseRegionLabel(trimmed);

  if (regionBody) {
    return convertPhaseDescriptionToConsultingSentence(regionBody);
  }

  return trimmed;
}

function normalizeLineForDedup(text: string): string {
  return text
    .replace(/['"]/g, "")
    .replace(/\s+/g, "")
    .replace(/(?:성장|확장|정체|전환|회복|준비)국면/g, "")
    .replace(/현재(?:는|인생국면은)/g, "")
    .toLowerCase();
}

function extractMeaningTokens(text: string): string[] {
  return text
    .replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
}

function hasSemanticOverlap(
  left: string,
  right: string,
): boolean {
  const leftTokens = new Set(extractMeaningTokens(left));
  const rightTokens = extractMeaningTokens(right);

  if (leftTokens.size === 0 || rightTokens.length === 0) {
    return false;
  }

  let overlap = 0;

  for (const token of rightTokens) {
    if (leftTokens.has(token)) {
      overlap += 1;
    }
  }

  const minSize = Math.min(leftTokens.size, rightTokens.length);

  return overlap / minSize >= 0.55;
}

function hasKeywordClusterOverlap(
  left: string,
  right: string,
): boolean {
  const clusters = [
    ["작게", "시작", "경험"],
    ["작게", "시작", "축적"],
    ["확장", "서두", "성과"],
    ["재무", "점검", "실행"],
    ["새로운", "기회", "실행"],
  ] as const;

  return clusters.some((cluster) =>
    cluster.every((keyword) =>
      left.includes(keyword) && right.includes(keyword),
    ),
  );
}

function isNearDuplicateLine(
  text: string,
  seenNormalized: ReadonlySet<string>,
  seenLines: readonly string[],
): boolean {
  const normalized = normalizeLineForDedup(text);

  if (!normalized || seenNormalized.has(normalized)) {
    return true;
  }

  for (const existing of seenNormalized) {
    if (
      existing.includes(normalized)
      || normalized.includes(existing)
    ) {
      return true;
    }
  }

  for (const existingLine of seenLines) {
    if (
      hasSemanticOverlap(text, existingLine)
      || hasKeywordClusterOverlap(text, existingLine)
    ) {
      return true;
    }
  }

  return false;
}

function matchesAnyPattern(
  text: string,
  patterns: readonly string[],
): boolean {
  return patterns.some((pattern) => text.includes(pattern));
}

function matchesAnyRegexPattern(
  text: string,
  patterns: readonly RegExp[],
): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function isIdentityProfileLine(text: string): boolean {
  return IDENTITY_PROFILE_PATTERNS.some((pattern) => pattern.test(text));
}

function looksLikeCompleteUserSentence(text: string): boolean {
  const trimmed = text.trim();

  if (trimmed.length < 12) {
    return false;
  }

  if (/경우$/.test(trimmed) && !/[다요까]\.?$/.test(trimmed)) {
    return false;
  }

  if (
    !/[다요까음함]\.?$/.test(trimmed)
    && trimmed.length < 24
  ) {
    return false;
  }

  return true;
}

function isUserFacingConsultingLine(text: string): boolean {
  const trimmed = text.trim();

  if (!trimmed || !isHumanReadableLine(trimmed)) {
    return false;
  }

  if (matchesAnyPattern(trimmed, INTERNAL_ANALYSIS_PATTERNS)) {
    return false;
  }

  if (matchesAnyPattern(trimmed, SAJU_TERMINOLOGY_PATTERNS)) {
    return false;
  }

  if (matchesAnyRegexPattern(trimmed, SAJU_TERMINOLOGY_REGEX_PATTERNS)) {
    return false;
  }

  if (isIdentityProfileLine(trimmed)) {
    return false;
  }

  if (isEnglishPlaceholderSummary(trimmed)) {
    return false;
  }

  return looksLikeCompleteUserSentence(trimmed);
}

function expandToUserFacingLines(text: string): string[] {
  const candidates = splitIntoSentences(text);
  const source = candidates.length > 0 ? candidates : [text.trim()];

  return source
    .map((line) => normalizePhasePrefixedConsultingLine(line))
    .filter((line) => isUserFacingConsultingLine(line));
}

function selectUserFacingLines(
  lines: readonly string[],
  maxLines: number,
  seenNormalized: Set<string>,
  seenLines: string[],
): string[] {
  const selected: string[] = [];

  for (const line of lines) {
    for (const candidate of expandToUserFacingLines(line)) {
      if (selected.length >= maxLines) {
        return selected;
      }

      if (isNearDuplicateLine(candidate, seenNormalized, seenLines)) {
        continue;
      }

      const normalized = normalizeLineForDedup(candidate);
      seenNormalized.add(normalized);
      seenLines.push(candidate);
      selected.push(candidate);
    }
  }

  return selected;
}

function isBareReaderLabel(text: string): boolean {
  return BARE_READER_LABELS.has(text.trim());
}

function isEnglishPlaceholderSummary(text: string): boolean {
  return ENGLISH_PLACEHOLDER_PATTERNS.some((item) =>
    text.includes(item),
  );
}

function isHumanReadableLine(text: string): boolean {
  const trimmed = text.trim();

  if (!trimmed || isBareReaderLabel(trimmed)) {
    return false;
  }

  return true;
}

function isHumanReadableTimingLine(text: string): boolean {
  const trimmed = text.trim();

  if (!trimmed || !containsKorean(trimmed)) {
    return false;
  }

  if (isEnglishPlaceholderSummary(trimmed)) {
    return false;
  }

  return true;
}

function isExcludedEvidence(item: VNextEvidenceItem): boolean {
  return EXCLUDED_EVIDENCE_KEYS.has(item.key)
    || FALLBACK_EXCLUDED_EVIDENCE_KEYS.has(item.key)
    || item.key.startsWith("masterReader.")
    || item.key.startsWith("capacity-evidence-");
}

function collectUniqueLines(lines: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

function collectEvidenceDescriptions(
  evidence: readonly VNextEvidenceItem[],
  options?: {
    allowedKeys?: readonly string[];
    requireKorean?: boolean;
    userFacingOnly?: boolean;
  },
): string[] {
  const allowedKeySet = options?.allowedKeys
    ? new Set(options.allowedKeys)
    : null;
  const lines: string[] = [];

  for (const item of evidence) {
    if (isExcludedEvidence(item)) {
      continue;
    }

    if (allowedKeySet && !allowedKeySet.has(item.key)) {
      continue;
    }

    if (!item.description) {
      continue;
    }

    if (options?.userFacingOnly) {
      lines.push(...expandToUserFacingLines(item.description));
      continue;
    }

    if (!isHumanReadableLine(item.description)) {
      continue;
    }

    if (options?.requireKorean && !containsKorean(item.description)) {
      continue;
    }

    lines.push(item.description);
  }

  return lines;
}

function collectDirectAnswerLines(
  block: ResponseBlockContext,
): string[] {
  return collectEvidenceDescriptions(
    block.relevantEvidence,
    {
      allowedKeys: DIRECT_ANSWER_EVIDENCE_KEYS,
      userFacingOnly: true,
    },
  );
}

function collectCurrentDirectionLines(
  block: ResponseBlockContext,
): string[] {
  const lines: string[] = [];

  for (const fact of block.relevantFacts) {
    const summary = fact.changeIntensitySummary;

    if (summary) {
      lines.push(...expandToUserFacingLines(String(summary)));
    }
  }

  return lines;
}

function collectConditionsLines(
  block: ResponseBlockContext,
): string[] {
  const lines: string[] = [];

  for (const fact of block.relevantFacts) {
    const description = fact.description;

    if (description) {
      lines.push(...expandToUserFacingLines(String(description)));
    }
  }

  return lines;
}

function collectRiskLines(
  block: ResponseBlockContext,
): string[] {
  const lines: string[] = [];

  for (const fact of block.relevantFacts) {
    const description = fact.description;

    if (description) {
      lines.push(...expandToUserFacingLines(String(description)));
    }
  }

  for (const item of block.relevantEvidence) {
    if (isExcludedEvidence(item)) {
      continue;
    }

    if (!item.key.startsWith("combined-")) {
      continue;
    }

    if (!item.description) {
      continue;
    }

    lines.push(...expandToUserFacingLines(item.description));
  }

  return collectUniqueLines(lines);
}

function collectScaleLines(
  block: ResponseBlockContext,
): string[] {
  const lines: string[] = [];

  for (const fact of block.relevantFacts) {
    const summary = fact.summary;

    if (summary) {
      lines.push(...expandToUserFacingLines(String(summary)));
    }
  }

  return collectUniqueLines(lines);
}

function collectTimingLines(
  block: ResponseBlockContext,
): string[] {
  const lines: string[] = [];

  for (const fact of block.relevantFacts) {
    for (const key of ["wolunSummary", "seunSummary", "summary"] as const) {
      const value = fact[key];

      if (value && isHumanReadableTimingLine(String(value))) {
        lines.push(...expandToUserFacingLines(String(value)));
      }
    }
  }

  lines.push(...collectEvidenceDescriptions(
    block.relevantEvidence,
    {
      requireKorean: true,
      userFacingOnly: true,
    },
  ));

  return collectUniqueLines(lines);
}

function collectNextActionLines(
  block: ResponseBlockContext,
): string[] {
  const lines: string[] = [];

  for (const fact of block.relevantFacts) {
    for (const key of HUMAN_READABLE_FACT_KEYS) {
      const value = fact[key];

      if (value === null || value === undefined || value === "") {
        continue;
      }

      lines.push(...expandToUserFacingLines(String(value)));
    }
  }

  lines.push(...collectEvidenceDescriptions(
    block.relevantEvidence,
    { userFacingOnly: true },
  ));

  return collectUniqueLines(lines);
}

function collectActionDecisionBlockLines(
  blockId: string,
  block: ResponseBlockContext,
): string[] {
  switch (blockId) {
    case "directAnswer":
      return collectDirectAnswerLines(block);
    case "currentDirection":
      return collectCurrentDirectionLines(block);
    case "conditions":
      return collectConditionsLines(block);
    case "risk":
      return collectRiskLines(block);
    case "scale":
      return collectScaleLines(block);
    case "timing":
      return collectTimingLines(block);
    case "nextAction":
      return collectNextActionLines(block);
    default:
      return [];
  }
}

function buildActionDecisionFallback(context: ResponseContext): string {
  const blockMap = new Map(
    context.blocks.map((block) => [block.id, block]),
  );
  const bodyParts: string[] = [];
  const seenNormalized = new Set<string>();
  const seenLines: string[] = [];

  for (const blockId of ACTION_DECISION_BLOCK_ORDER) {
    const block = blockMap.get(blockId);

    if (!block) {
      continue;
    }

    const rawLines = collectActionDecisionBlockLines(
      blockId,
      block,
    );
    const sectionLines = selectUserFacingLines(
      rawLines,
      ACTION_DECISION_BLOCK_LINE_LIMITS[blockId],
      seenNormalized,
      seenLines,
    );

    if (sectionLines.length > 0) {
      bodyParts.push(sectionLines.join(" "));
    }
  }

  if (bodyParts.length === 0) {
    return [
      "현재 확인된 분석 결과를 기준으로 설명드리면, 제공된 조건과 변화 신호를 함께 고려해 보시는 것이 좋습니다.",
      "한쪽으로 단정하기보다 확인된 조건과 주의 요소를 균형 있게 살펴보시길 권합니다.",
    ].join(" ");
  }

  const intro = "현재 확인된 방향과 조건을 기준으로 보면,";
  const caution = blockMap.has("risk")
    ? "주의할 점도 함께 고려하시면서 판단하시는 것이 좋습니다."
    : "확인된 조건 범위 안에서 균형 있게 판단하시길 권합니다.";

  return [intro, ...bodyParts, caution].filter(Boolean).join(" ");
}

function buildPeriodOverviewFallback(context: ResponseContext): string {
  const periodBlock = context.blocks.find(
    (block) => block.id === "periodOverview"
      || block.id === "earlyPeriod"
      || block.id === "middlePeriod"
      || block.id === "latePeriod",
  );

  const summaries = context.blocks.flatMap(collectBlockSummary);

  const questionRef = context.originalQuestion.includes("10월")
    ? "10월"
    : "해당 시기";

  if (periodBlock || summaries.length > 0) {
    return [
      `${questionRef}은 한 달 전체가 같은 흐름으로 보기보다는 시기별 변화가 있는 것으로 확인됩니다.`,
      "",
      "현재 확인된 변화와 조건을 기준으로 보면 기회와 주의 요소가 함께 있어, 한쪽으로 단정하기보다 시기별 차이를 나누어 보는 것이 적절합니다.",
    ].join("\n");
  }

  return [
    "현재 확인된 정보를 기준으로 보면, 한쪽으로 단정하기보다 조건과 시기별 차이를 함께 살펴보는 것이 적절합니다.",
  ].join("\n");
}

function buildGenericConsultingFallback(context: ResponseContext): string {
  const summaries = context.blocks.flatMap(collectBlockSummary);

  if (summaries.length === 0) {
    return [
      "현재 확인된 분석 결과를 기준으로 설명드리면, 제공된 조건과 변화 신호를 함께 고려해 보시는 것이 좋습니다.",
      "한쪽으로 단정하기보다 확인된 조건과 주의 요소를 균형 있게 살펴보시길 권합니다.",
    ].join("\n");
  }

  const intro = "현재 확인된 분석 결과를 기준으로 보면,";

  const body = summaries.slice(0, 4).join(" ");
  const caution = context.blocks.some((block) => block.id === "caution"
    || block.id === "risk")
    ? "주의할 점도 함께 고려하시면서 판단하시는 것이 좋습니다."
    : "확인된 조건 범위 안에서 균형 있게 판단하시길 권합니다.";

  return [intro, body, caution].filter(Boolean).join(" ");
}

/**
 * consulting action의 ResponseContext로 fallback 자연어를 생성한다.
 */
export function buildConsultingFallback(
  context: ResponseContext,
): string {
  if (context.scenario === "actionDecision") {
    return buildActionDecisionFallback(context);
  }

  const periodBlocks = ["periodOverview", "earlyPeriod", "middlePeriod", "latePeriod"];
  const hasPeriodStructure = context.blocks.some(
    (block) => periodBlocks.includes(block.id),
  );

  if (hasPeriodStructure || context.scenario === "generalFlow") {
    return buildPeriodOverviewFallback(context);
  }

  return buildGenericConsultingFallback(context);
}

/**
 * clarification action용 deterministic 응답 — API 호출 0회.
 */
export function buildClarificationResponse(
  action: ResponseAction,
): string {
  const missingItems = action.context?.missingContext ?? [];

  if (missingItems.length === 0) {
    return "상담을 진행하기 위해 추가 정보가 필요합니다. 질문과 관련된 정보를 알려주시면 이어서 안내드리겠습니다.";
  }

  const descriptions = missingItems
    .map((item) => item.description)
    .filter(Boolean);

  if (descriptions.length === 1) {
    return `상담을 이어가려면 ${descriptions[0]}이(가) 필요합니다. 해당 정보를 알려주시면 분석을 진행하겠습니다.`;
  }

  const listed = descriptions.map((item) => `- ${item}`).join("\n");

  return [
    "상담을 이어가려면 아래 정보가 필요합니다.",
    listed,
    "",
    "해당 정보를 알려주시면 분석을 진행하겠습니다.",
  ].join("\n");
}

/**
 * direct action용 deterministic 응답 — API 호출 0회.
 */
export function buildDirectResponse(action: ResponseAction): string {
  if (action.context) {
    return buildConsultingFallback(action.context);
  }

  return [
    "현재 제공된 정보만으로는 자연어 상담 응답을 생성하기 어렵습니다.",
    "질문을 조금 더 구체적으로 알려주시거나, 필요한 정보를 보완해 주시면 다시 안내드리겠습니다.",
  ].join("\n");
}
