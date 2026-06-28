import { yearConsulting } from "../services/year/yearConsulting";
import { yearSummary } from "../services/year/yearSummary";
import type { BasicSajuInput } from "../types/basic";

type YearResultProps = BasicSajuInput;

export default function YearResult(props: YearResultProps) {
  const consultingText = yearConsulting(props.name);
  const summaryList = yearSummary(props.name);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 올해 운세 상담</h3>

      <h4>원장님이 먼저 드리는 말씀</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consultingText}
      </p>

      <h4>올해 현실에서 중요한 방향</h4>
      <ul>
        {summaryList.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h4>올해의 핵심 조언</h4>
      <p>
        올해는 무리하게 판을 키우기보다, 지금 가진 일과 관계와 돈의 흐름을
        정리하는 것이 좋습니다. 정리가 잘 될수록 다음 기회가 더 안정적으로
        들어올 수 있습니다.
      </p>
    </div>
  );
}
