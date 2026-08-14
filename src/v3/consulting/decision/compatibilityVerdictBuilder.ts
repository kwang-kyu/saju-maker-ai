import type {
    QuestionAnalysisScope,
  } from "../question/questionReader";
  import type {
    CompatibilityAssessment,
  } from "./compatibilityAssessment";
  import type {
    DecisionVerdict,
  } from "./decisionTypes";

  export type CompatibilityVerdictBuilderInput = {
    verdict:
      DecisionVerdict;

    assessment:
      CompatibilityAssessment;

    requestedAnalysisScope:
      QuestionAnalysisScope;
  };

  /**
   * 궁합 질문에 실제 비교 자료가 부족하면
   * 다른 개인 판독 근거가 궁합 결론을 대신 만들지 못하도록 한다.
   *
   * 사용자가 띠 궁합만 요청한 경우에는
   * 기존 띠 궁합 계산 결과가 최종 판정을 직접 결정한다.
   *
   * 전체 궁합 질문에서는 띠 결과만으로
   * 전체 궁합 결론을 확정하지 않는다.
   */
  export function applyCompatibilityVerdictEffect(
    input:
      CompatibilityVerdictBuilderInput,
  ): DecisionVerdict {
    const {
      verdict,
      assessment,
      requestedAnalysisScope,
    } = input;

    if (
      !assessment.analysisRequired
    ) {
      return verdict;
    }

    if (
      requestedAnalysisScope
      === "zodiac"
    ) {
      const zodiacAssessment =
        assessment.zodiacAssessment;

      if (
        !zodiacAssessment
        || !zodiacAssessment.available
      ) {
        return "insufficientEvidence";
      }

      switch (
        zodiacAssessment.level
      ) {
        case "supportive":
          return "recommended";

        case "similar":
        case "neutral":
        case "caution":
          return "conditionallyRecommended";

        case "conflicted":
          return "notRecommended";

        case "unknown":
          return "insufficientEvidence";
      }
    }

    if (
      assessment
        .additionalCounterpartDataRequired
    ) {
      return "insufficientEvidence";
    }

    return verdict;
  }