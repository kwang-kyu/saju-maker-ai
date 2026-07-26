import {
    buildSajuFactsPipeline,
  } from "./sajuFactsPipelineBuilder";

  import type {
    SajuFactsPipelineInput,
    SajuFactsPipelineResult,
  } from "./sajuFactsPipelineBuilder";

  export type SajuFactsPipelineVerificationCase = {
    name: string;

    passed: boolean;

    details: string;
  };

  export type SajuFactsPipelineVerificationResult = {
    cases: SajuFactsPipelineVerificationCase[];

    passed: boolean;
  };

  const pipelineInput:
    SajuFactsPipelineInput = {
      name: "통합 검증 대상",

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
  ): SajuFactsPipelineVerificationCase {
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
  ): SajuFactsPipelineResult {
    return buildSajuFactsPipeline(input);
  }

  function verifyCalculatedSajuIsPreserved():
  SajuFactsPipelineVerificationCase {
  const result = buildPipeline();

  const calculated =
    result.calculatedSaju;

  const facts = result.facts;

  const passed =
    calculated.solarDateIso ===
      "2018-06-11" &&
    facts.name === calculated.name &&
    facts.birthDate ===
      calculated.birthDate &&
    facts.birthTime ===
      calculated.birthTime &&
    facts.gender ===
      calculated.gender &&
    facts.calendarType ===
      calculated.calendarType &&
    facts.solarDate ===
      calculated.solarDate &&
    facts.lunarDate ===
      calculated.lunarDate &&
    facts.dayMaster ===
      calculated.dayMaster;

  return createCase(
    "calculated saju is preserved",
    passed,
    [
      `name=${facts.name}`,
      `solarDate=${facts.solarDate}`,
      `solarDateIso=${
        calculated.solarDateIso
      }`,
      `dayMaster=${facts.dayMaster}`,
    ].join(", "),
  );
}

  function verifyFourPillarsAreConnected():
    SajuFactsPipelineVerificationCase {
    const result = buildPipeline();

    const calculated =
      result.calculatedSaju;

    const pillars = result.facts.pillars;

    const year = pillars.find(
      (pillar) =>
        pillar.position === "year",
    );

    const month = pillars.find(
      (pillar) =>
        pillar.position === "month",
    );

    const day = pillars.find(
      (pillar) =>
        pillar.position === "day",
    );

    const time = pillars.find(
      (pillar) =>
        pillar.position === "time",
    );

    const passed =
      pillars.length === 4 &&
      year?.ganZhi ===
        calculated.yearGanZhi &&
      month?.ganZhi ===
        calculated.monthGanZhi &&
      day?.ganZhi ===
        calculated.dayGanZhi &&
        time?.ganZhi ===
        calculated.timeGanZhi &&
      calculated.timeGanZhi ===
        "己巳" &&
      calculated.timeGanZhi.length ===
        2 &&
      year?.tenGod ===
        calculated.yearTenGod &&
      month?.tenGod ===
        calculated.monthTenGod &&
      time?.tenGod ===
        calculated.timeTenGod;

    return createCase(
      "four pillars are connected",
      passed,
      pillars
        .map(
          (pillar) =>
            `${pillar.position}=${pillar.ganZhi}`,
        )
        .join(", "),
    );
  }

  function verifyLuckCalculationBuildsFact():
    SajuFactsPipelineVerificationCase {
    const result = buildPipeline();

    const calculation =
      result.luckFlowCalculation;

    const fact = result.luckFlowFact;

    const daeunMatches =
      calculation.currentDaeun === null
        ? fact.currentDaeun === null
        : fact.currentDaeun !== null &&
          fact.currentDaeun.ganZhi ===
            calculation.currentDaeun.ganZhi &&
          fact.currentDaeun.startYear ===
            calculation.currentDaeun.startYear &&
          fact.currentDaeun.endYear ===
            calculation.currentDaeun.endYear;

    const seunMatches =
      fact.currentSeun.ganZhi ===
        calculation.currentSeun.ganZhi &&
      fact.currentSeun.year ===
        calculation.currentSeun.year &&
      fact.currentSeun.age ===
        calculation.currentSeun.age;

    const passed =
      daeunMatches &&
      seunMatches;

    return createCase(
      "luck calculation builds structured fact",
      passed,
      [
        `daeun=${
          fact.currentDaeun?.ganZhi ?? "null"
        }`,
        `seun=${fact.currentSeun.ganZhi}`,
        `year=${fact.currentSeun.year}`,
      ].join(", "),
    );
  }

  function verifyLuckFactIsConnectedToFacts():
    SajuFactsPipelineVerificationCase {
    const result = buildPipeline();

    const passed =
      result.facts.luckFlow ===
        result.luckFlowFact &&
      result.facts.luckFlow.currentAge ===
        result.luckFlowFact.currentAge &&
      result.facts.luckFlow.currentSeun
        .ganZhi ===
        result.luckFlowFact.currentSeun
          .ganZhi;

    return createCase(
      "luck fact is connected to saju facts",
      passed,
      [
        `sameReference=${
          result.facts.luckFlow ===
          result.luckFlowFact
        }`,
        `currentAge=${
          result.facts.luckFlow.currentAge
        }`,
        `seun=${
          result.facts.luckFlow.currentSeun
            .ganZhi
        }`,
      ].join(", "),
    );
  }

  function verifyReferenceDateControlsAge():
    SajuFactsPipelineVerificationCase {
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

    const passed =
      beforeBirthday.luckFlowFact
        .currentAge === 7 &&
      onBirthday.luckFlowFact
        .currentAge === 8 &&
      beforeBirthday.facts.luckFlow
        .currentAge === 7 &&
      onBirthday.facts.luckFlow
        .currentAge === 8;

    return createCase(
      "reference date controls current age",
      passed,
      [
        `before=${
          beforeBirthday.facts.luckFlow
            .currentAge
        }`,
        `onBirthday=${
          onBirthday.facts.luckFlow
            .currentAge
        }`,
      ].join(", "),
    );
  }

  function verifyReferenceDateControlsSeun():
    SajuFactsPipelineVerificationCase {
    const year2025 =
      buildPipeline({
        ...pipelineInput,

        referenceDate: "2025-07-26",
      });

    const year2026 =
      buildPipeline({
        ...pipelineInput,

        referenceDate: "2026-07-26",
      });

    const seun2025 =
      year2025.facts.luckFlow.currentSeun;

    const seun2026 =
      year2026.facts.luckFlow.currentSeun;

    const passed =
      seun2025.year === 2025 &&
      seun2026.year === 2026 &&
      seun2025.ganZhi !==
        seun2026.ganZhi;

    return createCase(
      "reference date controls current seun",
      passed,
      [
        `year2025=${seun2025.ganZhi}`,
        `year2026=${seun2026.ganZhi}`,
      ].join(", "),
    );
  }

  function verifyStructureFactsRemainAvailable():
    SajuFactsPipelineVerificationCase {
    const result = buildPipeline();

    const categories =
      result.facts.structureFacts.map(
        (fact) => fact.category,
      );

    const passed =
      result.facts.structureFacts.length >
        0 &&
      categories.includes("structure") &&
      categories.includes(
        "fiveElementFlow",
      ) &&
      categories.includes(
        "tenGodStrength",
      );

    return createCase(
      "structure facts remain available",
      passed,
      [
        `count=${
          result.facts.structureFacts.length
        }`,
        `categories=${
          categories.join("|")
        }`,
      ].join(", "),
    );
  }

  export function verifySajuFactsPipeline():
    SajuFactsPipelineVerificationResult {
    const cases = [
      verifyCalculatedSajuIsPreserved(),

      verifyFourPillarsAreConnected(),

      verifyLuckCalculationBuildsFact(),

      verifyLuckFactIsConnectedToFacts(),

      verifyReferenceDateControlsAge(),

      verifyReferenceDateControlsSeun(),

      verifyStructureFactsRemainAvailable(),
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
