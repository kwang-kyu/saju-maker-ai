import type { SajuStructureSignal } from "../../types/sajuFacts";
export type LifeDriverEvidenceSource =
  | "monthCommand"
  | "dayMasterStrength"
  | "structure"
  | "tenGodStrength"
  | "fiveElementFlow"
  | "rooting"
  | "usefulGod"
  | "interaction";

export type LifeDriverMeaning = {
  id: string;
  source: LifeDriverEvidenceSource;
  meaning: string;
  strength: "weak" | "medium" | "strong";
  confidence: "low" | "medium" | "high";
  signal?: SajuStructureSignal;
};

export type LifeDriverReaderInput = {
  meanings: LifeDriverMeaning[];
};