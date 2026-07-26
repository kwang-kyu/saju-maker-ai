export type V3LuckFlowGender =
  | "male"
  | "female";

export type V3LuckStartMethod =
  | "minuteBased";

export type V3LuckFlowCalculationInput = {
  solarBirthDate: string;

  birthTime: string;

  gender: V3LuckFlowGender;

  referenceDate: string;

  luckStartMethod: V3LuckStartMethod;
};

export type V3LuckStart = {
  year: number;

  month: number;

  day: number;

  hour: number;

  solarDate: string;
};

export type V3CurrentDaeun = {
  index: number;

  ganZhi: string;

  heavenlyStem: string;

  earthlyBranch: string;

  startYear: number;

  endYear: number;

  startAge: number;

  endAge: number;
};

export type V3CurrentSeun = {
  year: number;

  age: number;

  ganZhi: string;

  heavenlyStem: string;

  earthlyBranch: string;
};

export type V3LuckFlowCalculationResult = {
  referenceDate: string;

  referenceYear: number;

  isForward: boolean;

  luckStartMethod: V3LuckStartMethod;

  luckStart: V3LuckStart;

  currentDaeun: V3CurrentDaeun | null;

  currentSeun: V3CurrentSeun;
};