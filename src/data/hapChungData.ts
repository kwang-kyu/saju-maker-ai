export function getBranch(ganZhi: string): string {
    const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  
    return branches.find((b) => String(ganZhi).includes(b)) || "";
  }
  export const relationMap: Record<string, string[]> = {
    합: ["자축", "인해", "묘술", "진유", "사신", "오미"],
    충: ["자오", "축미", "인신", "묘유", "진술", "사해"],
    형: ["인사신", "축술미", "자묘", "진진", "오오", "유유", "해해"],
    파: ["자유", "축진", "인해", "묘오", "사신", "술미"],
    해: ["자미", "축오", "인사", "묘진", "신해", "유술"],
  };
  export type RelationDetail = {
    type: string;
    title: string;
    text: string;
  };
  export const relationDetailMap: Record<string, RelationDetail> = {
    자축: { type: "합", title: "자축합", text: "현실적 결속과 안정, 은근한 협력의 흐름이 있습니다." },
    인해: { type: "합", title: "인해합", text: "성장, 학습, 귀인, 도움을 통해 운이 열리는 구조입니다." },
    묘술: { type: "합", title: "묘술합", text: "인기, 표현력, 관계 형성에서 기회가 생길 수 있습니다." },
    진유: { type: "합", title: "진유합", text: "계약, 문서, 재물, 실속 관리와 인연이 있습니다." },
    사신: { type: "합", title: "사신합", text: "기술, 이동, 변화, 활동성이 강하게 나타날 수 있습니다." },
    오미: { type: "합", title: "오미합", text: "열정과 현실 성과를 함께 만드는 흐름입니다." },
  
    오자: { type: "충", title: "자오충", text: "감정과 현실 판단이 부딪히기 쉬워 관계 기록을 조심해야 합니다." },
    미축: { type: "충", title: "축미충", text: "가족, 부동산, 재물 흐름에서 변화가 생기기 쉽습니다." },
    신인: { type: "충", title: "인신충", text: "이동, 직업 변화, 활동 범위 확장이 강하게 나타날 수 있습니다." },
    유묘: { type: "충", title: "묘유충", text: "인간관계, 평판, 구설, 감정 충돌에 주의가 필요합니다." },
    술진: { type: "충", title: "진술충", text: "부동산, 가족, 재산, 조직 내 변화와 연결될 수 있습니다." },
    해사: { type: "충", title: "사해충", text: "내면 갈등, 건강, 이동 변수, 생활 리듬 변화를 조심해야 합니다." },
  
    인사: { type: "형", title: "인사형", text: "성급한 추진과 감정 충돌을 조심해야 합니다." },
    신사: { type: "형", title: "사신형", text: "관계 긴장, 이동 중 변수, 일 처리 충돌이 생길 수 있습니다." },
    술축: { type: "형", title: "축술형", text: "고집, 가족 문제, 재산 문제를 현실적으로 조율해야 합니다." },
    미술: { type: "형", title: "술미형", text: "부동산, 가족관계, 생활 기반 점검이 필요합니다." },
    묘자: { type: "형", title: "자묘형", text: "감정 표현과 이성관계에서 오해가 생기지 않게 해야 합니다." },
  
    유자: { type: "파", title: "자유파", text: "약속 변동, 관계 균열, 신뢰 문제를 주의해야 합니다." },
    진축: { type: "파", title: "축진파", text: "가족·재물·생활 기반에서 작은 불편이 누적될 수 있습니다." },
    오묘: { type: "파", title: "묘오파", text: "감정 기복, 평판, 말로 인한 오해를 조심해야 합니다." },
  
    미자: { type: "해", title: "자미해", text: "가족 간 오해와 감정 소모를 조심해야 합니다." },
    오축: { type: "해", title: "축오해", text: "재물과 건강 관리에서 무리한 부담을 피해야 합니다." },
    진묘: { type: "해", title: "묘진해", text: "문서, 계약, 평판 관리가 중요합니다." },
    술유: { type: "해", title: "유술해", text: "관계 단절, 구설, 신뢰 문제를 조심해야 합니다." },
  };
  export function makeKey(a: string, b: string): string {
    return [a, b].sort().join("");
  }
  export function buildRelationText(
    a: { name: string; branch: string; meaning: string },
    b: { name: string; branch: string; meaning: string },
    relation: RelationDetail
  ): string {
    return `${a.name}(${a.branch}) ↔ ${b.name}(${b.branch})
  - 작용: ${relation.title} / ${relation.type}
  - 의미: ${a.meaning} + ${b.meaning}
  - 개인화 해석: ${a.meaning} 영역과 ${b.meaning} 영역이 연결되어 ${relation.text}`;
}
export type HapChungPillar = {
    name: string;
    branch: string;
    meaning: string;
  };
  
  export function findHapChungRelations(pillars: HapChungPillar[]): string[] {
    const found: string[] = [];
  
    for (let i = 0; i < pillars.length; i++) {
      for (let j = i + 1; j < pillars.length; j++) {
        const a = pillars[i];
        const b = pillars[j];
        const relation = relationDetailMap[makeKey(a.branch, b.branch)];
  
        if (relation) {
          found.push(buildRelationText(a, b, relation));
        }
      }
    }
  
    return found;
  } 
  export function createHapChungPillars(
    yearGanZhi: string,
    monthGanZhi: string,
    dayGanZhi: string,
    timeGanZhi: string
  ): HapChungPillar[] {
    return [
      {
        name: "년지",
        branch: getBranch(yearGanZhi),
        meaning: "초년·부모·가문",
      },
      {
        name: "월지",
        branch: getBranch(monthGanZhi),
        meaning: "직업·사회생활·핵심 기반",
      },
      {
        name: "일지",
        branch: getBranch(dayGanZhi),
        meaning: "배우자·내면·생활 중심",
      },
      {
        name: "시지",
        branch: getBranch(timeGanZhi),
        meaning: "자녀·노년·미래 방향",
      },
    ].filter((p) => p.branch);
  }  
  export function buildBranchSummary(pillars: HapChungPillar[]): string {
    return pillars.map((p) => `${p.name}:${p.branch}`).join(" / ");
  } 
  export const dayStemPersonalMap: Record<string, string> = {
    갑: "갑목 일간은 성장과 확장의 기운이 강하므로, 변화가 올 때 새로운 기회를 만드는 쪽으로 작용하기 쉽습니다.",
    을: "을목 일간은 유연성과 적응력이 강하므로, 변화가 와도 사람과 환경에 맞춰 길을 찾는 힘이 있습니다.",
    병: "병화 일간은 표현력과 존재감이 강하므로, 변화가 올 때 사람 앞에 드러나는 역할이 커질 수 있습니다.",
    정: "정화 일간은 집중력과 섬세함이 강하므로, 변화가 와도 한 분야를 깊게 다듬는 방식으로 운이 열립니다.",
    무: "무토 일간은 책임감과 중심 잡는 힘이 강하므로, 변화 속에서도 현실 기반을 지키는 역할이 중요합니다.",
    기: "기토 일간은 실속과 관리 능력이 강하므로, 변화가 올 때 생활과 재물의 균형을 조정하는 힘이 필요합니다.",
    경: "경금 일간은 결단력과 정리 능력이 강하므로, 변화가 올 때 끊고 맺는 판단이 운을 좌우합니다.",
    신: "신금 일간은 분석력과 완성도가 강하므로, 변화 속에서도 기준을 세우고 품질을 높이는 역할이 중요합니다.",
    임: "임수 일간은 흐름을 읽는 힘과 확장성이 강하므로, 변화가 올 때 정보와 이동을 활용하면 유리합니다.",
    계: "계수 일간은 직관과 섬세한 관찰력이 강하므로, 변화가 올 때 작은 신호를 먼저 읽는 것이 중요합니다.",
  };
  export function getPersonalizedHapChungText(
    dayStem: string,
    gyeokguk: string,
    strongest: { name: string },
    weakest: { name: string },
    dayStrengthAnalysis: { strengthType: string }
  ): string {
    if (
      dayStem === "갑" &&
      gyeokguk.includes("편재") &&
      dayStrengthAnalysis.strengthType.includes("신강")
    ) {
      return `
  갑목 일간이 편재격으로 흐르면서 신강한 구조입니다.
  기회를 포착하고 사람과 정보를 연결하는 능력이 뛰어납니다.
  부동산·중개·영업·사업 분야에서 성과를 내기 쉬운 구조입니다.
  `;
    }
  
    if (
      dayStem === "신" &&
      gyeokguk.includes("정인")
    ) {
      return `
  신금 일간이 정인격으로 흐르는 구조입니다.
  분석력과 전문성이 강하며 경험과 지식이 쌓일수록 운이 안정됩니다.
  전문직·교육·연구·상담 분야와 인연이 깊습니다.
  `;
    }
  
    return `
  ${dayStemPersonalMap[dayStem] || `${dayStem} 일간은 자신의 기본 기질을 중심으로 변화를 받아들이는 구조입니다.`}
  
  이 사주는 ${gyeokguk}의 성향과 ${dayStrengthAnalysis.strengthType} 구조가 함께 작용합니다.
  
  강한 ${strongest.name} 기운은 장점으로 활용하되,
  부족한 ${weakest.name} 기운은 의식적으로 보완하는 것이 좋습니다.
  `;
  }
  export const relationAreaMap: Record<string, string[]> = {
    합: ["인맥", "계약", "협력", "귀인"],
    충: ["이동", "변화", "갈등", "재편"],
    형: ["책임", "압박", "법률", "건강"],
    파: ["금전", "관계", "계약", "재산"],
    해: ["오해", "구설", "심리", "인간관계"],
  };  
  export function estimateRelationAreasWhenNoRelation(
    gyeokguk: string,
    strongest: { name: string },
    weakest: { name: string },
    dayStrengthAnalysis: { strengthType: string }
  ): string[] {
    const areas: string[] = [];
  
    if (gyeokguk.includes("비견") || gyeokguk.includes("겁재")) {
      areas.push("경쟁", "독립", "인간관계", "재물 관리");
    }
  
    if (gyeokguk.includes("식신") || gyeokguk.includes("상관")) {
      areas.push("표현", "콘텐츠", "영업", "직업 변화");
    }
  
    if (gyeokguk.includes("편재") || gyeokguk.includes("정재")) {
      areas.push("수익", "계약", "사업", "현금흐름");
    }
  
    if (gyeokguk.includes("편관") || gyeokguk.includes("정관")) {
      areas.push("책임", "직장", "조직", "법적 문제");
    }
  
    if (gyeokguk.includes("편인") || gyeokguk.includes("정인")) {
      areas.push("학습", "문서", "자격", "도움");
    }
  
    if (dayStrengthAnalysis.strengthType.includes("신약")) {
      areas.push("협력", "체력 관리", "환경 안정");
    }
  
    if (dayStrengthAnalysis.strengthType.includes("신강")) {
      areas.push("주도권", "확장", "독립 결정");
    }
  
    if (strongest.name) {
      areas.push(`강한 ${strongest.name} 활용`);
    }
  
    if (weakest.name) {
      areas.push(`부족한 ${weakest.name} 보완`);
    }
  
    return [...new Set(areas)];
  }
  export function getHapChungEventText(
    relationNames: string[]
  ): string {
    const texts: string[] = [];
  
    relationNames.forEach((name) => {
      const detail = relationDetailMap[name];
  
      if (!detail) return;
  
      texts.push(`${detail.title}은(는) ${detail.text}`);
    });
  
    return texts.join("\n");
  }