import { getHealthTodayConsulting } from "../services/healthToday/healthTodayConsulting";
import { getHealthTodaySummary } from "../services/healthToday/healthTodaySummary";

type HealthTodayResultProps = {
  name: string;
};

export default function HealthTodayResult({ name }: HealthTodayResultProps) {
  const consulting = getHealthTodayConsulting(name);
  const summary = getHealthTodaySummary(name);

  return (
    <div>
      <h2>🩺 오늘의 건강운</h2>

      <div className="result-card">
        <h3>✔ 핵심 요약</h3>
        <p>{summary}</p>
      </div>

      <div className="result-card">
        <pre>{consulting}</pre>
      </div>
    </div>
  );
}
