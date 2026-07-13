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

  if (
    context.lifeDriverConfidence === "high" &&
    verdict === "conditionallyRecommended"
  ) {
    return "wait";
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

  if (
    context.survivalStyleConfidence ===
      "high" &&
    verdict === "conditionallyRecommended"
  ) {
    return "wait";
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

  return applySurvivalStyleEffect(
    lifeDriverVerdict,
    context,
  );
}