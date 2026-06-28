import { basicMapper } from "../services/basic/basicMapper";
import { getMarriageConsulting } from "../services/marriage/marriageConsulting";
import { getMarriageSummary } from "../services/marriage/marriageSummary";
import type { BasicSajuInput } from "../types/basic";

type MarriageResultProps = BasicSajuInput;

export default function MarriageResult(props: MarriageResultProps) {
  const basic = basicMapper(props);
  const consulting = getMarriageConsulting(basic);
  const summary = getMarriageSummary(props.name);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 결혼 상담</h3>

      <h4>핵심 요약</h4>
      <p>{summary}</p>

      <h4>원장님이 먼저 드리는 말씀</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consulting}
      </p>
    </div>
  );
}
