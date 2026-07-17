import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture";
  
  export type MasterProfileExplanationVerificationResult = {
    actual: {
      capacityExists: boolean;
  
      capacitySummaryExists: boolean;
  
      capacitySummaryIncludedInIdentitySummary:
        boolean;
  
      capacityStrengthsIncluded: boolean;
  
      capacityRisksIncluded: boolean;
  
      capacityEvidenceIncluded: boolean;
  
      moneyExists: boolean;
  
      moneySummaryExists: boolean;
  
      moneySummaryIncludedInIdentitySummary:
        boolean;
  
      moneyStrengthsIncluded: boolean;
  
      moneyRisksIncluded: boolean;
  
      moneyEvidenceIncluded: boolean;
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
  
    const money =
      explanation.money;
  
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
  
      moneyExists:
        money !== undefined,
  
      moneySummaryExists:
        money.summary.trim().length > 0,
  
      moneySummaryIncludedInIdentitySummary:
        explanation.identitySummary.includes(
          money.summary,
        ),
  
      moneyStrengthsIncluded:
        includesEvery(
          explanation.integratedStrengths,
          money.strengths,
        ),
  
      moneyRisksIncluded:
        includesEvery(
          explanation.integratedRisks,
          money.risks,
        ),
  
      moneyEvidenceIncluded:
        includesEvery(
          explanation.coreEvidence,
          money.evidence,
        ),
    };
  
    return {
      actual,
  
      passed:
        Object.values(actual).every(Boolean),
    };
  }