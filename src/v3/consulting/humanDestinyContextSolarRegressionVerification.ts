import {
    buildMasterReaderEvidenceBundle,
  } from "../builders/masterReaderEvidenceBuilder.js";
  import {
    buildSajuFactsPipeline,
  } from "../builders/sajuFactsPipelineBuilder.js";
  import {
    readHumanDestinyContext,
  } from "../readers/humanDestinyContextReader.js";
  import {
    readBlessing,
  } from "../masterReader/readers/blessingReader.js";
  import {
    readCapacity,
  } from "../masterReader/readers/capacityReader.js";
  import {
    readCareer,
  } from "../masterReader/readers/careerReader.js";
  import {
    readDestiny,
  } from "../masterReader/readers/destinyReader.js";
  import {
    readHealth,
  } from "../masterReader/readers/healthReader.js";
  import {
    readHumanLifePhase,
  } from "../masterReader/readers/humanLifePhaseReader.js";
  import {
    readLifeDriver,
  } from "../masterReader/readers/lifeDriverReader.js";
  import {
    readMasterProfile,
  } from "../masterReader/readers/masterReader.js";
  import {
    readMoney,
  } from "../masterReader/readers/moneyReader.js";
  import {
    readRelationship,
  } from "../masterReader/readers/relationshipReader.js";
  import {
    readRepeatedPattern,
  } from "../masterReader/readers/repeatedPatternReader.js";
  import {
    readSurvivalStyle,
  } from "../masterReader/readers/survivalStyleReader.js";

  export function verifyHumanDestinyContextSolarRegression() {
    const input = {
      name:
        "김광규",

      birthDate:
        "1965-07-31",

      birthTime:
        "16:00",

      gender:
        "male" as const,

      calendarType:
        "solar" as const,

      referenceDate:
        "2026-07-31",

      luckStartMethod:
        "minuteBased" as const,
    };

    const sajuFactsPipeline =
      buildSajuFactsPipeline(
        input,
      );

    const evidenceBundle =
      buildMasterReaderEvidenceBundle({
        facts:
          sajuFactsPipeline.facts,
      });

    const masterReaderInput =
      evidenceBundle
        .masterReaderInput;

    const lifeDriver =
      readLifeDriver(
        masterReaderInput
          .lifeDriver,
      );

    const survivalStyle =
      readSurvivalStyle(
        masterReaderInput
          .survivalEvidence,
      );

    const repeatedPattern =
      readRepeatedPattern(
        masterReaderInput
          .repeatedPatternEvidence,
      );

    const capacity =
      readCapacity(
        masterReaderInput
          .structureFacts,
      );

    const money =
      readMoney(
        masterReaderInput
          .structureFacts,
      );

    const career =
      readCareer(
        masterReaderInput
          .structureFacts,
      );

    const relationship =
      readRelationship(
        masterReaderInput
          .structureFacts,
      );

    const health =
      readHealth(
        masterReaderInput
          .structureFacts,
      );

    const blessing =
      readBlessing(
        masterReaderInput
          .structureFacts,
      );

    const destiny =
      readDestiny(
        masterReaderInput
          .structureFacts,
      );

    const masterProfile =
      readMasterProfile(
        masterReaderInput,
      );

    const humanLifePhase =
      readHumanLifePhase(
        evidenceBundle
          .lifePhaseInput,
      );

    const humanDestinyContext =
      readHumanDestinyContext({
        masterReaderInput,

        lifePhaseInput:
          evidenceBundle
            .lifePhaseInput,
      });

    const facts =
      sajuFactsPipeline.facts;

    const checks = {
      sajuFactsAreBuilt:
        Boolean(
          facts,
        ),

      masterReaderEvidenceIsBuilt:
        Boolean(
          masterReaderInput,
        ),

      lifePhaseEvidenceIsBuilt:
        Boolean(
          evidenceBundle
            .lifePhaseInput,
        ),

      lifeDriverIsBuilt:
        lifeDriver
        !== null,

      survivalStyleIsBuilt:
        survivalStyle
        !== null,

      repeatedPatternIsBuilt:
        repeatedPattern
        !== null,

      capacityIsBuilt:
        capacity
        !== null,

      moneyIsBuilt:
        money
        !== null,

      careerIsBuilt:
        career
        !== null,

      relationshipIsBuilt:
        relationship
        !== null,

      healthIsBuilt:
        health
        !== null,

      blessingIsBuilt:
        blessing
        !== null,

      destinyIsBuilt:
        destiny
        !== null,

      masterProfileIsBuilt:
        masterProfile
        !== null,

      humanLifePhaseIsBuilt:
        humanLifePhase
        !== null,

      humanDestinyContextIsBuilt:
        humanDestinyContext
        !== null,
    };

    return {
      input,

      calculatedSolarDate:
        sajuFactsPipeline
          .calculatedSaju
          .solarDateIso,

      diagnostics: {
        pillars:
          facts.pillars,

        strongestElement:
          facts.strongestElement,

        weakestElement:
          facts.weakestElement,

        usefulGod:
          facts.usefulGod
          ?? null,

        structureFacts:
          facts.structureFacts,

        interactionFacts:
          facts.interactionFacts,

        lifeDriverMeanings:
          masterReaderInput
            .lifeDriver
            .meanings,

        survivalEvidence:
          masterReaderInput
            .survivalEvidence,

        repeatedPatternEvidence:
          masterReaderInput
            .repeatedPatternEvidence,

        lifePhaseInput:
          evidenceBundle
            .lifePhaseInput,
      },

      checks,

      passed:
        Object.values(
          checks,
        )
          .every(
            Boolean,
          ),
    };
  }
