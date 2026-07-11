import type { RepeatedPatternScore } from "./repeatedPatternScorer";

export type RepeatedPatternSelectionStatus =
  | "clear"
  | "combined"
  | "distributed"
  | "insufficient";

export type RepeatedPatternSelection = {
  primary: RepeatedPatternScore | null;
  secondary: RepeatedPatternScore | null;
  remaining: RepeatedPatternScore[];
  status: RepeatedPatternSelectionStatus;
  scoreGap: number;
};

const MINIMUM_PRIMARY_SCORE = 3;
const CLEAR_PRIMARY_GAP = 3;
const DISTRIBUTED_GAP = 1;

export function selectRepeatedPatterns(
  scores: RepeatedPatternScore[],
): RepeatedPatternSelection {
  const ranked = [...scores].sort((a, b) => b.score - a.score);

  const primary = ranked[0] ?? null;
  const secondary = ranked[1] ?? null;
  const remaining = ranked.slice(2);

  if (!primary || primary.score < MINIMUM_PRIMARY_SCORE) {
    return {
      primary: null,
      secondary: null,
      remaining: ranked,
      status: "insufficient",
      scoreGap: 0,
    };
  }

  if (!secondary || secondary.score <= 0) {
    return {
      primary,
      secondary: null,
      remaining,
      status: "clear",
      scoreGap: primary.score,
    };
  }

  const scoreGap = primary.score - secondary.score;

  if (scoreGap >= CLEAR_PRIMARY_GAP) {
    return {
      primary,
      secondary,
      remaining,
      status: "clear",
      scoreGap,
    };
  }

  const third = ranked[2];

  if (
    third &&
    third.score > 0 &&
    secondary.score - third.score <= DISTRIBUTED_GAP
  ) {
    return {
      primary,
      secondary,
      remaining,
      status: "distributed",
      scoreGap,
    };
  }

  return {
    primary,
    secondary,
    remaining,
    status: "combined",
    scoreGap,
  };
}