import type {
    LifeDriverMeaning,
    LifeDriverReaderInput,
  } from "./lifeDriverInput";
  import type { PatternEvidence } from "./repeatedPattern";
  import type { SurvivalEvidence } from "./survivalStyle";
  
  export type MasterReaderInput = {
    lifeDriver: LifeDriverReaderInput;
  
    survivalEvidence: SurvivalEvidence[];
  
    repeatedPatternEvidence: PatternEvidence[];
  };
  
  export type MasterReaderEvidenceBundle = {
    lifeDriverMeanings: LifeDriverMeaning[];
  
    survivalEvidence: SurvivalEvidence[];
  
    repeatedPatternEvidence: PatternEvidence[];
  };