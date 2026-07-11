import type { SurvivalStyleType } from "../types/survivalStyle";

export type SurvivalStyleDefinition = {
  type: SurvivalStyleType;
  label: string;
  description: string;
  crisisBehaviors: string[];
  recoveryMethods: string[];
  prohibitedActions: string[];
};

export const SURVIVAL_STYLE_DEFINITIONS: SurvivalStyleDefinition[] = [
  {
    type: "push",
    label: "돌파형",
    description:
      "위기가 오면 멈추기보다 직접 부딪치고 행동하면서 해결하는 방식",
    crisisBehaviors: [
      "상황을 빠르게 정리하고 즉시 행동한다.",
      "정면으로 문제를 해결하려 한다.",
      "주도권을 먼저 확보하려 한다.",
    ],
    recoveryMethods: [
      "작은 목표를 정하고 즉시 실행한다.",
      "정체된 상황을 직접 바꾼다.",
      "성과가 보이는 일부터 처리한다.",
    ],
    prohibitedActions: [
      "감정적으로 밀어붙이기",
      "충분한 검토 없이 확장하기",
      "상대의 반응을 무시하고 독단적으로 결정하기",
    ],
  },
  {
    type: "analysis",
    label: "분석형",
    description:
      "위기가 오면 정보와 조건을 정리하고 계산한 뒤 해결하는 방식",
    crisisBehaviors: [
      "원인과 조건을 먼저 분석한다.",
      "가능한 선택지를 비교한다.",
      "손실과 위험을 계산한 뒤 움직인다.",
    ],
    recoveryMethods: [
      "정보를 정리하고 우선순위를 세운다.",
      "계획을 구체적인 단계로 나눈다.",
      "불확실한 부분을 확인한다.",
    ],
    prohibitedActions: [
      "분석만 반복하고 실행을 미루기",
      "모든 조건이 완벽해질 때까지 기다리기",
      "불안을 줄이기 위해 정보만 과도하게 수집하기",
    ],
  },
  {
    type: "relationship",
    label: "협력형",
    description:
      "위기가 오면 사람과 연결하고 역할을 나누면서 해결하는 방식",
    crisisBehaviors: [
      "믿을 수 있는 사람을 찾는다.",
      "도움과 조언을 요청한다.",
      "협력 구조를 만들어 문제를 나눈다.",
    ],
    recoveryMethods: [
      "신뢰하는 사람과 상황을 공유한다.",
      "혼자 감당하던 역할을 분담한다.",
      "관계를 통해 새로운 방법을 찾는다.",
    ],
    prohibitedActions: [
      "상대에게 판단을 전부 맡기기",
      "관계를 지키기 위해 손실을 감수하기",
      "권한과 책임을 정하지 않은 채 협력하기",
    ],
  },
  {
    type: "independent",
    label: "독립형",
    description:
      "위기가 오면 외부 의존을 줄이고 스스로 통제권을 확보하는 방식",
    crisisBehaviors: [
      "혼자 해결할 수 있는 범위를 먼저 찾는다.",
      "외부 간섭과 의존을 줄인다.",
      "자기 기준으로 결정을 내린다.",
    ],
    recoveryMethods: [
      "혼자 생각할 시간을 확보한다.",
      "자기 권한과 역할을 다시 정리한다.",
      "통제 가능한 일부터 처리한다.",
    ],
    prohibitedActions: [
      "모든 문제를 혼자 떠안기",
      "필요한 도움까지 거부하기",
      "관계를 끊는 방식으로만 문제를 해결하기",
    ],
  },
  {
    type: "stability",
    label: "방어형",
    description:
      "위기가 오면 손실을 줄이고 현재 기반을 지키면서 해결하는 방식",
    crisisBehaviors: [
      "새로운 위험을 먼저 차단한다.",
      "현금과 자원을 보존한다.",
      "기존 질서와 생활을 유지하려 한다.",
    ],
    recoveryMethods: [
      "생활과 업무의 기본 리듬을 회복한다.",
      "고정비와 부담을 줄인다.",
      "검증된 방법부터 다시 시작한다.",
    ],
    prohibitedActions: [
      "변화를 무조건 피하기",
      "손실이 두려워 필요한 결정까지 미루기",
      "이미 끝난 구조를 계속 유지하기",
    ],
  },
  {
    type: "opportunity",
    label: "전환형",
    description:
      "위기가 오면 새로운 기회와 환경을 찾아 판을 바꾸는 방식",
    crisisBehaviors: [
      "기존 방식 밖의 대안을 찾는다.",
      "새로운 시장과 사람을 탐색한다.",
      "환경을 바꾸어 돌파구를 만든다.",
    ],
    recoveryMethods: [
      "새로운 프로젝트를 시작한다.",
      "활동 범위와 환경을 바꾼다.",
      "과거와 다른 선택지를 시험한다.",
    ],
    prohibitedActions: [
      "위기마다 일을 새로 벌이기",
      "기존 문제를 해결하지 않고 환경만 바꾸기",
      "가능성만 보고 현실 조건을 무시하기",
    ],
  },
  {
    type: "learning",
    label: "학습형",
    description:
      "위기가 오면 지식과 기술을 보완하여 해결 능력을 높이는 방식",
    crisisBehaviors: [
      "부족한 지식과 능력을 확인한다.",
      "공부하거나 전문가의 방법을 배운다.",
      "문제를 기술적으로 해결하려 한다.",
    ],
    recoveryMethods: [
      "새로운 기술을 익힌다.",
      "전문 지식을 체계적으로 정리한다.",
      "배운 내용을 실제 문제에 적용한다.",
    ],
    prohibitedActions: [
      "공부를 행동의 대체물로 사용하기",
      "현실 문제보다 자격과 이론에만 집중하기",
      "이미 아는 내용을 반복하며 결정을 미루기",
    ],
  },
  {
    type: "endurance",
    label: "인내형",
    description:
      "위기가 오면 쉽게 포기하지 않고 시간을 견디면서 해결하는 방식",
    crisisBehaviors: [
      "상황이 안정될 때까지 버틴다.",
      "맡은 책임을 끝까지 유지한다.",
      "작은 손실을 감수하며 기반을 지킨다.",
    ],
    recoveryMethods: [
      "생활 리듬을 유지한다.",
      "단기 결과보다 긴 흐름을 본다.",
      "할 수 있는 일을 반복하며 시간을 확보한다.",
    ],
    prohibitedActions: [
      "끝난 상황에서도 무조건 버티기",
      "도움을 요청하지 않고 소진될 때까지 참기",
      "변화가 필요한데 책임감만으로 유지하기",
    ],
  },
];

export function getSurvivalStyleDefinition(
  type: SurvivalStyleType,
): SurvivalStyleDefinition {
  const definition = SURVIVAL_STYLE_DEFINITIONS.find(
    (item) => item.type === type,
  );

  if (!definition) {
    throw new Error(`Unknown survival style type: ${type}`);
  }

  return definition;
}