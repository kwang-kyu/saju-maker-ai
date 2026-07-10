import { useState } from "react";
import { basicMapper } from "../services/basic/basicMapper";
import { runConsultingPipeline } from "../services/ai/consultingPipeline";
import type { BasicSajuInput } from "../types/basic";

type AiResultProps = BasicSajuInput;

type ChatMessage = {
  question: string;
  answer: string;
};

function buildChatContext(history: ChatMessage[], question: string) {
  const recentHistory = history.slice(-5);

  if (!recentHistory.length) {
    return question;
  }

  const historyText = recentHistory
    .map(
      (item, index) =>
        `[이전 상담 ${index + 1}]
질문: ${item.question}
답변 요약: ${item.answer.slice(0, 800)}`
    )
    .join("\n\n");

  return `
[이전 상담 흐름]
${historyText}

[현재 추가 질문]
${question}

위 이전 상담 흐름을 이어받아 같은 말을 반복하지 말고, 현재 추가 질문에 맞춰 연속 상담처럼 답변하세요.
`.trim();
}

function buildConsultingPrompt(params: {
  name: string;
  question: string;
  pipelineResult: ReturnType<typeof runConsultingPipeline>;
}) {
  const { name, question, pipelineResult } = params;

  const executedCoreResults = pipelineResult.executedCores
    .filter(
      (core) =>
        core.status === "executed" &&
        core.result !== undefined
    )
    .map((core) => ({
      coreName: core.coreName,
      result: core.result,
    }));

  return `
[상담 대상]
이름: ${name}

[사용자의 질문과 대화 흐름]
${question}

[질문 분석]
의도: ${pipelineResult.intent}
필요 판단 영역: ${pipelineResult.requiredCores.join(", ")}

[실제 사주 판단 자료]
${JSON.stringify(executedCoreResults, null, 2)}

위 자료를 서로 비교하여 사용자가 지금 물어본 질문에 직접 답하세요.

각 판단 자료의 문장을 순서대로 나열하거나 그대로 복사하지 마세요.
부분 판단 중 서로 충돌하는 내용이 있다면, 실제 결정에 더 중요한 근거가 무엇인지 판단하세요.

미리 정해진 결론 표현을 선택하지 말고 이 사람의 사주 자료와 현재 질문에 맞는 결론을 새롭게 만드세요.

사용자가 답변을 읽고 다음 내용을 분명히 알 수 있어야 합니다.

- 지금 해야 하는지 하지 말아야 하는지
- 바로 움직여도 되는지 먼저 준비해야 하는지
- 어떤 방식으로 진행해야 하는지
- 무엇이 가장 큰 위험인지
- 지금 실제로 취해야 할 행동이 무엇인지

대운이나 세운 자료가 포함되지 않았다면 특정 연도와 월을 임의로 만들어 단정하지 마세요.
보고서처럼 항목별 자료를 읽어주지 말고 실제 대화형 상담으로 답하세요.
`.trim();
}

async function requestConsultingAnswer(prompt: string): Promise<string> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      mode: "consulting",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.detail ||
        "상담 답변을 불러오지 못했습니다."
    );
  }

  const answer =
    data.result ||
    data.answer ||
    data.text ||
    data.message;

  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("상담 답변 내용이 비어 있습니다.");
  }

  return answer.trim();
}

export default function AiResult(props: AiResultProps) {
  const [concern, setConcern] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const basic = basicMapper(props);

  const handleSubmit = async () => {
    const question = concern.trim();
  
    if (!question || isLoading) return;
  
    setIsLoading(true);
    setErrorMessage("");
  
    try {
      const contextQuestion = buildChatContext(chatHistory, question);
  
      const pipelineResult = runConsultingPipeline(
        contextQuestion,
        basic
      );
  
      const prompt = buildConsultingPrompt({
        name: props.name,
        question: contextQuestion,
        pipelineResult,
      });
  
      const answer = await requestConsultingAnswer(prompt);
  
      setChatHistory((prev) => [
        ...prev,
        {
          question,
          answer,
        },
      ]);
  
      setConcern("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "상담 답변을 생성하는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };  

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
      onClick={handleSubmit}
      disabled={isLoading}
          style={{
            marginTop: "12px",
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #7c3aed, #ec4899)",
            color: "#ffffff",
            fontWeight: 800,
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.65 : 1,
          }}
        >
          {isLoading
          ? "사주 흐름을 종합하고 있습니다..."
          : chatHistory.length
          ? "이어서 상담하기"
          : "AI 상담 시작"}
        </button>
        {errorMessage && (
  <p
    style={{
      margin: "12px 0 0",
      color: "#fca5a5",
      lineHeight: 1.6,
    }}
  >
    {errorMessage}
  </p>
)} 
      </div>

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
          <h3 style={{ marginTop: 0 }}>💬 상담 진행 기록</h3>
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

    
    </div>
  );
}


