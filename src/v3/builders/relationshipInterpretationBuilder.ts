import type {
    RelationshipArea,
    RelationshipInterpretation,
    RelationshipLevel,
  } from "../masterReader/types/relationship";
  import type {
    RelationshipAreaSelection,
  } from "../masterReader/readers/relationshipSelector";
  import {
    buildRelationshipAreaInterpretation,
  } from "./relationshipAreaInterpretationBuilder";
  
  const RELATIONSHIP_AREAS:
    RelationshipArea[] = [
      "connectionExpansion",
      "intimacyMaintenance",
      "emotionalExchange",
      "boundaryMaintenance",
      "conflictAdjustment",
      "trustRecovery",
      "partnershipCooperation",
      "spouseBonding",
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
    selections:
      RelationshipAreaSelection[],
    area: RelationshipArea,
  ): RelationshipAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function getLevel(
    selections:
      RelationshipAreaSelection[],
    area: RelationshipArea,
  ): RelationshipLevel | null {
    return (
      findSelection(
        selections,
        area,
      )?.level
      ?? null
    );
  }
  
  function countLevel(
    selections:
      RelationshipAreaSelection[],
    level: RelationshipLevel,
  ): number {
    return selections.filter(
      (selection) =>
        selection.level === level,
    ).length;
  }
  
  function hasAnyJudgement(
    selections:
      RelationshipAreaSelection[],
  ): boolean {
    return selections.some(
      (selection) =>
        selection.level !== null,
    );
  }
  
  function buildCorePattern(
    selections:
      RelationshipAreaSelection[],
  ): string {
    const connectionExpansion =
      getLevel(
        selections,
        "connectionExpansion",
      );
  
    const intimacyMaintenance =
      getLevel(
        selections,
        "intimacyMaintenance",
      );
  
    const boundaryMaintenance =
      getLevel(
        selections,
        "boundaryMaintenance",
      );
  
    const conflictAdjustment =
      getLevel(
        selections,
        "conflictAdjustment",
      );
  
    const partnershipCooperation =
      getLevel(
        selections,
        "partnershipCooperation",
      );
  
    const spouseBonding =
      getLevel(
        selections,
        "spouseBonding",
      );
  
    if (
      connectionExpansion === "strong"
      && intimacyMaintenance
        === "limited"
    ) {
      return "사람과 연결되는 폭은 넓지만 가까운 관계에서는 감정과 책임의 부담을 조절해야 안정되는 구조이다.";
    }
  
    if (
      intimacyMaintenance === "strong"
      && boundaryMaintenance
        === "limited"
    ) {
      return "가까운 관계를 오래 유지하는 힘은 강하지만 상대의 감정과 책임까지 떠안지 않도록 경계를 세워야 하는 구조이다.";
    }
  
    if (
      boundaryMaintenance === "strong"
      && conflictAdjustment
        === "strong"
    ) {
      return "관계 안에서 자기 기준을 지키면서 충돌의 쟁점과 책임을 조정하여 신뢰를 유지하는 구조이다.";
    }
  
    if (
      partnershipCooperation
        === "strong"
      && spouseBonding === "strong"
    ) {
      return "역할과 책임을 나누며 협력하고 가까운 관계에서는 생활과 장기 목표를 함께 유지하는 구조이다.";
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
      return "관계의 폭과 깊이, 감정 교류와 갈등 조정을 함께 유지하며 협력 관계를 안정적으로 발전시키는 구조이다.";
    }
  
    if (limitedCount >= 4) {
      return "관계의 폭을 무리하게 넓히기보다 역할과 경계를 분명히 하고 신뢰할 수 있는 관계에 선택적으로 집중해야 하는 구조이다.";
    }
  
    return "관계의 성격과 신뢰 수준에 따라 연결의 폭·친밀감·경계를 조절하며 관계를 유지하는 구조이다.";
  }
  
  function buildConnectionMethod(
    level: RelationshipLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "다양한 사람과 빠르게 접점을 만들고 관계를 통해 정보와 기회를 연결한다.";
  
      case "moderate":
        return "필요와 목적이 분명한 관계부터 단계적으로 연결 범위를 넓힌다.";
  
      case "limited":
        return "관계를 넓히기보다 신뢰할 수 있는 소수와 반복적으로 연결한다.";
  
      case null:
        return "사람과 연결되는 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildIntimacyMethod(
    level: RelationshipLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "가까운 사람의 감정과 책임을 오래 감당하며 친밀감과 신뢰를 축적한다.";
  
      case "moderate":
        return "상호 책임과 개인 공간이 균형을 이룰 때 가까운 관계를 안정적으로 유지한다.";
  
      case "limited":
        return "친밀감의 속도와 책임 범위를 제한하고 충분한 개인 공간을 확보해야 관계가 안정된다.";
  
      case null:
        return "가까운 관계를 유지하는 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildEmotionalExchangeMethod(
    level: RelationshipLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "감정과 생각을 적극적으로 표현하고 상대 반응을 받아 관계 흐름을 만든다.";
  
      case "moderate":
        return "상황과 신뢰 수준에 따라 감정을 선택적으로 표현하고 수용한다.";
  
      case "limited":
        return "감정을 즉시 표현하기보다 행동과 거리 조절을 통해 관계를 관리한다.";
  
      case null:
        return "감정 교류 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildBoundaryMethod(
    level: RelationshipLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "가까운 관계에서도 자기 기준과 상대 책임을 구분하며 경계를 명확히 유지한다.";
  
      case "moderate":
        return "관계의 성격과 신뢰 수준에 따라 도움과 책임의 범위를 조절한다.";
  
      case "limited":
        return "역할과 책임을 명시하고 거절 기준을 세워 타인의 문제를 과도하게 떠안지 않아야 한다.";
  
      case null:
        return "관계 경계를 유지하는 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildConflictMethod(
    level: RelationshipLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "충돌 상황에서도 쟁점과 책임을 나누고 합의 가능한 지점을 찾아 관계를 재조정한다.";
  
      case "moderate":
        return "갈등의 강도와 관계 중요도에 따라 대화와 거리 조절을 선택한다.";
  
      case "limited":
        return "감정이 높을 때 결론을 피하고 정리 시간과 중재 기준을 확보해야 한다.";
  
      case null:
        return "갈등 조정 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildTrustRecoveryMethod(
    level: RelationshipLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "신뢰가 흔들려도 원인을 이해하고 관계 규칙을 다시 합의하여 회복 통로를 만든다.";
  
      case "moderate":
        return "상대의 책임 인정과 행동 변화를 확인한 뒤 관계 회복 여부를 결정한다.";
  
      case "limited":
        return "신뢰 훼손 뒤 즉시 관계를 재개하지 않고 책임 인정과 변화가 확인될 때까지 거리를 유지한다.";
  
      case null:
        return "신뢰 회복 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildPartnershipMethod(
    level: RelationshipLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "서로 다른 역할과 자원을 조율하여 공동 목표와 성과를 만드는 방식으로 협력한다.";
  
      case "moderate":
        return "역할·의사결정·배분 기준이 명확할 때 조건부로 협력한다.";
  
      case "limited":
        return "동업보다 독립 책임 구조가 안정적이며 협력할 때는 역할과 이익을 계약으로 분리해야 한다.";
  
      case null:
        return "동업과 협업 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function buildSpouseBondingMethod(
    level: RelationshipLevel | null,
  ): string {
    switch (level) {
      case "strong":
        return "배우자와 정서적 유대·생활 책임·장기 목표를 함께 조율하며 동반자 관계를 만든다.";
  
      case "moderate":
        return "친밀감과 개인 생활의 균형을 유지하며 배우자 역할과 책임을 대화로 조정한다.";
  
      case "limited":
        return "개인 공간과 생활 책임을 분명히 나누고 친밀감과 의무를 구분해야 관계가 안정된다.";
  
      case null:
        return "배우자 관계의 결속 방식을 판단할 근거가 충분하지 않다.";
    }
  }
  
  function collectConditions(
    selections:
      RelationshipAreaSelection[],
    type:
      | "suitable"
      | "caution",
  ): string[] {
    const values: string[] = [];
  
    for (const area of RELATIONSHIP_AREAS) {
      const selection =
        findSelection(
          selections,
          area,
        );
  
      if (!selection) {
        continue;
      }
  
      const interpretation =
        buildRelationshipAreaInterpretation(
          selection,
        );
  
      if (!interpretation) {
        continue;
      }
  
      if (type === "suitable") {
        values.push(
          ...interpretation
            .suitableConditions,
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
  
  export function buildRelationshipInterpretation(
    selections:
      RelationshipAreaSelection[],
  ): RelationshipInterpretation | null {
    if (!hasAnyJudgement(selections)) {
      return null;
    }
  
    return {
      corePattern:
        buildCorePattern(selections),
  
      connectionMethod:
        buildConnectionMethod(
          getLevel(
            selections,
            "connectionExpansion",
          ),
        ),
  
      intimacyMethod:
        buildIntimacyMethod(
          getLevel(
            selections,
            "intimacyMaintenance",
          ),
        ),
  
      emotionalExchangeMethod:
        buildEmotionalExchangeMethod(
          getLevel(
            selections,
            "emotionalExchange",
          ),
        ),
  
      boundaryMethod:
        buildBoundaryMethod(
          getLevel(
            selections,
            "boundaryMaintenance",
          ),
        ),
  
      conflictMethod:
        buildConflictMethod(
          getLevel(
            selections,
            "conflictAdjustment",
          ),
        ),
  
      trustRecoveryMethod:
        buildTrustRecoveryMethod(
          getLevel(
            selections,
            "trustRecovery",
          ),
        ),
  
      partnershipMethod:
        buildPartnershipMethod(
          getLevel(
            selections,
            "partnershipCooperation",
          ),
        ),
  
      spouseBondingMethod:
        buildSpouseBondingMethod(
          getLevel(
            selections,
            "spouseBonding",
          ),
        ),
  
      suitableConditions:
        collectConditions(
          selections,
          "suitable",
        ),
  
      cautionConditions:
        collectConditions(
          selections,
          "caution",
        ),
    };
  }