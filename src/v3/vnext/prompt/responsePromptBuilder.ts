/**
 * vNext Response Prompt Builder.
 *
 * ResponseContext → PromptStrategy → PromptSection → TokenBudget → FinalPrompt
 */

import {
  applyPromptBudget,
  estimatePromptSectionsSize,
  resolvePromptEvidencePolicy,
} from "./promptBudgetController.js";
import {
  buildPromptSections,
  collectSectionBlockIds,
  renderPromptSections,
} from "./promptSectionBuilder.js";
import {
  resolvePromptStrategy,
} from "./promptStrategyResolver.js";
import {
  buildSystemInstruction,
} from "./promptTemplate.js";
import type {
  PromptBudgetLevel,
  PromptStrategy,
  ResponsePrompt,
} from "../types/responsePrompt.js";
import type {
  ResponseAction,
  ResponseContext,
} from "../response/responseContext.js";

export type ResponsePromptBuilderInput = {
  responseContext: ResponseContext;
  strategy?: PromptStrategy;
  budget?: PromptBudgetLevel;
};

function estimateResponsePromptSize(
  systemInstruction: string,
  userPrompt: string,
): number {
  return systemInstruction.length + userPrompt.length;
}

/**
 * ResponseContext로 최종 GPT Prompt를 조립한다.
 */
export function buildResponsePrompt(
  input: ResponsePromptBuilderInput,
): ResponsePrompt {
  const budget = input.budget ?? "standard";
  const strategy = input.strategy
    ?? resolvePromptStrategy(input.responseContext);
  const evidencePolicy = resolvePromptEvidencePolicy(budget);

  const allSections = buildPromptSections(
    input.responseContext,
    strategy,
    { evidencePolicy },
  );
  const selectedSections = applyPromptBudget(
    allSections,
    budget,
    strategy,
  );
  const userPrompt = renderPromptSections(selectedSections);
  const systemInstruction = buildSystemInstruction({
    ...strategy,
    verbosityLevel: budget,
  });
  const selectedBlockIds = collectSectionBlockIds(selectedSections);

  return {
    systemInstruction,
    userPrompt,
    metadata: {
      answerMode: input.responseContext.answerMode,
      scenario: input.responseContext.scenario,
      budget,
      selectedBlockIds,
      estimatedSize: estimateResponsePromptSize(
        systemInstruction,
        userPrompt,
      ),
      conversationStyle: strategy.conversationStyle,
    },
  };
}

/**
 * ResponseAction이 consulting일 때만 Prompt를 생성한다.
 */
export function buildResponsePromptFromAction(
  action: ResponseAction,
  budget: PromptBudgetLevel = "standard",
): ResponsePrompt | null {
  if (action.type !== "consulting" || !action.context) {
    return null;
  }

  return buildResponsePrompt({
    responseContext: action.context,
    budget,
  });
}

export function estimateResponsePromptPayloadSize(
  prompt: ResponsePrompt,
): number {
  return prompt.metadata.estimatedSize;
}

export function estimatePromptSectionPayloadSize(
  input: ResponsePromptBuilderInput,
): number {
  const strategy = input.strategy
    ?? resolvePromptStrategy(input.responseContext);
  const evidencePolicy = resolvePromptEvidencePolicy(
    input.budget ?? "standard",
  );
  const sections = buildPromptSections(
    input.responseContext,
    strategy,
    { evidencePolicy },
  );
  const selectedSections = applyPromptBudget(
    sections,
    input.budget ?? "standard",
    strategy,
  );

  return estimatePromptSectionsSize(selectedSections);
}
