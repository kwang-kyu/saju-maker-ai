import type {
    MoneyArea,
    MoneyConfidence,
    MoneyJudgement,
    MoneyLevel,
    MoneyResult,
  } from "../types/money";
  
  export type MoneyJudgementExplanation = {
    area: MoneyArea;
  
    title: string;
  
    level: MoneyLevel | null;
  
    levelLabel: string;
  
    summary: string;
  
    strengthExpression: string;
  
    limitationPattern: string;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  
    evidence: string[];
  
    counterEvidence: string[];
  
    confidence: MoneyConfidence;
  
    exceptionConditions: string[];
  };
  
  export type MoneyResultExplanation = {
    title: string;
  
    summary: string;
  
    corePattern: string;
  
    generationMethod: string;
  
    repetitionCondition: string;
  
    accumulationMethod: string;
  
    assetConversionMethod: string;
  
    leakagePattern: string;
  
    riskControlMethod: string;
  
    generation: MoneyJudgementExplanation;
  
    repeatability: MoneyJudgementExplanation;
  
    retention: MoneyJudgementExplanation;
  
    assetConversion: MoneyJudgementExplanation;
  
    cashflowManagement:
      MoneyJudgementExplanation;
  
    debtHandling: MoneyJudgementExplanation;
  
    volatilityResponse:
      MoneyJudgementExplanation;
  
    lossRecovery: MoneyJudgementExplanation;
  
    suitableConditions: string[];
  
    cautionConditions: string[];
  
    strengths: string[];
  
    risks: string[];
  
    evidence: string[];
  };
  
  const MONEY_AREA_TITLES: Record<
    MoneyArea,
    string
  > = {
    generation: "재물 생성력",
  
    repeatability: "반복 수익력",
  
    retention: "재물 보존력",
  
    assetConversion: "자산 전환력",
  
    cashflowManagement: "현금흐름 관리력",
  
    debtHandling: "부채 감당력",
  
    volatilityResponse: "변동 대응력",
  
    lossRecovery: "손실 회복력",
  };
  
  const MONEY_LEVEL_LABELS: Record<
    MoneyLevel,
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
    level: MoneyLevel | null,
  ): string {
    if (level === null) {
      return "판단 보류";
    }
  
    return MONEY_LEVEL_LABELS[level];
  }
  
  function buildFallbackSummary(
    judgement: MoneyJudgement,
  ): string {
    const title =
      MONEY_AREA_TITLES[judgement.area];
  
    switch (judgement.level) {
      case "strong":
        return `${title}은 강한 편이지만 실제 작동 범위는 조건과 반대 근거를 함께 확인해야 합니다.`;
  
      case "moderate":
        return `${title}은 일정 조건에서 안정적으로 작동하며 환경과 관리 방식에 따라 결과가 달라질 수 있습니다.`;
  
      case "limited":
        return `${title}은 제한적으로 나타나므로 규모와 부담을 무리하게 확대하지 않는 것이 중요합니다.`;
  
      case null:
        return `${title}은 현재 구조 근거만으로 수준을 확정하기 어렵습니다.`;
    }
  }
  
  function buildJudgementSummary(
    judgement: MoneyJudgement,
  ): string {
    const interpretation =
      judgement.interpretation;
  
    if (!interpretation) {
      return buildFallbackSummary(judgement);
    }
  
    return [
      interpretation.corePattern,
      interpretation.strengthExpression,
      interpretation.limitationPattern,
    ]
      .filter(Boolean)
      .join(" ");
  }
  
  function buildMoneyJudgementExplanation(
    judgement: MoneyJudgement,
  ): MoneyJudgementExplanation {
    const interpretation =
      judgement.interpretation;
  
    return {
      area: judgement.area,
  
      title:
        MONEY_AREA_TITLES[judgement.area],
  
      level: judgement.level,
  
      levelLabel:
        buildLevelLabel(judgement.level),
  
      summary:
        buildJudgementSummary(judgement),
  
      strengthExpression:
        interpretation?.strengthExpression
        ?? "강점이 발현되는 조건을 판단할 충분한 근거가 아직 부족합니다.",
  
      limitationPattern:
        interpretation?.limitationPattern
        ?? "제한이 나타나는 양상을 판단할 충분한 근거가 아직 부족합니다.",
  
      suitableConditions:
        interpretation?.suitableConditions
        ?? [],
  
      cautionConditions:
        interpretation?.cautionConditions
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
    explanations: MoneyJudgementExplanation[],
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
          .join(", ")}에서 강한 구조적 기반이 확인됩니다.`,
      );
    }
  
    if (moderateAreas.length > 0) {
      sentences.push(
        `${moderateAreas
          .map((area) => area.title)
          .join(", ")}은 조건과 관리 방식에 따라 작동 범위가 달라질 수 있습니다.`,
      );
    }
  
    if (limitedAreas.length > 0) {
      sentences.push(
        `${limitedAreas
          .map((area) => area.title)
          .join(", ")}에서는 규모 확대보다 부담과 손실 통제가 중요합니다.`,
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
      return "현재 근거만으로 재물 구조의 강약을 구체적으로 판단하기 어렵습니다.";
    }
  
    return sentences.join(" ");
  }
  
  function buildMoneySummary(
    money: MoneyResult,
    explanations: MoneyJudgementExplanation[],
  ): string {
    const corePattern =
      money.interpretation?.corePattern;
  
    const areaSummary =
      buildAreaLevelSummary(explanations);
  
    if (!corePattern) {
      return areaSummary;
    }
  
    return [
      corePattern,
      areaSummary,
    ].join(" ");
  }
  
  export function buildMoneyExplanation(
    money: MoneyResult,
  ): MoneyResultExplanation {
    const generation =
      buildMoneyJudgementExplanation(
        money.generation,
      );
  
    const repeatability =
      buildMoneyJudgementExplanation(
        money.repeatability,
      );
  
    const retention =
      buildMoneyJudgementExplanation(
        money.retention,
      );
  
    const assetConversion =
      buildMoneyJudgementExplanation(
        money.assetConversion,
      );
  
    const cashflowManagement =
      buildMoneyJudgementExplanation(
        money.cashflowManagement,
      );
  
    const debtHandling =
      buildMoneyJudgementExplanation(
        money.debtHandling,
      );
  
    const volatilityResponse =
      buildMoneyJudgementExplanation(
        money.volatilityResponse,
      );
  
    const lossRecovery =
      buildMoneyJudgementExplanation(
        money.lossRecovery,
      );
  
    const explanations = [
      generation,
      repeatability,
      retention,
      assetConversion,
      cashflowManagement,
      debtHandling,
      volatilityResponse,
      lossRecovery,
    ];
  
    const suitableConditions = unique([
      ...(
        money.interpretation
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
        money.interpretation
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
          ...(explanation.level === "limited"
            ? [
                explanation.limitationPattern,
              ]
            : []),
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
        "이 사람의 재물 생성·축적·누수·위험 구조",
  
      summary:
        buildMoneySummary(
          money,
          explanations,
        ),
  
      corePattern:
        money.interpretation?.corePattern
        ?? "현재 근거만으로 전체 재물 구조를 확정하기 어렵습니다.",
  
      generationMethod:
        money.interpretation?.generationMethod
        ?? "재물 생성 방식을 판단할 근거가 충분하지 않습니다.",
  
      repetitionCondition:
        money.interpretation
          ?.repetitionCondition
        ?? "수입 반복 조건을 판단할 근거가 충분하지 않습니다.",
  
      accumulationMethod:
        money.interpretation
          ?.accumulationMethod
        ?? "재물 축적 방식을 판단할 근거가 충분하지 않습니다.",
  
      assetConversionMethod:
        money.interpretation
          ?.assetConversionMethod
        ?? "자산 전환 방식을 판단할 근거가 충분하지 않습니다.",
  
      leakagePattern:
        money.interpretation?.leakagePattern
        ?? "재물 누수 구조를 판단할 근거가 충분하지 않습니다.",
  
      riskControlMethod:
        money.interpretation?.riskControlMethod
        ?? "재물 위험 통제 방식을 판단할 근거가 충분하지 않습니다.",
  
      generation,
  
      repeatability,
  
      retention,
  
      assetConversion,
  
      cashflowManagement,
  
      debtHandling,
  
      volatilityResponse,
  
      lossRecovery,
  
      suitableConditions,
  
      cautionConditions,
  
      strengths,
  
      risks,
  
      evidence,
    };
  }