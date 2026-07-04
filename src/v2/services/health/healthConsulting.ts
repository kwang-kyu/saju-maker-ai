import type { BasicSajuResult } from "../../types/basic";
import { buildMasterDecision } from "../framework/masterDecisionEngine";

function getAge(birthDate?: string) {
  const birthYear = Number(String(birthDate || "").slice(0, 4));
  if (!birthYear) return 0;
  return new Date().getFullYear() - birthYear + 1;
}

function getHealthAgeStrategy(age: number) {
  if (!age) return "현재는 나이보다 수면, 식사, 스트레스, 회복 리듬을 먼저 점검하는 것이 좋습니다.";
  if (age <= 34) return "지금은 체력이 있다고 무리하기 쉬운 시기입니다. 밤샘, 불규칙한 식사, 과한 카페인, 운동 부족을 줄여야 합니다.";
  if (age <= 49) return "지금은 일과 책임이 늘면서 회복력이 떨어지기 쉬운 시기입니다. 혈압, 혈당, 간 기능, 체중, 소화 상태를 주기적으로 확인하는 것이 좋습니다.";
  if (age <= 64) return "지금은 체력보다 회복력과 예방 관리가 중요합니다. 걷기, 근력 운동, 정기검진, 식사 조절을 꾸준히 이어가야 합니다.";
  return "지금은 무리한 운동보다 일상 회복, 근력 유지, 식사 조절, 정기검진, 충분한 수면이 중요합니다.";
}

function getHealthFocus(data: BasicSajuResult) {
  const weak = String(data.weakestElement || "");

  if (weak.includes("목")) return "몸이 굳고 긴장이 쌓이기 쉬우므로 스트레칭, 걷기, 자세 관리가 중요합니다.";
  if (weak.includes("화")) return "활력과 순환 리듬이 약해지기 쉬우므로 햇빛, 가벼운 유산소 운동, 규칙적인 생활이 필요합니다.";
  if (weak.includes("토")) return "소화와 식사 리듬이 흔들리기 쉬우므로 과식, 야식, 불규칙한 식사를 줄이는 것이 우선입니다.";
  if (weak.includes("금")) return "호흡, 피부, 면역, 과로 후 컨디션 저하를 조심해야 하므로 실내 공기와 휴식 관리가 필요합니다.";
  if (weak.includes("수")) return "수면과 회복력이 약해지기 쉬우므로 늦게까지 버티는 습관을 줄이고 깊은 휴식을 확보해야 합니다.";

  return "건강은 특별한 비법보다 수면, 식사, 운동, 스트레스 관리의 기본 리듬에서 먼저 안정됩니다.";
}

export function getHealthConsulting(data: BasicSajuResult, birthDate?: string, masterDecision?: ReturnType<typeof buildMasterDecision>): string {
  const name = data.name;
  const age = getAge(birthDate);
  const ageStrategy = getHealthAgeStrategy(age);
  const healthFocus = getHealthFocus(data);
  const decision = masterDecision ?? buildMasterDecision(data);

  return `
건강 관리 상담

1. 건강 판단의 핵심

결론부터 말씀드리면,
${name}님의 건강은 크게 겁내기보다 생활 리듬을 먼저 바로잡아야 합니다.

지금 중요한 것은 병명을 단정하는 것이 아니라,
몸이 피로를 어떻게 쌓고,
어떤 습관에서 컨디션이 무너지는지를 찾는 것입니다.

2. 현재 건강 흐름

${healthFocus}

${name}님은 무리해서 버티다가 한 번에 지치는 흐름을 조심해야 합니다.

몸이 보내는 신호를 참고 넘기면
수면, 소화, 체력, 기분, 집중력까지 함께 흔들릴 수 있습니다.

3. Master Decision 건강 기준

Master Decision 기준으로 보면 현재 건강 관리의 핵심은 ${decision.healthFocus}입니다.

올해의 전체 흐름은 ${decision.lifePhase}에 가깝고,
생활 판단에서는 ${decision.decisionStyle} 성향이 나타날 수 있습니다.

따라서 건강 관리는 한 번에 크게 바꾸는 방식보다
${decision.finalDirection}

특히 주의할 점은 ${decision.warnings[0]}입니다.

4. 생활습관 관리

첫째, 취침 시간을 먼저 고정하십시오.
둘째, 아침에 일어나는 시간을 일정하게 맞추십시오.
셋째, 야식이나 밤늦은 간식을 줄이십시오.
넷째, 하루 일정을 너무 빽빽하게 잡지 마십시오.

건강운은 특별한 보약보다
매일 반복되는 생활 리듬에서 먼저 좋아집니다.

5. 먹는 것

식사를 갑자기 거창하게 바꾸지 않아도 됩니다.

먼저 줄여야 할 것은
야식, 과식, 불규칙한 식사, 과한 카페인, 늦은 시간의 음주입니다.

가능하면 일정한 시간에 먹고,
너무 단 식사나 기름진 음식을 줄이고,
속이 불편한 음식을 기록해두는 것이 좋습니다.

6. 운동

운동은 강하게 시작하지 마십시오.

${name}님에게는 매일 이어갈 수 있는 운동이 더 중요합니다.

추천 순서는 다음과 같습니다.

- 하루 20~30분 걷기
- 목, 어깨, 허리 스트레칭
- 가벼운 근력 운동
- 오래 앉아 있다면 1시간마다 일어나기

운동은 몸을 벌주는 것이 아니라
몸의 긴장을 풀고 회복력을 올리는 방향이어야 합니다.

7. 병원과 검진 권장

반복되는 통증,
심한 피로,
소화 불편,
두근거림,
어지러움,
수면 문제,
혈압이나 혈당 이상이 있다면 병원 검진을 미루지 않는 것이 좋습니다.

사주는 건강의 경향을 보는 것이고,
정확한 진단은 병원 검사가 기준입니다.

특히 건강검진, 혈압, 혈당, 간 기능, 콜레스테롤, 체중 변화, 수면 상태는 주기적으로 확인하는 것이 좋습니다.

8. 나이에 맞는 건강 전략

${ageStrategy}

9. 이번 주 실천 리스트

- 잠드는 시간을 하나 정하십시오.
- 야식이나 과식 중 하나를 먼저 줄이십시오.
- 하루 20분 걷기를 시작하십시오.
- 몸에서 반복되는 불편함을 메모하십시오.
- 검진을 미룬 항목이 있다면 예약하십시오.
- 일주일에 하루는 의식적으로 쉬는 시간을 만드십시오.

최종 총평

${name}님의 건강 관리는 겁을 주는 방식이 아니라 생활을 다시 정돈하는 방식으로 가야 합니다.

지금 필요한 것은 더 강하게 버티는 것이 아니라
몸이 회복할 시간을 만들어주는 것입니다.

수면, 식사, 걷기, 검진, 휴식만 꾸준히 잡아도
컨디션은 훨씬 안정적으로 돌아올 수 있습니다.
`.trim();
}
