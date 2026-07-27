import type {
  LifeDriverScore,
} from "./lifeDriverScorer";

export type LifeDriverSelectionStatus =
  | "clear"
  | "combined"
  | "distributed"
  | "insufficient";

export type LifeDriverSelection = {
  primary:
    LifeDriverScore | null;

  secondary:
    LifeDriverScore | null;

  remaining:
    LifeDriverScore[];

  status:
    LifeDriverSelectionStatus;

  scoreGap:
    number;
};

/**
 * 핵심 구조 규칙의 기본 가중치 3에
 * medium 강도(1.0)와 low 신뢰도(0.75)가 적용된
 * 2.25를 유효한 최소 선택 점수로 인정한다.
 *
 * weak 강도와 low 신뢰도만 가진 단일 근거는
 * 1.125이므로 선택되지 않는다.
 */
const MINIMUM_PRIMARY_SCORE =
  2.25;

const CLEAR_PRIMARY_GAP =
  3;

const DISTRIBUTED_GAP =
  1;

export function selectLifeDrivers(
  scores:
    LifeDriverScore[],
): LifeDriverSelection {
  const ranked =
    [...scores].sort(
      (a, b) =>
        b.score - a.score,
    );

  const primary =
    ranked[0] ?? null;

  const secondary =
    ranked[1] ?? null;

  const remaining =
    ranked.slice(2);

  if (
    !primary
    || primary.score
      < MINIMUM_PRIMARY_SCORE
  ) {
    return {
      primary: null,

      secondary: null,

      remaining:
        ranked,

      status:
        "insufficient",

      scoreGap: 0,
    };
  }

  if (
    !secondary
    || secondary.score <= 0
  ) {
    return {
      primary,

      secondary: null,

      remaining,

      status:
        "clear",

      scoreGap:
        primary.score,
    };
  }

  const scoreGap =
    primary.score
    - secondary.score;

  if (
    scoreGap
      >= CLEAR_PRIMARY_GAP
  ) {
    return {
      primary,

      secondary,

      remaining,

      status:
        "clear",

      scoreGap,
    };
  }

  const third =
    ranked[2];

  if (
    third
    && third.score > 0
    && secondary.score
      - third.score
      <= DISTRIBUTED_GAP
  ) {
    return {
      primary,

      secondary,

      remaining,

      status:
        "distributed",

      scoreGap,
    };
  }

  return {
    primary,

    secondary,

    remaining,

    status:
      "combined",

    scoreGap,
  };
}