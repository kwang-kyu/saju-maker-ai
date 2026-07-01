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

const mainMenus: { key: MenuKey; label: string }[] = [
  { key: "basic", label: "기본 사주" },
  { key: "total", label: "인생 흐름" },
  { key: "year", label: "올해 운세" },
  { key: "today", label: "오늘 운세" },
  { key: "moneyToday", label: "오늘 재물" },
  { key: "loveToday", label: "오늘 연애" },
  { key: "healthToday", label: "오늘 건강" },
  { key: "lucky", label: "오늘 행운" },
  { key: "case", label: "맞춤 상담" },
  { key: "ai", label: "AI 인생컨설팅" },
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
        minWidth: "104px",
        padding: "12px 17px",
        borderRadius: "999px",
        border: active ? "1px solid #f9a8d4" : "1px solid rgba(148, 163, 184, 0.42)",
        background: active
          ? "linear-gradient(135deg, #7c3aed, #ec4899)"
          : "rgba(15, 23, 42, 0.72)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: active ? 900 : 700,
        fontSize: "13px",
        letterSpacing: "-0.02em",
        boxShadow: active ? "0 0 22px rgba(236, 72, 153, 0.38)" : "none",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border 0.18s ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-2px)";
        event.currentTarget.style.boxShadow = active
          ? "0 0 26px rgba(236, 72, 153, 0.5)"
          : "0 10px 22px rgba(0, 0, 0, 0.28)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
        event.currentTarget.style.boxShadow = active
          ? "0 0 22px rgba(236, 72, 153, 0.38)"
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
        padding: "24px",
        border: "1px solid rgba(148, 163, 184, 0.32)",
        borderRadius: "22px",
        background: "rgba(2, 6, 23, 0.76)",
        textAlign: "center",
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: "23px" }}>상담 메뉴</h2>
      <p style={{ margin: "0 auto 18px", color: "#cbd5e1", lineHeight: "1.7", maxWidth: "620px" }}>
        기본 사주를 먼저 확인한 뒤, 인생 흐름과 맞춤 상담, AI 인생컨설팅으로 이어가세요.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
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
              onClick={() => onChangeMenu(menu.key)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
