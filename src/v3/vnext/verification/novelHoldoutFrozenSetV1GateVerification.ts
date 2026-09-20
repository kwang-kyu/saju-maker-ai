/**
 * Frozen Set v1 — Novelty Gate + Leakage Gate (verification-only).
 *
 * Scope:
 * - Integrity: Question ↔ Gold 1:1 for current authoring pool (160)
 * - Novelty Gate + Leakage Gate against expanded Known Pool
 * - Gold separation / no Reader execution / no Selection / no Freeze
 *
 * Forbidden:
 * - QuestionReader / DecisionEngine / Reader run
 * - Gold mutation / question mutation / Known Pool mutation
 * - Production path edits
 * - Using Gold expectedTopic/Intent/DecisionTarget as gate oracle
 * - Hard-assert that every row Novelty/Leakage PASS
 */

import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
  selfCheckNovelHoldoutFrozenSetV1Gold,
  type NovelHoldoutFrozenSetV1GoldRow,
} from "./novelHoldoutFrozenSetV1Gold.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS,
  type NovelHoldoutFrozenSetV1AuthoredQuestion,
} from "./novelHoldoutFrozenSetV1Questions.js";
import {
  evaluateNovelHoldoutLeakageGate,
  type NovelHoldoutLeakageGateResult,
} from "./novelHoldoutLeakageGate.js";
import {
  evaluateNovelHoldoutNoveltyGate,
  type NovelHoldoutNoveltyGateResult,
} from "./novelHoldoutNoveltyGate.js";
import {
  collectNovelHoldoutKnownQuestionPool,
  summarizeNovelHoldoutKnownPool,
} from "./novelHoldoutStructuralAnalysis.js";

export type FrozenSetV1GateBucket = "PASS" | "REVIEW" | "REJECT";

export type FrozenSetV1GateFinding = {
  slotId: string;
  question: string;
  gate: "novelty" | "leakage" | "integrity" | "gold_separation";
  bucket: FrozenSetV1GateBucket | "FAIL";
  reason: string;
  detectedSourceOrStructure: string | null;
};

export type FrozenSetV1GateRowResult = {
  slotId: string;
  question: string;
  family: string;
  taxonomyPrimary: string;
  declaredNoveltyTier: readonly string[];
  overallBucket: FrozenSetV1GateBucket;
  novelty: {
    bucket: FrozenSetV1GateBucket;
    status: NovelHoldoutNoveltyGateResult["status"];
    lexicalOk: boolean;
    syntacticOk: boolean;
    combinationalOk: boolean;
    weakVariation: string;
    nearestKnownId: string | null;
    nearestJaccard: number | null;
    reasons: readonly string[];
  };
  leakage: {
    bucket: FrozenSetV1GateBucket;
    status: NovelHoldoutLeakageGateResult["status"];
    rejectCount: number;
    softFlagCount: number;
    findings: readonly {
      check: string;
      severity: string;
      matchedKnownId: string | null;
      detail: string;
    }[];
  };
};

export type FrozenSetV1GateVerificationCase = {
  id: string;
  passed: boolean;
  details: readonly string[];
};

export type FrozenSetV1GateVerificationResult = {
  step: "FSV1-GATE";
  /**
   * Integrity + gold separation + known pool + gates evaluated for all 160
   * without Reader. Does NOT require every item to Novelty/Leakage PASS.
   */
  harnessPassed: boolean;
  /**
   * Ready for later Selection/Freeze: no Novelty/Leakage REJECT.
   * REVIEW (soft) does not fail readiness by itself.
   */
  gateReady: boolean;
  /**
   * Same as gateReady for FSV1 reporting alias.
   * Honest observation — not a hard assert that all rows PASS.
   */
  overallPassed: boolean;
  integrityPassed: boolean;
  noveltyPassed: boolean;
  leakagePassed: boolean;
  total: number;
  acceptedCount: number;
  reviewCount: number;
  rejectedCount: number;
  integrity: {
    status: "PASS" | "FAIL";
    total: number;
    missing: number;
    extra: number;
    mismatch: number;
    violations: readonly string[];
  };
  goldSeparation: {
    status: "PASS" | "FAIL";
    violations: readonly string[];
  };
  novelty: {
    PASS: number;
    REVIEW: number;
    REJECT: number;
  };
  leakage: {
    PASS: number;
    REVIEW: number;
    REJECT: number;
  };
  readerExecuted: false;
  knownPoolSummary: {
    total: number;
    uniqueNormalized: number;
    bySource: Readonly<Record<string, number>>;
  };
  rows: readonly FrozenSetV1GateRowResult[];
  findings: readonly FrozenSetV1GateFinding[];
  cases: readonly FrozenSetV1GateVerificationCase[];
  checks: Readonly<Record<string, boolean>>;
};

function mapNoveltyBucket(
  result: NovelHoldoutNoveltyGateResult,
): FrozenSetV1GateBucket {
  if (result.status === "PASS") return "PASS";
  if (result.status === "NEEDS_HUMAN_REVIEW") return "REVIEW";
  return "REJECT";
}

function mapLeakageBucket(
  result: NovelHoldoutLeakageGateResult,
): FrozenSetV1GateBucket {
  if (result.status === "PASS") return "PASS";
  if (result.status === "SOFT_FLAG_ONLY") return "REVIEW";
  return "REJECT";
}

function worstBucket(
  left: FrozenSetV1GateBucket,
  right: FrozenSetV1GateBucket,
): FrozenSetV1GateBucket {
  if (left === "REJECT" || right === "REJECT") return "REJECT";
  if (left === "REVIEW" || right === "REVIEW") return "REVIEW";
  return "PASS";
}

/**
 * Gate inputs intentionally omit Gold expectedTopic/Intent/DecisionTarget.
 * Same semantic family alone must not decide leakage reject.
 */
function evaluateGatesWithoutGoldAxisOracle(
  row: NovelHoldoutFrozenSetV1GoldRow,
  knownPool: ReturnType<typeof collectNovelHoldoutKnownQuestionPool>,
): {
  novelty: NovelHoldoutNoveltyGateResult;
  leakage: NovelHoldoutLeakageGateResult;
} {
  const novelty = evaluateNovelHoldoutNoveltyGate(
    {
      question: row.question,
      taxonomyPrimary: row.taxonomyPrimary,
      taxonomySecondary: row.slot.taxonomySecondary,
      noveltyTier: row.noveltyTier,
      // No expectedPrimaryAxisSkeleton — Gold axes are not gate oracles.
      boundaryAgainst: row.slot.boundaryAgainst ?? row.gold.boundaryAgainst,
      // F_COMPOSITE is recognized by taxonomy alone; note is optional evidence.
      compositeNote: row.gold.compositeNote,
      // G requires sealed ambiguityLabel; not an expected Topic/Intent/DT oracle.
      ambiguityLabel: row.gold.ambiguityLabel ?? null,
    },
    knownPool,
  );

  const leakage = evaluateNovelHoldoutLeakageGate(
    {
      question: row.question,
      taxonomyPrimary: row.taxonomyPrimary,
      // Omit Gold primary-axis skeleton so same-family ≠ automatic leakage.
    },
    knownPool,
  );

  return { novelty, leakage };
}

function verifyQuestionGoldIntegrity(
  questions: readonly NovelHoldoutFrozenSetV1AuthoredQuestion[],
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[],
): {
  status: "PASS" | "FAIL";
  total: number;
  missing: number;
  extra: number;
  mismatch: number;
  violations: readonly string[];
  caseResult: FrozenSetV1GateVerificationCase;
} {
  const self = selfCheckNovelHoldoutFrozenSetV1Gold(goldRows, questions);
  const violations = [...self.violations];

  if (questions.length !== 160) {
    violations.push(`questions length ${questions.length} != 160`);
  }
  if (goldRows.length !== 160) {
    violations.push(`gold length ${goldRows.length} != 160`);
  }
  if (!self.authoringComplete) {
    violations.push("authoringComplete=false");
  }

  const questionSlots = new Set(questions.map((q) => q.slotId));
  const goldSlots = new Set(goldRows.map((g) => g.slotId));

  for (const slotId of questionSlots) {
    if (!goldSlots.has(slotId)) {
      violations.push(`question slot missing gold: ${slotId}`);
    }
  }
  for (const slotId of goldSlots) {
    if (!questionSlots.has(slotId)) {
      violations.push(`gold slot missing question: ${slotId}`);
    }
  }

  if (questionSlots.size !== questions.length) {
    violations.push(
      `question slotIds not unique: ${questions.length} rows / ${questionSlots.size} unique`,
    );
  }
  if (goldSlots.size !== goldRows.length) {
    violations.push(
      `gold slotIds not unique: ${goldRows.length} rows / ${goldSlots.size} unique`,
    );
  }

  for (const row of goldRows) {
    if (row.stage !== "GOLD_SEALED") {
      violations.push(`${row.slotId}: stage must be GOLD_SEALED`);
    }
  }

  const mismatch =
    self.questionMismatchSlotIds.length
    + self.metadataMismatchSlotIds.length
    + self.forbiddenPayloadSlotIds.length;

  const unique = self.ok && self.duplicateSlotIds.length === 0;
  const status: "PASS" | "FAIL" =
    violations.length === 0 && unique ? "PASS" : "FAIL";

  return {
    status,
    total: goldRows.length,
    missing: self.missingGoldSlotIds.length,
    extra: self.extraGoldSlotIds.length,
    mismatch,
    violations,
    caseResult: {
      id: "question-gold-integrity-1-to-1",
      passed: status === "PASS",
      details: [
        `totalQuestions=${questions.length}`,
        `totalGold=${goldRows.length}`,
        `selfCheckOk=${self.ok}`,
        `authoringComplete=${self.authoringComplete}`,
        `missing=${self.missingGoldSlotIds.length}`,
        `extra=${self.extraGoldSlotIds.length}`,
        `mismatch=${mismatch}`,
        ...violations.slice(0, 12),
      ],
    },
  };
}

function verifyGoldSeparation(
  questions: readonly NovelHoldoutFrozenSetV1AuthoredQuestion[],
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[],
): {
  status: "PASS" | "FAIL";
  violations: readonly string[];
  caseResult: FrozenSetV1GateVerificationCase;
} {
  const violations: string[] = [];

  for (const q of questions) {
    const blob = JSON.stringify(q);
    if (
      /"expectedTopic"|"expectedIntent"|"expectedDecisionTarget"/.test(blob)
    ) {
      violations.push(
        `${q.slotId}: question authoring carries Gold expected axes`,
      );
    }
    if (
      /readQuestion|QuestionReader|DecisionEngine|reader_runtime_observation/i
        .test(blob)
    ) {
      violations.push(`${q.slotId}: question authoring has Reader traces`);
    }
  }

  for (const row of goldRows) {
    if ((row as { readerActual?: unknown }).readerActual != null) {
      violations.push(`${row.slotId}: Gold row has readerActual`);
    }
    const blob = JSON.stringify(row);
    if (/reader_runtime_observation|readQuestion\s*\(/i.test(blob)) {
      violations.push(`${row.slotId}: Gold blob has Reader observation traces`);
    }
  }

  const status: "PASS" | "FAIL" =
    violations.length === 0 ? "PASS" : "FAIL";

  return {
    status,
    violations,
    caseResult: {
      id: "gold-separation-no-expected-axes-in-questions",
      passed: status === "PASS",
      details: [
        `violations=${violations.length}`,
        ...violations.slice(0, 8),
        "gateInputsOmitGoldExpectedTopicIntentDecisionTarget=true",
      ],
    },
  };
}

function verifyReaderNotExecuted(): FrozenSetV1GateVerificationCase {
  return {
    id: "reader-not-executed",
    passed: true,
    details: [
      "FSV1-GATE does not import/call readQuestion / DecisionEngine",
      "readerExecuted=false",
      "selectionNotRun=true",
      "freezeNotRun=true",
    ],
  };
}

function verifyKnownPoolExpanded(
  summary: ReturnType<typeof summarizeNovelHoldoutKnownPool>,
): FrozenSetV1GateVerificationCase {
  const hasMeaning =
    (summary.bySource.reference_canonical ?? 0) > 0
    || (summary.bySource.strong_anchor_subset ?? 0) > 0;
  const hasRegression = (summary.bySource.regression_surface ?? 0) > 0;
  const hasExhaustive =
    (summary.bySource.exhaustive100_leakage_compare_only ?? 0) > 0;
  const hasProbe = (summary.bySource.probe_leakage_compare_only ?? 0) > 0;
  const hasReaderVer =
    (summary.bySource.reader_verification_leakage_compare_only ?? 0) > 0;
  const hasP11 = (summary.bySource.p11_exposed_leakage_compare_only ?? 0) > 0;

  const passed =
    hasMeaning
    && hasRegression
    && hasExhaustive
    && hasProbe
    && hasReaderVer
    && hasP11;

  return {
    id: "known-pool-expanded-leakage-sources",
    passed,
    details: [
      `total=${summary.total}`,
      `bySource=${JSON.stringify(summary.bySource)}`,
    ],
  };
}

export function verifyNovelHoldoutFrozenSetV1Gates(): FrozenSetV1GateVerificationResult {
  const questions = NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS;
  const goldRows = NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD;

  const integrity = verifyQuestionGoldIntegrity(questions, goldRows);
  const goldSeparation = verifyGoldSeparation(questions, goldRows);
  const readerCase = verifyReaderNotExecuted();

  const knownPool = collectNovelHoldoutKnownQuestionPool({
    includeExhaustive100ForLeakageCompare: true,
    includeProbeLeakageCompare: true,
    includeReaderVerificationLeakageCompare: true,
    includeP11ExposedLeakageCompare: true,
  });
  const knownPoolSummary = summarizeNovelHoldoutKnownPool(knownPool);
  const poolCase = verifyKnownPoolExpanded(knownPoolSummary);

  const noveltyCounts = { PASS: 0, REVIEW: 0, REJECT: 0 };
  const leakageCounts = { PASS: 0, REVIEW: 0, REJECT: 0 };
  const rows: FrozenSetV1GateRowResult[] = [];
  const findings: FrozenSetV1GateFinding[] = [];

  // If integrity fails, still report but do not pretend gates are authoritative.
  if (integrity.status === "PASS") {
    let index = 0;
    for (const row of goldRows) {
      index += 1;
      const { novelty, leakage } = evaluateGatesWithoutGoldAxisOracle(
        row,
        knownPool,
      );
      const noveltyBucket = mapNoveltyBucket(novelty);
      const leakageBucket = mapLeakageBucket(leakage);
      const overallBucket = worstBucket(noveltyBucket, leakageBucket);
      noveltyCounts[noveltyBucket] += 1;
      leakageCounts[leakageBucket] += 1;

      if (index === 1 || index % 10 === 0 || index === goldRows.length) {
        // Progress only — does not affect gate semantics.
        // eslint-disable-next-line no-console
        console.error(
          `FSV1-GATE progress ${index}/${goldRows.length} slot=${row.slotId} `
            + `n=${noveltyBucket} l=${leakageBucket}`,
        );
      }

      rows.push({
        slotId: row.slotId,
        question: row.question,
        family: row.family,
        taxonomyPrimary: row.taxonomyPrimary,
        declaredNoveltyTier: row.noveltyTier,
        overallBucket,
        novelty: {
          bucket: noveltyBucket,
          status: novelty.status,
          lexicalOk: novelty.lexicalOk,
          syntacticOk: novelty.syntacticOk,
          combinationalOk: novelty.combinationalOk,
          weakVariation: novelty.weakVariation,
          nearestKnownId: novelty.nearestKnownId,
          nearestJaccard: novelty.nearestJaccard,
          reasons: novelty.reasons,
        },
        leakage: {
          bucket: leakageBucket,
          status: leakage.status,
          rejectCount: leakage.rejectCount,
          softFlagCount: leakage.softFlagCount,
          // Keep rejects fully; soft flags capped for report size only.
          findings: (() => {
            const mapped = leakage.findings.map((f) => ({
              check: f.check,
              severity: f.severity,
              matchedKnownId: f.matchedKnownId,
              detail: f.detail,
            }));
            const rejects = mapped.filter((f) => f.severity === "reject");
            const soft = mapped
              .filter((f) => f.severity === "soft_flag")
              .slice(0, 8);
            return [...rejects, ...soft];
          })(),
        },
      });

      if (noveltyBucket !== "PASS") {
        findings.push({
          slotId: row.slotId,
          question: row.question,
          gate: "novelty",
          bucket: noveltyBucket,
          reason: novelty.reasons.join(" | ") || novelty.status,
          detectedSourceOrStructure: novelty.nearestKnownId
            ? `nearest=${novelty.nearestKnownId}; jaccard=${
              novelty.nearestJaccard?.toFixed(3) ?? "n/a"
            }; weak=${novelty.weakVariation}`
            : `weak=${novelty.weakVariation}`,
        });
      }

      if (leakageBucket !== "PASS") {
        const rejectOrSoft = leakage.findings.filter(
          (f) =>
            leakageBucket === "REJECT"
              ? f.severity === "reject"
              : f.severity === "soft_flag",
        );
        const primary = rejectOrSoft[0] ?? leakage.findings[0];
        findings.push({
          slotId: row.slotId,
          question: row.question,
          gate: "leakage",
          bucket: leakageBucket,
          reason: primary
            ? `${primary.check}: ${primary.detail}`
            : leakage.status,
          detectedSourceOrStructure: primary?.matchedKnownId
            ?? (primary
              ? `${primary.check}`
              : null),
        });
      }
    }
  } else {
    findings.push({
      slotId: "*",
      question: "",
      gate: "integrity",
      bucket: "FAIL",
      reason: integrity.violations.join(" | ") || "integrity failed",
      detectedSourceOrStructure: null,
    });
  }

  if (goldSeparation.status === "FAIL") {
    findings.push({
      slotId: "*",
      question: "",
      gate: "gold_separation",
      bucket: "FAIL",
      reason: goldSeparation.violations.join(" | ") || "gold separation failed",
      detectedSourceOrStructure: null,
    });
  }

  const expectedTotal = questions.length;
  const allEvaluated =
    integrity.status === "PASS" && rows.length === expectedTotal;

  const gatesCase: FrozenSetV1GateVerificationCase = {
    id: "gates-evaluated-for-all-authored",
    passed: allEvaluated,
    details: [
      `evaluated=${rows.length}`,
      `expected=${expectedTotal}`,
      `novelty=${JSON.stringify(noveltyCounts)}`,
      `leakage=${JSON.stringify(leakageCounts)}`,
    ],
  };

  const cases = [
    integrity.caseResult,
    goldSeparation.caseResult,
    poolCase,
    readerCase,
    gatesCase,
  ];

  const checks: Record<string, boolean> = {};
  for (const verificationCase of cases) {
    checks[verificationCase.id] = verificationCase.passed;
  }

  const harnessPassed = cases.every((c) => c.passed);
  const noveltyPassed = allEvaluated && noveltyCounts.REJECT === 0;
  const leakagePassed = allEvaluated && leakageCounts.REJECT === 0;
  const gateReady =
    harnessPassed
    && noveltyPassed
    && leakagePassed;

  const acceptedCount = rows.filter((r) => r.overallBucket === "PASS").length;
  const reviewCount = rows.filter((r) => r.overallBucket === "REVIEW").length;
  const rejectedCount = rows.filter((r) => r.overallBucket === "REJECT").length;

  return {
    step: "FSV1-GATE",
    harnessPassed,
    gateReady,
    overallPassed: gateReady,
    integrityPassed: integrity.status === "PASS",
    noveltyPassed,
    leakagePassed,
    total: expectedTotal,
    acceptedCount,
    reviewCount,
    rejectedCount,
    integrity: {
      status: integrity.status,
      total: integrity.total,
      missing: integrity.missing,
      extra: integrity.extra,
      mismatch: integrity.mismatch,
      violations: integrity.violations,
    },
    goldSeparation: {
      status: goldSeparation.status,
      violations: goldSeparation.violations,
    },
    novelty: noveltyCounts,
    leakage: leakageCounts,
    readerExecuted: false,
    knownPoolSummary,
    rows,
    findings,
    cases,
    checks,
  };
}

export function serializeNovelHoldoutFrozenSetV1GateVerificationResult(
  result: FrozenSetV1GateVerificationResult,
): string {
  const reviewOrReject = result.findings.filter(
    (f) => f.bucket === "REVIEW" || f.bucket === "REJECT" || f.bucket === "FAIL",
  );

  const reviewSlotIds = result.rows
    .filter((r) => r.overallBucket === "REVIEW")
    .map((r) => r.slotId);
  const rejectSlotIds = result.rows
    .filter((r) => r.overallBucket === "REJECT")
    .map((r) => r.slotId);

  return JSON.stringify(
    {
      step: result.step,
      harnessPassed: result.harnessPassed,
      gateReady: result.gateReady,
      overallPassed: result.overallPassed,
      integrityPassed: result.integrityPassed,
      noveltyPassed: result.noveltyPassed,
      leakagePassed: result.leakagePassed,
      total: result.total,
      acceptedCount: result.acceptedCount,
      reviewCount: result.reviewCount,
      rejectedCount: result.rejectedCount,
      reviewSlotIds,
      rejectSlotIds,
      integrity: result.integrity,
      goldSeparation: result.goldSeparation,
      novelty: result.novelty,
      leakage: result.leakage,
      readerExecuted: result.readerExecuted,
      knownPoolSummary: result.knownPoolSummary,
      checks: result.checks,
      cases: result.cases,
      findings: reviewOrReject,
      rows: result.rows.map((row) => ({
        slotId: row.slotId,
        question: row.question,
        family: row.family,
        taxonomyPrimary: row.taxonomyPrimary,
        overallBucket: row.overallBucket,
        noveltyBucket: row.novelty.bucket,
        leakageBucket: row.leakage.bucket,
        noveltyStatus: row.novelty.status,
        leakageStatus: row.leakage.status,
        weakVariation: row.novelty.weakVariation,
        nearestKnownId: row.novelty.nearestKnownId,
        nearestJaccard: row.novelty.nearestJaccard,
        lexicalOk: row.novelty.lexicalOk,
        syntacticOk: row.novelty.syntacticOk,
        combinationalOk: row.novelty.combinationalOk,
        leakageRejectCount: row.leakage.rejectCount,
        leakageSoftFlagCount: row.leakage.softFlagCount,
        noveltyReasons: row.novelty.reasons,
        leakageFindings: row.leakage.findings,
      })),
    },
    null,
    2,
  );
}
