import type {
    DecisionEngineInput,
  } from "./decisionTypes";
  import {
    selectReaderDecisionAreas,
    type ReaderDecisionAreaSelection,
  } from "./readerDecisionAreaRules";
  import type {
    ReaderDecisionSource,
  } from "./readerDecisionSelectionBuilder";
  
  export type ReaderDecisionLevel =
    | "limited"
    | "moderate"
    | "strong";
  
  export type ReaderDecisionConfidence =
    | "low"
    | "medium"
    | "high";
  
  export type ReaderDecisionConstraintLevel =
    | "none"
    | "moderate"
    | "high"
    | "insufficient";
  
  export type ReaderDecisionSupportLevel =
    | "none"
    | "moderate"
    | "strong"
    | "insufficient";
  
  export type ReaderDecisionAssessmentItem = {
    source: ReaderDecisionSource;
  
    area: string;
  
    level: ReaderDecisionLevel | null;
  
    confidence:
      ReaderDecisionConfidence;
  
    evidenceCount: number;
  
    counterEvidenceCount: number;
  
    conflictExists: boolean;
  
    limitationDescriptions: string[];
  };
  
  export type ReaderDecisionAssessment = {
    items:
      ReaderDecisionAssessmentItem[];
  
    relevantJudgementCount: number;
  
    assessedJudgementCount: number;
  
    insufficientJudgementCount: number;
  
    strongCount: number;
  
    limitedCount: number;
  
    conflictedCount: number;
  
    highConfidenceStrongCount: number;
  
    highConfidenceLimitedCount: number;
  
    highConfidenceConflictCount: number;
  
    constraintLevel:
      ReaderDecisionConstraintLevel;
  
    supportLevel:
      ReaderDecisionSupportLevel;
  
    limitations:
      ReaderDecisionAssessmentItem[];
  };
  
  type ReaderJudgementInput<
    Area extends string,
  > = {
    area: Area;
  
    level: ReaderDecisionLevel | null;
  
    confidence:
      ReaderDecisionConfidence;
  
    evidence: ReadonlyArray<{
      description: string;
    }>;
  
    counterEvidence: ReadonlyArray<{
      description: string;
    }>;
  
    exceptionConditions:
      readonly string[];
  };
  
  function uniqueTexts(
    values: readonly string[],
  ): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
  
    for (const value of values) {
      const normalized =
        value
          .replace(/\s+/g, " ")
          .trim();
  
      if (
        !normalized
        || seen.has(normalized)
      ) {
        continue;
      }
  
      seen.add(normalized);
      result.push(normalized);
    }
  
    return result;
  }
  
  function normalizeJudgement<
    Area extends string,
  >(
    source: ReaderDecisionSource,
    judgement:
      ReaderJudgementInput<Area>,
  ): ReaderDecisionAssessmentItem {
    const conflictExists =
      judgement.evidence.length > 0
      && judgement
        .counterEvidence
        .length > 0;
  
    const limitationDescriptions =
      judgement.level === "limited"
      || conflictExists
        ? uniqueTexts([
            ...judgement
              .counterEvidence
              .map(
                (evidence) =>
                  evidence.description,
              ),
  
            ...judgement
              .exceptionConditions,
          ])
        : [];
  
    return {
      source,
  
      area:
        judgement.area,
  
      level:
        judgement.level,
  
      confidence:
        judgement.confidence,
  
      evidenceCount:
        judgement.evidence.length,
  
      counterEvidenceCount:
        judgement
          .counterEvidence
          .length,
  
      conflictExists,
  
      limitationDescriptions,
    };
  }
  
  function collectCapacityItems(
    input: DecisionEngineInput,
    selection:
      ReaderDecisionAreaSelection,
  ): ReaderDecisionAssessmentItem[] {
    const result =
      input.humanContext
        .identity
        .profile
        .capacity;
  
    const judgements = [
      result.responsibility,
      result.money,
      result.organization,
      result.relationship,
      result.risk,
      result.time,
    ];
  
    return judgements
      .filter(
        (judgement) =>
          selection.capacity.includes(
            judgement.area,
          ),
      )
      .map(
        (judgement) =>
          normalizeJudgement(
            "capacity",
            judgement,
          ),
      );
  }
  
  function collectMoneyItems(
    input: DecisionEngineInput,
    selection:
      ReaderDecisionAreaSelection,
  ): ReaderDecisionAssessmentItem[] {
    const result =
      input.humanContext
        .identity
        .profile
        .money;
  
    const judgements = [
      result.generation,
      result.repeatability,
      result.retention,
      result.assetConversion,
      result.cashflowManagement,
      result.debtHandling,
      result.volatilityResponse,
      result.lossRecovery,
    ];
  
    return judgements
      .filter(
        (judgement) =>
          selection.money.includes(
            judgement.area,
          ),
      )
      .map(
        (judgement) =>
          normalizeJudgement(
            "money",
            judgement,
          ),
      );
  }
  
  function collectCareerItems(
    input: DecisionEngineInput,
    selection:
      ReaderDecisionAreaSelection,
  ): ReaderDecisionAssessmentItem[] {
    const result =
      input.humanContext
        .identity
        .profile
        .career;
  
    const judgements = [
      result.roleOrientation,
      result.workStyle,
      result.expertiseGrowth,
      result.organizationFit,
      result.independenceFit,
      result.leadershipFit,
      result.performanceConversion,
      result.careerContinuity,
    ];
  
    return judgements
      .filter(
        (judgement) =>
          selection.career.includes(
            judgement.area,
          ),
      )
      .map(
        (judgement) =>
          normalizeJudgement(
            "career",
            judgement,
          ),
      );
  }
  
  function collectRelationshipItems(
    input: DecisionEngineInput,
    selection:
      ReaderDecisionAreaSelection,
  ): ReaderDecisionAssessmentItem[] {
    const result =
      input.humanContext
        .identity
        .profile
        .relationship;
  
    const judgements = [
      result.connectionExpansion,
      result.intimacyMaintenance,
      result.emotionalExchange,
      result.boundaryMaintenance,
      result.conflictAdjustment,
      result.trustRecovery,
      result.partnershipCooperation,
      result.spouseBonding,
    ];
  
    return judgements
      .filter(
        (judgement) =>
          selection.relationship
            .includes(
              judgement.area,
            ),
      )
      .map(
        (judgement) =>
          normalizeJudgement(
            "relationship",
            judgement,
          ),
      );
  }
  
  function collectHealthItems(
    input: DecisionEngineInput,
    selection:
      ReaderDecisionAreaSelection,
  ): ReaderDecisionAssessmentItem[] {
    const result =
      input.humanContext
        .identity
        .profile
        .health;
  
    const judgements = [
      result.vitalityStability,
      result.stressRegulation,
      result.fatigueManagement,
      result.recoveryCapacity,
      result.rhythmMaintenance,
      result.overloadTolerance,
      result.habitSelfManagement,
      result.imbalanceAdaptation,
    ];
  
    return judgements
      .filter(
        (judgement) =>
          selection.health.includes(
            judgement.area,
          ),
      )
      .map(
        (judgement) =>
          normalizeJudgement(
            "health",
            judgement,
          ),
      );
  }
  
  function collectBlessingItems(
    input: DecisionEngineInput,
    selection:
      ReaderDecisionAreaSelection,
  ): ReaderDecisionAssessmentItem[] {
    const result =
      input.humanContext
        .identity
        .profile
        .blessing;
  
    const judgements = [
      result.opportunityReception,
      result.benefactorConnection,
      result.relationshipSupport,
      result.resourceSupport,
      result.environmentSupport,
      result.crisisProtection,
      result.blessingRetention,
      result.blessingCirculation,
    ];
  
    return judgements
      .filter(
        (judgement) =>
          selection.blessing.includes(
            judgement.area,
          ),
      )
      .map(
        (judgement) =>
          normalizeJudgement(
            "blessing",
            judgement,
          ),
      );
  }
  
  function collectDestinyItems(
    input: DecisionEngineInput,
    selection:
      ReaderDecisionAreaSelection,
  ): ReaderDecisionAssessmentItem[] {
    const result =
      input.humanContext
        .identity
        .profile
        .destiny;
  
    const judgements = [
      result.lifeDirection,
      result.coreLifeTask,
      result.strengthFulfillment,
      result.growthPath,
      result.choiceAlignment,
      result.changeIntegration,
      result.contributionPattern,
      result.longTermCoherence,
    ];
  
    return judgements
      .filter(
        (judgement) =>
          selection.destiny.includes(
            judgement.area,
          ),
      )
      .map(
        (judgement) =>
          normalizeJudgement(
            "destiny",
            judgement,
          ),
      );
  }
  
  function buildConstraintLevel(
    assessedJudgementCount: number,
    credibleLimitedCount: number,
    highConfidenceLimitedCount: number,
    highConfidenceConflictCount: number,
  ): ReaderDecisionConstraintLevel {
    if (assessedJudgementCount === 0) {
      return "insufficient";
    }
  
    if (
      highConfidenceLimitedCount >= 2
      || (
        highConfidenceLimitedCount >= 1
        && credibleLimitedCount >= 3
      )
    ) {
      return "high";
    }
  
    if (
      credibleLimitedCount >= 1
      || highConfidenceConflictCount >= 1
    ) {
      return "moderate";
    }
  
    return "none";
  }
  
  function buildSupportLevel(
    assessedJudgementCount: number,
    credibleStrongCount: number,
    highConfidenceStrongCount: number,
  ): ReaderDecisionSupportLevel {
    if (assessedJudgementCount === 0) {
      return "insufficient";
    }
  
    if (
      highConfidenceStrongCount >= 2
    ) {
      return "strong";
    }
  
    if (credibleStrongCount >= 1) {
      return "moderate";
    }
  
    return "none";
  }
  
  export function assessReaderDecision(
    input: DecisionEngineInput,
  ): ReaderDecisionAssessment {
    const selection =
      selectReaderDecisionAreas(
        input.question.topic,
      );
  
    const items = [
      ...collectCapacityItems(
        input,
        selection,
      ),
  
      ...collectMoneyItems(
        input,
        selection,
      ),
  
      ...collectCareerItems(
        input,
        selection,
      ),
  
      ...collectRelationshipItems(
        input,
        selection,
      ),
  
      ...collectHealthItems(
        input,
        selection,
      ),
  
      ...collectBlessingItems(
        input,
        selection,
      ),
  
      ...collectDestinyItems(
        input,
        selection,
      ),
    ];
  
    const assessedItems =
      items.filter(
        (item) =>
          item.level !== null,
      );
  
    const strongItems =
      assessedItems.filter(
        (item) =>
          item.level === "strong",
      );
  
    const limitedItems =
      assessedItems.filter(
        (item) =>
          item.level === "limited",
      );
  
    const conflictedItems =
      assessedItems.filter(
        (item) =>
          item.conflictExists,
      );
  
    const credibleStrongCount =
      strongItems.filter(
        (item) =>
          item.confidence !== "low",
      ).length;
  
    const credibleLimitedCount =
      limitedItems.filter(
        (item) =>
          item.confidence !== "low",
      ).length;
  
    const highConfidenceStrongCount =
      strongItems.filter(
        (item) =>
          item.confidence === "high",
      ).length;
  
    const highConfidenceLimitedCount =
      limitedItems.filter(
        (item) =>
          item.confidence === "high",
      ).length;
  
    const highConfidenceConflictCount =
      conflictedItems.filter(
        (item) =>
          item.confidence === "high",
      ).length;
  
    return {
      items,
  
      relevantJudgementCount:
        items.length,
  
      assessedJudgementCount:
        assessedItems.length,
  
      insufficientJudgementCount:
        items.length
        - assessedItems.length,
  
      strongCount:
        strongItems.length,
  
      limitedCount:
        limitedItems.length,
  
      conflictedCount:
        conflictedItems.length,
  
      highConfidenceStrongCount,
  
      highConfidenceLimitedCount,
  
      highConfidenceConflictCount,
  
      constraintLevel:
        buildConstraintLevel(
          assessedItems.length,
          credibleLimitedCount,
          highConfidenceLimitedCount,
          highConfidenceConflictCount,
        ),
  
      supportLevel:
        buildSupportLevel(
          assessedItems.length,
          credibleStrongCount,
          highConfidenceStrongCount,
        ),
  
      limitations:
        items.filter(
          (item) =>
            item.level === "limited"
            || item.conflictExists,
        ),
    };
  }