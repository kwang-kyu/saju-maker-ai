/**
 * vNext Change Signal 계약.
 *
 * "무엇이 변하는가"만 표현한다. 최종 추천이나 결론을 내리지 않는다.
 */

import type {
  VNextEvidence,
} from "./humanState.js";
import type {
  TimeSegmentRef,
} from "./timeState.js";

export type ChangeSignalType =
  | "opportunity"
  | "pressure"
  | "responsibility"
  | "inflow"
  | "expense"
  | "relationshipChange"
  | "conflict"
  | "stability"
  | "expansion"
  | "movement"
  | "recovery"
  | "ending"
  | "risk";

export type ChangeDirection =
  | "increase"
  | "decrease"
  | "emerge"
  | "weaken"
  | "stable"
  | "mixed";

export type ChangeSignalStrength =
  | "weak"
  | "moderate"
  | "strong";

/** 분석 엔진 출처 — 향후 사주·자미두수·관상·손금 등 확장 */
export type AnalysisSourceType =
  | "saju"
  | "ziwei"
  | "physiognomy"
  | "palmistry"
  | "integrated";

/** Change Signal의 출처 메타데이터 */
export type ChangeSignalSource = {
  type: AnalysisSourceType;
  engineKey: string;
  referenceKey?: string;
};

/**
 * vNext Change Signal.
 *
 * 변화의 종류·방향·강도와 시간 구간만 기록한다.
 */
export type ChangeSignal = {
  type: ChangeSignalType;
  direction: ChangeDirection;
  strength: ChangeSignalStrength;
  timeSegment: TimeSegmentRef;
  summary: string;
  evidence: VNextEvidence;
  source: ChangeSignalSource;
};
