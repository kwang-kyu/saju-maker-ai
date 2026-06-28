import { totalConsulting } from "../services/total/totalConsulting";
import { totalSummary } from "../services/total/totalSummary";
import type { BasicSajuInput } from "../types/basic";

type TotalResultProps = BasicSajuInput;

export default function TotalResult(props: TotalResultProps) {
  const consultingText = totalConsulting(props);
  const summaryList = totalSummary(props.name);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 총운 상담</h3>

      <h4>원장님이 먼저 드리는 말씀</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consultingText}
      </p>

      <h4>현실에서 중요한 방향</h4>
      <ul>
        {summaryList.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h4>핵심 조언</h4>
      <p>
        {props.name}님은 앞으로 한 번의 큰 변화보다, 매일 반복하는 선택과
        습관에서 흐름이 더 크게 달라집니다. 기준을 세우고 천천히 쌓아가면
        인생의 방향이 훨씬 안정적으로 바뀔 수 있습니다.
      </p>
    </div>
  );
}

