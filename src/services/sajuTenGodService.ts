import { getTenGodByStem } from "../data/tenGodService";

export function getSajuTenGod(
  dayStem: string,
  targetStem: string
) {
  return getTenGodByStem(dayStem, targetStem);
}
type TenGodDetailsInput = {
    yearTenGod: string;
    monthTenGod: string;
    timeTenGod: string;
    tenGodCounts: Record<string, number>;
    dayStem: string;
    gyeokguk: string;
    dayStrengthAnalysis: any;
    strongest: { name: string };
    weakest: { name: string };
    personalizeTenGodDetail: any;
  };
  
  export function getTenGodDetails({
    yearTenGod,
    monthTenGod,
    timeTenGod,
    tenGodCounts,
    dayStem,
    gyeokguk,
    dayStrengthAnalysis,
    strongest,
    weakest,
    personalizeTenGodDetail,
  }: TenGodDetailsInput) {
    return {
      yearTenGodDetail: personalizeTenGodDetail(
        yearTenGod,
        tenGodCounts,
        dayStem,
        gyeokguk,
        dayStrengthAnalysis,
        strongest,
        weakest
      ),
  
      monthTenGodDetail: personalizeTenGodDetail(
        monthTenGod,
        tenGodCounts,
        dayStem,
        gyeokguk,
        dayStrengthAnalysis,
        strongest,
        weakest
      ),
  
      timeTenGodDetail: personalizeTenGodDetail(
        timeTenGod,
        tenGodCounts,
        dayStem,
        gyeokguk,
        dayStrengthAnalysis,
        strongest,
        weakest
      ),
    };
  }

  export function getCurrentYearLuckInfo(dayTenGod?: string) {
    return {
      yearGanji: "병오(丙午)",
      yearElement: "화(火)",
      tenGodRelation: dayTenGod || "비견",
      summary:
        "2026년 병오년은 화(火)의 기운이 강하게 작용하는 해로, 자기표현·확장·경쟁·활동성이 두드러지는 시기입니다.",
    };
  }