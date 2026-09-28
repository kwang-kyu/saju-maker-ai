import type {
  ReactElement,
} from "react";

import {
  PRODUCT_REPORT_MENUS,
  type ProductReportMenu,
} from "./vNextReportMenu.js";

const PRODUCT_REPORT_MENU_LABELS: Record<ProductReportMenu, string> = {
  chongun: "총운",
  year: "올해의 운세",
  today: "오늘의 운세",
  todayLove: "오늘의 연애운",
  todayMoney: "오늘의 재물운",
};

export type VNextReportSectionNavigationProps = {
  activeSection: ProductReportMenu | null;
  onSelectSection: (menu: ProductReportMenu) => void;
  disabled?: boolean;
};

function VNextReportSectionNavigationView({
  activeSection,
  onSelectSection,
  disabled = false,
}: VNextReportSectionNavigationProps): ReactElement {
  return (
    <nav
      className="vnext-report-section-nav"
      aria-label="리포트 섹션"
    >
      <ul className="vnext-report-section-nav-list">
        {PRODUCT_REPORT_MENUS.map((menu) => {
          const isActive = menu === activeSection;

          return (
            <li key={menu}>
              <button
                className={[
                  "vnext-report-section-nav-item",
                  isActive
                    ? "vnext-report-section-nav-item--active"
                    : "",
                ].join(" ")}
                type="button"
                disabled={disabled}
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  onSelectSection(menu);
                }}
              >
                {PRODUCT_REPORT_MENU_LABELS[menu]}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export const VNextReportSectionNavigation =
  VNextReportSectionNavigationView;
