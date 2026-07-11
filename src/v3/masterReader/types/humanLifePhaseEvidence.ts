import type { HumanLifePhase } from "./humanLifePhase";

export type HumanLifePhaseEvidenceSource =
  | "ageStage"
  | "daeun"
  | "seun"
  | "originalChart"
  | "usefulGod"
  | "tenGodFlow"
  | "fiveElementFlow"
  | "interaction"
  | "masterProfile";

export type HumanLifePhaseEvidence = {
  phase: HumanLifePhase;

  source: HumanLifePhaseEvidenceSource;

  description: string;

  weight: number;

  isCounterEvidence?: boolean;
};

export type HumanLifePhaseReaderInput = {
  currentAge: number;

  evidence: HumanLifePhaseEvidence[];
};