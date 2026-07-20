import type { DecisionExplanationPlan } from "./decisionExplanationPlan";

export type DecisionExplanationPayload = {
  systemRole: "DigitalPhilosophyMaster";
  gptRole: "explanationOnly";

  engineDecisionLocked: true;
  gptMayRejudge: false;

  verdict: string;
  confidence: string;

  explanationOrder: {
    title: string;
    content: string;
  }[];

  finalDecision: string;
};

export function buildDecisionExplanationPayload(
  plan: DecisionExplanationPlan,
): DecisionExplanationPayload {
  return {
    systemRole: "DigitalPhilosophyMaster",
    gptRole: "explanationOnly",

    engineDecisionLocked: true,
    gptMayRejudge: false,

    verdict: plan.verdict,
    confidence: plan.confidence,

    explanationOrder: plan.blocks
    .filter(
      (block) =>
        block.required
        && block.step
          !== "finalDecision",
    )
    .map((block) => ({
        title: block.title,
        content: block.content,
      })),

    finalDecision:
      plan.blocks.find(
        (block) => block.step === "finalDecision",
      )?.content ?? "",
  };
}