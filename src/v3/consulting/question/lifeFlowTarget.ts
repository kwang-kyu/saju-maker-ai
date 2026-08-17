export type LifeFlowScope =
  | "overall"
  | "year"
  | "halfYear"
  | "month"
  | "day";

export type LifeFlowHalf =
  | "first"
  | "second";

export type LifeFlowTargetAmbiguity = {
  needsClarification:
    true;

  reason:
    string;
};

export type LifeFlowTarget = {
  scope:
    LifeFlowScope;

  referenceDate:
    string;

  targetYear:
    number | null;

  targetMonth:
    number | null;

  targetDay:
    number | null;

  half:
    LifeFlowHalf | null;

  startDate:
    string;

  endDate:
    string;

  yearExplicit:
    boolean;

  evidence:
    string[];

  ambiguity?:
    LifeFlowTargetAmbiguity;

  limitations:
    string[];
};
