import type {
    ReaderDecisionAssessment,
    ReaderDecisionConstraintLevel,
    ReaderDecisionSupportLevel,
  } from "./readerDecisionAssessment";
  import {
    applyReaderDecisionVerdictEffect,
  } from "./readerDecisionVerdictBuilder";
  import type {
    DecisionEngineInput,
    DecisionVerdict,
  } from "./decisionTypes";
  
  export type ReaderDecisionVerdictVerificationResult = {
    cases: Array<{
      name: string;
  
      inputVerdict:
        DecisionVerdict;
  
      constraintLevel:
        ReaderDecisionConstraintLevel;
  
      supportLevel:
        ReaderDecisionSupportLevel;
  
      urgency:
        DecisionEngineInput["question"]["urgency"];
  
      expectedVerdict:
        DecisionVerdict;
  
      actualVerdict:
        DecisionVerdict;
  
      checks: Record<
        string,
        boolean
      >;
  
      passed: boolean;
    }>;
  
    passed: boolean;
  };
  
  function buildAssessment(
    constraintLevel:
      ReaderDecisionConstraintLevel,
    supportLevel:
      ReaderDecisionSupportLevel,
  ): ReaderDecisionAssessment {
    return {
      items: [],
  
      relevantJudgementCount: 0,
  
      assessedJudgementCount: 0,
  
      insufficientJudgementCount: 0,
  
      strongCount: 0,
  
      limitedCount: 0,
  
      conflictedCount: 0,
  
      highConfidenceStrongCount: 0,
  
      highConfidenceLimitedCount: 0,
  
      highConfidenceConflictCount: 0,
  
      constraintLevel,
  
      supportLevel,
  
      limitations: [],
    };
  }
  
  function buildCase(
    name: string,
    inputVerdict:
      DecisionVerdict,
    constraintLevel:
      ReaderDecisionConstraintLevel,
    supportLevel:
      ReaderDecisionSupportLevel,
    urgency:
      DecisionEngineInput["question"]["urgency"],
    expectedVerdict:
      DecisionVerdict,
  ): ReaderDecisionVerdictVerificationResult["cases"][number] {
    const assessment =
      buildAssessment(
        constraintLevel,
        supportLevel,
      );
  
    const actualVerdict =
      applyReaderDecisionVerdictEffect({
        verdict:
          inputVerdict,
  
        assessment,
  
        urgency,
      });
  
    const checks = {
      verdictMatches:
        actualVerdict
        === expectedVerdict,
    };
  
    return {
      name,
  
      inputVerdict,
  
      constraintLevel,
  
      supportLevel,
  
      urgency,
  
      expectedVerdict,
  
      actualVerdict,
  
      checks,
  
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
  
  function verifyNotRecommendedPreserved():
    ReaderDecisionVerdictVerificationResult["cases"][number] {
    return buildCase(
      "not-recommended-is-preserved",
  
      "notRecommended",
  
      "high",
  
      "none",
  
      "immediate",
  
      "notRecommended",
    );
  }
  
  function verifyWaitPreserved():
    ReaderDecisionVerdictVerificationResult["cases"][number] {
    return buildCase(
      "wait-is-preserved",
  
      "wait",
  
      "high",
  
      "none",
  
      "nearTerm",
  
      "wait",
    );
  }
  
  function verifyHighImmediateConstraint():
    ReaderDecisionVerdictVerificationResult["cases"][number] {
    return buildCase(
      "high-immediate-constraint-produces-wait",
  
      "recommended",
  
      "high",
  
      "none",
  
      "immediate",
  
      "wait",
    );
  }
  
  function verifyHighNonImmediateConstraint():
    ReaderDecisionVerdictVerificationResult["cases"][number] {
    return buildCase(
      "high-non-immediate-constraint-is-conditional",
  
      "recommended",
  
      "high",
  
      "none",
  
      "nearTerm",
  
      "conditionallyRecommended",
    );
  }
  
  function verifyModerateConstraint():
    ReaderDecisionVerdictVerificationResult["cases"][number] {
    return buildCase(
      "moderate-constraint-is-conditional",
  
      "recommended",
  
      "moderate",
  
      "none",
  
      "longTerm",
  
      "conditionallyRecommended",
    );
  }
  
  function verifyInsufficientConstraint():
    ReaderDecisionVerdictVerificationResult["cases"][number] {
    return buildCase(
      "insufficient-assessment-is-conditional",
  
      "recommended",
  
      "insufficient",
  
      "insufficient",
  
      "unknown",
  
      "conditionallyRecommended",
    );
  }
  
  function verifyNoConstraint():
    ReaderDecisionVerdictVerificationResult["cases"][number] {
    return buildCase(
      "no-constraint-preserves-recommendation",
  
      "recommended",
  
      "none",
  
      "none",
  
      "nearTerm",
  
      "recommended",
    );
  }
  
  function verifySupportDoesNotUpgradeVerdict():
    ReaderDecisionVerdictVerificationResult["cases"][number] {
    return buildCase(
      "strong-support-does-not-upgrade-verdict",
  
      "conditionallyRecommended",
  
      "none",
  
      "strong",
  
      "nearTerm",
  
      "conditionallyRecommended",
    );
  }
  
  export function verifyReaderDecisionVerdict():
    ReaderDecisionVerdictVerificationResult {
    const cases = [
      verifyNotRecommendedPreserved(),
  
      verifyWaitPreserved(),
  
      verifyHighImmediateConstraint(),
  
      verifyHighNonImmediateConstraint(),
  
      verifyModerateConstraint(),
  
      verifyInsufficientConstraint(),
  
      verifyNoConstraint(),
  
      verifySupportDoesNotUpgradeVerdict(),
    ];
  
    return {
      cases,
  
      passed:
        cases.every(
          (verificationCase) =>
            verificationCase.passed,
        ),
    };
  }