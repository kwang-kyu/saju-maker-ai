import {
  comparePillars,
} from "../../calculators/sajuInteractionCalculator.js";
import type {
  SajuTargetPeriodLuckFlowFact,
} from "../../types/luckFlowFact.js";
import type {
  SajuEvidenceStrength,
  SajuInteractionFact,
  SajuPillarFact,
  SajuPillarPosition,
} from "../../types/sajuFacts.js";
import type {
  LifeFlowTarget,
} from "../question/lifeFlowTarget.js";

export type LifeFlowTargetFlow =
  | "daeun"
  | "seun"
  | "wolun"
  | "ilun"
  | "yearSegment";

export type LifeFlowPeriodFlowPillar = {
  key:
    string;

  targetFlow:
    LifeFlowTargetFlow;

  flowLabel:
    string;

  ganZhi:
    string;

  heavenlyStem:
    string;

  earthlyBranch:
    string;
};

export type LifeFlowPeriodInteraction = {
  type:
    SajuInteractionFact["type"];

  targetFlow:
    LifeFlowTargetFlow;

  targetFlowKey:
    string;

  targetFlowLabel:
    string;

  natalPillarPosition:
    SajuPillarPosition;

  targets:
    string[];

  strength:
    SajuEvidenceStrength;

  description:
    string;
};

const FLOW_PILLAR_POSITION:
  SajuPillarFact["position"] =
  "month";

const FLOW_LABELS:
  Record<
    LifeFlowTargetFlow,
    string
  > = {
  daeun:
    "대운",

  seun:
    "세운",

  wolun:
    "월운",

  ilun:
    "일운",

  yearSegment:
    "연운",
};

const STEM_NORMALIZATION:
  Record<
    string,
    string
  > = {
  甲: "갑",
  乙: "을",
  丙: "병",
  丁: "정",
  戊: "무",
  己: "기",
  庚: "경",
  辛: "신",
  壬: "임",
  癸: "계",
};

const BRANCH_NORMALIZATION:
  Record<
    string,
    string
  > = {
  子: "자",
  丑: "축",
  寅: "인",
  卯: "묘",
  辰: "진",
  巳: "사",
  午: "오",
  未: "미",
  申: "신",
  酉: "유",
  戌: "술",
  亥: "해",
};

function normalizeFlowCharacter(
  value:
    string,
  normalization:
    Record<
      string,
      string
    >,
): string {
  return (
    normalization[value]
    ?? value
  );
}

function normalizePillarForComparison(
  pillar:
    SajuPillarFact,
): SajuPillarFact {
  const heavenlyStem =
    normalizeFlowCharacter(
      pillar.heavenlyStem,
      STEM_NORMALIZATION,
    );

  const earthlyBranch =
    normalizeFlowCharacter(
      pillar.earthlyBranch,
      BRANCH_NORMALIZATION,
    );

  return {
    ...pillar,

    ganZhi:
      `${heavenlyStem}${earthlyBranch}`,

    heavenlyStem,

    earthlyBranch,
  };
}

function buildFlowPillar(
  periodPillar:
    LifeFlowPeriodFlowPillar,
): SajuPillarFact {
  const heavenlyStem =
    normalizeFlowCharacter(
      periodPillar.heavenlyStem,
      STEM_NORMALIZATION,
    );

  const earthlyBranch =
    normalizeFlowCharacter(
      periodPillar.earthlyBranch,
      BRANCH_NORMALIZATION,
    );

  return {
    position:
      FLOW_PILLAR_POSITION,

    ganZhi:
      `${heavenlyStem}${earthlyBranch}`,

    heavenlyStem,

    earthlyBranch,
  };
}

export function buildPeriodFlowPillarsFromFact(
  fact:
    SajuTargetPeriodLuckFlowFact,
  target:
    LifeFlowTarget,
): LifeFlowPeriodFlowPillar[] {
  const pillars:
    LifeFlowPeriodFlowPillar[] =
    [];

  if (
    fact.currentDaeun
  ) {
    pillars.push({
      key:
        "daeun",

      targetFlow:
        "daeun",

      flowLabel:
        FLOW_LABELS.daeun,

      ganZhi:
        fact
          .currentDaeun
          .ganZhi,

      heavenlyStem:
        fact
          .currentDaeun
          .heavenlyStem,

      earthlyBranch:
        fact
          .currentDaeun
          .earthlyBranch,
    });
  }

  pillars.push({
    key:
      "seun",

    targetFlow:
      "seun",

    flowLabel:
      FLOW_LABELS.seun,

    ganZhi:
      fact
        .targetSeun
        .ganZhi,

    heavenlyStem:
      fact
        .targetSeun
        .heavenlyStem,

    earthlyBranch:
      fact
        .targetSeun
        .earthlyBranch,
  });

  if (
    target.scope
    === "month"
    || target.scope
    === "halfYear"
  ) {
    for (
      const [
        index,
        segment,
      ] of fact
        .wolunSegments
        .entries()
    ) {
      pillars.push({
        key:
          `wolun-${index + 1}`,

        targetFlow:
          "wolun",

        flowLabel:
          FLOW_LABELS.wolun,

        ganZhi:
          segment.ganZhi,

        heavenlyStem:
          segment.heavenlyStem,

        earthlyBranch:
          segment.earthlyBranch,
      });
    }
  }

  if (
    target.scope
    === "day"
    && fact.targetIlun
  ) {
    pillars.push({
      key:
        "ilun",

      targetFlow:
        "ilun",

      flowLabel:
        FLOW_LABELS.ilun,

      ganZhi:
        fact
          .targetIlun
          .ganZhi,

      heavenlyStem:
        fact
          .targetIlun
          .heavenlyStem,

      earthlyBranch:
        fact
          .targetIlun
          .earthlyBranch,
    });
  }

  if (
    fact
      .yearSegments
      .length
    > 1
  ) {
    for (
      const [
        index,
        segment,
      ] of fact
        .yearSegments
        .entries()
    ) {
      pillars.push({
        key:
          `year-${index + 1}`,

        targetFlow:
          "yearSegment",

        flowLabel:
          FLOW_LABELS.yearSegment,

        ganZhi:
          segment.ganZhi,

        heavenlyStem:
          segment.heavenlyStem,

        earthlyBranch:
          segment.earthlyBranch,
      });
    }
  }

  return pillars;
}

export function assessLifeFlowPeriodInteractions(
  natalPillars:
    readonly SajuPillarFact[],
  periodPillars:
    readonly LifeFlowPeriodFlowPillar[],
): LifeFlowPeriodInteraction[] {
  const interactions:
    LifeFlowPeriodInteraction[] =
    [];

  for (
    const periodPillar
    of periodPillars
  ) {
    const flowPillar =
      buildFlowPillar(
        periodPillar,
      );

    for (
      const natalPillar
      of natalPillars
    ) {
      const facts =
        comparePillars(
          normalizePillarForComparison(
            natalPillar,
          ),
          flowPillar,
          {
            secondOwner:
              periodPillar.flowLabel,
          },
        );

      for (
        const fact
        of facts
      ) {
        interactions.push({
          type:
            fact.type,

          targetFlow:
            periodPillar.targetFlow,

          targetFlowKey:
            periodPillar.key,

          targetFlowLabel:
            periodPillar.flowLabel,

          natalPillarPosition:
            natalPillar.position,

          targets:
            fact.targets,

          strength:
            fact.strength,

          description:
            fact.description,
        });
      }
    }
  }

  return interactions;
}

export function interactionStrengthWeight(
  strength:
    SajuEvidenceStrength,
): number {
  switch (
    strength
  ) {
    case "strong":
      return 3;

    case "medium":
      return 2;

    case "weak":
      return 1;
  }
}
