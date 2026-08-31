/**
 * vNext Prompt API 절감 검증.
 */

import type {
  ResponseContext,
} from "../response/responseContext.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";

const FULL_DUMP_TOKENS = [
  '"currentLifePhase"',
  '"timeDifferences"',
  '"changeIntensity"',
  '"jieQiBoundaries"',
  '"daeunLabel"',
  '"ilunLabel"',
] as const;

export function verifyPromptReduction(
  prompt: ResponsePrompt,
  context: ResponseContext,
): {
  passed: boolean;
  details: string[];
} {
  const combinedText = `${prompt.systemInstruction}\n${prompt.userPrompt}`;
  const contextBlockIds = new Set(
    context.blocks.map((block) => block.id),
  );

  const unexpectedBlockIds = prompt.metadata.selectedBlockIds.filter(
    (blockId) => !contextBlockIds.has(blockId),
  );

  const rawJsonDumpTokens = [
    "relevantFacts",
    "relevantSignals",
    "relevantEvidence",
    '"blocks":',
    '"humanState":',
    '"timeState":',
    '"assessment":',
    '"changeSignals":',
  ];

  const checks = [
    !rawJsonDumpTokens.some((token) => combinedText.includes(token)),
    !FULL_DUMP_TOKENS.some((token) => combinedText.includes(token)),
    unexpectedBlockIds.length === 0,
    prompt.userPrompt.includes("[질문]"),
    prompt.userPrompt.includes("[설명 규칙]"),
    prompt.systemInstruction.includes("GPT는 사주를 판단하지 않는다"),
  ];

  return {
    passed: checks.every(Boolean),
    details: [
      `estimatedSize=${prompt.metadata.estimatedSize}`,
      `selectedBlockIds=${prompt.metadata.selectedBlockIds.join(",") || "none"}`,
      `rawJsonDump=${rawJsonDumpTokens.some((token) =>
        combinedText.includes(token),
      )}`,
      `unexpectedBlockIds=${unexpectedBlockIds.join(",") || "none"}`,
      `fullDumpTokens=${FULL_DUMP_TOKENS.filter((token) =>
        combinedText.includes(token),
      ).join(",") || "none"}`,
    ],
  };
}

export function containsGenericMoneyTheory(
  prompt: ResponsePrompt,
): boolean {
  return [
    "현금흐름 일반론",
    "부채 일반론",
    "고정비 일반론",
    "재무 일반론 자동 삽입",
  ].some((token) => prompt.userPrompt.includes(token));
}

export function containsMoneyFlowForbiddenRule(
  prompt: ResponsePrompt,
): boolean {
  return prompt.systemInstruction.includes("재무 일반론 자동 삽입");
}

export function containsFixedReportStructure(
  prompt: ResponsePrompt,
): boolean {
  const userPrompt = prompt.userPrompt;

  return [
    "[결론]",
    "[근거]",
    "[주의사항]",
    "[실행방안]",
  ].some((title) => userPrompt.includes(title));
}

export function containsTimeSegmentSections(
  prompt: ResponsePrompt,
): boolean {
  return [
    "[초순]",
    "[중순]",
    "[말]",
  ].every((title) => prompt.userPrompt.includes(title));
}

export function containsTechnicalFragmentRule(
  prompt: ResponsePrompt,
): boolean {
  return prompt.systemInstruction.includes(
    "미완성 technical fragment",
  );
}
