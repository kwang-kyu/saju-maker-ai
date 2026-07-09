import type { SajuProfile } from "./sajuProfile";

export type LifeStageType =
  | "기반형"
  | "성장형"
  | "도전형"
  | "확장형"
  | "안정형"
  | "관리형"
  | "수확형"
  | "재정비형";

export type LifeStageDetail = {
  stage: string;
  ageRange: string;
  type: LifeStageType;
  opportunity: string;
  risk: string;
  focus: string;
};

export type LifeTimeline = {
  earlyLife: LifeStageDetail;
  youngAdultLife: LifeStageDetail;
  middleLife: LifeStageDetail;
  matureLife: LifeStageDetail;
  lateLife: LifeStageDetail;
};

function pickType(profile: SajuProfile, stage: string): LifeStageType {
  if (stage === "early") {
    if (profile.stabilityScore >= 65) return "기반형";
    if (profile.expansionScore >= 65) return "성장형";
    return "재정비형";
  }

  if (stage === "young") {
    if (profile.expansionScore >= 65) return "도전형";
    if (profile.leadershipScore >= 65) return "성장형";
    return "기반형";
  }

  if (stage === "middle") {
    if (profile.businessScore >= 65 || profile.moneyScore >= 65) return "확장형";
    if (profile.stabilityScore >= 65) return "안정형";
    return "재정비형";
  }

  if (stage === "mature") {
    if (profile.cashFlowScore >= 65 || profile.stabilityScore >= 65) return "관리형";
    if (profile.expansionScore >= 65) return "확장형";
    return "안정형";
  }

  if (profile.cashFlowScore >= 65 || profile.healthScore >= 65) return "수확형";
  return "관리형";
}

function makeDetail(
  stage: string,
  ageRange: string,
  type: LifeStageType,
  profile: SajuProfile
): LifeStageDetail {
  const opportunity =
    type === "확장형" || type === "도전형"
      ? "새로운 기회와 활동 범위를 넓히는 힘"
      : type === "안정형" || type === "관리형"
        ? "생활 기반과 자산 구조를 안정시키는 힘"
        : type === "수확형"
          ? "그동안 만든 기반을 정리하고 활용하는 힘"
          : "기초를 다지고 방향을 다시 잡는 힘";

  const risk =
    profile.riskFactors.length > 0
      ? profile.riskFactors[0]
      : type === "확장형"
        ? "무리한 확장"
        : "방향 없는 반복";

  const focus =
    profile.currentLifeFocus;

  return {
    stage,
    ageRange,
    type,
    opportunity,
    risk,
    focus,
  };
}

export function buildLifeTimeline(profile: SajuProfile): LifeTimeline {
  const earlyType = pickType(profile, "early");
  const youngType = pickType(profile, "young");
  const middleType = pickType(profile, "middle");
  const matureType = pickType(profile, "mature");
  const lateType = pickType(profile, "late");

  return {
    earlyLife: makeDetail("초년", "0~19세", earlyType, profile),
    youngAdultLife: makeDetail("청년", "20~34세", youngType, profile),
    middleLife: makeDetail("중년", "35~49세", middleType, profile),
    matureLife: makeDetail("장년", "50~64세", matureType, profile),
    lateLife: makeDetail("말년", "65세 이후", lateType, profile),
  };
}