type RelationEventInput = {
    relationText: string;
    dayStem: string;
    gyeokguk: string;
    strengthType: string;
    yongsin: string;
    strongestName: string;
    weakestName: string;
  };
  
  export function getRelationEventText({
    relationText,
    dayStem,
    gyeokguk,
    strengthType,
    yongsin,
    strongestName,
    weakestName,
  }: RelationEventInput): string {

    const relationTypeDetail = getRelationTypeDetail(relationText);
    const {
        moneyText,
        jobText,
        loveText,
        healthText,
      } = getRelationAreaTexts(relationText);
      const relationScenarioText = getRelationScenarioText(
        relationText,
        relationTypeDetail
      );
    if (!relationText || relationText.trim().length === 0) {
      return `합충형파해 사건 분석에서는 뚜렷한 충돌 신호보다 내부 조율의 흐름이 강하게 나타납니다. ${dayStem} 일간과 ${gyeokguk}, ${strengthType} 구조를 기준으로 보면 큰 사건보다 관계 정리, 계약 검토, 생활 리듬 조정처럼 조용하지만 중요한 변화가 생길 수 있습니다.`;
    }
  
    return `합충형파해 사건 분석
  
  이 사주는 ${relationText}의 흐름을 통해 사람, 계약, 재물, 이동 문제에서 사건성이 나타날 수 있습니다.
  
  ${dayStem} 일간은 ${gyeokguk}, ${strengthType} 구조 안에서 강한 오행인 ${strongestName}을 익숙하게 사용하려는 경향이 있습니다. 그러나 약한 오행인 ${weakestName}이 흔들릴 때는 판단 지연, 관계 오해, 계약 조건 누락 같은 문제가 생길 수 있습니다.
  
  특히 합은 사람과 기회가 모이는 작용으로 나타나고, 충은 이동·변경·갈등·계약 변동으로 나타나기 쉽습니다. 형은 심리적 압박과 책임 증가, 파는 관계나 약속의 균열, 해는 보이지 않는 손실이나 뒤늦은 문제 확인으로 연결될 수 있습니다.

  ${relationTypeDetail}
  ${relationScenarioText}

이 시기에는 ${yongsin}의 기운을 살리는 선택이 중요합니다. 사람을 급하게 믿기보다 계약 조건, 금전 흐름, 책임 범위, 건강 부담을 분명히 확인해야 합니다.

일반적으로 합충형파해의 사건은 향후 1~3년 안에 체감되는 경우가 많으며, 배우자·동업자·가족·직장 상사·거래처와의 관계에서 나타날 가능성이 높습니다.

${moneyText}

${jobText}

${loveText}

${healthText}
`;
}

function getRelationTypeDetail(relationText: string): string {
    if (relationText.includes("합")) {
      return "합의 작용이 강할 때는 사람, 제안, 협력, 소개, 계약 기회가 모이는 방향으로 사건이 나타날 수 있습니다.";
    }
  
    if (relationText.includes("충")) {
      return "충의 작용이 강할 때는 이동, 이사, 부서 변경, 계약 변경, 관계 갈등처럼 기존 흐름이 흔들리는 사건이 나타날 수 있습니다.";
    }
  
    if (relationText.includes("형")) {
      return "형의 작용이 강할 때는 책임 증가, 압박감, 법적·행정적 부담, 조직 내 갈등처럼 묵직한 부담으로 나타날 수 있습니다.";
    }
  
    if (relationText.includes("파")) {
      return "파의 작용이 강할 때는 약속 변경, 신뢰 균열, 계약 조건 수정, 인간관계의 미세한 틈으로 나타날 수 있습니다.";
    }
  
    if (relationText.includes("해")) {
      return "해의 작용이 강할 때는 겉으로 드러나지 않은 손실, 오해, 뒷말, 지연 문제, 숨은 비용으로 나타날 수 있습니다.";
    }
  
    return "합충형파해의 작용은 특정 사건 하나로 단정되기보다 관계, 계약, 재물, 건강의 여러 영역에서 복합적으로 나타날 수 있습니다.";
  }
  function getRelationAreaTexts(relationText: string) {
    const isHap = relationText.includes("합");
    const isChung = relationText.includes("충");
    const isHyung = relationText.includes("형");
    const isPa = relationText.includes("파");
    const isHae = relationText.includes("해");
  
    const moneyText =
      isHap
        ? "재물에서는 투자 제안, 공동사업, 계약 체결, 매매 기회로 이어질 수 있습니다."
        : isChung
        ? "재물에서는 계약 변경, 자산 이동, 예상하지 못한 지출이 발생할 수 있습니다."
        : "재물에서는 금전 흐름과 계약 조건을 다시 점검하는 것이 중요합니다.";
  
    const jobText =
      isHap
        ? "직업에서는 협력자 등장, 새로운 사업 제안, 인맥 확장으로 이어질 수 있습니다."
        : isChung
        ? "직업에서는 이직, 부서 이동, 사업 방향 수정이 발생할 수 있습니다."
        : "직업에서는 책임 범위와 역할 변화를 점검해야 합니다.";
  
    const loveText =
      isHap
        ? "관계에서는 새로운 인연, 배우자 인연, 인간관계 확장이 나타날 수 있습니다."
        : isChung
        ? "관계에서는 갈등, 거리감, 관계 재정비가 필요해질 수 있습니다."
        : "관계에서는 감정 소모를 줄이고 대화를 늘리는 것이 중요합니다.";
  
    const healthText =
      isHyung
        ? "건강에서는 과로, 스트레스, 통증 관리가 중요합니다."
        : isPa || isHae
        ? "건강에서는 만성 피로와 숨은 증상을 점검하는 것이 중요합니다."
        : "건강에서는 생활 리듬과 체력 관리가 중요합니다.";
  
    return {
      moneyText,
      jobText,
      loveText,
      healthText,
    };
  }

  function getRelationScenarioText(relationText: string, relationLevel: string): string {
    const isChung = relationText.includes("충");
    const isHyung = relationText.includes("형");
    const isPa = relationText.includes("파");
    const isHae = relationText.includes("해");
  
    return `
  ■ 재물 사건 시나리오
  ${isChung ? "계약 변경, 매매 조건 수정, 자산 이동, 예상 지출이 발생할 수 있습니다." : "투자 제안, 수익 기회, 금전 흐름 재정비가 나타날 수 있습니다."}
  
  ■ 직업 사건 시나리오
  ${isHyung ? "책임 증가, 조직 압박, 상사와의 갈등, 업무 부담 증가가 나타날 수 있습니다." : "새로운 역할, 협력자 등장, 사업 제안, 직업 방향 전환이 나타날 수 있습니다."}
  
  ■ 관계 사건 시나리오
  ${isPa || isHae ? "신뢰 균열, 오해, 감정 소모, 관계 재정비가 필요해질 수 있습니다." : "새로운 인연, 협력 관계, 배우자·가족과의 관계 변화가 나타날 수 있습니다."}
  
  ■ 건강 사건 시나리오
  ${relationLevel === "강함" || relationLevel === "매우 강함" ? "과로, 수면 부족, 스트레스성 증상, 만성 피로 관리가 중요합니다." : "생활 리듬, 체력 관리, 감정 소모 조절이 중요합니다."}
  `.trim();
  }  