import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts.js";
  
  export type RelationshipArea =
    | "connectionExpansion"
    | "intimacyMaintenance"
    | "emotionalExchange"
    | "boundaryMaintenance"
    | "conflictAdjustment"
    | "trustRecovery"
    | "partnershipCooperation"
    | "spouseBonding";
  
  export type RelationshipLevel =
    | "limited"
    | "moderate"
    | "strong";
  
  export type RelationshipConfidence =
    | "low"
    | "medium"
    | "high";
  
  export type RelationshipEvidenceSource =
    | "monthCommand"
    | "dayMasterStrength"
    | "structure"
    | "tenGodStrength"
    | "fiveElementFlow"
    | "rooting"
    | "usefulGod"
    | "interaction";
  
  export type RelationshipEvidence = {
    source: RelationshipEvidenceSource;
  
    description: string;
  
    weight: number;
  
    signal?: SajuStructureSignal;
  
    conditions: string[];
  
    exceptions: string[];
  };
  
  export type RelationshipAreaInterpretation = {
    corePattern: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type RelationshipInterpretation = {
    corePattern: string;
  
    connectionMethod: string;
  
    intimacyMethod: string;
  
    emotionalExchangeMethod: string;
  
    boundaryMethod: string;
  
    conflictMethod: string;
  
    trustRecoveryMethod: string;
  
    partnershipMethod: string;
  
    spouseBondingMethod: string;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type RelationshipJudgement = {
    area: RelationshipArea;
  
    level: RelationshipLevel | null;
  
    interpretation:
      RelationshipAreaInterpretation | null;
  
    evidence: RelationshipEvidence[];
  
    counterEvidence:
      RelationshipEvidence[];
  
    confidence: RelationshipConfidence;
  
    exceptionConditions: string[];
  };
  
  export type RelationshipResult = {
    connectionExpansion:
      RelationshipJudgement;
  
    intimacyMaintenance:
      RelationshipJudgement;
  
    emotionalExchange:
      RelationshipJudgement;
  
    boundaryMaintenance:
      RelationshipJudgement;
  
    conflictAdjustment:
      RelationshipJudgement;
  
    trustRecovery:
      RelationshipJudgement;
  
    partnershipCooperation:
      RelationshipJudgement;
  
    spouseBonding:
      RelationshipJudgement;
  
    interpretation:
      RelationshipInterpretation | null;
  };