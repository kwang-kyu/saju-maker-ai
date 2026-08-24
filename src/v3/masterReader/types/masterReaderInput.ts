import type {
  LifeDriverMeaning,
  LifeDriverReaderInput,
} from "./lifeDriverInput.js";
import type {
  PatternEvidence,
} from "./repeatedPattern.js";
import type {
  SurvivalEvidence,
} from "./survivalStyle.js";
import type {
  SajuStructureFact,
} from "../../types/sajuFacts.js";

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