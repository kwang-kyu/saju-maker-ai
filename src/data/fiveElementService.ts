type FiveElementInput = {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  
  const elementDb: Record<
    string,
    {
      desc: string;
      personality: string;
      money: string;
      job: string;
    }
  > = {
    목: {
      desc: "성장, 확장, 창의력",
      personality: "성장 욕구가 강하고 새로운 일을 시작하는 힘이 좋은 타입입니다.",
      money: "아이디어와 확장성에서 재물 기회가 생기는 편입니다.",
      job: "기획, 교육, 콘텐츠, 개발, 창업 분야와 잘 맞습니다.",
    },
    화: {
      desc: "열정, 표현, 추진력",
      personality: "표현력이 좋고 사람들 앞에서 존재감이 드러나는 타입입니다.",
      money: "홍보, 영업, 브랜드, 대인관계에서 수익 기회가 생기기 쉽습니다.",
      job: "마케팅, 방송, 강의, 영업, 서비스 분야와 잘 맞습니다.",
    },
    토: {
      desc: "안정, 중심, 균형",
      personality: "현실감각이 좋고 책임감 있게 일을 쌓아가는 타입입니다.",
      money: "안정적인 자산관리, 부동산, 장기 수익 구조와 잘 맞습니다.",
      job: "관리, 부동산, 회계, 행정, 조직운영 분야와 잘 맞습니다.",
    },
    금: {
      desc: "분석, 구조, 판단력",
      personality: "판단력과 결단력이 강하고 원칙을 중요하게 여기는 타입입니다.",
      money: "계약, 거래, 전문성, 기술 기반 수익과 잘 맞습니다.",
      job: "법률, 금융, 기술, 중개, 분석, 전문직 분야와 잘 맞습니다.",
    },
    수: {
      desc: "지혜, 흐름, 적응력",
      personality: "지혜와 관찰력이 좋고 상황을 깊이 읽는 타입입니다.",
      money: "정보, 지식, 상담, 유통, 네트워크를 통한 수익 기회가 있습니다.",
      job: "상담, 연구, 기획, 무역, 콘텐츠, 데이터 분야와 잘 맞습니다.",
    },
  };
  export type KoreanStem =
  | "갑" | "을" | "병" | "정" | "무"
  | "기" | "경" | "신" | "임" | "계";

const STEM_MAP: Record<string, KoreanStem> = {
  甲: "갑",
  乙: "을",
  丙: "병",
  丁: "정",
  戊: "무",
  己: "기",
  庚: "경",
  辛: "신",
  壬: "임",
  癸: "계",

  갑: "갑",
  을: "을",
  병: "병",
  정: "정",
  무: "무",
  기: "기",
  경: "경",
  신: "신",
  임: "임",
  계: "계",
};

export function normalizeStem(stem: string): KoreanStem | null {
  return STEM_MAP[stem] ?? null;
}
  function getElementKey(name: string): string {
    if (name.includes("목")) return "목";
    if (name.includes("화")) return "화";
    if (name.includes("토")) return "토";
    if (name.includes("금")) return "금";
    return "수";
  }
  
  export function getFiveElementAnalysis({
    wood,
    fire,
    earth,
    metal,
    water,
  }: FiveElementInput): string {
    const elements = [
      { name: "목", value: wood },
      { name: "화", value: fire },
      { name: "토", value: earth },
      { name: "금", value: metal },
      { name: "수", value: water },
    ];
  
    const strong = elements.filter((e) => e.value >= 3);
    const weak = elements.filter((e) => e.value <= 1);
  
    let result = "";
  
    result += "■ 오행 분석 결과\n\n";
  
    result += "강한 기운:\n";
    if (strong.length > 0) {
      strong.forEach((e) => {
        result += `- ${e.name}: ${elementDb[e.name].desc}\n`;
      });
    } else {
      result += "- 특별히 과도하게 강한 오행은 없습니다.\n";
    }
  
    result += "\n약한 기운:\n";
    if (weak.length > 0) {
      weak.forEach((e) => {
        result += `- ${e.name}: 보완 필요 (${elementDb[e.name].desc})\n`;
      });
    } else {
      result += "- 특별히 부족한 오행은 없습니다.\n";
    }
  
    if (strong.length === 0 && weak.length === 0) {
      result += "\n오행이 비교적 균형적으로 분포된 구조입니다.\n";
    }
  
    return result;
  }
  
  export function getFiveElementPersonalityText({
    strongestName,
    weakestName,
  }: {
    strongestName: string;
    weakestName: string;
  }): string {
    const strongKey = getElementKey(strongestName);
    
    const strong = elementDb[strongKey];
  
    return `${strong.personality}
  다만 ${weakestName} 기운이 부족해 보이므로, 부족한 영역을 의식적으로 보완하면 균형이 좋아집니다.`;
  }
  export function getWeakElementGuide(weakestName: string): string {
    if (weakestName.includes("목")) {
      return "목(木) 보완법: 독서, 공부, 산책, 공원·숲 방문, 새로운 배움 시작이 좋습니다.";
    }
  
    if (weakestName.includes("화")) {
      return "화(火) 보완법: 사람들과 교류, 발표, 운동, 햇빛 보기, 적극적인 표현이 좋습니다.";
    }
  
    if (weakestName.includes("토")) {
      return "토(土) 보완법: 규칙적인 생활, 부동산 공부, 정리정돈, 꾸준한 루틴 만들기가 좋습니다.";
    }
  
    if (weakestName.includes("금")) {
      return "금(金) 보완법: 문서 정리, 재무관리, 계약 검토, 전문기술 습득이 좋습니다.";
    }
  
    return "수(水) 보완법: 충분한 휴식, 여행, 상담, 명상, 독서, 물과 관련된 활동이 좋습니다.";
  }
  export function getLuckyDirectionByYongsin(
    yongsin: string
  ): string {
    if (yongsin === "수(水)") return "북쪽";
    if (yongsin === "목(木)") return "동쪽";
    if (yongsin === "화(火)") return "남쪽";
    if (yongsin === "토(土)") return "중앙 · 남서쪽 · 북동쪽";
    return "서쪽";
  }
  
  export function getLuckyEnvironmentByYongsin(
    yongsin: string
  ): string {
    if (yongsin === "수(水)") {
      return "물가, 카페, 상담실, 연구실";
    }
  
    if (yongsin === "목(木)") {
      return "공원, 숲길, 도서관, 교육공간";
    }
  
    if (yongsin === "화(火)") {
      return "무대, 강의실, 사람 많은 공간";
    }
  
    if (yongsin === "토(土)") {
      return "부동산, 사무실, 안정된 공간";
    }
  
    return "금융기관, 전문직 사무실, 분석 공간";
  }
  export function getFiveElementAdvancedText({
    dayStem,
    strengthType,
    strongestName,
    weakestName,
  }: {
    dayStem: string;
    strengthType: string;
    strongestName: string;
    weakestName: string;
  }): string {
    const dayElement =
      dayStem.includes("갑") || dayStem.includes("을")
        ? "목"
        : dayStem.includes("병") || dayStem.includes("정")
        ? "화"
        : dayStem.includes("무") || dayStem.includes("기")
        ? "토"
        : dayStem.includes("경") || dayStem.includes("신")
        ? "금"
        : "수";
  
    return `이 사주는 일간이 ${dayElement} 기운에 속하고, 전체 구조에서는 ${strongestName} 기운이 강하며 ${weakestName} 기운이 약하게 나타납니다.
  
  신강·신약 관점에서는 ${strengthType} 흐름이므로, 단순히 강한 오행을 더 쓰기보다는 부족한 ${weakestName} 기운을 생활과 일의 방식 속에서 보완하는 것이 중요합니다.
  
  특히 ${strongestName} 기운은 장점으로 쓰면 추진력과 성과가 되지만, 과해지면 한쪽으로 치우친 판단이 될 수 있습니다. 반대로 ${weakestName} 기운은 약점이라기보다 인생의 균형을 맞추기 위해 의식적으로 길러야 할 보완 포인트입니다.`;
  }
  export const getElementFromGanZhi = (ganZhi: string) => {
    const text = String(ganZhi);
  
    if (["甲", "乙", "寅", "卯", "갑", "을", "인", "묘"].some((v) => text.includes(v))) return "목(木)";
    if (["丙", "丁", "巳", "午", "병", "정", "사", "오"].some((v) => text.includes(v))) return "화(火)";
    if (["戊", "己", "辰", "戌", "丑", "未", "무", "기", "진", "술", "축", "미"].some((v) => text.includes(v))) return "토(土)";
    if (["庚", "辛", "申", "酉", "경", "신", "유"].some((v) => text.includes(v))) return "금(金)";
    return "수(水)";
  };  
  export const getElementGuide = (elementName: string) => {
    if (elementName.includes("목")) {
      return {
        color: "초록색, 연두색",
        direction: "동쪽",
        action: "새 계획 세우기, 공부 시작, 기획 정리, 성장형 업무",
        caution: "성급하게 시작만 하고 마무리를 놓치지 않도록 주의하세요.",
      };
    }
  
    if (elementName.includes("화")) {
      return {
        color: "빨간색, 보라색",
        direction: "남쪽",
        action: "홍보, 발표, 만남, 영업, 콘텐츠 노출",
        caution: "감정 표현이 강해질 수 있으니 말투와 속도를 조절하세요.",
      };
    }
  
    if (elementName.includes("토")) {
      return {
        color: "노란색, 갈색, 베이지색",
        direction: "중앙, 남서쪽, 북동쪽",
        action: "정리정돈, 부동산 검토, 재정 점검, 생활 루틴 안정",
        caution: "고집이 강해질 수 있으니 유연한 판단이 필요합니다.",
      };
    }
  
    if (elementName.includes("금")) {
      return {
        color: "흰색, 은색, 회색",
        direction: "서쪽",
        action: "계약, 문서 작업, 협상, 분석, 규칙 정비",
        caution: "지나친 완벽주의와 비판적 태도를 조심하세요.",
      };
    }
  
    return {
      color: "검정색, 파란색, 남색",
      direction: "북쪽",
      action: "휴식, 상담, 정보수집, 생각 정리, 조용한 계획",
      caution: "생각이 많아져 결정이 늦어질 수 있으니 우선순위를 정하세요.",
    };
  };

  export function countFiveElementsFromPillars(allPillars: string) {
    let wood = 0;
    let fire = 0;
    let earth = 0;
    let metal = 0;
    let water = 0;
  
    const woodChars = ["갑", "을", "인", "묘", "甲", "乙", "寅", "卯"];
    const fireChars = ["병", "정", "사", "오", "丙", "丁", "巳", "午"];
    const earthChars = [
      "무",
      "기",
      "진",
      "술",
      "축",
      "미",
      "戊",
      "己",
      "辰",
      "戌",
      "丑",
      "未",
    ];
    const metalChars = ["경", "신", "유", "庚", "辛", "申", "酉"];
    const waterChars = ["임", "계", "자", "해", "壬", "癸", "子", "亥"];
  
    for (const ch of allPillars) {
      if (woodChars.includes(ch)) wood++;
      if (fireChars.includes(ch)) fire++;
      if (earthChars.includes(ch)) earth++;
      if (metalChars.includes(ch)) metal++;
      if (waterChars.includes(ch)) water++;
    }
  
    return {
      wood,
      fire,
      earth,
      metal,
      water,
    };
  }

  export function getStrongWeakElements({
    wood,
    fire,
    earth,
    metal,
    water,
  }: FiveElementInput) {
    const elements = [
      { name: "목(木)", count: wood },
      { name: "화(火)", count: fire },
      { name: "토(土)", count: earth },
      { name: "금(金)", count: metal },
      { name: "수(水)", count: water },
    ];
  
    const weakest = [...elements].sort((a, b) => a.count - b.count)[0];
    const strongest = [...elements].sort((a, b) => b.count - a.count)[0];
  
    return {
      weakest,
      strongest,
    };
  }

  export function getLuckyColorByYongsin(yongsin: string): string {
    if (yongsin === "수(水)") return "파란색, 남색, 검정색";
    if (yongsin === "목(木)") return "초록색, 연두색";
    if (yongsin === "화(火)") return "빨간색, 주황색, 보라색";
    if (yongsin === "토(土)") return "노란색, 베이지색, 갈색";
  
    return "흰색, 은색, 금색";
  }
  