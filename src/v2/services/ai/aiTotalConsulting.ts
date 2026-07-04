import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingDecision } from "../case/consultingDecision";

function getValue(data: BasicSajuResult, key: string, fallback = "") {
  const value = (data as unknown as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getAge(data: BasicSajuResult) {
  const birthDate = getValue(data, "birthDate");
  const birthYear = Number(birthDate.slice(0, 4));
  if (!birthYear) return 0;
  return new Date().getFullYear() - birthYear + 1;
}

function getAgeAdvice(age: number) {
  if (!age) return "지금은 인생의 방향을 넓히기보다 기준을 다시 세우는 것이 중요합니다.";
  if (age <= 29) return "지금은 결과를 서두르기보다 경험, 실력, 방향성을 쌓아야 하는 시기입니다.";
  if (age <= 44) return "지금은 일, 수입, 관계의 기반을 만들고 오래 갈 구조를 잡아야 하는 시기입니다.";
  if (age <= 59) return "지금은 무리한 확장보다 선택과 정리로 실속을 남겨야 하는 시기입니다.";
  return "지금은 안정, 건강, 자산관리, 관계 정리를 우선해야 하는 시기입니다.";
}

function getMainStrategy(strongestElement: string, weakestElement: string) {
  if (strongestElement.includes("목") || strongestElement.includes("화")) {
    return "기획, 표현, 브랜딩, 사람을 움직이는 역할을 살리되, 실행 범위는 작게 나누는 것이 좋습니다.";
  }
  if (strongestElement.includes("토") || strongestElement.includes("금")) {
    return "관리, 판단, 정리, 책임지는 역할에서 강점이 살아납니다. 다만 혼자 모두 떠안지 않는 구조가 필요합니다.";
  }
  if (strongestElement.includes("수")) {
    return "정보를 읽고 흐름을 판단하는 힘이 있으므로, 성급한 실행보다 자료 확인과 전략 수립 후 움직이는 것이 좋습니다.";
  }
  if (weakestElement.includes("토") || weakestElement.includes("금")) {
    return "생활, 돈, 일정, 사람 관계의 기준을 먼저 세워야 합니다. 기준이 잡히면 운의 흔들림이 줄어듭니다.";
  }
  return "지금은 더 많이 벌리는 것보다 오래 가져갈 수 있는 방향을 선별하는 것이 중요합니다.";
}

function getThreeYearRoadmap(name: string, riskLevel: string) {
  if (riskLevel === "danger") {
    return `1년 차에는 무리한 실행보다 정리와 회복이 우선입니다.
${name}님은 손실 가능성, 건강 부담, 자금 압박을 먼저 줄여야 합니다.
2년 차에는 작게 테스트하면서 가능성을 확인하십시오.
3년 차에는 검증된 방향만 남기고 천천히 넓히는 것이 좋습니다.`;
  }

  if (riskLevel === "watch") {
    return `1년 차에는 준비와 검증이 핵심입니다.
자금, 사람, 일정, 건강 조건을 먼저 맞추십시오.
2년 차에는 조건이 맞는 영역부터 작게 실행하십시오.
3년 차에는 결과가 확인된 방향만 넓히는 것이 좋습니다.`;
  }

  return `1년 차에는 방향을 정하고 작게 실행하십시오.
2년 차에는 성과가 나는 영역에 집중하십시오.
3년 차에는 경험, 신뢰, 반복 수익이 쌓이는 구조로 확장하는 것이 좋습니다.`;
}

export function getAiTotalConsulting(data: BasicSajuResult): string {
  const name = data.name;
  const age = getAge(data);
  const strongestElement = getValue(data, "strongestElement", "강한 기운");
  const weakestElement = getValue(data, "weakestElement", "보완할 기운");
  const decision = buildConsultingDecision(data, "AI 종합상담");
  const ageAdvice = getAgeAdvice(age);
  const mainStrategy = getMainStrategy(strongestElement, weakestElement);
  const roadmap = getThreeYearRoadmap(name, decision.riskLevel);

  return `
AI 원장 종합상담

1. 원장 판단

한마디로 말하면,
${decision.verdict}

지금 ${name}님에게 필요한 것은 점수나 등급이 아니라
현실에서 바로 적용할 수 있는 선택 기준입니다.

사주는 좋고 나쁨을 단정하는 도구가 아니라,
지금 감당 가능한 방향과 오래 갈 수 있는 방식을 찾는 기준입니다.

2. 현재 가장 중요한 방향

${ageAdvice}

지금은 새로운 것을 계속 늘리기보다
돈, 일, 사람, 건강에서 무엇을 남기고 무엇을 줄일지 정해야 합니다.

${mainStrategy}

3. 실행 전략

${decision.timing}

첫째, 지금 바로 크게 바꾸기보다 작게 실행할 수 있는 일부터 시작하십시오.
둘째, 돈이 들어오는 구조와 새어나가는 구조를 따로 정리하십시오.
셋째, 혼자 감당해야 할 일과 도움을 받아야 할 일을 나누십시오.
넷째, 결과가 보이는 방향만 반복해서 키우십시오.

4. 재물과 일의 방향

재물은 한 번에 크게 벌기보다
잃지 않고 오래 유지되는 구조를 만드는 것이 중요합니다.

일에서는 단순히 바쁜 것보다
내 이름, 경험, 신뢰, 반복 수익이 남는 방향을 선택하는 것이 좋습니다.

특히 ${name}님은 감정으로 밀어붙이는 방식보다
기준을 세우고 순서를 정했을 때 결과가 안정됩니다.

5. 인간관계와 건강 관리

관계에서는 많은 사람을 만나는 것보다
오래 갈 사람과 부담이 되는 사람을 구분하는 것이 중요합니다.

건강은 큰 병을 단정하는 방식이 아니라
수면, 식사, 걷기, 휴식, 일정 조절처럼 생활 리듬을 지키는 쪽으로 보아야 합니다.

몸이 지치면 판단이 흔들리고,
판단이 흔들리면 일과 돈의 흐름도 같이 흔들릴 수 있습니다.

6. 앞으로 3년 로드맵

${roadmap}

7. 오늘부터 실천할 것

- 이번 주에 줄일 일 한 가지를 정하십시오.
- 이번 주에 집중할 일 한 가지를 정하십시오.
- 돈, 건강, 관계 중 가장 불안한 영역을 먼저 기록하십시오.
- 무리한 확장보다 반복 가능한 구조를 하나 만드십시오.

최종 총평

${name}님은 운이 없는 사람이 아닙니다.
다만 지금은 더 많이 벌리는 것보다
오래 갈 수 있는 기준을 세우는 것이 먼저입니다.

작게 시작하고,
검증하고,
반복 가능한 구조로 만들면
앞으로의 흐름은 훨씬 안정적으로 열릴 수 있습니다.
`.trim();
}