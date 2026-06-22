export function getLifePhaseText(
    age: number,
    relationLevel: string
  ): string {
    if (age <= 29) {
      return `
  초년기에는 인간관계와 진로 선택 과정에서 ${relationLevel} 수준의 변화가 나타날 수 있습니다.
  새로운 인연, 진학, 취업, 독립, 이사 등의 형태로 체감될 가능성이 높습니다.
  `.trim();
    }
  
    if (age <= 49) {
      return `
  중년기에는 배우자, 자녀, 사업, 직장 문제에서 ${relationLevel} 수준의 사건이 나타날 수 있습니다.
  계약 변경, 사업 확장, 조직 변화, 재산 이동 등 현실적인 결정이 많아지는 시기입니다.
  `.trim();
    }
  
    return `
  후년기에는 건강, 자산 정리, 가족관계 재편 과정에서 ${relationLevel} 수준의 사건이 나타날 수 있습니다.
  은퇴 준비, 상속, 부동산 정리, 생활 패턴 변화로 체감되는 경우가 많습니다.
  `.trim();
  }