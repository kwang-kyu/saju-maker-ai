import html2pdf from "html2pdf.js";
import { buildV2PdfHtml, type V2PdfSection } from "./pdfTemplate";
import { getV2PdfStyle } from "./pdfStyle";

export function downloadCasePdf(params: {
  name: string;
  sections: V2PdfSection[];
}) {
  const html = buildV2PdfHtml({
    reportType: "case",
    name: params.name,
    title: "천운문 사안별 상담 리포트",
    subtitle: "개인의 사주 흐름을 바탕으로 현재 사안을 현실적으로 판단한 상담본입니다.",
    sections: params.sections,
  });

  const parsed = new DOMParser().parseFromString(html, "text/html");
  parsed.querySelector(".preview-toolbar")?.remove();

  const container = document.createElement("div");
  container.innerHTML = `<style>${getV2PdfStyle()}</style>${parsed.body.innerHTML}`;
  container.style.background = "#e5e7eb";
  container.style.width = "794px";
  container.style.margin = "0 auto";
  document.body.appendChild(container);

  html2pdf()
    .set({
      margin: 0,
      filename: `${params.name}_천운문_사안별상담.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "px",
        format: [794, 1123],
        orientation: "portrait",
      },
    })
    .from(container)
    .save()
    .then(() => {
      document.body.removeChild(container);
    });
}
