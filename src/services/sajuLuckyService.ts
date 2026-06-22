type SajuLuckyInput = {
    year: number;
    birthMonth: string;
    birthDay: string;
  };
  
  export function getSajuLuckyInfo({
    year,
    birthMonth,
    birthDay,
  }: SajuLuckyInput) {
    const luckyNumber =
      ((year + Number(birthMonth) + Number(birthDay)) % 9) + 1;
  
    const luckyColors = ["보라색", "금색", "파란색", "초록색", "분홍색", "흰색"];
    const luckyColor = luckyColors[year % luckyColors.length];
  
    return {
      luckyNumber,
      luckyColor,
    };
  }