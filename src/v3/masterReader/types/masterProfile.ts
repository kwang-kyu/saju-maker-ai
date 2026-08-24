import type {
  LifeDriverResult,
} from "./lifeDriver.js";
import type {
  SurvivalStyleResult,
} from "./survivalStyle.js";
import type {
  RepeatedPatternResult,
} from "./repeatedPattern.js";
import type {
  CapacityResult,
} from "./capacity.js";
import type {
  MoneyResult,
} from "./money.js";
import type {
  CareerResult,
} from "./career.js";
import type {
  RelationshipResult,
} from "./relationship.js";
import type {
  HealthResult,
} from "./health.js";
import type {
  BlessingResult,
} from "./blessing.js";
import type {
  DestinyResult,
} from "./destiny.js";

export type MasterProfile = {
  lifeDriver: LifeDriverResult;

  survivalStyle: SurvivalStyleResult;

  repeatedPattern: RepeatedPatternResult;

  capacity: CapacityResult;

  money: MoneyResult;

  career: CareerResult;

  relationship: RelationshipResult;

  health: HealthResult;

  blessing: BlessingResult;

  destiny: DestinyResult;
};