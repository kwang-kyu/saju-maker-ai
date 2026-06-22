export function getCareerRecommendText({
    gyeokguk,
    dayStem,
    strongestName,
    weakestName,
    dayStrengthType,
    monthTenGod,
  }: {
    gyeokguk: string;
    dayStem: string;
    strongestName: string;
    weakestName: string;
    dayStrengthType: string;
    monthTenGod: string;
  }): string {
    const normalizedGyeokguk = gyeokguk.replace("격", "").trim();
  
    const jobMap: Record<string, string> = {
      정관: "공무원, 관리자, 공기업, 행정직, 조직관리자",
      편관: "영업관리자, 현장관리자, 보안·안전관리, 위기관리 컨설턴트",
      정재: "회계, 세무, 금융, 자산관리, 부동산 관리, 사무관리",
      편재: "사업가, 영업직, 투자상담, 유통, 무역, 부동산 중개",
      식신: "콘텐츠 제작자, 강사, 요리·식품, 기술직, 기획자",
      상관: "마케터, 기획자, 크리에이터, 강사, 상담가, 디자이너",
      정인: "교육, 연구, 문서작성, 자격증 기반 전문직, 행정지원",
      편인: "상담, 분석, 전략기획, 철학·심리, AI·데이터, 특수 전문직",
      비견: "자영업, 프리랜서, 개인 브랜드, 독립 컨설팅",
      겁재: "영업조직, 공동사업, 경쟁 산업, 확장형 사업",
    };
  
    const recommend = jobMap[normalizedGyeokguk] || "상담, 기획, 관리, 영업, 콘텐츠 분야";
  
    const strengthText =
      dayStrengthType === "신강"
        ? "신강한 구조이므로 남 밑에서만 움직이기보다 본인이 주도권을 잡는 직업, 책임자가 되는 자리, 독립성이 있는 업무에서 성과가 커집니다."
        : dayStrengthType === "신약"
        ? "신약한 구조이므로 무리하게 혼자 모든 것을 끌고 가기보다 조직, 자격, 시스템, 협업 기반이 있는 환경에서 안정성이 높아집니다."
        : "중화에 가까운 구조이므로 한쪽으로 과하게 치우치기보다 안정성과 성장성을 함께 보는 직업 선택이 좋습니다.";
  
    return `
  추천 직업 : ${recommend}
  
  ${dayStem} 일간을 기준으로 보면, ${gyeokguk} 구조와 ${monthTenGod} 십성이 함께 직업 방향을 결정합니다.
  
  ${strengthText}
  
  강한 기운인 ${strongestName}은 직업에서 장점으로 활용할 부분입니다.
  반대로 부족한 기운인 ${weakestName}은 업무 습관, 협업, 공부, 자격, 시스템으로 보완해야 합니다.
  
  따라서 이 사주는 단순히 직업 이름만 보는 것이 아니라,
  ${gyeokguk}의 구조, ${dayStrengthType} 흐름, 강한 ${strongestName}, 부족한 ${weakestName}을 함께 보아야 직업 선택의 정확도가 높아집니다.
    `.trim();
  }