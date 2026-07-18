import type {
    RelationshipArea,
    RelationshipEvidence,
    RelationshipEvidenceSource,
  } from "../types/relationship";
  import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts";
  
  export type RelationshipRuleDirection =
    | "support"
    | "limit";
  
  export type RelationshipSignalKind =
    SajuStructureSignal["kind"];
  
  export type RelationshipSignalMatcher = (
    signal: SajuStructureSignal,
  ) => boolean;
  
  export type RelationshipRule = {
    id: string;
  
    area: RelationshipArea;
  
    direction:
      RelationshipRuleDirection;
  
    signalKinds?:
      readonly RelationshipSignalKind[];
  
    signalMatcher?:
      RelationshipSignalMatcher;
  
    sources?:
      readonly RelationshipEvidenceSource[];
  
    minimumWeight?: number;
  
    keywords?: readonly string[];
  
    score: number;
  
    reason: string;
  };
  
  export type RelationshipRuleMatchBasis = {
    signalMatched: boolean;
  
    sourceMatched: boolean;
  
    weightMatched: boolean;
  
    keywordMatched: boolean;
  };
  
  export type MatchedRelationshipRule = {
    rule: RelationshipRule;
  
    evidence: RelationshipEvidence;
  
    matchBasis:
      RelationshipRuleMatchBasis;
  };
  
  function isDayMasterStrengthSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "dayMasterStrength" }
  > {
    return (
      signal.kind
        === "dayMasterStrength"
    );
  }
  
  function isTenGodDominanceSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "tenGodDominance" }
  > {
    return (
      signal.kind
        === "tenGodDominance"
    );
  }
  
  function isMonthCommandSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "monthCommand" }
  > {
    return (
      signal.kind === "monthCommand"
    );
  }
  
  function isRootingSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "rooting" }
  > {
    return signal.kind === "rooting";
  }
  
  function includesAny(
    value: string,
    keywords: readonly string[],
  ): boolean {
    return keywords.some(
      (keyword) =>
        value.includes(keyword),
    );
  }
  
  function hasTenGodDominance(
    signal: SajuStructureSignal,
    tenGods: readonly string[],
  ): boolean {
    return (
      isTenGodDominanceSignal(signal)
      && signal.dominantTenGod !== null
      && includesAny(
        signal.dominantTenGod,
        tenGods,
      )
    );
  }
  
  function hasOutputDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return hasTenGodDominance(
      signal,
      ["식상", "식신", "상관"],
    );
  }
  
  function hasWealthDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return hasTenGodDominance(
      signal,
      ["재성", "정재", "편재"],
    );
  }
  
  function hasOfficerDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return hasTenGodDominance(
      signal,
      ["관성", "정관", "편관"],
    );
  }
  
  function hasResourceDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return hasTenGodDominance(
      signal,
      ["인성", "정인", "편인"],
    );
  }
  
  function hasPeerDominance(
    signal: SajuStructureSignal,
  ): boolean {
    return hasTenGodDominance(
      signal,
      ["비겁", "비견", "겁재"],
    );
  }
  
  function isBalancedDayMaster(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isDayMasterStrengthSignal(signal)
      && signal.type === "balanced"
    );
  }
  
  function isStrongDayMaster(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isDayMasterStrengthSignal(signal)
      && signal.type === "strong"
    );
  }
  
  function isWeakDayMaster(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isDayMasterStrengthSignal(signal)
      && signal.type === "weak"
    );
  }
  
  function isSupportedMonthCommand(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isMonthCommandSignal(signal)
      && signal.supported === true
    );
  }
  
  function isUnsupportedMonthCommand(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isMonthCommandSignal(signal)
      && signal.supported === false
    );
  }
  
  function isRooted(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isRootingSignal(signal)
      && signal.rooted
    );
  }
  
  function isUnrooted(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isRootingSignal(signal)
      && !signal.rooted
    );
  }
  
  function isDistributedTenGodStructure(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isTenGodDominanceSignal(signal)
      && signal.distributed
    );
  }
  
  function isConcentratedTenGodStructure(
    signal: SajuStructureSignal,
  ): boolean {
    return (
      isTenGodDominanceSignal(signal)
      && !signal.distributed
    );
  }
  
  const DESCRIPTION_SOURCES:
    readonly RelationshipEvidenceSource[] = [
      "structure",
      "tenGodStrength",
      "fiveElementFlow",
      "rooting",
      "usefulGod",
      "interaction",
    ];
  
  const SIGNAL_RULES:
    RelationshipRule[] = [
      {
        id:
          "connection-output-support",
        area: "connectionExpansion",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasOutputDominance,
        score: 3,
        reason:
          "식상 중심 구조는 표현과 반응을 통해 사람과 연결되는 힘을 지원한다.",
      },
      {
        id:
          "connection-wealth-support",
        area: "connectionExpansion",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasWealthDominance,
        score: 3,
        reason:
          "재성 중심 구조는 현실 교류와 기회 연결을 통해 관계의 폭을 넓히는 힘을 지원한다.",
      },
      {
        id:
          "connection-distributed-support",
        area: "connectionExpansion",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          isDistributedTenGodStructure,
        score: 2,
        reason:
          "십성이 분산된 구조는 서로 다른 사람과 역할을 연결하는 적응력을 지원한다.",
      },
      {
        id:
          "connection-concentrated-limit",
        area: "connectionExpansion",
        direction: "limit",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          isConcentratedTenGodStructure,
        score: 2,
        reason:
          "십성이 한 기능에 집중된 구조는 관계 방식과 연결 범위를 좁힐 수 있다.",
      },
  
      {
        id:
          "intimacy-balanced-support",
        area: "intimacyMaintenance",
        direction: "support",
        signalKinds: [
          "dayMasterStrength",
        ],
        signalMatcher:
          isBalancedDayMaster,
        score: 3,
        reason:
          "균형 일간은 자기 요구와 상대 요구를 함께 감당하여 가까운 관계를 유지하는 힘을 지원한다.",
      },
      {
        id:
          "intimacy-rooted-support",
        area: "intimacyMaintenance",
        direction: "support",
        signalKinds: ["rooting"],
        signalMatcher: isRooted,
        score: 3,
        reason:
          "통근 구조는 관계 부담이 생겨도 쉽게 이탈하지 않고 친밀성을 유지하는 기반을 지원한다.",
      },
      {
        id:
          "intimacy-supported-month",
        area: "intimacyMaintenance",
        direction: "support",
        signalKinds: ["monthCommand"],
        signalMatcher:
          isSupportedMonthCommand,
        score: 2,
        reason:
          "월령 지원은 가까운 관계가 안정적으로 지속될 환경 기반을 지원한다.",
      },
      {
        id:
          "intimacy-unrooted-limit",
        area: "intimacyMaintenance",
        direction: "limit",
        signalKinds: ["rooting"],
        signalMatcher: isUnrooted,
        score: 3,
        reason:
          "무근 구조는 관계 부담이 커질 때 친밀성을 오래 유지하는 힘을 제한한다.",
      },
  
      {
        id:
          "emotion-output-support",
        area: "emotionalExchange",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasOutputDominance,
        score: 3,
        reason:
          "식상 중심 구조는 감정과 생각을 표현하고 상대 반응을 이끌어내는 힘을 지원한다.",
      },
      {
        id:
          "emotion-resource-support",
        area: "emotionalExchange",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasResourceDominance,
        score: 3,
        reason:
          "인성 중심 구조는 상대의 감정과 맥락을 받아들이고 이해하는 힘을 지원한다.",
      },
      {
        id:
          "emotion-balanced-support",
        area: "emotionalExchange",
        direction: "support",
        signalKinds: [
          "dayMasterStrength",
        ],
        signalMatcher:
          isBalancedDayMaster,
        score: 2,
        reason:
          "균형 일간은 표현과 수용 사이의 균형을 유지하는 힘을 지원한다.",
      },
      {
        id:
          "emotion-strong-limit",
        area: "emotionalExchange",
        direction: "limit",
        signalKinds: [
          "dayMasterStrength",
        ],
        signalMatcher:
          isStrongDayMaster,
        score: 1,
        reason:
          "강한 일간은 자기 기준이 앞설 때 상대 감정의 수용 범위를 좁힐 수 있다.",
      },
  
      {
        id:
          "boundary-strong-support",
        area: "boundaryMaintenance",
        direction: "support",
        signalKinds: [
          "dayMasterStrength",
        ],
        signalMatcher:
          isStrongDayMaster,
        score: 3,
        reason:
          "강한 일간은 관계 속에서도 자기 기준과 책임 범위를 지키는 힘을 지원한다.",
      },
      {
        id:
          "boundary-balanced-support",
        area: "boundaryMaintenance",
        direction: "support",
        signalKinds: [
          "dayMasterStrength",
        ],
        signalMatcher:
          isBalancedDayMaster,
        score: 3,
        reason:
          "균형 일간은 자기 경계와 상대 요구 사이를 조정하는 힘을 지원한다.",
      },
      {
        id:
          "boundary-officer-support",
        area: "boundaryMaintenance",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasOfficerDominance,
        score: 2,
        reason:
          "관성 중심 구조는 역할과 책임의 기준을 세워 관계 경계를 유지하는 힘을 지원한다.",
      },
      {
        id:
          "boundary-weak-limit",
        area: "boundaryMaintenance",
        direction: "limit",
        signalKinds: [
          "dayMasterStrength",
        ],
        signalMatcher:
          isWeakDayMaster,
        score: 3,
        reason:
          "약한 일간은 상대의 요구와 책임을 과도하게 떠안아 자기 경계가 약해질 수 있다.",
      },
  
      {
        id:
          "conflict-balanced-support",
        area: "conflictAdjustment",
        direction: "support",
        signalKinds: [
          "dayMasterStrength",
        ],
        signalMatcher:
          isBalancedDayMaster,
        score: 3,
        reason:
          "균형 일간은 충돌 상황에서 자기 입장과 상대 입장을 함께 조정하는 힘을 지원한다.",
      },
      {
        id:
          "conflict-officer-support",
        area: "conflictAdjustment",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasOfficerDominance,
        score: 3,
        reason:
          "관성 중심 구조는 기준과 책임을 정해 갈등을 조정하는 힘을 지원한다.",
      },
      {
        id:
          "conflict-peer-limit",
        area: "conflictAdjustment",
        direction: "limit",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasPeerDominance,
        score: 2,
        reason:
          "비겁 중심 구조는 주도권과 이익 기준이 충돌할 때 경쟁을 강화할 수 있다.",
      },
      {
        id:
          "conflict-weak-limit",
        area: "conflictAdjustment",
        direction: "limit",
        signalKinds: [
          "dayMasterStrength",
        ],
        signalMatcher:
          isWeakDayMaster,
        score: 3,
        reason:
          "약한 일간은 갈등 압력을 오래 견디지 못해 회피하거나 관계 부담을 누적할 수 있다.",
      },
  
      {
        id:
          "trust-rooted-support",
        area: "trustRecovery",
        direction: "support",
        signalKinds: ["rooting"],
        signalMatcher: isRooted,
        score: 3,
        reason:
          "통근 구조는 신뢰가 흔들린 뒤에도 관계를 다시 정리하고 회복할 기반을 지원한다.",
      },
      {
        id:
          "trust-resource-support",
        area: "trustRecovery",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasResourceDominance,
        score: 2,
        reason:
          "인성 중심 구조는 관계의 맥락과 원인을 이해하여 신뢰를 복구하는 힘을 지원한다.",
      },
      {
        id:
          "trust-supported-month",
        area: "trustRecovery",
        direction: "support",
        signalKinds: ["monthCommand"],
        signalMatcher:
          isSupportedMonthCommand,
        score: 2,
        reason:
          "월령 지원은 관계 회복에 필요한 시간과 환경 기반을 지원한다.",
      },
      {
        id:
          "trust-unrooted-limit",
        area: "trustRecovery",
        direction: "limit",
        signalKinds: ["rooting"],
        signalMatcher: isUnrooted,
        score: 3,
        reason:
          "무근 구조는 신뢰가 깨진 뒤 관계를 다시 유지할 기반을 제한한다.",
      },
  
      {
        id:
          "partnership-wealth-support",
        area:
          "partnershipCooperation",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasWealthDominance,
        score: 3,
        reason:
          "재성 중심 구조는 현실 목표와 자원 배분을 기준으로 협력하는 힘을 지원한다.",
      },
      {
        id:
          "partnership-officer-support",
        area:
          "partnershipCooperation",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasOfficerDominance,
        score: 3,
        reason:
          "관성 중심 구조는 역할과 책임을 분리하여 협업 질서를 유지하는 힘을 지원한다.",
      },
      {
        id:
          "partnership-distributed-support",
        area:
          "partnershipCooperation",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          isDistributedTenGodStructure,
        score: 2,
        reason:
          "십성이 분산된 구조는 서로 다른 역할과 이해관계를 조율하는 힘을 지원한다.",
      },
      {
        id:
          "partnership-peer-limit",
        area:
          "partnershipCooperation",
        direction: "limit",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasPeerDominance,
        score: 3,
        reason:
          "비겁 중심 구조는 동업과 협업에서 주도권과 이익 배분 충돌을 키울 수 있다.",
      },
  
      {
        id:
          "spouse-balanced-support",
        area: "spouseBonding",
        direction: "support",
        signalKinds: [
          "dayMasterStrength",
        ],
        signalMatcher:
          isBalancedDayMaster,
        score: 3,
        reason:
          "균형 일간은 배우자 관계에서 자기 책임과 상대 요구를 함께 유지하는 힘을 지원한다.",
      },
      {
        id:
          "spouse-rooted-support",
        area: "spouseBonding",
        direction: "support",
        signalKinds: ["rooting"],
        signalMatcher: isRooted,
        score: 3,
        reason:
          "통근 구조는 배우자 관계의 친밀감과 생활 책임을 장기간 유지하는 기반을 지원한다.",
      },
      {
        id:
          "spouse-wealth-support",
        area: "spouseBonding",
        direction: "support",
        signalKinds: [
          "tenGodDominance",
        ],
        signalMatcher:
          hasWealthDominance,
        score: 2,
        reason:
          "재성 중심 구조는 배우자 관계에서 현실 책임과 생활 자원을 함께 관리하는 힘을 지원한다.",
      },
      {
        id:
          "spouse-unsupported-limit",
        area: "spouseBonding",
        direction: "limit",
        signalKinds: ["monthCommand"],
        signalMatcher:
          isUnsupportedMonthCommand,
        score: 2,
        reason:
          "월령의 비지원은 가까운 관계와 생활 책임을 안정적으로 유지하는 환경 기반을 제한할 수 있다.",
      },
    ];
  
  type DescriptionRuleDefinition = {
    area: RelationshipArea;
  
    supportKeywords: readonly string[];
  
    limitKeywords: readonly string[];
  };
  
  const DESCRIPTION_RULE_DEFINITIONS:
    DescriptionRuleDefinition[] = [
      {
        area: "connectionExpansion",
        supportKeywords: [
          "사람과 연결",
          "관계 확장",
          "인맥",
          "교류",
          "네트워크",
        ],
        limitKeywords: [
          "관계 단절",
          "고립",
          "연결 제한",
          "교류 부족",
          "관계 축소",
        ],
      },
      {
        area: "intimacyMaintenance",
        supportKeywords: [
          "가까운 관계",
          "친밀감",
          "관계 유지",
          "오래 유지",
          "정서적 안정",
        ],
        limitKeywords: [
          "친밀감 약화",
          "관계 이탈",
          "가까운 관계 부담",
          "거리 두기",
          "관계 유지 어려움",
        ],
      },
      {
        area: "emotionalExchange",
        supportKeywords: [
          "감정 표현",
          "감정 수용",
          "공감",
          "소통",
          "정서 교류",
        ],
        limitKeywords: [
          "감정 억제",
          "소통 단절",
          "공감 부족",
          "감정 부담",
          "정서 충돌",
        ],
      },
      {
        area: "boundaryMaintenance",
        supportKeywords: [
          "관계 경계",
          "책임 분리",
          "자기 기준",
          "역할 구분",
          "거리 조절",
        ],
        limitKeywords: [
          "책임 집중",
          "경계 약화",
          "과도한 희생",
          "타인 문제",
          "관계 의존",
        ],
      },
      {
        area: "conflictAdjustment",
        supportKeywords: [
          "갈등 조정",
          "충돌 조율",
          "합의",
          "중재",
          "문제 해결",
        ],
        limitKeywords: [
          "갈등 반복",
          "충돌 확대",
          "주도권 충돌",
          "관계 회피",
          "대립",
        ],
      },
      {
        area: "trustRecovery",
        supportKeywords: [
          "신뢰 회복",
          "관계 복구",
          "화해",
          "다시 연결",
          "회복",
        ],
        limitKeywords: [
          "신뢰 단절",
          "배신",
          "관계 복구 어려움",
          "불신",
          "관계 종료",
        ],
      },
      {
        area:
          "partnershipCooperation",
        supportKeywords: [
          "협력",
          "협업",
          "동업",
          "역할 분담",
          "이익 배분",
        ],
        limitKeywords: [
          "동업 충돌",
          "협업 갈등",
          "이익 배분 충돌",
          "역할 충돌",
          "주도권 경쟁",
        ],
      },
      {
        area: "spouseBonding",
        supportKeywords: [
          "배우자 관계",
          "부부 관계",
          "생활 책임",
          "친밀한 관계",
          "동반자",
        ],
        limitKeywords: [
          "배우자 충돌",
          "부부 갈등",
          "친밀감 단절",
          "생활 책임 충돌",
          "관계 소진",
        ],
      },
    ];
  
  function buildDescriptionRules():
    RelationshipRule[] {
    return DESCRIPTION_RULE_DEFINITIONS
      .flatMap(
        (
          definition,
        ): RelationshipRule[] => [
          {
            id:
              `${definition.area}-description-support`,
            area: definition.area,
            direction: "support",
            sources:
              DESCRIPTION_SOURCES,
            minimumWeight: 2,
            keywords:
              definition.supportKeywords,
            score: 1,
            reason:
              `${definition.area} 영역을 지원하는 설명 근거가 확인된다.`,
          },
          {
            id:
              `${definition.area}-description-limit`,
            area: definition.area,
            direction: "limit",
            sources:
              DESCRIPTION_SOURCES,
            minimumWeight: 2,
            keywords:
              definition.limitKeywords,
            score: 1,
            reason:
              `${definition.area} 영역을 제한하는 설명 근거가 확인된다.`,
          },
        ],
      );
  }
  
  export const RELATIONSHIP_RULES:
    readonly RelationshipRule[] = [
      ...SIGNAL_RULES,
      ...buildDescriptionRules(),
    ];
  
  function normalizeDescription(
    description: string,
  ): string {
    return description
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }
  
  function matchesSignal(
    rule: RelationshipRule,
    evidence: RelationshipEvidence,
  ): boolean {
    const requiresSignal =
      rule.signalKinds !== undefined
      || rule.signalMatcher !== undefined;
  
    if (
      !requiresSignal
      || !evidence.signal
    ) {
      return false;
    }
  
    if (
      rule.signalKinds
      && !rule.signalKinds.includes(
        evidence.signal.kind,
      )
    ) {
      return false;
    }
  
    if (
      rule.signalMatcher
      && !rule.signalMatcher(
        evidence.signal,
      )
    ) {
      return false;
    }
  
    return true;
  }
  
  function matchesSource(
    rule: RelationshipRule,
    evidence: RelationshipEvidence,
  ): boolean {
    return (
      rule.sources?.includes(
        evidence.source,
      )
      ?? false
    );
  }
  
  function matchesWeight(
    rule: RelationshipRule,
    evidence: RelationshipEvidence,
  ): boolean {
    return (
      rule.minimumWeight !== undefined
      && evidence.weight
        >= rule.minimumWeight
    );
  }
  
  function matchesKeyword(
    rule: RelationshipRule,
    evidence: RelationshipEvidence,
  ): boolean {
    if (
      !rule.keywords
      || rule.keywords.length === 0
    ) {
      return false;
    }
  
    const normalized =
      normalizeDescription(
        evidence.description,
      );
  
    return rule.keywords.some(
      (keyword) =>
        normalized.includes(
          keyword.toLowerCase(),
        ),
    );
  }
  
  function isRuleMatched(
    rule: RelationshipRule,
    basis:
      RelationshipRuleMatchBasis,
  ): boolean {
    if (
      (
        rule.signalKinds !== undefined
        || rule.signalMatcher
          !== undefined
      )
      && !basis.signalMatched
    ) {
      return false;
    }
  
    if (
      rule.sources !== undefined
      && !basis.sourceMatched
    ) {
      return false;
    }
  
    if (
      rule.minimumWeight !== undefined
      && !basis.weightMatched
    ) {
      return false;
    }
  
    if (
      rule.keywords !== undefined
      && rule.keywords.length > 0
      && !basis.keywordMatched
    ) {
      return false;
    }
  
    return true;
  }
  
  export function matchRelationshipRules(
    evidenceList:
      RelationshipEvidence[],
  ): MatchedRelationshipRule[] {
    const matched:
      MatchedRelationshipRule[] = [];
  
    for (
      const evidence
      of evidenceList
    ) {
      for (
        const rule
        of RELATIONSHIP_RULES
      ) {
        const matchBasis:
          RelationshipRuleMatchBasis = {
            signalMatched:
              matchesSignal(
                rule,
                evidence,
              ),
  
            sourceMatched:
              matchesSource(
                rule,
                evidence,
              ),
  
            weightMatched:
              matchesWeight(
                rule,
                evidence,
              ),
  
            keywordMatched:
              matchesKeyword(
                rule,
                evidence,
              ),
          };
  
        if (
          !isRuleMatched(
            rule,
            matchBasis,
          )
        ) {
          continue;
        }
  
        matched.push({
          rule,
          evidence,
          matchBasis,
        });
      }
    }
  
    return matched;
  }