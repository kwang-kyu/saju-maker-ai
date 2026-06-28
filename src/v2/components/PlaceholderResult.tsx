import type { BasicSajuInput } from "../types/basic";

type PlaceholderResultProps = BasicSajuInput & {
  title: string;
};

export default function PlaceholderResult(props: PlaceholderResultProps) {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{props.name}님의 {props.title}</h3>

      <h4>원장님이 먼저 드리는 말씀</h4>
      <p style={{ lineHeight: 1.8 }}>
        이 영역은 다음 단계에서 상담형 문장으로 연결할 예정입니다.
        현재는 메뉴 흐름과 화면 구조를 먼저 안정적으로 잡는 단계입니다.
      </p>

      <h4>개발 방향</h4>
      <ul>
        <li>전문용어보다 일반인이 이해하기 쉬운 상담 문장으로 구성합니다.</li>
        <li>재물, 직업, 관계, 건강을 현실적인 조언으로 연결합니다.</li>
        <li>한 파일에 기능을 몰아넣지 않고 서비스별로 분리합니다.</li>
      </ul>
    </div>
  );
}
