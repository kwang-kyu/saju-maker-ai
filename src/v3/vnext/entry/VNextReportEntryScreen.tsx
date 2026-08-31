import type {
  VNextBirthProfile,
} from "./vNextBirthProfile.js";
import {
  VNEXT_ENTRY_CLASSES,
  VNEXT_ENTRY_COPY,
} from "./vNextEntryContent.js";

export type VNextReportEntryScreenProps = {
  birthProfile: VNextBirthProfile;
};

export function VNextReportEntryScreen({
  birthProfile,
}: VNextReportEntryScreenProps) {
  const displayName = birthProfile.displayName?.trim() || "상담자";

  return (
    <div className={`vnext-entry-screen ${VNEXT_ENTRY_CLASSES.reportEntryScreen}`}>
      <div className="vnext-entry-screen-inner">
        <header className="vnext-entry-header">
          <h2 className="vnext-entry-section-title">
            {VNEXT_ENTRY_COPY.reportEntryTitle}
          </h2>

          <p className="vnext-entry-description">
            {VNEXT_ENTRY_COPY.reportEntryDescription}
          </p>
        </header>

        <div
          className="vnext-entry-report-summary"
          aria-live="polite"
        >
          <p className="vnext-entry-report-summary-line">
            {displayName}님의 흐름을 정리하고 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
