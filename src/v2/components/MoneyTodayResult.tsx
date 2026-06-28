import { moneyTodayConsulting } from "../services/moneyToday/moneyTodayConsulting";

type MoneyTodayResultProps = {
  name: string;
};

export default function MoneyTodayResult({ name }: MoneyTodayResultProps) {
  const consultingText = moneyTodayConsulting(name);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{name}님의 오늘 재물 흐름</h3>

      <h4>💰 오늘 돈의 흐름</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consultingText}
      </p>
    </div>
  );
}
