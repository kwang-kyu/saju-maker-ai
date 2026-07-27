export type RepeatedPatternType =
  | "earlySuccessCollapse"
  | "slowGrowthStable"
  | "relationshipLoss"
  | "wealthLeak"
  | "restartCycle"
  | "responsibilityOverload"
  | "lateBloom"
  | "opportunityMiss"
  | "distributedAdaptation";

export type PatternConfidence =
  | "low"
  | "medium"
  | "high";

export type PatternEvidenceSource =
  | "monthCommand"
  | "dayMasterStrength"
  | "structure"
  | "tenGodStrength"
  | "fiveElementFlow"
  | "rooting"
  | "usefulGod"
  | "interaction";

export type PatternEvidence = {
  source:
    PatternEvidenceSource;

  description:
    string;

  weight:
    number;
};

export type RepeatedPatternJudgement = {
  pattern:
    RepeatedPatternType;

  evidence:
    PatternEvidence[];

  counterEvidence:
    PatternEvidence[];

  confidence:
    PatternConfidence;

  exceptionConditions:
    string[];
};

export type RepeatedPatternResult = {
  primary:
    RepeatedPatternJudgement;

  secondary:
    RepeatedPatternJudgement | null;

  repeatedBehaviors:
    string[];

  strengths:
    string[];

  risks:
    string[];

  suppressed:
    RepeatedPatternJudgement[];

  conflicting:
    RepeatedPatternJudgement[];
};