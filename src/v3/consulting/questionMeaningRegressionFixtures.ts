import type {
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntentOrLegacy,
  QuestionTimingType,
  QuestionTopic,
} from "./question/questionReader.js";

/**
 * QuestionReader taxonomy를 따르는 fixture domain.
 * career → job, investment topic → money 로 분류한다.
 */
export type QuestionMeaningFixtureDomain =
  | "business"
  | "job"
  | "money"
  | "realEstate"
  | "relationship"
  | "marriage"
  | "lifeDirection"
  | "health"
  | "legal"
  | "lifeFlow"
  | "general";

export type QuestionMeaningExpectation = {
  topic:
    QuestionTopic;

  intent:
    QuestionIntentOrLegacy;

  decisionTarget:
    DecisionTarget;

  timingType?:
    QuestionTimingType;

  analysisMode?:
    QuestionAnalysisMode;
};

/**
 * Meaning Cell의 의미 축.
 * topic|intent|decisionTarget 조합으로 boundary를 명시한다.
 */
export type QuestionMeaningPrimaryAxis =
  `${QuestionTopic}|${QuestionIntentOrLegacy}|${DecisionTarget}`;

export type QuestionMeaningVariationKind =
  | "paraphrase"
  | "target"
  | "timing"
  | "composite";

export type QuestionMeaningVariation = {
  idSuffix:
    string;

  question:
    string;

  meaningAnchorTokens:
    readonly string[];

  /**
   * Cell canonical expected 대비 달라지는 분류만 override.
   */
  expectedOverride?:
    Partial<
      QuestionMeaningExpectation
    >;

  variationKind:
    QuestionMeaningVariationKind;

  /**
   * Type D boundary 설명. collapse되면 안 되는 인접 Cell과 구분한다.
   */
  boundaryNote?:
    string;
};

export type QuestionMeaningCell = {
  id:
    string;

  domain:
    QuestionMeaningFixtureDomain;

  primaryAxis:
    QuestionMeaningPrimaryAxis;

  canonicalQuestion:
    string;

  expected:
    QuestionMeaningExpectation;

  canonicalMeaningAnchorTokens:
    readonly string[];

  /**
   * QuestionMeaningRegressionVerification 연결용.
   */
  distinctMeaningGroup:
    string;

  /**
   * SameClassification / FinalAnswerInput regression 연결용.
   */
  classificationSignatureGroup:
    string;

  /**
   * Type A: 같은 의미 + 다른 표현
   */
  paraphrases:
    readonly QuestionMeaningVariation[];

  /**
   * Type B: 같은 classification + 다른 구체적 대상
   */
  targetVariants:
    readonly QuestionMeaningVariation[];

  /**
   * Type C (timing): 시기修飾이 붙은 질문
   */
  timingVariants:
    readonly QuestionMeaningVariation[];

  /**
   * Type C/D: 복합 질문 + boundary가 명확한 질문
   */
  compositeVariants:
    readonly QuestionMeaningVariation[];
};

export type ExpandedQuestionMeaningCase = {
  id:
    string;

  cellId:
    string;

  domain:
    QuestionMeaningFixtureDomain;

  primaryAxis:
    QuestionMeaningPrimaryAxis;

  question:
    string;

  expected:
    QuestionMeaningExpectation;

  meaningAnchorTokens:
    readonly string[];

  distinctMeaningGroup:
    string;

  classificationSignatureGroup:
    string;

  variationKind:
    | "canonical"
    | QuestionMeaningVariationKind;

  boundaryNote?:
    string;
};

export type QuestionMeaningFixtureStats = {
  cellCount:
    number;

  cellCountByDomain:
    Record<
      QuestionMeaningFixtureDomain,
      number
    >;

  primaryAxisCoverage:
    readonly QuestionMeaningPrimaryAxis[];

  paraphraseCount:
    number;

  targetVariantCount:
    number;

  timingVariantCount:
    number;

  compositeVariantCount:
    number;

  expandedCaseCount:
    number;
};

function mergeExpected(
  base:
    QuestionMeaningExpectation,
  override?:
    Partial<
      QuestionMeaningExpectation
    >,
): QuestionMeaningExpectation {
  if (!override) {
    return base;
  }

  return {
    topic:
      override.topic
      ?? base.topic,

    intent:
      override.intent
      ?? base.intent,

    decisionTarget:
      override.decisionTarget
      ?? base.decisionTarget,

    timingType:
      override.timingType
      ?? base.timingType,

    analysisMode:
      override.analysisMode
      ?? base.analysisMode,
  };
}

function buildVariationCase(
  cell:
    QuestionMeaningCell,
  variation:
    QuestionMeaningVariation,
): ExpandedQuestionMeaningCase {
  return {
    id:
      `${cell.id}__${variation.idSuffix}`,

    cellId:
      cell.id,

    domain:
      cell.domain,

    primaryAxis:
      cell.primaryAxis,

    question:
      variation.question,

    expected:
      mergeExpected(
        cell.expected,
        variation.expectedOverride,
      ),

    meaningAnchorTokens:
      variation.meaningAnchorTokens,

    distinctMeaningGroup:
      cell.distinctMeaningGroup,

    classificationSignatureGroup:
      cell.classificationSignatureGroup,

    variationKind:
      variation.variationKind,

    boundaryNote:
      variation.boundaryNote,
  };
}

export function expandMeaningCell(
  cell:
    QuestionMeaningCell,
): ExpandedQuestionMeaningCase[] {
  const canonicalCase:
    ExpandedQuestionMeaningCase = {
    id:
      `${cell.id}__canonical`,

    cellId:
      cell.id,

    domain:
      cell.domain,

    primaryAxis:
      cell.primaryAxis,

    question:
      cell.canonicalQuestion,

    expected:
      cell.expected,

    meaningAnchorTokens:
      cell.canonicalMeaningAnchorTokens,

    distinctMeaningGroup:
      cell.distinctMeaningGroup,

    classificationSignatureGroup:
      cell.classificationSignatureGroup,

    variationKind:
      "canonical",
  };

  const variationCases =
    [
      ...cell.paraphrases,
      ...cell.targetVariants,
      ...cell.timingVariants,
      ...cell.compositeVariants,
    ].map(
      (variation) =>
        buildVariationCase(
          cell,
          variation,
        ),
    );

  return [
    canonicalCase,
    ...variationCases,
  ];
}

export function expandAllMeaningCells(
  cells:
    readonly QuestionMeaningCell[] = QUESTION_MEANING_CELLS,
): ExpandedQuestionMeaningCase[] {
  return cells.flatMap(
    expandMeaningCell,
  );
}

export function buildClassificationSignature(
  expected:
    QuestionMeaningExpectation,
): string {
  return [
    expected.topic,
    expected.intent,
    expected.decisionTarget,
    expected.timingType
      ?? "unknown",
    expected.analysisMode
      ?? "decision",
  ].join(
    "|",
  );
}

export function computeQuestionMeaningFixtureStats(
  cells:
    readonly QuestionMeaningCell[] = QUESTION_MEANING_CELLS,
): QuestionMeaningFixtureStats {
  const cellCountByDomain:
    Record<
      QuestionMeaningFixtureDomain,
      number
    > = {
    business: 0,
    job: 0,
    money: 0,
    realEstate: 0,
    relationship: 0,
    marriage: 0,
    lifeDirection: 0,
    health: 0,
    legal: 0,
    lifeFlow: 0,
    general: 0,
  };

  let paraphraseCount = 0;
  let targetVariantCount = 0;
  let timingVariantCount = 0;
  let compositeVariantCount = 0;

  const primaryAxisSet =
    new Set<
      QuestionMeaningPrimaryAxis
    >();

  for (
    const cell
    of cells
  ) {
    cellCountByDomain[
      cell.domain
    ] += 1;

    primaryAxisSet.add(
      cell.primaryAxis,
    );

    paraphraseCount +=
      cell.paraphrases.length;

    targetVariantCount +=
      cell.targetVariants.length;

    timingVariantCount +=
      cell.timingVariants.length;

    compositeVariantCount +=
      cell.compositeVariants.length;
  }

  return {
    cellCount:
      cells.length,

    cellCountByDomain,

    primaryAxisCoverage:
      Array.from(
        primaryAxisSet,
      ).sort(),

    paraphraseCount,

    targetVariantCount,

    timingVariantCount,

    compositeVariantCount,

    expandedCaseCount:
      expandAllMeaningCells(
        cells,
      ).length,
  };
}

export const QUESTION_MEANING_CELLS:
  readonly QuestionMeaningCell[] = [
    // ── business ──────────────────────────────────────────────
    {
      id:
        "business-start-possibility",

      domain:
        "business",

      primaryAxis:
        "business|possibility|start",

      canonicalQuestion:
        "사업을 시작해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "start",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "사업",
        "시작",
        "해도 될까",
      ],

      distinctMeaningGroup:
        "business-start",

      classificationSignatureGroup:
        "business-possibility-start",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "창업을 해도 괜찮을까요?",

          meaningAnchorTokens: [
            "창업",
            "괜찮",
          ],

          variationKind:
            "paraphrase",
        },
        {
          idSuffix:
            "paraphrase-02",

          question:
            "지금 사업을 시작하는 게 가능할까요?",

          meaningAnchorTokens: [
            "사업",
            "시작",
            "가능",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-chicken-shop",

          question:
            "통닭집을 개업해도 될까요?",

          meaningAnchorTokens: [
            "통닭집",
            "개업",
          ],

          variationKind:
            "target",
        },
        {
          idSuffix:
            "target-cafe",

          question:
            "카페를 창업해도 될까요?",

          meaningAnchorTokens: [
            "카페",
            "창업",
          ],

          variationKind:
            "target",
        },
        {
          idSuffix:
            "target-franchise",

          question:
            "프랜차이즈 가게를 시작해도 될까요?",

          meaningAnchorTokens: [
            "프랜차이즈",
            "시작",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [
        {
          idSuffix:
            "timing-now",

          question:
            "지금 사업을 시작해도 될까요?",

          meaningAnchorTokens: [
            "지금",
            "사업",
            "시작",
          ],

          expectedOverride: {
            timingType:
              "executionTiming",
          },

          variationKind:
            "timing",
        },
      ],

      compositeVariants: [
        {
          idSuffix:
            "composite-capital-constraint",

          question:
            "자금이 빠듯한데 사업을 시작해도 될까요?",

          meaningAnchorTokens: [
            "자금",
            "사업",
            "시작",
          ],

          variationKind:
            "composite",
        },
      ],
    },
    {
      id:
        "business-start-timing",

      domain:
        "business",

      primaryAxis:
        "business|timing|start",

      canonicalQuestion:
        "사업은 언제 시작하는 것이 좋을까요?",

      expected: {
        topic:
          "business",

        intent:
          "timing",

        decisionTarget:
          "start",

        timingType:
          "bestTiming",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "언제",
        "사업",
        "시작",
      ],

      distinctMeaningGroup:
        "business-timing",

      classificationSignatureGroup:
        "business-timing-start",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "창업 시기는 언제가 맞을까요?",

          meaningAnchorTokens: [
            "창업",
            "시기",
            "언제",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-restaurant",

          question:
            "식당 창업은 언제 시작하면 좋을까요?",

          meaningAnchorTokens: [
            "식당",
            "창업",
            "언제",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [
        {
          idSuffix:
            "timing-this-year",

          question:
            "올해 사업 시작해도 될까요?",

          meaningAnchorTokens: [
            "올해",
            "사업",
            "시작",
          ],

          expectedOverride: {
            intent:
              "permission",

            timingType:
              "bestTiming",
          },

          variationKind:
            "timing",
        },
      ],

      compositeVariants: [
        {
          idSuffix:
            "composite-compare-wait",

          question:
            "지금 시작하는 것과 내년까지 기다리는 것 중 언제가 나을까요?",

          meaningAnchorTokens: [
            "지금",
            "내년",
            "언제",
          ],

          expectedOverride: {
            intent:
              "comparison",

            decisionTarget:
              "wait",

            analysisMode:
              "selection",
          },

          variationKind:
            "composite",

          boundaryNote:
            "business-start-possibility 와 timing intent 로 구분",
        },
      ],
    },
    {
      id:
        "business-continuation",

      domain:
        "business",

      primaryAxis:
        "business|continuation|continue",

      canonicalQuestion:
        "지금 하던 사업을 계속해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "continuation",

        decisionTarget:
          "continue",

        timingType:
          "executionTiming",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "계속",
        "사업",
      ],

      distinctMeaningGroup:
        "business-continuation",

      classificationSignatureGroup:
        "business-continuation-continue",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "현재 운영 중인 가게를 유지해도 될까요?",

          meaningAnchorTokens: [
            "가게",
            "유지",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-online-shop",

          question:
            "온라인 쇼핑몰 사업을 계속해도 될까요?",

          meaningAnchorTokens: [
            "쇼핑몰",
            "계속",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-loss-period",

          question:
            "매출이 줄었는데 지금 사업을 계속하는 게 맞을까요?",

          meaningAnchorTokens: [
            "매출",
            "계속",
            "사업",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "business-start-possibility 와 continue decisionTarget 으로 구분",
        },
      ],
    },
    {
      id:
        "business-partner-compatibility",

      domain:
        "business",

      primaryAxis:
        "business|possibility|partner",

      canonicalQuestion:
        "지금 동업을 시작해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "partner",

        timingType:
          "executionTiming",

        analysisMode:
          "compatibility",
      },

      canonicalMeaningAnchorTokens: [
        "동업",
        "시작",
      ],

      distinctMeaningGroup:
        "business-partner-compatibility",

      classificationSignatureGroup:
        "business-possibility-partner",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "이 사람과 같이 사업을 해도 맞을까요?",

          meaningAnchorTokens: [
            "이 사람",
            "사업",
            "맞을까",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-friend-partner",

          question:
            "친구와 카페 동업을 시작해도 될까요?",

          meaningAnchorTokens: [
            "친구",
            "동업",
            "카페",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-capital-split",

          question:
            "출자 비율이 다른데 지금 동업을 시작해도 괜찮을까요?",

          meaningAnchorTokens: [
            "출자",
            "동업",
            "시작",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "business-start-possibility 와 partner decisionTarget 으로 구분",
        },
      ],
    },
    {
      id:
        "business-fit-recommendation",

      domain:
        "business",

      primaryAxis:
        "business|possibility|none",

      canonicalQuestion:
        "어떤 사업이 저에게 맞을까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "none",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "어떤",
        "사업",
        "맞을까",
      ],

      distinctMeaningGroup:
        "business-fit-recommendation",

      classificationSignatureGroup:
        "business-possibility-none",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "제 성향에 맞는 창업 아이템은 무엇일까요?",

          meaningAnchorTokens: [
            "창업",
            "아이템",
            "맞",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-small-budget",

          question:
            "소자본으로 시작할 수 있는 사업 중 저에게 맞는 것은 무엇일까요?",

          meaningAnchorTokens: [
            "소자본",
            "사업",
            "맞",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "business-option-comparison 과 none vs choose 로 구분",
        },
      ],
    },
    {
      id:
        "business-option-comparison",

      domain:
        "business",

      primaryAxis:
        "business|comparison|none",

      canonicalQuestion:
        "A사업과 B사업 중 무엇이 더 맞을까요?",

      expected: {
        topic:
          "business",

        intent:
          "comparison",

        decisionTarget:
          "none",

        timingType:
          "unknown",

        analysisMode:
          "selection",
      },

      canonicalMeaningAnchorTokens: [
        "a사업",
        "b사업",
        "무엇이 더",
      ],

      distinctMeaningGroup:
        "business-option-comparison",

      classificationSignatureGroup:
        "business-comparison-none",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "카페와 식당 중 어느 쪽이 더 나을까요?",

          meaningAnchorTokens: [
            "카페",
            "식당",
            "어느",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-franchise-vs-direct",

          question:
            "프랜차이즈와 독립 창업 중 무엇이 더 맞을까요?",

          meaningAnchorTokens: [
            "프랜차이즈",
            "독립",
            "창업",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-budget-constraint",

          question:
            "자금이 5천만 원인데 온라인 사업과 오프라인 매장 중 어디에 투자하는 게 나을까요?",

          meaningAnchorTokens: [
            "온라인",
            "오프라인",
            "어디",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "business-fit-recommendation 과 comparison intent 로 구분",
        },
      ],
    },

    // ── job ───────────────────────────────────────────────────
    {
      id:
        "job-change-possibility",

      domain:
        "job",

      primaryAxis:
        "job|possibility|changeJob",

      canonicalQuestion:
        "다른 회사로 이직하는 게 가능할까요?",

      expected: {
        topic:
          "job",

        intent:
          "possibility",

        decisionTarget:
          "changeJob",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "이직",
        "가능",
      ],

      distinctMeaningGroup:
        "job-change-possibility",

      classificationSignatureGroup:
        "job-possibility-changeJob",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "지금 직장을 그만두고 새 회사로 옮겨도 될까요?",

          meaningAnchorTokens: [
            "직장",
            "새 회사",
            "옮겨",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-public-corp",

          question:
            "대기업으로 이직하는 게 가능할까요?",

          meaningAnchorTokens: [
            "대기업",
            "이직",
          ],

          variationKind:
            "target",
        },
        {
          idSuffix:
            "target-startup",

          question:
            "스타트업으로 이직해도 될까요?",

          meaningAnchorTokens: [
            "스타트업",
            "이직",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [
        {
          idSuffix:
            "timing-now",

          question:
            "지금 당장 이직해도 될까요?",

          meaningAnchorTokens: [
            "지금",
            "이직",
          ],

          expectedOverride: {
            timingType:
              "executionTiming",
          },

          variationKind:
            "timing",
        },
      ],

      compositeVariants: [
        {
          idSuffix:
            "composite-offer-comparison",

          question:
            "현재 회사를 유지하는 것과 제안받은 회사로 이직하는 것 중 어느 쪽이 나을까요?",

          meaningAnchorTokens: [
            "현재 회사",
            "이직",
            "어느",
          ],

          expectedOverride: {
            intent:
              "comparison",

            decisionTarget:
              "choose",

            analysisMode:
              "selection",
          },

          variationKind:
            "composite",

          boundaryNote:
            "job-change-possibility 와 comparison intent 로 구분",
        },
      ],
    },
    {
      id:
        "job-leave-possibility",

      domain:
        "job",

      primaryAxis:
        "job|possibility|leaveJob",

      canonicalQuestion:
        "지금 직장을 그만두어도 될까요?",

      expected: {
        topic:
          "job",

        intent:
          "possibility",

        decisionTarget:
          "leaveJob",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "직장",
        "그만두",
      ],

      distinctMeaningGroup:
        "job-leave-possibility",

      classificationSignatureGroup:
        "job-possibility-leaveJob",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "퇴사를 결정해도 괜찮을까요?",

          meaningAnchorTokens: [
            "퇴사",
            "괜찮",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-no-next-job",

          question:
            "다음 직장이 없는데 지금 퇴사해도 될까요?",

          meaningAnchorTokens: [
            "다음 직장",
            "퇴사",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "job-change-possibility 와 leaveJob vs changeJob 으로 구분",
        },
      ],
    },
    {
      id:
        "job-role-interpretation",

      domain:
        "job",

      primaryAxis:
        "job|reason|none",

      canonicalQuestion:
        "연극을 한다면 어떤 역할이 좋을까요?",

      expected: {
        topic:
          "job",

        intent:
          "reason",

        decisionTarget:
          "none",

        timingType:
          "unknown",

        analysisMode:
          "interpretation",
      },

      canonicalMeaningAnchorTokens: [
        "연극",
        "역할",
      ],

      distinctMeaningGroup:
        "job-role-interpretation",

      classificationSignatureGroup:
        "job-reason-role",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "무대에서 어떤 배역이 저에게 맞을까요?",

          meaningAnchorTokens: [
            "무대",
            "배역",
            "맞",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-youtube-role",

          question:
            "유튜브 채널에서 어떤 콘텐츠 역할이 맞을까요?",

          meaningAnchorTokens: [
            "유튜브",
            "콘텐츠",
            "역할",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-acting-vs-directing",

          question:
            "연기와 연출 중 제 성향에 맞는 직업 역할은 무엇일까요?",

          meaningAnchorTokens: [
            "연기",
            "연출",
            "역할",
          ],

          expectedOverride: {
            intent:
              "comparison",

            analysisMode:
              "selection",
          },

          variationKind:
            "composite",

          boundaryNote:
            "job-change-possibility 와 interpretation analysisMode 로 구분",
        },
      ],
    },
    {
      id:
        "job-partner-compatibility",

      domain:
        "job",

      primaryAxis:
        "job|possibility|partner",

      canonicalQuestion:
        "유튜브 영상 제작을 이 사람과 같이 해도 맞을까요?",

      expected: {
        topic:
          "job",

        intent:
          "possibility",

        decisionTarget:
          "partner",

        timingType:
          "unknown",

        analysisMode:
          "compatibility",
      },

      canonicalMeaningAnchorTokens: [
        "유튜브",
        "영상 제작",
        "이 사람",
      ],

      distinctMeaningGroup:
        "job-partner-compatibility",

      classificationSignatureGroup:
        "job-possibility-partner",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "콘텐츠 제작 파트너로 이 사람과 협업해도 될까요?",

          meaningAnchorTokens: [
            "콘텐츠",
            "파트너",
            "협업",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-channel-co-host",

          question:
            "채널 공동 운영을 이 사람과 시작해도 맞을까요?",

          meaningAnchorTokens: [
            "채널",
            "공동",
            "이 사람",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-revenue-split",

          question:
            "수익 배분 조건이 애매한데 유튜브를 같이 해도 괜찮을까요?",

          meaningAnchorTokens: [
            "수익",
            "유튜브",
            "같이",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "business-partner-compatibility 와 job topic 으로 구분",
        },
      ],
    },
    {
      id:
        "job-change-timing",

      domain:
        "job",

      primaryAxis:
        "job|timing|changeJob",

      canonicalQuestion:
        "이직은 언제 하는 게 좋을까요?",

      expected: {
        topic:
          "job",

        intent:
          "timing",

        decisionTarget:
          "changeJob",

        timingType:
          "bestTiming",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "이직",
        "언제",
      ],

      distinctMeaningGroup:
        "job-change-timing",

      classificationSignatureGroup:
        "job-timing-changeJob",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "직장을 옮기기에 좋은 시기는 언제일까요?",

          meaningAnchorTokens: [
            "직장",
            "옮기",
            "시기",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [
        {
          idSuffix:
            "timing-this-year",

          question:
            "올해 이직해도 될까요?",

          meaningAnchorTokens: [
            "올해",
            "이직",
          ],

          variationKind:
            "timing",
        },
      ],

      compositeVariants: [
        {
          idSuffix:
            "composite-promotion-vs-move",

          question:
            "승진 기회가 있는데 이직 시기를 미루는 게 나을까요?",

          meaningAnchorTokens: [
            "승진",
            "이직",
            "시기",
          ],

          expectedOverride: {
            intent:
              "comparison",

            decisionTarget:
              "wait",

          },

          variationKind:
            "composite",

          boundaryNote:
            "job-change-possibility 와 timing intent 로 구분",
        },
      ],
    },

    // ── money ─────────────────────────────────────────────────
    {
      id:
        "money-invest-possibility",

      domain:
        "money",

      primaryAxis:
        "money|possibility|invest",

      canonicalQuestion:
        "여유자금으로 ETF에 투자해도 될까요?",

      expected: {
        topic:
          "money",

        intent:
          "possibility",

        decisionTarget:
          "invest",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "여유자금",
        "etf",
        "투자",
      ],

      distinctMeaningGroup:
        "money-invest-possibility",

      classificationSignatureGroup:
        "money-possibility-invest",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "남는 돈으로 주식에 넣어도 괜찮을까요?",

          meaningAnchorTokens: [
            "남는 돈",
            "주식",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-fund",

          question:
            "여유자금으로 펀드에 투자해도 될까요?",

          meaningAnchorTokens: [
            "펀드",
            "투자",
          ],

          variationKind:
            "target",
        },
        {
          idSuffix:
            "target-crypto",

          question:
            "가상자산에 투자해도 될까요?",

          meaningAnchorTokens: [
            "가상자산",
            "투자",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [
        {
          idSuffix:
            "timing-now",

          question:
            "지금 주식에 투자해도 될까요?",

          meaningAnchorTokens: [
            "지금",
            "주식",
            "투자",
          ],

          expectedOverride: {
            timingType:
              "executionTiming",
          },

          variationKind:
            "timing",
        },
      ],

      compositeVariants: [
        {
          idSuffix:
            "composite-debt-burden",

          question:
            "대출 부담이 있는데 여유자금 투자가 가능한가?",

          meaningAnchorTokens: [
            "대출",
            "여유자금",
            "투자",
          ],

          variationKind:
            "composite",
        },
      ],
    },
    {
      id:
        "money-invest-risk",

      domain:
        "money",

      primaryAxis:
        "money|risk|invest",

      canonicalQuestion:
        "퇴직금 전부를 주식에 투자할 때 어떤 위험이 있나요?",

      expected: {
        topic:
          "money",

        intent:
          "risk",

        decisionTarget:
          "invest",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "퇴직금",
        "주식",
        "위험",
      ],

      distinctMeaningGroup:
        "money-invest-risk",

      classificationSignatureGroup:
        "money-risk-invest",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "한 종목에 자금을 집중해서 투자하면 어떤 위험을 조심해야 하나요?",

          meaningAnchorTokens: [
            "한 종목",
            "집중",
            "위험",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-liquidity-lock",

          question:
            "퇴직금 전부를 한 자산에 집중 투자할 때 중도 환매가 어렵고 자금이 묶이는 위험은 무엇인가요?",

          meaningAnchorTokens: [
            "퇴직금",
            "중도 환매",
            "위험",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "money-invest-possibility 와 risk intent 로 구분",
        },
      ],
    },
    {
      id:
        "money-manage-method",

      domain:
        "money",

      primaryAxis:
        "money|method|manageMoney",

      canonicalQuestion:
        "월급을 어떻게 관리하면 좋을까요?",

      expected: {
        topic:
          "money",

        intent:
          "method",

        decisionTarget:
          "manageMoney",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "월급",
        "관리",
      ],

      distinctMeaningGroup:
        "money-manage-method",

      classificationSignatureGroup:
        "money-method-manageMoney",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "수입과 지출을 어떻게 조절해야 할까요?",

          meaningAnchorTokens: [
            "수입",
            "지출",
            "조절",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-debt-repayment",

          question:
            "빚 상환과 저축 중 무엇을 먼저 해야 할까요?",

          meaningAnchorTokens: [
            "빚",
            "저축",
            "먼저",
          ],

          expectedOverride: {
            intent:
              "comparison",

            decisionTarget:
              "choose",

            analysisMode:
              "selection",
          },

          variationKind:
            "composite",

          boundaryNote:
            "money-invest-possibility 와 method intent 로 구분",
        },
      ],
    },
    {
      id:
        "money-invest-timing",

      domain:
        "money",

      primaryAxis:
        "money|timing|invest",

      canonicalQuestion:
        "투자는 언제 시작하는 게 좋을까요?",

      expected: {
        topic:
          "money",

        intent:
          "timing",

        decisionTarget:
          "invest",

        timingType:
          "bestTiming",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "투자",
        "언제",
      ],

      distinctMeaningGroup:
        "money-invest-timing",

      classificationSignatureGroup:
        "money-timing-invest",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "주식 매수 시기는 언제가 맞을까요?",

          meaningAnchorTokens: [
            "주식",
            "매수",
            "시기",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [
        {
          idSuffix:
            "timing-this-year",

          question:
            "올해 투자해도 될까요?",

          meaningAnchorTokens: [
            "올해",
            "투자",
          ],

          variationKind:
            "timing",
        },
      ],

      compositeVariants: [
        {
          idSuffix:
            "composite-wait-vs-now",

          question:
            "지금 투자하는 것과 몇 달 기다리는 것 중 어느 쪽이 나을까요?",

          meaningAnchorTokens: [
            "지금",
            "기다리",
            "투자",
          ],

          expectedOverride: {
            intent:
              "comparison",

            decisionTarget:
              "wait",

            analysisMode:
              "selection",
          },

          variationKind:
            "composite",

          boundaryNote:
            "money-invest-possibility 와 timing intent 로 구분",
        },
      ],
    },
    {
      id:
        "money-asset-selection",

      domain:
        "money",

      primaryAxis:
        "money|selection|choose",

      canonicalQuestion:
        "주식과 채권 중 어디에 투자하는 게 나을까요?",

      expected: {
        topic:
          "money",

        intent:
          "selection",

        decisionTarget:
          "choose",

        timingType:
          "unknown",

        analysisMode:
          "selection",
      },

      canonicalMeaningAnchorTokens: [
        "주식",
        "채권",
        "어디",
      ],

      distinctMeaningGroup:
        "money-asset-selection",

      classificationSignatureGroup:
        "money-selection-choose",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "ETF와 예금 중 어느 쪽이 맞을까요?",

          meaningAnchorTokens: [
            "etf",
            "예금",
            "어느",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-risk-tolerance",

          question:
            "변동성이 큰 자산과 안정적인 자산 중 제 상황에 맞는 선택은 무엇일까요?",

          meaningAnchorTokens: [
            "변동성",
            "안정",
            "선택",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "money-invest-possibility 와 selection intent 로 구분",
        },
      ],
    },

    // ── realEstate ────────────────────────────────────────────
    {
      id:
        "realEstate-buy-possibility",

      domain:
        "realEstate",

      primaryAxis:
        "realEstate|possibility|invest",

      canonicalQuestion:
        "아파트를 매수하는 게 가능할까요?",

      expected: {
        topic:
          "realEstate",

        intent:
          "possibility",

        decisionTarget:
          "invest",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "아파트",
        "매수",
      ],

      distinctMeaningGroup:
        "realEstate-buy-possibility",

      classificationSignatureGroup:
        "realEstate-possibility-invest",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "부동산을 사도 괜찮을까요?",

          meaningAnchorTokens: [
            "부동산",
            "사",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-commercial",

          question:
            "상가를 매수해도 될까요?",

          meaningAnchorTokens: [
            "상가",
            "매수",
          ],

          variationKind:
            "target",
        },
        {
          idSuffix:
            "target-land",

          question:
            "토지를 매입해도 될까요?",

          meaningAnchorTokens: [
            "토지",
            "매입",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-debt-burden",

          question:
            "대출 부담이 있는데 상가를 매수해도 될까요?",

          meaningAnchorTokens: [
            "대출",
            "상가",
            "매수",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "money-invest-possibility 와 realEstate topic 으로 구분",
        },
      ],
    },
    {
      id:
        "realEstate-sell-termination",

      domain:
        "realEstate",

      primaryAxis:
        "realEstate|termination|sell",

      canonicalQuestion:
        "보유 중인 건물을 매도해야 하나요?",

      expected: {
        topic:
          "realEstate",

        intent:
          "termination",

        decisionTarget:
          "sell",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "건물",
        "매도",
      ],

      distinctMeaningGroup:
        "realEstate-sell-termination",

      classificationSignatureGroup:
        "realEstate-termination-sell",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "지금 아파트를 팔아도 될까요?",

          meaningAnchorTokens: [
            "아파트",
            "팔",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-tax-burden",

          question:
            "보유세 부담이 커서 부동산을 매도하는 게 맞을까요?",

          meaningAnchorTokens: [
            "보유세",
            "매도",
            "부동산",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "realEstate-continue-hold 와 sell vs continue 로 구분",
        },
      ],
    },
    {
      id:
        "realEstate-continue-hold",

      domain:
        "realEstate",

      primaryAxis:
        "realEstate|continuation|continue",

      canonicalQuestion:
        "현재 부동산을 계속 보유하는 게 좋을까요?",

      expected: {
        topic:
          "realEstate",

        intent:
          "continuation",

        decisionTarget:
          "continue",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "부동산",
        "보유",
        "계속",
      ],

      distinctMeaningGroup:
        "realEstate-continue-hold",

      classificationSignatureGroup:
        "realEstate-continuation-continue",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "가지고 있는 아파트를 유지해도 될까요?",

          meaningAnchorTokens: [
            "아파트",
            "유지",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-rental-income",

          question:
            "임대 수익은 있는데 지금 부동산을 계속 들고 가는 게 맞을까요?",

          meaningAnchorTokens: [
            "임대",
            "부동산",
            "계속",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "realEstate-sell-termination 와 continue vs sell 로 구분",
        },
      ],
    },
    {
      id:
        "realEstate-asset-selection",

      domain:
        "realEstate",

      primaryAxis:
        "realEstate|selection|choose",

      canonicalQuestion:
        "아파트와 상가 중 어느 것을 선택해야 할까요?",

      expected: {
        topic:
          "realEstate",

        intent:
          "selection",

        decisionTarget:
          "choose",

        timingType:
          "unknown",

        analysisMode:
          "selection",
      },

      canonicalMeaningAnchorTokens: [
        "아파트",
        "상가",
        "선택",
      ],

      distinctMeaningGroup:
        "realEstate-asset-selection",

      classificationSignatureGroup:
        "realEstate-selection-choose",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "주택과 토지 중 어디에 투자하는 게 나을까요?",

          meaningAnchorTokens: [
            "주택",
            "토지",
            "어디",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-budget-split",

          question:
            "예산이 3억인데 강남 아파트와 지방 상가 중 어디가 맞을까요?",

          meaningAnchorTokens: [
            "강남",
            "지방",
            "상가",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "realEstate-buy-possibility 와 selection intent 로 구분",
        },
      ],
    },
    {
      id:
        "realEstate-move-possibility",

      domain:
        "realEstate",

      primaryAxis:
        "realEstate|possibility|move",

      canonicalQuestion:
        "현재 아파트에서 다른 지역으로 이사해도 될까요?",

      expected: {
        topic:
          "realEstate",

        intent:
          "possibility",

        decisionTarget:
          "move",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "아파트",
        "이사",
      ],

      distinctMeaningGroup:
        "realEstate-move-possibility",

      classificationSignatureGroup:
        "realEstate-possibility-move",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "지금 집을 정리하고 다른 동네로 옮겨도 될까요?",

          meaningAnchorTokens: [
            "집",
            "옮겨",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-jeju",

          question:
            "서울에서 제주로 이사해도 될까요?",

          meaningAnchorTokens: [
            "서울",
            "제주",
            "이사",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-lease-end",

          question:
            "전세 계약이 곧 끝나는데 이사를 지금 결정해도 될까요?",

          meaningAnchorTokens: [
            "전세",
            "이사",
            "지금",
          ],

          expectedOverride: {
            timingType:
              "executionTiming",
          },

          variationKind:
            "composite",

          boundaryNote:
            "realEstate-buy-possibility 와 move vs invest 로 구분",
        },
      ],
    },

    // ── relationship ────────────────────────────────────────────
    {
      id:
        "relationship-reconcile-possibility",

      domain:
        "relationship",

      primaryAxis:
        "relationship|possibility|reconcile",

      canonicalQuestion:
        "헤어진 사람과 다시 연락해도 될까요?",

      expected: {
        topic:
          "relationship",

        intent:
          "possibility",

        decisionTarget:
          "reconcile",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "헤어진",
        "연락",
      ],

      distinctMeaningGroup:
        "relationship-reconcile-possibility",

      classificationSignatureGroup:
        "relationship-possibility-reconcile",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "싸우고 멀어진 친구와 화해해도 될까요?",

          meaningAnchorTokens: [
            "친구",
            "화해",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-ex-partner",

          question:
            "전 연인과 관계를 회복해도 될까요?",

          meaningAnchorTokens: [
            "전 연인",
            "회복",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-trust-damage",

          question:
            "신뢰가 깨진 관계인데 다시 연락하는 게 맞을까요?",

          meaningAnchorTokens: [
            "신뢰",
            "연락",
            "관계",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "relationship-separate 와 reconcile vs separate 로 구분",
        },
      ],
    },
    {
      id:
        "relationship-separate-termination",

      domain:
        "relationship",

      primaryAxis:
        "relationship|termination|separate",

      canonicalQuestion:
        "지금 관계를 정리하는 게 맞을까요?",

      expected: {
        topic:
          "relationship",

        intent:
          "termination",

        decisionTarget:
          "separate",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "관계",
        "정리",
      ],

      distinctMeaningGroup:
        "relationship-separate-termination",

      classificationSignatureGroup:
        "relationship-termination-separate",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "더 이상 만나지 않는 쪽이 나을까요?",

          meaningAnchorTokens: [
            "만나지",
            "나을",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-repeated-conflict",

          question:
            "갈등이 반복되는데 관계를 끊는 게 맞을까요?",

          meaningAnchorTokens: [
            "갈등",
            "관계",
            "끊",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "relationship-reconcile 와 separate vs reconcile 로 구분",
        },
      ],
    },
    {
      id:
        "relationship-compatibility",

      domain:
        "relationship",

      primaryAxis:
        "relationship|possibility|partner",

      canonicalQuestion:
        "이 사람과 잘 맞을까요?",

      expected: {
        topic:
          "relationship",

        intent:
          "possibility",

        decisionTarget:
          "partner",

        timingType:
          "unknown",

        analysisMode:
          "compatibility",
      },

      canonicalMeaningAnchorTokens: [
        "이 사람",
        "맞을까",
      ],

      distinctMeaningGroup:
        "relationship-compatibility",

      classificationSignatureGroup:
        "relationship-possibility-partner",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "상대와 궁합이 맞는지 알고 싶어요.",

          meaningAnchorTokens: [
            "궁합",
            "상대",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-business-partner",

          question:
            "사업 파트너로 이 사람과 맞을까요?",

          meaningAnchorTokens: [
            "사업",
            "파트너",
            "이 사람",
          ],

          expectedOverride: {
            topic:
              "business",

            analysisMode:
              "compatibility",
          },

          variationKind:
            "target",

          boundaryNote:
            "business-partner-compatibility 와 relationship topic 경계",
        },
      ],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-long-distance",

          question:
            "장거리 연애 중인데 이 사람과 계속 만나도 될까요?",

          meaningAnchorTokens: [
            "장거리",
            "이 사람",
            "만나",
          ],

          expectedOverride: {
            topic:
              "love",

            decisionTarget:
              "continue",

            intent:
              "continuation",

            analysisMode:
              "compatibility",
          },

          variationKind:
            "composite",

          boundaryNote:
            "relationship-compatibility 와 love topic 경계",
        },
      ],
    },
    {
      id:
        "relationship-conflict-response",

      domain:
        "relationship",

      primaryAxis:
        "relationship|method|respondToConflict",

      canonicalQuestion:
        "친구와 생긴 갈등에 어떻게 대응해야 할까요?",

      expected: {
        topic:
          "relationship",

        intent:
          "method",

        decisionTarget:
          "respondToConflict",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "친구",
        "갈등",
        "대응",
      ],

      distinctMeaningGroup:
        "relationship-conflict-response",

      classificationSignatureGroup:
        "relationship-method-respondToConflict",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "사람 사이 오해를 풀려면 어떻게 해야 할까요?",

          meaningAnchorTokens: [
            "오해",
            "풀",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-workplace-conflict",

          question:
            "직장 동료와 갈등이 있는데 먼저 연락하는 게 맞을까요?",

          meaningAnchorTokens: [
            "동료",
            "갈등",
            "연락",
          ],

          expectedOverride: {
            intent:
              "possibility",

            decisionTarget:
              "reconcile",
          },

          variationKind:
            "composite",

          boundaryNote:
            "relationship-reconcile 와 method vs possibility 로 구분",
        },
      ],
    },

    // ── marriage ────────────────────────────────────────────────
    {
      id:
        "marriage-marry-possibility",

      domain:
        "marriage",

      primaryAxis:
        "marriage|possibility|marry",

      canonicalQuestion:
        "현재 연인과 결혼을 결정해도 될까요?",

      expected: {
        topic:
          "marriage",

        intent:
          "possibility",

        decisionTarget:
          "marry",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "연인",
        "결혼",
      ],

      distinctMeaningGroup:
        "marriage-marry-possibility",

      classificationSignatureGroup:
        "marriage-possibility-marry",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "지금 만나는 사람과 결혼해도 괜찮을까요?",

          meaningAnchorTokens: [
            "만나는 사람",
            "결혼",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [
        {
          idSuffix:
            "target-long-term-partner",

          question:
            "오래 사귄 연인과 결혼해도 될까요?",

          meaningAnchorTokens: [
            "오래",
            "연인",
            "결혼",
          ],

          variationKind:
            "target",
        },
      ],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-family-opposition",

          question:
            "가족 반대가 있는데 지금 결혼해도 될까요?",

          meaningAnchorTokens: [
            "가족",
            "반대",
            "결혼",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "relationship-compatibility 와 marriage topic 으로 구분",
        },
      ],
    },
    {
      id:
        "marriage-timing",

      domain:
        "marriage",

      primaryAxis:
        "marriage|timing|marry",

      canonicalQuestion:
        "결혼 시기는 언제가 좋을까요?",

      expected: {
        topic:
          "marriage",

        intent:
          "timing",

        decisionTarget:
          "marry",

        timingType:
          "bestTiming",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "결혼",
        "시기",
        "언제",
      ],

      distinctMeaningGroup:
        "marriage-timing",

      classificationSignatureGroup:
        "marriage-timing-marry",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "혼인 적기는 언제일까요?",

          meaningAnchorTokens: [
            "혼인",
            "적기",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [
        {
          idSuffix:
            "timing-this-year",

          question:
            "올해 결혼해도 될까요?",

          meaningAnchorTokens: [
            "올해",
            "결혼",
          ],

          variationKind:
            "timing",
        },
      ],

      compositeVariants: [
        {
          idSuffix:
            "composite-wait-vs-now",

          question:
            "지금 결혼하는 것과 내년으로 미루는 것 중 어느 쪽이 나을까요?",

          meaningAnchorTokens: [
            "지금",
            "내년",
            "결혼",
          ],

          expectedOverride: {
            intent:
              "comparison",

            decisionTarget:
              "wait",

            analysisMode:
              "selection",
          },

          variationKind:
            "composite",

          boundaryNote:
            "marriage-marry-possibility 와 timing intent 로 구분",
        },
      ],
    },
    {
      id:
        "marriage-divorce-termination",

      domain:
        "marriage",

      primaryAxis:
        "marriage|termination|separate",

      canonicalQuestion:
        "배우자와 이혼을 결정해도 될까요?",

      expected: {
        topic:
          "marriage",

        intent:
          "termination",

        decisionTarget:
          "separate",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "배우자",
        "이혼",
      ],

      distinctMeaningGroup:
        "marriage-divorce-termination",

      classificationSignatureGroup:
        "marriage-termination-separate",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "결혼 생활을 정리하는 게 맞을까요?",

          meaningAnchorTokens: [
            "결혼",
            "정리",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-child-custody",

          question:
            "자녀가 있는데 지금 이혼해도 될까요?",

          meaningAnchorTokens: [
            "자녀",
            "이혼",
            "지금",
          ],

          expectedOverride: {
            timingType:
              "executionTiming",
          },

          variationKind:
            "composite",

          boundaryNote:
            "marriage-marry-possibility 와 separate vs marry 로 구분",
        },
      ],
    },
    {
      id:
        "marriage-spouse-compatibility",

      domain:
        "marriage",

      primaryAxis:
        "marriage|possibility|partner",

      canonicalQuestion:
        "이 사람과 결혼 생활이 잘 맞을까요?",

      expected: {
        topic:
          "marriage",

        intent:
          "possibility",

        decisionTarget:
          "partner",

        timingType:
          "unknown",

        analysisMode:
          "compatibility",
      },

      canonicalMeaningAnchorTokens: [
        "이 사람",
        "결혼",
        "맞을까",
      ],

      distinctMeaningGroup:
        "marriage-spouse-compatibility",

      classificationSignatureGroup:
        "marriage-possibility-partner",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "배우자와의 궁합이 좋을까요?",

          meaningAnchorTokens: [
            "배우자",
            "궁합",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-remarriage",

          question:
            "재혼 상대로 이 사람이 맞을까요?",

          meaningAnchorTokens: [
            "재혼",
            "이 사람",
          ],

          variationKind:
            "composite",

          boundaryNote:
            "marriage-marry-possibility 와 partner compatibility 로 구분",
        },
      ],
    },

    // ── lifeDirection ───────────────────────────────────────────
    {
      id:
        "lifeDirection-confirm",

      domain:
        "lifeDirection",

      primaryAxis:
        "lifeDirection|generalJudgement|confirmDirection",

      canonicalQuestion:
        "제 인생의 방향을 어떻게 잡아야 할까요?",

      expected: {
        topic:
          "lifeDirection",

        intent:
          "generalJudgement",

        decisionTarget:
          "confirmDirection",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "인생",
        "방향",
      ],

      distinctMeaningGroup:
        "lifeDirection-confirm",

      classificationSignatureGroup:
        "lifeDirection-generalJudgement-confirmDirection",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "앞으로 어떤 길을 선택해야 할지 모르겠어요.",

          meaningAnchorTokens: [
            "앞으로",
            "길",
            "선택",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-career-vs-business",

          question:
            "직장을 유지할지 사업을 시작할지 인생 방향을 어떻게 정해야 할까요?",

          meaningAnchorTokens: [
            "직장",
            "사업",
            "인생",
            "방향",
          ],

          expectedOverride: {
            intent:
              "comparison",

            decisionTarget:
              "choose",

            analysisMode:
              "selection",
          },

          variationKind:
            "composite",

          boundaryNote:
            "job-change / business-start 와 lifeDirection topic 으로 구분",
        },
      ],
    },
    {
      id:
        "lifeDirection-selection",

      domain:
        "lifeDirection",

      primaryAxis:
        "lifeDirection|selection|choose",

      canonicalQuestion:
        "안정적인 길과 도전적인 길 중 어느 쪽이 맞을까요?",

      expected: {
        topic:
          "lifeDirection",

        intent:
          "selection",

        decisionTarget:
          "choose",

        timingType:
          "unknown",

        analysisMode:
          "selection",
      },

      canonicalMeaningAnchorTokens: [
        "안정",
        "도전",
        "어느",
      ],

      distinctMeaningGroup:
        "lifeDirection-selection",

      classificationSignatureGroup:
        "lifeDirection-selection-choose",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "현재 생활을 유지할지 새로운 길로 바꿀지 고민입니다.",

          meaningAnchorTokens: [
            "현재",
            "새로운",
            "길",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [
        {
          idSuffix:
            "composite-age-transition",

          question:
            "40대에 접어들었는데 인생 전환을 지금 해도 될까요?",

          meaningAnchorTokens: [
            "40대",
            "인생",
            "전환",
            "지금",
          ],

          expectedOverride: {
            intent:
              "possibility",

            decisionTarget:
              "confirmDirection",

            timingType:
              "executionTiming",

            analysisMode:
              "decision",
          },

          variationKind:
            "composite",

          boundaryNote:
            "lifeDirection-confirm 와 selection vs generalJudgement 로 구분",
        },
      ],
    },
    {
      id:
        "lifeDirection-timing",

      domain:
        "lifeDirection",

      primaryAxis:
        "lifeDirection|timing|confirmDirection",

      canonicalQuestion:
        "인생 전환은 언제 시작하는 게 좋을까요?",

      expected: {
        topic:
          "lifeDirection",

        intent:
          "timing",

        decisionTarget:
          "confirmDirection",

        timingType:
          "bestTiming",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "인생",
        "전환",
        "언제",
      ],

      distinctMeaningGroup:
        "lifeDirection-timing",

      classificationSignatureGroup:
        "lifeDirection-timing-confirmDirection",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "새로운 시작을 언제 하면 맞을까요?",

          meaningAnchorTokens: [
            "새로운",
            "시작",
            "언제",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [
        {
          idSuffix:
            "timing-this-year",

          question:
            "올해 인생 방향을 바꿔도 될까요?",

          meaningAnchorTokens: [
            "올해",
            "인생",
            "방향",
          ],

          variationKind:
            "timing",
        },
      ],

      compositeVariants: [
        {
          idSuffix:
            "composite-family-timing",

          question:
            "가족 계획을 고려하면 인생 전환 시기를 미루는 게 나을까요?",

          meaningAnchorTokens: [
            "가족",
            "인생",
            "시기",
            "미루",
          ],

          expectedOverride: {
            intent:
              "comparison",

            decisionTarget:
              "wait",

            analysisMode:
              "selection",
          },

          variationKind:
            "composite",

          boundaryNote:
            "lifeDirection-confirm 와 timing intent 로 구분",
        },
      ],
    },

    // ── health ──────────────────────────────────────────────────
    {
      id:
        "health-checkup-possibility",

      domain:
        "health",

      primaryAxis:
        "health|possibility|protectHealth",

      canonicalQuestion:
        "건강검진을 받아도 될까요?",

      expected: {
        topic:
          "health",

        intent:
          "possibility",

        decisionTarget:
          "protectHealth",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "건강",
        "검진",
        "해도 될까",
      ],

      distinctMeaningGroup:
        "health-checkup",

      classificationSignatureGroup:
        "health-possibility-protectHealth",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "병원에 가서 검사를 받아도 될까요?",

          meaningAnchorTokens: [
            "병원",
            "검사",
            "해도 될까",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [],
    },

    // ── legal ───────────────────────────────────────────────────
    {
      id:
        "legal-sue-possibility",

      domain:
        "legal",

      primaryAxis:
        "legal|possibility|respondToConflict",

      canonicalQuestion:
        "고소하는 게 맞을까요?",

      expected: {
        topic:
          "legal",

        intent:
          "possibility",

        decisionTarget:
          "respondToConflict",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "고소",
        "맞을까",
      ],

      distinctMeaningGroup:
        "legal-sue",

      classificationSignatureGroup:
        "legal-possibility-respondToConflict",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "분쟁을 소송으로 가져가도 될까요?",

          meaningAnchorTokens: [
            "분쟁",
            "소송",
            "해도 될까",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [],
    },

    // ── lifeFlow ────────────────────────────────────────────────
    {
      id:
        "lifeFlow-overall-possibility",

      domain:
        "lifeFlow",

      primaryAxis:
        "lifeFlow|prediction|none",

      canonicalQuestion:
        "올해 운의 흐름은 어떤가요?",

      expected: {
        topic:
          "lifeFlow",

        intent:
          "prediction",

        decisionTarget:
          "none",

        timingType:
          "bestTiming",

        analysisMode:
          "interpretation",
      },

      canonicalMeaningAnchorTokens: [
        "올해",
        "운",
        "흐름",
      ],

      distinctMeaningGroup:
        "lifeFlow-overall",

      classificationSignatureGroup:
        "lifeFlow-prediction-none",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "제 총운이 궁금합니다",

          meaningAnchorTokens: [
            "총운",
            "궁금",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [],
    },

    // ── general / existence ─────────────────────────────────────
    {
      id:
        "general-luck-existence",

      domain:
        "general",

      primaryAxis:
        "general|existence|none",

      canonicalQuestion:
        "나에게 운이 있나요?",

      expected: {
        topic:
          "general",

        intent:
          "existence",

        decisionTarget:
          "none",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "운",
        "있나요",
      ],

      distinctMeaningGroup:
        "general-luck-existence",

      classificationSignatureGroup:
        "general-existence-none",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "좋은 수가 있나요?",

          meaningAnchorTokens: [
            "좋은 수",
            "있나요",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [],
    },

    // ── general / interpretation ────────────────────────────────
    {
      id:
        "general-self-interpretation",

      domain:
        "general",

      primaryAxis:
        "general|generalJudgement|none",

      canonicalQuestion:
        "나는 어떤 성향인가요?",

      expected: {
        topic:
          "general",

        intent:
          "generalJudgement",

        decisionTarget:
          "none",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      canonicalMeaningAnchorTokens: [
        "성향",
        "어떤",
      ],

      distinctMeaningGroup:
        "general-self-interpretation",

      classificationSignatureGroup:
        "general-generalJudgement-none",

      paraphrases: [
        {
          idSuffix:
            "paraphrase-01",

          question:
            "내 사주의 특징은 뭔가요?",

          meaningAnchorTokens: [
            "사주",
            "특징",
          ],

          variationKind:
            "paraphrase",
        },
      ],

      targetVariants: [],

      timingVariants: [],

      compositeVariants: [],
    },
  ];
