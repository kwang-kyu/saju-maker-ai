import { basicMapper } from "../services/basic/basicMapper";
import { loveConsulting } from "../services/love/loveConsulting";
import { loveSummary } from "../services/love/loveSummary";
import type { BasicSajuInput } from "../types/basic";

type LoveResultProps = BasicSajuInput;

export default function LoveResult(props: LoveResultProps) {
  const basic = basicMapper(props);
  const consultingText = loveConsulting(basic);
  const summaryList = loveSummary(props.name);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 연애 상담</h3>

      <h4>원장님이 먼저 드리는 말씀</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consultingText}
      </p>

      <h4>연애에서 중요한 방향</h4>
      <ul>
        {summaryList.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h4>실천 조언</h4>
      <p>
        연애에서는 상대가 얼마나 나를 설레게 하는지도 중요하지만, 시간이
        지나도 나를 편안하게 해주는지가 더 중요합니다. 급하게 마음을 정하지
        말고 말과 행동이 같은 사람인지 천천히 확인하는 것이 좋습니다.
      </p>
    </div>
  );
}
