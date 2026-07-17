import type { LifeDriverResult } from "./lifeDriver";
import type { SurvivalStyleResult } from "./survivalStyle";
import type { RepeatedPatternResult } from "./repeatedPattern";
import type { CapacityResult } from "./capacity";

export type MasterProfile = {
  lifeDriver: LifeDriverResult;

  survivalStyle: SurvivalStyleResult;

  repeatedPattern: RepeatedPatternResult;

  capacity: CapacityResult;
};