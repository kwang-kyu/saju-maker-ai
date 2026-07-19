import type {
    DestinyArea,
    DestinyAreaInterpretation,
    DestinyLevel,
  } from "../masterReader/types/destiny";
  import type {
    DestinyAreaSelection,
  } from "../masterReader/readers/destinySelector";
  
  const CORE_PATTERNS: Record<
    DestinyArea,
    Record<DestinyLevel, string>
  > = {
    lifeDirection: {
      strong:
        "자기 중심과 외부 조건을 조율하며 장기적인 삶의 방향을 비교적 분명하게 유지하는 구조이다.",
  
      moderate:
        "삶의 기본 방향은 확인되지만 환경과 책임의 조건에 맞게 방향을 구체화해야 하는 구조이다.",
  
      limited:
        "외부 부담과 환경 변화에 따라 삶의 중심이 흔들릴 수 있어 자기 기준을 먼저 세워야 하는 구조이다.",
    },
  
    coreLifeTask: {
      strong:
        "반복되는 삶의 과제를 인식하고 강점과 한계를 함께 조정하며 완성해 가는 구조이다.",
  
      moderate:
        "반복 과제를 다룰 기반은 있으나 익숙한 선택과 역할이 한계로 바뀌는 조건을 확인해야 하는 구조이다.",
  
      limited:
        "당장의 책임과 익숙한 방식에 끌려 반복 과제를 놓칠 수 있어 선택 기준의 재정립이 필요한 구조이다.",
    },
  
    strengthFulfillment: {
      strong:
        "타고난 강점을 지속적인 역할과 결과로 연결하여 자기 삶의 기반으로 완성하는 구조이다.",
  
      moderate:
        "타고난 강점은 확인되지만 역할·환경·지속 조건이 맞아야 실제 결과로 이어지는 구조이다.",
  
      limited:
        "타고난 강점이 외부 부담을 처리하는 데 소모될 수 있어 발현 범위와 역할을 분명히 해야 하는 구조이다.",
    },
  
    growthPath: {
      strong:
        "경험과 성과를 자기 기반으로 축적하며 시간이 지날수록 성장의 연속성이 강해지는 구조이다.",
  
      moderate:
        "성장 기반은 확인되지만 환경 변화 속에서도 경험과 성과를 누적하는 체계가 필요한 구조이다.",
  
      limited:
        "변화 때마다 기반을 다시 만들 수 있어 작은 경험도 남기고 연결하는 축적 방식이 중요한 구조이다.",
    },
  
    choiceAlignment: {
      strong:
        "자기 가능성과 감당 범위를 함께 고려하여 장기 방향과 맞는 선택을 할 수 있는 구조이다.",
  
      moderate:
        "자기 방향에 맞는 선택 기준은 있으나 외부 요구와 익숙한 강점의 영향을 함께 점검해야 하는 구조이다.",
  
      limited:
        "외부 요구나 익숙한 욕구가 선택을 이끌 수 있어 자기 구조에 맞는 기준을 먼저 확정해야 하는 구조이다.",
    },
  
    changeIntegration: {
      strong:
        "변화가 생겨도 기존 경험을 잃지 않고 새로운 역할과 환경에 결합하여 다음 기반으로 만드는 구조이다.",
  
      moderate:
        "변화를 받아들일 수 있으나 기존 경험과 새로운 역할을 연결하는 과정이 필요한 구조이다.",
  
      limited:
        "변화 과정에서 기존 기반과 경험이 단절될 수 있어 유지할 것과 바꿀 것을 구분해야 하는 구조이다.",
    },
  
    contributionPattern: {
      strong:
        "능력과 경험을 표현·성과·책임·지식의 형태로 전환하여 현실적인 가치로 제공하는 구조이다.",
  
      moderate:
        "능력과 경험을 외부 가치로 연결할 수 있으나 자신에게 맞는 제공 방식과 역할을 구체화해야 하는 구조이다.",
  
      limited:
        "능력과 경험이 내부에 머물거나 부담으로 소모될 수 있어 현실 가치로 전환하는 통로를 만들어야 하는 구조이다.",
    },
  
    longTermCoherence: {
      strong:
        "역할과 환경이 달라져도 삶의 중심과 축적 기반을 유지하며 장기 방향을 이어가는 구조이다.",
  
      moderate:
        "장기 방향을 유지할 기반은 있으나 환경 변화에 맞춘 조정과 기반 관리가 필요한 구조이다.",
  
      limited:
        "환경과 책임 변화에 따라 삶의 중심이 분산될 수 있어 장기적으로 유지할 핵심축을 명확히 해야 하는 구조이다.",
    },
  };
  
  const DIRECTION_EXPRESSIONS: Record<
    DestinyArea,
    string
  > = {
    lifeDirection:
      "삶의 에너지를 어디에 두고 장기적으로 유지하는지가 중심이 된다.",
  
    coreLifeTask:
      "반복되는 강점과 한계가 어떤 조건에서 삶의 과제로 바뀌는지를 다루어야 한다.",
  
    strengthFulfillment:
      "타고난 강점을 일회성 성과가 아니라 지속 가능한 역할로 만드는 방향이 중요하다.",
  
    growthPath:
      "성과의 속도보다 경험과 기반이 다음 단계로 이어지는 성장 방식을 선택해야 한다.",
  
    choiceAlignment:
      "선택할 때 가능성뿐 아니라 자기 감당 범위와 장기 방향을 함께 기준으로 삼아야 한다.",
  
    changeIntegration:
      "변화 과정에서 기존 경험을 보존하고 새로운 구조에 다시 연결하는 것이 중요하다.",
  
    contributionPattern:
      "자신의 능력과 경험을 타인과 현실이 활용할 수 있는 가치로 전환해야 한다.",
  
    longTermCoherence:
      "역할과 환경이 바뀌어도 유지할 삶의 중심과 축적 기준을 분명히 해야 한다.",
  };
  
  function uniqueTexts(
    values: string[],
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
  
  function collectSupportingReasons(
    selection: DestinyAreaSelection,
  ): string[] {
    return uniqueTexts(
      selection.supportingMatches.map(
        (match) =>
          match.rule.reason,
      ),
    );
  }
  
  function collectLimitingReasons(
    selection: DestinyAreaSelection,
  ): string[] {
    return uniqueTexts(
      selection.limitingMatches.map(
        (match) =>
          match.rule.reason,
      ),
    );
  }
  
  function collectGrowthConditions(
    selection: DestinyAreaSelection,
  ): string[] {
    return uniqueTexts(
      selection.supportingMatches.flatMap(
        (match) =>
          match.evidence.conditions,
      ),
    );
  }
  
  function collectCautionConditions(
    selection: DestinyAreaSelection,
  ): string[] {
    return uniqueTexts([
      ...selection.limitingMatches.flatMap(
        (match) => [
          ...match.evidence.conditions,
          ...match.evidence.exceptions,
        ],
      ),
  
      ...selection.supportingMatches.flatMap(
        (match) =>
          match.evidence.exceptions,
      ),
    ]);
  }
  
  function buildStrengthExpression(
    selection: DestinyAreaSelection,
  ): string {
    const supportingReasons =
      collectSupportingReasons(
        selection,
      );
  
    if (supportingReasons.length > 0) {
      return supportingReasons.join(" ");
    }
  
    return "현재 확인된 구조에서는 이 영역을 뒷받침하는 독립적인 지지 근거가 충분하지 않다.";
  }
  
  function buildLimitationPattern(
    selection: DestinyAreaSelection,
  ): string {
    const limitingReasons =
      collectLimitingReasons(
        selection,
      );
  
    if (limitingReasons.length > 0) {
      return limitingReasons.join(" ");
    }
  
    if (selection.level === "strong") {
      return "현재 구조에서는 뚜렷한 제한 근거가 확인되지 않지만, 강점이 과도하게 사용되면 방향이 경직될 수 있다.";
    }
  
    return "현재 구조에서는 직접적인 제한 근거가 크지 않지만, 발현 조건이 갖춰지지 않으면 방향이 실제 삶으로 연결되지 않을 수 있다.";
  }
  
  export function buildDestinyAreaInterpretation(
    selection: DestinyAreaSelection,
  ): DestinyAreaInterpretation | null {
    if (selection.level === null) {
      return null;
    }
  
    return {
      corePattern:
        CORE_PATTERNS[
          selection.area
        ][selection.level],
  
      directionExpression:
        DIRECTION_EXPRESSIONS[
          selection.area
        ],
  
      strengthExpression:
        buildStrengthExpression(
          selection,
        ),
  
      limitationPattern:
        buildLimitationPattern(
          selection,
        ),
  
      growthConditions:
        collectGrowthConditions(
          selection,
        ),
  
      cautionConditions:
        collectCautionConditions(
          selection,
        ),
    };
  }