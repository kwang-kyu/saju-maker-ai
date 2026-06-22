export const getLuckScore = (
    tenGod: string,
    type: "money" | "job" | "love"
  ) => {
    const scoreMap: Record<string, { money: number; job: number; love: number }> = {
      정재: { money: 90, job: 86, love: 82 },
      편재: { money: 92, job: 84, love: 80 },
      정관: { money: 82, job: 90, love: 86 },
      편관: { money: 78, job: 88, love: 76 },
      정인: { money: 80, job: 86, love: 84 },
      편인: { money: 76, job: 82, love: 78 },
      식신: { money: 88, job: 84, love: 86 },
      상관: { money: 80, job: 78, love: 82 },
      비견: { money: 76, job: 80, love: 78 },
      겁재: { money: 72, job: 76, love: 74 },
    };
  
    return scoreMap[tenGod]?.[type] || 75;
  };
  
  export const getScoreComment = (score: number) => {
    if (score >= 90) return "매우 강한 운입니다. 적극적으로 기회를 잡아도 좋은 흐름입니다.";
    if (score >= 85) return "좋은 흐름입니다. 꾸준히 추진하면 성과를 기대할 수 있습니다.";
    if (score >= 80) return "안정적인 운입니다. 무리하지 않으면 좋은 결과가 따릅니다.";
    if (score >= 75) return "보통 이상입니다. 준비와 관리가 함께 필요합니다.";
    if (score >= 70) return "조심스럽게 접근해야 합니다. 욕심보다 안정이 중요합니다.";
    return "기복이 있을 수 있습니다. 당분간은 신중한 판단이 필요합니다.";
  };
  export function getLuckScores(params: {
    baseScore: number;
    dayStem: string;
    gyeokguk: string;
    monthTenGod: string;
    strengthType: string;
    strongestName: string;
    weakestName: string;
  }) {
    const {
      baseScore,
      dayStem,
      gyeokguk,
      monthTenGod,
      strengthType,
      strongestName,
      weakestName,
    } = params;
  
    let moneyScore = 70 + baseScore;
    let loveScore = 72 + (baseScore % 8);
    let healthScore = 68 + (baseScore % 9);
    let jobScore = 75 + (baseScore % 7);
  
    if (gyeokguk.includes("정재") || gyeokguk.includes("편재")) moneyScore += 8;
    if (gyeokguk.includes("식신") || gyeokguk.includes("상관")) moneyScore += 5;
    if (gyeokguk.includes("정관") || gyeokguk.includes("편관")) jobScore += 8;
    if (gyeokguk.includes("정인") || gyeokguk.includes("편인")) jobScore += 5;
    if (gyeokguk.includes("비견") || gyeokguk.includes("겁재")) jobScore += 4;
  
    if (monthTenGod === "정재" || monthTenGod === "편재") moneyScore += 5;
    if (monthTenGod === "정관" || monthTenGod === "편관") jobScore += 5;
    if (monthTenGod === "식신" || monthTenGod === "상관") loveScore += 3;
    if (monthTenGod === "정인" || monthTenGod === "편인") healthScore += 3;
  
    if (strengthType.includes("신강")) {
      moneyScore += 3;
      jobScore += 3;
      healthScore -= 2;
    }
  
    if (strengthType.includes("신약")) {
      healthScore -= 3;
      loveScore += 2;
    }
  
    if (strongestName.includes("토")) {
      moneyScore += 4;
    }
  
    if (strongestName.includes("금")) {
      jobScore += 4;
    }
  
    if (strongestName.includes("화")) {
      loveScore += 3;
    }
  
    if (weakestName.includes("수")) {
      healthScore -= 3;
    }
  
    if (weakestName.includes("목")) {
      moneyScore -= 2;
    }
  
    const dayStemBonus: Record<string, Partial<{
      moneyScore: number;
      loveScore: number;
      healthScore: number;
      jobScore: number;
    }>> = {
      갑: { moneyScore: 3, jobScore: 2 },
      을: { loveScore: 3, moneyScore: 2 },
      병: { loveScore: 4, jobScore: 2 },
      정: { healthScore: 2, loveScore: 2 },
      무: { moneyScore: 4, healthScore: 2 },
      기: { moneyScore: 3, healthScore: 3 },
      경: { jobScore: 4, moneyScore: 2 },
      신: { jobScore: 3, healthScore: 2 },
      임: { moneyScore: 2, loveScore: 2 },
      계: { healthScore: 3, loveScore: 2 },
    };
  
    const bonus = dayStemBonus[dayStem] || {};
  
    moneyScore += bonus.moneyScore || 0;
    loveScore += bonus.loveScore || 0;
    healthScore += bonus.healthScore || 0;
    jobScore += bonus.jobScore || 0;
  
    const clamp = (score: number) => Math.max(60, Math.min(100, Math.round(score)));
  
    return {
      moneyScore: clamp(moneyScore),
      loveScore: clamp(loveScore),
      healthScore: clamp(healthScore),
      jobScore: clamp(jobScore),
    };
  }
  export function getTodayLuckSummary(params: {
    moneyScore: number;
    loveScore: number;
    healthScore: number;
    jobScore: number;
    luckyNumber: number;
    luckyColor: string;
    todayGanZhi: string;
    todayElement: string;
    todayGuide: {
      color: string;
      direction: string;
      action: string;
      caution: string;
    };
  }) {
    const {
      moneyScore,
      loveScore,
      healthScore,
      jobScore,
      luckyNumber,
      luckyColor,
      todayGanZhi,
      todayElement,
      todayGuide,
    } = params;
  
    return `
  📊 오늘의 일진 점수
  재물운: ${moneyScore}점
  연애운: ${loveScore}점
  건강운: ${healthScore}점
  직업운: ${jobScore}점
  
  🍀 행운 정보
  행운의 숫자: ${luckyNumber}
  행운의 색상: ${todayGuide.color}
  
  🌞 오늘의 일진 분석
  오늘의 일진: ${todayGanZhi}
  오늘의 오행: ${todayElement}
  
  🎨 오늘 나에게 맞는 색상
  ${todayGuide.color}
  
  🧭 오늘 좋은 방향
  ${todayGuide.direction}
  
  ✅ 오늘 추천 행동
  ${todayGuide.action}
  
  ⚠️ 오늘 주의할 점
  ${todayGuide.caution}
  
  행운의 숫자: ${luckyNumber}
  행운의 색상: ${luckyColor}
  `;
  }

  export function getFortuneScoreSectionText(params: {
    moneyScore: number;
    jobScore: number;
    loveScore: number;
    healthScore: number;
    moneyText: string;
    jobText: string;
    loveText: string;
    healthText: string;
    getStarRating: (score: number) => string;
  }): string {
    const {
      moneyScore,
      jobScore,
      loveScore,
      healthScore,
      moneyText,
      jobText,
      loveText,
      healthText,
      getStarRating,
    } = params;
  
    return `
  📊 분야별 운세 점수 요약
  
  💰 재물운
  ${moneyScore}점 ${getStarRating(moneyScore)}
  ${moneyText}
  
  💼 직업운
  ${jobScore}점 ${getStarRating(jobScore)}
  ${jobText}
  
  ❤ 연애운
  ${loveScore}점 ${getStarRating(loveScore)}
  ${loveText}
  
  🩺 건강운
  ${healthScore}점 ${getStarRating(healthScore)}
  ${healthText}
  
  위 점수는 단순한 운세 점수가 아니라,
  일간, 격국, 신강신약, 오행의 강약, 십성 흐름을 함께 반영한 종합 흐름입니다.
  `;
  }

  export function getTodayLuckReportSectionText(params: {
    fortuneScoreSectionText: string;
    todayLuckSummaryText: string;
  }): string {
    const { fortuneScoreSectionText, todayLuckSummaryText } = params;
  
    return `
  ${fortuneScoreSectionText}
  
  ${todayLuckSummaryText}
  `;
  }
  