import { useState } from "react";
import { basicMapper } from "../services/basic/basicMapper";
import { getCaseConsulting } from "../services/case/caseConsulting";
import { caseQuestions } from "../services/case/caseQuestions";
import type { CaseQuestionKey } from "../services/case/caseQuestions";
import { getCaseSummary } from "../services/case/caseSummary";
import type { BasicSajuInput } from "../types/basic";

type CaseResultProps = BasicSajuInput;

export default function CaseResult(props: CaseResultProps) {
  const [selectedQuestion, setSelectedQuestion] =
    useState<CaseQuestionKey>("jobChange");

  const basic = basicMapper(props);
  const summary = getCaseSummary(props.name);
  const consulting = getCaseConsulting(basic, selectedQuestion);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 사안별 상담</h3>

      <h4>핵심 요약</h4>
      <p>{summary}</p>

      <h4>상담 질문 선택</h4>
      <div style={{ display: "grid", gap: "8px", marginBottom: "18px" }}>
        {caseQuestions.map((question) => (
          <button
            key={question.key}
            type="button"
            onClick={() => setSelectedQuestion(question.key)}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border:
                selectedQuestion === question.key
                  ? "2px solid #facc15"
                  : "1px solid #334155",
              background:
                selectedQuestion === question.key ? "#422006" : "#1e293b",
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
