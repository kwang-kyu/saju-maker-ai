import type {
  QuestionContext,
  QuestionCounterpartRelation,
} from "../question/questionContext.js";

import {
  assessZodiacCompatibility,
} from "./zodiacCompatibilityAssessment.js";
import type {
  ZodiacCompatibilityAssessment,
} from "./zodiacCompatibilityAssessment.js";
import type {
  CounterpartSajuCalculation,
} from "./counterpartSajuCalculationBuilder.js";
import type {
  SajuFacts,
} from "../../types/sajuFacts.js";
import {
  assessFullCompatibility,
} from "./fullCompatibilityAssessment.js";
import type {
  FullCompatibilityAssessment,
} from "./fullCompatibilityAssessment.js";

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

  fullCompatibilityAssessment?:
    FullCompatibilityAssessment | null;
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
  selfSajuFacts?:
    SajuFacts,
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
        questionContext
          .question
          .counterpartFacts
          .zodiac
        ?? getClarificationFieldValue(
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

  const fullCompatibilityAssessment =
    birthDataProvided
    && counterpartSaju
    && selfSajuFacts
      ? assessFullCompatibility({
          selfSajuFacts,
          counterpartSaju,
        })
      : null;

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

    fullCompatibilityAssessment,
  };
}
