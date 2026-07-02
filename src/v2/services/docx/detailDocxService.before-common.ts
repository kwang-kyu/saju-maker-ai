import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";

export type DocxSection = {
  title: string;
  content: string;
};

function splitContent(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function textRun(text: string, options?: { bold?: boolean; size?: number }) {
  return new TextRun({
    text,
    bold: options?.bold,
    size: options?.size ?? 22,
  });
}

function bodyParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 180 },
    children: [textRun(text)],
  });
}

function guideParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 220 },
    children: [textRun(text, { size: 23 })],
  });
}

function smallParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 140 },
    children: [textRun(text, { size: 20 })],
  });
}

function sectionTitle(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    spacing: { before: 240, after: 320 },
    children: [textRun(title, { bold: true, size: 34 })],
  });
}

function subTitle(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [textRun(title, { bold: true, size: 26 })],
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    children: [textRun("", { size: 18 })],
  });
}

function createHeader() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [textRun("천운문 Premium Report", { size: 18 })],
      }),
    ],
  });
}

function createFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          textRun("천운문 Premium  Confidential  ", { size: 18 }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 18,
          }),
        ],
      }),
    ],
  });
}

function coverPage(name: string, reportTitle: string) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1800, after: 300 },
      children: [textRun("천운문", { bold: true, size: 60 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
      children: [textRun(reportTitle, { bold: true, size: 36 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [textRun("사주를 넘어 인생의 방향을 제시합니다.", { size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [textRun(name, { bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [textRun(`${new Date().getFullYear()}`, { size: 22 })],
    }),
  ];
}

function reportIntro(name: string) {
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
    smallParagraph(" 본 리포트는 개인 상담 참고용 문서이며, 투자의료법률 판단은 관련 전문가의 검토와 함께 진행하는 것이 좋습니다."),
  ];
}

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

function personalStandard(name: string) {
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

function originalSajuGuide() {
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

