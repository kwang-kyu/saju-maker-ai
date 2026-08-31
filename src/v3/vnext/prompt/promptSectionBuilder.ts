/**
 * vNext Prompt Section Builder.
 *
 * ResponseContext blocks를 GPT가 이해하기 쉬운 Prompt Section으로 변환한다.
 * 전체 JSON dump 금지.
 */

import {
  buildExplanationRulesSection,
} from "./promptTemplate.js";
import type {
  ChangeSignal,
} from "../types/changeSignal.js";
import type {
  PromptSection,
  PromptStrategy,
} from "../types/responsePrompt.js";
import type {
  ResponseBlockContext,
  ResponseContext,
} from "../response/responseContext.js";
import type {
  VNextEvidenceItem,
} from "../types/humanState.js";

const BLOCK_SECTION_TITLES: Record<string, string> = {
  directAnswer: "핵심 답변",
  explanation: "설명",
  evidence: "근거",
  condition: "조건",
  risk: "위험",
  timeDifference: "시기 차이",
  followUpQuestion: "추가 확인",
  periodOverview: "기간 개요",
  earlyPeriod: "초순",
  middlePeriod: "중순",
  latePeriod: "말",
  opportunity: "기회",
  pressure: "압력",
  moneyOrDomainEffect: "금전/영역 영향",
  caution: "주의",
  ability: "역량",
  suitableRole: "적합 역할",
  workingEnvironment: "업무 환경",
  nextAction: "다음 행동",
  connection: "관계 연결",
  conflict: "충돌",
  compatibilityConditions: "조율 조건",
  possibility: "가능성",
  supportingEvidence: "뒷받침 근거",
  limitingFactors: "제한 요인",
  conditions: "조건",
  mainInterpretation: "핵심 해석",
  humanContext: "사주 맥락",
  timeContext: "시간 맥락",
  change: "변화",
  currentDirection: "현재 방향",
  scale: "규모",
  timing: "시기",
  humanState: "사주 상태",
  timeState: "시간 상태",
  changeSignals: "확정된 변화",
  assessment: "판단 요약",
  conclusion: "종합",
};

function formatFactRecord(
  record: Record<string, string | number | boolean | null>,
): string {
  return Object.entries(record)
    .filter(([, value]) => value !== null && value !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function formatSignal(signal: ChangeSignal): string {
  const lines = [
    `- ${signal.type}: ${signal.summary}`,
  ];

  if (signal.direction) {
    lines.push(`  방향: ${signal.direction}`);
  }

  if (signal.strength) {
    lines.push(`  강도: ${signal.strength}`);
  }

  if (signal.timeSegment.label) {
    lines.push(`  구간: ${signal.timeSegment.label}`);
  }

  return lines.join("\n");
}

function formatEvidenceItem(item: VNextEvidenceItem): string {
  return `- ${item.key}: ${item.description}`;
}

function formatBlockContent(
  block: ResponseBlockContext,
  includeEvidence: boolean,
): string {
  const lines: string[] = [];

  for (const fact of block.relevantFacts) {
    const formatted = formatFactRecord(fact);

    if (formatted) {
      lines.push(formatted);
    }
  }

  if (block.relevantSignals.length > 0) {
    lines.push(
      block.relevantSignals.map(formatSignal).join("\n"),
    );
  }

  if (includeEvidence && block.relevantEvidence.length > 0) {
    lines.push(
      block.relevantEvidence.map(formatEvidenceItem).join("\n"),
    );
  }

  if (block.emphasis.length > 0) {
    lines.push(`강조: ${block.emphasis.join(", ")}`);
  }

  return lines.filter(Boolean).join("\n\n");
}

function resolveSectionTitle(blockId: string): string {
  return BLOCK_SECTION_TITLES[blockId] ?? blockId;
}

function buildQuestionSection(
  context: ResponseContext,
): PromptSection {
  return {
    id: "question",
    title: "질문",
    content: context.originalQuestion,
    blockIds: [],
    priority: 0,
  };
}

function buildAnswerGoalSection(
  strategy: PromptStrategy,
): PromptSection {
  return {
    id: "answerGoal",
    title: "답변 목적",
    content: strategy.answerGoal,
    blockIds: [],
    priority: 1,
  };
}

function buildBlockSection(
  block: ResponseBlockContext,
  includeEvidence: boolean,
  priority: number,
): PromptSection {
  return {
    id: block.id,
    title: resolveSectionTitle(block.id),
    content: formatBlockContent(block, includeEvidence),
    blockIds: [block.id],
    priority,
  };
}

function buildExplanationRulesPromptSection(
  strategy: PromptStrategy,
): PromptSection {
  return {
    id: "explanationRules",
    title: "설명 규칙",
    content: buildExplanationRulesSection(strategy),
    blockIds: [],
    priority: 900,
  };
}

/**
 * ResponseContext blocks를 PromptSection 목록으로 변환한다.
 */
export function buildPromptSections(
  context: ResponseContext,
  strategy: PromptStrategy,
  options?: {
    includeEvidence?: boolean;
  },
): PromptSection[] {
  const includeEvidence = options?.includeEvidence ?? false;
  const sections: PromptSection[] = [
    buildQuestionSection(context),
    buildAnswerGoalSection(strategy),
  ];

  context.blocks.forEach((block, index) => {
    const content = formatBlockContent(block, includeEvidence);

    if (!content.trim()) {
      return;
    }

    sections.push(
      buildBlockSection(block, includeEvidence, 10 + index),
    );
  });

  sections.push(buildExplanationRulesPromptSection(strategy));

  return sections;
}

export function renderPromptSections(
  sections: readonly PromptSection[],
): string {
  return sections
    .map((section) => `[${section.title}]\n\n${section.content}`)
    .join("\n\n");
}

export function collectSectionBlockIds(
  sections: readonly PromptSection[],
): string[] {
  const blockIds = new Set<string>();

  for (const section of sections) {
    for (const blockId of section.blockIds) {
      blockIds.add(blockId);
    }
  }

  return [...blockIds];
}
