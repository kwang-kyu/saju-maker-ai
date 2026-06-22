import { Solar } from "lunar-javascript";
import {
  getElementFromGanZhi,
  getElementGuide,
} from "../data/fiveElementService";

export function getSajuTodayLuckInfo(safeCall: any) {
  const todaySolar = Solar.fromDate(new Date());
  const todayLunar: any = todaySolar.getLunar();

  const todayGanZhi = safeCall(todayLunar, "getDayInGanZhi");
  const currentYearGanji = safeCall(todayLunar, "getYearInGanZhi");

  const todayElement = getElementFromGanZhi(todayGanZhi);
  const todayGuide = getElementGuide(todayElement);

  return {
    todayGanZhi,
    currentYearGanji,
    todayElement,
    todayGuide,
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