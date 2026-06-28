export type CaseQuestionKey =
  | "jobChange"
  | "businessStart"
  | "realEstateBuy"
  | "investment"
  | "marriagePrepare"
  | "relationshipCleanUp";

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
];
