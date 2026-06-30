import { useState } from "react";
import { basicMapper } from "../services/basic/basicMapper";
import { getCaseConsulting } from "../services/case/caseConsulting";
import { caseCategories, caseQuestions } from "../services/case/caseQuestions";
import type { CaseCategoryKey, CaseQuestionKey } from "../services/case/caseQuestions";
import { getCaseSummary } from "../services/case/caseSummary";
import type { BasicSajuInput } from "../types/basic";

type CaseResultProps = BasicSajuInput;

export default function CaseResult(props: CaseResultProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<CaseCategoryKey>("wealth");
  const [selectedQuestion, setSelectedQuestion] =
    useState<CaseQuestionKey>("investment");

  const basic = basicMapper(props);
  const summary = getCaseSummary(props.name);
  const consulting = getCaseConsulting(basic, selectedQuestion);

  const filteredQuestions = caseQuestions.filter(
    (question) => question.category === selectedCategory
  );

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 사안별 상담</h3>

      <h4>핵심 요약</h4>
      <p>{summary}</p>

      <h4>1단계. 상담 분야 선택</h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        {caseCategories.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => {
              setSelectedCategory(category.key);
              const firstQuestion = caseQuestions.find(
                (question) => question.category === category.key
              );
              if (firstQuestion) {
                setSelectedQuestion(firstQuestion.key);
              }
            }}
            style={{
              padding: "13px 14px",
              borderRadius: "14px",
              border:
                selectedCategory === category.key
                  ? "2px solid #facc15"
                  : "1px solid #334155",
              background:
                selectedCategory === category.key ? "#422006" : "#1e293b",
              color: "#f8fafc",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <strong style={{ display: "block", marginBottom: "6px" }}>
              {category.label}
            </strong>
            <span style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.5 }}>
              {category.description}
            </span>
          </button>
        ))}
      </div>

      <h4>2단계. 세부 질문 선택</h4>
      <div style={{ display: "grid", gap: "8px", marginBottom: "18px" }}>
        {filteredQuestions.map((question) => (
          <button
            key={question.key}
            type="button"
            onClick={() => setSelectedQuestion(question.key)}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border:
                selectedQuestion === question.key
                  ? "2px solid #38bdf8"
                  : "1px solid #334155",
              background:
                selectedQuestion === question.key ? "#082f49" : "#1e293b",
              color: "#f8fafc",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            {question.label}
          </button>
        ))}
      </div>

      <h4>원장님 상담</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consulting}
      </p>
    </div>
  );
}
