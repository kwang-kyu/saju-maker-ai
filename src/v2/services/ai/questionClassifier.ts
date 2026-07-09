import type { ScenarioTopic } from "./scenarioMap";

export type QuestionClassification = {
  topic: ScenarioTopic;
  matchedKeyword: string;
};

const rules: { topic: ScenarioTopic; keywords: string[] }[] = [
  { topic: "business", keywords: ["사업", "창업", "개업", "가게", "장사", "통닭", "치킨", "카페", "식당"] },
  { topic: "money", keywords: ["돈", "재물", "금전", "수입", "재산", "투자"] },
  { topic: "financialStrategy", keywords: ["재테크", "부동산", "아파트", "상가", "토지", "건물", "매매"] },
  { topic: "job", keywords: ["이직", "퇴사", "취업", "직장", "승진", "일자리"] },
  { topic: "love", keywords: ["연애", "애정", "남자", "여자", "인연"] },
  { topic: "marriage", keywords: ["결혼", "재혼", "배우자", "남편", "아내"] },
  { topic: "compatibility", keywords: ["궁합", "맞나요", "잘맞", "상대", "연인", "부부"] },
  { topic: "health", keywords: ["건강", "아픈", "질병", "병원", "수술"] },
  { topic: "legalRisk", keywords: ["관재", "관제", "소송", "분쟁", "고소", "계약", "세금", "법"] },
  { topic: "lifeTimeline", keywords: ["대운", "세운", "운", "흐름", "언제"] },
];

export function classifyQuestion(question: string): QuestionClassification {
  const normalized = question.replace(/\s+/g, "").toLowerCase();

  for (const rule of rules) {
    const matched = rule.keywords.find((keyword) =>
      normalized.includes(keyword.replace(/\s+/g, "").toLowerCase())
    );

    if (matched) {
      return {
        topic: rule.topic,
        matchedKeyword: matched,
      };
    }
  }

  return {
    topic: "general",
    matchedKeyword: "",
  };
}