import type {
    ActionReadiness,
    ContextAlignment,
    DecisionConfidence,
    DecisionVerdict,
  } from "./decisionTypes";
  
  export type VerdictBuilderInput = {
    alignment: ContextAlignment;
    readiness: ActionReadiness;
    confidence: DecisionConfidence;
  };
  
  export function buildVerdict(
    input: VerdictBuilderInput,
  ): DecisionVerdict {
    const { alignment, readiness } = input;
  
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