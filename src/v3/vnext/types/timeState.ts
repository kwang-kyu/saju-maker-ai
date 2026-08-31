/**
 * vNext Time State 계약.
 *
 * 대운·세운·월운·일운·절기·변화 구간을 공통 형태로 표현한다.
 * lunar 계산 타입을 복제하지 않으며, 향후 TimeStateAdapter가 기존 계산 결과를 감싼다.
 */

import type {
  VNextEvidence,
} from "./humanState.js";

export type TimeGranularity =
  | "life"
  | "decade"
  | "year"
  | "month"
  | "day"
  | "period";

/** 어댑터가 채우는 운세 스냅샷 공통 필드 */
export type LuckFlowSnapshot = {
  label: string;
  summary: string;
  /** 어댑터가 기존 계산 Fact를 key-value로 전달 */
  facts: Record<string, string | number | boolean>;
  evidence: VNextEvidence;
};

/** 분석 대상 기간 */
export type TimePeriodRef = {
  start: string;
  end: string;
  granularity: TimeGranularity;
  label?: string;
};

/** 시간 축 위의 개별 구간 */
export type TimeSegment = {
  start: string;
  end: string;
  granularity: TimeGranularity;
  label: string;
  facts: Record<string, string | number | boolean>;
  evidence: VNextEvidence;
};

/** Change Signal 등에서 참조하는 경량 구간 표현 */
export type TimeSegmentRef = {
  start: string;
  end: string;
  granularity: TimeGranularity;
  label: string;
};

/** 절기 경계 구간 */
export type JieQiBoundary = {
  name: string;
  start: string;
  end: string;
  evidence: VNextEvidence;
};

/**
 * vNext Time State.
 *
 * targetPeriod를 중심으로 각 운세 레벨과 변화 구간을 표현한다.
 */
export type TimeState = {
  targetPeriod: TimePeriodRef;
  daeun: LuckFlowSnapshot | null;
  seun: LuckFlowSnapshot | null;
  wolun: LuckFlowSnapshot | null;
  ilun: LuckFlowSnapshot | null;
  jieQiBoundaries: JieQiBoundary[];
  segments: TimeSegment[];
  evidence: VNextEvidence;
};
