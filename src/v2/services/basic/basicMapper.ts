import type { BasicSajuInput, BasicSajuResult } from "../../types/basic";
import { calculateSaju } from "../../engine/sajuEngine";
import {
  translateDayMaster,
  translateElement,
} from "./basicTranslator";

export function basicMapper(input: BasicSajuInput): BasicSajuResult {
  const saju = calculateSaju(input);
  const dayGuide = translateDayMaster(saju.dayMaster);
  const strongGuide = translateElement(saju.strongestElement);
  const weakGuide = translateElement(saju.weakestElement);

  return {
    name: saju.name,
    yearGanZhi: saju.yearGanZhi,
    monthGanZhi: saju.monthGanZhi,
    dayGanZhi: saju.dayGanZhi,
    dayMaster: saju.dayMaster,
    strongestElement: saju.strongestElement,
    weakestElement: saju.weakestElement,
    title: saju.name + "님의 기본 상담",

    summary:
      saju.name +
      "님은 " +
      dayGuide.title +
      "입니다. " +
      dayGuide.description,

    strengths: [
      strongGuide.title,
      strongGuide.description,
      "이 장점은 일, 돈, 관계에서 앞으로 나아가게 하는 중요한 힘이 됩니다.",
    ],

    cautions: [
      weakGuide.title,
      weakGuide.description,
      "이 부분은 약점이라기보다 생활에서 조금씩 다듬어야 할 균형 포인트입니다.",
    ],
  };
}
