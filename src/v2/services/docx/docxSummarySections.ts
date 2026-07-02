import type { DocxSection } from "./detailDocxService";

export function buildSummaryDocxSections({
  name,
  personalProfile,
}: {
  name: string;
  personalProfile: string;
}): DocxSection[] {
  return [
    {
      title: "개인 상담 기준",
      content: personalProfile,
    },
    {
      title: "기본 사주 요약",
      content: `${name}님의 기본 사주는 스스로 기준을 세우고 차분히 쌓아갈 때 강점이 살아나는 흐름입니다.

겉으로는 조용하거나 신중해 보여도, 속으로는 생각이 깊고 판단 기준이 분명한 편입니다.

무리하게 빠르게 움직이기보다 본인이 납득할 수 있는 방향을 정한 뒤 꾸준히 가는 것이 좋습니다.`,
    },
    {
      title: "전체 운세 요약",
      content: `${name}님은 앞으로 무리한 확장보다 안정, 정리, 건강, 관계의 균형이 더 중요한 시기입니다.

일과 돈은 크게 벌리는 것보다 새는 부분을 막고, 오래 가져갈 기준을 세울 때 흐름이 안정됩니다.`,
    },
    {
      title: "올해 운세 요약",
      content: `${name}님에게 올해는 속도보다 방향이 중요한 해입니다.

새로운 일을 무리하게 늘리기보다 지금 하는 일의 완성도와 안정성을 높이는 것이 좋습니다.`,
    },
    {
      title: "오늘의 운세 요약",
      content: `${name}님은 오늘 많은 일을 한꺼번에 처리하기보다 중요한 일 하나를 먼저 끝내는 것이 좋습니다.

돈, 약속, 문서, 건강 리듬을 차분히 점검하면 하루 흐름이 안정됩니다.`,
    },
  ];
}
