import { buildHumanDestinyContext } from "../builders/humanDestinyContextBuilder.js";
import { buildHumanDestinyProfile } from "../masterReader/readers/humanDestinyProfileBuilder.js";
import { readHumanLifePhase } from "../masterReader/readers/humanLifePhaseReader.js";
import { readMasterProfile } from "../masterReader/readers/masterReader.js";
import type { MasterReaderInput } from "../masterReader/types/masterReaderInput.js";
import type { HumanLifePhaseReaderInput } from "../masterReader/types/humanLifePhaseEvidence.js";
import type { HumanDestinyContext } from "../types/humanDestinyContext.js";

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