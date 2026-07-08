import type { BasicSajuResult } from "../../types/basic";

export type BusinessProfile = {
  expansion: number;
  stability: number;
  investment: number;
  partnership: number;
  leadership: number;
  cashFlow: number;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function analyzeBusinessProfile(
  basic: BasicSajuResult
): BusinessProfile {

  const profile: BusinessProfile = {
    expansion: 50,
    stability: 50,
    investment: 50,
    partnership: 50,
    leadership: 50,
    cashFlow: 50,
  };

  const strong = basic.strongestElement ?? "";
  const weak = basic.weakestElement ?? "";
  const summary = basic.summary ?? "";

  switch (strong) {

    case "목":
      profile.expansion += 20;
      profile.leadership += 10;
      break;

    case "화":
      profile.leadership += 20;
      profile.partnership += 10;
      break;

    case "토":
      profile.stability += 20;
      profile.cashFlow += 10;
      break;

    case "금":
      profile.cashFlow += 20;
      profile.investment += 10;
      break;

    case "수":
      profile.investment += 20;
      profile.expansion += 10;
      break;
  }

  switch (weak) {

    case "목":
      profile.expansion -= 15;
      break;

    case "화":
      profile.partnership -= 15;
      break;

    case "토":
      profile.stability -= 15;
      break;

    case "금":
      profile.cashFlow -= 15;
      break;

    case "수":
      profile.investment -= 15;
      break;
  }

  if (summary.includes("신강") || summary.includes("강")) {

    profile.leadership += 10;
    profile.expansion += 10;

  } else {

    profile.stability += 10;
    profile.cashFlow += 10;

  }

  profile.expansion = clamp(profile.expansion);
  profile.stability = clamp(profile.stability);
  profile.investment = clamp(profile.investment);
  profile.partnership = clamp(profile.partnership);
  profile.leadership = clamp(profile.leadership);
  profile.cashFlow = clamp(profile.cashFlow);

  return profile;
}