/**
 * Frozen Set v1 — Seed Slot Authoring input (verification-only).
 *
 * Exposes NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN as the Seed Slot Authoring
 * artifact. Slots are SPEC_READY inputs for the seed pipeline; stage itself
 * is owned by createNovelHoldoutSeedSlot / NovelHoldoutSeedPipelineState.
 *
 * Scope:
 * - Re-export slot plan as seed-slot authoring input (single source of truth)
 * - Do NOT generate question strings
 * - Do NOT attach Gold / run Reader / Novelty / Leakage / Freeze
 * - Do NOT duplicate or rematerialize the slot plan
 * - Do NOT import Blind Holdout v1 or P11-4 authored candidates
 */

import type { NovelHoldoutSeedSlotSpec } from "./novelHoldoutAllocationSchema.js";
import { NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN } from "./novelHoldoutFrozenSetV1SlotPlan.js";

/**
 * Frozen Set v1 Seed Slot Authoring input.
 * Identical to the slot plan — no rematerialization, no question text.
 */
export const NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS:
  readonly NovelHoldoutSeedSlotSpec[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN;
