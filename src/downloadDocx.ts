import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

function cleanDocxText(text: string): string {
  return text
    .replace(/###/g, "")
    .replace(/---/g, "")
    .replace(/\*\*/g, "")
    .replace(/계산불가/g, "분석 보완 필요")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function downloadSajuDocx(name: string, content: string) {
  const cleaned = cleanDocxText(content || "");
  const lines = cleaned.split("\n");

  const children: Paragraph[] = [
    new Paragraph({
      text: "사주메이커 AI 상세 분석 리포트",
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `고객명: ${name || "미입력"}`,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      text: `작성일: ${new Date().toLocaleDateString("ko-KR")}`,
    }),
    new Paragraph({ text: "" }),
  ];

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      children.push(new Paragraph({ text: "" }));
      return;
    }

    if (
      trimmed.includes("사주팔자") ||
      trimmed.includes("오행") ||
      trimmed.includes("신강") ||
      trimmed.includes("용신") ||
      trimmed.includes("희신") ||
      trimmed.includes("기신") ||
      trimmed.includes("AI 종합상담") ||
      trimmed.includes("대운") ||
      trimmed.includes("재물운") ||
      trimmed.includes("직업운") ||
      trimmed.includes("연애운") ||
      trimmed.includes("건강운")
    ) {
      children.push(
        new Paragraph({
          text: trimmed,
          heading: HeadingLevel.HEADING_1,
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              size: 22,
            }),
          ],
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${name || "사주"}_상세분석리포트.docx`);
}