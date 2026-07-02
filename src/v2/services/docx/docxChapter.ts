import type { DocxSection } from "./detailDocxService";

import {
  bodyParagraph,
  sectionTitle,
  splitContent,
  subTitle,
} from "./docxCommon";

export function premiumExpansion(section: DocxSection) {
  return [
    subTitle("상담 핵심 정리"),
    bodyParagraph(
      `${section.title}에서 가장 중요한 기준은 결과를 성급하게 단정하지 않고, 현재의 흐름과 감당 가능한 범위를 함께 보는 것입니다.`
    ),
    bodyParagraph(
      "좋은 운이 들어와도 준비가 부족하면 기회가 부담으로 바뀔 수 있고, 다소 불리한 운이라도 기준을 세우면 손실을 줄일 수 있습니다."
    ),
    subTitle("현실 적용 방향"),
    bodyParagraph(
      "지금 단계에서는 큰 결정보다 우선순위 정리, 자금시간관계의 부담 점검, 실행 순서 조정이 중요합니다."
    ),
    bodyParagraph(
      "특히 감정적으로 끌리는 선택보다 반복적으로 확인되는 흐름, 주변 환경의 변화, 본인이 지속할 수 있는 방식을 기준으로 삼는 것이 좋습니다."
    ),
    subTitle("주의할 점"),
    bodyParagraph(
      "운이 좋다는 말만 믿고 무리하게 확장하거나, 반대로 운이 약하다는 이유로 아무것도 하지 않는 태도는 모두 피해야 합니다."
    ),
    bodyParagraph(
      "천운문 상담의 핵심은 타이밍을 맞추되, 현실의 준비 상태를 함께 보는 데 있습니다."
    ),
    subTitle("실천 조언"),
    bodyParagraph("1. 지금 바로 결정해야 할 일과 조금 더 지켜볼 일을 구분하세요."),
    bodyParagraph("2. 돈, 시간, 건강, 관계 중 가장 부담이 큰 요소를 먼저 점검하세요."),
    bodyParagraph("3. 좋은 흐름이 들어올수록 기록과 기준을 남겨 충동적인 선택을 줄이세요."),
    bodyParagraph("4. 앞으로 3개월 단위로 실행 결과를 점검하며 방향을 조정하세요."),
  ];
}

export function sectionToDocx(section: DocxSection) {
  const lines = splitContent(section.content);

  return [
    sectionTitle(section.title),
    ...lines.map(bodyParagraph),
    ...premiumExpansion(section),
  ];
}
