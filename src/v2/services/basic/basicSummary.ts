import type { BasicSajuResult } from "../../types/basic";

export function basicSummary(data: BasicSajuResult): string[] {
  const strength = data.strengths[0] || "타고난 장점";
  const caution = data.cautions[0] || "보완할 부분";

  return [
    "가장 큰 장점은 " + strength + "입니다.",
    "중요한 결정은 자신의 강점을 꾸준히 활용할 때 좋은 결과로 이어집니다.",
    "사람과의 관계에서는 신뢰를 쌓는 과정이 큰 자산이 됩니다.",
    caution + "을 의식하면 인생의 균형을 잡는 데 도움이 됩니다.",
    "앞으로는 새로운 것을 늘리기보다 지금 가진 강점을 꾸준히 키우는 것이 가장 좋은 방향입니다.",
  ];
}
