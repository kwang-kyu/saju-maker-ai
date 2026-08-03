import type {
  QuestionContext,
  QuestionCounterpartRelation,
} from "../question/questionContext";

import {
  assessZodiacCompatibility,
} from "./zodiacCompatibilityAssessment";
import type {
  ZodiacCompatibilityAssessment,
} from "./zodiacCompatibilityAssessment";
import type {
  CounterpartSajuCalculation,
} from "./counterpartSajuCalculationBuilder";

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
  | "zodiacCompatibility"
  | "fullCompatibility";

export type CompatibilityAssessment = {
  analysisRequired:
    boolean;

  counterpartExists:
    boolean;

  counterpartRelation:
    QuestionCounterpartRelation;

  identityProvided:
    boolean;

    birthDataProvided:
    boolean;

  counterpartSaju:
    CounterpartSajuCalculation | null;

  zodiacProvided:
    boolean;

  zodiacAssessment:
    ZodiacCompatibilityAssessment | null;

  evidenceLevel:
    CompatibilityEvidenceLevel;

  analysisScope:
    CompatibilityAnalysisScope;

  counterpartReadingRequired:
    boolean;

  additionalCounterpartDataRequired:
    boolean;
};

function getClarificationFieldValue(
  questionContext:
    QuestionContext,
  itemKey:
    string,
  fieldKey:
    string,
): string | undefined {
  for (
    const fact
    of questionContext
      .clarificationFacts
      ?? []
  ) {
    if (
      fact.key
      !== itemKey
    ) {
      continue;
    }

    const field =
      fact
        .fields
        .find(
          (candidate) =>
            candidate.key
            === fieldKey
            && candidate
              .value
              .trim()
              .length
            > 0,
        );

    if (
      field
    ) {
      return field.value;
    }
  }

  return undefined;
}

function resolveCompatibilityEvidenceLevel(
  input: {
    questionContext:
      QuestionContext;

    birthDataProvided:
      boolean;

    zodiacProvided:
      boolean;
  },
): CompatibilityEvidenceLevel {
  if (
    !input
      .questionContext
      .requirements
      .compatibilityAnalysisRequired
  ) {
    return "notRequired";
  }

  if (
    !input
      .questionContext
      .counterpart
      .exists
  ) {
    return "insufficient";
  }

  if (
    input.birthDataProvided
  ) {
    return "sufficient";
  }

  if (
    input.zodiacProvided
  ) {
    return "partial";
  }

  return "partial";
}

function resolveCompatibilityAnalysisScope(
  input: {
    questionContext:
      QuestionContext;

    birthDataProvided:
      boolean;

    zodiacProvided:
      boolean;
  },
): CompatibilityAnalysisScope {
  if (
    !input
      .questionContext
      .requirements
      .compatibilityAnalysisRequired
  ) {
    return "none";
  }

  if (
    !input
      .questionContext
      .counterpart
      .exists
  ) {
    return "selfPatternOnly";
  }

  if (
    input.birthDataProvided
  ) {
    return "fullCompatibility";
  }

  if (
    input.zodiacProvided
  ) {
    return "zodiacCompatibility";
  }

  if (
    input
      .questionContext
      .counterpart
      .identityProvided
  ) {
    return "counterpartIdentity";
  }

  return "relationshipContext";
}

export function assessCompatibility(
  questionContext:
    QuestionContext,
  selfYearGanZhi?:
    string,
  counterpartSaju?:
    CounterpartSajuCalculation,
): CompatibilityAssessment {
  const analysisRequired =
    questionContext
      .requirements
      .compatibilityAnalysisRequired;

  const counterpartExists =
    questionContext
      .counterpart
      .exists;

  const identityProvided =
    questionContext
      .counterpart
      .identityProvided;

      const birthDataProvided =
      questionContext
        .counterpart
        .birthDataProvided
      && counterpartSaju
        !== undefined;

  const counterpartZodiac =
    getClarificationFieldValue(
      questionContext,
      "counterpartBirthData",
      "zodiacSign",
    );

  const zodiacAssessment =
    counterpartZodiac
      ? assessZodiacCompatibility({
          selfYearGanZhi,

          counterpartZodiac,
        })
      : null;

  const zodiacProvided =
    zodiacAssessment
      ?.available
    === true;

  return {
    analysisRequired,

    counterpartExists,

    counterpartRelation:
      questionContext
        .counterpart
        .relation,

    identityProvided,

    birthDataProvided,

    counterpartSaju:
      counterpartSaju
      ?? null,

    zodiacProvided,

    zodiacAssessment,

    evidenceLevel:
      resolveCompatibilityEvidenceLevel({
        questionContext,

        birthDataProvided,

        zodiacProvided,
      }),

    analysisScope:
      resolveCompatibilityAnalysisScope({
        questionContext,

        birthDataProvided,

        zodiacProvided,
      }),

    counterpartReadingRequired:
      questionContext
        .requirements
        .counterpartReadingRequired,

    additionalCounterpartDataRequired:
      analysisRequired
      && !birthDataProvided
      && !zodiacProvided,
  };
}
