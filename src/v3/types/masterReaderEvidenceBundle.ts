import type { HumanLifePhaseReaderInput } from "../masterReader/types/humanLifePhaseEvidence";
import type { MasterReaderInput } from "../masterReader/types/masterReaderInput";

export type MasterReaderEvidenceBundle = {
  masterReaderInput: MasterReaderInput;

  lifePhaseInput: HumanLifePhaseReaderInput;
};