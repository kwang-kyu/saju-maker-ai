import type {
  DecisionExplanationPlan,
} from "./decisionExplanationPlan.js";

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

  conclusionNature:
    DecisionExplanationPlan["conclusionNature"];

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

  explanationFocus?:
    DecisionExplanationPlan["explanationFocus"];
};

export function buildDecisionExplanationPayload(
  plan:
    DecisionExplanationPlan,
): DecisionExplanationPayload {
  const selectedRequiredBlocks =
    plan.blocks.filter(
      (block) =>
        block.required,
    );

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

    conclusionNature:
      plan.conclusionNature,

    verdict:
      plan.verdict,

    confidence:
      plan.confidence,

    explanationOrder:
      selectedRequiredBlocks
        .filter(
          (block) =>
            block.step
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

    explanationFocus:
      plan.explanationFocus,
  };
}