import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture.js";
  
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
  
      careerExists: boolean;
  
      careerSummaryExists: boolean;
  
      careerSummaryIncludedInIdentitySummary:
        boolean;
  
      careerStrengthsIncluded: boolean;
  
      careerRisksIncluded: boolean;
  
      careerEvidenceIncluded: boolean;
  
      relationshipExists: boolean;
  
      relationshipSummaryExists: boolean;
  
      relationshipSummaryIncludedInIdentitySummary:
        boolean;
  
      relationshipStrengthsIncluded:
        boolean;
  
      relationshipRisksIncluded: boolean;
  
      relationshipEvidenceIncluded:
        boolean;
  
      healthExists: boolean;
  
      healthSummaryExists: boolean;
  
      healthSummaryIncludedInIdentitySummary:
        boolean;
  
      healthStrengthsIncluded: boolean;
  
      healthRisksIncluded: boolean;
  
      healthEvidenceIncluded: boolean;
  
      blessingExists: boolean;
  
      blessingSummaryExists: boolean;
  
      blessingSummaryIncludedInIdentitySummary:
        boolean;
  
      blessingStrengthsIncluded: boolean;
  
      blessingRisksIncluded: boolean;
  
      blessingEvidenceIncluded: boolean;

      destinyExists: boolean;

      destinySummaryExists: boolean;

      destinySummaryIncludedInIdentitySummary:
        boolean;

      destinyStrengthsIncluded: boolean;

      destinyRisksIncluded: boolean;

      destinyEvidenceIncluded: boolean;
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
  
    const career =
      explanation.career;
  
    const relationship =
      explanation.relationship;
  
    const health =
      explanation.health;
  
    const blessing =
      explanation.blessing;

    const destiny =
      explanation.destiny;
  
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
  
      careerExists:
        career !== undefined,
  
      careerSummaryExists:
        career.summary.trim().length > 0,
  
      careerSummaryIncludedInIdentitySummary:
        explanation.identitySummary.includes(
          career.summary,
        ),
  
      careerStrengthsIncluded:
        includesEvery(
          explanation.integratedStrengths,
          career.strengths,
        ),
  
      careerRisksIncluded:
        includesEvery(
          explanation.integratedRisks,
          career.risks,
        ),
  
      careerEvidenceIncluded:
        includesEvery(
          explanation.coreEvidence,
          career.evidence,
        ),
  
      relationshipExists:
        relationship !== undefined,
  
      relationshipSummaryExists:
        relationship.summary
          .trim()
          .length > 0,
  
      relationshipSummaryIncludedInIdentitySummary:
        explanation.identitySummary.includes(
          relationship.summary,
        ),
  
      relationshipStrengthsIncluded:
        includesEvery(
          explanation.integratedStrengths,
          relationship.strengths,
        ),
  
      relationshipRisksIncluded:
        includesEvery(
          explanation.integratedRisks,
          relationship.risks,
        ),
  
      relationshipEvidenceIncluded:
        includesEvery(
          explanation.coreEvidence,
          relationship.evidence,
        ),
  
      healthExists:
        health !== undefined,
  
      healthSummaryExists:
        health.summary.trim().length > 0,
  
      healthSummaryIncludedInIdentitySummary:
        explanation.identitySummary.includes(
          health.summary,
        ),
  
      healthStrengthsIncluded:
        includesEvery(
          explanation.integratedStrengths,
          health.strengths,
        ),
  
      healthRisksIncluded:
        includesEvery(
          explanation.integratedRisks,
          health.risks,
        ),
  
      healthEvidenceIncluded:
        includesEvery(
          explanation.coreEvidence,
          health.evidence,
        ),
  
      blessingExists:
        blessing !== undefined,
  
      blessingSummaryExists:
        blessing.summary.trim().length > 0,
  
      blessingSummaryIncludedInIdentitySummary:
        explanation.identitySummary.includes(
          blessing.summary,
        ),
  
      blessingStrengthsIncluded:
        includesEvery(
          explanation.integratedStrengths,
          blessing.strengths,
        ),
  
      blessingRisksIncluded:
        includesEvery(
          explanation.integratedRisks,
          blessing.risks,
        ),
  
      blessingEvidenceIncluded:
        includesEvery(
          explanation.coreEvidence,
          blessing.evidence,
        ),

        destinyExists:
        destiny !== undefined,

      destinySummaryExists:
        destiny.summary.trim().length > 0,

      destinySummaryIncludedInIdentitySummary:
        explanation.identitySummary.includes(
          destiny.summary,
        ),

      destinyStrengthsIncluded:
        includesEvery(
          explanation.integratedStrengths,
          destiny.strengths,
        ),

      destinyRisksIncluded:
        includesEvery(
          explanation.integratedRisks,
          destiny.risks,
        ),

      destinyEvidenceIncluded:
        includesEvery(
          explanation.coreEvidence,
          destiny.evidence,
        ),
    };
  
    return {
      actual,
  
      passed:
        Object.values(actual)
          .every(Boolean),
    };
  }