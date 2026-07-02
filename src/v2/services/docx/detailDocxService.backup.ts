import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
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

function bodyParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 180 },
    children: [
      new TextRun({
        text,
        size: 22,
      }),
    ],
  });
}

function sectionTitle(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 520, after: 220 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 30,
      }),
    ],
  });
}

export async function downloadDetailDocx({
  name,
  sections,
}: {
  name: string;
  sections: DocxSection[];
}) {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1200,
              right: 1000,
              bottom: 1200,
              left: 1000,
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: "천운문",
                bold: true,
                size: 46,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: "사주 상세 리포트",
                bold: true,
                size: 34,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 700 },
            children: [
              new TextRun({
                text: `${name}님을 위한 프리미엄 상담 보고서`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 220 },
            children: [
              new TextRun({
                text: "본 보고서는 사주의 흐름을 바탕으로 성향, 재물, 직업, 관계, 건강, 시기 판단을 일반인이 이해하기 쉬운 상담 문장으로 정리한 자료입니다.",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 520 },
            children: [
              new TextRun({
                text: "중요한 선택을 앞두고 방향을 정리하거나, Word에서 수정 후 PDF로 저장하여 고객 상담용 자료로 활용할 수 있습니다.",
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 240 },
            children: [
              new TextRun({
                text: "목차",
                bold: true,
                size: 30,
              }),
            ],
          }),
          ...sections.map(
            (section, index) =>
              new Paragraph({
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: `${index + 1}. ${section.title}`,
                    size: 22,
                  }),
                ],
              })
          ),

          ...sections.flatMap((section) => [
            sectionTitle(section.title),
            ...splitContent(section.content).map((line) => bodyParagraph(line)),
          ]),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${name}_천운문_상세리포트.docx`);
}
