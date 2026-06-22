import { TEN_GOD_DETAIL_DB } from "./tenGodPositionService";

export function personalizeTenGodDetail(
  tenGod: string,
  tenGodCounts: Record<string, number>,
  dayStem: string,
  gyeokguk: string,
  dayStrengthAnalysis: any,
  strongest: { name: string },
  weakest: { name: string }
) {
  const base = TEN_GOD_DETAIL_DB[tenGod];
  const repeatCount = tenGodCounts[tenGod] || 0;

  if (!base) return null;

  const repeatText =
    repeatCount >= 2
      ? `${tenGod}이 ${repeatCount}회 반복되어 이 기운이 사주 전반에서 강하게 작용합니다.`
      : `${tenGod}은 특정 영역에서 보조적으로 작용하는 기운입니다.`;

  return {
    money: `${base.money}
${dayStem} 일간 기준으로 보면 ${tenGod}은 단순한 재물 성향이 아니라 ${gyeokguk} 구조, ${dayStrengthAnalysis.strengthType} 흐름, 강한 ${strongest.name} 기운과 함께 작용합니다.
특히 부족한 ${weakest.name} 기운을 보완할수록 재물 판단의 균형이 좋아집니다. ${repeatText}`,

    job: `${base.job}
직업적으로는 ${dayStem} 일간의 기본 기질과 ${tenGod}의 작용이 함께 나타납니다.
현재 ${gyeokguk} 구조에서는 강한 ${strongest.name} 기운을 전문성으로 살리고, 부족한 ${weakest.name} 기운은 업무 습관으로 보완하는 것이 중요합니다.
특히 ${dayStrengthAnalysis.strengthType} 성향에 맞는 업무 방식을 선택할수록 직업적 성과가 안정적으로 성장합니다. ${repeatText}`,

    love: `${base.love}
관계에서는 ${tenGod}의 성향이 ${dayStem} 일간의 표현 방식과 함께 드러납니다.
특히 ${dayStrengthAnalysis.strengthType} 흐름에서는 감정 표현의 강약 조절이 관계 안정의 핵심입니다. ${repeatText}`,

    caution: `${base.caution}
주의할 점은 ${strongest.name} 기운이 강해질 때 장점이 과해질 수 있고, ${weakest.name} 기운이 약할 때 판단과 균형이 흔들릴 수 있다는 점입니다.
특히 ${gyeokguk} 구조와 ${dayStrengthAnalysis.strengthType} 흐름에서는 장점이 과하면 고집·과속·무리한 확장으로 드러날 수 있으므로, 부족한 ${weakest.name} 기운을 현실적으로 보완해야 합니다. ${repeatText}`,
  };
}
export function getDayTenGodComboText(
    dayStem: string,
    monthTenGod: string,
    dayMasterTitle: string
  ): string {
    const comboKey = `${dayStem}-${monthTenGod}`;
  
    const comboDB: Record<string, string> = {
        
            "경-편재": `
        💎 경금 + 편재 조합
        
        결단력 있는 경금에 편재가 붙으면 사업 감각, 영업력, 투자 감각이 강하게 살아납니다.
        
        부동산, 중개, 유통, 공동구매, 투자, 영업 분야에서 기회를 잘 포착하는 편입니다.
        
        다만 돈의 흐름을 크게 보려는 성향이 강해 무리한 확장이나 충동 투자는 주의가 필요합니다.
        `,
        
            "경-정재": `
        💎 경금 + 정재 조합
        
        현실 판단력이 강한 경금에 정재가 붙으면 돈을 지키고 관리하는 능력이 좋아집니다.
        
        자산관리, 부동산 관리, 임대수익, 금융, 회계, 계약 관리와 잘 맞습니다.
        
        큰 모험보다 안정적인 수익 구조를 만들 때 재물운이 좋아집니다.
        `,
        
            "경-정관": `
        💎 경금 + 정관 조합
        
        경금의 결단력에 정관의 책임감이 더해진 조합입니다.
        
        관리자, 공직, 조직관리, 법률, 행정, 책임 있는 직책에서 강점이 나타납니다.
        
        원칙과 기준이 강한 만큼 너무 딱딱해 보이지 않도록 유연한 소통이 필요합니다.
        `,
        
            "경-편관": `
        💎 경금 + 편관 조합
        
        강한 추진력과 위기 대응력이 있는 조합입니다.
        
        경쟁이 있는 시장, 영업관리, 현장관리, 위기관리, 성과형 업무에서 능력이 살아납니다.
        
        다만 스트레스와 압박을 혼자 떠안기 쉬우므로 체력 관리가 중요합니다.
        `,
        
            "갑-정관": `
        💎 갑목 + 정관 조합
        
        큰 나무 같은 갑목에 정관이 붙으면 책임감과 리더십이 강하게 드러납니다.
        
        공공기관, 교육, 관리자, 조직운영, 자격 기반 직업과 잘 맞습니다.
        
        명예와 원칙을 중요하게 보지만, 지나친 부담감은 내려놓는 것이 좋습니다.
        `,
        
            "갑-편재": `
        💎 갑목 + 편재 조합
        
        성장 욕구가 강한 갑목에 편재가 붙으면 사업 확장력과 기회 포착 능력이 좋아집니다.
        
        부동산, 유통, 영업, 사업, 투자, 사람을 연결하는 분야와 잘 맞습니다.
        
        다만 너무 큰 그림만 보다가 세부 관리가 약해질 수 있어 실행 계획이 중요합니다.
        `,
        
            "을-정재": `
        💎 을목 + 정재 조합
        
        섬세한 을목에 정재가 붙으면 꼼꼼한 재물관리와 안정적인 생활력이 강해집니다.
        
        고객관리, 상담, 서비스, 회계, 사무관리, 안정적인 수익 구조와 잘 맞습니다.
        
        다만 지나치게 안정만 추구하면 기회를 놓칠 수 있습니다.
        `,
        
            "병-상관": `
        💎 병화 + 상관 조합
        
        밝은 병화에 상관이 붙으면 표현력, 콘텐츠 감각, 말솜씨가 강하게 살아납니다.
        
        강의, 방송, 유튜브, 릴스, 마케팅, 광고, 콘텐츠 제작 분야와 잘 맞습니다.
        
        다만 말이 앞서거나 감정 표현이 강해질 수 있으니 표현의 수위를 조절해야 합니다.
        `,
        
            "정-정인": `
        💎 정화 + 정인 조합
        
        섬세한 정화에 정인이 붙으면 배움, 상담, 감성적 통찰력이 강해집니다.
        
        상담, 교육, 복지, 심리, 글쓰기, 연구, 자격증 기반 직업과 잘 맞습니다.
        
        다만 생각과 준비가 많아 실행이 늦어질 수 있으니 작은 실행이 필요합니다.
        `,
        
            "무-정재": `
        💎 무토 + 정재 조합
        
        묵직한 무토에 정재가 붙으면 자산을 안정적으로 쌓고 지키는 힘이 강합니다.
        
        부동산, 토지, 임대관리, 자산관리, 회계, 안정형 사업과 잘 맞습니다.
        
        큰 변화보다는 꾸준히 쌓아가는 방식에서 재물운이 좋아집니다.
        `,
          
    };
  
    return (
      comboDB[comboKey] ||
      `
  💎 일간 + 십성 조합 분석
  
  ${dayMasterTitle} 일간과 ${monthTenGod} 십성이 함께 작용합니다.
  
  이 조합은 사회생활, 직업운, 재물운의 방향을 판단할 때 중요하게 참고할 수 있습니다.
  `
    );
  }

  export function getTenGodComboStory(
    mainTenGod: string,
    subTenGod: string,
    dayStem: string,
    strengthType: string,
    gyeokguk: string,
    yongsin: string
  ): string {
    const key = `${mainTenGod}+${subTenGod}`;
  
    const comboStoryDB: Record<string, string> = {
      "비견+편재": `
  ${dayStem} 일간에게 비견과 편재가 함께 작용하면, 자기 힘으로 기회를 만들고 돈의 흐름을 직접 움직이려는 성향이 강합니다.
  
  이 조합은 남이 만들어준 자리보다 스스로 사람을 만나고, 거래를 만들고, 수익 구조를 설계할 때 재능이 살아납니다.
  
  ${strengthType} 흐름에서는 자신감이 장점이 되지만, 지나치면 무리한 확장이나 독단적 판단으로 이어질 수 있습니다.
  
  ${gyeokguk} 구조와 연결되면 부동산, 영업, 중개, 투자, 유통, 사업 확장형 분야에서 강점이 나타납니다.
  
  용신이 ${yongsin}으로 작용할 때는 사람과 자본을 연결하는 능력이 재물운의 핵심이 됩니다.
  `,
  
      "식신+정재": `
  ${dayStem} 일간에게 식신과 정재가 함께 작용하면, 재능을 꾸준히 현실 수입으로 바꾸는 힘이 강합니다.
  
  한 번에 크게 벌기보다 실력, 기술, 서비스, 콘텐츠를 반복적으로 제공하면서 안정적인 재물을 쌓는 구조입니다.
  
  ${strengthType} 흐름에서는 성실함과 반복력이 장점이 되지만, 변화 대응이 늦어지면 성장 속도가 느려질 수 있습니다.
  
  ${gyeokguk} 구조와 연결되면 교육, 상담, 관리, 서비스, 부동산 관리, 실무형 컨설팅에서 좋은 흐름이 생깁니다.
  
  용신이 ${yongsin}으로 작용할 때는 자신의 재능을 체계화하고 상품화하는 것이 중요합니다.
  `,
  
      "정관+정인": `
  ${dayStem} 일간에게 정관과 정인이 함께 작용하면, 원칙과 학습 능력, 책임감이 함께 살아납니다.
  
  이 조합은 단기 승부보다 신뢰, 자격, 명예, 평판을 쌓아가며 안정적으로 성장하는 구조입니다.
  
  ${strengthType} 흐름에서는 지나치게 보수적이거나 조심스러워질 수 있지만, 실력과 원칙을 함께 갖추면 사회적으로 인정받는 위치에 오르기 쉽습니다.
  
  ${gyeokguk} 구조와 연결되면 교육, 행정, 공공기관, 자격 전문직, 상담, 관리직과 잘 맞습니다.
  
  용신이 ${yongsin}으로 작용할 때는 배움과 신뢰가 결국 재물과 명예로 연결됩니다.
  `,
  "비견+정관": `
  ${dayStem} 일간에게 비견과 정관이 함께 작용하면, 자기 주도성과 사회적 책임감이 동시에 살아납니다.
  
  이 조합은 혼자 움직이는 힘도 있지만, 완전히 자유로운 구조보다는 일정한 규칙과 책임 안에서 실력을 인정받을 때 더 큰 성과가 납니다.
  
  ${strengthType} 흐름에서는 고집과 원칙이 부딪힐 수 있으므로, 자기 기준을 지키되 조직과 사람의 기준도 함께 조율하는 능력이 중요합니다.
  
  ${gyeokguk} 구조와 연결되면 관리자, 자격 전문직, 공공성 있는 업무, 법률·행정·교육·조직관리 분야에서 장점이 나타날 수 있습니다.
  
  용신이 ${yongsin}으로 작용할 때는 자신의 독립성을 사회적 신뢰로 바꾸는 것이 핵심입니다.
  `,  
    };

    return (
      comboStoryDB[key] ||
      `
  ${dayStem} 일간에게 ${mainTenGod}과 ${subTenGod}이 함께 작용하면, 단순한 성격 해석보다 인생의 방향성이 입체적으로 드러납니다.
  
  ${mainTenGod}은 기본적인 행동 방식과 삶의 태도를 만들고, ${subTenGod}은 그것이 현실에서 어떤 방식으로 표현되는지를 보여줍니다.
  
  ${strengthType} 흐름과 ${gyeokguk} 구조를 함께 보면, 이 사람은 직업 선택, 인간관계, 재물 흐름에서 고유한 패턴을 가집니다.
  
  용신이 ${yongsin}으로 작용할 때는 부족한 균형을 보완하면서 장점을 현실적인 성과로 바꾸는 것이 중요합니다.
  `
    ).trim();
  }  