import type {
    SurvivalEvidence,
    SurvivalEvidenceSource,
    SurvivalStyleType,
  } from "../types/survivalStyle";
  
  export type SurvivalStyleRule = {
    id: string;
    source: SurvivalEvidenceSource;
    keywords: string[];
    style: SurvivalStyleType;
    weight: number;
    reason: string;
  };
  
  export const SURVIVAL_STYLE_RULES: SurvivalStyleRule[] = [
    {
      id: "push-direct-action",
      source: "structure",
      keywords: [
        "돌파",
        "추진",
        "행동",
        "실행",
        "직접 해결",
        "경쟁",
        "성과",
        "주도권",
      ],
      style: "push",
      weight: 3,
      reason:
        "위기에서 멈추기보다 직접 움직이고 주도권을 확보하여 문제를 해결하는 구조",
    },
    {
      id: "push-strong-day-master",
      source: "dayMasterStrength",
      keywords: [
        "신강",
        "강한 일간",
        "자기 힘",
        "독자적 판단",
        "밀어붙임",
        "버티는 힘",
      ],
      style: "push",
      weight: 2,
      reason:
        "자기 힘과 판단을 바탕으로 압박을 정면으로 돌파하려는 성향이 강한 구조",
    },
  
    {
      id: "analysis-information",
      source: "tenGodStrength",
      keywords: [
        "인성",
        "정보",
        "분석",
        "학습",
        "연구",
        "검토",
        "계산",
        "계획",
      ],
      style: "analysis",
      weight: 3,
      reason:
        "위기에서 정보를 수집하고 조건을 분석한 뒤 해결 방식을 결정하는 구조",
    },
    {
      id: "analysis-five-element-flow",
      source: "fiveElementFlow",
      keywords: [
        "순환",
        "정리",
        "판단",
        "조절",
        "균형",
        "검증",
        "단계",
        "체계",
      ],
      style: "analysis",
      weight: 2,
      reason:
        "상황을 단계적으로 정리하고 흐름을 계산하면서 해결책을 찾는 구조",
    },
  
    {
      id: "relationship-cooperation",
      source: "interaction",
      keywords: [
        "협력",
        "관계",
        "인맥",
        "도움",
        "연결",
        "소개",
        "조력자",
        "파트너",
      ],
      style: "relationship",
      weight: 3,
      reason:
        "위기에서 혼자 해결하기보다 사람과 연결하고 역할을 나누어 해결하는 구조",
    },
    {
      id: "relationship-resource-sharing",
      source: "structure",
      keywords: [
        "공동",
        "협업",
        "지원",
        "교류",
        "네트워크",
        "중재",
        "조율",
        "의지",
      ],
      style: "relationship",
      weight: 2,
      reason:
        "사람과 자원을 연결하고 협력 구조를 만드는 과정에서 회복력이 살아나는 구조",
    },
  
    {
      id: "independent-self-control",
      source: "dayMasterStrength",
      keywords: [
        "독립",
        "자립",
        "자기 기준",
        "통제권",
        "간섭 거부",
        "단독",
        "자율",
        "주체성",
      ],
      style: "independent",
      weight: 3,
      reason:
        "위기에서 외부 의존을 줄이고 스스로 통제 가능한 범위를 확보하는 구조",
    },
    {
      id: "independent-rooting",
      source: "rooting",
      keywords: [
        "근",
        "뿌리",
        "자기 기반",
        "독자 생존",
        "내부 자원",
        "자기 확신",
        "자기 영역",
      ],
      style: "independent",
      weight: 2,
      reason:
        "자기 기반과 내부 자원을 바탕으로 독자적으로 문제를 해결하려는 구조",
    },
  
    {
      id: "stability-protection",
      source: "fiveElementFlow",
      keywords: [
        "안정",
        "유지",
        "보존",
        "관리",
        "축적",
        "방어",
        "지속",
        "기반",
      ],
      style: "stability",
      weight: 3,
      reason:
        "위기에서 새로운 확장보다 현재 자원과 기반을 지키며 손실을 줄이는 구조",
    },
    {
      id: "stability-useful-god",
      source: "usefulGod",
      keywords: [
        "안정화",
        "균형 회복",
        "보완",
        "유지력",
        "관리력",
        "조절",
        "보호",
      ],
      style: "stability",
      weight: 2,
      reason:
        "위기에서 균형을 회복하고 기존 기반을 안정시키는 방식이 유리한 구조",
    },
  
    {
      id: "opportunity-change",
      source: "structure",
      keywords: [
        "변화",
        "전환",
        "기회",
        "이동",
        "새로운 환경",
        "새로운 판",
        "확장",
        "개척",
      ],
      style: "opportunity",
      weight: 3,
      reason:
        "위기에서 기존 방식을 고수하기보다 환경과 방향을 바꾸며 돌파구를 찾는 구조",
    },
    {
      id: "opportunity-interaction",
      source: "interaction",
      keywords: [
        "변동",
        "합",
        "충",
        "이동성",
        "외부 기회",
        "환경 변화",
        "새로운 인연",
      ],
      style: "opportunity",
      weight: 2,
      reason:
        "외부 변화와 새로운 연결을 활용할 때 생존 가능성이 높아지는 구조",
    },
  
    {
      id: "learning-knowledge",
      source: "tenGodStrength",
      keywords: [
        "지식",
        "기술",
        "전문성",
        "공부",
        "학습",
        "자격",
        "연구",
        "숙련",
      ],
      style: "learning",
      weight: 3,
      reason:
        "위기에서 부족한 지식과 기술을 보완하여 해결 능력을 높이는 구조",
    },
    {
      id: "learning-useful-resource",
      source: "usefulGod",
      keywords: [
        "배움",
        "문서",
        "교육",
        "자격증",
        "전문 지식",
        "기술 습득",
        "조언",
      ],
      style: "learning",
      weight: 2,
      reason:
        "새로운 지식과 전문 능력을 확보할 때 위기 대응력이 살아나는 구조",
    },
  
    {
      id: "endurance-rooting",
      source: "rooting",
      keywords: [
        "버팀",
        "인내",
        "지속",
        "근기",
        "장기전",
        "책임감",
        "유지력",
        "끈기",
      ],
      style: "endurance",
      weight: 3,
      reason:
        "위기에서 쉽게 방향을 바꾸기보다 시간을 견디며 기반을 지키는 구조",
    },
    {
      id: "endurance-month-command",
      source: "monthCommand",
      keywords: [
        "계절의 힘",
        "월령",
        "지속력",
        "환경 적응",
        "생활력",
        "생존력",
        "버티는 힘",
      ],
      style: "endurance",
      weight: 2,
      reason:
        "환경의 압박을 견디고 현실 조건에 적응하면서 장기적으로 살아남는 구조",
    },
  ];
  
  export type MatchedSurvivalStyleRule = {
    rule: SurvivalStyleRule;
    evidence: SurvivalEvidence;
  };
  
  export function matchSurvivalStyleRules(
    evidenceList: SurvivalEvidence[],
  ): MatchedSurvivalStyleRule[] {
    const matched: MatchedSurvivalStyleRule[] = [];
  
    for (const evidence of evidenceList) {
      const normalizedDescription = evidence.description
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
  
      for (const rule of SURVIVAL_STYLE_RULES) {
        if (rule.source !== evidence.source) {
          continue;
        }
  
        const hasKeyword = rule.keywords.some((keyword) =>
          normalizedDescription.includes(keyword.toLowerCase()),
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