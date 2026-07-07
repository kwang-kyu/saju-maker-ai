import type { BasicSajuResult } from "../../../types/basic";

export function buildTotalSection(basic: BasicSajuResult): string[] {
  const name = basic.name || "사용자";
  const strongElement = basic.strongestElement ?? "없음";
  const weakElement = basic.weakestElement ?? "없음";
  const dayMaster = basic.dayMaster ?? "일간";
  const strength = basic.summary ?? "보통";

  return [
    `[인생 전체 흐름]
${name}님의 전체 운은 단순히 좋고 나쁨으로 보기보다, ${dayMaster} 일간과 오행 균형을 기준으로 해석해야 합니다.
강하게 드러나는 ${strongElement} 기운은 삶을 밀고 가는 힘이 되고, 부족한 ${weakElement} 기운은 반복적으로 보완해야 할 과제가 됩니다.`,

    `[주의해야 할 흐름]
현재 사주의 기본 흐름은 ${strength} 쪽으로 보입니다.
무리하게 속도를 내기보다, 본인에게 맞는 방식으로 선택을 정리할 때 운의 안정감이 커집니다.`,

    `[활용 방향]
좋은 운은 기다리는 것이 아니라, 자신의 강한 기운을 현실에서 어떻게 쓰느냐에 따라 달라집니다.
${name}님은 강한 부분은 살리고 약한 부분은 생활 습관과 선택 기준으로 보완하는 방식이 중요합니다.`,
  ];
}
