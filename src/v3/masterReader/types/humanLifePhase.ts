export type HumanLifePhase =
  | "growth"
  | "preparation"
  | "transition"
  | "harvest"
  | "stability"
  | "challenge"
  | "recovery"
  | "reset";

export type HumanLifePhaseResult = {
  phase: HumanLifePhase;

  title: string;

  description: string;

  focusAreas: string[];

  avoidAreas: string[];
};