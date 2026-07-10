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
import type { CompatibilityResult } from "../compatibility/compatibilityTypes";

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

  
  function buildCompatibilityText(
    compatibility: CompatibilityResult
  ): string[] {
    const lines: string[] = [];
  
    lines.push(
      `궁합 분석 유형: ${compatibility.mode}`
    );
  
    lines.push(
      `궁합 당사자: ${compatibility.self.name} / ${compatibility.other.name}`
    );
  
    lines.push(
      `전체 궁합 점수: ${compatibility.overallScore}점`
    );
  
    lines.push(
      `궁합 수준: ${compatibility.level}`
    );
  
    lines.push(
      `궁합 위험도: ${compatibility.riskLevel}`
    );
  
    if (compatibility.directConclusion) {
      lines.push(
        `직접 결론: ${compatibility.directConclusion}`
      );
    }
  
    if (compatibility.summary) {
      lines.push(
        `궁합 종합 판단: ${compatibility.summary}`
      );
    }
  
    if (compatibility.strengths.length > 0) {
      lines.push(
        `서로 잘 맞는 점: ${compatibility.strengths.join(" ")}`
      );
    }
  
    if (compatibility.conflicts.length > 0) {
      lines.push(
        `충돌 가능성이 있는 점: ${compatibility.conflicts.join(" ")}`
      );
    }
  
    if (compatibility.communicationCompatibility.length > 0) {
      lines.push(
        `대화와 소통 궁합: ${compatibility.communicationCompatibility.join(" ")}`
      );
    }
  
    if (compatibility.workCompatibility.length > 0) {
      lines.push(
        `일과 역할 궁합: ${compatibility.workCompatibility.join(" ")}`
      );
    }
  
    if (compatibility.moneyCompatibility.length > 0) {
      lines.push(
        `금전 궁합: ${compatibility.moneyCompatibility.join(" ")}`
      );
    }
  
    if (compatibility.roleRecommendation.length > 0) {
      lines.push(
        `권장 역할 분담: ${compatibility.roleRecommendation.join(" ")}`
      );
    }
  
    if (compatibility.riskFactors.length > 0) {
      lines.push(
        `관계 위험 요소: ${compatibility.riskFactors.join(" ")}`
      );
    }
  
    if (compatibility.recommendations.length > 0) {
      lines.push(
        `관계 운영 조언: ${compatibility.recommendations.join(" ")}`
      );
    }
  
    if (compatibility.evidence.length > 0) {
      const evidenceText = compatibility.evidence
        .map(
          (item) =>
            `[${item.category}/${item.influence}] ${item.title}: ${item.description}`
        )
        .join(" ");
  
      lines.push(
        `궁합 판단 근거: ${evidenceText}`
      );
    }
  
    return lines;
  }
  

function buildCoreEvidence(result: ConsultingPipelineResult): string {
  if (result.executedCores.length === 0) {
    return "이번 질문에 연결된 세부 판단 자료가 없습니다.";
  }

  const evidence: string[] = [];
  const synthesisOrder = result.strategy.synthesisOrder;
  if (
    synthesisOrder.includes("compatibility") &&
    result.compatibility
  ) {
    evidence.push(
      ...buildCompatibilityText(result.compatibility)
    );
  }

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
    const {
      ruleId,
      primaryCore,
      coreWeights,
      reasoningOrder,
      decisionFocus,
      riskLevel,
      recommendedAction,
      summaryFocus,
    } = result.strategy;
  
    const weightText = [...coreWeights]
      .sort((a, b) => a.priority - b.priority)
      .map(
        (item) =>
          `${item.priority}순위 ${item.coreName}: ${item.weight}%`
      )
      .join("\n");
  
    const reasoningText = reasoningOrder
      .map(
        (item, index) =>
          `${index + 1}. ${item}`
      )
      .join("\n");
  
    const focusText = decisionFocus
      .map(
        (item, index) =>
          `${index + 1}. ${item}`
      )
      .join("\n");
  
    return [
      `적용 판단 규칙: ${ruleId}`,
      `질문 주제: ${result.intent}`,
      `핵심 판단 Core: ${primaryCore ?? "currentPhase"}`,
      "",
      "[Core 판단 비중]",
      weightText,
      "",
      "[판단 순서]",
      reasoningText,
      "",
      "[반드시 답해야 할 핵심]",
      focusText,
      "",
      `판단 위험도: ${riskLevel}`,
      `권장 행동 방향: ${recommendedAction}`,
      `최종 판단 초점: ${summaryFocus}`,
    ].join("\n");
  }
  
function buildEntityContext(
    result: ConsultingPipelineResult
  ): string {
    const { entities } = result;
  
    if (!entities.hasOtherPerson || entities.personCount < 2) {
      return "현재 질문은 상담자 본인 중심의 단독 질문입니다.";
    }
  
    const otherPerson = entities.persons.find(
      (person) => person.role !== "self"
    );
  
    if (!otherPerson) {
      return "질문에 다른 인물이 언급되었지만 상대 정보를 구체적으로 확인하지 못했습니다.";
    }
  
    const birthInfo = otherPerson.birthInfo;
  
    const birthParts = [
      birthInfo.year ? `${birthInfo.year}년` : "",
      birthInfo.month ? `${birthInfo.month}월` : "",
      birthInfo.day ? `${birthInfo.day}일` : "",
      birthInfo.birthTime ?? "",
    ].filter(Boolean);
  
    const genderText =
      birthInfo.gender === "female"
        ? "여성"
        : birthInfo.gender === "male"
          ? "남성"
          : "성별 미확인";
  
    return [
      `질문 속 상대 역할: ${otherPerson.role}`,
      `관계 표현: ${otherPerson.relationshipKeyword ?? "확인되지 않음"}`,
      `상대 생년월일 정보: ${
        birthParts.length > 0 ? birthParts.join(" ") : "확인되지 않음"
      }`,
      `상대 성별: ${genderText}`,
      "중요: 현재 단계에서는 질문 속 상대 정보를 인식한 것뿐이며, 상대 사주 계산이나 두 사람의 궁합 계산은 아직 실행되지 않았습니다.",
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
  const entityContext = buildEntityContext(result);

  return [
    previousConversation,
    "[사용자의 현재 질문]",
    result.question,
    "",
    "[개인 사주 판단 자료]",
  coreEvidence,
  "",
  "[질문 속 인물 정보]",
  entityContext,
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
    "질문에 상대방 생년월일이 포함되어 있어도 상대 사주가 실제 계산되지 않았다면 두 사람의 궁합을 본 것처럼 말하지 마십시오.",
    "상대 사주 계산이 없는 상태에서는 상담자 본인의 동업 성향과 일반적인 위험만 설명하고, 상대방과의 실제 궁합 판단은 아직 완료되지 않았다고 분명히 밝히십시오.",
    "상대방을 평가하는 표현이나 두 사람의 합이 좋다, 나쁘다 같은 단정은 실제 궁합 Core가 실행된 경우에만 사용하십시오.",
    "현실적인 조건이나 주의사항은 결론을 설명하는 데 필요한 범위에서만 제시하십시오.",
    "철학관 원장이 눈앞의 상담자에게 이야기하듯 자연스럽고 단정하게 답하십시오.",
  ]
    .filter(Boolean)
    .join("\n");
}