export type LifeDriverType =
  | "achievement"
  | "wealth"
  | "knowledge"
  | "creation"
  | "leadership"
  | "relationship"
  | "freedom"
  | "stability";

export type DriverConfidence = "low" | "medium" | "high";

export type DriverEvidence = {
  source:
    | "monthCommand"
    | "strength"
    | "structure"
    | "tenGod"
    | "fiveElementFlow"
    | "rooting"
    | "usefulGod"
    | "interaction";

  description: string;
  weight: number;
};

export type LifeDriverJudgement = {
  driver: LifeDriverType;
  evidence: DriverEvidence[];
  counterEvidence: DriverEvidence[];
  confidence: DriverConfidence;
  exceptionConditions: string[];
};

export type LifeDriverResult = {
  primary: LifeDriverJudgement;
  secondary: LifeDriverJudgement | null;
  suppressed: LifeDriverJudgement[];
  conflicting: LifeDriverJudgement[];
};