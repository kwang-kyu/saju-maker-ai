export type CaseCategoryKey =
  | "wealth"
  | "job"
  | "business"
  | "realEstate"
  | "loveMarriage"
  | "relationship"
  | "health"
  | "life";

export type CaseQuestionKey =
  | "jobChange"
  | "businessStart"
  | "realEstateBuy"
  | "investment"
  | "marriagePrepare"
  | "relationshipCleanUp"
  | "moneyTiming"
  | "stockInvestment"
  | "businessExpand"
  | "partnership"
  | "careerDirection"
  | "promotion"
  | "contract"
  | "houseMove"
  | "realEstateSell"
  | "exam"
  | "newRelationship"
  | "marriageTiming"
  | "remarriage"
  | "children"
  | "familyConflict"
  | "healthCare"
  | "legalIssue"
  | "overseas"
  | "importantChoice";

export type CaseQuestion = {
  key: CaseQuestionKey;
  label: string;
  category: CaseCategoryKey;
};

export type CaseCategory = {
  key: CaseCategoryKey;
  label: string;
  description: string;
};

export const caseCategories: CaseCategory[] = [
  { key: "wealth", label: "📈 재테크 상담", description: "투자, 주식, 금전 흐름, 자산관리 방향을 봅니다." },
  { key: "job", label: "💼 직업 상담", description: "이직, 승진, 직무, 앞으로의 일 방향을 봅니다." },
  { key: "business", label: "🏢 사업 상담", description: "창업, 확장, 동업, 계약과 사업 판단을 봅니다." },
  { key: "realEstate", label: "🏠 부동산 상담", description: "매수, 매도, 이사, 부동산 흐름을 봅니다." },
  { key: "loveMarriage", label: "❤️ 연애결혼 상담", description: "인연, 결혼, 재혼, 자녀 흐름을 봅니다." },
  { key: "relationship", label: "👨‍👩‍👧 인간관계 상담", description: "가족, 사람 문제, 갈등 정리를 봅니다." },
  { key: "health", label: "🏥 건강 상담", description: "건강관리와 조심해야 할 생활 리듬을 봅니다." },
  { key: "life", label: "⭐ 인생 방향 상담", description: "올해 중요한 선택과 인생 방향을 봅니다." },
];

export const caseQuestions: CaseQuestion[] = [
  { key: "investment", category: "wealth", label: "지금 제 사주에서는 투자를 시작해도 될까요?" },
  { key: "moneyTiming", category: "wealth", label: "금전 흐름은 언제부터 안정될까요?" },
  { key: "stockInvestment", category: "wealth", label: "지금 제 사주에서는 주식 투자가 맞을까요?" },

  { key: "jobChange", category: "job", label: "지금 이직을 해도 괜찮을까요?" },
  { key: "careerDirection", category: "job", label: "앞으로 어떤 일을 하면 제 사주에 잘 맞을까요?" },
  { key: "promotion", category: "job", label: "승진이나 인정운이 들어오는 흐름인가요?" },
  { key: "exam", category: "job", label: "시험이나 자격증 준비는 제게 맞을까요?" },

  { key: "businessStart", category: "business", label: "지금 사업을 시작해도 될까요?" },
  { key: "businessExpand", category: "business", label: "지금 사업을 확장해도 될까요?" },
  { key: "partnership", category: "business", label: "제 사주에는 동업이 맞을까요?" },
  { key: "contract", category: "business", label: "계약을 진행해도 괜찮을까요?" },

  { key: "realEstateBuy", category: "realEstate", label: "지금 부동산을 매수해도 될까요?" },
  { key: "realEstateSell", category: "realEstate", label: "지금 부동산을 매도해도 될까요?" },
  { key: "houseMove", category: "realEstate", label: "이사를 해도 좋은 흐름인가요?" },

  { key: "marriagePrepare", category: "loveMarriage", label: "지금 결혼을 준비해도 될까요?" },
  { key: "newRelationship", category: "loveMarriage", label: "새로운 인연이 들어올까요?" },
  { key: "marriageTiming", category: "loveMarriage", label: "결혼 시기는 언제가 좋을까요?" },
  { key: "remarriage", category: "loveMarriage", label: "재혼운은 어떻게 봐야 할까요?" },
  { key: "children", category: "loveMarriage", label: "자녀운은 어떨까요?" },

  { key: "relationshipCleanUp", category: "relationship", label: "인간관계를 정리해야 할까요?" },
  { key: "familyConflict", category: "relationship", label: "가족 갈등은 어떻게 풀어야 할까요?" },

  { key: "healthCare", category: "health", label: "건강에서 특히 조심할 점은 무엇인가요?" },

  { key: "legalIssue", category: "life", label: "소송이나 분쟁은 어떻게 봐야 할까요?" },
  { key: "overseas", category: "life", label: "해외 이동이나 장거리 이동은 괜찮을까요?" },
  { key: "importantChoice", category: "life", label: "올해 가장 중요한 선택은 무엇일까요?" },
];
