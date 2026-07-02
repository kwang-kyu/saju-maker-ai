import {
  bodyParagraph,
  divider,
  guideParagraph,
  sectionTitle,
  smallParagraph,
  subTitle,
} from "./docxCommon";

export function reportIntro(name: string) {
  return [
    sectionTitle("상담 안내문"),
    guideParagraph(
      `${name}님의 천운문 Premium 리포트는 단순한 운세 문장이 아니라, 사주 원국과 현재 흐름을 바탕으로 인생의 방향, 선택 기준, 실천 전략을 정리한 전문 상담형 문서입니다.`
    ),
    guideParagraph(
      "이 문서는 재테크, 직업, 연애, 건강, 사업, 부동산, 사안별 판단, AI 종합상담을 하나의 흐름으로 연결하여 실제 의사결정에 활용할 수 있도록 구성했습니다."
    ),
    guideParagraph(
      "사주는 미래를 단정하는 도구가 아니라, 자신에게 유리한 방식과 조심해야 할 패턴을 이해하는 기준입니다. 따라서 본 리포트는 가능성보다 방향성, 막연한 예언보다 현실적인 판단 기준에 초점을 둡니다."
    ),
    divider(),
    smallParagraph("본 리포트는 개인 상담 참고용 문서이며, 투자의료법률 판단은 관련 전문가의 검토와 함께 진행하는 것이 좋습니다."),
  ];
}

export function personalStandard(name: string) {
  return [
    sectionTitle("개인 상담 기준"),
    guideParagraph(
      `${name}님의 상담은 전체 운세를 넓게 보는 방식이 아니라, 현재 선택과 앞으로의 흐름에 직접 연결되는 기준을 중심으로 해석합니다.`
    ),
    subTitle("상담 기준 1. 타고난 성향"),
    bodyParagraph("일간, 오행의 균형, 강약, 십성의 흐름을 통해 기본 성향과 판단 방식을 살펴봅니다."),
    subTitle("상담 기준 2. 현재 운의 흐름"),
    bodyParagraph("올해 운세와 현재 시기의 흐름을 함께 보며, 무리해서 밀어붙일 때인지 정리하고 준비할 때인지 구분합니다."),
    subTitle("상담 기준 3. 현실 적용 가능성"),
    bodyParagraph("좋다, 나쁘다로 단정하지 않고 실제 생활에서 어떤 선택 기준을 세워야 하는지 중심으로 정리합니다."),
  ];
}

export function originalSajuGuide() {
  return [
    sectionTitle("사주 원국 해석"),
    guideParagraph(
      "사주 원국은 한 사람의 기본 체질과 기질, 사고방식, 인간관계의 반응 방식, 돈과 일에 대한 태도를 보여주는 기초 자료입니다."
    ),
    guideParagraph(
      "천운문 Premium 리포트에서는 어려운 명리 용어를 그대로 나열하기보다, 일반인이 이해할 수 있는 상담 문장으로 바꾸어 설명합니다."
    ),
    subTitle("해석 포인트"),
    bodyParagraph("첫째, 강한 기운은 장점이 되지만 과하면 고집이나 부담으로 나타날 수 있습니다."),
    bodyParagraph("둘째, 부족한 기운은 약점이 아니라 보완해야 할 생활 전략으로 해석합니다."),
    bodyParagraph("셋째, 운의 흐름은 기회와 위험이 함께 들어오는 시기이므로 선택 기준이 중요합니다."),
  ];
}
