/**
 * vNext Prompt Budget Controller.
 *
 * Budget은 Prompt 크기 제어 역할만 한다. 새로운 판단 데이터를 추가하지 않는다.
 */

import type {
  PromptBudgetLevel,
  PromptSection,
  PromptStrategy,
} from "../types/responsePrompt.js";

const MINIMAL_PRIORITY_BLOCK_IDS = new Set([
  "directAnswer",
  "periodOverview",
  "earlyPeriod",
  "middlePeriod",
  "latePeriod",
  "mainInterpretation",
  "possibility",
  "currentDirection",
  "ability",
  "suitableRole",
  "opportunity",
  "risk",
  "caution",
  "conclusion",
  "assessment",
]);

const DETAILED_EVIDENCE_BLOCK_IDS = new Set([
  "evidence",
  "supportingEvidence",
  "change",
  "changeSignals",
  "moneyOrDomainEffect",
  "workingEnvironment",
  "timeContext",
  "humanContext",
  "conditions",
  "timing",
  "scale",
  "nextAction",
]);

function isStructuralSection(section: PromptSection): boolean {
  return section.id === "question"
    || section.id === "answerGoal"
    || section.id === "lockedDecisionStatement"
    || section.id === "lockedRecommendedDirection"
    || section.id === "lockedProhibitedDirection"
    || section.id === "explanationRules";
}

function shouldIncludeForMinimal(section: PromptSection): boolean {
  if (isStructuralSection(section)) {
    return true;
  }

  return section.blockIds.some((blockId) =>
    MINIMAL_PRIORITY_BLOCK_IDS.has(blockId),
  );
}

function shouldIncludeForStandard(section: PromptSection): boolean {
  return Boolean(section.content.trim());
}

function shouldIncludeForDetailed(section: PromptSection): boolean {
  if (isStructuralSection(section)) {
    return true;
  }

  if (section.content.trim()) {
    return true;
  }

  return section.blockIds.some((blockId) =>
    DETAILED_EVIDENCE_BLOCK_IDS.has(blockId),
  );
}

/**
 * Budget에 따라 PromptSection 범위를 조절한다.
 */
export function applyPromptBudget(
  sections: readonly PromptSection[],
  budget: PromptBudgetLevel,
  strategy: PromptStrategy,
): PromptSection[] {
  if (budget === "minimal") {
    return sections.filter(shouldIncludeForMinimal);
  }

  if (budget === "detailed") {
    return sections.filter(shouldIncludeForDetailed);
  }

  void strategy;

  return sections.filter(shouldIncludeForStandard);
}

export function resolveBudgetIncludeEvidence(
  budget: PromptBudgetLevel,
): boolean {
  return budget === "detailed";
}

const STANDARD_DIRECT_ANSWER_EVIDENCE_LIMIT = 1;

/**
 * Budget × block별 relevantEvidence 직렬화 상한.
 *
 * - 0: Evidence 직렬화하지 않음
 * - 양수: slice(0, limit) — relevantEvidence 배열 순서 그대로 사용
 * - Infinity: 제한 없음 (detailed — 전체 relevantEvidence)
 */
export function resolveBudgetEvidenceLimit(
  budget: PromptBudgetLevel,
  blockId: string,
): number {
  switch (budget) {
    case "minimal":
      return 0;
    case "standard":
      return blockId === "directAnswer"
        ? STANDARD_DIRECT_ANSWER_EVIDENCE_LIMIT
        : 0;
    case "detailed":
      return Number.POSITIVE_INFINITY;
  }
}

export type PromptEvidencePolicy = {
  budget: PromptBudgetLevel;
  getBlockEvidenceLimit: (blockId: string) => number;
};

/**
 * Budget Evidence 정책 — Prompt Section Builder wiring용.
 *
 * Prompt Layer는 이미 정렬된 relevantEvidence를
 * 정책에 따라 몇 개 직렬화할지만 결정한다.
 */
export function resolvePromptEvidencePolicy(
  budget: PromptBudgetLevel,
): PromptEvidencePolicy {
  return {
    budget,
    getBlockEvidenceLimit: (blockId: string) =>
      resolveBudgetEvidenceLimit(budget, blockId),
  };
}

export function estimatePromptSectionsSize(
  sections: readonly PromptSection[],
): number {
  return sections
    .map((section) => `[${section.title}]\n${section.content}`)
    .join("\n\n")
    .length;
}
