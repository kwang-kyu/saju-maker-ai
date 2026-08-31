/**
 * vNext Report UI 콘텐츠 및 섹션 라벨 계약.
 */

import type {
  ReportAnswerSection,
} from "../types/answerBlueprint.js";

export const VNEXT_REPORT_DEFAULT_QUESTION =
  "현재 흐름을 정리해 주세요.";

export const VNEXT_REPORT_COPY = {
  title: "분석 리포트",
  subtitle: "출생 정보를 바탕으로 현재 흐름을 정리합니다.",
  progressAnalyzing: "사주 정보를 분석하고 있습니다.",
  progressGenerating: "리포트를 작성하고 있습니다.",
  progressStreaming: "리포트를 표시하고 있습니다.",
  emptyContent: "리포트 내용이 여기에 표시됩니다.",
  errorFallback: "리포트를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.",
} as const;

export const VNEXT_REPORT_SECTION_LABELS: Record<
  ReportAnswerSection,
  string
> = {
  humanState: "사람의 구조",
  timeState: "시간의 흐름",
  changeSignals: "변화 신호",
  assessment: "종합 판단",
  conclusion: "결론",
};
