import type {
  DecisionExplanationPlan,
} from "./decisionExplanationPlan";

export type DecisionExplanationPayload = {
  systemRole:
    "DigitalPhilosophyMaster";

  gptRole:
    "explanationOnly";

  engineDecisionLocked:
    true;

  gptMayRejudge:
    false;

  originalQuestion:
    DecisionExplanationPlan["originalQuestion"];

  topic:
    DecisionExplanationPlan["topic"];

  intent:
    DecisionExplanationPlan["intent"];

  decisionTarget:
    DecisionExplanationPlan["decisionTarget"];

  verdict:
    DecisionExplanationPlan["verdict"];

  confidence:
    DecisionExplanationPlan["confidence"];

  explanationOrder: {
    title:
      string;

    content:
      string;
  }[];

  finalDecision:
    string;

  explanationKind?:
    DecisionExplanationPlan["explanationKind"];
};

export function buildDecisionExplanationPayload(
  plan:
    DecisionExplanationPlan,
): DecisionExplanationPayload {
  return {
    systemRole:
      "DigitalPhilosophyMaster",

    gptRole:
      "explanationOnly",

    engineDecisionLocked:
      true,

    gptMayRejudge:
      false,

    originalQuestion:
      plan.originalQuestion,

    topic:
      plan.topic,

    intent:
      plan.intent,

    decisionTarget:
      plan.decisionTarget,

    verdict:
      plan.verdict,

    confidence:
      plan.confidence,

    explanationOrder:
      plan.blocks
        .filter(
          (block) =>
            block.required
            && block.step
              !== "finalDecision",
        )
        .map(
          (block) => ({
            title:
              block.title,

            content:
              block.content,
          }),
        ),

    finalDecision:
      plan.blocks.find(
        (block) =>
          block.step
          === "finalDecision",
      )?.content
      ?? "",

    explanationKind:
      plan.explanationKind,
  };
}
