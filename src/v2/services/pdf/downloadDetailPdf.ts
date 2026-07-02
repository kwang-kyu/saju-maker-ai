import html2pdf from "html2pdf.js";
import { buildV2PdfHtml, type V2PdfSection } from "./pdfTemplate";

export async function downloadDetailPdf(params: {
  name: string;
  sections: V2PdfSection[];
}) {
  console.log("상세 PDF 생성 시작", params.sections.length);

  const html = buildV2PdfHtml({
    reportType: "detail",
    name: params.name,
    title: "천운문 사주 상세 리포트",
    subtitle: "전체 흐름과 분야별 상담을 정리한 납품용 상세본입니다.",
    sections: params.sections,
  });

  const parsed = new DOMParser().parseFromString(html, "text/html");
  parsed.querySelector(".preview-toolbar")?.remove();

  const container = document.createElement("div");
  container.style.width = "794px";
  container.style.margin = "0 auto";
  container.style.background = "#ffffff";

  const styleHtml = parsed.head.querySelector("style")?.outerHTML ?? "";

  container.innerHTML = `
    ${styleHtml}
    ${parsed.body.innerHTML}
  `;

  document.body.appendChild(container);

  try {
    const options = {
      margin: 0,
      filename: `${params.name}_천운문_상세리포트_템플릿테스트.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
      },
      pagebreak: {
        mode: ["css", "legacy"],
        before: [".pdf-force-page"],
        avoid: [".pdf-section-heading", ".pdf-section-title", ".pdf-toc-row"],
      },
      jsPDF: {
        unit: "px",
        format: [794, 1123],
        orientation: "portrait",
      },
    } as any;

    await html2pdf()
    .set(options)
    .from(container)
    .save();
  } finally {
    document.body.removeChild(container);
  }
}



