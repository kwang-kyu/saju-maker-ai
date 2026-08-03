import type {
    CompatibilityAssessment,
  } from "./compatibilityAssessment";
  import type {
    DecisionEvidence,
  } from "./decisionTypes";
  import type {
    ZodiacCompatibilityLevel,
  } from "./zodiacCompatibilityAssessment";

  function resolveEvidenceWeight(
    level:
      ZodiacCompatibilityLevel,
  ): number {
    switch (
      level
    ) {
      case "supportive":
      case "conflicted":
        return 4;

      case "similar":
      case "caution":
        return 3;

      case "neutral":
        return 2;

      case "unknown":
        return 1;
    }
  }

  /**
   * 계산된 띠 관계를 해석 문장이 아닌 구조화된 사실값으로 전달한다.
   *
   * 최종 자연어 설명은 이 값과 원국·현재 국면·관계 현실을
   * 함께 받은 Explanation GPT가 작성한다.
   */
  export function buildCompatibilityEvidence(
    assessment:
      CompatibilityAssessment,
  ): DecisionEvidence[] {
    const zodiacAssessment =
      assessment
        .zodiacAssessment;

    if (
      !assessment.analysisRequired
      || assessment.analysisScope
        !== "zodiacCompatibility"
      || zodiacAssessment
        === null
      || !zodiacAssessment.available
    ) {
      return [];
    }

    return [
      {
        source:
          "compatibility",

        key:
          `zodiacCompatibility-${zodiacAssessment.relation}`,

        description:
          JSON.stringify({
            calculationBasis:
              zodiacAssessment
                .calculationBasis,

            analysisScope:
              zodiacAssessment
                .analysisScope,

            selfBranch:
              zodiacAssessment
                .selfBranch,

            selfZodiac:
              zodiacAssessment
                .selfZodiac,

            counterpartBranch:
              zodiacAssessment
                .counterpartBranch,

            counterpartZodiac:
              zodiacAssessment
                .counterpartZodiac,

            relation:
              zodiacAssessment
                .relation,

            level:
              zodiacAssessment
                .level,
          }),

        weight:
          resolveEvidenceWeight(
            zodiacAssessment
              .level,
          ),
      },
    ];
  }
