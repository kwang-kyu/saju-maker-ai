
  
  function normalizeCanonicalText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[.,!?·ㆍ…]/g, "")
      .trim();
  }
  const canonicalSentenceMap: Record<string, string> = {
    JOB_EXPERTISE:
      "재물과 직업운은 여러 분야보다 한 분야의 전문성과 경험이 축적될수록 크게 성장합니다.",
  
      EARTH_SUPPORT:
      "",
  
      BIGYEON_STRONG:
      "",
  };
  function detectCanonicalKey(line: string): string | null {
    const normalized = normalizeCanonicalText(line);
  
    if (
      normalized.includes("현금흐름") ||
      normalized.includes("자산 보전") ||
      normalized.includes("자산관리") ||
      normalized.includes("재물은 관리") ||
      normalized.includes("계약") ||
      normalized.includes("금전")
    ) {
      return "MONEY_MANAGEMENT";
    }
  
    if (
      normalized.includes("프리랜서") ||
      normalized.includes("독립업") ||
      normalized.includes("개인 브랜드") ||
      normalized.includes("자기 브랜드")
    ) {
      return "JOB_INDEPENDENT";
    }
  
    if (
      normalized.includes("상담") ||
      normalized.includes("강의") ||
      normalized.includes("컨설팅") ||
      normalized.includes("자문") ||
      normalized.includes("교육")
    ) {
      return "JOB_CONSULTING";
    }
    if (
        normalized.includes("전문성") ||
        normalized.includes("경험") ||
        normalized.includes("노하우") ||
        normalized.includes("경력") ||
        normalized.includes("숙련")
      ) {
        return "JOB_EXPERTISE";
      }
      
      if (
        normalized.includes("생활 기반") ||
        normalized.includes("계획성") ||
        normalized.includes("현실 감각") ||
        normalized.includes("규칙적인 생활") ||
        normalized.includes("토(土)")
      ) {
        return "EARTH_SUPPORT";
      }
      
      if (
        normalized.includes("비견격") ||
        normalized.includes("신강") ||
        normalized.includes("독립성") ||
        normalized.includes("주체성") ||
        normalized.includes("경쟁력") ||
        normalized.includes("스스로 결정")
      ) {
        return "BIGYEON_STRONG";
      }
    if (
      normalized.includes("전문성") ||
      normalized.includes("경험") ||
      normalized.includes("한 분야") ||
      normalized.includes("실력")
    ) {
      return "JOB_SPECIALIZATION";
    }
  
    if (
      normalized.includes("수면") ||
      normalized.includes("식사") ||
      normalized.includes("생활리듬") ||
      normalized.includes("식습관") ||
      normalized.includes("규칙적인")
    ) {
      return "HEALTH_LIFESTYLE";
    }
  
    if (
      normalized.includes("혈압") ||
      normalized.includes("스트레스") ||
      normalized.includes("과로") ||
      normalized.includes("피로")
    ) {
      return "HEALTH_STRESS";
    }
  
    if (
      normalized.includes("협력") ||
      normalized.includes("인맥") ||
      normalized.includes("귀인") ||
      normalized.includes("신뢰 관계")
    ) {
      return "RELATION_COOPERATION";
    }
  
    if (
      normalized.includes("확장") ||
      normalized.includes("투자") ||
      normalized.includes("과욕") ||
      normalized.includes("과신")
    ) {
      return "EXPANSION_WARNING";
    }
  
    if (
      normalized.includes("토(土)") ||
      normalized.includes("토 기운") ||
      normalized.includes("부족한 토") ||
      normalized.includes("생활 기반")
    ) {
      return "EARTH_BALANCE";
    }
  
    return null;
  }
  
  export function mergeCanonicalPremiumText(text: string): string {
    if (!text) return "";
  
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  
    const usedCanonicalKeys = new Set<string>();
    const result: string[] = [];
  
    for (const line of lines) {
      const key = detectCanonicalKey(line);
  
      if (key && usedCanonicalKeys.has(key)) {
        continue;
      }
  
      if (key) {
        if (!usedCanonicalKeys.has(key)) {
          usedCanonicalKeys.add(key);
      
          const canonicalSentence = canonicalSentenceMap[key];
      
          if (canonicalSentence) {
            result.push(canonicalSentence);
            continue;
          }
      
          result.push(line);
          continue;
        }
      
        continue;
      }
      
      result.push(line);
    }
  
    return result.join("\n\n");
  }