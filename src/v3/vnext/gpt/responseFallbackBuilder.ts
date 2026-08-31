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

function formatFactValue(
  value: string | number | boolean | null,
): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function collectBlockSummary(block: ResponseContext["blocks"][number]): string[] {
  const lines: string[] = [];

  for (const fact of block.relevantFacts) {
    const entries = Object.entries(fact)
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => `${key}: ${formatFactValue(value)}`);

    if (entries.length > 0) {
      lines.push(entries.join(", "));
    }
  }

  for (const signal of block.relevantSignals) {
    if (signal.summary) {
      lines.push(signal.summary);
    }
  }

  for (const item of block.emphasis) {
    lines.push(item);
  }

  return lines.filter(Boolean);
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

  const intro = context.scenario === "actionDecision"
    ? "현재 확인된 방향과 조건을 기준으로 보면,"
    : "현재 확인된 분석 결과를 기준으로 보면,";

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
