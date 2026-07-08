import type { BasicSajuResult } from "../../../types/basic";

export function buildMarriageSection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";

  return [
    `[결혼 심층 상담]
${name}님의 결혼운은 좋은 사람을 만나는 것만큼, 함께 생활을 유지할 수 있는 구조가 중요합니다.

[배우자 관계에서 중요한 점]
감정만으로 결정하기보다 가치관, 돈 관리, 가족 관계, 생활 습관을 함께 봐야 합니다.
대화가 되고 책임을 나눌 수 있는 사람이 좋은 인연입니다.

[결혼 전략]
첫째, 경제 기준을 결혼 전부터 이야기하세요.
둘째, 부모·가족 문제를 현실적으로 조율하세요.
셋째, 주거 계획과 생활비 기준을 함께 세우세요.
넷째, 작은 불만을 쌓아두지 말고 바로 대화하세요.`,
  ];
}