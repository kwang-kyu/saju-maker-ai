/**
 * vNext Prompt Template — System Instruction 및 공통 규칙.
 */

import type {
  PromptStrategy,
} from "../types/responsePrompt.js";

/**
 * promptTemplate 호출 options.
 * 기존 호출부는 생략 가능하며, undefined/false는 기존 guidance를 유지한다.
 */
export type PromptTemplateOptions = {
  engineDecisionLocked?: boolean;
};

/**
 * ResponseContext.engineDecisionLocked를 promptTemplate options로 전달한다.
 * undefined는 true로 취급하지 않으며, 값을 재계산하지 않는다.
 */
export function promptTemplateOptionsFromContext(
  engineDecisionLocked: boolean | undefined,
): PromptTemplateOptions | undefined {
  if (engineDecisionLocked === undefined) {
    return undefined;
  }

  return { engineDecisionLocked };
}

/**
 * engineDecisionLocked === true일 때만 추가되는 Engine Decision Lock 계약.
 * GPT는 explanationOnly이며, Engine 판단을 재계산·대체하지 않는다.
 */
const ENGINE_DECISION_LOCKED_GUIDANCE = [
  "Engine Decision Lock: GPT 역할은 explanationOnly이다. 확정된 최종 판단을 전달하고 설명만 한다.",
  "확정된 최종 판단을 변경하지 않는다. 약화하거나 반대로 바꾸지 않는다.",
  "possibility/direction/confidence로 새로운 verdict를 만들지 않는다.",
  "recommendedDirection / prohibitedDirection을 변경하지 않는다.",
  "facts/evidence/conditions/risks는 설명 근거로만 사용한다. verdict 생성 입력으로 쓰지 않는다.",
  "[확정된 최종 판단] 원문을 답변에 정확히 한 번 포함한다. 원문을 새로운 결론으로 요약하거나 대체하지 않는다.",
  "직접적인 판단을 새로 제시하지 않는다.",
].join("\n");

/** lock ON일 때 CONSULTING_FLOW의 재판단 유도 문구 대체. */
const CONSULTING_FLOW_LOCKED_OPENING =
  "먼저 [확정된 최종 판단] 원문을 전달한 뒤 그 판단을 설명한다.";

const CONSULTING_FLOW_REJUDGE_OPENING =
  "먼저 질문에 대한 직접적인 판단을 제시한다.";

export const GLOBAL_FORBIDDEN_PATTERNS = [
  "새로운 사주 판단",
  "새로운 사주 계산",
  "제공되지 않은 근거 생성",
  "확정되지 않은 사건 단정",
  "투자/법률/의료 전문 판단으로 확대",
  "원본 JSON 데이터 나열",
  "불필요한 사주 전문용어 나열",
  "엔진 판단",
  "Engine 판단",
  "엔진이 판단",
  "엔진이 확정한 최종 판단",
  "Engine이 확정한 최종 판단",
] as const;

export const QUESTION_MODE_FORBIDDEN_STRUCTURES = [
  "결론",
  "근거",
  "주의사항",
  "실행방안",
] as const;

const SYSTEM_ROLE = [
  "너의 역할은 이미 확정된 상담 판단 결과를 자연스러운 상담 언어로 설명하는 것이다.",
  "GPT는 사주를 판단하지 않는다.",
  "GPT는 새로운 사주 계산을 하지 않는다.",
  "GPT는 제공된 ResponseContext에 없는 근거를 새로 만들지 않는다.",
  "제공된 conditions/risk/nextAction을 설명할 때, 그보다 더 구체적인 비용·세금·계산·시장·운영 세부 항목이나 도메인 체크리스트를 새로 만들지 않는다. 상위 개념을 도메인 상식으로 세분화하지 않는다.",
  "기간별 사실의 날짜/구간 label과 theme/summary는 하나의 사실 관계로 취급한다.",
  "한 기간의 theme·근거를 다른 기간의 날짜/label에 붙이거나, 기간별 사실에 없는 날짜별 해석을 새로 만들지 않는다.",
  "시간 흐름을 자연스럽게 연결·통합할 때도 기간별 날짜-의미 매핑은 변경하지 않는다.",
  "GPT는 사건을 단정하거나 예언하지 않는다.",
].join("\n");

const ALLOWED_BEHAVIORS = [
  "제공된 사실을 자연스러운 문장으로 재구성",
  "시간 흐름을 자연스럽게 연결",
  "조건과 위험을 이해하기 쉽게 설명",
  "질문의 의도에 맞게 강조점 조정",
].join("\n");

/** Question Mode 상담형 답변 흐름 — GPT 출력 구조 가이드 */
export const CONSULTING_FLOW_GUIDANCE = [
  "답변은 자연스러운 상담 흐름으로 작성한다.",
  "먼저 질문에 대한 직접적인 판단을 제시한다.",
  "그 다음 판단의 핵심 이유를 설명한다.",
  "이후 제공된 조건과 실제 실행 방향을 구체적으로 연결한다. '구체적으로'는 제공된 내용을 질문에 맞게 연결한다는 뜻이며, 제공되지 않은 세부 항목을 새로 만든다는 뜻이 아니다.",
  "주의해야 할 위험은 앞에서 설명한 내용과 중복하지 않고 별도로 설명한다.",
  "마지막에는 전체 판단을 짧고 분명하게 정리한다.",
  "서로 다른 입력 블록이라도 실질적으로 같은 판단, 조건 또는 실행 방향을 의미하면 각각 설명하지 않고 하나의 상담 내용으로 통합한다.",
  "예: '작게 시작', '소규모 테스트', '초기 비용 제한', '검증 후 확장', '단계적 실행'처럼 같은 전략을 가리키는 정보는 하나의 실행 전략으로 묶어 답변 전체에서 한 번만 충분히 설명한다.",
  "같은 의미를 표현만 바꾸어 반복하지 않는다. 앞 문단에서 이미 설명한 핵심 판단이나 실행 전략을 뒤 문단에서 다시 쓰지 않는다.",
  "하나의 핵심 근거나 방향은 가장 적절한 위치에서 한 번 충분히 설명한다.",
  "이미 설명한 내용을 다시 요약하는 대신, 다음 문단에서는 아직 다루지 않은 제공된 판단 근거나 실행 정보를 제공한다.",
  "각 입력 블록마다 반드시 새로운 문단을 만들지 않는다. 각 입력 블록을 각각 독립된 문단으로 기계적으로 설명하지 않는다. 여러 블록의 정보를 통합하여 자연스러운 상담 흐름으로 설명한다.",
  "마지막 정리에서는 새로운 근거, 새로운 조건, 새로운 실행 전략을 추가하지 않는다. 앞에서 설명한 내용을 바탕으로 최종 판단만 짧고 분명하게 정리한다.",
  "고정된 보고서 제목이나 기계적인 번호 구조를 사용하지 않는다.",
  "자연스러운 상담 문장 흐름으로 작성한다.",
] as const;

/**
 * engineDecisionLocked === true이면 재판단 유도 opening만 lock 전달·설명으로 바꾼다.
 * 전역 삭제가 아니라 조건부 전환이다.
 */
function resolveConsultingFlowGuidance(
  engineDecisionLocked: boolean,
): readonly string[] {
  if (!engineDecisionLocked) {
    return CONSULTING_FLOW_GUIDANCE;
  }

  return CONSULTING_FLOW_GUIDANCE.map((line) => {
    if (line === CONSULTING_FLOW_REJUDGE_OPENING) {
      return CONSULTING_FLOW_LOCKED_OPENING;
    }

    if (line === "마지막에는 전체 판단을 짧고 분명하게 정리한다.") {
      return "마지막에는 앞에서 전달·설명한 확정 판단을 짧고 분명하게 정리한다.";
    }

    if (
      line
      === "마지막 정리에서는 새로운 근거, 새로운 조건, 새로운 실행 전략을 추가하지 않는다. 앞에서 설명한 내용을 바탕으로 최종 판단만 짧고 분명하게 정리한다."
    ) {
      return "마지막 정리에서는 새로운 근거, 새로운 조건, 새로운 실행 전략을 추가하지 않는다. 앞에서 전달·설명한 확정 판단을 짧고 분명하게 정리한다.";
    }

    return line;
  });
}

function buildDecisionSupportGuidance(
  engineDecisionLocked: boolean,
): string {
  if (engineDecisionLocked) {
    return [
      "첫 문장에서 [확정된 최종 판단] 원문을 자연스럽게 전달한다.",
      "제공된 확정 판단을 전달한 뒤 이유 → 조건과 실행 방향 → 위험 → 최종 정리 순으로 자연스럽게 연결한다.",
      "판단, 조건, 위험, 시기를 이해하기 쉽게 연결하되 보고서 제목은 쓰지 않는다.",
      "무조건 추천 또는 무조건 금지 표현을 사용하지 않는다.",
      "같은 근거를 반복하지 않고 각 문단에서 아직 다루지 않은 제공된 실행 정보를 제공한다.",
    ].join("\n");
  }

  return [
    "첫 문장에서 질문에 대한 현재 판단을 자연스럽고 직접적으로 먼저 제시한다.",
    "판단을 먼저 제시한 뒤 이유 → 조건과 실행 방향 → 위험 → 최종 정리 순으로 자연스럽게 연결한다.",
    "판단, 조건, 위험, 시기를 이해하기 쉽게 연결하되 보고서 제목은 쓰지 않는다.",
    "무조건 추천 또는 무조건 금지 표현을 사용하지 않는다.",
    "같은 근거를 반복하지 않고 각 문단에서 아직 다루지 않은 제공된 실행 정보를 제공한다.",
  ].join("\n");
}

function buildStyleGuidance(
  strategy: PromptStrategy,
  options?: PromptTemplateOptions,
): string {
  const engineDecisionLocked = options?.engineDecisionLocked === true;
  let guidance: string;

  switch (strategy.conversationStyle) {
    case "conversational":
      guidance = [
        "자연스러운 상담형 문답 스타일을 사용한다.",
        "정형화된 보고서 제목(결론/근거/주의사항/실행방안)을 매번 강제하지 않는다.",
        "판단 → 이유 → 조건·실행 → 위험 → 정리 순으로 자연스럽게 연결한다.",
        "입력 블록별 기계적 나열 대신 하나의 상담 문장 흐름으로 통합한다.",
      ].join("\n");
      break;
    case "consulting":
      guidance = [
        "상담형 설명을 유지하되, 관계·의미·변화를 연결해 설명한다.",
        "과도한 보고서 형식은 피한다.",
        "판단 → 이유 → 조건·실행 → 위험 → 정리 순으로 자연스럽게 연결한다.",
      ].join("\n");
      break;
    case "decisionSupport":
      guidance = buildDecisionSupportGuidance(engineDecisionLocked);
      break;
    case "analyticalReport":
      guidance = [
        "분석 보고서형 구조를 유지한다.",
        "Blueprint sections 순서를 존중한다.",
      ].join("\n");
      break;
  }

  if (engineDecisionLocked) {
    return `${guidance}\n${ENGINE_DECISION_LOCKED_GUIDANCE}`;
  }

  return guidance;
}

function buildForbiddenSection(strategy: PromptStrategy): string {
  const patterns = [
    ...GLOBAL_FORBIDDEN_PATTERNS,
    ...strategy.forbiddenPatterns,
  ];

  if (strategy.answerMode === "question") {
    patterns.push(
      ...QUESTION_MODE_FORBIDDEN_STRUCTURES.map(
        (item) => `고정 제목 '${item}' 강제 출력`,
      ),
    );
  }

  return patterns.map((item) => `- ${item}`).join("\n");
}

export function buildSystemInstruction(
  strategy: PromptStrategy,
  options?: PromptTemplateOptions,
): string {
  return [
    "[역할]",
    SYSTEM_ROLE,
    "",
    "[답변 목적]",
    strategy.answerGoal,
    "",
    "[대화 스타일]",
    buildStyleGuidance(strategy, options),
    "",
    "[허용]",
    ALLOWED_BEHAVIORS,
    "",
    "[금지]",
    buildForbiddenSection(strategy),
    "",
    "[출력 규칙]",
    "문장 끝이 사주 원문이나 미완성 technical fragment로 끝나지 않도록 한다.",
    "제공된 블록 데이터 밖으로 판단을 확장하지 않는다.",
  ].join("\n");
}

export function buildExplanationRulesSection(
  strategy: PromptStrategy,
  options?: PromptTemplateOptions,
): string {
  const lines = [
    "아래 데이터만 근거로 사용한다.",
    "JSON dump 형태로 나열하지 않는다.",
    `대화 스타일: ${strategy.conversationStyle}`,
  ];

  const engineDecisionLocked = options?.engineDecisionLocked === true;

  if (strategy.answerMode === "question") {
    lines.push(
      ...resolveConsultingFlowGuidance(engineDecisionLocked),
    );
  } else {
    lines.push(
      "Report Mode이므로 구조화된 설명을 허용한다.",
    );
  }

  if (engineDecisionLocked) {
    lines.push(ENGINE_DECISION_LOCKED_GUIDANCE);
  }

  return lines.join("\n");
}
