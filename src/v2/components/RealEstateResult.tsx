import { basicMapper } from "../services/basic/basicMapper";
import { getRealEstateConsulting } from "../services/realEstate/realEstateConsulting";
import { getRealEstateSummary } from "../services/realEstate/realEstateSummary";
import type { BasicSajuInput } from "../types/basic";

type RealEstateResultProps = BasicSajuInput;

export default function RealEstateResult(props: RealEstateResultProps) {
  const basic = basicMapper(props);
  const consulting = getRealEstateConsulting(basic);
  const summary = getRealEstateSummary(props.name);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 재테크 상담</h3>

      <h4>핵심 요약</h4>
      <p>{summary}</p>

      <h4>원장님이 먼저 드리는 말씀</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consulting}
      </p>
    </div>
  );
}

