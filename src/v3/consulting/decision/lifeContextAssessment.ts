import type { HumanLifeContext } from "../../types/humanLifeContext";

export type AssessmentLevel =
  | "low"
  | "medium"
  | "high";

export type LifeContextAssessment = {
  executionConstraint: AssessmentLevel;

  familyResponsibility: AssessmentLevel;

  financialPressure: AssessmentLevel;

  transitionDifficulty: AssessmentLevel;

  expansionRisk: AssessmentLevel;
};

function toLevel(
  score: number,
): AssessmentLevel {
  if (score >= 4) {
    return "high";
  }

  if (score >= 2) {
    return "medium";
  }

  return "low";
}

export function assessLifeContext(
  lifeContext: HumanLifeContext,
): LifeContextAssessment {
  let executionScore = 0;
  let familyScore = 0;
  let financialScore = 0;
  let transitionScore = 0;
  let expansionScore = 0;

  if (lifeContext.hasChildren) {
    executionScore += 1;
    familyScore += 2;
    transitionScore += 1;
  }

  if (lifeContext.maritalStatus === "married") {
    familyScore += 1;
    transitionScore += 1;
  }

  if (lifeContext.financialResponsibility === "high") {
    executionScore += 2;
    financialScore += 2;
    expansionScore += 2;
  }

  if (lifeContext.financialResponsibility === "medium") {
    executionScore += 1;
    financialScore += 1;
    expansionScore += 1;
  }

  if (lifeContext.hasActiveBusiness) {
    expansionScore += 1;
  }

  if (
    lifeContext.occupationStatus === "employed"
  ) {
    transitionScore += 1;
  }

  return {
    executionConstraint: toLevel(
      executionScore,
    ),

    familyResponsibility: toLevel(
      familyScore,
    ),

    financialPressure: toLevel(
      financialScore,
    ),

    transitionDifficulty: toLevel(
      transitionScore,
    ),

    expansionRisk: toLevel(
      expansionScore,
    ),
  };
}