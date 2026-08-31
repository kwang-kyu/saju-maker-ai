/**
 * vNext Birth Profile — Entry Flow와 Consulting/Report Flow 사이 공유 계약.
 *
 * UI 전용 필드와 엔진 입력 계약을 분리한다.
 */

export type BirthTimeBranch =
  | "unknown"
  | "ja"
  | "chuk"
  | "in"
  | "myo"
  | "jin"
  | "sa"
  | "o"
  | "mi"
  | "sin"
  | "yu"
  | "sul"
  | "hae";

export type VNextBirthGender =
  | "male"
  | "female";

export type VNextBirthCalendarType =
  | "solar"
  | "lunar";

export type VNextBirthProfile = {
  displayName?: string;
  gender: VNextBirthGender;
  year: number;
  month: number;
  day: number;
  birthTimeBranch: BirthTimeBranch;
  calendarType: VNextBirthCalendarType;
};

export type BirthTimeBranchOption = {
  value: BirthTimeBranch;
  label: string;
};

/**
 * UI Label과 내부 Value 분리.
 * InputForm 시진 매핑과 동일한 대표 hour를 birthTimeAdapter에서 사용한다.
 */
export const VNEXT_BIRTH_TIME_BRANCH_OPTIONS: BirthTimeBranchOption[] = [
  { value: "unknown", label: "모름" },
  { value: "ja", label: "자시" },
  { value: "chuk", label: "축시" },
  { value: "in", label: "인시" },
  { value: "myo", label: "묘시" },
  { value: "jin", label: "진시" },
  { value: "sa", label: "사시" },
  { value: "o", label: "오시" },
  { value: "mi", label: "미시" },
  { value: "sin", label: "신시" },
  { value: "yu", label: "유시" },
  { value: "sul", label: "술시" },
  { value: "hae", label: "해시" },
];

export function findBirthTimeBranchOption(
  branch: BirthTimeBranch,
): BirthTimeBranchOption {
  const found = VNEXT_BIRTH_TIME_BRANCH_OPTIONS.find(
    (item) => item.value === branch,
  );

  if (!found) {
    throw new Error(`Unknown birth time branch: ${branch}`);
  }

  return found;
}

export function formatVNextBirthDate(
  profile: Pick<VNextBirthProfile, "year" | "month" | "day">,
): string {
  const month = String(profile.month).padStart(2, "0");
  const day = String(profile.day).padStart(2, "0");

  return `${profile.year}-${month}-${day}`;
}
