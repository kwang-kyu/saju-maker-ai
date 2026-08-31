/**
 * vNext Analysis Request 계약.
 *
 * 전체 vNext 분석 요청을 표현한다.
 */

import type {
  AnalysisSourceType,
} from "./changeSignal.js";
import type {
  AnswerMode,
} from "./answerBlueprint.js";
import type {
  TimeGranularity,
} from "./timeState.js";

/** 사용자 입력 — 어댑터가 기존 입력 형식을 변환 */
export type HumanInput = {
  birthDate?: string;
  birthTime?: string;
  gender?: "male" | "female" | "unspecified";
  location?: string;
  additionalFacts?: Record<string, string>;
};

/** 분석 대상 기간 요청 */
export type TargetPeriodRequest = {
  start?: string;
  end?: string;
  granularity?: TimeGranularity;
  label?: string;
};

/**
 * vNext Analysis Request.
 *
 * sources / humanInput / question / targetPeriod / answerMode를 포함한다.
 */
export type AnalysisRequest = {
  sources: AnalysisSourceType[];
  humanInput: HumanInput;
  question: string;
  targetPeriod?: TargetPeriodRequest;
  answerMode: AnswerMode;
};
