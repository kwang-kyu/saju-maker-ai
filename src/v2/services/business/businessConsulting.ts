import type { BasicSajuResult } from "../../types/basic";
import { buildMasterDecision } from "../framework/masterDecisionEngine";
import { buildSajuIdentityProfile } from "../profile/sajuIdentityProfile";

function getAge(birthDate?: string) {
  const birthYear = Number(String(birthDate || "").slice(0, 4));
  if (!birthYear) return 0;
  return new Date().getFullYear() - birthYear + 1;
}

function getBusinessAgeStrategy(name: string, age: number) {
  if (!age) {
    return `${name}님은 나이보다 현재 자금, 고객 확보 능력, 반복 매출 구조를 기준으로 사업을 판단하는 것이 좋습니다.`;
  }

  if (age <= 34) {
    return `${name}님은 처음부터 크게 벌리기보다 작은 상품, 작은 서비스, 온라인 테스트를 통해 고객 반응을 먼저 확인하는 것이 좋습니다.`;
  }

  if (age <= 49) {
    return `${name}님은 혼자 모든 일을 감당하는 방식에서 벗어나 고객 관리, 홍보, 재구매 구조를 시스템으로 만들어야 합니다.`;
  }

  if (age <= 64) {
    return `${name}님은 무리한 신규 확장보다 경험을 활용한 상담, 교육, 관리, 소개 기반 서비스처럼 오래 갈 수 있는 구조가 좋습니다.`;
  }

  return `${name}님은 큰 확장보다 자산 보호, 경험 활용, 자문, 안정적인 현금흐름을 우선하는 것이 좋습니다.`;
}

function getBusinessRole(data: BasicSajuResult) {
  const strong = String(data.strongestElement || "");

  if (strong.includes("목")) {
    return "기획, 성장, 교육, 브랜드 방향 설정처럼 사업의 큰 줄기를 키우는 역할이 잘 맞습니다.";
  }

  if (strong.includes("화")) {
    return "홍보, 설득, 발표, 콘텐츠, 고객과의 접점처럼 사람 앞에 드러나는 역할이 잘 맞습니다.";
  }

  if (strong.includes("토")) {
    return "운영, 관리, 고객 유지, 시스템 구축처럼 사업을 안정적으로 붙잡는 역할이 잘 맞습니다.";
  }

  if (strong.includes("금")) {
    return "가격, 계약, 정산, 기준 설정, 품질 관리처럼 숫자와 원칙을 다루는 역할이 잘 맞습니다.";
  }

  if (strong.includes("수")) {
    return "시장 흐름, 정보 수집, 상담, 기획, 연결 구조를 만드는 역할이 잘 맞습니다.";
  }

  return "모든 일을 직접 하기보다 방향 설정, 고객 신뢰 형성, 반복 가능한 구조 만들기에 집중하는 것이 좋습니다.";
}

export function getBusinessConsulting(
  data: BasicSajuResult,
  birthDate?: string,
  masterDecision?: ReturnType<typeof buildMasterDecision>
): string {
  const name = data.name;
  const identity = buildSajuIdentityProfile(data);
  const decision = masterDecision ?? buildMasterDecision(data);
  const age = getAge(birthDate);
  const ageStrategy = getBusinessAgeStrategy(name, age);
  const roleStrategy = getBusinessRole(data);

  return `
  사업 상담
  
  1. 결론부터 말씀드리면
  
  ${name}님의 사업운은 크게 벌려야 살아나는 흐름이 아니라
  작게 검증하고, 고객 반응을 확인한 뒤,
  반복 가능한 구조로 키울 때 안정되는 흐름입니다.
  
  이번 상담의 핵심 방향은 ${decision.yearlyKeyword}입니다.
  현재 우선순위는 ${decision.priorityArea}이고,
  의사결정 성향은 ${decision.decisionStyle}에 가깝습니다.
  
  ${decision.finalDirection}
  
  2. 사업을 볼 때 가장 중요한 기준
  
  ${name}님에게 중요한 것은
  이 사업이 좋아 보이는가가 아니라
  내가 오래 감당할 수 있는 방식인가입니다.
  
  사업은 아이디어보다 구조가 중요합니다.
  
  매출이 생기는 구조,
  고객이 다시 찾는 구조,
  고정비가 과하지 않은 구조가 먼저 잡혀야 합니다.
  
  ${identity.decisionStyle}
  
  ${identity.riskPoint}
  
  3. 맞는 사업 역할
  
  ${roleStrategy}
  
  ${name}님은 모든 일을 직접 떠안는 방식보다
  본인이 잘하는 역할을 중심에 두고,
  나머지는 도구, 외주, 협업, 체크리스트로 분리하는 것이 좋습니다.
  
  사업에서 오래 가려면
  잘하는 일과 반복되는 일을 반드시 구분해야 합니다.
  
  4. 매출을 만드는 방식
  
  첫째, 처음에는 큰 상품보다 작은 진입 상품을 만드는 것이 좋습니다.
  둘째, 고객이 한 번 이용하고 끝나는 구조보다 다시 찾을 이유를 만들어야 합니다.
  셋째, 정기 상담, 관리 서비스, 교육, 콘텐츠, 소개 구조처럼 반복 매출을 만들 수 있어야 합니다.
  넷째, 매출보다 순이익을 먼저 봐야 합니다.
  
  사업은 매출이 커 보여도
  광고비, 인건비, 장비비, 임대료, 시간이 빠지면
  남는 돈이 없을 수 있습니다.
  
  그래서 매달 반드시
  매출, 순이익, 고정비, 재구매율, 소개 고객 수를 확인해야 합니다.
  
  5. 조심해야 할 점
  
  가장 조심할 것은 성급한 확장입니다.
  
  될 것 같다는 느낌만으로
  장비, 직원, 광고비, 사무실, 매장을 먼저 늘리면
  부담이 커질 수 있습니다.
  
  ${decision.warnings.map((item) => `- ${item}`).join("\n")}
  
  6. 연령 흐름에 맞는 사업 전략
  
  ${ageStrategy}
  
  7. 앞으로 3년 사업 로드맵
  
  1년 차에는 아이디어 검증과 고객 반응 확인에 집중하십시오.
  목표는 큰돈을 버는 것이 아니라
  팔리는 상품과 다시 찾는 고객을 확인하는 것입니다.
  
  2년 차에는 반복 매출 구조를 만들어야 합니다.
  정기 상품, 상담, 관리 서비스, 강의, 콘텐츠, 소개 구조를 만들어야 합니다.
  
  3년 차에는 확장 여부를 판단할 수 있습니다.
  이때는 감이 아니라 숫자로 판단해야 합니다.
  
  순이익이 남고,
  고객이 다시 오고,
  운영이 버틸 수 있을 때 확장하는 것이 좋습니다.
  
  8. 오늘부터 실천할 것
  
  - ${decision.actionNow[0]}
  - ${decision.actionNow[1]}
  - ${decision.actionNow[2]}
  - 팔 수 있는 작은 상품이나 서비스를 하나 정하기
  - 예상 매출보다 예상 고정비를 먼저 계산하기
  - 고객이 다시 찾아올 이유를 문장으로 정리하기
  - 계약, 정산, 환불 기준을 문서로 만들기
  
  최종 총평
  
  ${name}님의 사업운은 가능성이 없어서 문제가 되는 흐름이 아닙니다.
  
  다만 크게 시작하는 것보다
  작게 시작해서 숫자로 확인하고,
  고객 신뢰를 쌓으면서 키우는 방식이 맞습니다.
  
  ${identity.successPoint}
  
  사업의 핵심은 아이디어가 아니라 구조입니다.
  
  돈이 남는 구조,
  고객이 다시 오는 구조,
  ${name}님이 지치지 않는 구조를 만들면
  사업운은 훨씬 안정적으로 살아날 수 있습니다.
  `.trim();
}
