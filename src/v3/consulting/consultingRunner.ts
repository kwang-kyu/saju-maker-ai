import type { HumanDestinyContext } from "../types/humanDestinyContext";

import { readQuestion } from "./question/questionReader";

import { runDecisionEngine } from "./decision/decisionEngine";

import { readDecisionResult } from "./explanation/decisionResultReader";

import { buildDecisionExplanationPlan } from "./explanation/decisionExplanationPlan";

import { buildDecisionExplanationPayload } from "./explanation/decisionExplanationPayload";

import { buildConsultingPrompt } from "./explanation/consultingPromptBuilder";

export function runConsulting(
  context: HumanDestinyContext,
  question: string,
) {
  const questionResult =
    readQuestion(context, question);

  const decision =
    runDecisionEngine({
      humanContext: context,
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