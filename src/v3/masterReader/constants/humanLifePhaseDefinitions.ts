import type {
    HumanLifePhase,
    HumanLifePhaseResult,
  } from "../types/humanLifePhase.js";
  
  export type HumanLifePhaseDefinition = Omit<
    HumanLifePhaseResult,
    "phase"
  >;
  
  export const humanLifePhaseDefinitions: Record<
    HumanLifePhase,
    HumanLifePhaseDefinition
  > = {
    growth: {
      title: "확장기",
      description:
        "기존의 기반을 넓히고 활동 범위와 영향력을 키워야 하는 국면입니다.",
      focusAreas: [
        "검증된 강점의 확대",
        "활동 범위 확장",
        "새로운 기회의 실행",
        "성과를 만드는 구조 구축",
      ],
      avoidAreas: [
        "근거 없는 과잉 확장",
        "감당할 수 없는 책임 증가",
        "현금 흐름을 무시한 투자",
      ],
    },
  
    preparation: {
      title: "준비기",
      description:
        "본격적인 실행보다 실력과 자원, 구조를 갖추는 일이 먼저인 국면입니다.",
      focusAreas: [
        "기초 역량 보완",
        "정보와 자원 축적",
        "작은 규모의 사전 검증",
        "실행 계획 구체화",
      ],
      avoidAreas: [
        "준비되지 않은 조기 실행",
        "결과를 서두르는 선택",
        "검증 없이 규모부터 키우는 행동",
      ],
    },
  
    transition: {
      title: "전환기",
      description:
        "기존 방식의 한계가 드러나고 새로운 방향으로 이동해야 하는 국면입니다.",
      focusAreas: [
        "기존 선택의 재평가",
        "새로운 역할 탐색",
        "변화에 필요한 조건 정리",
        "단계적인 방향 전환",
      ],
      avoidAreas: [
        "과거 방식에 대한 집착",
        "충동적인 전면 교체",
        "불안 때문에 내리는 성급한 결정",
      ],
    },
  
    harvest: {
      title: "수확기",
      description:
        "그동안 쌓아온 경험과 성과를 현실적인 결과로 회수해야 하는 국면입니다.",
      focusAreas: [
        "성과의 현실화",
        "수익과 결과 회수",
        "좋은 기회의 선별",
        "기존 자산의 가치 극대화",
      ],
      avoidAreas: [
        "성과를 다시 무리하게 투입하는 행동",
        "욕심으로 수확 시기를 놓치는 선택",
        "검증되지 않은 새 판에 대한 과도한 집중",
      ],
    },
  
    stability: {
      title: "안정기",
      description:
        "새로운 확장보다 현재의 기반과 생활 구조를 단단하게 유지해야 하는 국면입니다.",
      focusAreas: [
        "기존 기반 유지",
        "현금 흐름 안정",
        "생활과 관계의 균형",
        "지속 가능한 운영 체계",
      ],
      avoidAreas: [
        "불필요한 변화",
        "안정된 기반을 흔드는 모험",
        "단기 성과에 대한 과도한 집착",
      ],
    },
  
    challenge: {
      title: "도전기",
      description:
        "압박과 경쟁이 커지지만 이를 통과하면 새로운 단계로 올라갈 수 있는 국면입니다.",
      focusAreas: [
        "핵심 문제의 정면 대응",
        "우선순위 집중",
        "위험 요소의 구체적 관리",
        "버텨야 할 것과 버릴 것의 구분",
      ],
      avoidAreas: [
        "문제 회피",
        "감정적인 정면충돌",
        "여러 문제를 동시에 해결하려는 행동",
      ],
    },
  
    recovery: {
      title: "회복기",
      description:
        "소모된 에너지와 무너진 균형을 되찾는 것이 가장 먼저인 국면입니다.",
      focusAreas: [
        "체력과 감정 회복",
        "손실과 부담 정리",
        "생활 리듬 복원",
        "작은 성취를 통한 자신감 회복",
      ],
      avoidAreas: [
        "회복 전 무리한 재도전",
        "타인의 속도와 비교",
        "부담을 더 늘리는 선택",
      ],
    },
  
    reset: {
      title: "재정비기",
      description:
        "맞지 않는 구조를 정리하고 앞으로의 기반을 다시 설계해야 하는 국면입니다.",
      focusAreas: [
        "불필요한 관계와 지출 정리",
        "기존 구조의 문제점 확인",
        "역할과 목표 재설정",
        "다음 단계의 기반 재구축",
      ],
      avoidAreas: [
        "정리하지 않은 상태에서의 확장",
        "손실을 인정하지 못하는 집착",
        "계획 없는 전면 중단",
      ],
    },
  };
  
  export function getHumanLifePhaseDefinition(
    phase: HumanLifePhase,
  ): HumanLifePhaseDefinition {
    return humanLifePhaseDefinitions[phase];
  }