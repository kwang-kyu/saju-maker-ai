type PremiumSummaryInput = {
    strongestName: string;
    weakestName: string;
    strengthType: string;
    gyeokguk: string;
  };
  
  export function getPremiumSummaryText({
    strongestName,
    weakestName,
    strengthType,
    gyeokguk,
  }: PremiumSummaryInput): string {
    return `
  ■ 핵심 에너지 요약
  
  가장 강한 기운은 ${strongestName},
  가장 부족한 기운은 ${weakestName}입니다.
  
  현재 사주는 ${strengthType} 구조이며,
  ${gyeokguk}의 특성이 인생 전반에 크게 작용합니다.
  
  강한 ${strongestName} 기운은 추진력과 장점을 의미하고,
  부족한 ${weakestName} 기운은 의식적으로 보완해야 할 과제입니다.
  `;
  }