/**
 * vNext Prompt Section Builder.
 *
 * ResponseContext blocks를 GPT가 이해하기 쉬운 Prompt Section으로 변환한다.
 * 전체 JSON dump 금지.
 */

import type {
  PromptEvidencePolicy,
} from "./promptBudgetController.js";
import {
  buildExplanationRulesSection,
  promptTemplateOptionsFromContext,
  type PromptTemplateOptions,
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
  ResponseQuestionMeaningAxes,
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

function resolveBlockEvidenceLimit(
  blockId: string,
  options?: {
    includeEvidence?: boolean;
    evidencePolicy?: PromptEvidencePolicy;
  },
): number {
  if (options?.evidencePolicy) {
    return options.evidencePolicy.getBlockEvidenceLimit(blockId);
  }

  return options?.includeEvidence ? Number.POSITIVE_INFINITY : 0;
}

function sliceRelevantEvidence(
  relevantEvidence: readonly VNextEvidenceItem[],
  limit: number,
): readonly VNextEvidenceItem[] {
  if (limit === Number.POSITIVE_INFINITY) {
    return relevantEvidence;
  }

  return relevantEvidence.slice(0, limit);
}

/**
 * B4 person-diff priority within a block:
 * evidence (already question-tier ordered) → signals → facts → emphasis.
 *
 * Cross-block condition/risk key dedup was reviewed but deferred:
 * existing per-block prompt-priority contracts expect each block's
 * condition/risk keys to remain complete in that section.
 */
function formatBlockContent(
  block: ResponseBlockContext,
  evidenceLimit: number,
): string {
  const lines: string[] = [];

  const evidenceToSerialize = sliceRelevantEvidence(
    block.relevantEvidence,
    evidenceLimit,
  );

  if (evidenceToSerialize.length > 0) {
    lines.push(
      evidenceToSerialize.map(formatEvidenceItem).join("\n"),
    );
  }

  if (block.relevantSignals.length > 0) {
    lines.push(
      block.relevantSignals.map(formatSignal).join("\n"),
    );
  }

  for (const fact of block.relevantFacts) {
    const formatted = formatFactRecord(fact);

    if (formatted) {
      lines.push(formatted);
    }
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

/**
 * ResponseContext.questionMeaningAxes를 읽기 전용 Prompt 섹션으로 전달한다.
 * 재분류·변환·판단하지 않으며 enum/string 값을 그대로 쓴다.
 * axes가 없으면 섹션을 만들지 않는다.
 */
function formatQuestionMeaningAxesContent(
  axes: ResponseQuestionMeaningAxes,
): string {
  return [
    `- 대상: ${axes.askedObject}`,
    `- 의도: ${axes.intent}`,
    `- 행동: ${axes.actionNature}`,
    `- 결론 성격: ${axes.conclusionNature}`,
    `- 분석 방식: ${axes.analysisMode}`,
    `- 시기 유형: ${axes.timingType}`,
  ].join("\n");
}

function buildQuestionMeaningSection(
  context: ResponseContext,
): PromptSection | null {
  const axes = context.questionMeaningAxes;

  if (!axes) {
    return null;
  }

  return {
    id: "questionMeaning",
    title: "질문 의미",
    content: formatQuestionMeaningAxesContent(axes),
    blockIds: [],
    priority: 1,
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

/**
 * DecisionResult.coreDecision 원문을 명시적 locked decision statement로 전달한다.
 * 재해석·요약하지 않는다.
 */
function buildLockedDecisionSection(
  context: ResponseContext,
): PromptSection | null {
  const statement = context.lockedDecisionStatement;

  if (typeof statement !== "string" || statement.length === 0) {
    return null;
  }

  return {
    id: "lockedDecisionStatement",
    title: "엔진이 확정한 최종 판단",
    content: statement,
    blockIds: [],
    priority: 2,
  };
}

/**
 * DecisionResult.recommendedDirection 원문을 엔진이 정한 권장 방향으로 전달한다.
 * 재해석·요약하지 않는다.
 */
function buildLockedRecommendedDirectionSection(
  context: ResponseContext,
): PromptSection | null {
  const value = context.recommendedDirection;

  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  return {
    id: "lockedRecommendedDirection",
    title: "엔진이 정한 권장 방향",
    content: value,
    blockIds: [],
    priority: 3,
  };
}

/**
 * DecisionResult.prohibitedDirection 원문을 엔진이 정한 금지 방향으로 전달한다.
 * 재해석·요약하지 않는다.
 */
function buildLockedProhibitedDirectionSection(
  context: ResponseContext,
): PromptSection | null {
  const value = context.prohibitedDirection;

  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  return {
    id: "lockedProhibitedDirection",
    title: "엔진이 정한 금지 방향",
    content: value,
    blockIds: [],
    priority: 4,
  };
}

function buildBlockSection(
  block: ResponseBlockContext,
  evidenceLimit: number,
  priority: number,
): PromptSection {
  return {
    id: block.id,
    title: resolveSectionTitle(block.id),
    content: formatBlockContent(block, evidenceLimit),
    blockIds: [block.id],
    priority,
  };
}

function buildExplanationRulesPromptSection(
  strategy: PromptStrategy,
  options?: PromptTemplateOptions,
): PromptSection {
  return {
    id: "explanationRules",
    title: "설명 규칙",
    content: buildExplanationRulesSection(strategy, options),
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
    evidencePolicy?: PromptEvidencePolicy;
  },
): PromptSection[] {
  const sections: PromptSection[] = [
    buildQuestionSection(context),
  ];

  const questionMeaningSection = buildQuestionMeaningSection(context);

  if (questionMeaningSection) {
    sections.push(questionMeaningSection);
  }

  sections.push(buildAnswerGoalSection(strategy));

  const lockedDecisionSection = buildLockedDecisionSection(context);

  if (lockedDecisionSection) {
    sections.push(lockedDecisionSection);
  }

  const lockedRecommendedDirectionSection =
    buildLockedRecommendedDirectionSection(context);

  if (lockedRecommendedDirectionSection) {
    sections.push(lockedRecommendedDirectionSection);
  }

  const lockedProhibitedDirectionSection =
    buildLockedProhibitedDirectionSection(context);

  if (lockedProhibitedDirectionSection) {
    sections.push(lockedProhibitedDirectionSection);
  }

  context.blocks.forEach((block, index) => {
    const evidenceLimit = resolveBlockEvidenceLimit(block.id, options);
    const content = formatBlockContent(block, evidenceLimit);

    if (!content.trim()) {
      return;
    }

    sections.push(
      buildBlockSection(block, evidenceLimit, 10 + index),
    );
  });

  sections.push(
    buildExplanationRulesPromptSection(
      strategy,
      promptTemplateOptionsFromContext(context.engineDecisionLocked),
    ),
  );

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
