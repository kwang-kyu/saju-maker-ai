import type {
  QuestionContext,
} from "../question/questionContext.js";

import type {
  DecisionExplanationInput,
} from "./decisionResultReader.js";

import {
  resolveDecisionExplanationFocus,
  type DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

import {
  buildReaderDecisionExplanation,
} from "./readerDecisionExplanationBuilder.js";

import {
  buildDecisionExplanationEvidence,
} from "./decisionExplanationEvidenceBuilder.js";

import {
  deduplicateExplanationLines,
} from "./decisionExplanationTextDeduplicator.js";

import {
  filterRelevantConditions,
  filterRelevantEvidence,
  filterRelevantRisks,
} from "./decisionExplanationMaterialRelevance.js";

export type {
  DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

export type ExplanationStep =
  | "directAnswer"
  | "humanContext"
  | "alignment"
  | "readerDecisionEffect"
  | "evidence"
  | "conditions"
  | "risks"
  | "recommendedDirection"
  | "prohibitedDirection"
  | "finalDecision";

export type ExplanationBlock = {
  step:
    ExplanationStep;

  title:
    string;

  required:
    boolean;

  content:
    string;
};

/**
 * Legacy / consulting explanation packaging plan.
 *
 * Still built by runConsultingTurn → consultingPromptBuilder.
 * Not the production vNext GPT Input SoT.
 * Production packaging SoT:
 *   ScenarioRouter → AnswerBlueprint → ResponseContext → prompt.
 */
export type DecisionExplanationPlan = {
  originalQuestion:
    string;

  topic:
    DecisionExplanationInput["topic"];

  intent:
    DecisionExplanationInput["intent"];

  decisionTarget:
    DecisionExplanationInput["decisionTarget"];

  conclusionNature:
    DecisionExplanationInput["conclusionNature"];

  verdict:
    DecisionExplanationInput["verdict"];

  confidence:
    DecisionExplanationInput["confidence"];

  blocks:
    ExplanationBlock[];

  explanationKind?:
    "roleRecommendation"
    | "lifeFlowInterpretation"
    | "decision";

  explanationFocus?:
    DecisionExplanationFocus;

  engineDecisionLocked:
    true;

  gptMayRejudge:
    false;
};

const CONTEXT_ALIGNMENT_KOREAN:
  Readonly<Record<string, string>> = {
    stronglyAligned:
      "현재 사람의 성향과 삶의 국면에 매우 잘 맞는다.",

    aligned:
      "현재 사람의 성향과 삶의 국면에 대체로 맞는다.",

    partiallyAligned:
      "일부는 맞지만 현실 조건을 보완해야 한다.",

    weaklyAligned:
      "현재 성향과 국면에 맞는 부분이 제한적이다.",

    notAligned:
      "현재 사람의 성향이나 삶의 국면과 맞지 않는다.",

    conflicting:
      "사람의 성향과 현재 현실 조건이 서로 충돌한다.",

    unknown:
      "현재 국면과의 정합성을 확정할 근거가 부족하다.",
  };

const ACTION_READINESS_KOREAN:
  Readonly<Record<string, string>> = {
    ready:
      "현재 실행을 시작할 준비가 되어 있다.",

    readyWithConditions:
      "필수 조건을 갖추면 실행할 수 있다.",

    needsPreparation:
      "실행 전에 준비와 검증이 더 필요하다.",

    notReady:
      "현재는 실행할 준비가 충분하지 않다.",

    blocked:
      "현재 조건에서는 실행을 막는 제약이 있다.",

    unknown:
      "실행 준비 상태를 확정할 정보가 부족하다.",
  };

function requireOriginalQuestion(
  question:
    string,
): string {
  const normalizedQuestion =
    question
      .trim();

  if (
    normalizedQuestion
      .length
    === 0
  ) {
    throw new Error(
      "Decision explanation requires the original question.",
    );
  }

  return normalizedQuestion;
}

function buildQuestionLockedDirectAnswerContent(
  normalizedQuestion:
    string,
  directAnswer:
    string,
): string {
  return [
    `질문하신 “${normalizedQuestion}”에 대한 판단입니다.`,
    directAnswer,
  ].join(
    "\n",
  );
}

function translateContextAlignment(
  contextAlignment:
    string,
): string {
  return (
    CONTEXT_ALIGNMENT_KOREAN[
      contextAlignment
    ]
    ?? "현재 사람의 성향과 삶의 국면을 기준으로 정합성을 판단했다."
  );
}

function translateActionReadiness(
  actionReadiness:
    string,
): string {
  return (
    ACTION_READINESS_KOREAN[
      actionReadiness
    ]
    ?? "제공된 조건을 기준으로 실행 준비 상태를 판단했다."
  );
}

function buildRoleRecommendationExplanationBlocks(
  input:
    DecisionExplanationInput,
): ExplanationBlock[] {
  const assessment =
    input
      .roleRecommendationAssessment;

  if (
    !assessment
    || !assessment.available
  ) {
    return [];
  }

  const [
    primary,
    secondary,
    tertiary,
  ] = assessment.candidates;

  const roleEvidenceLines =
    input
      .evidence
      .filter(
        (item) =>
          item.source
          === "roleRecommendation",
      )
      .map(
        (item) =>
          item.description,
      );

  const avoidedRolePatterns =
    assessment
      .avoidedRolePatterns;

  const blocks:
    ExplanationBlock[] = [
    {
      step:
        "directAnswer",

      title:
        "성격 한 줄 제목",

      required:
        true,

      content:
        input.reason,
    },
    {
      step:
        "humanContext",

      title:
        "가장 어울리는 대표 배역",

      required:
        true,

      content:
        [
          primary.title,
          primary.archetype,
          primary.characterDescription,
          primary.whyItFits,
        ].join("\n"),
    },
    {
      step:
        "alignment",

      title:
        "추가 배역 1",

      required:
        true,

      content:
        [
          secondary.title,
          secondary.archetype,
          secondary.whyItFits,
          secondary.performanceStyle,
        ].join("\n"),
    },
    {
      step:
        "readerDecisionEffect",

      title:
        "추가 배역 2",

      required:
        true,

      content:
        [
          tertiary.title,
          tertiary.archetype,
          tertiary.whyItFits,
          tertiary.performanceStyle,
        ].join("\n"),
    },
    {
      step:
        "evidence",

      title:
        "배역별 사주·Reader 근거",

      required:
        true,

      content:
        roleEvidenceLines.join(
          "\n",
        ),
    },
    {
      step:
        "recommendedDirection",

      title:
        "대사·표정·움직임·장면에서의 표현 방식",

      required:
        true,

      content:
        [
          primary.performanceStyle,
          primary.strongScenes,
          secondary.strongScenes,
          tertiary.strongScenes,
        ].join("\n"),
    },
  ];

  if (
    avoidedRolePatterns
      .length
    > 0
  ) {
    blocks.push(
      {
        step:
          "prohibitedDirection",

        title:
          "잘 살리지 못할 가능성이 있는 역할 유형",

        required:
          true,

        content:
          avoidedRolePatterns
            .join("\n"),
      },
    );
  }

  blocks.push(
    {
      step:
        "finalDecision",

      title:
        "최종 추천",

      required:
        true,

      content:
        input.finalDecisionSentence,
    },
  );

  return blocks;
}

function buildLifeFlowInterpretationExplanationBlocks(
  input:
    DecisionExplanationInput,
): ExplanationBlock[] {
  const assessment =
    input
      .lifeFlowInterpretationAssessment;

  if (
    !assessment
    || !assessment.available
    || !assessment.target
  ) {
    return [];
  }

  const target =
    assessment.target;

  const periodLabel =
    target.scope === "overall"
      ? "총운·전체 운"
      : target.scope === "year"
        ? `${target.targetYear}년 연운`
        : target.scope === "halfYear"
          ? `${target.targetYear}년 ${target.half === "first" ? "상반기" : "하반기"} 운`
          : target.scope === "month"
            ? `${target.targetYear}년 ${target.targetMonth}월 월운`
            : `${target.startDate} 일운`;

  const daeunSeunLines =
    input
      .evidence
      .filter(
        (item) =>
          item.source
          === "lifePhase"
          || item.source
          === "blessing"
          || item.source
          === "capacity",
      )
      .map(
        (item) =>
          item.description,
      );

  const supportiveLines =
    assessment
      .supportiveSignals;

  const tensionLines =
    assessment
      .tensionSignals;

  const segmentLines =
    assessment
      .periodSegments
      .map(
        (segment) =>
          segment.theme,
      );

  return [
    {
      step:
        "directAnswer",

      title:
        "질문한 기간",

      required:
        true,

      content:
        [
          periodLabel,
          ...target.evidence,
        ].join("\n"),
    },
    {
      step:
        "humanContext",

      title:
        "전체 흐름의 핵심 한 줄",

      required:
        true,

      content:
        assessment.overallTheme,
    },
    {
      step:
        "alignment",

      title:
        "대운·세운 근거",

      required:
        true,

      content:
        daeunSeunLines.join(
          "\n",
        ),
    },
    {
      step:
        "readerDecisionEffect",

      title:
        "월운·일운 근거",

      required:
        segmentLines.length
        > 0,

      content:
        segmentLines.join(
          "\n",
        ),
    },
    {
      step:
        "evidence",

      title:
        "유리하게 나타나는 부분",

      required:
        supportiveLines.length
        > 0,

      content:
        supportiveLines.join(
          "\n",
        ),
    },
    {
      step:
        "recommendedDirection",

      title:
        "주의할 흐름",

      required:
        tensionLines.length
        > 0,

      content:
        tensionLines.join(
          "\n",
        ),
    },
    {
      step:
        "finalDecision",

      title:
        "최종 요약",

      required:
        true,

      content:
        input.finalDecisionSentence,
    },
  ];
}

function hasTimingPeriodEvidence(
  assessment:
    NonNullable<
      DecisionExplanationInput["timingAssessment"]
    >,
): boolean {
  return (
    assessment.targetMonth
    !== null
    || assessment.hasWolun
    || assessment.hasIlun
    || assessment.hasYearSegments
    || assessment.evidenceKeys.some(
      (key) =>
        key.startsWith(
          "wolun",
        ),
    )
  );
}

function hasTimingFlowContent(
  assessment:
    NonNullable<
      DecisionExplanationInput["timingAssessment"]
    >,
): boolean {
  return (
    assessment.flowInterpretationAvailable
    || (
      assessment.overallTheme
        ?.trim()
        .length
      ?? 0
    ) > 0
    || assessment.supportiveSignals.length
    > 0
    || assessment.tensionSignals.length
    > 0
    || assessment.cautions.length
    > 0
  );
}

function timingSearchAlreadyExplainsWindows(
  assessment:
    NonNullable<
      DecisionExplanationInput["timingAssessment"]
    >,
): boolean {
  const timingSearch =
    assessment.timingSearch;

  return (
    timingSearch.required
    && timingSearch.available
    && (
      timingSearch.recommendedWindows.length
      > 0
      || timingSearch.cautionWindows.length
      > 0
    )
  );
}

function buildTimingAssessmentPeriodLabel(
  assessment:
    NonNullable<
      DecisionExplanationInput["timingAssessment"]
    >,
): string | null {
  if (
    assessment.targetScope
    === "month"
    && assessment.targetYear
    !== null
    && assessment.targetMonth
    !== null
  ) {
    return `${assessment.targetYear}년 ${assessment.targetMonth}월 월운`;
  }

  if (
    assessment.targetScope
    === "year"
    && assessment.targetYear
    !== null
  ) {
    return `${assessment.targetYear}년 연운`;
  }

  if (
    assessment.targetScope
    === "day"
    && assessment.targetStartDate
  ) {
    return `${assessment.targetStartDate} 일운`;
  }

  if (
    assessment.targetStartDate
    && assessment.targetEndDate
  ) {
    return `${assessment.targetStartDate}~${assessment.targetEndDate}`;
  }

  return null;
}

function buildTimingAssessmentExplanationBlocks(
  input:
    DecisionExplanationInput,
): ExplanationBlock[] {
  const assessment =
    input.timingAssessment;

  if (
    !assessment
    || !assessment.analysisRequired
    || !hasTimingPeriodEvidence(
      assessment,
    )
    || !hasTimingFlowContent(
      assessment,
    )
    || timingSearchAlreadyExplainsWindows(
      assessment,
    )
  ) {
    return [];
  }

  const periodLabel =
    buildTimingAssessmentPeriodLabel(
      assessment,
    );

  const flowSummaryLines =
    [
      periodLabel,
      assessment.overallTheme,
    ].filter(
      (
        line,
      ): line is string =>
        typeof line
        === "string"
        && line.length
        > 0,
    );

  const supportiveLines =
    assessment
      .supportiveSignals;

  const segmentLines =
    assessment
      .periodSegments
      .map(
        (segment) =>
          [
            segment.periodLabel,
            segment.theme,
          ].join(
            "\n",
          ),
      );

  const wolunEvidenceLines =
    [
      ...segmentLines,
      ...supportiveLines,
    ];

  const cautionLines =
    [
      ...assessment
        .tensionSignals,
      ...assessment
        .cautions,
    ];

  const limitationLines =
    assessment
      .limitations;

  const blocks:
    ExplanationBlock[] = [];

  if (
    flowSummaryLines.length
    > 0
  ) {
    blocks.push({
      step:
        "evidence",

      title:
        "대상 시기의 핵심 흐름",

      required:
        true,

      content:
        flowSummaryLines.join(
          "\n",
        ),
    });
  }

  if (
    wolunEvidenceLines.length
    > 0
  ) {
    blocks.push({
      step:
        "evidence",

      title:
        "월운·일운 근거",

      required:
        true,

      content:
        wolunEvidenceLines.join(
          "\n\n",
        ),
    });
  }

  if (
    cautionLines.length
    > 0
  ) {
    blocks.push({
      step:
        "risks",

      title:
        "대상 시기의 주의 흐름",

      required:
        true,

      content:
        cautionLines.join(
          "\n",
        ),
    });
  }

  if (
    limitationLines.length
    > 0
  ) {
    blocks.push({
      step:
        "conditions",

      title:
        "시기 해석의 한계",

      required:
        true,

      content:
        limitationLines.join(
          "\n",
        ),
    });
  }

  return blocks;
}

function buildTimingSearchExplanationBlocks(
  input:
    DecisionExplanationInput,
): ExplanationBlock[] {
  const timingSearch =
    input
      .timingAssessment
      ?.timingSearch;

  if (
    !timingSearch
    || !timingSearch.required
    || !timingSearch.available
  ) {
    return [];
  }

  const recommendedLines =
    timingSearch
      .recommendedWindows
      .map(
        (window) => {
          const reasons =
            window
              .supportiveReasons
              .slice(
                0,
                3,
              )
              .join(" / ");

          return [
            `${window.targetYear}년 ${window.targetMonth}월`,
            `(${window.startDate} ~ ${window.endDate})`,
            `${window.ganZhi} · ${window.tenGod}`,
            `시기 점수 ${window.score}`,
            reasons.length > 0
              ? `근거: ${reasons}`
              : "",
          ]
            .filter(
              (line) =>
                line.length > 0,
            )
            .join(" ");
        },
      );

  const cautionLines =
    timingSearch
      .cautionWindows
      .map(
        (window) => {
          const reasons =
            window
              .cautionReasons
              .slice(
                0,
                3,
              )
              .join(" / ");

          return [
            `${window.targetYear}년 ${window.targetMonth}월`,
            `(${window.startDate} ~ ${window.endDate})`,
            `${window.ganZhi} · ${window.tenGod}`,
            `시기 점수 ${window.score}`,
            reasons.length > 0
              ? `주의 근거: ${reasons}`
              : "",
          ]
            .filter(
              (line) =>
                line.length > 0,
            )
            .join(" ");
        },
      );

  const limitations =
    timingSearch
      .limitations
      .join("\n");

  const blocks:
    ExplanationBlock[] = [];

  if (
    recommendedLines.length
    > 0
  ) {
    blocks.push({
      step:
        "recommendedDirection",

      title:
        "상대적으로 유리한 시기",

      required:
        true,

      content:
        recommendedLines.join(
          "\n",
        ),
    });
  }

  if (
    cautionLines.length
    > 0
  ) {
    blocks.push({
      step:
        "risks",

      title:
        "상대적으로 주의할 시기",

      required:
        true,

      content:
        cautionLines.join(
          "\n",
        ),
    });
  }

  if (
    limitations.length
    > 0
  ) {
    blocks.push({
      step:
        "conditions",

      title:
        "시기 판단의 한계",

      required:
        true,

      content:
        limitations,
    });
  }

  return blocks;
}

type DecisionExplanationMaterials = {
  normalizedQuestion:
    string;

  directAnswerContent:
    string;

  alignmentContent:
    string;

  compatibilityAlignmentContent:
    string;

  readerDecisionExplanation:
    ReturnType<
      typeof buildReaderDecisionExplanation
    >;

  evidenceLines:
    string[];

  conditionLines:
    string[];

  riskLines:
    string[];

  hasCashFlowEvidence:
    boolean;
};

const BUSINESS_START_STEP_TITLES = {
  directAnswer:
    "사업 방향의 적합성",

  humanContext:
    "이 사람에게서 중요한 특성",

  alignment:
    "현재 시점의 적합성",

  evidence:
    "이번 질문을 판단한 핵심 근거",

  conditions:
    "성공을 위해 필요한 조건",

  risks:
    "사업상 위험",

  recommendedDirection:
    "권장 실행 방향",

  prohibitedDirection:
    "피해야 할 진행 방식",

  finalDecision:
    "최종 판단",
} as const;

function hasCashFlowRelatedEvidence(
  input:
    DecisionExplanationInput,
  questionContext?:
    QuestionContext,
): boolean {
  const hasCashFlowSource =
    input.evidence.some(
      (item) =>
        item.source
        === "currentContext",
    );

  const hasFinancialReality =
    questionContext
      ?.reality
      .constraints
      .some(
        (constraint) =>
          constraint.area
          === "financial",
      )
    === true;

  return (
    hasCashFlowSource
    || hasFinancialReality
  );
}

function buildCompatibilityAlignmentContent(
  input:
    DecisionExplanationInput,
): string {
  const lines = [
    translateContextAlignment(
      input.contextAlignment,
    ),
  ];

  if (
    input.conflictExists
    && input.conflictDescription.trim()
      .length
    > 0
  ) {
    lines.push(
      input.conflictDescription,
    );
  }

  return lines.join(
    "\n",
  );
}

function buildDecisionExplanationMaterials(
  input:
    DecisionExplanationInput,
  normalizedQuestion:
    string,
  questionContext?:
    QuestionContext,
  focus?:
    DecisionExplanationFocus,
): DecisionExplanationMaterials {
  const readerDecisionExplanation =
    buildReaderDecisionExplanation(
      input,
    );

  const relevanceContext =
    focus
      ? {
        focus,
        questionContext,
        actionReadiness:
          input.actionReadiness,
        decisionTarget:
          input.decisionTarget,
      }
      : undefined;

  const relevantEvidence =
    relevanceContext
      ? filterRelevantEvidence(
        input.evidence,
        relevanceContext,
      )
      : input.evidence;

  const evidenceContent =
    buildDecisionExplanationEvidence({
      evidence:
        relevantEvidence,

      topic:
        input.topic,

      readerEffectSources:
        readerDecisionExplanation
          .sources,
    });

  const evidenceLines =
    deduplicateExplanationLines(
      evidenceContent.split(
        /\r?\n/,
      ),
    );

  const relevantConditions =
    relevanceContext
      ? filterRelevantConditions(
        input.conditions,
        relevanceContext,
      )
      : input.conditions;

  const relevantRisks =
    relevanceContext
      ? filterRelevantRisks(
        input.risks,
        relevanceContext,
      )
      : input.risks;

  const conditionLines =
    deduplicateExplanationLines(
      relevantConditions.map(
        (condition) =>
          condition.description,
      ),
      evidenceLines,
    );

  const riskLines =
    deduplicateExplanationLines(
      relevantRisks.map(
        (risk) =>
          risk.description,
      ),
      [
        ...evidenceLines,
        ...conditionLines,
      ],
    );

  return {
    normalizedQuestion,

    directAnswerContent:
      buildQuestionLockedDirectAnswerContent(
        normalizedQuestion,
        input.directAnswer,
      ),

    alignmentContent: [
      translateContextAlignment(
        input.contextAlignment,
      ),
      translateActionReadiness(
        input.actionReadiness,
      ),
    ].join(
      "\n",
    ),

    compatibilityAlignmentContent:
      buildCompatibilityAlignmentContent(
        input,
      ),

    readerDecisionExplanation,

    evidenceLines,

    conditionLines,

    riskLines,

    hasCashFlowEvidence:
      hasCashFlowRelatedEvidence(
        input,
        questionContext,
      ),
  };
}

function buildFinalDecisionBlock(
  input:
    DecisionExplanationInput,
): ExplanationBlock {
  return {
    step:
      "finalDecision",

    title:
      "최종 판단",

    required:
      true,

    content:
      input.finalDecisionSentence,
  };
}

function buildCompatibilityExplanationBlocks(
  input:
    DecisionExplanationInput,
  materials:
    DecisionExplanationMaterials,
): ExplanationBlock[] {
  const blocks:
    ExplanationBlock[] = [
      {
        step:
          "directAnswer",

        title:
          "직접 궁합 판단",

        required:
          true,

        content:
          materials.directAnswerContent,
      },
      {
        step:
          "alignment",

        title:
          "상대와의 맞음/충돌",

        required:
          true,

        content:
          materials.compatibilityAlignmentContent,
      },
      {
        step:
          "evidence",

        title:
          "필요한 근거",

        required:
          materials.evidenceLines.length
          > 0,

        content:
          materials.evidenceLines.join(
            "\n",
          ),
      },
    ];

  if (
    materials.conditionLines.length
    > 0
  ) {
    blocks.push({
      step:
        "conditions",

      title:
        "이번 판단에 필요한 조건",

      required:
        true,

      content:
        materials.conditionLines.join(
          "\n",
        ),
    });
  }

  blocks.push({
    step:
      "risks",

    title:
      "주의점",

    required:
      materials.riskLines.length
      > 0,

    content:
      materials.riskLines.join(
        "\n",
      ),
  });

  blocks.push({
    step:
      "recommendedDirection",

    title:
      "관계 방향",

    required:
      true,

    content:
      input.recommendedDirection,
  });

  blocks.push(
    buildFinalDecisionBlock(
      input,
    ),
  );

  return blocks;
}

function buildContinuationExplanationBlocks(
  input:
    DecisionExplanationInput,
  materials:
    DecisionExplanationMaterials,
): ExplanationBlock[] {
  return [
    {
      step:
        "directAnswer",

      title:
        "계속 유지하는 것이 맞는지",

      required:
        true,

      content:
        materials.directAnswerContent,
    },
    {
      step:
        "evidence",

      title:
        "유지의 근거",

      required:
        materials.evidenceLines.length
        > 0,

      content:
        materials.evidenceLines.join(
          "\n",
        ),
    },
    {
      step:
        "conditions",

      title:
        "유지할 조건",

      required:
        materials.conditionLines.length
        > 0,

      content:
        materials.conditionLines.join(
          "\n",
        ),
    },
    {
      step:
        "risks",

      title:
        "변경·이탈을 고려해야 하는 신호",

      required:
        materials.riskLines.length
        > 0,

      content:
        materials.riskLines.join(
          "\n",
        ),
    },
    {
      step:
        "recommendedDirection",

      title:
        "유지하는 방향",

      required:
        true,

      content:
        input.recommendedDirection,
    },
    {
      step:
        "prohibitedDirection",

      title:
        "유지할 때 피해야 할 방식",

      required:
        true,

      content:
        input.prohibitedDirection,
    },
    buildFinalDecisionBlock(
      input,
    ),
  ];
}

function buildTerminationExplanationBlocks(
  input:
    DecisionExplanationInput,
  materials:
    DecisionExplanationMaterials,
): ExplanationBlock[] {
  return [
    {
      step:
        "directAnswer",

      title:
        "현재 상태에서 벗어나는 것이 맞는지",

      required:
        true,

      content:
        materials.directAnswerContent,
    },
    {
      step:
        "evidence",

      title:
        "이동·변경의 근거",

      required:
        materials.evidenceLines.length
        > 0,

      content:
        materials.evidenceLines.join(
          "\n",
        ),
    },
    {
      step:
        "conditions",

      title:
        "실행 조건",

      required:
        materials.conditionLines.length
        > 0,

      content:
        materials.conditionLines.join(
          "\n",
        ),
    },
    {
      step:
        "risks",

      title:
        "위험",

      required:
        materials.riskLines.length
        > 0,

      content:
        materials.riskLines.join(
          "\n",
        ),
    },
    {
      step:
        "recommendedDirection",

      title:
        "권장하는 이동 방향",

      required:
        true,

      content:
        input.recommendedDirection,
    },
    {
      step:
        "prohibitedDirection",

      title:
        "피해야 할 방식",

      required:
        true,

      content:
        input.prohibitedDirection,
    },
    buildFinalDecisionBlock(
      input,
    ),
  ];
}

function buildBusinessStartExplanationBlocks(
  input:
    DecisionExplanationInput,
  materials:
    DecisionExplanationMaterials,
): ExplanationBlock[] {
  return [
    {
      step:
        "directAnswer",

      title:
        BUSINESS_START_STEP_TITLES.directAnswer,

      required:
        true,

      content:
        materials.directAnswerContent,
    },
    {
      step:
        "humanContext",

      title:
        BUSINESS_START_STEP_TITLES.humanContext,

      required:
        true,

      content:
        input.reason,
    },
    {
      step:
        "alignment",

      title:
        BUSINESS_START_STEP_TITLES.alignment,

      required:
        true,

      content:
        materials.alignmentContent,
    },
    {
      step:
        "readerDecisionEffect",

      title:
        materials
          .readerDecisionExplanation
          .title,

      required:
        materials
          .readerDecisionExplanation
          .required,

      content:
        materials
          .readerDecisionExplanation
          .content,
    },
    {
      step:
        "evidence",

      title:
        BUSINESS_START_STEP_TITLES.evidence,

      required:
        materials.evidenceLines.length
        > 0,

      content:
        materials.evidenceLines.join(
          "\n",
        ),
    },
    ...buildTimingSearchExplanationBlocks(
      input,
    ),
    ...buildTimingAssessmentExplanationBlocks(
      input,
    ),
    {
      step:
        "conditions",

      title:
        BUSINESS_START_STEP_TITLES.conditions,

      required:
        materials.conditionLines.length
        > 0,

      content:
        materials.conditionLines.join(
          "\n",
        ),
    },
    {
      step:
        "risks",

      title:
        BUSINESS_START_STEP_TITLES.risks,

      required:
        materials.riskLines.length
        > 0,

      content:
        materials.riskLines.join(
          "\n",
        ),
    },
    {
      step:
        "recommendedDirection",

      title:
        BUSINESS_START_STEP_TITLES.recommendedDirection,

      required:
        true,

      content:
        input.recommendedDirection,
    },
    {
      step:
        "prohibitedDirection",

      title:
        BUSINESS_START_STEP_TITLES.prohibitedDirection,

      required:
        true,

      content:
        input.prohibitedDirection,
    },
    buildFinalDecisionBlock(
      input,
    ),
  ];
}

function buildRealEstateBuyExplanationBlocks(
  input:
    DecisionExplanationInput,
  materials:
    DecisionExplanationMaterials,
): ExplanationBlock[] {
  return [
    {
      step:
        "directAnswer",

      title:
        "매수 판단",

      required:
        true,

      content:
        materials.directAnswerContent,
    },
    {
      step:
        "alignment",

      title:
        "현재 시점",

      required:
        true,

      content:
        materials.alignmentContent,
    },
    {
      step:
        "evidence",

      title:
        materials.hasCashFlowEvidence
          ? "자금·현금흐름을 포함한 매수 근거"
          : "매수 판단 근거",

      required:
        materials.evidenceLines.length
        > 0,

      content:
        materials.evidenceLines.join(
          "\n",
        ),
    },
    ...buildTimingSearchExplanationBlocks(
      input,
    ),
    ...buildTimingAssessmentExplanationBlocks(
      input,
    ),
    {
      step:
        "conditions",

      title:
        "실행 조건",

      required:
        materials.conditionLines.length
        > 0,

      content:
        materials.conditionLines.join(
          "\n",
        ),
    },
    {
      step:
        "risks",

      title:
        "위험",

      required:
        materials.riskLines.length
        > 0,

      content:
        materials.riskLines.join(
          "\n",
        ),
    },
    {
      step:
        "recommendedDirection",

      title:
        "권장하는 매수 방향",

      required:
        true,

      content:
        input.recommendedDirection,
    },
    {
      step:
        "prohibitedDirection",

      title:
        "피해야 할 매수 방식",

      required:
        true,

      content:
        input.prohibitedDirection,
    },
    buildFinalDecisionBlock(
      input,
    ),
  ];
}

function buildGeneralJudgementExplanationBlocks(
  input:
    DecisionExplanationInput,
  materials:
    DecisionExplanationMaterials,
): ExplanationBlock[] {
  return [
    {
      step:
        "directAnswer",

      title:
        "질문에 대한 결론",

      required:
        true,

      content:
        materials.directAnswerContent,
    },
    {
      step:
        "evidence",

      title:
        "필요한 근거",

      required:
        materials.evidenceLines.length
        > 0,

      content:
        materials.evidenceLines.join(
          "\n",
        ),
    },
    {
      step:
        "conditions",

      title:
        "조건",

      required:
        materials.conditionLines.length
        > 0,

      content:
        materials.conditionLines.join(
          "\n",
        ),
    },
    {
      step:
        "risks",

      title:
        "위험",

      required:
        materials.riskLines.length
        > 0,

      content:
        materials.riskLines.join(
          "\n",
        ),
    },
    {
      step:
        "recommendedDirection",

      title:
        "권장하는 진행 방향",

      required:
        true,

      content:
        input.recommendedDirection,
    },
    {
      step:
        "prohibitedDirection",

      title:
        "피해야 할 진행 방식",

      required:
        true,

      content:
        input.prohibitedDirection,
    },
    buildFinalDecisionBlock(
      input,
    ),
  ];
}

function buildFocusedDecisionExplanationBlocks(
  focus:
    DecisionExplanationFocus,
  input:
    DecisionExplanationInput,
  materials:
    DecisionExplanationMaterials,
): ExplanationBlock[] {
  switch (
    focus
  ) {
    case "compatibility":
      return buildCompatibilityExplanationBlocks(
        input,
        materials,
      );

    case "continuation":
      return buildContinuationExplanationBlocks(
        input,
        materials,
      );

    case "termination":
      return buildTerminationExplanationBlocks(
        input,
        materials,
      );

    case "businessStart":
    case "businessTiming":
    case "businessFieldFit":
      return buildBusinessStartExplanationBlocks(
        input,
        materials,
      );

    case "realEstateBuy":
      return buildRealEstateBuyExplanationBlocks(
        input,
        materials,
      );

    case "generalJudgement":
      return buildGeneralJudgementExplanationBlocks(
        input,
        materials,
      );
  }
}

/**
 * Decision Explanation Plan
 *
 * Decision Engine의 판단과 원문 질문을 함께 보존하고,
 * GPT가 어떤 순서로 설명해야 하는지만 정의한다.
 *
 * 새로운 판단을 생성하지 않는다.
 * verdict를 수정하지 않는다.
 * 근거를 변경하지 않는다.
 */
export function buildDecisionExplanationPlan(
  input:
    DecisionExplanationInput,
  originalQuestion:
    string,
  questionContext?:
    QuestionContext,
): DecisionExplanationPlan {
  const normalizedQuestion =
    requireOriginalQuestion(
      originalQuestion,
    );

  if (
    input
      .roleRecommendationAssessment
      ?.available
  ) {
    return {
      originalQuestion:
        normalizedQuestion,

      topic:
        input.topic,

      intent:
        input.intent,

      decisionTarget:
        input.decisionTarget,

      conclusionNature:
        input.conclusionNature,

      verdict:
        input.verdict,

      confidence:
        input.confidence,

      blocks:
        buildRoleRecommendationExplanationBlocks(
          input,
        ),

      explanationKind:
        "roleRecommendation",

      engineDecisionLocked:
        true,

      gptMayRejudge:
        false,
    };
  }

  if (
    input
      .lifeFlowInterpretationAssessment
      ?.available
  ) {
    return {
      originalQuestion:
        normalizedQuestion,

      topic:
        input.topic,

      intent:
        input.intent,

      decisionTarget:
        input.decisionTarget,

      conclusionNature:
        input.conclusionNature,

      verdict:
        input.verdict,

      confidence:
        input.confidence,

      blocks:
        buildLifeFlowInterpretationExplanationBlocks(
          input,
        ),

      explanationKind:
        "lifeFlowInterpretation",

      engineDecisionLocked:
        true,

      gptMayRejudge:
        false,
    };
  }

  const explanationFocus =
    resolveDecisionExplanationFocus({
      intent:
        input.intent,

      decisionTarget:
        input.decisionTarget,

      topic:
        input.topic,

      originalQuestion:
        normalizedQuestion,

      questionContext,
    });

  const materials =
    buildDecisionExplanationMaterials(
      input,
      normalizedQuestion,
      questionContext,
      explanationFocus,
    );

  return {
    originalQuestion:
      normalizedQuestion,

    topic:
      input.topic,

    intent:
      input.intent,

    decisionTarget:
      input.decisionTarget,

    conclusionNature:
      input.conclusionNature,

    verdict:
      input.verdict,

    confidence:
      input.confidence,

    blocks:
      buildFocusedDecisionExplanationBlocks(
        explanationFocus,
        input,
        materials,
      ),

    explanationFocus,

    engineDecisionLocked:
      true,

    gptMayRejudge:
      false,
  };
}
