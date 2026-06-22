export function getMonthlyMoneyGuide(monthTenGod: string): string {
    const map: Record<string, string> = {
      정재: "고정수입, 계약, 자산관리 점검에 집중하세요.",
      편재: "투자 제안과 외부 기회는 검증 후 움직이는 것이 좋습니다.",
      식신: "기존 경험과 콘텐츠를 수익화하기 좋은 시기입니다.",
      상관: "홍보와 제안은 좋지만 과장과 충동 소비는 주의하세요.",
      정관: "계약서, 세금, 행정 문서를 꼼꼼히 관리하세요.",
      편관: "책임과 압박이 커질 수 있으므로 무리한 확장은 피하세요.",
      정인: "공부와 분석을 통한 장기 재무전략 수립이 유리합니다.",
      편인: "새로운 분야를 탐색하되 즉흥적인 투자는 자제하세요.",
      비견: "경쟁보다 기존 자산과 현금흐름 관리에 집중하세요.",
      겁재: "공동투자와 금전 거래는 신중하게 검토하세요.",
    };
  
    return map[monthTenGod] || "";
  }
  
  export function getMonthlyJobGuide(monthTenGod: string): string {
    const map: Record<string, string> = {
      정재: "기존 업무를 안정적으로 운영하는 것이 유리합니다.",
      편재: "외부 제안과 신규 고객 확보 기회가 생길 수 있습니다.",
      식신: "강의, 상담, 콘텐츠, 영업 활동이 성과로 이어집니다.",
      상관: "마케팅과 브랜딩 역량이 빛나는 시기입니다.",
      정관: "직책, 평가, 계약 업무에 집중하세요.",
      편관: "책임과 경쟁이 커질 수 있으므로 체력 관리가 중요합니다.",
      정인: "자격증, 공부, 조사 업무에 집중하면 도움이 됩니다.",
      편인: "연구와 기획 업무에서 좋은 아이디어가 나옵니다.",
      비견: "독립적인 판단과 추진력이 강해집니다.",
      겁재: "협업 관계의 이해관계를 명확히 해야 합니다.",
    };
  
    return map[monthTenGod] || "";
  }
  
  export function getMonthlyLoveGuide(monthTenGod: string): string {
    const map: Record<string, string> = {
      정재: "안정적인 관계와 신뢰 형성이 중요합니다.",
      편재: "새로운 인연이나 만남이 생길 가능성이 있습니다.",
      식신: "따뜻한 표현이 관계를 부드럽게 만듭니다.",
      상관: "감정 표현은 좋지만 말실수는 주의하세요.",
      정관: "책임감 있는 태도가 관계를 안정시킵니다.",
      편관: "감정 기복과 갈등이 생기지 않도록 조심하세요.",
      정인: "배려와 이해가 관계를 깊게 만듭니다.",
      편인: "혼자만의 시간이 필요할 수 있습니다.",
      비견: "주도권 다툼보다 협력이 중요합니다.",
      겁재: "질투와 경쟁심이 관계를 흔들 수 있습니다.",
    };
  
    return map[monthTenGod] || "";
  }
  
  export function getMonthlyHealthGuide(monthTenGod: string): string {
    const map: Record<string, string> = {
      정재: "규칙적인 생활과 식습관 관리가 중요합니다.",
      편재: "과로와 과소비로 인한 피로를 조심하세요.",
      식신: "소화기와 생활 리듬을 관리하세요.",
      상관: "과도한 활동과 스트레스 해소가 필요합니다.",
      정관: "체력과 면역력 관리가 중요합니다.",
      편관: "과로, 혈압, 근육 피로를 조심하세요.",
      정인: "휴식과 수면 관리가 중요합니다.",
      편인: "신경성 피로와 불면을 주의하세요.",
      비견: "무리한 일정과 과신을 경계하세요.",
      겁재: "감정 소모와 스트레스 관리가 필요합니다.",
    };
  
    return map[monthTenGod] || "";
  }
  type MonthlyEventInput = {
    month: number;
    monthElement: string;
    monthTenGod: string;
    dayStem: string;
    gyeokguk: string;
    strengthType: string;
    yongsin: string;
  };
  
  export function getMonthlyEventText({
    month,
    monthElement,
    monthTenGod,
    dayStem,
    gyeokguk,
    strengthType,
    yongsin,
  }: MonthlyEventInput): string {
    const tenGodEventMap: Record<string, string[]> = {
      정재: ["계약 갱신", "고정 수입 점검", "보증금·임대료 정리"],
      편재: ["투자 제안", "외부 고객 유입", "단기 수익 기회"],
      정관: ["공식 계약", "기관·법적 서류 검토", "신뢰 기반 상담"],
      편관: ["급한 의사결정", "분쟁 소지 점검", "리스크 관리"],
      정인: ["자료 정리", "문서 검토", "전문성 강화"],
      편인: ["새 아이디어", "블로그·콘텐츠 기획", "비정형 상담"],
      식신: ["상담 증가", "고객 만족 관리", "콘텐츠 발행"],
      상관: ["홍보 강화", "말·표현 주의", "차별화 전략"],
      비견: ["동료 협업", "공동중개", "기존 고객 재접촉"],
      겁재: ["경쟁 매물 비교", "수익 배분 주의", "계약 조건 조율"],
    };
  
    const elementEventMap: Record<string, string> = {
      목: "새로운 고객·매물·아이디어가 열리는 달입니다.",
      화: "홍보, 상담, 노출, 브랜딩 흐름이 강해지는 달입니다.",
      토: "계약서, 권리관계, 보증금, 실무 점검이 중요한 달입니다.",
      금: "가격 조정, 협상, 판단, 계약 마무리에 유리한 달입니다.",
      수: "정보 수집, 시장 흐름 파악, 고객 DB 관리가 중요한 달입니다.",
    };
  
    const baseEvents = tenGodEventMap[monthTenGod] || [
      "상담 흐름 점검",
      "고객 관리",
      "업무 일정 정리",
    ];
  
    const elementText =
      elementEventMap[monthElement] ||
      "이번 달은 기본 업무 흐름을 안정적으로 관리하는 것이 좋습니다.";
  
    return `
  ${month}월 사건성 포인트
  
  핵심 사건:
  - ${baseEvents[0]}
  - ${baseEvents[1]}
  - ${baseEvents[2]}
  
  월별 흐름:
  ${elementText}
  
  개인화 해석:
  ${dayStem} 일간 기준으로 이번 달은 ${monthTenGod} 기운이 작용합니다.
  현재 격국은 ${gyeokguk}, 신강·신약 흐름은 ${strengthType} 구조이므로
  무리하게 확장하기보다는 ${yongsin} 기운을 살리는 방향으로 판단하는 것이 좋습니다.
  `;
  }

  type MonthlyRealEstateGuideInput = {
    month: number;
    monthElement: string;
    monthTenGod: string;
    gyeokguk: string;
    strengthType: string;
  };
  
  export function getMonthlyRealEstateGuideText({
    month,
    monthElement,
    monthTenGod,
    gyeokguk,
    strengthType,
  }: MonthlyRealEstateGuideInput): string {
    const tenGodPointMap: Record<string, string> = {
      정재: "임대차 계약, 보증금, 고정 수입형 매물 점검에 유리합니다.",
      편재: "투자 문의, 외부 고객, 단기 수익형 매물 검토에 유리합니다.",
      정관: "공식 계약, 권리관계, 기관 서류 검토가 중요합니다.",
      편관: "분쟁 가능성, 급매물 리스크, 특약 조건을 신중히 봐야 합니다.",
      정인: "공부, 자료 정리, 권리분석, 시장 리포트 작성에 좋습니다.",
      편인: "새로운 기획, 블로그 콘텐츠, 틈새 매물 발굴에 유리합니다.",
      식신: "상담 증가, 고객 응대, 매물 설명, 콘텐츠 발행에 좋습니다.",
      상관: "홍보와 차별화에는 좋지만 말실수와 과장 표현은 주의해야 합니다.",
      비견: "공동중개, 동료 협업, 기존 고객 재접촉에 유리합니다.",
      겁재: "경쟁 매물 비교, 수수료 협의, 공동투자 조건을 조심해야 합니다.",
    };
  
    const elementActionMap: Record<string, string> = {
      목: "신규 매물 확보와 고객 DB 확장에 집중하세요.",
      화: "블로그, 유튜브, 카카오채널 등 홍보 활동을 강화하세요.",
      토: "계약서, 등기부, 건축물대장, 토지이용계획 확인이 중요합니다.",
      금: "가격 협상, 조건 조율, 계약 마무리 전략을 세우세요.",
      수: "시장 조사, 고객 상담 기록, 지역 시세 흐름을 정리하세요.",
    };
  
    const cautionMap: Record<string, string> = {
      신강: "자신감이 강해질 수 있으므로 계약 조건을 독단적으로 판단하지 마세요.",
      신약: "상대방 흐름에 끌려갈 수 있으므로 특약과 일정은 문서로 명확히 남기세요.",
    };
  
    const point =
      tenGodPointMap[monthTenGod] ||
      "기본 상담, 매물 관리, 고객 응대 흐름을 안정적으로 유지하는 것이 좋습니다.";
  
    const action =
      elementActionMap[monthElement] ||
      "기존 업무를 점검하고 실무 루틴을 정리하세요.";
  
    const caution =
      cautionMap[strengthType] ||
      "계약 전 권리관계와 금액 조건을 다시 확인하세요.";
  
    return `
  ${month}월 부동산 전용 해석
  
  🏢 부동산 포인트
  ${point}
  
  📈 추천 행동
  ${action}
  
  ⚠ 계약 주의사항
  ${caution}
  
  격국 참고:
  현재 ${gyeokguk} 구조에서는 단순히 거래 건수를 늘리기보다
  상담의 질, 계약 안정성, 고객 신뢰를 함께 관리하는 것이 중요합니다.
  `;
  }

  type MonthlyChecklistInput = {
    month: number;
    monthElement: string;
    monthTenGod: string;
    strengthType: string;
  };
  
  export function getMonthlyChecklistText({
    month,
    monthElement,
    monthTenGod,
    strengthType,
  }: MonthlyChecklistInput): string {
    const tenGodChecklistMap: Record<string, string[]> = {
      정재: ["임대차 갱신 고객 확인", "보증금 반환 일정 점검"],
      편재: ["투자 문의 고객 리스트 정리", "수익형 매물 후보 점검"],
      정관: ["계약서·특약 문구 재확인", "등기부등본 권리관계 확인"],
      편관: ["분쟁 가능 계약 사전 점검", "급매물 리스크 체크"],
      정인: ["권리분석 자료 정리", "시장조사 리포트 작성"],
      편인: ["블로그 콘텐츠 주제 기획", "틈새 매물 발굴"],
      식신: ["상담 고객 follow-up", "매물 설명 자료 보완"],
      상관: ["홍보 문구 과장 여부 점검", "SNS·블로그 발행 일정 관리"],
      비견: ["공동중개 파트너 연락", "기존 고객 재접촉"],
      겁재: ["수수료 협의 조건 확인", "경쟁 매물 가격 비교"],
    };
  
    const elementChecklistMap: Record<string, string> = {
      목: "□ 신규 매물 확보",
      화: "□ 블로그·유튜브·카카오채널 콘텐츠 발행",
      토: "□ 계약서·공부서류·토지이용계획 확인",
      금: "□ 가격 협상안과 계약 조건 정리",
      수: "□ 고객 DB와 지역 시세 흐름 정리",
    };
  
    const strengthChecklistMap: Record<string, string> = {
      신강: "□ 독단적 판단 전 제3자 검토 받기",
      신약: "□ 상대방 요구사항을 문서로 명확히 남기기",
    };
  
    const checklist = tenGodChecklistMap[monthTenGod] || [
      "월간 상담 일정 정리",
      "기존 고객 관리",
    ];
  
    const elementChecklist =
      elementChecklistMap[monthElement] || "□ 월간 업무 루틴 점검";
  
    const strengthChecklist =
      strengthChecklistMap[strengthType] || "□ 계약 전 핵심 조건 재확인";
  
    return `
  ${month}월 실행 체크리스트
  
  □ ${checklist[0]}
  □ ${checklist[1]}
  ${elementChecklist}
  ${strengthChecklist}
  □ 세금·잔금·계약 일정 확인
  `;
  }