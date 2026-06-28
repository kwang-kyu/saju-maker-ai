export type MenuKey =
  | "basic"
  | "total"
  | "year"
  | "today"
  | "moneyToday"
  | "loveToday"
  | "healthToday"
  | "lucky"
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

const mainMenus: { key: MenuKey; label: string }[] = [
  { key: "basic", label: "기본사주" },
  { key: "total", label: "전체운세" },
  { key: "year", label: "올해운세" },
  { key: "today", label: "오늘운세" },
  { key: "moneyToday", label: "오늘재물" },
  { key: "loveToday", label: "오늘연애" },
  { key: "healthToday", label: "오늘건강" },
  { key: "lucky", label: "오늘행운" },
  { key: "ai", label: "AI 종합상담" },
];

function MenuButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "12px 16px",
        borderRadius: "999px",
        border: active ? "1px solid #f9a8d4" : "1px solid #475569",
        background: active
          ? "linear-gradient(135deg, #7c3aed, #ec4899)"
          : "#020617",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: active ? 800 : 600,
        boxShadow: active ? "0 0 18px rgba(236, 72, 153, 0.35)" : "none",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border 0.18s ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-2px)";
        event.currentTarget.style.boxShadow = active
          ? "0 0 22px rgba(236, 72, 153, 0.5)"
          : "0 10px 22px rgba(0, 0, 0, 0.28)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
        event.currentTarget.style.boxShadow = active
          ? "0 0 18px rgba(236, 72, 153, 0.35)"
          : "none";
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
        padding: "22px",
        border: "1px solid #334155",
        borderRadius: "22px",
        background: "rgba(2, 6, 23, 0.76)",
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: "23px" }}>상담 메뉴</h2>
      <p style={{ margin: "0 0 16px", color: "#cbd5e1", lineHeight: "1.7" }}>
        기본 상담을 먼저 보고, 필요하면 AI 종합상담과 심층상담으로 이어가세요.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "9px" }}>
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
              onClick={() => onChangeMenu(menu.key)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
