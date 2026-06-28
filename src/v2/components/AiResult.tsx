import { useState } from "react";
import { basicMapper } from "../services/basic/basicMapper";
import { getAiConsulting } from "../services/ai/aiConsulting";
import { getAiSummary } from "../services/ai/aiSummary";
import type { BasicSajuInput } from "../types/basic";

type AiResultProps = BasicSajuInput;

export default function AiResult(props: AiResultProps) {
  const [concern, setConcern] = useState("");
  const [submittedConcern, setSubmittedConcern] = useState("");

  const basic = basicMapper(props);
  const summary = getAiSummary(props.name);
  const consulting = getAiConsulting(basic, submittedConcern);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>🤖 AI 종합상담</h2>

      <div
        style={{
          padding: "18px",
          border: "1px solid #334155",
          borderRadius: "14px",
          background: "#020617",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>현재 고민을 입력하세요</h3>
        <p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
          예: 창업해도 될까요? 올해 이직해도 될까요? 지금 부동산을 매수해도 될까요?
        </p>

        <textarea
          value={concern}
          onChange={(event) => setConcern(event.target.value)}
          placeholder="지금 가장 고민되는 내용을 적어주세요."
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
          }}
        />

        <button
          type="button"
          onClick={() => setSubmittedConcern(concern)}
          style={{
            marginTop: "12px",
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #7c3aed, #ec4899)",
            color: "#ffffff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          AI 상담 시작
        </button>
      </div>

      <div
        style={{
          padding: "16px",
          border: "1px solid #334155",
          borderRadius: "14px",
          background: "#1e293b",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>✔ 핵심 요약</h3>
        <p style={{ lineHeight: 1.8 }}>{summary}</p>
      </div>

      <div
        style={{
          padding: "18px",
          border: "1px solid #334155",
          background: "#111827",
        }}
      >
        <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, margin: 0 }}>
          {consulting}
        </pre>
      </div>
    </div>
  );
}
