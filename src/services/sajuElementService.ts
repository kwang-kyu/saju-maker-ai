import {
    countFiveElementsFromPillars,
    getStrongWeakElements,
  } from "../data/fiveElementService";
  
  type SajuElementParams = {
    yearGanZhi: string;
    monthGanZhi: string;
    dayGanZhi: string;
    timeGanZhi: string;
  };
  
  export function getSajuElementInfo({
    yearGanZhi,
    monthGanZhi,
    dayGanZhi,
    timeGanZhi,
  }: SajuElementParams) {
    const allPillars =
      yearGanZhi +
      monthGanZhi +
      dayGanZhi +
      timeGanZhi;
  
    const { wood, fire, earth, metal, water } =
      countFiveElementsFromPillars(allPillars);
  
    const { weakest, strongest } =
      getStrongWeakElements({
        wood,
        fire,
        earth,
        metal,
        water,
      });
  
    return {
      allPillars,
      wood,
      fire,
      earth,
      metal,
      water,
      weakest,
      strongest,
    };
  }