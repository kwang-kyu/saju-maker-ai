/**
 * vNext Prompt Template — System Instruction 및 공통 규칙.
 */

import type {
  PromptStrategy,
} from "../types/responsePrompt.js";

export const GLOBAL_FORBIDDEN_PATTERNS = [
  "새로운 사주 판단",
  "새로운 사주 계산",
  "제공되지 않은 근거 생성",
  "확정되지 않은 사건 단정",
  "투자/법률/의료 전문 판단으로 확대",
  "원본 JSON 데이터 나열",
  "불필요한 사주 전문용어 나열",
] as const;

export const QUESTION_MODE_FORBIDDEN_STRUCTURES = [
  "결론",
  "근거",
  "주의사항",
  "실행방안",
] as const;

const SYSTEM_ROLE = [
  "너의 역할은 상담 엔진이 이미 판단한 결과를 자연스러운 상담 언어로 설명하는 것이다.",
  "GPT는 사주를 판단하지 않는다.",
  "GPT는 새로운 사주 계산을 하지 않는다.",
  "GPT는 제공된 ResponseContext에 없는 근거를 새로 만들지 않는다.",
  "GPT는 사건을 단정하거나 예언하지 않는다.",
].join("\n");

const ALLOWED_BEHAVIORS = [
  "제공된 사실을 자연스러운 문장으로 재구성",
  "시간 흐름을 자연스럽게 연결",
  "조건과 위험을 이해하기 쉽게 설명",
  "질문의 의도에 맞게 강조점 조정",
].join("\n");

function buildStyleGuidance(strategy: PromptStrategy): string {
  switch (strategy.conversationStyle) {
    case "conversational":
      return [
        "자연스러운 상담형 문답 스타일을 사용한다.",
        "정형화된 보고서 제목(결론/근거/주의사항/실행방안)을 매번 강제하지 않는다.",
        "문장을 자연스럽게 연결해 설명한다.",
      ].join("\n");
    case "consulting":
      return [
        "상담형 설명을 유지하되, 관계·의미·변화를 연결해 설명한다.",
        "과도한 보고서 형식은 피한다.",
      ].join("\n");
    case "decisionSupport":
      return [
        "결론, 조건, 위험, 시기를 이해하기 쉽게 연결한다.",
        "무조건 추천 또는 무조건 금지 표현을 사용하지 않는다.",
      ].join("\n");
    case "analyticalReport":
      return [
        "분석 보고서형 구조를 유지한다.",
        "Blueprint sections 순서를 존중한다.",
      ].join("\n");
  }
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
): string {
  return [
    "[역할]",
    SYSTEM_ROLE,
    "",
    "[답변 목적]",
    strategy.answerGoal,
    "",
    "[대화 스타일]",
    buildStyleGuidance(strategy),
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
): string {
  const lines = [
    "아래 데이터만 근거로 사용한다.",
    "JSON dump 형태로 나열하지 않는다.",
    `대화 스타일: ${strategy.conversationStyle}`,
  ];

  if (strategy.answerMode === "question") {
    lines.push(
      "자연스러운 상담 문장으로 답한다.",
      "고정된 보고서 섹션 제목을 매번 출력하지 않는다.",
    );
  } else {
    lines.push(
      "Report Mode이므로 구조화된 설명을 허용한다.",
    );
  }

  return lines.join("\n");
}
