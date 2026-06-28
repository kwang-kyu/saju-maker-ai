import { basicMapper } from "../services/basic/basicMapper";
import { basicConsulting } from "../services/basic/basicConsulting";
import { basicSummary } from "../services/basic/basicSummary";
import type { BasicSajuInput } from "../types/basic";

type BasicResultProps = BasicSajuInput;

export default function BasicResult(props: BasicResultProps) {
  const result = basicMapper(props);
  const consultingText = basicConsulting(result);
  const summaryList = basicSummary(result);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{result.title}</h3>

      <h4>🌿 원장님이 먼저 드리는 말씀</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consultingText}
      </p>

      <h4>😊 이런 장점이 잘 살아납니다</h4>
      <ul>
        {result.strengths.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h4>⚖️ 생활에서 균형을 잡으면 좋은 부분</h4>
      <ul>
        {result.cautions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h4>✅ 핵심 요약</h4>
      <ul>
        {summaryList.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
