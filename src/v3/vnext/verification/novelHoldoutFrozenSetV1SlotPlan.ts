/**
 * Frozen Set v1 — allocation materializer (verification-only).
 *
 * Converts NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION into a deterministic
 * human-authoring slot plan (NovelHoldoutSeedSlotSpec[]).
 *
 * Scope:
 * - Materialize soft guidance into authoring slots only
 * - Do NOT generate question strings
 * - Do NOT create Gold / run Reader / Novelty / Leakage / Freeze
 * - Do NOT enforce total 160–200 as a hard quota here
 * - Do NOT promote softMin/softMax or share targets into hard quotas
 * - Do NOT import Blind Holdout v1 or P11-4 authored candidates
 */

import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION,
  type NovelHoldoutFamilyAllocationTarget,
  type NovelHoldoutFrozenSetV1AllocationSchema,
  type NovelHoldoutSeedSlotSpec,
} from "./novelHoldoutAllocationSchema.js";
import type {
  NovelHoldoutFamily,
  NovelHoldoutNoveltyTier,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";

function taxonomyLetter(taxonomy: NovelHoldoutTaxonomy): string {
  return taxonomy.charAt(0);
}

function familySlug(family: NovelHoldoutFamily): string {
  switch (family) {
    case "business-start":
      return "biz-start";
    case "business-continue":
      return "biz-continue";
    case "business-stop":
      return "biz-stop";
    case "business-buy":
      return "biz-buy";
    case "job-changeJob":
      return "job-changeJob";
    case "job-leaveJob":
      return "job-leaveJob";
    case "realEstate-buy":
      return "re-buy";
    case "realEstate-continue":
      return "re-continue";
    case "realEstate-sell":
      return "re-sell";
    case "money-invest":
      return "money-invest";
    case "money-manageMoney":
      return "money-manageMoney";
    case "lifeDirection":
      return "lifeDirection";
    case "relationship":
      return "relationship";
    case "general":
      return "general";
    case "other":
      return "other";
  }
}

/**
 * Hamilton / largest-remainder soft share allocation.
 * Soft reporting guidance only — not a freeze hard quota.
 */
function allocateBySoftShares<T extends string>(
  total: number,
  items: readonly { key: T; share: number }[],
): readonly T[] {
  if (total <= 0 || items.length === 0) {
    return [];
  }

  const exact = items.map((item) => ({
    key: item.key,
    floor: Math.floor(item.share * total),
    frac: item.share * total - Math.floor(item.share * total),
  }));

  const counts = new Map<T, number>();
  let assigned = 0;
  for (const row of exact) {
    counts.set(row.key, row.floor);
    assigned += row.floor;
  }

  let remaining = total - assigned;
  const byFrac = [...exact].sort((left, right) => {
    if (right.frac !== left.frac) {
      return right.frac - left.frac;
    }
    return left.key < right.key ? -1 : left.key > right.key ? 1 : 0;
  });

  for (let index = 0; index < remaining; index += 1) {
    const key = byFrac[index % byFrac.length]!.key;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const ordered: T[] = [];
  for (const item of items) {
    const count = counts.get(item.key) ?? 0;
    for (let index = 0; index < count; index += 1) {
      ordered.push(item.key);
    }
  }
  return ordered;
}

function buildAuthoringBrief(input: {
  family: NovelHoldoutFamilyAllocationTarget;
  taxonomyPrimary: NovelHoldoutTaxonomy;
  noveltyTier: NovelHoldoutNoveltyTier;
  auxiliaryFamilyBudget: { min: number; max: number };
  total: { min: number; max: number };
}): string {
  const auxNote =
    input.family.priority === "auxiliary"
      ? ` auxiliaryFamilyBudget soft guidance=${input.auxiliaryFamilyBudget.min}-${input.auxiliaryFamilyBudget.max};`
      : "";

  return (
    `[frozen-set-v1 soft guidance] family=${input.family.family} `
    + `(priority=${input.family.priority}); `
    + `taxonomyPrimary=${input.taxonomyPrimary}; `
    + `noveltyTier=${input.noveltyTier}; `
    + `decisionAxisHint=${input.family.decisionAxisHint}; `
    + `family softMin=${input.family.softMin} softMax=${input.family.softMax};`
    + `${auxNote} `
    + `allocation total soft range=${input.total.min}-${input.total.max} `
    + `(hard completion deferred to Freeze Verification). `
    + `Author meaning/taxonomy only; do not paste known-pool question strings.`
  );
}

/**
 * Materialize allocation soft guidance into deterministic authoring slots.
 *
 * Slot count per family uses softMax as the soft authoring ceiling
 * (not a freeze hard quota). Taxonomy / novelty membership follows
 * allocation share targets via largest-remainder soft distribution.
 */
export function materializeNovelHoldoutFrozenSetV1SlotPlan(
  schema: NovelHoldoutFrozenSetV1AllocationSchema =
    NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION,
): readonly NovelHoldoutSeedSlotSpec[] {
  const taxonomyShareItems = schema.taxonomyShares.map((item) => ({
    key: item.taxonomy,
    share: item.share,
  }));
  const noveltyShareItems = schema.noveltyShares.map((item) => ({
    key: item.tier,
    share: item.share,
  }));

  const slots: NovelHoldoutSeedSlotSpec[] = [];

  for (const family of schema.families) {
    const slotCount = family.softMax;
    const taxonomyOrder = allocateBySoftShares(
      slotCount,
      taxonomyShareItems,
    );
    const noveltyOrder = allocateBySoftShares(
      slotCount,
      noveltyShareItems,
    );

    const taxonomySeq = new Map<NovelHoldoutTaxonomy, number>();

    for (let index = 0; index < slotCount; index += 1) {
      const taxonomyPrimary = taxonomyOrder[index]!;
      const noveltyTier = noveltyOrder[index]!;
      const seq = (taxonomySeq.get(taxonomyPrimary) ?? 0) + 1;
      taxonomySeq.set(taxonomyPrimary, seq);

      const slotId =
        `fsv1-${familySlug(family.family)}-`
        + `${taxonomyLetter(taxonomyPrimary)}-`
        + `${String(seq).padStart(3, "0")}`;

      slots.push({
        slotId,
        family: family.family,
        taxonomyPrimary,
        noveltyTier: [noveltyTier],
        decisionAxisHint: family.decisionAxisHint,
        authoringBrief: buildAuthoringBrief({
          family,
          taxonomyPrimary,
          noveltyTier,
          auxiliaryFamilyBudget: schema.auxiliaryFamilyBudget,
          total: schema.total,
        }),
      });
    }
  }

  return slots;
}

/**
 * Frozen Set v1 human-authoring slot plan (no questions, no Gold).
 */
export const NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN:
  readonly NovelHoldoutSeedSlotSpec[] =
    materializeNovelHoldoutFrozenSetV1SlotPlan();
