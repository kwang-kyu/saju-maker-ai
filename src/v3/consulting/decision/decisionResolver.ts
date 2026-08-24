import type {
    ActionReadiness,
    DecisionConfidence,
    DecisionEngineInput,
    DecisionResult,
  } from "./decisionTypes.js";
  import type {
    LifeContextAssessment,
  } from "./lifeContextAssessment.js";

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
    alignment:
      DecisionResult["contextAlignment"],
    urgency:
      DecisionEngineInput["question"]["urgency"],
    lifeAssessment:
      LifeContextAssessment,
  ): ActionReadiness {
    if (alignment === "stronglyConflicted") {
      return "stopRequired";
    }

    if (alignment === "conflicted") {
      return "delayRequired";
    }

    const hasHighRealityConstraint = [
      lifeAssessment.executionConstraint,
      lifeAssessment.familyResponsibility,
      lifeAssessment.financialPressure,
      lifeAssessment.transitionDifficulty,
      lifeAssessment.expansionRisk,
    ].some(
      (level) =>
        level === "high",
    );

    if (alignment === "stronglyAligned") {
      if (
        urgency === "immediate"
        || hasHighRealityConstraint
      ) {
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
