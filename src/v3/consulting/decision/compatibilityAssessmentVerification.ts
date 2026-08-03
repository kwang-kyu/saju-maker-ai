import type {
    ConsultingClarificationFact,
  } from "../consultingInput";
  import {
    buildQuestionContext,
  } from "../question/questionContextBuilder";
  import {
    readQuestion,
  } from "../question/questionReader";
  import {
    buildDecisionEngineRegressionInput,
  } from "./regression/decisionEngineRegressionFixture";
  import {
    assessCompatibility,
  } from "./compatibilityAssessment";
  import {
    buildCounterpartSajuCalculation,
  } from "./counterpartSajuCalculationBuilder";

  export type CompatibilityAssessmentVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  const QUESTION =
    "새로 만난 사람과 결혼 궁합이 맞는지 알고 싶습니다.";

  function buildBirthDataFact(
    fields:
      ConsultingClarificationFact["fields"],
  ): ConsultingClarificationFact {
    return {
      key:
        "counterpartBirthData",

      description:
        "사용자가 상대방 정보를 직접 확인했다.",

      fields,
    };
  }

  export function verifyCompatibilityAssessment():
    CompatibilityAssessmentVerificationResult {
        const regressionInput =
        buildDecisionEngineRegressionInput();

      const question =
        readQuestion(
          regressionInput
            .humanContext,
          QUESTION,
        );

    const noDataContext =
      buildQuestionContext(
        question,
        [],
      );

    const noDataAssessment =
      assessCompatibility(
        noDataContext,
      );

    const zodiacFact =
      buildBirthDataFact([
        {
          key:
            "zodiacSign",

          value:
            "horse",

          evidence: [
            "말띠입니다",
          ],
        },
      ]);

    const zodiacContext =
      buildQuestionContext(
        question,
        [
          zodiacFact,
        ],
      );

      const zodiacAssessment =
      assessCompatibility(
        zodiacContext,
        "甲午",
      );

    const formalBirthDataFact =
      buildBirthDataFact([
        {
          key:
            "birthDate",

          value:
            "1967-04-10",

          evidence: [
            "1967년 4월 10일생",
          ],
        },
        {
          key:
            "calendarType",

          value:
            "solar",

          evidence: [
            "양력입니다",
          ],
        },
        {
          key:
            "gender",

          value:
            "male",

          evidence: [
            "남성입니다",
          ],
        },
    ]);

    const counterpartSaju =
      buildCounterpartSajuCalculation({
        birthDate:
          "1967-04-10",

        calendarType:
          "solar",

        gender:
          "male",
      });

      const formalContext =
      buildQuestionContext(
        question,
        [
          formalBirthDataFact,
        ],
      );

      const formalAssessment =
      assessCompatibility(
        formalContext,
        "甲午",
        counterpartSaju,
      );

    const bothContext =
      buildQuestionContext(
        question,
        [
          zodiacFact,
          formalBirthDataFact,
        ],
      );

      const bothAssessment =
      assessCompatibility(
        bothContext,
        "甲午",
        counterpartSaju,
      );

    const checks = {
      fixtureRequiresCompatibilityAnalysis:
        noDataAssessment
          .analysisRequired
        === true,

      noCounterpartDataStillRequiresAdditionalData:
        noDataAssessment
          .additionalCounterpartDataRequired
        === true,

      zodiacFactIsDetected:
        zodiacContext
          .counterpart
          .zodiacProvided
        === true
        && zodiacContext
          .counterpart
          .birthDataProvided
        === false,

      zodiacUsesPartialEvidence:
        zodiacAssessment
          .evidenceLevel
        === "partial",

      zodiacUsesLimitedCompatibilityScope:
        zodiacAssessment
          .analysisScope
        === "zodiacCompatibility",

        zodiacRelationshipIsActuallyCalculated:
  zodiacAssessment
    .zodiacAssessment
    ?.available
  === true
  && zodiacAssessment
    .zodiacAssessment
    .selfBranch
  === "午"
  && zodiacAssessment
    .zodiacAssessment
    .counterpartBranch
  === "午"
  && zodiacAssessment
    .zodiacAssessment
    .relation
  === "same"
  && zodiacAssessment
    .zodiacAssessment
    .level
  === "similar"
  && zodiacAssessment
  .zodiacAssessment
  .level
=== "similar",

zodiacResultKeepsStructuredCalculationScope:
  zodiacAssessment
    .zodiacAssessment
    ?.calculationBasis
  === "yearBranchPair"
  && zodiacAssessment
    .zodiacAssessment
    .analysisScope
  === "zodiacOnly",

        zodiacAllowsLimitedAnalysisWithoutReaskingBirthData:
        zodiacAssessment
          .additionalCounterpartDataRequired
        === false,

        counterpartSajuIsActuallyCalculated:
        formalAssessment
          .counterpartSaju
        === counterpartSaju
        && counterpartSaju
          .calculated
          .yearGanZhi
          .length
        > 0
        && counterpartSaju
          .calculated
          .monthGanZhi
          .length
        > 0
        && counterpartSaju
          .calculated
          .dayGanZhi
          .length
        > 0,

      missingBirthTimeUsesDateOnlyPrecision:
        counterpartSaju
          .precision
        === "dateOnly"
        && counterpartSaju
          .source
          .birthTime
        === null
        && counterpartSaju
          .calculated
          .timeGanZhi
        === null,
        formalBirthDataIsDetected:
        formalContext
          .counterpart
          .birthDataProvided
        === true,

      formalBirthDataUsesSufficientEvidence:
        formalAssessment
          .evidenceLevel
        === "sufficient",

      formalBirthDataUsesFullCompatibilityScope:
        formalAssessment
          .analysisScope
        === "fullCompatibility",

      formalBirthDataDoesNotRequireBirthTime:
        formalAssessment
          .additionalCounterpartDataRequired
        === false,

      formalBirthDataTakesPriorityWhenBothAreProvided:
        bothAssessment
          .analysisScope
        === "fullCompatibility"
        && bothAssessment
          .evidenceLevel
        === "sufficient",
    };

    return {
      checks,

      passed:
        Object
          .values(
            checks,
          )
          .every(
            Boolean,
          ),
    };
  }
