import type {
    MoneyArea,
    MoneyAreaInterpretation,
    MoneyInterpretation,
    MoneyLevel,
  } from "../masterReader/types/money";
  import type {
    MoneyAreaSelection,
  } from "../masterReader/readers/moneySelector";
  import {
    buildMoneyAreaInterpretation,
  } from "./moneyAreaInterpretationBuilder";
  
  const MONEY_AREAS: MoneyArea[] = [
    "generation",
    "repeatability",
    "retention",
    "assetConversion",
    "cashflowManagement",
    "debtHandling",
    "volatilityResponse",
    "lossRecovery",
  ];
  
  function normalizeText(
    value: string,
  ): string {
    return value
      .replace(/\s+/g, " ")
      .trim();
  }
  
  function uniqueTexts(
    values: string[],
  ): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
  
    for (const value of values) {
      const normalized = normalizeText(value);
  
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
  
  function findAreaSelection(
    area: MoneyArea,
    selections: MoneyAreaSelection[],
  ): MoneyAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function buildAreaInterpretation(
    area: MoneyArea,
    selections: MoneyAreaSelection[],
  ): MoneyAreaInterpretation | null {
    const selection =
      findAreaSelection(area, selections);
  
    if (!selection) {
      return null;
    }
  
    return buildMoneyAreaInterpretation(selection);
  }
  
  function getAreaLevel(
    area: MoneyArea,
    selections: MoneyAreaSelection[],
  ): MoneyLevel | null {
    return (
      findAreaSelection(area, selections)?.level
      ?? null
    );
  }
  
  function hasAnyInterpretation(
    interpretations: Map<
      MoneyArea,
      MoneyAreaInterpretation | null
    >,
  ): boolean {
    return MONEY_AREAS.some(
      (area) =>
        interpretations.get(area) !== null,
    );
  }
  
  function buildCorePattern(
    selections: MoneyAreaSelection[],
  ): string {
    const generation =
      getAreaLevel("generation", selections);
  
    const repeatability =
      getAreaLevel("repeatability", selections);
  
    const retention =
      getAreaLevel("retention", selections);
  
    const assetConversion =
      getAreaLevel("assetConversion", selections);
  
    const debtHandling =
      getAreaLevel("debtHandling", selections);
  
    const volatilityResponse =
      getAreaLevel(
        "volatilityResponse",
        selections,
      );
  
    const lossRecovery =
      getAreaLevel("lossRecovery", selections);
  
    if (
      generation === "strong"
      && retention === "limited"
    ) {
      return "수입을 만들어내는 힘은 강하지만 들어온 재물을 보유하는 힘에는 제한이 있어, 성과 확대보다 누수 통제가 재물 구조의 핵심 과제가 된다.";
    }
  
    if (
      generation === "limited"
      && (
        retention === "strong"
        || assetConversion === "strong"
      )
    ) {
      return "수입 생성 속도는 조건의 영향을 받지만, 확보한 재물을 지키고 자산으로 전환하는 힘을 통해 점진적으로 재물 기반을 키우는 구조이다.";
    }
  
    if (
      repeatability === "strong"
      && (
        retention === "strong"
        || assetConversion === "strong"
      )
    ) {
      return "한 번의 큰 성과보다 반복 수익을 유지하고 이를 보유 자산으로 전환하면서 재물 규모를 키우는 구조이다.";
    }
  
    if (
      debtHandling === "limited"
      || volatilityResponse === "limited"
      || lossRecovery === "limited"
    ) {
      return "재물 생성 가능성과 별개로 부채·변동·손실이 커질 때 재정 기반이 빠르게 약해질 수 있어 위험 규모의 통제가 중요한 구조이다.";
    }
  
    if (
      generation === "strong"
      && repeatability === "strong"
    ) {
      return "활동과 성과를 수입으로 연결하고 그 수입을 반복 가능한 흐름으로 발전시키는 힘이 강한 구조이다.";
    }
  
    return "재물 생성·반복·보존·자산화 능력이 서로 다른 수준으로 작동하므로, 강한 영역을 활용하면서 제한 영역의 조건을 함께 관리해야 하는 구조이다.";
  }
  
  function getStrengthExpression(
    area: MoneyArea,
    interpretations: Map<
      MoneyArea,
      MoneyAreaInterpretation | null
    >,
    insufficientText: string,
  ): string {
    return (
      interpretations.get(area)
        ?.strengthExpression
      ?? insufficientText
    );
  }
  
  function buildLeakagePattern(
    interpretations: Map<
      MoneyArea,
      MoneyAreaInterpretation | null
    >,
  ): string {
    const relatedAreas: MoneyArea[] = [
      "retention",
      "cashflowManagement",
      "debtHandling",
    ];
  
    const patterns = relatedAreas.flatMap(
      (area) => {
        const interpretation =
          interpretations.get(area);
  
        return interpretation
          ? [interpretation.limitationPattern]
          : [];
      },
    );
  
    if (patterns.length === 0) {
      return "재물 누수 구조를 판단할 근거가 충분하지 않다.";
    }
  
    return uniqueTexts(patterns).join(" ");
  }
  
  function buildRiskControlMethod(
    interpretations: Map<
      MoneyArea,
      MoneyAreaInterpretation | null
    >,
  ): string {
    const relatedAreas: MoneyArea[] = [
      "debtHandling",
      "volatilityResponse",
      "lossRecovery",
    ];
  
    const conditions = relatedAreas.flatMap(
      (area) =>
        interpretations.get(area)
          ?.suitableConditions
        ?? [],
    );
  
    const uniqueConditions =
      uniqueTexts(conditions);
  
    if (uniqueConditions.length === 0) {
      return "부채·변동·손실 통제 방식을 판단할 근거가 충분하지 않다.";
    }
  
    return [
      "재물 위험은",
      uniqueConditions.slice(0, 3).join(", "),
      "을 기준으로 통제하는 방식이 적합하다.",
    ].join(" ");
  }
  
  function collectSuitableConditions(
    interpretations: Map<
      MoneyArea,
      MoneyAreaInterpretation | null
    >,
  ): string[] {
    return uniqueTexts(
      MONEY_AREAS.flatMap(
        (area) =>
          interpretations.get(area)
            ?.suitableConditions
          ?? [],
      ),
    );
  }
  
  function collectCautionConditions(
    interpretations: Map<
      MoneyArea,
      MoneyAreaInterpretation | null
    >,
  ): string[] {
    return uniqueTexts(
      MONEY_AREAS.flatMap(
        (area) =>
          interpretations.get(area)
            ?.cautionConditions
          ?? [],
      ),
    );
  }
  
  export function buildMoneyInterpretation(
    selections: MoneyAreaSelection[],
  ): MoneyInterpretation | null {
    const interpretations = new Map<
      MoneyArea,
      MoneyAreaInterpretation | null
    >();
  
    for (const area of MONEY_AREAS) {
      interpretations.set(
        area,
        buildAreaInterpretation(
          area,
          selections,
        ),
      );
    }
  
    if (!hasAnyInterpretation(interpretations)) {
      return null;
    }
  
    return {
      corePattern:
        buildCorePattern(selections),
  
      generationMethod:
        getStrengthExpression(
          "generation",
          interpretations,
          "재물 생성 방식을 판단할 근거가 충분하지 않다.",
        ),
  
      repetitionCondition:
        getStrengthExpression(
          "repeatability",
          interpretations,
          "수입 반복 조건을 판단할 근거가 충분하지 않다.",
        ),
  
      accumulationMethod:
        getStrengthExpression(
          "retention",
          interpretations,
          "재물 축적 방식을 판단할 근거가 충분하지 않다.",
        ),
  
      assetConversionMethod:
        getStrengthExpression(
          "assetConversion",
          interpretations,
          "수입을 자산으로 전환하는 방식을 판단할 근거가 충분하지 않다.",
        ),
  
      leakagePattern:
        buildLeakagePattern(interpretations),
  
      riskControlMethod:
        buildRiskControlMethod(interpretations),
  
      suitableConditions:
        collectSuitableConditions(
          interpretations,
        ),
  
      cautionConditions:
        collectCautionConditions(
          interpretations,
        ),
    };
  }