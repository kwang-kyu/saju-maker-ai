import type {
  SajuCurrentDaeunFact,
  SajuCurrentSeunFact,
  SajuLuckFlowFact,
  SajuTargetIlunFact,
  SajuTargetPeriodLuckFlowFact,
  SajuWolunSegmentFact,
} from "../../types/luckFlowFact.js";
import type {
  JieQiBoundary,
  LuckFlowSnapshot,
  TimeGranularity,
  TimePeriodRef,
  TimeSegment,
  TimeState,
} from "../types/timeState.js";
import type {
  VNextEvidence,
} from "../types/humanState.js";
import {
  emptyVNextEvidence,
  toVNextEvidenceFromStrings,
} from "./adapterEvidence.js";

export type TimeStateAdapterInput = {
  targetPeriod?: TimePeriodRef | null;
  targetPeriodLuckFlow?: SajuTargetPeriodLuckFlowFact | null;
  currentLuckFlow?: SajuLuckFlowFact | null;
};

function buildSnapshotFromDaeun(
  daeun: SajuCurrentDaeunFact,
): LuckFlowSnapshot {
  return {
    label: `대운 ${daeun.ganZhi}`,
    summary: `${daeun.startYear}-${daeun.endYear} (${daeun.startAge}-${daeun.endAge}세)`,
    facts: {
      ganZhi: daeun.ganZhi,
      heavenlyStem: daeun.heavenlyStem,
      earthlyBranch: daeun.earthlyBranch,
      tenGod: daeun.tenGod,
      element: daeun.element,
      startYear: daeun.startYear,
      endYear: daeun.endYear,
    },
    evidence: emptyVNextEvidence(),
  };
}

function buildSnapshotFromSeun(
  seun: SajuCurrentSeunFact,
  labelPrefix = "세운",
): LuckFlowSnapshot {
  return {
    label: `${labelPrefix} ${seun.ganZhi}`,
    summary: `${seun.year}년 (${seun.age}세)`,
    facts: {
      year: seun.year,
      age: seun.age,
      ganZhi: seun.ganZhi,
      heavenlyStem: seun.heavenlyStem,
      earthlyBranch: seun.earthlyBranch,
      tenGod: seun.tenGod,
      element: seun.element,
    },
    evidence: emptyVNextEvidence(),
  };
}

function buildSnapshotFromWolun(
  wolun: SajuWolunSegmentFact,
): LuckFlowSnapshot {
  return {
    label: `월운 ${wolun.ganZhi}`,
    summary: `${wolun.targetYear}-${String(wolun.targetMonth).padStart(2, "0")}`,
    facts: {
      targetYear: wolun.targetYear,
      targetMonth: wolun.targetMonth,
      ganZhi: wolun.ganZhi,
      heavenlyStem: wolun.heavenlyStem,
      earthlyBranch: wolun.earthlyBranch,
      tenGod: wolun.tenGod,
      element: wolun.element,
      startDate: wolun.startDate,
      endDate: wolun.endDate,
    },
    evidence: emptyVNextEvidence(),
  };
}

function buildSnapshotFromIlun(
  ilun: SajuTargetIlunFact,
): LuckFlowSnapshot {
  return {
    label: `일운 ${ilun.ganZhi}`,
    summary: ilun.targetDate,
    facts: {
      targetDate: ilun.targetDate,
      ganZhi: ilun.ganZhi,
      heavenlyStem: ilun.heavenlyStem,
      earthlyBranch: ilun.earthlyBranch,
      tenGod: ilun.tenGod,
      element: ilun.element,
    },
    evidence: emptyVNextEvidence(),
  };
}

function buildWolunSegments(
  wolunSegments: readonly SajuWolunSegmentFact[],
): TimeSegment[] {
  return wolunSegments.map((segment) => ({
    start: segment.startDate,
    end: segment.endDate,
    granularity: "month" as const,
    label: `${segment.targetYear}-${String(segment.targetMonth).padStart(2, "0")} ${segment.ganZhi}`,
    facts: {
      ganZhi: segment.ganZhi,
      tenGod: segment.tenGod,
      element: segment.element,
    },
    evidence: emptyVNextEvidence(),
  }));
}

function buildJieQiBoundaries(
  wolunSegments: readonly SajuWolunSegmentFact[],
): JieQiBoundary[] {
  return wolunSegments
    .filter((segment) => segment.jieQiBoundary !== null)
    .map((segment) => ({
      name: segment.jieQiBoundary!.name,
      start: segment.startDate,
      end: segment.endDate,
      evidence: emptyVNextEvidence(),
    }));
}

function resolveTargetPeriod(
  input: TimeStateAdapterInput,
): TimePeriodRef {
  if (input.targetPeriod) {
    return input.targetPeriod;
  }

  if (input.targetPeriodLuckFlow) {
    const fact = input.targetPeriodLuckFlow;
    return {
      start: fact.targetStartDate,
      end: fact.targetEndDate,
      granularity: "period",
      label: `${fact.targetStartDate} ~ ${fact.targetEndDate}`,
    };
  }

  if (input.currentLuckFlow) {
    return {
      start: input.currentLuckFlow.referenceDate,
      end: input.currentLuckFlow.referenceDate,
      granularity: "day",
      label: input.currentLuckFlow.referenceDate,
    };
  }

  return {
    start: "unknown",
    end: "unknown",
    granularity: "period",
    label: "unknown",
  };
}

function buildEvidence(
  limitations: readonly string[],
): VNextEvidence {
  if (limitations.length === 0) {
    return emptyVNextEvidence();
  }

  return toVNextEvidenceFromStrings(
    limitations,
    "luckFlow.limitations",
  );
}

/**
 * 기존 운세 계산 Fact를 vNext TimeState로 읽기 전용 변환한다.
 */
export function adaptTimeState(
  input: TimeStateAdapterInput,
): TimeState {
  const targetPeriod = resolveTargetPeriod(input);
  const fact = input.targetPeriodLuckFlow;
  const current = input.currentLuckFlow;

  const daeun =
    fact?.currentDaeun ?? current?.currentDaeun ?? null;

  const seun =
    fact?.targetSeun ?? current?.currentSeun ?? null;

  const primaryWolun =
    fact?.wolunSegments?.[0] ?? null;

  const ilun =
    fact?.targetIlun ?? null;

  const segments = fact
    ? buildWolunSegments(fact.wolunSegments)
    : [];

  const jieQiBoundaries = fact
    ? buildJieQiBoundaries(fact.wolunSegments)
    : [];

  const limitations = fact?.limitations ?? [];

  return {
    targetPeriod,
    daeun: daeun ? buildSnapshotFromDaeun(daeun) : null,
    seun: seun ? buildSnapshotFromSeun(seun) : null,
    wolun: primaryWolun ? buildSnapshotFromWolun(primaryWolun) : null,
    ilun: ilun ? buildSnapshotFromIlun(ilun) : null,
    jieQiBoundaries,
    segments,
    evidence: buildEvidence(limitations),
  };
}

export function hasTimeStateSource(
  input: TimeStateAdapterInput,
): boolean {
  return Boolean(
    input.targetPeriod
      || input.targetPeriodLuckFlow
      || input.currentLuckFlow,
  );
}

export function inferRequiredGranularityFromPeriod(
  granularity: TimeGranularity,
): boolean {
  return granularity !== "life" && granularity !== "decade";
}
