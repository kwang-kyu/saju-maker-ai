import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingDecision } from "../case/consultingDecision";
import { buildMasterDecision } from "../framework/masterDecisionEngine";

function getMainConcern(concern?: string) {
  const value = String(concern ?? "").trim();
  return value || "현재 가장 중요한 고민";
}

function getTopicType(topic: string) {
  if (topic.includes("건강") || topic.includes("몸") || topic.includes("병원") || topic.includes("수면")) return "health";
  if (topic.includes("사업") || topic.includes("창업") || topic.includes("부업") || topic.includes("장사")) return "business";
  if (topic.includes("돈") || topic.includes("재물") || topic.includes("투자") || topic.includes("집") || topic.includes("부동산")) return "money";
  if (topic.includes("직업") || topic.includes("이직") || topic.includes("퇴사") || topic.includes("커리어")) return "job";
  if (topic.includes("연애") || topic.includes("결혼") || topic.includes("상대") || topic.includes("관계")) return "relationship";
  return "general";
}

function getDirectAnswer(topic: string, decisionStyle: string) {
  const type = getTopicType(topic);

  if (type === "job") {
    if (topic.includes("퇴사")) {
      return "지금 바로 감정적으로 퇴사하는 것은 추천하지 않습니다. 다만 다음 직장, 수입 공백, 6개월 생활비가 준비되어 있다면 단계적으로 옮기는 것은 가능합니다.";
    }
    if (topic.includes("이직")) {
      return "이직은 가능합니다. 다만 연봉만 보고 움직이기보다 역할, 권한, 성장성, 1년 뒤 남는 경력을 기준으로 판단해야 합니다.";
    }
    return "직업 문제는 지금 당장 바꾸기보다 내가 오래 버틸 수 있는 역할과 환경을 먼저 정리하는 것이 좋습니다.";
  }

  if (type === "business") {
    return "사업이나 부업은 가능합니다. 다만 처음부터 크게 시작하지 말고 작은 상품, 작은 고객, 작은 매출로 검증한 뒤 키우는 방식이 맞습니다.";
  }

  if (type === "money") {
    if (topic.includes("집") || topic.includes("부동산")) {
      return "부동산은 급하게 결정할 시점은 아닙니다. 실거주인지 투자용인지 먼저 나누고, 대출 부담을 감당할 수 있을 때만 검토하는 것이 좋습니다.";
    }
    return "재테크는 공격보다 구조가 먼저입니다. 지금은 크게 벌 생각보다 현금흐름, 비상자금, 손실 한도를 먼저 정해야 합니다.";
  }

  if (type === "relationship") {
    return "관계나 결혼은 가능합니다. 다만 감정보다 생활방식, 돈을 쓰는 습관, 가족과의 거리, 갈등을 푸는 방식을 먼저 봐야 합니다.";
  }

  if (type === "health") {
    return "건강은 겁부터 낼 문제는 아니지만 방치하면 안 됩니다. 수면, 식사, 걷기, 검진부터 바로 잡는 것이 우선입니다.";
  }

  return decisionStyle === "주도형"
    ? "지금은 할 수는 있지만 한 번에 크게 움직이면 부담이 커질 수 있습니다. 작게 검증하고 확장하는 방식이 좋습니다."
    : "지금은 무리한 결정보다 기준을 세우고 순서를 정하는 것이 먼저입니다.";
}

function getReason(topic: string, data: BasicSajuResult) {
  const type = getTopicType(topic);
  const strong = data.strongestElement;
  const weak = data.weakestElement;

  if (type === "job") {
    return `${data.dayMaster} 일간과 ${strong} 기운을 함께 보면, ${data.name}님은 단순히 버티는 일보다 역할과 기준이 분명한 환경에서 힘이 살아납니다. 부족한 ${weak} 기운은 무리한 변화나 감정적 판단에서 흔들릴 수 있는 부분입니다.`;
  }

  if (type === "business") {
    return `${strong} 기운은 추진력과 장점으로 쓸 수 있지만, ${weak} 기운이 약하면 준비 없이 확장할 때 부담이 커질 수 있습니다. 그래서 사업은 크게 시작하기보다 작게 검증하는 방식이 맞습니다.`;
  }

  if (type === "money") {
    return `${data.name}님의 재물 흐름은 돈이 들어오느냐보다 들어온 돈을 어떻게 지키고 배치하느냐가 중요합니다. 강한 ${strong} 기운은 기회 포착에 쓰고, 약한 ${weak} 기운은 리스크 관리 기준으로 보완해야 합니다.`;
  }

  if (type === "relationship") {
    return `${data.name}님의 관계운은 감정의 크기보다 신뢰와 생활 안정에서 갈립니다. 강한 ${strong} 기운은 매력이나 주도성으로 나타날 수 있지만, 부족한 ${weak} 기운은 대화나 생활 리듬에서 보완이 필요합니다.`;
  }

  if (type === "health") {
    return `${weak} 기운은 건강 관리에서 보완해야 할 지점입니다. 사주상 건강은 병명을 단정하는 것이 아니라 몸이 어디서 쉽게 지치고 어떤 생활 리듬을 잡아야 하는지를 보는 것입니다.`;
  }

  return `${data.dayMaster} 일간과 ${data.yearGanZhi}${data.monthGanZhi}${data.dayGanZhi} 흐름을 함께 보면, 지금은 막연히 운이 좋고 나쁨을 따질 때가 아니라 선택의 기준을 정해야 할 때입니다.`;
}

function getActionPlan(topic: string) {
  const type = getTopicType(topic);

  if (type === "job") {
    return `첫째, 지금 일에서 더 배울 것이 남았는지 확인하십시오.
둘째, 이직이나 퇴사를 생각한다면 최소 3개월에서 6개월 생활비를 먼저 확보하십시오.
셋째, 다음 직장에서는 연봉보다 역할, 권한, 성장성을 같이 보십시오.
넷째, 감정적으로 결정하지 말고 1년 뒤 경력에 남을 결과물을 기준으로 판단하십시오.`;
  }

  if (type === "business") {
    return `첫째, 작은 상품이나 서비스를 하나만 정하십시오.
둘째, 첫 고객을 만들기 전까지 고정비를 늘리지 마십시오.
셋째, 상담, 기획, 고객 응대처럼 내가 직접 해야 할 일과 반복 업무를 나누십시오.
넷째, 3개월 동안 매출 반응을 확인한 뒤 확장 여부를 결정하십시오.`;
  }

  if (type === "money") {
    return `첫째, 이번 달 고정지출과 남는 돈을 적으십시오.
둘째, 비상자금과 투자금을 분리하십시오.
셋째, 대출이 필요한 결정은 월 상환액을 먼저 계산하십시오.
넷째, 투자나 부동산은 한 번에 크게 들어가지 말고 감당 가능한 범위에서 판단하십시오.`;
  }

  if (type === "relationship") {
    return `첫째, 상대의 말보다 반복되는 행동을 보십시오.
둘째, 돈, 가족, 주거, 생활방식을 피하지 말고 대화하십시오.
셋째, 외로움이나 불안 때문에 결정하지 마십시오.
넷째, 3개월 이상 같은 문제가 반복되는지 확인하십시오.`;
  }

  if (type === "health") {
    return `첫째, 잠드는 시간을 먼저 고정하십시오.
둘째, 야식, 과식, 과한 카페인부터 줄이십시오.
셋째, 하루 20분 걷기부터 시작하십시오.
넷째, 반복되는 증상이 있다면 검진을 미루지 마십시오.`;
  }

  return `첫째, 지금 가장 중요한 선택 한 가지를 정하십시오.
둘째, 이번 주 안에 확인할 수 있는 작은 결과를 만드십시오.
셋째, 돈, 시간, 건강 부담을 따로 계산하십시오.
넷째, 3개월 뒤 다시 판단할 기준을 정하십시오.`;
}

function getDoNotDo(topic: string) {
  const type = getTopicType(topic);

  if (type === "job") return "준비 없이 퇴사하거나, 연봉 하나만 보고 옮기는 결정은 피해야 합니다.";
  if (type === "business") return "대출, 임대료, 인건비부터 크게 잡고 시작하는 방식은 피해야 합니다.";
  if (type === "money") return "남의 말만 듣고 급하게 투자하거나, 대출을 과하게 끌어오는 결정은 피해야 합니다.";
  if (type === "relationship") return "감정이 뜨거울 때 바로 결혼이나 동거를 결정하는 것은 피해야 합니다.";
  if (type === "health") return "몸이 보내는 신호를 계속 참고 넘기는 것은 피해야 합니다.";
  return "한 번에 모든 것을 해결하려는 결정은 피해야 합니다.";
}

function getReviewTiming(topic: string) {
  const type = getTopicType(topic);

  if (type === "business") return "3개월 동안 실제 고객 반응과 매출 흐름을 본 뒤 확장 여부를 다시 판단하십시오.";
  if (type === "money") return "최소 1개월 지출 흐름을 기록하고, 3개월 뒤 투자나 부동산 결정을 다시 보는 것이 좋습니다.";
  if (type === "job") return "30일 동안 현재 직장의 장단점과 다음 선택지를 정리하고, 3개월 안에 이동 여부를 판단하십시오.";
  if (type === "relationship") return "감정이 아니라 반복되는 행동을 3개월 정도 보고 판단하는 것이 좋습니다.";
  if (type === "health") return "2주 동안 생활 리듬을 조정해보고, 불편함이 계속되면 검진을 받는 것이 좋습니다.";
  return "이번 주에 작게 실행하고, 30일 뒤 결과를 보고 다시 판단하십시오.";
}

export function getAiConsulting(data: BasicSajuResult, concern?: string): string {
  const name = data.name;
  const topic = getMainConcern(concern);
  const caseDecision = buildConsultingDecision(data, topic);
  const masterDecision = buildMasterDecision(data);

  const directAnswer = getDirectAnswer(topic, masterDecision.decisionStyle);
  const reason = getReason(topic, data);
  const actionPlan = getActionPlan(topic);
  const doNotDo = getDoNotDo(topic);
  const reviewTiming = getReviewTiming(topic);

  return `
천운문 AI 종합상담

상담 질문
${topic}

1. 결론부터 말씀드리겠습니다

${directAnswer}

제가 보기에는 이 문제를 오래 설명하기보다
먼저 결론, 조건, 행동 순서로 정리하는 것이 맞습니다.

2. 왜 이렇게 판단하는가

${reason}

또한 Master Decision 기준으로 보면
${name}님의 현재 흐름은 ${masterDecision.lifePhase}에 가깝고,
올해의 핵심 키워드는 ${masterDecision.yearlyKeyword}입니다.

가장 먼저 봐야 할 우선순위는 ${masterDecision.priorityArea}입니다.

3. 지금 해도 되는가

${caseDecision.verdict}

다만 조건 없이 바로 움직이는 것은 좋지 않습니다.
지금은 ${masterDecision.decisionStyle} 의사결정 방식에 맞게
기준을 세우고, 작은 실행으로 검증한 뒤 넓히는 것이 안전합니다.

4. 지금 바로 할 일

${actionPlan}

5. 절대 먼저 하면 안 되는 것

${doNotDo}

특히 ${masterDecision.warnings[0]}

이 부분을 지키지 않으면 좋은 운이 와도 결과가 흔들릴 수 있습니다.

6. 언제 다시 판단해야 하는가

${reviewTiming}

${caseDecision.timing}

7. 다음 질문으로 이어가는 법

다음에는 이렇게 물어보시면 더 정확하게 답할 수 있습니다.

- "이 선택을 한다면 가장 먼저 준비할 것은 무엇인가요?"
- "지금 하면 안 되는 이유가 있다면 무엇인가요?"
- "3개월 안에 어떤 결과가 나오면 계속해도 되나요?"
- "돈, 건강, 관계 중 무엇을 가장 조심해야 하나요?"

최종 총평

${name}님은 운이 없는 사람이 아닙니다.
다만 지금은 마음이 급하다고 한 번에 크게 움직일 때가 아니라,
기준을 세우고 작게 검증하면서 현실적인 결과를 만들어야 할 때입니다.

${masterDecision.finalDirection}

결론적으로,
지금 선택은 가능합니다.
하지만 바로 크게 움직이지 말고
작게 시작하고,
숫자로 확인하고,
3개월 뒤 다시 판단하는 방식이 가장 안전합니다.
`.trim();
}
