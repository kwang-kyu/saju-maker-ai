import type { BasicSajuResult } from "../../types/basic";
import { buildConsultingDecision } from "../case/consultingDecision";
import { buildSajuIdentityProfile } from "../profile/sajuIdentityProfile";
function getDayMasterDiagnosis(dayMaster: string, name: string) {
  const value = String(dayMaster);
  if (value.includes("갑") || value.includes("을")) {
    return `${name}님은 한 번 방향을 잡으면 키우고 넓혀가는 힘이 있는 사람입니다. 다만 방향이 자주 바뀌면 힘이 흩어지기 쉬우므로, 오래 가져갈 기준을 먼저 세워야 운이 살아납니다.`;
  }
  if (value.includes("병") || value.includes("정")) {
    return `${name}님은 표현력과 존재감이 살아날 때 운이 열리는 사람입니다. 다만 감정이 앞서면 선택이 급해질 수 있으므로, 마음이 움직일수록 현실 기준을 함께 세워야 합니다.`;
  }
  if (value.includes("무") || value.includes("기")) {
    return `${name}님은 쉽게 흔들리기보다 책임지고 버티는 힘이 있는 사람입니다. 다만 혼자 너무 오래 감당하면 피로가 쌓이기 쉬우므로, 역할과 책임의 경계를 분명히 해야 합니다.`;
  }
  if (value.includes("경") || value.includes("신")) {
    return `${name}님은 판단력과 정리 능력이 강한 사람입니다. 다만 기준이 엄격해지면 스스로를 몰아붙일 수 있으므로, 완벽함보다 지속 가능한 선택이 중요합니다.`;
  }
  if (value.includes("임") || value.includes("계")) {
    return `${name}님은 흐름을 읽고 상황에 맞게 움직이는 감각이 있는 사람입니다. 다만 생각이 많아지면 결정을 미루기 쉬우므로, 고민을 현실 행동으로 바꾸는 기준이 필요합니다.`;
  }
  return `${name}님은 한 번에 크게 뒤집는 운보다 기준을 세우고 차근차근 쌓아갈 때 운이 살아나는 사람입니다.`;
}
function getElementStrengthMessage(element: string, name: string) {
  if (element === "목") return `강한 목 기운은 ${name}님에게 성장, 기획, 확장, 배움의 힘으로 나타납니다. 새로운 일을 키우는 능력은 장점이지만, 방향이 많아지면 집중력이 흩어질 수 있습니다.`;
  if (element === "화") return `강한 화 기운은 ${name}님에게 표현력, 추진력, 존재감으로 나타납니다. 사람 앞에서 드러나는 힘은 장점이지만, 감정이 앞서면 판단이 급해질 수 있습니다.`;
  if (element === "토") return `강한 토 기운은 ${name}님에게 책임감, 현실감각, 버티는 힘으로 나타납니다. 안정성은 장점이지만, 혼자 감당하려는 습관은 줄여야 합니다.`;
  if (element === "금") return `강한 금 기운은 ${name}님에게 판단력, 원칙, 정리 능력으로 나타납니다. 기준이 분명한 것은 장점이지만, 지나치게 엄격해지면 관계와 건강에 부담이 될 수 있습니다.`;
  if (element === "수") return `강한 수 기운은 ${name}님에게 생각의 깊이, 정보 감각, 흐름을 읽는 힘으로 나타납니다. 다만 고민이 길어지면 실행이 늦어질 수 있습니다.`;
  return `강한 ${element} 기운은 ${name}님이 현실에서 잘 살려야 할 핵심 장점입니다.`;
}
function getElementWeakMessage(element: string, name: string) {
  if (element === "목") return `부족한 목 기운은 계획을 길게 이어가는 힘이 약해질 때 드러납니다. ${name}님은 시작보다 지속 관리, 기록, 루틴을 보완해야 합니다.`;
  if (element === "화") return `부족한 화 기운은 표현과 활력이 약해질 때 드러납니다. ${name}님은 마음속으로만 참지 말고 생각과 감정을 적절히 드러내는 연습이 필요합니다.`;
  if (element === "토") return `부족한 토 기운은 생활의 중심이 흔들릴 때 드러납니다. ${name}님은 돈, 건강, 일정을 안정적으로 관리하는 기본 구조를 먼저 잡아야 합니다.`;
  if (element === "금") return `부족한 금 기운은 정리와 결단이 늦어질 때 드러납니다. ${name}님은 사람, 돈, 일에서 끊고 맺는 기준을 분명히 해야 합니다.`;
  if (element === "수") return `부족한 수 기운은 회복력과 유연함이 약해질 때 드러납니다. ${name}님은 쉬는 시간, 수면, 혼자 정리하는 시간을 반드시 확보해야 합니다.`;
  return `부족한 ${element} 기운은 ${name}님이 생활 속에서 보완해야 할 부분입니다.`;
}
function getMainConcern(concern?: string) {
  const value = String(concern ?? "").trim();
  return value || "AI 종합상담";
}
export function getAiConsulting(data: BasicSajuResult, concern?: string): string {
  const name = data.name;
  const topic = getMainConcern(concern);
  const decision = buildConsultingDecision(data, topic);
  const firstDiagnosis = getDayMasterDiagnosis(data.dayMaster, name);
  const strengthMessage = getElementStrengthMessage(data.strongestElement, name);
  const weakMessage = getElementWeakMessage(data.weakestElement, name);
  const identity = buildSajuIdentityProfile(data);
  const concernText = concern
    ? `${name}님이 특히 궁금해하신 부분은 "${concern}"입니다. 이 고민은 따로 떨어진 문제가 아니라, ${name}님의 사주 흐름 안에서 함께 보아야 합니다.`
    : `${name}님의 인생 전체 흐름을 기준으로 지금 가장 중요한 방향을 상담하겠습니다.`;
  return `
천운문 AI 종합상담 리포트
${concernText}
0. AI 원장 종합 판단
한마디로 말하면, ${decision.verdict}
추천도: ${decision.score}점
판정: ${decision.grade}
위험도: ${decision.riskLabel}
실행 시기: ${decision.timing}
${decision.riskReason}
[판단 근거]
1. ${decision.reasons[0]}
2. ${decision.reasons[1]}
3. ${decision.reasons[2]}
4. ${decision.reasons[3]}
1. 원장님의 첫 진단
결론부터 말씀드리면, ${firstDiagnosis}
${data.dayMaster} 일간과 ${data.yearGanZhi}${data.monthGanZhi}${data.dayGanZhi} 흐름을 함께 보면, ${name}님의 사주는 단순히 좋다 나쁘다로 볼 수 없습니다.
핵심은 강하게 드러나는 ${data.strongestElement} 기운을 현실에서 어떻게 쓰고, 부족한 ${data.weakestElement} 기운을 생활 속에서 어떻게 보완하느냐입니다.
이 사주는 조급하게 움직이면 힘이 흩어지고, 기준을 잡으면 실속이 살아나는 구조입니다.
${identity.lifeStyle}
${identity.decisionStyle}
2. 현재 가장 중요한 문제
지금 ${name}님에게 가장 중요한 문제는 더 많은 일을 하는 것이 아니라, 무엇을 계속 가져가고 무엇을 줄일지 정하는 것입니다.
돈, 일, 사람 관계, 건강이 따로 움직이는 것이 아닙니다.
마음이 복잡하면 판단이 흔들리고, 판단이 흔들리면 돈과 관계에서도 손실이 생길 수 있습니다.
그래서 지금은 무리한 확장보다 정리, 선택, 집중이 먼저입니다.
3. 사주 근거 분석
${strengthMessage}
${weakMessage}
따라서 좋은 운을 만드는 방법은 부족한 것을 억지로 채우는 것이 아니라, 내 사주가 잘 쓰이는 환경을 선택하는 것입니다.
${identity.workStyle}
${identity.successPoint}
4. 돈직업인간관계건강 핵심 상담
${identity.moneyStyle}
돈은 한 번에 크게 벌려는 방식보다 안정적으로 쌓는 흐름이 좋습니다.
${name}님은 충동적인 선택보다 검토하고 확인한 뒤 움직일 때 재물 흐름이 좋아집니다.
직업과 일에서는 단순 반복보다 경험, 책임, 판단력이 남는 일이 좋습니다.
${identity.relationshipStyle}
사람 관계에서는 나를 소모시키는 사람과 나를 안정시키는 사람을 구분해야 합니다.
건강은 무리해서 버티는 방식이 가장 위험합니다.
몸의 리듬이 무너지면 판단도 흐려지고, 판단이 흐려지면 일과 돈의 흐름까지 같이 흔들릴 수 있습니다.
${identity.riskPoint}
5. 향후 3년 전략
첫 1년은 정리의 시기입니다.
돈, 일, 사람, 생활 습관에서 계속 가져갈 것과 줄여야 할 것을 분명히 해야 합니다.
두 번째 해는 집중의 시기입니다.
내가 잘하는 일, 반복해서 수익이 되는 구조, 오래 갈 수 있는 관계에 힘을 모아야 합니다.
세 번째 해는 확장의 시기입니다.
다만 새로운 것을 무리하게 벌리는 확장이 아니라, 이미 검증된 것을 조금 더 키우는 확장이 좋습니다.
6. 실천 체크리스트
첫째, 급한 결정은 하루 이상 미루고 다시 판단하세요.
둘째, 돈이 들어오는 구조와 새어나가는 구조를 따로 적어보세요.
셋째, 나를 지치게 하는 사람과 힘이 되는 사람을 구분하세요.
넷째, 몸이 보내는 피로 신호를 무시하지 마세요.
다섯째, 내 이름이 남는 일, 기록이 쌓이는 일, 다시 찾는 사람이 생기는 일을 키우세요.
7. AI 원장 최종 총평
${name}님은 늦은 사람이 아닙니다.
이 사주는 시간이 갈수록 자기 기준이 분명해질 때 힘이 살아납니다.
지금 필요한 것은 더 많이 버티는 것이 아니라, 오래 가져갈 수 있는 삶의 구조를 만드는 것입니다.
조급함을 줄이고, 내 사주에 맞는 방향을 선택하면 ${name}님의 운은 천천히 단단하게 열릴 수 있습니다.
`.trim();
}
