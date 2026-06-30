import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingFramework } from "../framework/consultingFramework";
import { buildSajuIdentityProfile } from "../profile/sajuIdentityProfile";

export function jobConsulting(data: BasicSajuResult): string {
  const name = data.name;
  const identity = buildSajuIdentityProfile(data);

  return buildConsultingFramework({
    name,
    title: "직업 상담",
    firstImpression: `${data.dayMaster} 일간과 ${data.yearGanZhi}${data.monthGanZhi}${data.dayGanZhi} 흐름을 함께 보면 ${name}님의 직업운은 직업 이름보다 역할, 책임 범위, 인정 구조에서 더 크게 살아납니다. 어떤 직업이 좋다 나쁘다보다 어떤 환경에서 능력이 살아나는지가 중요합니다.

${identity.lifeStyle}

${identity.decisionStyle}`,
    personInsight: `${name}님은 단순히 시키는 일만 반복하는 구조보다 스스로 판단하고 정리할 수 있는 일이 있을 때 집중력이 살아나는 편입니다. 강하게 살아나는 ${data.strongestElement} 기운은 일에서 자연스럽게 드러나는 장점이고, 부족한 ${data.weakestElement} 기운은 직업 선택에서 보완해야 할 부분입니다.

${identity.workStyle}`,
    repeatedPattern: `${name}님은 아무 일이나 오래 버티는 사람은 아닙니다. 맡은 일은 책임 있게 하려 하지만, 역할이 애매하거나 성과가 인정되지 않는 환경에서는 마음이 쉽게 지칠 수 있습니다. 반대로 책임과 권한, 평가 기준이 분명한 곳에서는 시간이 갈수록 실력이 쌓이고 신뢰가 커집니다.

${identity.riskPoint}`,
    realCase: `실제 상담에서 이런 흐름을 가진 분들은 "나는 열심히 하는데 왜 인정받지 못하지?", "일은 많은데 왜 보람은 적지?", "이 일을 계속해도 될까?"라는 고민을 자주 합니다. 문제는 능력이 없는 것이 아니라 역할과 기준이 정리되지 않은 경우가 많습니다.`,
    futureFlow: `앞으로 3년 직업 흐름은 정리, 전문성, 확장의 순서로 보는 것이 좋습니다.

1년 차에는 현재 하는 일에서 내가 잘하는 것과 반복적으로 지치는 일을 구분해야 합니다.
2년 차에는 남들이 보기에도 이 분야는 ${name}님이 잘한다는 인식이 생기도록 결과물을 만들어야 합니다.
3년 차에는 이미 검증된 강점을 바탕으로 역할이나 수익 구조를 넓히는 방향이 좋습니다.

사업이나 프리랜서를 생각한다면 처음부터 크게 벌이기보다 작은 상품, 작은 서비스, 작은 고객층으로 시작해서 반복 구매와 재문의가 생기는지 확인하는 방식이 안전합니다.`,
    actionGuide: `첫째, 지금 하는 일에서 내가 잘하는 일을 적어보세요.
둘째, 반복적으로 지치는 업무를 따로 정리하세요.
셋째, 업무 범위와 책임을 말로 분명히 해야 합니다.
넷째, 성과는 기억에 맡기지 말고 기록으로 남기세요.
다섯째, 이직이나 사업은 감정이 아니라 조건과 숫자로 판단해야 합니다.
여섯째, 앞으로 3년 동안 쌓을 기술, 콘텐츠, 전문 분야를 하나 정하세요.`,
    finalMessage: `${name}님의 직업운은 이름 좋은 직업을 찾는 것보다 내 능력이 인정되는 환경을 찾는 것이 핵심입니다. 지금 당장 화려하지 않아도 괜찮습니다. 다만 앞으로는 아무 일이나 버티기보다 경험이 쌓이고, 내 이름이 남고, 내 기준이 살아나는 방향으로 직업 흐름을 잡아가야 합니다.

${identity.successPoint}`,
  });
}
