/**
 * FSV1 Boundary Representative — Boundary-only observational contract.
 *
 * Purpose:
 * - Record BR-LJ-PERMHEAD-TERM-01 CONTRACT_CONFLICT without touching
 *   FSV1 160 / Freeze / Selection / official FailureLabel / compare rules.
 *
 * Isolation (import direction):
 * - This module may import Boundary Representative Gold / Blind Gold protocol.
 * - Official FSV1 pipeline MUST NOT import this module.
 *
 * Forbidden:
 * - NovelHoldoutFailureLabel / ORACLE_CONFLICT mutation
 * - FSV1 Gold / Questions / Freeze / Selection / Reader / J-4-8 edits
 * - Treating observationalStatus as official exact-match success
 */

import {
  compareBlindGoldToReaderActual,
  type NovelHoldoutGoldVsActualCompare,
  type NovelHoldoutReaderActualSnapshot,
} from "./novelHoldoutBlindGoldProtocol.js";
import {
  NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_GOLD,
  type Fsv1BoundaryRepresentativeGoldRow,
} from "./novelHoldoutFrozenSetV1BoundaryRepresentativeGold.js";

export const FSV1_BOUNDARY_REPRESENTATIVE_OBSERVATION_STEP =
  "FSV1-BOUNDARY-REPRESENTATIVE-OBSERVATION" as const;

export const FSV1_BOUNDARY_PERMHEAD_CONTRACT_CONFLICT_SLOT_ID =
  "BR-LJ-PERMHEAD-TERM-01" as const;

/**
 * Boundary-only observational status axis.
 * Not a NovelHoldoutFailureLabel. Not ORACLE_CONFLICT.
 */
export type Fsv1BoundaryRepresentativeObservationalStatus =
  | "EXACT_MATCH"
  | "SEMANTIC_MATCH"
  | "CONTRACT_CONFLICT"
  | "DESIGN_LIMIT"
  | "UNRESOLVED";

/**
 * Minimal evidence required to narrate PERMHEAD CONTRACT_CONFLICT.
 * Lives outside NovelHoldoutReaderActualSnapshot on purpose.
 */
export type Fsv1BoundaryRepresentativeObservationEvidence = {
  permissionOrFeasibility: boolean;
  intentEvidence: readonly string[];
  /** J-4-3-1 strong permission intent override fired. */
  j431: boolean;
  /** J-4-8 permission→action-nature rewrite fired. */
  j48: boolean;
};

export type Fsv1BoundaryRepresentativeObservationInput = {
  goldRow: Fsv1BoundaryRepresentativeGoldRow;
  actual: NovelHoldoutReaderActualSnapshot;
  evidence: Fsv1BoundaryRepresentativeObservationEvidence;
};

export type Fsv1BoundaryRepresentativeObservationRow = {
  slotId: string;
  goldRow: Fsv1BoundaryRepresentativeGoldRow;
  actual: NovelHoldoutReaderActualSnapshot;
  /**
   * Official Blind Gold compare. For PERMHEAD CONTRACT_CONFLICT,
   * match remains false (no FailureLabel rewrite).
   */
  compare: NovelHoldoutGoldVsActualCompare;
  observationalStatus: Fsv1BoundaryRepresentativeObservationalStatus;
  evidence: Fsv1BoundaryRepresentativeObservationEvidence;
  note: string;
};

export type Fsv1BoundaryRepresentativeObservationVerificationResult = {
  step: typeof FSV1_BOUNDARY_REPRESENTATIVE_OBSERVATION_STEP;
  passed: boolean;
  row: Fsv1BoundaryRepresentativeObservationRow;
  checks: Readonly<Record<string, boolean>>;
  violations: readonly string[];
};

/**
 * Sealed raw-layer Reader actual for the known PERMHEAD conflict cell.
 * Captures post J-4-3-1 → J-4-8 final intent=termination (not Model B label).
 */
export const FSV1_BOUNDARY_PERMHEAD_CONTRACT_CONFLICT_ACTUAL:
  NovelHoldoutReaderActualSnapshot = {
    topic: "job",
    intent: "termination",
    decisionTarget: "leaveJob",
    analysisMode: "decision",
    provenance: "reader_runtime_observation",
  };

/**
 * Sealed Boundary-only evidence for the known PERMHEAD CONTRACT_CONFLICT cell.
 */
export const FSV1_BOUNDARY_PERMHEAD_CONTRACT_CONFLICT_EVIDENCE:
  Fsv1BoundaryRepresentativeObservationEvidence = {
    permissionOrFeasibility: true,
    intentEvidence: ["퇴사", "permissionOrFeasibility"],
    j431: true,
    j48: true,
  };

const PERMHEAD_CONTRACT_CONFLICT_NOTE =
  "J-4-3-1 permission frame then J-4-8 rewrites intent to termination; "
  + "Gold possibility + leaveJob remains inexpressible on official "
  + "primary-axis compare without J-4-8 policy change. "
  + "Boundary-only CONTRACT_CONFLICT; not ORACLE_CONFLICT / FSV1 FailureLabel.";

function isPermHeadContractConflictPattern(
  input: Fsv1BoundaryRepresentativeObservationInput,
  compare: NovelHoldoutGoldVsActualCompare,
): boolean {
  const { goldRow, actual, evidence } = input;
  return (
    goldRow.slotId === FSV1_BOUNDARY_PERMHEAD_CONTRACT_CONFLICT_SLOT_ID
    && compare.match === false
    && goldRow.gold.expectedTopic === "job"
    && goldRow.gold.expectedIntent === "possibility"
    && goldRow.gold.expectedDecisionTarget === "leaveJob"
    && actual.topic === "job"
    && actual.intent === "termination"
    && actual.decisionTarget === "leaveJob"
    && actual.provenance === "reader_runtime_observation"
    && evidence.permissionOrFeasibility === true
    && evidence.j431 === true
    && evidence.j48 === true
    && evidence.intentEvidence.includes("permissionOrFeasibility")
  );
}

/**
 * Boundary-only observational compare.
 * Reuses official compareBlindGoldToReaderActual (match stays false on conflict).
 * Emits CONTRACT_CONFLICT only for the sealed PERMHEAD pattern in this step.
 */
export function observeFsv1BoundaryRepresentativeContractConflict(
  input: Fsv1BoundaryRepresentativeObservationInput,
): Fsv1BoundaryRepresentativeObservationRow {
  const compare = compareBlindGoldToReaderActual(
    input.goldRow.gold,
    input.actual,
  );

  const observationalStatus: Fsv1BoundaryRepresentativeObservationalStatus =
    isPermHeadContractConflictPattern(input, compare)
      ? "CONTRACT_CONFLICT"
      : "UNRESOLVED";

  return {
    slotId: input.goldRow.slotId,
    goldRow: input.goldRow,
    actual: input.actual,
    compare,
    observationalStatus,
    evidence: input.evidence,
    note:
      observationalStatus === "CONTRACT_CONFLICT"
        ? PERMHEAD_CONTRACT_CONFLICT_NOTE
        : "Boundary observational status unresolved for this input.",
  };
}

/**
 * Observe the sealed BR-LJ-PERMHEAD-TERM-01 CONTRACT_CONFLICT cell only.
 */
export function observeFsv1BoundaryRepresentativePermHeadContractConflict(
  goldRows: readonly Fsv1BoundaryRepresentativeGoldRow[] =
    NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_GOLD,
): Fsv1BoundaryRepresentativeObservationRow {
  const goldRow = goldRows.find(
    (row) => row.slotId === FSV1_BOUNDARY_PERMHEAD_CONTRACT_CONFLICT_SLOT_ID,
  );
  if (!goldRow) {
    throw new Error(
      `Missing Boundary Representative Gold for ${FSV1_BOUNDARY_PERMHEAD_CONTRACT_CONFLICT_SLOT_ID}`,
    );
  }

  return observeFsv1BoundaryRepresentativeContractConflict({
    goldRow,
    actual: FSV1_BOUNDARY_PERMHEAD_CONTRACT_CONFLICT_ACTUAL,
    evidence: FSV1_BOUNDARY_PERMHEAD_CONTRACT_CONFLICT_EVIDENCE,
  });
}

/**
 * Verification harness for the sealed PERMHEAD Boundary-only observation.
 * Does not feed FSV1 160 counts / FailureLabel / Freeze.
 */
export function verifyFsv1BoundaryRepresentativePermHeadContractConflictObservation(
  goldRows: readonly Fsv1BoundaryRepresentativeGoldRow[] =
    NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_GOLD,
): Fsv1BoundaryRepresentativeObservationVerificationResult {
  const row = observeFsv1BoundaryRepresentativePermHeadContractConflict(goldRows);
  const violations: string[] = [];

  const checks = {
    slotIdIsPermHead:
      row.slotId === FSV1_BOUNDARY_PERMHEAD_CONTRACT_CONFLICT_SLOT_ID,
    officialCompareMatchIsFalse: row.compare.match === false,
    observationalStatusIsContractConflict:
      row.observationalStatus === "CONTRACT_CONFLICT",
    permissionOrFeasibilityTrue: row.evidence.permissionOrFeasibility === true,
    j431True: row.evidence.j431 === true,
    j48True: row.evidence.j48 === true,
    intentEvidenceHasPermissionFrame: row.evidence.intentEvidence.includes(
      "permissionOrFeasibility",
    ),
    goldIntentPossibility: row.goldRow.gold.expectedIntent === "possibility",
    actualIntentTermination: row.actual.intent === "termination",
    decisionTargetLeaveJobAligned:
      row.goldRow.gold.expectedDecisionTarget === "leaveJob"
      && row.actual.decisionTarget === "leaveJob",
    noOfficialFailureLabelAttached:
      row.compare.failureClassification === null,
  } as const;

  for (const [key, ok] of Object.entries(checks)) {
    if (!ok) violations.push(key);
  }

  return {
    step: FSV1_BOUNDARY_REPRESENTATIVE_OBSERVATION_STEP,
    passed: violations.length === 0,
    row,
    checks,
    violations,
  };
}

export function serializeFsv1BoundaryRepresentativeObservationVerificationResult(
  result: Fsv1BoundaryRepresentativeObservationVerificationResult,
): string {
  return JSON.stringify(
    {
      step: result.step,
      passed: result.passed,
      violations: result.violations,
      checks: result.checks,
      row: {
        slotId: result.row.slotId,
        observationalStatus: result.row.observationalStatus,
        compareMatch: result.row.compare.match,
        primaryAxisMatch: result.row.compare.primaryAxisMatch,
        failureClassification: result.row.compare.failureClassification,
        gold: {
          expectedTopic: result.row.goldRow.gold.expectedTopic,
          expectedIntent: result.row.goldRow.gold.expectedIntent,
          expectedDecisionTarget:
            result.row.goldRow.gold.expectedDecisionTarget,
          boundaryAgainst: result.row.goldRow.gold.boundaryAgainst,
          matchPolicy: result.row.goldRow.gold.matchPolicy,
        },
        actual: result.row.actual,
        evidence: result.row.evidence,
        note: result.row.note,
      },
    },
    null,
    2,
  );
}
