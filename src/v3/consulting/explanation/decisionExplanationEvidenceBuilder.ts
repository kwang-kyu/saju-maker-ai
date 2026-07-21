import type {
    DecisionExplanationEvidence,
  } from "./decisionResultReader";
  function isFoundationalSupportingEvidence(
    evidence:
      DecisionExplanationEvidence,
  ): boolean {
    switch (evidence.source) {
      case "survivalStyle":
      case "repeatedPattern":
      case "questionIntent":
        return true;
      default:
        return false;
    }
  }
  export function buildDecisionExplanationEvidence(
    evidence:
      DecisionExplanationEvidence[],
  ): string {
    return evidence
      .filter(
        (item) =>
          item.importance === "core"
          || isFoundationalSupportingEvidence(
            item,
          ),
      )
      .map(
        (item) =>
          item.description,
      )
      .join("\n");
  }