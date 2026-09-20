/**
 * FSV1 Boundary Representative — INDEPENDENT GOLD AUTHORING (verification-only).
 *
 * Scope:
 * - Attach Blind Gold to 8 Boundary Representative QUESTION_AUTHORED rows
 * - Stage advanced to GOLD_SEALED
 * - Gold authored from question meaning only (no Reader / Model B copy)
 *
 * Isolation:
 * - Does NOT modify Frozen Set v1 Gold 160 (`frozen-set-v1-gold-sealed-unfrozen`)
 * - Does NOT modify Freeze / Selection / Questions
 * - Dedicated revision marker (do not reuse FSV1 / Blind Holdout sealing revisions)
 *
 * Forbidden in this step:
 * - QuestionReader / DecisionEngine / Reader execution
 * - Reader actual / Model B intent as Gold source
 * - Production path edits
 */

import type { NovelHoldoutSeedSlotSpec } from "./novelHoldoutAllocationSchema.js";
import type { NovelHoldoutBlindGoldSnapshot } from "./novelHoldoutBlindGoldProtocol.js";
import type {
  NovelHoldoutAmbiguityLabel,
  NovelHoldoutFamily,
  NovelHoldoutGoldConfidence,
  NovelHoldoutMatchPolicy,
  NovelHoldoutNoveltyTier,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";
import {
  NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_QUESTIONS,
  type Fsv1BoundaryRepresentativeAuthoredQuestion,
} from "./novelHoldoutFrozenSetV1BoundaryRepresentativeQuestions.js";

export const FSV1_BOUNDARY_REPRESENTATIVE_GOLD_STAGE = "GOLD_SEALED" as const;

export type Fsv1BoundaryRepresentativeGoldStage =
  typeof FSV1_BOUNDARY_REPRESENTATIVE_GOLD_STAGE;

/**
 * Dedicated unsealed revision for Boundary Representative Gold.
 * Must not reuse frozen-set-v1-gold-sealed-unfrozen or Blind Holdout revisions.
 */
export const FSV1_BOUNDARY_REPRESENTATIVE_GOLD_REVISION =
  "fsv1-boundary-representative-gold-sealed-unfrozen" as const;

export type Fsv1BoundaryRepresentativeGoldRow = {
  slotId: string;
  question: string;
  family: NovelHoldoutFamily;
  taxonomyPrimary: NovelHoldoutTaxonomy;
  noveltyTier: readonly NovelHoldoutNoveltyTier[];
  stage: Fsv1BoundaryRepresentativeGoldStage;
  slot: NovelHoldoutSeedSlotSpec;
  gold: NovelHoldoutBlindGoldSnapshot;
};

type GoldOnly = NovelHoldoutBlindGoldSnapshot;

const ALLOWED_MATCH_POLICIES = new Set<NovelHoldoutMatchPolicy>([
  "semantic_core",
  "timing_sensitive",
  "ambiguous",
  "design_limit",
  "composite",
]);

const ALLOWED_GOLD_CONFIDENCE = new Set<NovelHoldoutGoldConfidence>([
  "high",
  "medium",
  "low",
]);

const ALLOWED_AMBIGUITY_LABELS = new Set<NovelHoldoutAmbiguityLabel>([
  "AMBIGUOUS",
  "DESIGN_LIMIT",
]);

const FORBIDDEN_GOLD_PAYLOAD_KEYS = [
  "verdict",
  "direction",
  "conditions",
  "risks",
  "evidence",
  "explanation",
  "readerActual",
  "actual",
  "gptResponse",
  "responseText",
  "openai",
] as const;

function sealed(
  questionRow: Fsv1BoundaryRepresentativeAuthoredQuestion,
  gold: GoldOnly,
): Fsv1BoundaryRepresentativeGoldRow {
  return {
    slotId: questionRow.slotId,
    question: questionRow.question,
    family: questionRow.family,
    taxonomyPrimary: questionRow.taxonomyPrimary,
    noveltyTier: questionRow.noveltyTier,
    stage: FSV1_BOUNDARY_REPRESENTATIVE_GOLD_STAGE,
    slot: questionRow.slot,
    gold,
  };
}

/**
 * Independent human Gold keyed by BR-* slotId.
 * Authored without Reader raw / Model B intent copy.
 */
const GOLD_BY_SLOT_ID: Readonly<Record<string, GoldOnly>> = {
  // 1) leaveJob × clean termination
  "BR-LJ-TERM-CLEAN-01": {
    expectedTopic: "job",
    expectedIntent: "termination",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "위판장 정규직에서 이번 분기에 퇴사하겠다는 이탈 선언이 주된 말행위다. "
      + "맞는지·가부 물음 없이 고용 종료(leaveJob)만 묻는다.",
    boundaryAgainst: "permission",
  },

  // 2) realEstate-sell × clean evaluation (same sell DT as TERM; different speech-act)
  "BR-RS-EVAL-CLEAN-01": {
    expectedTopic: "realEstate",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "구멍가게형 상가를 처분하는 쪽이 맞는지, 매도·처분 선택에 대한 적합 평가를 묻는다. "
      + "같은 매도 대상이라도 이탈 선언이 아니라 평가 말행위다.",
    boundaryAgainst: "termination",
  },

  // 3) realEstate-sell × clean termination (매도 series)
  "BR-RS-TERM-CLEAN-01": {
    expectedTopic: "realEstate",
    expectedIntent: "termination",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "같은 상가를 이번 분기에 매도하겠다는 처분 실행 선언이 주축이다. "
      + "맞는지·가부 물음 없이 매도(sell) 종료 행동만 드러난다.",
    boundaryAgainst: "evaluation",
  },

  // 4) leaveJob × permission-headed surface (do NOT seal as termination)
  "BR-LJ-PERMHEAD-TERM-01": {
    expectedTopic: "job",
    expectedIntent: "possibility",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "퇴사해도 될까라는 가부 물음이 문장의 주된 말행위다. "
      + "퇴사는 물어보는 행동(직장 이탈)이고, 질문을 이탈 선언으로 읽지 않는다.",
    boundaryAgainst: "termination",
  },

  // 5) surface 맞는지 → evaluation (pair with MATEULKKA)
  "BR-SF-MATNEUNJI-01": {
    expectedTopic: "general",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "야간 교대를 주간 고정으로 바꾸는 근무 조정이 맞는지, 적합·평가 물음이다. "
      + "퇴사·매도 같은 종료 행동이나 가부 프레임이 없다.",
    boundaryAgainst: "possibility",
  },

  // 6) surface 맞을까 → possibility (minimal pair vs MATNEUNJI)
  "BR-SF-MATEULKKA-01": {
    expectedTopic: "general",
    expectedIntent: "possibility",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "같은 근무 조정 대상에서 ‘맞는지’가 ‘맞을까’로만 바뀌어, "
      + "적합 선언이 아니라 될지·맞을지에 가까운 가능·가부 물음으로 읽는다.",
    boundaryAgainst: "evaluation",
  },

  // 7) 해도 될지 — human permission cohort (do NOT seal Reader GJ fallback)
  "BR-SF-DOELJI-01": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "상여금으로 모은 현금을 리튬 ETF에 투자해도 될지, 투자 가부를 묻는다. "
      + "‘될지’ 형태도 ‘될까’와 같은 가부 말행위로 본다.",
    boundaryAgainst: "termination",
  },

  // 8) 해도 될까 — permission surface (pair with DOELJI)
  "BR-SF-DOELKKA-01": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "같은 현금·ETF 투자 대상에서 투자해도 될까라는 가부 물음이 분명하다. "
      + "종료·매도 선언이 아니라 투자(invest) 가능 여부다.",
    boundaryAgainst: "termination",
  },
};

function buildFsv1BoundaryRepresentativeGoldRows(
  questions: readonly Fsv1BoundaryRepresentativeAuthoredQuestion[] =
    NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_QUESTIONS,
  goldBySlotId: Readonly<Record<string, GoldOnly>> = GOLD_BY_SLOT_ID,
): readonly Fsv1BoundaryRepresentativeGoldRow[] {
  return questions.map((row) => {
    const gold = goldBySlotId[row.slotId];
    if (!gold) {
      throw new Error(
        `Missing FSV1 Boundary Representative Gold for slotId=${row.slotId}`,
      );
    }
    return sealed(row, gold);
  });
}

export const NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_GOLD:
  readonly Fsv1BoundaryRepresentativeGoldRow[] =
    buildFsv1BoundaryRepresentativeGoldRows();

export type Fsv1BoundaryRepresentativeGoldSelfCheck = {
  ok: boolean;
  authoringComplete: boolean;
  total: number;
  questionCount: number;
  authoredGoldMapSize: number;
  duplicateSlotIds: readonly string[];
  missingGoldSlotIds: readonly string[];
  extraGoldSlotIds: readonly string[];
  missingGoldFields: readonly string[];
  invalidEnumSlotIds: readonly string[];
  questionMismatchSlotIds: readonly string[];
  metadataMismatchSlotIds: readonly string[];
  forbiddenPayloadSlotIds: readonly string[];
  questionFileGoldLeaks: readonly string[];
  readerCallTraces: readonly string[];
  revisionOk: boolean;
  violations: readonly string[];
};

/**
 * Static self-check for Boundary Representative Gold authoring invariants.
 * Does not call QuestionReader / DecisionEngine / GPT.
 */
export function selfCheckFsv1BoundaryRepresentativeGold(
  goldRows: readonly Fsv1BoundaryRepresentativeGoldRow[] =
    NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_GOLD,
  questions: readonly Fsv1BoundaryRepresentativeAuthoredQuestion[] =
    NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_QUESTIONS,
  goldBySlotId: Readonly<Record<string, GoldOnly>> = GOLD_BY_SLOT_ID,
): Fsv1BoundaryRepresentativeGoldSelfCheck {
  const violations: string[] = [];
  const slotSeen = new Set<string>();
  const duplicateSlotIds: string[] = [];
  const missingGoldFields: string[] = [];
  const invalidEnumSlotIds: string[] = [];
  const questionMismatchSlotIds: string[] = [];
  const metadataMismatchSlotIds: string[] = [];
  const forbiddenPayloadSlotIds: string[] = [];
  const questionFileGoldLeaks: string[] = [];
  const readerCallTraces: string[] = [];

  const questionBySlot = new Map(
    questions.map((q) => [q.slotId, q] as const),
  );
  const goldMapKeys = Object.keys(goldBySlotId);

  const missingGoldSlotIds = questions
    .filter((q) => goldBySlotId[q.slotId] == null)
    .map((q) => q.slotId);

  const extraGoldSlotIds = goldMapKeys.filter(
    (slotId) => !questionBySlot.has(slotId),
  );

  const revision = FSV1_BOUNDARY_REPRESENTATIVE_GOLD_REVISION as string;
  const revisionOk =
    revision === "fsv1-boundary-representative-gold-sealed-unfrozen"
    && !revision.startsWith("frozen-set-v1-gold-")
    && !revision.startsWith("blind-holdout-v1-gold-");

  if (!revisionOk) {
    violations.push(
      "revision must be dedicated fsv1-boundary-representative-gold-sealed-unfrozen",
    );
  }

  if (questions.length !== 8) {
    violations.push(`expected 8 questions, got ${questions.length}`);
  }
  if (goldRows.length !== 8) {
    violations.push(`expected 8 gold rows, got ${goldRows.length}`);
  }
  if (goldMapKeys.length !== 8) {
    violations.push(`GOLD_BY_SLOT_ID size ${goldMapKeys.length} != 8`);
  }

  for (const q of questions) {
    if (!q.slotId.startsWith("BR-")) {
      violations.push(`${q.slotId}: BR slotId must start with BR-`);
    }
    const blob = q as unknown as Record<string, unknown>;
    for (const key of [
      "gold",
      "expectedTopic",
      "expectedIntent",
      "expectedDecisionTarget",
      "matchPolicy",
      "goldConfidence",
      "goldRationale",
    ] as const) {
      if (Object.prototype.hasOwnProperty.call(blob, key)) {
        questionFileGoldLeaks.push(`${q.slotId}:${key}`);
      }
    }
  }

  for (const row of goldRows) {
    if (slotSeen.has(row.slotId)) {
      duplicateSlotIds.push(row.slotId);
    } else {
      slotSeen.add(row.slotId);
    }

    if (!row.slotId.startsWith("BR-")) {
      violations.push(`${row.slotId}: BR gold slotId must start with BR-`);
    }

    if (row.stage !== "GOLD_SEALED") {
      violations.push(`${row.slotId}: stage must be GOLD_SEALED`);
    }

    const g = row.gold;
    if (!g.expectedTopic || !g.expectedIntent || !g.expectedDecisionTarget) {
      missingGoldFields.push(`${row.slotId}: topic/intent/DT`);
    }
    if (!g.matchPolicy) missingGoldFields.push(`${row.slotId}: matchPolicy`);
    if (!g.goldConfidence) {
      missingGoldFields.push(`${row.slotId}: goldConfidence`);
    }
    if (!g.goldRationale || g.goldRationale.trim().length === 0) {
      missingGoldFields.push(`${row.slotId}: goldRationale`);
    }

    if (g.matchPolicy && !ALLOWED_MATCH_POLICIES.has(g.matchPolicy)) {
      invalidEnumSlotIds.push(`${row.slotId}: matchPolicy`);
    }
    if (g.goldConfidence && !ALLOWED_GOLD_CONFIDENCE.has(g.goldConfidence)) {
      invalidEnumSlotIds.push(`${row.slotId}: goldConfidence`);
    }
    if (
      g.ambiguityLabel != null
      && !ALLOWED_AMBIGUITY_LABELS.has(g.ambiguityLabel)
    ) {
      invalidEnumSlotIds.push(`${row.slotId}: ambiguityLabel`);
    }

    if (
      g.ambiguityLabel
      && g.matchPolicy !== "ambiguous"
      && g.matchPolicy !== "design_limit"
    ) {
      violations.push(
        `${row.slotId}: ambiguityLabel requires ambiguous/design_limit matchPolicy`,
      );
    }
    if (
      !g.ambiguityLabel
      && (g.matchPolicy === "ambiguous" || g.matchPolicy === "design_limit")
    ) {
      violations.push(
        `${row.slotId}: matchPolicy ${g.matchPolicy} requires ambiguityLabel`,
      );
    }
    if (g.matchPolicy === "composite") {
      if (!g.compositeNote || g.compositeNote.trim().length === 0) {
        missingGoldFields.push(`${row.slotId}: compositeNote`);
      }
    }
    if (g.matchPolicy === "design_limit" && g.ambiguityLabel !== "DESIGN_LIMIT") {
      violations.push(`${row.slotId}: design_limit requires DESIGN_LIMIT label`);
    }

    const q = questionBySlot.get(row.slotId);
    if (!q) {
      questionMismatchSlotIds.push(row.slotId);
    } else {
      if (q.question !== row.question) {
        questionMismatchSlotIds.push(row.slotId);
      }
      if (
        q.family !== row.family
        || q.taxonomyPrimary !== row.taxonomyPrimary
        || q.slotId !== row.slot.slotId
      ) {
        metadataMismatchSlotIds.push(row.slotId);
      }
    }

    const blob = JSON.stringify(row);
    for (const key of FORBIDDEN_GOLD_PAYLOAD_KEYS) {
      if (blob.includes(`"${key}"`)) {
        forbiddenPayloadSlotIds.push(`${row.slotId}:${key}`);
      }
    }

    if (
      /\bJ-4-[0-9]\b|\bpermissionOrFeasibility\b|\brawReaderIntent\b|\bmodelBIntent\b|\breadQuestion\b/i
        .test(g.goldRationale)
    ) {
      violations.push(
        `${row.slotId}: goldRationale must not cite Reader implementation keywords`,
      );
    }
  }

  if (duplicateSlotIds.length > 0) {
    violations.push(`duplicate slotId: ${duplicateSlotIds.join(",")}`);
  }
  if (missingGoldSlotIds.length > 0) {
    violations.push(`missing Gold: ${missingGoldSlotIds.join(",")}`);
  }
  if (extraGoldSlotIds.length > 0) {
    violations.push(`extra Gold: ${extraGoldSlotIds.join(",")}`);
  }
  if (missingGoldFields.length > 0) {
    violations.push(`missing fields: ${missingGoldFields.join(" | ")}`);
  }
  if (invalidEnumSlotIds.length > 0) {
    violations.push(`invalid enum: ${invalidEnumSlotIds.join(",")}`);
  }
  if (questionMismatchSlotIds.length > 0) {
    violations.push(
      `question mismatch: ${questionMismatchSlotIds.join(",")}`,
    );
  }
  if (metadataMismatchSlotIds.length > 0) {
    violations.push(
      `metadata mismatch: ${metadataMismatchSlotIds.join(",")}`,
    );
  }
  if (forbiddenPayloadSlotIds.length > 0) {
    violations.push(
      `forbidden payload: ${forbiddenPayloadSlotIds.join(",")}`,
    );
  }
  if (questionFileGoldLeaks.length > 0) {
    violations.push(
      `question file gold leak: ${questionFileGoldLeaks.join(",")}`,
    );
  }
  if (readerCallTraces.length > 0) {
    violations.push(`reader traces: ${readerCallTraces.join(",")}`);
  }

  const authoringComplete =
    missingGoldSlotIds.length === 0
    && extraGoldSlotIds.length === 0
    && goldRows.length === questions.length
    && questions.length === 8;

  return {
    ok: violations.length === 0,
    authoringComplete,
    total: goldRows.length,
    questionCount: questions.length,
    authoredGoldMapSize: goldMapKeys.length,
    duplicateSlotIds,
    missingGoldSlotIds,
    extraGoldSlotIds,
    missingGoldFields,
    invalidEnumSlotIds,
    questionMismatchSlotIds,
    metadataMismatchSlotIds,
    forbiddenPayloadSlotIds,
    questionFileGoldLeaks,
    readerCallTraces,
    revisionOk,
    violations,
  };
}
