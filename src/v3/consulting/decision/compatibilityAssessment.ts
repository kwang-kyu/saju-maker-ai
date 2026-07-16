import type {
    QuestionContext,
    QuestionCounterpartRelation,
  } from "../question/questionContext";
  
  export type CompatibilityEvidenceLevel =
    | "notRequired"
    | "insufficient"
    | "partial"
    | "sufficient";
  
  export type CompatibilityAnalysisScope =
    | "none"
    | "selfPatternOnly"
    | "relationshipContext"
    | "counterpartIdentity"
    | "fullCompatibility";
  
  export type CompatibilityAssessment = {
    analysisRequired: boolean;
  
    counterpartExists: boolean;
    counterpartRelation: QuestionCounterpartRelation;
  
    identityProvided: boolean;
    birthDataProvided: boolean;
  
    evidenceLevel: CompatibilityEvidenceLevel;
    analysisScope: CompatibilityAnalysisScope;
  
    counterpartReadingRequired: boolean;
    additionalCounterpartDataRequired: boolean;
  };
  
  function resolveCompatibilityEvidenceLevel(
    questionContext: QuestionContext,
  ): CompatibilityEvidenceLevel {
    if (
      !questionContext.requirements
        .compatibilityAnalysisRequired
    ) {
      return "notRequired";
    }
  
    if (!questionContext.counterpart.exists) {
      return "insufficient";
    }
  
    if (
      questionContext.counterpart.birthDataProvided
    ) {
      return "sufficient";
    }
  
    return "partial";
  }
  
  function resolveCompatibilityAnalysisScope(
    questionContext: QuestionContext,
  ): CompatibilityAnalysisScope {
    if (
      !questionContext.requirements
        .compatibilityAnalysisRequired
    ) {
      return "none";
    }
  
    if (!questionContext.counterpart.exists) {
      return "selfPatternOnly";
    }
  
    if (
      questionContext.counterpart.birthDataProvided
    ) {
      return "fullCompatibility";
    }
  
    if (
      questionContext.counterpart.identityProvided
    ) {
      return "counterpartIdentity";
    }
  
    return "relationshipContext";
  }
  
  export function assessCompatibility(
    questionContext: QuestionContext,
  ): CompatibilityAssessment {
    const analysisRequired =
      questionContext.requirements
        .compatibilityAnalysisRequired;
  
    const counterpartExists =
      questionContext.counterpart.exists;
  
    const identityProvided =
      questionContext.counterpart.identityProvided;
  
    const birthDataProvided =
      questionContext.counterpart.birthDataProvided;
  
    return {
      analysisRequired,
  
      counterpartExists,
      counterpartRelation:
        questionContext.counterpart.relation,
  
      identityProvided,
      birthDataProvided,
  
      evidenceLevel:
        resolveCompatibilityEvidenceLevel(
          questionContext,
        ),
  
      analysisScope:
        resolveCompatibilityAnalysisScope(
          questionContext,
        ),
  
      counterpartReadingRequired:
        questionContext.requirements
          .counterpartReadingRequired,
  
      additionalCounterpartDataRequired:
        analysisRequired &&
        !birthDataProvided,
    };
  }