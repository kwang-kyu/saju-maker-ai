import {
  Document,
  Packer,
} from "docx";

import {
  bodyParagraph,
  guideParagraph,
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

import { tableOfContents } from "./docxToc";

import { sectionToDocx } from "./docxChapter";
import { saveAs } from "file-saver";

export type DocxSection = {
  title: string;
  content: string;
};

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












