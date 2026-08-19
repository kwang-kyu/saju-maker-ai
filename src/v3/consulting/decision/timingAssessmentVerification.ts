import type {
    HumanDestinyContext,
  } from "../../types/humanDestinyContext";
  import {
    buildSajuFactsPipeline,
  } from "../../builders/sajuFactsPipelineBuilder";
  import {
    buildQuestionContext,
  } from "../question/questionContextBuilder";
  import {
    readQuestion,
  } from "../question/questionReader";
  import {
    buildTargetPeriodLuckFlowForQuestion,
  } from "./targetPeriodLuckFlowBuilder";
  import {
    assessTiming,
  } from "./timingAssessment";

  const REFERENCE_DATE =
    "2025-08-16";

  export type TimingAssessmentVerificationResult = {
    checks: {
      nonTimingQuestionIsNotRequired:
        boolean;

      requiredTimingWithoutLuckFlowIsMissing:
        boolean;

      requiredTimingWithRealLuckFlowIsAvailable:
        boolean;

      realFlowInterpretationIsAvailable:
        boolean;

      availableTimingEvidenceIsComplete:
        boolean;

      targetDatesArePreserved:
        boolean;

      targetYearIsResolved:
        boolean;

      waitingTimingIsPreserved:
        boolean;

      realTargetSeunIsPresent:
        boolean;

      flowDirectionIsAssessed:
        boolean;

      flowEvidenceIsPreserved:
        boolean;

      missingTimingDoesNotPretendEvidenceExists:
        boolean;
        timingSearchQuestionIsDetected:
        boolean;

      timingSearchWithRealWolunIsAvailable:
        boolean;

      timingSearchBuildsMonthlyCandidates:
        boolean;

      timingSearchKeepsCandidatesInsideTargetPeriod:
        boolean;
    };

    passed:
      boolean;
  };

  function buildPipeline() {
    return buildSajuFactsPipeline({
      name:
        "타이밍검증",

      birthDate:
        "1990-05-15",

      birthTime:
        "14:30",

      gender:
        "male",

      calendarType:
        "solar",

      referenceDate:
        REFERENCE_DATE,

      luckStartMethod:
        "minuteBased",
    });
  }

  export function verifyTimingAssessment(
    humanContext:
      HumanDestinyContext,
  ): TimingAssessmentVerificationResult {
    const pipeline =
      buildPipeline();

    /*
     * 1. 시기 분석이 필요 없는 일반 질문
     */
    const nonTimingQuestion =
      readQuestion(
        humanContext,
        "통닭집을 개업해도 될까요?",
      );

    const nonTimingQuestionContext =
      buildQuestionContext(
        nonTimingQuestion,
      );

    const nonTimingAssessment =
      assessTiming({
        questionContext:
          nonTimingQuestionContext,

        humanContext,

        selfSajuFacts:
          pipeline.facts,
      });

    /*
     * 2. 기다림 시기 질문.
     *
     * 의도적으로 대상기간 운 자료를 넣지 않아
     * missing 경로를 검증한다.
     */
    const waitingQuestion =
      readQuestion(
        humanContext,
        "조금 더 기다렸다가 사업을 시작하는 게 좋을까요?",
      );

    const waitingQuestionContext =
      buildQuestionContext(
        waitingQuestion,
      );

    const missingTimingAssessment =
      assessTiming({
        questionContext:
          waitingQuestionContext,

        humanContext,

        selfSajuFacts:
          pipeline.facts,
      });

    /*
     * 3. 실제 기간이 명확한 Timing 질문.
     *
     * REFERENCE_DATE가 2025-08-16이므로
     * "내년"은 2026년으로 해석된다.
     *
     * 실제 SajuFactsPipeline을 이용하여
     * 대상기간의 대운·세운·연운 Fact를 만든다.
     */
    const availableTimingQuestion =
      readQuestion(
        humanContext,
        "내년에 사업을 시작해도 될까요?",
      );

    const availableTimingQuestionContext =
      buildQuestionContext(
        availableTimingQuestion,
      );

      const targetBuild =
      buildTargetPeriodLuckFlowForQuestion({
        sajuFacts:
          pipeline,

        normalizedQuestion:
          availableTimingQuestion
            .normalizedQuestion,

        purpose:
          "decisionTiming",
      });

    const availableTimingAssessment =
      assessTiming({
        questionContext:
          availableTimingQuestionContext,

        humanContext,

        selfSajuFacts:
          pipeline.facts,

        lifeFlowTarget:
          targetBuild?.target,

        targetPeriodLuckFlow:
          targetBuild?.fact
          ?? undefined,
      });

          /*
     * 4. 기간 안에서 가장 유리한 시기를 찾는 질문.
     *
     * REFERENCE_DATE가 2025-08-16이므로
     * "올해 안"은 2025년 남은 기간을 의미한다.
     *
     * 단순 timing 판정이 아니라 실제 월운 후보를 비교하여
     * 추천/주의 시기를 찾는 timingSearch 경로를 검증한다.
     */
    const timingSearchQuestion =
    readQuestion(
      humanContext,
      "올해 안에는 언제쯤 사업을 시작하는 것이 좋을까요?",
    );

  const timingSearchQuestionContext =
    buildQuestionContext(
      timingSearchQuestion,
    );

  const timingSearchTargetBuild =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipeline,

      normalizedQuestion:
        timingSearchQuestion
          .normalizedQuestion,

      purpose:
        "decisionTiming",
        timingSearchRequired:
        timingSearchQuestionContext
          .requirements
          .timingSearchRequired,
    });

  const timingSearchAssessment =
    assessTiming({
      questionContext:
        timingSearchQuestionContext,

      humanContext,

      selfSajuFacts:
        pipeline.facts,

      lifeFlowTarget:
        timingSearchTargetBuild
          ?.target,

      targetPeriodLuckFlow:
        timingSearchTargetBuild
          ?.fact
        ?? undefined,
    });

    const checks = {
      nonTimingQuestionIsNotRequired:
        nonTimingAssessment.analysisRequired
          === false
        && nonTimingAssessment.evidenceLevel
          === "notRequired"
        && nonTimingAssessment.assessmentScope
          === "none"
        && nonTimingAssessment.flowDirection
          === "notAssessed",

      requiredTimingWithoutLuckFlowIsMissing:
        missingTimingAssessment.analysisRequired
          === true
        && missingTimingAssessment.evidenceLevel
          === "missing"
        && missingTimingAssessment.assessmentScope
          === "timingEvaluation"
        && missingTimingAssessment
          .flowInterpretationAvailable
          === false,

      requiredTimingWithRealLuckFlowIsAvailable:
        availableTimingAssessment.analysisRequired
          === true
        && availableTimingAssessment.evidenceLevel
          === "available"
        && availableTimingAssessment.assessmentScope
          === "timingEvaluation",

      realFlowInterpretationIsAvailable:
        availableTimingAssessment
          .flowInterpretationAvailable
          === true
        && availableTimingAssessment
          .overallTheme
          !== null
        && availableTimingAssessment
          .overallTheme
          .length
          > 0,

      availableTimingEvidenceIsComplete:
        availableTimingAssessment
          .evidenceComplete
          === true,

      targetDatesArePreserved:
        targetBuild
          !== null
        && targetBuild
          !== undefined
        && availableTimingAssessment
          .targetStartDate
          === targetBuild.target.startDate
        && availableTimingAssessment
          .targetEndDate
          === targetBuild.target.endDate,

      targetYearIsResolved:
        targetBuild
          !== null
        && targetBuild
          !== undefined
        && targetBuild.target.targetYear
          === 2026
        && availableTimingAssessment
          .targetYear
          === 2026,

      waitingTimingIsPreserved:
        waitingQuestion.timingType
          === "waitingTiming"
        && missingTimingAssessment.timingType
          === "waitingTiming",

          realTargetSeunIsPresent:
          targetBuild
            !== null
          && targetBuild
            !== undefined
          && targetBuild.fact
            !== null
          && targetBuild.fact.targetSeun
            .ganZhi.length
            > 0
          && availableTimingAssessment
            .hasTargetSeun
            === true,

            flowDirectionIsAssessed:
            (
              availableTimingAssessment
                .flowDirection
              === "supportive"
              || availableTimingAssessment
                .flowDirection
              === "tension"
              || availableTimingAssessment
                .flowDirection
              === "mixed"
              || availableTimingAssessment
                .flowDirection
              === "indeterminate"
            ),

      flowEvidenceIsPreserved:
        availableTimingAssessment
          .evidenceKeys
          .length
          > 0
        && (
          availableTimingAssessment
            .evidenceKeys
            .includes("seun")
          || availableTimingAssessment
            .evidenceKeys
            .some(
              (key) =>
                key.startsWith("year-"),
            )
        ),

      missingTimingDoesNotPretendEvidenceExists:
        missingTimingAssessment
          .evidenceComplete
          === false
        && missingTimingAssessment
          .hasCurrentDaeun
          === false
        && missingTimingAssessment
          .hasTargetSeun
          === false
        && missingTimingAssessment
          .hasYearSegments
          === false
        && missingTimingAssessment
          .hasWolun
          === false
        && missingTimingAssessment
          .hasIlun
          === false
        && missingTimingAssessment
          .supportiveSignals
          .length
          === 0
        && missingTimingAssessment
          .tensionSignals
          .length
          === 0,
          timingSearchQuestionIsDetected:
          timingSearchQuestionContext
            .requirements
            .timingSearchRequired
            === true,

        timingSearchWithRealWolunIsAvailable:
          timingSearchAssessment
            .timingSearch
            .required
            === true
          && timingSearchAssessment
            .timingSearch
            .available
            === true,

        timingSearchBuildsMonthlyCandidates:
          timingSearchAssessment
            .timingSearch
            .candidateWindows
            .length
            > 0,

        timingSearchKeepsCandidatesInsideTargetPeriod:
          timingSearchAssessment
            .timingSearch
            .candidateWindows
            .every(
              (window) =>
                timingSearchTargetBuild
                  !== null
                && timingSearchTargetBuild
                  !== undefined
                && window.startDate
                  >= timingSearchTargetBuild
                    .target
                    .startDate
                && window.endDate
                  <= timingSearchTargetBuild
                    .target
                    .endDate,
            ),
    };

    return {
      checks,

      passed:
        Object.values(
          checks,
        ).every(Boolean),
    };
  }
