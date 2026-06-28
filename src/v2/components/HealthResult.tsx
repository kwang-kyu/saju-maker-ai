import { basicMapper } from "../services/basic/basicMapper";
import { getHealthConsulting } from "../services/health/healthConsulting";
import { getHealthSummary } from "../services/health/healthSummary";
import type { BasicSajuInput } from "../types/basic";

type HealthResultProps = BasicSajuInput;

export default function HealthResult(props: HealthResultProps) {
  const basic = basicMapper(props);
  const consulting = getHealthConsulting(basic);
  const summary = getHealthSummary(props.name);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 건강 상담</h3>

      <h4>핵심 요약</h4>
      <p>{summary}</p>

      <h4>원장님이 먼저 드리는 말씀</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consulting}
      </p>
    </div>
  );
}
