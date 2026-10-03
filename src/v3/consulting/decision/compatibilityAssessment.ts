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

const ZODIAC_SURFACE_PATTERN =
  /^(쥐|소|호랑이|토끼|용|뱀|말|양|원숭이|닭|개|돼지)띠$/;

const SELF_ZODIAC_CLAIM_PATTERN =
  /(?:나는|제가|난)\s*((?:쥐|소|호랑이|토끼|용|뱀|말|양|원숭이|닭|개|돼지)띠)/;

function collectZodiacSurfaces(
  evidence:
    readonly string[],
): string[] {
  return evidence.filter(
    (item) =>
      ZODIAC_SURFACE_PATTERN.test(
        item,
      ),
  );
}

/**
 * "나는 호랑이띠인데 닭띠와..."처럼 1인칭 자기 띠 언급은
 * pair operand(surface count)에서 제외한다.
 * 상담자 띠는 계속 selfYearGanZhi로만 계산한다.
 */
function collectPairZodiacSurfaces(
  questionText:
    string,
  evidence:
    readonly string[],
): string[] {
  const surfaces =
    collectZodiacSurfaces(
      evidence,
    );

  const selfClaimMatch =
    questionText.match(
      SELF_ZODIAC_CLAIM_PATTERN,
    );

  if (
    !selfClaimMatch
  ) {
    return surfaces;
  }

  const claimedZodiac =
    selfClaimMatch[1];

  let removedClaimedSurface =
    false;

  return surfaces.filter(
    (surface) => {
      if (
        !removedClaimedSurface
        && surface
        === claimedZodiac
      ) {
        removedClaimedSurface =
          true;

        return false;
      }

      return true;
    },
  );
}

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

  const pairZodiacSurfaces =
    collectPairZodiacSurfaces(
      questionContext
        .question
        .originalQuestion,
      questionContext
        .question
        .counterpartFacts
        .evidence,
    );

  const clarificationZodiac =
    getClarificationFieldValue(
      questionContext,
      "counterpartBirthData",
      "zodiacSign",
    );

  const counterpartZodiac =
    (
      questionContext
        .question
        .analysisScope
      === "zodiac"
      && pairZodiacSurfaces.length
        === 1
        ? pairZodiacSurfaces[0]
        : null
    )
    ?? questionContext
      .question
      .counterpartFacts
      .zodiac
    ?? clarificationZodiac;

  const useQuestionZodiacPair =
    questionContext
      .question
      .analysisScope
    === "zodiac"
    && pairZodiacSurfaces.length
      >= 2;

  const zodiacAssessment =
    useQuestionZodiacPair
      ? assessZodiacCompatibility({
          selfZodiac:
            pairZodiacSurfaces[0],

          counterpartZodiac:
            pairZodiacSurfaces[1],
        })
      : counterpartZodiac
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
