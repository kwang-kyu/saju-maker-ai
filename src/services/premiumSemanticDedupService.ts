type SemanticDedupOptions = {
    similarityThreshold?: number;
    maxSentenceLength?: number;
  };
  
  const synonymGroups: string[][] = [
    ["계약", "문서", "서류", "합의", "약속"],
    ["금전", "재물", "돈", "수익", "자금", "현금"],
    ["건강", "몸", "체력", "컨디션"],
    ["관리", "점검", "기록", "정리", "확인"],
    ["확장", "무리", "과욕", "공격", "추진"],
    ["변화", "이동", "전환", "환경", "흐름"],
    ["유연", "대응", "조정", "적응"],
    ["직업", "일", "업무", "사업", "진로"],
    ["전문성", "경험", "노하우", "경력", "숙련"],
    ["토", "토(土)", "생활기반", "계획성", "현실감각"],
    ["화", "화(火)", "열정", "표현력", "추진력"],
    ["인간관계", "관계", "대인", "사람"],
    ["방향", "흐름", "기조", "전개"],
    ["성장", "발전", "확장", "커진다", "강화된다"],
    ["협력", "신뢰", "소통", "배려", "공감"],
    ["건강 관리", "체력 관리", "수면 관리", "생활 리듬", "회복", "컨디션"],
    ["계획", "체계", "시스템", "프로세스", "습관", "루틴"],
    ["감정 조절", "감정 관리", "고집", "욕심", "갈등", "충돌"],
  ];
  
  const meaningPatterns = [
    {
      keywords: ["재물"],
      signature: "MONEY_MANAGEMENT",
    },
    {
      keywords: ["계약"],
      signature: "MONEY_MANAGEMENT",
    },
    {
      keywords: ["관리"],
      signature: "MONEY_MANAGEMENT",
    },
  
    {
      keywords: ["건강"],
      signature: "HEALTH_MANAGEMENT",
    },
    {
      keywords: ["스트레스"],
      signature: "HEALTH_MANAGEMENT",
    },
    {
      keywords: ["혈압"],
      signature: "HEALTH_MANAGEMENT",
    },
    {
      keywords: ["피로"],
      signature: "HEALTH_MANAGEMENT",
    },
  
    {
      keywords: ["토"],
      signature: "EARTH_SUPPLEMENT",
    },
    {
      keywords: ["토(土)"],
      signature: "EARTH_SUPPLEMENT",
    },
  
    {
      keywords: ["확장"],
      signature: "EXPANSION_WARNING",
    },
    {
      keywords: ["과욕"],
      signature: "EXPANSION_WARNING",
    },
    {
      keywords: ["투자"],
      signature: "EXPANSION_WARNING",
    },
  
    {
      keywords: ["협력"],
      signature: "RELATION_COOPERATION",
    },
    {
      keywords: ["인맥"],
      signature: "RELATION_COOPERATION",
    },
    {
      keywords: ["관계"],
      signature: "RELATION_COOPERATION",
    },
    {
      keywords: ["귀인"],
      signature: "RELATION_COOPERATION",
    },
  
    {
        keywords: ["현금흐름"],
        signature: "MONEY_MANAGEMENT",
      },
      {
        keywords: ["자산"],
        signature: "MONEY_MANAGEMENT",
      },
      {
        keywords: ["기록"],
        signature: "MONEY_MANAGEMENT",
      },
      {
        keywords: ["프리랜서"],
        signature: "JOB_INDEPENDENT",
      },
      {
        keywords: ["독립업"],
        signature: "JOB_INDEPENDENT",
      },
      {
        keywords: ["강의"],
        signature: "JOB_CONSULTING",
      },
      {
        keywords: ["상담"],
        signature: "JOB_CONSULTING",
      },
      {
        keywords: ["컨설팅"],
        signature: "JOB_CONSULTING",
      },
      {
        keywords: ["수면"],
        signature: "HEALTH_LIFESTYLE",
      },
      {
        keywords: ["생활리듬"],
        signature: "HEALTH_LIFESTYLE",
      },
      {
        keywords: ["식습관"],
        signature: "HEALTH_LIFESTYLE",
      },
      {
        keywords: ["전문성"],
        signature: "JOB_EXPERTISE",
      },
      {
        keywords: ["경험"],
        signature: "JOB_EXPERTISE",
      },
      {
        keywords: ["토"],
        signature: "EARTH_BALANCE",
      },
      {
        keywords: ["화"],
        signature: "FIRE_STRENGTH",
      },  
    {
      keywords: ["재물", "직업", "인간관계", "건강"],
      signature: "LIFE_DIRECTION",
    },
    {
      keywords: [
        "토 기운 보완",
        "균형 유지",
        "안정적 운영",
        "체계적 관리",
        "계획적인 습관",
      ],
      signature: "BALANCE_AND_STABILITY",
    },
    {
      keywords: [
        "협력 관계 유지",
        "인간관계 신뢰",
        "감정 조절",
        "상대 입장 존중",
        "갈등 감소",
      ],
      signature: "RELATIONSHIP_MAINTENANCE",
    },
    {
      keywords: [
        "건강 관리",
        "규칙적인 수면",
        "체력 관리",
        "생활 패턴",
        "회복 리듬",
      ],
      signature: "HEALTH_ROUTINE",
    },  
  ];
  
  const globalMeaningMap: Record<string, string[]> = {
    MONEY_STABILITY: [
      "안정적인 현금흐름",
      "자산 보전",
      "관리력",
      "반복 수익",
      "재물은 관리",
      "현금흐름",
    ],
  
    EARTH_BALANCE: [
      "토(土) 기운",
      "토 기운 보완",
      "부족한 토",
      "토를 살리기",
      "생활 기반",
      "안정적인 관리",
    ],
  
    EXPANSION_WARNING: [
      "무리한 확장",
      "준비 없는 투자",
      "과신",
      "과속",
      "공격적 투자",
      "무리한 추진",
    ],
  
    HEALTH_STRESS: [
      "과로",
      "혈압",
      "스트레스",
      "생활리듬",
      "컨디션",
      "수면",
    ],
  
    RELATION_COOPERATION: [
      "협력",
      "인맥",
      "관계",
      "사람",
      "동업",
      "인간관계",
    ],
    JOB_INDEPENDENT: [
        "프리랜서",
        "독립업",
        "개인 브랜드",
        "자영업",
        "브랜드형",
        "1인 사업",
      ],
      
      JOB_CONSULTING: [
        "상담",
        "강의",
        "컨설팅",
        "자문",
        "교육",
        "코칭",
      ],
      
      HEALTH_LIFESTYLE: [
        "수면",
        "생활리듬",
        "식습관",
        "규칙적인 습관",
        "스트레스 관리",
        "건강관리",
      ],
      JOB_EXPERTISE: [
        "전문성",
        "경험",
        "노하우",
        "경력",
        "숙련",
      ],
      
      FIRE_STRENGTH: [
        "화",
        "화(火)",
        "열정",
        "표현력",
        "추진력",
      ],
      BALANCE_AND_STABILITY: [
        "토 기운 보완",
        "균형 유지",
        "안정적 운영",
        "체계적 관리",
        "계획적인 습관",
      ],
      
      RELATIONSHIP_MAINTENANCE: [
        "협력 관계 유지",
        "인간관계 신뢰",
        "감정 조절",
        "상대 입장 존중",
        "갈등 감소",
      ],
      
      HEALTH_ROUTINE: [
        "건강 관리",
        "규칙적인 수면",
        "체력 관리",
        "생활 패턴",
        "회복 리듬",
      ],
  };
  function normalizeText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[.,!?·ㆍ…]/g, "")
      .replace(/[()［］\[\]{}]/g, "")
      .trim();
  }
  
  function replaceSynonyms(text: string): string {
    let result = normalizeText(text);
  
    synonymGroups.forEach((group, index) => {
      const key = `SEM${index}`;
      group.forEach((word) => {
        result = result.replaceAll(word, key);
      });
    });
  
    return result;
  }
  
  function getSemanticSignature(sentence: string): string {
    const normalized = replaceSynonyms(sentence);
    for (const [signature, keywords] of Object.entries(globalMeaningMap)) {
        const matchedCount = keywords.filter((keyword) =>
          normalized.includes(keyword)
        ).length;
      
        if (matchedCount >= 2) {
          return signature;
        }
      }
    const original = normalizeText(sentence);
  
    const matched = meaningPatterns.find((pattern) =>
      pattern.keywords.every((keyword) => original.includes(keyword))
    );
  
    if (matched) {
      return matched.signature;
    }
  
    const tokens = normalized
      .split(" ")
      .filter((word) => word.length >= 2)
      .filter(
        (word) =>
          ![
            "합니다",
            "됩니다",
            "있습니다",
            "중요합니다",
            "필요합니다",
            "좋습니다",
            "시기입니다",
            "태도입니다",
          ].includes(word)
      );
  
    return Array.from(new Set(tokens)).sort().join("|");
  }
  
  function getSimilarity(a: string, b: string): number {
    const aSet = new Set(getSemanticSignature(a).split("|").filter(Boolean));
    const bSet = new Set(getSemanticSignature(b).split("|").filter(Boolean));
  
    if (aSet.size === 0 || bSet.size === 0) return 0;
  
    const intersection = [...aSet].filter((x) => bSet.has(x)).length;
    const union = new Set([...aSet, ...bSet]).size;
  
    return intersection / union;
  }
  
  function compressSentence(sentence: string, maxLength: number): string {
    const trimmed = sentence.trim();
  
    if (trimmed.length <= maxLength) return trimmed;
  
    return (
      trimmed
        .replace(/무리하게 확장하기보다/g, "무리한 확장보다")
        .replace(
          /환경 변화에 유연하게 대응하는 태도가 중요합니다/g,
          "변화에는 유연한 대응이 필요합니다"
        )
        .replace(
          /재물은 공격보다 관리가 중요합니다/g,
          "재물은 관리 중심이 유리합니다"
        )
        .replace(
          /계약, 금전, 건강 관리는 기록 중심으로 관리하기/g,
          "계약·금전·건강은 기록 중심으로 점검하기"
        )
        .slice(0, maxLength) + "..."
    );
  }
  
  export function premiumSemanticDedupText(
    text: string,
    options: SemanticDedupOptions = {}
  ): string {
    const similarityThreshold = options.similarityThreshold ?? 0.72;
    const maxSentenceLength = options.maxSentenceLength ?? 95;
  
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  
    const keptLines: string[] = [];
    const signatures = new Set<string>();
    for (const line of lines) {
    if (
      line.includes("■ 직업 페르소나") ||
      line.includes("부동산 중개·개발형 사주입니다") ||
      line.includes("창업·브랜드형 사주입니다") ||
      line.includes("컨설턴트·교육·연구형 사주입니다") ||
      line.includes("조직 리더·운영형 사주입니다") ||
    
      line.includes("사람과 자산을 연결하는 감각") ||
      line.includes("입지·정보·시장 흐름") ||
      line.includes("중개, 개발기획, 자산 컨설팅") ||
    
      line.includes("새로운 일을 기획하고") ||
      line.includes("사람과 자원을 모아") ||
      line.includes("창업, 브랜딩, 마케팅") ||
    
      line.includes("짧은 성과보다") ||
      line.includes("상담, 교육, 연구, 컨설팅") ||
      line.includes("경험과 지식이 축적될수록") ||
    
      line.includes("관리, 기획, 운영") ||
      line.includes("역할과 책임이 명확한 환경") ||
      line.includes("책임자, 총괄 운영자")
    ) {
      keptLines.push(line);
      continue;
    }
    
      if (keptLines.some((l) => l.includes("■ 직업 페르소나"))) {
        keptLines.push(line);
        continue;
      }
    
      const signature = getSemanticSignature(line);
    
      if (!signature) {
        keptLines.push(line);
        continue;
      }
    
      if (signatures.has(signature)) continue;
  
      if (signatures.has(signature)) continue;
  
      const isSimilar = keptLines.some(
        (kept) => getSimilarity(line, kept) >= similarityThreshold
      );
  
      if (isSimilar) continue;
  
      signatures.add(signature);
      keptLines.push(compressSentence(line, maxSentenceLength));
    }
  
    return keptLines.join("\n\n");
  }