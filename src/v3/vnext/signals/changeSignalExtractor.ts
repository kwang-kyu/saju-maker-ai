import type {
  Assessment,
} from "../types/assessment.js";
import type {
  ChangeDirection,
  ChangeSignal,
  ChangeSignalStrength,
  ChangeSignalType,
} from "../types/changeSignal.js";
import type {
  HumanState,
} from "../types/humanState.js";
import type {
  TimeSegmentRef,
  TimeState,
} from "../types/timeState.js";
import {
  buildChangeSignalEvidence,
  countDistinctEvidenceOrigins,
  mergeChangeSignalEvidence,
} from "./changeSignalEvidence.js";
import {
  CHANGE_SIGNAL_RULES,
  type SignalRuleCandidate,
  type SignalRuleContext,
} from "./changeSignalRules.js";

export type ChangeSignalExtractorInput = {
  humanState?: HumanState;
  timeState?: TimeState;
  assessment?: Assessment;
  requiredSignals: readonly ChangeSignalType[];
};

const STRENGTH_RANK: Record<ChangeSignalStrength, number> = {
  weak: 1,
  moderate: 2,
  strong: 3,
};

function aggregateKey(
  type: ChangeSignalType,
  direction: ChangeDirection,
): string {
  return `${type}:${direction}`;
}

function resolveAggregatedOrigin(
  origins: readonly SignalRuleCandidate["origin"][],
): SignalRuleCandidate["origin"] {
  const uniqueOrigins = new Set(origins);

  if (uniqueOrigins.size > 1) {
    return "combined";
  }

  return origins[0] ?? "combined";
}

function resolveAggregatedStrength(
  candidates: readonly SignalRuleCandidate[],
  mergedEvidenceCount: number,
  distinctOrigins: number,
): ChangeSignalStrength {
  const maxCandidateStrength = candidates.reduce<
    ChangeSignalStrength
  >((current, candidate) => {
    return STRENGTH_RANK[candidate.strength] > STRENGTH_RANK[current]
      ? candidate.strength
      : current;
  }, "weak");

  if (
    distinctOrigins >= 2
    && maxCandidateStrength === "moderate"
    && mergedEvidenceCount >= 2
  ) {
    return "strong";
  }

  if (
    distinctOrigins >= 2
    && maxCandidateStrength === "weak"
    && mergedEvidenceCount >= 2
  ) {
    return "moderate";
  }

  return maxCandidateStrength;
}

function selectTimeSegment(
  candidates: readonly SignalRuleCandidate[],
  timeState?: TimeState,
): TimeSegmentRef {
  const timeCandidate = candidates.find(
    (candidate) => candidate.origin === "time"
      && candidate.timeSegment,
  );

  if (timeCandidate?.timeSegment) {
    return timeCandidate.timeSegment;
  }

  if (timeState) {
    return {
      start: timeState.targetPeriod.start,
      end: timeState.targetPeriod.end,
      granularity: timeState.targetPeriod.granularity,
      label: timeState.targetPeriod.label
        ?? `${timeState.targetPeriod.start} ~ ${timeState.targetPeriod.end}`,
    };
  }

  return candidates.find((candidate) => candidate.timeSegment)?.timeSegment
    ?? {
      start: "unknown",
      end: "unknown",
      granularity: "period",
      label: "unspecified",
    };
}

function aggregateCandidates(
  candidates: readonly SignalRuleCandidate[],
  timeState?: TimeState,
): ChangeSignal[] {
  const grouped = new Map<string, SignalRuleCandidate[]>();

  for (const candidate of candidates) {
    const key = aggregateKey(candidate.type, candidate.direction);
    const existing = grouped.get(key) ?? [];
    existing.push(candidate);
    grouped.set(key, existing);
  }

  const aggregated: ChangeSignal[] = [];

  for (const [, group] of grouped) {
    const first = group[0];
    const evidenceList = group.map((candidate) =>
      buildChangeSignalEvidence(
        {
          origin: candidate.origin,
          ruleId: candidate.ruleId,
          referenceKey: candidate.referenceKey,
        },
        candidate.evidenceDescriptions,
      ),
    );

    const mergedEvidence = mergeChangeSignalEvidence(
      evidenceList,
      resolveAggregatedOrigin(group.map((item) => item.origin)),
    );

    const distinctOrigins = countDistinctEvidenceOrigins(mergedEvidence);

    aggregated.push({
      type: first.type,
      direction: first.direction,
      strength: resolveAggregatedStrength(
        group,
        mergedEvidence.items.length,
        distinctOrigins,
      ),
      timeSegment: selectTimeSegment(group, timeState),
      summary: group.length > 1
        ? `${first.type} ${first.direction} from ${distinctOrigins} source layer(s)`
        : first.summary,
      evidence: mergedEvidence,
      source: {
        type: "saju",
        engineKey: "vnext.changeSignalExtractor",
        referenceKey: group.map((item) => item.ruleId).join("+"),
      },
    });
  }

  return aggregated.sort((left, right) => {
    const typeCompare = left.type.localeCompare(right.type);

    if (typeCompare !== 0) {
      return typeCompare;
    }

    return left.direction.localeCompare(right.direction);
  });
}

function runMatchingRules(
  context: SignalRuleContext,
): SignalRuleCandidate[] {
  const required = new Set(context.requiredSignals);
  const sortedRules = [...CHANGE_SIGNAL_RULES]
    .filter((rule) => required.has(rule.signalType))
    .sort((left, right) => left.priority - right.priority);

  const candidates: SignalRuleCandidate[] = [];

  for (const rule of sortedRules) {
    if (!rule.matches(context)) {
      continue;
    }

    const produced = rule.produce(context);

    for (const candidate of produced) {
      if (required.has(candidate.type)) {
        candidates.push(candidate);
      }
    }
  }

  return candidates;
}

/**
 * HumanState / TimeState / Assessment에서
 * Scenario가 요구한 ChangeSignal만 추출한다.
 */
export function extractChangeSignals(
  input: ChangeSignalExtractorInput,
): ChangeSignal[] {
  if (input.requiredSignals.length === 0) {
    return [];
  }

  const context: SignalRuleContext = {
    humanState: input.humanState,
    timeState: input.timeState,
    assessment: input.assessment,
    requiredSignals: input.requiredSignals,
  };

  const candidates = runMatchingRules(context);

  return aggregateCandidates(candidates, input.timeState);
}

export function shouldExtractChangeSignals(
  requiredSignals: readonly ChangeSignalType[],
): boolean {
  return requiredSignals.length > 0;
}
