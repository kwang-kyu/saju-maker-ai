export function compressPremiumText(text: string): string {
  if (!text) return "";

  // AI 종합상담은 프리미엄 상품의 핵심이므로 압축하지 않는다.
  if (
    text.includes("[AI 종합상담]") ||
    text.includes("AI 종합상담") ||
    text.includes("한마디로 말하면") ||
    text.includes("최종 총평")
  ) {
    return text
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{4,}/g, "\n\n\n")
      .trim();
  }

  let result = text;

  const patterns = [
    "강한 목(木) 기운",
    "강한 화(火) 기운",
    "강한 토(土) 기운",
    "강한 금(金) 기운",
    "강한 수(水) 기운",
    "부족한 목(木)",
    "부족한 화(火)",
    "부족한 토(土)",
    "부족한 금(金)",
    "부족한 수(水)",
    "신강 구조",
    "신약 구조",
    "전문성과 경험",
    "경험과 전문성",
    "건강 관리가 중요합니다",
    "생활 리듬",
    "계약과 문서",
    "안정적인 현금흐름",
  ];

  for (const pattern of patterns) {
    let count = 0;

    result = result.replace(new RegExp(pattern, "g"), (match) => {
      count++;

      if (count > 2) {
        return "";
      }

      return match;
    });
  }

  return result
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}