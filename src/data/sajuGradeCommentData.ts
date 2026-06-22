export function getSajuGradeComment(
    sajuGrade: string,
    dayStem: string,
    gyeokguk: string,
    monthTenGod: string,
    strongestName: string,
    weakestName: string,
    dayStrengthType: string,
    tenGodBalanceText: string
  ) {
    const strengthText =
      `${dayStem} 일간을 중심으로 ${gyeokguk}과 ${monthTenGod}이 함께 작용하는 구조`;
  
    const balanceText =
      strongestName === weakestName
        ? "오행 균형이 비교적 안정적인 편"
        : `${strongestName} 기운이 강하고 ${weakestName} 기운이 부족한 구조`;
  
    const personalGradeCoreText =
      `${dayStem} 일간, ${gyeokguk}, ${monthTenGod} 십성, ${dayStrengthType} 흐름이 함께 작용하는 구조입니다. 부족한 ${weakestName} 기운은 생활 습관과 직업 선택에서 보완해야 합니다.`;
  
    const gyeokText =
      `${gyeokguk}의 특성이 삶의 방향성을 결정하는 핵심 축으로 작용합니다.`;
  
    const tenGodText = tenGodBalanceText;
  
    if (sajuGrade === "S+" || sajuGrade === "S") {
      return `
  상위권 사주 구조입니다.
  
  ${gyeokText}
  ${personalGradeCoreText}
  ${tenGodText}
  
  ${strengthText}이며,
  ${balanceText}입니다.
  `;
    }
  
    return `
  ${gyeokText}
  ${personalGradeCoreText}
  ${tenGodText}
  
  ${strengthText}이며,
  ${balanceText}입니다.
  `;
  }