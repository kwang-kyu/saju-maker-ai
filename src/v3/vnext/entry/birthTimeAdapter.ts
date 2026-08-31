/**
 * vNext 출생시간 Branch → 기존 V3 엔진 birthTime(HH:mm) 변환 Adapter.
 *
 * 매핑은 v2 InputForm 시진 선택값과 동일하다.
 * @see src/v2/components/InputForm.tsx timeList
 */

import type {
  BirthTimeBranch,
} from "./vNextBirthProfile.js";

const BIRTH_TIME_BRANCH_TO_ENGINE_HOUR: Record<
  Exclude<BirthTimeBranch, "unknown">,
  string
> = {
  ja: "23:00",
  chuk: "01:00",
  in: "03:00",
  myo: "05:00",
  jin: "07:00",
  sa: "09:00",
  o: "11:00",
  mi: "13:00",
  sin: "15:00",
  yu: "17:00",
  sul: "19:00",
  hae: "21:00",
};

/**
 * V3ConsultingRequest.sajuInput.birthTime은 HH:mm 형식만 허용한다.
 * unknown은 counterpart dateOnly 내부 변환과 동일하게 12:00을 사용한다.
 */
const UNKNOWN_BIRTH_TIME_ENGINE_HOUR = "12:00";

export function adaptBirthTimeBranchToEngineHour(
  branch: BirthTimeBranch,
): string {
  if (branch === "unknown") {
    return UNKNOWN_BIRTH_TIME_ENGINE_HOUR;
  }

  return BIRTH_TIME_BRANCH_TO_ENGINE_HOUR[branch];
}

export function getBirthTimeBranchEngineHourMap(): Readonly<
  Record<BirthTimeBranch, string>
> {
  return {
    unknown: UNKNOWN_BIRTH_TIME_ENGINE_HOUR,
    ...BIRTH_TIME_BRANCH_TO_ENGINE_HOUR,
  };
}
