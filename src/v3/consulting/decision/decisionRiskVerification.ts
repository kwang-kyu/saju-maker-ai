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
  export type CompatibilityRiskVerificationResult = {
    notRequiredRisks: DecisionRisk[];
    counterpartMissingRisks: DecisionRisk[];
    counterpartPresentRisks: DecisionRisk[];
  
    notRequiredHasNoCompatibilityRisk: boolean;
    counterpartMissingDetected: boolean;
    counterpartPresentHasNoCompatibilityRisk: boolean;
  
    passed: boolean;
  };
  
  /**
   * Risk Builder Compatibility 민감도 검증
   *
   * 동일한 DecisionEngineInput, Alignment, Urgency와
   * LifeContextAssessment를 유지하고
   * CompatibilityAssessment만 변경한다.
   *
   * 궁합 분석이 필요하지 않은 경우와
   * 상대방이 확인된 경우에는 Compatibility 전용 위험이 없어야 한다.
   *
   * 궁합 분석이 필요하지만 상대방이 확인되지 않은 경우에는
   * compatibilityCounterpartMissing 위험이
   * high severity와 questionIntent source로 생성되어야 한다.
   */
  export function verifyCompatibilityRiskSensitivity(
    decisionInput: DecisionEngineInput,
  ): CompatibilityRiskVerificationResult {
    const neutralLifeAssessment: LifeContextAssessment = {
      executionConstraint: "low",
      familyResponsibility: "low",
      financialPressure: "low",
      transitionDifficulty: "low",
      expansionRisk: "low",
    };
  
    const buildRisks = (
      compatibilityAssessment: CompatibilityAssessment,
    ): DecisionRisk[] => {
      return buildDecisionRisks({
        decisionInput,
        alignment: "aligned",
        urgency: "unknown",
        lifeAssessment: neutralLifeAssessment,
        compatibilityAssessment,
      });
    };
  
    const notRequiredAssessment: CompatibilityAssessment = {
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
  
    const counterpartMissingAssessment: CompatibilityAssessment = {
      analysisRequired: true,
      counterpartExists: false,
      counterpartRelation: "unknown",
      identityProvided: false,
      birthDataProvided: false,
      evidenceLevel: "insufficient",
      analysisScope: "relationshipContext",
      counterpartReadingRequired: true,
      additionalCounterpartDataRequired: true,
    };
  
    const counterpartPresentAssessment: CompatibilityAssessment = {
      analysisRequired: true,
      counterpartExists: true,
      counterpartRelation: "businessPartner",
      identityProvided: true,
      birthDataProvided: true,
      evidenceLevel: "sufficient",
      analysisScope: "fullCompatibility",
      counterpartReadingRequired: true,
      additionalCounterpartDataRequired: false,
    };
  
    const notRequiredRisks =
      buildRisks(notRequiredAssessment);
  
    const counterpartMissingRisks =
      buildRisks(counterpartMissingAssessment);
  
    const counterpartPresentRisks =
      buildRisks(counterpartPresentAssessment);
  
    const compatibilityRiskKey =
      "compatibilityCounterpartMissing";
  
    const notRequiredHasNoCompatibilityRisk =
      !notRequiredRisks.some(
        (risk) => risk.key === compatibilityRiskKey,
      );
  
    const counterpartMissingDetected =
      counterpartMissingRisks.some(
        (risk) =>
          risk.key === compatibilityRiskKey &&
          risk.severity === "high" &&
          risk.source === "questionIntent",
      );
  
    const counterpartPresentHasNoCompatibilityRisk =
      !counterpartPresentRisks.some(
        (risk) => risk.key === compatibilityRiskKey,
      );
  
    const passed =
      notRequiredHasNoCompatibilityRisk &&
      counterpartMissingDetected &&
      counterpartPresentHasNoCompatibilityRisk;
  
    return {
      notRequiredRisks,
      counterpartMissingRisks,
      counterpartPresentRisks,
  
      notRequiredHasNoCompatibilityRisk,
      counterpartMissingDetected,
      counterpartPresentHasNoCompatibilityRisk,
  
      passed,
    };
  }

  export type ContextAlignmentRiskVerificationResult = {
    alignedRisks: DecisionRisk[];
    conflictedRisks: DecisionRisk[];
    stronglyConflictedRisks: DecisionRisk[];
  
    alignedHasNoPhaseConflictRisk: boolean;
    conflictedDetected: boolean;
    stronglyConflictedDetected: boolean;
  
    passed: boolean;
  };
  
  /**
   * Risk Builder Context Alignment 민감도 검증
   *
   * 동일한 DecisionEngineInput, Urgency,
   * LifeContextAssessment, CompatibilityAssessment를 유지하고
   * Context Alignment만 변경한다.
   *
   * aligned 상태에서는 phaseConflict 위험이 없어야 하며,
   * conflicted 상태에서는 medium severity,
   * stronglyConflicted 상태에서는 high severity로
   * lifePhase source의 phaseConflict 위험이 생성되어야 한다.
   */
  export function verifyContextAlignmentRiskSensitivity(
    decisionInput: DecisionEngineInput,
  ): ContextAlignmentRiskVerificationResult {
    const neutralLifeAssessment: LifeContextAssessment = {
      executionConstraint: "low",
      familyResponsibility: "low",
      financialPressure: "low",
      transitionDifficulty: "low",
      expansionRisk: "low",
    };
  
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
      alignment: Parameters<
        typeof buildDecisionRisks
      >[0]["alignment"],
    ): DecisionRisk[] => {
      return buildDecisionRisks({
        decisionInput,
        alignment,
        urgency: "unknown",
        lifeAssessment: neutralLifeAssessment,
        compatibilityAssessment:
          neutralCompatibilityAssessment,
      });
    };
  
    const alignedRisks =
      buildRisks("aligned");
  
    const conflictedRisks =
      buildRisks("conflicted");
  
    const stronglyConflictedRisks =
      buildRisks("stronglyConflicted");
  
    const phaseConflictRiskKey =
      "phaseConflict";
  
    const alignedHasNoPhaseConflictRisk =
      !alignedRisks.some(
        (risk) => risk.key === phaseConflictRiskKey,
      );
  
    const conflictedDetected =
      conflictedRisks.some(
        (risk) =>
          risk.key === phaseConflictRiskKey &&
          risk.severity === "medium" &&
          risk.source === "lifePhase",
      );
  
    const stronglyConflictedDetected =
      stronglyConflictedRisks.some(
        (risk) =>
          risk.key === phaseConflictRiskKey &&
          risk.severity === "high" &&
          risk.source === "lifePhase",
      );
  
    const passed =
      alignedHasNoPhaseConflictRisk &&
      conflictedDetected &&
      stronglyConflictedDetected;
  
    return {
      alignedRisks,
      conflictedRisks,
      stronglyConflictedRisks,
  
      alignedHasNoPhaseConflictRisk,
      conflictedDetected,
      stronglyConflictedDetected,
  
      passed,
    };
  }

  export type UrgencyRiskVerificationResult = {
    unknownRisks: DecisionRisk[];
    immediateRisks: DecisionRisk[];
  
    unknownHasNoUrgentDecisionRisk: boolean;
    immediateDetected: boolean;
  
    passed: boolean;
  };

  export type RepeatedPatternRiskVerificationResult = {
    noRepeatedPatternRisks: DecisionRisk[];
    repeatedPatternRisks: DecisionRisk[];
  
    noRepeatedPatternHasNoRepeatedPatternRisk: boolean;
    repeatedPatternDetected: boolean;
  
    passed: boolean;
  };
  
  /**
   * Risk Builder Urgency 민감도 검증
   *
   * 동일한 DecisionEngineInput, Alignment,
   * LifeContextAssessment, CompatibilityAssessment를 유지하고
   * Urgency만 변경한다.
   *
   * unknown 상태에서는 urgentDecision 위험이 없어야 하며,
   * immediate 상태에서는 medium severity와
   * repeatedPattern source의 urgentDecision 위험이 생성되어야 한다.
   */
  export function verifyUrgencyRiskSensitivity(
    decisionInput: DecisionEngineInput,
  ): UrgencyRiskVerificationResult {
    const neutralLifeAssessment: LifeContextAssessment = {
      executionConstraint: "low",
      familyResponsibility: "low",
      financialPressure: "low",
      transitionDifficulty: "low",
      expansionRisk: "low",
    };
  
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
      urgency: DecisionEngineInput["question"]["urgency"],
    ): DecisionRisk[] => {
      return buildDecisionRisks({
        decisionInput,
        alignment: "aligned",
        urgency,
        lifeAssessment: neutralLifeAssessment,
        compatibilityAssessment:
          neutralCompatibilityAssessment,
      });
    };
  
    const unknownRisks =
      buildRisks("unknown");
  
    const immediateRisks =
      buildRisks("immediate");
  
    const urgentDecisionRiskKey =
      "urgentDecision";
  
    const unknownHasNoUrgentDecisionRisk =
      !unknownRisks.some(
        (risk) => risk.key === urgentDecisionRiskKey,
      );
  
    const immediateDetected =
      immediateRisks.some(
        (risk) =>
          risk.key === urgentDecisionRiskKey &&
          risk.severity === "medium" &&
          risk.source === "repeatedPattern",
      );
  
    const passed =
      unknownHasNoUrgentDecisionRisk &&
      immediateDetected;
  
    return {
      unknownRisks,
      immediateRisks,
  
      unknownHasNoUrgentDecisionRisk,
      immediateDetected,
  
      passed,
    };
  }

  /**
 * Risk Builder Repeated Pattern 민감도 검증
 *
 * 동일한 DecisionEngineInput의 다른 모든 조건을 유지하고
 * Repeated Pattern의 risks 배열만 변경한다.
 *
 * 반복 위험이 없는 상태에서는 repeatedPattern 전용 위험이
 * 생성되지 않아야 한다.
 *
 * 반복 위험이 존재하는 상태에서는 각 위험이
 * primary confidence에 대응하는 severity와
 * repeatedPattern source로 생성되어야 한다.
 */
export function verifyRepeatedPatternRiskSensitivity(
    decisionInput: DecisionEngineInput,
  ): RepeatedPatternRiskVerificationResult {
    const neutralLifeAssessment: LifeContextAssessment = {
      executionConstraint: "low",
      familyResponsibility: "low",
      financialPressure: "low",
      transitionDifficulty: "low",
      expansionRisk: "low",
    };
  
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
  
    const repeatedPattern =
      decisionInput.humanContext.identity.profile.repeatedPattern;
  
    const noRepeatedPatternInput: DecisionEngineInput = {
      ...decisionInput,
      humanContext: {
        ...decisionInput.humanContext,
        identity: {
          ...decisionInput.humanContext.identity,
          profile: {
            ...decisionInput.humanContext.identity.profile,
            repeatedPattern: {
              ...repeatedPattern,
              risks: [],
            },
          },
        },
      },
    };
  
    const buildRisks = (
      input: DecisionEngineInput,
    ): DecisionRisk[] => {
      return buildDecisionRisks({
        decisionInput: input,
        alignment: "aligned",
        urgency: "unknown",
        lifeAssessment: neutralLifeAssessment,
        compatibilityAssessment:
          neutralCompatibilityAssessment,
      });
    };
  
    const noRepeatedPatternRisks =
      buildRisks(noRepeatedPatternInput);
  
    const repeatedPatternRisks =
      buildRisks(decisionInput);
  
    const isRepeatedPatternRisk = (
      risk: DecisionRisk,
    ): boolean => {
      return (
        risk.key.startsWith("repeatedPattern-") &&
        risk.source === "repeatedPattern"
      );
    };
  
    const expectedSeverity: DecisionRisk["severity"] =
      repeatedPattern.primary.confidence === "high"
        ? "high"
        : repeatedPattern.primary.confidence === "medium"
          ? "medium"
          : "low";
  
    const noRepeatedPatternHasNoRepeatedPatternRisk =
      !noRepeatedPatternRisks.some(isRepeatedPatternRisk);
  
    const generatedRepeatedPatternRisks =
      repeatedPatternRisks.filter(isRepeatedPatternRisk);
  
    const repeatedPatternDetected =
      repeatedPattern.risks.length > 0 &&
      generatedRepeatedPatternRisks.length ===
        repeatedPattern.risks.length &&
      generatedRepeatedPatternRisks.every(
        (risk, index) =>
          risk.key === `repeatedPattern-${index + 1}` &&
          risk.description === repeatedPattern.risks[index] &&
          risk.severity === expectedSeverity,
      );
  
    const passed =
      noRepeatedPatternHasNoRepeatedPatternRisk &&
      repeatedPatternDetected;
  
    return {
      noRepeatedPatternRisks,
      repeatedPatternRisks,
  
      noRepeatedPatternHasNoRepeatedPatternRisk,
      repeatedPatternDetected,
  
      passed,
    };
  }