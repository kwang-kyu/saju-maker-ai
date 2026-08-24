import type {
    SajuElementDistribution,
    SajuEvidenceStrength,
    SajuFiveElement,
    SajuPillarFact,
    SajuStructureFact,
  } from "../types/sajuFacts.js";
  
  export type DayMasterStrengthType =
    | "strong"
    | "balanced"
    | "weak";
  
  export type DayMasterStrengthResult = {
    type: DayMasterStrengthType;
  
    score: number;
  
    supportScore: number;
  
    opposingScore: number;
  
    monthCommandScore: number;
  
    rootingScore: number;
  
    confidence: SajuEvidenceStrength;
  
    fact: SajuStructureFact;
  };
  
  export type DayMasterStrengthCalculatorInput = {
    dayMaster: string;
  
    monthGanZhi: string;
  
    pillars: SajuPillarFact[];
  
    elementDistribution: SajuElementDistribution;
  };
  
  const stemElementMap: Record<
    string,
    SajuFiveElement
  > = {
    甲: "wood",
    乙: "wood",
    丙: "fire",
    丁: "fire",
    戊: "earth",
    己: "earth",
    庚: "metal",
    辛: "metal",
    壬: "water",
    癸: "water",
  
    갑: "wood",
    을: "wood",
    병: "fire",
    정: "fire",
    무: "earth",
    기: "earth",
    경: "metal",
    신: "metal",
    임: "water",
    계: "water",
  };
  
  const branchElementMap: Record<
    string,
    SajuFiveElement
  > = {
    子: "water",
    丑: "earth",
    寅: "wood",
    卯: "wood",
    辰: "earth",
    巳: "fire",
    午: "fire",
    未: "earth",
    申: "metal",
    酉: "metal",
    戌: "earth",
    亥: "water",
  
    자: "water",
    축: "earth",
    인: "wood",
    묘: "wood",
    진: "earth",
    사: "fire",
    오: "fire",
    미: "earth",
    신: "metal",
    유: "metal",
    술: "earth",
    해: "water",
  };
  
  const generatedByMap: Record<
    SajuFiveElement,
    SajuFiveElement
  > = {
    wood: "water",
    fire: "wood",
    earth: "fire",
    metal: "earth",
    water: "metal",
  };
  
  const generatesMap: Record<
    SajuFiveElement,
    SajuFiveElement
  > = {
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water",
    water: "wood",
  };
  
  const controlsMap: Record<
    SajuFiveElement,
    SajuFiveElement
  > = {
    wood: "earth",
    fire: "metal",
    earth: "water",
    metal: "wood",
    water: "fire",
  };
  
  const controlledByMap: Record<
    SajuFiveElement,
    SajuFiveElement
  > = {
    wood: "metal",
    fire: "water",
    earth: "wood",
    metal: "fire",
    water: "earth",
  };
  
  const elementLabelMap: Record<
    SajuFiveElement,
    string
  > = {
    wood: "목",
    fire: "화",
    earth: "토",
    metal: "금",
    water: "수",
  };
  
  function getElementCount(
    distribution: SajuElementDistribution,
    element: SajuFiveElement,
  ): number {
    return distribution[element];
  }
  
  function getMonthBranch(
    monthGanZhi: string,
  ): string {
    return monthGanZhi.charAt(1);
  }
  
  function calculateMonthCommandScore(params: {
    dayElement: SajuFiveElement;
    monthElement: SajuFiveElement | null;
  }): number {
    const { dayElement, monthElement } = params;
  
    if (!monthElement) {
      return 0;
    }
  
    if (monthElement === dayElement) {
      return 3;
    }
  
    if (monthElement === generatedByMap[dayElement]) {
      return 2;
    }
  
    if (monthElement === generatesMap[dayElement]) {
      return -1;
    }
  
    if (monthElement === controlsMap[dayElement]) {
      return -2;
    }
  
    if (monthElement === controlledByMap[dayElement]) {
      return -2;
    }
  
    return 0;
  }
  
  function calculateRootingScore(params: {
    dayElement: SajuFiveElement;
    pillars: SajuPillarFact[];
  }): number {
    const { dayElement, pillars } = params;
  
    const rootCount = pillars.filter((pillar) => {
      const branchElement =
        branchElementMap[pillar.earthlyBranch];
  
      return branchElement === dayElement;
    }).length;
  
    return Math.min(rootCount, 3);
  }
  
  function classifyStrength(
    score: number,
  ): DayMasterStrengthType {
    if (score >= 3) {
      return "strong";
    }
  
    if (score <= -3) {
      return "weak";
    }
  
    return "balanced";
  }
  
  function calculateConfidence(
    score: number,
  ): SajuEvidenceStrength {
    const absoluteScore = Math.abs(score);
  
    if (absoluteScore >= 6) {
      return "strong";
    }
  
    if (absoluteScore >= 3) {
      return "medium";
    }
  
    return "weak";
  }
  
  function getStrengthLabel(
    type: DayMasterStrengthType,
  ): string {
    switch (type) {
      case "strong":
        return "신강";
  
      case "balanced":
        return "중화";
  
      case "weak":
        return "신약";
    }
  }
  
  function buildDescription(params: {
    dayMaster: string;
    dayElement: SajuFiveElement;
    type: DayMasterStrengthType;
    supportScore: number;
    opposingScore: number;
    monthCommandScore: number;
    rootingScore: number;
    score: number;
  }): string {
    const {
      dayMaster,
      dayElement,
      type,
      supportScore,
      opposingScore,
      monthCommandScore,
      rootingScore,
      score,
    } = params;
  
    return (
      `일간 ${dayMaster}은 ${elementLabelMap[dayElement]} 기운이며, ` +
      `같은 오행과 생조 오행의 지지 점수는 ${supportScore}, ` +
      `설기·재성·관성 방향의 대립 점수는 ${opposingScore}이다. ` +
      `월령 보정은 ${monthCommandScore}, ` +
      `지지 통근 보정은 ${rootingScore}이며, ` +
      `최종 강약 점수는 ${score}로 ${getStrengthLabel(type)}에 해당한다.`
    );
  }
  
  export function calculateDayMasterStrength(
    input: DayMasterStrengthCalculatorInput,
  ): DayMasterStrengthResult | null {
    const {
      dayMaster,
      monthGanZhi,
      pillars,
      elementDistribution,
    } = input;
  
    const dayElement = stemElementMap[dayMaster];
  
    if (!dayElement) {
      return null;
    }
  
    const resourceElement =
      generatedByMap[dayElement];
  
    const outputElement =
      generatesMap[dayElement];
  
    const wealthElement =
      controlsMap[dayElement];
  
    const officerElement =
      controlledByMap[dayElement];
  
    const supportScore =
      getElementCount(
        elementDistribution,
        dayElement,
      ) +
      getElementCount(
        elementDistribution,
        resourceElement,
      );
  
    const opposingScore =
      getElementCount(
        elementDistribution,
        outputElement,
      ) +
      getElementCount(
        elementDistribution,
        wealthElement,
      ) +
      getElementCount(
        elementDistribution,
        officerElement,
      );
  
    const monthBranch =
      getMonthBranch(monthGanZhi);
  
    const monthElement =
      branchElementMap[monthBranch] ?? null;
  
    const monthCommandScore =
      calculateMonthCommandScore({
        dayElement,
        monthElement,
      });
  
    const rootingScore =
      calculateRootingScore({
        dayElement,
        pillars,
      });
  
    const score =
      supportScore -
      opposingScore +
      monthCommandScore +
      rootingScore;
  
    const type = classifyStrength(score);
  
    const confidence =
      calculateConfidence(score);
  
    const description = buildDescription({
      dayMaster,
      dayElement,
      type,
      supportScore,
      opposingScore,
      monthCommandScore,
      rootingScore,
      score,
    });
  
    return {
      type,
  
      score,
  
      supportScore,
  
      opposingScore,
  
      monthCommandScore,
  
      rootingScore,
  
      confidence,
  
      fact: {
        category: "dayMasterStrength",
      
        description,
      
        strength:
          type === "balanced"
            ? "medium"
            : confidence,
      
        confidence,
      
        signal: {
            kind: "dayMasterStrength",
            type,
            score,
            supportScore,
            opposingScore,
            monthCommandScore,
            rootingScore,
          },
        },
      };
    }
