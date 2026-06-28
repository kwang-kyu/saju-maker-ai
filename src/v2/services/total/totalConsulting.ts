import type { BasicSajuInput } from "../../types/basic";
import { buildConsultingFramework } from "../framework/consultingFramework";

function getCurrentAge(birthDate: string) {
  const birthYear = Number(birthDate.slice(0, 4));
  const currentYear = new Date().getFullYear();

  if (!birthYear) return 0;

  return currentYear - birthYear + 1;
}

function getLifeStage(age: number) {
  if (age <= 29) return "현재는 인생의 기초를 만들고 방향을 정하는 시기입니다.";
  if (age <= 44) return "현재는 사회적 기반을 만들고 실질적인 성과를 쌓아가야 하는 시기입니다.";
  if (age <= 59) return "현재는 그동안 쌓아온 경험을 바탕으로 선택과 정리를 해야 하는 시기입니다.";

  return "현재는 무리한 확장보다 안정, 정리, 건강, 관계의 균형이 더 중요한 시기입니다.";
}

export function totalConsulting(data: BasicSajuInput): string {
  const age = getCurrentAge(data.birthDate);
  const currentYear = new Date().getFullYear();
  const lifeStage = getLifeStage(age);

  const tenYearFlow = Array.from({ length: 10 }, (_, index) => {
    const year = currentYear + index;
    const ageText = age ? `${age + index}세` : "현재 나이 기준";

    if (index <= 2) {
      return `${year}년 (${ageText})
- 핵심 흐름: 흩어졌던 기준을 다시 정리하는 시기입니다.
- 좋은 기회: 일, 돈, 사람 관계에서 새 기준을 세우면 안정감이 커집니다.
- 조심할 점: 불안해서 급하게 결정하면 흐름이 흔들릴 수 있습니다.
- 현실 조언: 큰 변화보다 현재 하고 있는 일을 정리하고 다듬는 것이 먼저입니다.`;
    }

    if (index <= 5) {
      return `${year}년 (${ageText})
- 핵심 흐름: 쌓아온 것이 결과로 드러나기 시작하는 시기입니다.
- 좋은 기회: 직업, 사업, 재물 면에서 실질적인 성과를 만들 수 있습니다.
- 조심할 점: 욕심이 커지면 사람 관계나 건강 리듬이 흔들릴 수 있습니다.
- 현실 조언: 확장하더라도 기준과 숫자를 확인하면서 움직이는 것이 좋습니다.`;
    }

    return `${year}년 (${ageText})
- 핵심 흐름: 무리한 확장보다 안정적인 관리가 중요해지는 시기입니다.
- 좋은 기회: 경험과 신뢰를 바탕으로 더 편안한 구조를 만들 수 있습니다.
- 조심할 점: 오래된 습관이나 미뤄둔 문제가 다시 올라올 수 있습니다.
- 현실 조언: 사람, 돈, 건강을 정리하면서 오래 갈 수 있는 방향을 선택해야 합니다.`;
  }).join("\n\n");

  return buildConsultingFramework({
    name: data.name,
    title: "전체운 상담",
    firstImpression: `${data.name}님의 전체운은 단순히 좋은 일이 많다, 나쁜 일이 많다로 보는 것이 아닙니다. 인생이 어느 방향으로 흘러가고, 어떤 선택을 할 때 결과가 오래 가는지를 보는 상담입니다.`,
    personInsight: `${data.name}님은 현재 ${age ? `${age}세` : "현재 나이 기준"} 흐름에 있습니다. ${lifeStage} 중요한 것은 남들과 비교해서 빠르다, 늦다를 판단하는 것이 아니라 ${data.name}님에게 맞는 속도와 기준을 다시 잡는 것입니다.`,
    repeatedPattern: `${data.name}님은 한 번에 크게 바꾸기보다 시간을 두고 쌓아갈 때 운이 좋아지는 흐름입니다. 처음에는 느려 보여도 기준이 잡히면 결과가 오래 갑니다. 반대로 마음이 불안해서 계획을 자주 바꾸면 이미 쌓아둔 흐름이 끊길 수 있습니다.`,
    realCase: "실제 상담에서 이런 흐름을 가진 분들은 일에서는 신뢰, 돈에서는 관리, 관계에서는 거리 조절이 중요하게 나타납니다. 한 번에 큰 승부를 보기보다 작은 성과를 반복해서 쌓는 방식이 더 유리합니다.",
    futureFlow: `앞으로 10년에서 가장 중요한 것은 확장보다 기준입니다.

${tenYearFlow}

전체적으로 보면 앞으로 3년은 생활과 일의 기준을 다시 잡는 시기이고, 그 이후에는 쌓아온 것이 결과로 드러나는 흐름입니다.`,
    actionGuide: `첫째, 돈보다 기준을 먼저 세우는 것이 좋습니다.
둘째, 빠른 변화보다 오래 갈 구조를 만들어야 합니다.
셋째, 사람 관계는 넓히기보다 정리하고 깊게 가는 것이 좋습니다.
넷째, 투자나 이직은 감정보다 숫자와 조건을 확인한 뒤 움직여야 합니다.`,
    finalMessage: `${data.name}님은 운이 없어서 늦어지는 사람이 아닙니다. 기준이 흩어질 때 결과가 늦게 나타나는 사람입니다. 앞으로는 불안해서 움직이기보다 오래 가져갈 수 있는 일, 사람, 돈의 기준을 세우는 것이 가장 중요합니다.`,
  });
}
