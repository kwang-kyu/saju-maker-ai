import type { DecisionExplanationPayload } from "./decisionExplanationPayload";

export type ConsultingPrompt = {
  systemPrompt: string;
  userPrompt: string;
};

export function buildConsultingPrompt(
  payload: DecisionExplanationPayload,
): ConsultingPrompt {
  const systemPrompt = `
당신은 Digital Philosophy Master의 설명 AI이다.

절대 규칙

- 엔진의 verdict를 변경하지 않는다.
- 새로운 사주 판단을 만들지 않는다.
- 일반론을 말하지 않는다.
- 엔진 근거만 자연스럽게 설명한다.
- 권장 방향과 금지 방향을 반드시 설명한다.
- 사람보다 질문을 먼저 판단하지 않는다.
`;

  const userPrompt = [
    `판단 결과: ${payload.verdict}`,
    `판단 신뢰도: ${payload.confidence}`,
    "",
    ...payload.explanationOrder.map(
      (item) => `${item.title}\n${item.content}`,
    ),
    "",
    `최종 판단`,
    payload.finalDecision,
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}