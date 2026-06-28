export function getV2PdfStyle() {
  return `
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background: #e5e7eb;
      font-family: "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif;
      color: #111827;
    }

    .pdf-page {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto 24px auto;
      padding: 58px 54px 76px 54px;
      background: #ffffff;
      page-break-after: always;
      position: relative;
    }

    .pdf-cover {
      min-height: 980px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      border: 2px solid #111827;
      padding: 64px 48px;
    }

    .pdf-title {
      font-size: 36px;
      font-weight: 900;
      margin-bottom: 20px;
      color: #111827;
      letter-spacing: -0.5px;
    }

    .pdf-subtitle {
      font-size: 18px;
      line-height: 1.8;
      color: #374151;
    }

    .pdf-section-title {
      font-size: 22px;
      font-weight: 900;
      margin: 0 0 22px 0;
      padding: 14px 18px;
      background: #111827;
      color: #ffffff;
      border-radius: 14px;
      letter-spacing: -0.3px;
    }

    .pdf-card {
      border: 1px solid #d1d5db;
      border-radius: 18px;
      padding: 26px;
      margin-bottom: 18px;
      background: #fbfbfb;
      box-shadow: 0 6px 18px rgba(17, 24, 39, 0.06);
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .pdf-text {
      white-space: pre-wrap;
      font-size: 14.2px;
      line-height: 1.9;
      color: #374151;
      margin: 0;
      word-break: keep-all;
    }

    .pdf-footer {
      position: absolute;
      bottom: 28px;
      left: 54px;
      right: 54px;
      font-size: 11px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      padding-top: 10px;
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
        margin: 0;
        width: 100%;
        min-height: 1123px;
        page-break-after: always;
      }
    }
  `;
}
