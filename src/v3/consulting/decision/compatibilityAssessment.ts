import type {
  QuestionContext,
  QuestionCounterpartRelation,
} from "../question/questionContext.js";

import {
  assessZodiacCompatibility,
  ZODIAC_COMPATIBILITY_CANDIDATE_LABELS,
} from "./zodiacCompatibilityAssessment.js";
import type {
  ZodiacCompatibilityAssessment,
  ZodiacCompatibilityCandidate,
  ZodiacCompatibilityLevel,
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

const SELF_ANCHOR_PATTERN =
  /(?:나는|제가|난|나와|내게|나에게)/;

const ZODIAC_LEVEL_RANK:
  Record<
    ZodiacCompatibilityLevel,
    number
  > = {
    supportive: 5,
    similar: 4,
    neutral: 3,
    caution: 2,
    conflicted: 1,
    unknown: 0,
  };

/**
 * UQ-3: Reader와 동일한 Fit+Class 조합.
 * export하지 않고 assessment 내부에서만 사용한다.
 */
function asksZodiacClass(
  question: string,
): boolean {
  return (
    /(?:무슨|어떤|어느)\s*띠/.test(question)
    || /(?:맞는|좋은)\s*띠/.test(question)
    || /맞지\s*않는\s*띠/.test(question)
    || /피해야\s*할\s*띠/.test(question)
    || /띠를\s*피해야/.test(question)
    || /안\s*맞는\s*띠/.test(question)
    || /띠를\s*(?:알려|추천)/.test(question)
    || /띠\s*(?:알려|추천)/.test(question)
    || /띠가\s*무엇/.test(question)
    || /띠는\s*무엇/.test(question)
    || /띠로(?:만)?\s*보면[\s\S]{0,24}(?:어떤|무슨|어느)\s*(?:띠|사람|쪽)/.test(question)
    || /(?:여자|여성|남자|남성)?\s*띠는\b/.test(question)
    || /(?:의\s*)?띠는\?/.test(question)
    || /띠는\s*\?/.test(question)
  );
}

function asksNegativeOpenZodiacFit(
  question: string,
): boolean {
  return /안\s*맞|맞지\s*않|피해야/.test(question);
}

function hasCompatibilityFitFrame(
  question: string,
): boolean {
  if (
    /(?:나에게|내게)\s*(?:어울|맞)/.test(question)
    || /(?:나|내).*(?:직업|사업|투자\s*방식|투자|취미|성격|연애).*(?:맞|어울)/.test(
      question,
    )
  ) {
    return false;
  }

  if (/궁합|합이\s*맞/.test(question)) {
    return true;
  }

  if (/잘\s*맞|어울/.test(question)) {
    return true;
  }

  return asksZodiacClass(question) && /맞|피해야|안\s*맞/.test(question);
}

function isOpenZodiacRecommendationQuestion(
  question: string,
  analysisScope: QuestionContext["question"]["analysisScope"],
): boolean {
  return (
    analysisScope === "zodiac"
    && hasCompatibilityFitFrame(question)
    && asksZodiacClass(question)
  );
}

function pickBestZodiacAssessment(
  assessments: readonly ZodiacCompatibilityAssessment[],
  preferNegativeSide = false,
): ZodiacCompatibilityAssessment | null {
  if (preferNegativeSide) {
    let conflicted: ZodiacCompatibilityAssessment | null = null;
    let caution: ZodiacCompatibilityAssessment | null = null;

    for (const assessment of assessments) {
      if (!assessment.available) {
        continue;
      }

      if (assessment.level === "conflicted" && !conflicted) {
        conflicted = assessment;
      }

      if (assessment.level === "caution" && !caution) {
        caution = assessment;
      }
    }

    if (conflicted) {
      return conflicted;
    }

    if (caution) {
      return caution;
    }
  }

  let best: ZodiacCompatibilityAssessment | null = null;

  for (const assessment of assessments) {
    if (!assessment.available) {
      continue;
    }

    if (!best) {
      best = assessment;
      continue;
    }

    const bestRank = ZODIAC_LEVEL_RANK[best.level];
    const nextRank = ZODIAC_LEVEL_RANK[assessment.level];

    if (nextRank > bestRank) {
      best = assessment;
    }
  }

  return best;
}

function assessOpenZodiacRecommendation(
  input: {
    questionText: string;
    pairZodiacSurfaces: readonly string[];
    selfYearGanZhi?: string;
  },
): ZodiacCompatibilityAssessment | null {
  const namedAnchor =
    !SELF_ANCHOR_PATTERN.test(input.questionText)
    && input.pairZodiacSurfaces.length >= 1
      ? input.pairZodiacSurfaces[0]
      : null;

  const anchorZodiac = namedAnchor;
  const useSelfYear = namedAnchor === null;

  if (useSelfYear && !input.selfYearGanZhi) {
    return null;
  }

  const assessments: ZodiacCompatibilityAssessment[] = [];
  const candidates: ZodiacCompatibilityCandidate[] = [];

  for (const candidateLabel of ZODIAC_COMPATIBILITY_CANDIDATE_LABELS) {
    if (anchorZodiac && candidateLabel === anchorZodiac) {
      continue;
    }

    const assessment = anchorZodiac
      ? assessZodiacCompatibility({
          selfZodiac: anchorZodiac,
          counterpartZodiac: candidateLabel,
        })
      : assessZodiacCompatibility({
          selfYearGanZhi: input.selfYearGanZhi,
          counterpartZodiac: candidateLabel,
        });

    if (
      !assessment.available
      || !assessment.counterpartBranch
      || !assessment.counterpartZodiac
    ) {
      continue;
    }

    assessments.push(assessment);
    candidates.push({
      counterpartBranch: assessment.counterpartBranch,
      counterpartZodiac: assessment.counterpartZodiac,
      relation: assessment.relation,
      level: assessment.level,
    });
  }

  const best = pickBestZodiacAssessment(
    assessments,
    asksNegativeOpenZodiacFit(input.questionText),
  );

  if (!best) {
    return null;
  }

  return {
    ...best,
    candidates,
  };
}

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

  // UQ-3: open zodiac recommendation은 counterpart.exists 없이도
  // zodiac 계산 결과가 있으면 partial로 유지한다.
  if (
    !input
      .questionContext
      .counterpart
      .exists
  ) {
    if (
      input.zodiacProvided
      && input.questionContext.question.analysisScope === "zodiac"
    ) {
      return "partial";
    }

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

  // UQ-3 / Step 3-B: Reader analysisScope=zodiac + 계산 완료면
  // counterpart.exists와 무관하게 zodiacCompatibility로 수렴한다.
  if (
    input.questionContext.question.analysisScope === "zodiac"
    && input.zodiacProvided
  ) {
    return "zodiacCompatibility";
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

  const questionText =
    questionContext
      .question
      .originalQuestion;

  const pairZodiacSurfaces =
    collectPairZodiacSurfaces(
      questionText,
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

  const openZodiacRecommendation =
    isOpenZodiacRecommendationQuestion(
      questionText,
      questionContext.question.analysisScope,
    );

  const counterpartZodiac =
    openZodiacRecommendation
      ? null
      : (
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
        ?? clarificationZodiac
      );

  const useQuestionZodiacPair =
    !openZodiacRecommendation
    && questionContext
      .question
      .analysisScope
    === "zodiac"
    && pairZodiacSurfaces.length
      >= 2;

  const zodiacAssessment =
    openZodiacRecommendation
      ? assessOpenZodiacRecommendation({
          questionText,
          pairZodiacSurfaces,
          selfYearGanZhi,
        })
      : useQuestionZodiacPair
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
