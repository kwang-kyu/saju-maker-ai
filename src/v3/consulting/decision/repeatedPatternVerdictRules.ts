import type {
    RepeatedPatternType,
  } from "../../masterReader/types/repeatedPattern";
  import type {
    DecisionTarget,
  } from "../question/questionReader";

  export type RepeatedPatternVerdictEffect =
    | "support"
    | "caution"
    | "block"
    | "neutral";

  export type RepeatedPatternVerdictRuleResult = {
    effect: RepeatedPatternVerdictEffect;
    reason: string;
  };

  type RepeatedPatternVerdictRule = {
    supportiveTargets: readonly DecisionTarget[];
    cautionTargets: readonly DecisionTarget[];
    blockedTargets: readonly DecisionTarget[];
  };

  const repeatedPatternVerdictRules: Record<
    RepeatedPatternType,
    RepeatedPatternVerdictRule
  > = {
    earlySuccessCollapse: {
      supportiveTargets: [
        "wait",
        "manageMoney",
        "protectHealth",
      ],
      cautionTargets: [
        "start",
        "changeJob",
        "move",
        "partner",
      ],
      blockedTargets: [
        "invest",
      ],
    },

    slowGrowthStable: {
      supportiveTargets: [
        "continue",
        "wait",
        "manageMoney",
        "protectHealth",
      ],
      cautionTargets: [
        "start",
        "changeJob",
        "move",
      ],
      blockedTargets: [],
    },

    relationshipLoss: {
      supportiveTargets: [
        "wait",
        "protectHealth",
        "confirmDirection",
      ],
      cautionTargets: [
        "partner",
        "marry",
        "reconcile",
        "respondToConflict",
      ],
      blockedTargets: [],
    },

    wealthLeak: {
      supportiveTargets: [
        "wait",
        "manageMoney",
        "confirmDirection",
      ],
      cautionTargets: [
        "start",
        "partner",
        "move",
      ],
      blockedTargets: [
        "invest",
      ],
    },

    restartCycle: {
      supportiveTargets: [
        "continue",
        "wait",
        "confirmDirection",
      ],
      cautionTargets: [
        "start",
        "changeJob",
        "leaveJob",
        "move",
      ],
      blockedTargets: [],
    },

    responsibilityOverload: {
      supportiveTargets: [
        "wait",
        "protectHealth",
        "manageMoney",
      ],
      cautionTargets: [
        "continue",
        "partner",
        "marry",
        "respondToConflict",
      ],
      blockedTargets: [],
    },

    lateBloom: {
      supportiveTargets: [
        "continue",
        "wait",
        "changeJob",
        "confirmDirection",
      ],
      cautionTargets: [
        "stop",
        "leaveJob",
      ],
      blockedTargets: [],
    },

    opportunityMiss: {
      supportiveTargets: [
        "start",
        "changeJob",
        "move",
        "choose",
        "confirmDirection",
      ],
      cautionTargets: [
        "wait",
        "continue",
      ],
      blockedTargets: [],
    },
    distributedAdaptation: {
      supportiveTargets: [
        "continue",
        "choose",
        "confirmDirection",
        "manageMoney",
      ],
      cautionTargets: [
        "start",
        "changeJob",
        "move",
        "partner",
        "invest",
      ],
      blockedTargets: [],
    },
  };

  export function evaluateRepeatedPatternVerdictRule(
    repeatedPattern: RepeatedPatternType,
    decisionTarget: DecisionTarget,
  ): RepeatedPatternVerdictRuleResult {
    const rule =
      repeatedPatternVerdictRules[repeatedPattern];

    if (
      rule.blockedTargets.includes(
        decisionTarget,
      )
    ) {
      return {
        effect: "block",
        reason:
          `${repeatedPattern} 반복 패턴에서는 ` +
          `${decisionTarget} 결정을 중단해야 한다.`,
      };
    }

    if (
      rule.supportiveTargets.includes(
        decisionTarget,
      )
    ) {
      return {
        effect: "support",
        reason:
          `${repeatedPattern} 반복 패턴을 고려하면 ` +
          `${decisionTarget} 결정이 패턴 교정에 도움이 된다.`,
      };
    }

    if (
      rule.cautionTargets.includes(
        decisionTarget,
      )
    ) {
      return {
        effect: "caution",
        reason:
          `${repeatedPattern} 반복 패턴이 ` +
          `${decisionTarget} 결정에서 다시 나타날 수 있다.`,
      };
    }

    return {
      effect: "neutral",
      reason:
        `${repeatedPattern} 반복 패턴만으로는 ` +
        `${decisionTarget} 결정 방향을 확정할 수 없다.`,
    };
  }