export function getDayMasterAdvancedAnalysis(dayStem: string) {
  const dayStemMap: Record<string, string> = {
    甲: "갑",
    乙: "을",
    丙: "병",
    丁: "정",
    戊: "무",
    己: "기",
    庚: "경",
    辛: "신",
    壬: "임",
    癸: "계",
  };

  const normalizedDayStem = dayStemMap[dayStem] ?? dayStem;

  const db: Record<string, string> = {
    갑: `갑목 일간은 큰 나무처럼 성장성, 추진력, 독립성이 강한 타입입니다.
강점은 방향을 정하면 꾸준히 밀고 가는 힘이며, 사람이나 일을 키우는 능력이 있습니다.
재물운은 단기 이익보다 장기적으로 키워가는 구조에 강합니다.
직업운은 기획, 교육, 부동산, 조직 운영, 성장형 사업과 잘 맞습니다.
건강은 간, 근육, 피로 누적, 스트레스성 긴장에 주의가 필요합니다.`,

    을: `을목 일간은 풀과 덩굴처럼 유연하고 섬세한 적응력이 강한 타입입니다.
강점은 사람 사이의 분위기를 읽고 관계를 부드럽게 이어가는 능력입니다.
재물운은 인맥, 소개, 꾸준한 관리형 수익에 강합니다.
직업운은 상담, 교육, 디자인, 서비스, 중개, 콘텐츠 분야와 잘 맞습니다.
건강은 신경성 피로, 소화, 목·어깨 긴장에 주의가 필요합니다.`,

    병: `병화 일간은 태양처럼 밝고 표현력과 존재감이 강한 타입입니다.
강점은 사람을 끌어들이는 힘, 홍보력, 리더십, 빠른 판단력입니다.
재물운은 노출, 마케팅, 영업, 브랜드화될 때 커집니다.
직업운은 방송, 강의, 홍보, 영업, 리더 역할, 콘텐츠 분야와 잘 맞습니다.
건강은 심장, 혈압, 눈 피로, 과로성 열감에 주의가 필요합니다.`,

    정: `정화 일간은 촛불처럼 집중력, 섬세함, 정성, 분석력이 강한 타입입니다.
강점은 한 사람이나 한 분야를 깊게 살피는 능력입니다.
재물운은 전문성, 기술, 반복 고객, 신뢰 기반 수익에 강합니다.
직업운은 상담, 연구, 교육, 기획, 의료·복지, 정밀한 업무와 잘 맞습니다.
건강은 심리적 예민함, 수면, 혈액순환, 눈 피로를 조심해야 합니다.`,

    무: `무토 일간은 큰 산처럼 안정감, 책임감, 버티는 힘이 강한 타입입니다.
강점은 신뢰를 주고 중심을 잡는 능력입니다.
재물운은 부동산, 토지, 장기 보유, 안정형 자산에 강합니다.
직업운은 관리, 행정, 부동산, 건설, 조직 운영, 책임자 역할과 잘 맞습니다.
건강은 위장, 소화, 체중, 순환 정체에 주의가 필요합니다.`,

    기: `기토 일간은 논밭처럼 현실적이고 실속을 챙기는 능력이 강한 타입입니다.
강점은 생활력, 관리력, 세심한 실무 처리입니다.
재물운은 안정적인 반복 수익, 생활 밀착형 사업, 관리형 자산에 강합니다.
직업운은 회계, 관리, 상담, 부동산, 복지, 교육, 실무형 업무와 잘 맞습니다.
건강은 소화기, 피부, 습기, 만성 피로에 주의가 필요합니다.`,

    경: `경금 일간은 큰 쇠처럼 결단력, 원칙, 추진력이 강한 타입입니다.
강점은 복잡한 일을 정리하고 결론을 내리는 능력입니다.
재물운은 실행력, 거래, 경쟁, 성과급 구조에서 강해집니다.
직업운은 법률, 금융, 공무, 기술, 영업, 관리, 부동산 거래와 잘 맞습니다.
건강은 폐, 호흡기, 피부, 근육 긴장, 사고성 부상에 주의가 필요합니다.`,

    신: `신금 일간은 보석처럼 세련됨, 정밀함, 기준 의식이 강한 타입입니다.
강점은 완성도, 분석력, 감각, 품질 관리 능력입니다.
재물운은 고급화, 전문성, 브랜드, 디테일한 서비스에서 커집니다.
직업운은 금융, 디자인, 컨설팅, 미용, 콘텐츠, 전문 서비스와 잘 맞습니다.
건강은 호흡기, 피부, 예민성, 신경 피로에 주의가 필요합니다.`,

    임: `임수 일간은 큰 바다처럼 지혜, 이동성, 정보력, 확장성이 강한 타입입니다.
강점은 흐름을 읽고 큰 판을 보는 능력입니다.
재물운은 정보, 유통, 이동, 해외, 플랫폼, 네트워크에서 강합니다.
직업운은 무역, 유통, 컨설팅, 교육, 콘텐츠, 여행, 기획 분야와 잘 맞습니다.
건강은 신장, 방광, 하체 냉증, 수면 리듬에 주의가 필요합니다.`,

    계: `계수 일간은 이슬비처럼 감수성, 직관, 섬세한 관찰력이 강한 타입입니다.
강점은 보이지 않는 분위기와 사람의 마음을 읽는 능력입니다.
재물운은 지식, 상담, 글쓰기, 연구, 조용한 축적형 수익에 강합니다.
직업운은 상담, 교육, 연구, 콘텐츠, 복지, 치유형 서비스와 잘 맞습니다.
건강은 신장, 혈액순환, 냉증, 불안감, 수면 질에 주의가 필요합니다.`,
  };

  return db[normalizedDayStem] || "일간 정보를 기준으로 한 상세 해석을 준비 중입니다.";
}
export function getDayMasterDetail(dayStem: string) {
  const dayStemMap: Record<string, string> = {
    甲: "갑",
    乙: "을",
    丙: "병",
    丁: "정",
    戊: "무",
    己: "기",
    庚: "경",
    辛: "신",
    壬: "임",
    癸: "계",
  };

  const normalizedDayStem = dayStemMap[dayStem] ?? dayStem;

  const db: Record<string, any> = {
    갑: {
      title: "갑목",
      personality: "큰 나무처럼 성장과 확장, 추진력이 강한 타입입니다.",
      strength: "장기 성장, 리더십, 개척력",
      weakness: "고집, 과한 추진력",
      money: "장기 투자, 성장형 자산에 강함",
      job: "기획, 교육, 조직관리, 부동산",
      love: "직진형, 책임감 있는 관계",
    },
    을: {
      title: "을목",
      personality: "유연하고 관계 중심의 적응력이 뛰어난 타입입니다.",
      strength: "소통, 조율, 인간관계",
      weakness: "결정 지연, 흔들림",
      money: "네트워크 기반 수익",
      job: "상담, 디자인, 서비스, 중개",
      love: "배려형, 감정 중심 관계",
    },
    병: {
      title: "병화",
      personality: "태양처럼 밝고 표현력이 강한 타입입니다.",
      strength: "리더십, 홍보, 에너지",
      weakness: "과열, 감정 기복",
      money: "노출, 영업, 브랜드",
      job: "방송, 영업, 강의, 콘텐츠",
      love: "열정적, 표현 강한 관계",
    },
    정: {
      title: "정화",
      personality: "섬세하고 집중력이 높은 타입입니다.",
      strength: "정밀함, 집중력",
      weakness: "예민함",
      money: "전문성 기반 수익",
      job: "연구, 교육, 상담, 의료",
      love: "깊고 안정적인 관계",
    },
    무: {
      title: "무토",
      personality: "산처럼 안정적이고 책임감이 강한 타입입니다.",
      strength: "버팀력, 안정성",
      weakness: "고집, 변화 저항",
      money: "부동산, 장기 자산",
      job: "관리, 행정, 부동산",
      love: "묵직하고 안정적인 관계",
    },
    기: {
      title: "기토",
      personality: "실무형, 현실감각이 뛰어난 타입입니다.",
      strength: "관리력, 실무",
      weakness: "과도한 걱정",
      money: "생활형 수익",
      job: "회계, 관리, 복지",
      love: "현실적이고 안정적 관계",
    },
    경: {
      title: "경금",
      personality: "결단력과 추진력이 강한 타입입니다.",
      strength: "판단력, 실행력",
      weakness: "강압성",
      money: "거래, 성과형 수익",
      job: "법률, 금융, 기술",
      love: "직선적 관계",
    },
    신: {
      title: "신금",
      personality: "정밀하고 기준이 강한 타입입니다.",
      strength: "완성도, 분석력",
      weakness: "예민함",
      money: "전문 브랜드",
      job: "디자인, 금융, 컨설팅",
      love: "신중한 관계",
    },
    임: {
      title: "임수",
      personality: "큰 흐름을 읽는 전략형 타입입니다.",
      strength: "확장성, 정보력",
      weakness: "불안정",
      money: "유통, 네트워크",
      job: "무역, 기획, 콘텐츠",
      love: "자유로운 관계",
    },
    계: {
      title: "계수",
      personality: "직관과 감성이 뛰어난 타입입니다.",
      strength: "관찰력, 직관",
      weakness: "불안감",
      money: "지식, 상담",
      job: "교육, 연구, 콘텐츠",
      love: "섬세한 관계",
    },
  };

  return db[normalizedDayStem] || db["갑"];
}
export function getDayMasterReportSectionText(params: {
  dayMasterTitle: string;
  personalityText: string;
  dynamicLifePatternText: string;
  loveText: string;
  careerRecommendText: string;
  businessRecommendText: string;
}): string {
  const {
    dayMasterTitle,
    personalityText,
    dynamicLifePatternText,
    loveText,
    careerRecommendText,
    businessRecommendText,
  } = params;

  return `
🌞 일주 해석
🌟 나의 일간 분석
나의 일간: ${dayMasterTitle}

■ 기본 성향
${personalityText}

${dynamicLifePatternText}

■ 연애 성향
${loveText}

💼 직업 적성 추천
${careerRecommendText}

💰 추천 사업 아이템
${businessRecommendText}
`;
}