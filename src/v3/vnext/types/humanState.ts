/**
 * vNext Human State 계약.
 *
 * Master Reader 결과를 향후 HumanStateAdapter가 이 타입으로 변환한다.
 * 이 파일은 MasterProfile을 import하지 않으며, 어댑터 경계에서만 결합한다.
 */

export type HumanStateDomain =
  | "personality"
  | "ability"
  | "repeatedPattern"
  | "money"
  | "career"
  | "relationship"
  | "capacity"
  | "risk";

/** vNext 레이어 전반에서 공유하는 근거 항목 */
export type VNextEvidenceItem = {
  key: string;
  description: string;
  sourceKey: string;
  weight?: number;
};

/** vNext 레이어 전반에서 공유하는 근거 묶음 */
export type VNextEvidence = {
  items: VNextEvidenceItem[];
  summary?: string;
};

/** 영역별 Human State 요약 */
export type HumanStateSummary = {
  domain: HumanStateDomain;
  summary: string;
  strengths: string[];
  pressures: string[];
  risks: string[];
  evidence: VNextEvidence;
};

/** 정체성 요약 */
export type HumanStateIdentity = {
  label: string;
  description: string;
  evidence: VNextEvidence;
};

/** 현재 인생 국면 */
export type HumanStateLifePhase = {
  label: string;
  description: string;
  evidence: VNextEvidence;
};

/**
 * vNext Human State.
 *
 * 값을 직접 계산하지 않으며, 어댑터가 기존 Reader 결과를 감싼다.
 */
export type HumanState = {
  identity: HumanStateIdentity;
  domains: HumanStateSummary[];
  currentLifePhase: HumanStateLifePhase;
  evidence: VNextEvidence;
};
