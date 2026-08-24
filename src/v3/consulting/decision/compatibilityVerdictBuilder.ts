import type {
    QuestionAnalysisScope,
  } from "../question/questionReader.js";
  import type {
    CompatibilityAssessment,
  } from "./compatibilityAssessment.js";
  import type {
    DecisionVerdict,
  } from "./decisionTypes.js";

  export type CompatibilityVerdictBuilderInput = {
    verdict:
      DecisionVerdict;

    assessment:
      CompatibilityAssessment;

    requestedAnalysisScope:
      QuestionAnalysisScope;
  };

  function applyPositiveCompatibilityVerdictShift(
    verdict:
      DecisionVerdict,
  ): DecisionVerdict {
    switch (
      verdict
    ) {
      case "recommended":
        return "recommended";

      case "conditionallyRecommended":
        return "recommended";

      case "wait":
        return "conditionallyRecommended";

      case "notRecommended":
        return "conditionallyRecommended";

      case "insufficientEvidence":
        return "insufficientEvidence";

      case "interpreted":
        return "interpreted";
    }
  }

  function applyCautionCompatibilityVerdictShift(
    verdict:
      DecisionVerdict,
  ): DecisionVerdict {
    switch (
      verdict
    ) {
      case "recommended":
        return "conditionallyRecommended";

      case "conditionallyRecommended":
        return "wait";

      case "wait":
        return "wait";

      case "notRecommended":
        return "notRecommended";

      case "insufficientEvidence":
        return "wait";

      case "interpreted":
        return "interpreted";
    }
  }

  function applyFullCompatibilityVerdictEffect(
    verdict:
      DecisionVerdict,
    assessment:
      CompatibilityAssessment,
  ): DecisionVerdict {
    const fullCompatibilityAssessment =
      assessment
        .fullCompatibilityAssessment;

    if (
      assessment.analysisScope
      !== "fullCompatibility"
    ) {
      return verdict;
    }

    if (
      !fullCompatibilityAssessment
      ?.available
    ) {
      return "insufficientEvidence";
    }

    switch (
      fullCompatibilityAssessment
        .overallLevel
    ) {
      case "supportive":
        return applyPositiveCompatibilityVerdictShift(
          verdict,
        );

      case "caution":
        return applyCautionCompatibilityVerdictShift(
          verdict,
        );

      case "mixed":
        return verdict;

      default:
        return verdict;
    }
  }

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

    return applyFullCompatibilityVerdictEffect(
      verdict,
      assessment,
    );
  }
