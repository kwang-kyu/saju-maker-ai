import { getStarRating } from "../data/tenGodScoreSummaryService";

type MoneyFiveSetInput = {
  earningScore: number;
  savingScore: number;
  investmentScore: number;
  realEstateScore: number;
  businessScore: number;
};

export function getMoneyFiveSetText({
  earningScore,
  savingScore,
  investmentScore,
  realEstateScore,
  businessScore,
}: MoneyFiveSetInput) {
  return `
💰 재물운 핵심 점검

1️⃣ 돈을 만들어내는 힘
${earningScore}점 ${getStarRating(earningScore)}

2️⃣ 돈을 지켜내는 힘
${savingScore}점 ${getStarRating(savingScore)}

3️⃣ 투자 판단력
${investmentScore}점 ${getStarRating(investmentScore)}

4️⃣ 부동산과 자산운
${realEstateScore}점 ${getStarRating(realEstateScore)}

5️⃣ 사업과 확장운
${businessScore}점 ${getStarRating(businessScore)}
`;
}