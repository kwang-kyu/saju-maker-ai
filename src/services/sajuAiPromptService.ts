import {
    getAiConsultingGuideText,
    getAiPromptCoreText,
    getAiPersonalInfoPromptText,
    getAiConsultingStructureText,
    getAiFullSajuInfoPromptText,
  } from "../data/aiPromptData";
  
  type SajuAiPromptInput = {
    name: string;
    dayStem: string;
    gyeokguk: string;
    monthTenGod: string;
    yearTenGod: string;
    timeTenGod: string;
  
    monthTenGodJob?: string;
    yearTenGodJob?: string;
    timeTenGodJob?: string;
  
    tenGodBalanceText: string;
    strengthType: string;
    strongestName: string;
    weakestName: string;
  
    yongsin: string;
    heesin: string;
    gisin: string;
  
    sajuGrade: string;
    sajuGradeComment: string;
    totalTenGodScore: number;
  
    moneyScore: number;
    jobScore: number;
    loveScore: number;
    healthScore: number;
  
    hapChungRelationText: string;
    sinsalText: string;
  
    sajuInfo: string;
    scoreComment: any;
  };
  
  export function getSajuAiPromptText(input: SajuAiPromptInput): string {
    return `
  ${getAiConsultingGuideText(
    input.yongsin,
    input.heesin,
    input.gisin,
    input.tenGodBalanceText,
    input.sajuGradeComment,
    input.hapChungRelationText,
    input.sinsalText
  )}
  
  ${getAiPromptCoreText(
    input.name,
    input.dayStem,
    input.gyeokguk,
    input.monthTenGod,
    input.strengthType,
    input.strongestName,
    input.weakestName,
    input.yongsin,
    input.heesin,
    input.gisin
  )}
  
  ${getAiPersonalInfoPromptText({
    name: input.name,
    dayStem: input.dayStem,
    gyeokguk: input.gyeokguk,
    monthTenGod: input.monthTenGod,
    yearTenGod: input.yearTenGod,
    timeTenGod: input.timeTenGod,
    monthTenGodJob: input.monthTenGodJob,
    yearTenGodJob: input.yearTenGodJob,
    timeTenGodJob: input.timeTenGodJob,
    tenGodBalanceText: input.tenGodBalanceText,
    strengthType: input.strengthType,
    strongestName: input.strongestName,
    weakestName: input.weakestName,
    yongsin: input.yongsin,
    heesin: input.heesin,
    gisin: input.gisin,
    sajuGrade: input.sajuGrade,
    totalTenGodScore: input.totalTenGodScore,
    moneyScore: input.moneyScore,
    jobScore: input.jobScore,
    loveScore: input.loveScore,
    healthScore: input.healthScore,
    scoreComment: input.scoreComment,
  })}
  
  ${getAiConsultingStructureText({
    name: input.name,
    dayStem: input.dayStem,
    gyeokguk: input.gyeokguk,
    strengthType: input.strengthType,
    strongestName: input.strongestName,
    weakestName: input.weakestName,
    yongsin: input.yongsin,
    heesin: input.heesin,
    gisin: input.gisin,
    moneyScore: input.moneyScore,
    jobScore: input.jobScore,
    loveScore: input.loveScore,
    healthScore: input.healthScore,
  })}
  
  ${getAiFullSajuInfoPromptText(input.sajuInfo)}
  `;
  }