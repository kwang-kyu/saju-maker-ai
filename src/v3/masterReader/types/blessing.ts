import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts.js";
  
  export type BlessingArea =
    | "opportunityReception"
    | "benefactorConnection"
    | "relationshipSupport"
    | "resourceSupport"
    | "environmentSupport"
    | "crisisProtection"
    | "blessingRetention"
    | "blessingCirculation";
  
  export type BlessingLevel =
    | "limited"
    | "moderate"
    | "strong";
  
  export type BlessingConfidence =
    | "low"
    | "medium"
    | "high";
  
  export type BlessingEvidenceSource =
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
  
  export type BlessingEvidence = {
    source: BlessingEvidenceSource;
  
    description: string;
  
    weight: number;
  
    conditions: string[];
  
    exceptions: string[];
  
    signal?: SajuStructureSignal;
  };
  
  export type BlessingAreaInterpretation = {
    corePattern: string;
  
    receptionMethod: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    supportiveConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type BlessingInterpretation = {
    corePattern: string;
  
    opportunityPattern: string;
  
    benefactorPattern: string;
  
    relationshipSupportPattern: string;
  
    resourceSupportPattern: string;
  
    environmentSupportPattern: string;
  
    crisisProtectionPattern: string;
  
    retentionPattern: string;
  
    circulationPattern: string;
  
    supportiveConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type BlessingJudgement = {
    area: BlessingArea;
  
    level: BlessingLevel | null;
  
    interpretation:
      BlessingAreaInterpretation | null;
  
    evidence: BlessingEvidence[];
  
    counterEvidence: BlessingEvidence[];
  
    confidence: BlessingConfidence;
  
    exceptionConditions: string[];
  };
  
  export type BlessingResult = {
    opportunityReception:
      BlessingJudgement;
  
    benefactorConnection:
      BlessingJudgement;
  
    relationshipSupport:
      BlessingJudgement;
  
    resourceSupport:
      BlessingJudgement;
  
    environmentSupport:
      BlessingJudgement;
  
    crisisProtection:
      BlessingJudgement;
  
    blessingRetention:
      BlessingJudgement;
  
    blessingCirculation:
      BlessingJudgement;
  
    interpretation:
      BlessingInterpretation | null;
  };