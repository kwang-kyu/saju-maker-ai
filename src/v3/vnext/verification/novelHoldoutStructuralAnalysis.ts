/**
 * P11-2 Novel Holdout — verification-local normalize/tokenize/structural key
 * and safe known-question pool collection.
 *
 * Does NOT call production QuestionReader normalize (private).
 * Does NOT modify fixtures / Reader / Decision Engine.
 * exhaustive100 is leakage-compare only — never Novel promotion.
 */

import {
  expandAllMeaningCells,
  QUESTION_MEANING_CELLS,
} from "../../consulting/questionMeaningRegressionFixtures.js";
import type {
  ExpandedQuestionMeaningCase,
} from "../../consulting/questionMeaningRegressionFixtures.js";
import {
  QUESTION_READER_EXHAUSTIVE_100_FIXTURES,
} from "../../consulting/questionReaderExhaustive100Fixtures.js";
import type {
  DecisionTarget,
  QuestionIntentOrLegacy,
  QuestionTopic,
} from "../../consulting/question/questionReader.js";
import {
  P10_3_STRONG_ANCHOR_CELL_IDS,
} from "./strongAnchorEquivalenceVerification.js";
import type {
  NovelHoldoutActionLemma,
  NovelHoldoutKnownPoolSource,
  NovelHoldoutKnownQuestion,
  NovelHoldoutObjectClass,
  NovelHoldoutPrimaryAxisSkeleton,
  NovelHoldoutQuestionForm,
  NovelHoldoutStructuralKey,
} from "./novelHoldoutContract.js";
import {
  NOVEL_HOLDOUT_BATCH_P11_4_AUTHORED_CANDIDATES,
} from "./novelHoldoutBatchP11_4AuthoredCandidates.js";
import {
  NOVEL_HOLDOUT_KNOWN_LEAKAGE_SURFACES_CURATED,
  type NovelHoldoutKnownLeakageSurface,
} from "./novelHoldoutKnownLeakageSurfaces.js";

const STRONG_ANCHOR_CELL_ID_SET: ReadonlySet<string> = new Set(
  P10_3_STRONG_ANCHOR_CELL_IDS,
);

/**
 * Minimal Korean particle / ending strip for normalized-duplicate checks.
 * Verification-only; not a linguistic stemmer.
 */
const PARTICLE_OR_ENDING_PATTERN =
  /(을|를|이|가|은|는|에|에서|으로|로|와|과|도|만|의|께|한테|에게)$/u;

const QUESTION_ENDING_PATTERN =
  /(해도\s*될까요|해도\s*괜찮을까요|하는\s*게\s*나을까요|하는\s*것이\s*좋을까요|일까요|인가요|할까요|될까요|나요|습니까|인가|일까|할까|될까)\.?$/u;

const ACTION_LEMMA_PATTERNS: readonly {
  lemma: NovelHoldoutActionLemma;
  pattern: RegExp;
}[] = [
  { lemma: "start", pattern: /시작|창업|개업|오픈|런칭/u },
  { lemma: "continue", pattern: /계속|유지|홀딩|보유|갖고|가지고/u },
  { lemma: "stop", pattern: /그만|중단|접|폐업|정리하/u },
  { lemma: "sell", pattern: /매도|팔|처분/u },
  // P11-7-1a: avoid bare `사` substring FP (퇴사/회사/장사/이사/사업…).
  // Keep real buy surfaces only (verification structural lemma).
  {
    lemma: "buy",
    pattern:
      /매수|매입|구입|구매|취득|사들여|사려고|사볼까|사도|사야|살까|살지|사는|사서|사다/u,
  },
  { lemma: "invest", pattern: /투자|주식|코인|펀드/u },
  { lemma: "manageMoney", pattern: /재테크|자산관리|돈\s*관리|현금/u },
  { lemma: "changeJob", pattern: /이직|전직|직장\s*바꾸/u },
  { lemma: "leaveJob", pattern: /퇴사|그만두|퇴직/u },
  { lemma: "marry", pattern: /결혼|혼인/u },
  { lemma: "separate", pattern: /헤어|이별|단절|정리할/u },
  { lemma: "partner", pattern: /동업|파트너/u },
  { lemma: "move", pattern: /이사|이전/u },
  { lemma: "wait", pattern: /기다리|보류|미루/u },
  { lemma: "choose", pattern: /고르|선택|어느\s*쪽/u },
];

const OBJECT_CLASS_PATTERNS: readonly {
  objectClass: NovelHoldoutObjectClass;
  pattern: RegExp;
}[] = [
  { objectClass: "realEstate", pattern: /집|아파트|부동산|전세|월세|매매|건물|토지/u },
  { objectClass: "job", pattern: /직장|회사|이직|퇴사|직업|커리어/u },
  { objectClass: "business", pattern: /사업|창업|가게|매장|개업|통닭|카페|식당/u },
  { objectClass: "equity", pattern: /주식|코인|펀드|ETF|증권/u },
  { objectClass: "cash", pattern: /현금|예금|적금|통장/u },
  { objectClass: "money", pattern: /돈|재물|투자|재테크|자산/u },
  { objectClass: "marriage", pattern: /결혼|배우자|혼인/u },
  { objectClass: "relationship", pattern: /연애|남자친구|여자친구|애인|관계/u },
  { objectClass: "health", pattern: /건강|병원|검진|아프/u },
  { objectClass: "legal", pattern: /소송|고소|법률|재판/u },
  { objectClass: "lifeDirection", pattern: /인생|진로|방향|적성/u },
  { objectClass: "lifeFlow", pattern: /운세|흐름|대운|세운/u },
];

/**
 * Verification-local text normalize for leakage/novelty gates.
 */
export function normalizeNovelHoldoutText(
  question: string,
): string {
  return question
    .normalize("NFC")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

/**
 * Stronger normalize used only for normalized-duplicate detection:
 * strip trailing question endings and trailing particles on tokens.
 */
export function normalizeNovelHoldoutForDuplicate(
  question: string,
): string {
  const base = normalizeNovelHoldoutText(question)
    .replace(/[?？!~.。,…]+$/u, "")
    .replace(QUESTION_ENDING_PATTERN, "")
    .trim();

  return tokenizeNovelHoldoutText(base)
    .map((token) => token.replace(PARTICLE_OR_ENDING_PATTERN, ""))
    .filter((token) => token.length > 0)
    .join(" ");
}

export function tokenizeNovelHoldoutText(
  question: string,
): readonly string[] {
  const normalized = normalizeNovelHoldoutText(question);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(/[\s,./\\|_+\-·•()[\]{}'"“”‘’]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

export function inferNovelHoldoutActionLemma(
  question: string,
): NovelHoldoutActionLemma {
  const normalized = normalizeNovelHoldoutText(question);
  for (const entry of ACTION_LEMMA_PATTERNS) {
    if (entry.pattern.test(normalized)) {
      return entry.lemma;
    }
  }
  return "unknown";
}

export function inferNovelHoldoutObjectClass(
  question: string,
): NovelHoldoutObjectClass {
  const normalized = normalizeNovelHoldoutText(question);
  for (const entry of OBJECT_CLASS_PATTERNS) {
    if (entry.pattern.test(normalized)) {
      return entry.objectClass;
    }
  }
  return "unknown";
}

export function inferNovelHoldoutQuestionForm(
  question: string,
): NovelHoldoutQuestionForm {
  const normalized = normalizeNovelHoldoutText(question);

  if (/언제|시기|타이밍|몇\s*월|올해|내년/.test(normalized)) {
    return "timing_when";
  }
  if (/나을까|좋은가|좋을까|추천/.test(normalized)) {
    return "recommendation_better";
  }
  if (/고민|걱정/.test(normalized)) {
    return "statement_worry";
  }
  if (/망설|주저/.test(normalized)) {
    return "statement_hesitation";
  }
  if (/왜|이유|원인/.test(normalized)) {
    return "reason_why";
  }
  if (/있나요|있을까|있는지|존재/.test(normalized)) {
    return "existence_ending";
  }
  if (/해도\s*될까|해도\s*괜찮|할까요|될까요|인가/.test(normalized)) {
    return "possibility_ending";
  }
  return "other";
}

export function buildPrimaryAxisSkeleton(
  topic: QuestionTopic | "unknown",
  intent: QuestionIntentOrLegacy | "unknown",
  decisionTarget: DecisionTarget | "unknown",
): NovelHoldoutPrimaryAxisSkeleton | "unknown|unknown|unknown" {
  if (
    topic === "unknown"
    || intent === "unknown"
    || decisionTarget === "unknown"
  ) {
    return "unknown|unknown|unknown";
  }

  return `${topic}|${intent}|${decisionTarget}`;
}

export function buildNovelHoldoutStructuralKey(
  question: string,
  primaryAxisSkeleton:
    NovelHoldoutPrimaryAxisSkeleton | "unknown|unknown|unknown" =
      "unknown|unknown|unknown",
): NovelHoldoutStructuralKey {
  return {
    normalized: normalizeNovelHoldoutText(question),
    tokens: tokenizeNovelHoldoutText(question),
    actionLemma: inferNovelHoldoutActionLemma(question),
    objectClass: inferNovelHoldoutObjectClass(question),
    questionForm: inferNovelHoldoutQuestionForm(question),
    primaryAxisSkeleton,
  };
}

export function jaccardTokenOverlap(
  left: readonly string[],
  right: readonly string[],
): number {
  if (left.length === 0 && right.length === 0) {
    return 1;
  }
  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const leftSet = new Set(left);
  const rightSet = new Set(right);
  let intersection = 0;
  for (const token of leftSet) {
    if (rightSet.has(token)) {
      intersection += 1;
    }
  }
  const union = leftSet.size + rightSet.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Soft string distance (normalized Levenshtein ratio in [0,1]).
 * Used only as soft flag — never sole Novel verdict.
 */
export function normalizedLevenshteinSimilarity(
  left: string,
  right: string,
): number {
  if (left === right) {
    return 1;
  }
  if (!left.length || !right.length) {
    return 0;
  }

  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix: number[][] = Array.from(
    { length: rows },
    () => Array.from({ length: cols }, () => 0),
  );

  for (let i = 0; i < rows; i += 1) {
    matrix[i]![0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost,
      );
    }
  }

  const distance = matrix[left.length]![right.length]!;
  const maxLen = Math.max(left.length, right.length);
  return 1 - distance / maxLen;
}

function toKnownFromExpanded(
  expanded: ExpandedQuestionMeaningCase,
): NovelHoldoutKnownQuestion {
  const isCanonical = expanded.variationKind === "canonical";
  const isStrongAnchor = STRONG_ANCHOR_CELL_ID_SET.has(expanded.cellId);

  let source: NovelHoldoutKnownQuestion["source"] = isCanonical
    ? "reference_canonical"
    : "regression_surface";

  if (isStrongAnchor && isCanonical) {
    source = "strong_anchor_subset";
  }

  const primaryAxisSkeleton = expanded.primaryAxis;

  return {
    id: expanded.id,
    question: expanded.question,
    source,
    cellId: expanded.cellId,
    variationKind: expanded.variationKind,
    primaryAxisSkeleton,
    structuralKey: buildNovelHoldoutStructuralKey(
      expanded.question,
      primaryAxisSkeleton,
    ),
  };
}

export type CollectNovelHoldoutKnownPoolOptions = {
  /**
   * Include exhaustive100 surfaces for leakage compare only.
   * Never treats them as Novel Holdout rows.
   * Default: true (unchanged from P11-2).
   */
  includeExhaustive100ForLeakageCompare?: boolean;
  /**
   * Include curated A1–A5 probe question surfaces (opt-in).
   * Leakage compare only — never Blind Gold.
   */
  includeProbeLeakageCompare?: boolean;
  /**
   * Include curated questionReaderVerification question surfaces (opt-in).
   * Leakage compare only — never Blind Gold.
   */
  includeReaderVerificationLeakageCompare?: boolean;
  /**
   * Include P11-4 authored + P11-5 accepted20 question surfaces (opt-in).
   * Question text only — never Blind Gold / never Gold reuse.
   */
  includeP11ExposedLeakageCompare?: boolean;
};

function toKnownFromLeakageSurface(
  surface: NovelHoldoutKnownLeakageSurface,
): NovelHoldoutKnownQuestion {
  const primaryAxisSkeleton =
    surface.axis
    && surface.axis.split("|").length === 3
      ? (surface.axis as NovelHoldoutPrimaryAxisSkeleton)
      : "unknown|unknown|unknown";

  return {
    id: surface.id,
    question: surface.question,
    source: surface.source,
    cellId: null,
    variationKind: surface.family ?? null,
    primaryAxisSkeleton,
    structuralKey: buildNovelHoldoutStructuralKey(
      surface.question,
      primaryAxisSkeleton,
    ),
  };
}

function collectCuratedLeakageSurfaces(
  options: CollectNovelHoldoutKnownPoolOptions,
): readonly NovelHoldoutKnownQuestion[] {
  const includeProbe = options.includeProbeLeakageCompare ?? false;
  const includeReaderVerification =
    options.includeReaderVerificationLeakageCompare ?? false;
  const includeP11Exposed = options.includeP11ExposedLeakageCompare ?? false;

  if (!includeProbe && !includeReaderVerification && !includeP11Exposed) {
    return [];
  }

  const curated = NOVEL_HOLDOUT_KNOWN_LEAKAGE_SURFACES_CURATED.filter(
    (surface) => {
      if (surface.source === "probe_leakage_compare_only") {
        return includeProbe;
      }
      if (surface.source === "reader_verification_leakage_compare_only") {
        return includeReaderVerification;
      }
      if (surface.source === "p11_exposed_leakage_compare_only") {
        return includeP11Exposed;
      }
      return false;
    },
  ).map(toKnownFromLeakageSurface);

  if (!includeP11Exposed) {
    return curated;
  }

  // P11-4 authored candidates: question surface only (no Gold / actual).
  const fromP11_4 = NOVEL_HOLDOUT_BATCH_P11_4_AUTHORED_CANDIDATES.map(
    (candidate) => {
      const source: NovelHoldoutKnownPoolSource =
        "p11_exposed_leakage_compare_only";
      return {
        id: `p11-4-exposed:${candidate.slot.slotId}`,
        question: candidate.question,
        source,
        cellId: null,
        variationKind: candidate.slot.family,
        primaryAxisSkeleton: "unknown|unknown|unknown" as const,
        structuralKey: buildNovelHoldoutStructuralKey(candidate.question),
      };
    },
  );

  return [...curated, ...fromP11_4];
}

/**
 * Safe known pool = Reference canonical ∪ Regression surfaces
 * (+ optional exhaustive100 leakage-compare-only)
 * (+ optional curated probe / reader-verification / P11-exposed leakage corpus).
 *
 * Default options preserve pre-P11-7-1 behavior:
 * meaning + strong-anchor labeling + exhaustive100.
 *
 * New leakage corpora are opt-in and never Blind Gold candidates.
 */
export function collectNovelHoldoutKnownQuestionPool(
  options: CollectNovelHoldoutKnownPoolOptions = {},
): readonly NovelHoldoutKnownQuestion[] {
  const includeExhaustive100 =
    options.includeExhaustive100ForLeakageCompare ?? true;

  const meaningCases = expandAllMeaningCells(QUESTION_MEANING_CELLS);
  const fromMeaning = meaningCases.map(toKnownFromExpanded);

  const fromExhaustive = includeExhaustive100
    ? QUESTION_READER_EXHAUSTIVE_100_FIXTURES.map(
      (fixture) => {
        const primaryAxisSkeleton = buildPrimaryAxisSkeleton(
          fixture.expected.topic,
          fixture.expected.intent,
          fixture.expected.decisionTarget,
        );

        return {
          id: `exhaustive100:${fixture.id}`,
          question: fixture.question,
          source: "exhaustive100_leakage_compare_only" as const,
          cellId: null,
          variationKind: fixture.variationKind,
          primaryAxisSkeleton,
          structuralKey: buildNovelHoldoutStructuralKey(
            fixture.question,
            primaryAxisSkeleton,
          ),
        };
      },
    )
    : [];

  const fromCuratedLeakage = collectCuratedLeakageSurfaces(options);

  return [...fromMeaning, ...fromExhaustive, ...fromCuratedLeakage];
}

export function summarizeNovelHoldoutKnownPool(
  pool: readonly NovelHoldoutKnownQuestion[],
): {
  total: number;
  uniqueNormalized: number;
  bySource: Readonly<Record<string, number>>;
} {
  const bySource: Record<string, number> = {};
  const unique = new Set<string>();

  for (const item of pool) {
    bySource[item.source] = (bySource[item.source] ?? 0) + 1;
    unique.add(item.structuralKey.normalized);
  }

  return {
    total: pool.length,
    uniqueNormalized: unique.size,
    bySource,
  };
}
