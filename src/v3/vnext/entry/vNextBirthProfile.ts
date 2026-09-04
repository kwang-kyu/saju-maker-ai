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
  buttonLabel?: string;
};

/**
 * UI Label과 내부 Value 분리.
 * InputForm 시진 매핑과 동일한 대표 hour를 birthTimeAdapter에서 사용한다.
 */
export const VNEXT_BIRTH_TIME_BRANCH_OPTIONS: BirthTimeBranchOption[] = [
  { value: "unknown", label: "모름" },
  { value: "ja", label: "자시", buttonLabel: "자시 (23:00~00:59)" },
  { value: "chuk", label: "축시", buttonLabel: "축시 (01:00~02:59)" },
  { value: "in", label: "인시", buttonLabel: "인시 (03:00~04:59)" },
  { value: "myo", label: "묘시", buttonLabel: "묘시 (05:00~06:59)" },
  { value: "jin", label: "진시", buttonLabel: "진시 (07:00~08:59)" },
  { value: "sa", label: "사시", buttonLabel: "사시 (09:00~10:59)" },
  { value: "o", label: "오시", buttonLabel: "오시 (11:00~12:59)" },
  { value: "mi", label: "미시", buttonLabel: "미시 (13:00~14:59)" },
  { value: "sin", label: "신시", buttonLabel: "신시 (15:00~16:59)" },
  { value: "yu", label: "유시", buttonLabel: "유시 (17:00~18:59)" },
  { value: "sul", label: "술시", buttonLabel: "술시 (19:00~20:59)" },
  { value: "hae", label: "해시", buttonLabel: "해시 (21:00~22:59)" },
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
