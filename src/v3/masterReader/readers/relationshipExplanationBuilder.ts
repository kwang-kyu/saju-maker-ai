import type {
    RelationshipArea,
    RelationshipConfidence,
    RelationshipJudgement,
    RelationshipLevel,
    RelationshipResult,
  } from "../types/relationship.js";
  
  export type RelationshipJudgementExplanation = {
    area: RelationshipArea;
  
    title: string;
  
    level: RelationshipLevel | null;
  
    levelLabel: string;
  
    summary: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  
    evidence: string[];
  
    counterEvidence: string[];
  
    confidence:
      RelationshipConfidence;
  
    exceptionConditions: string[];
  };
  
  export type RelationshipResultExplanation = {
    title: string;
  
    summary: string;
  
    corePattern: string;
  
    connectionMethod: string;
  
    intimacyMethod: string;
  
    emotionalExchangeMethod: string;
  
    boundaryMethod: string;
  
    conflictMethod: string;
  
    trustRecoveryMethod: string;
  
    partnershipMethod: string;
  
    spouseBondingMethod: string;
  
    connectionExpansion:
      RelationshipJudgementExplanation;
  
    intimacyMaintenance:
      RelationshipJudgementExplanation;
  
    emotionalExchange:
      RelationshipJudgementExplanation;
  
    boundaryMaintenance:
      RelationshipJudgementExplanation;
  
    conflictAdjustment:
      RelationshipJudgementExplanation;
  
    trustRecovery:
      RelationshipJudgementExplanation;
  
    partnershipCooperation:
      RelationshipJudgementExplanation;
  
    spouseBonding:
      RelationshipJudgementExplanation;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  
    strengths: string[];
  
    risks: string[];
  
    evidence: string[];
  };
  
  const RELATIONSHIP_AREA_TITLES:
    Record<
      RelationshipArea,
      string
    > = {
      connectionExpansion:
        "관계 확장력",
  
      intimacyMaintenance:
        "친밀 관계 유지력",
  
      emotionalExchange:
        "감정 교류력",
  
      boundaryMaintenance:
        "관계 경계 유지력",
  
      conflictAdjustment:
        "갈등 조정력",
  
      trustRecovery:
        "신뢰 회복력",
  
      partnershipCooperation:
        "동업·협업 적합성",
  
      spouseBonding:
        "배우자 관계 결속력",
    };
  
  const RELATIONSHIP_LEVEL_LABELS:
    Record<
      RelationshipLevel,
      string
    > = {
      limited: "제한적",
  
      moderate: "보통",
  
      strong: "강함",
    };
  
  function unique(
    values: string[],
  ): string[] {
    return [
      ...new Set(
        values
          .map(
            (value) =>
              value
                .replace(/\s+/g, " ")
                .trim(),
          )
          .filter(Boolean),
      ),
    ];
  }
  
  function buildLevelLabel(
    level: RelationshipLevel | null,
  ): string {
    if (level === null) {
      return "판단 보류";
    }
  
    return (
      RELATIONSHIP_LEVEL_LABELS[
        level
      ]
    );
  }
  
  function buildFallbackSummary(
    judgement:
      RelationshipJudgement,
  ): string {
    const title =
      RELATIONSHIP_AREA_TITLES[
        judgement.area
      ];
  
    switch (judgement.level) {
      case "strong":
        return `${title}은 강한 편이지만 실제 발현 범위는 관계 환경과 반대 근거를 함께 확인해야 합니다.`;
  
      case "moderate":
        return `${title}은 관계의 성격과 신뢰 수준에 따라 발현 범위가 달라질 수 있습니다.`;
  
      case "limited":
        return `${title}은 제한적으로 나타나므로 관계의 속도·책임·경계를 무리하게 확대하지 않는 것이 중요합니다.`;
  
      case null:
        return `${title}은 현재 구조 근거만으로 수준을 확정하기 어렵습니다.`;
    }
  }
  
  function buildJudgementSummary(
    judgement:
      RelationshipJudgement,
  ): string {
    const interpretation =
      judgement.interpretation;
  
    if (!interpretation) {
      return buildFallbackSummary(
        judgement,
      );
    }
  
    return [
      interpretation.corePattern,
  
      interpretation
        .strengthExpression,
  
      interpretation
        .limitationPattern,
    ]
      .filter(Boolean)
      .join(" ");
  }
  
  function buildRelationshipJudgementExplanation(
    judgement:
      RelationshipJudgement,
  ): RelationshipJudgementExplanation {
    const interpretation =
      judgement.interpretation;
  
    return {
      area: judgement.area,
  
      title:
        RELATIONSHIP_AREA_TITLES[
          judgement.area
        ],
  
      level: judgement.level,
  
      levelLabel:
        buildLevelLabel(
          judgement.level,
        ),
  
      summary:
        buildJudgementSummary(
          judgement,
        ),
  
      strengthExpression:
        interpretation
          ?.strengthExpression
        ?? "관계 강점이 발현되는 조건을 판단할 충분한 근거가 아직 부족합니다.",
  
      limitationPattern:
        interpretation
          ?.limitationPattern
        ?? "관계의 제한이 나타나는 양상을 판단할 충분한 근거가 아직 부족합니다.",
  
      suitableConditions:
        interpretation
          ?.suitableConditions
        ?? [],
  
      cautionConditions:
        interpretation
          ?.cautionConditions
        ?? [],
  
      evidence: unique(
        judgement.evidence.map(
          (evidence) =>
            evidence.description,
        ),
      ),
  
      counterEvidence: unique(
        judgement.counterEvidence.map(
          (evidence) =>
            evidence.description,
        ),
      ),
  
      confidence:
        judgement.confidence,
  
      exceptionConditions: unique(
        judgement
          .exceptionConditions,
      ),
    };
  }
  
  function buildAreaLevelSummary(
    explanations:
      RelationshipJudgementExplanation[],
  ): string {
    const strongAreas =
      explanations.filter(
        (explanation) =>
          explanation.level
            === "strong",
      );
  
    const moderateAreas =
      explanations.filter(
        (explanation) =>
          explanation.level
            === "moderate",
      );
  
    const limitedAreas =
      explanations.filter(
        (explanation) =>
          explanation.level
            === "limited",
      );
  
    const insufficientAreas =
      explanations.filter(
        (explanation) =>
          explanation.level === null,
      );
  
    const sentences: string[] = [];
  
    if (strongAreas.length > 0) {
      sentences.push(
        `${strongAreas
          .map(
            (area) => area.title,
          )
          .join(", ")}에서 강한 관계 기반이 확인됩니다.`,
      );
    }
  
    if (moderateAreas.length > 0) {
      sentences.push(
        `${moderateAreas
          .map(
            (area) => area.title,
          )
          .join(", ")}은 관계의 성격과 신뢰 수준에 따라 발현 범위가 달라질 수 있습니다.`,
      );
    }
  
    if (limitedAreas.length > 0) {
      sentences.push(
        `${limitedAreas
          .map(
            (area) => area.title,
          )
          .join(", ")}에서는 관계 확대보다 역할·책임·경계의 조정이 중요합니다.`,
      );
    }
  
    if (
      insufficientAreas.length > 0
    ) {
      sentences.push(
        `${insufficientAreas
          .map(
            (area) => area.title,
          )
          .join(", ")}은 현재 근거만으로 수준을 확정하지 않습니다.`,
      );
    }
  
    if (sentences.length === 0) {
      return "현재 근거만으로 관계 구조의 강약을 구체적으로 판단하기 어렵습니다.";
    }
  
    return sentences.join(" ");
  }
  
  function buildRelationshipSummary(
    relationship:
      RelationshipResult,
    explanations:
      RelationshipJudgementExplanation[],
  ): string {
    const corePattern =
      relationship.interpretation
        ?.corePattern;
  
    const areaSummary =
      buildAreaLevelSummary(
        explanations,
      );
  
    return [
      corePattern,
      areaSummary,
    ]
      .filter(Boolean)
      .join(" ");
  }
  
  export function buildRelationshipExplanation(
    relationship:
      RelationshipResult,
  ): RelationshipResultExplanation {
    const connectionExpansion =
      buildRelationshipJudgementExplanation(
        relationship
          .connectionExpansion,
      );
  
    const intimacyMaintenance =
      buildRelationshipJudgementExplanation(
        relationship
          .intimacyMaintenance,
      );
  
    const emotionalExchange =
      buildRelationshipJudgementExplanation(
        relationship
          .emotionalExchange,
      );
  
    const boundaryMaintenance =
      buildRelationshipJudgementExplanation(
        relationship
          .boundaryMaintenance,
      );
  
    const conflictAdjustment =
      buildRelationshipJudgementExplanation(
        relationship
          .conflictAdjustment,
      );
  
    const trustRecovery =
      buildRelationshipJudgementExplanation(
        relationship.trustRecovery,
      );
  
    const partnershipCooperation =
      buildRelationshipJudgementExplanation(
        relationship
          .partnershipCooperation,
      );
  
    const spouseBonding =
      buildRelationshipJudgementExplanation(
        relationship.spouseBonding,
      );
  
    const explanations = [
      connectionExpansion,
      intimacyMaintenance,
      emotionalExchange,
      boundaryMaintenance,
      conflictAdjustment,
      trustRecovery,
      partnershipCooperation,
      spouseBonding,
    ];
  
    const suitableConditions =
      unique([
        ...(
          relationship.interpretation
            ?.suitableConditions
          ?? []
        ),
  
        ...explanations.flatMap(
          (explanation) =>
            explanation
              .suitableConditions,
        ),
      ]);
  
    const cautionConditions =
      unique([
        ...(
          relationship.interpretation
            ?.cautionConditions
          ?? []
        ),
  
        ...explanations.flatMap(
          (explanation) => [
            ...explanation
              .cautionConditions,
  
            ...explanation
              .exceptionConditions,
          ],
        ),
      ]);
  
    const strengths = unique(
      explanations.flatMap(
        (explanation) =>
          explanation.level
            === "strong"
            ? [
                explanation
                  .strengthExpression,
  
                ...explanation
                  .suitableConditions,
              ]
            : [],
      ),
    );
  
    const risks = unique(
      explanations.flatMap(
        (explanation) => [
          ...(
            explanation.level
              === "limited"
              ? [
                  explanation
                    .limitationPattern,
                ]
              : []
          ),
  
          ...explanation
            .cautionConditions,
  
          ...explanation
            .exceptionConditions,
  
          ...explanation
            .counterEvidence,
        ],
      ),
    );
  
    const evidence = unique(
      explanations.flatMap(
        (explanation) =>
          explanation.evidence,
      ),
    );
  
    return {
      title:
        "이 사람의 관계 방식·친밀감·경계·갈등 구조",
  
      summary:
        buildRelationshipSummary(
          relationship,
          explanations,
        ),
  
      corePattern:
        relationship.interpretation
          ?.corePattern
        ?? "현재 근거만으로 전체 관계 구조를 확정하기 어렵습니다.",
  
      connectionMethod:
        relationship.interpretation
          ?.connectionMethod
        ?? "사람과 연결되는 방식을 판단할 근거가 충분하지 않습니다.",
  
      intimacyMethod:
        relationship.interpretation
          ?.intimacyMethod
        ?? "가까운 관계를 유지하는 방식을 판단할 근거가 충분하지 않습니다.",
  
      emotionalExchangeMethod:
        relationship.interpretation
          ?.emotionalExchangeMethod
        ?? "감정 교류 방식을 판단할 근거가 충분하지 않습니다.",
  
      boundaryMethod:
        relationship.interpretation
          ?.boundaryMethod
        ?? "관계 경계를 유지하는 방식을 판단할 근거가 충분하지 않습니다.",
  
      conflictMethod:
        relationship.interpretation
          ?.conflictMethod
        ?? "갈등 조정 방식을 판단할 근거가 충분하지 않습니다.",
  
      trustRecoveryMethod:
        relationship.interpretation
          ?.trustRecoveryMethod
        ?? "신뢰 회복 방식을 판단할 근거가 충분하지 않습니다.",
  
      partnershipMethod:
        relationship.interpretation
          ?.partnershipMethod
        ?? "동업과 협업 방식을 판단할 근거가 충분하지 않습니다.",
  
      spouseBondingMethod:
        relationship.interpretation
          ?.spouseBondingMethod
        ?? "배우자 관계의 결속 방식을 판단할 근거가 충분하지 않습니다.",
  
      connectionExpansion,
  
      intimacyMaintenance,
  
      emotionalExchange,
  
      boundaryMaintenance,
  
      conflictAdjustment,
  
      trustRecovery,
  
      partnershipCooperation,
  
      spouseBonding,
  
      suitableConditions,
  
      cautionConditions,
  
      strengths,
  
      risks,
  
      evidence,
    };
  }