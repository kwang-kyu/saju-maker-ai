type SajuSinsalReportInput = {
    sinsalText: string;
    sinsalEventText: string;
    hapChungRelationText: string;
    hapChungEventText: string;
  };
  
  export function getSajuSinsalReportText({
    sinsalText,
    sinsalEventText,
    hapChungRelationText,
    hapChungEventText,
  }: SajuSinsalReportInput): string {
    return `
  ━━━━━━━━━━━━━━━━━━━━
  🔮 신살 · 합충형파해 심층 분석
  ━━━━━━━━━━━━━━━━━━━━
  
  [1] 신살 분석
  ${sinsalText}
  
  [2] 신살 이벤트 해석
  ${sinsalEventText}
  
  [3] 합충형파해 분석
  ${hapChungRelationText}
  
  [4] 합충형파해 이벤트 해석
  ${hapChungEventText}
  
  📌 종합 해석
  신살은 타고난 성향과 반복되는 인생의 장면을 보여주고,
  합충형파해는 관계·재물·직업·건강·이동운에서 실제 사건이 움직이는 방식을 보여줍니다.
  
  따라서 이 사주는 단순히 좋은 신살과 나쁜 신살로 판단하기보다,
  어떤 기운이 반복되고 어떤 관계와 사건이 현실에서 움직이는지를 함께 보아야 합니다.
  `;
  }

  type HapChungPersonalReportInput = {
    name: string;
    dayStem: string;
    dayBranch: string;
    gyeokguk: string;
    strengthType: string;
    strongestName: string;
    weakestName: string;
    hapChungRelationText: string;
  };
  
  export function getHapChungPersonalReportText({
    name,
    dayStem,
    dayBranch,
    gyeokguk,
    strengthType,
    strongestName,
    weakestName,
    hapChungRelationText,
  }: HapChungPersonalReportInput): string {
    return `
  함충형파해는 단순히 충돌이 있다, 없다를 보는 것이 아니라
  
  ${name}님의 일간(${dayStem}), 일지(${dayBranch}),
  격국(${gyeokguk}),
  신강신약(${strengthType}),
  강한 오행(${strongestName}),
  약한 오행(${weakestName})
  
  과 함께 해석해야 합니다.
  
  ${hapChungRelationText}
  
  [개인화 해석]
  
  ${name}님의 경우 ${gyeokguk} 성향이 인생 전반의 중심축으로 작용합니다.
  
  ${strengthType === "신강"
    ? `신강 구조이므로 변화나 충돌이 생겨도 스스로 돌파하려는 힘이 강합니다.`
    : `신약 구조이므로 변화나 충돌이 생길 때 주변 협력자와 환경의 영향을 크게 받습니다.`}
  
  강한 오행인 ${strongestName} 기운은
  예상치 못한 변화가 와도 이를 기회로 전환하는 장점으로 작용합니다.
  
  반대로 약한 ${weakestName} 기운은
  
  재물
  직업
  인간관계
  건강
  
  중 일부 영역에서 약점으로 나타날 수 있으므로 의식적인 보완이 필요합니다.
  
  특히 ${gyeokguk} 구조에서는
  
  ${strongestName} 기운을 적극 활용할수록 장점이 커지고,
  
  ${weakestName} 기운을 보완할수록 운의 균형이 좋아집니다.
  
  따라서 ${name}님의 함충형파해는
  단순 사건 사고보다
  
  인간관계 변화
  직업 변화
  재물 흐름 변화
  건강 관리
  
  영역에서 더 크게 체감될 가능성이 있습니다.
  `;
  }