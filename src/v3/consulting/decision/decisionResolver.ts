import type {
    ActionReadiness,
    DecisionConfidence,
    DecisionEngineInput,
    DecisionResult,
  } from "./decisionTypes";
  
  export function resolveConfidence(
    questionConfidence: number,
    alignment: DecisionResult["contextAlignment"],
  ): DecisionConfidence {
    if (
      questionConfidence >= 0.85 &&
      alignment !== "unknown"
    ) {
      return "high";
    }
  
    if (
      questionConfidence >= 0.6 ||
      alignment !== "unknown"
    ) {
      return "medium";
    }
  
    return "low";
  }
  
  export function resolveActionReadiness(
    alignment: DecisionResult["contextAlignment"],
    urgency: DecisionEngineInput["question"]["urgency"],
  ): ActionReadiness {
    if (alignment === "stronglyConflicted") {
      return "stopRequired";
    }
  
    if (alignment === "conflicted") {
      return "delayRequired";
    }
  
    if (alignment === "stronglyAligned") {
      if (urgency === "immediate") {
        return "readyWithConditions";
      }
  
      return "ready";
    }
  
    if (alignment === "aligned") {
      return "readyWithConditions";
    }
  
    if (alignment === "partiallyAligned") {
      return "preparationRequired";
    }
  
    return "unknown";
  }