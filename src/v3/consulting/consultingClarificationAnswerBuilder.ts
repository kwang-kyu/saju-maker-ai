import type {
    ConsultingClarificationRequest,
  } from "./consultingSession.js";

  export type ConsultingClarificationAnswerBuilderInput = {
    originalQuestion:
      string;

    clarification:
      ConsultingClarificationRequest;
  };

  function requireNonEmptyValue(
    value:
      string,
    field:
      string,
  ): string {
    const normalizedValue =
      value.trim();

    if (
      normalizedValue.length
      === 0
    ) {
      throw new Error(
        `${field} is required to build a clarification answer.`,
      );
    }

    return normalizedValue;
  }

  function containsKoreanBirthDate(
    question:
      string,
  ): boolean {
    return (
      /\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일/
        .test(
          question,
        )
    );
  }

  function buildCurrentClarificationQuestion(
    input:
      ConsultingClarificationAnswerBuilderInput,
    originalQuestion:
      string,
  ): string {
    const currentItem =
      input
        .clarification
        .items[0];

    if (
      !currentItem
    ) {
      throw new Error(
        "At least one clarification question is required.",
      );
    }

    const birthDateProvided =
      containsKoreanBirthDate(
        originalQuestion,
      );

    if (
      birthDateProvided
      && currentItem.key
      === "counterpartBirthData"
    ) {
      return "말씀하신 생년월일은 확인했습니다. 상대방의 양력·음력 여부, 성별과 가능한 경우 출생시간을 알려주세요.";
    }

    return currentItem.question;
  }

  /**
   * 판단 근거가 부족한 상담에서 GPT의 일반 설명을 대신해
   * 현재 질문에 실제로 필요한 추가정보만 짧고 구체적으로 안내한다.
   */
  export function buildConsultingClarificationAnswer(
    input:
      ConsultingClarificationAnswerBuilderInput,
  ): string {
    const originalQuestion =
      requireNonEmptyValue(
        input.originalQuestion,
        "originalQuestion",
      );

    const currentQuestion =
      buildCurrentClarificationQuestion(
        input,
        originalQuestion,
      );

    return [
      `“${originalQuestion}”에 대해서는 지금 확인된 정보만으로 결론을 확정하지 않겠습니다.`,
      currentQuestion,
    ].join(
      "\n\n",
    );
  }
