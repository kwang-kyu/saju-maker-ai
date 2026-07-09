import type { ConsultingPipelineResult } from "./consultingPipeline";
import { formatBusinessConsulting } from "./businessFormatter";
import { formatMoneyConsulting } from "./moneyFormatter";
import { formatLoveConsulting } from "./loveFormatter";
import { formatMarriageConsulting } from "./marriageFormatter";
import type { BusinessJudgement } from "../judgement/businessJudgement";
import type { MoneyJudgement } from "../judgement/moneyJudgement";
import type { LoveJudgement } from "../judgement/loveJudgement";
import type { MarriageJudgement } from "../judgement/marriageJudgement";

const SECTION_CORE = "[사주 판단 기준]";
const SECTION_FLOW = "[상담 답변 흐름]";
const SECTION_FINAL = "[최종 정리]";

function buildPreviousText(result: ConsultingPipelineResult): string {
  if (!result.hasPreviousConversation || !result.previousQuestion) {
    return "";
  }

  return `앞서 질문하신 내용과 이어서 보면, 이전 질문은 "${result.previousQuestion}"였습니다.\n\n`;
}

function buildCoreText(result: ConsultingPipelineResult): string {
    if (result.executedCores.length === 0) {
      return "이번 질문은 기본 상담 흐름으로 판단합니다.";
    }
  
    const messages: string[] = [];
    const orderedCoreNames = result.strategy.synthesisOrder;
  
    orderedCoreNames.forEach((coreName) => {
      const core = result.executedCores.find(
        (executedCore) => executedCore.coreName === coreName
      );
  
      if (!core) {
        return;
      }
  
      if (core.status !== "executed" || !core.result) {
        messages.push(`${core.coreName}: ${core.summary}`);
        return;
      }
  
      if (core.coreName === "business") {
        messages.push(...formatBusinessConsulting(core.result as BusinessJudgement));
        return;
      }
  
      if (core.coreName === "money") {
        messages.push(...formatMoneyConsulting(core.result as MoneyJudgement));
        return;
      }
  
      if (core.coreName === "love") {
        messages.push(...formatLoveConsulting(core.result as LoveJudgement));
        return;
      }
  
      if (core.coreName === "marriage") {
        messages.push(...formatMarriageConsulting(core.result as MarriageJudgement));
        return;
      }
  
      messages.push(`${core.coreName}: ${core.summary}`);
    });
  
    if (messages.length === 0) {
      return "이번 질문은 연결된 Core 결과를 바탕으로 상담 흐름을 정리합니다.";
    }
  
    return messages.join("\n");
  }

function buildFlowText(result: ConsultingPipelineResult): string {
  if (result.answerFlow.length === 0) {
    return "질문에 맞는 상담 흐름을 정리합니다.";
  }

  return result.answerFlow
    .map((flow, index) => `${index + 1}. ${flow}`)
    .join("\n");
}

export function buildConsultingAnswer(result: ConsultingPipelineResult): string {
  const previousText = buildPreviousText(result);
  const coreText = buildCoreText(result);
  const flowText = buildFlowText(result);

  return [
    previousText + result.opening,
    "",
    SECTION_CORE,
    coreText,
    "",
    SECTION_FLOW,
    flowText,
    "",
    SECTION_FINAL,
    result.closing,
  ].join("\n");
}