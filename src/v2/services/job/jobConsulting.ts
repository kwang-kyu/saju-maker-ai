import type { BasicSajuResult } from "../../types/basic";
import { buildMasterDecision } from "../framework/masterDecisionEngine";

function getAge(birthDate?: string) {
  const birthYear = Number(String(birthDate || "").slice(0, 4));
  if (!birthYear) return 0;
  return new Date().getFullYear() - birthYear + 1;
}

function getAgeCareerStrategy(age: number) {
  if (!age) return "현재는 나이보다 경력 수준, 수입 구조, 전문성 축적 상태를 기준으로 직업 방향을 보는 것이 좋습니다.";
  if (age <= 34) return "지금은 완성된 직업을 찾기보다 실무 경험, 기술, 포트폴리오를 쌓으며 나에게 맞는 일의 방식을 찾는 시기입니다.";
  if (age <= 49) return "지금은 단순 이직보다 전문성, 권한, 수입 구조, 장기 성장성을 함께 보며 커리어를 재정리해야 하는 시기입니다.";
  if (age <= 64) return "지금은 기존 경험을 관리, 교육, 자문, 영업, 컨설팅, 소규모 사업으로 바꾸는 전략이 중요합니다.";
  return "지금은 경력보다 경험, 신뢰, 관계를 활용하는 일이 좋습니다. 건강을 해치지 않으면서 보람과 생활 리듬을 지키는 방향이 맞습니다.";
}

function getRoleStrategy(data: BasicSajuResult) {
  const strong = String(data.strongestElement || "");

  if (strong.includes("목") || strong.includes("화")) {
    return "기획, 표현, 상담, 교육, 홍보, 브랜드처럼 사람을 움직이고 방향을 제시하는 역할에서 강점이 살아납니다.";
  }

  if (strong.includes("금") || strong.includes("토")) {
    return "관리, 판단, 정리, 계약, 운영, 책임 있는 의사결정처럼 기준을 세우는 역할에서 강점이 살아납니다.";
  }

  if (strong.includes("수")) {
    return "정보 분석, 전략 수립, 흐름 파악, 기획 지원, 상담처럼 생각을 정리해 방향을 잡는 역할에서 강점이 살아납니다.";
  }

  return "단순 반복보다 판단, 상담, 정리, 기획, 고객 신뢰가 필요한 역할에서 직업운이 안정됩니다.";
}

export function jobConsulting(data: BasicSajuResult, birthDate?: string, masterDecision?: ReturnType<typeof buildMasterDecision>): string {
  const name = data.name;
  const age = getAge(birthDate);
  const ageCareerStrategy = getAgeCareerStrategy(age);
  const roleStrategy = getRoleStrategy(data);
  const decision = masterDecision ?? buildMasterDecision(data);

  
  return `
직업 성장 상담

1. 직업 판단의 핵심

결론부터 말씀드리면,

${name}님은 어떤 직업을 선택하느냐보다
어떤 역할을 맡고 어떤 환경에서 일하느냐에 따라
실력과 성과의 차이가 크게 나타나는 유형입니다.

중요한 것은 직업의 이름이 아니라
내가 잘하는 일이 인정받는 구조인지,
경험이 시간이 지날수록 자산이 되는 일인지,
수입이 꾸준히 이어질 수 있는 구조인지를
함께 살펴보는 것입니다.

2. 현재 커리어 분석

${name}님은 무조건 오래 버티는 방식보다
명확한 기준 아래에서
스스로 판단하고 책임질 수 있을 때
능력이 가장 자연스럽게 발휘됩니다.

역할이 애매하거나 일이 많기만 하고
인정과 성과 기준이 불분명한 곳에서는 쉽게 지칠 수 있습니다.

3. 나에게 맞는 역할

${roleStrategy}

좋은 직업은 직함이 아니라
매일 반복하는 업무가 나와 맞는 직업입니다.

매일 하는 일이 무엇인지,
내가 결정할 수 있는 범위가 있는지,
성과가 기록으로 남는지,
경험이 다음 기회로 이어지는지를 확인해야 합니다.

4. 피해야 할 직업 환경

다음 환경은 신중해야 합니다.

- 책임은 많은데 권한은 없는 곳
- 성과 기준이 불분명한 곳
- 사람 감정만 계속 받아내야 하는 곳
- 오래 일해도 기술이나 기록이 남지 않는 곳
- 수입 구조가 불안정한데 고정 부담이 큰 곳

직업운은 버티는 힘만으로 좋아지지 않습니다.
맞지 않는 환경을 오래 견디면 건강과 자신감까지 흔들릴 수 있습니다.

5. 이직과 전환 판단

이직은 감정으로 결정하면 안 됩니다.

다음 네 가지를 확인한 뒤 움직이는 것이 좋습니다.

첫째, 지금 일에서 더 배울 것이 남아 있는가.
둘째, 옮기려는 곳에서 역할과 권한이 더 분명한가.
셋째, 수입은 늘어도 체력과 시간 부담이 감당 가능한가.
넷째, 1년 뒤 경력에 남는 결과물이 생기는가.

네 가지 중 두 가지 이상 좋아진다면 전환을 검토할 수 있습니다.
반대로 단순히 힘들어서 옮기는 이직은 비슷한 문제가 반복될 수 있습니다.

6. 나이에 맞는 직업 전략

${ageCareerStrategy}

7. 앞으로 3년 커리어 로드맵

1년 차에는 현재 일에서 내가 잘하는 역할과 반복적으로 지치는 업무를 구분해야 합니다.

2년 차에는 남들이 보기에도
이 분야는 ${name}님이 잘한다
라고 말할 수 있는 결과물을 만들어야 합니다.

3년 차에는 검증된 강점을 바탕으로
직책, 수입, 부업, 프리랜서, 교육, 상담, 소규모 사업 중 하나로 확장할 수 있습니다.

8. 오늘부터 실천할 것

- 지금 하는 일 중 잘하는 업무 3가지를 적으십시오.
- 반복적으로 지치는 업무 3가지를 적으십시오.
- 내 경력에 남는 결과물을 하나 정하십시오.
- 이직을 고민한다면 연봉보다 역할, 권한, 성장성을 같이 비교하십시오.
- 앞으로 3년 동안 쌓을 전문 분야를 하나 정하십시오.

9. 의사결정 보강 가이드

Master Decision 기준으로 보면 ${name}님의 현재 의사결정 방식은 ${decision.decisionStyle}에 가깝습니다.

올해의 핵심 키워드는 ${decision.yearlyKeyword}이며, 직업 방향에서는 ${decision.careerStrategy}이 중요합니다.

지금 당장 해야 할 일은 ${decision.actionNow[0]}입니다.
다음 단계에서는 ${decision.actionNext[0]}를 기준으로 움직이는 것이 좋습니다.

주의할 점은 ${decision.warnings[0]}

직업은 한 번의 선택으로 결정되지 않습니다.

지금 어떤 경험을 쌓고,
어떤 사람들과 함께 일하며,
무엇으로 인정받는지가
앞으로의 직업운을 만들어 갑니다.

최종 총평

${name}님의 직업운은 이름 좋은 직업을 찾는 것보다
내 능력이 인정되는 환경을 찾는 것이 핵심입니다.

앞으로는 무작정 버티기보다
경험이 쌓이는 일을 선택하고,
신뢰가 쌓이는 사람으로 성장하며,
수입이 이어지는 구조를 만드는 방향으로
커리어를 설계하는 것이 좋습니다.

직업은 생계이기도 하지만,
시간이 쌓여 나를 설명해주는 이력이기도 합니다.
그 이력이 남는 방향으로 가면 직업운은 훨씬 안정적으로 살아납니다.
`.trim();
}




