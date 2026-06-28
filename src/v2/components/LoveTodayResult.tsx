import { getLoveTodayConsulting } from "../services/loveToday/loveTodayConsulting";
import { getLoveTodaySummary } from "../services/loveToday/loveTodaySummary";

type LoveTodayResultProps = {
  name: string;
};

export default function LoveTodayResult({ name }: LoveTodayResultProps) {
  const consulting = getLoveTodayConsulting(name);
  const summary = getLoveTodaySummary(name);

  return (
    <div>
      <h2>💕 오늘의 연애운</h2>

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
