import {
  buildV3TargetIlun,
} from "../../builders/luckFlowCalculationBuilder";
import {
  buildSajuFactsPipeline,
} from "../../builders/sajuFactsPipelineBuilder";
import {
  buildConsultingPrompt,
} from "../explanation/consultingPromptBuilder";
import {
  buildDecisionExplanationPayload,
} from "../explanation/decisionExplanationPayload";
import {
  buildDecisionExplanationPlan,
} from "../explanation/decisionExplanationPlan";
import {
  readDecisionResult,
} from "../explanation/decisionResultReader";
import {
  assessLifeFlowInterpretation,
  aggregateDirectionalSignals,
  type LifeFlowSignalContribution,
} from "./lifeFlowInterpretationAssessment";
import {
  buildLifeFlowInterpretationDecisionResult,
} from "./lifeFlowInterpretationDecisionBuilder";
import {
  buildTargetPeriodLuckFlowForQuestion,
} from "./targetPeriodLuckFlowBuilder";
import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture";
import {
  resolveLifeFlowTarget,
} from "../question/lifeFlowTargetResolver";
import {
  buildQuestionContext,
} from "../question/questionContextBuilder";
import {
  readQuestion,
} from "../question/questionReader";
import {
  runDecisionEngine,
} from "./decisionEngine";
import {
  assessLifeFlowPeriodInteractions,
} from "./lifeFlowPeriodInteractionAssessment";
import {
  getTenGodByStem,
} from "../../../data/tenGodService";
import type {
  SajuLuckFlowTenGod,
  SajuTargetPeriodLuckFlowFact,
} from "../../types/luckFlowFact";
import type {
  SajuElementDistribution,
  SajuFacts,
  SajuPillarFact,
  SajuStructureFact,
} from "../../types/sajuFacts";
import {
  readFileSync,
} from "node:fs";
import {
  fileURLToPath,
} from "node:url";
import {
  dirname,
  join,
} from "node:path";

const REFERENCE_DATE =
  "2025-08-16";

const COMPARISON_DAY_MASTER =
  "庚";

const COMPARISON_PERIOD_HEAVENLY_STEM =
  "戊";

const COMPARISON_PERIOD_ELEMENT =
  "earth" as const;

function resolveCalculatedTenGod(
  dayMaster:
    string,
  periodHeavenlyStem:
    string,
): SajuLuckFlowTenGod {
  const calculated =
    getTenGodByStem(
      dayMaster,
      periodHeavenlyStem,
    );

  const normalized =
    calculated
      .replace(
        /\s+/g,
        "",
      );

  if (
    ![
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
    ].includes(
      normalized,
    )
  ) {
    throw new Error(
      `Unexpected ten god calculation: ${calculated}`,
    );
  }

  return normalized as SajuLuckFlowTenGod;
}

function buildDayMasterStrengthFact(
  type:
    "strong"
    | "balanced"
    | "weak",
): SajuStructureFact {
  return {
    category:
      "dayMasterStrength",

    description:
      `일간 ${type}`,

    strength:
      type
      === "strong"
        ? "strong"
        : type
        === "weak"
        ? "weak"
        : "medium",

    confidence:
      "medium",

    signal: {
      kind:
        "dayMasterStrength",

      type,

      score:
        type
        === "strong"
          ? 8
          : type
          === "weak"
          ? 2
          : 5,

      supportScore:
        type
        === "strong"
          ? 8
          : 2,

      opposingScore:
        type
        === "strong"
          ? 2
          : 6,

      monthCommandScore:
        type
        === "strong"
          ? 3
          : 1,

      rootingScore:
        type
        === "strong"
          ? 3
          : 1,
    },
  };
}

function buildMonthCommandFact(
  supported:
    boolean,
): SajuStructureFact {
  return {
    category:
      "monthCommand",

    description:
      supported
        ? "월령 지원"
        : "월령 미지원",

    strength:
      "medium",

    confidence:
      "medium",

    signal: {
      kind:
        "monthCommand",

      season:
        "autumn",

      supported,

      dayMasterElement:
        "metal",
    },
  };
}

function buildSharedNatalComparisonFact(
  calculatedTenGod:
    SajuLuckFlowTenGod,
): SajuTargetPeriodLuckFlowFact {
  return {
    targetStartDate:
      "2026-01-01",

    targetEndDate:
      "2026-12-31",

    currentDaeun:
      null,

    targetSeun: {
      year:
        2026,

      age:
        36,

      ganZhi:
        "戊午",

      heavenlyStem:
        COMPARISON_PERIOD_HEAVENLY_STEM,

      earthlyBranch:
        "午",

      tenGod:
        calculatedTenGod,

      element:
        COMPARISON_PERIOD_ELEMENT,
    },

    yearSegments:
      [],

    wolunSegments:
      [],

    targetIlun:
      null,

    limitations:
      [],
  };
}

function buildComparisonNatalFacts(
  params: {
    dayMasterStrength:
      "strong"
      | "weak";

    elementDistribution:
      SajuElementDistribution;

    strongestElement:
      SajuFacts["strongestElement"];

    pillars:
      SajuPillarFact[];

    interactionFacts?:
      SajuFacts["interactionFacts"];

    monthCommandSupported:
      boolean;

    template:
      SajuFacts;
  },
): SajuFacts {
  const {
    dayMasterStrength,
    elementDistribution,
    strongestElement,
    pillars,
    interactionFacts,
    monthCommandSupported,
    template,
  } = params;

  const structureFacts =
    template
      .structureFacts
      .filter(
        (
          fact,
        ) =>
          fact.category
          !== "dayMasterStrength"
          && fact.category
          !== "monthCommand",
      );

  return {
    ...template,

    name:
      "비교-fixture",

    birthDate:
      "1990-01-01",

    birthTime:
      "12:00",

    dayMaster:
      COMPARISON_DAY_MASTER,

    pillars,

    strongestElement,

    weakestElement:
      null,

    elementDistribution,

    structureFacts: [
      buildDayMasterStrengthFact(
        dayMasterStrength,
      ),
      buildMonthCommandFact(
        monthCommandSupported,
      ),
      ...structureFacts,
    ],

    interactionFacts:
      interactionFacts
      ?? [],

    usefulGod:
      undefined,

    favorableGod:
      undefined,

    harmfulGod:
      undefined,
  };
}

function findNatalBalanceContribution(
  assessment:
    ReturnType<
      typeof assessLifeFlowInterpretation
    >,
) {
  return assessment
    .signalContributions
    .find(
      (
        contribution,
      ) =>
        contribution.evidenceFamily
        === "natalBalance",
    );
}

function findCrossFamilySourceKeyDuplication(
  contributions:
    readonly LifeFlowSignalContribution[],
): string[] {
  const familiesBySourceKey =
    new Map<
      string,
      Set<
        LifeFlowSignalContribution["evidenceFamily"]
      >
    >();

  for (
    const contribution
    of contributions
  ) {
    for (
      const sourceKey
      of contribution.sourceKeys
    ) {
      const families =
        familiesBySourceKey.get(
          sourceKey,
        )
        ?? new Set();

      families.add(
        contribution.evidenceFamily,
      );

      familiesBySourceKey.set(
        sourceKey,
        families,
      );
    }
  }

  return [
    ...familiesBySourceKey.entries(),
  ]
    .filter(
      (
        [
          sourceKey,
          families,
        ],
      ) =>
        families.size
        > 1
        && sourceKey
        !== "natalBalance",
    )
    .map(
      (
        [
          sourceKey,
          families,
        ],
      ) =>
        `${sourceKey}:${[
          ...families,
        ].join("+")}`,
    );
}

function meaningfulNatalStructureResultsDiffer(
  left:
    ReturnType<
      typeof assessLifeFlowInterpretation
    >,
  right:
    ReturnType<
      typeof assessLifeFlowInterpretation
    >,
): boolean {
  const leftNatalBalance =
    findNatalBalanceContribution(
      left,
    );

  const rightNatalBalance =
    findNatalBalanceContribution(
      right,
    );

  return (
    leftNatalBalance
      ?.effect
    !== rightNatalBalance
      ?.effect
    || leftNatalBalance
      ?.description
    !== rightNatalBalance
      ?.description
    || left.overallTheme
    !== right.overallTheme
    || JSON.stringify(
        left.periodSegments.map(
          (
            segment,
          ) => ({
            key:
              segment.key,
            theme:
              segment.theme,
          }),
        ),
      )
    !== JSON.stringify(
        right.periodSegments.map(
          (
            segment,
          ) => ({
            key:
              segment.key,
            theme:
              segment.theme,
          }),
        ),
      )
    || JSON.stringify(
        left.limitations,
      )
    !== JSON.stringify(
        right.limitations,
      )
  );
}

function buildComparisonFixtureReport(
  natalFacts:
    SajuFacts,
  assessment:
    ReturnType<
      typeof assessLifeFlowInterpretation
    >,
  calculatedTenGod:
    string,
) {
  const natalBalance =
    findNatalBalanceContribution(
      assessment,
    );

  const dayMasterStrengthFact =
    natalFacts
      .structureFacts
      .find(
        (
          fact,
        ) =>
          fact.category
          === "dayMasterStrength",
      );

  const dayMasterStrengthSignal =
    dayMasterStrengthFact
      ?.signal
      ?.kind
    === "dayMasterStrength"
      ? dayMasterStrengthFact
        .signal
      : null;

  return {
    dayMaster:
      natalFacts.dayMaster,

    calculatedTargetTenGod:
      calculatedTenGod,

    elementDistribution:
      natalFacts.elementDistribution,

    dayMasterStrength:
      dayMasterStrengthSignal
        ?.type
      ?? null,

    natalBalanceEffect:
      natalBalance
        ?.effect
      ?? null,

    natalBalanceDescription:
      natalBalance
        ?.description
      ?? null,

    overallTheme:
      assessment.overallTheme,

    supportiveSignals:
      assessment.supportiveSignals,

    tensionSignals:
      assessment.tensionSignals,

    limitations:
      assessment.limitations,
  };
}

function formatYearSegmentReport(
  segments:
    readonly {
      ganZhi:
        string;

      startDate:
        string;

      endDate:
        string;

      tenGod:
        string;
    }[],
): string {
  return segments
    .map(
      (
        segment,
      ) =>
        `${segment.ganZhi}(${segment.tenGod}) ${segment.startDate}~${segment.endDate}`,
    )
    .join(" | ");
}

function extractSeunGanZhiFromTemporalDescription(
  description:
    string,
): string | null {
  const match =
    /(?:세운|연운)\s+([^\(]+)\(/.exec(
      description,
    );

  return match
    ? match[1].trim()
    : null;
}

function findSeunTemporalContribution(
  contributions:
    readonly LifeFlowSignalContribution[],
): LifeFlowSignalContribution | undefined {
  return contributions.find(
    (
      contribution,
    ) =>
      contribution.evidenceFamily
      === "temporalLayer"
      && /^(?:세운|연운)\s+/.test(
        contribution.description,
      ),
  );
}

function countFamiliesByEffect(
  contributions:
    readonly LifeFlowSignalContribution[],
  effect:
    LifeFlowSignalContribution["effect"],
): number {
  const families =
    new Set<
      LifeFlowSignalContribution["evidenceFamily"]
    >();

  for (
    const contribution
    of contributions
  ) {
    if (
      contribution.effect
      === effect
    ) {
      families.add(
        contribution.evidenceFamily,
      );
    }
  }

  return families.size;
}

function recordCheck(
  checks:
    Record<string, boolean>,
  failures:
    string[],
  name:
    string,
  passed:
    boolean,
  actual:
    string,
): void {
  checks[name] =
    passed;

  if (
    !passed
  ) {
    failures.push(
      `${name}: ${actual}`,
    );
  }
}

function buildPipeline(
  birthDate:
    string,
  birthTime:
    string = "14:30",
) {
  return buildSajuFactsPipeline({
    name:
      "테스트",

    birthDate,

    birthTime,

    gender:
      "male",

    calendarType:
      "solar",

    referenceDate:
      REFERENCE_DATE,

    luckStartMethod:
      "minuteBased",
  });
}

function buildLifeFlowDecisionInput(
  question:
    string,
  pipeline:
    ReturnType<
      typeof buildPipeline
    >,
) {
  const regressionInput =
    buildDecisionEngineRegressionInput();

  const readerResult =
    readQuestion(
      regressionInput
        .humanContext,
      question,
    );

  const questionContext =
    buildQuestionContext(
      readerResult,
    );

  const targetBuild =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipeline,

      normalizedQuestion:
        readerResult
          .normalizedQuestion,
    });

  return {
    ...regressionInput,

    selfSajuFacts:
      pipeline.facts,

    question:
      readerResult,

    questionContext,

    lifeFlowTarget:
      targetBuild
        ?.target,

    targetPeriodLuckFlow:
      targetBuild
        ?.fact
      ?? undefined,
  };
}

function withSharedSeunTenGod(
  fact:
    SajuTargetPeriodLuckFlowFact,
  tenGod:
    SajuTargetPeriodLuckFlowFact["targetSeun"]["tenGod"],
): SajuTargetPeriodLuckFlowFact {
  return {
    ...fact,

    targetSeun: {
      ...fact.targetSeun,

      tenGod,
    },
  };
}

function countSupportiveFamilies(
  contributions:
    readonly LifeFlowSignalContribution[],
): number {
  const families =
    new Set<
      LifeFlowSignalContribution["evidenceFamily"]
    >();

  for (
    const contribution
    of contributions
  ) {
    if (
      contribution.effect
      === "supportive"
    ) {
      families.add(
        contribution.evidenceFamily,
      );
    }
  }

  return families.size;
}

function countTensionFamilies(
  contributions:
    readonly LifeFlowSignalContribution[],
): number {
  const families =
    new Set<
      LifeFlowSignalContribution["evidenceFamily"]
    >();

  for (
    const contribution
    of contributions
  ) {
    if (
      contribution.effect
      === "tension"
    ) {
      families.add(
        contribution.evidenceFamily,
      );
    }
  }

  return families.size;
}

function userFacingResultsDiffer(
  left:
    ReturnType<
      typeof assessLifeFlowInterpretation
    >,
  right:
    ReturnType<
      typeof assessLifeFlowInterpretation
    >,
): boolean {
  return (
    left.overallTheme
    !== right.overallTheme
    || JSON.stringify(
        left.supportiveSignals,
      )
    !== JSON.stringify(
        right.supportiveSignals,
      )
    || JSON.stringify(
        left.tensionSignals,
      )
    !== JSON.stringify(
        right.tensionSignals,
      )
    || JSON.stringify(
        left.periodSegments.map(
          (
            segment,
          ) => ({
            key:
              segment.key,
            theme:
              segment.theme,
            ganZhi:
              segment.ganZhi,
          }),
        ),
      )
    !== JSON.stringify(
        right.periodSegments.map(
          (
            segment,
          ) => ({
            key:
              segment.key,
            theme:
              segment.theme,
            ganZhi:
              segment.ganZhi,
          }),
        ),
      )
  );
}

export function verifyLifeFlowInterpretationAssessment(): {
  passed:
    boolean;

  checks:
    Record<
      string,
      boolean
    >;

  failures:
    string[];

  sameTenGodComparison?:
    {
      calculatedTenGod:
        string;

      fixtureA:
        ReturnType<
          typeof buildComparisonFixtureReport
        >;

      fixtureB:
        ReturnType<
          typeof buildComparisonFixtureReport
        >;
    };
} {
  const failures: string[] = [];
  const checks: Record<
    string,
    boolean
  > = {};

  const regressionInput =
    buildDecisionEngineRegressionInput();

  const pipelineA =
    buildPipeline(
      "1990-05-15",
    );

  const target =
    resolveLifeFlowTarget(
      "2026년 연운은 어떨까요?",
      REFERENCE_DATE,
    );

  const calculatedComparisonTenGod =
    resolveCalculatedTenGod(
      COMPARISON_DAY_MASTER,
      COMPARISON_PERIOD_HEAVENLY_STEM,
    );

  const sharedNatalComparisonFact =
    buildSharedNatalComparisonFact(
      calculatedComparisonTenGod,
    );

  const natalFactsA =
    buildComparisonNatalFacts({
      dayMasterStrength:
        "weak",

      elementDistribution: {
        wood:
          2,
        fire:
          2,
        earth:
          1,
        metal:
          2,
        water:
          3,
      },

      strongestElement:
        "water",

      monthCommandSupported:
        true,

      pillars: [
        {
          position:
            "year",

          ganZhi:
            "甲子",

          heavenlyStem:
            "甲",

          earthlyBranch:
            "子",
        },
        {
          position:
            "month",

          ganZhi:
            "乙酉",

          heavenlyStem:
            "乙",

          earthlyBranch:
            "酉",
        },
        {
          position:
            "day",

          ganZhi:
            "庚辰",

          heavenlyStem:
            COMPARISON_DAY_MASTER,

          earthlyBranch:
            "辰",
        },
        {
          position:
            "time",

          ganZhi:
            "壬午",

          heavenlyStem:
            "壬",

          earthlyBranch:
            "午",
        },
      ],

      interactionFacts: [
        {
          type:
            "combination",

          targets:
            [
              "day",
              "month",
            ],

          description:
            "원국 A 합",

          strength:
            "medium",
        },
      ],

      template:
        pipelineA.facts,
    });

  const natalFactsB =
    buildComparisonNatalFacts({
      dayMasterStrength:
        "strong",

      elementDistribution: {
        wood:
          1,
        fire:
          1,
        earth:
          4,
        metal:
          2,
        water:
          2,
      },

      strongestElement:
        "earth",

      monthCommandSupported:
        false,

      pillars: [
        {
          position:
            "year",

          ganZhi:
            "戊戌",

          heavenlyStem:
            "戊",

          earthlyBranch:
            "戌",
        },
        {
          position:
            "month",

          ganZhi:
            "己未",

          heavenlyStem:
            "己",

          earthlyBranch:
            "未",
        },
        {
          position:
            "day",

          ganZhi:
            "庚申",

          heavenlyStem:
            COMPARISON_DAY_MASTER,

          earthlyBranch:
            "申",
        },
        {
          position:
            "time",

          ganZhi:
            "辛酉",

          heavenlyStem:
            "辛",

          earthlyBranch:
            "酉",
        },
      ],

      interactionFacts: [
        {
          type:
            "clash",

          targets:
            [
              "day",
              "year",
            ],

          description:
            "원국 B 충",

          strength:
            "strong",
        },
      ],

      template:
        pipelineA.facts,
    });

  const structureComparisonAssessmentA =
    assessLifeFlowInterpretation({
      humanContext:
        regressionInput
          .humanContext,

      selfSajuFacts:
        natalFactsA,

      target,

      targetPeriodLuckFlow:
        sharedNatalComparisonFact,
    });

  const structureComparisonAssessmentB =
    assessLifeFlowInterpretation({
      humanContext:
        regressionInput
          .humanContext,

      selfSajuFacts:
        natalFactsB,

      target,

      targetPeriodLuckFlow:
        sharedNatalComparisonFact,
    });

  const sameTenGodComparison = {
    calculatedTenGod:
      calculatedComparisonTenGod,

    fixtureA:
      buildComparisonFixtureReport(
        natalFactsA,
        structureComparisonAssessmentA,
        calculatedComparisonTenGod,
      ),

    fixtureB:
      buildComparisonFixtureReport(
        natalFactsB,
        structureComparisonAssessmentB,
        calculatedComparisonTenGod,
      ),
  };

  recordCheck(
    checks,
    failures,
    "testFixtureTenGodMatchesCalculatedTenGod",
    sharedNatalComparisonFact
      .targetSeun
      .tenGod
    === calculatedComparisonTenGod,
    `fixtureTenGod=${sharedNatalComparisonFact.targetSeun.tenGod}, calculated=${calculatedComparisonTenGod}`,
  );

  recordCheck(
    checks,
    failures,
    "sameDayMasterSameTenGodDifferentNatalStructureChangesMeaningfulResult",
    meaningfulNatalStructureResultsDiffer(
      structureComparisonAssessmentA,
      structureComparisonAssessmentB,
    ),
    `natalBalanceA=${sameTenGodComparison.fixtureA.natalBalanceEffect}/${sameTenGodComparison.fixtureA.natalBalanceDescription ?? "null"} | natalBalanceB=${sameTenGodComparison.fixtureB.natalBalanceEffect}/${sameTenGodComparison.fixtureB.natalBalanceDescription ?? "null"} | themeA=${sameTenGodComparison.fixtureA.overallTheme} | themeB=${sameTenGodComparison.fixtureB.overallTheme}`,
  );

  recordCheck(
    checks,
    failures,
    "sameTenGodComparisonIsNotIdentifierOnly",
    natalFactsA.name
    === natalFactsB.name
      && natalFactsA.birthDate
      === natalFactsB.birthDate
      && natalFactsA.dayMaster
      === natalFactsB.dayMaster
      && meaningfulNatalStructureResultsDiffer(
        structureComparisonAssessmentA,
        structureComparisonAssessmentB,
      ),
    `sharedIdentifiers=name:${natalFactsA.name}, birthDate:${natalFactsA.birthDate}, dayMaster:${natalFactsA.dayMaster} | natalBalanceA=${sameTenGodComparison.fixtureA.natalBalanceEffect} | natalBalanceB=${sameTenGodComparison.fixtureB.natalBalanceEffect} | themeA=${sameTenGodComparison.fixtureA.overallTheme} | themeB=${sameTenGodComparison.fixtureB.overallTheme}`,
  );

  recordCheck(
    checks,
    failures,
    "sameTenGodDifferentNatalFactsProduceDifferentAssessment",
    meaningfulNatalStructureResultsDiffer(
      structureComparisonAssessmentA,
      structureComparisonAssessmentB,
    ),
    `natalBalanceA=${sameTenGodComparison.fixtureA.natalBalanceEffect} | natalBalanceB=${sameTenGodComparison.fixtureB.natalBalanceEffect} | themeA=${sameTenGodComparison.fixtureA.overallTheme} | themeB=${sameTenGodComparison.fixtureB.overallTheme}`,
  );

  const flowBuild =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipelineA,

      normalizedQuestion:
        "2026년 연운은 어떨까요?",
    });

  const sharedFact =
    flowBuild
      ?.fact;

  const sharedTenGod =
    sharedFact
      ?.targetSeun
      .tenGod
    ?? "정재";

  const factWithSharedTenGod =
    sharedFact
      ? withSharedSeunTenGod(
          sharedFact,
          sharedTenGod,
        )
      : null;

  const assessmentA =
    factWithSharedTenGod
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            pipelineA.facts,

          target,

          targetPeriodLuckFlow:
            factWithSharedTenGod,
        })
      : null;

  recordCheck(
    checks,
    failures,
    "tenGodAloneDoesNotCreateSupportiveVerdict",
    Boolean(
      assessmentA
      && (
        countSupportiveFamilies(
          assessmentA
            .signalContributions,
        )
        < 2
          ? assessmentA
            .supportiveSignals
            .length
            === 0
          : (
            countSupportiveFamilies(
              assessmentA
                .signalContributions,
            )
            >= 2
            || assessmentA
              .supportiveSignals
              .length
            === 0
          )
      ),
    ),
    `supportiveAxes=${assessmentA ? countSupportiveFamilies(assessmentA.signalContributions) : 0}, supportiveSignals=${assessmentA?.supportiveSignals.length ?? 0}`,
  );

  recordCheck(
    checks,
    failures,
    "tenGodAloneDoesNotCreateTensionVerdict",
    Boolean(
      assessmentA
      && (
        countTensionFamilies(
          assessmentA
            .signalContributions,
        )
        < 2
          ? assessmentA
            .tensionSignals
            .length
            === 0
          : (
            countTensionFamilies(
              assessmentA
                .signalContributions,
            )
            >= 2
            || assessmentA
              .tensionSignals
              .length
            === 0
          )
      ),
    ),
    `tensionAxes=${assessmentA ? countTensionFamilies(assessmentA.signalContributions) : 0}, tensionSignals=${assessmentA?.tensionSignals.length ?? 0}`,
  );

  const assessmentSource =
    readFileSync(
      join(
        dirname(
          fileURLToPath(
            import.meta.url,
          ),
        ),
        "lifeFlowInterpretationAssessment.ts",
      ),
      "utf8",
    );

  recordCheck(
    checks,
    failures,
    "noUniversalGoodTenGodList",
    !assessmentSource.includes(
      "classifySignal",
    )
      && !assessmentSource.includes(
        '"식신",\n      "정재"',
      ),
    "classifySignal or fixed good list still present",
  );

  recordCheck(
    checks,
    failures,
    "noUniversalBadTenGodList",
    !assessmentSource.includes(
      '"겁재",\n      "상관"',
    ),
    "fixed bad ten god list still present",
  );

  recordCheck(
    checks,
    failures,
    "elementBalanceUsesNatalDistribution",
    Boolean(
      assessmentA
      && assessmentA
        .signalContributions
        .some(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "natalBalance"
            && contribution.description.includes(
              "원국 오행 분포",
            ),
        ),
    ),
    assessmentA
      ?.signalContributions
      .map(
        (
          contribution,
        ) =>
          `${contribution.evidenceFamily}:${contribution.description.slice(0, 40)}`,
      )
      .join(" | ")
      ?? "no assessment",
  );

  const weakDayMasterFacts:
    SajuFacts = {
    ...pipelineA.facts,

    structureFacts:
      pipelineA
        .facts
        .structureFacts
        .map(
          (
            fact,
          ) => {
            if (
              fact.signal
                ?.kind
              !== "dayMasterStrength"
            ) {
              return fact;
            }

            return {
              ...fact,

              signal: {
                kind:
                  "dayMasterStrength",

                type:
                  "weak",

                score:
                  2,

                supportScore:
                  2,

                opposingScore:
                  6,

                monthCommandScore:
                  1,

                rootingScore:
                  1,
              },
            } satisfies SajuStructureFact;
          },
        ),
  };

  const strongDayMasterFacts:
    SajuFacts = {
    ...pipelineA.facts,

    structureFacts:
      pipelineA
        .facts
        .structureFacts
        .map(
          (
            fact,
          ) => {
            if (
              fact.signal
                ?.kind
              !== "dayMasterStrength"
            ) {
              return fact;
            }

            return {
              ...fact,

              signal: {
                kind:
                  "dayMasterStrength",

                type:
                  "strong",

                score:
                  8,

                supportScore:
                  8,

                opposingScore:
                  2,

                monthCommandScore:
                  3,

                rootingScore:
                  3,
              },
            } satisfies SajuStructureFact;
          },
        ),
  };

  const weakAssessment =
    factWithSharedTenGod
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            weakDayMasterFacts,

          target,

          targetPeriodLuckFlow:
            factWithSharedTenGod,
        })
      : null;

  const strongAssessment =
    factWithSharedTenGod
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            strongDayMasterFacts,

          target,

          targetPeriodLuckFlow:
            factWithSharedTenGod,
        })
      : null;

  recordCheck(
    checks,
    failures,
    "dayMasterStrengthAffectsPeriodInterpretation",
    Boolean(
      weakAssessment
      && strongAssessment
      && JSON.stringify(
          weakAssessment
            .signalContributions
            .find(
              (
                contribution,
              ) =>
                contribution.evidenceFamily
                === "natalBalance",
            ),
        )
      !== JSON.stringify(
          strongAssessment
            .signalContributions
            .find(
              (
                contribution,
              ) =>
                contribution.evidenceFamily
                === "natalBalance",
            ),
        ),
    ),
    `weak=${weakAssessment?.signalContributions.find((item) => item.evidenceFamily === "natalBalance")?.effect ?? "none"}, strong=${strongAssessment?.signalContributions.find((item) => item.evidenceFamily === "natalBalance")?.effect ?? "none"}`,
  );

  recordCheck(
    checks,
    failures,
    "periodInteractionIdentifiesNatalPillarPosition",
    Boolean(
      assessmentA
      && assessmentA
        .periodInteractions
        .length
      > 0
      && assessmentA
        .periodInteractions
        .every(
          (
            interaction,
          ) =>
            [
              "year",
              "month",
              "day",
              "time",
            ].includes(
              interaction
                .natalPillarPosition,
            ),
        ),
    ),
    `interactionCount=${assessmentA?.periodInteractions.length ?? 0}`,
  );

  const syntheticClashInteractions =
    assessLifeFlowPeriodInteractions(
      [
        {
          position:
            "day",

          ganZhi:
            "庚子",

          heavenlyStem:
            "庚",

          earthlyBranch:
            "子",
        },
      ],
      [
        {
          key:
            "seun",

          targetFlow:
            "seun",

          flowLabel:
            "세운",

          ganZhi:
            "甲午",

          heavenlyStem:
            "甲",

          earthlyBranch:
            "午",
        },
      ],
    );

  const syntheticClashFact:
    SajuTargetPeriodLuckFlowFact =
    {
      targetStartDate:
        "2026-01-01",

      targetEndDate:
        "2026-12-31",

      currentDaeun:
        null,

      targetSeun: {
        year:
          2026,

        age:
          36,

        ganZhi:
          "甲午",

        heavenlyStem:
          "甲",

        earthlyBranch:
          "午",

        tenGod:
          "편재",

        element:
          "fire",
      },

      yearSegments:
        [],

      wolunSegments:
        [],

      targetIlun:
        null,

      limitations:
        [],
    };

  const clashNatalFacts:
    SajuFacts = {
    ...pipelineA.facts,

    pillars:
      [
        {
          position:
            "day",

          ganZhi:
            "庚子",

          heavenlyStem:
            "庚",

          earthlyBranch:
            "子",
        },
      ],

    dayMaster:
      "庚",

    structureFacts:
      strongDayMasterFacts
        .structureFacts,
  };

  const clashStrongAssessment =
    assessLifeFlowInterpretation({
      humanContext:
        regressionInput
          .humanContext,

      selfSajuFacts:
        clashNatalFacts,

      target,

      targetPeriodLuckFlow:
        syntheticClashFact,
    });

  recordCheck(
    checks,
    failures,
    "clashIsNotAlwaysBad",
    syntheticClashInteractions.some(
      (
        interaction,
      ) =>
        interaction.type
        === "clash",
    )
      && clashStrongAssessment
        .signalContributions
        .some(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "periodInteraction"
            && contribution
              .description
              .includes(
                "충",
              )
            && contribution.effect
            !== "tension",
        ),
    `syntheticClashCount=${syntheticClashInteractions.filter((item) => item.type === "clash").length}, clashEffect=${clashStrongAssessment.signalContributions.find((item) => item.evidenceFamily === "periodInteraction")?.effect ?? "none"}`,
  );

  const combinationInteraction =
    assessmentA
      ?.periodInteractions
      .find(
        (
          interaction,
        ) =>
          interaction.type
          === "combination",
      );

  recordCheck(
    checks,
    failures,
    "combinationIsNotAlwaysGood",
    Boolean(
      combinationInteraction
      && weakAssessment
      && weakAssessment
        .signalContributions
        .some(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "periodInteraction"
            && contribution
              .description
              .includes(
                "합",
              )
            && contribution.effect
            !== "supportive",
        ),
    ),
    combinationInteraction
      ? `combinationEffect=${weakAssessment?.signalContributions.find((item) => item.evidenceFamily === "periodInteraction")?.effect ?? "none"}`
      : "no combination interaction in sample",
  );

  recordCheck(
    checks,
    failures,
    "periodInteractionClashIsNeutralWithoutIndependentResolver",
    Boolean(
      clashStrongAssessment
        .signalContributions
        .filter(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "periodInteraction"
            && (
              contribution
                .description
                .includes(
                  "clash",
                )
              || contribution
                .description
                .includes(
                  "충",
                )
            ),
        )
        .every(
          (
            contribution,
          ) =>
            contribution.effect
            === "neutral",
        ),
    ),
    `clashContributions=${clashStrongAssessment.signalContributions.filter((item) => item.evidenceFamily === "periodInteraction").map((item) => `${item.effect}:${item.description.slice(0, 60)}`).join(" | ") || "none"}`,
  );

  recordCheck(
    checks,
    failures,
    "periodInteractionDoesNotReuseDayMasterStrengthAsSecondVote",
    Boolean(
      assessmentA
      && assessmentA
        .signalContributions
        .filter(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "periodInteraction",
        )
        .every(
          (
            contribution,
          ) =>
            contribution.effect
            === "neutral"
            && !contribution.sourceKeys.includes(
              "dayMasterStrength",
            )
            && !contribution.description.includes(
              "일간",
            ),
        )
      && clashStrongAssessment
        .signalContributions
        .filter(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "periodInteraction",
        )
        .every(
          (
            contribution,
          ) =>
            contribution.effect
            === "neutral",
        ),
    ),
    `periodInteractionEffects=${assessmentA?.signalContributions.filter((item) => item.evidenceFamily === "periodInteraction").map((item) => item.effect).join(",") ?? "none"}`,
  );

  const punishmentBreakHarmInteractions =
    assessLifeFlowPeriodInteractions(
      [
        {
          position:
            "day",

          ganZhi:
            "庚寅",

          heavenlyStem:
            "庚",

          earthlyBranch:
            "寅",
        },
        {
          position:
            "month",

          ganZhi:
            "己巳",

          heavenlyStem:
            "己",

          earthlyBranch:
            "巳",
        },
      ],
      [
        {
          key:
            "seun",

          targetFlow:
            "seun",

          flowLabel:
            "세운",

          ganZhi:
            "壬申",

          heavenlyStem:
            "壬",

          earthlyBranch:
            "申",
        },
      ],
    );

  const punishmentBreakHarmFact:
    SajuTargetPeriodLuckFlowFact =
    {
      ...syntheticClashFact,

      targetSeun: {
        year:
          2026,

        age:
          36,

        ganZhi:
          "壬申",

        heavenlyStem:
          "壬",

        earthlyBranch:
          "申",

        tenGod:
          "식신",

        element:
          "water",
      },
    };

  const punishmentBreakHarmAssessment =
    assessLifeFlowInterpretation({
      humanContext:
        regressionInput
          .humanContext,

      selfSajuFacts:
        clashNatalFacts,

      target,

      targetPeriodLuckFlow:
        punishmentBreakHarmFact,
    });

  const punishmentBreakHarmTypes =
    new Set(
      [
        "punishment",
        "break",
        "harm",
        "mixed",
      ],
    );

  recordCheck(
    checks,
    failures,
    "punishmentBreakHarmRemainNeutralObservations",
    punishmentBreakHarmInteractions.some(
      (
        interaction,
      ) =>
        punishmentBreakHarmTypes.has(
          interaction.type,
        ),
    )
      && punishmentBreakHarmAssessment
        .signalContributions
        .filter(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "periodInteraction",
        )
        .every(
          (
            contribution,
          ) =>
            contribution.effect
            === "neutral",
        ),
    `interactionTypes=${punishmentBreakHarmInteractions.map((item) => item.type).join(",") || "none"}, periodInteractionEffects=${punishmentBreakHarmAssessment.signalContributions.filter((item) => item.evidenceFamily === "periodInteraction").map((item) => `${item.effect}:${item.description.slice(0, 40)}`).join(" | ") || "none"}`,
  );

  recordCheck(
    checks,
    failures,
    "natalBalanceAndPeriodInteractionDoNotCreateFalseTwoAxisConsensus",
    Boolean(
      clashStrongAssessment
      && countSupportiveFamilies(
          clashStrongAssessment
            .signalContributions,
        )
      <= 1
      && countTensionFamilies(
          clashStrongAssessment
            .signalContributions,
        )
      <= 1
      && !clashStrongAssessment
        .signalContributions
        .some(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "periodInteraction"
            && contribution.effect
            !== "neutral",
        ),
    ),
    `supportiveFamilies=${countSupportiveFamilies(clashStrongAssessment.signalContributions)}, tensionFamilies=${countTensionFamilies(clashStrongAssessment.signalContributions)}, periodInteractionDirectional=${clashStrongAssessment.signalContributions.some((item) => item.evidenceFamily === "periodInteraction" && item.effect !== "neutral")}`,
  );

  recordCheck(
    checks,
    failures,
    "evidenceFamiliesDoNotShareDirectionalSourceKeys",
    Boolean(
      assessmentA
      && findCrossFamilySourceKeyDuplication(
          assessmentA
            .signalContributions,
        ).length
      === 0
      && findCrossFamilySourceKeyDuplication(
          clashStrongAssessment
            .signalContributions,
        ).length
      === 0
      && findCrossFamilySourceKeyDuplication(
          structureComparisonAssessmentA
            .signalContributions,
        ).length
      === 0,
    ),
    `assessmentA=${findCrossFamilySourceKeyDuplication(assessmentA?.signalContributions ?? []).join(";") || "none"} | clash=${findCrossFamilySourceKeyDuplication(clashStrongAssessment.signalContributions).join(";") || "none"}`,
  );

  recordCheck(
    checks,
    failures,
    "twoIndependentFamiliesRequiredForDirectionalSignal",
    Boolean(
      assessmentA
      && (
        (
          countSupportiveFamilies(
            assessmentA
              .signalContributions,
          )
          < 2
          && assessmentA
            .supportiveSignals
            .length
          === 0
        )
        || countSupportiveFamilies(
            assessmentA
              .signalContributions,
          )
        >= 2
      )
      && (
        (
          countTensionFamilies(
            assessmentA
              .signalContributions,
          )
          < 2
          && assessmentA
            .tensionSignals
            .length
          === 0
        )
        || countTensionFamilies(
            assessmentA
              .signalContributions,
          )
        >= 2
      )
    ),
    `supportiveAxes=${assessmentA ? countSupportiveFamilies(assessmentA.signalContributions) : 0}, tensionAxes=${assessmentA ? countTensionFamilies(assessmentA.signalContributions) : 0}`,
  );

  recordCheck(
    checks,
    failures,
    "missingUsefulGodDoesNotFabricateEvidence",
    Boolean(
      assessmentA
      && !pipelineA
        .facts
        .usefulGod
      && !assessmentA
        .signalContributions
        .some(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "explicitGod",
        ),
    ),
    `explicitGodFamily=${assessmentA?.signalContributions.some((item) => item.evidenceFamily === "explicitGod") ?? false}`,
  );

  const conflictingFacts:
    SajuFacts = {
    ...pipelineA.facts,

    usefulGod:
      "water",

    structureFacts:
      pipelineA
        .facts
        .structureFacts,
  };

  const conflictingAssessment =
    factWithSharedTenGod
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            conflictingFacts,

          target,

          targetPeriodLuckFlow:
            factWithSharedTenGod,
        })
      : null;

  recordCheck(
    checks,
    failures,
    "conflictingAxesCreateLimitationOrNeutralResult",
    Boolean(
      conflictingAssessment
      && (
        conflictingAssessment
          .limitations
          .some(
            (
              limitation,
            ) =>
              limitation.includes(
                "엇갈",
              )
              || limitation.includes(
                "하나뿐",
              ),
          )
        || (
          conflictingAssessment
            .supportiveSignals
            .length
          === 0
          && conflictingAssessment
            .tensionSignals
            .length
          === 0
        )
      ),
    ),
    `supportive=${conflictingAssessment?.supportiveSignals.length ?? 0}, tension=${conflictingAssessment?.tensionSignals.length ?? 0}, limitations=${conflictingAssessment?.limitations.join(" | ") ?? "none"}`,
  );

  const deterministicA =
    factWithSharedTenGod
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            pipelineA.facts,

          target,

          targetPeriodLuckFlow:
            factWithSharedTenGod,
        })
      : null;

  const deterministicB =
    factWithSharedTenGod
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            pipelineA.facts,

          target,

          targetPeriodLuckFlow:
            factWithSharedTenGod,
        })
      : null;

  recordCheck(
    checks,
    failures,
    "sameInputProducesSameAssessment",
    JSON.stringify(
      deterministicA,
    )
    === JSON.stringify(
      deterministicB,
    ),
    "deterministic assessments differ",
  );

  const missingTargetDecision =
    buildLifeFlowInterpretationDecisionResult({
      ...regressionInput,

      questionContext:
        {
          ...regressionInput
            .questionContext,

          requirements:
            {
              ...regressionInput
                .questionContext
                .requirements,

              lifeFlowInterpretationAnalysisRequired:
                true,
            },
        },

      lifeFlowTarget:
        undefined,

      targetPeriodLuckFlow:
        undefined,
    });

  recordCheck(
    checks,
    failures,
    "targetMissingHasNo1970Fallback",
    !JSON.stringify(
      missingTargetDecision,
    ).includes(
      "1970-01-01",
    )
      && missingTargetDecision
        .lifeFlowInterpretationAssessment
        ?.target
      === null,
    `target=${missingTargetDecision.lifeFlowInterpretationAssessment?.target ?? "undefined"}, serializedContains1970=${JSON.stringify(missingTargetDecision).includes("1970-01-01")}`,
  );

  const noCautionDecision =
    buildLifeFlowInterpretationDecisionResult(
      buildLifeFlowDecisionInput(
        "나의 총운은 어떨까요?",
        pipelineA,
      ),
    );

  recordCheck(
    checks,
    failures,
    "emptyCautionsDoNotCreateProhibitedBlock",
    (
      noCautionDecision
        .lifeFlowInterpretationAssessment
        ?.cautions
        .length
      ?? 0
    )
    === 0
      ? noCautionDecision
        .prohibitedDirection
        === ""
      : noCautionDecision
        .prohibitedDirection
        .length
      > 0,
    `cautions=${noCautionDecision.lifeFlowInterpretationAssessment?.cautions.length ?? 0}, prohibitedDirection="${noCautionDecision.prohibitedDirection}"`,
  );

  const halfYearFlow =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipelineA,

      normalizedQuestion:
        "하반기 운세를 알려주세요",
    });

  const halfYearAssessment =
    assessLifeFlowInterpretation({
      humanContext:
        regressionInput
          .humanContext,

      selfSajuFacts:
        pipelineA.facts,

      target:
        halfYearFlow
          ?.target
        ?? resolveLifeFlowTarget(
          "하반기 운세를 알려주세요",
          REFERENCE_DATE,
        ),

      targetPeriodLuckFlow:
        halfYearFlow
          ?.fact
        ?? null,
    });

  recordCheck(
    checks,
    failures,
    "halfYearAssessmentUsesAllMonthSegments",
    (
      halfYearFlow
        ?.fact
        ?.wolunSegments
        .length
      ?? 0
    )
    >= 6
      && halfYearAssessment
        .periodSegments
        .length
      >= 6,
    `wolunSegments=${halfYearFlow?.fact?.wolunSegments.length ?? 0}, periodSegments=${halfYearAssessment.periodSegments.length}`,
  );

  const dayFlow =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipelineA,

      normalizedQuestion:
        "오늘의 운세는 어떨까요?",
    });

  const expectedIlun =
    buildV3TargetIlun(
      REFERENCE_DATE,
    );

  recordCheck(
    checks,
    failures,
    "todayAssessmentUsesExactIlun",
    dayFlow
      ?.fact
      ?.targetIlun
      ?.ganZhi
      === expectedIlun.ganZhi
      && halfYearAssessment
        .sourceLocked
      === true,
    `expected=${expectedIlun.ganZhi}, actual=${dayFlow?.fact?.targetIlun?.ganZhi ?? "null"}`,
  );

  recordCheck(
    checks,
    failures,
    "sourceLockedIsTrue",
    Boolean(
      assessmentA
      && assessmentA
        .sourceLocked
      === true
      && noCautionDecision
        .lifeFlowInterpretationAssessment
        ?.sourceLocked
      === true,
    ),
    `assessmentA=${assessmentA?.sourceLocked ?? false}, decision=${noCautionDecision.lifeFlowInterpretationAssessment?.sourceLocked ?? false}`,
  );

  const lifeFlowDecision =
    runDecisionEngine(
      buildLifeFlowDecisionInput(
        "올해 총운을 봐주세요",
        pipelineA,
      ),
    );

  const explanationInput =
    readDecisionResult(
      lifeFlowDecision,
    );

  const explanationPlan =
    buildDecisionExplanationPlan(
      explanationInput,
      "올해 총운을 봐주세요",
    );

  const explanationPayload =
    buildDecisionExplanationPayload(
      explanationPlan,
    );

  const prompt =
    buildConsultingPrompt(
      explanationPayload,
    );

  recordCheck(
    checks,
    failures,
    "gptPromptContainsOnlyCalculatedAssessmentEvidence",
    prompt.systemPrompt.includes(
      "제공된 Evidence와 계산된 대운·세운·월운·일운 Fact만 설명한다",
    )
      && explanationPayload
        .explanationOrder
        .every(
          (
            section,
          ) =>
            !section
              .content
              .includes(
                "1970-01-01",
              ),
        )
      && Boolean(
        lifeFlowDecision
          .lifeFlowInterpretationAssessment
          ?.overallTheme,
      ),
    `promptHasRule=${prompt.systemPrompt.includes("제공된 Evidence와 계산된 대운·세운·월운·일운 Fact만 설명한다")}`,
  );

  recordCheck(
    checks,
    failures,
    "noTargetSeunOverwriteInSource",
    !assessmentSource.includes(
      "...fact.targetSeun",
    ),
    "targetSeun spread overwrite pattern still present",
  );

  recordCheck(
    checks,
    failures,
    "natalBalanceNotDuplicatedAsIndependentAxes",
    Boolean(
      assessmentA
      && !assessmentA
        .signalContributions
        .some(
          (
            contribution,
          ) =>
            (
              contribution.evidenceKey
                .includes(
                  "dayMasterStrength",
                )
              || contribution.evidenceKey
                .includes(
                  "elementBalance",
                )
              || contribution.evidenceKey
                .includes(
                  "structure-",
                )
            )
            && contribution.evidenceFamily
            !== "natalBalance",
        ),
    ),
    assessmentA
      ?.signalContributions
      .map(
        (
          item,
        ) =>
          item.evidenceFamily,
      )
      .join(",")
      ?? "none",
  );

  recordCheck(
    checks,
    failures,
    "daeunSameElementNotAutoSupportive",
    Boolean(
      assessmentA
      && assessmentA
        .signalContributions
        .filter(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "temporalLayer",
        )
        .every(
          (
            contribution,
          ) =>
            contribution.effect
            !== "supportive",
        ),
    ),
    `temporalSupportive=${assessmentA?.signalContributions.filter((item) => item.evidenceFamily === "temporalLayer" && item.effect === "supportive").length ?? 0}`,
  );

  recordCheck(
    checks,
    failures,
    "daeunClashNotAutoTension",
    Boolean(
      assessmentA
      && assessmentA
        .signalContributions
        .filter(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "temporalLayer",
        )
        .every(
          (
            contribution,
          ) =>
            contribution.effect
            !== "tension",
        ),
    ),
    `temporalTension=${assessmentA?.signalContributions.filter((item) => item.evidenceFamily === "temporalLayer" && item.effect === "tension").length ?? 0}`,
  );

  recordCheck(
    checks,
    failures,
    "currentPhaseMismatchNotAutoTension",
    Boolean(
      assessmentA
      && assessmentA
        .signalContributions
        .filter(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "currentPhase",
        )
        .every(
          (
            contribution,
          ) =>
            contribution.effect
            !== "tension",
        ),
    ),
    `currentPhaseTension=${assessmentA?.signalContributions.filter((item) => item.evidenceFamily === "currentPhase" && item.effect === "tension").length ?? 0}`,
  );

  const monthTarget =
    resolveLifeFlowTarget(
      "2026년 12월 운세는 어떨까요?",
      REFERENCE_DATE,
    );

  const monthFlowBase =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipelineA,

      normalizedQuestion:
        "2026년 12월 운세는 어떨까요?",
    });

  const monthFactA =
    monthFlowBase?.fact;

  const monthFactB =
    monthFactA
      ? {
          ...monthFactA,

          wolunSegments:
            monthFactA
              .wolunSegments
              .map(
                (
                  segment,
                  index,
                ) =>
                  index
                  === 0
                    ? {
                        ...segment,

                        ganZhi:
                          "丙午",

                        heavenlyStem:
                          "丙",

                        earthlyBranch:
                          "午",

                        tenGod:
                          "편재" as const,

                        element:
                          "fire" as const,
                      }
                    : segment,
              ),
        }
      : null;

  const monthAssessmentA =
    monthFactA
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            pipelineA.facts,

          target:
            monthTarget,

          targetPeriodLuckFlow:
            monthFactA,
        })
      : null;

  const monthAssessmentB =
    monthFactB
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            pipelineA.facts,

          target:
            monthTarget,

          targetPeriodLuckFlow:
            monthFactB,
        })
      : null;

  recordCheck(
    checks,
    failures,
    "sameSeunDifferentWolunChangesMonthResult",
    Boolean(
      monthAssessmentA
      && monthAssessmentB
      && userFacingResultsDiffer(
          monthAssessmentA,
          monthAssessmentB,
        ),
    ),
    `themeA=${monthAssessmentA?.overallTheme ?? "null"}, themeB=${monthAssessmentB?.overallTheme ?? "null"}`,
  );

  recordCheck(
    checks,
    failures,
    "monthOverallThemeUsesWolunLayer",
    Boolean(
      monthAssessmentA
      && monthAssessmentA
        .overallTheme
        .includes(
          "월운",
        )
      && monthAssessmentA
        .periodSegments[0]
        ?.ganZhi
      && monthAssessmentA
        .overallTheme
        .includes(
          monthAssessmentA
            .periodSegments[0]
            .ganZhi,
        ),
    ),
    monthAssessmentA?.overallTheme
      ?? "null",
  );

  const dayTarget =
    resolveLifeFlowTarget(
      "오늘의 운세는 어떨까요?",
      REFERENCE_DATE,
    );

  const dayFactA =
    dayFlow?.fact;

  const dayFactB =
    dayFactA
      ? {
          ...dayFactA,

          targetIlun: {
            ...dayFactA.targetIlun!,

            ganZhi:
              "丁丑",

            heavenlyStem:
              "丁",

            earthlyBranch:
              "丑",

            tenGod:
              "정재" as const,

            element:
              "earth" as const,
          },
        }
      : null;

  const dayAssessmentA =
    dayFactA
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            pipelineA.facts,

          target:
            dayTarget,

          targetPeriodLuckFlow:
            dayFactA,
        })
      : null;

  const dayAssessmentB =
    dayFactB
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            pipelineA.facts,

          target:
            dayTarget,

          targetPeriodLuckFlow:
            dayFactB,
        })
      : null;

  recordCheck(
    checks,
    failures,
    "sameSeunDifferentIlunChangesDayResult",
    Boolean(
      dayAssessmentA
      && dayAssessmentB
      && userFacingResultsDiffer(
          dayAssessmentA,
          dayAssessmentB,
        ),
    ),
    `themeA=${dayAssessmentA?.overallTheme ?? "null"}, themeB=${dayAssessmentB?.overallTheme ?? "null"}`,
  );

  recordCheck(
    checks,
    failures,
    "dayOverallThemeUsesIlunLayer",
    Boolean(
      dayAssessmentA
      && dayAssessmentA
        .overallTheme
        .includes(
          "일운",
        )
      && dayAssessmentA
        .periodSegments[0]
        ?.ganZhi
      && dayAssessmentA
        .overallTheme
        .includes(
          dayAssessmentA
            .periodSegments[0]
            .ganZhi,
        ),
    ),
    dayAssessmentA?.overallTheme
      ?? "null",
  );

  recordCheck(
    checks,
    failures,
    "halfYearShowsWolunSegmentSequence",
    halfYearAssessment
      .overallTheme
      .includes(
        "→",
      )
      || halfYearAssessment
        .phaseInterpretation
        .includes(
          "→",
        ),
    `overallTheme=${halfYearAssessment.overallTheme}`,
  );

  recordCheck(
    checks,
    failures,
    "wolunDescriptionsDoNotMislabelAsSeun",
    Boolean(
      monthAssessmentA
      && monthAssessmentA
        .signalContributions
        .filter(
          (
            contribution,
          ) =>
            contribution.flowLabel
            === "월운",
        )
        .every(
          (
            contribution,
          ) =>
            !contribution.description.match(
              /^세운 /,
            ),
        )
    ),
    monthAssessmentA
      ?.signalContributions
      .filter(
        (
          item,
        ) =>
          item.flowLabel
          === "월운",
      )
      .map(
        (
          item,
        ) =>
          item.description.slice(
            0,
            30,
          ),
      )
      .join(" | ")
      ?? "none",
  );

  recordCheck(
    checks,
    failures,
    "ilunDescriptionsDoNotMislabelAsSeun",
    Boolean(
      dayAssessmentA
      && dayAssessmentA
        .signalContributions
        .every(
          (
            contribution,
          ) =>
            contribution.flowLabel
            !== "일운"
            || !contribution.description.startsWith(
              "세운 ",
            ),
        ),
    ),
    dayAssessmentA
      ?.signalContributions
      .map(
        (
          item,
        ) =>
          `${item.flowLabel}:${item.description.slice(0, 20)}`,
      )
      .join(" | ")
      ?? "none",
  );

  const aggregationSyntheticFact:
    SajuTargetPeriodLuckFlowFact =
    {
      ...syntheticClashFact,

      targetSeun: {
        year:
          2026,

        age:
          36,

        ganZhi:
          "戊午",

        heavenlyStem:
          "戊",

        earthlyBranch:
          "午",

        tenGod:
          "정재",

        element:
          "earth",
      },
    };

  const aggregationSupportiveFacts:
    SajuFacts = {
    ...weakDayMasterFacts,

    usefulGod:
      "earth",

    pillars:
      clashNatalFacts.pillars,
  };

  const aggregationAssessment =
    assessLifeFlowInterpretation({
      humanContext:
        regressionInput
          .humanContext,

      selfSajuFacts:
        aggregationSupportiveFacts,

      target,

      targetPeriodLuckFlow:
        aggregationSyntheticFact,
    });

  recordCheck(
    checks,
    failures,
    "supportiveTwoFamiliesPreservedWithSingleTensionCounterEvidence",
    Boolean(
      aggregationAssessment
      && countSupportiveFamilies(
          aggregationAssessment
            .signalContributions,
        )
      >= 2
      && aggregationAssessment
        .supportiveSignals
        .length
      > 0
      && aggregationAssessment
        .signalContributions
        .filter(
          (
            contribution,
          ) =>
            contribution.evidenceFamily
            === "periodInteraction",
        )
        .every(
          (
            contribution,
          ) =>
            contribution.effect
            === "neutral",
        )
      && (
        aggregationAssessment
          .limitations
          .some(
            (
              limitation,
            ) =>
              limitation.includes(
                "반대 근거",
              ),
          )
        || (
          countTensionFamilies(
            aggregationAssessment
              .signalContributions,
          )
          === 0
          && countSupportiveFamilies(
              aggregationAssessment
                .signalContributions,
            )
          >= 2
        )
      ),
    ),
    `supportiveFamilies=${aggregationAssessment ? countSupportiveFamilies(aggregationAssessment.signalContributions) : 0}, supportiveSignals=${aggregationAssessment?.supportiveSignals.length ?? 0}, tensionFamilies=${aggregationAssessment ? countTensionFamilies(aggregationAssessment.signalContributions) : 0}, periodInteractionDirectional=${aggregationAssessment?.signalContributions.some((item) => item.evidenceFamily === "periodInteraction" && item.effect !== "neutral") ?? false}`,
  );

  recordCheck(
    checks,
    failures,
    "aggregationIsDeterministicUnderReorderedContributions",
    Boolean(
      assessmentA
      && deterministicA
      && JSON.stringify(
          {
            supportiveSignals:
              assessmentA.supportiveSignals,
            tensionSignals:
              assessmentA.tensionSignals,
            signalContributions:
              assessmentA.signalContributions,
          },
        )
      === JSON.stringify(
          {
            supportiveSignals:
              deterministicA.supportiveSignals,
            tensionSignals:
              deterministicA.tensionSignals,
            signalContributions:
              deterministicA.signalContributions,
          },
        ),
    ),
    "reordered-input simulation differs",
  );

  const yearScopeTarget =
    resolveLifeFlowTarget(
      "2026년 연운은 어떨까요?",
      REFERENCE_DATE,
    );

  const yearScopeFact =
    flowBuild
      ?.fact
    ?? null;

  const yearScopeAssessment =
    yearScopeFact
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            pipelineA.facts,

          target:
            yearScopeTarget,

          targetPeriodLuckFlow:
            yearScopeFact,
        })
      : null;

  const yearSegmentReport =
    formatYearSegmentReport(
      yearScopeFact
        ?.yearSegments
      ?? [],
    );

  const yearPrimaryReport =
    yearScopeAssessment
      ?.periodSegments
      .map(
        (
          segment,
        ) =>
          `${segment.key}:${segment.ganZhi}(${segment.tenGod}) ${segment.periodLabel}`,
      )
      .join(" | ")
    ?? "none";

  recordCheck(
    checks,
    failures,
    "yearPrimaryUsesAllYearSegments",
    Boolean(
      yearScopeFact
      && yearScopeAssessment
      && yearScopeFact
        .yearSegments
        .length
      >= 2
      && yearScopeAssessment
        .periodSegments
        .length
      === yearScopeFact
        .yearSegments
        .length
      && yearScopeAssessment
        .periodSegments
        .every(
          (
            segment,
            index,
          ) =>
            segment.ganZhi
            === yearScopeFact
              .yearSegments[index]
              ?.ganZhi,
        ),
    ),
    `yearSegments=${yearSegmentReport} | primary=${yearPrimaryReport}`,
  );

  recordCheck(
    checks,
    failures,
    "yearDoesNotUseJanuaryFirstSeunAsWholeYear",
    Boolean(
      yearScopeFact
      && yearScopeAssessment
      && yearScopeFact
        .yearSegments
        .length
      >= 2
      && !(
        yearScopeAssessment
          .periodSegments
          .length
        === 1
        && yearScopeAssessment
          .periodSegments[0]
          ?.ganZhi
        === yearScopeFact
          .targetSeun
          .ganZhi
      ),
    ),
    `jan1Seun=${yearScopeFact?.targetSeun.ganZhi ?? "none"} | primary=${yearPrimaryReport}`,
  );

  recordCheck(
    checks,
    failures,
    "yearBeforeAndAfterIpchunAreBothPreserved",
    Boolean(
      yearScopeFact
      && yearScopeAssessment
      && yearScopeFact
        .yearSegments
        .some(
          (
            segment,
          ) =>
            segment.ganZhi
            === "乙巳",
        )
      && yearScopeFact
        .yearSegments
        .some(
          (
            segment,
          ) =>
            segment.ganZhi
            === "丙午",
        )
      && yearScopeAssessment
        .periodSegments
        .some(
          (
            segment,
          ) =>
            segment.ganZhi
            === "乙巳",
        )
      && yearScopeAssessment
        .periodSegments
        .some(
          (
            segment,
          ) =>
            segment.ganZhi
            === "丙午",
        ),
    ),
    `yearSegments=${yearSegmentReport} | primary=${yearPrimaryReport}`,
  );

  const firstHalfBuild =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipelineA,

      normalizedQuestion:
        "2026년 상반기 운세는?",
    });

  const secondHalfBuild =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipelineA,

      normalizedQuestion:
        "2026년 하반기 운세는?",
    });

  const firstHalfFact =
    firstHalfBuild
      ?.fact;

  const secondHalfFact =
    secondHalfBuild
      ?.fact;

  recordCheck(
    checks,
    failures,
    "firstHalfYearExcludesSecondHalfYearSegments",
    Boolean(
      firstHalfFact
      && firstHalfFact
        .yearSegments
        .every(
          (
            segment,
          ) =>
            segment.endDate
            <= "2026-06-30",
        )
      && !firstHalfFact
        .wolunSegments
        .some(
          (
            segment,
          ) =>
            segment.startDate
            > "2026-06-30",
        ),
    ),
    `firstHalfYearSegments=${formatYearSegmentReport(firstHalfFact?.yearSegments ?? [])} | wolunMonths=${[...new Set(firstHalfFact?.wolunSegments.map((segment) => segment.startDate.slice(0, 7)) ?? [])].join(",")}`,
  );

  recordCheck(
    checks,
    failures,
    "secondHalfYearExcludesFirstHalfYearSegments",
    Boolean(
      secondHalfFact
      && secondHalfFact
        .yearSegments
        .every(
          (
            segment,
          ) =>
            segment.startDate
            >= "2026-07-01",
        )
      && !secondHalfFact
        .wolunSegments
        .some(
          (
            segment,
          ) =>
            segment.endDate
            < "2026-07-01",
        ),
    ),
    `secondHalfYearSegments=${formatYearSegmentReport(secondHalfFact?.yearSegments ?? [])} | wolunMonths=${[...new Set(secondHalfFact?.wolunSegments.map((segment) => segment.startDate.slice(0, 7)) ?? [])].join(",")}`,
  );

  const februaryBuild =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipelineA,

      normalizedQuestion:
        "2026년 2월 운세는 어떨까요?",
    });

  const februaryTarget =
    resolveLifeFlowTarget(
      "2026년 2월 운세는 어떨까요?",
      REFERENCE_DATE,
    );

  const februaryAssessment =
    februaryBuild
      ?.fact
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            pipelineA.facts,

          target:
            februaryTarget,

          targetPeriodLuckFlow:
            februaryBuild.fact,
        })
      : null;

  const februaryWolunReport =
    februaryAssessment
      ?.periodSegments
      .map(
        (
          segment,
        ) => {
          const temporal =
            findSeunTemporalContribution(
              segment
                .signalContributions,
            );

          return `${segment.periodLabel}:${segment.ganZhi}→seun=${extractSeunGanZhiFromTemporalDescription(temporal?.description ?? "") ?? "none"}`;
        },
      )
      .join(" | ")
    ?? "none";

  const februaryWolunSegments =
    februaryBuild
      ?.fact
      ?.wolunSegments
    ?? [];

  recordCheck(
    checks,
    failures,
    "februaryMonthUsesCorrectSeunOnEachSideOfIpchun",
    Boolean(
      februaryAssessment
      && februaryWolunSegments
        .length
      >= 2
      && februaryWolunSegments
        .some(
          (
            segment,
          ) =>
            segment.endDate
            <= "2026-02-03",
        )
      && februaryWolunSegments
        .some(
          (
            segment,
          ) =>
            segment.startDate
            >= "2026-02-04",
        )
      && februaryAssessment
        .periodSegments
        .some(
          (
            segment,
          ) =>
            segment
              .periodLabel
              .startsWith(
                "2026-02-01~2026-02-03",
              )
            && segment
              .signalContributions
              .some(
                (
                  contribution,
                ) =>
                  contribution.description.includes(
                    "세운 乙巳",
                  ),
              ),
        )
      && februaryAssessment
        .periodSegments
        .some(
          (
            segment,
          ) =>
            segment
              .periodLabel
              .startsWith(
                "2026-02-04~",
              )
            && segment
              .signalContributions
              .some(
                (
                  contribution,
                ) =>
                  contribution.description.includes(
                    "세운 丙午",
                  ),
              ),
        ),
    ),
    februaryWolunReport,
  );

  recordCheck(
    checks,
    failures,
    "monthBackgroundSeunMatchesSegmentDateRange",
    Boolean(
      februaryAssessment
      && februaryWolunSegments
        .length
      >= 2
      && februaryWolunSegments
        .every(
          (
            wolunSegment,
            index,
          ) => {
            const assessmentSegment =
              februaryAssessment
                .periodSegments[index];

          const temporal =
            findSeunTemporalContribution(
              assessmentSegment
                ?.signalContributions
              ?? [],
            );

            const seunGanZhi =
              extractSeunGanZhiFromTemporalDescription(
                temporal
                  ?.description
                ?? "",
              );

            if (
              !seunGanZhi
            ) {
              return false;
            }

            const expected =
              wolunSegment.endDate
              <= "2026-02-03"
                ? "乙巳"
                : "丙午";

            return (
              seunGanZhi
              === expected
            );
          },
        ),
    ),
    februaryWolunReport,
  );

  const mixedFamilyFacts:
    SajuFacts = {
    ...pipelineA.facts,

    usefulGod:
      "wood",

    harmfulGod:
      "fire",
  };

  const mixedFamilyAssessment =
    yearScopeFact
      ? assessLifeFlowInterpretation({
          humanContext:
            regressionInput
              .humanContext,

          selfSajuFacts:
            mixedFamilyFacts,

          target:
            yearScopeTarget,

          targetPeriodLuckFlow:
            yearScopeFact,
        })
      : null;

  const mixedExplicitGod =
    mixedFamilyAssessment
      ?.signalContributions
      .find(
        (
          contribution,
        ) =>
          contribution.evidenceKey
          === "explicitGod-mixed",
      );

  recordCheck(
    checks,
    failures,
    "sameFamilyMixedPreservesAllDescriptions",
    Boolean(
      mixedExplicitGod
      && mixedExplicitGod.description.includes(
        "[유리]",
      )
      && mixedExplicitGod.description.includes(
        "[긴장]",
      )
      && (
        mixedExplicitGod
          .preservedContributions
          ?.length
        ?? 0
      )
      >= 2,
    ),
    mixedExplicitGod
      ?.description
    ?? "none",
  );

  recordCheck(
    checks,
    failures,
    "sameFamilyMixedPreservesUnionOfSourceKeys",
    Boolean(
      mixedExplicitGod
      && mixedExplicitGod
        .sourceKeys
        .includes(
          "usefulGod",
        )
      && mixedExplicitGod
        .sourceKeys
        .includes(
          "harmfulGod",
        ),
    ),
    mixedExplicitGod
      ?.sourceKeys
      .join(",")
    ?? "none",
  );

  const oneOneSyntheticFact:
    SajuTargetPeriodLuckFlowFact =
    {
      ...sharedNatalComparisonFact,

      targetSeun: {
        ...sharedNatalComparisonFact
          .targetSeun,

        element:
          "earth",
      },
    };

  const oneOneFacts:
    SajuFacts = {
    ...natalFactsB,

    usefulGod:
      "earth",

    harmfulGod:
      "fire",
  };

  const oneOneAssessment =
    assessLifeFlowInterpretation({
      humanContext:
        regressionInput
          .humanContext,

      selfSajuFacts:
        oneOneFacts,

      target,

      targetPeriodLuckFlow:
        oneOneSyntheticFact,
    });

  recordCheck(
    checks,
    failures,
    "oneSupportOneTensionPreservesBothCounterEvidence",
    Boolean(
      countFamiliesByEffect(
        oneOneAssessment
          .signalContributions,
        "supportive",
      )
      === 1
      && countFamiliesByEffect(
        oneOneAssessment
          .signalContributions,
        "tension",
      )
      === 1
      && oneOneAssessment
        .limitations
        .some(
          (
            limitation,
          ) =>
            limitation.includes(
              "유리 근거 1개(",
            )
            && limitation.includes(
              "반대 근거 1개(",
            ),
        ),
    ),
    `supportiveFamilies=${countFamiliesByEffect(oneOneAssessment.signalContributions, "supportive")}, tensionFamilies=${countFamiliesByEffect(oneOneAssessment.signalContributions, "tension")}, limitations=${oneOneAssessment.limitations.filter((item) => item.includes("근거")).join(" | ")}`,
  );

  const oneTwoAggregation =
    aggregateDirectionalSignals(
      [
        {
          evidenceFamily:
            "natalBalance",
          effect:
            "tension",
          weight:
            3,
          evidenceKey:
            "natalBalance-a-tension",
          sourceKeys:
            [
              "natalBalance",
            ],
          flowKey:
            "seun",
          flowLabel:
            "세운",
          description:
            "tension natalBalance A",
        },
        {
          evidenceFamily:
            "explicitGod",
          effect:
            "tension",
          weight:
            3,
          evidenceKey:
            "explicitGod-a-tension",
          sourceKeys:
            [
              "harmfulGod",
            ],
          flowKey:
            "seun",
          flowLabel:
            "세운",
          description:
            "tension explicitGod B",
        },
        {
          evidenceFamily:
            "periodInteraction",
          effect:
            "supportive",
          weight:
            2,
          evidenceKey:
            "periodInteraction-supportive",
          sourceKeys:
            [
              "periodInteraction:clash",
            ],
          flowKey:
            "seun",
          flowLabel:
            "세운",
          description:
            "supportive periodInteraction C",
        },
      ],
    );

  recordCheck(
    checks,
    failures,
    "tensionTwoFamiliesPreservedWithSingleSupportiveCounterEvidence",
    oneTwoAggregation
      .tensionSignals
      .length
    > 0
      && oneTwoAggregation
        .limitations
        .some(
          (
            limitation,
          ) =>
            limitation.includes(
              "긴장 근거 2개",
            )
            && limitation.includes(
              "반대 근거 1개(periodInteraction)",
            )
            && limitation.includes(
              "supportive periodInteraction C",
            ),
    ),
    `supportiveSignals=${oneTwoAggregation.supportiveSignals.length}, tensionSignals=${oneTwoAggregation.tensionSignals.length}, limitations=${oneTwoAggregation.limitations.join(" | ")}`,
  );

  const twoTwoAggregation =
    aggregateDirectionalSignals(
      [
        {
          evidenceFamily:
            "natalBalance",
          effect:
            "supportive",
          weight:
            3,
          evidenceKey:
            "natalBalance-supportive",
          sourceKeys:
            [
              "natalBalance",
            ],
          flowKey:
            "seun",
          flowLabel:
            "세운",
          description:
            "supportive natalBalance A",
        },
        {
          evidenceFamily:
            "explicitGod",
          effect:
            "supportive",
          weight:
            3,
          evidenceKey:
            "explicitGod-supportive",
          sourceKeys:
            [
              "usefulGod",
            ],
          flowKey:
            "seun",
          flowLabel:
            "세운",
          description:
            "supportive explicitGod B",
        },
        {
          evidenceFamily:
            "periodInteraction",
          effect:
            "tension",
          weight:
            2,
          evidenceKey:
            "periodInteraction-tension",
          sourceKeys:
            [
              "periodInteraction:clash",
            ],
          flowKey:
            "seun",
          flowLabel:
            "세운",
          description:
            "tension periodInteraction C",
        },
        {
          evidenceFamily:
            "currentPhase",
          effect:
            "tension",
          weight:
            2,
          evidenceKey:
            "currentPhase-tension",
          sourceKeys:
            [
              "currentPhase",
            ],
          flowKey:
            "seun",
          flowLabel:
            "세운",
          description:
            "tension currentPhase D",
        },
      ],
    );

  recordCheck(
    checks,
    failures,
    "twoSupportTwoTensionPreservesMixedSignals",
    twoTwoAggregation
      .supportiveSignals
      .length
    > 0
      && twoTwoAggregation
        .tensionSignals
        .length
    > 0
      && twoTwoAggregation
        .limitations
        .some(
          (
            limitation,
          ) =>
            limitation.includes(
              "혼합",
            ),
        ),
    `supportiveSignals=${twoTwoAggregation.supportiveSignals.length}, tensionSignals=${twoTwoAggregation.tensionSignals.length}, limitations=${twoTwoAggregation.limitations.join(" | ")}`,
  );

  recordCheck(
    checks,
    failures,
    "supportiveNatalBalanceDescriptionIncludesActualReason",
    Boolean(
      sameTenGodComparison
        .fixtureA
        .natalBalanceDescription
      && sameTenGodComparison
        .fixtureA
        .natalBalanceDescription.includes(
          "[판정]",
        )
      && sameTenGodComparison
        .fixtureA
        .natalBalanceDescription.includes(
          "약한 일간을 생조하여 보완 근거",
        ),
    ),
    sameTenGodComparison
      .fixtureA
      .natalBalanceDescription
    ?? "none",
  );

  recordCheck(
    checks,
    failures,
    "tensionNatalBalanceDescriptionIncludesActualReason",
    Boolean(
      sameTenGodComparison
        .fixtureB
        .natalBalanceDescription
      && sameTenGodComparison
        .fixtureB
        .natalBalanceDescription.includes(
          "[판정]",
        )
      && sameTenGodComparison
        .fixtureB
        .natalBalanceDescription.includes(
          "과다 집중 긴장 근거",
        ),
    ),
    sameTenGodComparison
      .fixtureB
      .natalBalanceDescription
    ?? "none",
  );

  recordCheck(
    checks,
    failures,
    "oppositeNatalBalanceFixturesExplainWhyResultsDiffer",
    Boolean(
      sameTenGodComparison
        .fixtureA
        .natalBalanceEffect
      === "supportive"
      && sameTenGodComparison
        .fixtureB
        .natalBalanceEffect
      === "tension"
      && sameTenGodComparison
        .fixtureA
        .natalBalanceDescription
      !== sameTenGodComparison
        .fixtureB
        .natalBalanceDescription
      && sameTenGodComparison
        .fixtureA
        .natalBalanceDescription
        ?.includes(
          "weak",
        )
      && sameTenGodComparison
        .fixtureB
        .natalBalanceDescription
        ?.includes(
          "strong",
        ),
    ),
    `A=${sameTenGodComparison.fixtureA.natalBalanceEffect}/${sameTenGodComparison.fixtureA.natalBalanceDescription ?? "none"} | B=${sameTenGodComparison.fixtureB.natalBalanceEffect}/${sameTenGodComparison.fixtureB.natalBalanceDescription ?? "none"}`,
  );

  const passed =
    failures.length
    === 0
    && Object.values(
      checks,
    ).every(Boolean);

  return {
    passed,
    checks,
    failures,
    sameTenGodComparison,
  };
}
