import type {
  LifeDriverResult,
} from "./lifeDriver";
import type {
  SurvivalStyleResult,
} from "./survivalStyle";
import type {
  RepeatedPatternResult,
} from "./repeatedPattern";
import type {
  CapacityResult,
} from "./capacity";
import type {
  MoneyResult,
} from "./money";
import type {
  CareerResult,
} from "./career";
import type {
  RelationshipResult,
} from "./relationship";

export type MasterProfile = {
  lifeDriver: LifeDriverResult;

  survivalStyle: SurvivalStyleResult;

  repeatedPattern: RepeatedPatternResult;

  capacity: CapacityResult;

  money: MoneyResult;

  career: CareerResult;

  relationship: RelationshipResult;
};