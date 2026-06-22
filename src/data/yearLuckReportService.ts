export function getYearLuckReportSectionText(params: {
    yearLuckText: string;
    daeunText: string;
    fiveYearSeunText: string;
    monthlyLuckText: string;
  }): string {
    const {
      yearLuckText,
      daeunText,
      fiveYearSeunText,
      monthlyLuckText,
    } = params;
  
    return `
  🗓 세운·대운 종합 분석
  
  ■ 올해 세운
  ${yearLuckText}
  
  ■ 대운 흐름
  ${daeunText}
  
  ■ 향후 5년 세운 전망
  ${fiveYearSeunText}
  
  ■ 월별 운세
  ${monthlyLuckText}
  
  세운은 1년 단위의 사건성과 선택의 흐름을 보고,
  대운은 10년 단위의 인생 방향과 환경 변화를 봅니다.
  
  따라서 올해의 운은 단독으로 판단하지 않고,
  현재 대운의 큰 흐름 속에서 재물, 직업, 관계, 건강이 어떻게 움직이는지를 함께 보아야 합니다.
  `;
  }