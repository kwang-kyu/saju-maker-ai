import type {
  Assessment,
} from "../types/assessment.js";
import type {
  ChangeDirection,
  ChangeSignalStrength,
  ChangeSignalType,
} from "../types/changeSignal.js";
import type {
  HumanState,
  HumanStateDomain,
  HumanStateSummary,
} from "../types/humanState.js";
import type {
  LuckFlowSnapshot,
  TimeSegmentRef,
  TimeState,
} from "../types/timeState.js";
import type {
  ChangeSignalEvidenceOrigin,
} from "./changeSignalEvidence.js";

export type SignalRuleContext = {
  humanState?: HumanState;
  timeState?: TimeState;
  assessment?: Assessment;
  requiredSignals: readonly ChangeSignalType[];
};

export type SignalRuleCandidate = {
  type: ChangeSignalType;
  direction: ChangeDirection;
  strength: ChangeSignalStrength;
  origin: ChangeSignalEvidenceOrigin;
  ruleId: string;
  referenceKey: string;
  summary: string;
  evidenceDescriptions: string[];
  timeSegment?: TimeSegmentRef;
};

export type SignalRule = {
  id: string;
  priority: number;
  signalType: ChangeSignalType;
  matches: (context: SignalRuleContext) => boolean;
  produce: (context: SignalRuleContext) => SignalRuleCandidate[];
};

function isRequired(
  context: SignalRuleContext,
  signalType: ChangeSignalType,
): boolean {
  return context.requiredSignals.includes(signalType);
}

function findDomain(
  humanState: HumanState | undefined,
  domain: HumanStateDomain,
): HumanStateSummary | undefined {
  return humanState?.domains.find((item) => item.domain === domain);
}

function defaultTimeSegment(
  timeState?: TimeState,
): TimeSegmentRef {
  if (timeState) {
    const { targetPeriod } = timeState;
    return {
      start: targetPeriod.start,
      end: targetPeriod.end,
      granularity: targetPeriod.granularity,
      label: targetPeriod.label ?? `${targetPeriod.start} ~ ${targetPeriod.end}`,
    };
  }

  return {
    start: "unknown",
    end: "unknown",
    granularity: "period",
    label: "unspecified",
  };
}

function wolunTimeSegment(timeState?: TimeState): TimeSegmentRef {
  const wolun = timeState?.wolun;

  if (wolun) {
    const startDate = wolun.facts.startDate;
    const endDate = wolun.facts.endDate;

    if (
      typeof startDate === "string"
      && typeof endDate === "string"
    ) {
      return {
        start: startDate,
        end: endDate,
        granularity: "month",
        label: wolun.label,
      };
    }
  }

  return defaultTimeSegment(timeState);
}

function domainStrength(
  items: readonly string[],
  fallback: ChangeSignalStrength = "moderate",
): ChangeSignalStrength {
  if (items.length >= 3) {
    return "strong";
  }

  if (items.length >= 1) {
    return fallback;
  }

  return "weak";
}

function buildDomainPressureSignals(
  context: SignalRuleContext,
  domain: HumanStateDomain,
  signalType: ChangeSignalType,
  ruleId: string,
): SignalRuleCandidate[] {
  if (!isRequired(context, signalType)) {
    return [];
  }

  const summary = findDomain(context.humanState, domain);

  if (!summary || summary.pressures.length === 0) {
    return [];
  }

  return [{
    type: signalType,
    direction: "increase",
    strength: domainStrength(summary.pressures),
    origin: "human",
    ruleId,
    referenceKey: `human.${domain}.pressures`,
    summary: `${domain} domain pressure indicators present`,
    evidenceDescriptions: summary.pressures.slice(0, 3),
    timeSegment: defaultTimeSegment(context.timeState),
  }];
}

function buildDomainRiskSignals(
  context: SignalRuleContext,
  domain: HumanStateDomain,
  ruleId: string,
): SignalRuleCandidate[] {
  if (!isRequired(context, "risk")) {
    return [];
  }

  const summary = findDomain(context.humanState, domain);

  if (!summary || summary.risks.length === 0) {
    return [];
  }

  return [{
    type: "risk",
    direction: "increase",
    strength: domainStrength(summary.risks),
    origin: "human",
    ruleId,
    referenceKey: `human.${domain}.risks`,
    summary: `${domain} domain risk indicators present`,
    evidenceDescriptions: summary.risks.slice(0, 3),
    timeSegment: defaultTimeSegment(context.timeState),
  }];
}

function buildDomainStrengthSignals(
  context: SignalRuleContext,
  domain: HumanStateDomain,
  signalType: ChangeSignalType,
  ruleId: string,
): SignalRuleCandidate[] {
  if (!isRequired(context, signalType)) {
    return [];
  }

  const summary = findDomain(context.humanState, domain);

  if (!summary || summary.strengths.length === 0) {
    return [];
  }

  return [{
    type: signalType,
    direction: "increase",
    strength: domainStrength(summary.strengths),
    origin: "human",
    ruleId,
    referenceKey: `human.${domain}.strengths`,
    summary: `${domain} domain supportive indicators present`,
    evidenceDescriptions: summary.strengths.slice(0, 3),
    timeSegment: defaultTimeSegment(context.timeState),
  }];
}

function tenGodToSignals(
  tenGod: string,
  context: SignalRuleContext,
  snapshot: LuckFlowSnapshot,
  rulePrefix: string,
): SignalRuleCandidate[] {
  const candidates: SignalRuleCandidate[] = [];
  const timeSegment = wolunTimeSegment(context.timeState);
  const evidenceBase = `${snapshot.label} tenGod=${tenGod}`;

  const addCandidate = (
    signalType: ChangeSignalType,
    direction: ChangeDirection,
    referenceSuffix: string,
    summary: string,
  ) => {
    if (!isRequired(context, signalType)) {
      return;
    }

    candidates.push({
      type: signalType,
      direction,
      strength: "moderate",
      origin: "time",
      ruleId: `${rulePrefix}-${signalType}`,
      referenceKey: `time.${referenceSuffix}`,
      summary,
      evidenceDescriptions: [evidenceBase],
      timeSegment,
    });
  };

  if (/재/.test(tenGod)) {
    addCandidate(
      "inflow",
      "increase",
      "wealth.tenGod",
      "monthly wealth flow indicator from tenGod",
    );
    addCandidate(
      "opportunity",
      "increase",
      "wealth.opportunity",
      "wealth-related opportunity pressure from tenGod",
    );
  }

  if (/관/.test(tenGod)) {
    addCandidate(
      "responsibility",
      "increase",
      "authority.tenGod",
      "authority and responsibility pressure from tenGod",
    );
    addCandidate(
      "pressure",
      "increase",
      "authority.pressure",
      "external constraint pressure from tenGod",
    );
  }

  if (/식|상/.test(tenGod)) {
    addCandidate(
      "expansion",
      "increase",
      "output.tenGod",
      "output and expansion indicator from tenGod",
    );
    addCandidate(
      "opportunity",
      "increase",
      "output.opportunity",
      "expressive opportunity from tenGod",
    );
  }

  if (/인/.test(tenGod)) {
    addCandidate(
      "recovery",
      "increase",
      "support.tenGod",
      "support and recovery indicator from tenGod",
    );
    addCandidate(
      "stability",
      "increase",
      "support.stability",
      "stabilizing support from tenGod",
    );
  }

  if (/비|겁/.test(tenGod)) {
    addCandidate(
      "movement",
      "increase",
      "peer.tenGod",
      "peer and movement indicator from tenGod",
    );
    addCandidate(
      "conflict",
      "emerge",
      "peer.conflict",
      "competition or friction indicator from tenGod",
    );
  }

  return candidates;
}

function buildTimeSnapshotRule(
  id: string,
  priority: number,
  signalType: ChangeSignalType,
  selectSnapshot: (timeState: TimeState) => LuckFlowSnapshot | null,
): SignalRule {
  return {
    id,
    priority,
    signalType,
    matches: (context) =>
      isRequired(context, signalType)
      && Boolean(context.timeState)
      && Boolean(
        context.timeState
          && selectSnapshot(context.timeState),
      ),
    produce: (context) => {
      const timeState = context.timeState;

      if (!timeState) {
        return [];
      }

      const snapshot = selectSnapshot(timeState);

      if (!snapshot) {
        return [];
      }

      const tenGod = snapshot.facts.tenGod;

      if (typeof tenGod !== "string" || tenGod.length === 0) {
        return [];
      }

      return tenGodToSignals(tenGod, context, snapshot, id);
    },
  };
}

function buildAssessmentRiskRule(): SignalRule {
  return {
    id: "assessment-risks",
    priority: 60,
    signalType: "risk",
    matches: (context) =>
      isRequired(context, "risk")
      && Boolean(context.assessment)
      && (context.assessment?.risks.length ?? 0) > 0,
    produce: (context) => {
      const assessment = context.assessment;

      if (!assessment || assessment.risks.length === 0) {
        return [];
      }

      const highSeverity = assessment.risks.some(
        (risk) => risk.severity === "high",
      );

      return [{
        type: "risk",
        direction: "increase",
        strength: highSeverity ? "strong" : "moderate",
        origin: "assessment",
        ruleId: "assessment-risks",
        referenceKey: "assessment.risks",
        summary: "assessment risk factors identified",
        evidenceDescriptions: assessment.risks
          .slice(0, 3)
          .map((risk) => risk.description),
        timeSegment: defaultTimeSegment(context.timeState),
      }];
    },
  };
}

function buildAssessmentOpportunityRule(): SignalRule {
  return {
    id: "assessment-possibility-opportunity",
    priority: 55,
    signalType: "opportunity",
    matches: (context) =>
      isRequired(context, "opportunity")
      && context.assessment?.possibility === "favorable",
    produce: (context) => {
      if (context.assessment?.possibility !== "favorable") {
        return [];
      }

      return [{
        type: "opportunity",
        direction: "increase",
        strength: "moderate",
        origin: "assessment",
        ruleId: "assessment-possibility-opportunity",
        referenceKey: "assessment.possibility.favorable",
        summary: "assessment indicates favorable possibility",
        evidenceDescriptions: [
          context.assessment.evidence.summary
            ?? "favorable assessment possibility",
        ],
        timeSegment: defaultTimeSegment(context.timeState),
      }];
    },
  };
}

function buildAssessmentOpportunityDecreaseRule(): SignalRule {
  return {
    id: "assessment-possibility-opportunity-decrease",
    priority: 56,
    signalType: "opportunity",
    matches: (context) =>
      isRequired(context, "opportunity")
      && context.assessment?.possibility === "unfavorable",
    produce: (context) => {
      if (context.assessment?.possibility !== "unfavorable") {
        return [];
      }

      return [{
        type: "opportunity",
        direction: "decrease",
        strength: "moderate",
        origin: "assessment",
        ruleId: "assessment-possibility-opportunity-decrease",
        referenceKey: "assessment.possibility.unfavorable",
        summary: "assessment indicates reduced opportunity",
        evidenceDescriptions: [
          context.assessment.evidence.summary
            ?? "unfavorable assessment possibility",
        ],
        timeSegment: defaultTimeSegment(context.timeState),
      }];
    },
  };
}

function buildAssessmentPressureRule(): SignalRule {
  return {
    id: "assessment-change-intensity-pressure",
    priority: 57,
    signalType: "pressure",
    matches: (context) =>
      isRequired(context, "pressure")
      && context.assessment?.changeIntensity.level === "high",
    produce: (context) => {
      if (context.assessment?.changeIntensity.level !== "high") {
        return [];
      }

      return [{
        type: "pressure",
        direction: "increase",
        strength: "strong",
        origin: "assessment",
        ruleId: "assessment-change-intensity-pressure",
        referenceKey: "assessment.changeIntensity.high",
        summary: "assessment reports high change intensity",
        evidenceDescriptions: [
          context.assessment.changeIntensity.summary,
        ],
        timeSegment: defaultTimeSegment(context.timeState),
      }];
    },
  };
}

function buildAssessmentTimingTensionRule(): SignalRule {
  return {
    id: "assessment-timing-tension",
    priority: 58,
    signalType: "conflict",
    matches: (context) =>
      isRequired(context, "conflict")
      && (context.assessment?.timeDifferences.length ?? 0) > 0,
    produce: (context) => {
      const assessment = context.assessment;

      if (!assessment || assessment.timeDifferences.length === 0) {
        return [];
      }

      const tensionEvidence = assessment.timeDifferences.flatMap(
        (item) => item.evidence.items.map(
          (evidenceItem) => evidenceItem.description,
        ),
      ).filter((text) => /긴장|충|마찰|갈등|압/.test(text));

      if (tensionEvidence.length === 0) {
        return [];
      }

      return [{
        type: "conflict",
        direction: "emerge",
        strength: "moderate",
        origin: "assessment",
        ruleId: "assessment-timing-tension",
        referenceKey: "assessment.timeDifferences.tension",
        summary: "timing assessment includes tension indicators",
        evidenceDescriptions: tensionEvidence.slice(0, 3),
        timeSegment: defaultTimeSegment(context.timeState),
      }];
    },
  };
}

function buildAssessmentExpenseRule(): SignalRule {
  return {
    id: "assessment-direction-expense",
    priority: 59,
    signalType: "expense",
    matches: (context) =>
      isRequired(context, "expense")
      && context.assessment?.direction === "avoid",
    produce: (context) => {
      if (context.assessment?.direction !== "avoid") {
        return [];
      }

      return [{
        type: "expense",
        direction: "increase",
        strength: "moderate",
        origin: "assessment",
        ruleId: "assessment-direction-expense",
        referenceKey: "assessment.direction.avoid",
        summary: "assessment direction implies outflow caution",
        evidenceDescriptions: [
          context.assessment.evidence.summary
            ?? "avoid direction from assessment",
        ],
        timeSegment: defaultTimeSegment(context.timeState),
      }];
    },
  };
}

function buildHumanRelationshipChangeRule(): SignalRule {
  return {
    id: "human-relationship-change",
    priority: 25,
    signalType: "relationshipChange",
    matches: (context) =>
      isRequired(context, "relationshipChange")
      && Boolean(findDomain(context.humanState, "relationship")),
    produce: (context) => {
      const relationship = findDomain(
        context.humanState,
        "relationship",
      );

      if (!relationship) {
        return [];
      }

      const indicators = [
        ...relationship.strengths,
        ...relationship.pressures,
      ];

      if (indicators.length === 0) {
        return [];
      }

      return [{
        type: "relationshipChange",
        direction: relationship.pressures.length > 0
          ? "mixed"
          : "emerge",
        strength: domainStrength(indicators),
        origin: "human",
        ruleId: "human-relationship-change",
        referenceKey: "human.relationship.indicators",
        summary: "relationship domain change indicators present",
        evidenceDescriptions: indicators.slice(0, 3),
        timeSegment: defaultTimeSegment(context.timeState),
      }];
    },
  };
}

function buildHumanRelationshipConflictRule(): SignalRule {
  return {
    id: "human-relationship-conflict",
    priority: 26,
    signalType: "conflict",
    matches: (context) =>
      isRequired(context, "conflict")
      && (findDomain(context.humanState, "relationship")?.risks.length ?? 0) > 0,
    produce: (context) => {
      const relationship = findDomain(
        context.humanState,
        "relationship",
      );

      if (!relationship || relationship.risks.length === 0) {
        return [];
      }

      return [{
        type: "conflict",
        direction: "emerge",
        strength: domainStrength(relationship.risks),
        origin: "human",
        ruleId: "human-relationship-conflict",
        referenceKey: "human.relationship.risks",
        summary: "relationship domain friction indicators present",
        evidenceDescriptions: relationship.risks.slice(0, 3),
        timeSegment: defaultTimeSegment(context.timeState),
      }];
    },
  };
}

function buildHumanRelationshipStabilityRule(): SignalRule {
  return {
    id: "human-relationship-stability",
    priority: 27,
    signalType: "stability",
    matches: (context) =>
      isRequired(context, "stability")
      && (findDomain(context.humanState, "relationship")?.strengths.length ?? 0) > 0,
    produce: (context) => {
      const relationship = findDomain(
        context.humanState,
        "relationship",
      );

      if (!relationship || relationship.strengths.length === 0) {
        return [];
      }

      return [{
        type: "stability",
        direction: "increase",
        strength: domainStrength(relationship.strengths),
        origin: "human",
        ruleId: "human-relationship-stability",
        referenceKey: "human.relationship.strengths",
        summary: "relationship domain stabilizing indicators present",
        evidenceDescriptions: relationship.strengths.slice(0, 3),
        timeSegment: defaultTimeSegment(context.timeState),
      }];
    },
  };
}

function buildHumanRule(
  id: string,
  priority: number,
  signalType: ChangeSignalType,
  produceFn: (context: SignalRuleContext) => SignalRuleCandidate[],
): SignalRule {
  return {
    id,
    priority,
    signalType,
    matches: (context) =>
      isRequired(context, signalType)
      && produceFn(context).length > 0,
    produce: produceFn,
  };
}

/**
 * ChangeSignal 생성 Rule 목록.
 * 새로운 사주 계산을 하지 않고 기존 구조화 결과만 읽는다.
 */
export const CHANGE_SIGNAL_RULES: readonly SignalRule[] = [
  buildHumanRule(
    "human-money-inflow",
    10,
    "inflow",
    (context) => buildDomainStrengthSignals(
      context,
      "money",
      "inflow",
      "human-money-inflow",
    ),
  ),
  buildHumanRule(
    "human-money-expense",
    11,
    "expense",
    (context) => buildDomainPressureSignals(
      context,
      "money",
      "expense",
      "human-money-expense",
    ),
  ),
  buildHumanRule(
    "human-money-opportunity",
    12,
    "opportunity",
    (context) => buildDomainStrengthSignals(
      context,
      "money",
      "opportunity",
      "human-money-opportunity",
    ),
  ),
  buildHumanRule(
    "human-career-opportunity",
    13,
    "opportunity",
    (context) => buildDomainStrengthSignals(
      context,
      "career",
      "opportunity",
      "human-career-opportunity",
    ),
  ),
  buildHumanRule(
    "human-career-responsibility",
    14,
    "responsibility",
    (context) => buildDomainPressureSignals(
      context,
      "career",
      "responsibility",
      "human-career-responsibility",
    ),
  ),
  buildHumanRule(
    "human-career-expansion",
    15,
    "expansion",
    (context) => buildDomainStrengthSignals(
      context,
      "career",
      "expansion",
      "human-career-expansion",
    ),
  ),
  buildHumanRule(
    "human-capacity-pressure",
    16,
    "pressure",
    (context) => buildDomainPressureSignals(
      context,
      "capacity",
      "pressure",
      "human-capacity-pressure",
    ),
  ),
  buildHumanRule(
    "human-risk-domain",
    17,
    "risk",
    (context) => buildDomainRiskSignals(
      context,
      "risk",
      "human-risk-domain",
    ),
  ),
  buildHumanRule(
    "human-money-risk",
    18,
    "risk",
    (context) => buildDomainRiskSignals(
      context,
      "money",
      "human-money-risk",
    ),
  ),
  buildTimeSnapshotRule(
    "time-wolun-tenGod",
    20,
    "opportunity",
    (timeState) => timeState.wolun,
  ),
  buildTimeSnapshotRule(
    "time-seun-tenGod",
    21,
    "opportunity",
    (timeState) => timeState.seun,
  ),
  buildHumanRelationshipChangeRule(),
  buildHumanRelationshipConflictRule(),
  buildHumanRelationshipStabilityRule(),
  buildAssessmentOpportunityRule(),
  buildAssessmentOpportunityDecreaseRule(),
  buildAssessmentPressureRule(),
  buildAssessmentTimingTensionRule(),
  buildAssessmentExpenseRule(),
  buildAssessmentRiskRule(),
] as const;

export function findChangeSignalRuleById(
  ruleId: string,
): SignalRule | undefined {
  return CHANGE_SIGNAL_RULES.find((rule) => rule.id === ruleId);
}
