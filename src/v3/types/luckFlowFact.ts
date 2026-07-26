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