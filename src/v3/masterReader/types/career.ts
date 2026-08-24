import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts.js";
  
  export type CareerArea =
    | "roleOrientation"
    | "workStyle"
    | "expertiseGrowth"
    | "organizationFit"
    | "independenceFit"
    | "leadershipFit"
    | "performanceConversion"
    | "careerContinuity";
  
  export type CareerLevel =
    | "limited"
    | "moderate"
    | "strong";
  
  export type CareerConfidence =
    | "low"
    | "medium"
    | "high";
  
  export type CareerEvidenceSource =
    | "monthCommand"
    | "dayMasterStrength"
    | "structure"
    | "tenGodStrength"
    | "fiveElementFlow"
    | "rooting"
    | "usefulGod"
    | "interaction";
  
  export type CareerEvidence = {
    source: CareerEvidenceSource;
  
    description: string;
  
    weight: number;
  
    signal?: SajuStructureSignal;
  
    conditions: string[];
  
    exceptions: string[];
  };
  
  export type CareerAreaInterpretation = {
    corePattern: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type CareerInterpretation = {
    corePattern: string;
  
    primaryRole: string;
  
    workMethod: string;
  
    expertiseGrowthMethod: string;
  
    organizationMethod: string;
  
    independenceMethod: string;
  
    leadershipMethod: string;
  
    performanceMethod: string;
  
    continuityPattern: string;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type CareerJudgement = {
    area: CareerArea;
  
    level: CareerLevel | null;
  
    interpretation:
      CareerAreaInterpretation | null;
  
    evidence: CareerEvidence[];
  
    counterEvidence: CareerEvidence[];
  
    confidence: CareerConfidence;
  
    exceptionConditions: string[];
  };
  
  export type CareerResult = {
    roleOrientation: CareerJudgement;
  
    workStyle: CareerJudgement;
  
    expertiseGrowth: CareerJudgement;
  
    organizationFit: CareerJudgement;
  
    independenceFit: CareerJudgement;
  
    leadershipFit: CareerJudgement;
  
    performanceConversion: CareerJudgement;
  
    careerContinuity: CareerJudgement;
  
    interpretation: CareerInterpretation | null;
  };