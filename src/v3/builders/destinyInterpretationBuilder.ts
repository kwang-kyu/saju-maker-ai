import type {
    DestinyArea,
    DestinyInterpretation,
    DestinyLevel,
  } from "../masterReader/types/destiny";
  import type {
    DestinyAreaSelection,
  } from "../masterReader/readers/destinySelector";
  import {
    buildDestinyAreaInterpretation,
  } from "./destinyAreaInterpretationBuilder";
  
  const DESTINY_AREAS:
    DestinyArea[] = [
      "lifeDirection",
      "coreLifeTask",
      "strengthFulfillment",
      "growthPath",
      "choiceAlignment",
      "changeIntegration",
      "contributionPattern",
      "longTermCoherence",
    ];
  
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
  
  function findSelection(
    selections: DestinyAreaSelection[],
    area: DestinyArea,
  ): DestinyAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function getLevel(
    selections: DestinyAreaSelection[],
    area: DestinyArea,
  ): DestinyLevel | null {
    return (
      findSelection(
        selections,
        area,
      )?.level
      ?? null
    );
  }
  
  function countLevel(
    selections: DestinyAreaSelection[],
    level: DestinyLevel,
  ): number {
    return selections.filter(
      (selection) =>
        selection.level === level,
    ).length;
  }
  
  function hasAnyJudgement(
    selections: DestinyAreaSelection[],
  ): boolean {
    return selections.some(
      (selection) =>
        selection.level !== null,
    );
  }
  
  function buildCorePattern(
    selections: DestinyAreaSelection[],
  ): string {
    const lifeDirection =
      getLevel(
        selections,
        "lifeDirection",
      );
  
    const coreLifeTask =
      getLevel(
        selections,
        "coreLifeTask",
      );
  
    const strengthFulfillment =
      getLevel(
        selections,
        "strengthFulfillment",
      );
  
    const growthPath =
      getLevel(
        selections,
        "growthPath",
      );
  
    const choiceAlignment =
      getLevel(
        selections,
        "choiceAlignment",
      );
  
    const changeIntegration =
      getLevel(
        selections,
        "changeIntegration",
      );
  
    const contributionPattern =
      getLevel(
        selections,
        "contributionPattern",
      );
  
    const longTermCoherence =
      getLevel(
        selections,
        "longTermCoherence",
      );
  
    if (
      lifeDirection === "strong"
      && longTermCoherence === "strong"
    ) {
      return "자기 중심과 장기 방향을 분명히 세우고 역할과 환경이 바뀌어도 그 방향을 지속적으로 이어가는 구조이다.";
    }
  
    if (
      strengthFulfillment === "strong"
      && contributionPattern === "strong"
    ) {
      return "타고난 강점을 지속 가능한 역할로 완성하고 능력과 경험을 현실적인 가치로 전환하는 구조이다.";
    }
  
    if (
      growthPath === "strong"
      && changeIntegration === "strong"
    ) {
      return "변화를 단절로 만들지 않고 기존 경험과 성과를 다음 기반에 연결하며 성장하는 구조이다.";
    }
  
    if (
      lifeDirection === "strong"
      && choiceAlignment === "limited"
    ) {
      return "삶의 기본 방향은 분명하지만 외부 요구나 익숙한 선택이 실제 방향과 어긋나지 않도록 선택 기준을 관리해야 하는 구조이다.";
    }
  
    if (
      coreLifeTask === "limited"
      && changeIntegration === "limited"
    ) {
      return "변화가 생길 때 익숙한 선택과 역할을 반복할 수 있어 유지할 기반과 바꿀 방식을 구분하는 것이 핵심 과제인 구조이다.";
    }
  
    if (
      choiceAlignment === "limited"
      && longTermCoherence === "limited"
    ) {
      return "외부 환경과 책임에 따라 선택과 삶의 중심이 분산될 수 있어 장기적으로 유지할 자기 기준을 세워야 하는 구조이다.";
    }
  
    const strongCount =
      countLevel(
        selections,
        "strong",
      );
  
    const limitedCount =
      countLevel(
        selections,
        "limited",
      );
  
    if (strongCount >= 5) {
      return "삶의 방향·성장·변화·기여의 구조가 비교적 일관되게 연결되어 장기적인 자기 기반을 만들 수 있는 구조이다.";
    }
  
    if (limitedCount >= 4) {
      return "삶의 방향을 한 번에 확정하기보다 작은 선택과 축적을 통해 자기 기준과 장기 기반을 만들어야 하는 구조이다.";
    }
  
    return "타고난 강점과 반복 과제를 함께 조정하며 자신에게 맞는 선택·성장·기여의 방향을 장기적으로 구체화하는 구조이다.";
  }
  
  function buildAreaPattern(
    selections: DestinyAreaSelection[],
    area: DestinyArea,
    pendingText: string,
  ): string {
    const selection =
      findSelection(
        selections,
        area,
      );
  
    if (
      !selection
      || selection.level === null
    ) {
      return pendingText;
    }
  
    const interpretation =
      buildDestinyAreaInterpretation(
        selection,
      );
  
    return (
      interpretation?.corePattern
      ?? pendingText
    );
  }
  
  export function buildDestinyInterpretation(
    selections: DestinyAreaSelection[],
  ): DestinyInterpretation | null {
    if (!hasAnyJudgement(selections)) {
      return null;
    }
  
    const normalizedSelections =
      DESTINY_AREAS.map(
        (area) =>
          findSelection(
            selections,
            area,
          ),
      ).filter(
        (
          selection,
        ): selection is DestinyAreaSelection =>
          selection !== null,
      );
  
    const interpretations =
      normalizedSelections.flatMap(
        (selection) => {
          const interpretation =
            buildDestinyAreaInterpretation(
              selection,
            );
  
          return interpretation
            ? [interpretation]
            : [];
        },
      );
  
    return {
      corePattern:
        buildCorePattern(
          normalizedSelections,
        ),
  
      lifeDirectionPattern:
        buildAreaPattern(
          normalizedSelections,
          "lifeDirection",
          "현재 근거만으로 장기적인 삶의 방향을 판단하기 어렵다.",
        ),
  
      coreLifeTaskPattern:
        buildAreaPattern(
          normalizedSelections,
          "coreLifeTask",
          "현재 근거만으로 반복되는 핵심 과제를 판단하기 어렵다.",
        ),
  
      strengthFulfillmentPattern:
        buildAreaPattern(
          normalizedSelections,
          "strengthFulfillment",
          "현재 근거만으로 타고난 강점의 완성 방식을 판단하기 어렵다.",
        ),
  
      growthPathPattern:
        buildAreaPattern(
          normalizedSelections,
          "growthPath",
          "현재 근거만으로 장기 성장 방식을 판단하기 어렵다.",
        ),
  
      choiceAlignmentPattern:
        buildAreaPattern(
          normalizedSelections,
          "choiceAlignment",
          "현재 근거만으로 자기 구조와 맞는 선택 기준을 판단하기 어렵다.",
        ),
  
      changeIntegrationPattern:
        buildAreaPattern(
          normalizedSelections,
          "changeIntegration",
          "현재 근거만으로 변화와 경험의 통합 방식을 판단하기 어렵다.",
        ),
  
      contributionPattern:
        buildAreaPattern(
          normalizedSelections,
          "contributionPattern",
          "현재 근거만으로 능력과 경험의 기여 방식을 판단하기 어렵다.",
        ),
  
      longTermCoherencePattern:
        buildAreaPattern(
          normalizedSelections,
          "longTermCoherence",
          "현재 근거만으로 장기 방향의 유지 구조를 판단하기 어렵다.",
        ),
  
      supportiveConditions:
        unique(
          interpretations.flatMap(
            (interpretation) =>
              interpretation
                .growthConditions,
          ),
        ),
  
      cautionConditions:
        unique(
          interpretations.flatMap(
            (interpretation) =>
              interpretation
                .cautionConditions,
          ),
        ),
    };
  }