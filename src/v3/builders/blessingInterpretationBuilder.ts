import type {
    BlessingArea,
    BlessingInterpretation,
    BlessingLevel,
  } from "../masterReader/types/blessing";
  import type {
    BlessingAreaSelection,
  } from "../masterReader/readers/blessingSelector";
  import {
    buildBlessingAreaInterpretation,
  } from "./blessingAreaInterpretationBuilder";
  
  const BLESSING_AREAS:
    BlessingArea[] = [
      "opportunityReception",
      "benefactorConnection",
      "relationshipSupport",
      "resourceSupport",
      "environmentSupport",
      "crisisProtection",
      "blessingRetention",
      "blessingCirculation",
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
    selections: BlessingAreaSelection[],
    area: BlessingArea,
  ): BlessingAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function getLevel(
    selections: BlessingAreaSelection[],
    area: BlessingArea,
  ): BlessingLevel | null {
    return (
      findSelection(
        selections,
        area,
      )?.level
      ?? null
    );
  }
  
  function countLevel(
    selections: BlessingAreaSelection[],
    level: BlessingLevel,
  ): number {
    return selections.filter(
      (selection) =>
        selection.level === level,
    ).length;
  }
  
  function hasAnyJudgement(
    selections: BlessingAreaSelection[],
  ): boolean {
    return selections.some(
      (selection) =>
        selection.level !== null,
    );
  }
  
  function buildCorePattern(
    selections: BlessingAreaSelection[],
  ): string {
    const opportunity =
      getLevel(
        selections,
        "opportunityReception",
      );
  
    const benefactor =
      getLevel(
        selections,
        "benefactorConnection",
      );
  
    const relationship =
      getLevel(
        selections,
        "relationshipSupport",
      );
  
    const resource =
      getLevel(
        selections,
        "resourceSupport",
      );
  
    const retention =
      getLevel(
        selections,
        "blessingRetention",
      );
  
    const circulation =
      getLevel(
        selections,
        "blessingCirculation",
      );
  
    if (
      opportunity === "strong"
      && retention === "strong"
    ) {
      return "들어온 기회를 자기 기반으로 정착시키며 복의 통로를 장기적으로 유지하는 구조이다.";
    }
  
    if (
      benefactor === "strong"
      && relationship === "strong"
    ) {
      return "사람과의 신뢰 관계를 통해 조언·보호·협력의 도움을 받아들이는 구조이다.";
    }
  
    if (
      resource === "strong"
      && circulation === "strong"
    ) {
      return "지식·정보·현실 자원을 받아 성과와 기여로 다시 순환시키는 구조이다.";
    }
  
    if (
      opportunity === "strong"
      && retention === "limited"
    ) {
      return "기회는 비교적 잘 들어오지만 이를 장기적인 기반으로 유지하는 관리가 필요한 구조이다.";
    }
  
    if (
      benefactor === "limited"
      && relationship === "limited"
    ) {
      return "사람을 통한 지원 통로가 제한될 수 있어 역할과 신뢰를 단계적으로 형성해야 하는 구조이다.";
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
      return "기회·사람·자원·환경을 통해 들어온 도움을 비교적 안정적으로 받아들이고 유지하는 구조이다.";
    }
  
    if (limitedCount >= 4) {
      return "복의 유입 통로가 제한적으로 나타나므로 작은 도움을 실제 기반으로 전환하는 과정이 중요한 구조이다.";
    }
  
    return "복은 한 번의 우연보다 사람·자원·환경과의 연결을 통해 조건부로 들어오고 유지되는 구조이다.";
  }
  
  function buildAreaPattern(
    selections: BlessingAreaSelection[],
    area: BlessingArea,
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
      buildBlessingAreaInterpretation(
        selection,
      );
  
    return (
      interpretation?.corePattern
      ?? pendingText
    );
  }
  
  export function buildBlessingInterpretation(
    selections: BlessingAreaSelection[],
  ): BlessingInterpretation | null {
    if (!hasAnyJudgement(selections)) {
      return null;
    }
  
    const normalizedSelections =
      BLESSING_AREAS.map(
        (area) =>
          findSelection(
            selections,
            area,
          ),
      ).filter(
        (
          selection,
        ): selection is BlessingAreaSelection =>
          selection !== null,
      );
  
    const interpretations =
      normalizedSelections.flatMap(
        (selection) => {
          const interpretation =
            buildBlessingAreaInterpretation(
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
  
      opportunityPattern:
        buildAreaPattern(
          normalizedSelections,
          "opportunityReception",
          "현재 근거만으로 기회 수용 구조를 판단하기 어렵다.",
        ),
  
      benefactorPattern:
        buildAreaPattern(
          normalizedSelections,
          "benefactorConnection",
          "현재 근거만으로 귀인 연결 구조를 판단하기 어렵다.",
        ),
  
      relationshipSupportPattern:
        buildAreaPattern(
          normalizedSelections,
          "relationshipSupport",
          "현재 근거만으로 관계 지원 구조를 판단하기 어렵다.",
        ),
  
      resourceSupportPattern:
        buildAreaPattern(
          normalizedSelections,
          "resourceSupport",
          "현재 근거만으로 자원 지원 구조를 판단하기 어렵다.",
        ),
  
      environmentSupportPattern:
        buildAreaPattern(
          normalizedSelections,
          "environmentSupport",
          "현재 근거만으로 환경 지원 구조를 판단하기 어렵다.",
        ),
  
      crisisProtectionPattern:
        buildAreaPattern(
          normalizedSelections,
          "crisisProtection",
          "현재 근거만으로 위기 보호 구조를 판단하기 어렵다.",
        ),
  
      retentionPattern:
        buildAreaPattern(
          normalizedSelections,
          "blessingRetention",
          "현재 근거만으로 복의 유지 구조를 판단하기 어렵다.",
        ),
  
      circulationPattern:
        buildAreaPattern(
          normalizedSelections,
          "blessingCirculation",
          "현재 근거만으로 복의 순환 구조를 판단하기 어렵다.",
        ),
  
      supportiveConditions:
        unique(
          interpretations.flatMap(
            (interpretation) =>
              interpretation
                .supportiveConditions,
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