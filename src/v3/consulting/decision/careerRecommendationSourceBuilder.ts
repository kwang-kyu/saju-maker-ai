import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext.js";
import type {
  CareerJudgement,
} from "../../masterReader/types/career.js";

export type CareerRecommendationSource = {
  primaryRoleDirection:
    string | null;

  workStyleDirection:
    string | null;

  lessSuitableDirection:
    string | null;

  hasSpecificRoleEvidence:
    boolean;
};

function normalizeText(
  value:
    string,
): string {
  return value
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function collectLessSuitableDirection(
  judgements:
    readonly CareerJudgement[],
): string | null {
  for (const judgement of judgements) {
    if (
      judgement.level
      !== "limited"
    ) {
      continue;
    }

    const limitation =
      judgement
        .interpretation
        ?.limitationPattern
        ?.trim();

    if (
      limitation
    ) {
      return limitation;
    }
  }

  return null;
}

/**
 * MasterProfile career Reader 결과에서
 * 추천형 결론에 사용할 기존 계산값만 추출한다.
 */
export function buildCareerRecommendationSource(
  humanContext:
    HumanDestinyContext,
): CareerRecommendationSource {
  const career =
    humanContext
      .identity
      .profile
      .career;

  const interpretation =
    career
      .interpretation;

  const primaryRoleDirection =
    interpretation
      ?.primaryRole
      ? normalizeText(
        interpretation
          .primaryRole,
      )
      : null;

  const workStyleDirection =
    interpretation
      ?.workMethod
      ? normalizeText(
        interpretation
          .workMethod,
      )
      : null;

  const lessSuitableDirection =
    collectLessSuitableDirection(
      [
        career.roleOrientation,
        career.workStyle,
        career.expertiseGrowth,
        career.organizationFit,
        career.independenceFit,
        career.leadershipFit,
        career.performanceConversion,
        career.careerContinuity,
      ],
    );

  return {
    primaryRoleDirection,

    workStyleDirection,

    lessSuitableDirection,

    hasSpecificRoleEvidence:
      primaryRoleDirection
      !== null
      && primaryRoleDirection
        .length
      > 0,
  };
}
