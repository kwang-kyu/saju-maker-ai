import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingFramework } from "../framework/consultingFramework";
import { buildSajuIdentityProfile } from "../profile/sajuIdentityProfile";

export function moneyConsulting(data: BasicSajuResult): string {
  const name = data.name;
  const identity = buildSajuIdentityProfile(data);

  return buildConsultingFramework({
    name,
    title: "재물 상담",
    firstImpression: `${data.dayMaster} 일간과 ${data.yearGanZhi}${data.monthGanZhi}${data.dayGanZhi} 흐름을 함께 보면 ${name}님의 재물운은 단순히 돈이 들어오느냐보다 들어온 돈을 어떻게 남기고 지키느냐에서 더 크게 살아납니다.

${identity.moneyStyle}

${identity.decisionStyle}`,
    personInsight: `${name}님은 한 번에 크게 잡는 돈보다 작게 시작해서 꾸준히 쌓아가는 돈의 흐름이 더 안정적인 편입니다. 강하게 살아나는 ${data.strongestElement} 기운은 돈을 벌고 기회를 잡을 때 장점으로 나타나고, 부족한 ${data.weakestElement} 기운은 돈이 새거나 판단이 흔들릴 수 있는 지점으로 보완이 필요합니다.`,
    repeatedPattern: `${name}님은 필요하다고 생각하는 곳에는 돈을 쓰지만, 아깝다고 느끼는 곳에는 쉽게 열지 않는 편입니다. 다만 돈을 쓸 때 기준이 감정에 따라 달라질 수 있으므로 수입보다 먼저 돈을 쓰고 남기는 기준을 세우는 것이 중요합니다.

${identity.riskPoint}`,
    realCase: `실제 상담에서 이런 흐름을 가진 분들은 돈이 한 번에 크게 들어와도 지출 구조가 정리되지 않으면 오래 남지 않는 경우가 많습니다. 특히 기분 때문에 쓰는 돈, 체면 때문에 나가는 돈, 준비되지 않은 투자, 매달 반복되는 고정 지출이 재물운을 무겁게 만들 수 있습니다.`,
    futureFlow: `앞으로 3년 재물 흐름은 정리, 안정, 확장의 순서로 보는 것이 좋습니다.

1년 차에는 수입을 늘리기보다 지출 구조를 다시 보고 돈이 어디로 새는지 확인하는 것이 먼저입니다.
2년 차에는 작게라도 꾸준히 남는 돈을 만들고 6개월, 1년 단위로 돈의 흐름을 보는 습관을 만들어야 합니다.
3년 차에는 검증된 구조 안에서 수입원을 넓히는 방향이 좋습니다.

무리한 투자나 한 번에 큰돈을 잡으려는 방식보다 반복적으로 들어오는 돈, 신뢰를 바탕으로 생기는 돈, 경험이 쌓이면서 커지는 돈이 더 잘 맞습니다.`,
    actionGuide: `첫째, 매달 빠져나가는 고정 지출부터 정리해야 합니다.
둘째, 투자는 감정이 아니라 숫자와 현금 흐름을 보고 결정해야 합니다.
셋째, 돈이 들어오면 바로 쓰기보다 남기는 비율을 먼저 정해야 합니다.
넷째, 큰 수익보다 오래 유지되는 수입 구조를 우선으로 보셔야 합니다.`,
    finalMessage: `${name}님의 재물운은 돈복이 없다는 흐름이 아닙니다. 돈이 들어왔을 때 오래 머물 수 있는 구조를 만들어야 재물운이 살아나는 흐름입니다. 앞으로는 얼마나 버느냐보다 얼마나 남기고, 얼마나 오래 지키느냐를 기준으로 보시면 좋습니다.

${identity.successPoint}`,
  });
}
