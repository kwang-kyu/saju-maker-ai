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
  };

  /**
   * 상대방 원국 판독이 필요한 질문에서
   * 실제 비교 자료가 부족하면 다른 개인 판독 근거가
   * 궁합 결론을 대신 만들지 못하도록 판정을 중단한다.
   */
  export function applyCompatibilityVerdictEffect(
    input:
      CompatibilityVerdictBuilderInput,
  ): DecisionVerdict {
    const {
      verdict,
      assessment,
    } = input;

    if (
      !assessment.analysisRequired
      || !assessment
        .additionalCounterpartDataRequired
    ) {
      return verdict;
    }

    return "insufficientEvidence";
  }
