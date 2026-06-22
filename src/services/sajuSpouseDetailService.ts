import { getStarRating } from "../data/tenGodScoreSummaryService";

type SpouseDetailInput = {
  spouseScore: number;
  meetingScore: number;
  marriageScore: number;
  spouseJobScore: number;
  relationshipCautionScore: number;
};

export function getSpouseDetailText({
  spouseScore,
  meetingScore,
  marriageScore,
  spouseJobScore,
  relationshipCautionScore,
}: SpouseDetailInput) {
  return `
❤️ 배우자운 5종 세트

1️⃣ 배우자 성향
${spouseScore}점 ${getStarRating(spouseScore)}
나와 잘 맞는 배우자 성향, 관계에서 끌리는 사람의 분위기를 보는 항목입니다.

2️⃣ 만남운
${meetingScore}점 ${getStarRating(meetingScore)}
새로운 인연, 소개, 자연스러운 만남, 관계가 시작되는 흐름을 보는 항목입니다.

3️⃣ 결혼운
${marriageScore}점 ${getStarRating(marriageScore)}
연애가 안정적인 관계로 이어질 가능성, 책임감 있는 관계 형성 흐름을 보는 항목입니다.

4️⃣ 배우자 직업 성향
${spouseJobScore}점 ${getStarRating(spouseJobScore)}
배우자 또는 인연이 직업적으로 어떤 성향을 가질 가능성이 있는지 참고하는 항목입니다.

5️⃣ 관계 주의사항
${relationshipCautionScore}점 ${getStarRating(relationshipCautionScore)}
관계에서 조심해야 할 감정 표현, 거리감, 소통 방식을 점검하는 항목입니다.
`;
}