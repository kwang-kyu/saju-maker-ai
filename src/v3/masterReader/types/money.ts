import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts";
  
  export type MoneyArea =
    | "generation"
    | "repeatability"
    | "retention"
    | "assetConversion"
    | "cashflowManagement"
    | "debtHandling"
    | "volatilityResponse"
    | "lossRecovery";
  
  export type MoneyLevel =
    | "limited"
    | "moderate"
    | "strong";
  
  export type MoneyConfidence =
    | "low"
    | "medium"
    | "high";
  
  export type MoneyEvidenceSource =
    | "monthCommand"
    | "dayMasterStrength"
    | "structure"
    | "tenGodStrength"
    | "fiveElementFlow"
    | "rooting"
    | "usefulGod"
    | "interaction";
  
  export type MoneyEvidence = {
    source: MoneyEvidenceSource;
  
    description: string;
  
    weight: number;
  
    signal?: SajuStructureSignal;
  
    conditions: string[];
  
    exceptions: string[];
  };
  
  export type MoneyAreaInterpretation = {
    corePattern: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type MoneyInterpretation = {
    corePattern: string;
  
    generationMethod: string;
  
    repetitionCondition: string;
  
    accumulationMethod: string;
  
    assetConversionMethod: string;
  
    leakagePattern: string;
  
    riskControlMethod: string;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  };
  
  export type MoneyJudgement = {
    area: MoneyArea;

    level: MoneyLevel | null;
  
    interpretation:
      MoneyAreaInterpretation | null;
  
    evidence: MoneyEvidence[];
  
    counterEvidence: MoneyEvidence[];
  
    confidence: MoneyConfidence;
  
    exceptionConditions: string[];
  };
  
  export type MoneyResult = {
    generation: MoneyJudgement;
  
    repeatability: MoneyJudgement;
  
    retention: MoneyJudgement;
  
    assetConversion: MoneyJudgement;
  
    cashflowManagement: MoneyJudgement;
  
    debtHandling: MoneyJudgement;
  
    volatilityResponse: MoneyJudgement;
  
    lossRecovery: MoneyJudgement;
  
    interpretation: MoneyInterpretation | null;
  };
