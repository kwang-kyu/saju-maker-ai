import {
    readBlessing,
  } from "../masterReader/readers/blessingReader";

  import {
    readCapacity,
  } from "../masterReader/readers/capacityReader";

  import {
    readCareer,
  } from "../masterReader/readers/careerReader";

  import {
    readDestiny,
  } from "../masterReader/readers/destinyReader";

  import {
    readHealth,
  } from "../masterReader/readers/healthReader";

  import {
    readLifeDriver,
  } from "../masterReader/readers/lifeDriverReader";

  import {
    readMoney,
  } from "../masterReader/readers/moneyReader";

  import {
    readRelationship,
  } from "../masterReader/readers/relationshipReader";

  import {
    readRepeatedPattern,
  } from "../masterReader/readers/repeatedPatternReader";

  import {
    readSurvivalStyle,
  } from "../masterReader/readers/survivalStyleReader";

  import {
    buildMasterReaderEvidenceBundle,
  } from "./masterReaderEvidenceBuilder";

  import {
    buildSajuFactsPipeline,
    type SajuFactsPipelineInput,
  } from "./sajuFactsPipelineBuilder";

  export type MasterReaderEvidenceIntegrationVerificationCase = {
    name: string;

    passed: boolean;

    details: string;
  };

  export type MasterReaderEvidenceIntegrationVerificationResult = {
    cases:
      MasterReaderEvidenceIntegrationVerificationCase[];

    passed: boolean;
  };

  const pipelineInput:
    SajuFactsPipelineInput = {
      name:
        "Master Reader Evidence 검증",

      birthDate: "2018-06-11",

      birthTime: "09:30",

      gender: "female",

      calendarType: "solar",

      referenceDate: "2026-07-26",

      luckStartMethod: "minuteBased",
    };

  function createCase(
    name: string,
    result: unknown,
  ): MasterReaderEvidenceIntegrationVerificationCase {
    const passed =
      result !== null &&
      result !== undefined;

    return {
      name,

      passed,

      details:
        passed
          ? "reader result is present"
          : "reader result is null",
    };
  }

  export function verifyMasterReaderEvidenceIntegration():
    MasterReaderEvidenceIntegrationVerificationResult {
    const facts =
      buildSajuFactsPipeline(
        pipelineInput,
      ).facts;

    const input =
      buildMasterReaderEvidenceBundle({
        facts,
      }).masterReaderInput;

    const cases = [
      createCase(
        "life driver reads fact evidence",
        readLifeDriver(
          input.lifeDriver,
        ),
      ),

      createCase(
        "survival style reads fact evidence",
        readSurvivalStyle(
          input.survivalEvidence,
        ),
      ),

      createCase(
        "repeated pattern reads fact evidence",
        readRepeatedPattern(
          input.repeatedPatternEvidence,
        ),
      ),

      createCase(
        "capacity reads structure facts",
        readCapacity(
          input.structureFacts,
        ),
      ),

      createCase(
        "money reads structure facts",
        readMoney(
          input.structureFacts,
        ),
      ),

      createCase(
        "career reads structure facts",
        readCareer(
          input.structureFacts,
        ),
      ),

      createCase(
        "relationship reads structure facts",
        readRelationship(
          input.structureFacts,
        ),
      ),

      createCase(
        "health reads structure facts",
        readHealth(
          input.structureFacts,
        ),
      ),

      createCase(
        "blessing reads structure facts",
        readBlessing(
          input.structureFacts,
        ),
      ),

      createCase(
        "destiny reads structure facts",
        readDestiny(
          input.structureFacts,
        ),
      ),
    ];

    return {
      cases,

      passed:
        cases.every(
          (verificationCase) =>
            verificationCase.passed,
        ),
    };
  }