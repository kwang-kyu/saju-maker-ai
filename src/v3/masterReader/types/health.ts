import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts.js";
  
  export type HealthArea =
    | "vitalityStability"
    | "stressRegulation"
    | "fatigueManagement"
    | "recoveryCapacity"
    | "rhythmMaintenance"
    | "overloadTolerance"
    | "habitSelfManagement"
    | "imbalanceAdaptation";
  
  export type HealthLevel =
    | "limited"
    | "moderate"
    | "strong";
  
  export type HealthConfidence =
    | "low"
    | "medium"
    | "high";
  
  export type HealthEvidenceSource =
    | "monthCommand"
    | "dayMasterStrength"
    | "structure"
    | "tenGodStrength"
    | "fiveElementFlow"
    | "rooting"
    | "usefulGod"
    | "interaction";
  
  export type HealthEvidence = {
    source: HealthEvidenceSource;
  
    description: string;
  
    weight: number;
  
    signal?: SajuStructureSignal;
  
    conditions: string[];
  
    exceptions: string[];
  };
  
  export type HealthAreaInterpretation = {
    corePattern: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    supportiveConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type HealthInterpretation = {
    corePattern: string;
  
    vitalityPattern: string;
  
    stressPattern: string;
  
    fatiguePattern: string;
  
    recoveryPattern: string;
  
    rhythmPattern: string;
  
    overloadPattern: string;
  
    habitPattern: string;
  
    adaptationPattern: string;
  
    supportiveConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type HealthJudgement = {
    area: HealthArea;
  
    level: HealthLevel | null;
  
    interpretation:
      HealthAreaInterpretation | null;
  
    evidence: HealthEvidence[];
  
    counterEvidence: HealthEvidence[];
  
    confidence: HealthConfidence;
  
    exceptionConditions: string[];
  };
  
  export type HealthResult = {
    vitalityStability:
      HealthJudgement;
  
    stressRegulation:
      HealthJudgement;
  
    fatigueManagement:
      HealthJudgement;
  
    recoveryCapacity:
      HealthJudgement;
  
    rhythmMaintenance:
      HealthJudgement;
  
    overloadTolerance:
      HealthJudgement;
  
    habitSelfManagement:
      HealthJudgement;
  
    imbalanceAdaptation:
      HealthJudgement;
  
    interpretation:
      HealthInterpretation | null;
  };