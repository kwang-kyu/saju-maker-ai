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
💰 재물운 5종 세트

1️⃣ 돈 버는 능력
${earningScore}점 ${getStarRating(earningScore)}

2️⃣ 돈 지키는 능력
${savingScore}점 ${getStarRating(savingScore)}

3️⃣ 투자운
${investmentScore}점 ${getStarRating(investmentScore)}

4️⃣ 부동산운
${realEstateScore}점 ${getStarRating(realEstateScore)}

5️⃣ 사업운
${businessScore}점 ${getStarRating(businessScore)}
`;
}