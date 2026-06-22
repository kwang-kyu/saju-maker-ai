const stemElementMap: Record<string, string> = {
    갑: "목", 을: "목",
    병: "화", 정: "화",
    무: "토", 기: "토",
    경: "금", 신: "금",
    임: "수", 계: "수",
  };
  
  export function getDayStrengthAnalysis(
    dayStem: string,
    monthGanZhi: string,
    wood: number,
    fire: number,
    earth: number,
    metal: number,
    water: number
  ): {
    strengthType: string;
    score: number;
    reason: string;
    advice: string;
  } {
    const dayElement = stemElementMap[dayStem];
  
    const elementCounts: Record<string, number> = {
      목: wood,
      화: fire,
      토: earth,
      금: metal,
      수: water,
    };
  
    const supportingElementMap: Record<string, string[]> = {
      목: ["목", "수"],
      화: ["화", "목"],
      토: ["토", "화"],
      금: ["금", "토"],
      수: ["수", "금"],
    };
  
    const drainingElementMap: Record<string, string[]> = {
      목: ["화", "금", "토"],
      화: ["토", "수", "금"],
      토: ["금", "목", "수"],
      금: ["수", "화", "목"],
      수: ["목", "토", "화"],
    };
  
    const supportScore =
      supportingElementMap[dayElement]?.reduce(
        (sum, el) => sum + (elementCounts[el] || 0),
        0
      ) || 0;
  
    const drainScore =
      drainingElementMap[dayElement]?.reduce(
        (sum, el) => sum + (elementCounts[el] || 0),
        0
      ) || 0;
  
    const monthText = String(monthGanZhi);
    let monthSupportBonus = 0;
  
    if (
      (dayElement === "목" && ["인", "묘"].some((v) => monthText.includes(v))) ||
      (dayElement === "화" && ["사", "오"].some((v) => monthText.includes(v))) ||
      (dayElement === "토" && ["진", "술", "축", "미"].some((v) => monthText.includes(v))) ||
      (dayElement === "금" && ["신", "유"].some((v) => monthText.includes(v))) ||
      (dayElement === "수" && ["해", "자"].some((v) => monthText.includes(v)))
    ) {
      monthSupportBonus = 3;
    }
  
    const score = supportScore * 2 + monthSupportBonus - drainScore;
  
    let strengthType = "중화";
    if (score >= 5) strengthType = "신강";
    if (score <= 0) strengthType = "신약";
  
    const reason =
      strengthType === "신강"
        ? `일간 ${dayStem}의 기운을 도와주는 오행이 비교적 강하고, 월지의 도움도 있어 자기 기운이 강한 편입니다.`
        : strengthType === "신약"
        ? `일간 ${dayStem}의 기운을 도와주는 오행보다 소모하거나 제어하는 오행이 강해 자기 기운이 약한 편입니다.`
        : `일간 ${dayStem}의 기운이 지나치게 강하지도 약하지도 않아 비교적 균형을 이루는 편입니다.`;
  
    const advice =
      strengthType === "신강"
        ? "신강한 사주는 추진력과 자기주장이 강하므로 재성·관성처럼 현실성과 책임을 잡아주는 기운을 잘 활용하는 것이 좋습니다."
        : strengthType === "신약"
        ? "신약한 사주는 무리한 확장보다 인성·비겁처럼 나를 도와주는 기반, 사람, 공부, 자격, 안정적인 환경을 먼저 갖추는 것이 좋습니다."
        : "중화에 가까운 사주는 한쪽으로 치우치기보다 상황에 따라 유연하게 선택하는 것이 좋습니다.";
  
    return {
      strengthType,
      score,
      reason,
      advice,
    };
  }