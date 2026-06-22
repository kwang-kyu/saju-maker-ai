type HealthDetailInput = {
    name: string;
    dayStem: string;
    gyeokguk: string;
    strengthType: string;
    strongestName: string;
    weakestName: string;
    healthPersonalTypeText: string;
  };
  
  export function getHealthDetailText({
    name,
    dayStem,
    gyeokguk,
    strongestName,
    weakestName,
    healthPersonalTypeText,
  }: HealthDetailInput) {
    return `🏥 건강운 상세 분석
  
  ${name}님의 건강운은 ${dayStem} 일간의 체력 흐름과 ${gyeokguk} 구조에서 나타나는 생활 리듬을 중심으로 해석합니다.
  
  ■ 오행 기준 건강 성향
  ${healthPersonalTypeText}
  
  ■ 현실 조언
수면 시간을 일정하게 유지해 체력 회복 리듬을 안정시키는 것이 좋습니다.
식사 시간은 가능한 한 규칙적으로 유지해 몸의 균형을 잡아야 합니다.
강한 ${strongestName} 기운은 과로로 흐르지 않도록 활동량을 조절하는 것이 중요합니다.
부족한 ${weakestName} 기운은 생활 습관과 회복 루틴으로 꾸준히 보완해야 합니다.
몸의 이상 신호가 느껴지면 미루지 말고 초기에 관리하는 습관이 필요합니다.
  `;
  }