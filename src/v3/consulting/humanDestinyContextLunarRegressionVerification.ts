import {
    buildSajuFactsPipeline,
  } from "../builders/sajuFactsPipelineBuilder";

  import {
    buildMasterReaderEvidenceBundle,
  } from "../builders/masterReaderEvidenceBuilder";

  import {
    readMasterProfile,
  } from "../masterReader/readers/masterReader";

  import {
    readLifeDriver,
  } from "../masterReader/readers/lifeDriverReader";

  import {
    readSurvivalStyle,
  } from "../masterReader/readers/survivalStyleReader";

  import {
    readRepeatedPattern,
  } from "../masterReader/readers/repeatedPatternReader";

  import {
    readCapacity,
  } from "../masterReader/readers/capacityReader";

  import {
    readMoney,
  } from "../masterReader/readers/moneyReader";

  import {
    readCareer,
  } from "../masterReader/readers/careerReader";

  import {
    readRelationship,
  } from "../masterReader/readers/relationshipReader";

  import {
    readHealth,
  } from "../masterReader/readers/healthReader";

  import {
    readBlessing,
  } from "../masterReader/readers/blessingReader";

  import {
    readDestiny,
  } from "../masterReader/readers/destinyReader";

  import {
    readHumanLifePhase,
  } from "../masterReader/readers/humanLifePhaseReader";

  import {
    buildHumanDestinyProfile,
  } from "../masterReader/readers/humanDestinyProfileBuilder";

  import {
    buildHumanDestinyContext,
  } from "../builders/humanDestinyContextBuilder";

  export type HumanDestinyContextLunarRegressionVerificationResult = {
    input: {
      name:
        string;

      birthDate:
        string;

      birthTime:
        string;

      gender:
        string;

      calendarType:
        string;

      referenceDate:
        string;
    };

    calculatedSolarDate:
      string;

    diagnostics: {
      strongestElement:
        string | null;

      weakestElement:
        string | null;

      usefulGod:
        string | null;

      structureFacts: Array<{
        category:
          string;

        signalKind:
          string | null;

        strength:
          string;

        confidence:
          string;
      }>;

      interactionTypes:
        string[];

      lifeDriverMeaningCount:
        number;

      repeatedPatternEvidenceCount:
        number;
    };

    checks: {
      sajuFactsAreBuilt:
        boolean;

      masterReaderEvidenceIsBuilt:
        boolean;

      lifePhaseEvidenceIsBuilt:
        boolean;

      lifeDriverIsBuilt:
        boolean;

      survivalStyleIsBuilt:
        boolean;

      repeatedPatternIsBuilt:
        boolean;

      capacityIsBuilt:
        boolean;

      moneyIsBuilt:
        boolean;

      careerIsBuilt:
        boolean;

      relationshipIsBuilt:
        boolean;

      healthIsBuilt:
        boolean;

      blessingIsBuilt:
        boolean;

      destinyIsBuilt:
        boolean;

      masterProfileIsBuilt:
        boolean;

      humanLifePhaseIsBuilt:
        boolean;

      humanDestinyContextIsBuilt:
        boolean;
    };

    passed:
      boolean;
  };

  export type HumanDestinyContextLunarRegressionInput = {
    name:
      string;

    birthDate:
      string;

    birthTime:
      string;

    gender:
      "male" | "female";

    calendarType:
      "lunar";

    referenceDate:
      string;

    luckStartMethod:
      "minuteBased";
  };

  const DEFAULT_LUNAR_REGRESSION_INPUT:
    HumanDestinyContextLunarRegressionInput = {
      name:
        "김광규",

      birthDate:
        "1975-07-10",

      birthTime:
        "16:02",

      gender:
        "male",

      calendarType:
        "lunar",

      referenceDate:
        "2026-07-27",

      luckStartMethod:
        "minuteBased",
    };

  export function verifyHumanDestinyContextLunarRegression(
    input:
      HumanDestinyContextLunarRegressionInput =
        DEFAULT_LUNAR_REGRESSION_INPUT,
  ): HumanDestinyContextLunarRegressionVerificationResult {

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
      masterProfile
      && humanLifePhase
        ? buildHumanDestinyContext({
            identity:
              buildHumanDestinyProfile(
                masterProfile,
              ),

            currentPhase:
              humanLifePhase,
          })
        : null;

    const facts =
      sajuFactsPipeline.facts;

    const diagnostics = {
      strongestElement:
        facts.strongestElement,

      weakestElement:
        facts.weakestElement,

        usefulGod:
        facts.usefulGod
        ?? null,

        structureFacts:
        facts.structureFacts.map(
          (fact) => ({
            category:
              fact.category,

            signalKind:
              fact.signal?.kind
              ?? null,

            strength:
              fact.strength,

            confidence:
              fact.confidence,

            description:
              fact.description,

            signal:
              fact.signal
              ?? null,
          }),
        ),

      interactionTypes:
        facts.interactionFacts.map(
          (fact) =>
            fact.type,
        ),

      lifeDriverMeaningCount:
        masterReaderInput
          .lifeDriver
          .meanings
          .length,

      repeatedPatternEvidenceCount:
        masterReaderInput
          .repeatedPatternEvidence
          .length,
    };

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
        lifeDriver !== null,

      survivalStyleIsBuilt:
        survivalStyle !== null,

      repeatedPatternIsBuilt:
        repeatedPattern !== null,

      capacityIsBuilt:
        capacity !== null,

      moneyIsBuilt:
        money !== null,

      careerIsBuilt:
        career !== null,

      relationshipIsBuilt:
        relationship !== null,

      healthIsBuilt:
        health !== null,

      blessingIsBuilt:
        blessing !== null,

      destinyIsBuilt:
        destiny !== null,

      masterProfileIsBuilt:
        masterProfile !== null,

      humanLifePhaseIsBuilt:
        humanLifePhase !== null,

      humanDestinyContextIsBuilt:
        humanDestinyContext !== null,
    };

    return {
      input: {
        name:
          input.name,

        birthDate:
          input.birthDate,

        birthTime:
          input.birthTime,

        gender:
          input.gender,

        calendarType:
          input.calendarType,

        referenceDate:
          input.referenceDate,
      },

      calculatedSolarDate:
        sajuFactsPipeline
          .calculatedSaju
          .solarDateIso,

      diagnostics,

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
