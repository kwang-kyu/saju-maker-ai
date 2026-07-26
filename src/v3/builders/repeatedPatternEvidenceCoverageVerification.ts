import {
    readRepeatedPattern,
  } from "../masterReader/readers/repeatedPatternReader";

  import {
    scoreRepeatedPatterns,
  } from "../masterReader/readers/repeatedPatternScorer";

  import {
    buildMasterReaderEvidenceBundle,
  } from "./masterReaderEvidenceBuilder";

  import {
    buildSajuFactsPipeline,
    type SajuFactsPipelineInput,
  } from "./sajuFactsPipelineBuilder";

  export type RepeatedPatternEvidenceCoverageSample = {
    name: string;

    birthDate: string;

    dayMaster: string;

    strongestElement: string | null;

    weakestElement: string | null;

    structureSignals: string[];

    interactionTypes: string[];

    evidence: string[];

    scores: string[];

    primary: string | null;
  };

  export type RepeatedPatternEvidenceCoverageVerificationResult = {
    samples:
      RepeatedPatternEvidenceCoverageSample[];

    passed: boolean;
  };

  const COVERAGE_INPUTS:
    SajuFactsPipelineInput[] = [
      {
        name: "Evidence 1개·결과 없음",

        birthDate: "1984-02-02",

        birthTime: "04:20",

        gender: "female",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },

      {
        name: "Evidence 0개·결과 없음",

        birthDate: "2001-09-14",

        birthTime: "16:05",

        gender: "female",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },

      {
        name: "Evidence 3개·결과 있음",

        birthDate: "1978-07-09",

        birthTime: "13:40",

        gender: "female",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },

      {
        name: "Evidence 2개·결과 있음",

        birthDate: "1988-10-23",

        birthTime: "19:30",

        gender: "male",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },
    ];

  function summarizeSignal(
    signal:
      NonNullable<
        ReturnType<
          typeof buildSajuFactsPipeline
        >["facts"]["structureFacts"][number]["signal"]
      >,
  ): string {
    switch (signal.kind) {
      case "dayMasterStrength":
        return (
          `dayMasterStrength:` +
          `${signal.type},` +
          `support=${signal.supportScore},` +
          `opposing=${signal.opposingScore}`
        );

      case "monthCommand":
        return (
          `monthCommand:` +
          `season=${signal.season},` +
          `supported=${signal.supported}`
        );

      case "rooting":
        return (
          `rooting:` +
          `rooted=${signal.rooted},` +
          `count=${signal.rootingCount}/` +
          `${signal.totalBranches}`
        );

      case "tenGodDominance":
        return (
          `tenGodDominance:` +
          `dominant=${signal.dominantTenGod},` +
          `count=${signal.dominantCount}/` +
          `${signal.totalCount},` +
          `distributed=${signal.distributed}`
        );
    }
  }

  function buildSample(
    input: SajuFactsPipelineInput,
  ): RepeatedPatternEvidenceCoverageSample {
    const facts =
      buildSajuFactsPipeline(
        input,
      ).facts;

    const masterReaderInput =
      buildMasterReaderEvidenceBundle({
        facts,
      }).masterReaderInput;

    const evidence =
      masterReaderInput
        .repeatedPatternEvidence;

    const scores =
      scoreRepeatedPatterns(
        evidence,
      );

    const result =
      readRepeatedPattern(
        evidence,
      );

    return {
      name: input.name,

      birthDate:
        input.birthDate,

      dayMaster:
        facts.dayMaster,

      strongestElement:
        facts.strongestElement,

      weakestElement:
        facts.weakestElement,

      structureSignals:
        facts.structureFacts.flatMap(
          (fact) =>
            fact.signal
              ? [
                  `${fact.category} | ` +
                  summarizeSignal(
                    fact.signal,
                  ),
                ]
              : [],
        ),

      interactionTypes:
        facts.interactionFacts.map(
          (fact) =>
            `${fact.type} | ` +
            `${fact.strength} | ` +
            `${fact.description}`,
        ),

      evidence:
        evidence.map(
          (item) =>
            `${item.source} | ` +
            `weight=${item.weight} | ` +
            `${item.description}`,
        ),

      scores:
        scores
          .filter(
            (score) =>
              score.score > 0,
          )
          .map(
            (score) =>
              `${score.pattern}=` +
              `${score.score}`,
          ),

      primary:
        result?.primary.pattern ??
        null,
    };
  }

  export function verifyRepeatedPatternEvidenceCoverage():
    RepeatedPatternEvidenceCoverageVerificationResult {
    const samples =
      COVERAGE_INPUTS.map(
        buildSample,
      );

    return {
      samples,

      passed:
        samples.every(
          (sample) =>
            sample.primary !== null,
        ),
    };
  }