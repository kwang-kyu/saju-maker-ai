import { useState } from "react";
import { basicMapper } from "../services/basic/basicMapper";
import { getCaseConsulting } from "../services/case/caseConsulting";
import { caseCategories, caseQuestions } from "../services/case/caseQuestions";
import type { CaseCategoryKey } from "../services/case/caseQuestions";
import { getCaseSummary } from "../services/case/caseSummary";
import type { BasicSajuInput } from "../types/basic";

type CaseResultProps = BasicSajuInput;

type CaseChatMessage = {
  question: string;
  answer: string;
};

function buildCaseQuestionContext(
  categoryLabel: string,
  history: CaseChatMessage[],
  question: string
) {
  const recentHistory = history.slice(-5);

  if (!recentHistory.length) {
    return `[상담 분야: ${categoryLabel}]
${question}`;
  }

  const historyText = recentHistory
    .map(
      (item, index) =>
        `[이전 주제별 상담 ${index + 1}]
질문: ${item.question}
답변 요약: ${item.answer.slice(0, 220)}`
    )
    .join("\n\n");

  return `
[상담 분야: ${categoryLabel}]

[이전 상담 흐름]
${historyText}

[현재 질문]
${question}

위 이전 상담은 참고만 하고, 반드시 현재 질문에 직접 답변하세요.
현재 질문과 관련 없는 내용은 반복하지 마세요.
답변 첫 문단은 현재 질문에 대한 결론부터 말하세요.
`.trim();
}

export default function CaseResult(props: CaseResultProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<CaseCategoryKey>("wealth");
  const [questionText, setQuestionText] = useState("");
  const [chatHistory, setChatHistory] = useState<CaseChatMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");

  const basic = basicMapper(props);
  const summary = getCaseSummary(props.name);

  const selectedCategoryInfo =
    caseCategories.find((category) => category.key === selectedCategory) ??
    caseCategories[0];

  const filteredQuestions = caseQuestions.filter(
    (question) => question.category === selectedCategory
  );

  const consulting = currentAnswer;

  const handleSubmit = () => {
    const question = questionText.trim();

    if (!question) return;

    const contextQuestion = buildCaseQuestionContext(
      selectedCategoryInfo.label,
      chatHistory,
      question
    );
    const answer = getCaseConsulting(basic, contextQuestion);

    setChatHistory((prev) => [
      ...prev,
      {
        question,
        answer,
      },
    ]);
    setCurrentAnswer(answer);
    setQuestionText("");
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 주제별 상담</h3>

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
              setQuestionText("");
              setChatHistory([]);
              setCurrentAnswer("");
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

      <h4>2단계. 상담 질문 직접 입력</h4>
      <p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
        아래 예시를 참고해도 되고, 지금 궁금한 내용을 직접 적어도 됩니다.
      </p>

      <div style={{ display: "grid", gap: "8px", marginBottom: "14px" }}>
        {filteredQuestions.map((question) => (
          <button
            key={question.key}
            type="button"
            onClick={() => setQuestionText(question.label)}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #334155",
              background: "#1e293b",
              color: "#f8fafc",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            {question.label}
          </button>
        ))}
      </div>

      <textarea
        value={questionText}
        onChange={(event) => setQuestionText(event.target.value)}
        placeholder="예: 재혼하면 자녀 문제는 어떻게 봐야 하나요?"
        style={{
          width: "100%",
          minHeight: "100px",
          boxSizing: "border-box",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid #475569",
          background: "#0f172a",
          color: "#ffffff",
          lineHeight: 1.7,
          resize: "vertical",
          marginBottom: "12px",
        }}
      />

      <button
        type="button"
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          background: "linear-gradient(135deg, #f59e0b, #ef4444)",
          color: "#ffffff",
          fontWeight: 800,
          cursor: "pointer",
          marginBottom: "18px",
        }}
      >
        {chatHistory.length ? "이어서 주제별 상담하기" : "주제별 상담 시작"}
      </button>

      {chatHistory.length > 0 && (
        <div
          style={{
            padding: "16px",
            border: "1px solid #334155",
            borderRadius: "14px",
            background: "#0f172a",
            marginBottom: "16px",
          }}
        >
          <h4 style={{ marginTop: 0 }}>💬 주제별 상담 기록</h4>
          {chatHistory.map((item, index) => (
            <div
              key={`${item.question}-${index}`}
              style={{
                padding: "12px",
                borderRadius: "12px",
                background: "#1e293b",
                marginTop: "10px",
              }}
            >
              <strong>Q{index + 1}. {item.question}</strong>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.8,
                  margin: "10px 0 0",
                  color: "#e5e7eb",
                }}
              >
                A{index + 1}. {item.answer}
              </pre>
            </div>
          ))}
        </div>
      )}

      {consulting && (
        <>
          <h4>원장님 상담</h4>
          <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
            {consulting}
          </p>
        </>
      )}
    </div>
  );
}


