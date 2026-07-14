import type { ConsultingInput } from "./consultingInput";

import { readQuestion } from "./question/questionReader";

import { runDecisionEngine } from "./decision/decisionEngine";

import { readDecisionResult } from "./explanation/decisionResultReader";

import { buildDecisionExplanationPlan } from "./explanation/decisionExplanationPlan";

import { buildDecisionExplanationPayload } from "./explanation/decisionExplanationPayload";

import { buildConsultingPrompt } from "./explanation/consultingPromptBuilder";

export function runConsulting(
  input: ConsultingInput,
) {
  const questionResult =
    readQuestion(
      input.humanContext,
      input.question,
    );

    const decision =
  runDecisionEngine({
    humanContext: input.humanContext,
    lifeContext: input.lifeContext,
    question: questionResult,
  });

  const explanation =
    readDecisionResult(decision);

  const plan =
    buildDecisionExplanationPlan(explanation);

  const payload =
    buildDecisionExplanationPayload(plan);

  return buildConsultingPrompt(payload);
}