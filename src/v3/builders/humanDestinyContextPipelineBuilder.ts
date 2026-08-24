import type {
    HumanDestinyContext,
  } from "../types/humanDestinyContext.js";

  import type {
    MasterReaderEvidenceBundle,
  } from "../types/masterReaderEvidenceBundle.js";

  import {
    readHumanDestinyContext,
  } from "../readers/humanDestinyContextReader.js";

  import {
    buildMasterReaderEvidenceBundle,
  } from "./masterReaderEvidenceBuilder.js";

  import {
    buildSajuFactsPipeline,
    type SajuFactsPipelineInput,
    type SajuFactsPipelineResult,
  } from "./sajuFactsPipelineBuilder.js";

  export type HumanDestinyContextPipelineInput =
    SajuFactsPipelineInput;

  export type HumanDestinyContextPipelineResult = {
    sajuFactsPipeline:
      SajuFactsPipelineResult;

    evidenceBundle:
      MasterReaderEvidenceBundle;

    humanContext:
      HumanDestinyContext;
  };

  export function buildHumanDestinyContextPipeline(
    input:
      HumanDestinyContextPipelineInput,
  ): HumanDestinyContextPipelineResult {
    const sajuFactsPipeline =
      buildSajuFactsPipeline(input);

    const evidenceBundle =
      buildMasterReaderEvidenceBundle({
        facts:
          sajuFactsPipeline.facts,
      });

    const humanContext =
      readHumanDestinyContext({
        masterReaderInput:
          evidenceBundle
            .masterReaderInput,

        lifePhaseInput:
          evidenceBundle
            .lifePhaseInput,
      });

    if (!humanContext) {
      throw new Error(
        "Human destiny context could not be built from saju facts.",
      );
    }

    return {
      sajuFactsPipeline,

      evidenceBundle,

      humanContext,
    };
  }