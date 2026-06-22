export function getMonthlyEventText(params: {
    month: string;
    monthTenGod: string;
    monthElement: string;
    dayMaster: string;
    geokguk: string;
    strengthType: string;
    strongestElementName: string;
    weakestElementName: string;
    currentDaeunText?: string;
    currentYearText?: string;
  }): string {
    const {
      month,
      monthTenGod,
      monthElement,
      dayMaster,
      geokguk,
      strengthType,
      strongestElementName,
      weakestElementName,
      currentDaeunText,
      currentYearText,
    } = params;
  
    const monthPhase =
      month === "1월" || month === "2월"
        ? "연초의 준비와 방향 설정"
        : month === "3월" || month === "4월"
        ? "활동이 본격적으로 열리는 확장"
        : month === "5월" || month === "6월"
        ? "책임과 성과가 동시에 커지는 실행"
        : month === "7월" || month === "8월"
        ? "흐름을 점검하고 조정하는 중간 관리"
        : month === "9월" || month === "10월"
        ? "관계와 금전 흐름이 현실적으로 드러나는 시기"
        : "한 해를 정리하고 다음 흐름을 준비하는 마무리";
  
    const tenGodText =
      monthTenGod === "정재"
        ? "정재가 작용하는 달이므로 고정수입, 현금흐름, 계약 안정성, 자산관리 문제가 중요해집니다."
        : monthTenGod === "편재"
        ? "편재가 작용하는 달이므로 투자, 부동산, 매매, 외부 제안, 거래 확장 가능성이 커집니다."
        : monthTenGod === "식신"
        ? "식신이 작용하는 달이므로 콘텐츠, 강의, 상담, 영업, 기존 경험의 상품화가 수익으로 이어질 수 있습니다."
        : monthTenGod === "상관"
        ? "상관이 작용하는 달이므로 마케팅, 표현력, SNS, 블로그, 기획 제안이 활발해질 수 있습니다."
        : monthTenGod === "정관"
        ? "정관이 작용하는 달이므로 평가, 직책, 행정 문서, 공식 계약, 신뢰와 평판 관리가 중요합니다."
        : monthTenGod === "편관"
        ? "편관이 작용하는 달이므로 책임, 경쟁, 압박, 민원, 규제, 체력 부담이 커질 수 있습니다."
        : monthTenGod === "정인"
        ? "정인이 작용하는 달이므로 공부, 자격증, 문서 지원, 귀인 도움, 제도적 보호가 기대됩니다."
        : monthTenGod === "편인"
        ? "편인이 작용하는 달이므로 연구, 분석, 전문성 강화, 새로운 분야 학습에 유리합니다."
        : monthTenGod === "비견"
        ? "비견이 작용하는 달이므로 독립심, 자기주장, 새로운 시작, 동료와의 경쟁이 강해집니다."
        : "겁재가 작용하는 달이므로 지출 증가, 인간관계 이해관계, 공동투자, 금전 약속 점검이 필요합니다.";
  
    const realEstateText =
      monthTenGod === "편재"
        ? "부동산 관점에서는 매매 문의, 투자 제안, 중개 연결, 외부 고객 소개가 들어올 수 있으나 계약 조건과 회수 가능성을 먼저 확인해야 합니다."
        : monthTenGod === "정재"
        ? "부동산 관점에서는 임대수익, 보증금, 월세 흐름, 장기 계약 안정성을 점검하기 좋은 달입니다."
        : monthTenGod === "식신"
        ? "부동산 관점에서는 상담 자료, 매물 설명, 블로그 글, 고객 응대 콘텐츠가 실제 문의와 수익으로 이어질 수 있습니다."
        : monthTenGod === "상관"
        ? "부동산 관점에서는 홍보 문구, 매물 소개, SNS 노출, 상담 화법이 기회를 만들 수 있지만 과장 표현은 피해야 합니다."
        : monthTenGod === "정관"
        ? "부동산 관점에서는 계약서, 행정 서류, 권리관계, 세금, 인허가 확인이 특히 중요합니다."
        : monthTenGod === "편관"
        ? "부동산 관점에서는 민원, 책임 문제, 계약 압박, 일정 지연이 생길 수 있으므로 문서와 증빙을 남겨야 합니다."
        : monthTenGod === "정인" || monthTenGod === "편인"
        ? "부동산 관점에서는 공부, 분석, 지역 조사, 권리관계 검토, 상담 역량 강화에 유리합니다."
        : "부동산 관점에서는 사람 관계와 역할 분담이 중요하므로 공동 진행, 소개, 동업성 제안은 조건을 명확히 해야 합니다.";
  
    const strengthText = strengthType.includes("신강")
      ? "신강 구조에서는 기회를 잡는 힘이 좋지만, 지나친 확신과 과속이 문제를 만들 수 있으므로 속도 조절이 중요합니다."
      : "신약 구조에서는 혼자 밀어붙이기보다 협력자, 문서, 제도, 안정적인 환경을 활용해야 좋은 결과가 납니다.";
  
    const elementText =
      monthElement === strongestElementName
        ? `이번 달의 ${monthElement} 기운은 원국에서 이미 강한 ${strongestElementName} 기운과 겹치므로 추진력은 커지지만 과하면 고집과 충돌로 나타날 수 있습니다.`
        : monthElement === weakestElementName
        ? `이번 달의 ${monthElement} 기운은 원국에서 부족한 ${weakestElementName} 기운을 보완해 주는 흐름이므로 약점을 정리하고 균형을 잡기 좋습니다.`
        : `이번 달의 ${monthElement} 기운은 강한 ${strongestElementName} 기운과 부족한 ${weakestElementName} 기운 사이에서 균형을 조절하는 보조 흐름으로 작용합니다.`;
  
    const daeunText = currentDaeunText
      ? "현재 대운과 함께 보면 이 달의 선택은 단기 사건에 그치지 않고 앞으로 몇 년간의 방향성에도 영향을 줄 수 있습니다."
      : "";
  
    const yearText = currentYearText
      ? "올해 세운과 함께 보면 이 달은 한 해 전체 흐름 속에서 강약 조절이 필요한 지점입니다."
      : "";
  
    return `${month}은 ${dayMaster} 일간, ${geokguk}, ${strengthType} 구조에서 ${monthPhase}에 해당합니다.
  
  ${tenGodText}
  
  ${realEstateText}
  
  ${elementText}
  
  ${strengthText}
  
  ${daeunText}
  ${yearText}
  
  정리하면 ${month}은 단순히 좋은 달과 나쁜 달로 보기보다, 들어오는 ${monthTenGod} 기운을 어떻게 활용하느냐에 따라 재물·직업·관계·건강의 결과가 달라지는 달입니다.`;
  }