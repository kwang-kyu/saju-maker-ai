import {
    HUMAN_LIFE_PHASE_EVIDENCE_RULES,
  } from "../masterReader/rules/humanLifePhaseEvidenceRules";

  import {
    scoreHumanLifePhases,
  } from "../masterReader/readers/humanLifePhaseScorer";

  import type {
    SajuLuckFlowTenGod,
  } from "../types/luckFlowFact";

  import {
    buildHumanLifePhaseReaderInput,
  } from "./humanLifePhaseEvidenceBuilder";

  import {
    buildMasterReaderEvidenceBundle,
  } from "./masterReaderEvidenceBuilder";

  import {
    buildSajuFactsPipeline,
    type SajuFactsPipelineInput,
  } from "./sajuFactsPipelineBuilder";

  export type HumanLifePhaseEvidenceBuilderVerificationCase = {
    name: string;

    passed: boolean;

    details: string;
  };

  export type HumanLifePhaseEvidenceBuilderVerificationResult = {
    cases:
      HumanLifePhaseEvidenceBuilderVerificationCase[];

    passed: boolean;
  };

  const pipelineInput:
    SajuFactsPipelineInput = {
      name: "인생 국면 Evidence 검증",

      birthDate: "2018-06-11",

      birthTime: "09:30",

      gender: "female",

      calendarType: "solar",

      referenceDate: "2026-07-26",

      luckStartMethod: "minuteBased",
    };

  const allTenGods:
    readonly SajuLuckFlowTenGod[] = [
      "비견",
      "겁재",
      "식신",
      "상관",
      "편재",
      "정재",
      "편관",
      "정관",
      "편인",
      "정인",
    ];

  function createCase(
    name: string,
    passed: boolean,
    details: string,
  ): HumanLifePhaseEvidenceBuilderVerificationCase {
    return {
      name,

      passed,

      details,
    };
  }

  function buildFacts(
    input:
      SajuFactsPipelineInput =
        pipelineInput,
  ) {
    return buildSajuFactsPipeline(
      input,
    ).facts;
  }

  function verifyAllTenGodRulesExist():
    HumanLifePhaseEvidenceBuilderVerificationCase {
    const configuredTenGods =
      HUMAN_LIFE_PHASE_EVIDENCE_RULES.map(
        (rule) => rule.tenGod,
      );

    const uniqueTenGods =
      new Set(configuredTenGods);

    const missing =
      allTenGods.filter(
        (tenGod) =>
          !uniqueTenGods.has(tenGod),
      );

    const duplicated =
      configuredTenGods.filter(
        (tenGod, index) =>
          configuredTenGods.indexOf(
            tenGod,
          ) !== index,
      );

    const passed =
      missing.length === 0 &&
      duplicated.length === 0 &&
      uniqueTenGods.size ===
        allTenGods.length;

    return createCase(
      "all ten god rules exist once",
      passed,
      [
        `rules=${configuredTenGods.length}`,
        `unique=${uniqueTenGods.size}`,
        `missing=${missing.join("|") || "none"}`,
        `duplicated=${
          duplicated.join("|") || "none"
        }`,
      ].join(", "),
    );
  }

  function verifyRuleWeightsAreValid():
    HumanLifePhaseEvidenceBuilderVerificationCase {
    const invalidRules =
      HUMAN_LIFE_PHASE_EVIDENCE_RULES
        .flatMap(
          (rule) =>
            rule.weights.map(
              (weightRule) => ({
                id: rule.id,

                phase:
                  weightRule.phase,

                daeunWeight:
                  weightRule.daeunWeight,

                seunWeight:
                  weightRule.seunWeight,

                reason:
                  weightRule.reason,
              }),
            ),
        )
        .filter(
          (item) =>
            item.daeunWeight <= 0 ||
            item.seunWeight <= 0 ||
            item.reason.trim().length ===
              0,
        );

    return createCase(
      "rule weights and reasons are valid",
      invalidRules.length === 0,
      `invalid=${
        invalidRules
          .map(
            (item) =>
              `${item.id}:${item.phase}`,
          )
          .join("|") ||
        "none"
      }`,
    );
  }

  function verifyLuckFlowBuildsEvidence():
    HumanLifePhaseEvidenceBuilderVerificationCase {
    const input =
      buildHumanLifePhaseReaderInput(
        buildFacts(),
      );

    const daeunEvidence =
      input.evidence.filter(
        (item) =>
          item.source === "daeun",
      );

    const seunEvidence =
      input.evidence.filter(
        (item) =>
          item.source === "seun",
      );

    const passed =
      input.currentAge === 8 &&
      daeunEvidence.length === 2 &&
      seunEvidence.length === 2 &&
      input.evidence.every(
        (item) =>
          item.weight > 0 &&
          item.description.trim().length >
            0,
      );

    return createCase(
      "luck flow builds life phase evidence",
      passed,
      [
        `currentAge=${input.currentAge}`,
        `daeun=${daeunEvidence.length}`,
        `seun=${seunEvidence.length}`,
        `total=${input.evidence.length}`,
      ].join(", "),
    );
  }

  function verifyExpectedFlowMeanings():
    HumanLifePhaseEvidenceBuilderVerificationCase {
    const input =
      buildHumanLifePhaseReaderInput(
        buildFacts(),
      );

    const daeunTransition =
      input.evidence.find(
        (item) =>
          item.source === "daeun" &&
          item.phase ===
            "transition",
      );

    const daeunGrowth =
      input.evidence.find(
        (item) =>
          item.source === "daeun" &&
          item.phase === "growth",
      );

    const seunGrowth =
      input.evidence.find(
        (item) =>
          item.source === "seun" &&
          item.phase === "growth",
      );

    const seunHarvest =
      input.evidence.find(
        (item) =>
          item.source === "seun" &&
          item.phase === "harvest",
      );

    const passed =
      daeunTransition?.weight === 4 &&
      daeunGrowth?.weight === 1 &&
      seunGrowth?.weight === 2 &&
      seunHarvest?.weight === 1 &&
      daeunTransition.description
        .includes("상관") &&
      seunGrowth.description
        .includes("식신");

    return createCase(
      "expected daeun and seun meanings",
      passed,
      [
        `daeunTransition=${
          daeunTransition?.weight ??
          "missing"
        }`,
        `daeunGrowth=${
          daeunGrowth?.weight ??
          "missing"
        }`,
        `seunGrowth=${
          seunGrowth?.weight ??
          "missing"
        }`,
        `seunHarvest=${
          seunHarvest?.weight ??
          "missing"
        }`,
      ].join(", "),
    );
  }

  function verifyNoTopScoreTie():
    HumanLifePhaseEvidenceBuilderVerificationCase {
    const input =
      buildHumanLifePhaseReaderInput(
        buildFacts(),
      );

    const scores =
      scoreHumanLifePhases(input);

    const first = scores[0];

    const second = scores[1];

    const passed =
      first.phase === "transition" &&
      first.finalScore === 4 &&
      second.finalScore === 3 &&
      first.finalScore >
        second.finalScore;

    return createCase(
      "long-term flow wins without tie bias",
      passed,
      [
        `first=${first.phase}:${
          first.finalScore
        }`,
        `second=${second.phase}:${
          second.finalScore
        }`,
      ].join(", "),
    );
  }

  function verifyPreDaeunUsesSeunOnly():
    HumanLifePhaseEvidenceBuilderVerificationCase {
    const facts =
      buildFacts({
        ...pipelineInput,

        referenceDate: "2019-01-01",
      });

    const input =
      buildHumanLifePhaseReaderInput(
        facts,
      );

    const daeunEvidence =
      input.evidence.filter(
        (item) =>
          item.source === "daeun",
      );

    const seunEvidence =
      input.evidence.filter(
        (item) =>
          item.source === "seun",
      );

    const passed =
      facts.luckFlow.currentDaeun ===
        null &&
      daeunEvidence.length === 0 &&
      seunEvidence.length === 2 &&
      input.evidence.length === 2;

    return createCase(
      "pre-daeun uses seun evidence only",
      passed,
      [
        `currentDaeun=${
          facts.luckFlow.currentDaeun ===
          null
            ? "null"
            : facts.luckFlow.currentDaeun
                .ganZhi
        }`,
        `daeun=${daeunEvidence.length}`,
        `seun=${seunEvidence.length}`,
      ].join(", "),
    );
  }

  function verifyNoPlaceholderEvidence():
    HumanLifePhaseEvidenceBuilderVerificationCase {
    const input =
      buildHumanLifePhaseReaderInput(
        buildFacts(),
      );

    const prohibited = [
      "계산 확인 필요",

      "시간 모름",

      "TODO",

      "Placeholder",
    ];

    const invalid =
      input.evidence.filter(
        (item) =>
          prohibited.some(
            (expression) =>
              item.description.includes(
                expression,
              ),
          ),
      );

    return createCase(
      "evidence contains no placeholder",
      invalid.length === 0,
      `invalid=${
        invalid
          .map(
            (item) =>
              `${item.source}:${item.phase}`,
          )
          .join("|") ||
        "none"
      }`,
    );
  }

  function verifyMasterReaderBundleBuildsLifePhase():
    HumanLifePhaseEvidenceBuilderVerificationCase {
    const facts = buildFacts();

    const direct =
      buildHumanLifePhaseReaderInput(
        facts,
      );

    const bundle =
      buildMasterReaderEvidenceBundle({
        facts,
      });

    const passed =
      bundle.lifePhaseInput
        .currentAge ===
        direct.currentAge &&
      bundle.lifePhaseInput
        .evidence.length ===
        direct.evidence.length &&
      bundle.lifePhaseInput
        .evidence.every(
          (item, index) => {
            const directItem =
              direct.evidence[index];

            return (
              directItem !== undefined &&
              item.phase ===
                directItem.phase &&
              item.source ===
                directItem.source &&
              item.weight ===
                directItem.weight &&
              item.description ===
                directItem.description
            );
          },
        );

    return createCase(
      "master reader bundle builds life phase input",
      passed,
      [
        `currentAge=${
          bundle.lifePhaseInput
            .currentAge
        }`,
        `evidence=${
          bundle.lifePhaseInput
            .evidence.length
        }`,
      ].join(", "),
    );
  }

  export function verifyHumanLifePhaseEvidenceBuilder():
    HumanLifePhaseEvidenceBuilderVerificationResult {
    const cases = [
      verifyAllTenGodRulesExist(),

      verifyRuleWeightsAreValid(),

      verifyLuckFlowBuildsEvidence(),

      verifyExpectedFlowMeanings(),

      verifyNoTopScoreTie(),

      verifyPreDaeunUsesSeunOnly(),

      verifyNoPlaceholderEvidence(),

      verifyMasterReaderBundleBuildsLifePhase(),
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
