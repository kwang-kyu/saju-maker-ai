import type {
    CareerArea,
    CareerConfidence,
    CareerJudgement,
    CareerLevel,
    CareerResult,
  } from "../types/career.js";
  
  export type CareerJudgementExplanation = {
    area: CareerArea;
  
    title: string;
  
    level: CareerLevel | null;
  
    levelLabel: string;
  
    summary: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  
    evidence: string[];
  
    counterEvidence: string[];
  
    confidence: CareerConfidence;
  
    exceptionConditions: string[];
  };
  
  export type CareerResultExplanation = {
    title: string;
  
    summary: string;
  
    corePattern: string;
  
    primaryRole: string;
  
    workMethod: string;
  
    expertiseGrowthMethod: string;
  
    organizationMethod: string;
  
    independenceMethod: string;
  
    leadershipMethod: string;
  
    performanceMethod: string;
  
    continuityPattern: string;
  
    roleOrientation:
      CareerJudgementExplanation;
  
    workStyle:
      CareerJudgementExplanation;
  
    expertiseGrowth:
      CareerJudgementExplanation;
  
    organizationFit:
      CareerJudgementExplanation;
  
    independenceFit:
      CareerJudgementExplanation;
  
    leadershipFit:
      CareerJudgementExplanation;
  
    performanceConversion:
      CareerJudgementExplanation;
  
    careerContinuity:
      CareerJudgementExplanation;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  
    strengths: string[];
  
    risks: string[];
  
    evidence: string[];
  };
  
  const CAREER_AREA_TITLES: Record<
    CareerArea,
    string
  > = {
    roleOrientation: "직업 역할 방향",
  
    workStyle: "업무 수행 방식",
  
    expertiseGrowth: "전문성 성장력",
  
    organizationFit: "조직 적합성",
  
    independenceFit: "독립 업무 적합성",
  
    leadershipFit: "리더 역할 적합성",
  
    performanceConversion:
      "성과 전환력",
  
    careerContinuity: "경력 지속력",
  };
  
  const CAREER_LEVEL_LABELS: Record<
    CareerLevel,
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
  
  function buildLevelLabel(
    level: CareerLevel | null,
  ): string {
    if (level === null) {
      return "판단 보류";
    }
  
    return CAREER_LEVEL_LABELS[level];
  }
  
  function buildFallbackSummary(
    judgement: CareerJudgement,
  ): string {
    const title =
      CAREER_AREA_TITLES[
        judgement.area
      ];
  
    switch (judgement.level) {
      case "strong":
        return `${title}은 강한 편이지만 실제 발현 범위는 환경과 반대 근거를 함께 확인해야 합니다.`;
  
      case "moderate":
        return `${title}은 일정 조건에서 안정적으로 나타나며 역할과 환경에 따라 발현 정도가 달라질 수 있습니다.`;
  
      case "limited":
        return `${title}은 제한적으로 나타나므로 역할과 책임 범위를 무리하게 확대하지 않는 것이 중요합니다.`;
  
      case null:
        return `${title}은 현재 구조 근거만으로 수준을 확정하기 어렵습니다.`;
    }
  }
  
  function buildJudgementSummary(
    judgement: CareerJudgement,
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
  
      interpretation.strengthExpression,
  
      interpretation.limitationPattern,
    ]
      .filter(Boolean)
      .join(" ");
  }
  
  function buildCareerJudgementExplanation(
    judgement: CareerJudgement,
  ): CareerJudgementExplanation {
    const interpretation =
      judgement.interpretation;
  
    return {
      area: judgement.area,
  
      title:
        CAREER_AREA_TITLES[
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
        ?? "직업 강점이 발현되는 조건을 판단할 충분한 근거가 아직 부족합니다.",
  
      limitationPattern:
        interpretation
          ?.limitationPattern
        ?? "직업적 제한이 나타나는 양상을 판단할 충분한 근거가 아직 부족합니다.",
  
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
        judgement.exceptionConditions,
      ),
    };
  }
  
  function buildAreaLevelSummary(
    explanations:
      CareerJudgementExplanation[],
  ): string {
    const strongAreas =
      explanations.filter(
        (explanation) =>
          explanation.level === "strong",
      );
  
    const moderateAreas =
      explanations.filter(
        (explanation) =>
          explanation.level === "moderate",
      );
  
    const limitedAreas =
      explanations.filter(
        (explanation) =>
          explanation.level === "limited",
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
          .map((area) => area.title)
          .join(", ")}에서 강한 직업 기반이 확인됩니다.`,
      );
    }
  
    if (moderateAreas.length > 0) {
      sentences.push(
        `${moderateAreas
          .map((area) => area.title)
          .join(", ")}은 역할과 환경에 따라 발현 범위가 달라질 수 있습니다.`,
      );
    }
  
    if (limitedAreas.length > 0) {
      sentences.push(
        `${limitedAreas
          .map((area) => area.title)
          .join(", ")}에서는 책임 확대보다 역할과 환경의 조정이 중요합니다.`,
      );
    }
  
    if (insufficientAreas.length > 0) {
      sentences.push(
        `${insufficientAreas
          .map((area) => area.title)
          .join(", ")}은 현재 근거만으로 수준을 확정하지 않습니다.`,
      );
    }
  
    if (sentences.length === 0) {
      return "현재 근거만으로 직업 구조의 강약을 구체적으로 판단하기 어렵습니다.";
    }
  
    return sentences.join(" ");
  }
  
  function buildCareerSummary(
    career: CareerResult,
    explanations:
      CareerJudgementExplanation[],
  ): string {
    const corePattern =
      career.interpretation
        ?.corePattern;
  
    const primaryRole =
      career.interpretation
        ?.primaryRole;
  
    const areaSummary =
      buildAreaLevelSummary(
        explanations,
      );
  
    return [
      corePattern,
      primaryRole,
      areaSummary,
    ]
      .filter(Boolean)
      .join(" ");
  }
  
  export function buildCareerExplanation(
    career: CareerResult,
  ): CareerResultExplanation {
    const roleOrientation =
      buildCareerJudgementExplanation(
        career.roleOrientation,
      );
  
    const workStyle =
      buildCareerJudgementExplanation(
        career.workStyle,
      );
  
    const expertiseGrowth =
      buildCareerJudgementExplanation(
        career.expertiseGrowth,
      );
  
    const organizationFit =
      buildCareerJudgementExplanation(
        career.organizationFit,
      );
  
    const independenceFit =
      buildCareerJudgementExplanation(
        career.independenceFit,
      );
  
    const leadershipFit =
      buildCareerJudgementExplanation(
        career.leadershipFit,
      );
  
    const performanceConversion =
      buildCareerJudgementExplanation(
        career.performanceConversion,
      );
  
    const careerContinuity =
      buildCareerJudgementExplanation(
        career.careerContinuity,
      );
  
    const explanations = [
      roleOrientation,
      workStyle,
      expertiseGrowth,
      organizationFit,
      independenceFit,
      leadershipFit,
      performanceConversion,
      careerContinuity,
    ];
  
    const suitableConditions = unique([
      ...(
        career.interpretation
          ?.suitableConditions
        ?? []
      ),
  
      ...explanations.flatMap(
        (explanation) =>
          explanation.suitableConditions,
      ),
    ]);
  
    const cautionConditions = unique([
      ...(
        career.interpretation
          ?.cautionConditions
        ?? []
      ),
  
      ...explanations.flatMap(
        (explanation) => [
          ...explanation.cautionConditions,
          ...explanation.exceptionConditions,
        ],
      ),
    ]);
  
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
          ...(
            explanation.level === "limited"
              ? [
                  explanation
                    .limitationPattern,
                ]
              : []
          ),
  
          ...explanation.cautionConditions,
  
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
        "이 사람의 직업 역할·업무 방식·성장 구조",
  
      summary:
        buildCareerSummary(
          career,
          explanations,
        ),
  
      corePattern:
        career.interpretation
          ?.corePattern
        ?? "현재 근거만으로 전체 직업 구조를 확정하기 어렵습니다.",
  
      primaryRole:
        career.interpretation
          ?.primaryRole
        ?? "직업 역할의 중심 방향을 판단할 근거가 충분하지 않습니다.",
  
      workMethod:
        career.interpretation
          ?.workMethod
        ?? "업무 수행 방식을 판단할 근거가 충분하지 않습니다.",
  
      expertiseGrowthMethod:
        career.interpretation
          ?.expertiseGrowthMethod
        ?? "전문성 성장 방식을 판단할 근거가 충분하지 않습니다.",
  
      organizationMethod:
        career.interpretation
          ?.organizationMethod
        ?? "조직 안에서 기능하는 방식을 판단할 근거가 충분하지 않습니다.",
  
      independenceMethod:
        career.interpretation
          ?.independenceMethod
        ?? "독립적으로 일하는 방식을 판단할 근거가 충분하지 않습니다.",
  
      leadershipMethod:
        career.interpretation
          ?.leadershipMethod
        ?? "리더 역할 수행 방식을 판단할 근거가 충분하지 않습니다.",
  
      performanceMethod:
        career.interpretation
          ?.performanceMethod
        ?? "활동을 성과로 연결하는 방식을 판단할 근거가 충분하지 않습니다.",
  
      continuityPattern:
        career.interpretation
          ?.continuityPattern
        ?? "직업 유지와 전환 구조를 판단할 근거가 충분하지 않습니다.",
  
      roleOrientation,
  
      workStyle,
  
      expertiseGrowth,
  
      organizationFit,
  
      independenceFit,
  
      leadershipFit,
  
      performanceConversion,
  
      careerContinuity,
  
      suitableConditions,
  
      cautionConditions,
  
      strengths,
  
      risks,
  
      evidence,
    };
  }