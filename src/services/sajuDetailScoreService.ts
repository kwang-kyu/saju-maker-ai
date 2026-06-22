type MoneyDetailScoresInput = {
    tenGodMoneyScore: number;
  };
  
  type SpouseDetailScoresInput = {
    tenGodLoveScore: number;
    tenGodJobScore: number;
  };
  
  type HealthDetailScoresInput = {
    baseScore: number;
  };
  
  export function getMoneyDetailScores({
    tenGodMoneyScore,
  }: MoneyDetailScoresInput) {
    return {
      earningScore: Math.min(100, tenGodMoneyScore + 3),
      savingScore: Math.max(60, tenGodMoneyScore - 5),
      investmentScore: Math.max(60, tenGodMoneyScore - 8),
      realEstateScore: Math.min(100, tenGodMoneyScore + 5),
      businessScore: Math.min(100, tenGodMoneyScore + 2),
    };
  }
  
  export function getSpouseDetailScores({
    tenGodLoveScore,
    tenGodJobScore,
  }: SpouseDetailScoresInput) {
    return {
      spouseScore: Math.min(100, tenGodLoveScore + 2),
      meetingScore: Math.max(60, tenGodLoveScore - 3),
      marriageScore: Math.min(100, tenGodLoveScore + 1),
      spouseJobScore: Math.max(60, tenGodJobScore - 2),
      relationshipCautionScore: Math.max(
        60,
        100 - Math.abs(tenGodLoveScore - 80)
      ),
    };
  }
  
  export function getHealthDetailScores({
    baseScore,
  }: HealthDetailScoresInput) {
    return {
      healthBaseScore: Math.max(60, 68 + (baseScore % 9)),
      middleAgeHealthScore: Math.max(60, 66 + (baseScore % 9)),
      oldAgeHealthScore: Math.max(60, 64 + (baseScore % 9)),
      weakOrganScore: Math.max(60, 62 + (baseScore % 9)),
      lifestyleScore: Math.min(100, 73 + (baseScore % 9)),
    };
  }

  type SajuDetailScoreBundleInput = {
    tenGodMoneyScore: number;
    tenGodLoveScore: number;
    tenGodJobScore: number;
    baseScore: number;
  };
  
  export function getSajuDetailScoreBundle({
    tenGodMoneyScore,
    tenGodLoveScore,
    tenGodJobScore,
    baseScore,
  }: SajuDetailScoreBundleInput) {
    const moneyDetailScores = getMoneyDetailScores({
      tenGodMoneyScore,
    });
  
    const spouseDetailScores = getSpouseDetailScores({
      tenGodLoveScore,
      tenGodJobScore,
    });
  
    const healthDetailScores = getHealthDetailScores({
      baseScore,
    });
  
    return {
      ...moneyDetailScores,
      ...spouseDetailScores,
      ...healthDetailScores,
    };
  }