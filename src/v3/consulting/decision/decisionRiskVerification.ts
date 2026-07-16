import type {
    DecisionEngineInput,
    DecisionRisk,
  } from "./decisionTypes";
  import type { LifeContextAssessment } from "./lifeContextAssessment";
  import type { CompatibilityAssessment } from "./compatibilityAssessment";
  import { buildDecisionRisks } from "./riskBuilder";
  
  export type LifeContextRiskVerificationResult = {
    lowRisks: DecisionRisk[];
    financialPressureRisks: DecisionRisk[];
    familyResponsibilityRisks: DecisionRisk[];
    transitionDifficultyRisks: DecisionRisk[];
    expansionRiskRisks: DecisionRisk[];
    executionConstraintRisks: DecisionRisk[];
  
    lowHasNoLifeContextRisk: boolean;
  
    financialPressureDetected: boolean;
    familyResponsibilityDetected: boolean;
    transitionDifficultyDetected: boolean;
    expansionRiskDetected: boolean;
    executionConstraintDetected: boolean;
  
    passed: boolean;
  };
  
  /**
   * Risk Builder Life Context 민감도 검증
   *
   * 동일한 DecisionEngineInput, Alignment, Urgency와
   * CompatibilityAssessment를 유지하고
   * LifeContextAssessment만 변경한다.
   *
   * low 상태에서는 Life Context 전용 위험이 없어야 하며,
   * 각 high 상태에서는 대응하는 고유 위험이
   * high severity와 lifeContext source로 생성되어야 한다.
   */
  export function verifyLifeContextRiskSensitivity(
    decisionInput: DecisionEngineInput,
  ): LifeContextRiskVerificationResult {
    const neutralCompatibilityAssessment: CompatibilityAssessment = {
      analysisRequired: false,
      counterpartExists: false,
      counterpartRelation: "unknown",
      identityProvided: false,
      birthDataProvided: false,
      evidenceLevel: "notRequired",
      analysisScope: "none",
      counterpartReadingRequired: false,
      additionalCounterpartDataRequired: false,
    };
  
    const buildRisks = (
      lifeAssessment: LifeContextAssessment,
    ): DecisionRisk[] => {
      return buildDecisionRisks({
        decisionInput,
        alignment: "aligned",
        urgency: "unknown",
        lifeAssessment,
        compatibilityAssessment:
          neutralCompatibilityAssessment,
      });
    };
  
    const lowAssessment: LifeContextAssessment = {
      executionConstraint: "low",
      familyResponsibility: "low",
      financialPressure: "low",
      transitionDifficulty: "low",
      expansionRisk: "low",
    };
  
    const financialPressureAssessment: LifeContextAssessment = {
      ...lowAssessment,
      financialPressure: "high",
    };
  
    const familyResponsibilityAssessment: LifeContextAssessment = {
      ...lowAssessment,
      familyResponsibility: "high",
    };
  
    const transitionDifficultyAssessment: LifeContextAssessment = {
      ...lowAssessment,
      transitionDifficulty: "high",
    };
  
    const expansionRiskAssessment: LifeContextAssessment = {
      ...lowAssessment,
      expansionRisk: "high",
    };
  
    const executionConstraintAssessment: LifeContextAssessment = {
      ...lowAssessment,
      executionConstraint: "high",
    };
  
    const lowRisks =
      buildRisks(lowAssessment);
  
    const financialPressureRisks =
      buildRisks(financialPressureAssessment);
  
    const familyResponsibilityRisks =
      buildRisks(familyResponsibilityAssessment);
  
    const transitionDifficultyRisks =
      buildRisks(transitionDifficultyAssessment);
  
    const expansionRiskRisks =
      buildRisks(expansionRiskAssessment);
  
    const executionConstraintRisks =
      buildRisks(executionConstraintAssessment);
  
    const lifeContextRiskKeys = new Set<string>([
      "lifeContextFinancialPressure",
      "lifeContextFamilyResponsibility",
      "lifeContextTransitionDifficulty",
      "lifeContextExpansionRisk",
      "lifeContextExecutionConstraint",
    ]);
  
    const lowHasNoLifeContextRisk =
      !lowRisks.some((risk) =>
        lifeContextRiskKeys.has(risk.key),
      );
  
    const hasExpectedLifeContextRisk = (
      risks: DecisionRisk[],
      key: string,
    ): boolean => {
      return risks.some(
        (risk) =>
          risk.key === key &&
          risk.severity === "high" &&
          risk.source === "lifeContext",
      );
    };
  
    const financialPressureDetected =
      hasExpectedLifeContextRisk(
        financialPressureRisks,
        "lifeContextFinancialPressure",
      );
  
    const familyResponsibilityDetected =
      hasExpectedLifeContextRisk(
        familyResponsibilityRisks,
        "lifeContextFamilyResponsibility",
      );
  
    const transitionDifficultyDetected =
      hasExpectedLifeContextRisk(
        transitionDifficultyRisks,
        "lifeContextTransitionDifficulty",
      );
  
    const expansionRiskDetected =
      hasExpectedLifeContextRisk(
        expansionRiskRisks,
        "lifeContextExpansionRisk",
      );
  
    const executionConstraintDetected =
      hasExpectedLifeContextRisk(
        executionConstraintRisks,
        "lifeContextExecutionConstraint",
      );
  
    const passed =
      lowHasNoLifeContextRisk &&
      financialPressureDetected &&
      familyResponsibilityDetected &&
      transitionDifficultyDetected &&
      expansionRiskDetected &&
      executionConstraintDetected;
  
    return {
      lowRisks,
      financialPressureRisks,
      familyResponsibilityRisks,
      transitionDifficultyRisks,
      expansionRiskRisks,
      executionConstraintRisks,
  
      lowHasNoLifeContextRisk,
  
      financialPressureDetected,
      familyResponsibilityDetected,
      transitionDifficultyDetected,
      expansionRiskDetected,
      executionConstraintDetected,
  
      passed,
    };
  }