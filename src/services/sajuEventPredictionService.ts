type EventInput = {
    year: number;
    category: "money" | "job" | "love" | "health";
    dayStem: string;
    gyeokguk: string;
    strengthType: string;
    strongestName: string;
    weakestName: string;
    yongsin: string;
  };
  
  function getCategoryLabel(category: EventInput["category"]): string {
    const labels: Record<EventInput["category"], string> = {
      money: "재물",
      job: "직업",
      love: "관계",
      health: "건강",
    };
  
    return labels[category];
  }
  
  export function getSajuEventPredictionText({
    year,
    category,
    dayStem,
    gyeokguk,
    strengthType,
    strongestName,
    weakestName,
    yongsin,
  }: EventInput): string {
    const label = getCategoryLabel(category);
  
    return `${year}년 ${label} 사건 흐름은 ${dayStem} 일간, ${gyeokguk}, ${strengthType} 구조를 기준으로 볼 때 단순한 운세 변화가 아니라 실제 생활에서 체감되는 선택의 압박으로 나타날 가능성이 큽니다.
  
  강한 오행인 ${strongestName}의 기운은 이미 익숙한 방식으로 일을 밀어붙이게 만들 수 있고, 약한 오행인 ${weakestName}의 부족은 판단이 늦어지거나 사람과의 조율에서 빈틈을 만들 수 있습니다.
  
  이 시기에는 ${yongsin}의 기운을 살리는 선택이 중요합니다. 무리하게 확장하기보다 계약, 제안, 관계, 건강 관리 중 하나를 선명하게 정리해야 손실을 줄이고 기회를 현실적인 성과로 바꿀 수 있습니다.`;
  }
  export function getMultiYearEventPredictionText(input: {
    startYear: number;
    category: "money" | "job" | "love" | "health";
  }) {
    const { startYear, category } = input;
  
    const eventMap = {
        money: [
            "부동산·사업·투자와 관련된 새로운 자금 기회나 수익 모델을 검토하게 될 수 있습니다.",
            "공동 투자, 투자 제안, 자금 유입 또는 새로운 거래 제안을 받을 가능성이 높습니다.",
            "매매·계약·법인·사업 확장과 관련한 중요한 재정 의사결정을 해야 하는 시기가 될 수 있습니다.",
            "기존 자산 정리, 포트폴리오 재편, 장기 투자 전략을 다시 설계하는 전환점이 될 수 있습니다.",
        ],
        job: [
          "새로운 업무 영역, 사업 아이템 또는 직책 변화가 시작될 가능성이 있습니다.",
          "승진·이직·독립·사업 확장과 관련한 제안을 받을 가능성이 높습니다.",
          "중요 프로젝트, 조직 변화, 책임 증가로 인해 직업적 전환점이 찾아올 수 있습니다.",
          "장기적인 일의 방향과 인생 목표를 다시 정리하는 시기가 될 수 있습니다.",
        ],
        love: [
          "새로운 인연, 관계의 시작 또는 인간관계 변화의 계기가 생길 수 있습니다.",
          "연인·배우자·가족과의 관계에서 중요한 선택이나 감정 변화가 나타날 수 있습니다.",
          "결혼, 동거, 관계 정리 또는 가족 문제와 관련한 결정이 필요해질 수 있습니다.",
          "관계를 정리하거나 더욱 깊고 안정적인 관계로 발전시키는 전환점이 될 수 있습니다.",
        ],
        health: [
            "생활 습관과 체력 관리 방식을 크게 바꾸어야 할 필요성을 느낄 수 있습니다.",
            "과로, 스트레스, 수면 부족에 대한 관리가 매우 중요해질 수 있습니다.",
            "건강검진, 치료, 체중 관리 또는 운동 습관 변화가 필요한 시기가 될 수 있습니다.",
            "향후 10년을 위한 장기 건강관리 체계를 새롭게 정비하는 전환점이 될 수 있습니다.",
          ],
        
    };
  
    const texts = eventMap[category];
  
    return [
      `${startYear}년 : ${texts[0]}`,
      `${startYear + 1}년 : ${texts[1]}`,
      `${startYear + 2}년 : ${texts[2]}`,
      `${startYear + 3}년 : ${texts[3]}`,
    ].join("\n");
  }