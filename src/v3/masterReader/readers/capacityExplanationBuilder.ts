import type {
    CapacityArea,
    CapacityConfidence,
    CapacityJudgement,
    CapacityLevel,
    CapacityResult,
  } from "../types/capacity.js";
  
  export type CapacityJudgementExplanation = {
    area: CapacityArea;
  
    title: string;
  
    level: CapacityLevel;
  
    levelLabel: string;
  
    summary: string;
  
    manageableScope: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    overloadConditions: string[];
  
    suitableConditions: string[];
  
    evidence: string[];
  
    counterEvidence: string[];
  
    confidence: CapacityConfidence;
  
    exceptionConditions: string[];
  };
  
  export type CapacityResultExplanation = {
    title: string;
  
    summary: string;
  
    responsibility: CapacityJudgementExplanation;
  
    money: CapacityJudgementExplanation;
  
    organization: CapacityJudgementExplanation;
  
    relationship: CapacityJudgementExplanation;
  
    risk: CapacityJudgementExplanation;
  
    time: CapacityJudgementExplanation;
  
    strengths: string[];
  
    risks: string[];
  
    evidence: string[];
  };
  
  const CAPACITY_AREA_TITLES: Record<
    CapacityArea,
    string
  > = {
    responsibility: "책임 감당력",
    money: "금전 감당력",
    organization: "조직 감당력",
    relationship: "관계 감당력",
    risk: "위험 감당력",
    time: "시간 지속력",
  };
  
  const CAPACITY_LEVEL_LABELS: Record<
    CapacityLevel,
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
          .map((value) =>
            value
              .replace(/\s+/g, " ")
              .trim(),
          )
          .filter(Boolean),
      ),
    ];
  }
  
  function buildFallbackSummary(
    judgement: CapacityJudgement,
  ): string {
    const title =
      CAPACITY_AREA_TITLES[judgement.area];
  
    switch (judgement.level) {
      case "strong":
        return `${title}은 강한 편이지만 실제 범위는 주어진 조건과 예외 사항을 함께 확인해야 합니다.`;
  
      case "moderate":
        return `${title}은 보통 수준으로, 환경과 역할 범위에 따라 실제 감당력이 달라질 수 있습니다.`;
  
      case "limited":
        return `${title}은 제한적으로 나타나므로 책임과 부담을 무리하게 확대하지 않는 것이 중요합니다.`;
    }
  }
  
  function buildJudgementSummary(
    judgement: CapacityJudgement,
  ): string {
    const interpretation =
      judgement.interpretation;
  
    if (!interpretation) {
      return buildFallbackSummary(judgement);
    }
  
    return [
      interpretation.corePattern,
      interpretation.manageableScope,
      interpretation.limitationPattern,
    ]
      .filter(Boolean)
      .join(" ");
  }
  
  function buildCapacityJudgementExplanation(
    judgement: CapacityJudgement,
  ): CapacityJudgementExplanation {
    const interpretation =
      judgement.interpretation;
  
    return {
      area: judgement.area,
  
      title:
        CAPACITY_AREA_TITLES[judgement.area],
  
      level: judgement.level,
  
      levelLabel:
        CAPACITY_LEVEL_LABELS[judgement.level],
  
      summary:
        buildJudgementSummary(judgement),
  
      manageableScope:
        interpretation?.manageableScope
        ?? "현재 근거만으로 구체적인 감당 범위를 확정하기 어렵습니다.",
  
      strengthExpression:
        interpretation?.strengthExpression
        ?? "강점이 발현되는 조건을 판단할 충분한 근거가 아직 부족합니다.",
  
      limitationPattern:
        interpretation?.limitationPattern
        ?? "과부하가 발생하는 구체적인 양상을 판단할 충분한 근거가 아직 부족합니다.",
  
      overloadConditions:
        interpretation?.overloadConditions
        ?? [],
  
      suitableConditions:
        interpretation?.suitableConditions
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
        judgement.exceptionConditions,
      ),
    };
  }
  
  function buildCapacitySummary(
    explanations: CapacityJudgementExplanation[],
  ): string {
    const strongAreas =
      explanations.filter(
        (explanation) =>
          explanation.level === "strong",
      );
  
    const limitedAreas =
      explanations.filter(
        (explanation) =>
          explanation.level === "limited",
      );
  
    const moderateAreas =
      explanations.filter(
        (explanation) =>
          explanation.level === "moderate",
      );
  
    const sentences: string[] = [];
  
    if (strongAreas.length > 0) {
      sentences.push(
        `${strongAreas
          .map((area) => area.title)
          .join(", ")}에서 비교적 넓은 감당 범위가 확인됩니다.`,
      );
    }
  
    if (moderateAreas.length > 0) {
      sentences.push(
        `${moderateAreas
          .map((area) => area.title)
          .join(", ")}은 환경과 조건에 따라 실제 수행 범위가 달라질 수 있습니다.`,
      );
    }
  
    if (limitedAreas.length > 0) {
      sentences.push(
        `${limitedAreas
          .map((area) => area.title)
          .join(", ")}에서는 무리한 확대와 과도한 부담을 피해야 합니다.`,
      );
    }
  
    if (sentences.length === 0) {
      return "현재 근거만으로 감당 범위의 강약을 구체적으로 판단하기 어렵습니다.";
    }
  
    return sentences.join(" ");
  }
  
  export function buildCapacityExplanation(
    capacity: CapacityResult,
  ): CapacityResultExplanation {
    const responsibility =
      buildCapacityJudgementExplanation(
        capacity.responsibility,
      );
  
    const money =
      buildCapacityJudgementExplanation(
        capacity.money,
      );
  
    const organization =
      buildCapacityJudgementExplanation(
        capacity.organization,
      );
  
    const relationship =
      buildCapacityJudgementExplanation(
        capacity.relationship,
      );
  
    const risk =
      buildCapacityJudgementExplanation(
        capacity.risk,
      );
  
    const time =
      buildCapacityJudgementExplanation(
        capacity.time,
      );
  
    const explanations = [
      responsibility,
      money,
      organization,
      relationship,
      risk,
      time,
    ];
  
    const strengths = unique(
      explanations.flatMap(
        (explanation) =>
          explanation.level === "strong"
            ? [
                explanation.strengthExpression,
                ...explanation.suitableConditions,
              ]
            : [],
      ),
    );
  
    const risks = unique(
      explanations.flatMap(
        (explanation) => [
          ...(explanation.level === "limited"
            ? [explanation.limitationPattern]
            : []),
          ...explanation.overloadConditions,
          ...explanation.exceptionConditions,
          ...explanation.counterEvidence,
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
        "이 사람이 실제로 감당할 수 있는 책임과 부담의 범위",
  
      summary:
        buildCapacitySummary(explanations),
  
      responsibility,
  
      money,
  
      organization,
  
      relationship,
  
      risk,
  
      time,
  
      strengths,
  
      risks,
  
      evidence,
    };
  }