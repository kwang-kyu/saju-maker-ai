export type BasicSajuInput = {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
};

export type BasicSajuResult = {
  name: string;
  title: string;
  summary: string;
  strengths: string[];
  cautions: string[];
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  yearTenGod: string;
  monthTenGod: string;
  timeTenGod: string;
  dayMaster: string;
  strongestElement: string;
  weakestElement: string;
};
