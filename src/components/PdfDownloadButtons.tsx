type Props = {
    handleDownloadSummaryPdf: () => void;
    handleDownloadDetailPdf: () => void;
  };
  
  export function PdfDownloadButtons({
    handleDownloadSummaryPdf,
    handleDownloadDetailPdf,
  }: Props) {
    return (
      <div>
        <button
          onClick={handleDownloadSummaryPdf}
          style={{
            width: "100%",
            marginTop: "12px",
            border: "none",
            borderRadius: "14px",
            padding: "16px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#fff",
            background: "linear-gradient(135deg,#38bdf8,#2563eb)",
            cursor: "pointer",
          }}
        >
          📄 요약 PDF 다운로드
        </button>
  
        <button
          onClick={handleDownloadDetailPdf}
          style={{
            width: "100%",
            marginTop: "12px",
            border: "none",
            borderRadius: "14px",
            padding: "16px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#fff",
            background: "linear-gradient(135deg,#2563eb,#06b6d4)",
            cursor: "pointer",
          }}
        >
          📘 상세 PDF 다운로드
        </button>
      </div>
    );
  }