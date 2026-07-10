import type { ConsultingPipelineResult } from "./consultingPipeline";

import { formatBusinessConsulting } from "./businessFormatter";
import { formatMoneyConsulting } from "./moneyFormatter";
import { formatLoveConsulting } from "./loveFormatter";
import { formatMarriageConsulting } from "./marriageFormatter";

import type { BusinessJudgement } from "../judgement/businessJudgement";
import type { MoneyJudgement } from "../judgement/moneyJudgement";
import type { LoveJudgement } from "../judgement/loveJudgement";
import type { MarriageJudgement } from "../judgement/marriageJudgement";
import type { MasterDecision } from "../framework/masterDecisionEngine";

function buildPreviousConversationText(
  result: ConsultingPipelineResult
): string {
  if (!result.hasPreviousConversation || !result.previousQuestion) {
    return "";
  }

  return [
    "[이전 대화]",
    `이전 질문: ${result.previousQuestion}`,
    "현재 질문이 이전 질문과 연결된다면 맥락을 자연스럽게 이어서 답하십시오.",
    "",
  ].join("\n");
}

function buildCurrentPhaseText(currentPhase: MasterDecision): string[] {
  const lines: string[] = [];

  lines.push(`현재 인생 흐름: ${currentPhase.lifePhase}`);
  lines.push(`올해의 핵심 흐름: ${currentPhase.yearlyKeyword}`);
  lines.push(`현재 우선 영역: ${currentPhase.priorityArea}`);

  if (currentPhase.actionNow.length > 0) {
    lines.push(`지금 필요한 행동: ${currentPhase.actionNow.join(" ")}`);
  }

  if (currentPhase.actionNext.length > 0) {
    lines.push(`다음 단계: ${currentPhase.actionNext.join(" ")}`);
  }

  if (currentPhase.warnings.length > 0) {
    lines.push(`주의할 점: ${currentPhase.warnings.join(" ")}`);
  }

  if (currentPhase.finalDirection) {
    lines.push(`전체 방향: ${currentPhase.finalDirection}`);
  }

  return lines;
}

function buildCoreEvidence(result: ConsultingPipelineResult): string {
  if (result.executedCores.length === 0) {
    return "이번 질문에 연결된 세부 판단 자료가 없습니다.";
  }

  const evidence: string[] = [];
  const synthesisOrder = result.strategy.synthesisOrder;

  synthesisOrder.forEach((coreName) => {
    const core = result.executedCores.find(
      (item) => item.coreName === coreName
    );

    if (!core) {
      return;
    }

    if (core.status !== "executed" || !core.result) {
      evidence.push(`${core.coreName}: ${core.summary}`);
      return;
    }

    switch (core.coreName) {
      case "business":
        evidence.push(
          ...formatBusinessConsulting(
            core.result as BusinessJudgement
          )
        );
        break;

      case "money":
        evidence.push(
          ...formatMoneyConsulting(
            core.result as MoneyJudgement
          )
        );
        break;

      case "love":
        evidence.push(
          ...formatLoveConsulting(
            core.result as LoveJudgement
          )
        );
        break;

      case "marriage":
        evidence.push(
          ...formatMarriageConsulting(
            core.result as MarriageJudgement
          )
        );
        break;

      case "currentPhase":
        evidence.push(
          ...buildCurrentPhaseText(
            core.result as MasterDecision
          )
        );
        break;

      default:
        evidence.push(`${core.coreName}: ${core.summary}`);
        break;
    }
  });

  return evidence.length > 0
    ? evidence.join("\n")
    : "이번 질문과 연결된 판단 자료를 종합해 답하십시오.";
}

function buildDecisionInstruction(
  result: ConsultingPipelineResult
): string {
  const riskLevel = result.strategy.riskLevel;
  const recommendedAction = result.strategy.recommendedAction;

  return [
    `질문 의도: ${result.intent}`,
    `판단 위험도: ${riskLevel}`,
    `권장 판단 방식: ${recommendedAction}`,
    `중심 판단 영역: ${result.strategy.summaryFocus}`,
  ].join("\n");
}

export function buildConsultingAnswer(
  result: ConsultingPipelineResult
): string {
  const previousConversation =
    buildPreviousConversationText(result);

  const coreEvidence = buildCoreEvidence(result);
  const decisionInstruction =
    buildDecisionInstruction(result);

  return [
    previousConversation,
    "[사용자의 현재 질문]",
    result.question,
    "",
    "[개인 사주 판단 자료]",
    coreEvidence,
    "",
    "[판단 방향]",
    decisionInstruction,
    "",
    "[답변 지침]",
    "사용자의 질문에 가장 먼저 직접 답하십시오.",
    "결론을 뒤로 미루지 말고 첫 문단에서 가능, 불리, 보류, 조건부 가능 중 가장 가까운 판단을 분명히 말하십시오.",
    "사주 자료를 항목별로 나열하거나 그대로 요약하지 마십시오.",
    "사업운, 재물운, 현재 흐름을 각각 설명하는 보고서식 답변을 하지 마십시오.",
    "질문과 직접 관계없는 조언은 빼십시오.",
    "같은 의미의 준비, 검증, 현금 흐름, 무리한 확장 같은 문장을 반복하지 마십시오.",
    "사주 판단 근거는 자연스러운 상담 문장 속에 필요한 만큼만 녹이십시오.",
    "답변의 길이와 문단 수는 질문의 복잡도에 따라 자유롭게 정하십시오.",
    "고정된 제목, 고정된 순서, 번호 목록, 최종 정리 형식을 강제로 사용하지 마십시오.",
    "사용자가 업종을 물었다면 그 업종이 본인에게 맞는지부터 답하십시오.",
    "사용자가 시기를 물었다면 언제 움직이는 것이 나은지부터 답하십시오.",
    "사용자가 특정 상대와의 동업을 물었다면 상대방 자료가 실제로 분석되었는지 확인하십시오.",
    "상대방 사주가 분석되지 않았다면 두 사람의 동업 궁합을 본 것처럼 단정하지 마십시오.",
    "현실적인 조건이나 주의사항은 결론을 설명하는 데 필요한 범위에서만 제시하십시오.",
    "철학관 원장이 눈앞의 상담자에게 이야기하듯 자연스럽고 단정하게 답하십시오.",
  ]
    .filter(Boolean)
    .join("\n");
}