type SajuInfoReportInput = {
    [key: string]: any;
  };
  
  export function getSajuInfoReportText(input: SajuInfoReportInput) {
    const v = input;
  
    return `
  ${v.summaryInsightText}
  ${v.lifeStoryText}
  
  [기본 정보]
  이름: ${v.name}
  성별: ${v.gender === "male" ? "남성" : "여성"}
  양력 생년월일: ${v.solarDate}
  음력 생년월일: ${v.lunarDate}
  태어난 시간: ${v.birthTime}
  
  [사주팔자]
  년주: ${v.yearGanZhi}
  월주: ${v.monthGanZhi}
  일주: ${v.dayGanZhi}
  시주: ${v.timeGanZhi}
  
  [오행]
  목: ${v.wood}
  화: ${v.fire}
  토: ${v.earth}
  금: ${v.metal}
  수: ${v.water}
  
  부족한 오행: ${v.weakestName}
  강한 오행: ${v.strongestName}
  
  ==================================================
  [ 십성 종합 분석 ]
  ==================================================
  종합 십성 점수: ${v.totalTenGodScore}점
  사주 등급: ${v.sajuGrade}
  종합 별점: ${v.sajuGradeStars}
  
  재물운 점수: ${v.tenGodMoneyScore}점 ${v.tenGodMoneyStars}
  재물운 해석: ${v.tenGodMoneyComment}
  
  ${v.moneyFiveSetText}
  
  ${v.realEstateDetailText}
  
  직업운 점수: ${v.tenGodJobScore}점 ${v.tenGodJobStars}
  직업운 해석: ${v.tenGodJobComment}
  
  연애운 점수: ${v.tenGodLoveScore}점 ${v.tenGodLoveStars}
  연애운 해석: ${v.tenGodLoveComment}
  
  ${v.spouseDetailText}
  
  구분 | 십성 | 점수 | 별점 | 해석
  년간 | ${v.yearTenGod} | ${v.yearTenGodScore}점 | ${v.yearTenGodStars} | ${v.yearTenGodText}
  월간 | ${v.monthTenGod} | ${v.monthTenGodScore}점 | ${v.monthTenGodStars} | ${v.monthTenGodText}
  시간 | ${v.timeTenGod} | ${v.timeTenGodScore}점 | ${v.timeTenGodStars} | 자녀운·말년운·표현력 참고
  
  ══════════════════════════════
  ${v.tenGodPositionReportText}
  
  [격국]
  격국: ${v.gyeokguk}
  격국 해석:
  ${v.geokgukAdvancedAnalysisText}
  
  [격국 × 신강신약 × 용신 교차 해석]
  ${v.gyeokgukYongsinCrossText}
  
  [용신]
  용신: ${v.yongsin}
  희신: ${v.heesin}
  기신: ${v.gisin}
  용신 해석: ${v.yongsinDescription}
  
  [일간 + 십성 조합]
  ${v.dayTenGodComboText}
  
  [십성 조합 인생 패턴]
  ${v.dayTenGodComboText}
  
  [직업과 사업]
  직업 적성: ${v.careerRecommendText}
  추천 사업: ${v.businessRecommendText}
  
  [세운]
  ${v.seunText}
  
  [대운]
  ${v.daeunText}
  `;
  }