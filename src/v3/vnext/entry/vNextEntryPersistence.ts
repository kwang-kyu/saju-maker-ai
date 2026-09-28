/**
 * vNext Entry draft persistence (sessionStorage).
 *
 * OAuth full-page redirect 이후 Entry in-memory state 복원을 위한
 * UX persistence only.
 *
 * 저장 대상: schemaVersion / phase / selectedMode / birthProfile
 * (birthProfile에는 gender·생년월일·시진·달력·optional displayName이 포함될 수 있다.)
 *
 * Auth token / session / password / secret은 저장하지 않는다.
 * localStorage는 사용하지 않는다.
 */

import type {
  BirthTimeBranch,
  VNextBirthCalendarType,
  VNextBirthGender,
  VNextBirthProfile,
} from "./vNextBirthProfile.js";
import type {
  VNextConsultingMode,
  VNextEntryPhase,
  VNextEntryState,
} from "./vNextEntryTypes.js";

export const VNEXT_ENTRY_DRAFT_STORAGE_KEY =
  "vnext.entry.draft.v1";

export const VNEXT_ENTRY_DRAFT_SCHEMA_VERSION =
  1 as const;

export type VNextEntryDraft = {
  schemaVersion: typeof VNEXT_ENTRY_DRAFT_SCHEMA_VERSION;
  phase: VNextEntryPhase;
  selectedMode: VNextConsultingMode | null;
  birthProfile: VNextBirthProfile | null;
};

const ENTRY_PHASES: ReadonlySet<VNextEntryPhase> = new Set([
  "landing",
  "modeSelection",
  "birthInput",
  "consulting",
  "report",
]);

const CONSULTING_MODES: ReadonlySet<VNextConsultingMode> = new Set([
  "question",
  "report",
]);

const BIRTH_GENDERS: ReadonlySet<VNextBirthGender> = new Set([
  "male",
  "female",
]);

const BIRTH_CALENDAR_TYPES: ReadonlySet<VNextBirthCalendarType> = new Set([
  "solar",
  "lunar",
]);

const BIRTH_TIME_BRANCHES: ReadonlySet<BirthTimeBranch> = new Set([
  "unknown",
  "ja",
  "chuk",
  "in",
  "myo",
  "jin",
  "sa",
  "o",
  "mi",
  "sin",
  "yu",
  "sul",
  "hae",
]);

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value);
}

function isFiniteInteger(
  value: unknown,
): value is number {
  return typeof value === "number"
    && Number.isFinite(value)
    && Number.isInteger(value);
}

function parseBirthProfile(
  value: unknown,
): VNextBirthProfile | null {
  if (value === null) {
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const gender = value.gender;
  const year = value.year;
  const month = value.month;
  const day = value.day;
  const birthTimeBranch = value.birthTimeBranch;
  const calendarType = value.calendarType;
  const displayName = value.displayName;

  if (
    typeof gender !== "string"
    || !BIRTH_GENDERS.has(gender as VNextBirthGender)
  ) {
    return null;
  }

  if (
    !isFiniteInteger(year)
    || !isFiniteInteger(month)
    || !isFiniteInteger(day)
  ) {
    return null;
  }

  if (
    typeof birthTimeBranch !== "string"
    || !BIRTH_TIME_BRANCHES.has(
      birthTimeBranch as BirthTimeBranch,
    )
  ) {
    return null;
  }

  if (
    typeof calendarType !== "string"
    || !BIRTH_CALENDAR_TYPES.has(
      calendarType as VNextBirthCalendarType,
    )
  ) {
    return null;
  }

  if (
    displayName !== undefined
    && typeof displayName !== "string"
  ) {
    return null;
  }

  const profile: VNextBirthProfile = {
    gender: gender as VNextBirthGender,
    year,
    month,
    day,
    birthTimeBranch: birthTimeBranch as BirthTimeBranch,
    calendarType: calendarType as VNextBirthCalendarType,
  };

  if (typeof displayName === "string") {
    profile.displayName = displayName;
  }

  return profile;
}

/**
 * phase / selectedMode / birthProfile 관계 불변식.
 * 불일치 draft는 controller에 주입하지 않는다.
 */
export function isConsistentVNextEntryDraft(
  draft: Pick<
    VNextEntryDraft,
    "phase" | "selectedMode" | "birthProfile"
  >,
): boolean {
  switch (draft.phase) {
    case "landing":
      return draft.selectedMode === null
        && draft.birthProfile === null;

    case "modeSelection":
      if (draft.selectedMode === null) {
        return draft.birthProfile === null;
      }

      return CONSULTING_MODES.has(draft.selectedMode);

    case "birthInput":
      return draft.selectedMode !== null
        && CONSULTING_MODES.has(draft.selectedMode);

    case "consulting":
      return draft.selectedMode === "question"
        && draft.birthProfile !== null;

    case "report":
      return draft.selectedMode === "report"
        && draft.birthProfile !== null;

    default:
      return false;
  }
}

function parseEntryDraft(
  value: unknown,
): VNextEntryDraft | null {
  if (!isRecord(value)) {
    return null;
  }

  if (value.schemaVersion !== VNEXT_ENTRY_DRAFT_SCHEMA_VERSION) {
    return null;
  }

  const phase = value.phase;
  if (
    typeof phase !== "string"
    || !ENTRY_PHASES.has(phase as VNextEntryPhase)
  ) {
    return null;
  }

  const selectedMode = value.selectedMode;
  if (selectedMode !== null) {
    if (
      typeof selectedMode !== "string"
      || !CONSULTING_MODES.has(
        selectedMode as VNextConsultingMode,
      )
    ) {
      return null;
    }
  }

  if (!("birthProfile" in value)) {
    return null;
  }

  const birthProfile = parseBirthProfile(value.birthProfile);
  if (
    value.birthProfile !== null
    && birthProfile === null
  ) {
    return null;
  }

  const draft: VNextEntryDraft = {
    schemaVersion: VNEXT_ENTRY_DRAFT_SCHEMA_VERSION,
    phase: phase as VNextEntryPhase,
    selectedMode: selectedMode as VNextConsultingMode | null,
    birthProfile,
  };

  if (!isConsistentVNextEntryDraft(draft)) {
    return null;
  }

  return draft;
}

function removeStoredDraftSafely(): void {
  try {
    sessionStorage.removeItem(
      VNEXT_ENTRY_DRAFT_STORAGE_KEY,
    );
  } catch {
    // Storage unavailable; ignore cleanup failure.
  }
}

/**
 * Entry state → draft. 저장 대상만 복사한다.
 */
export function toVNextEntryDraft(
  state: Pick<
    VNextEntryState,
    "phase" | "selectedMode" | "birthProfile"
  >,
): VNextEntryDraft {
  return {
    schemaVersion: VNEXT_ENTRY_DRAFT_SCHEMA_VERSION,
    phase: state.phase,
    selectedMode: state.selectedMode,
    birthProfile: state.birthProfile,
  };
}

/**
 * Draft → Entry state 조각. malformed / inconsistent draft는 null.
 */
export function fromVNextEntryDraft(
  draft: VNextEntryDraft | null,
): Pick<
  VNextEntryState,
  "phase" | "selectedMode" | "birthProfile"
> | null {
  if (draft === null) {
    return null;
  }

  const parsed = parseEntryDraft(draft);
  if (parsed === null) {
    return null;
  }

  return {
    phase: parsed.phase,
    selectedMode: parsed.selectedMode,
    birthProfile: parsed.birthProfile,
  };
}

export function saveVNextEntryDraft(
  state: Pick<
    VNextEntryState,
    "phase" | "selectedMode" | "birthProfile"
  >,
): void {
  try {
    if (!isConsistentVNextEntryDraft(state)) {
      return;
    }

    const draft = toVNextEntryDraft(state);
    sessionStorage.setItem(
      VNEXT_ENTRY_DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
  } catch {
    // Storage unavailable / quota; Entry UX continues without persistence.
  }
}

export function loadVNextEntryDraft(): VNextEntryDraft | null {
  try {
    const raw = sessionStorage.getItem(
      VNEXT_ENTRY_DRAFT_STORAGE_KEY,
    );

    if (raw === null || raw === "") {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      removeStoredDraftSafely();
      return null;
    }

    const draft = parseEntryDraft(parsed);
    if (draft === null) {
      removeStoredDraftSafely();
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

export function clearVNextEntryDraft(): void {
  removeStoredDraftSafely();
}
