import {
  replaceRepeatedThemesWithStory,
} from "../data/aiPromptData";

type PremiumAiReportInput = {
  rawAiAnswer: string;
  timingEventText: string;
  moneyTimingText: string;
  jobTimingText: string;
  loveTimingText: string;
  healthTimingText: string;
  premiumActionTimingText: string;
};

export function getPremiumAiReportText(
  _input: PremiumAiReportInput
): string {
  const premiumSummary = `
[AI 종합상담]

한마디로 말하면,
지금은 확장보다 방향을 정리해야 하는 시기입니다.

현재 흐름에서는 새로운 일을 계속 늘리는 것보다
이미 가지고 있는 경험과 강점을 수익 구조로 연결하는 것이 중요합니다.

재물운은 돈을 버는 능력보다
돈이 오래 머무를 수 있는 구조를 만드는 것이 핵심입니다.

직업운은 자신의 이름과 경험이 자산이 되는 분야에서
강점을 발휘할 가능성이 높습니다.

인간관계에서는 새로운 인연보다
기존 인연을 정리하고 발전시키는 것이 도움이 됩니다.

건강은 체력보다 생활 리듬과 회복 습관을
안정적으로 유지하는 것이 중요합니다.

앞으로 3년은 방향을 결정하는 시기입니다.

최종 총평

운명은 정해진 결과가 아니라
선택에 따라 달라지는 흐름입니다.

천운문은 단순히 길흉을 판단하지 않습니다.

당신의 운명을 읽고,
인생의 방향을 제시합니다.
`;

  return replaceRepeatedThemesWithStory(premiumSummary);
}