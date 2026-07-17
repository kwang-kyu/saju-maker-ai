import type {
  LifeDriverMeaning,
  LifeDriverReaderInput,
} from "./lifeDriverInput";
import type {
  PatternEvidence,
} from "./repeatedPattern";
import type {
  SurvivalEvidence,
} from "./survivalStyle";
import type {
  SajuStructureFact,
} from "../../types/sajuFacts";

export type MasterReaderInput = {
  lifeDriver: LifeDriverReaderInput;

  survivalEvidence: SurvivalEvidence[];

  repeatedPatternEvidence: PatternEvidence[];

  structureFacts: SajuStructureFact[];
};

export type MasterReaderEvidenceBundle = {
  lifeDriverMeanings: LifeDriverMeaning[];

  survivalEvidence: SurvivalEvidence[];

  repeatedPatternEvidence: PatternEvidence[];
};