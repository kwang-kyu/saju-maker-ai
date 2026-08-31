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

export function estimatePromptSectionsSize(
  sections: readonly PromptSection[],
): number {
  return sections
    .map((section) => `[${section.title}]\n${section.content}`)
    .join("\n\n")
    .length;
}
