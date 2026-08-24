import type {
    HumanLifePhaseEvidence,
    HumanLifePhaseEvidenceSource,
    HumanLifePhaseReaderInput,
  } from "../masterReader/types/humanLifePhaseEvidence.js";

  import {
    getHumanLifePhaseEvidenceRule,
    getHumanLifePhaseEvidenceWeight,
    type HumanLifePhaseFlowScope,
  } from "../masterReader/rules/humanLifePhaseEvidenceRules.js";

  import type {
    SajuCurrentDaeunFact,
    SajuCurrentSeunFact,
    SajuLuckFlowTenGod,
  } from "../types/luckFlowFact.js";

  import type {
    SajuFacts,
  } from "../types/sajuFacts.js";

  type FlowEvidenceParams = {
    scope: HumanLifePhaseFlowScope;

    source: HumanLifePhaseEvidenceSource;

    ganZhi: string;

    tenGod: SajuLuckFlowTenGod;

    periodDescription: string;
  };

  function buildFlowEvidence(
    params: FlowEvidenceParams,
  ): HumanLifePhaseEvidence[] {
    const {
      scope,
      source,
      ganZhi,
      tenGod,
      periodDescription,
    } = params;

    const rule =
      getHumanLifePhaseEvidenceRule(
        tenGod,
      );

    return rule.weights.map(
      (weightRule): HumanLifePhaseEvidence => ({
        phase: weightRule.phase,

        source,

        description:
          `${periodDescription} ${ganZhi}의 ` +
          `${tenGod} 흐름이 확인되었다. ` +
          weightRule.reason,

        weight:
          getHumanLifePhaseEvidenceWeight(
            weightRule,
            scope,
          ),
      }),
    );
  }

  function buildDaeunEvidence(
    daeun: SajuCurrentDaeunFact,
  ): HumanLifePhaseEvidence[] {
    return buildFlowEvidence({
      scope: "daeun",

      source: "daeun",

      ganZhi: daeun.ganZhi,

      tenGod: daeun.tenGod,

      periodDescription:
        `현재 대운 ${daeun.startYear}년부터 ` +
        `${daeun.endYear}년까지`,
    });
  }

  function buildSeunEvidence(
    seun: SajuCurrentSeunFact,
  ): HumanLifePhaseEvidence[] {
    return buildFlowEvidence({
      scope: "seun",

      source: "seun",

      ganZhi: seun.ganZhi,

      tenGod: seun.tenGod,

      periodDescription:
        `현재 세운 ${seun.year}년`,
    });
  }

  export function buildHumanLifePhaseReaderInput(
    facts: SajuFacts,
  ): HumanLifePhaseReaderInput {
    const evidence:
      HumanLifePhaseEvidence[] = [];

    if (facts.luckFlow.currentDaeun) {
      evidence.push(
        ...buildDaeunEvidence(
          facts.luckFlow.currentDaeun,
        ),
      );
    }

    evidence.push(
      ...buildSeunEvidence(
        facts.luckFlow.currentSeun,
      ),
    );

    if (evidence.length === 0) {
      throw new Error(
        "Human life phase evidence could not be built from saju facts.",
      );
    }

    if (
      evidence.some(
        (item) =>
          item.weight <= 0 ||
          item.description.trim().length ===
            0,
      )
    ) {
      throw new Error(
        "Human life phase evidence must contain a positive weight and description.",
      );
    }

    return {
      currentAge:
        facts.luckFlow.currentAge,

      evidence,
    };
  }
