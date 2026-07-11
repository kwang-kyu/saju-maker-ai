export type SurvivalStyleType =
  | "push"
  | "analysis"
  | "relationship"
  | "independent"
  | "stability"
  | "opportunity"
  | "learning"
  | "endurance";

export type SurvivalConfidence = "low" | "medium" | "high";

export type SurvivalEvidenceSource =
  | "monthCommand"
  | "dayMasterStrength"
  | "structure"
  | "tenGodStrength"
  | "fiveElementFlow"
  | "rooting"
  | "usefulGod"
  | "interaction";

export type SurvivalEvidence = {
  source: SurvivalEvidenceSource;
  description: string;
  weight: number;
};

export type SurvivalStyleJudgement = {
  style: SurvivalStyleType;
  evidence: SurvivalEvidence[];
  counterEvidence: SurvivalEvidence[];
  confidence: SurvivalConfidence;
  exceptionConditions: string[];
};

export type SurvivalStyleResult = {
  primary: SurvivalStyleJudgement;
  secondary: SurvivalStyleJudgement | null;

  crisisBehavior: string[];
  recoveryMethods: string[];
  prohibitedActions: string[];

  suppressed: SurvivalStyleJudgement[];
  conflicting: SurvivalStyleJudgement[];
};