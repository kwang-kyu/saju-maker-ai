export function getTimeTenGodText(timeTenGod: string): string {
    if (timeTenGod === "시간 미입력") {
      return "태어난 시간이 입력되지 않아 시간 십성 해석은 생략됩니다.";
    }
  
    return `시간의 ${timeTenGod}은 노년운·자녀운·미래 성향을 봅니다. 나이가 들수록 드러나는 방향, 후반 인생의 관심사, 자녀나 결과물과의 관계를 참고하는 자리입니다.`;
  }
  export function getTenGodReportSectionText(params: {
    yearTenGod: string;
    monthTenGod: string;
    timeTenGod: string;
    yearTenGodScore: number;
    monthTenGodScore: number;
    timeTenGodScore: number;
    yearTenGodStars: string;
    monthTenGodStars: string;
    timeTenGodStars: string;
  }): string {
    const {
      yearTenGod,
      monthTenGod,
      timeTenGod,
      yearTenGodScore,
      monthTenGodScore,
      timeTenGodScore,
      yearTenGodStars,
      monthTenGodStars,
      timeTenGodStars,
    } = params;
  
    return `
  ⭐ 십성 분석
  
  ■ 년주 십성
  ${yearTenGod}
  점수 : ${yearTenGodScore}점
  등급 : ${yearTenGodStars}
  
  ■ 월주 십성
  ${monthTenGod}
  점수 : ${monthTenGodScore}점
  등급 : ${monthTenGodStars}
  
  ■ 시주 십성
  ${timeTenGod}
  점수 : ${timeTenGodScore}점
  등급 : ${timeTenGodStars}
  
  십성은 성격 하나만 보는 것이 아니라
  인간관계, 직업 방식, 재물 흐름, 의사결정 패턴,
  인생 후반의 관심사까지 함께 읽는 핵심 구조입니다.
  `;
  }