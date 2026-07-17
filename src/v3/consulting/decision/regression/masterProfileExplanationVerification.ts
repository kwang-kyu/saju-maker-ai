import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture";
  
  export type MasterProfileExplanationVerificationResult = {
    actual: {
      capacityExists: boolean;
  
      capacitySummaryExists: boolean;
  
      capacitySummaryIncludedInIdentitySummary:
        boolean;
  
      capacityStrengthsIncluded:
        boolean;
  
      capacityRisksIncluded:
        boolean;
  
      capacityEvidenceIncluded:
        boolean;
    };
  
    passed: boolean;
  };
  
  function includesEvery(
    source: string[],
    expected: string[],
  ): boolean {
    return expected.every(
      (value) =>
        source.includes(value),
    );
  }
  
  export function verifyMasterProfileExplanation():
    MasterProfileExplanationVerificationResult {
    const input =
      buildDecisionEngineRegressionInput();
  
    const explanation =
      input.humanContext.identity.explanation;
  
    const capacity =
      explanation.capacity;
  
    const actual = {
      capacityExists:
        capacity !== undefined,
  
      capacitySummaryExists:
        capacity.summary.trim().length > 0,
  
      capacitySummaryIncludedInIdentitySummary:
        explanation.identitySummary.includes(
          capacity.summary,
        ),
  
      capacityStrengthsIncluded:
        includesEvery(
          explanation.integratedStrengths,
          capacity.strengths,
        ),
  
      capacityRisksIncluded:
        includesEvery(
          explanation.integratedRisks,
          capacity.risks,
        ),
  
      capacityEvidenceIncluded:
        includesEvery(
          explanation.coreEvidence,
          capacity.evidence,
        ),
    };
  
    return {
      actual,
  
      passed:
        Object.values(actual).every(Boolean),
    };
  }