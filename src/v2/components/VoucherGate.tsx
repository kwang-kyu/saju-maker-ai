type VoucherGateProps = {
  onSuccess: (code: string) => void;
};

export default function VoucherGate({ onSuccess }: VoucherGateProps) {
  const handleTestEnter = () => {
    onSuccess("TEST");
  };

  return (
    <div
      style={{
        maxWidth: "520px",
        margin: "0 auto",
        padding: "32px 24px",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}
    >
      <h2 style={{ marginBottom: "12px" }}>천운문 이용권 인증</h2>

      <p style={{ lineHeight: 1.7, opacity: 0.85, marginBottom: "24px" }}>
        발급받은 이용권 코드를 입력하면 사주 상담 화면으로 이동합니다.
      </p>

      <input
        type="text"
        placeholder="예: CHEON-10-TEST"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px 16px",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.25)",
          background: "rgba(255,255,255,0.12)",
          color: "#fff",
          fontSize: "16px",
          marginBottom: "16px",
        }}
      />

      <button
        type="button"
        onClick={handleTestEnter}
        style={{
          width: "100%",
          padding: "14px 18px",
          borderRadius: "12px",
          border: "none",
          background: "#facc15",
          color: "#111827",
          fontWeight: 700,
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        이용권 인증하기
      </button>

      <p style={{ fontSize: "13px", opacity: 0.65, marginTop: "16px" }}>
        현재는 UI 테스트 단계입니다. 다음 단계에서 Supabase 이용권 조회를 연결합니다.
      </p>
    </div>
  );
}
