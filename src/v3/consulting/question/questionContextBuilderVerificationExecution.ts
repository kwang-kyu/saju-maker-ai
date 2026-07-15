import {
    buildMasterHumanSummary,
  } from "../../masterReader/readers/masterHumanSummaryBuilder";
  import {
    buildMasterProfileExplanation,
  } from "../../masterReader/readers/masterProfileExplanationBuilder";
  import type {
    MasterProfile,
  } from "../../masterReader/types/masterProfile";
  import type {
    HumanDestinyContext,
  } from "../../types/humanDestinyContext";
  import {
    verifyQuestionContextBuilder,
  } from "./questionContextBuilderVerification";
  
  function buildVerificationHumanContext():
    HumanDestinyContext {
    const profile: MasterProfile = {
      lifeDriver: {
        primary: {
          driver: "achievement",
          interpretation: null,
          evidence: [],
          counterEvidence: [],
          confidence: "high",
          exceptionConditions: [],
        },
        secondary: null,
        suppressed: [],
        conflicting: [],
      },
  
      survivalStyle: {
        primary: {
          style: "push",
          evidence: [],
          counterEvidence: [],
          confidence: "high",
          exceptionConditions: [],
        },
        secondary: null,
        crisisBehavior: [],
        recoveryMethods: [],
        prohibitedActions: [],
        suppressed: [],
        conflicting: [],
      },
  
      repeatedPattern: {
        primary: {
          pattern: "slowGrowthStable",
          evidence: [],
          counterEvidence: [],
          confidence: "high",
          exceptionConditions: [],
        },
        secondary: null,
        repeatedBehaviors: [],
        strengths: [],
        risks: [],
        suppressed: [],
        conflicting: [],
      },
    };
  
    const explanation =
      buildMasterProfileExplanation(
        profile,
      );
  
    const humanSummary =
      buildMasterHumanSummary({
        profile,
        explanation,
      });
  
    return {
      identity: {
        profile,
        explanation,
        humanSummary,
      },
  
      currentPhase: {
        phase: "growth",
        title: "성장 국면",
        description:
          "새로운 가능성을 실행으로 연결하는 국면이다.",
        focusAreas: [],
        avoidAreas: [],
      },
    };
  }
  
  const results =
    verifyQuestionContextBuilder(
      buildVerificationHumanContext(),
    );
  
  console.log(
    JSON.stringify(
      results,
      null,
      2,
    ),
  );
  
  if (
    results.some(
      (result) =>
        !result.passed,
    )
  ) {
    process.exitCode = 1;
  }