import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture.js";

import {
  runDecisionEngine,
} from "../decision/decisionEngine.js";

import type {
  DecisionResult,
} from "../decision/decisionTypes.js";

import {
  buildQuestionContext,
} from "../question/questionContextBuilder.js";

import {
  readQuestion,
  type ConclusionNature,
} from "../question/questionReader.js";

import {
  readDecisionResult,
  type DecisionExplanationInput,
} from "./decisionResultReader.js";

import {
  buildDecisionExplanationPlan,
  type DecisionExplanationPlan,
} from "./decisionExplanationPlan.js";

import {
  buildDecisionExplanationPayload,
  type DecisionExplanationPayload,
} from "./decisionExplanationPayload.js";

import {
  buildConsultingPrompt,
  type ConsultingPrompt,
} from "./consultingPromptBuilder.js";

import {
  CONCLUSION_NATURE_E2E_MANDATORY_CASES,
  type ConclusionNatureE2EQuestionGroup,
  type ConclusionNatureE2EMandatoryCase,
} from "../decision/conclusionNatureE2EVerification.js";

/**
 * consultingPromptBuilder.ts buildConclusionNatureSystemRules() 제목과 동일.
 */
const CONCLUSION_NATURE_SYSTEM_RULE_TITLES:
  Readonly<
    Record<
      ConclusionNature,
      string
    >
  > = {
    decision:
      "결론 성격: 실행·선택 판단 설명 원칙",

    interpretation:
      "결론 성격: 의미·구조 해석 설명 원칙",

    recommendation:
      "결론 성격: 적합성·추천 설명 원칙",

    warning:
      "결론 성격: 위험·주의 설명 원칙",

    prediction:
      "결론 성격: 가능성·흐름 설명 원칙",

    existence:
      "결론 성격: 존재 여부 설명 원칙",
  };

/**
 * consultingPromptBuilder.ts CONCLUSION_NATURE_KOREAN_LABELS와 동일.
 */
const CONCLUSION_NATURE_KOREAN_LABELS:
  Readonly<
    Record<
      ConclusionNature,
      string
    >
  > = {
    decision:
      "확정된 실행·선택 판단을 설명",

    interpretation:
      "의미와 구조를 해석",

    recommendation:
      "적합성과 추천 이유를 설명",

    warning:
      "위험·주의·반복 패턴을 설명",

    prediction:
      "가능성·흐름·변화 방향을 설명",

    existence:
      "운·구조의 존재 여부를 설명",
  };

const ALL_CONCLUSION_NATURES:
  readonly ConclusionNature[] = [
    "decision",
    "interpretation",
    "recommendation",
    "warning",
    "prediction",
    "existence",
  ];

export type ConclusionNatureExplanationTrace = {
  question:
    ConclusionNature;

  decisionResult:
    ConclusionNature;

  explanationInput:
    ConclusionNature;

  plan:
    ConclusionNature;

  payload:
    ConclusionNature;
};

export type ConclusionNatureExplanationE2ECaseChecks = {
  decisionResultMatchesExpected:
    boolean;

  explanationInputMatchesExpected:
    boolean;

  planMatchesExpected:
    boolean;

  payloadMatchesExpected:
    boolean;

  traceIsFullyConsistent:
    boolean;

  systemPromptIncludesExpectedRuleTitle:
    boolean;

  systemPromptExcludesOtherRuleTitles:
    boolean;

  userPromptIncludesConclusionNatureLabel:
    boolean;

  userPromptIncludesKoreanLabel:
    boolean;
};

export type ConclusionNatureExplanationE2ECaseResult = {
  id:
    string;

  group:
    ConclusionNatureE2EQuestionGroup;

  question:
    string;

  expectedConclusionNature:
    ConclusionNature;

  conclusionNatureTrace:
    ConclusionNatureExplanationTrace;

  checks:
    ConclusionNatureExplanationE2ECaseChecks;

  passed:
    boolean;
};

export type ConclusionNatureExplanationE2EVerificationResult = {
  cases:
    ConclusionNatureExplanationE2ECaseResult[];

  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

function getOtherConclusionNatureRuleTitles(
  nature:
    ConclusionNature,
): readonly string[] {
  return ALL_CONCLUSION_NATURES
    .filter(
      (item) =>
        item
        !== nature,
    )
    .map(
      (item) =>
        CONCLUSION_NATURE_SYSTEM_RULE_TITLES[
          item
        ],
    );
}

function isTraceFullyConsistent(
  trace:
    ConclusionNatureExplanationTrace,
): boolean {
  return (
    trace.question
    === trace.decisionResult
    && trace.decisionResult
    === trace.explanationInput
    && trace.explanationInput
    === trace.plan
    && trace.plan
    === trace.payload
  );
}

function buildCaseChecks(
  expectedConclusionNature:
    ConclusionNature,
  trace:
    ConclusionNatureExplanationTrace,
  prompt:
    ConsultingPrompt,
): ConclusionNatureExplanationE2ECaseChecks {
  const expectedRuleTitle =
    CONCLUSION_NATURE_SYSTEM_RULE_TITLES[
      expectedConclusionNature
    ];

  const expectedKoreanLabel =
    CONCLUSION_NATURE_KOREAN_LABELS[
      expectedConclusionNature
    ];

  const otherRuleTitles =
    getOtherConclusionNatureRuleTitles(
      expectedConclusionNature,
    );

  return {
    decisionResultMatchesExpected:
      trace.decisionResult
      === expectedConclusionNature,

    explanationInputMatchesExpected:
      trace.explanationInput
      === expectedConclusionNature,

    planMatchesExpected:
      trace.plan
      === expectedConclusionNature,

    payloadMatchesExpected:
      trace.payload
      === expectedConclusionNature,

    traceIsFullyConsistent:
      isTraceFullyConsistent(
        trace,
      ),

    systemPromptIncludesExpectedRuleTitle:
      prompt.systemPrompt.includes(
        expectedRuleTitle,
      ),

    systemPromptExcludesOtherRuleTitles:
      otherRuleTitles.every(
        (title) =>
          !prompt.systemPrompt.includes(
            title,
          ),
      ),

    userPromptIncludesConclusionNatureLabel:
      prompt.userPrompt.includes(
        "결론 성격:",
      ),

    userPromptIncludesKoreanLabel:
      prompt.userPrompt.includes(
        expectedKoreanLabel,
      ),
  };
}

function buildCaseResult(
  testCase:
    ConclusionNatureE2EMandatoryCase,
): ConclusionNatureExplanationE2ECaseResult {
  const input =
    buildDecisionEngineRegressionInput({
      questionText:
        testCase.question,
    });

  const question =
    readQuestion(
      input.humanContext,
      testCase.question,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const decisionResult:
    DecisionResult =
    runDecisionEngine({
      ...input,
      question,
      questionContext,
    });

  const explanationInput:
    DecisionExplanationInput =
    readDecisionResult(
      decisionResult,
    );

  const plan:
    DecisionExplanationPlan =
    buildDecisionExplanationPlan(
      explanationInput,
      question.originalQuestion,
      questionContext,
    );

  const payload:
    DecisionExplanationPayload =
    buildDecisionExplanationPayload(
      plan,
    );

  const prompt =
    buildConsultingPrompt(
      payload,
      undefined,
      questionContext,
    );

  const conclusionNatureTrace:
    ConclusionNatureExplanationTrace = {
      question:
        question.conclusionNature,

      decisionResult:
        decisionResult.conclusionNature,

      explanationInput:
        explanationInput.conclusionNature,

      plan:
        plan.conclusionNature,

      payload:
        payload.conclusionNature,
    };

  const checks =
    buildCaseChecks(
      testCase.expectedConclusionNature,
      conclusionNatureTrace,
      prompt,
    );

  return {
    id:
      testCase.id,

    group:
      testCase.group,

    question:
      testCase.question,

    expectedConclusionNature:
      testCase.expectedConclusionNature,

    conclusionNatureTrace,

    checks,

    passed:
      Object
        .values(checks)
        .every(Boolean),
  };
}

function flattenChecks(
  cases:
    readonly ConclusionNatureExplanationE2ECaseResult[],
): Record<
  string,
  boolean
> {
  const checks: Record<
    string,
    boolean
  > = {};

  for (const caseResult of cases) {
    for (const [
      key,
      value,
    ] of Object.entries(
      caseResult.checks,
    )) {
      checks[
        `${caseResult.id}_${key}`
      ] = value;
    }
  }

  return checks;
}

/**
 * ConclusionNature explanation E2E 검증.
 *
 * QuestionReader → DecisionEngine → DecisionResult → DecisionExplanationInput
 * → DecisionExplanationPlan → DecisionExplanationPayload → ConsultingPrompt
 * 전체 경로에서 conclusionNature 유지와 Prompt 규칙 전달을 검증한다.
 */
export function verifyConclusionNatureExplanationE2E():
  ConclusionNatureExplanationE2EVerificationResult {
  const cases =
    CONCLUSION_NATURE_E2E_MANDATORY_CASES.map(
      buildCaseResult,
    );

  const checks =
    flattenChecks(cases);

  return {
    cases,

    checks,

    passed:
      Object
        .values(checks)
        .every(Boolean),
  };
}
