import {
  bodyParagraph,
  guideParagraph,
  premiumBoxParagraph,
  premiumBoxTitle,
  sectionTitle,
  subTitle,
  smallParagraph,
} from "./docxCommon";

export function threeYearStrategy() {
  return [
    sectionTitle("Premium 3년 전략"),
    premiumBoxTitle("핵심 방향"),
    premiumBoxParagraph("앞으로 3년은 무리한 변화보다 정리, 선택, 안정화의 순서로 운을 현실화하는 시기입니다."),
    subTitle("1년 차: 정리와 기준 설정"),
    bodyParagraph("현재의 자산, 일, 관계, 건강 상태를 정리하고 무리한 확장보다 기준을 세우는 시기입니다."),
    bodyParagraph("결정이 필요한 사안은 즉흥적으로 처리하지 말고, 손실 가능성과 회복 가능성을 함께 계산해야 합니다."),
    subTitle("2년 차: 선택과 집중"),
    bodyParagraph("여러 방향으로 흩어진 에너지를 줄이고, 실제 성과가 나는 영역에 집중하는 것이 좋습니다."),
    bodyParagraph("재테크, 직업, 사업, 관계, 건강 중 하나를 중심축으로 정해 실행력을 높이는 전략이 필요합니다."),
    subTitle("3년 차: 확장과 안정화"),
    bodyParagraph("앞선 2년간 쌓은 기준과 경험을 바탕으로 확장 여부를 판단하는 시기입니다."),
    bodyParagraph("이때의 확장은 무리한 도전이 아니라 검증된 방식의 반복과 안정화가 되어야 합니다."),
  ];
}

export function checklist() {
  return [
    sectionTitle("Premium 실천 체크리스트"),
    premiumBoxTitle("실행 전 점검"),
    premiumBoxParagraph("✔ 올해 가장 중요한 선택 1가지를 정리했는가?"),
    premiumBoxParagraph("✔ 재정적으로 감당 가능한 범위를 계산했는가?"),
    premiumBoxParagraph("✔ 직업 또는 사업 방향에서 무리한 확장을 피하고 있는가?"),
    premiumBoxParagraph("✔ 인간관계에서 감정 소모가 큰 관계를 정리하고 있는가?"),
    premiumBoxParagraph("✔ 건강 관리 루틴을 현실적으로 유지하고 있는가?"),
    premiumBoxParagraph("✔ 3개월 단위로 실행 결과를 점검하고 있는가?"),
    premiumBoxParagraph("✔ 좋은 운을 기다리기보다 준비 상태를 먼저 만들고 있는가?"),
    premiumBoxParagraph("✔ 중요한 계약이나 투자는 기록과 근거를 남기고 있는가?"),
  ];
}

export function finalReview(name: string) {
  return [
    sectionTitle("Premium 최종 총평"),
    premiumBoxTitle("천운문 원장 총평"),
    guideParagraph(
      `${name}님에게 중요한 것은 운이 좋고 나쁨을 단순히 묻는 것이 아니라, 자신의 흐름을 이해하고 무리하지 않는 방식으로 현실적인 선택을 이어가는 것입니다.`
    ),
    guideParagraph(
      "천운문 Premium 리포트의 결론은 하나입니다. 지금의 운을 제대로 쓰려면 방향, 순서, 기준이 필요합니다."
    ),
    premiumBoxTitle("앞으로 3년의 핵심 키워드"),
    premiumBoxParagraph("정리해야 할 것은 정리하고, 키워야 할 것은 집중해서 키우는 시기입니다."),
    premiumBoxParagraph("큰 결정보다 작은 실행을 반복하면서 운의 흐름을 현실 성과로 바꾸는 것이 중요합니다."),
    premiumBoxParagraph("좋은 운은 기다리는 것이 아니라 준비된 상태에서 알아보고 붙잡는 것입니다."),
    premiumBoxTitle("마지막 조언"),
    guideParagraph(
      `${name}님은 앞으로 갑작스러운 변화보다 준비된 선택이 더 큰 차이를 만듭니다. 작은 실행을 반복하고, 중요한 결정은 기록과 검토를 거쳐 진행하는 것이 가장 안정적인 전략입니다.`
    ),

    sectionTitle("감사합니다"),
    premiumBoxTitle("천운문 PREMIUM"),
    guideParagraph("본 보고서는 개인 맞춤형 사주 종합 컨설팅 리포트입니다."),
    guideParagraph("천운문 Premium은 운의 흐름을 단정하기보다, 현실에서 선택할 수 있는 방향과 기준을 제안합니다."),
    premiumBoxParagraph("CONFIDENTIAL REPORT"),
    premiumBoxParagraph("Cheonunmun Premium Consulting Report"),
    smallParagraph("본 문서는 상담 참고용 리포트이며, 중요한 의사결정은 현실 조건과 전문가 검토를 함께 고려해 진행하시기 바랍니다."),
  ];
}

