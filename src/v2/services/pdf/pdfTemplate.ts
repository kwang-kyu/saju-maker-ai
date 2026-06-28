import { getV2PdfStyle } from "./pdfStyle";

export type V2PdfSection = {
  title: string;
  content: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function removeDuplicateLines(text: string) {
  const seen = new Set<string>();

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      const key = line.replace(/\s+/g, "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join("\n");
}

export function buildV2PdfHtml(params: {
  reportType: "summary" | "detail";
  name: string;
  title: string;
  subtitle: string;
  sections: V2PdfSection[];
}) {
  const { reportType, name, title, subtitle, sections } = params;

  const safeSections = sections
    .filter((section) => section.title.trim() && section.content.trim())
    .map((section) => ({
      title: escapeHtml(section.title),
      content: escapeHtml(removeDuplicateLines(section.content)),
    }));

  const tocHtml = safeSections
    .map(
      (section, index) => `
        <div class="pdf-toc-row">
          <span>${index + 1}. ${section.title}</span>
          <strong>${index + 3}</strong>
        </div>
      `
    )
    .join("");

  const sectionHtml = safeSections
    .map(
      (section, index) => `
        <div class="pdf-page">
          <h2 class="pdf-section-title">${section.title}</h2>
          <div class="pdf-card">
            <pre class="pdf-text">${section.content}</pre>
          </div>
          <div class="pdf-footer">SAJU-MAKER-AI v2  천운문  Page ${index + 3}</div>
        </div>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        <style>${getV2PdfStyle()}</style>
      </head>
      <body>
        <div class="preview-toolbar">
          <strong>PDF 미리보기</strong>
          <button onclick="window.print()">PDF로 저장하기</button>
        </div>

        <div class="pdf-page">
          <div class="pdf-cover">
            <div class="pdf-title">${escapeHtml(title)}</div>
            <div class="pdf-subtitle">
              ${escapeHtml(name)}님을 위한 ${reportType === "summary" ? "요약 리포트" : "상세 리포트"}<br />
              ${escapeHtml(subtitle)}
            </div>
          </div>
          <div class="pdf-footer">SAJU-MAKER-AI v2  천운문  Page 1</div>
        </div>

        <div class="pdf-page">
          <h2 class="pdf-section-title">목차</h2>
          <div class="pdf-card">
            <div class="pdf-toc">
              ${tocHtml}
            </div>
          </div>
          <div class="pdf-footer">SAJU-MAKER-AI v2  천운문  Page 2</div>
        </div>

        ${sectionHtml}
      </body>
    </html>
  `;
}
