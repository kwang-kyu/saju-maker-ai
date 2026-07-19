import type {
    BlessingArea,
    BlessingAreaInterpretation,
    BlessingLevel,
  } from "../masterReader/types/blessing";
  import type {
    BlessingAreaSelection,
  } from "../masterReader/readers/blessingSelector";
  
  type BlessingAreaDefinition = {
    title: string;
  
    receptionMethod: string;
  
    strongExpression: string;
  
    moderateExpression: string;
  
    limitedExpression: string;
  
    supportiveConditions: string[];
  
    cautionConditions: string[];
  };
  
  const AREA_DEFINITIONS: Record<
    BlessingArea,
    BlessingAreaDefinition
  > = {
    opportunityReception: {
      title:
        "기회 수용",
  
      receptionMethod:
        "새로운 제안과 가능성을 자기 조건에 맞게 검토하고 실행 가능한 형태로 받아들인다.",
  
      strongExpression:
        "기회를 빠르게 알아보고 자기 기반과 연결하여 실제 선택으로 전환하는 힘이 비교적 안정적이다.",
  
      moderateExpression:
        "기회를 알아보는 힘은 있으나 실행 범위와 조건이 명확할 때 수용력이 안정된다.",
  
      limitedExpression:
        "기회가 들어와도 부담과 불확실성이 커지면 수용하거나 지속하는 범위가 제한될 수 있다.",
  
      supportiveConditions: [
        "기회의 조건과 책임 범위가 명확할 것",
        "작은 실행으로 가능성을 먼저 확인할 것",
      ],
  
      cautionConditions: [
        "검증 없이 기회를 운명적 행운으로 단정하는 경우",
        "감당 범위를 넘는 제안을 한꺼번에 받아들이는 경우",
      ],
    },
  
    benefactorConnection: {
      title:
        "귀인 연결",
  
      receptionMethod:
        "조언·보호·지식·경험을 제공하는 사람과 신뢰 관계를 형성하며 도움을 받아들인다.",
  
      strongExpression:
        "필요한 시점에 조언자와 협력자를 알아보고 관계를 실제 도움으로 연결하는 힘이 비교적 안정적이다.",
  
      moderateExpression:
        "도움을 받을 통로는 있으나 신뢰 형성과 역할 구분이 명확해야 연결이 지속된다.",
  
      limitedExpression:
        "도움을 주는 사람이 나타나도 경계·의존·역할 혼선으로 연결이 약해질 수 있다.",
  
      supportiveConditions: [
        "도움의 범위와 상호 책임을 분명히 할 것",
        "조언을 실제 행동과 경험으로 검증할 것",
      ],
  
      cautionConditions: [
        "특정 인물을 무조건적인 귀인으로 이상화하는 경우",
        "자기 판단 없이 타인의 조언에 의존하는 경우",
      ],
    },
  
    relationshipSupport: {
      title:
        "관계 지원",
  
      receptionMethod:
        "가족·동료·친구·협력 관계에서 필요한 도움을 주고받으며 지원망을 만든다.",
  
      strongExpression:
        "여러 관계에서 도움을 교환하고 협력 기반을 유지하는 힘이 비교적 안정적이다.",
  
      moderateExpression:
        "관계를 통한 지원은 가능하지만 경계와 역할이 명확할 때 안정된다.",
  
      limitedExpression:
        "관계가 한쪽으로 편중되거나 책임이 불균형해지면 지원망이 부담으로 바뀔 수 있다.",
  
      supportiveConditions: [
        "도움과 책임이 일방적으로 흐르지 않을 것",
        "관계별 역할과 경계를 구분할 것",
      ],
  
      cautionConditions: [
        "관계 유지를 위해 자기 몫을 계속 포기하는 경우",
        "도움을 대가 없는 의무로 받아들이는 경우",
      ],
    },
  
    resourceSupport: {
      title:
        "자원 지원",
  
      receptionMethod:
        "지식·정보·기술·현실 자원을 필요한 목적과 연결하여 활용한다.",
  
      strongExpression:
        "필요한 자원을 알아보고 실제 기반과 성과로 전환하는 힘이 비교적 안정적이다.",
  
      moderateExpression:
        "자원 유입은 가능하지만 활용 목적과 관리 기준이 명확해야 효과가 유지된다.",
  
      limitedExpression:
        "자원이 들어와도 활용 기준이나 유지 구조가 약하면 일시적인 도움으로 끝날 수 있다.",
  
      supportiveConditions: [
        "자원의 사용 목적과 관리 기준을 정할 것",
        "받은 정보와 지원을 실제 결과로 연결할 것",
      ],
  
      cautionConditions: [
        "자원의 양만 보고 활용 가능성을 과대평가하는 경우",
        "유지 비용과 책임을 확인하지 않는 경우",
      ],
    },
  
    environmentSupport: {
      title:
        "환경 지원",
  
      receptionMethod:
        "조직·제도·지역·생활 환경에서 제공되는 기반과 질서를 자기 활동에 활용한다.",
  
      strongExpression:
        "환경의 지원 조건을 읽고 안정적인 활동 기반으로 활용하는 힘이 비교적 안정적이다.",
  
      moderateExpression:
        "환경 지원은 있으나 규칙과 조건에 적응할 때 실제 도움이 된다.",
  
      limitedExpression:
        "환경과 자기 방식의 차이가 크면 지원 조건이 있어도 활용 범위가 제한될 수 있다.",
  
      supportiveConditions: [
        "환경의 규칙과 제공 조건을 정확히 확인할 것",
        "자기 방식과 환경 요구를 조정할 것",
      ],
  
      cautionConditions: [
        "환경이 모든 문제를 해결해 줄 것으로 기대하는 경우",
        "제도와 조건을 확인하지 않고 움직이는 경우",
      ],
    },
  
    crisisProtection: {
      title:
        "위기 보호",
  
      receptionMethod:
        "어려움이 생겼을 때 내부 기반과 외부 지원망을 활용하여 충격을 분산한다.",
  
      strongExpression:
        "위기에서도 기반과 관계를 유지하며 회복 통로를 찾는 힘이 비교적 안정적이다.",
  
      moderateExpression:
        "기본적인 보호 구조는 있으나 도움을 요청하고 범위를 줄일 때 안정된다.",
  
      limitedExpression:
        "위기 때 활용할 기반이나 지원망이 약하면 부담을 혼자 떠안기 쉽다.",
  
      supportiveConditions: [
        "손실과 부담의 한도를 미리 정할 것",
        "필요할 때 도움을 요청할 통로를 확보할 것",
      ],
  
      cautionConditions: [
        "구조적 보호를 사고나 손실이 없다는 보장으로 해석하는 경우",
        "위기 신호를 무시하고 부담을 계속 확대하는 경우",
      ],
    },
  
    blessingRetention: {
      title:
        "복의 유지",
  
      receptionMethod:
        "들어온 기회·도움·자원을 일시적 혜택으로 소비하지 않고 자기 기반으로 정착시킨다.",
  
      strongExpression:
        "받은 도움을 경험·관계·자산·역량으로 전환하여 유지하는 힘이 비교적 안정적이다.",
  
      moderateExpression:
        "복을 유지할 가능성은 있으나 반복 구조와 관리 기준이 있을 때 안정된다.",
  
      limitedExpression:
        "도움이 들어와도 즉시 소진하거나 의존하면 장기적인 기반으로 남기 어려울 수 있다.",
  
      supportiveConditions: [
        "받은 도움을 반복 가능한 구조로 바꿀 것",
        "유지 비용과 책임을 함께 관리할 것",
      ],
  
      cautionConditions: [
        "일시적인 성과를 지속 가능한 복으로 단정하는 경우",
        "받은 자원을 계획 없이 빠르게 소진하는 경우",
      ],
    },
  
    blessingCirculation: {
      title:
        "복의 순환",
  
      receptionMethod:
        "받은 도움과 자원을 생산·기여·협력으로 전환하여 다시 관계와 환경으로 순환시킨다.",
  
      strongExpression:
        "도움을 성과와 기여로 바꾸고 새로운 지원 통로를 만드는 힘이 비교적 안정적이다.",
  
      moderateExpression:
        "순환 가능성은 있으나 자기 기반을 지키며 기여 범위를 조절할 때 안정된다.",
  
      limitedExpression:
        "나눔과 기여가 과도한 책임이나 자기 소진으로 바뀌면 순환 구조가 약해질 수 있다.",
  
      supportiveConditions: [
        "자기 기반을 해치지 않는 범위에서 기여할 것",
        "도움과 성과가 다시 연결되는 구조를 만들 것",
      ],
  
      cautionConditions: [
        "무조건 많이 주는 것을 복의 순환으로 해석하는 경우",
        "보상과 책임의 균형 없이 기여를 반복하는 경우",
      ],
    },
  };
  
  function buildCorePattern(
    area: BlessingArea,
    level: BlessingLevel,
  ): string {
    const definition =
      AREA_DEFINITIONS[area];
  
    switch (level) {
      case "strong":
        return `${definition.title} 구조가 강하게 나타나며, ${definition.receptionMethod}`;
  
      case "moderate":
        return `${definition.title} 구조는 보통 수준이며, 조건과 역할 범위가 명확할 때 ${definition.receptionMethod}`;
  
      case "limited":
        return `${definition.title} 구조가 제한적으로 나타나므로, 부담을 줄이고 지원 통로를 구체적으로 확인해야 한다.`;
    }
  }
  
  function buildStrengthExpression(
    area: BlessingArea,
    level: BlessingLevel,
  ): string {
    const definition =
      AREA_DEFINITIONS[area];
  
    switch (level) {
      case "strong":
        return definition.strongExpression;
  
      case "moderate":
        return definition.moderateExpression;
  
      case "limited":
        return "지원 조건을 작게 검증하고 받은 도움을 자기 기반으로 전환할 때 제한을 보완할 수 있다.";
    }
  }
  
  function buildLimitationPattern(
    area: BlessingArea,
    level: BlessingLevel,
  ): string {
    const definition =
      AREA_DEFINITIONS[area];
  
    switch (level) {
      case "strong":
        return "지원 통로가 강하더라도 과신하거나 감당 범위를 넘으면 도움을 유지하기 어려울 수 있다.";
  
      case "moderate":
        return "조건과 역할이 불분명하면 들어온 도움을 실제 기반으로 연결하지 못할 수 있다.";
  
      case "limited":
        return definition.limitedExpression;
    }
  }
  
  export function buildBlessingAreaInterpretation(
    selection: BlessingAreaSelection,
  ): BlessingAreaInterpretation | null {
    if (selection.level === null) {
      return null;
    }
  
    const definition =
      AREA_DEFINITIONS[
        selection.area
      ];
  
    return {
      corePattern:
        buildCorePattern(
          selection.area,
          selection.level,
        ),
  
      receptionMethod:
        definition.receptionMethod,
  
      strengthExpression:
        buildStrengthExpression(
          selection.area,
          selection.level,
        ),
  
      limitationPattern:
        buildLimitationPattern(
          selection.area,
          selection.level,
        ),
  
      supportiveConditions: [
        ...definition
          .supportiveConditions,
      ],
  
      cautionConditions: [
        ...definition
          .cautionConditions,
      ],
    };
  }