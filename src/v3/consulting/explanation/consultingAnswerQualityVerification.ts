import {
  runDecisionEngine,
} from "../decision/decisionEngine";

import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture";

import {
  selectReaderDecisionSources,
  type ReaderDecisionSource,
} from "../decision/readerDecisionSelectionBuilder";

import {
  readDecisionResult,
  type DecisionExplanationInput,
} from "./decisionResultReader";

import {
  buildReaderDecisionExplanation,
} from "./readerDecisionExplanationBuilder";

import {
  buildDecisionExplanationPlan,
  type DecisionExplanationPlan,
} from "./decisionExplanationPlan";

import {
  buildDecisionExplanationPayload,
  type DecisionExplanationPayload,
} from "./decisionExplanationPayload";

import {
  buildConsultingPrompt,
  type ConsultingPrompt,
} from "./consultingPromptBuilder";


export type ConsultingAnswerQualityCaseResult = {
  name: string;

  originalQuestion: string;

  expectedSubjectTerms:
    readonly string[];

  verdict: string;

  finalDecision: string;

  selectedReaderSources:
    ReaderDecisionSource[];

  readerEffectSources:
    ReaderDecisionSource[];

  evidenceBlockLineCount:
    number;

  evidenceBlockCharacterLength:
    number;

  includedReaderSources:
    ReaderDecisionSource[];

  prompt: ConsultingPrompt;

  plan: DecisionExplanationPlan;

  payload: DecisionExplanationPayload;

  checks: Record<string, boolean>;

  passed: boolean;
};


export type ConsultingAnswerQualityVerificationResult = {
  cases: ConsultingAnswerQualityCaseResult[];

  crossFixtureChecks: Record<
    string,
    boolean
  >;

  passed: boolean;
};


/**
 * Decision Engine → Explanation Plan → Payload → Prompt
 * 전달 자료의 구조·source-lock·질문별 차이를 검증한다.
 *
 * 이 검증은 실제 GPT 최종 답변을 생성하거나
 * 고객 노출 상담문을 채점하지 않는다.
 *
 * Decision Engine의 판단을 변경하지 않는다.
 *
 * 목적:
 *
 * 1. 질문 원문과 질문 대상이 설명 자료까지 보존되는가
 * 2. 내부 엔진 용어가 설명 자료에 노출되지 않는가
 * 3. 조건과 위험이 엔진 source를 벗어나 새로 만들어지지 않는가
 * 4. 최종 판단이 Engine Verdict와 동일한가
 * 5. GPT 재판단이 차단되어 있는가
 * 6. 설명이 과도하게 반복되지 않는가
 * 7. GPT 설명용 Evidence가 질문 관련 Reader로 제한되는가
 * 8. 서로 다른 질문의 원문·Prompt·Evidence 블록이 동일하지 않은가
 * 9. Prompt가 엔진 최종 결론을 마지막 단락에
 *    원문 그대로 정확히 1회만 쓰도록 강제하는가
 * 10. Prompt가 근거보다 더 구체적인 주장과
 *     도메인 상식 확장을 금지하는가
 */


const READER_SOURCES:
  readonly ReaderDecisionSource[] = [
    "capacity",
    "money",
    "career",
    "relationship",
    "health",
    "blessing",
    "destiny",
  ];


const SUBJECT_EXPLANATION_STEPS:
  readonly DecisionExplanationPlan["blocks"][number]["step"][] = [
    "directAnswer",
    "evidence",
    "conditions",
    "risks",
    "recommendedDirection",
    "prohibitedDirection",
    "finalDecision",
  ];


const QUALITY_FIXTURES = [
  {
    name:
      "money-investment",

    question:
      "여유자금으로 ETF에 투자해도 될까요?",

    expectedSubjectTerms: [
      "ETF",
      "투자",
    ],
  },

  {
    name:
      "real-estate-purchase",

    question:
      "대출 부담이 있는데 상가를 매수해도 될까요?",

    expectedSubjectTerms: [
      "상가",
      "매수",
      "대출",
    ],
  },

  {
    name:
      "real-estate-sale",

    question:
      "보유 중인 건물을 매도해야 하나요?",

    expectedSubjectTerms: [
      "건물",
      "매도",
    ],
  },

  {
    name:
      "business-start",

    question:
      "지금 새로운 사업을 시작해도 될까요?",

    expectedSubjectTerms: [
      "사업",
      "시작",
    ],
  },
] as const;


/**
 * 고객에게 노출되면 안 되는
 * 내부 구현/분류 용어.
 *
 * 실제 상담문에는 엔진의 내부 구조가
 * 나타나서는 안 된다.
 */
const FORBIDDEN_INTERNAL_TERMS = [
  "DecisionEngine",
  "DecisionResult",
  "DecisionEngineInput",
  "QuestionReader",
  "QuestionContext",
  "HumanDestinyContext",
  "HumanLifeContext",
  "readerDecisionEffect",
  "readerEvidence",
  "questionContext",
  "humanContext",
  "actionReadiness",
  "contextAlignment",
  "normalizedQuestion",
  "currentContext",
  "currentPhase",
  "verdict",
  "confidence",
  "GPT",
  "JSON",
  "undefined",
  "null",
] as const;


/**
 * 내부 분류값이 그대로 고객에게 노출되는 것을
 * 방지한다.
 *
 * 단, 일반적인 한국어 단어와 충돌할 수 있는
 * 값은 여기서 강제하지 않는다.
 */
const INTERNAL_CLASSIFICATION_TERMS = [
  "money",
  "realEstate",
  "business",
  "job",
  "relationship",
  "love",
  "marriage",
  "possibility",
  "selection",
  "termination",
  "invest",
  "choose",
  "sell",
  "recommended",
  "conditionallyRecommended",
  "notRecommended",
  "wait",
  "stop",
] as const;


export function countOccurrences(
  value: string,
  target: string,
): number {
  if (!target) {
    return 0;
  }

  return (
    value.split(target).length - 1
  );
}


export function normalize(
  value: string,
): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}


function getPlanContent(
  plan: DecisionExplanationPlan,
): string {
  return plan.blocks
    .map(
      (block) =>
        block.content,
    )
    .join("\n");
}


function getPayloadContent(
  payload: DecisionExplanationPayload,
): string {
  return payload.explanationOrder
    .map(
      (item) =>
        item.content,
    )
    .join("\n");
}


function getPlanBlockContent(
  plan: DecisionExplanationPlan,
  step:
    DecisionExplanationPlan["blocks"][number]["step"],
): string {
  return (
    plan.blocks.find(
      (block) =>
        block.step === step,
    )?.content
    ?? ""
  );
}


function getNonEmptyLines(
  content: string,
): string[] {
  return content
    .split(/\r?\n/)
    .map(
      (line) =>
        line.trim(),
    )
    .filter(Boolean);
}


export function containsForbiddenInternalTerm(
  text: string,
): boolean {
  return [
    ...FORBIDDEN_INTERNAL_TERMS,
    ...INTERNAL_CLASSIFICATION_TERMS,
  ].some(
    (term) =>
      text.includes(term),
  );
}


export function containsTechnicalSyntax(
  text: string,
): boolean {
  return (
    text.includes("{")
    || text.includes("}")
    || text.includes("[object Object]")
    || text.includes("=>")
    || text.includes("=== ")
  );
}


export function promptRequiresVerbatimFinalDecisionLastParagraph(
  prompt: ConsultingPrompt,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "답변의 마지막 단락에는 제공된 엔진 확정 최종 결론을 한 글자도 변경하지 않고 그대로 작성한다",
    )
    && prompt.userPrompt.includes(
      "위 최종 결론을 답변의 마지막 단락에 한 글자도 변경하지 않고 그대로 작성하세요",
    )
  );
}


export function promptRequiresFinalDecisionExactlyOnce(
  prompt: ConsultingPrompt,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "최종 결론은 답변 전체에 정확히 1회만 작성한다",
    )
    && prompt.userPrompt.includes(
      "최종 결론은 답변 전체에 정확히 1회만 작성하세요",
    )
  );
}


export function promptForbidsFinalDecisionPrefix(
  prompt: ConsultingPrompt,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "마지막 단락 앞에 제목, \"최종 판단:\", 따옴표, 목록 기호를 붙이지 않는다",
    )
    && prompt.userPrompt.includes(
      "앞에 제목, 최종 판단:, 따옴표, 목록 기호를 붙이지 마세요",
    )
  );
}


export function promptForbidsRepeatingFinalDecisionInBody(
  prompt: ConsultingPrompt,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "본문에서는 최종 결론 전체 문장을 반복하거나 바꿔 쓰지 않는다",
    )
    && prompt.userPrompt.includes(
      "본문에서는 위 최종 결론 전체 문장을 반복하거나 바꿔 쓰지 마세요",
    )
  );
}


export function promptRequiresSentenceSourceTraceability(
  prompt: ConsultingPrompt,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "상담문의 모든 판단 문장은 원문 질문 또는 제공된 Explanation 자료의 문장과 직접 대응되어야 한다",
    )
    && prompt.userPrompt.includes(
      "모든 판단 문장이 원문 질문 또는 제공된 Explanation 자료의 문장과 직접 대응하는가",
    )
  );
}


export function promptForbidsMoreSpecificClaimsThanSource(
  prompt: ConsultingPrompt,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "제공 근거보다 더 구체적인 하위 항목, 사례, 원인, 결과, 비용 항목, 시장 상황, 사건 가능성을 새로 만들지 않는다",
    )
    && prompt.userPrompt.includes(
      "제공 근거보다 더 구체적인 하위 항목, 사례, 원인, 결과, 비용 항목, 시장 상황, 사건 가능성을 새로 만들지 않았는가",
    )
  );
}


export function promptForbidsUnsupportedDomainExpansion(
  prompt: ConsultingPrompt,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "상위 개념을 도메인 상식으로 구체화하지 않는다",
    )
    && prompt.systemPrompt.includes(
      "재무 점검이 필요하다고만 설명하고 임의의 세부 항목을 나열하지 않는다",
    )
    && prompt.systemPrompt.includes(
      "제공 자료에 없는 조건을 확인해야 한다, 계산해야 한다, 주의해야 한다 형태로 추가하지 않는다",
    )
    && prompt.userPrompt.includes(
      "상위 개념을 도메인 상식으로 구체화하지 않았는가",
    )
    && prompt.userPrompt.includes(
      "재무 점검이 필요하다고만 설명하고 임의의 세부 항목을 나열하지 않았는가",
    )
    && prompt.userPrompt.includes(
      "제공 자료에 없는 조건을 확인해야 한다, 계산해야 한다, 주의해야 한다 형태로 추가하지 않았는가",
    )
  );
}


export function promptOmitsUntraceableClaims(
  prompt: ConsultingPrompt,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "연결어, 존칭, 자연스러운 문장 변환은 허용하지만 새로운 판단 사실이나 명사는 추가하지 않는다",
    )
    && prompt.systemPrompt.includes(
      "근거 대응 여부가 불분명한 문장은 쓰지 않고 생략한다",
    )
    && prompt.userPrompt.includes(
      "연결어, 존칭, 자연스러운 문장 변환 외에 새로운 판단 사실이나 명사를 추가하지 않았는가",
    )
    && prompt.userPrompt.includes(
      "근거 대응 여부가 불분명한 문장은 쓰지 않고 생략했는가",
    )
  );
}


function isReaderDecisionSource(
  source: string,
): source is ReaderDecisionSource {
  return READER_SOURCES.some(
    (item) =>
      item === source,
  );
}


function uniqueReaderSources(
  sources:
    readonly ReaderDecisionSource[],
): ReaderDecisionSource[] {
  const selected:
    ReaderDecisionSource[] = [];

  for (const source of sources) {
    if (
      selected.includes(
        source,
      )
    ) {
      continue;
    }

    selected.push(
      source,
    );
  }

  return selected;
}


function selectExpectedExplanationReaderSources(
  topic:
    DecisionExplanationInput["topic"],
  readerEffectSources:
    readonly ReaderDecisionSource[],
): ReaderDecisionSource[] {
  if (
    readerEffectSources.length
    > 0
  ) {
    return uniqueReaderSources(
      readerEffectSources,
    );
  }

  return selectReaderDecisionSources(
    topic,
  ).slice(
    0,
    2,
  );
}


function collectReaderSummaryEvidence(
  evidence:
    DecisionExplanationInput["evidence"],
): Array<{
  source: ReaderDecisionSource;
  description: string;
}> {
  return evidence.flatMap(
    (item) => {
      if (
        item.importance !== "core"
        || !isReaderDecisionSource(
          item.source,
        )
        || item.description.trim()
          .length === 0
      ) {
        return [];
      }

      return [
        {
          source:
            item.source,
          description:
            item.description,
        },
      ];
    },
  );
}


function collectIncludedReaderSources(
  evidenceBlock: string,
  readerSummaries: Array<{
    source: ReaderDecisionSource;
    description: string;
  }>,
): ReaderDecisionSource[] {
  const included:
    ReaderDecisionSource[] = [];

  for (const item of readerSummaries) {
    if (
      !evidenceBlock.includes(
        item.description,
      )
    ) {
      continue;
    }

    if (
      included.includes(
        item.source,
      )
    ) {
      continue;
    }

    included.push(
      item.source,
    );
  }

  return included;
}


function collectSubjectExplanationText(
  plan: DecisionExplanationPlan,
): string {
  return plan.blocks
    .filter(
      (block) =>
        SUBJECT_EXPLANATION_STEPS.includes(
          block.step,
        ),
    )
    .map(
      (block) =>
        block.content,
    )
    .join("\n");
}


function uniqueNormalizedLines(
  values: readonly string[],
): string[] {
  const unique: string[] = [];

  for (const value of values) {
    const normalizedValue =
      normalize(
        value,
      );

    if (
      !normalizedValue
      || unique.includes(
        normalizedValue,
      )
    ) {
      continue;
    }

    unique.push(
      normalizedValue,
    );
  }

  return unique;
}


export function hasExpectedSubjectTerms(
  expectedSubjectTerms:
    readonly string[],
  explanationText: string,
): boolean {
  if (
    expectedSubjectTerms.length
    === 0
  ) {
    return false;
  }

  return expectedSubjectTerms.every(
    (term) =>
      explanationText.includes(
        term,
      ),
  );
}


function isGeneralDecisionExplanation(
  plan: DecisionExplanationPlan,
): boolean {
  return (
    plan.explanationKind
      !== "roleRecommendation"
    && plan.explanationKind
      !== "lifeFlowInterpretation"
  );
}


function generalDirectAnswerIncludesOriginalQuestion(
  directAnswerContent: string,
  originalQuestion: string,
): boolean {
  const normalizedQuestion =
    normalize(
      originalQuestion,
    );

  if (
    normalizedQuestion.length
    === 0
  ) {
    return false;
  }

  return directAnswerContent.includes(
    normalizedQuestion,
  );
}


function generalDirectAnswerIncludesEngineDirectAnswer(
  directAnswerContent: string,
  engineDirectAnswer: string,
): boolean {
  if (
    engineDirectAnswer.length
    === 0
  ) {
    return false;
  }

  return directAnswerContent.includes(
    engineDirectAnswer,
  );
}


function linesMatchSourceDescriptions(
  lines: readonly string[],
  descriptions: readonly string[],
): boolean {
  const normalizedLines =
    uniqueNormalizedLines(
      lines,
    );

  const normalizedSources =
    uniqueNormalizedLines(
      descriptions,
    );

  if (
    normalizedLines.length
    === 0
  ) {
    return (
      normalizedSources.length
      === 0
    );
  }

  return arraysMatchAsSet(
    normalizedLines,
    normalizedSources,
  );
}


function valuesAreAllDistinct(
  values: readonly string[],
): boolean {
  return (
    values.length > 1
    && new Set(values).size
      === values.length
  );
}


function arraysMatchAsSet<T>(
  actual: readonly T[],
  expected: readonly T[],
): boolean {
  return (
    actual.length === expected.length
    && expected.every(
      (item) =>
        actual.includes(
          item,
        ),
    )
    && actual.every(
      (item) =>
        expected.includes(
          item,
        ),
    )
  );
}


function buildCase(
  name: string,
  originalQuestion: string,
  expectedSubjectTerms:
    readonly string[],
): ConsultingAnswerQualityCaseResult {
  const input =
    buildDecisionEngineRegressionInput({
      questionText:
        originalQuestion,
    });

  const result =
    runDecisionEngine(
      input,
    );

  const explanationInput =
    readDecisionResult(
      result,
    );

  const readerDecisionExplanation =
    buildReaderDecisionExplanation(
      explanationInput,
    );

  const plan =
    buildDecisionExplanationPlan(
      explanationInput,
      input.question.originalQuestion,
    );

  const payload =
    buildDecisionExplanationPayload(
      plan,
    );

  const prompt =
    buildConsultingPrompt(
      payload,
    );

  const planText =
    getPlanContent(plan);

  const payloadText =
    getPayloadContent(payload);

  const userPrompt =
    prompt.userPrompt;

  const finalDecision =
    result.finalDecisionSentence;

  const normalizedQuestion =
    normalize(
      originalQuestion,
    );

  const normalizedPrompt =
    normalize(
      userPrompt,
    );

  const evidenceBlock =
    getPlanBlockContent(
      plan,
      "evidence",
    );

  const conditionLines =
    getNonEmptyLines(
      getPlanBlockContent(
        plan,
        "conditions",
      ),
    );

  const riskLines =
    getNonEmptyLines(
      getPlanBlockContent(
        plan,
        "risks",
      ),
    );

  const readerEffectSources =
    readerDecisionExplanation
      .sources;

  const selectedReaderSources =
    selectExpectedExplanationReaderSources(
      explanationInput.topic,
      readerEffectSources,
    );

  const readerSummaries =
    collectReaderSummaryEvidence(
      explanationInput.evidence,
    );

  const includedReaderSources =
    collectIncludedReaderSources(
      evidenceBlock,
      readerSummaries,
    );

  const expectedIncludedReaderSources =
    uniqueReaderSources(
      readerSummaries
        .filter(
          (item) =>
            selectedReaderSources.includes(
              item.source,
            ),
        )
        .map(
          (item) =>
            item.source,
        ),
    );

  const unselectedReaderSummaries =
    readerSummaries.filter(
      (item) =>
        !selectedReaderSources.includes(
          item.source,
        ),
    );

  const subjectExplanationText =
    collectSubjectExplanationText(
      plan,
    );

  const directAnswerBlockContent =
    getPlanBlockContent(
      plan,
      "directAnswer",
    );

  const checks = {
    /**
     * 질문 원문이 Prompt까지 살아 있어야 한다.
     */
    originalQuestionPreserved:
      userPrompt.includes(
        normalizedQuestion,
      )
      || planText.includes(
        normalizedQuestion,
      ),

    /**
     * 질문 대상이 원문 복사 구간이 아닌
     * 설명 자료에 나타나야 한다.
     * 대상이 없으면 자동 true가 아니다.
     */
    questionSubjectReachesAnswer:
      hasExpectedSubjectTerms(
        expectedSubjectTerms,
        subjectExplanationText,
      ),

    /**
     * 일반 판단 경로의 directAnswer 블록은
     * 정규화된 질문 원문을 포함해야 한다.
     */
    generalDirectAnswerPreservesOriginalQuestion:
      !isGeneralDecisionExplanation(
        plan,
      )
      || generalDirectAnswerIncludesOriginalQuestion(
        directAnswerBlockContent,
        originalQuestion,
      ),

    /**
     * 동일 블록은 엔진 directAnswer를
     * 한 글자도 바꾸지 않고 포함해야 한다.
     */
    generalDirectAnswerPreservesEngineDirectAnswer:
      !isGeneralDecisionExplanation(
        plan,
      )
      || generalDirectAnswerIncludesEngineDirectAnswer(
        directAnswerBlockContent,
        explanationInput.directAnswer,
      ),

    /**
     * 최종 판단이 존재해야 한다.
     */
    finalDecisionExists:
      finalDecision.trim().length > 0,

    /**
     * 최종 판단이 Prompt에 정확히 한 번 전달된다.
     */
    finalDecisionAppearsExactlyOnce:
      countOccurrences(
        userPrompt,
        finalDecision,
      ) === 1,

    /**
     * Payload가 Engine 판단을 변경하지 않는다.
     */
    payloadPreservesVerdict:
      payload.verdict ===
      result.verdict,

    payloadPreservesFinalDecision:
      payload.finalDecision ===
      result.finalDecisionSentence,

    /**
     * GPT가 다시 판단할 수 없어야 한다.
     */
    engineDecisionIsLocked:
      plan.engineDecisionLocked === true
      && plan.gptMayRejudge === false
      && payload.engineDecisionLocked === true
      && payload.gptMayRejudge === false,

    /**
     * 고객에게 내부 구현 용어가 노출되지 않아야 한다.
     */
    planHasNoInternalTerms:
      !containsForbiddenInternalTerm(
        planText,
      ),

    payloadHasNoInternalTerms:
      !containsForbiddenInternalTerm(
        payloadText,
      ),

    promptHasNoInternalTerms:
      !containsForbiddenInternalTerm(
        userPrompt,
      ),

    /**
     * 코드/JSON 같은 기술적 출력이 없어야 한다.
     */
    planHasNoTechnicalSyntax:
      !containsTechnicalSyntax(
        planText,
      ),

    payloadHasNoTechnicalSyntax:
      !containsTechnicalSyntax(
        payloadText,
      ),

    promptHasNoTechnicalSyntax:
      !containsTechnicalSyntax(
        userPrompt,
      ),

    /**
     * 설명이 비어 있으면 안 된다.
     */
    explanationIsNotEmpty:
      normalize(
        planText,
      ).length > 0,

    payloadIsNotEmpty:
      normalize(
        payloadText,
      ).length > 0,

    promptIsNotEmpty:
      normalize(
        normalizedPrompt,
      ).length > 0,

    /**
     * Plan 조건 줄이 엔진 조건 description과
     * 정규화 집합이 같아야 한다.
     * source에 없는 새 문장, 빈 줄, 일부 누락이면 실패한다.
     */
    explanationDoesNotInventConditions:
      linesMatchSourceDescriptions(
        conditionLines,
        explanationInput.conditions.map(
          (condition) =>
            condition.description,
        ),
      ),

    /**
     * Plan 위험 줄이 엔진 위험 description과
     * 정규화 집합이 같아야 한다.
     * source에 없는 새 문장, 빈 줄, 일부 누락이면 실패한다.
     */
    explanationDoesNotInventRisks:
      linesMatchSourceDescriptions(
        riskLines,
        explanationInput.risks.map(
          (risk) =>
            risk.description,
        ),
      ),

    /**
     * 시스템 프롬프트가 판단 변경 금지를 포함한다.
     */
    systemPromptLocksJudgement:
      prompt.systemPrompt.includes(
        "verdict를 변경하지 않는다",
      )
      && prompt.systemPrompt.includes(
        "엔진에 없는 사주 판단이나 미래 예측을 새로 만들지 않는다",
      ),

    /**
     * 질문 중심 원칙이 실제 Prompt에 존재한다.
     */
    systemPromptUsesQuestionCenter:
      prompt.systemPrompt.includes(
        "질문",
      )
      && prompt.systemPrompt.includes(
        "원문",
      ),

    /**
     * 시스템 프롬프트가 질문 관련 성향만
     * 고르라는 규칙을 선언한다.
     */
    systemPromptDeclaresProfileSelectionRule:
      prompt.systemPrompt.includes(
        "사람의 전체 성향을 매번 모두 설명하지 않는다",
      )
      && prompt.systemPrompt.includes(
        "현재 질문의 판단에 실제로 영향을 준 성향과 반복 행동만 골라 설명한다",
      ),

    /**
     * Prompt가 마지막 단락에 엔진 최종 결론을
     * 한 글자도 바꾸지 않고 쓰도록 강제한다.
     */
    promptRequiresVerbatimFinalDecisionLastParagraph:
      promptRequiresVerbatimFinalDecisionLastParagraph(
        prompt,
      ),

    /**
     * Prompt가 최종 결론을 답변 전체에
     * 정확히 1회만 쓰도록 강제한다.
     */
    promptRequiresFinalDecisionExactlyOnce:
      promptRequiresFinalDecisionExactlyOnce(
        prompt,
      ),

    /**
     * Prompt가 마지막 단락 앞의 제목,
     * "최종 판단:", 따옴표, 목록 기호를 금지한다.
     */
    promptForbidsFinalDecisionPrefix:
      promptForbidsFinalDecisionPrefix(
        prompt,
      ),

    /**
     * Prompt가 본문에서 최종 결론 전체 문장의
     * 반복과 바꿔 쓰기를 금지한다.
     */
    promptForbidsRepeatingFinalDecisionInBody:
      promptForbidsRepeatingFinalDecisionInBody(
        prompt,
      ),

    /**
     * Prompt가 모든 판단 문장을 원문 질문 또는
     * 제공된 Explanation 자료 문장에 직접 대응시킨다.
     */
    promptRequiresSentenceSourceTraceability:
      promptRequiresSentenceSourceTraceability(
        prompt,
      ),

    /**
     * Prompt가 제공 근거보다 더 구체적인
     * 하위 항목·사례·원인·결과를 금지한다.
     */
    promptForbidsMoreSpecificClaimsThanSource:
      promptForbidsMoreSpecificClaimsThanSource(
        prompt,
      ),

    /**
     * Prompt가 상위 개념의 도메인 상식 구체화와
     * 없는 조건의 확인·계산·주의 추가를 금지한다.
     */
    promptForbidsUnsupportedDomainExpansion:
      promptForbidsUnsupportedDomainExpansion(
        prompt,
      ),

    /**
     * Prompt가 근거 대응이 불분명한 문장을
     * 생략하고 새 판단 사실·명사 추가를 금지한다.
     */
    promptOmitsUntraceableClaims:
      promptOmitsUntraceableClaims(
        prompt,
      ),

    /**
     * Evidence 블록의 Reader source가
     * 선택 규칙과 일치해야 한다.
     */
    evidenceReaderSourcesMatchSelectionRule:
      arraysMatchAsSet(
        includedReaderSources,
        expectedIncludedReaderSources,
      ),

    /**
     * readerEffectSources가 없을 때
     * Reader summary source는 최대 2개다.
     */
    evidenceReaderSourcesAreLimitedWithoutEffect:
      readerEffectSources.length > 0
      || includedReaderSources.length
        <= 2,

    /**
     * 선택되지 않은 Reader summary description이
     * Evidence 블록에 있으면 실패한다.
     */
    unselectedReaderSummariesAreExcluded:
      unselectedReaderSummaries.every(
        (item) =>
          !evidenceBlock.includes(
            item.description,
          ),
      ),
  };

  return {
    name,

    originalQuestion,

    expectedSubjectTerms: [
      ...expectedSubjectTerms,
    ],

    verdict:
      result.verdict,

    finalDecision,

    selectedReaderSources,

    readerEffectSources,

    evidenceBlockLineCount:
      getNonEmptyLines(
        evidenceBlock,
      ).length,

    evidenceBlockCharacterLength:
      evidenceBlock.length,

    includedReaderSources,

    prompt,

    plan,

    payload,

    checks,

    passed:
      Object.values(checks)
        .every(Boolean),
  };
}


export function verifyConsultingAnswerQuality():
  ConsultingAnswerQualityVerificationResult {
  const cases =
    QUALITY_FIXTURES.map(
      (fixture) =>
        buildCase(
          fixture.name,
          fixture.question,
          fixture.expectedSubjectTerms,
        ),
    );

  const sourceConditionDescriptions = [
    "여유자금을 먼저 확인한다.",
    "분산 비중을 유지한다.",
  ];

  const sourceRiskDescriptions = [
    "손실이 발생하면 회복이 늦다.",
    "자금이 묶일 수 있다.",
  ];

  const crossFixtureChecks = {
    originalQuestionsAreDistinct:
      valuesAreAllDistinct(
        cases.map(
          (item) =>
            item.originalQuestion,
        ),
      ),

    promptsAreDistinct:
      valuesAreAllDistinct(
        cases.map(
          (item) =>
            item.prompt.userPrompt,
        ),
      ),

    evidenceBlocksAreDistinct:
      valuesAreAllDistinct(
        cases.map(
          (item) =>
            getPlanBlockContent(
              item.plan,
              "evidence",
            ),
        ),
      ),

    /**
     * ["ETF", "투자"] 중 "투자"만 있으면
     * 질문 대상 검사를 통과시키지 않는다.
     */
    subjectCheckRejectsPartialExpectedTerms:
      hasExpectedSubjectTerms(
        [
          "ETF",
          "투자",
        ],
        "여유자금 투자 여부를 설명한다.",
      ) === false,

    /**
     * 질문 원문이 없으면
     * directAnswer source-lock을 통과시키지 않는다.
     */
    directAnswerSourceLockRejectsMissingOriginalQuestion:
      generalDirectAnswerIncludesOriginalQuestion(
        "지금 투자 여부를 판단한다.",
        "여유자금으로 ETF에 투자해도 될까요?",
      ) === false,

    /**
     * 엔진 directAnswer가 없으면
     * source-lock을 통과시키지 않는다.
     */
    directAnswerSourceLockRejectsMissingEngineDirectAnswer:
      generalDirectAnswerIncludesEngineDirectAnswer(
        "질문하신 “여유자금으로 ETF에 투자해도 될까요?”에 대한 판단입니다.",
        "지금 투자 여부를 판단한다.",
      ) === false,

    /**
     * source 조건이 있는데 Plan 조건 줄이
     * 비어 있으면 통과시키지 않는다.
     */
    conditionCheckRejectsEmptyLinesWhenSourceExists:
      linesMatchSourceDescriptions(
        [],
        sourceConditionDescriptions,
      ) === false,

    /**
     * source에 없는 조건 문장을 추가하면
     * 통과시키지 않는다.
     */
    conditionCheckRejectsInventedLine:
      linesMatchSourceDescriptions(
        [
          ...sourceConditionDescriptions,
          "source에 없는 새 조건이다.",
        ],
        sourceConditionDescriptions,
      ) === false,

    /**
     * source에 없는 위험 문장을 추가하면
     * 통과시키지 않는다.
     */
    riskCheckRejectsInventedLine:
      linesMatchSourceDescriptions(
        [
          ...sourceRiskDescriptions,
          "source에 없는 새 위험이다.",
        ],
        sourceRiskDescriptions,
      ) === false,

    /**
     * source 조건 중 일부만 전달하면
     * 통과시키지 않는다.
     */
    conditionCheckRejectsPartialSource:
      linesMatchSourceDescriptions(
        [
          sourceConditionDescriptions[0],
        ],
        sourceConditionDescriptions,
      ) === false,

    /**
     * source 위험 중 일부만 전달하면
     * 통과시키지 않는다.
     */
    riskCheckRejectsPartialSource:
      linesMatchSourceDescriptions(
        [
          sourceRiskDescriptions[0],
        ],
        sourceRiskDescriptions,
      ) === false,

    /**
     * 마지막 단락 원문 고정 규칙이 없으면
     * Prompt 검사를 통과시키지 않는다.
     */
    finalDecisionPromptRuleRejectsMissingVerbatimLastParagraph:
      promptRequiresVerbatimFinalDecisionLastParagraph({
        systemPrompt:
          "최종 결론은 답변 전체에 정확히 1회만 작성한다",

        userPrompt:
          "최종 결론은 답변 전체에 정확히 1회만 작성하세요",
      }) === false,

    /**
     * 정확히 1회 작성 규칙이 없으면
     * Prompt 검사를 통과시키지 않는다.
     */
    finalDecisionPromptRuleRejectsMissingExactlyOnce:
      promptRequiresFinalDecisionExactlyOnce({
        systemPrompt:
          "답변의 마지막 단락에는 제공된 엔진 확정 최종 결론을 한 글자도 변경하지 않고 그대로 작성한다",

        userPrompt:
          "위 최종 결론을 답변의 마지막 단락에 한 글자도 변경하지 않고 그대로 작성하세요",
      }) === false,

    /**
     * 제목·최종 판단:·따옴표·목록 기호 금지 규칙이
     * 없으면 Prompt 검사를 통과시키지 않는다.
     */
    finalDecisionPromptRuleRejectsMissingPrefixBan:
      promptForbidsFinalDecisionPrefix({
        systemPrompt:
          "최종 결론은 답변 전체에 정확히 1회만 작성한다",

        userPrompt:
          "최종 결론은 답변 전체에 정확히 1회만 작성하세요",
      }) === false,

    /**
     * 본문 반복·바꿔 쓰기 금지 규칙이 없으면
     * Prompt 검사를 통과시키지 않는다.
     */
    finalDecisionPromptRuleRejectsMissingBodyRepeatBan:
      promptForbidsRepeatingFinalDecisionInBody({
        systemPrompt:
          "최종 결론은 답변 전체에 정확히 1회만 작성한다",

        userPrompt:
          "최종 결론은 답변 전체에 정확히 1회만 작성하세요",
      }) === false,

    /**
     * 문장 근거 대응 규칙이 없으면
     * Prompt 검사를 통과시키지 않는다.
     */
    sentenceSourceTraceabilityRuleRejectsMissingText:
      promptRequiresSentenceSourceTraceability({
        systemPrompt: [
          "제공 근거보다 더 구체적인 하위 항목, 사례, 원인, 결과, 비용 항목, 시장 상황, 사건 가능성을 새로 만들지 않는다",
          "상위 개념을 도메인 상식으로 구체화하지 않는다",
          "재무 점검이 필요하다고만 설명하고 임의의 세부 항목을 나열하지 않는다",
          "제공 자료에 없는 조건을 확인해야 한다, 계산해야 한다, 주의해야 한다 형태로 추가하지 않는다",
          "연결어, 존칭, 자연스러운 문장 변환은 허용하지만 새로운 판단 사실이나 명사는 추가하지 않는다",
          "근거 대응 여부가 불분명한 문장은 쓰지 않고 생략한다",
        ].join("\n"),

        userPrompt: [
          "제공 근거보다 더 구체적인 하위 항목, 사례, 원인, 결과, 비용 항목, 시장 상황, 사건 가능성을 새로 만들지 않았는가",
          "상위 개념을 도메인 상식으로 구체화하지 않았는가",
          "재무 점검이 필요하다고만 설명하고 임의의 세부 항목을 나열하지 않았는가",
          "제공 자료에 없는 조건을 확인해야 한다, 계산해야 한다, 주의해야 한다 형태로 추가하지 않았는가",
          "연결어, 존칭, 자연스러운 문장 변환 외에 새로운 판단 사실이나 명사를 추가하지 않았는가",
          "근거 대응 여부가 불분명한 문장은 쓰지 않고 생략했는가",
        ].join("\n"),
      }) === false,

    /**
     * 더 구체적인 주장 금지 규칙이 없으면
     * Prompt 검사를 통과시키지 않는다.
     */
    moreSpecificClaimBanRuleRejectsMissingText:
      promptForbidsMoreSpecificClaimsThanSource({
        systemPrompt: [
          "상담문의 모든 판단 문장은 원문 질문 또는 제공된 Explanation 자료의 문장과 직접 대응되어야 한다",
          "상위 개념을 도메인 상식으로 구체화하지 않는다",
          "재무 점검이 필요하다고만 설명하고 임의의 세부 항목을 나열하지 않는다",
          "제공 자료에 없는 조건을 확인해야 한다, 계산해야 한다, 주의해야 한다 형태로 추가하지 않는다",
          "연결어, 존칭, 자연스러운 문장 변환은 허용하지만 새로운 판단 사실이나 명사는 추가하지 않는다",
          "근거 대응 여부가 불분명한 문장은 쓰지 않고 생략한다",
        ].join("\n"),

        userPrompt: [
          "모든 판단 문장이 원문 질문 또는 제공된 Explanation 자료의 문장과 직접 대응하는가",
          "상위 개념을 도메인 상식으로 구체화하지 않았는가",
          "재무 점검이 필요하다고만 설명하고 임의의 세부 항목을 나열하지 않았는가",
          "제공 자료에 없는 조건을 확인해야 한다, 계산해야 한다, 주의해야 한다 형태로 추가하지 않았는가",
          "연결어, 존칭, 자연스러운 문장 변환 외에 새로운 판단 사실이나 명사를 추가하지 않았는가",
          "근거 대응 여부가 불분명한 문장은 쓰지 않고 생략했는가",
        ].join("\n"),
      }) === false,

    /**
     * 도메인 상식 구체화 금지 규칙이 없으면
     * Prompt 검사를 통과시키지 않는다.
     */
    unsupportedDomainExpansionBanRuleRejectsMissingText:
      promptForbidsUnsupportedDomainExpansion({
        systemPrompt: [
          "상담문의 모든 판단 문장은 원문 질문 또는 제공된 Explanation 자료의 문장과 직접 대응되어야 한다",
          "제공 근거보다 더 구체적인 하위 항목, 사례, 원인, 결과, 비용 항목, 시장 상황, 사건 가능성을 새로 만들지 않는다",
          "연결어, 존칭, 자연스러운 문장 변환은 허용하지만 새로운 판단 사실이나 명사는 추가하지 않는다",
          "근거 대응 여부가 불분명한 문장은 쓰지 않고 생략한다",
        ].join("\n"),

        userPrompt: [
          "모든 판단 문장이 원문 질문 또는 제공된 Explanation 자료의 문장과 직접 대응하는가",
          "제공 근거보다 더 구체적인 하위 항목, 사례, 원인, 결과, 비용 항목, 시장 상황, 사건 가능성을 새로 만들지 않았는가",
          "연결어, 존칭, 자연스러운 문장 변환 외에 새로운 판단 사실이나 명사를 추가하지 않았는가",
          "근거 대응 여부가 불분명한 문장은 쓰지 않고 생략했는가",
        ].join("\n"),
      }) === false,

    /**
     * 추적 불가 문장 생략 규칙이 없으면
     * Prompt 검사를 통과시키지 않는다.
     */
    untraceableClaimOmissionRuleRejectsMissingText:
      promptOmitsUntraceableClaims({
        systemPrompt: [
          "상담문의 모든 판단 문장은 원문 질문 또는 제공된 Explanation 자료의 문장과 직접 대응되어야 한다",
          "제공 근거보다 더 구체적인 하위 항목, 사례, 원인, 결과, 비용 항목, 시장 상황, 사건 가능성을 새로 만들지 않는다",
          "상위 개념을 도메인 상식으로 구체화하지 않는다",
          "재무 점검이 필요하다고만 설명하고 임의의 세부 항목을 나열하지 않는다",
          "제공 자료에 없는 조건을 확인해야 한다, 계산해야 한다, 주의해야 한다 형태로 추가하지 않는다",
        ].join("\n"),

        userPrompt: [
          "모든 판단 문장이 원문 질문 또는 제공된 Explanation 자료의 문장과 직접 대응하는가",
          "제공 근거보다 더 구체적인 하위 항목, 사례, 원인, 결과, 비용 항목, 시장 상황, 사건 가능성을 새로 만들지 않았는가",
          "상위 개념을 도메인 상식으로 구체화하지 않았는가",
          "재무 점검이 필요하다고만 설명하고 임의의 세부 항목을 나열하지 않았는가",
          "제공 자료에 없는 조건을 확인해야 한다, 계산해야 한다, 주의해야 한다 형태로 추가하지 않았는가",
        ].join("\n"),
      }) === false,
  };

  const passed =
    cases.every(
      (item) =>
        item.passed,
    )
    && Object.values(
      crossFixtureChecks,
    ).every(Boolean);

  return {
    cases,
    crossFixtureChecks,
    passed,
  };
}
