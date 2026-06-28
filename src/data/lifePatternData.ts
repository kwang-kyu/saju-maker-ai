import { getGeokgukAdvancedAnalysis } from "./gyeokgukPersonalData";
import { getMoneyComboText } from "./moneyComboData";
import { getJobComboText } from "./jobComboData";
export function createDynamicLifePatternText(
  _name: string,
    dayMaster: string,
    geokguk: string,
    strengthType: string
  ): string {
    const normalizedDayMasterMap: Record<string, string> = {
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
    
    const normalizedDayMaster = normalizedDayMasterMap[dayMaster] ?? dayMaster;
    let strength = "";
    
    let health = "";
  
    switch(normalizedDayMaster){
  
      case "갑":
        strength = "개척정신과 추진력이 강합니다. 새로운 일을 시작하는 능력이 뛰어납니다.";
       
        health = "간, 근육, 눈 건강 관리가 중요합니다.";
        break;
  
      case "을":
        strength = "유연성과 적응력이 뛰어나며 사람을 연결하는 능력이 좋습니다.";
        
        health = "간, 혈액순환, 스트레스 관리가 중요합니다.";
        break;
  
      case "병":
        strength = "표현력과 리더십이 강합니다.";
        
        health = "심장, 혈압 관리가 필요합니다.";
        break;
  
      case "정":
        strength = "섬세함과 집중력이 강합니다.";
        
        health = "혈액순환, 신경계 관리가 필요합니다.";
        break;
  
      case "무":
        strength = "책임감과 현실감이 뛰어납니다.";
        
        health = "위장 관리가 중요합니다.";
        break;
  
      case "기":
        strength = "실속형 성향이며 관리 능력이 좋습니다.";
        
        health = "소화기 건강 관리가 필요합니다.";
        break;
  
      case "경":
        strength = "결단력과 실행력이 뛰어납니다.";
        
        health = "폐, 호흡기 관리가 중요합니다.";
        break;
  
      case "신":
        strength = "분석력과 완성도가 뛰어납니다.";
        
        health = "호흡기와 피부 관리가 중요합니다.";
        break;
  
      case "임":
        strength = "큰 흐름을 읽는 능력이 뛰어납니다.";
        
        health = "신장, 방광 관리가 중요합니다.";
        break;
  
      case "계":
        strength = "직관과 정보수집 능력이 뛰어납니다.";
        
        health = "신장과 냉증 관리가 중요합니다.";
        break;
    }
  
    const geokgukText = getGeokgukAdvancedAnalysis(geokguk);
    const moneyComboText = getMoneyComboText(
      normalizedDayMaster,
      geokguk,
      strengthType,
      "강한 오행",
      "부족한 오행"
    );
    
    const jobComboText = getJobComboText(
      normalizedDayMaster,
      geokguk,
      strengthType,
      "강한 오행",
      "부족한 오행"
    );
    const strengthText =
      strengthType.includes("신강")
        ? "신강 사주로 독립성과 추진력이 강하게 나타납니다. 다만 자기 확신이 강한 만큼 무리한 확장, 독단적 결정, 감정적인 밀어붙임은 조심해야 합니다."
        : "신약 신약 사주는 혼자 모든 책임을 떠안기보다 역할이 분명한 사람과 환경을 활용할 때 능력이 안정적으로 발휘됩니다. 모든 것을 직접 통제하려 하기보다 사람과 구조를 활용할 때 운의 흐름이 안정됩니다.";
     
    return `
    ■ 강점
    ${strength}
    ${strengthText}
    
    ■ 재물 성향

${moneyComboText}
    
■ 직업 성향
${jobComboText}
      ■ 인생 흐름 요약
    ${strengthType.includes("신강")
      ? "인생 전반은 스스로 방향을 정하고 밀고 나갈 때 성과가 커지는 흐름입니다. 다만 중요한 시기에는 속도 조절과 사람 관리가 필요합니다."
      : "인생 전반은 좋은 환경, 협력자, 시스템을 만났을 때 안정적으로 성장하는 흐름입니다. 혼자 모든 것을 감당하기보다 기반을 만드는 것이 중요합니다."}

    ■ 대운·세운 활용 방향
    ${geokguk} 구조에서는 대운과 세운이 들어올 때 재물, 직업, 인간관계 변화가 함께 움직일 가능성이 큽니다.
    좋은 운이 와도 준비된 구조가 없으면 기회를 놓칠 수 있고, 불리한 운이 와도 시스템과 기록을 갖추면 손실을 줄일 수 있습니다.
    ■ 건강 주의점
    ${health}
    ${strengthType.includes("신강") ? "기운이 강하게 몰릴 때는 과로, 열감, 혈압, 감정 폭발을 조심해야 합니다." : "기운이 약하게 흐를 때는 체력 저하, 소화력, 수면, 면역 관리가 중요합니다."}
    
    ■ 격국 분석
    ${geokgukText}
    `;
    }  

    export function createSummaryInsightText(params: {
      monthTenGod: string;
      timeTenGod: string;
      strongestName: string;
      dayMasterPersonality: string;
      dayMasterMoney: string;
      dayMasterJob: string;
      dayMasterWeakness: string;
    }) {
      const {
        monthTenGod,
        timeTenGod,
        strongestName,
        dayMasterPersonality,
        dayMasterMoney,
        dayMasterJob,
        dayMasterWeakness,
      } = params;
    
      const moneyTypeText =
        monthTenGod === "편재"
          ? "💰 사업형 재물운 (기회 포착형)"
          : monthTenGod === "정재"
          ? "💰 자산관리형 재물운 (안정 축적형)"
          : monthTenGod === "식신"
          ? "💰 생산형 재물운 (꾸준 수익형)"
          : monthTenGod === "상관"
          ? "💰 콘텐츠형 재물운 (아이디어 수익형)"
          : "💰 균형형 재물운";
    
      const loveTypeText =
        timeTenGod === "정관"
          ? "❤️ 책임감형 연애"
          : timeTenGod === "편관"
          ? "❤️ 강한 끌림형 연애"
          : timeTenGod === "정인"
          ? "❤️ 배려형 연애"
          : timeTenGod === "편인"
          ? "❤️ 감성형 연애"
          : "❤️ 현실형 연애";
    
      const realEstateTypeText =
        strongestName.includes("토")
          ? "🏢 부동산 적성 높음"
          : strongestName.includes("금")
          ? "🏢 부동산·중개 적성 높음"
          : "🏢 일반 수준";
    
      const businessTypeText =
        monthTenGod === "편재"
          ? "🚀 사업가형"
          : monthTenGod === "상관"
          ? "🚀 콘텐츠 사업형"
          : monthTenGod === "식신"
          ? "🚀 생산·제조형"
          : "🚀 안정 운영형";
    
      const finalSajuTypeText = (() => {
        if (monthTenGod === "편재" && realEstateTypeText.includes("부동산")) {
          return "🏆 부동산 사업가형 사주";
        }
    
        if (monthTenGod === "편재") {
          return "🏆 사업가형 사주";
        }
    
        if (monthTenGod === "정재" && strongestName.includes("토")) {
          return "🏆 자산관리·부동산형 사주";
        }
    
        if (monthTenGod === "정관") {
          return "🏆 공무원·관리자형 사주";
        }
    
        if (monthTenGod === "편관") {
          return "🏆 승부사·위기돌파형 사주";
        }
    
        if (monthTenGod === "상관") {
          return "🏆 콘텐츠·마케팅형 사주";
        }
    
        if (monthTenGod === "식신") {
          return "🏆 생산·창작형 사주";
        }
    
        if (monthTenGod === "정인" || monthTenGod === "편인") {
          return "🏆 상담·연구·지식형 사주";
        }
    
        return "🏆 균형 성장형 사주";
      })();
    
      const finalSajuTypeDescription = (() => {
        if (finalSajuTypeText.includes("부동산 사업가형")) {
          return `
    사람과 돈의 흐름을 읽는 능력이 강합니다.
    
    부동산, 중개, 투자, 개발, 자산관리 분야에서 강점을 보일 수 있습니다.
    
    특히 네트워크를 활용한 사업 모델과 잘 맞습니다.
    `;
        }
    
        if (finalSajuTypeText.includes("사업가형")) {
          return `
    기회를 포착하고 새로운 수익 구조를 만드는 능력이 강합니다.
    
    직장보다는 사업, 영업, 유통, 플랫폼 분야에서 능력이 크게 발휘될 수 있습니다.
    `;
        }
    
        return `
    균형 잡힌 성장형 사주입니다.
    
    한 분야에 치우치기보다 꾸준히 경험을 쌓을수록 운이 좋아지는 타입입니다.
    `;
      })();
    
      const threeYearForecastText = `
    📈 향후 3년 핵심 전망
    
    💰 재물운
    앞으로 3년은 수입을 늘리는 것보다 돈의 흐름을 정리하고 반복 수익 구조를 만드는 것이 중요합니다.
    특히 ${moneyTypeText} 성향이 있으므로 본인의 재물 방식에 맞는 수익 모델을 선택하는 것이 좋습니다.
    
    💼 직업운
    직업적으로는 ${dayMasterJob}
    이 방향과 연결된 분야에서 기회가 생길 수 있습니다.
    
    🚀 사업운
    ${businessTypeText} 성향이 있으므로 무리하게 크게 시작하기보다 작게 테스트하고 반응이 좋은 방향으로 확장하는 것이 좋습니다.
    `;
    
      return `
    🏆 최종 사주 타입
    ${finalSajuTypeText}
    ${finalSajuTypeDescription}
    ${threeYearForecastText}
    🎯 적중 포인트 요약
    
    👤 나는 이런 타입
    ${dayMasterPersonality}
    
    💰 돈 버는 방식
    ${dayMasterMoney}
    
    💼 직업 적성
    ${dayMasterJob}
    
    ❤️ 인간관계 주의점
    ${dayMasterWeakness}
    
    💰 돈복 유형
    ${moneyTypeText}
    
    ❤️ 연애 유형
    ${loveTypeText}
    
    🏢 부동산 적성
    ${realEstateTypeText}
    
    🚀 사업 적성
    ${businessTypeText}
    `;
    } 
    
    export function createSummaryAdviceText(params: {
      gyeokguk: string;
      strengthType: string;
      strongestName: string;
      weakestName: string;
    }): string {
      const { gyeokguk, strengthType, strongestName, weakestName } = params;
    
      const strengthAdvice =
        strengthType === "신강"
          ? "결정이 빠른 장점은 살리되, 큰 지출이나 확장은 한 번 더 검토한 뒤 실행하는 것이 좋습니다."
          : "혼자 모든 일을 떠안기보다 믿을 수 있는 사람, 제도, 시스템의 도움을 함께 활용하는 것이 좋습니다.";
    
      const gyeokgukAdvice =
        gyeokguk.includes("편재") || gyeokguk.includes("상관")
          ? "아이디어, 영업력, 사람을 연결하는 능력을 실제 수익 구조로 바꾸는 연습이 필요합니다."
          : "짧은 성과보다 신뢰, 반복, 꾸준함을 쌓는 방식이 장기적으로 더 큰 결과를 만듭니다.";
    
      return `
    <ol>
      <li><b>강점 활용:</b> 현재 ${gyeokguk}의 장점이 잘 드러나는 일과 환경에 집중하세요.</li>
      <li><b>기운 균형:</b> 강한 ${strongestName} 기운은 장점으로 쓰고, 부족한 ${weakestName} 기운은 생활 습관으로 보완하세요.</li>
      <li><b>판단 방식:</b> ${strengthAdvice}</li>
      <li><b>수익 연결:</b> ${gyeokgukAdvice}</li>
      <li><b>생활 실천:</b> 부족한 ${weakestName} 기운을 보완하는 공간, 색상, 사람, 루틴을 의식적으로 가까이 두세요.</li>
    </ol>
    `;
    }

    export function createLifeStoryText(params: {
      dayMaster: string;
      gyeokguk: string;
      strengthType: string;
      monthTenGod: string;
      strongestName: string;
    }): string {
      const { dayMaster, gyeokguk, strengthType, monthTenGod, strongestName } = params;
      const isStrong = strengthType.includes("신강");
    
      const twenties = isStrong
        ? `${dayMaster} 일간은 20대에 스스로 길을 찾고 직접 부딪히며 성장하는 흐름이 강합니다. 진로가 한 번에 고정되기보다 여러 경험을 거치며 자기 방식과 기준을 만들어갑니다.`
        : `${dayMaster} 일간은 20대에 혼자 밀어붙이기보다 환경과 사람의 영향을 크게 받습니다. 좋은 멘토, 안정적인 조직, 반복 가능한 생활 리듬을 만날수록 방향이 빨리 잡힙니다.`;
    
      const thirties =
        monthTenGod === "편재"
          ? `30대에는 사람과 돈의 흐름을 읽는 감각이 살아납니다. 영업, 중개, 투자, 사업, 유통처럼 기회를 포착하고 연결하는 일에서 재능이 드러나기 쉽습니다.`
          : monthTenGod === "정관"
          ? `30대에는 책임과 역할이 커지는 흐름입니다. 조직, 자격, 관리, 행정, 전문직 영역에서 신뢰를 쌓으며 사회적 위치를 만들어가기 좋습니다.`
          : monthTenGod === "식신"
          ? `30대에는 자신의 재능을 꾸준히 결과물로 만드는 시기입니다. 기술, 콘텐츠, 교육, 상담, 서비스처럼 반복해서 쌓이는 일이 재물과 연결됩니다.`
          : `30대에는 자신의 강점을 현실적인 성과로 바꾸는 흐름이 강해집니다. 직업 방향을 좁히고 전문성을 쌓을수록 운이 안정됩니다.`;
    
      const forties =
        gyeokguk.includes("편재")
          ? `40대에는 사업 확장, 자본 운용, 사람과 자원을 연결하는 능력이 본격적으로 재물과 연결될 수 있습니다. 다만 무리한 차입이나 감으로 하는 투자는 피해야 합니다.`
          : gyeokguk.includes("정관")
          ? `40대에는 신뢰와 평판이 자산이 됩니다. 책임 있는 자리, 관리자 역할, 자격 기반 전문 분야에서 안정적인 성과가 만들어질 가능성이 큽니다.`
          : gyeokguk.includes("식신")
          ? `40대에는 꾸준히 쌓아온 실력과 결과물이 수익 구조로 바뀌기 쉽습니다. 반복 생산, 교육, 상담, 콘텐츠, 서비스업에서 안정감이 커집니다.`
          : `40대에는 경험과 신뢰가 쌓이며 자신만의 전문 영역이 뚜렷해지는 시기입니다. 이때 만든 평판은 후반 인생의 중요한 자산이 됩니다.`;
    
          const later =
          strongestName.includes("토")
            ? `50대 이후에는 자산관리, 부동산, 임대, 상담, 조언자 역할이 강해질 수 있습니다. 직접 뛰는 일보다 경험과 신뢰를 활용한 관리형 수익 구조에서 재물운이 좋아집니다.`
            : strongestName.includes("금")
            ? `50대 이후에는 판단력, 계약 감각, 정리 능력이 강점으로 살아납니다. 중개, 컨설팅, 자문, 관리 분야에서 경험 자체가 재물이 될 수 있습니다.`
            : monthTenGod === "정관"
            ? `50대 이후에는 후배를 이끌고 조언하는 역할이 강해집니다. 책임감과 신뢰를 기반으로 교육, 상담, 지도자 역할에서 보람과 재물을 함께 얻을 수 있습니다.`
            : monthTenGod === "편재"
            ? `50대 이후에도 사람과 돈의 흐름을 읽는 감각이 살아 있습니다. 투자, 자산관리, 네트워크 사업, 부동산, 중개 분야에서 경험을 활용한 수익 구조를 만들 수 있습니다.`
            : `50대 이후에는 자신의 경험과 노하우를 교육, 상담, 관리, 조언자의 역할로 확장할 가능성이 큽니다. 직접 뛰기보다 경험을 전달하는 구조가 좋아집니다.`;
            const sixties =
            monthTenGod === "편재"
              ? `60대 이후에는 인맥과 경험이 재물로 연결되는 흐름입니다. 직접 사업보다 투자·자문·관리 역할이 유리합니다.`
              : monthTenGod === "정관"
              ? `60대 이후에는 사회적 신뢰와 경험을 바탕으로 조언자와 교육자의 역할이 강해집니다.`
              : `60대 이후에는 무리한 확장보다 건강과 경험을 활용한 안정적인 삶의 구조를 만드는 것이 중요합니다.`;
      return `
    ■ 인생 서사형 흐름
    
    ■ 20대
    ${twenties}
    
    ■ 30대
    ${thirties}
    
    ■ 40대
    ${forties}
    
    ■ 50대 이후
    ${later}

        ■ 60대 이후
    ${sixties}
    `;
    }
      