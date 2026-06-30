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
};

export const caseQuestions: CaseQuestion[] = [
  { key: "jobChange", label: "이직을 해도 괜찮을까요?" },
  { key: "businessStart", label: "사업을 시작해도 될까요?" },
  { key: "realEstateBuy", label: "부동산을 사도 될까요?" },
  { key: "investment", label: "지금 투자해도 될까요?" },
  { key: "marriagePrepare", label: "결혼을 준비해도 될까요?" },
  { key: "relationshipCleanUp", label: "인간관계를 정리해야 할까요?" },

  { key: "moneyTiming", label: "금전운은 언제부터 풀릴까요?" },
  { key: "stockInvestment", label: "주식 투자를 시작해도 될까요?" },
  { key: "businessExpand", label: "지금 사업을 확장해도 될까요?" },
  { key: "partnership", label: "동업을 해도 괜찮을까요?" },
  { key: "careerDirection", label: "앞으로 어떤 일을 하면 좋을까요?" },
  { key: "promotion", label: "승진이나 인정운이 있을까요?" },
  { key: "contract", label: "계약을 진행해도 괜찮을까요?" },
  { key: "houseMove", label: "이사를 해도 좋을까요?" },
  { key: "realEstateSell", label: "부동산을 팔아도 될까요?" },
  { key: "exam", label: "시험이나 자격증 운은 어떨까요?" },
  { key: "newRelationship", label: "새로운 인연이 들어올까요?" },
  { key: "marriageTiming", label: "결혼 시기는 언제가 좋을까요?" },
  { key: "remarriage", label: "재혼운은 어떨까요?" },
  { key: "children", label: "자녀운은 어떨까요?" },
  { key: "familyConflict", label: "가족 갈등은 어떻게 풀어야 할까요?" },
  { key: "healthCare", label: "건강에서 특히 조심할 점은 무엇인가요?" },
  { key: "legalIssue", label: "소송이나 분쟁은 어떻게 봐야 할까요?" },
  { key: "overseas", label: "해외 이동이나 장거리 이동은 괜찮을까요?" },
  { key: "importantChoice", label: "올해 가장 중요한 선택은 무엇일까요?" },
];
