import { basicMapper } from "../services/basic/basicMapper";
import { moneyConsulting } from "../services/money/moneyConsulting";
import { moneySummary } from "../services/money/moneySummary";
import type { BasicSajuInput } from "../types/basic";

type MoneyResultProps = BasicSajuInput;

export default function MoneyResult(props: MoneyResultProps) {
  const basic = basicMapper(props);
  const consultingText = moneyConsulting(basic);
  const summaryList = moneySummary(props.name);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 재테크 상담</h3>

      <h4>원장님이 먼저 드리는 말씀</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consultingText}
      </p>

      <h4>돈 관리에서 중요한 방향</h4>
      <ul>
        {summaryList.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h4>실천 조언</h4>
      <p>
        이번 달부터는 수입을 늘리는 계획보다 먼저 고정비, 반복 지출,
        충동 지출을 정리하는 것이 좋습니다. 돈이 새는 구멍을 막으면
        재테크 흐름은 훨씬 안정적으로 느껴질 수 있습니다.
      </p>
    </div>
  );
}


