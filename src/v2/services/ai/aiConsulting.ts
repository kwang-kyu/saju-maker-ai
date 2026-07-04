import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingDecision } from "../case/consultingDecision";

function getMainConcern(concern?: string) {
  const value = String(concern ?? "").trim();
  return value || "현재 가장 중요한 고민";
}

function getQuestionInsight(topic: string) {
  if (topic.includes("건강")) return "지금 상담의 핵심은 건강을 막연히 걱정하는 것이 아니라, 생활 리듬을 먼저 회복하고 몸의 부담을 줄이는 것입니다.";
  if (topic.includes("사업") || topic.includes("창업") || topic.includes("숏폼") || topic.includes("대행")) return "지금 상담의 핵심은 이 일을 할 수 있느냐보다, 어떤 역할을 직접 맡고 어떤 부분을 시스템으로 만들 것인가입니다.";
  if (topic.includes("돈") || topic.includes("재물") || topic.includes("투자")) return "지금 상담의 핵심은 크게 버는 것보다 손실을 줄이고 반복적으로 남는 구조를 만드는 것입니다.";
  if (topic.includes("직업") || topic.includes("일") || topic.includes("이직")) return "지금 상담의 핵심은 직업의 이름보다 오래 버틸 수 있는 역할과 환경을 찾는 것입니다.";
  if (topic.includes("연애") || topic.includes("결혼") || topic.includes("관계")) return "지금 상담의 핵심은 좋은 사람을 만나는 것뿐 아니라, 나를 소모시키지 않는 관계 기준을 세우는 것입니다.";
  return "지금 상담의 핵심은 막연한 불안보다 현재 선택해야 할 한 가지를 분명히 정하는 것입니다.";
}

function getActionPlan(topic: string) {
  if (topic.includes("건강")) {
    return `첫째, 수면 시간을 먼저 고정하십시오.
둘째, 식사는 과식, 야식, 불규칙한 식사부터 줄이십시오.
셋째, 운동은 걷기와 스트레칭처럼 매일 이어갈 수 있는 방식이 좋습니다.
넷째, 반복되는 증상이 있다면 병원 검사를 미루지 않는 것이 좋습니다.`;
  }

  if (topic.includes("사업") || topic.includes("창업") || topic.includes("숏폼") || topic.includes("대행")) {
    return `첫째, 바로 크게 시작하지 말고 작은 상품 하나를 먼저 만드십시오.
둘째, 대표가 직접 해야 할 일은 상담, 기획, 브랜딩입니다.
셋째, 촬영, 편집, 반복 업무는 가능한 한 시스템으로 분리해야 오래 갑니다.
넷째, 첫 고객을 만들기 전까지 고정비를 크게 늘리지 않는 것이 좋습니다.`;
  }

  if (topic.includes("돈") || topic.includes("재물") || topic.includes("투자")) {
    return `첫째, 이번 달 고정지출과 새는 돈부터 적어보십시오.
둘째, 투자보다 현금 흐름과 비상자금 기준을 먼저 세우십시오.
셋째, 큰돈을 한 번에 넣기보다 작게 나누어 검증하는 방식이 좋습니다.
넷째, 감정적으로 결정한 지출은 하루 뒤 다시 판단하십시오.`;
  }

  return `첫째, 오늘 가장 중요한 선택 한 가지를 정하십시오.
둘째, 이번 주 안에 작게 실행할 수 있는 계획으로 쪼개십시오.
셋째, 혼자 모든 것을 감당하려 하지 말고 역할과 우선순위를 나누십시오.
넷째, 결과가 보이는 것부터 반복해서 구조로 만드십시오.`;
}

export function getAiConsulting(data: BasicSajuResult, concern?: string): string {
  const name = data.name;
  const topic = getMainConcern(concern);
  const decision = buildConsultingDecision(data, topic);
  const questionInsight = getQuestionInsight(topic);
  const actionPlan = getActionPlan(topic);

  return `
천운문 AI 원장 상담

상담 질문
${topic}

1. 원장 판단

결론부터 말씀드리면,
${decision.verdict}

지금은 점수로 좋고 나쁨을 나눌 문제가 아닙니다.
${name}님에게 중요한 것은 이 선택을 감당 가능한 방식으로 현실화하는 것입니다.

2. 질문 분석

${questionInsight}

이 고민은 막연히 운이 좋다, 나쁘다로 볼 것이 아니라
지금 무엇을 먼저 하고, 무엇을 줄이며, 어떤 방식으로 오래 가져갈지를 보는 것이 중요합니다.

3. 사주 근거

사주 흐름상 ${name}님은 무리하게 한 번에 밀어붙일 때보다
기준을 세우고 순서를 정했을 때 결과가 안정됩니다.

강점은 살리되,
부담이 커지는 방식은 줄이는 것이 이번 상담의 핵심입니다.

4. 실행 전략

${decision.timing}

${actionPlan}

5. 실패 확률을 줄이는 방법

${decision.riskReason}

무리하게 확장하기보다
작게 검증하고, 반복 가능한 구조를 만든 뒤 넓히는 것이 좋습니다.

6. 오늘부터 실천할 것

- 오늘 해야 할 일 한 가지를 정하십시오.
- 이번 주 안에 확인할 숫자나 결과를 정하십시오.
- 혼자 감당할 일과 도움을 받을 일을 나누십시오.
- 감정으로 결정하지 말고 기록을 보고 판단하십시오.

7. 후속 상담 질문

다음 상담에서는
"지금 상황에서 무엇부터 시작하면 좋을까요?"
또는
"이 선택에서 가장 조심해야 할 부분은 무엇인가요?"
처럼 구체적으로 이어가면 더 정확하게 상담할 수 있습니다.

최종 총평

${name}님은 안 되는 사람이 아닙니다.
다만 좋은 흐름도 방식이 맞아야 오래 갑니다.
이번 선택은 겁내기보다 작게 시작하고,
검증하고,
반복 가능한 구조로 만드는 것이 가장 현실적인 길입니다.
`.trim();
}