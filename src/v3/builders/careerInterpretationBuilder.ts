import type {
    CareerArea,
    CareerAreaInterpretation,
    CareerInterpretation,
    CareerLevel,
  } from "../masterReader/types/career";
  import type {
    CareerAreaSelection,
  } from "../masterReader/readers/careerSelector";
  import {
    buildCareerAreaInterpretation,
  } from "./careerAreaInterpretationBuilder";
  
  const CAREER_AREAS: CareerArea[] = [
    "roleOrientation",
    "workStyle",
    "expertiseGrowth",
    "organizationFit",
    "independenceFit",
    "leadershipFit",
    "performanceConversion",
    "careerContinuity",
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
      const normalized =
        normalizeText(value);
  
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
    area: CareerArea,
    selections: CareerAreaSelection[],
  ): CareerAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function buildAreaInterpretation(
    area: CareerArea,
    selections: CareerAreaSelection[],
  ): CareerAreaInterpretation | null {
    const selection =
      findAreaSelection(
        area,
        selections,
      );
  
    if (!selection) {
      return null;
    }
  
    return buildCareerAreaInterpretation(
      selection,
    );
  }
  
  function getAreaLevel(
    area: CareerArea,
    selections: CareerAreaSelection[],
  ): CareerLevel | null {
    return (
      findAreaSelection(
        area,
        selections,
      )?.level
      ?? null
    );
  }
  
  function hasAnyInterpretation(
    interpretations: Map<
      CareerArea,
      CareerAreaInterpretation | null
    >,
  ): boolean {
    return CAREER_AREAS.some(
      (area) =>
        interpretations.get(area)
        !== null,
    );
  }
  
  function buildPrimaryRole(
    selections: CareerAreaSelection[],
  ): string {
    const roleSelection =
      findAreaSelection(
        "roleOrientation",
        selections,
      );
  
    if (!roleSelection) {
      return "직업 역할의 중심 방향을 판단할 근거가 충분하지 않다.";
    }
  
    const ruleIds =
      roleSelection.supportingMatches.map(
        (match) => match.rule.id,
      );
  
    if (
      ruleIds.includes(
        "role-output-dominance",
      )
    ) {
      return "생산·표현·기획을 통해 결과물을 만드는 역할에서 중심 강점이 살아난다.";
    }
  
    if (
      ruleIds.includes(
        "role-wealth-dominance",
      )
    ) {
      return "현실 성과·영업·자원 운영을 통해 결과를 만드는 역할에서 중심 강점이 살아난다.";
    }
  
    if (
      ruleIds.includes(
        "role-officer-dominance",
      )
    ) {
      return "관리·책임·의사결정을 맡아 질서와 방향을 세우는 역할에서 중심 강점이 살아난다.";
    }
  
    if (
      ruleIds.includes(
        "role-resource-dominance",
      )
    ) {
      return "지식·분석·전문성을 활용하여 문제를 해결하고 지원하는 역할에서 중심 강점이 살아난다.";
    }
  
    if (
      ruleIds.includes(
        "role-peer-dominance",
      )
    ) {
      return "자기 기준과 경쟁력을 바탕으로 독립적인 영역을 개척하는 역할에서 중심 강점이 살아난다.";
    }
  
    return (
      roleSelection.level === null
        ? "직업 역할의 중심 방향을 판단할 구조적 근거가 충분하지 않다."
        : "역할과 책임의 기준이 명확한 환경에서 직업적 강점이 구체적으로 드러난다."
    );
  }
  
  function buildCorePattern(
    selections: CareerAreaSelection[],
  ): string {
    const expertise =
      getAreaLevel(
        "expertiseGrowth",
        selections,
      );
  
    const organization =
      getAreaLevel(
        "organizationFit",
        selections,
      );
  
    const independence =
      getAreaLevel(
        "independenceFit",
        selections,
      );
  
    const leadership =
      getAreaLevel(
        "leadershipFit",
        selections,
      );
  
    const performance =
      getAreaLevel(
        "performanceConversion",
        selections,
      );
  
    const continuity =
      getAreaLevel(
        "careerContinuity",
        selections,
      );
  
    if (
      independence === "strong"
      && organization === "limited"
    ) {
      return "조직의 통제 안에서 역할을 넓히기보다 자기 기준과 전문 기능을 중심으로 독립적인 업무 영역을 만들 때 직업 강점이 살아나는 구조이다.";
    }
  
    if (
      organization === "strong"
      && leadership === "strong"
    ) {
      return "조직의 역할과 책임 구조를 이해하고 사람과 업무의 방향을 조정하면서 직업적 영향력을 확대하는 구조이다.";
    }
  
    if (
      expertise === "strong"
      && continuity === "strong"
    ) {
      return "한 분야의 지식과 경험을 장기간 축적하여 대체하기 어려운 전문영역으로 성장하는 구조이다.";
    }
  
    if (
      performance === "strong"
      && independence === "strong"
    ) {
      return "자기 주도적인 활동과 결과물을 현실적인 성과로 연결하면서 직업 영역을 확장하는 구조이다.";
    }
  
    if (
      continuity === "limited"
    ) {
      return "직업 능력과 별개로 환경과 역할 변화에 따라 경력 방향이 흔들릴 수 있어 경험을 하나의 축으로 연결하는 조건이 중요한 구조이다.";
    }
  
    return "역할 방향·업무 방식·전문성·조직 적합성이 서로 다른 수준으로 작동하므로 강한 직업 기능을 중심으로 환경과 책임 범위를 조정해야 하는 구조이다.";
  }
  
  function getStrengthExpression(
    area: CareerArea,
    interpretations: Map<
      CareerArea,
      CareerAreaInterpretation | null
    >,
    insufficientText: string,
  ): string {
    return (
      interpretations.get(area)
        ?.strengthExpression
      ?? insufficientText
    );
  }
  
  function buildContinuityPattern(
    interpretations: Map<
      CareerArea,
      CareerAreaInterpretation | null
    >,
  ): string {
    const interpretation =
      interpretations.get(
        "careerContinuity",
      );
  
    if (!interpretation) {
      return "직업 유지와 전환 구조를 판단할 근거가 충분하지 않다.";
    }
  
    return [
      interpretation.corePattern,
      interpretation.limitationPattern,
    ].join(" ");
  }
  
  function collectSuitableConditions(
    interpretations: Map<
      CareerArea,
      CareerAreaInterpretation | null
    >,
  ): string[] {
    return uniqueTexts(
      CAREER_AREAS.flatMap(
        (area) =>
          interpretations.get(area)
            ?.suitableConditions
          ?? [],
      ),
    );
  }
  
  function collectCautionConditions(
    interpretations: Map<
      CareerArea,
      CareerAreaInterpretation | null
    >,
  ): string[] {
    return uniqueTexts(
      CAREER_AREAS.flatMap(
        (area) =>
          interpretations.get(area)
            ?.cautionConditions
          ?? [],
      ),
    );
  }
  
  export function buildCareerInterpretation(
    selections: CareerAreaSelection[],
  ): CareerInterpretation | null {
    const interpretations = new Map<
      CareerArea,
      CareerAreaInterpretation | null
    >();
  
    for (const area of CAREER_AREAS) {
      interpretations.set(
        area,
        buildAreaInterpretation(
          area,
          selections,
        ),
      );
    }
  
    if (
      !hasAnyInterpretation(
        interpretations,
      )
    ) {
      return null;
    }
  
    return {
      corePattern:
        buildCorePattern(selections),
  
      primaryRole:
        buildPrimaryRole(selections),
  
      workMethod:
        getStrengthExpression(
          "workStyle",
          interpretations,
          "업무 수행 방식을 판단할 근거가 충분하지 않다.",
        ),
  
      expertiseGrowthMethod:
        getStrengthExpression(
          "expertiseGrowth",
          interpretations,
          "전문성 성장 방식을 판단할 근거가 충분하지 않다.",
        ),
  
      organizationMethod:
        getStrengthExpression(
          "organizationFit",
          interpretations,
          "조직 안에서 기능하는 방식을 판단할 근거가 충분하지 않다.",
        ),
  
      independenceMethod:
        getStrengthExpression(
          "independenceFit",
          interpretations,
          "독립적으로 일하는 방식을 판단할 근거가 충분하지 않다.",
        ),
  
      leadershipMethod:
        getStrengthExpression(
          "leadershipFit",
          interpretations,
          "리더 역할 수행 방식을 판단할 근거가 충분하지 않다.",
        ),
  
      performanceMethod:
        getStrengthExpression(
          "performanceConversion",
          interpretations,
          "활동을 성과로 연결하는 방식을 판단할 근거가 충분하지 않다.",
        ),
  
      continuityPattern:
        buildContinuityPattern(
          interpretations,
        ),
  
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