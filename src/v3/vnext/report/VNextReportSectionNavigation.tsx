import type {
  ReportAnswerSection,
} from "../types/answerBlueprint.js";
import {
  VNEXT_REPORT_SECTION_LABELS,
} from "./vNextReportCopy.js";

export type VNextReportSectionNavigationProps = {
  sections: ReportAnswerSection[];
  activeSection: ReportAnswerSection | null;
  onSelectSection: (section: ReportAnswerSection) => void;
  disabled?: boolean;
};

export function VNextReportSectionNavigation({
  sections,
  activeSection,
  onSelectSection,
  disabled = false,
}: VNextReportSectionNavigationProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <nav
      className="vnext-report-section-nav"
      aria-label="리포트 섹션"
    >
      <ul className="vnext-report-section-nav-list">
        {sections.map((section) => {
          const isActive = section === activeSection;

          return (
            <li key={section}>
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
                  onSelectSection(section);
                }}
              >
                {VNEXT_REPORT_SECTION_LABELS[section]}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
