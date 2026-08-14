import {
  calculateCrossPersonSajuInteractions,
} from "../../calculators/sajuInteractionCalculator";
import type {
  SajuElementDistribution,
  SajuFacts,
  SajuFiveElement,
  SajuInteractionFact,
  SajuPillarFact,
  SajuPillarPosition,
} from "../../types/sajuFacts";
import type {
  CounterpartSajuCalculation,
  CounterpartSajuCalculationPrecision,
} from "./counterpartSajuCalculationBuilder";

export type CompatibilityAssessmentSignal = {
  source:
    | "interaction"
    | "dayMasterRelation"
    | "elementBalance"
    | "elementComplement";

  key:
    string;

  description:
    string;

  weight:
    number;
};

export type DayMasterElementRelation =
  | "same"
  | "selfGeneratesCounterpart"
  | "counterpartGeneratesSelf"
  | "selfControlsCounterpart"
  | "counterpartControlsSelf";

export type FullCompatibilityOverallLevel =
  | "supportive"
  | "mixed"
  | "caution";

export type ElementDistributionWithRatio = {
  distribution:
    SajuElementDistribution;

  ratios:
    SajuElementDistribution;

  totalCharacters:
    number;
};

export type FullCompatibilityInteractionCounts = {
  combination:
    number;

  clash:
    number;

  punishment:
    number;

  break:
    number;

  harm:
    number;
};

export type FullCompatibilityAssessment = {
  available:
    boolean;

  precision:
    CounterpartSajuCalculationPrecision | null;

  calculationBasis:
    "crossPillarComparison" | null;

  analysisScope:
    "fullCompatibility" | null;

  counterpartSource:
    CounterpartSajuCalculation["source"] | null;

  comparedSelfPillars:
    SajuPillarFact[];

  comparedCounterpartPillars:
    SajuPillarFact[];

  selfDayMaster:
    string | null;

  counterpartDayMaster:
    string | null;

  dayMasterElementRelation:
    DayMasterElementRelation | null;

  selfElementDistribution:
    ElementDistributionWithRatio | null;

  counterpartElementDistribution:
    ElementDistributionWithRatio | null;

  complementaryElements:
    SajuFiveElement[];

  sharedDominantElements:
    SajuFiveElement[];

  overConcentrationSignals:
    CompatibilityAssessmentSignal[];

  interactionFacts:
    SajuInteractionFact[];

  interactionCounts:
    FullCompatibilityInteractionCounts;

  supportiveSignals:
    CompatibilityAssessmentSignal[];

  cautionSignals:
    CompatibilityAssessmentSignal[];

  supportScore:
    number;

  cautionScore:
    number;

  overallLevel:
    FullCompatibilityOverallLevel | null;

  limitations:
    string[];
};

export type FullCompatibilityAssessmentInput = {
  selfSajuFacts?:
    SajuFacts;

  counterpartSaju?:
    CounterpartSajuCalculation;
};

const STEM_ELEMENT_MAP:
  Record<string, SajuFiveElement> = {
    甲: "wood",
    乙: "wood",
    丙: "fire",
    丁: "fire",
    戊: "earth",
    己: "earth",
    庚: "metal",
    辛: "metal",
    壬: "water",
    癸: "water",
    갑: "wood",
    을: "wood",
    병: "fire",
    정: "fire",
    무: "earth",
    기: "earth",
    경: "metal",
    신: "metal",
    임: "water",
    계: "water",
  };

const BRANCH_ELEMENT_MAP:
  Record<string, SajuFiveElement> = {
    寅: "wood",
    卯: "wood",
    巳: "fire",
    午: "fire",
    丑: "earth",
    辰: "earth",
    未: "earth",
    戌: "earth",
    申: "metal",
    酉: "metal",
    亥: "water",
    子: "water",
    인: "wood",
    묘: "wood",
    사: "fire",
    오: "fire",
    축: "earth",
    진: "earth",
    미: "earth",
    술: "earth",
    신: "metal",
    유: "metal",
    해: "water",
    자: "water",
  };

const ELEMENT_GENERATES:
  Record<SajuFiveElement, SajuFiveElement> = {
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water",
    water: "wood",
  };

const ELEMENT_CONTROLS:
  Record<SajuFiveElement, SajuFiveElement> = {
    wood: "earth",
    earth: "water",
    water: "fire",
    fire: "metal",
    metal: "wood",
  };

const EMPTY_DISTRIBUTION:
  SajuElementDistribution = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

const EMPTY_INTERACTION_COUNTS:
  FullCompatibilityInteractionCounts = {
    combination: 0,
    clash: 0,
    punishment: 0,
    break: 0,
    harm: 0,
  };

function buildUnavailableAssessment():
  FullCompatibilityAssessment {
  return {
    available:
      false,

    precision:
      null,

    calculationBasis:
      null,

    analysisScope:
      null,

    counterpartSource:
      null,

    comparedSelfPillars:
      [],

    comparedCounterpartPillars:
      [],

    selfDayMaster:
      null,

    counterpartDayMaster:
      null,

    dayMasterElementRelation:
      null,

    selfElementDistribution:
      null,

    counterpartElementDistribution:
      null,

    complementaryElements:
      [],

    sharedDominantElements:
      [],

    overConcentrationSignals:
      [],

    interactionFacts:
      [],

    interactionCounts:
      EMPTY_INTERACTION_COUNTS,

    supportiveSignals:
      [],

    cautionSignals:
      [],

    supportScore:
      0,

    cautionScore:
      0,

    overallLevel:
      null,

    limitations:
      [],
  };
}

function buildPillarFact(
  position:
    SajuPillarPosition,
  ganZhi:
    string,
): SajuPillarFact {
  return {
    position,

    ganZhi,

    heavenlyStem:
      ganZhi.charAt(0),

    earthlyBranch:
      ganZhi.charAt(1),
  };
}

function buildCounterpartPillars(
  counterpartSaju:
    CounterpartSajuCalculation,
): SajuPillarFact[] {
  const {
    calculated,
    precision,
  } = counterpartSaju;

  const pillars: SajuPillarFact[] = [
    buildPillarFact(
      "year",
      calculated.yearGanZhi,
    ),
    buildPillarFact(
      "month",
      calculated.monthGanZhi,
    ),
    buildPillarFact(
      "day",
      calculated.dayGanZhi,
    ),
  ];

  if (
    precision
    === "full"
    && calculated.timeGanZhi
  ) {
    pillars.push(
      buildPillarFact(
        "time",
        calculated.timeGanZhi,
      ),
    );
  }

  return pillars;
}

function resolveCharacterElement(
  character:
    string,
): SajuFiveElement | null {
  return (
    STEM_ELEMENT_MAP[character]
    ?? BRANCH_ELEMENT_MAP[character]
    ?? null
  );
}

export function calculateElementDistributionFromPillars(
  pillars:
    SajuPillarFact[],
): ElementDistributionWithRatio {
  const distribution: SajuElementDistribution = {
    ...EMPTY_DISTRIBUTION,
  };

  let totalCharacters = 0;

  for (
    const pillar
    of pillars
  ) {
    for (
      const character
      of [
        pillar.heavenlyStem,
        pillar.earthlyBranch,
      ]
    ) {
      const element =
        resolveCharacterElement(
          character,
        );

      if (
        !element
      ) {
        continue;
      }

      distribution[element]
        += 1;

      totalCharacters
        += 1;
    }
  }

  const ratios: SajuElementDistribution = {
    ...EMPTY_DISTRIBUTION,
  };

  if (
    totalCharacters
    > 0
  ) {
    for (
      const element
      of Object.keys(
        distribution,
      ) as SajuFiveElement[]
    ) {
      ratios[element] =
        distribution[element]
        / totalCharacters;
    }
  }

  return {
    distribution,
    ratios,
    totalCharacters,
  };
}

export function resolveStemElement(
  stem:
    string,
): SajuFiveElement | null {
  return (
    STEM_ELEMENT_MAP[stem]
    ?? null
  );
}

export function resolveDayMasterElementRelation(
  selfElement:
    SajuFiveElement,
  counterpartElement:
    SajuFiveElement,
): DayMasterElementRelation {
  if (
    selfElement
    === counterpartElement
  ) {
    return "same";
  }

  if (
    ELEMENT_GENERATES[selfElement]
    === counterpartElement
  ) {
    return "selfGeneratesCounterpart";
  }

  if (
    ELEMENT_GENERATES[counterpartElement]
    === selfElement
  ) {
    return "counterpartGeneratesSelf";
  }

  if (
    ELEMENT_CONTROLS[selfElement]
    === counterpartElement
  ) {
    return "selfControlsCounterpart";
  }

  return "counterpartControlsSelf";
}

function countInteractionType(
  interactionFacts:
    SajuInteractionFact[],
  type:
    SajuInteractionFact["type"],
): number {
  return interactionFacts.filter(
    (fact) =>
      fact.type
      === type,
  ).length;
}

function findDominantElements(
  distribution:
    ElementDistributionWithRatio,
): SajuFiveElement[] {
  const counts =
    Object.entries(
      distribution.distribution,
    ) as [
      SajuFiveElement,
      number,
    ][];

  const maxCount =
    Math.max(
      ...counts.map(
        ([, count]) =>
          count,
      ),
    );

  if (
    maxCount
    <= 0
  ) {
    return [];
  }

  return counts
    .filter(
      ([, count]) =>
        count
        === maxCount,
    )
    .map(
      ([element]) =>
        element,
    );
}

function findWeakestElements(
  distribution:
    ElementDistributionWithRatio,
): SajuFiveElement[] {
  const counts =
    Object.entries(
      distribution.distribution,
    ) as [
      SajuFiveElement,
      number,
    ][];

  const minCount =
    Math.min(
      ...counts.map(
        ([, count]) =>
          count,
      ),
    );

  return counts
    .filter(
      ([, count]) =>
        count
        === minCount,
    )
    .map(
      ([element]) =>
        element,
    );
}

function buildInteractionSignals(
  interactionCounts:
    FullCompatibilityInteractionCounts,
): {
  supportiveSignals:
    CompatibilityAssessmentSignal[];

  cautionSignals:
    CompatibilityAssessmentSignal[];

  supportScore:
    number;

  cautionScore:
    number;
} {
  const supportiveSignals:
    CompatibilityAssessmentSignal[] = [];

  const cautionSignals:
    CompatibilityAssessmentSignal[] = [];

  let supportScore = 0;
  let cautionScore = 0;

  if (
    interactionCounts.combination
    > 0
  ) {
    const weight =
      interactionCounts.combination
      * 2;

    supportScore
      += weight;

    supportiveSignals.push({
      source:
        "interaction",

      key:
        "combination",

      description:
        `기둥 교차 합(combination) ${interactionCounts.combination}건`,

      weight,
    });
  }

  if (
    interactionCounts.clash
    > 0
  ) {
    const weight =
      interactionCounts.clash
      * 3;

    cautionScore
      += weight;

    cautionSignals.push({
      source:
        "interaction",

      key:
        "clash",

      description:
        `기둥 교차 충(clash) ${interactionCounts.clash}건`,

      weight,
    });
  }

  if (
    interactionCounts.punishment
    > 0
  ) {
    const weight =
      interactionCounts.punishment
      * 2;

    cautionScore
      += weight;

    cautionSignals.push({
      source:
        "interaction",

      key:
        "punishment",

      description:
        `기둥 교차 형(punishment) ${interactionCounts.punishment}건`,

      weight,
    });
  }

  if (
    interactionCounts.harm
    > 0
  ) {
    const weight =
      interactionCounts.harm
      * 2;

    cautionScore
      += weight;

    cautionSignals.push({
      source:
        "interaction",

      key:
        "harm",

      description:
        `기둥 교차 해(harm) ${interactionCounts.harm}건`,

      weight,
    });
  }

  if (
    interactionCounts.break
    > 0
  ) {
    const weight =
      interactionCounts.break
      * 1;

    cautionScore
      += weight;

    cautionSignals.push({
      source:
        "interaction",

      key:
        "break",

      description:
        `기둥 교차 파(break) ${interactionCounts.break}건`,

      weight,
    });
  }

  return {
    supportiveSignals,
    cautionSignals,
    supportScore,
    cautionScore,
  };
}

export function resolveFullCompatibilityOverallLevel(
  supportScore:
    number,
  cautionScore:
    number,
): FullCompatibilityOverallLevel {
  if (
    supportScore
    - cautionScore
    >= 3
  ) {
    return "supportive";
  }

  if (
    cautionScore
    - supportScore
    >= 3
  ) {
    return "caution";
  }

  return "mixed";
}

export function calculateFullCompatibilityScores(input: {
  dayMasterElementRelation:
    DayMasterElementRelation | null;

  interactionCounts:
    FullCompatibilityInteractionCounts;

  selfElementDistribution:
    ElementDistributionWithRatio | null;

  counterpartElementDistribution:
    ElementDistributionWithRatio | null;
}): {
  supportiveSignals:
    CompatibilityAssessmentSignal[];

  cautionSignals:
    CompatibilityAssessmentSignal[];

  supportScore:
    number;

  cautionScore:
    number;

  complementaryElements:
    SajuFiveElement[];

  sharedDominantElements:
    SajuFiveElement[];

  overConcentrationSignals:
    CompatibilityAssessmentSignal[];
} {
  const interactionResult =
    buildInteractionSignals(
      input.interactionCounts,
    );

  const supportiveSignals = [
    ...interactionResult.supportiveSignals,
  ];

  const cautionSignals = [
    ...interactionResult.cautionSignals,
  ];

  let supportScore =
    interactionResult.supportScore;

  let cautionScore =
    interactionResult.cautionScore;

  const complementaryElements:
    SajuFiveElement[] = [];

  const sharedDominantElements:
    SajuFiveElement[] = [];

  const overConcentrationSignals:
    CompatibilityAssessmentSignal[] = [];

  if (
    input.dayMasterElementRelation
  ) {
    switch (
      input.dayMasterElementRelation
    ) {
      case "counterpartGeneratesSelf": {
        supportScore
          += 2;

        supportiveSignals.push({
          source:
            "dayMasterRelation",

          key:
            "counterpartGeneratesSelf",

          description:
            "상대방 일간 오행이 본인 일간 오행을 생한다.",

          weight:
            2,
        });

        break;
      }

      case "selfGeneratesCounterpart": {
        supportScore
          += 1;

        supportiveSignals.push({
          source:
            "dayMasterRelation",

          key:
            "selfGeneratesCounterpart",

          description:
            "본인 일간 오행이 상대방 일간 오행을 생한다.",

          weight:
            1,
        });

        break;
      }

      case "same": {
        supportiveSignals.push({
          source:
            "dayMasterRelation",

          key:
            "sameDayMasterElement",

          description:
            "본인과 상대방 일간 오행이 같다.",

          weight:
            0,
        });

        break;
      }

      case "selfControlsCounterpart":
      case "counterpartControlsSelf": {
        cautionScore
          += 2;

        cautionSignals.push({
          source:
            "dayMasterRelation",

          key:
            input.dayMasterElementRelation,

          description:
            "본인과 상대방 일간 오행이 상극 관계다.",

          weight:
            2,
        });

        break;
      }
    }
  }

  if (
    input.selfElementDistribution
    && input.counterpartElementDistribution
  ) {
    const selfWeakest =
      findWeakestElements(
        input.selfElementDistribution,
      );

    for (
      const element
      of selfWeakest
    ) {
      if (
        input.counterpartElementDistribution
          .distribution[element]
        > input.selfElementDistribution
          .distribution[element]
      ) {
        complementaryElements.push(
          element,
        );

        supportScore
          += 1;

        supportiveSignals.push({
          source:
            "elementComplement",

          key:
            `complement-${element}`,

          description:
            `상대방이 본인의 약한 ${element} 오행을 보완한다.`,

          weight:
            1,
        });
      }
    }

    const selfDominant =
      findDominantElements(
        input.selfElementDistribution,
      );

    const counterpartDominant =
      findDominantElements(
        input.counterpartElementDistribution,
      );

    for (
      const element
      of selfDominant
    ) {
      if (
        counterpartDominant.includes(
          element,
        )
        && input.selfElementDistribution.ratios[element]
          >= 0.25
        && input.counterpartElementDistribution.ratios[element]
          >= 0.25
      ) {
        sharedDominantElements.push(
          element,
        );

        cautionScore
          += 1;

        const signal: CompatibilityAssessmentSignal = {
          source:
            "elementBalance",

          key:
            `overConcentration-${element}`,

          description:
            `본인과 상대방 모두 ${element} 오행이 과하게 집중되어 있다.`,

          weight:
            1,
        };

        cautionSignals.push(
          signal,
        );

        overConcentrationSignals.push(
          signal,
        );
      }
    }
  }

  return {
    supportiveSignals,
    cautionSignals,
    supportScore,
    cautionScore,
    complementaryElements,
    sharedDominantElements,
    overConcentrationSignals,
  };
}

/**
 * 본인 SajuFacts와 상대방 원국을 교차 비교해
 * 정식 full compatibility 판단을 구조화한다.
 */
export function assessFullCompatibility(
  input:
    FullCompatibilityAssessmentInput,
): FullCompatibilityAssessment {
  const {
    selfSajuFacts,
    counterpartSaju,
  } = input;

  if (
    !selfSajuFacts
    || !counterpartSaju
  ) {
    return buildUnavailableAssessment();
  }

  const comparedSelfPillars =
    selfSajuFacts.pillars;

  const comparedCounterpartPillars =
    buildCounterpartPillars(
      counterpartSaju,
    );

  const interactionFacts =
    calculateCrossPersonSajuInteractions(
      comparedSelfPillars,
      comparedCounterpartPillars,
    );

  const interactionCounts: FullCompatibilityInteractionCounts = {
    combination:
      countInteractionType(
        interactionFacts,
        "combination",
      ),

    clash:
      countInteractionType(
        interactionFacts,
        "clash",
      ),

    punishment:
      countInteractionType(
        interactionFacts,
        "punishment",
      ),

    break:
      countInteractionType(
        interactionFacts,
        "break",
      ),

    harm:
      countInteractionType(
        interactionFacts,
        "harm",
      ),
  };

  const selfElementDistribution =
    calculateElementDistributionFromPillars(
      comparedSelfPillars,
    );

  const counterpartElementDistribution =
    calculateElementDistributionFromPillars(
      comparedCounterpartPillars,
    );

  const selfDayMasterElement =
    resolveStemElement(
      selfSajuFacts.dayMaster,
    );

  const counterpartDayMasterElement =
    resolveStemElement(
      counterpartSaju
        .calculated
        .dayMaster,
    );

  const dayMasterElementRelation =
    selfDayMasterElement
    && counterpartDayMasterElement
      ? resolveDayMasterElementRelation(
          selfDayMasterElement,
          counterpartDayMasterElement,
        )
      : null;

  const scoreResult =
    calculateFullCompatibilityScores({
      dayMasterElementRelation,
      interactionCounts,
      selfElementDistribution,
      counterpartElementDistribution,
    });

  const overallLevel =
    resolveFullCompatibilityOverallLevel(
      scoreResult.supportScore,
      scoreResult.cautionScore,
    );

  const limitations: string[] = [];

  if (
    counterpartSaju.precision
    === "dateOnly"
  ) {
    limitations.push(
      "상대방 출생시간이 없어 시주 궁합은 포함하지 않았다.",
    );

    limitations.push(
      "dateOnly 계산은 연·월·일주 6글자만 사용했으며 내부 기준시각 12:00 가짜 시주는 사용하지 않았다.",
    );
  }

  if (
    !comparedSelfPillars.some(
      (pillar) =>
        pillar.position
        === "time",
    )
  ) {
    limitations.push(
      "본인 시주가 비교 대상에 없으면 시주 궁합은 포함하지 않았다.",
    );
  }

  return {
    available:
      true,

    precision:
      counterpartSaju.precision,

    calculationBasis:
      "crossPillarComparison",

    analysisScope:
      "fullCompatibility",

    counterpartSource:
      counterpartSaju.source,

    comparedSelfPillars,

    comparedCounterpartPillars,

    selfDayMaster:
      selfSajuFacts.dayMaster,

    counterpartDayMaster:
      counterpartSaju
        .calculated
        .dayMaster,

    dayMasterElementRelation,

    selfElementDistribution,

    counterpartElementDistribution,

    complementaryElements:
      scoreResult.complementaryElements,

    sharedDominantElements:
      scoreResult.sharedDominantElements,

    overConcentrationSignals:
      scoreResult.overConcentrationSignals,

    interactionFacts,

    interactionCounts,

    supportiveSignals:
      scoreResult.supportiveSignals,

    cautionSignals:
      scoreResult.cautionSignals,

    supportScore:
      scoreResult.supportScore,

    cautionScore:
      scoreResult.cautionScore,

    overallLevel,

    limitations,
  };
}
