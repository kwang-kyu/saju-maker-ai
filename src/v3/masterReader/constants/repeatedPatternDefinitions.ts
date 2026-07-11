import type { RepeatedPatternType } from "../types/repeatedPattern";

export type RepeatedPatternDefinition = {
  type: RepeatedPatternType;
  label: string;
  description: string;
  repeatedBehaviors: string[];
  strengths: string[];
  risks: string[];
};

export const REPEATED_PATTERN_DEFINITIONS: RepeatedPatternDefinition[] = [
  {
    type: "earlySuccessCollapse",
    label: "초기 성공 후 흔들림",
    description:
      "초기에 기회를 빠르게 잡지만 유지와 관리보다 확장에 집중하여 다시 내려오는 패턴",
    repeatedBehaviors: [
      "기회를 빠르게 잡는다.",
      "성과가 생기면 확장을 서두른다.",
      "기반보다 규모를 먼저 키우려 한다.",
    ],
    strengths: [
      "도전력이 강하다.",
      "새로운 기회를 잘 포착한다.",
      "실행력이 빠르다.",
    ],
    risks: [
      "유지력이 부족할 수 있다.",
      "과도한 확장이 반복될 수 있다.",
      "재무 관리가 흔들릴 수 있다.",
    ],
  },

  {
    type: "slowGrowthStable",
    label: "느리지만 꾸준한 성장",
    description:
      "빠른 성과보다 꾸준한 축적을 통해 시간이 갈수록 강해지는 패턴",
    repeatedBehaviors: [
      "준비를 충분히 한다.",
      "작게 시작하여 점진적으로 성장한다.",
      "경험이 쌓일수록 안정된다.",
    ],
    strengths: [
      "지속력이 강하다.",
      "신뢰를 쌓는다.",
      "실패 확률이 낮다.",
    ],
    risks: [
      "기회를 놓칠 수 있다.",
      "결정이 늦어질 수 있다.",
    ],
  },

  {
    type: "relationshipLoss",
    label: "관계로 인한 손실",
    description:
      "사람을 통해 기회를 얻지만 관계 문제로 손실을 반복하는 패턴",
    repeatedBehaviors: [
      "사람을 쉽게 믿는다.",
      "관계를 우선한다.",
      "감정이 판단에 영향을 준다.",
    ],
    strengths: [
      "인맥이 넓다.",
      "협력이 뛰어나다.",
    ],
    risks: [
      "동업 갈등",
      "배신",
      "관계 스트레스",
    ],
  },

  {
    type: "wealthLeak",
    label: "재물 누수",
    description:
      "돈은 벌지만 유지보다 지출과 확장으로 새는 흐름이 반복되는 패턴",
    repeatedBehaviors: [
      "수입보다 지출이 커진다.",
      "확장을 서두른다.",
      "현금 흐름 관리가 약하다.",
    ],
    strengths: [
      "수익 기회를 잘 만든다.",
    ],
    risks: [
      "현금 부족",
      "투자 실패",
      "재무 불안정",
    ],
  },

  {
    type: "restartCycle",
    label: "재시작 반복",
    description:
      "인생의 큰 전환이 반복되며 새로운 시작을 여러 번 경험하는 패턴",
    repeatedBehaviors: [
      "직업을 바꾼다.",
      "환경을 바꾼다.",
      "새롭게 시작한다.",
    ],
    strengths: [
      "회복력이 좋다.",
      "변화 적응력이 높다.",
    ],
    risks: [
      "안정이 늦어진다.",
    ],
  },

  {
    type: "responsibilityOverload",
    label: "책임 과부하",
    description:
      "책임을 지나치게 떠안아 자신의 에너지가 소진되는 패턴",
    repeatedBehaviors: [
      "혼자 책임진다.",
      "부탁을 거절하지 못한다.",
      "일을 계속 떠안는다.",
    ],
    strengths: [
      "책임감이 강하다.",
      "신뢰를 얻는다.",
    ],
    risks: [
      "번아웃",
      "건강 악화",
      "스트레스 누적",
    ],
  },

  {
    type: "lateBloom",
    label: "대기만성",
    description:
      "초년보다 중년 이후 성과가 커지는 패턴",
    repeatedBehaviors: [
      "경험이 쌓일수록 성장한다.",
      "늦게 인정받는다.",
    ],
    strengths: [
      "꾸준함",
      "깊이 있는 실력",
    ],
    risks: [
      "초기 자신감 부족",
    ],
  },

  {
    type: "opportunityMiss",
    label: "기회 상실",
    description:
      "좋은 기회가 와도 망설임과 판단 지연으로 놓치는 패턴",
    repeatedBehaviors: [
      "결정을 미룬다.",
      "확신을 기다린다.",
    ],
    strengths: [
      "신중하다.",
    ],
    risks: [
      "타이밍 상실",
      "후회가 반복된다.",
    ],
  },
];

export function getRepeatedPatternDefinition(
  type: RepeatedPatternType,
): RepeatedPatternDefinition {
  const definition = REPEATED_PATTERN_DEFINITIONS.find(
    (item) => item.type === type,
  );

  if (!definition) {
    throw new Error(`Unknown repeated pattern: ${type}`);
  }

  return definition;
}