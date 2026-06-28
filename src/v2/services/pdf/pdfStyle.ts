export function getV2PdfStyle() {
  return `
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif;
      color: #111827;
    }

    .pdf-page {
      width: 794px;
      margin: 0 auto;
      padding: 54px 54px 54px 54px;
      background: #ffffff;
      position: relative;
    }

    .pdf-page + .pdf-page {
      border-top: 1px solid #e5e7eb;
    }

    .pdf-cover {
      min-height: 900px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      border: 2px solid #111827;
      border-radius: 24px;
      padding: 64px 48px;
      background: linear-gradient(180deg, #ffffff, #f8fafc);
    }

    .pdf-title {
      font-size: 38px;
      font-weight: 900;
      margin-bottom: 22px;
      color: #111827;
      letter-spacing: -0.7px;
    }

    .pdf-subtitle {
      font-size: 18px;
      line-height: 1.75;
      color: #374151;
    }

    .pdf-section-title {
      font-size: 23px;
      font-weight: 900;
      margin: 0 0 18px 0;
      padding: 14px 18px;
      background: #111827;
      color: #ffffff;
      border-radius: 14px;
      letter-spacing: -0.4px;
    }

    .pdf-section-title::before {
      content: "천운문 상담";
      display: block;
      font-size: 11px;
      font-weight: 800;
      color: #f59e0b;
      margin-bottom: 4px;
    }

    .pdf-card {
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      padding: 28px 30px;
      margin-bottom: 18px;
      background: #ffffff;
      box-shadow: 0 6px 16px rgba(17, 24, 39, 0.06);
    }

    .pdf-card::before {
      content: "";
      display: block;
      width: 48px;
      height: 4px;
      background: #f59e0b;
      border-radius: 99px;
      margin-bottom: 16px;
    }

    .pdf-text {
      white-space: pre-wrap;
      font-family: "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif;
      font-size: 14.4px;
      line-height: 1.72;
      color: #1f2937;
      margin: 0;
      word-break: keep-all;
      overflow-wrap: break-word;
      letter-spacing: -0.25px;
    }

    .pdf-toc-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 11px 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 15.5px;
      line-height: 1.5;
      color: #1f2937;
    }

    .pdf-toc-row span {
      font-weight: 800;
    }

    .pdf-toc-row strong {
      color: #111827;
      font-weight: 900;
    }

    .pdf-toc-row:last-child {
      border-bottom: none;
    }

    .pdf-footer {
      margin-top: 22px;
      font-size: 10.5px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      padding-top: 9px;
      text-align: center;
    }

    .preview-toolbar {
      position: sticky;
      top: 0;
      z-index: 999;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 22px;
      background: #111827;
      color: #ffffff;
      border-bottom: 1px solid #374151;
    }

    .preview-toolbar button {
      padding: 10px 16px;
      border: none;
      border-radius: 10px;
      background: #f59e0b;
      color: #111827;
      font-weight: 800;
      cursor: pointer;
    }

    @media print {
      .preview-toolbar {
        display: none;
      }

      body {
        background: #ffffff;
      }

      .pdf-page {
        width: 794px;
        margin: 0 auto;
        page-break-after: auto;
      }
    }
  `;
}
