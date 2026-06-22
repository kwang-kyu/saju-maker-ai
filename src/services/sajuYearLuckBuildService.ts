type YearLuckBuildInput = {
    yearLuckText: string;
    daeunText: string;
    fiveYearSeunText: string;
    monthlyLuckText: string;
  };
  
  export function getYearLuckBuildReportText({
    yearLuckText,
    daeunText,
    fiveYearSeunText,
    monthlyLuckText,
  }: YearLuckBuildInput): string {
    return `
  ${yearLuckText}
  
  ${daeunText}
  
  ${fiveYearSeunText}
  
  ${monthlyLuckText}
  `;
  }
  
  type LifeAreaConsultingInput = {
    moneyEventText: string;
    jobEventText: string;
    loveEventText: string;
    healthEventText: string;
    moneyGuideText: string;
    jobGuideText: string;
    loveGuideText: string;
    healthGuideText: string;
    getConsultingWrapText: (input: {
      category: string;
      eventText: string;
      guideText: string;
    }) => string;
  };
  
  export function getLifeAreaConsultingTexts({
    moneyEventText,
    jobEventText,
    loveEventText,
    healthEventText,
    moneyGuideText,
    jobGuideText,
    loveGuideText,
    healthGuideText,
    getConsultingWrapText,
  }: LifeAreaConsultingInput) {
    return {
      moneyConsultingText: getConsultingWrapText({
        category: "재물",
        eventText: moneyEventText,
        guideText: moneyGuideText,
      }),
  
      jobConsultingText: getConsultingWrapText({
        category: "직업",
        eventText: jobEventText,
        guideText: jobGuideText,
      }),
  
      loveConsultingText: getConsultingWrapText({
        category: "연애",
        eventText: loveEventText,
        guideText: loveGuideText,
      }),
  
      healthConsultingText: getConsultingWrapText({
        category: "건강",
        eventText: healthEventText,
        guideText: healthGuideText,
      }),
    };
  }
  
  type LifeAreaGuideInput = {
    currentYearTenGod: string;
    yongsin: string;
    gisin: string;
    getActionGuideText: any;
  };
  
  export function getLifeAreaGuideTexts({
    currentYearTenGod,
    yongsin,
    gisin,
    getActionGuideText,
  }: LifeAreaGuideInput) {
    return {
      moneyGuideText: getActionGuideText({
        category: "재물",
        tenGod: currentYearTenGod,
        yongsin,
        gisin,
      }),
  
      jobGuideText: getActionGuideText({
        category: "직업",
        tenGod: currentYearTenGod,
        yongsin,
        gisin,
      }),
  
      loveGuideText: getActionGuideText({
        category: "연애",
        tenGod: currentYearTenGod,
        yongsin,
        gisin,
      }),
  
      healthGuideText: getActionGuideText({
        category: "건강",
        tenGod: currentYearTenGod,
        yongsin,
        gisin,
      }),
    };
  }

  type LifeAreaEventTextsInput = {
    getLifeAreaEventText: (input: {
      category: string;
      tenGod: string;
      yongsin: string;
      gisin: string;
    }) => string;
    tenGod: string;
    yongsin: string;
    gisin: string;
  };
  
  export function getLifeAreaEventTexts({
    getLifeAreaEventText,
    tenGod,
    yongsin,
    gisin,
  }: LifeAreaEventTextsInput) {
    return {
      moneyEventText: getLifeAreaEventText({
        category: "재물",
        tenGod,
        yongsin,
        gisin,
      }),
      jobEventText: getLifeAreaEventText({
        category: "직업",
        tenGod,
        yongsin,
        gisin,
      }),
      loveEventText: getLifeAreaEventText({
        category: "연애",
        tenGod,
        yongsin,
        gisin,
      }),
      healthEventText: getLifeAreaEventText({
        category: "건강",
        tenGod,
        yongsin,
        gisin,
      }),
    };
  }