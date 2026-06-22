type FiveElementGraphProps = {
    counts: Record<string, number>;
  };
  
  export function FiveElementGraph({ counts }: FiveElementGraphProps) {
    const elements = [
      { key: "wood", label: "목(木)", emoji: "🌳" },
      { key: "fire", label: "화(火)", emoji: "🔥" },
      { key: "earth", label: "토(土)", emoji: "⛰️" },
      { key: "metal", label: "금(金)", emoji: "⚙️" },
      { key: "water", label: "수(水)", emoji: "💧" },
    ];
  
    const maxCount = Math.max(...Object.values(counts), 1);
  
    return (
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "16px",
          background: "#020617",
          border: "1px solid #334155",
          color: "#ffffff",
        }}
      >
        <h2>🌳 오행 그래프</h2>
  
        {elements.map((item) => {
          const value = counts[item.key] || 0;
          const percent = (value / maxCount) * 100;
  
          return (
            <div key={item.key} style={{ marginBottom: "12px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span>
                  {item.emoji} {item.label}
                </span>
                <span>{value}</span>
              </div>
  
              <div
                style={{
                  height: "12px",
                  background: "#1e293b",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: "#38bdf8",
                    borderRadius: "999px",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }