/**
 * VNextBirthProfile → 기존 V3ConsultingSajuRequest 변환 Adapter.
 */

import type {
  V3ConsultingRequest,
  V3ConsultingSajuRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  adaptBirthTimeBranchToEngineHour,
} from "./birthTimeAdapter.js";
import {
  formatVNextBirthDate,
  type VNextBirthProfile,
} from "./vNextBirthProfile.js";

const DEFAULT_VNEXT_DISPLAY_NAME = "상담자";

export function adaptBirthProfileToSajuInput(
  profile: VNextBirthProfile,
  referenceDate: string,
): V3ConsultingSajuRequest {
  const displayName = profile.displayName?.trim();

  return {
    name: displayName && displayName.length > 0
      ? displayName
      : DEFAULT_VNEXT_DISPLAY_NAME,
    birthDate: formatVNextBirthDate(profile),
    birthTime: adaptBirthTimeBranchToEngineHour(
      profile.birthTimeBranch,
    ),
    gender: profile.gender,
    calendarType: profile.calendarType,
    referenceDate,
    luckStartMethod: "minuteBased",
  };
}

export function buildVNextConsultingRequestFromBirthProfile(
  profile: VNextBirthProfile,
  question: string,
  referenceDate: string,
  humanLifeContextInput: V3ConsultingRequest["humanLifeContextInput"] = {},
): V3ConsultingRequest {
  return {
    sajuInput: adaptBirthProfileToSajuInput(
      profile,
      referenceDate,
    ),
    humanLifeContextInput,
    question: question.trim(),
  };
}
