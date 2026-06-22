type TimingReportInput = {
    timingEventText: string;
    moneyTimingText: string;
    jobTimingText: string;
    loveTimingText: string;
    healthTimingText: string;
    premiumActionTimingText: string;
  };
  
  export function getTimingReportText({
    timingEventText,
    moneyTimingText,
    jobTimingText,
    loveTimingText,
    healthTimingText,
    premiumActionTimingText,
  }: TimingReportInput): string {
    return `
  ${timingEventText}
  
  ${moneyTimingText}
  
  ${jobTimingText}
  
  ${loveTimingText}
  
  ${healthTimingText}
  
  ${premiumActionTimingText}
  `;
  }
  
  type CategoryTimingTextsInput = {
    getCategoryTimingEventText: (input: {
      category: "재물" | "직업" | "연애" | "건강";
      tenGod: string;
      yongsin: string;
      gisin: string;
      strengthType: string;
    }) => string;
    tenGod: string;
    yongsin: string;
    gisin: string;
    strengthType: string;
  };
  
  export function getCategoryTimingTexts({
    getCategoryTimingEventText,
    tenGod,
    yongsin,
    gisin,
    strengthType,
  }: CategoryTimingTextsInput) {
    return {
      moneyTimingText: getCategoryTimingEventText({
        category: "재물",
        tenGod,
        yongsin,
        gisin,
        strengthType,
      }),
  
      jobTimingText: getCategoryTimingEventText({
        category: "직업",
        tenGod,
        yongsin,
        gisin,
        strengthType,
      }),
  
      loveTimingText: getCategoryTimingEventText({
        category: "연애",
        tenGod,
        yongsin,
        gisin,
        strengthType,
      }),
  
      healthTimingText: getCategoryTimingEventText({
        category: "건강",
        tenGod,
        yongsin,
        gisin,
        strengthType,
      }),
    };
  }