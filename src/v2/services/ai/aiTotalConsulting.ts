import type { BasicSajuResult } from "../../types/basic";
import { getBusinessConsulting } from "../business/businessConsulting";
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
function getAgeLine(age: number) {
  if (!age) return "현재는 인생의 기준을 다시 세우고 방향을 정리해야 하는 시기입니다.";
  if (age <= 29) return `현재 ${age}세 흐름에서는 결과보다 경험과 방향 설정이 중요합니다.`;
  if (age <= 44) return `현재 ${age}세 흐름에서는 일, 수입, 관계의 기반을 만드는 것이 중요합니다.`;
  if (age <= 59) return `현재 ${age}세 흐름에서는 확장보다 선택과 정리를 통해 실속을 남겨야 합니다.`;
  return `현재 ${age}세 흐름에서는 무리한 확장보다 안정, 건강, 자산관리, 관계 정리가 중요합니다.`;
}
function getDayMasterLine(dayMaster: string) {
  if (dayMaster.includes("갑") || dayMaster.includes("을")) {
    return "성장, 기획, 관계 확장, 새로운 일을 키우는 힘이 강합니다.";
  }
  if (dayMaster.includes("병") || dayMaster.includes("정")) {
    return "표현력, 존재감, 홍보, 설득, 성과를 드러내는 힘이 강합니다.";
  }
  if (dayMaster.includes("무") || dayMaster.includes("기")) {
    return "책임감, 현실감, 관리 능력, 오래 버티는 힘이 강합니다.";
  }
  if (dayMaster.includes("경") || dayMaster.includes("신")) {
    return "판단력, 결단력, 정리 능력, 기준을 세우는 힘이 강합니다.";
  }
  if (dayMaster.includes("임") || dayMaster.includes("계")) {
    return "정보력, 유연함, 흐름을 읽는 감각, 전략성이 강합니다.";
  }
  return "자기 기준을 세울수록 운이 살아나는 구조입니다.";
}
function getStrengthLine(strengthType: string) {
  if (strengthType.includes("신강")) {
    return "신강한 흐름이 있어 스스로 밀고 가는 힘은 좋지만, 혼자 결정하고 혼자 책임지는 습관은 줄여야 합니다.";
  }
  if (strengthType.includes("신약")) {
    return "신약한 흐름이 있어 좋은 사람, 좋은 환경, 안정된 시스템을 만날수록 운이 살아납니다.";
  }
  return "강약은 한쪽으로 단정하기보다 상황에 맞게 밀고 갈 때와 조절할 때를 구분하는 것이 중요합니다.";
}
function getElementLine(strongestElement: string, weakestElement: string) {
  return `강하게 살아나는 기운은 ${strongestElement || "강한 기운"}이고, 보완이 필요한 기운은 ${
    weakestElement || "부족한 기운"
  }입니다. 강점은 성과로 연결하고, 부족한 부분은 생활 습관과 선택 기준으로 보완해야 합니다.`;
}
function getAssetLine(strongestElement: string, weakestElement: string) {
  if (strongestElement.includes("토") || strongestElement.includes("금")) {
    return "재테크 방향은 부동산, 예금, 현금흐름처럼 눈에 보이고 관리 가능한 자산이 잘 맞습니다.";
  }
  if (strongestElement.includes("수") || weakestElement.includes("화")) {
    return "재테크 방향은 ETF, 배당형 자산, 현금 비중 관리처럼 흐름을 나누어 접근하는 방식이 좋습니다.";
  }
  if (strongestElement.includes("화") || strongestElement.includes("목")) {
    return "재테크 방향은 성장형 자산도 볼 수 있으나, 반드시 분산과 손실 기준을 먼저 세워야 합니다.";
  }
  return "재테크 방향은 한 가지 자산에 몰기보다 현금, 안정형 자산, 성장형 자산을 나누는 방식이 좋습니다.";
}
function getPersonalCoreLine(name: string, dayMaster: string, strengthType: string, strongestElement: string, weakestElement: string) {
  return `${name}님의 종합 흐름은 ${dayMaster} 일간의 기본 성향, ${strengthType}의 힘 조절 방식, 강한 ${strongestElement} 기운과 보완이 필요한 ${weakestElement} 기운을 함께 보아야 합니다. 그래서 이 상담은 단순히 좋다, 나쁘다로 말하기보다 어떤 선택을 줄이고 어떤 방향을 남길지에 초점을 둡니다.`;
}
function getThreeYearStrategy(decision: ReturnType<typeof buildConsultingDecision>, name: string) {
  if (decision.riskLevel === "danger") {
    return `1년 차에는 실행보다 정리와 회복이 우선입니다.
${name}님은 손실 가능성, 건강 부담, 자금 압박을 먼저 줄여야 합니다.
2년 차에는 작은 테스트를 통해 가능성을 확인하는 시기입니다.
큰 결정보다 작게 시작하고, 실패해도 회복 가능한 범위 안에서 움직이는 것이 좋습니다.
3년 차에는 검증된 방향만 확장해야 합니다.
아직 불안한 영역은 억지로 키우지 말고, 안정적으로 남는 구조만 선택해야 합니다.`;
  }
  if (decision.riskLevel === "watch") {
    return `1년 차에는 준비와 검증이 핵심입니다.
${name}님은 바로 크게 움직이기보다 자금, 사람, 일정, 건강 조건을 먼저 맞춰야 합니다.
2년 차에는 조건이 맞는 영역부터 실행하는 시기입니다.
한 번에 전체를 바꾸기보다 수익이 보이는 부분, 부담이 적은 부분부터 시작하는 것이 좋습니다.
3년 차에는 결과가 확인된 방향을 넓히는 시기입니다.
무리한 확장보다 검증된 구조를 반복해서 키우는 방식이 안정적입니다.`;
  }
  if (decision.score >= 80) {
    return `1년 차에는 방향을 정하고 빠르게 실행해도 좋은 흐름입니다.
${name}님은 이미 감당 가능한 범위가 보인다면 지나치게 미루지 않는 것이 좋습니다.
2년 차에는 성과가 나는 영역에 집중해야 합니다.
돈, 일, 사람 관계 중 결과가 분명한 부분에 힘을 모으면 흐름이 커질 수 있습니다.
3년 차에는 확장과 브랜드화가 중요합니다.
경험, 신뢰, 반복 수익이 쌓이는 구조로 키우면 장기적인 안정성이 생깁니다.`;
  }
  return `1년 차에는 정리, 2년 차에는 수익 구조 만들기, 3년 차에는 검증된 방향 확장이 좋습니다.
초반에는 시장성과 수익 구조를 확인한 뒤 확장하는 흐름이 유리합니다.
앞으로 3년은 욕심보다 구조, 속도보다 지속성이 더 중요합니다.`;
}
export function getAiTotalConsulting(data: BasicSajuResult): string {
  const name = data.name;
  const age = getAge(data);
  const ageLine = getAgeLine(age);
  const dayMaster = getValue(data, "dayMaster");
  const strengthType = getValue(data, "strengthType", "균형형");
  const gyeokguk = getValue(data, "gyeokguk", "기본 흐름");
  const strongestElement = getValue(data, "strongestElement", "강한 기운");
  const weakestElement = getValue(data, "weakestElement", "부족한 기운");
  const decision = buildConsultingDecision(data, "AI 종합상담");
  const businessText = getBusinessConsulting(data);
  const dayMasterLine = getDayMasterLine(dayMaster);
  const strengthLine = getStrengthLine(strengthType);
  const elementLine = getElementLine(strongestElement, weakestElement);
  const assetLine = getAssetLine(strongestElement, weakestElement);
  const threeYearStrategy = getThreeYearStrategy(decision, name);
  const personalCoreLine = getPersonalCoreLine(name, dayMaster, strengthType, strongestElement, weakestElement);
  return `
AI 원장 종합상담

한마디로 말하면, ${name}님은 지금 운이 좋고 나쁨보다 선택의 기준을 분명히 세워야 하는 흐름입니다.

${decision.verdict}

사주는 결과를 단정하는 도구가 아니라,
현재 나에게 맞는 방향과 감당 가능한 선택을 찾는 기준입니다.
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
${ageLine}
사주의 핵심 진단
${personalCoreLine}
${dayMasterLine}
${strengthLine}
격국은 '${gyeokguk}'의 흐름을 참고해서 보면 좋습니다.
${elementLine}
이 흐름을 종합하면 ${name}님은 남의 속도에 끌려갈 때보다
본인이 납득할 수 있는 기준을 세우고 움직일 때 결과가 안정되는 사람입니다.
현재 인생에서 가장 중요한 과제
지금은 새로운 일을 계속 늘리기보다
돈, 일, 사람, 건강의 기준을 다시 정리해야 하는 시기입니다.
특히 ${name}님은 무엇을 더 할 것인가보다
무엇을 남기고 무엇을 줄일 것인가를 결정할 때 운이 편안해집니다.
재물과 재테크 전략
${assetLine}
재물은 단순히 많이 버는 것이 아니라
잃지 않고, 오래 유지하고, 필요할 때 쓸 수 있는 구조를 만드는 것이 중요합니다.
${name}님에게 맞는 재테크는 투자 원칙을 세우고,
분산과 현금 흐름을 함께 관리하는 방식입니다.
직업 전략
직업적으로는 단순 반복보다 판단력, 책임감, 기획력, 상담력, 조율 능력이 필요한 환경에서 장점이 살아납니다.
${dayMasterLine}
경험을 바탕으로 누군가에게 설명하고, 정리하고, 방향을 잡아주는 역할에서 강점이 살아날 수 있습니다.
사업과 창업 전략
${businessText}
사업은 감정으로 밀어붙이기보다 구조로 판단해야 합니다.
업종이 무엇이든 핵심은 내가 감당할 수 있는 고정비인지,
반복 매출이 가능한지, 사람을 오래 붙잡을 수 있는 구조인지입니다.
인간관계 전략
관계에서는 처음부터 모든 것을 다 보여주기보다
상대의 태도와 생활 방식을 천천히 보는 것이 좋습니다.
좋은 사람을 많이 만나는 것보다
오래 갈 사람과 부담이 되는 사람을 구분하는 것이 중요합니다.
건강 관리 전략
건강은 큰 병을 단정하는 것이 아니라 생활 리듬 관리로 봐야 합니다.
${elementLine}
수면, 식사, 휴식, 걷기, 일정 조절처럼 기본 리듬을 지키는 것이
운을 안정시키는 가장 현실적인 방법입니다.
앞으로 3년 방향
${threeYearStrategy}
AI 원장 최종 총평
최종적으로 말씀드리면, ${name}님은 운을 기다리는 사람이라기보다
스스로 기준을 세우고 현실적으로 움직일 때 길이 열리는 사람입니다.

지금 중요한 것은 무엇을 많이 벌릴지가 아니라,
내가 감당할 수 있는 선택을 분명히 하고 오래 가져갈 구조를 만드는 것입니다.

${name}님의 사주는 조급하게 앞서갈 때보다
방향이 정리되고 기준이 분명해질수록 힘이 깊어지는 흐름입니다.
`.trim();
}







