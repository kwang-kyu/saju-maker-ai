import html2pdf from "html2pdf.js";
import { buildV2PdfHtml, type V2PdfSection } from "./pdfTemplate";
import { getV2PdfStyle } from "./pdfStyle";

export async function downloadDetailPdf(params: {
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
  container.innerHTML = `<style>${getV2PdfStyle()}</style>${parsed.body.innerHTML}`;
  container.style.background = "#ffffff";
  container.style.width = "794px";
  container.style.margin = "0 auto";
  container.style.position = "absolute";
  container.style.left = "0";
  container.style.top = "0";
  container.style.zIndex = "-1";

  document.body.appendChild(container);

  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });

  await html2pdf()
    .set({
      margin: 0,
      filename: `${params.name}_천운문_상세리포트.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
      },
      jsPDF: {
        unit: "px",
        format: [794, 1123],
        orientation: "portrait",
      },
      
    })
    .from(container)
    .save();

  document.body.removeChild(container);
}
