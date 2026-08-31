import {
  useMemo,
  useState,
} from "react";

import type {
  BirthTimeBranch,
  VNextBirthGender,
  VNextBirthProfile,
} from "./vNextBirthProfile.js";
import {
  VNEXT_BIRTH_TIME_BRANCH_OPTIONS,
} from "./vNextBirthProfile.js";
import {
  VNEXT_ENTRY_CLASSES,
  VNEXT_ENTRY_COPY,
} from "./vNextEntryContent.js";

export type VNextBirthInputScreenProps = {
  onSubmit: (profile: VNextBirthProfile) => void;
  onGoBack: () => void;
};

const YEAR_OPTIONS = Array.from(
  { length: 91 },
  (_, index) => 1940 + index,
);

const MONTH_OPTIONS = Array.from(
  { length: 12 },
  (_, index) => index + 1,
);

const DAY_OPTIONS = Array.from(
  { length: 31 },
  (_, index) => index + 1,
);

const TIME_BRANCH_GRID = VNEXT_BIRTH_TIME_BRANCH_OPTIONS.filter(
  (item) => item.value !== "unknown",
);

function isValidBirthDateParts(
  year: number | null,
  month: number | null,
  day: number | null,
): boolean {
  if (
    year === null
    || month === null
    || day === null
  ) {
    return false;
  }

  const monthText = String(month).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  const isoDate = `${year}-${monthText}-${dayText}`;
  const parsed = new Date(`${isoDate}T00:00:00`);

  return (
    parsed.getFullYear() === year
    && parsed.getMonth() + 1 === month
    && parsed.getDate() === day
  );
}

export function VNextBirthInputScreen({
  onSubmit,
  onGoBack,
}: VNextBirthInputScreenProps) {
  const [
    displayName,
    setDisplayName,
  ] = useState("");
  const [
    gender,
    setGender,
  ] = useState<VNextBirthGender>("male");
  const [
    year,
    setYear,
  ] = useState<number | null>(null);
  const [
    month,
    setMonth,
  ] = useState<number | null>(null);
  const [
    day,
    setDay,
  ] = useState<number | null>(null);
  const [
    birthTimeBranch,
    setBirthTimeBranch,
  ] = useState<BirthTimeBranch>("unknown");

  const canSubmit = useMemo(
    () => isValidBirthDateParts(year, month, day),
    [year, month, day],
  );

  function handleSubmit() {
    if (
      !canSubmit
      || year === null
      || month === null
      || day === null
    ) {
      return;
    }

    onSubmit({
      displayName: displayName.trim() || undefined,
      gender,
      year,
      month,
      day,
      birthTimeBranch,
      calendarType: "solar",
    });
  }

  return (
    <div className={`vnext-entry-screen ${VNEXT_ENTRY_CLASSES.birthInputScreen}`}>
      <div className="vnext-entry-screen-inner vnext-entry-screen-inner--form">
        <header className="vnext-entry-header">
          <h2 className="vnext-entry-section-title">
            {VNEXT_ENTRY_COPY.birthInputTitle}
          </h2>

          <p className="vnext-entry-description vnext-entry-description--form">
            {VNEXT_ENTRY_COPY.birthInputDescriptionLine1}
            <br />
            {VNEXT_ENTRY_COPY.birthInputDescriptionLine2}
          </p>
        </header>

        <div className="vnext-entry-form">
          <div className="vnext-entry-field">
            <label
              className="vnext-entry-label"
              htmlFor="vnext-birth-display-name"
            >
              {VNEXT_ENTRY_COPY.birthInputDisplayNameLabel}
            </label>

            <input
              id="vnext-birth-display-name"
              className="vnext-entry-input"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="vnext-entry-field">
            <span className="vnext-entry-label">
              {VNEXT_ENTRY_COPY.birthInputGenderLabel}
            </span>

            <div className="vnext-entry-toggle-group">
              <button
                className={[
                  "vnext-entry-toggle-button",
                  gender === "male"
                    ? "vnext-entry-toggle-button--selected"
                    : "",
                ].filter(Boolean).join(" ")}
                type="button"
                aria-pressed={gender === "male"}
                onClick={() => setGender("male")}
              >
                {VNEXT_ENTRY_COPY.birthInputGenderMale}
              </button>

              <button
                className={[
                  "vnext-entry-toggle-button",
                  gender === "female"
                    ? "vnext-entry-toggle-button--selected"
                    : "",
                ].filter(Boolean).join(" ")}
                type="button"
                aria-pressed={gender === "female"}
                onClick={() => setGender("female")}
              >
                {VNEXT_ENTRY_COPY.birthInputGenderFemale}
              </button>
            </div>
          </div>

          <div className="vnext-entry-field">
            <span className="vnext-entry-label">
              {VNEXT_ENTRY_COPY.birthInputBirthDateLabel}
            </span>

            <div className="vnext-entry-date-row">
              <select
                className="vnext-entry-select"
                aria-label="출생 연도"
                value={year ?? ""}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  setYear(
                    nextValue.length > 0
                      ? Number(nextValue)
                      : null,
                  );
                }}
              >
                <option value="">
                  {VNEXT_ENTRY_COPY.birthInputYearSuffix}
                </option>

                {YEAR_OPTIONS.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>

              <select
                className="vnext-entry-select"
                aria-label="출생 월"
                value={month ?? ""}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  setMonth(
                    nextValue.length > 0
                      ? Number(nextValue)
                      : null,
                  );
                }}
              >
                <option value="">
                  {VNEXT_ENTRY_COPY.birthInputMonthSuffix}
                </option>

                {MONTH_OPTIONS.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>

              <select
                className="vnext-entry-select"
                aria-label="출생 일"
                value={day ?? ""}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  setDay(
                    nextValue.length > 0
                      ? Number(nextValue)
                      : null,
                  );
                }}
              >
                <option value="">
                  {VNEXT_ENTRY_COPY.birthInputDaySuffix}
                </option>

                {DAY_OPTIONS.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="vnext-entry-field">
            <span className="vnext-entry-label">
              {VNEXT_ENTRY_COPY.birthInputBirthTimeLabel}
            </span>

            <div className="vnext-entry-birth-time-section">
              <button
                className={[
                  VNEXT_ENTRY_CLASSES.birthTimeOption,
                  birthTimeBranch === "unknown"
                    ? VNEXT_ENTRY_CLASSES.birthTimeOptionSelected
                    : "",
                ].filter(Boolean).join(" ")}
                type="button"
                aria-pressed={birthTimeBranch === "unknown"}
                onClick={() => setBirthTimeBranch("unknown")}
              >
                모름
              </button>

              <div className={VNEXT_ENTRY_CLASSES.birthTimeGrid}>
                {TIME_BRANCH_GRID.map((item) => {
                  const isSelected = birthTimeBranch === item.value;

                  return (
                    <button
                      key={item.value}
                      className={[
                        VNEXT_ENTRY_CLASSES.birthTimeOption,
                        isSelected
                          ? VNEXT_ENTRY_CLASSES.birthTimeOptionSelected
                          : "",
                      ].filter(Boolean).join(" ")}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setBirthTimeBranch(item.value)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="vnext-entry-actions">
          <button
            className="vnext-entry-primary-button"
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {VNEXT_ENTRY_COPY.birthInputNextButton}
          </button>

          <button
            className="vnext-entry-secondary-button"
            type="button"
            onClick={onGoBack}
          >
            {VNEXT_ENTRY_COPY.birthInputBackButton}
          </button>
        </div>
      </div>
    </div>
  );
}
