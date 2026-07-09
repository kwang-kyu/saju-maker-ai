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
const SECTION_SYNTHESIS = "[종합 판단]";
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

  function buildSynthesisText(result: ConsultingPipelineResult): string {
    const lines: string[] = [];
  
    lines.push(buildSummaryFocusText(result.strategy.summaryFocus));
    lines.push(buildRecommendedActionText(result.strategy.recommendedAction));
    lines.push(buildRiskLevelText(result.strategy.riskLevel));
  
    return lines.join("\n\n");
  }
  
  function buildSummaryFocusText(summaryFocus: string): string {
    switch (summaryFocus) {
      case "business":
        return "이번 질문의 핵심은 사업 자체가 맞는지, 그리고 지금 추진해도 되는 흐름인지입니다.";
  
      case "money":
        return "이번 질문의 핵심은 돈이 들어오는 흐름보다 돈을 지키고 굴리는 방식에 있습니다.";
  
      case "love":
        return "이번 질문의 핵심은 단순한 인연 여부보다 서로의 감정 흐름이 안정적으로 이어질 수 있는지입니다.";
  
      case "marriage":
        return "이번 질문의 핵심은 결혼 가능성보다 함께 생활을 유지할 수 있는 안정성입니다.";
  
      case "lifeTimeline":
        return "이번 질문의 핵심은 당장 결론을 내리는 것보다 어느 시기에 움직이는 것이 유리한지입니다.";
  
      default:
        return "이번 질문은 한 가지 요소만으로 판단하기보다 전체 사주 흐름을 함께 보아야 합니다.";
    }
  }
  
  function buildRecommendedActionText(recommendedAction: string): string {
    switch (recommendedAction) {
      case "timingFirst":
        return "지금은 실행 여부보다 시기를 먼저 따져야 합니다. 서두르기보다 운의 흐름이 받쳐주는 때를 골라 움직이는 것이 유리합니다.";
  
      case "balancedDecision":
        return "지금은 한쪽으로 급하게 결정하기보다 핵심 가능성과 현실 조건을 함께 검토해야 합니다. 작게 검증하고 단계적으로 넓히는 방식이 좋습니다.";
  
      case "directDecision":
        return "이번 질문은 판단 기준이 비교적 분명합니다. 핵심 조건만 맞는다면 오래 끌기보다 방향을 정해 실행하는 편이 낫습니다.";
  
      default:
        return "지금은 결론을 단정하기보다 조건을 나누어 하나씩 확인하는 것이 좋습니다.";
    }
  }
  
  function buildRiskLevelText(riskLevel: "low" | "medium" | "high"): string {
    switch (riskLevel) {
      case "low":
        return "위험 요소는 크지 않은 편입니다. 다만 기본적인 준비와 확인 절차는 반드시 거쳐야 합니다.";
  
      case "medium":
        return "위험 요소는 중간 정도입니다. 무리하게 밀어붙이면 부담이 커질 수 있으므로 자금, 사람, 시기를 함께 점검해야 합니다.";
  
      case "high":
        return "주의해야 할 요소가 많은 흐름입니다. 큰 결정, 큰 투자, 무리한 약속은 피하고 충분히 검증한 뒤 움직이는 것이 안전합니다.";
  
      default:
        return "위험 요소는 질문의 조건에 따라 달라질 수 있으므로 세부 상황을 함께 보는 것이 좋습니다.";
    }
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
  const synthesisText = buildSynthesisText(result);
  const flowText = buildFlowText(result);

  return [
    previousText + result.opening,
    "",
    SECTION_CORE,
    coreText,
    "",
    SECTION_SYNTHESIS,
    synthesisText,
    "",
    SECTION_FLOW,
    flowText,
    "",
    SECTION_FINAL,
    result.closing,
  ].join("\n");
}