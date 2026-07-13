import type {
    SurvivalStyleType,
  } from "../../masterReader/types/survivalStyle";
  import type {
    DecisionTarget,
  } from "../question/questionReader";
  
  export type SurvivalStyleVerdictEffect =
    | "support"
    | "caution"
    | "neutral";
  
  export type SurvivalStyleVerdictRuleResult = {
    effect: SurvivalStyleVerdictEffect;
    reason: string;
  };
  
  type SurvivalStyleVerdictRule = {
    supportiveTargets: readonly DecisionTarget[];
    cautionTargets: readonly DecisionTarget[];
  };
  
  const survivalStyleVerdictRules: Record<
    SurvivalStyleType,
    SurvivalStyleVerdictRule
  > = {
    push: {
      supportiveTargets: [
        "start",
        "changeJob",
        "move",
        "respondToConflict",
      ],
      cautionTargets: [
        "invest",
        "partner",
        "marry",
        "reconcile",
      ],
    },
  
    analysis: {
      supportiveTargets: [
        "wait",
        "choose",
        "manageMoney",
        "protectHealth",
        "respondToConflict",
        "confirmDirection",
      ],
      cautionTargets: [
        "start",
        "invest",
        "move",
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
        "leaveJob",
        "invest",
      ],
    },
  
    independent: {
      supportiveTargets: [
        "start",
        "changeJob",
        "leaveJob",
        "move",
        "confirmDirection",
      ],
      cautionTargets: [
        "partner",
        "marry",
        "reconcile",
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
        "move",
      ],
    },
  
    opportunity: {
      supportiveTargets: [
        "start",
        "changeJob",
        "move",
        "choose",
      ],
      cautionTargets: [
        "continue",
        "invest",
        "partner",
      ],
    },
  
    learning: {
      supportiveTargets: [
        "wait",
        "choose",
        "changeJob",
        "protectHealth",
        "confirmDirection",
      ],
      cautionTargets: [
        "start",
        "invest",
        "leaveJob",
      ],
    },
  
    endurance: {
      supportiveTargets: [
        "continue",
        "wait",
        "manageMoney",
        "protectHealth",
      ],
      cautionTargets: [
        "stop",
        "separate",
        "leaveJob",
        "changeJob",
      ],
    },
  };
  
  export function evaluateSurvivalStyleVerdictRule(
    survivalStyle: SurvivalStyleType,
    decisionTarget: DecisionTarget,
  ): SurvivalStyleVerdictRuleResult {
    const rule =
      survivalStyleVerdictRules[survivalStyle];
  
    if (
      rule.supportiveTargets.includes(
        decisionTarget,
      )
    ) {
      return {
        effect: "support",
        reason:
          `${survivalStyle} Survival Style과 ` +
          `${decisionTarget} 결정 방식이 서로 맞는다.`,
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
          `${survivalStyle} Survival Style로 ` +
          `${decisionTarget} 결정을 실행할 때 주의가 필요하다.`,
      };
    }
  
    return {
      effect: "neutral",
      reason:
        `${survivalStyle} Survival Style만으로는 ` +
        `${decisionTarget} 결정 방향을 확정할 수 없다.`,
    };
  }