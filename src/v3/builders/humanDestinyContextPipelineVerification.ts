import type {
    SajuFactsPipelineInput,
  } from "./sajuFactsPipelineBuilder";

  import {
    buildHumanDestinyContextPipeline,
  } from "./humanDestinyContextPipelineBuilder";

  export type HumanDestinyContextPipelineVerificationCase = {
    name: string;

    passed: boolean;

    details: string;
  };

  export type HumanDestinyContextPipelineVerificationResult = {
    cases:
      HumanDestinyContextPipelineVerificationCase[];

    passed: boolean;
  };

  const pipelineInput:
    SajuFactsPipelineInput = {
      name: "사람 중심 파이프라인 검증",

      birthDate: "2018-06-11",

      birthTime: "09:30",

      gender: "female",

      calendarType: "solar",

      referenceDate: "2026-07-26",

      luckStartMethod: "minuteBased",
    };

  function createCase(
    name: string,
    passed: boolean,
    details: string,
  ): HumanDestinyContextPipelineVerificationCase {
    return {
      name,

      passed,

      details,
    };
  }

  function buildPipeline(
    input:
      SajuFactsPipelineInput =
        pipelineInput,
  ) {
    return buildHumanDestinyContextPipeline(
      input,
    );
  }

  function verifySajuFactsReachPipeline():
    HumanDestinyContextPipelineVerificationCase {
    const result = buildPipeline();

    const calculated =
      result.sajuFactsPipeline
        .calculatedSaju;

    const facts =
      result.sajuFactsPipeline.facts;

    const passed =
      calculated.solarDateIso ===
        "2018-06-11" &&
      facts.dayMaster === "甲" &&
      facts.pillars.length === 4 &&
      facts.luckFlow.currentAge ===
        8 &&
      facts.luckFlow.currentDaeun
        ?.ganZhi === "丁巳" &&
      facts.luckFlow.currentSeun
        .ganZhi === "丙午";

    return createCase(
      "saju facts reach human pipeline",
      passed,
      [
        `solarDateIso=${
          calculated.solarDateIso
        }`,
        `dayMaster=${facts.dayMaster}`,
        `daeun=${
          facts.luckFlow.currentDaeun
            ?.ganZhi ?? "null"
        }`,
        `seun=${
          facts.luckFlow.currentSeun
            .ganZhi
        }`,
      ].join(", "),
    );
  }

  function verifyEvidenceBundleIsBuilt():
    HumanDestinyContextPipelineVerificationCase {
    const result = buildPipeline();

    const bundle =
      result.evidenceBundle;

    const passed =
      bundle.masterReaderInput
        .lifeDriver.meanings.length >
        0 &&
      bundle.masterReaderInput
        .survivalEvidence.length >
        0 &&
      bundle.masterReaderInput
        .repeatedPatternEvidence
        .length > 0 &&
      bundle.masterReaderInput
        .structureFacts.length > 0 &&
      bundle.lifePhaseInput
        .currentAge === 8 &&
      bundle.lifePhaseInput
        .evidence.length === 4;

    return createCase(
      "evidence bundle is built from facts",
      passed,
      [
        `lifeDriver=${
          bundle.masterReaderInput
            .lifeDriver.meanings.length
        }`,
        `structureFacts=${
          bundle.masterReaderInput
            .structureFacts.length
        }`,
        `lifePhaseEvidence=${
          bundle.lifePhaseInput
            .evidence.length
        }`,
      ].join(", "),
    );
  }

  function verifyMasterProfileIsComplete():
    HumanDestinyContextPipelineVerificationCase {
    const result = buildPipeline();

    const profile =
      result.humanContext
        .identity.profile;

    const sections = [
      profile.lifeDriver,

      profile.survivalStyle,

      profile.repeatedPattern,

      profile.capacity,

      profile.money,

      profile.career,

      profile.relationship,

      profile.health,

      profile.blessing,

      profile.destiny,
    ];

    const passed =
      sections.length === 10 &&
      sections.every(
        (section) =>
          section !== null &&
          section !== undefined,
      );

    return createCase(
      "master profile contains all readers",
      passed,
      `sections=${sections.length}`,
    );
  }

  function verifyLifePhaseIsReadFromEvidence():
    HumanDestinyContextPipelineVerificationCase {
    const result = buildPipeline();

    const phase =
      result.humanContext
        .currentPhase;

    const passed =
      phase.phase === "transition" &&
      phase.title.trim().length > 0 &&
      phase.description.trim().length >
        0 &&
      phase.focusAreas.length > 0 &&
      phase.avoidAreas.length > 0;

    return createCase(
      "life phase is read from evidence",
      passed,
      [
        `phase=${phase.phase}`,
        `title=${phase.title}`,
        `focusAreas=${
          phase.focusAreas.length
        }`,
        `avoidAreas=${
          phase.avoidAreas.length
        }`,
      ].join(", "),
    );
  }

  function verifyIdentityExplanationExists():
    HumanDestinyContextPipelineVerificationCase {
    const result = buildPipeline();

    const identity =
      result.humanContext.identity;

    const passed =
      identity.explanation !== null &&
      identity.explanation !==
        undefined &&
      identity.humanSummary !== null &&
      identity.humanSummary !==
        undefined;

    return createCase(
      "identity explanation and summary exist",
      passed,
      [
        `explanation=${
          identity.explanation
            ? "present"
            : "missing"
        }`,
        `humanSummary=${
          identity.humanSummary
            ? "present"
            : "missing"
        }`,
      ].join(", "),
    );
  }

  function verifyReferenceDatePropagates():
    HumanDestinyContextPipelineVerificationCase {
    const beforeBirthday =
      buildPipeline({
        ...pipelineInput,

        referenceDate: "2026-06-10",
      });

    const onBirthday =
      buildPipeline({
        ...pipelineInput,

        referenceDate: "2026-06-11",
      });

    const beforeAge =
      beforeBirthday.evidenceBundle
        .lifePhaseInput.currentAge;

    const onAge =
      onBirthday.evidenceBundle
        .lifePhaseInput.currentAge;

    const passed =
      beforeAge === 7 &&
      onAge === 8 &&
      beforeBirthday
        .sajuFactsPipeline
        .facts.luckFlow.currentAge ===
        beforeAge &&
      onBirthday
        .sajuFactsPipeline
        .facts.luckFlow.currentAge ===
        onAge;

    return createCase(
      "reference date propagates to human context evidence",
      passed,
      [
        `before=${beforeAge}`,
        `onBirthday=${onAge}`,
      ].join(", "),
    );
  }

  function verifyPreDaeunStillBuildsContext():
    HumanDestinyContextPipelineVerificationCase {
    const result =
      buildPipeline({
        ...pipelineInput,

        referenceDate: "2019-01-01",
      });

    const passed =
      result.sajuFactsPipeline
        .facts.luckFlow.currentDaeun ===
        null &&
      result.evidenceBundle
        .lifePhaseInput.evidence
        .every(
          (item) =>
            item.source === "seun",
        ) &&
      result.humanContext
        .currentPhase !== null;

    return createCase(
      "pre-daeun still builds human context",
      passed,
      [
        `currentDaeun=${
          result.sajuFactsPipeline
            .facts.luckFlow
            .currentDaeun === null
            ? "null"
            : "present"
        }`,
        `phase=${
          result.humanContext
            .currentPhase.phase
        }`,
      ].join(", "),
    );
  }

  export function verifyHumanDestinyContextPipeline():
    HumanDestinyContextPipelineVerificationResult {
    const cases = [
      verifySajuFactsReachPipeline(),

      verifyEvidenceBundleIsBuilt(),

      verifyMasterProfileIsComplete(),

      verifyLifePhaseIsReadFromEvidence(),

      verifyIdentityExplanationExists(),

      verifyReferenceDatePropagates(),

      verifyPreDaeunStillBuildsContext(),
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