import type {
    ConsultingInput,
  } from "../consultingInput";

  export type ConsultingGroundingContext = {
    sourceLocked:
      true;

    originalQuestion:
      string;

    sajuFacts:
      NonNullable<
        ConsultingInput["sajuFacts"]
      >["facts"] | null;

    readerEvidence:
      ConsultingInput["readerEvidence"] | null;

    humanIdentity:
      ConsultingInput["humanContext"]["identity"];

    currentLuckPhase:
      ConsultingInput["humanContext"]["currentPhase"];

    currentLifeReality:
      ConsultingInput["lifeContext"];
  };

  /**
   * 질문에 답할 때 사용할 개인별 사주 근거를 구성한다.
   *
   * 특정 질문이나 키워드별 문장을 만들지 않는다.
   * 이미 계산된 원국·대운·세운, Master Reader 결과,
   * 현재 운의 국면과 현실 정보만 전달한다.
   *
   * GPT는 이 자료를 질문에 맞게 해석할 수 있지만
   * 계산 결과나 Reader 사실을 변경하거나 새로 만들 수 없다.
   *
   * 기존 단위 검증처럼 계산 자료가 전달되지 않은 경우에는
   * 해당 자료를 null로 명시하며 추측하거나 새로 생성하지 않는다.
   */
  export function buildConsultingGroundingContext(
    input:
      ConsultingInput,
  ): ConsultingGroundingContext {
    const originalQuestion =
      input.question.trim();

    if (
      originalQuestion.length
      === 0
    ) {
      throw new Error(
        "Consulting grounding context requires a non-empty question.",
      );
    }

    return {
      sourceLocked:
        true,

      originalQuestion,

      sajuFacts:
        input.sajuFacts?.facts
        ?? null,

      readerEvidence:
        input.readerEvidence
        ?? null,

      humanIdentity:
        input.humanContext
          .identity,

      currentLuckPhase:
        input.humanContext
          .currentPhase,

      currentLifeReality:
        input.lifeContext,
    };
  }
