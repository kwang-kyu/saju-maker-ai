export type SajuEngineInput = {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  calendarType?: string;
};

export type SajuEngineResult = {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  calendarType: string;
  solarDate: string;
  lunarDate: string;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  timeGanZhi: string;
  yearTenGod: string;
  monthTenGod: string;
  timeTenGod: string;
dayMaster: string;
  strongestElement: string;
  weakestElement: string;
};
