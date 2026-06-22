import {
    optimizePremiumReportText,
    compressMeaningParagraphs,
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
  
  export function getPremiumAiReportText({
    rawAiAnswer,
   
  }: PremiumAiReportInput): string {
    const compressedAiAnswer = compressMeaningParagraphs(
      optimizePremiumReportText(rawAiAnswer)
    );
  
    const premiumSummary = `
  ${compressedAiAnswer}
  
  [AI 종합상담 핵심 정리]
현재 흐름에서는 무리한 확장보다 기반 정리, 경험 축적, 전문성 강화가 중요합니다.

따라서 지금은 단순히 운의 좋고 나쁨을 판단하기보다, 무엇을 시작하고 무엇을 줄이며 누구와 함께할지를 구분하는 시기입니다.
  `;
  
  return replaceRepeatedThemesWithStory(premiumSummary);  
  }