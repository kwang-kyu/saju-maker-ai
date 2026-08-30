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

function buildCurrentClarificationQuestion(
  input:
    ConsultingClarificationAnswerBuilderInput,
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
    );

  return [
    `“${originalQuestion}”에 대해서는 지금 확인된 정보만으로 결론을 확정하지 않겠습니다.`,

    currentQuestion,
  ].join(
    "\n\n",
  );
}