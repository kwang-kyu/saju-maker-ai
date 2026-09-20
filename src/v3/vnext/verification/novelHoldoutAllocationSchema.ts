/**
 * P11-3 Frozen Set v1 — allocation schema (verification-only).
 *
 * Defines soft targets for later human authoring.
 * Does NOT generate concrete Novel questions.
 * Does NOT force 50 rows per family.
 */

import type {
  NovelHoldoutFamily,
  NovelHoldoutNoveltyTier,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";

export type NovelHoldoutAllocationRange = {
  min: number;
  max: number;
};

export type NovelHoldoutTaxonomyShareTarget = {
  taxonomy: NovelHoldoutTaxonomy;
  share: number;
};

export type NovelHoldoutNoveltyShareTarget = {
  tier: NovelHoldoutNoveltyTier;
  share: number;
};

/**
 * Soft per-family budget. Core boundary axes are prioritized;
 * auxiliary families share a small combined budget.
 */
export type NovelHoldoutFamilyAllocationTarget = {
  family: NovelHoldoutFamily;
  priority: "core" | "auxiliary";
  /**
   * Soft guidance only — not a hard quota enforced at freeze time in P11-3.
   */
  softMin: number;
  softMax: number;
  decisionAxisHint: string;
};

export type NovelHoldoutFrozenSetV1AllocationSchema = {
  holdoutVersionTarget: "frozen-set-v1";
  total: NovelHoldoutAllocationRange;
  taxonomyShares: readonly NovelHoldoutTaxonomyShareTarget[];
  /**
   * Novelty tiers may co-occur on one row; shares are soft reporting targets
   * over tier membership counts, not mutually exclusive buckets.
   */
  noveltyShares: readonly NovelHoldoutNoveltyShareTarget[];
  auxiliaryFamilyBudget: NovelHoldoutAllocationRange;
  families: readonly NovelHoldoutFamilyAllocationTarget[];
};

/**
 * P11-1 direction materialized as a schema-only allocation plan.
 * Actual 160–200 Novel rows are NOT created in P11-3.
 */
export const NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION:
  NovelHoldoutFrozenSetV1AllocationSchema = {
    holdoutVersionTarget: "frozen-set-v1",
    total: { min: 160, max: 200 },
    taxonomyShares: [
      { taxonomy: "A_SAME_MEANING_PARAPHRASE", share: 0.25 },
      { taxonomy: "B_TARGET_VARIATION", share: 0.15 },
      { taxonomy: "C_QUESTION_FORM_VARIATION", share: 0.1 },
      { taxonomy: "D_BOUNDARY_COLLISION", share: 0.2 },
      { taxonomy: "E_UNKNOWN_VOCABULARY", share: 0.1 },
      { taxonomy: "F_COMPOSITE", share: 0.1 },
      { taxonomy: "G_AMBIGUOUS_DESIGN_LIMIT", share: 0.1 },
    ],
    noveltyShares: [
      { tier: "lexical", share: 0.4 },
      { tier: "syntactic", share: 0.3 },
      { tier: "combinational", share: 0.3 },
    ],
    auxiliaryFamilyBudget: { min: 20, max: 30 },
    families: [
      {
        family: "business-start",
        priority: "core",
        softMin: 12,
        softMax: 22,
        decisionAxisHint: "business|possibility|start",
      },
      {
        family: "business-continue",
        priority: "core",
        softMin: 10,
        softMax: 18,
        decisionAxisHint: "business|continuation|continue",
      },
      {
        family: "business-stop",
        priority: "core",
        softMin: 10,
        softMax: 18,
        decisionAxisHint: "business|termination|stop",
      },
      {
        family: "business-buy",
        priority: "core",
        softMin: 8,
        softMax: 14,
        decisionAxisHint: "business|possibility|buy",
      },
      {
        family: "job-changeJob",
        priority: "core",
        softMin: 12,
        softMax: 20,
        decisionAxisHint: "job|possibility|changeJob",
      },
      {
        family: "job-leaveJob",
        priority: "core",
        softMin: 10,
        softMax: 18,
        decisionAxisHint: "job|termination|leaveJob",
      },
      {
        family: "realEstate-buy",
        priority: "core",
        softMin: 10,
        softMax: 18,
        decisionAxisHint: "realEstate|possibility|buy",
      },
      {
        family: "realEstate-continue",
        priority: "core",
        softMin: 8,
        softMax: 14,
        decisionAxisHint: "realEstate|continuation|continue",
      },
      {
        family: "realEstate-sell",
        priority: "core",
        softMin: 8,
        softMax: 14,
        decisionAxisHint: "realEstate|possibility|sell",
      },
      {
        family: "money-invest",
        priority: "core",
        softMin: 10,
        softMax: 18,
        decisionAxisHint: "money|possibility|invest",
      },
      {
        family: "money-manageMoney",
        priority: "core",
        softMin: 8,
        softMax: 14,
        decisionAxisHint: "money|method|manageMoney",
      },
      {
        family: "lifeDirection",
        priority: "auxiliary",
        softMin: 6,
        softMax: 12,
        decisionAxisHint: "lifeDirection|generalJudgement|confirmDirection",
      },
      {
        family: "relationship",
        priority: "auxiliary",
        softMin: 6,
        softMax: 12,
        decisionAxisHint: "relationship|possibility|none",
      },
      {
        family: "general",
        priority: "auxiliary",
        softMin: 4,
        softMax: 10,
        decisionAxisHint: "general|generalJudgement|none",
      },
    ],
  };

export function summarizeAllocationSchema(
  schema: NovelHoldoutFrozenSetV1AllocationSchema =
    NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION,
): {
  taxonomyShareSum: number;
  noveltyShareSum: number;
  coreFamilyCount: number;
  auxiliaryFamilyCount: number;
  softCoreMaxSum: number;
  softAuxiliaryMaxSum: number;
} {
  const taxonomyShareSum = schema.taxonomyShares.reduce(
    (sum, item) => sum + item.share,
    0,
  );
  const noveltyShareSum = schema.noveltyShares.reduce(
    (sum, item) => sum + item.share,
    0,
  );
  const core = schema.families.filter((item) => item.priority === "core");
  const auxiliary = schema.families.filter(
    (item) => item.priority === "auxiliary",
  );

  return {
    taxonomyShareSum,
    noveltyShareSum,
    coreFamilyCount: core.length,
    auxiliaryFamilyCount: auxiliary.length,
    softCoreMaxSum: core.reduce((sum, item) => sum + item.softMax, 0),
    softAuxiliaryMaxSum: auxiliary.reduce(
      (sum, item) => sum + item.softMax,
      0,
    ),
  };
}

/**
 * Authoring slot derived from allocation schema only.
 * Must NOT embed concrete known-pool question text.
 */
export type NovelHoldoutSeedSlotSpec = {
  slotId: string;
  family: NovelHoldoutFamily;
  taxonomyPrimary: NovelHoldoutTaxonomy;
  taxonomySecondary?: readonly NovelHoldoutTaxonomy[];
  noveltyTier: readonly NovelHoldoutNoveltyTier[];
  /**
   * Semantic axis hint from family allocation — not Reader output.
   */
  decisionAxisHint: string;
  /**
   * Human authoring brief. Must describe meaning/taxonomy only.
   * Must not paste Reference/Regression question strings.
   */
  authoringBrief: string;
  boundaryAgainst?: string;
};
