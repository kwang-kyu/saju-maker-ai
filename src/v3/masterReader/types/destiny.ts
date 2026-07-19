import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts";
  
  export type DestinyArea =
    | "lifeDirection"
    | "coreLifeTask"
    | "strengthFulfillment"
    | "growthPath"
    | "choiceAlignment"
    | "changeIntegration"
    | "contributionPattern"
    | "longTermCoherence";
  
  export type DestinyLevel =
    | "limited"
    | "moderate"
    | "strong";
  
  export type DestinyConfidence =
    | "low"
    | "medium"
    | "high";
  
  export type DestinyEvidenceSource =
    | "dayMasterStrength"
    | "monthCommand"
    | "rooting"
    | "tenGodStrength"
    | "fiveElementFlow"
    | "usefulGod"
    | "structure"
    | "interaction"
    | "combination"
    | "clash"
    | "punishment"
    | "harm"
    | "destruction"
    | "other";
  
  export type DestinyEvidence = {
    source: DestinyEvidenceSource;
  
    description: string;
  
    weight: number;
  
    conditions: string[];
  
    exceptions: string[];
  
    signal?: SajuStructureSignal;
  };
  
  export type DestinyAreaInterpretation = {
    corePattern: string;
  
    directionExpression: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    growthConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type DestinyInterpretation = {
    corePattern: string;
  
    lifeDirectionPattern: string;
  
    coreLifeTaskPattern: string;
  
    strengthFulfillmentPattern: string;
  
    growthPathPattern: string;
  
    choiceAlignmentPattern: string;
  
    changeIntegrationPattern: string;
  
    contributionPattern: string;
  
    longTermCoherencePattern: string;
  
    supportiveConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type DestinyJudgement = {
    area: DestinyArea;
  
    level: DestinyLevel | null;
  
    interpretation:
      DestinyAreaInterpretation | null;
  
    evidence: DestinyEvidence[];
  
    counterEvidence: DestinyEvidence[];
  
    confidence: DestinyConfidence;
  
    exceptionConditions: string[];
  };
  
  export type DestinyResult = {
    lifeDirection:
      DestinyJudgement;
  
    coreLifeTask:
      DestinyJudgement;
  
    strengthFulfillment:
      DestinyJudgement;
  
    growthPath:
      DestinyJudgement;
  
    choiceAlignment:
      DestinyJudgement;
  
    changeIntegration:
      DestinyJudgement;
  
    contributionPattern:
      DestinyJudgement;
  
    longTermCoherence:
      DestinyJudgement;
  
    interpretation:
      DestinyInterpretation | null;
  };