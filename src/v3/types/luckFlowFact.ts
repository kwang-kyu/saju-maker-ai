import type {
    SajuFiveElement,
  } from "./sajuFacts";

  import type {
    V3LuckStartMethod,
  } from "./luckFlowCalculation";

  export type SajuLuckFlowTenGod =
    | "비견"
    | "겁재"
    | "식신"
    | "상관"
    | "편재"
    | "정재"
    | "편관"
    | "정관"
    | "편인"
    | "정인";

  export type SajuLuckStartFact = {
    year: number;

    month: number;

    day: number;

    hour: number;

    solarDate: string;
  };

  export type SajuCurrentDaeunFact = {
    index: number;

    ganZhi: string;

    heavenlyStem: string;

    earthlyBranch: string;

    tenGod: SajuLuckFlowTenGod;

    element: SajuFiveElement;

    startYear: number;

    endYear: number;

    startAge: number;

    endAge: number;
  };

  export type SajuCurrentSeunFact = {
    year: number;

    age: number;

    ganZhi: string;

    heavenlyStem: string;

    earthlyBranch: string;

    tenGod: SajuLuckFlowTenGod;

    element: SajuFiveElement;
  };

  export type SajuWolunSegmentFact = {
    targetYear: number;

    targetMonth: number;

    ganZhi: string;

    heavenlyStem: string;

    earthlyBranch: string;

    tenGod: SajuLuckFlowTenGod;

    element: SajuFiveElement;

    startDate: string;

    endDate: string;

    jieQiBoundary: {
      name: string;

      date: string;
    } | null;
  };

  export type SajuTargetIlunFact = {
    targetDate: string;

    ganZhi: string;

    heavenlyStem: string;

    earthlyBranch: string;

    tenGod: SajuLuckFlowTenGod;

    element: SajuFiveElement;
  };

  export type SajuYearGanZhiSegmentFact = {
    ganZhi: string;

    heavenlyStem: string;

    earthlyBranch: string;

    tenGod: SajuLuckFlowTenGod;

    element: SajuFiveElement;

    startDate: string;

    endDate: string;

    jieQiBoundary: {
      name: string;

      date: string;
    } | null;
  };

  export type SajuTargetPeriodLuckFlowFact = {
    targetStartDate: string;

    targetEndDate: string;

    currentDaeun: SajuCurrentDaeunFact | null;

    targetSeun: SajuCurrentSeunFact;

    yearSegments: SajuYearGanZhiSegmentFact[];

    wolunSegments: SajuWolunSegmentFact[];

    targetIlun: SajuTargetIlunFact | null;

    limitations: string[];
  };

  export type SajuLuckFlowFact = {
    referenceDate: string;

    referenceYear: number;

    currentAge: number;

    isForward: boolean;

    luckStartMethod: V3LuckStartMethod;

    luckStart: SajuLuckStartFact;

    currentDaeun: SajuCurrentDaeunFact | null;

    currentSeun: SajuCurrentSeunFact;
  };
