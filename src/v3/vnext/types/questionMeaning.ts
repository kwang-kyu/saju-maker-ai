/**
 * vNext Question Meaning 계약.
 *
 * 사용자가 실제 무엇을 묻는지만 표현한다. 사주 판단을 포함하지 않는다.
 * Question Reader 결과는 향후 Adapter가 이 타입으로 변환한다.
 */

export type QuestionDomain =
  | "money"
  | "career"
  | "business"
  | "relationship"
  | "marriage"
  | "compatibility"
  | "health"
  | "legal"
  | "life"
  | "general"
  | "other";

/** vNext 질문 의도 — 기존 QuestionIntent를 복제하지 않는 독립 계약 */
export type QuestionMeaningIntent =
  | "possibility"
  | "timing"
  | "direction"
  | "reason"
  | "method"
  | "risk"
  | "comparison"
  | "selection"
  | "interpretation"
  | "existence"
  | "general";

/** 질문이 가리키는 시간 초점 */
export type QuestionTimeFocus = {
  urgency: "immediate" | "nearTerm" | "longTerm" | "unspecified";
  timingType: "bestTiming" | "executionTiming" | "waitingTiming" | "unspecified";
  description?: string;
};

/** 질문의 대상·객체 */
export type QuestionObject = {
  label: string;
  category: string;
  description?: string;
};

/** 분석에 필요하지만 아직 제공되지 않은 맥락 */
export type MissingContextItem = {
  key: string;
  description: string;
  required: boolean;
};

/**
 * vNext Question Meaning.
 *
 * domain / event / intent / time / object / missingContext만 표현한다.
 */
export type QuestionMeaning = {
  domain: QuestionDomain;
  event: string | null;
  intent: QuestionMeaningIntent;
  time: QuestionTimeFocus;
  object: QuestionObject | null;
  missingContext: MissingContextItem[];
};
