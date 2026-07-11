import type {
    SajuElementDistribution,
    SajuEvidenceStrength,
    SajuFacts,
    SajuFiveElement,
    SajuPillarFact,
    SajuPillarPosition,
    SajuStructureFact,
  } from "../types/sajuFacts";
  import type { V3CalculatedSaju } from "./v3SajuCalculationBuilder";
  
  type ElementCount = {
    element: SajuFiveElement;
    count: number;
  };
  
  function buildPillarFact(params: {
    position: SajuPillarPosition;
    ganZhi: string;
    tenGod?: string;
  }): SajuPillarFact {
    const { position, ganZhi, tenGod } = params;
  
    return {
      position,
      ganZhi,
      heavenlyStem: ganZhi.charAt(0),
      earthlyBranch: ganZhi.charAt(1),
      ...(tenGod ? { tenGod } : {}),
    };
  }
  
  function buildPillars(
    calculated: V3CalculatedSaju,
  ): SajuPillarFact[] {
    return [
      buildPillarFact({
        position: "year",
        ganZhi: calculated.yearGanZhi,
        tenGod: calculated.yearTenGod,
      }),
  
      buildPillarFact({
        position: "month",
        ganZhi: calculated.monthGanZhi,
        tenGod: calculated.monthTenGod,
      }),
  
      buildPillarFact({
        position: "day",
        ganZhi: calculated.dayGanZhi,
      }),
  
      buildPillarFact({
        position: "time",
        ganZhi: calculated.timeGanZhi,
        tenGod: calculated.timeTenGod,
      }),
    ];
  }
  
  function buildElementDistribution(
    calculated: V3CalculatedSaju,
  ): SajuElementDistribution {
    return {
      wood: calculated.wood,
      fire: calculated.fire,
      earth: calculated.earth,
      metal: calculated.metal,
      water: calculated.water,
    };
  }
  
  function getElementCounts(
    distribution: SajuElementDistribution,
  ): ElementCount[] {
    return [
      {
        element: "wood",
        count: distribution.wood,
      },
      {
        element: "fire",
        count: distribution.fire,
      },
      {
        element: "earth",
        count: distribution.earth,
      },
      {
        element: "metal",
        count: distribution.metal,
      },
      {
        element: "water",
        count: distribution.water,
      },
    ];
  }
  
  function findUniqueExtremeElement(params: {
    counts: ElementCount[];
    direction: "highest" | "lowest";
  }): SajuFiveElement | null {
    const { counts, direction } = params;
  
    const extremeCount =
      direction === "highest"
        ? Math.max(...counts.map((item) => item.count))
        : Math.min(...counts.map((item) => item.count));
  
    const matched = counts.filter(
      (item) => item.count === extremeCount,
    );
  
    if (matched.length !== 1) {
      return null;
    }
  
    return matched[0].element;
  }
  
  function toEvidenceStrength(
    count: number,
  ): SajuEvidenceStrength {
    if (count >= 3) {
      return "strong";
    }
  
    if (count >= 2) {
      return "medium";
    }
  
    return "weak";
  }
  
  function buildStructureFacts(params: {
    calculated: V3CalculatedSaju;
    distribution: SajuElementDistribution;
    strongestElement: SajuFiveElement | null;
    weakestElement: SajuFiveElement | null;
  }): SajuStructureFact[] {
    const {
      calculated,
      distribution,
      strongestElement,
      weakestElement,
    } = params;
  
    const counts = getElementCounts(distribution);
  
    const strongestCount = strongestElement
      ? counts.find(
          (item) => item.element === strongestElement,
        )?.count ?? 0
      : 0;
  
    const facts: SajuStructureFact[] = [
      {
        category: "structure",
        description:
          `원국의 네 기둥은 ` +
          `년주 ${calculated.yearGanZhi}, ` +
          `월주 ${calculated.monthGanZhi}, ` +
          `일주 ${calculated.dayGanZhi}, ` +
          `시주 ${calculated.timeGanZhi}로 계산되었다.`,
        strength: "strong",
        confidence: "strong",
      },
  
      {
        category: "fiveElementFlow",
        description:
          `오행 분포는 ` +
          `목 ${distribution.wood}, ` +
          `화 ${distribution.fire}, ` +
          `토 ${distribution.earth}, ` +
          `금 ${distribution.metal}, ` +
          `수 ${distribution.water}이다.`,
        strength: strongestElement
          ? toEvidenceStrength(strongestCount)
          : "medium",
        confidence: "strong",
      },
  
      {
        category: "tenGodStrength",
        description:
          `일간은 ${calculated.dayMaster}이며, ` +
          `확인된 천간 십성은 ` +
          `년간 ${calculated.yearTenGod}, ` +
          `월간 ${calculated.monthTenGod}, ` +
          `시간 ${calculated.timeTenGod}이다.`,
        strength: "medium",
        confidence: "strong",
      },
    ];
  
    if (strongestElement) {
      facts.push({
        category: "fiveElementFlow",
        description:
          `오행 개수 기준으로 가장 많이 나타난 오행은 ` +
          `${strongestElement}이다.`,
        strength: toEvidenceStrength(strongestCount),
        confidence: "strong",
      });
    }
  
    if (weakestElement) {
      const weakestCount =
        counts.find(
          (item) => item.element === weakestElement,
        )?.count ?? 0;
  
      facts.push({
        category: "fiveElementFlow",
        description:
          `오행 개수 기준으로 가장 적게 나타난 오행은 ` +
          `${weakestElement}이다.`,
        strength: toEvidenceStrength(weakestCount),
        confidence: "strong",
      });
    }
  
    return facts;
  }
  
  function calculateCurrentAge(
    birthDate: string,
  ): number {
    const [year, month, day] = birthDate
      .split("-")
      .map(Number);
  
    const today = new Date();
  
    let age = today.getFullYear() - year;
  
    const birthdayHasPassed =
      today.getMonth() + 1 > month ||
      (today.getMonth() + 1 === month &&
        today.getDate() >= day);
  
    if (!birthdayHasPassed) {
      age -= 1;
    }
  
    return Math.max(age, 0);
  }
  
  export function buildSajuFacts(
    calculated: V3CalculatedSaju,
  ): SajuFacts {
    const elementDistribution =
      buildElementDistribution(calculated);
  
    const elementCounts = getElementCounts(
      elementDistribution,
    );
  
    const strongestElement =
      findUniqueExtremeElement({
        counts: elementCounts,
        direction: "highest",
      });
  
    const weakestElement =
      findUniqueExtremeElement({
        counts: elementCounts,
        direction: "lowest",
      });
  
    return {
      name: calculated.name,
      birthDate: calculated.birthDate,
      birthTime: calculated.birthTime,
      gender: calculated.gender,
      calendarType: calculated.calendarType,
  
      solarDate: calculated.solarDate,
      lunarDate: calculated.lunarDate,
  
      pillars: buildPillars(calculated),
  
      dayMaster: calculated.dayMaster,
  
      strongestElement,
      weakestElement,
  
      elementDistribution,
  
      structureFacts: buildStructureFacts({
        calculated,
        distribution: elementDistribution,
        strongestElement,
        weakestElement,
      }),
      interactionFacts: [],
      luckFlow: {
        currentAge: calculateCurrentAge(
          calculated.birthDate,
        ),
        descriptions: [],
      },
    };
  }