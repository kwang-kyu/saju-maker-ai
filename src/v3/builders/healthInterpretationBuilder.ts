import type {
    HealthArea,
    HealthInterpretation,
    HealthLevel,
  } from "../masterReader/types/health";
  import type {
    HealthAreaSelection,
  } from "../masterReader/readers/healthSelector";
  import {
    buildHealthAreaInterpretation,
  } from "./healthAreaInterpretationBuilder";
  
  const HEALTH_AREAS:
    HealthArea[] = [
      "vitalityStability",
      "stressRegulation",
      "fatigueManagement",
      "recoveryCapacity",
      "rhythmMaintenance",
      "overloadTolerance",
      "habitSelfManagement",
      "imbalanceAdaptation",
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
    selections: HealthAreaSelection[],
    area: HealthArea,
  ): HealthAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function getLevel(
    selections: HealthAreaSelection[],
    area: HealthArea,
  ): HealthLevel | null {
    return (
      findSelection(
        selections,
        area,
      )?.level
      ?? null
    );
  }
  
  function countLevel(
    selections: HealthAreaSelection[],
    level: HealthLevel,
  ): number {
    return selections.filter(
      (selection) =>
        selection.level === level,
    ).length;
  }
  
  function hasAnyJudgement(
    selections: HealthAreaSelection[],
  ): boolean {
    return selections.some(
      (selection) =>
        selection.level !== null,
    );
  }
  
  function buildCorePattern(
    selections: HealthAreaSelection[],
  ): string {
    const vitalityStability =
      getLevel(
        selections,
        "vitalityStability",
      );
  
    const fatigueManagement =
      getLevel(
        selections,
        "fatigueManagement",
      );
  
    const recoveryCapacity =
      getLevel(
        selections,
        "recoveryCapacity",
      );
  
    const rhythmMaintenance =
      getLevel(
        selections,
        "rhythmMaintenance",
      );
  
    const overloadTolerance =
      getLevel(
        selections,
        "overloadTolerance",
      );
  
    const habitSelfManagement =
      getLevel(
        selections,
        "habitSelfManagement",
      );
  
    const stressRegulation =
      getLevel(
        selections,
        "stressRegulation",
      );
  
    const imbalanceAdaptation =
      getLevel(
        selections,
        "imbalanceAdaptation",
      );
  
    if (
      vitalityStability === "strong"
      && fatigueManagement
        === "limited"
    ) {
      return "기본 활력은 강하지만 활동량을 과신하면 피로가 누적될 수 있어 휴식 시점을 미리 관리해야 하는 구조이다.";
    }
  
    if (
      overloadTolerance === "strong"
      && recoveryCapacity
        === "limited"
    ) {
      return "장기 압박을 버티는 힘은 강하지만 소진 뒤 회복에는 충분한 시간과 환경 조정이 필요한 구조이다.";
    }
  
    if (
      rhythmMaintenance === "strong"
      && habitSelfManagement
        === "strong"
    ) {
      return "생활 리듬과 자기관리 기준을 안정적으로 유지하여 활력·피로·회복의 균형을 관리하는 구조이다.";
    }
  
    if (
      stressRegulation === "limited"
      && imbalanceAdaptation
        === "limited"
    ) {
      return "스트레스와 환경 변화가 동시에 커질 때 생활 균형이 흔들릴 수 있어 변화의 속도와 부담 범위를 제한해야 하는 구조이다.";
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
  
    if (
      strongCount >= 5
      && limitedCount === 0
    ) {
      return "활력·스트레스·피로·회복·생활 리듬을 비교적 안정적으로 조정하며 활동 기반을 유지하는 구조이다.";
    }
  
    if (limitedCount >= 4) {
      return "활동과 책임을 무리하게 확대하기보다 생활 리듬과 회복 시간을 먼저 확보해야 안정되는 구조이다.";
    }
  
    return "환경과 활동량에 따라 활력·스트레스·피로·회복의 균형을 조절해야 안정되는 구조이다.";
  }
  
  function buildVitalityPattern(
    level: HealthLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "활동과 책임이 늘어나도 기본 활력을 비교적 안정적으로 유지한다.";
  
      case "moderate":
        return "생활 리듬과 활동량이 맞을 때 일상적인 활력을 유지한다.";
  
      case "limited":
        return "활동 범위를 작게 조절하고 회복 시간을 먼저 확보해야 활력이 안정된다.";
  
      case null:
        return "기본 활력의 안정성을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildStressPattern(
    level: HealthLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "외부 압력의 원인을 구분하고 표현·행동·휴식 방식을 바꾸며 긴장을 조절한다.";
  
      case "moderate":
        return "스트레스의 종류와 환경에 따라 표현·거리 조절·휴식을 선택한다.";
  
      case "limited":
        return "압력과 감정 부담을 작은 단위로 나누고 역할 범위를 제한해야 긴장 누적을 줄일 수 있다.";
  
      case null:
        return "스트레스 조절 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildFatiguePattern(
    level: HealthLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "활동량과 휴식 필요를 비교적 빠르게 파악하여 피로 누적을 관리한다.";
  
      case "moderate":
        return "일정과 활동 강도를 조절할 수 있을 때 피로 누적을 관리한다.";
  
      case "limited":
        return "활동 시간의 상한과 휴식 기준을 미리 정해야 피로 누적을 줄일 수 있다.";
  
      case null:
        return "피로 누적 관리 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildRecoveryPattern(
    level: HealthLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "일시적인 소진 뒤에도 휴식과 보충을 통해 활동 기반을 비교적 빠르게 회복한다.";
  
      case "moderate":
        return "적절한 휴식과 환경 지원이 있을 때 소진 뒤 안정 상태로 돌아간다.";
  
      case "limited":
        return "소진 뒤 충분한 회복 기간과 외부 요구가 적은 환경이 필요하다.";
  
      case null:
        return "소진 후 회복 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildRhythmPattern(
    level: HealthLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "환경 변화 속에서도 활동과 휴식의 기본 생활 리듬을 비교적 안정적으로 유지한다.";
  
      case "moderate":
        return "일정한 기준이 있을 때 활동·휴식·수면 리듬을 유지한다.";
  
      case "limited":
        return "기상·활동·휴식 시간을 단순하고 일정하게 고정해야 생활 리듬이 안정된다.";
  
      case null:
        return "생활 리듬 유지 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildOverloadPattern(
    level: HealthLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "일정 수준의 장기 압박과 책임 속에서도 활동 기반을 유지한다.";
  
      case "moderate":
        return "부담의 종류와 기간이 조절될 때 일정 수준의 장기 압박을 감당한다.";
  
      case "limited":
        return "책임의 상한과 역할 분담을 분명히 해야 장기 과부하를 피할 수 있다.";
  
      case null:
        return "장기 압박 감당 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildHabitPattern(
    level: HealthLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "생활 기준과 일정을 스스로 세워 자기관리 습관을 지속한다.";
  
      case "moderate":
        return "목적과 기준이 분명할 때 필요한 생활 습관을 선택적으로 유지한다.";
  
      case "limited":
        return "관리 항목을 적게 정하고 반복 가능한 작은 기준부터 유지해야 한다.";
  
      case null:
        return "생활 습관 자기관리 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildAdaptationPattern(
    level: HealthLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "환경과 일정이 바뀌어도 활동·휴식·회복 방식을 조정하여 균형을 다시 만든다.";
  
      case "moderate":
        return "변화의 범위와 속도가 조절될 때 새로운 환경에 적응하며 균형을 회복한다.";
  
      case "limited":
        return "변화를 작은 단계로 나누고 충분한 적응 기간을 확보해야 균형이 안정된다.";
  
      case null:
        return "환경 변화에 대한 적응 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function collectConditions(
    selections: HealthAreaSelection[],
    type:
      | "supportive"
      | "caution",
  ): string[] {
    const values: string[] = [];
  
    for (const area of HEALTH_AREAS) {
      const selection =
        findSelection(
          selections,
          area,
        );
  
      if (!selection) {
        continue;
      }
  
      const interpretation =
        buildHealthAreaInterpretation(
          selection,
        );
  
      if (!interpretation) {
        continue;
      }
  
      if (type === "supportive") {
        values.push(
          ...interpretation
            .supportiveConditions,
        );
  
        continue;
      }
  
      values.push(
        ...interpretation
          .cautionConditions,
      );
  
      values.push(
        ...selection.limitingMatches
          .flatMap(
            (match) => [
              ...match.evidence.conditions,
              ...match.evidence.exceptions,
            ],
          ),
      );
    }
  
    return unique(values);
  }
  
  export function buildHealthInterpretation(
    selections: HealthAreaSelection[],
  ): HealthInterpretation | null {
    if (!hasAnyJudgement(selections)) {
      return null;
    }
  
    return {
      corePattern:
        buildCorePattern(selections),
  
      vitalityPattern:
        buildVitalityPattern(
          getLevel(
            selections,
            "vitalityStability",
          ),
        ),
  
      stressPattern:
        buildStressPattern(
          getLevel(
            selections,
            "stressRegulation",
          ),
        ),
  
      fatiguePattern:
        buildFatiguePattern(
          getLevel(
            selections,
            "fatigueManagement",
          ),
        ),
  
      recoveryPattern:
        buildRecoveryPattern(
          getLevel(
            selections,
            "recoveryCapacity",
          ),
        ),
  
      rhythmPattern:
        buildRhythmPattern(
          getLevel(
            selections,
            "rhythmMaintenance",
          ),
        ),
  
      overloadPattern:
        buildOverloadPattern(
          getLevel(
            selections,
            "overloadTolerance",
          ),
        ),
  
      habitPattern:
        buildHabitPattern(
          getLevel(
            selections,
            "habitSelfManagement",
          ),
        ),
  
      adaptationPattern:
        buildAdaptationPattern(
          getLevel(
            selections,
            "imbalanceAdaptation",
          ),
        ),
  
      supportiveConditions:
        collectConditions(
          selections,
          "supportive",
        ),
  
      cautionConditions:
        collectConditions(
          selections,
          "caution",
        ),
    };
  }