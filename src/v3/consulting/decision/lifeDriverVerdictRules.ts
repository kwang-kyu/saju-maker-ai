import type { LifeDriverType } from "../../masterReader/types/lifeDriver.js";
import type { DecisionTarget } from "../question/questionReader.js";

export type LifeDriverVerdictEffect =
  | "support"
  | "caution"
  | "neutral";

export type LifeDriverVerdictRuleResult = {
  effect: LifeDriverVerdictEffect;
  reason: string;
};

type LifeDriverVerdictRule = {
  supportiveTargets: readonly DecisionTarget[];
  cautionTargets: readonly DecisionTarget[];
};

const lifeDriverVerdictRules: Record<
  LifeDriverType,
  LifeDriverVerdictRule
> = {
  achievement: {
    supportiveTargets: [
      "start",
      "invest",
      "changeJob",
      "move",
      "confirmDirection",
    ],
    cautionTargets: [
      "wait",
      "stop",
      "continue",
    ],
  },

  wealth: {
    supportiveTargets: [
      "invest",
      "sell",
      "manageMoney",
      "start",
    ],
    cautionTargets: [
      "partner",
      "marry",
      "reconcile",
    ],
  },

  knowledge: {
    supportiveTargets: [
      "confirmDirection",
      "changeJob",
      "protectHealth",
      "respondToConflict",
    ],
    cautionTargets: [
      "invest",
      "start",
      "partner",
    ],
  },

  creation: {
    supportiveTargets: [
      "start",
      "changeJob",
      "move",
      "confirmDirection",
    ],
    cautionTargets: [
      "continue",
      "wait",
      "manageMoney",
    ],
  },

  leadership: {
    supportiveTargets: [
      "start",
      "partner",
      "changeJob",
      "respondToConflict",
    ],
    cautionTargets: [
      "wait",
      "reconcile",
      "continue",
    ],
  },

  relationship: {
    supportiveTargets: [
      "partner",
      "marry",
      "reconcile",
      "respondToConflict",
    ],
    cautionTargets: [
      "separate",
      "stop",
      "leaveJob",
    ],
  },

  freedom: {
    supportiveTargets: [
      "start",
      "changeJob",
      "leaveJob",
      "move",
    ],
    cautionTargets: [
      "partner",
      "marry",
      "continue",
    ],
  },

  stability: {
    supportiveTargets: [
      "continue",
      "wait",
      "manageMoney",
      "protectHealth",
    ],
    cautionTargets: [
      "start",
      "invest",
      "changeJob",
      "leaveJob",
      "move",
    ],
  },
};

export function evaluateLifeDriverVerdictRule(
  lifeDriver: LifeDriverType,
  decisionTarget: DecisionTarget,
): LifeDriverVerdictRuleResult {
  const rule = lifeDriverVerdictRules[lifeDriver];

  if (rule.supportiveTargets.includes(decisionTarget)) {
    return {
      effect: "support",
      reason:
        `${lifeDriver} Life Driver와 ` +
        `${decisionTarget} 결정 방향이 서로 맞는다.`,
    };
  }

  if (rule.cautionTargets.includes(decisionTarget)) {
    return {
      effect: "caution",
      reason:
        `${lifeDriver} Life Driver와 ` +
        `${decisionTarget} 결정 방향 사이에 주의가 필요하다.`,
    };
  }

  return {
    effect: "neutral",
    reason:
      `${lifeDriver} Life Driver만으로는 ` +
      `${decisionTarget} 결정 방향을 확정할 수 없다.`,
  };
}