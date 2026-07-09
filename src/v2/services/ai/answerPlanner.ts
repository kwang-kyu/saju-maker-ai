import type { IntentAnalysisResult } from "./intentAnalyzer";

export type AnswerPlan = {
  question: string;
  intent: string;
  requiredCores: string[];
  opening: string;
  mainFocus: string;
  answerFlow: string[];
  closing: string;
};

export function buildAnswerPlan(intentAnalysis: IntentAnalysisResult): AnswerPlan {
  const { question, intent, requiredCores, needsFollowUp } = intentAnalysis;

  const mainFocus = requiredCores.length > 0
    ? requiredCores.join(", ")
    : "general";

  const opening = needsFollowUp
    ? "질문이 조금 넓게 들어왔기 때문에, 먼저 핵심 흐름을 기준으로 정리해드리겠습니다."
    : "질문하신 내용은 단순히 좋고 나쁨으로 볼 문제가 아니라, 현재 사주의 흐름에서 어떤 선택이 맞는지를 봐야 합니다.";

  const answerFlow = [
    "질문의 핵심 의도를 먼저 정리합니다.",
    "필요한 Core 판단을 기준으로 사주 흐름을 해석합니다.",
    "현실에서 바로 적용할 수 있는 선택 기준을 제시합니다.",
    "주의해야 할 부분과 다음 행동 방향을 정리합니다.",
  ];

  const closing =
    "최종적으로는 운이 좋다 나쁘다보다, 지금 어떤 기준으로 움직이느냐가 더 중요합니다.";

  return {
    question,
    intent,
    requiredCores,
    opening,
    mainFocus,
    answerFlow,
    closing,
  };
}