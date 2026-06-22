type JobDetailInput = {
    name: string;
    dayStem: string;
    gyeokguk: string;
    monthTenGod: string;
    strengthType: string;
    strongestName: string;
    weakestName: string;
    jobTypeText: string;
  };
  
  export function getJobDetailText({
    name,
dayStem,
gyeokguk,
monthTenGod,
strongestName,
weakestName,
jobTypeText,
  }: JobDetailInput) {
    return `💼 직업운 상세 분석
  
  ${name}님의 직업운은 ${dayStem} 일간의 일 처리 방식과 ${gyeokguk} 구조, ${monthTenGod}의 사회적 역할을 중심으로 해석합니다.
  
  ■ 직업 구조
  ${jobTypeText}
  
  ■ 현실 조언
자신의 기획력과 전문성을 드러낼 수 있는 일을 선택하세요.
직업운은 혼자 모든 것을 떠안기보다 역할과 책임이 분명한 구조에서 안정적으로 커집니다.
강한 ${strongestName} 기운은 직업적 장점으로 활용하고, 부족한 ${weakestName} 기운은 업무 습관으로 보완하세요.
장기적으로는 ${gyeokguk} 성향이 반복적으로 발휘되는 분야에서 전문성을 쌓는 것이 좋습니다.
급한 변화보다 현재 강점을 유지하면서 브랜딩하는 방향이 유리합니다.
`;
}