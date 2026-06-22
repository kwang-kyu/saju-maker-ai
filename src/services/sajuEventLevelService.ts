type EventLevelInput = {
    relationText: string;
    strengthType: string;
    strongestName: string;
    weakestName: string;
  };
  
  export function getEventLevel({
    relationText,
    strengthType,
    strongestName,
    weakestName,
  }: EventLevelInput): string {
    let score = 0;
  
    // 합충형파해 강도
    if (relationText.includes("충")) score += 3;
    if (relationText.includes("형")) score += 2;
    if (relationText.includes("파")) score += 2;
    if (relationText.includes("해")) score += 1;
    if (relationText.includes("합")) score += 1;
  
    // 신강·신약 보정
    if (strengthType.includes("신약")) {
      score += 2;
    } else if (strengthType.includes("신강")) {
      score += 1;
    }
  
    // 오행 균형 보정
    if (
      strongestName &&
      weakestName &&
      strongestName === weakestName
    ) {
      score += 1;
    }
  
    // 등급 반환
    if (score <= 2) {
      return "경미";
    }
  
    if (score <= 4) {
      return "보통";
    }
  
    if (score <= 6) {
      return "강함";
    }
  
    return "매우 강함";
  }