import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
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
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "천운문 사주 상세 리포트",
                bold: true,
                size: 40,
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
          ...sections.flatMap((section) => [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
              children: [
                new TextRun({
                  text: section.title,
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            ...splitContent(section.content).map(
              (line) =>
                new Paragraph({
                  spacing: { after: 160 },
                  children: [
                    new TextRun({
                      text: line,
                      size: 22,
                    }),
                  ],
                })
            ),
          ]),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${name}_천운문_상세리포트.docx`);
}
