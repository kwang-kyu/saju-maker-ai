import { basicMapper } from "../services/basic/basicMapper";
import { getBusinessConsulting } from "../services/business/businessConsulting";
import { getBusinessSummary } from "../services/business/businessSummary";
import type { BasicSajuInput } from "../types/basic";

type BusinessResultProps = BasicSajuInput;

export default function BusinessResult(props: BusinessResultProps) {
  const basic = basicMapper(props);
  const consulting = getBusinessConsulting(basic);
  const summary = getBusinessSummary(props.name);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 사업 상담</h3>

      <h4>핵심 요약</h4>
      <p>{summary}</p>

      <h4>원장님이 먼저 드리는 말씀</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consulting}
      </p>
    </div>
  );
}
