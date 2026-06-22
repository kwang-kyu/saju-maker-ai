import { getStarRating } from "../data/tenGodScoreSummaryService";

type RealEstateDetailInput = {
  realEstateScore: number;
  businessScore: number;
};

export function getRealEstateDetailText({
  realEstateScore,
  businessScore,
}: RealEstateDetailInput) {
  return `
🏢 부동산운 전용 해석

1️⃣ 토지운
${Math.min(100, realEstateScore + 2)}점 ${getStarRating(Math.min(100, realEstateScore + 2))}
장기 보유, 개발 가능성, 입지 판단과 관련된 운입니다.

2️⃣ 상가운
${Math.max(60, realEstateScore - 3)}점 ${getStarRating(Math.max(60, realEstateScore - 3))}
임대수익, 유동인구, 상권 분석, 수익형 부동산과 관련된 운입니다.

3️⃣ 아파트운
${Math.max(60, realEstateScore - 5)}점 ${getStarRating(Math.max(60, realEstateScore - 5))}
실거주 안정성, 주거 자산, 가족 기반 자산 형성과 관련된 운입니다.

4️⃣ 임대수익운
${Math.min(100, realEstateScore + 1)}점 ${getStarRating(Math.min(100, realEstateScore + 1))}
월세, 전세, 임대관리, 반복 수익 구조와 관련된 운입니다.

5️⃣ 중개·컨설팅 적성
${Math.min(100, businessScore + 4)}점 ${getStarRating(Math.min(100, businessScore + 4))}
사람을 연결하고, 정보를 해석하고, 계약을 조율하는 능력과 관련된 운입니다.
`;
}