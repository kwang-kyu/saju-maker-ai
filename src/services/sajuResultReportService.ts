type SajuResultReportInput = {
    basicSajuReportHeaderText: string;
lifePatternSectionText: string;
premiumSummaryText: string;
fiveElementReportSectionText: string;
    sinsalReportSectionText: string;
    hapChungPersonalText: string;
    luckyColorByYongsin: string;
    luckyDirectionByYongsin: string;
    luckyEnvironmentByYongsin: string;
    weakElementGuide: string;
    dayMasterReportSectionText: string;
    tenGodReportSectionText: string;
  };
  
  export function getSajuResultReportText({
    basicSajuReportHeaderText,
    lifePatternSectionText,
    premiumSummaryText,
    fiveElementReportSectionText,
    sinsalReportSectionText,
    hapChungPersonalText,
    luckyColorByYongsin,
    luckyDirectionByYongsin,
    luckyEnvironmentByYongsin,
    weakElementGuide,
    dayMasterReportSectionText,
    tenGodReportSectionText,
  }: SajuResultReportInput): string {
    return `
  ${basicSajuReportHeaderText}
  
  ${lifePatternSectionText}

  ${premiumSummaryText}

  ━━━━━━━━━━━━━━
  
  ${fiveElementReportSectionText}
  
  ${sinsalReportSectionText}
  
  ⚡ 합충형파해 분석
  
  ${hapChungPersonalText}
  
  🌈 행운 색상
  ${luckyColorByYongsin}
  
  🧭 행운 방향
  ${luckyDirectionByYongsin}
  
  🏠 추천 환경
  ${luckyEnvironmentByYongsin}
  
  🔧 부족한 오행 보완법
  ${weakElementGuide}
  
  ${dayMasterReportSectionText}
  
  ────────────
  
  ${tenGodReportSectionText}
  
  ━━━━━━━━━━━━━━
  `;
  }

  type LifeAreaPersonalTextsInput = {
    name: string;
    dayStem: string;
    gyeokguk: string;
    monthTenGod: string;
    timeTenGod: string;
    strengthType: string;
    strongestName: string;
    weakestName: string;
    moneyScore: number;
    hasDohwa: boolean;
    hasYeokma: boolean;
    hasHwagae: boolean;
    getMoneyPersonalTypeText: any;
    getJobComboText: any;
    getLoveAnalysisText: any;
    getHealthComboText: any;
  };
  
  export function getLifeAreaPersonalTexts({
    name,
    dayStem,
    gyeokguk,
    monthTenGod,
    timeTenGod,
    strengthType,
    strongestName,
    weakestName,
    moneyScore,
    hasDohwa,
    hasYeokma,
    hasHwagae,
    getMoneyPersonalTypeText,
    getJobComboText,
    getLoveAnalysisText,
    getHealthComboText,
  }: LifeAreaPersonalTextsInput) {
    return {
      moneyPersonalTypeText: getMoneyPersonalTypeText({
        name,
        dayStem,
        gyeokguk,
        strengthType,
        strongestName,
        weakestName,
        moneyScore,
      }),
  
      jobTypeText: getJobComboText(
        dayStem,
        gyeokguk,
        strengthType,
        strongestName,
        weakestName
      ),
  
      loveAnalysisText: getLoveAnalysisText({
        name,
        dayStem,
        gyeokguk,
        monthTenGod,
        timeTenGod,
        dayStrengthType: strengthType,
        strongestName,
        weakestName,
        hasDohwa,
        hasYeokma,
        hasHwagae,
      }),
  
      healthPersonalTypeText: getHealthComboText(
        dayStem,
        gyeokguk,
        strengthType,
        strongestName,
        weakestName
      ),
    };
  }