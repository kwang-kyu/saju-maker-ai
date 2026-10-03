import type {
  AnswerBlueprint,
  ReportAnswerSection,
  ScenarioAnswerBlock,
} from "../types/answerBlueprint.js";
import type {
  Assessment,
  AssessmentCondition,
  AssessmentRisk,
  TimeDifference,
} from "../types/assessment.js";
import type {
  ChangeSignal,
  ChangeSignalType,
} from "../types/changeSignal.js";
import type {
  ConsultingScenario,
} from "../types/consultingScenario.js";
import type {
  HumanState,
  HumanStateDomain,
  HumanStateSummary,
  VNextEvidenceItem,
} from "../types/humanState.js";
import type {
  QuestionMeaning,
} from "../types/questionMeaning.js";
import type {
  TimeSegment,
  TimeState,
} from "../types/timeState.js";
import type {
  QuestionSpecificMaterialSelection,
} from "../adapters/questionSpecificMaterialAdapter.js";
import type {
  QuestionSpecificMaterialTierKey,
} from "../../consulting/explanation/questionSpecificMaterialSelector.js";
import type {
  ResponseBlockContext,
} from "./responseContext.js";
import {
  orderConditionsByQuestionSpecificPriority,
  orderEvidenceByQuestionSpecificPriority,
  orderRisksByQuestionSpecificPriority,
} from "./responseMaterialPriorityResolver.js";

const DIRECT_RESPONSE_MATERIAL_TIERS: readonly QuestionSpecificMaterialTierKey[] = [
  "primary",
  "secondary",
];

export type ResponseBlockSelection = Pick<
  ResponseBlockContext,
  "relevantFacts" | "relevantSignals" | "relevantEvidence" | "emphasis"
>;

export type ResponseSelectionContext = {
  scenario: ConsultingScenario;
  questionMeaning: QuestionMeaning;
  blueprint: AnswerBlueprint;
  humanState?: HumanState;
  timeState?: TimeState;
  changeSignals: ChangeSignal[];
  assessment?: Assessment;
  emphasis: string[];
  questionSpecificMaterials?: QuestionSpecificMaterialSelection;
};

export type ResponseBlockSelectorRule = {
  blockId: string;
  priority: number;
  select: (
    context: ResponseSelectionContext,
  ) => ResponseBlockSelection;
};

function emptySelection(): ResponseBlockSelection {
  return {
    relevantFacts: [],
    relevantSignals: [],
    relevantEvidence: [],
    emphasis: [],
  };
}

function collectEvidenceItems(
  ...sources: Array<{ items: VNextEvidenceItem[] } | undefined>
): VNextEvidenceItem[] {
  const items: VNextEvidenceItem[] = [];

  for (const source of sources) {
    if (!source) {
      continue;
    }

    items.push(...source.items);
  }

  return items;
}

function findDomain(
  humanState: HumanState | undefined,
  domain: HumanStateDomain,
): HumanStateSummary | undefined {
  return humanState?.domains.find(
    (item) => item.domain === domain,
  );
}

function domainFacts(
  summary: HumanStateSummary | undefined,
): Record<string, string | number | boolean | null>[] {
  if (!summary) {
    return [];
  }

  return [
    {
      domain: summary.domain,
      summary: summary.summary,
      strengths: summary.strengths.join(" | "),
      pressures: summary.pressures.join(" | "),
      risks: summary.risks.join(" | "),
    },
  ];
}

function signalsByType(
  changeSignals: readonly ChangeSignal[],
  types: readonly ChangeSignalType[],
): ChangeSignal[] {
  return changeSignals.filter((signal) =>
    types.includes(signal.type),
  );
}

function assessmentConditionFacts(
  conditions: readonly AssessmentCondition[],
): Record<string, string | number | boolean | null>[] {
  return conditions.map((condition) => ({
    key: condition.key,
    description: condition.description,
    required: condition.required,
    satisfied: condition.satisfied,
  }));
}

function assessmentRiskFacts(
  risks: readonly AssessmentRisk[],
): Record<string, string | number | boolean | null>[] {
  return risks.map((risk) => ({
    key: risk.key,
    description: risk.description,
    severity: risk.severity,
  }));
}

function resolvePeriodSegments(
  timeState: TimeState | undefined,
): TimeSegment[] {
  if (!timeState) {
    return [];
  }

  if (timeState.segments.length > 0) {
    return timeState.segments;
  }

  if (timeState.targetPeriod.start === "unknown") {
    return [];
  }

  return [{
    start: timeState.targetPeriod.start,
    end: timeState.targetPeriod.end,
    granularity: timeState.targetPeriod.granularity,
    label: timeState.targetPeriod.label
      ?? `${timeState.targetPeriod.start} ~ ${timeState.targetPeriod.end}`,
    facts: {},
    evidence: { items: [] },
  }];
}

/**
 * early / middle / late 위치 → segment·period entry 공통 index.
 * - 1개: 기존처럼 동일 index(0) 공유
 * - 2개: early=0, middle=없음(중복 방지), late=1
 * - 3개 이상: early=0, middle=중간, late=마지막
 */
function resolvePeriodPositionIndex(
  segmentCount: number,
  position: "early" | "middle" | "late",
): number | undefined {
  if (segmentCount <= 0) {
    return undefined;
  }

  if (segmentCount === 1) {
    return position === "early" ? 0 : undefined;
  }

  if (segmentCount === 2) {
    if (position === "early") {
      return 0;
    }

    if (position === "middle") {
      return undefined;
    }

    return 1;
  }

  return position === "early"
    ? 0
    : position === "middle"
      ? Math.floor((segmentCount - 1) / 2)
      : segmentCount - 1;
}

function pickSegmentByPosition(
  segments: readonly TimeSegment[],
  position: "early" | "middle" | "late",
): TimeSegment | undefined {
  const index = resolvePeriodPositionIndex(segments.length, position);

  if (index === undefined) {
    return undefined;
  }

  return segments[index];
}

/**
 * Assessment.timeDifferences의 overall(첫 entry)을 제외한 period entry만 반환한다.
 */
function resolvePeriodTimeDifferences(
  assessment: Assessment | undefined,
): TimeDifference[] {
  const differences = assessment?.timeDifferences ?? [];

  if (differences.length <= 1) {
    return [];
  }

  return differences.slice(1);
}

function periodTimeDifferenceFacts(
  difference: TimeDifference | undefined,
): Record<string, string | number | boolean | null>[] {
  if (!difference) {
    return [];
  }

  return [{
    label: difference.label,
    summary: difference.summary,
  }];
}

function selectGeneralFlowPeriodBlock(
  context: ResponseSelectionContext,
  position: "early" | "middle" | "late",
): ResponseBlockSelection {
  const segments = resolvePeriodSegments(context.timeState);
  const segment = pickSegmentByPosition(segments, position);
  const periodIndex = resolvePeriodPositionIndex(segments.length, position);
  const periodDifferences = resolvePeriodTimeDifferences(context.assessment);
  const periodDifference = periodIndex === undefined
    ? undefined
    : periodDifferences[periodIndex];

  const relevantSignals = position === "early"
    ? context.changeSignals.filter((signal) => {
      const matchesPeriod =
        signal.timeSegment.label.includes("early")
        || signal.timeSegment.start === segment?.start;

      if (!matchesPeriod) {
        return false;
      }

      // timing 블록과 동일: period에 직접 대응하지 않는
      // month-wide/dateless signal은 earlyPeriod 근거에서 제외한다.
      const isMonthWideDateless =
        signal.timeSegment.granularity !== "day"
        || signal.timeSegment.start === "unknown"
        || signal.timeSegment.end === "unknown";

      return !isMonthWideDateless;
    })
    : [];

  return withEmphasis({
    relevantFacts: [
      ...segmentFacts(segment),
      ...periodTimeDifferenceFacts(periodDifference),
    ],
    relevantSignals,
    relevantEvidence: collectEvidenceItems(
      segment?.evidence,
      periodDifference?.evidence,
    ),
    emphasis: [],
  }, context.emphasis);
}

function segmentFacts(
  segment: TimeSegment | undefined,
): Record<string, string | number | boolean | null>[] {
  if (!segment) {
    return [];
  }

  return [{
    start: segment.start,
    end: segment.end,
    label: segment.label,
    granularity: segment.granularity,
    ...segment.facts,
  }];
}

function timeOverviewFacts(
  timeState: TimeState | undefined,
): Record<string, string | number | boolean | null>[] {
  if (!timeState) {
    return [];
  }

  const facts: Record<string, string | number | boolean | null>[] = [
    {
      start: timeState.targetPeriod.start,
      end: timeState.targetPeriod.end,
      granularity: timeState.targetPeriod.granularity,
      label: timeState.targetPeriod.label ?? null,
    },
  ];

  if (timeState.wolun) {
    facts.push({
      wolunLabel: timeState.wolun.label,
      wolunSummary: timeState.wolun.summary,
    });
  }

  if (timeState.seun) {
    facts.push({
      seunLabel: timeState.seun.label,
      seunSummary: timeState.seun.summary,
    });
  }

  return facts;
}

function assessmentSummaryFacts(
  assessment: Assessment | undefined,
): Record<string, string | number | boolean | null>[] {
  if (!assessment) {
    return [];
  }

  return [{
    possibility: assessment.possibility,
    direction: assessment.direction,
    confidence: assessment.confidence,
    changeIntensity: assessment.changeIntensity.level,
  }];
}

function withEmphasis(
  selection: ResponseBlockSelection,
  emphasis: readonly string[],
): ResponseBlockSelection {
  return {
    ...selection,
    emphasis: [...emphasis],
  };
}

const CONDITION_FACT_BLOCK_IDS = new Set<string>([
  "compatibilityConditions",
  "conditions",
  "condition",
  "caution",
  "assessment",
]);

const RISK_FACT_BLOCK_IDS = new Set<string>([
  "risk",
  "limitingFactors",
  "caution",
  "assessment",
]);

function isConditionFact(
  fact: Record<string, string | number | boolean | null>,
): boolean {
  return typeof fact.key === "string"
    && "required" in fact
    && "satisfied" in fact;
}

function isRiskFact(
  fact: Record<string, string | number | boolean | null>,
): boolean {
  return typeof fact.key === "string"
    && "severity" in fact
    && !("required" in fact);
}

function conditionFactToAssessmentCondition(
  fact: Record<string, string | number | boolean | null>,
): AssessmentCondition {
  return {
    key: String(fact.key),
    description: String(fact.description ?? ""),
    required: Boolean(fact.required),
    satisfied: Boolean(fact.satisfied),
  };
}

function riskFactToAssessmentRisk(
  fact: Record<string, string | number | boolean | null>,
): AssessmentRisk {
  return {
    key: String(fact.key),
    description: String(fact.description ?? ""),
    severity: String(fact.severity) as AssessmentRisk["severity"],
  };
}

function collectMaterialKeysByTiers(
  materials: QuestionSpecificMaterialSelection | undefined,
  kind: "conditions" | "risks",
  tiers: readonly QuestionSpecificMaterialTierKey[],
): Set<string> {
  const keys = new Set<string>();

  if (!materials) {
    return keys;
  }

  for (const tierKey of tiers) {
    for (const material of materials[kind][tierKey]) {
      keys.add(material.key);
    }
  }

  return keys;
}

function filterOrderedConditionsByQuestionSpecificMaterials(
  conditions: readonly AssessmentCondition[],
  materials: QuestionSpecificMaterialSelection | undefined,
): AssessmentCondition[] {
  if (!materials || conditions.length === 0) {
    return [...conditions];
  }

  const directKeys = collectMaterialKeysByTiers(
    materials,
    "conditions",
    DIRECT_RESPONSE_MATERIAL_TIERS,
  );

  // primary/secondary 매칭이 없으면 기존처럼 전체를 유지한다.
  if (directKeys.size === 0) {
    return [...conditions];
  }

  // supporting / unmatched condition은 최종 relevantFacts에서 제외한다.
  // primary / secondary는 그대로 보존한다.
  return conditions.filter((condition) =>
    directKeys.has(condition.key),
  );
}

function filterOrderedRisksByQuestionSpecificMaterials(
  risks: readonly AssessmentRisk[],
  materials: QuestionSpecificMaterialSelection | undefined,
): AssessmentRisk[] {
  if (!materials || risks.length === 0) {
    return [...risks];
  }

  const directKeys = collectMaterialKeysByTiers(
    materials,
    "risks",
    DIRECT_RESPONSE_MATERIAL_TIERS,
  );

  if (directKeys.size === 0) {
    return [...risks];
  }

  // supporting-only evidence source 필터는 supporting tier risk용이다.
  // directKeys(primary/secondary)로 이미 선정된 risk는
  // source가 supporting-only라는 이유만으로 삭제하지 않는다.
  return risks.filter((risk) => directKeys.has(risk.key));
}

function reorderFactsByQuestionSpecificPriority(
  facts: readonly Record<string, string | number | boolean | null>[],
  materials: QuestionSpecificMaterialSelection | undefined,
  options: { conditions: boolean; risks: boolean },
): Record<string, string | number | boolean | null>[] {
  if (!options.conditions && !options.risks) {
    return [...facts];
  }

  const result: Record<string, string | number | boolean | null>[] = [];
  let conditionFacts: Record<string, string | number | boolean | null>[] = [];
  let riskFacts: Record<string, string | number | boolean | null>[] = [];

  const flushConditions = () => {
    if (conditionFacts.length === 0) {
      return;
    }

    result.push(...assessmentConditionFacts(
      filterOrderedConditionsByQuestionSpecificMaterials(
        orderConditionsByQuestionSpecificPriority(
          conditionFacts.map(conditionFactToAssessmentCondition),
          materials,
        ),
        materials,
      ),
    ));
    conditionFacts = [];
  };

  const flushRisks = () => {
    if (riskFacts.length === 0) {
      return;
    }

    result.push(...assessmentRiskFacts(
      filterOrderedRisksByQuestionSpecificMaterials(
        orderRisksByQuestionSpecificPriority(
          riskFacts.map(riskFactToAssessmentRisk),
          materials,
        ),
        materials,
      ),
    ));
    riskFacts = [];
  };

  for (const fact of facts) {
    if (options.conditions && isConditionFact(fact)) {
      flushRisks();
      conditionFacts.push(fact);
      continue;
    }

    if (options.risks && isRiskFact(fact)) {
      flushConditions();
      riskFacts.push(fact);
      continue;
    }

    flushConditions();
    flushRisks();
    result.push(fact);
  }

  flushConditions();
  flushRisks();

  return result;
}

function applyQuestionSpecificMaterialPriority(
  blockId: string,
  selection: ResponseBlockSelection,
  context: ResponseSelectionContext,
): ResponseBlockSelection {
  const materials = context.questionSpecificMaterials;
  const applyConditions = CONDITION_FACT_BLOCK_IDS.has(blockId);
  const applyRisks = RISK_FACT_BLOCK_IDS.has(blockId);

  return {
    ...selection,
    relevantEvidence: orderEvidenceByQuestionSpecificPriority(
      selection.relevantEvidence,
      materials,
    ),
    relevantFacts: applyConditions || applyRisks
      ? reorderFactsByQuestionSpecificPriority(
        selection.relevantFacts,
        materials,
        {
          conditions: applyConditions,
          risks: applyRisks,
        },
      )
      : selection.relevantFacts,
  };
}

function selectDomainBlock(
  context: ResponseSelectionContext,
  domain: HumanStateDomain,
  signalTypes: ChangeSignalType[] = [],
): ResponseBlockSelection {
  const summary = findDomain(context.humanState, domain);

  return {
    relevantFacts: domainFacts(summary),
    relevantSignals: signalsByType(
      context.changeSignals,
      signalTypes,
    ),
    relevantEvidence: collectEvidenceItems(summary?.evidence),
    emphasis: context.emphasis.filter((item) =>
      item === domain || signalTypes.includes(item as ChangeSignalType),
    ),
  };
}

export const RESPONSE_BLOCK_SELECTOR_RULES: readonly ResponseBlockSelectorRule[] = [
  {
    blockId: "directAnswer",
    priority: 10,
    select: (context) => withEmphasis({
      relevantFacts: assessmentSummaryFacts(context.assessment),
      relevantSignals: [],
      relevantEvidence: collectEvidenceItems(
        context.assessment?.evidence,
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "periodOverview",
    priority: 20,
    select: (context) => withEmphasis({
      relevantFacts: timeOverviewFacts(context.timeState),
      relevantSignals: [],
      relevantEvidence: collectEvidenceItems(
        context.timeState?.evidence,
        context.timeState?.wolun?.evidence,
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "earlyPeriod",
    priority: 21,
    select: (context) => selectGeneralFlowPeriodBlock(context, "early"),
  },
  {
    blockId: "middlePeriod",
    priority: 22,
    select: (context) => selectGeneralFlowPeriodBlock(context, "middle"),
  },
  {
    blockId: "latePeriod",
    priority: 23,
    select: (context) => selectGeneralFlowPeriodBlock(context, "late"),
  },
  {
    blockId: "opportunity",
    priority: 30,
    select: (context) => {
      const signals = signalsByType(context.changeSignals, ["opportunity"]);

      return withEmphasis({
        relevantFacts: [],
        relevantSignals: signals,
        relevantEvidence: collectEvidenceItems(
          ...signals.map((signal) => signal.evidence),
        ),
        emphasis: context.emphasis.filter((item) => item === "opportunity"),
      }, context.emphasis);
    },
  },
  {
    blockId: "pressure",
    priority: 31,
    select: (context) => {
      const signals = signalsByType(context.changeSignals, ["pressure"]);

      return withEmphasis({
        relevantFacts: [],
        relevantSignals: signals,
        relevantEvidence: collectEvidenceItems(
          ...signals.map((signal) => signal.evidence),
        ),
        emphasis: context.emphasis.filter((item) => item === "pressure"),
      }, context.emphasis);
    },
  },
  {
    blockId: "risk",
    priority: 32,
    select: (context) => {
      const signals = signalsByType(context.changeSignals, ["risk"]);

      return withEmphasis({
        relevantFacts: assessmentRiskFacts(
          context.assessment?.risks ?? [],
        ),
        relevantSignals: signals,
        // risk 본업은 risks facts + risk signal evidence.
        // assessment.evidence 전체 재주입은 directAnswer/supportingEvidence owner에 맡긴다.
        relevantEvidence: collectEvidenceItems(
          ...signals.map((signal) => signal.evidence),
        ),
        emphasis: context.emphasis.filter((item) =>
          item === "risk" || item === "highRisk",
        ),
      }, context.emphasis);
    },
  },
  {
    blockId: "ability",
    priority: 40,
    select: (context) =>
      selectDomainBlock(context, "ability"),
  },
  {
    blockId: "suitableRole",
    priority: 41,
    select: (context) =>
      selectDomainBlock(context, "career"),
  },
  {
    blockId: "workingEnvironment",
    priority: 42,
    select: (context) => {
      const career = findDomain(context.humanState, "career");
      const capacity = findDomain(context.humanState, "capacity");

      return withEmphasis({
        relevantFacts: [
          ...domainFacts(career),
          ...domainFacts(capacity),
        ],
        relevantSignals: [],
        relevantEvidence: collectEvidenceItems(
          career?.evidence,
          capacity?.evidence,
        ),
        emphasis: [],
      }, context.emphasis);
    },
  },
  {
    blockId: "moneyOrDomainEffect",
    priority: 43,
    select: (context) =>
      selectDomainBlock(
        context,
        "money",
        ["inflow", "expense", "opportunity"],
      ),
  },
  {
    blockId: "connection",
    priority: 50,
    select: (context) =>
      selectDomainBlock(
        context,
        "relationship",
        ["relationshipChange", "stability"],
      ),
  },
  {
    blockId: "conflict",
    priority: 51,
    select: (context) => {
      const relationship = findDomain(context.humanState, "relationship");
      const signals = signalsByType(
        context.changeSignals,
        ["conflict", "relationshipChange"],
      );

      return withEmphasis({
        relevantFacts: domainFacts(relationship),
        relevantSignals: signals,
        relevantEvidence: collectEvidenceItems(
          relationship?.evidence,
          ...signals.map((signal) => signal.evidence),
        ),
        emphasis: context.emphasis.filter((item) =>
          item === "conflict" || item === "relationshipChange",
        ),
      }, context.emphasis);
    },
  },
  {
    blockId: "compatibilityConditions",
    priority: 52,
    select: (context) => withEmphasis({
      relevantFacts: assessmentConditionFacts(
        context.assessment?.conditions ?? [],
      ),
      relevantSignals: signalsByType(
        context.changeSignals,
        ["stability", "relationshipChange"],
      ),
      // 궁합 판정 evidence owner는 directAnswer.
      // 동일 assessment.evidence를 조건 블록에 재주입하지 않는다.
      relevantEvidence: [],
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "currentDirection",
    priority: 60,
    select: (context) => {
      const hasPeriodLevelTimeDifferences =
        (context.assessment?.timeDifferences.length ?? 0) > 1;

      return withEmphasis({
        relevantFacts: [
          ...assessmentSummaryFacts(context.assessment),
          {
            changeIntensitySummary:
              context.assessment?.changeIntensity.summary ?? null,
          },
        ],
        relevantSignals: signalsByType(
          context.changeSignals,
          hasPeriodLevelTimeDifferences
            ? ["opportunity", "expansion"]
            : ["opportunity", "pressure", "expansion", "responsibility"],
        ),
        relevantEvidence: collectEvidenceItems(
          context.assessment?.changeIntensity.evidence,
        ),
        emphasis: [],
      }, context.emphasis);
    },
  },
  {
    blockId: "conditions",
    priority: 61,
    select: (context) => withEmphasis({
      relevantFacts: assessmentConditionFacts(
        context.assessment?.conditions ?? [],
      ),
      relevantSignals: [],
      // conditions 본업은 condition facts. assessment.evidence 재설명 방지.
      relevantEvidence: [],
      emphasis: context.emphasis.filter((item) =>
        item === "unsatisfiedConditions",
      ),
    }, context.emphasis),
  },
  {
    blockId: "scale",
    priority: 62,
    select: (context) =>
      selectDomainBlock(context, "capacity", ["expansion"]),
  },
  {
    blockId: "timing",
    priority: 63,
    select: (context) => {
      const hasPeriodLevelTimeDifferences =
        (context.assessment?.timeDifferences.length ?? 0) > 1;

      let relevantSignals = signalsByType(
        context.changeSignals,
        ["opportunity", "pressure"],
      );

      // period-level이면 날짜 없는 월 전체 signal은 timeDifferences theme과
      // 경쟁하지 않도록 timing relevantSignals에서 제외한다.
      if (hasPeriodLevelTimeDifferences) {
        relevantSignals = relevantSignals.filter((signal) => {
          const isMonthWideDateless =
            signal.timeSegment.granularity !== "day"
            || signal.timeSegment.start === "unknown"
            || signal.timeSegment.end === "unknown";

          if (
            signal.type === "pressure"
            || signal.type === "responsibility"
          ) {
            return false;
          }

          if (signal.type === "opportunity" && isMonthWideDateless) {
            return false;
          }

          return true;
        });
      }

      // period-level이면 월 전체 대표값(wolun)이 period theme과 경쟁하지 않도록
      // timing overview facts에서만 제외한다. seun / start·end·label은 유지.
      const overviewFacts = timeOverviewFacts(context.timeState);
      const timingOverviewFacts = hasPeriodLevelTimeDifferences
        ? overviewFacts.filter(
          (fact) => !("wolunLabel" in fact) && !("wolunSummary" in fact),
        )
        : overviewFacts;

      return withEmphasis({
        relevantFacts: [
          ...timingOverviewFacts,
          ...(context.assessment?.timeDifferences ?? []).map((item) => ({
            label: item.label,
            granularity: item.granularity,
            summary: item.summary,
            relativeTo: item.relativeTo,
          })),
        ],
        relevantSignals,
        relevantEvidence: collectEvidenceItems(
          context.timeState?.evidence,
          ...(context.assessment?.timeDifferences ?? []).map(
            (item) => item.evidence,
          ),
        ),
        emphasis: [],
      }, context.emphasis);
    },
  },
  {
    blockId: "possibility",
    priority: 70,
    select: (context) => {
      const hasSupportingEvidenceOwner = resolveBlueprintBlockIds(
        context.blueprint,
      ).includes("supportingEvidence");

      return withEmphasis({
        relevantFacts: assessmentSummaryFacts(context.assessment),
        relevantSignals: signalsByType(
          context.changeSignals,
          ["opportunity", "risk"],
        ),
        // supportingEvidence가 있는 scenario에서는 evidence owner를 양보한다.
        // 독립 scenario에서는 기존처럼 assessment.evidence를 유지한다.
        relevantEvidence: hasSupportingEvidenceOwner
          ? []
          : collectEvidenceItems(context.assessment?.evidence),
        emphasis: [],
      }, context.emphasis);
    },
  },
  {
    blockId: "supportingEvidence",
    priority: 71,
    select: (context) => withEmphasis({
      relevantFacts: [],
      relevantSignals: signalsByType(
        context.changeSignals,
        ["opportunity", "stability", "recovery"],
      ),
      relevantEvidence: collectEvidenceItems(
        context.assessment?.evidence,
        context.humanState?.evidence,
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "limitingFactors",
    priority: 72,
    select: (context) => withEmphasis({
      relevantFacts: assessmentRiskFacts(
        context.assessment?.risks ?? [],
      ),
      relevantSignals: signalsByType(
        context.changeSignals,
        ["pressure", "risk"],
      ),
      // limitation 설명은 risks facts가 담당. assessment.evidence 재주입 제거.
      relevantEvidence: [],
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "mainInterpretation",
    priority: 80,
    select: (context) => withEmphasis({
      relevantFacts: domainFacts(
        findDomain(context.humanState, "personality"),
      ),
      relevantSignals: [],
      relevantEvidence: collectEvidenceItems(
        context.humanState?.identity.evidence,
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "humanContext",
    priority: 81,
    select: (context) => {
      const domains = context.scenario.requiredDomains
        .map((domain) => findDomain(context.humanState, domain))
        .filter(Boolean) as HumanStateSummary[];

      return withEmphasis({
        relevantFacts: domains.flatMap((domain) => domainFacts(domain)),
        relevantSignals: [],
        relevantEvidence: collectEvidenceItems(
          ...domains.map((domain) => domain.evidence),
          context.humanState?.identity.evidence,
        ),
        emphasis: [],
      }, context.emphasis);
    },
  },
  {
    blockId: "timeContext",
    priority: 82,
    select: (context) => withEmphasis({
      relevantFacts: timeOverviewFacts(context.timeState),
      relevantSignals: [],
      relevantEvidence: collectEvidenceItems(
        context.timeState?.evidence,
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "change",
    priority: 83,
    select: (context) => withEmphasis({
      relevantFacts: [],
      relevantSignals: context.changeSignals.filter((signal) =>
        context.scenario.requiredSignals.includes(signal.type),
      ),
      relevantEvidence: collectEvidenceItems(
        ...context.changeSignals.map((signal) => signal.evidence),
      ),
      emphasis: context.emphasis,
    }, context.emphasis),
  },
  {
    blockId: "evidence",
    priority: 84,
    select: (context) => withEmphasis({
      relevantFacts: [],
      relevantSignals: [],
      relevantEvidence: collectEvidenceItems(
        context.humanState?.evidence,
        context.timeState?.evidence,
        context.assessment?.evidence,
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "caution",
    priority: 90,
    select: (context) => withEmphasis({
      relevantFacts: [
        ...assessmentRiskFacts(context.assessment?.risks ?? []),
        ...assessmentConditionFacts(
          (context.assessment?.conditions ?? []).filter(
            (condition) => condition.required && !condition.satisfied,
          ),
        ),
      ],
      relevantSignals: signalsByType(context.changeSignals, ["risk"]),
      // caution은 risks / unmet conditions facts가 핵심.
      // 동일 assessment.evidence 재주입은 제거한다.
      relevantEvidence: [],
      emphasis: context.emphasis.filter((item) =>
        item === "risk"
          || item === "highRisk"
          || item === "unsatisfiedConditions"
          || item === "missingContext",
      ),
    }, context.emphasis),
  },
  {
    blockId: "nextAction",
    priority: 91,
    select: (context) => withEmphasis({
      relevantFacts: [{
        direction: context.assessment?.direction ?? "unknown",
        possibility: context.assessment?.possibility ?? "insufficient",
      }],
      relevantSignals: [],
      relevantEvidence: [],
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "explanation",
    priority: 92,
    select: (context) => withEmphasis({
      relevantFacts: assessmentSummaryFacts(context.assessment),
      relevantSignals: [],
      relevantEvidence: collectEvidenceItems(
        context.assessment?.evidence,
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "condition",
    priority: 93,
    select: (context) => withEmphasis({
      relevantFacts: assessmentConditionFacts(
        context.assessment?.conditions ?? [],
      ),
      relevantSignals: [],
      // condition 본업은 condition facts. assessment.evidence 재설명 방지.
      relevantEvidence: [],
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "timeDifference",
    priority: 94,
    select: (context) => withEmphasis({
      relevantFacts: (context.assessment?.timeDifferences ?? []).map(
        (item) => ({
          label: item.label,
          summary: item.summary,
          granularity: item.granularity,
          relativeTo: item.relativeTo,
        }),
      ),
      relevantSignals: [],
      relevantEvidence: collectEvidenceItems(
        ...(context.assessment?.timeDifferences ?? []).map(
          (item) => item.evidence,
        ),
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "followUpQuestion",
    priority: 95,
    select: (context) => withEmphasis({
      relevantFacts: context.questionMeaning.missingContext.map((item) => ({
        key: item.key,
        description: item.description,
        required: item.required,
      })),
      relevantSignals: [],
      relevantEvidence: [],
      emphasis: context.emphasis.filter((item) => item === "missingContext"),
    }, context.emphasis),
  },
] as const;

export const RESPONSE_SECTION_SELECTOR_RULES: readonly ResponseBlockSelectorRule[] = [
  {
    blockId: "humanState",
    priority: 10,
    select: (context) => {
      const domains = context.scenario.requiredDomains
        .map((domain) => findDomain(context.humanState, domain))
        .filter(Boolean) as HumanStateSummary[];

      return withEmphasis({
        relevantFacts: [
          {
            identityLabel: context.humanState?.identity.label ?? null,
            identityDescription:
              context.humanState?.identity.description ?? null,
          },
          ...domains.flatMap((domain) => domainFacts(domain)),
        ],
        relevantSignals: [],
        relevantEvidence: collectEvidenceItems(
          context.humanState?.identity.evidence,
          ...domains.map((domain) => domain.evidence),
        ),
        emphasis: [],
      }, context.emphasis);
    },
  },
  {
    blockId: "timeState",
    priority: 20,
    select: (context) => withEmphasis({
      relevantFacts: [
        ...timeOverviewFacts(context.timeState),
        ...resolvePeriodSegments(context.timeState).flatMap((segment) =>
          segmentFacts(segment),
        ),
      ],
      relevantSignals: [],
      relevantEvidence: collectEvidenceItems(
        context.timeState?.evidence,
        context.timeState?.wolun?.evidence,
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "changeSignals",
    priority: 30,
    select: (context) => {
      const signals = context.changeSignals.filter((signal) =>
        context.scenario.requiredSignals.includes(signal.type),
      );

      return withEmphasis({
        relevantFacts: [],
        relevantSignals: signals,
        relevantEvidence: collectEvidenceItems(
          ...signals.map((signal) => signal.evidence),
        ),
        emphasis: context.emphasis,
      }, context.emphasis);
    },
  },
  {
    blockId: "assessment",
    priority: 40,
    select: (context) => withEmphasis({
      relevantFacts: [
        ...assessmentSummaryFacts(context.assessment),
        ...assessmentConditionFacts(context.assessment?.conditions ?? []),
        ...assessmentRiskFacts(context.assessment?.risks ?? []),
      ],
      relevantSignals: [],
      relevantEvidence: collectEvidenceItems(
        context.assessment?.evidence,
        context.assessment?.changeIntensity.evidence,
      ),
      emphasis: context.emphasis,
    }, context.emphasis),
  },
  {
    blockId: "conclusion",
    priority: 50,
    select: (context) => withEmphasis({
      relevantFacts: assessmentSummaryFacts(context.assessment),
      relevantSignals: signalsByType(
        context.changeSignals,
        context.scenario.requiredSignals,
      ),
      relevantEvidence: collectEvidenceItems(
        context.assessment?.evidence,
      ),
      emphasis: context.emphasis,
    }, context.emphasis),
  },
] as const;

const ruleLookup = new Map<string, ResponseBlockSelectorRule>();

for (const rule of [
  ...RESPONSE_BLOCK_SELECTOR_RULES,
  ...RESPONSE_SECTION_SELECTOR_RULES,
]) {
  ruleLookup.set(rule.blockId, rule);
}

export function findResponseBlockSelectorRule(
  blockId: string,
): ResponseBlockSelectorRule | undefined {
  return ruleLookup.get(blockId);
}

export function selectResponseBlockContext(
  blockId: string,
  context: ResponseSelectionContext,
): ResponseBlockContext {
  const rule = findResponseBlockSelectorRule(blockId);
  const selection = rule?.select(context) ?? emptySelection();
  const prioritized = applyQuestionSpecificMaterialPriority(
    blockId,
    selection,
    context,
  );

  return {
    id: blockId,
    ...prioritized,
  };
}

export function resolveBlueprintBlockIds(
  blueprint: AnswerBlueprint,
): string[] {
  if (blueprint.mode === "report") {
    return [...blueprint.sections];
  }

  if ("scenarioType" in blueprint) {
    return [...blueprint.blocks];
  }

  return [...blueprint.blocks];
}

export function isScenarioAnswerBlock(
  blockId: string,
): blockId is ScenarioAnswerBlock {
  return findResponseBlockSelectorRule(blockId) !== undefined;
}

export function isReportAnswerSection(
  sectionId: string,
): sectionId is ReportAnswerSection {
  return RESPONSE_SECTION_SELECTOR_RULES.some(
    (rule) => rule.blockId === sectionId,
  );
}
