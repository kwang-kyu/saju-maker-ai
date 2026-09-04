import type {
  AnswerBlueprint,
  ReportAnswerSection,
  ScenarioAnswerBlock,
} from "../types/answerBlueprint.js";
import type {
  Assessment,
  AssessmentCondition,
  AssessmentRisk,
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
  ResponseBlockContext,
} from "./responseContext.js";
import {
  orderConditionsByQuestionSpecificPriority,
  orderEvidenceByQuestionSpecificPriority,
  orderRisksByQuestionSpecificPriority,
} from "./responseMaterialPriorityResolver.js";

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

function pickSegmentByPosition(
  segments: readonly TimeSegment[],
  position: "early" | "middle" | "late",
): TimeSegment | undefined {
  if (segments.length === 0) {
    return undefined;
  }

  if (segments.length === 1) {
    return segments[0];
  }

  const index = position === "early"
    ? 0
    : position === "middle"
      ? Math.floor((segments.length - 1) / 2)
      : segments.length - 1;

  return segments[index];
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
      orderConditionsByQuestionSpecificPriority(
        conditionFacts.map(conditionFactToAssessmentCondition),
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
      orderRisksByQuestionSpecificPriority(
        riskFacts.map(riskFactToAssessmentRisk),
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
    select: (context) => {
      const segment = pickSegmentByPosition(
        resolvePeriodSegments(context.timeState),
        "early",
      );

      return withEmphasis({
        relevantFacts: segmentFacts(segment),
        relevantSignals: context.changeSignals.filter(
          (signal) => signal.timeSegment.label.includes("early")
            || signal.timeSegment.start === segment?.start,
        ),
        relevantEvidence: collectEvidenceItems(segment?.evidence),
        emphasis: [],
      }, context.emphasis);
    },
  },
  {
    blockId: "middlePeriod",
    priority: 22,
    select: (context) => {
      const segment = pickSegmentByPosition(
        resolvePeriodSegments(context.timeState),
        "middle",
      );

      return withEmphasis({
        relevantFacts: segmentFacts(segment),
        relevantSignals: [],
        relevantEvidence: collectEvidenceItems(segment?.evidence),
        emphasis: [],
      }, context.emphasis);
    },
  },
  {
    blockId: "latePeriod",
    priority: 23,
    select: (context) => {
      const segment = pickSegmentByPosition(
        resolvePeriodSegments(context.timeState),
        "late",
      );

      return withEmphasis({
        relevantFacts: segmentFacts(segment),
        relevantSignals: [],
        relevantEvidence: collectEvidenceItems(segment?.evidence),
        emphasis: [],
      }, context.emphasis);
    },
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
        relevantEvidence: collectEvidenceItems(
          ...signals.map((signal) => signal.evidence),
          context.assessment?.evidence,
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
      relevantEvidence: collectEvidenceItems(
        context.assessment?.evidence,
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "currentDirection",
    priority: 60,
    select: (context) => withEmphasis({
      relevantFacts: [
        ...assessmentSummaryFacts(context.assessment),
        {
          changeIntensitySummary:
            context.assessment?.changeIntensity.summary ?? null,
        },
      ],
      relevantSignals: signalsByType(
        context.changeSignals,
        ["opportunity", "pressure", "expansion", "responsibility"],
      ),
      relevantEvidence: collectEvidenceItems(
        context.assessment?.changeIntensity.evidence,
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "conditions",
    priority: 61,
    select: (context) => withEmphasis({
      relevantFacts: assessmentConditionFacts(
        context.assessment?.conditions ?? [],
      ),
      relevantSignals: [],
      relevantEvidence: collectEvidenceItems(
        context.assessment?.evidence,
      ),
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
    select: (context) => withEmphasis({
      relevantFacts: [
        ...timeOverviewFacts(context.timeState),
        ...(context.assessment?.timeDifferences ?? []).map((item) => ({
          label: item.label,
          granularity: item.granularity,
          summary: item.summary,
          relativeTo: item.relativeTo,
        })),
      ],
      relevantSignals: signalsByType(
        context.changeSignals,
        ["opportunity", "pressure"],
      ),
      relevantEvidence: collectEvidenceItems(
        context.timeState?.evidence,
        ...(context.assessment?.timeDifferences ?? []).map(
          (item) => item.evidence,
        ),
      ),
      emphasis: [],
    }, context.emphasis),
  },
  {
    blockId: "possibility",
    priority: 70,
    select: (context) => withEmphasis({
      relevantFacts: assessmentSummaryFacts(context.assessment),
      relevantSignals: signalsByType(
        context.changeSignals,
        ["opportunity", "risk"],
      ),
      relevantEvidence: collectEvidenceItems(
        context.assessment?.evidence,
      ),
      emphasis: [],
    }, context.emphasis),
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
      relevantEvidence: collectEvidenceItems(
        context.assessment?.evidence,
      ),
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
      relevantEvidence: collectEvidenceItems(
        context.assessment?.evidence,
      ),
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
      relevantEvidence: collectEvidenceItems(
        context.assessment?.evidence,
      ),
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
