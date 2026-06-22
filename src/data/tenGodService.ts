export function getTenGodAnalysis({
    dayStem,
    yearTenGod,
    monthTenGod,
    timeTenGod,
  }: {
    dayStem: string;
    yearTenGod: string;
    monthTenGod: string;
    timeTenGod: string;
  }): string {
    const baseText = `
  일간 ${dayStem}을 중심으로 십성 구조를 분석합니다.
  
  년간 십성: ${yearTenGod}
  월간 십성: ${monthTenGod}
  시간 십성: ${timeTenGod}
  
  십성은 개인의 성향, 직업 방향, 인간관계 구조를 결정하는 핵심 요소입니다.
    `.trim();
  
    let analysis = "";
  
    if (yearTenGod.includes("비견") || monthTenGod.includes("비견") || timeTenGod.includes("비견")) {
      analysis += "비견이 강한 구조로 독립성과 자기주도성이 강합니다. ";
    }
  
    if (yearTenGod.includes("정재") || monthTenGod.includes("정재") || timeTenGod.includes("정재")) {
      analysis += "정재가 존재하여 안정적인 재물 구조를 형성합니다. ";
    }
  
    if (yearTenGod.includes("편재") || monthTenGod.includes("편재") || timeTenGod.includes("편재")) {
      analysis += "편재 성향으로 활동적이고 사업 감각이 뛰어납니다. ";
    }
  
    if (yearTenGod.includes("식신") || monthTenGod.includes("식신") || timeTenGod.includes("식신")) {
      analysis += "식신 구조는 창의성과 생산성이 강한 특징입니다. ";
    }
  
    if (yearTenGod.includes("상관") || monthTenGod.includes("상관") || timeTenGod.includes("상관")) {
      analysis += "상관 구조는 표현력과 기획력이 강한 성향입니다. ";
    }
  
    if (analysis === "") {
      analysis = "십성 구조가 비교적 균형적으로 형성되어 있습니다.";
    }
  
    return baseText + "\n\n" + analysis;
  }
  export function getTimeGanZhiByDayStem(
    dayStem: string,
    birthTime: string
  ): string {
    if (birthTime === "시간 모름") return "시간 모름";
  
    const timeBranchMap: Record<string, string> = {
      자시: "자",
      축시: "축",
      인시: "인",
      묘시: "묘",
      진시: "진",
      사시: "사",
      오시: "오",
      미시: "미",
      신시: "신",
      유시: "유",
      술시: "술",
      해시: "해",
    };
  
    const selectedTimeKey = Object.keys(timeBranchMap).find((key) =>
      birthTime.includes(key)
    );
  
    if (!selectedTimeKey) return "계산 확인 필요";
  
    const timeBranch = timeBranchMap[selectedTimeKey];
  
    const timeStemTable: Record<string, Record<string, string>> = {
      갑: { 자: "갑", 축: "을", 인: "병", 묘: "정", 진: "무", 사: "기", 오: "경", 미: "신", 신: "임", 유: "계", 술: "갑", 해: "을" },
      기: { 자: "갑", 축: "을", 인: "병", 묘: "정", 진: "무", 사: "기", 오: "경", 미: "신", 신: "임", 유: "계", 술: "갑", 해: "을" },
      을: { 자: "병", 축: "정", 인: "무", 묘: "기", 진: "경", 사: "신", 오: "임", 미: "계", 신: "갑", 유: "을", 술: "병", 해: "정" },
      경: { 자: "병", 축: "정", 인: "무", 묘: "기", 진: "경", 사: "신", 오: "임", 미: "계", 신: "갑", 유: "을", 술: "병", 해: "정" },
      병: { 자: "무", 축: "기", 인: "경", 묘: "신", 진: "임", 사: "계", 오: "갑", 미: "을", 신: "병", 유: "정", 술: "무", 해: "기" },
      신: { 자: "무", 축: "기", 인: "경", 묘: "신", 진: "임", 사: "계", 오: "갑", 미: "을", 신: "병", 유: "정", 술: "무", 해: "기" },
      정: { 자: "경", 축: "신", 인: "임", 묘: "계", 진: "갑", 사: "을", 오: "병", 미: "정", 신: "무", 유: "기", 술: "경", 해: "신" },
      임: { 자: "경", 축: "신", 인: "임", 묘: "계", 진: "갑", 사: "을", 오: "병", 미: "정", 신: "무", 유: "기", 술: "경", 해: "신" },
      무: { 자: "임", 축: "계", 인: "갑", 묘: "을", 진: "병", 사: "정", 오: "무", 미: "기", 신: "경", 유: "신", 술: "임", 해: "계" },
      계: { 자: "임", 축: "계", 인: "갑", 묘: "을", 진: "병", 사: "정", 오: "무", 미: "기", 신: "경", 유: "신", 술: "임", 해: "계" },
    };
  
    const timeStem = timeStemTable[dayStem]?.[timeBranch];
  
    if (!timeStem) return `${timeBranch}시`;
  
    return `${timeStem}${timeBranch}`;
  } 
  export function getTenGodByStem(
    dayStem: string,
    targetStem: string
  ): string {
    const stemInfo: Record<string, { element: string; yinYang: string }> = {
      甲: { element: "목", yinYang: "양" },
      乙: { element: "목", yinYang: "음" },
      丙: { element: "화", yinYang: "양" },
      丁: { element: "화", yinYang: "음" },
      戊: { element: "토", yinYang: "양" },
      己: { element: "토", yinYang: "음" },
      庚: { element: "금", yinYang: "양" },
      辛: { element: "금", yinYang: "음" },
      壬: { element: "수", yinYang: "양" },
      癸: { element: "수", yinYang: "음" },
  
      갑: { element: "목", yinYang: "양" },
      을: { element: "목", yinYang: "음" },
      병: { element: "화", yinYang: "양" },
      정: { element: "화", yinYang: "음" },
      무: { element: "토", yinYang: "양" },
      기: { element: "토", yinYang: "음" },
      경: { element: "금", yinYang: "양" },
      신: { element: "금", yinYang: "음" },
      임: { element: "수", yinYang: "양" },
      계: { element: "수", yinYang: "음" },
    };
  
    const generates: Record<string, string> = {
      목: "화",
      화: "토",
      토: "금",
      금: "수",
      수: "목",
    };
  
    const controls: Record<string, string> = {
      목: "토",
      토: "수",
      수: "화",
      화: "금",
      금: "목",
    };
  
    const day = stemInfo[dayStem];
    const target = stemInfo[targetStem];
  
    if (!day || !target) return "계산불가";
  
    const sameYinYang = day.yinYang === target.yinYang;
  
    if (day.element === target.element) return sameYinYang ? "비견" : "겁재";
    if (generates[day.element] === target.element) return sameYinYang ? "식신" : "상관";
    if (generates[target.element] === day.element) return sameYinYang ? "편인" : "정인";
    if (controls[day.element] === target.element) return sameYinYang ? "편재" : "정재";
    if (controls[target.element] === day.element) return sameYinYang ? "편관" : "정관";
  
    return "계산불가";
  } 