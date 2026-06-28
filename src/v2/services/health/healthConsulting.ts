import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingFramework } from "../framework/consultingFramework";

export function getHealthConsulting(data: BasicSajuResult): string {
  const name = data.name;

  return buildConsultingFramework({
    name,
    title: "건강 상담",
    firstImpression: `${data.dayMaster} 일간과 ${data.yearGanZhi}${data.monthGanZhi}${data.dayGanZhi} 흐름을 함께 보면 ${name}님의 건강운은 체력 자체보다 생활 리듬과 회복력의 균형에서 더 크게 갈립니다.`,
    personInsight: `${name}님은 몸이 한 번에 크게 무너지는 흐름보다는 작은 피로가 쌓이다가 어느 순간 컨디션이 떨어지는 흐름을 조심해야 합니다. 강하게 살아나는 ${data.strongestElement} 기운은 몸과 마음을 버티게 하는 기본 힘이고, 부족한 ${data.weakestElement} 기운은 건강 관리에서 보완해야 할 지점입니다.`,
    repeatedPattern: `${name}님은 바쁠 때는 참고 버티다가 일이 끝난 뒤에 피로가 몰려오는 흐름이 생기기 쉽습니다. 당장은 괜찮다고 느껴도 몸은 이미 긴장 상태를 오래 유지하고 있을 수 있습니다. 이런 흐름이 반복되면 잠을 자도 개운하지 않거나, 몸이 무겁고, 작은 일에도 예민해질 수 있습니다.`,
    realCase: `실제 상담에서 이런 흐름을 가진 분들은 몸에 좋은 것을 많이 챙기기보다 나쁜 습관을 줄이는 것이 더 중요하게 나타납니다. 늦은 식사, 불규칙한 수면, 과한 카페인, 오래 앉아 있는 습관, 스트레스를 참고 넘기는 습관이 건강운을 약하게 만들 수 있습니다.`,
    futureFlow: `앞으로 3년 동안 ${name}님의 건강운에서 중요한 것은 큰 변화보다 생활 리듬을 안정시키는 것입니다.

1년 차에는 무리한 목표보다 수면과 식사 시간을 먼저 정리하는 것이 좋습니다.
2년 차에는 체력 관리가 중요합니다. 가벼운 운동을 꾸준히 이어가야 몸의 기본 힘이 살아납니다.
3년 차에는 스트레스 관리가 핵심입니다. 일이 많아질수록 쉬는 시간을 의식적으로 확보해야 합니다.

건강운은 단순히 병이 있다 없다로 보는 것이 아니라 몸이 어떤 방식으로 피로를 쌓고, 어떤 생활 리듬에서 무너지기 쉬운지를 보는 것이 중요합니다.`,
    actionGuide: `첫째, 피곤할 때 더 버티지 말고 바로 쉬는 습관을 만드세요.
둘째, 식사와 수면 시간을 일정하게 유지하는 것이 좋습니다.
셋째, 무리한 운동보다 오래 할 수 있는 가벼운 운동이 더 잘 맞습니다.
넷째, 몸이 보내는 작은 신호를 무시하지 마세요.
다섯째, 스트레스를 혼자 오래 담아두지 않는 것이 중요합니다.`,
    finalMessage: `${name}님의 건강운은 큰 병을 겁내기보다 생활 리듬이 무너지면서 생기는 피로 누적을 조심해야 하는 흐름입니다. 앞으로는 몸을 더 강하게 몰아붙이기보다 규칙적인 생활, 충분한 회복, 마음을 쉬게 하는 시간을 만들어가는 것이 중요합니다.`,
  });
}
