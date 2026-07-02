import {
  Document,
  Packer,
} from "docx";

import {
  splitContent,
  bodyParagraph,
  guideParagraph,
  smallParagraph,
  sectionTitle,
  subTitle,
} from "./docxCommon";

import {
  createHeader,
  createFooter,
} from "./docxHeaderFooter";

import { coverPage } from "./docxCover";

import {
  reportIntro,
  personalStandard,
  originalSajuGuide,
} from "./docxIntro";
import { saveAs } from "file-saver";

export type DocxSection = {
  title: string;
  content: string;
};

function tableOfContents(sections: DocxSection[]) {
  return [
    sectionTitle("목차"),
    ...[
      "1. 상담 안내문",
      "2. 개인 상담 기준",
      "3. 사주 원국 해석",
      ...sections.map((section, index) => `${index + 4}. ${section.title}`),
      `${sections.length + 4}. 3년 전략`,
      `${sections.length + 5}. 실천 체크리스트`,
      `${sections.length + 6}. 최종 총평`,
    ].map(smallParagraph),
  ];
}

function premiumExpansion(section: DocxSection) {
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

function sectionToDocx(section: DocxSection) {
  const lines = splitContent(section.content);

  return [
    sectionTitle(section.title),
    ...lines.map(bodyParagraph),
    ...premiumExpansion(section),
  ];
}

function threeYearStrategy() {
  return [
    sectionTitle("3년 전략"),
    subTitle("1년 차: 정리와 기준 설정"),
    bodyParagraph("현재의 자산, 일, 관계, 건강 상태를 정리하고 무리한 확장보다 기준을 세우는 시기입니다."),
    bodyParagraph("결정이 필요한 사안은 즉흥적으로 처리하지 말고, 손실 가능성과 회복 가능성을 함께 계산해야 합니다."),
    subTitle("2년 차: 선택과 집중"),
    bodyParagraph("여러 방향으로 흩어진 에너지를 줄이고, 실제 성과가 나는 영역에 집중하는 것이 좋습니다."),
    bodyParagraph("재테크, 직업, 사업, 부동산 중 하나를 중심축으로 정해 실행력을 높이는 전략이 필요합니다."),
    subTitle("3년 차: 확장과 안정화"),
    bodyParagraph("앞선 2년간 쌓은 기준과 경험을 바탕으로 확장 여부를 판단하는 시기입니다."),
    bodyParagraph("이때의 확장은 무리한 도전이 아니라 검증된 방식의 반복과 안정화가 되어야 합니다."),
  ];
}

function checklist() {
  return [
    sectionTitle("실천 체크리스트"),
    bodyParagraph(" 올해 가장 중요한 선택 1가지를 정리했는가?"),
    bodyParagraph(" 재정적으로 감당 가능한 범위를 계산했는가?"),
    bodyParagraph(" 직업 또는 사업 방향에서 무리한 확장을 피하고 있는가?"),
    bodyParagraph(" 인간관계에서 감정 소모가 큰 관계를 정리하고 있는가?"),
    bodyParagraph(" 건강 관리 루틴을 현실적으로 유지하고 있는가?"),
    bodyParagraph(" 3개월 단위로 실행 결과를 점검하고 있는가?"),
    bodyParagraph(" 좋은 운을 기다리기보다 준비 상태를 먼저 만들고 있는가?"),
    bodyParagraph(" 중요한 계약이나 투자는 기록과 근거를 남기고 있는가?"),
  ];
}

function finalReview(name: string) {
  return [
    sectionTitle("최종 총평"),
    guideParagraph(
      `${name}님에게 중요한 것은 운이 좋고 나쁨을 단순히 묻는 것이 아니라, 자신의 흐름을 이해하고 무리하지 않는 방식으로 현실적인 선택을 이어가는 것입니다.`
    ),
    guideParagraph(
      "천운문 Premium 리포트의 결론은 하나입니다. 지금의 운을 제대로 쓰려면 방향, 순서, 기준이 필요합니다."
    ),
    guideParagraph(
      "앞으로의 3년은 갑작스러운 변화보다 준비된 선택이 더 큰 차이를 만듭니다. 작은 실행을 반복하고, 중요한 결정은 기록과 검토를 거쳐 진행하는 것이 가장 안정적인 전략입니다."
    ),
  ];
}

export async function downloadDetailDocx({
  name,
  sections,
  reportTitle = "Premium Report",
  fileSuffix = "Premium_상세리포트",
}: {
  name: string;
  sections: DocxSection[];
  reportTitle?: string;
  fileSuffix?: string;
}) {
  const doc = new Document({
    sections: [
      {
        headers: {
          default: createHeader(),
        },
        footers: {
          default: createFooter(),
        },
        properties: {},
        children: [
          ...coverPage(name, reportTitle),
          ...reportIntro(name),
          ...tableOfContents(sections),
          ...personalStandard(name),
          ...originalSajuGuide(),
          ...sections.flatMap(sectionToDocx),
          ...threeYearStrategy(),
          ...checklist(),
          ...finalReview(name),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${name}_천운문_${fileSuffix}.docx`);
}








