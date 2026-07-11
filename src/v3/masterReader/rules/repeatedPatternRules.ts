import type {
    PatternEvidence,
    PatternEvidenceSource,
    RepeatedPatternType,
  } from "../types/repeatedPattern";
  
  export type RepeatedPatternRule = {
    id: string;
    source: PatternEvidenceSource;
    keywords: string[];
    pattern: RepeatedPatternType;
    weight: number;
    reason: string;
  };
  
  export const REPEATED_PATTERN_RULES: RepeatedPatternRule[] = [
    {
      id: "early-success-collapse",
      source: "structure",
      keywords: [
        "빠른 성공",
        "확장",
        "성과",
        "과속",
        "무리한 투자",
        "유지 실패",
      ],
      pattern: "earlySuccessCollapse",
      weight: 3,
      reason:
        "초기 성과 이후 유지보다 확장을 선택하는 구조가 반복된다.",
    },
  
    {
      id: "slow-growth",
      source: "fiveElementFlow",
      keywords: [
        "축적",
        "꾸준함",
        "반복",
        "성장",
        "안정",
        "장기",
      ],
      pattern: "slowGrowthStable",
      weight: 3,
      reason:
        "시간이 흐를수록 성과가 커지는 장기 축적형 구조이다.",
    },
  
    {
      id: "relationship-loss",
      source: "interaction",
      keywords: [
        "관계",
        "동업",
        "배신",
        "인맥",
        "감정",
        "협력",
      ],
      pattern: "relationshipLoss",
      weight: 3,
      reason:
        "사람을 통해 기회를 얻지만 관계 문제로 손실이 반복될 가능성이 있다.",
    },
  
    {
      id: "wealth-leak",
      source: "tenGodStrength",
      keywords: [
        "재물",
        "지출",
        "누수",
        "투자",
        "현금흐름",
        "확장",
      ],
      pattern: "wealthLeak",
      weight: 3,
      reason:
        "수익보다 지출과 확장이 앞서 재물이 반복적으로 새는 구조이다.",
    },
  
    {
      id: "restart-cycle",
      source: "structure",
      keywords: [
        "재시작",
        "변화",
        "전환",
        "이직",
        "이사",
        "새출발",
      ],
      pattern: "restartCycle",
      weight: 3,
      reason:
        "삶의 큰 전환과 새로운 시작이 반복되는 구조이다.",
    },
  
    {
      id: "responsibility-overload",
      source: "dayMasterStrength",
      keywords: [
        "책임",
        "부담",
        "희생",
        "혼자",
        "감당",
        "압박",
      ],
      pattern: "responsibilityOverload",
      weight: 3,
      reason:
        "책임을 과도하게 떠안아 반복적으로 소진되는 구조이다.",
    },
  
    {
      id: "late-bloom",
      source: "monthCommand",
      keywords: [
        "후반",
        "늦게",
        "축적",
        "성숙",
        "경험",
        "대기만성",
      ],
      pattern: "lateBloom",
      weight: 3,
      reason:
        "초년보다 중년 이후 성과가 커지는 흐름이 반복된다.",
    },
  
    {
      id: "opportunity-miss",
      source: "usefulGod",
      keywords: [
        "망설임",
        "기회",
        "지연",
        "결정",
        "신중",
        "후회",
      ],
      pattern: "opportunityMiss",
      weight: 3,
      reason:
        "좋은 기회를 놓치거나 결정이 늦어지는 패턴이 반복된다.",
    },
  ];
  
  export type MatchedRepeatedPatternRule = {
    rule: RepeatedPatternRule;
    evidence: PatternEvidence;
  };
  
  export function matchRepeatedPatternRules(
    evidenceList: PatternEvidence[],
  ): MatchedRepeatedPatternRule[] {
    const matched: MatchedRepeatedPatternRule[] = [];
  
    for (const evidence of evidenceList) {
      const normalized = evidence.description
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
  
      for (const rule of REPEATED_PATTERN_RULES) {
        if (rule.source !== evidence.source) {
          continue;
        }
  
        const hasKeyword = rule.keywords.some((keyword) =>
          normalized.includes(keyword.toLowerCase()),
        );
  
        if (!hasKeyword) {
          continue;
        }
  
        matched.push({
          rule,
          evidence,
        });
      }
    }
  
    return matched;
  }