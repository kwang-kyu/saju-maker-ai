import type { SurvivalStyleScore } from "./survivalStyleScorer";

export type SurvivalStyleSelectionStatus =
  | "clear"
  | "combined"
  | "distributed"
  | "insufficient";

export type SurvivalStyleSelection = {
  primary: SurvivalStyleScore | null;
  secondary: SurvivalStyleScore | null;
  remaining: SurvivalStyleScore[];
  status: SurvivalStyleSelectionStatus;
  scoreGap: number;
};

/**
 * 규칙 가중치 2에 약한 단일 증거 배수 0.5가 적용된
 * 점수 1을 유효한 최소 생존방식 근거로 인정한다.
 *
 * 점수가 0이면 매칭 증거가 전혀 없는 상태이므로
 * 기존처럼 insufficient로 처리한다.
 */
const MINIMUM_PRIMARY_SCORE = 1;
const CLEAR_PRIMARY_GAP = 3;
const DISTRIBUTED_GAP = 1;

export function selectSurvivalStyles(
  scores: SurvivalStyleScore[],
): SurvivalStyleSelection {
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