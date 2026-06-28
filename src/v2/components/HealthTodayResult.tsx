import { getHealthTodayConsulting } from "../services/healthToday/healthTodayConsulting";
import { getHealthTodaySummary } from "../services/healthToday/healthTodaySummary";

type HealthTodayResultProps = {
  name: string;
};

export default function HealthTodayResult({ name }: HealthTodayResultProps) {
  const consulting = getHealthTodayConsulting(name);
  const summary = getHealthTodaySummary(name);

  return (
    <div className="result-card">
      <h2>🩺 오늘의 건강운</h2>

      <h3>✔ 핵심 요약</h3>
      <p
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "keep-all",
          overflowWrap: "break-word",
          lineHeight: 1.8,
        }}
      >
        {summary}
      </p>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "keep-all",
          overflowWrap: "break-word",
          lineHeight: 1.8,
          fontFamily: "inherit",
        }}
      >
        {consulting}
      </pre>
    </div>
  );
}
