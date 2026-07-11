import type { MasterProfile } from "../types/masterProfile";
import type { MasterReaderInput } from "../types/masterReaderInput";
import { readLifeDriver } from "./lifeDriverReader";
import { readRepeatedPattern } from "./repeatedPatternReader";
import { readSurvivalStyle } from "./survivalStyleReader";

export function readMasterProfile(
  input: MasterReaderInput,
): MasterProfile | null {
  const lifeDriver = readLifeDriver(input.lifeDriver);

  const survivalStyle = readSurvivalStyle(
    input.survivalEvidence,
  );

  const repeatedPattern = readRepeatedPattern(
    input.repeatedPatternEvidence,
  );

  if (!lifeDriver || !survivalStyle || !repeatedPattern) {
    return null;
  }

  return {
    lifeDriver,
    survivalStyle,
    repeatedPattern,
  };
}