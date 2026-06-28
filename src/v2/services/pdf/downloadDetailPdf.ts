import html2pdf from "html2pdf.js";
import { buildV2PdfHtml, type V2PdfSection } from "./pdfTemplate";

export function downloadDetailPdf(params: {
  name: string;
  sections: V2PdfSection[];
}) {
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
  container.innerHTML = parsed.body.innerHTML;
  container.style.background = "#ffffff";
  document.body.appendChild(container);

  html2pdf()
    .set({
      margin: 0,
      filename: `${params.name}_천운문_상세리포트.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
    })
    .from(container)
    .save()
    .then(() => {
      document.body.removeChild(container);
    });
}

