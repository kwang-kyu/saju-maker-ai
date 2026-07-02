export type MenuKey =
  | "basic"
  | "total"
  | "year"
  | "today"
  | "moneyToday"
  | "loveToday"
  | "healthToday"
  | "lucky"
  | "case"
  | "ai"
  | "money"
  | "job"
  | "business"
  | "realEstate"
  | "love"
  | "marriage"
  | "health";

type MainMenuProps = {
  activeMenu: MenuKey;
  onChangeMenu: (menu: MenuKey) => void;
};

const mainMenus: { key: MenuKey; label: string; tone: "basic" | "field" | "ai" }[] = [
  { key: "basic", label: "기본 사주", tone: "basic" },
  { key: "total", label: "총운", tone: "basic" },
  { key: "year", label: "올해 운세", tone: "basic" },
  { key: "today", label: "오늘의 운세", tone: "basic" },
  { key: "money", label: "재테크 상담", tone: "field" },
  { key: "job", label: "직업 상담", tone: "field" },
  { key: "love", label: "연애 상담", tone: "field" },
  { key: "health", label: "건강 상담", tone: "field" },
  { key: "case", label: "주제별 상담", tone: "field" },
  { key: "ai", label: "AI 종합상담", tone: "ai" },
];

function getButtonStyle(tone: "basic" | "field" | "ai", active: boolean) {
  if (tone === "ai") {
    return {
      border: active ? "1px solid #fde68a" : "1px solid rgba(251, 191, 36, 0.38)",
      background: active ? "linear-gradient(135deg, #f59e0b, #f97316)" : "rgba(120, 53, 15, 0.62)",
      boxShadow: active ? "0 0 24px rgba(245, 158, 11, 0.45)" : "none",
    };
  }

  if (tone === "field") {
    return {
      border: active ? "1px solid #86efac" : "1px solid rgba(74, 222, 128, 0.34)",
      background: active ? "linear-gradient(135deg, #16a34a, #22c55e)" : "rgba(20, 83, 45, 0.58)",
      boxShadow: active ? "0 0 22px rgba(34, 197, 94, 0.38)" : "none",
    };
  }

  return {
    border: active ? "1px solid #bfdbfe" : "1px solid rgba(147, 197, 253, 0.34)",
    background: active ? "linear-gradient(135deg, #2563eb, #7c3aed)" : "rgba(30, 41, 59, 0.72)",
    boxShadow: active ? "0 0 22px rgba(96, 165, 250, 0.38)" : "none",
  };
}

function MenuButton({
  active,
  label,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  tone: "basic" | "field" | "ai";
  onClick: () => void;
}) {
  const toneStyle = getButtonStyle(tone, active);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minWidth: "126px",
        padding: "15px 20px",
        borderRadius: "999px",
        border: toneStyle.border,
        background: toneStyle.background,
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: active ? 900 : 800,
        fontSize: "14px",
        letterSpacing: "-0.02em",
        boxShadow: toneStyle.boxShadow,
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border 0.18s ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-2px)";
        event.currentTarget.style.boxShadow = active
          ? toneStyle.boxShadow
          : "0 10px 22px rgba(0, 0, 0, 0.28)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
        event.currentTarget.style.boxShadow = toneStyle.boxShadow;
      }}
    >
      {label}
    </button>
  );
}

export function MainMenu({ activeMenu, onChangeMenu }: MainMenuProps) {
  return (
    <section
      style={{
        padding: "26px",
        border: "1px solid rgba(148, 163, 184, 0.32)",
        borderRadius: "22px",
        background: "rgba(2, 6, 23, 0.76)",
        textAlign: "center",
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: "23px" }}>상담 메뉴</h2>
      <p style={{ margin: "0 auto 18px", color: "#cbd5e1", lineHeight: "1.7", maxWidth: "680px" }}>
        기본 분석에서 인생 흐름을 확인한 뒤, 분야별 상담과 AI 종합상담으로 이어가세요.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {mainMenus.map((menu, index) => (
          <div
            key={menu.key}
            style={{
              animation: "fadeSlideUp 0.35s ease both",
              animationDelay: `${index * 0.035}s`,
            }}
          >
            <MenuButton
              active={activeMenu === menu.key}
              label={menu.label}
              tone={menu.tone}
              onClick={() => onChangeMenu(menu.key)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
