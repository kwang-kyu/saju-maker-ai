import type { HumanLifePhaseReaderInput } from "../masterReader/types/humanLifePhaseEvidence.js";
import type { MasterReaderInput } from "../masterReader/types/masterReaderInput.js";

export type MasterReaderEvidenceBundle = {
  masterReaderInput: MasterReaderInput;

  lifePhaseInput: HumanLifePhaseReaderInput;
};