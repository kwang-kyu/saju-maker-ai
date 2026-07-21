import type {
    QuestionReaderResult,
  } from "./questionReader";
  
  export type QuestionCounterpartRelation =
    | "spouse"
    | "partner"
    | "lover"
    | "friend"
    | "parent"
    | "child"
    | "sibling"
    | "coworker"
    | "businessPartner"
    | "other"
    | "unknown";
  
  export type QuestionCounterpartContext = {
    exists: boolean;
  
    relation:
      QuestionCounterpartRelation;
  
    identityProvided: boolean;
    birthDataProvided: boolean;
  };
  
  export type QuestionActionObjectType =
    | "business"
    | "job"
    | "investment"
    | "realEstate"
    | "marriage"
    | "relationship"
    | "health"
    | "legal"
    | "lifeDirection"
    | "other"
    | "unknown";
  
  export type QuestionActionObject = {
    type: QuestionActionObjectType;
  
    subtype: string | null;
    description: string | null;
  };

  export type QuestionRealityArea =
  | "financial"
  | "family"
  | "work"
  | "time"
  | "health"
  | "relationship";

export type QuestionRealitySignal =
  | "debtBurden"
  | "livingCostPressure"
  | "incomeInstability"
  | "fixedCostPressure"
  | "lossConcern"
  | "familyResponsibility"
  | "currentWorkResponsibility"
  | "timeConstraint"
  | "healthConstraint"
  | "relationshipConstraint";

export type QuestionRealityConstraint = {
  area:
    QuestionRealityArea;

  signal:
    QuestionRealitySignal;

  description: string;

  evidence: string[];

  explicit: true;
};

export type QuestionRealityContext = {
  constraints:
    QuestionRealityConstraint[];

  hasExplicitConstraints:
    boolean;
};
  
  export type QuestionAnalysisRequirements = {
    counterpartReadingRequired: boolean;
    compatibilityAnalysisRequired: boolean;
    timingAnalysisRequired: boolean;
    realityAssessmentRequired: boolean;
    comparisonAnalysisRequired: boolean;
  };
  
  export type QuestionContext = {
    question:
      QuestionReaderResult;
  
    timingType:
      QuestionReaderResult["timingType"];
  
    counterpart:
      QuestionCounterpartContext;
  
    actionObject:
      QuestionActionObject;
  
    comparisonTargets: string[];
  
    requirements:
      QuestionAnalysisRequirements;
  };