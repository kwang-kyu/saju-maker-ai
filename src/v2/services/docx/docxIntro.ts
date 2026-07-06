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

export function lifeStageFlow(name: string) {
  return [
    sectionTitle("인생 단계별 흐름"),

    guideParagraph(
      `${name}님의 인생 흐름은 한 시기만 따로 보는 것보다 초년, 중년, 장년, 말년의 흐름을 함께 보아야 더 정확하게 이해할 수 있습니다.`
    ),
    guideParagraph(
      "각 시기에는 해야 할 역할과 조심해야 할 선택이 다르기 때문에, 인생 전체의 흐름 안에서 지금의 위치를 확인하는 것이 중요합니다."
    ),

    divider(),

    subTitle("초년 흐름"),
    bodyParagraph(
      "초년에는 환경의 영향을 많이 받으며, 스스로의 기준을 세우기까지 시간이 필요한 흐름입니다."
    ),
    bodyParagraph(
      "이 시기에는 빠른 성공보다 경험을 통해 사람을 보는 눈, 돈을 다루는 감각, 일을 지속하는 힘을 배우는 것이 중요합니다."
    ),

    subTitle("중년 흐름"),
    bodyParagraph(
      "중년에는 그동안 쌓아온 경험이 현실적인 성과로 이어지는 시기입니다."
    ),
    bodyParagraph(
      "다만 책임이 커지는 만큼 돈, 가족, 직업, 건강을 함께 관리해야 하며, 무리한 확장보다 안정적인 기반을 만드는 것이 중요합니다."
    ),

    subTitle("장년 흐름"),
    bodyParagraph(
      "장년에는 직접 뛰는 방식보다 경험, 신뢰, 관계를 활용하는 흐름이 좋아집니다."
    ),
    bodyParagraph(
      "이 시기에는 새롭게 크게 벌리기보다 이미 쌓아온 것을 정리하고, 상담, 관리, 교육, 자문처럼 경험을 살리는 방향이 좋습니다."
    ),

    subTitle("말년 흐름"),
    bodyParagraph(
      "말년에는 큰 욕심보다 생활의 안정, 건강, 가족 관계, 마음의 평온이 중요합니다."
    ),
    bodyParagraph(
      "돈을 크게 불리는 것보다 지켜야 할 것을 지키고, 불필요한 부담을 줄이는 선택이 말년운을 편안하게 만듭니다."
    ),

    subTitle("인생 단계별 핵심 조언"),
    bodyParagraph(
      "초년에는 배우고, 중년에는 만들고, 장년에는 정리하고, 말년에는 지키는 흐름으로 보는 것이 좋습니다."
    ),
    bodyParagraph(
      `${name}님은 지금의 선택이 어느 단계에 속하는지 확인하면서 무리한 확장보다 오래 지속될 수 있는 방향을 잡는 것이 중요합니다.`
    ),
  ];
}
