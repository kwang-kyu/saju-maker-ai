import type {
    CareerArea,
    CareerEvidence,
    CareerEvidenceSource,
  } from "../types/career.js";
  import type {
    SajuStructureSignal,
  } from "../../types/sajuFacts.js";
  
  export type CareerRuleDirection =
    | "support"
    | "limit";
  
  export type CareerSignalKind =
    SajuStructureSignal["kind"];
  
  export type CareerSignalMatcher = (
    signal: SajuStructureSignal,
  ) => boolean;
  
  export type CareerRule = {
    id: string;
  
    area: CareerArea;
  
    direction: CareerRuleDirection;
  
    signalKinds?: readonly CareerSignalKind[];
  
    signalMatcher?: CareerSignalMatcher;
  
    sources?: readonly CareerEvidenceSource[];
  
    minimumWeight?: number;
  
    keywords?: readonly string[];
  
    score: number;
  
    reason: string;
  };
  
  export type CareerRuleMatchBasis = {
    signalMatched: boolean;
  
    sourceMatched: boolean;
  
    weightMatched: boolean;
  
    keywordMatched: boolean;
  };
  
  export type MatchedCareerRule = {
    rule: CareerRule;
  
    evidence: CareerEvidence;
  
    matchBasis: CareerRuleMatchBasis;
  };
  
  function isDayMasterStrengthSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "dayMasterStrength" }
  > {
    return signal.kind === "dayMasterStrength";
  }
  
  function isTenGodDominanceSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "tenGodDominance" }
  > {
    return signal.kind === "tenGodDominance";
  }
  
  function isMonthCommandSignal(
    signal: SajuStructureSignal,
  ): signal is Extract<
    SajuStructureSignal,
    { kind: "monthCommand" }
  > {
    return signal.kind === "monthCommand";
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
      (keyword) => value.includes(keyword),
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
  
  const DESCRIPTION_SOURCES:
    readonly CareerEvidenceSource[] = [
      "structure",
      "tenGodStrength",
      "fiveElementFlow",
      "rooting",
      "usefulGod",
      "interaction",
    ];
  
  export const CAREER_RULES: CareerRule[] = [
    {
      id: "role-output-dominance",
      area: "roleOrientation",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasOutputDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "생산·표현·기획·창작을 통해 결과를 만들어내는 역할 방향이 뚜렷한 근거이다.",
    },
    {
      id: "role-wealth-dominance",
      area: "roleOrientation",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasWealthDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "현실 성과·영업·자원 운영을 중심으로 역할을 수행하는 방향이 뚜렷한 근거이다.",
    },
    {
      id: "role-officer-dominance",
      area: "roleOrientation",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasOfficerDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "책임·규칙·관리·의사결정을 맡는 역할 방향이 뚜렷한 근거이다.",
    },
    {
      id: "role-resource-dominance",
      area: "roleOrientation",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasResourceDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "지식·분석·전문성·지원 기능을 중심으로 역할을 수행하는 방향이 뚜렷한 근거이다.",
    },
    {
      id: "role-peer-dominance",
      area: "roleOrientation",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasPeerDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "자기 기준·경쟁·독립성을 바탕으로 영역을 개척하는 역할 방향이 뚜렷한 근거이다.",
    },
    {
      id: "role-overconcentrated",
      area: "roleOrientation",
      direction: "limit",
      signalKinds: ["tenGodDominance"],
      signalMatcher: (signal) =>
        isTenGodDominanceSignal(signal)
        && !signal.distributed
        && signal.dominantCount >= 4,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 2,
      reason:
        "한 역할 기능에 힘이 과도하게 집중되어 다른 역할을 함께 수행할 때 유연성이 제한될 수 있는 근거이다.",
    },
  
    {
      id: "work-style-balanced",
      area: "workStyle",
      direction: "support",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "balanced",
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "자기 기준과 외부 요구의 균형을 유지하며 업무 방식과 속도를 조절할 수 있는 근거이다.",
    },
    {
      id: "work-style-distributed",
      area: "workStyle",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: (signal) =>
        isTenGodDominanceSignal(signal)
        && signal.distributed
        && signal.totalCount > 0,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 2,
      reason:
        "여러 기능이 분산되어 상황에 따라 분석·실행·관계·관리 방식을 조합할 수 있는 근거이다.",
    },
    {
      id: "work-style-weak-pressure",
      area: "workStyle",
      direction: "limit",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "weak"
        && signal.opposingScore
          > signal.supportScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "외부 요구가 자기 자원보다 강하여 업무량과 역할이 늘어날수록 고유한 작업 방식이 흔들릴 수 있는 근거이다.",
    },
  
    {
      id: "expertise-resource-dominance",
      area: "expertiseGrowth",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasResourceDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "지식·정보·분석을 축적하여 전문영역을 형성할 수 있는 성향이 뚜렷한 근거이다.",
    },
    {
      id: "expertise-rooted",
      area: "expertiseGrowth",
      direction: "support",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && signal.rooted
        && signal.rootingCount > 0,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 3,
      reason:
        "하나의 기술과 경험을 장기간 축적할 수 있는 내부 기반이 확인되는 근거이다.",
    },
    {
      id: "expertise-unrooted",
      area: "expertiseGrowth",
      direction: "limit",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && !signal.rooted,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 2,
      reason:
        "경험과 기술을 한 방향으로 장기간 축적하는 기반이 약해 전문성 형성이 중단될 수 있는 근거이다.",
    },
  
    {
      id: "organization-officer-dominance",
      area: "organizationFit",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasOfficerDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "규칙·책임·직위·보고체계를 이해하고 조직 역할을 수행하는 성향이 뚜렷한 근거이다.",
    },
    {
      id: "organization-resource-dominance",
      area: "organizationFit",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasResourceDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 2,
      reason:
        "조직의 정보와 체계를 이해하고 전문 기능으로 지원할 수 있는 근거이다.",
    },
    {
      id: "organization-weak-pressure",
      area: "organizationFit",
      direction: "limit",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "weak"
        && signal.opposingScore
          > signal.supportScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "조직의 요구와 책임이 자기 자원보다 커질 경우 역할 압박과 소진이 빠르게 증가할 수 있는 근거이다.",
    },
  
    {
      id: "independence-peer-dominance",
      area: "independenceFit",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasPeerDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "자기 기준과 독립성을 바탕으로 업무 방향을 정하고 영역을 개척할 수 있는 근거이다.",
    },
    {
      id: "independence-output-dominance",
      area: "independenceFit",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasOutputDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 2,
      reason:
        "자신의 생산물·기획·표현을 중심으로 독립적인 업무 결과를 만들 수 있는 근거이다.",
    },
    {
      id: "independence-weak-day-master",
      area: "independenceFit",
      direction: "limit",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "weak"
        && signal.opposingScore
          > signal.supportScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "외부 지원과 환경의 영향을 크게 받아 모든 책임을 단독으로 부담할 때 기반이 빠르게 약해질 수 있는 근거이다.",
    },
  
    {
      id: "leadership-officer-dominance",
      area: "leadershipFit",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasOfficerDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "책임과 의사결정을 맡고 역할과 기준을 세우는 리더십 방향이 뚜렷한 근거이다.",
    },
    {
      id: "leadership-strong-day-master",
      area: "leadershipFit",
      direction: "support",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "strong"
        && signal.supportScore
          >= signal.opposingScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "외부 책임과 의사결정 압력을 견디며 기준을 유지할 수 있는 자기 기반이 확인되는 근거이다.",
    },
    {
      id: "leadership-weak-day-master",
      area: "leadershipFit",
      direction: "limit",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "weak"
        && signal.opposingScore
          > signal.supportScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "타인의 요구와 결과 책임이 집중될수록 의사결정 기준과 지속력이 약해질 수 있는 근거이다.",
    },
  
    {
      id: "performance-output-dominance",
      area: "performanceConversion",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasOutputDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "생산·표현·기획 활동을 구체적인 결과물과 성과로 전환할 수 있는 근거이다.",
    },
    {
      id: "performance-wealth-dominance",
      area: "performanceConversion",
      direction: "support",
      signalKinds: ["tenGodDominance"],
      signalMatcher: hasWealthDominance,
      sources: ["tenGodStrength", "structure"],
      minimumWeight: 2,
      score: 3,
      reason:
        "활동 결과를 현실 성과·평가·보상으로 연결하는 감각이 뚜렷한 근거이다.",
    },
    {
      id: "performance-weak-pressure",
      area: "performanceConversion",
      direction: "limit",
      signalKinds: ["dayMasterStrength"],
      signalMatcher: (signal) =>
        isDayMasterStrengthSignal(signal)
        && signal.type === "weak"
        && signal.opposingScore
          > signal.supportScore,
      sources: ["dayMasterStrength"],
      minimumWeight: 2,
      score: 3,
      reason:
        "외부 요구와 부담이 커질수록 노력과 활동이 실제 성과로 완성되기 전에 자원이 소진될 수 있는 근거이다.",
    },
  
    {
      id: "continuity-rooted",
      area: "careerContinuity",
      direction: "support",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && signal.rooted
        && signal.rootingCount > 0,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 3,
      reason:
        "하나의 직업 방향과 경험을 장기간 유지하고 축적할 수 있는 내부 기반이 확인되는 근거이다.",
    },
    {
      id: "continuity-supported-month-command",
      area: "careerContinuity",
      direction: "support",
      signalKinds: ["monthCommand"],
      signalMatcher: (signal) =>
        isMonthCommandSignal(signal)
        && signal.supported === true,
      sources: ["monthCommand"],
      minimumWeight: 2,
      score: 2,
      reason:
        "환경의 지원을 받아 직업 활동과 역할을 일정 기간 지속할 수 있는 근거이다.",
    },
    {
      id: "continuity-unrooted",
      area: "careerContinuity",
      direction: "limit",
      signalKinds: ["rooting"],
      signalMatcher: (signal) =>
        isRootingSignal(signal)
        && !signal.rooted,
      sources: ["rooting"],
      minimumWeight: 2,
      score: 3,
      reason:
        "직업 경험을 한 방향으로 유지하는 내부 기반이 약해 환경 변화에 따라 경력이 단절될 수 있는 근거이다.",
    },
    {
      id: "continuity-unsupported-month-command",
      area: "careerContinuity",
      direction: "limit",
      signalKinds: ["monthCommand"],
      signalMatcher: (signal) =>
        isMonthCommandSignal(signal)
        && signal.supported === false,
      sources: ["monthCommand"],
      minimumWeight: 2,
      score: 2,
      reason:
        "환경의 지원이 부족하여 같은 역할과 업무 강도를 장기간 유지하기 어려울 수 있는 근거이다.",
    },
  
    {
      id: "role-description-support",
      area: "roleOrientation",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "전문가",
        "기획",
        "관리",
        "영업",
        "리더",
        "생산",
        "역할",
      ],
      score: 1,
      reason:
        "설명 근거에서 직업 역할의 중심 방향을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "role-description-limit",
      area: "roleOrientation",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "역할 혼선",
        "방향 상실",
        "직무 불일치",
        "역할 충돌",
      ],
      score: 1,
      reason:
        "설명 근거에서 역할 방향이 흔들리거나 충돌할 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "work-style-description-support",
      area: "workStyle",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "분석",
        "실행",
        "기획",
        "조율",
        "관리",
        "생산",
      ],
      score: 1,
      reason:
        "설명 근거에서 일을 수행하고 완성하는 방식을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "work-style-description-limit",
      area: "workStyle",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "업무 혼선",
        "집중 저하",
        "방식 충돌",
        "실행 지연",
        "과부하",
      ],
      score: 1,
      reason:
        "설명 근거에서 업무 수행 방식이 흔들리거나 과부하될 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "expertise-description-support",
      area: "expertiseGrowth",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "전문성",
        "기술 축적",
        "학습",
        "연구",
        "숙련",
        "경험 축적",
      ],
      score: 1,
      reason:
        "설명 근거에서 기술과 전문성을 장기적으로 축적할 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "expertise-description-limit",
      area: "expertiseGrowth",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "전문성 단절",
        "학습 중단",
        "기술 정체",
        "경험 분산",
      ],
      score: 1,
      reason:
        "설명 근거에서 전문성 축적이 중단되거나 분산될 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "organization-description-support",
      area: "organizationFit",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "조직",
        "체계",
        "규칙",
        "보고",
        "협업",
        "역할 분담",
      ],
      score: 1,
      reason:
        "설명 근거에서 조직 구조와 역할 체계 안에서 기능할 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "organization-description-limit",
      area: "organizationFit",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "조직 갈등",
        "통제 충돌",
        "보고 혼선",
        "권한 불일치",
        "조직 피로",
      ],
      score: 1,
      reason:
        "설명 근거에서 조직의 통제와 역할 구조로 인해 충돌할 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "independence-description-support",
      area: "independenceFit",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "독립",
        "자기 주도",
        "개척",
        "자율",
        "개인 영역",
      ],
      score: 1,
      reason:
        "설명 근거에서 독립적으로 방향과 업무 기준을 세울 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "independence-description-limit",
      area: "independenceFit",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "의존",
        "지원 부족",
        "독립 부담",
        "단독 책임",
        "기반 부족",
      ],
      score: 1,
      reason:
        "설명 근거에서 모든 책임을 독립적으로 감당할 때 부담이 커질 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "leadership-description-support",
      area: "leadershipFit",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "리더십",
        "의사결정",
        "지휘",
        "책임",
        "통솔",
        "조정",
      ],
      score: 1,
      reason:
        "설명 근거에서 사람과 업무의 방향을 정하고 책임질 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "leadership-description-limit",
      area: "leadershipFit",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "책임 과부하",
        "결정 압박",
        "통제 갈등",
        "리더 소진",
      ],
      score: 1,
      reason:
        "설명 근거에서 리더 역할의 책임과 의사결정 압력으로 소진될 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "performance-description-support",
      area: "performanceConversion",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "성과",
        "결과",
        "완성",
        "평가",
        "보상",
        "실적",
      ],
      score: 1,
      reason:
        "설명 근거에서 노력과 활동을 실제 성과와 평가로 연결할 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "performance-description-limit",
      area: "performanceConversion",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "성과 저하",
        "결과 부족",
        "완성 지연",
        "평가 불일치",
        "노력 소진",
      ],
      score: 1,
      reason:
        "설명 근거에서 활동이 실제 결과와 보상으로 연결되지 못할 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
  
    {
      id: "continuity-description-support",
      area: "careerContinuity",
      direction: "support",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "장기 경력",
        "직업 유지",
        "경험 축적",
        "지속",
        "경력 확장",
      ],
      score: 1,
      reason:
        "설명 근거에서 직업 경험을 장기간 유지하고 확장할 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
    {
      id: "continuity-description-limit",
      area: "careerContinuity",
      direction: "limit",
      sources: DESCRIPTION_SOURCES,
      minimumWeight: 2,
      keywords: [
        "경력 단절",
        "직업 변동",
        "잦은 전환",
        "유지 어려움",
        "직업 소진",
      ],
      score: 1,
      reason:
        "설명 근거에서 직업 방향이 반복해서 중단되거나 전환될 가능성을 보조적으로 확인할 수 있는 근거이다.",
    },
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
    rule: CareerRule,
    evidence: CareerEvidence,
  ): boolean {
    const requiresSignal =
      rule.signalKinds !== undefined
      || rule.signalMatcher !== undefined;
  
    if (!requiresSignal || !evidence.signal) {
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
      && !rule.signalMatcher(evidence.signal)
    ) {
      return false;
    }
  
    return true;
  }
  
  function matchesSource(
    rule: CareerRule,
    evidence: CareerEvidence,
  ): boolean {
    return (
      rule.sources?.includes(evidence.source)
      ?? false
    );
  }
  
  function matchesWeight(
    rule: CareerRule,
    evidence: CareerEvidence,
  ): boolean {
    return (
      rule.minimumWeight !== undefined
      && evidence.weight
        >= rule.minimumWeight
    );
  }
  
  function matchesKeyword(
    rule: CareerRule,
    evidence: CareerEvidence,
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
    rule: CareerRule,
    basis: CareerRuleMatchBasis,
  ): boolean {
    if (
      (
        rule.signalKinds !== undefined
        || rule.signalMatcher !== undefined
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
  
  export function matchCareerRules(
    evidenceList: CareerEvidence[],
  ): MatchedCareerRule[] {
    const matched: MatchedCareerRule[] = [];
  
    for (const evidence of evidenceList) {
      for (const rule of CAREER_RULES) {
        const matchBasis:
          CareerRuleMatchBasis = {
            signalMatched:
              matchesSignal(rule, evidence),
  
            sourceMatched:
              matchesSource(rule, evidence),
  
            weightMatched:
              matchesWeight(rule, evidence),
  
            keywordMatched:
              matchesKeyword(rule, evidence),
          };
  
        if (!isRuleMatched(rule, matchBasis)) {
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