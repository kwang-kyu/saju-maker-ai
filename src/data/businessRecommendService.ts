export function getBusinessRecommendText({
    gyeokguk,
    strongestName,
  }: {
    gyeokguk: string;
    strongestName: string;
  }): string {
    let result: string[] = [];
  
    if (gyeokguk === "편재격") {
      result.push("중개업", "유통업", "영업형 사업");
    }
  
    if (gyeokguk === "정재격") {
      result.push("임대업", "자산관리", "회계 서비스");
    }
  
    if (gyeokguk === "정관격") {
      result.push("교육사업", "행정지원", "자격증 교육");
    }
  
    if (gyeokguk === "편관격") {
      result.push("시설관리", "현장관리", "안전관리");
    }
  
    if (gyeokguk === "식신격") {
      result.push("콘텐츠 제작", "교육 콘텐츠", "온라인 강의");
    }
  
    if (gyeokguk === "상관격") {
      result.push("광고", "브랜딩", "마케팅");
    }
  
    if (strongestName === "목") {
      result.push("교육", "출판", "조경");
    }
  
    if (strongestName === "화") {
      result.push("홍보", "마케팅", "미디어");
    }
  
    if (strongestName === "토") {
      result.push("부동산", "건설", "관리");
    }
  
    if (strongestName === "금") {
      result.push("금융", "법률", "기술");
    }
  
    if (strongestName === "수") {
      result.push("유통", "상담", "온라인");
    }
  
    return [...new Set(result)].slice(0, 8).join(", ");
  }