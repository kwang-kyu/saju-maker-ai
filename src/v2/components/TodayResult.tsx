import { todayConsulting } from "../services/today/todayConsulting";
import { todaySummary } from "../services/today/todaySummary";
import type { BasicSajuInput } from "../types/basic";

type TodayResultProps = BasicSajuInput;

export default function TodayResult(props: TodayResultProps) {
  const consultingText = todayConsulting(props.name);
  const summaryList = todaySummary(props.name);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 오늘 운세 상담</h3>

      <h4>원장님이 먼저 드리는 말씀</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consultingText}
      </p>

      <h4>오늘 현실에서 중요한 방향</h4>
      <ul>
        {summaryList.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h4>오늘의 핵심 조언</h4>
      <p>
        오늘은 많은 일을 벌이기보다 하나씩 정리하는 것이 좋습니다. 특히 말,
        돈, 약속과 관련된 일은 한 번 더 확인하면 불필요한 실수를 줄일 수
        있습니다.
      </p>
    </div>
  );
}
