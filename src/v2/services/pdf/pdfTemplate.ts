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

function cleanPdfText(value: string) {
  return value
    .replaceAll("🌿", "[핵심]")
    .replaceAll("🌱", "[흐름]")
    .replaceAll("💰", "[재물]")
    .replaceAll("💼", "[직업]")
    .replaceAll("❤️", "[연애]")
    .replaceAll("❤", "[연애]")
    .replaceAll("🩺", "[건강]")
    .replaceAll("⚠️", "[주의]")
    .replaceAll("⚠", "[주의]")
    .replaceAll("✅", "[실천]")
    .replaceAll("📌", "[핵심]")
    .replaceAll("📍", "[포인트]")
    .replaceAll("📅", "[시기]")
    .replaceAll("🔁", "[반복]")
    .replaceAll("🧭", "[방향]")
    .replaceAll("🌙", "[총평]")
    .replaceAll("🔮", "[조언]")
    .replaceAll("👍", "[장점]")
    .replaceAll("👎", "[주의]")
    .replaceAll("❗", "[주의]")
    .replaceAll("⭐", "[중요]")
    .replaceAll("✨", "[중요]")
    .replaceAll("📈", "[상승]")
    .replaceAll("📉", "[하락]")
    .replaceAll("🏠", "[부동산]")
    .replaceAll("🏢", "[사업]")
    .replaceAll("🤝", "[관계]")
    .replaceAll("🧾", "[정리]")
    .replaceAll("🎯", "[목표]")
    .replaceAll("🔎", "[확인]");
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
  reportType: "summary" | "detail" | "case" | "ai-total";
  name: string;
  title: string;
  subtitle: string;
  sections: V2PdfSection[];
}) {
  const { reportType, name, title, subtitle, sections } = params;

  const safeSections = sections
    .filter((section) => section.title.trim() && section.content.trim())
    .map((section) => ({
      title: escapeHtml(cleanPdfText(section.title)),
      content: escapeHtml(cleanPdfText(removeDuplicateLines(section.content))),
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
        <title>${escapeHtml(cleanPdfText(title))}</title>
        <style>${getV2PdfStyle()}</style>
      </head>
      <body>
        <div class="preview-toolbar">
          <strong>PDF 미리보기</strong>
          <button onclick="window.print()">PDF로 저장하기</button>
        </div>

        <div class="pdf-page">
          <div class="pdf-cover">
            <div class="pdf-title">${escapeHtml(cleanPdfText(title))}</div>
            <div class="pdf-subtitle">
              ${escapeHtml(cleanPdfText(name))}님을 위한 ${reportType === "summary" ? "요약 리포트" : "상세 리포트"}<br />
              ${escapeHtml(cleanPdfText(subtitle))}
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
