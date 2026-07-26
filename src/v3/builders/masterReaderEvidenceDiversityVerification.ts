import {
    readRepeatedPattern,
  } from "../masterReader/readers/repeatedPatternReader";

  import {
    readSurvivalStyle,
  } from "../masterReader/readers/survivalStyleReader";

  import type {
    RepeatedPatternType,
  } from "../masterReader/types/repeatedPattern";

  import type {
    SurvivalStyleType,
  } from "../masterReader/types/survivalStyle";

  import {
    buildMasterReaderEvidenceBundle,
  } from "./masterReaderEvidenceBuilder";

  import {
    buildSajuFactsPipeline,
    type SajuFactsPipelineInput,
  } from "./sajuFactsPipelineBuilder";

  export type MasterReaderEvidenceDiversityVerificationCase = {
    name: string;

    passed: boolean;

    details: string;
  };

  export type MasterReaderEvidenceDiversitySample = {
    name: string;

    survivalEvidenceCount: number;

    repeatedPatternEvidenceCount: number;

    survivalPrimary:
      | SurvivalStyleType
      | null;

    repeatedPatternPrimary:
      | RepeatedPatternType
      | null;
  };

  export type MasterReaderEvidenceDiversityVerificationResult = {
    samples:
      MasterReaderEvidenceDiversitySample[];

    cases:
      MasterReaderEvidenceDiversityVerificationCase[];

    passed: boolean;
  };

  const PIPELINE_INPUTS:
    SajuFactsPipelineInput[] = [
      {
        name: "겨울 새벽 여성",

        birthDate: "1984-02-02",

        birthTime: "04:20",

        gender: "female",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },

      {
        name: "봄 오전 남성",

        birthDate: "1991-04-17",

        birthTime: "09:10",

        gender: "male",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },

      {
        name: "여름 낮 여성",

        birthDate: "1978-07-09",

        birthTime: "13:40",

        gender: "female",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },

      {
        name: "가을 저녁 남성",

        birthDate: "1988-10-23",

        birthTime: "19:30",

        gender: "male",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },

      {
        name: "초봄 밤 여성",

        birthDate: "1996-03-05",

        birthTime: "22:15",

        gender: "female",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },

      {
        name: "초여름 오전 남성",

        birthDate: "1972-06-01",

        birthTime: "10:50",

        gender: "male",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },

      {
        name: "초가을 오후 여성",

        birthDate: "2001-09-14",

        birthTime: "16:05",

        gender: "female",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },

      {
        name: "한겨울 밤 남성",

        birthDate: "1965-12-28",

        birthTime: "23:20",

        gender: "male",

        calendarType: "solar",

        referenceDate: "2026-07-26",

        luckStartMethod: "minuteBased",
      },
    ];

  function buildSample(
    input: SajuFactsPipelineInput,
  ): MasterReaderEvidenceDiversitySample {
    const facts =
      buildSajuFactsPipeline(
        input,
      ).facts;

    const masterReaderInput =
      buildMasterReaderEvidenceBundle({
        facts,
      }).masterReaderInput;

    const survival =
      readSurvivalStyle(
        masterReaderInput
          .survivalEvidence,
      );

    const repeatedPattern =
      readRepeatedPattern(
        masterReaderInput
          .repeatedPatternEvidence,
      );

    return {
      name: input.name,

      survivalEvidenceCount:
        masterReaderInput
          .survivalEvidence.length,

      repeatedPatternEvidenceCount:
        masterReaderInput
          .repeatedPatternEvidence
          .length,

      survivalPrimary:
        survival?.primary.style ?? null,

      repeatedPatternPrimary:
        repeatedPattern?.primary
          .pattern ?? null,
    };
  }

  function buildEvidenceFingerprint(
    input: SajuFactsPipelineInput,
  ): string {
    const facts =
      buildSajuFactsPipeline(
        input,
      ).facts;

    const masterReaderInput =
      buildMasterReaderEvidenceBundle({
        facts,
      }).masterReaderInput;

    return JSON.stringify({
      survival:
        masterReaderInput
          .survivalEvidence,

      repeatedPattern:
        masterReaderInput
          .repeatedPatternEvidence,
    });
  }

  function createCase(
    name: string,
    passed: boolean,
    details: string,
  ): MasterReaderEvidenceDiversityVerificationCase {
    return {
      name,
      passed,
      details,
    };
  }

  export function verifyMasterReaderEvidenceDiversity():
    MasterReaderEvidenceDiversityVerificationResult {
    const samples =
      PIPELINE_INPUTS.map(
        buildSample,
      );

    const survivalStyles =
      new Set(
        samples
          .map(
            (sample) =>
              sample.survivalPrimary,
          )
          .filter(
            (
              style,
            ): style is SurvivalStyleType =>
              style !== null,
          ),
      );

    const repeatedPatterns =
      new Set(
        samples
          .map(
            (sample) =>
              sample.repeatedPatternPrimary,
          )
          .filter(
            (
              pattern,
            ): pattern is RepeatedPatternType =>
              pattern !== null,
          ),
      );

    const evidenceFingerprints =
      PIPELINE_INPUTS.map(
        buildEvidenceFingerprint,
      );

    const firstFingerprint =
      buildEvidenceFingerprint(
        PIPELINE_INPUTS[0],
      );

    const repeatedFirstFingerprint =
      buildEvidenceFingerprint(
        PIPELINE_INPUTS[0],
      );

    const cases = [
      createCase(
        "every sample builds survival evidence",
        samples.every(
          (sample) =>
            sample.survivalEvidenceCount >
            0,
        ),
        samples
          .map(
            (sample) =>
              `${sample.name}=` +
              `${sample.survivalEvidenceCount}`,
          )
          .join(", "),
      ),

      createCase(
        "every sample builds repeated pattern evidence",
        samples.every(
          (sample) =>
            sample
              .repeatedPatternEvidenceCount >
            0,
        ),
        samples
          .map(
            (sample) =>
              `${sample.name}=` +
              `${sample.repeatedPatternEvidenceCount}`,
          )
          .join(", "),
      ),

      createCase(
        "every sample produces survival result",
        samples.every(
          (sample) =>
            sample.survivalPrimary !==
            null,
        ),
        samples
          .map(
            (sample) =>
              `${sample.name}=` +
              `${sample.survivalPrimary}`,
          )
          .join(", "),
      ),

      createCase(
        "every sample produces repeated pattern result",
        samples.every(
          (sample) =>
            sample.repeatedPatternPrimary !==
            null,
        ),
        samples
          .map(
            (sample) =>
              `${sample.name}=` +
              `${sample.repeatedPatternPrimary}`,
          )
          .join(", "),
      ),

      createCase(
        "survival primary is not fixed",
        survivalStyles.size >= 2,
        `distinct=${[
          ...survivalStyles,
        ].join(", ")}`,
      ),

      createCase(
        "repeated pattern primary is not fixed",
        repeatedPatterns.size >= 2,
        `distinct=${[
          ...repeatedPatterns,
        ].join(", ")}`,
      ),

      createCase(
        "evidence differs by calculated facts",
        new Set(
          evidenceFingerprints,
        ).size >= 2,
        `distinctEvidenceBundles=${
          new Set(
            evidenceFingerprints,
          ).size
        }`,
      ),

      createCase(
        "same facts produce deterministic evidence",
        firstFingerprint ===
          repeatedFirstFingerprint,
        firstFingerprint ===
          repeatedFirstFingerprint
          ? "same input produced identical evidence"
          : "same input produced different evidence",
      ),
    ];

    return {
      samples,

      cases,

      passed:
        cases.every(
          (verificationCase) =>
            verificationCase.passed,
        ),
    };
  }