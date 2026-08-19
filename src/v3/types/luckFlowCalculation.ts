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

export type V3JieQiBoundary = {
  name: string;

  date: string;
};

export type V3WolunSegment = {
  targetYear: number;

  targetMonth: number;

  ganZhi: string;

  heavenlyStem: string;

  earthlyBranch: string;

  startDate: string;

  endDate: string;

  jieQiBoundary:
    V3JieQiBoundary | null;
};

export type V3TargetIlun = {
  targetDate: string;

  ganZhi: string;

  heavenlyStem: string;

  earthlyBranch: string;
};

export type V3YearGanZhiSegment = {
  ganZhi: string;

  heavenlyStem: string;

  earthlyBranch: string;

  startDate: string;

  endDate: string;

  jieQiBoundary:
    V3JieQiBoundary | null;
};

export type V3TargetPeriodLuckFlow = {
  referenceDate: string;

  targetStartDate: string;

  targetEndDate: string;

  currentDaeun: V3CurrentDaeun | null;

  targetSeun: V3CurrentSeun;

  yearSegments:
    V3YearGanZhiSegment[];

  wolunSegments:
    V3WolunSegment[];

  targetIlun:
    V3TargetIlun | null;

  limitations:
    string[];
};

export type V3TargetPeriodLuckFlowInput = {
  solarBirthDate: string;

  birthTime: string;

  gender: V3LuckFlowGender;

  luckStartMethod: V3LuckStartMethod;

  targetStartDate: string;

  targetEndDate: string;

  scope:
    | "overall"
    | "year"
    | "halfYear"
    | "month"
    | "day";

  targetYear:
    number | null;

  targetMonth:
    number | null;

  targetDay:
    number | null;

  includeWolunSegments?:
    boolean;
};

export type V3LuckFlowCalculationResult = {
  referenceDate: string;

  referenceYear: number;

  isForward: boolean;

  luckStartMethod: V3LuckStartMethod;

  luckStart: V3LuckStart;

  currentDaeun: V3CurrentDaeun | null;

  currentSeun: V3CurrentSeun;

  wolunSegments?:
    V3WolunSegment[];

  targetIlun?:
    V3TargetIlun | null;

  yearSegments?:
    V3YearGanZhiSegment[];
};
