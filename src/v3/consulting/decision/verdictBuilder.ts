import type {
  DecisionVerdict,
} from "./decisionTypes";
import type {
  VerdictContext,
} from "./verdictContextBuilder";
import {
  evaluateLifeDriverVerdictRule,
} from "./lifeDriverVerdictRules";
import {
  evaluateSurvivalStyleVerdictRule,
} from "./survivalStyleVerdictRules";
import {
  evaluateRepeatedPatternVerdictRule,
} from "./repeatedPatternVerdictRules";

function applyLifeDriverEffect(
  verdict: DecisionVerdict,
  context: VerdictContext,
): DecisionVerdict {
  if (context.lifeDriverConfidence === "low") {
    return verdict;
  }

  const result = evaluateLifeDriverVerdictRule(
    context.primaryLifeDriver,
    context.decisionTarget,
  );

  if (result.effect === "neutral") {
    return verdict;
  }

  if (result.effect === "support") {
    if (
      context.lifeDriverConfidence === "high" &&
      verdict === "insufficientEvidence"
    ) {
      return "conditionallyRecommended";
    }

    return verdict;
  }

  if (verdict === "recommended") {
    return "conditionallyRecommended";
  }

  return verdict;
}

function applySurvivalStyleEffect(
  verdict: DecisionVerdict,
  context: VerdictContext,
): DecisionVerdict {
  if (
    context.survivalStyleConfidence === "low"
  ) {
    return verdict;
  }

  const result =
    evaluateSurvivalStyleVerdictRule(
      context.primarySurvivalStyle,
      context.decisionTarget,
    );

  if (result.effect === "neutral") {
    return verdict;
  }

  if (result.effect === "support") {
    if (
      context.survivalStyleConfidence ===
      "high" &&
      verdict === "insufficientEvidence"
    ) {
      return "conditionallyRecommended";
    }

    return verdict;
  }

  if (verdict === "recommended") {
    return "conditionallyRecommended";
  }

  return verdict;
}

function applyRepeatedPatternEffect(
  verdict: DecisionVerdict,
  context: VerdictContext,
): DecisionVerdict {
  if (
    context.repeatedPatternConfidence === "low"
  ) {
    return verdict;
  }

  const result =
    evaluateRepeatedPatternVerdictRule(
      context.primaryRepeatedPattern,
      context.decisionTarget,
    );

  if (result.effect === "neutral") {
    return verdict;
  }

  if (result.effect === "block") {
    return "notRecommended";
  }

  if (result.effect === "support") {
    if (
      context.repeatedPatternConfidence ===
      "high" &&
      verdict === "insufficientEvidence"
    ) {
      return "conditionallyRecommended";
    }

    return verdict;
  }

  if (verdict === "recommended") {
    return "conditionallyRecommended";
  }

  return verdict;
}

function applyLifeContextEffect(
  verdict: DecisionVerdict,
  context: VerdictContext,
): DecisionVerdict {
  if (
    verdict === "notRecommended" ||
    verdict === "wait"
  ) {
    return verdict;
  }

  const {
    executionConstraint,
    financialPressure,
    transitionDifficulty,
    expansionRisk,
  } = context.lifeAssessment;

  const highConstraintCount = [
    executionConstraint,
    financialPressure,
    transitionDifficulty,
    expansionRisk,
  ].filter(
    (level) => level === "high",
  ).length;

  if (
    highConstraintCount >= 2 &&
    context.urgency === "immediate"
  ) {
    return "wait";
  }

  if (
    highConstraintCount >= 3 &&
    verdict === "conditionallyRecommended"
  ) {
    return "wait";
  }

  if (
    highConstraintCount >= 1 &&
    verdict === "recommended"
  ) {
    return "conditionallyRecommended";
  }

  return verdict;
}

export function buildVerdict(
  context: VerdictContext,
): DecisionVerdict {
  const {
    alignment,
    readiness,
  } = context;

  if (alignment === "stronglyConflicted") {
    return "notRecommended";
  }

  if (readiness === "stopRequired") {
    return "notRecommended";
  }

  if (alignment === "conflicted") {
    return "wait";
  }

  if (readiness === "delayRequired") {
    return "wait";
  }

  let verdict: DecisionVerdict =
    "insufficientEvidence";

  if (
    alignment === "stronglyAligned" &&
    readiness === "ready"
  ) {
    verdict = "recommended";
  } else if (
    alignment === "aligned" ||
    readiness === "readyWithConditions"
  ) {
    verdict = "conditionallyRecommended";
  }

  const lifeDriverVerdict =
    applyLifeDriverEffect(
      verdict,
      context,
    );

  const survivalStyleVerdict =
    applySurvivalStyleEffect(
      lifeDriverVerdict,
      context,
    );

  const repeatedPatternVerdict =
    applyRepeatedPatternEffect(
      survivalStyleVerdict,
      context,
    );

  return applyLifeContextEffect(
    repeatedPatternVerdict,
    context,
  );
}