import {
  findBirthTimeBranchOption,
  formatVNextBirthDate,
  type VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";

export type VNextBirthProfileSummaryProps = {
  profile: VNextBirthProfile;
  onEditBirthInfo?: () => void;
};

function resolveGenderLabel(
  gender: VNextBirthProfile["gender"],
): string {
  return gender === "male"
    ? "남성"
    : "여성";
}

function resolveCalendarLabel(
  calendarType: VNextBirthProfile["calendarType"],
): string {
  return calendarType === "solar"
    ? "양력"
    : "음력";
}

export function VNextBirthProfileSummary({
  profile,
  onEditBirthInfo,
}: VNextBirthProfileSummaryProps) {
  const displayName = profile.displayName?.trim()
    || "상담자";
  const birthDate = formatVNextBirthDate(profile);
  const birthTimeLabel = findBirthTimeBranchOption(
    profile.birthTimeBranch,
  ).label;
  const genderLabel = resolveGenderLabel(profile.gender);
  const calendarLabel = resolveCalendarLabel(profile.calendarType);

  return (
    <section
      className="vnext-consulting-birth-summary vnext-consulting-birth-summary--compact"
      aria-label="출생 정보 요약"
    >
      <div className="vnext-consulting-birth-summary-main">
        <div className="vnext-consulting-birth-summary-identity">
          <p className="vnext-consulting-birth-summary-kicker">
            상담 대상
          </p>

          <h2 className="vnext-consulting-birth-summary-name">
            {displayName}
          </h2>
        </div>

        <p className="vnext-consulting-birth-summary-inline">
          {birthDate}
          {" · "}
          {birthTimeLabel}
          {" · "}
          {genderLabel}
          {" · "}
          {calendarLabel}
        </p>
      </div>

      {onEditBirthInfo ? (
        <button
          className="vnext-consulting-birth-summary-edit"
          type="button"
          onClick={onEditBirthInfo}
          aria-label="출생 정보 변경"
        >
          변경
        </button>
      ) : null}
    </section>
  );
}
