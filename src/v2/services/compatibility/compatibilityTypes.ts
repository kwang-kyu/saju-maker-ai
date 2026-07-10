export type CompatibilityMode =
  | "business"
  | "marriage"
  | "love"
  | "family"
  | "employee"
  | "general";

export type CompatibilityLevel =
  | "veryGood"
  | "good"
  | "mixed"
  | "caution"
  | "difficult";

export type CompatibilityRiskLevel =
  | "low"
  | "medium"
  | "high";

export type CompatibilityPersonProfile = {
  name: string;
  dayMaster: string;
  strongestElement: string;
  weakestElement: string;
  yearGanZhi: string;
  dayGanZhi: string;
};

export type CompatibilityEvidence = {
  category:
    | "element"
    | "dayMaster"
    | "business"
    | "money"
    | "communication"
    | "relationship"
    | "risk";

  title: string;
  description: string;
  influence: "positive" | "neutral" | "negative";
};

export type CompatibilityResult = {
  mode: CompatibilityMode;

  self: CompatibilityPersonProfile;
  other: CompatibilityPersonProfile;

  overallScore: number;
  level: CompatibilityLevel;
  riskLevel: CompatibilityRiskLevel;

  directConclusion: string;

  strengths: string[];
  conflicts: string[];

  moneyCompatibility: string[];
  workCompatibility: string[];
  communicationCompatibility: string[];

  roleRecommendation: string[];
  riskFactors: string[];
  recommendations: string[];

  evidence: CompatibilityEvidence[];

  summary: string;
};