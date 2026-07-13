import type { DecisionVerdict } from "./decisionTypes";
import type { VerdictContext } from "./verdictContextBuilder";

export function buildVerdict(
  context: VerdictContext,
): DecisionVerdict {
  const { alignment, readiness } = context;

  if (alignment === "stronglyConflicted") {
    return "notRecommended";
  }

  if (alignment === "conflicted") {
    return "wait";
  }

  if (readiness === "delayRequired") {
    return "wait";
  }

  if (readiness === "stopRequired") {
    return "notRecommended";
  }

  if (
    alignment === "stronglyAligned" &&
    readiness === "ready"
  ) {
    return "recommended";
  }

  if (
    alignment === "aligned" ||
    readiness === "readyWithConditions"
  ) {
    return "conditionallyRecommended";
  }

  return "insufficientEvidence";
}