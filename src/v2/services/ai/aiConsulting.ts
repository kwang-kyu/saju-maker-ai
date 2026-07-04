import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingDecision } from "../case/consultingDecision";
import { buildMasterDecision } from "../framework/masterDecisionEngine";

function getMainConcern(concern?: string) {
  const value = String(concern ?? "").trim();
  return value || "현재 가장 중요한 고민";
}

function getQuestionInsight(topic: string) {
  if (topic.includes("건강")) return "지금 상담의 핵심은 막연히 건강을 걱정하는 것이 아니라 생활 리듬을 먼저 회복하고 몸의 부담을 줄이는 것입니다.";
  if (topic.includes("사업") || topic.includes("창업") || topic.includes("부업")) return "지금 상담의 핵심은 일을 크게 벌리는 것보다 어떤 역할을 직접 맡고 어떤 부분을 시스템으로 만들 것인가입니다.";
  if (topic.includes("돈") || topic.includes("재물") || topic.includes("투자")) return "지금 상담의 핵심은 크게 버는 것보다 손실을 줄이고 반복적으로 남는 구조를 만드는 것입니다.";
  if (topic.includes("직업") || topic.includes("이직") || topic.includes("커리어")) return "지금 상담의 핵심은 직업 이름보다 오래 버틸 수 있는 역할과 환경을 찾는 것입니다.";
  if (topic.includes("연애") || topic.includes("결혼") || topic.includes("관계")) return "지금 상담의 핵심은 좋은 사람을 만나는 것뿐 아니라 나를 소모시키지 않는 관계 기준을 세우는 것입니다.";
  return "지금 상담의 핵심은 막연한 불안보다 현재 선택해야 할 한 가지를 분명히 정하는 것입니다.";
}

function getActionPlan(topic: string) {
  if (topic.includes("건강")) {
    return `첫째, 수면 시간을 먼저 고정하십시오.
둘째, 식사는 과식, 야식, 불규칙한 식사부터 줄이십시오.
셋째, 운동은 걷기와 스트레칭처럼 매일 이어갈 수 있는 방식이 좋습니다.
넷째, 반복되는 증상이 있다면 병원 검진을 미루지 않는 것이 좋습니다.`;
  }

  if (topic.includes("사업") || topic.includes("창업") || topic.includes("부업")) {
    return `첫째, 바로 크게 시작하지 말고 작은 상품이나 서비스 하나를 먼저 만드십시오.
둘째, 내가 직접 해야 할 일은 상담, 기획, 판단, 고객 응대입니다.
셋째, 반복 업무는 가능한 한 시스템으로 분리해야 오래 갑니다.
넷째, 첫 고객을 만들기 전까지 고정비를 크게 늘리지 않는 것이 좋습니다.`;
  }

  if (topic.includes("돈") || topic.includes("재물") || topic.includes("투자")) {
    return `첫째, 이번 달 고정지출과 남는 돈을 적어보십시오.
둘째, 투자보다 현금흐름과 비상자금 기준을 먼저 세우십시오.
셋째, 한 번에 크게 넣기보다 작게 나누어 검증하는 방식이 좋습니다.
넷째, 감정적으로 결정한 지출은 하루 뒤 다시 판단하십시오.`;
  }

  return `첫째, 오늘 가장 중요한 선택 한 가지를 정하십시오.
둘째, 이번 주 안에 작게 실행할 수 있는 계획으로 쪼개십시오.
셋째, 혼자 모든 것을 감당하려 하지 말고 역할과 우선순위를 나누십시오.
넷째, 결과가 보이는 일부터 반복해서 구조로 만드십시오.`;
}

export function getAiConsulting(data: BasicSajuResult, concern?: string): string {
  const name = data.name;
  const topic = getMainConcern(concern);
  const caseDecision = buildConsultingDecision(data, topic);
  const masterDecision = buildMasterDecision(data);
  const questionInsight = getQuestionInsight(topic);
  const actionPlan = getActionPlan(topic);

  return `
천운문 AI 종합상담

상담 질문
${topic}

1. 원장 판단

결론부터 말씀드리면,
${caseDecision.verdict}

지금은 점수로 좋고 나쁨을 나누는 문제가 아닙니다.
${name}님에게 중요한 것은 이 선택을 감당 가능한 방식으로 현실화하는 것입니다.

2. 질문 분석

${questionInsight}

이 고민은 막연히 운이 좋다, 나쁘다로 볼 것이 아닙니다.
지금 무엇을 먼저 하고, 무엇을 줄이며, 어떤 방식으로 오래 가져갈지를 보는 것이 중요합니다.

3. Master Decision 종합 기준

Master Decision 기준으로 보면
${name}님의 현재 인생 흐름은 ${masterDecision.lifePhase}에 가깝습니다.

올해의 핵심 키워드는 ${masterDecision.yearlyKeyword}이고,
가장 먼저 봐야 할 우선순위는 ${masterDecision.priorityArea}입니다.

의사결정 방식은 ${masterDecision.decisionStyle}에 가까우므로,
감정적으로 한 번에 결정하기보다 기준을 세우고 순서를 정해 움직이는 것이 좋습니다.

4. 사주 근거

사주 흐름상 ${name}님은 무리하게 한 번에 방향을 바꾸기보다
기준을 세우고, 순서를 정하고, 결과가 남는 방식으로 움직일 때 안정됩니다.

강점은 살리고,
부담이 커지는 방식은 줄이는 것이 이번 상담의 핵심입니다.

5. 실행 전략

${caseDecision.timing}

${actionPlan}

6. 실패 확률을 줄이는 방법

${caseDecision.riskReason}

Master Decision 경고 기준으로 보면,
${masterDecision.warnings[0]}

무리하게 확장하기보다
작게 검증하고 반복 가능한 구조를 만든 뒤 넓히는 것이 좋습니다.

7. 오늘부터 실천할 것

- 오늘 해야 할 일 1가지를 정하십시오.
- 이번 주 안에 확인할 숫자나 결과를 정하십시오.
- 혼자 감당할 일과 도움을 받을 일을 나누십시오.
- 감정으로 결정하지 말고 기록을 보고 판단하십시오.
- ${masterDecision.actionNow[0]}
- ${masterDecision.actionNext[0]}

8. 계속 상담 질문

다음 상담에서는
"지금 상황에서 무엇부터 시작하면 좋을까요?"
또는
"이 선택에서 가장 조심해야 할 부분은 무엇인가요?"
처럼 구체적으로 질문하면 더 정확한 방향을 잡을 수 있습니다.

최종 총평

${name}님은 운이 없는 사람이 아닙니다.
다만 지금은 일을 많이 벌리는 것보다 오래 갈 수 있는 기준을 세우는 것이 먼저입니다.

${masterDecision.finalDirection}

작게 시작하고,
검증하고,
반복 가능한 구조로 만들면
앞으로의 흐름은 훨씬 안정적으로 열릴 수 있습니다.
`.trim();
}
