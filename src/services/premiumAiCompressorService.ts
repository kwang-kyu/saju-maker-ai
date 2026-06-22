export function compressPremiumText(text: string): string {
    if (!text) return "";
  
    let result = text;
  
    const patterns = [
      // 토(土) 계열
      "강한 화\\(火\\) 기운",
      "부족한 토\\(土\\)",
      "용신 토\\(土\\)",
      "생활 기반",
      "계획성",
      "현실 감각",
      "규칙적인 생활",
  
      // 비견격·신강
      "비견격 구조",
      "신강 구조",
      "독립성",
      "주체성",
      "경쟁력",
      "스스로 결정",
  
      // 직업·전문성
      "경험과 전문성",
      "전문성과 경험",
      "경험을 축적",
      "전문성을 축적",
      "자신의 강점을 활용",
  
      // 건강
      "건강 관리가 중요합니다",
      "건강은",
      "생활리듬",
  
      // 재물
      "계약과 문서",
      "안정적인 현금흐름",
    ];
  
    for (const pattern of patterns) {
      let count = 0;
  
      result = result.replace(
        new RegExp(pattern, "g"),
        (match) => {
          count++;
  
          if (count > 1) {
            return " ";
          }
  
          return match;
        }
      );
    }
  
    return result
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }