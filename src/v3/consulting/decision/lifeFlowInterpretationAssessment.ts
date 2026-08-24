import {
  getHumanLifePhaseEvidenceRule,
} from "../../masterReader/rules/humanLifePhaseEvidenceRules.js";
import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext.js";
import type {
  HumanLifePhase,
} from "../../masterReader/types/humanLifePhase.js";
import type {
  SajuLuckFlowTenGod,
  SajuTargetPeriodLuckFlowFact,
  SajuWolunSegmentFact,
} from "../../types/luckFlowFact.js";
import type {
  SajuFacts,
  SajuFiveElement,
  SajuStructureFact,
  SajuStructureSignal,
} from "../../types/sajuFacts.js";
import {
  resolveDayMasterElementRelation,
  resolveStemElement,
} from "./fullCompatibilityAssessment.js";
import {
  assessLifeFlowPeriodInteractions,
  buildPeriodFlowPillarsFromFact,
  interactionStrengthWeight,
  type LifeFlowPeriodInteraction,
} from "./lifeFlowPeriodInteractionAssessment.js";
import type {
  LifeFlowTarget,
} from "../question/lifeFlowTarget.js";

const LUCK_FLOW_TEN_GODS:
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

const ELEMENT_LABELS:
  Record<
    SajuFiveElement,
    string
  > = {
  wood:
    "목(木)",

  fire:
    "화(火)",

  earth:
    "토(土)",

  metal:
    "금(金)",

  water:
    "수(水)",
};

const PILLAR_POSITION_LABELS:
  Record<
    string,
    string
  > = {
  year:
    "년주",

  month:
    "월주",

  day:
    "일주",

  time:
    "시주",
};

const DAY_MASTER_RELATION_LABELS = {
  same:
    "같은 오행",

  selfGeneratesCounterpart:
    "일간이 운 오행을 생",

  counterpartGeneratesSelf:
    "운 오행이 일간을 생",

  selfControlsCounterpart:
    "일간이 운 오행을 극",

  counterpartControlsSelf:
    "운 오행이 일간을 극",
} as const;

const EVIDENCE_FAMILY_ORDER:
  readonly LifeFlowEvidenceFamily[] = [
    "natalBalance",
    "explicitGod",
    "periodInteraction",
    "temporalLayer",
    "currentPhase",
  ];

export type LifeFlowEvidenceFamily =
  | "natalBalance"
  | "explicitGod"
  | "periodInteraction"
  | "temporalLayer"
  | "currentPhase";

export type LifeFlowPeriodLayerRole =
  | "primary"
  | "background";

export type LifeFlowPeriodLayer = {
  flowKey:
    string;

  flowLabel:
    string;

  periodLabel:
    string;

  startDate?:
    string;

  endDate?:
    string;

  ganZhi:
    string;

  heavenlyStem:
    string;

  earthlyBranch:
    string;

  periodTenGod:
    SajuLuckFlowTenGod;

  periodElement:
    SajuFiveElement;

  role:
    LifeFlowPeriodLayerRole;
};

export type LifeFlowSignalContribution = {
  evidenceFamily:
    LifeFlowEvidenceFamily;

  effect:
    | "supportive"
    | "tension"
    | "neutral";

  weight:
    number;

  evidenceKey:
    string;

  sourceKeys:
    string[];

  flowKey:
    string;

  flowLabel:
    string;

  description:
    string;

  preservedContributions?:
    readonly Omit<
      LifeFlowSignalContribution,
      "preservedContributions"
    >[];
};

export type LifeFlowPeriodSegmentInterpretation = {
  key:
    string;

  periodLabel:
    string;

  ganZhi:
    string;

  tenGod:
    SajuLuckFlowTenGod;

  element:
    SajuFiveElement;

  theme:
    string;

  signalContributions:
    LifeFlowSignalContribution[];
};

export type LifeFlowInterpretationAssessment = {
  available:
    boolean;

  target:
    LifeFlowTarget | null;

  overallTheme:
    string;

  supportiveSignals:
    string[];

  tensionSignals:
    string[];

  phaseInterpretation:
    string;

  periodSegments:
    LifeFlowPeriodSegmentInterpretation[];

  periodInteractions:
    LifeFlowPeriodInteraction[];

  signalContributions:
    LifeFlowSignalContribution[];

  cautions:
    string[];

  limitations:
    string[];

  evidenceKeys:
    string[];

  sourceLocked:
    true;
};

type EvidenceFamilySummary = {
  family:
    LifeFlowEvidenceFamily;

  supportive:
    LifeFlowSignalContribution[];

  tension:
    LifeFlowSignalContribution[];

  neutral:
    LifeFlowSignalContribution[];
};

function isSajuLuckFlowTenGod(
  value:
    string,
): value is SajuLuckFlowTenGod {
  return (
    LUCK_FLOW_TEN_GODS as readonly string[]
  ).includes(value);
}

function buildTenGodTheme(
  tenGod:
    SajuLuckFlowTenGod,
  scopeLabel:
    string,
): string {
  const rule =
    getHumanLifePhaseEvidenceRule(
      tenGod,
    );

  const primary =
    rule.weights[0];

  if (
    !primary
  ) {
    return `${scopeLabel} ${tenGod} 흐름이 확인된다.`;
  }

  return `${scopeLabel} ${tenGod}(${primary.phase}) — ${primary.reason}`;
}

function findStructureSignal(
  structureFacts:
    readonly SajuStructureFact[],
  kind:
    SajuStructureSignal["kind"],
): SajuStructureSignal | null {
  for (
    const fact
    of structureFacts
  ) {
    if (
      fact.signal?.kind
      === kind
    ) {
      return fact.signal;
    }
  }

  return null;
}

function findStructureFactByCategory(
  structureFacts:
    readonly SajuStructureFact[],
  category:
    SajuStructureFact["category"],
): SajuStructureFact | null {
  return (
    structureFacts.find(
      (fact) =>
        fact.category
        === category,
    )
    ?? null
  );
}

function strengthToWeight(
  strength:
    SajuStructureFact["strength"],
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

function resolveGodElement(
  god:
    string,
): SajuFiveElement | null {
  const normalized =
    god.trim().toLowerCase();

  if (
    normalized
    === "wood"
    || normalized
    === "목"
  ) {
    return "wood";
  }

  if (
    normalized
    === "fire"
    || normalized
    === "화"
  ) {
    return "fire";
  }

  if (
    normalized
    === "earth"
    || normalized
    === "토"
  ) {
    return "earth";
  }

  if (
    normalized
    === "metal"
    || normalized
    === "금"
  ) {
    return "metal";
  }

  if (
    normalized
    === "water"
    || normalized
    === "수"
  ) {
    return "water";
  }

  return null;
}

function createContribution(
  params:
    Omit<
      LifeFlowSignalContribution,
      "sourceKeys"
    >
    & {
      sourceKeys?:
        string[];
    },
): LifeFlowSignalContribution {
  return {
    ...params,

    sourceKeys:
      params.sourceKeys
      ?? [
        params.evidenceKey,
      ],
  };
}

function assessNatalBalance(
  selfSajuFacts:
    SajuFacts,
  layer:
    LifeFlowPeriodLayer,
): LifeFlowSignalContribution {
  const {
    periodElement,
    periodTenGod,
    flowLabel,
    flowKey,
  } = layer;

  const dayMasterElement =
    resolveStemElement(
      selfSajuFacts.dayMaster,
    );

  const dayMasterStrength =
    findStructureSignal(
      selfSajuFacts
        .structureFacts,
      "dayMasterStrength",
    );

  const monthCommand =
    findStructureSignal(
      selfSajuFacts
        .structureFacts,
      "monthCommand",
    );

  const tenGodStructure =
    findStructureFactByCategory(
      selfSajuFacts
        .structureFacts,
      "tenGodStrength",
    );

  const distribution =
    selfSajuFacts
      .elementDistribution;

  const total =
    Object
      .values(
        distribution,
      )
      .reduce(
        (
          sum,
          count,
        ) =>
          sum + count,
        0,
      );

  const ratio =
    total > 0
      ? distribution[
          periodElement
        ]
        / total
      : 0;

  const distributionSummary =
    `원국 오행 분포(목${distribution.wood}·화${distribution.fire}·토${distribution.earth}·금${distribution.metal}·수${distribution.water})`;

  const relation =
    dayMasterElement
      ? resolveDayMasterElementRelation(
          dayMasterElement,
          periodElement,
        )
      : "same";

  const dominantTenGod =
    tenGodStructure
      ?.signal
      ?.kind
    === "tenGodDominance"
      ? tenGodStructure
        .signal
        .dominantTenGod
      : null;

  const observations:
    string[] = [];

  if (
    dominantTenGod
    && dominantTenGod
    === periodTenGod
  ) {
    observations.push(
      `원국 우세 ${dominantTenGod}과 ${flowLabel} ${periodTenGod}이 같은 기능 축을 활성화한다(관찰).`,
    );
  }

  if (
    monthCommand
    && monthCommand.kind
    === "monthCommand"
    && monthCommand.supported
    === false
  ) {
    observations.push(
      "월령 지원이 약한 원국 구조가 확인된다(관찰).",
    );
  }

  let supportiveWeight =
    0;

  let tensionWeight =
    0;

  const supportiveReasons:
    string[] = [];

  const tensionReasons:
    string[] = [];

  const sourceKeys:
    string[] = [
      "natalBalance",
    ];

  if (
    dayMasterStrength
    && dayMasterStrength.kind
    === "dayMasterStrength"
    && dayMasterElement
  ) {
    sourceKeys.push(
      "dayMasterStrength",
    );

    const baseWeight =
      strengthToWeight(
        dayMasterStrength.type
        === "strong"
          ? "strong"
          : dayMasterStrength.type
          === "weak"
          ? "medium"
          : "weak",
      );

    if (
      dayMasterStrength.type
      === "weak"
    ) {
      if (
        relation
        === "counterpartGeneratesSelf"
        || relation
        === "same"
      ) {
        supportiveWeight =
          Math.max(
            supportiveWeight,
            baseWeight + 1,
          );

        supportiveReasons.push(
          relation
          === "same"
            ? "약한 일간과 같은 오행의 운이 들어와 일간을 생조·보완하여 보완 근거가 된다."
            : "약한 일간을 생조하여 보완 근거가 된다.",
        );
      } else if (
        relation
        === "counterpartControlsSelf"
      ) {
        tensionWeight =
          Math.max(
            tensionWeight,
            baseWeight + 1,
          );

        tensionReasons.push(
          "약한 일간에 추가 압박이 되어 긴장 근거가 된다.",
        );
      }
    } else if (
      dayMasterStrength.type
      === "strong"
    ) {
      if (
        relation
        === "counterpartControlsSelf"
      ) {
        supportiveWeight =
          Math.max(
            supportiveWeight,
            baseWeight + 1,
          );

        supportiveReasons.push(
          "강한 일간에 운 오행의 극(剋)이 들어와 과잉 기운을 조절하는 보완 근거가 된다.",
        );
      } else if (
        relation
        === "same"
        && periodElement
        === selfSajuFacts
          .strongestElement
      ) {
        tensionWeight =
          Math.max(
            tensionWeight,
            baseWeight + 1,
          );

        tensionReasons.push(
          "이미 집중된 오행을 더 강화하여 과다 집중 근거가 된다.",
        );
      }
    }
  }

  if (
    total > 0
    && dayMasterElement
  ) {
    sourceKeys.push(
      "elementDistribution",
    );

    if (
      ratio
      < 0.15
      && monthCommand
      && monthCommand.kind
      === "monthCommand"
      && monthCommand.supported
      === true
      && (
        relation
        === "counterpartGeneratesSelf"
        || relation
        === "same"
      )
    ) {
      supportiveWeight =
        Math.max(
          supportiveWeight,
          3,
        );

      supportiveReasons.push(
        `원국 ${ELEMENT_LABELS[periodElement]} 비율(${Math.round(ratio * 100)}%)이 낮고, 월령 지원이 확인되며, ${relation === "same" ? "같은 오행" : "운 오행이 일간을 생"}하여 보완 근거가 된다.`,
      );
    }

    if (
      periodElement
      === selfSajuFacts
        .strongestElement
      && ratio
      >= 0.3
    ) {
      tensionWeight =
        Math.max(
          tensionWeight,
          2,
        );

      tensionReasons.push(
        `원국 ${ELEMENT_LABELS[periodElement]} 비율(${Math.round(ratio * 100)}%)이 이미 높아 같은 오행 운이 과다 집중 긴장 근거가 된다.`,
      );
    }
  }

  const monthCommandFact =
    findStructureFactByCategory(
      selfSajuFacts
        .structureFacts,
      "monthCommand",
    );

  if (
    monthCommandFact
      ?.signal
      ?.kind
    === "monthCommand"
  ) {
    sourceKeys.push(
      "monthCommand",
    );
  }

  let effect:
    LifeFlowSignalContribution["effect"] =
    "neutral";

  let weight =
    2;

  if (
    supportiveWeight
    > 0
    && tensionWeight
    > 0
  ) {
    effect =
      "neutral";

    weight =
      Math.max(
        supportiveWeight,
        tensionWeight,
      );

    observations.push(
      "일간 강약·오행·월령 근거가 서로 다른 방향을 가리켜 natalBalance 단독 방향은 확정하지 않는다.",
    );

    if (
      supportiveReasons.length
      > 0
    ) {
      observations.push(
        `[유리 판정 근거] ${supportiveReasons.join(" ")}`,
      );
    }

    if (
      tensionReasons.length
      > 0
    ) {
      observations.push(
        `[긴장 판정 근거] ${tensionReasons.join(" ")}`,
      );
    }
  } else if (
    supportiveWeight
    > 0
  ) {
    effect =
      "supportive";

    weight =
      supportiveWeight;
  } else if (
    tensionWeight
    > 0
  ) {
    effect =
      "tension";

    weight =
      tensionWeight;
  }

  const relationLabel =
    dayMasterElement
      ? DAY_MASTER_RELATION_LABELS[relation]
      : "관계 미확인";

  const strengthLabel =
    dayMasterStrength
    && dayMasterStrength.kind
    === "dayMasterStrength"
      ? dayMasterStrength.type
      : "미확인";

  const relationSentence =
    `${flowLabel} ${ELEMENT_LABELS[periodElement]}(${periodTenGod}) ↔ ${relationLabel}`;

  const directionalReasons:
    string[] = [];

  if (
    effect
    === "supportive"
  ) {
    directionalReasons.push(
      ...supportiveReasons,
    );
  } else if (
    effect
    === "tension"
  ) {
    directionalReasons.push(
      ...tensionReasons,
    );
  }

  const descriptionParts = [
    `${distributionSummary} · 일간 ${selfSajuFacts.dayMaster}${dayMasterElement ? `(${ELEMENT_LABELS[dayMasterElement]})` : ""} ${strengthLabel} · ${relationSentence}`,
    ...directionalReasons.map(
      (
        reason,
      ) =>
        `[판정] ${reason}`,
    ),
    ...observations,
  ];

  return createContribution({
    evidenceFamily:
      "natalBalance",

    effect,

    weight,

    evidenceKey:
      `natalBalance-${flowKey}-${effect}`,

    sourceKeys:
      [...new Set(sourceKeys)],

    flowKey,

    flowLabel,

    description:
      descriptionParts.join(" "),
  });
}

function assessExplicitGod(
  selfSajuFacts:
    SajuFacts,
  layer:
    LifeFlowPeriodLayer,
): LifeFlowSignalContribution | null {
  const {
    periodElement,
    flowLabel,
    flowKey,
  } = layer;

  const usefulElement =
    selfSajuFacts.usefulGod
      ? resolveGodElement(
          selfSajuFacts.usefulGod,
        )
      : null;

  const favorableElement =
    selfSajuFacts.favorableGod
      ? resolveGodElement(
          selfSajuFacts.favorableGod,
        )
      : null;

  const harmfulElement =
    selfSajuFacts.harmfulGod
      ? resolveGodElement(
          selfSajuFacts.harmfulGod,
        )
      : null;

  if (
    !usefulElement
    && !favorableElement
    && !harmfulElement
  ) {
    return null;
  }

  if (
    usefulElement
    && periodElement
    === usefulElement
  ) {
    return createContribution({
      evidenceFamily:
        "explicitGod",

      effect:
        "supportive",

      weight:
        3,

      evidenceKey:
        "usefulGod-match",

      sourceKeys:
        [
          "usefulGod",
        ],

      flowKey,

      flowLabel,

      description:
        `${flowLabel} ${ELEMENT_LABELS[periodElement]}이 원국 용신(${selfSajuFacts.usefulGod}) 오행과 일치한다.`,
    });
  }

  if (
    favorableElement
    && periodElement
    === favorableElement
  ) {
    return createContribution({
      evidenceFamily:
        "explicitGod",

      effect:
        "supportive",

      weight:
        2,

      evidenceKey:
        "favorableGod-match",

      sourceKeys:
        [
          "favorableGod",
        ],

      flowKey,

      flowLabel,

      description:
        `${flowLabel} ${ELEMENT_LABELS[periodElement]}이 원국 희신(${selfSajuFacts.favorableGod}) 오행과 일치한다.`,
    });
  }

  if (
    harmfulElement
    && periodElement
    === harmfulElement
  ) {
    return createContribution({
      evidenceFamily:
        "explicitGod",

      effect:
        "tension",

      weight:
        3,

      evidenceKey:
        "harmfulGod-match",

      sourceKeys:
        [
          "harmfulGod",
        ],

      flowKey,

      flowLabel,

      description:
        `${flowLabel} ${ELEMENT_LABELS[periodElement]}이 원국 기신(${selfSajuFacts.harmfulGod}) 오행과 일치한다.`,
    });
  }

  return null;
}

function compareInteractionKey(
  left:
    LifeFlowPeriodInteraction,
  right:
    LifeFlowPeriodInteraction,
): number {
  const typeOrder =
    left.type.localeCompare(
      right.type,
    );

  if (
    typeOrder
    !== 0
  ) {
    return typeOrder;
  }

  const positionOrder =
    left
      .natalPillarPosition
      .localeCompare(
        right
          .natalPillarPosition,
      );

  if (
    positionOrder
    !== 0
  ) {
    return positionOrder;
  }

  return left.description.localeCompare(
    right.description,
  );
}

function assessPeriodInteractionContributions(
  interactions:
    readonly LifeFlowPeriodInteraction[],
  layer:
    LifeFlowPeriodLayer,
): LifeFlowSignalContribution[] {
  const filtered =
    interactions
      .filter(
        (
          interaction,
        ) =>
          interaction
            .targetFlowKey
          === layer.flowKey,
      )
      .sort(
        compareInteractionKey,
      );

  return filtered.map(
    (
      interaction,
    ) => {
      const pillarLabel =
        PILLAR_POSITION_LABELS[
          interaction
            .natalPillarPosition
        ]
        ?? interaction
          .natalPillarPosition;

      return createContribution({
        evidenceFamily:
          "periodInteraction",

        effect:
          "neutral",

        weight:
          interactionStrengthWeight(
            interaction.strength,
          ),

        evidenceKey:
          `periodInteraction-${interaction.type}-${interaction.targetFlowKey}-${interaction.natalPillarPosition}`,

        sourceKeys:
          [
            `periodInteraction:${interaction.type}`,
            `periodInteraction:${interaction.natalPillarPosition}`,
          ],

        flowKey:
          layer.flowKey,

        flowLabel:
          layer.flowLabel,

        description:
          `${interaction.targetFlowLabel} ${layer.ganZhi}(${interaction.targetFlowKey})과 ${pillarLabel} ${interaction.type}(${interaction.description}, ${interaction.strength}) — 원국·운 상호작용의 존재·위치·강도 관찰이며 독립 방향 근거군으로 집계하지 않는다.`,
      });
    },
  );
}

function assessTemporalLayerObservation(
  backgroundLayer:
    LifeFlowPeriodLayer,
  primaryLayer:
    LifeFlowPeriodLayer,
): LifeFlowSignalContribution | null {
  const backgroundElement =
    backgroundLayer.periodElement;

  const primaryElement =
    primaryLayer.periodElement;

  const sameElement =
    backgroundElement
    === primaryElement;

  const sameTenGod =
    backgroundLayer
      .periodTenGod
    === primaryLayer
      .periodTenGod;

  const backgroundControlsPrimary =
    resolveDayMasterElementRelation(
      backgroundElement,
      primaryElement,
    )
    === "selfControlsCounterpart";

  const primaryControlsBackground =
    resolveDayMasterElementRelation(
      primaryElement,
      backgroundElement,
    )
    === "selfControlsCounterpart";

  let description =
    `${backgroundLayer.flowLabel} ${backgroundLayer.ganZhi}(${backgroundLayer.periodTenGod}·${ELEMENT_LABELS[backgroundElement]})과 ${primaryLayer.flowLabel} ${primaryLayer.ganZhi}(${primaryLayer.periodTenGod}·${ELEMENT_LABELS[primaryElement]})`;

  if (
    sameElement
    && sameTenGod
  ) {
    description +=
      "이 같은 오행·십신으로 공명한다(관찰).";
  } else if (
    sameElement
  ) {
    description +=
      "이 같은 오행으로 증폭 관찰된다 — 자동 유리 근거는 아니다.";
  } else if (
    backgroundControlsPrimary
    || primaryControlsBackground
  ) {
    description +=
      "이 상극(相剋) 방향으로 맞선다(관찰) — 자동 불리 근거는 아니다.";
  } else {
    description +=
      "의 흐름이 병행된다(관찰).";
  }

  return createContribution({
    evidenceFamily:
      "temporalLayer",

    effect:
      "neutral",

    weight:
      sameElement
      && sameTenGod
        ? 3
        : sameElement
        || backgroundControlsPrimary
        || primaryControlsBackground
        ? 2
        : 1,

    evidenceKey:
      `temporalLayer-${backgroundLayer.flowKey}-${primaryLayer.flowKey}`,

    sourceKeys:
      [
        backgroundLayer.flowKey,
        primaryLayer.flowKey,
      ],

    flowKey:
      primaryLayer.flowKey,

    flowLabel:
      primaryLayer.flowLabel,

    description,
  });
}

function assessCurrentPhaseObservation(
  humanContext:
    HumanDestinyContext,
  layer:
    LifeFlowPeriodLayer,
): LifeFlowSignalContribution | null {
  const currentPhase =
    humanContext
      .currentPhase
      .phase;

  const rule =
    getHumanLifePhaseEvidenceRule(
      layer.periodTenGod,
    );

  const primaryPhase =
    rule
      .weights[0]
      ?.phase
    ?? null;

  if (
    !primaryPhase
  ) {
    return null;
  }

  const aligned =
    primaryPhase
    === currentPhase;

  return createContribution({
    evidenceFamily:
      "currentPhase",

    effect:
      "neutral",

    weight:
      2,

    evidenceKey:
      aligned
        ? "currentPhase-aligned"
        : "currentPhase-divergent",

    sourceKeys:
      [
        "currentPhase",
        layer.periodTenGod,
      ],

    flowKey:
      layer.flowKey,

    flowLabel:
      layer.flowLabel,

    description:
      aligned
        ? `현재 ${humanContext.currentPhase.title}(${currentPhase})와 ${layer.flowLabel} ${layer.periodTenGod} 주제(${primaryPhase})가 같은 방향이다(맥락).`
        : `현재 ${humanContext.currentPhase.title}(${currentPhase})와 ${layer.flowLabel} ${layer.periodTenGod} 주제(${primaryPhase})는 다른 방향이다(맥락).`,
  });
}

function buildLayerContributions(
  selfSajuFacts:
    SajuFacts,
  humanContext:
    HumanDestinyContext,
  layer:
    LifeFlowPeriodLayer,
  interactions:
    readonly LifeFlowPeriodInteraction[],
  backgroundLayers:
    readonly LifeFlowPeriodLayer[],
): LifeFlowSignalContribution[] {
  const contributions:
    LifeFlowSignalContribution[] =
    [
      assessNatalBalance(
        selfSajuFacts,
        layer,
      ),
    ];

  const explicitGod =
    assessExplicitGod(
      selfSajuFacts,
      layer,
    );

  if (
    explicitGod
  ) {
    contributions.push(
      explicitGod,
    );
  }

  contributions.push(
    ...assessPeriodInteractionContributions(
      interactions,
      layer,
    ),
  );

  const currentPhase =
    assessCurrentPhaseObservation(
      humanContext,
      layer,
    );

  if (
    currentPhase
  ) {
    contributions.push(
      currentPhase,
    );
  }

  if (
    layer.role
    === "primary"
  ) {
    for (
      const backgroundLayer
      of backgroundLayers
    ) {
      const temporal =
        assessTemporalLayerObservation(
          backgroundLayer,
          layer,
        );

      if (
        temporal
      ) {
        contributions.push(
          temporal,
        );
      }
    }
  }

  return contributions;
}

function summarizeByEvidenceFamily(
  contributions:
    readonly LifeFlowSignalContribution[],
): EvidenceFamilySummary[] {
  const map =
    new Map<
      LifeFlowEvidenceFamily,
      EvidenceFamilySummary
    >();

  for (
    const family
    of EVIDENCE_FAMILY_ORDER
  ) {
    map.set(
      family,
      {
        family,
        supportive: [],
        tension: [],
        neutral: [],
      },
    );
  }

  for (
    const contribution
    of contributions
  ) {
    const summary =
      map.get(
        contribution.evidenceFamily,
      );

    if (
      !summary
    ) {
      continue;
    }

    if (
      contribution.effect
      === "supportive"
    ) {
      summary.supportive.push(
        contribution,
      );
    } else if (
      contribution.effect
      === "tension"
    ) {
      summary.tension.push(
        contribution,
      );
    } else {
      summary.neutral.push(
        contribution,
      );
    }
  }

  return EVIDENCE_FAMILY_ORDER.map(
    (
      family,
    ) =>
      map.get(
        family,
      )!,
  );
}

function pickRepresentativeContribution(
  items:
    readonly LifeFlowSignalContribution[],
): LifeFlowSignalContribution | null {
  if (
    items.length
    === 0
  ) {
    return null;
  }

  return [
    ...items,
  ].sort(
    (
      left,
      right,
    ) => {
      if (
        right.weight
        !== left.weight
      ) {
        return (
          right.weight
          - left.weight
        );
      }

      return left.evidenceKey.localeCompare(
        right.evidenceKey,
      );
    },
  )[0];
}

function consolidateFamilyContributions(
  contributions:
    readonly LifeFlowSignalContribution[],
): LifeFlowSignalContribution[] {
  const summaries =
    summarizeByEvidenceFamily(
      contributions,
    );

  const consolidated:
    LifeFlowSignalContribution[] =
    [];

  for (
    const summary
    of summaries
  ) {
    if (
      summary.family
      === "periodInteraction"
    ) {
      consolidated.push(
        ...summary.neutral,
        ...summary.supportive,
        ...summary.tension,
      );
      continue;
    }

    if (
      summary.supportive.length
      > 0
      && summary.tension.length
      > 0
    ) {
      const mixedItems =
        [
          ...summary.supportive,
          ...summary.tension,
        ];

      const representative =
        pickRepresentativeContribution(
          mixedItems,
        );

      if (
        representative
      ) {
        const mergedSourceKeys =
          [
            ...new Set(
              mixedItems.flatMap(
                (
                  item,
                ) =>
                  item.sourceKeys,
              ),
            ),
          ];

        const mergedDescription =
          [
            `${summary.family} 근거군 내부에서 유리·긴장 신호가 함께 확인되어 혼합(neutral)으로 보존한다.`,
            ...summary.supportive.map(
              (
                item,
              ) =>
                `[유리] ${item.description}`,
            ),
            ...summary.tension.map(
              (
                item,
              ) =>
                `[긴장] ${item.description}`,
            ),
          ].join(" ");

        consolidated.push({
          ...representative,

          effect:
            "neutral",

          evidenceKey:
            `${summary.family}-mixed`,

          sourceKeys:
            mergedSourceKeys,

          description:
            mergedDescription,

          preservedContributions:
            mixedItems.map(
              (
                item,
              ) => ({
                evidenceFamily:
                  item.evidenceFamily,

                effect:
                  item.effect,

                weight:
                  item.weight,

                evidenceKey:
                  item.evidenceKey,

                sourceKeys:
                  item.sourceKeys,

                flowKey:
                  item.flowKey,

                flowLabel:
                  item.flowLabel,

                description:
                  item.description,
              }),
            ),
        });
      }

      continue;
    }

    const directional =
      summary.supportive.length
      > 0
        ? summary.supportive
        : summary.tension.length
        > 0
        ? summary.tension
        : summary.neutral;

    const representative =
      pickRepresentativeContribution(
        directional,
      );

    if (
      representative
    ) {
      consolidated.push(
        representative,
      );
    }
  }

  return consolidated.sort(
    (
      left,
      right,
    ) => {
      const leftIndex =
        EVIDENCE_FAMILY_ORDER.indexOf(
          left.evidenceFamily,
        );

      const rightIndex =
        EVIDENCE_FAMILY_ORDER.indexOf(
          right.evidenceFamily,
        );

      if (
        leftIndex
        !== rightIndex
      ) {
        return (
          leftIndex
          - rightIndex
        );
      }

      return left.evidenceKey.localeCompare(
        right.evidenceKey,
      );
    },
  );
}

function aggregateDirectionalSignals(
  contributions:
    readonly LifeFlowSignalContribution[],
): {
  supportiveSignals:
    string[];

  tensionSignals:
    string[];

  limitations:
    string[];
} {
  const summaries =
    summarizeByEvidenceFamily(
      contributions,
    );

  const limitations:
    string[] = [];

  const supportiveFamilies:
    EvidenceFamilySummary[] =
    [];

  const tensionFamilies:
    EvidenceFamilySummary[] =
    [];

  const mixedFamilies:
    EvidenceFamilySummary[] =
    [];

  for (
    const summary
    of summaries
  ) {
    if (
      summary.supportive.length
      > 0
      && summary.tension.length
      > 0
    ) {
      mixedFamilies.push(
        summary,
      );

      limitations.push(
        `${summary.family} 근거군 내부에서 유리·긴장 신호가 함께 확인되어 한쪽 weight 승리로 삭제하지 않는다.`,
      );
      continue;
    }

    if (
      summary.supportive.length
      > 0
    ) {
      supportiveFamilies.push(
        summary,
      );
    }

    if (
      summary.tension.length
      > 0
    ) {
      tensionFamilies.push(
        summary,
      );
    }
  }

  const supportiveSignals:
    string[] = [];

  const tensionSignals:
    string[] = [];

  const supportiveCount =
    supportiveFamilies.length;

  const tensionCount =
    tensionFamilies.length;

  if (
    supportiveCount
    >= 2
    && tensionCount
    === 1
  ) {
    supportiveSignals.push(
      ...supportiveFamilies.flatMap(
        (
          summary,
        ) =>
          summary.supportive.map(
            (
              contribution,
            ) =>
              contribution.description,
          ),
      ),
    );

    limitations.push(
      `유리 근거 ${supportiveCount}개 대 반대 근거 1개(${tensionFamilies[0].family}): ${tensionFamilies[0].tension.map((item) => item.description).join(" ")}`,
    );
  } else if (
    tensionCount
    >= 2
    && supportiveCount
    === 1
  ) {
    tensionSignals.push(
      ...tensionFamilies.flatMap(
        (
          summary,
        ) =>
          summary.tension.map(
            (
              contribution,
            ) =>
              contribution.description,
          ),
      ),
    );

    limitations.push(
      `긴장 근거 ${tensionCount}개 대 반대 근거 1개(${supportiveFamilies[0].family}): ${supportiveFamilies[0].supportive.map((item) => item.description).join(" ")}`,
    );
  } else if (
    supportiveCount
    >= 2
    && tensionCount
    >= 2
  ) {
    supportiveSignals.push(
      ...supportiveFamilies.flatMap(
        (
          summary,
        ) =>
          summary.supportive.map(
            (
              contribution,
            ) =>
              contribution.description,
          ),
      ),
    );

    tensionSignals.push(
      ...tensionFamilies.flatMap(
        (
          summary,
        ) =>
          summary.tension.map(
            (
              contribution,
            ) =>
              contribution.description,
          ),
      ),
    );

    limitations.push(
      "독립 근거군 간 방향이 혼합되어 '혼합 흐름'으로 보존한다.",
    );
  } else if (
    supportiveCount
    >= 2
    && tensionCount
    === 0
  ) {
    supportiveSignals.push(
      ...supportiveFamilies.flatMap(
        (
          summary,
        ) =>
          summary.supportive.map(
            (
              contribution,
            ) =>
              contribution.description,
          ),
      ),
    );
  } else if (
    tensionCount
    >= 2
    && supportiveCount
    === 0
  ) {
    tensionSignals.push(
      ...tensionFamilies.flatMap(
        (
          summary,
        ) =>
          summary.tension.map(
            (
              contribution,
            ) =>
              contribution.description,
          ),
      ),
    );
  } else if (
    supportiveCount
    === 1
    && tensionCount
    === 1
  ) {
    limitations.push(
      `유리 근거 1개(${supportiveFamilies[0].family}): ${supportiveFamilies[0].supportive.map((item) => item.description).join(" ")} | 반대 근거 1개(${tensionFamilies[0].family}): ${tensionFamilies[0].tension.map((item) => item.description).join(" ")}`,
    );
  } else if (
    supportiveCount
    === 1
  ) {
    limitations.push(
      `유리 흐름 근거가 ${supportiveFamilies[0].family} 근거군 하나뿐이라 단정하지 않는다.`,
    );
  } else if (
    tensionCount
    === 1
  ) {
    limitations.push(
      `긴장 흐름 근거가 ${tensionFamilies[0].family} 근거군 하나뿐이라 단정하지 않는다.`,
    );
  }

  if (
    supportiveCount
    > 0
    && tensionCount
    > 0
    && !(
      (
        supportiveCount
        >= 2
        && tensionCount
        === 1
      )
      || (
        tensionCount
        >= 2
        && supportiveCount
        === 1
      )
      || (
        supportiveCount
        >= 2
        && tensionCount
        >= 2
      )
    )
  ) {
    limitations.push(
      "독립 근거군 간 방향이 엇갈려 기간 해석을 단정하지 않는다.",
    );
  }

  return {
    supportiveSignals,
    tensionSignals,
    limitations,
  };
}

function buildSeunLayerFromFact(
  fact:
    SajuTargetPeriodLuckFlowFact,
  params: {
    flowKey:
      string;

    role:
      LifeFlowPeriodLayerRole;

    startDate?:
      string;

    endDate?:
      string;

    periodLabel?:
      string;
  },
): LifeFlowPeriodLayer {
  return {
    flowKey:
      params.flowKey,

    flowLabel:
      "세운",

    periodLabel:
      params.periodLabel
      ?? `${fact.targetSeun.year}년 연운`,

    startDate:
      params.startDate,

    endDate:
      params.endDate,

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

    periodTenGod:
      fact
        .targetSeun
        .tenGod,

    periodElement:
      fact
        .targetSeun
        .element,

    role:
      params.role,
  };
}

function buildYearSegmentLayer(
  segment:
    SajuTargetPeriodLuckFlowFact["yearSegments"][number],
  index:
    number,
): LifeFlowPeriodLayer {
  return {
    flowKey:
      `year-${index + 1}`,

    flowLabel:
      "연운",

    periodLabel:
      `${segment.startDate}~${segment.endDate} 연운`,

    startDate:
      segment.startDate,

    endDate:
      segment.endDate,

    ganZhi:
      segment.ganZhi,

    heavenlyStem:
      segment.heavenlyStem,

    earthlyBranch:
      segment.earthlyBranch,

    periodTenGod:
      segment.tenGod,

    periodElement:
      segment.element,

    role:
      "primary",
  };
}

function toComparableIsoDate(
  value:
    string,
): number {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value,
    );

  if (
    !match
  ) {
    return 0;
  }

  return (
    Number(match[1]) * 10_000
    + Number(match[2]) * 100
    + Number(match[3])
  );
}

function dateRangesOverlap(
  leftStart:
    string,
  leftEnd:
    string,
  rightStart:
    string,
  rightEnd:
    string,
): boolean {
  return (
    toComparableIsoDate(
      leftStart,
    )
    <= toComparableIsoDate(
      rightEnd,
    )
    && toComparableIsoDate(
      leftEnd,
    )
    >= toComparableIsoDate(
      rightStart,
    )
  );
}

function resolvePrimaryLayerDateRange(
  layer:
    LifeFlowPeriodLayer,
  target:
    LifeFlowTarget,
): {
  startDate:
    string;

  endDate:
    string;
} {
  if (
    layer.startDate
    && layer.endDate
  ) {
    return {
      startDate:
        layer.startDate,

      endDate:
        layer.endDate,
    };
  }

  return {
    startDate:
      target.startDate,

    endDate:
      target.endDate,
  };
}

function resolveSeunBackgroundLayersForPrimary(
  primaryLayer:
    LifeFlowPeriodLayer,
  target:
    LifeFlowTarget,
  fact:
    SajuTargetPeriodLuckFlowFact,
): LifeFlowPeriodLayer[] {
  if (
    target.scope
    === "overall"
    || target.scope
    === "year"
  ) {
    return [];
  }

  if (
    target.scope
    === "day"
  ) {
    return [
      buildSeunLayerFromFact(
        fact,
        {
          flowKey:
            "seun",

          role:
            "background",

          startDate:
            target.startDate,

          endDate:
            target.endDate,
        },
      ),
    ];
  }

  const {
    startDate,
    endDate,
  } =
    resolvePrimaryLayerDateRange(
      primaryLayer,
      target,
    );

  const overlappingSegments =
    fact
      .yearSegments
      .filter(
        (
          segment,
        ) =>
          dateRangesOverlap(
            segment.startDate,
            segment.endDate,
            startDate,
            endDate,
          ),
      );

  if (
    overlappingSegments.length
    === 0
  ) {
    return [
      buildSeunLayerFromFact(
        fact,
        {
          flowKey:
            "seun",

          role:
            "background",

          startDate,

          endDate,
        },
      ),
    ];
  }

  return overlappingSegments.map(
    (
      segment,
      index,
    ) => ({
      flowKey:
        `seun-bg-${index + 1}`,

      flowLabel:
        "세운",

      periodLabel:
        `${segment.startDate}~${segment.endDate} 연운`,

      startDate:
        segment.startDate,

      endDate:
        segment.endDate,

      ganZhi:
        segment.ganZhi,

      heavenlyStem:
        segment.heavenlyStem,

      earthlyBranch:
        segment.earthlyBranch,

      periodTenGod:
        segment.tenGod,

      periodElement:
        segment.element,

      role:
        "background" as const,
    }),
  );
}

function resolvePrimaryLayers(
  target:
    LifeFlowTarget,
  fact:
    SajuTargetPeriodLuckFlowFact,
): LifeFlowPeriodLayer[] {
  switch (
    target.scope
  ) {
    case "overall":
      return [
        buildSeunLayerFromFact(
          fact,
          {
            flowKey:
              "seun",

            role:
              "primary",

            startDate:
              target.startDate,

            endDate:
              target.endDate,
          },
        ),
      ];

    case "year":
      if (
        fact
          .yearSegments
          .length
        > 0
      ) {
        return fact
          .yearSegments
          .map(
            buildYearSegmentLayer,
          );
      }

      return [
        buildSeunLayerFromFact(
          fact,
          {
            flowKey:
              "seun",

            role:
              "primary",

            startDate:
              target.startDate,

            endDate:
              target.endDate,
          },
        ),
      ];

    case "month":
    case "halfYear":
      return fact
        .wolunSegments
        .map(
          (
            segment:
              SajuWolunSegmentFact,
            index,
          ) => ({
            flowKey:
              `wolun-${index + 1}`,

            flowLabel:
              "월운",

            periodLabel:
              `${segment.startDate}~${segment.endDate} 월운`,

            startDate:
              segment.startDate,

            endDate:
              segment.endDate,

            ganZhi:
              segment.ganZhi,

            heavenlyStem:
              segment.heavenlyStem,

            earthlyBranch:
              segment.earthlyBranch,

            periodTenGod:
              segment.tenGod,

            periodElement:
              segment.element,

            role:
              "primary" as const,
          }),
        );

    case "day":
      if (
        !fact.targetIlun
      ) {
        return [];
      }

      return [
        {
          flowKey:
            "ilun",

          flowLabel:
            "일운",

          periodLabel:
            `${fact.targetIlun.targetDate} 일운`,

          startDate:
            fact
              .targetIlun
              .targetDate,

          endDate:
            fact
              .targetIlun
              .targetDate,

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

          periodTenGod:
            fact
              .targetIlun
              .tenGod,

          periodElement:
            fact
              .targetIlun
              .element,

          role:
            "primary",
        },
      ];
  }
}

function resolveBackgroundLayers(
  _target:
    LifeFlowTarget,
  fact:
    SajuTargetPeriodLuckFlowFact,
): LifeFlowPeriodLayer[] {
  const layers:
    LifeFlowPeriodLayer[] =
    [];

  if (
    fact.currentDaeun
  ) {
    layers.push({
      flowKey:
        "daeun",

      flowLabel:
        "대운",

      periodLabel:
        `대운 ${fact.currentDaeun.ganZhi}`,

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

      periodTenGod:
        fact
          .currentDaeun
          .tenGod,

      periodElement:
        fact
          .currentDaeun
          .element,

      role:
        "background",
    });
  }

  return layers;
}

function buildScopeLabel(
  target:
    LifeFlowTarget,
): string {
  switch (
    target.scope
  ) {
    case "overall":
      return "총운·전체 흐름";

    case "year":
      return `${target.targetYear}년 연운`;

    case "halfYear":
      return `${target.targetYear}년 ${target.half === "first" ? "상반기" : "하반기"} 운`;

    case "month":
      return `${target.targetYear}년 ${target.targetMonth}월 월운`;

    case "day":
      return `${target.startDate} 일운`;
  }
}

function buildOverallTheme(
  scopeLabel:
    string,
  selfSajuFacts:
    SajuFacts,
  fact:
    SajuTargetPeriodLuckFlowFact,
  primaryLayers:
    readonly LifeFlowPeriodLayer[],
  directional:
    ReturnType<
      typeof aggregateDirectionalSignals
    >,
): string {
  const primarySummaries =
    primaryLayers.map(
      (
        layer,
      ) =>
        `${layer.flowLabel} ${layer.ganZhi}(${layer.periodTenGod}·${ELEMENT_LABELS[layer.periodElement]})`,
    );

  const primaryFlowSummary =
    primaryLayers.length
    > 1
      ? primarySummaries.join(
          " → ",
        )
      : primarySummaries[0]
      ?? "대상 운 미확인";

  const dayMasterElement =
    resolveStemElement(
      selfSajuFacts.dayMaster,
    );

  const primaryLayer =
    primaryLayers[0];

  const relation =
    primaryLayer
    && dayMasterElement
      ? resolveDayMasterElementRelation(
          dayMasterElement,
          primaryLayer.periodElement,
        )
      : null;

  const directionConfirmed =
    directional
      .supportiveSignals
      .length
    > 0
    || directional
      .tensionSignals
      .length
    > 0;

  const directionSummary =
    directional
      .supportiveSignals
      .length
    > 0
    && directional
      .tensionSignals
      .length
    === 0
      ? "원국-운 관계상 유리한 흐름"
      : directional
        .tensionSignals
        .length
      > 0
      && directional
        .supportiveSignals
        .length
      === 0
      ? "원국-운 관계상 긴장 흐름"
      : directionConfirmed
      ? "원국-운 관계 혼합 흐름"
      : "원국-운 관계와 변화 구간";

  const backgroundParts:
    string[] = [];

  if (
    fact.currentDaeun
    && primaryLayer
    && primaryLayer.flowKey
    !== "daeun"
  ) {
    backgroundParts.push(
      `대운 ${fact.currentDaeun.ganZhi}(${fact.currentDaeun.tenGod}·${ELEMENT_LABELS[fact.currentDaeun.element]})`,
    );
  }

  if (
    primaryLayer
    && primaryLayer.flowKey
    !== "seun"
    && primaryLayer.flowKey
    !== "daeun"
  ) {
    backgroundParts.push(
      `세운 ${fact.targetSeun.ganZhi}(${fact.targetSeun.tenGod}·${ELEMENT_LABELS[fact.targetSeun.element]})`,
    );
  }

  return [
    scopeLabel,
    directionSummary,
    primaryFlowSummary,
    ...backgroundParts,
    relation
      && dayMasterElement
      && primaryLayer
      ? `일간 ${selfSajuFacts.dayMaster}(${ELEMENT_LABELS[dayMasterElement]})↔${primaryLayer.flowLabel}: ${DAY_MASTER_RELATION_LABELS[relation]}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function buildPhaseInterpretation(
  humanContext:
    HumanDestinyContext,
  target:
    LifeFlowTarget,
  primaryLayers:
    readonly LifeFlowPeriodLayer[],
): {
  interpretation:
    string;

  limitations:
    string[];
} {
  const limitations:
    string[] = [];

  const referenceDate =
    target.referenceDate;

  const targetDate =
    target.startDate;

  const referenceTime =
    Date.parse(
      `${referenceDate}T00:00:00Z`,
    );

  const targetTime =
    Date.parse(
      `${targetDate}T00:00:00Z`,
    );

  if (
    Number.isFinite(
      referenceTime,
    )
    && Number.isFinite(
      targetTime,
    )
  ) {
    const monthsAway =
      Math.abs(
        Math.round(
          (
            targetTime
            - referenceTime
          )
          / (
            1000
            * 60
            * 60
            * 24
            * 30
          ),
        ),
      );

    if (
      monthsAway
      > 24
    ) {
      limitations.push(
        `대상 기간(${targetDate})이 현재(${referenceDate})와 ${monthsAway}개월 이상 떨어져 currentPhase 적용 범위가 제한된다.`,
      );
    }
  }

  if (
    primaryLayers.length
    === 0
  ) {
    return {
      interpretation:
        humanContext
          .currentPhase
          .description,

      limitations,
    };
  }

  if (
    primaryLayers.length
    === 1
  ) {
    const layer =
      primaryLayers[0];

    const currentPhase =
      humanContext
        .currentPhase;

    const rule =
      getHumanLifePhaseEvidenceRule(
        layer.periodTenGod,
      );

    const primaryPhase:
      HumanLifePhase | null =
      rule
        .weights[0]
        ?.phase
      ?? null;

    const aligned =
      primaryPhase
      === currentPhase.phase;

    const interpretation =
      primaryPhase
        ? aligned
          ? `현재 ${currentPhase.title}(${currentPhase.phase})와 ${layer.flowLabel} ${layer.periodTenGod} 주제(${primaryPhase})가 같은 방향으로 작용한다. ${currentPhase.description}`
          : `현재 ${currentPhase.title}(${currentPhase.phase})와 ${layer.flowLabel} ${layer.periodTenGod} 주제(${primaryPhase})는 다른 방향이다. ${currentPhase.description}`
        : `${layer.flowLabel} ${layer.periodTenGod} 주제와 ${currentPhase.description}`;

    return {
      interpretation,
      limitations,
    };
  }

  const segmentDescriptions =
    primaryLayers.map(
      (
        layer,
      ) => {
        const rule =
          getHumanLifePhaseEvidenceRule(
            layer.periodTenGod,
          );

        const primaryPhase =
          rule
            .weights[0]
            ?.phase
          ?? "미확인";

        return `${layer.periodLabel}: ${layer.periodTenGod}(${primaryPhase})`;
      },
    );

  return {
    interpretation:
      `복수 ${primaryLayers[0]?.flowLabel ?? "운"} 구간의 주제 변화 — ${segmentDescriptions.join(" → ")}. ${humanContext.currentPhase.description}`,

    limitations,
  };
}

function buildSegmentInterpretations(
  layers:
    readonly LifeFlowPeriodLayer[],
  target:
    LifeFlowTarget,
  selfSajuFacts:
    SajuFacts,
  humanContext:
    HumanDestinyContext,
  interactions:
    readonly LifeFlowPeriodInteraction[],
  backgroundLayers:
    readonly LifeFlowPeriodLayer[],
  fact:
    SajuTargetPeriodLuckFlowFact,
): LifeFlowPeriodSegmentInterpretation[] {
  return layers.map(
    (
      layer,
    ) => {
      const layerBackground =
        [
          ...backgroundLayers,
          ...resolveSeunBackgroundLayersForPrimary(
            layer,
            target,
            fact,
          ),
        ];

      const contributions =
        buildLayerContributions(
          selfSajuFacts,
          humanContext,
          layer,
          interactions,
          layerBackground,
        );

      return {
        key:
          layer.flowKey,

        periodLabel:
          layer.periodLabel,

        ganZhi:
          layer.ganZhi,

        tenGod:
          layer.periodTenGod,

        element:
          layer.periodElement,

        theme:
          buildTenGodTheme(
            layer.periodTenGod,
            layer.periodLabel,
          ),

        signalContributions:
          contributions,
      };
    },
  );
}

function collectPrimaryContributions(
  target:
    LifeFlowTarget,
  selfSajuFacts:
    SajuFacts,
  humanContext:
    HumanDestinyContext,
  primaryLayers:
    readonly LifeFlowPeriodLayer[],
  interactions:
    readonly LifeFlowPeriodInteraction[],
  backgroundLayers:
    readonly LifeFlowPeriodLayer[],
  fact:
    SajuTargetPeriodLuckFlowFact,
): LifeFlowSignalContribution[] {
  const contributions:
    LifeFlowSignalContribution[] =
    [];

  for (
    const layer
    of primaryLayers
  ) {
    const layerBackground =
      [
        ...backgroundLayers,
        ...resolveSeunBackgroundLayersForPrimary(
          layer,
          target,
          fact,
        ),
      ];

    contributions.push(
      ...buildLayerContributions(
        selfSajuFacts,
        humanContext,
        layer,
        interactions,
        layerBackground,
      ),
    );
  }

  return contributions;
}

function buildUnavailableAssessment(
  target:
    LifeFlowTarget | null,
  limitations:
    string[],
): LifeFlowInterpretationAssessment {
  return {
    available:
      false,

    target,

    overallTheme:
      "",

    supportiveSignals:
      [],

    tensionSignals:
      [],

    phaseInterpretation:
      "",

    periodSegments:
      [],

    periodInteractions:
      [],

    signalContributions:
      [],

    cautions:
      [],

    limitations,

    evidenceKeys:
      [],

    sourceLocked:
      true,
  };
}

export type LifeFlowInterpretationAssessmentInput = {
  humanContext:
    HumanDestinyContext;

  selfSajuFacts:
    SajuFacts | null;

  target:
    LifeFlowTarget | null;

  targetPeriodLuckFlow:
    SajuTargetPeriodLuckFlowFact | null;
};

export function assessLifeFlowInterpretation(
  input:
    LifeFlowInterpretationAssessmentInput,
): LifeFlowInterpretationAssessment {
  if (
    !input.target
  ) {
    return buildUnavailableAssessment(
      null,
      [
        "대상 기간이 확인되지 않았다.",
      ],
    );
  }

  if (
    input
      .target
      .ambiguity
      ?.needsClarification
  ) {
    return buildUnavailableAssessment(
      input.target,
      [
        input
          .target
          .ambiguity
          .reason,
      ],
    );
  }

  if (
    !input.selfSajuFacts
  ) {
    return buildUnavailableAssessment(
      input.target,
      [
        "원국 계산 결과가 없다.",
      ],
    );
  }

  if (
    !input.targetPeriodLuckFlow
  ) {
    return buildUnavailableAssessment(
      input.target,
      [
        "대상 기간의 운 계산 결과가 없다.",
      ],
    );
  }

  const fact =
    input.targetPeriodLuckFlow;

  const selfSajuFacts =
    input.selfSajuFacts;

  const periodPillars =
    buildPeriodFlowPillarsFromFact(
      fact,
      input.target,
    );

  const periodInteractions =
    assessLifeFlowPeriodInteractions(
      selfSajuFacts.pillars,
      periodPillars,
    );

  const primaryLayers =
    resolvePrimaryLayers(
      input.target,
      fact,
    );

  const backgroundLayers =
    resolveBackgroundLayers(
      input.target,
      fact,
    );

  if (
    primaryLayers.length
    === 0
  ) {
    return buildUnavailableAssessment(
      input.target,
      [
        "대상 scope의 주 평가 운 레이어를 확인하지 못했다.",
      ],
    );
  }

  const primaryContributions =
    collectPrimaryContributions(
      input.target,
      selfSajuFacts,
      input.humanContext,
      primaryLayers,
      periodInteractions,
      backgroundLayers,
      fact,
    );

  const directional =
    aggregateDirectionalSignals(
      primaryContributions,
    );

  const signalContributions =
    consolidateFamilyContributions(
      primaryContributions,
    );

  const phaseResult =
    buildPhaseInterpretation(
      input.humanContext,
      input.target,
      primaryLayers,
    );

  const scopeLabel =
    buildScopeLabel(
      input.target,
    );

  const overallTheme =
    buildOverallTheme(
      scopeLabel,
      selfSajuFacts,
      fact,
      primaryLayers,
      directional,
    );

  const evidenceKeys:
    string[] = [];

  if (
    fact.currentDaeun
  ) {
    evidenceKeys.push(
      "daeun",
    );
  }

  evidenceKeys.push(
    "seun",
  );

  let periodSegments:
    LifeFlowPeriodSegmentInterpretation[] =
    buildSegmentInterpretations(
      primaryLayers,
      input.target,
      selfSajuFacts,
      input.humanContext,
      periodInteractions,
      backgroundLayers,
      fact,
    );

  for (
    const segment
    of periodSegments
  ) {
    evidenceKeys.push(
      segment.key,
    );
  }

  const limitations = [
    ...input.target.limitations,
    ...fact.limitations,
    ...input.target.evidence,
    ...phaseResult.limitations,
    ...directional.limitations,
  ];

  const cautions =
    directional
      .tensionSignals
      .slice(
        0,
        3,
      );

  return {
    available:
      true,

    target:
      input.target,

    overallTheme,

    supportiveSignals:
      directional
        .supportiveSignals,

    tensionSignals:
      directional
        .tensionSignals,

    phaseInterpretation:
      phaseResult.interpretation,

    periodSegments,

    periodInteractions,

    signalContributions,

    cautions,

    limitations,

    evidenceKeys,

    sourceLocked:
      true,
  };
}

export {
  isSajuLuckFlowTenGod,
  aggregateDirectionalSignals,
  consolidateFamilyContributions,
};
