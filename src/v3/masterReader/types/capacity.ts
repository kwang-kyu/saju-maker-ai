import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts.js";
  
  export type CapacityArea =
    | "responsibility"
    | "money"
    | "organization"
    | "relationship"
    | "risk"
    | "time";
  
  export type CapacityLevel =
    | "limited"
    | "moderate"
    | "strong";
  
  export type CapacityConfidence =
    | "low"
    | "medium"
    | "high";
  
  export type CapacityEvidenceSource =
    | "monthCommand"
    | "dayMasterStrength"
    | "structure"
    | "tenGodStrength"
    | "fiveElementFlow"
    | "rooting"
    | "usefulGod"
    | "interaction";
  
  export type CapacityEvidence = {
    source: CapacityEvidenceSource;
  
    description: string;
  
    weight: number;
  
    signal?: SajuStructureSignal;
  
    conditions: string[];
  
    exceptions: string[];
  };
  
  export type CapacityInterpretation = {
    corePattern: string;
  
    manageableScope: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    overloadConditions: string[];
  
    suitableConditions: string[];
  };
  
  export type CapacityJudgement = {
    area: CapacityArea;
  
    level: CapacityLevel;
  
    interpretation: CapacityInterpretation | null;
  
    evidence: CapacityEvidence[];
  
    counterEvidence: CapacityEvidence[];
  
    confidence: CapacityConfidence;
  
    exceptionConditions: string[];
  };
  
  export type CapacityResult = {
    responsibility: CapacityJudgement;
  
    money: CapacityJudgement;
  
    organization: CapacityJudgement;
  
    relationship: CapacityJudgement;
  
    risk: CapacityJudgement;
  
    time: CapacityJudgement;
  };