/**
 * FSV1 Boundary Representative — QUESTION_AUTHORED only (verification-only).
 *
 * Scope (this step):
 * - 8 representative semantic cells for FSV1 boundary verification
 * - Stage locked at QUESTION_AUTHORED
 * - No Gold fields / Reader execution / Freeze / Selection mutation
 *
 * Isolation:
 * - Does NOT modify Frozen Set v1 accepted 160 (`frozen-set-v1-sealed-r1`)
 * - Must NOT copy Blind Holdout v1 / P11-4 question strings
 * - Production Reader / Model B / Adapter / Compare untouched
 *
 * Pattern: Blind Holdout v1 question authoring (inline NovelHoldoutSeedSlotSpec).
 */

import type { NovelHoldoutSeedSlotSpec } from "./novelHoldoutAllocationSchema.js";
import type {
  NovelHoldoutFamily,
  NovelHoldoutNoveltyTier,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";

export const FSV1_BOUNDARY_REPRESENTATIVE_QUESTION_STAGE =
  "QUESTION_AUTHORED" as const;

export type Fsv1BoundaryRepresentativeQuestionStage =
  typeof FSV1_BOUNDARY_REPRESENTATIVE_QUESTION_STAGE;

/**
 * Question-only boundary representative row.
 * Gold / Reader / Freeze fields are intentionally absent.
 */
export type Fsv1BoundaryRepresentativeAuthoredQuestion = {
  slotId: string;
  question: string;
  family: NovelHoldoutFamily;
  taxonomyPrimary: NovelHoldoutTaxonomy;
  noveltyTier: readonly NovelHoldoutNoveltyTier[];
  stage: Fsv1BoundaryRepresentativeQuestionStage;
  slot: NovelHoldoutSeedSlotSpec;
};

function authored(
  slot: NovelHoldoutSeedSlotSpec,
  question: string,
): Fsv1BoundaryRepresentativeAuthoredQuestion {
  const trimmed = question.trim();
  if (trimmed.length === 0) {
    throw new Error(
      `FSV1 boundary representative authored question must be non-empty (slotId=${slot.slotId})`,
    );
  }

  return {
    slotId: slot.slotId,
    question: trimmed,
    family: slot.family,
    taxonomyPrimary: slot.taxonomyPrimary,
    noveltyTier: slot.noveltyTier,
    stage: FSV1_BOUNDARY_REPRESENTATIVE_QUESTION_STAGE,
    slot,
  };
}

/**
 * Eight FSV1 boundary representative questions (authoring only).
 * Gold is intentionally absent.
 */
export const NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_QUESTIONS:
  readonly Fsv1BoundaryRepresentativeAuthoredQuestion[] = [
    // 1) leaveJob × clean termination (exit-action-only; no eval/permission)
    authored(
      {
        slotId: "BR-LJ-TERM-CLEAN-01",
        family: "job-leaveJob",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "job|termination|leaveJob",
        authoringBrief:
          "Clean termination cell: exit-action only with required "
          + "termination keyword (퇴사). Forbid evaluation/permission "
          + "surfaces and dual speech-act cues.",
        boundaryAgainst: "evaluation|permission",
      },
      "수산물 위판장 경매 보조 정규직에서 이번 분기에 퇴사하려고 합니다",
    ),

    // 2) realEstate-sell × clean evaluation (처분/팔아야; no 매도; no permission)
    authored(
      {
        slotId: "BR-RS-EVAL-CLEAN-01",
        family: "realEstate-sell",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "realEstate|evaluation|sell",
        authoringBrief:
          "Clean evaluation cell: quality/evaluation surface only with "
          + "sell action via 처분/팔아야 (never 매도). Forbid termination "
          + "keyword and permission surface; no dual cue.",
        boundaryAgainst: "termination|permission",
      },
      "읍내 구멍가게형 상가를 처분하는 쪽이 맞는지 알고 싶어요",
    ),

    // 3) realEstate-sell × clean termination (매도 series; dispose-action-only)
    authored(
      {
        slotId: "BR-RS-TERM-CLEAN-01",
        family: "realEstate-sell",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "realEstate|termination|sell",
        authoringBrief:
          "Clean termination cell: dispose-action only using 매도 series. "
          + "Same sell object as BR-RS-EVAL-CLEAN-01. Forbid evaluation "
          + "and permission surfaces; no dual cue.",
        boundaryAgainst: "evaluation|permission",
      },
      "읍내 구멍가게형 상가를 이번 분기에 매도하려고 합니다",
    ),

    // 4) leaveJob × permission-headed + termination action nature
    authored(
      {
        slotId: "BR-LJ-PERMHEAD-TERM-01",
        family: "job-leaveJob",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "job|permission|leaveJob",
        authoringBrief:
          "Permission-headed termination: primary surface 해도 될까, "
          + "action nature leaveJob via 퇴사 evidence. Same employment "
          + "object as BR-LJ-TERM-CLEAN-01. Forbid evaluation surface; "
          + "no dual eval/term cue.",
        boundaryAgainst: "evaluation",
      },
      "수산물 위판장 경매 보조 정규직에서 퇴사해도 될까 궁금해요",
    ),

    // 5) non-termination object × 맞는지 evaluation surface only
    authored(
      {
        slotId: "BR-SF-MATNEUNJI-01",
        family: "general",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "general|evaluation|none",
        authoringBrief:
          "Surface-only evaluation cell: 맞는지 only on a non-termination "
          + "object. Forbid termination keyword and permission frame. "
          + "Avoid accidental possibility-keyword matches. Paired with "
          + "BR-SF-MATEULKKA-01 (same semantic object/action).",
        boundaryAgainst: "possibility|permission|termination",
      },
      "야간 교대표를 주간 고정으로 바꾸는 근무 조정이 맞는지 고민이에요",
    ),

    // 6) same object as #5; surface 맞는지 → 맞을까
    authored(
      {
        slotId: "BR-SF-MATEULKKA-01",
        family: "general",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "general|possibility|none",
        authoringBrief:
          "Minimal surface pair vs BR-SF-MATNEUNJI-01: only 맞는지→맞을까. "
          + "Same semantic object/action. Forbid termination keyword and "
          + "permission frame. Intentional single possibility keyword: 맞을까.",
        boundaryAgainst: "permission|termination",
      },
      "야간 교대표를 주간 고정으로 바꾸는 근무 조정이 맞을까 고민이에요",
    ),

    // 7) money-invest × 해도 될지 (observe current-contract GJ fallback; not Gold)
    authored(
      {
        slotId: "BR-SF-DOELJI-01",
        family: "money-invest",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "money|generalJudgement|invest",
        authoringBrief:
          "Surface 해도 될지 on money-invest. Termination forbidden. "
          + "Permission-frame keywords are expected NOT to match under "
          + "current contract (observe generalJudgement fallback). "
          + "Not a Gold expectation. Paired with BR-SF-DOELKKA-01.",
        boundaryAgainst: "permission|termination",
      },
      "명절 상여금으로 모은 현금을 리튬 관련 ETF에 투자해도 될지 고민이에요",
    ),

    // 8) same object as #7; surface 해도 될지 → 해도 될까
    authored(
      {
        slotId: "BR-SF-DOELKKA-01",
        family: "money-invest",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "money|permission|invest",
        authoringBrief:
          "Minimal surface pair vs BR-SF-DOELJI-01: only 해도 될지→해도 될까. "
          + "Same semantic object/action. Permission frame should match. "
          + "Forbid termination keyword; no dual cue.",
        boundaryAgainst: "termination",
      },
      "명절 상여금으로 모은 현금을 리튬 관련 ETF에 투자해도 될까 고민이에요",
    ),
  ];
