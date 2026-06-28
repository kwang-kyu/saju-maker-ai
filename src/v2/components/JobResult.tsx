import { basicMapper } from "../services/basic/basicMapper";
import { jobConsulting } from "../services/job/jobConsulting";
import { jobSummary } from "../services/job/jobSummary";
import type { BasicSajuInput } from "../types/basic";

type JobResultProps = BasicSajuInput;

export default function JobResult(props: JobResultProps) {
  const basic = basicMapper(props);
  const consultingText = jobConsulting(basic);
  const summaryList = jobSummary(props.name);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 직업 상담</h3>

      <h4>원장님이 먼저 드리는 말씀</h4>
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
        {consultingText}
      </p>

      <h4>직업에서 중요한 방향</h4>
      <ul>
        {summaryList.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h4>실천 조언</h4>
      <p>
        앞으로는 단순히 직업명을 찾기보다, 내가 어떤 역할에서 실력이 가장 잘
        드러나는지부터 정리하는 것이 좋습니다. 그 기준이 잡히면 이직, 창업,
        부업 선택도 훨씬 현실적으로 판단할 수 있습니다.
      </p>
    </div>
  );
}
