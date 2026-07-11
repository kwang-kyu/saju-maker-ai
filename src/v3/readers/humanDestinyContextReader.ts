import { buildHumanDestinyContext } from "../builders/humanDestinyContextBuilder";
import { buildHumanDestinyProfile } from "../masterReader/readers/humanDestinyProfileBuilder";
import { readHumanLifePhase } from "../masterReader/readers/humanLifePhaseReader";
import { readMasterProfile } from "../masterReader/readers/masterReader";
import type { MasterReaderInput } from "../masterReader/types/masterReaderInput";
import type { HumanLifePhaseReaderInput } from "../masterReader/types/humanLifePhaseEvidence";
import type { HumanDestinyContext } from "../types/humanDestinyContext";

export type HumanDestinyContextReaderInput = {
  masterReaderInput: MasterReaderInput;

  lifePhaseInput: HumanLifePhaseReaderInput;
};

export function readHumanDestinyContext(
  input: HumanDestinyContextReaderInput,
): HumanDestinyContext | null {
  const masterReaderResult = readMasterProfile(
    input.masterReaderInput,
  );

  if (!masterReaderResult) {
    return null;
  }

  const currentPhase = readHumanLifePhase(
    input.lifePhaseInput,
  );

  if (!currentPhase) {
    return null;
  }

  const identity = buildHumanDestinyProfile(
    masterReaderResult,
  );

  return buildHumanDestinyContext({
    identity,
    currentPhase,
  });
}