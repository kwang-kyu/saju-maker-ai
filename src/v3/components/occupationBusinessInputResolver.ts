import type {
  HumanLifeContext,
} from "../types/humanLifeContext";

export type BooleanSelection =
  | "unknown"
  | "yes"
  | "no";

export type OccupationStatus =
  HumanLifeContext[
    "occupationStatus"
  ];

export const SEPARATE_BUSINESS_QUESTION_LABEL =
  "별도 운영 사업";

export function shouldShowSeparateBusinessQuestion(
  occupationStatus:
    OccupationStatus,
): boolean {
  return occupationStatus
    === "employed";
}

export function resolveAutoHasActiveBusinessSelection(
  occupationStatus:
    OccupationStatus,
): BooleanSelection | null {
  if (
    occupationStatus
    === "selfEmployed"
    || occupationStatus
    === "businessOwner"
  ) {
    return "yes";
  }

  if (
    occupationStatus
    === "student"
    || occupationStatus
    === "unemployed"
    || occupationStatus
    === "retired"
  ) {
    return "no";
  }

  if (
    occupationStatus
    === "unknown"
  ) {
    return "unknown";
  }

  return null;
}

export function resolveHasActiveBusinessOnOccupationChange(
  nextOccupationStatus:
    OccupationStatus,
  previousOccupationStatus:
    OccupationStatus,
  currentHasActiveBusiness:
    BooleanSelection,
): BooleanSelection {
  const autoSelection =
    resolveAutoHasActiveBusinessSelection(
      nextOccupationStatus,
    );

  if (
    autoSelection
    !== null
  ) {
    return autoSelection;
  }

  if (
    previousOccupationStatus
    === "employed"
  ) {
    return currentHasActiveBusiness;
  }

  return "unknown";
}

export function resolveNullableBooleanFromSelection(
  value:
    BooleanSelection,
): boolean | null {
  if (
    value === "yes"
  ) {
    return true;
  }

  if (
    value === "no"
  ) {
    return false;
  }

  return null;
}

export function normalizeHasActiveBusinessForRequest(
  occupationStatus:
    OccupationStatus,
  hasActiveBusinessSelection:
    BooleanSelection,
): boolean | null {
  const autoSelection =
    resolveAutoHasActiveBusinessSelection(
      occupationStatus,
    );

  if (
    autoSelection
    !== null
  ) {
    return resolveNullableBooleanFromSelection(
      autoSelection,
    );
  }

  return resolveNullableBooleanFromSelection(
    hasActiveBusinessSelection,
  );
}
