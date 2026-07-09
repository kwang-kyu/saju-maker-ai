import type { ConsultingPipelineResult } from "./consultingPipeline";

export function buildConsultingAnswer(result: ConsultingPipelineResult): string {
  const previousText = result.hasPreviousConversation && result.previousQuestion
    ? `앞서 질문하신 "${result.previousQuestion}"의 흐름과 이어서 보면,\n\n`
    : "";

  const coreText = result.executedCores.length > 0
    ? result.executedCores
        .map((core) => `- ${core.coreName}: ${core.summary}`)
        .join("\n")
    : "- general: 기본 상담 흐름을 기준으로 답변합니다.";

  const flowText = result.answerFlow
    .map((flow, index) => `${index + 1}. ${flow}`)
    .join("\n");

  return [
    previousText + result.opening,
    "",
    "【상담 기준】",
    coreText,
    "",
    "【답변 흐름】",
    flowText,
    "",
    "【정리】",
    result.closing,
  ].join("\n");
}