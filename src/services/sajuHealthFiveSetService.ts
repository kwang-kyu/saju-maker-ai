import { getStarRating } from "../data/tenGodScoreSummaryService";

type HealthFiveSetInput = {
  healthBaseScore: number;
  middleAgeHealthScore: number;
  oldAgeHealthScore: number;
  weakOrganScore: number;
  lifestyleScore: number;
  weakestName: string;
};

export function getHealthFiveSetText({
  healthBaseScore,
  middleAgeHealthScore,
  oldAgeHealthScore,
  weakOrganScore,
  lifestyleScore,
  weakestName,
}: HealthFiveSetInput) {
  return `
🏥 건강운 5종 세트

1️⃣ 선천 건강운
${healthBaseScore}점 ${getStarRating(healthBaseScore)}
타고난 체력과 기본 회복력을 참고하는 항목입니다.

2️⃣ 중년 건강운
${middleAgeHealthScore}점 ${getStarRating(middleAgeHealthScore)}
일, 책임, 스트레스가 많아지는 시기의 건강 관리 흐름입니다.

3️⃣ 노년 건강운
${oldAgeHealthScore}점 ${getStarRating(oldAgeHealthScore)}
장기적인 생활습관과 노후 건강 관리 흐름을 보는 항목입니다.

4️⃣ 주의 장기
${weakOrganScore}점 ${getStarRating(weakOrganScore)}
부족한 오행인 ${weakestName}과 관련해 특히 신경 쓰면 좋은 건강 영역입니다.

5️⃣ 생활습관 조언
${lifestyleScore}점 ${getStarRating(lifestyleScore)}
수면, 식사, 운동, 스트레스 관리처럼 일상에서 보완할 수 있는 항목입니다.

※ 건강운은 의학적 진단이 아니라 사주 오행 균형을 참고한 생활관리 조언입니다.
`;
}