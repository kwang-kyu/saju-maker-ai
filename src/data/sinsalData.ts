export type SinsalInfo = {
    name: string;
    category: string;
    meaning: string;
    strength: "약함" | "보통" | "강함";
  };
  
  export const sinsalBaseMap: Record<string, SinsalInfo> = {
    천을귀인: {
      name: "천을귀인",
      category: "귀인·도움",
      meaning: "위기 때 도움을 받거나 좋은 인연을 만나는 흐름입니다.",
      strength: "보통",
    },
    문창귀인: {
      name: "문창귀인",
      category: "학습·문서",
      meaning: "공부, 글쓰기, 문서, 자격, 기획 능력과 관련됩니다.",
      strength: "보통",
    },
    역마살: {
      name: "역마살",
      category: "이동·변화",
      meaning: "이동, 출장, 이사, 활동 범위 확장과 관련됩니다.",
      strength: "보통",
    },
    도화살: {
      name: "도화살",
      category: "인기·매력",
      meaning: "사람의 관심, 매력, 표현력, 대인관계와 관련됩니다.",
      strength: "보통",
    },
    화개살: {
      name: "화개살",
      category: "예술·고독·전문성",
      meaning: "예술성, 종교성, 연구성, 혼자 몰입하는 힘과 관련됩니다.",
      strength: "보통",
    },
    장성살: {
      name: "장성살",
      category: "리더십·추진력",
      meaning: "주도권, 책임감, 리더십, 추진력과 관련됩니다.",
      strength: "보통",
    },
    백호살: {
      name: "백호살",
      category: "강한 기운·주의",
      meaning: "강한 결단력과 동시에 사고, 건강, 급한 판단을 조심해야 하는 기운입니다.",
      strength: "강함",
    },
    괴강살: {
      name: "괴강살",
      category: "강한 자존심·독립성",
      meaning: "자존심, 독립성, 강한 추진력, 극단적 판단과 관련됩니다.",
      strength: "강함",
    },
    양인살: {
      name: "양인살",
      category: "승부욕·강한 의지",
      meaning: "승부욕, 독립심, 경쟁심, 강한 자기주장과 관련됩니다.",
      strength: "강함",
    },
  };
  export function getSinsalEventText(sinsalNames: string[]): string {
    const texts: string[] = [];
  
    if (sinsalNames.includes("천을귀인")) {
      texts.push(
        "천을귀인은 귀인의 도움, 좋은 인연, 조언자와의 만남이 강해지는 흐름입니다."
      );
    }
  
    if (sinsalNames.includes("문창귀인")) {
      texts.push(
        "문창귀인은 공부, 자격증, 문서, 계약, 기획 능력이 살아나는 흐름입니다."
      );
    }
  
    if (sinsalNames.includes("역마살")) {
      texts.push(
        "역마살은 이동, 출장, 이사, 직장 변화, 활동 범위 확대 가능성이 높아지는 흐름입니다."
      );
    }
  
    if (sinsalNames.includes("도화살")) {
      texts.push(
        "도화살은 인기, 매력, 대인관계, 연애운이 살아나 사람을 통한 기회가 늘어날 수 있습니다."
      );
    }
  
    if (sinsalNames.includes("화개살")) {
      texts.push(
        "화개살은 공부, 연구, 전문성, 예술성, 종교·철학적 관심이 깊어지는 흐름입니다."
      );
    }
  
    if (sinsalNames.includes("장성살")) {
      texts.push(
        "장성살은 리더십, 추진력, 책임감이 강해져 직업적 성장과 영향력 확대를 기대할 수 있습니다."
      );
    }
  
    if (sinsalNames.includes("백호살")) {
      texts.push(
        "백호살은 급한 판단, 과로, 사고 가능성을 주의해야 하며 건강과 안전관리에 신경 쓰는 것이 중요합니다."
      );
    }
  
    if (sinsalNames.includes("괴강살")) {
      texts.push(
        "괴강살은 강한 추진력과 독립성이 살아나 큰 결단을 내리기 좋지만 대인관계의 충돌은 주의해야 합니다."
      );
    }
  
    if (sinsalNames.includes("양인살")) {
      texts.push(
        "양인살은 경쟁심과 승부욕이 강해져 목표를 밀어붙이는 힘이 커지지만 고집과 감정 충돌은 경계해야 합니다."
      );
    }
  
    return texts.join("\n");
  }
  
  export type SinsalElementInfo = {
    name: string;
  };
  
  export type SinsalStrengthInfo = {
    strengthType: string;
  };
  
  export function getPersonalizedSinsalText(params: {
    name: string;
    dayStem: string;
    dayBranch: string;
    gyeokguk: string;
    strongest: SinsalElementInfo;
    weakest: SinsalElementInfo;
    dayStrengthAnalysis: SinsalStrengthInfo;
    hasCheonEul: boolean;
    hasDohwa: boolean;
    hasYeokma: boolean;
    hasHwagae: boolean;
    hasMoonChang: boolean;
    hasJangSeong?: boolean;
    hasBaekho?: boolean;
    hasGoeGang?: boolean;
    hasYangIn?: boolean;
  }) {
    const {
      name,
      dayStem,
      dayBranch,
      gyeokguk,
      strongest,
      weakest,
      dayStrengthAnalysis,
      hasCheonEul,
      hasDohwa,
      hasYeokma,
      hasHwagae,
      hasMoonChang,
      hasJangSeong = false,
      hasBaekho = false,
      hasGoeGang = false,
      hasYangIn = false,
    } = params;
  
    const nobleCount = [hasCheonEul, hasMoonChang].filter(Boolean).length;
    const movementCount = hasYeokma ? 1 : 0;
    const charmCount = hasDohwa ? 1 : 0;
    const focusCount = hasHwagae ? 1 : 0;
    const activeSinsalCount = [
        hasCheonEul,
        hasDohwa,
        hasYeokma,
        hasHwagae,
        hasMoonChang,
        hasJangSeong,
        hasBaekho,
        hasGoeGang,
        hasYangIn,
      ].filter(Boolean).length;
      
      const strongActionCount = [
        hasJangSeong,
        hasBaekho,
        hasGoeGang,
        hasYangIn,
      ].filter(Boolean).length;
  
    let detailText = "";
  
    if (hasCheonEul) {
      detailText += `
  [천을귀인]
  ${name}님은 어려운 상황에서 조언자, 소개자, 협력자를 통해 길이 열릴 가능성이 있습니다.
  특히 ${gyeokguk} 구조와 함께 보면 계약, 상담, 소개, 협력 관계에서 도움을 받는 흐름이 살아납니다.
  `;
    }
  
    if (hasMoonChang) {
      detailText += `
  [문창귀인]
  ${name}님은 글, 문서, 기획, 자격증, 보고서, 상담, 교육 쪽에서 장점이 드러납니다.
  강한 오행인 ${strongest.name} 기운을 잘 쓰면 지식과 경험을 실무 성과로 연결하기 좋습니다.
  `;
    }
  
    if (hasYeokma) {
      detailText += `
  [역마살]
  ${name}님은 한곳에 머무르기보다 이동, 변화, 확장 속에서 기회가 열리는 편입니다.
  직업적으로는 영업, 현장 업무, 출장, 유통, 무역, 온라인 확장, 지역 이동이 있는 일과 잘 맞습니다.
  부동산 관점에서는 지역 분석, 임장, 현장 확인, 고객 방문, 매물 확장과도 연결됩니다.
  `;
    }
  
    if (hasDohwa) {
      detailText += `
  [도화살]
  ${name}님은 사람의 시선을 끄는 매력과 표현력이 드러나는 편입니다.
  말, 이미지, 분위기, 콘텐츠, 영업, 상담, 대인관계에서 존재감이 살아날 수 있습니다.
  다만 부족한 오행인 ${weakest.name} 기운이 약하게 작용하면 감정 조절이나 관계 균형이 흔들릴 수 있습니다.
  `;
    }
  
    if (hasHwagae) {
      detailText += `
  [화개살]
  ${name}님은 내면의 깊이, 예술성, 종교성, 철학성, 연구성과 관련된 기운이 있습니다.
  혼자 몰입해서 전문성을 쌓는 분야, 교육, 상담, 연구, 창작, 기획 분야에서 강점이 살아납니다.
  `;
    }
    if (hasJangSeong) {
        detailText += `
      [장성살]
      ${name}님은 책임감, 리더십, 추진력이 강하게 드러나는 편입니다.
      조직에서는 관리자, 팀장, 책임자 역할을 맡을 가능성이 높고,
      사업에서는 스스로 방향을 정하고 이끄는 능력이 좋습니다.
      특히 ${strongest.name} 기운을 잘 활용하면 지도력과 실행력이 더욱 커질 수 있습니다.
      `;
      }
      
      if (hasBaekho) {
        detailText += `
      [백호살]
      ${name}님은 결단력이 강하고 위기 상황에서 빠른 판단을 내리는 힘이 있습니다.
      다만 급한 결정, 무리한 추진, 건강 관리에는 주의가 필요합니다.
      특히 부족한 ${weakest.name} 기운이 약하게 작용하면 체력 저하와 스트레스 관리가 중요합니다.
      `;
      }
      
      if (hasGoeGang) {
        detailText += `
      [괴강살]
      ${name}님은 독립심과 자존심이 강하고 스스로 길을 개척하려는 성향이 있습니다.
      전문직, 자영업, 사업, 연구 분야처럼 독립성이 필요한 영역에서 강점이 살아납니다.
      격국(${gyeokguk}) 구조와 함께 보면 자기 주도적인 인생 흐름이 더욱 강하게 나타날 수 있습니다.
      `;
      }
      
      if (hasYangIn) {
        detailText += `
      [양인살]
      ${name}님은 승부욕, 경쟁심, 자기주장이 강한 편입니다.
      한번 목표를 정하면 끝까지 밀어붙이는 추진력이 있으며,
      영업, 사업, 투자, 경쟁 분야에서 장점이 살아날 수 있습니다.
      다만 인간관계에서는 유연성과 조율 능력을 함께 키우는 것이 중요합니다.
      `;
      }
    if (activeSinsalCount === 0) {
      detailText += `
  [기본 신살 흐름]
  대표 신살의 영향은 강하지 않은 편입니다.
  따라서 신살보다 격국(${gyeokguk}), 일간(${dayStem}), 신강신약(${dayStrengthAnalysis.strengthType}), 강한 오행(${strongest.name}), 부족한 오행(${weakest.name})을 중심으로 해석하는 것이 더 정확합니다.
  `;
    }
  
    const comboText = `
[조합 해석]

${nobleCount >= 2
  ? "귀인성 기운이 복수로 작용하여 인맥, 소개, 계약, 협력에서 도움을 받을 가능성이 큽니다."
  : nobleCount === 1
  ? "귀인성 기운이 있어 주변의 조언자, 협력자, 소개 인연이 도움이 될 수 있습니다."
  : "귀인성 기운은 약하므로 스스로 기반을 만들고 신뢰 관계를 쌓는 노력이 중요합니다."}

${strongActionCount >= 3
  ? "강한 행동성 신살이 다수 존재하여 리더십, 독립성, 추진력, 승부욕이 매우 강한 구조입니다. 사업, 투자, 조직 운영, 책임자 역할에서 역량이 크게 발휘될 수 있습니다."
  : strongActionCount === 2
  ? "행동성과 추진력이 비교적 강한 편으로 스스로 결정하고 움직일 때 운이 열리는 구조입니다."
  : strongActionCount === 1
  ? "독립성과 실행력이 일부 드러나는 구조이며 특정 분야에서 강한 집중력을 발휘할 수 있습니다."
  : "강한 행동성 신살의 영향은 크지 않으므로 안정적인 방식과 꾸준함이 장점으로 작용합니다."}
  
  ${focusCount >= 1 && hasMoonChang
    ? "화개와 문창이 함께 작용하면 연구, 교육, 강의, 상담, 철학, 종교, 글쓰기, 전문직 분야에서 깊이 있는 역량이 나타날 수 있습니다."
    : ""}
  
  ${nobleCount >= 1 && hasJangSeong
    ? "귀인성과 장성 기운이 함께 있으면 사람을 이끌고 조직을 관리하는 리더형 성향이 강해집니다. 책임자, 관리자, 대표, 조직 운영 역할과 인연이 있습니다."
    : ""}
  
  ${hasGoeGang && hasYangIn
    ? "괴강과 양인이 함께 작용하면 독립심과 승부욕이 매우 강해집니다. 사업가형, 개척형, 전문직형 성향이 강하며 스스로 길을 만드는 힘이 큽니다. 다만 인간관계에서는 유연성과 조율 능력을 함께 키우는 것이 중요합니다."
    : ""}
${dayStrengthAnalysis.strengthType.includes("신강")
  ? "신강 사주는 신살의 장점을 크게 활용할 수 있으므로 과감한 추진과 확장 전략이 유리합니다."
  : "신약 사주는 신살의 장점을 무리하게 쓰기보다 체력 관리와 균형을 우선하는 것이 중요합니다."}
`;
  
    const balanceText = `
  [균형 조언]
  ${dayStrengthAnalysis.strengthType} 사주에서는 신살을 무조건 강하게 쓰기보다 균형 있게 활용해야 합니다.
  강한 오행인 ${strongest.name} 기운은 장점으로 살리고,
  부족한 오행인 ${weakest.name} 기운은 생활 습관, 관계 방식, 일의 선택에서 보완해야 합니다.
  `;
  
    return `
 ${name}님의 신살 흐름은 일간(${dayStem}), 일지(${dayBranch}), 격국(${gyeokguk})을 기준으로 해석합니다.
강한 오행(${strongest.name})과 부족한 오행(${weakest.name})을 함께 보면, 신살이 실제 생활에서 어떤 방향으로 작용하는지 더 분명해집니다.
  
  현재 확인된 주요 신살 흐름:
- 전체 신살 개수: ${activeSinsalCount}개
- 귀인 계열: ${nobleCount}개
- 역마 계열: ${movementCount}개
- 도화 계열: ${charmCount}개
- 화개 계열: ${focusCount}개
- 강한 행동성 계열: ${strongActionCount}개
  
  ${detailText}
  
  ${comboText}
  
  ${balanceText}
  `;
  }

  export function getSinsalReportSectionText(params: {
    sinsalText: string;
    sinsalEventText: string;
    hapChungEventText: string;
    yearLuckText: string;
    daeunText: string;
  }): string {
    const {
      sinsalText,
      sinsalEventText,
      hapChungEventText,
      yearLuckText,
      daeunText,
    } = params;
  
    return `
  [신살 종합 분석]
  
  ${sinsalText}
  
  [신살 이벤트 흐름]
  ${sinsalEventText || "특별히 강하게 작용하는 신살 이벤트는 크지 않습니다."}
  
  [합충형파해와 신살의 연결]
  ${hapChungEventText || "합충형파해와 강하게 연결되는 신살 흐름은 크지 않습니다."}
  
  [세운에서의 신살 작용]
  ${yearLuckText}
  
  [대운에서의 신살 작용]
  ${daeunText}
  
  신살은 단독으로 길흉을 판단하는 요소가 아니라,
  일간, 격국, 신강신약, 오행 균형, 세운과 대운의 흐름 속에서 사건성을 읽는 보조 판단 기준입니다.
  
  따라서 위 신살 분석은 성격 하나만 보는 것이 아니라,
  인연, 이동, 직업 변화, 관계 흐름, 건강 주의점, 기회가 열리는 방향까지 함께 참고해야 합니다.
  `;
  }

  export function getSinsalFlagsByDayBranch(dayBranch: string) {
    return {
      hasCheonEul: ["자", "신", "진"].includes(dayBranch),
      hasDohwa: ["자", "오", "묘", "유"].includes(dayBranch),
      hasYeokma: ["인", "신", "사", "해"].includes(dayBranch),
      hasHwagae: ["진", "술", "축", "미"].includes(dayBranch),
      hasMoonChang: ["사", "유", "축"].includes(dayBranch),
    };
  }