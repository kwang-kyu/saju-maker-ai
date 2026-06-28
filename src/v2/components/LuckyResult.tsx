import { getLuckyConsulting } from "../services/lucky/luckyConsulting";
import { getLuckySummary } from "../services/lucky/luckySummary";

type LuckyResultProps = {
  name: string;
};

export default function LuckyResult({ name }: LuckyResultProps) {
  const consulting = getLuckyConsulting(name);
  const summary = getLuckySummary(name);

  return (
    <div>
      <h2>🍀 오늘의 행운운</h2>

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
