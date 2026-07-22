import type {
    QuestionRealityConstraint,
    QuestionRealityContext,
  } from "../question/questionContext";
  import type {
    HumanLifeContext,
  } from "../../types/humanLifeContext";
  import {
    assessLifeContext,
    type AssessmentLevel,
    type LifeContextAssessment,
  } from "./lifeContextAssessment";

  export type DecisionRealityAssessment =
    LifeContextAssessment & {
      questionConstraints:
        QuestionRealityConstraint[];

      questionRealityUsed:
        boolean;
    };

  type RealityAssessmentScores = {
    executionConstraint: number;

    familyResponsibility: number;

    financialPressure: number;

    transitionDifficulty: number;

    expansionRisk: number;
  };

  const LEVEL_PRIORITY: Record<
    AssessmentLevel,
    number
  > = {
    low: 0,
    medium: 1,
    high: 2,
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

  function selectHigherLevel(
    first: AssessmentLevel,
    second: AssessmentLevel,
  ): AssessmentLevel {
    if (
      LEVEL_PRIORITY[first]
      >= LEVEL_PRIORITY[second]
    ) {
      return first;
    }

    return second;
  }

  function buildEmptyScores():
    RealityAssessmentScores {
    return {
      executionConstraint: 0,
      familyResponsibility: 0,
      financialPressure: 0,
      transitionDifficulty: 0,
      expansionRisk: 0,
    };
  }

  function applyRealityConstraint(
    scores:
      RealityAssessmentScores,
    constraint:
      QuestionRealityConstraint,
  ): void {
    switch (constraint.signal) {
      case "debtBurden":
        scores.financialPressure += 2;
        scores.expansionRisk += 2;
        break;

      case "livingCostPressure":
        scores.financialPressure += 2;
        scores.executionConstraint += 1;
        scores.expansionRisk += 1;
        break;

      case "incomeInstability":
        scores.financialPressure += 2;
        scores.transitionDifficulty += 1;
        scores.expansionRisk += 1;
        break;

      case "fixedCostPressure":
        scores.financialPressure += 2;
        scores.expansionRisk += 2;
        break;

      case "lossConcern":
        scores.financialPressure += 1;
        scores.expansionRisk += 1;
        break;

      case "familyResponsibility":
        scores.familyResponsibility += 2;
        scores.executionConstraint += 1;
        scores.transitionDifficulty += 1;
        break;

      case "currentWorkResponsibility":
        scores.executionConstraint += 1;
        scores.transitionDifficulty += 2;
        break;

      case "transitionDifficulty":
        scores.executionConstraint += 1;
        scores.transitionDifficulty += 2;
        break;

      case "timeConstraint":
        scores.executionConstraint += 2;
        scores.transitionDifficulty += 1;
        break;

      case "healthConstraint":
        scores.executionConstraint += 2;
        scores.transitionDifficulty += 1;
        break;

      case "relationshipConstraint":
        scores.familyResponsibility += 1;
        scores.executionConstraint += 1;
        break;
    }
  }

  function assessQuestionReality(
    reality:
      QuestionRealityContext,
  ): LifeContextAssessment {
    const scores =
      buildEmptyScores();

    for (
      const constraint
      of reality.constraints
    ) {
      applyRealityConstraint(
        scores,
        constraint,
      );
    }

    return {
      executionConstraint:
        toLevel(
          scores.executionConstraint,
        ),

      familyResponsibility:
        toLevel(
          scores.familyResponsibility,
        ),

      financialPressure:
        toLevel(
          scores.financialPressure,
        ),

      transitionDifficulty:
        toLevel(
          scores.transitionDifficulty,
        ),

      expansionRisk:
        toLevel(
          scores.expansionRisk,
        ),
    };
  }

  export function assessDecisionReality(
    lifeContext:
      HumanLifeContext,
    questionReality:
      QuestionRealityContext,
  ): DecisionRealityAssessment {
    const lifeAssessment =
      assessLifeContext(
        lifeContext,
      );

    const questionAssessment =
      assessQuestionReality(
        questionReality,
      );

    return {
      executionConstraint:
        selectHigherLevel(
          lifeAssessment
            .executionConstraint,
          questionAssessment
            .executionConstraint,
        ),

      familyResponsibility:
        selectHigherLevel(
          lifeAssessment
            .familyResponsibility,
          questionAssessment
            .familyResponsibility,
        ),

      financialPressure:
        selectHigherLevel(
          lifeAssessment
            .financialPressure,
          questionAssessment
            .financialPressure,
        ),

      transitionDifficulty:
        selectHigherLevel(
          lifeAssessment
            .transitionDifficulty,
          questionAssessment
            .transitionDifficulty,
        ),

      expansionRisk:
        selectHigherLevel(
          lifeAssessment
            .expansionRisk,
          questionAssessment
            .expansionRisk,
        ),

      questionConstraints: [
        ...questionReality.constraints,
      ],

      questionRealityUsed:
        questionReality
          .hasExplicitConstraints,
    };
  }