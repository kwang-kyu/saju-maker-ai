import {
  runDecisionEngine,
} from "../decision/decisionEngine";

import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture";

import type {
  QuestionTopic,
} from "../question/questionReader";

import {
  readDecisionResult,
} from "./decisionResultReader";

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

import {
  containsForbiddenInternalTerm,
  containsTechnicalSyntax,
  countOccurrences,
  hasExpectedSubjectTerms,
  normalize,
  promptForbidsFinalDecisionPrefix,
  promptForbidsMoreSpecificClaimsThanSource,
  promptForbidsRepeatingFinalDecisionInBody,
  promptForbidsUnsupportedDomainExpansion,
  promptOmitsUntraceableClaims,
  promptRequiresFinalDecisionExactlyOnce,
  promptRequiresSentenceSourceTraceability,
  promptRequiresVerbatimFinalDecisionLastParagraph,
} from "./consultingAnswerQualityVerification";


export type ConsultingAnswerTopicCoverageCaseResult = {
  name: string;

  originalQuestion: string;

  expectedTopic:
    QuestionTopic;

  actualTopic:
    QuestionTopic;

  expectedSubjectTerms:
    readonly string[];

  verdict: string;

  finalDecision: string;

  checks: Record<
    string,
    boolean
  >;

  passed: boolean;
};


export type ConsultingAnswerTopicCoverageVerificationResult = {
  cases:
    ConsultingAnswerTopicCoverageCaseResult[];

  crossFixtureChecks: Record<
    string,
    boolean
  >;

  negativeChecks: Record<
    string,
    boolean
  >;

  passed: boolean;

  limitations:
    readonly string[];
};


/**
 * Decision Engine → Explanation Plan → Payload → Prompt
 * 경로에서, 기존 Answer Quality fixture에 없는
 * 질문 주제가 보존되는지 검증한다.
 *
 * 이 검증은 실제 GPT 최종 답변을 생성하지 않는다.
 * 질문 의미 해석 OpenAI를 호출하지 않는다.
 *
 * 질문 문구나 expectedTopic을 자동 통과시키려고
 * 바꾸지 않는다. Reader가 다르게 분류하면 실패한다.
 */


const EXPECTED_TOPIC_COVERAGE_CASE_COUNT =
  8;

const FINAL_DECISION_SECTION_TITLE =
  "엔진이 확정한 최종 결론";


const TOPIC_COVERAGE_FIXTURES = [
  {
    name:
      "job",

    question:
      "현재 직장을 옮겨 이직해도 될까요?",

    expectedTopic:
      "job" as const,

    expectedSubjectTerms: [
      "직장",
      "이직",
    ],
  },

  {
    name:
      "relationship",

    question:
      "오래된 친구와 관계를 계속 이어가야 할까요?",

    expectedTopic:
      "relationship" as const,

    expectedSubjectTerms: [
      "친구",
      "관계",
    ],
  },

  {
    name:
      "love",

    question:
      "지금 만나는 사람과 연애를 계속해도 될까요?",

    expectedTopic:
      "love" as const,

    expectedSubjectTerms: [
      "사람",
      "연애",
    ],
  },

  {
    name:
      "marriage",

    question:
      "현재 연인과 결혼을 결정해도 될까요?",

    expectedTopic:
      "marriage" as const,

    expectedSubjectTerms: [
      "연인",
      "결혼",
    ],
  },

  {
    name:
      "family",

    question:
      "가족과 생긴 갈등에 어떻게 대응해야 할까요?",

    expectedTopic:
      "family" as const,

    expectedSubjectTerms: [
      "가족",
      "갈등",
    ],
  },

  {
    name:
      "health",

    question:
      "요즘 체력이 떨어지는데 건강 관리를 어떻게 해야 할까요?",

    expectedTopic:
      "health" as const,

    expectedSubjectTerms: [
      "체력",
      "건강",
    ],
  },

  {
    name:
      "legal",

    question:
      "계약 분쟁에 지금 대응해야 할까요?",

    expectedTopic:
      "legal" as const,

    expectedSubjectTerms: [
      "계약",
      "분쟁",
    ],
  },

  {
    name:
      "lifeDirection",

    question:
      "제 인생의 방향을 어떻게 잡아야 할까요?",

    expectedTopic:
      "lifeDirection" as const,

    expectedSubjectTerms: [
      "인생",
      "방향",
    ],
  },
] as const;


const TOPIC_COVERAGE_LIMITATIONS = [
  "이 검증은 실제 GPT 최종 답변을 생성하거나 고객 노출 상담문을 채점하지 않는다.",
  "질문 의미 해석 OpenAI를 호출하지 않으며 Question Reader의 현재 분류 결과를 그대로 보고한다.",
  "OpenAI, Supabase, 배포 HTTP를 호출하지 않는다.",
] as const;


type TopicCoverageCaseMaterial = {
  name: string;

  originalQuestion: string;

  expectedTopic:
    QuestionTopic;

  actualTopic:
    QuestionTopic;

  expectedSubjectTerms:
    readonly string[];

  verdict: string;

  finalDecision: string;

  userPrompt: string;

  prompt: ConsultingPrompt;

  planText: string;

  payloadText: string;

  planExplanationText: string;

  inputOriginalQuestion: string;

  planOriginalQuestion: string;

  payloadOriginalQuestion: string;

  inputTopic:
    QuestionTopic;

  planTopic:
    QuestionTopic;

  payloadTopic:
    QuestionTopic;

  planEngineDecisionLocked: boolean;

  payloadEngineDecisionLocked: boolean;

  planGptMayRejudge: boolean;

  payloadGptMayRejudge: boolean;
};


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


function valuesAreAllDistinct(
  values: readonly string[],
): boolean {
  return (
    values.length > 1
    && new Set(values).size
      === values.length
  );
}


export function topicMatchesExpected(
  actualTopic: string,
  expectedTopic: string,
): boolean {
  return actualTopic === expectedTopic;
}


export function originalQuestionIsPreserved(
  originalQuestion: string,
  inputOriginalQuestion: string,
  planOriginalQuestion: string,
  payloadOriginalQuestion: string,
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

  return (
    normalize(
      inputOriginalQuestion,
    ) === normalizedQuestion
    && normalize(
      planOriginalQuestion,
    ) === normalizedQuestion
    && normalize(
      payloadOriginalQuestion,
    ) === normalizedQuestion
  );
}


export function userPromptContainsOriginalQuestion(
  userPrompt: string,
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

  return userPrompt.includes(
    normalizedQuestion,
  );
}


export function expectedSubjectTermsAreNonEmpty(
  expectedSubjectTerms:
    readonly string[],
): boolean {
  return expectedSubjectTerms.length > 0;
}


export function finalDecisionExists(
  finalDecision: string,
): boolean {
  return finalDecision.trim().length > 0;
}


export function finalDecisionAppearsExactlyOnce(
  userPrompt: string,
  finalDecision: string,
): boolean {
  if (
    !finalDecisionExists(
      finalDecision,
    )
  ) {
    return false;
  }

  return (
    countOccurrences(
      userPrompt,
      finalDecision,
    ) === 1
  );
}


export function promptHasFinalDecisionSectionTitle(
  prompt: ConsultingPrompt,
): boolean {
  return prompt.userPrompt.includes(
    FINAL_DECISION_SECTION_TITLE,
  );
}


export function hasExactTopicCoverageCaseCount(
  cases: readonly unknown[],
): boolean {
  return (
    cases.length
    === EXPECTED_TOPIC_COVERAGE_CASE_COUNT
  );
}


function evaluateCaseChecks(
  material: TopicCoverageCaseMaterial,
): Record<
  string,
  boolean
> {
  return {
    originalQuestionPreserved:
      originalQuestionIsPreserved(
        material.originalQuestion,
        material.inputOriginalQuestion,
        material.planOriginalQuestion,
        material.payloadOriginalQuestion,
      ),

    inputTopicMatchesExpected:
      topicMatchesExpected(
        material.inputTopic,
        material.expectedTopic,
      ),

    planTopicMatchesExpected:
      topicMatchesExpected(
        material.planTopic,
        material.expectedTopic,
      ),

    payloadTopicMatchesExpected:
      topicMatchesExpected(
        material.payloadTopic,
        material.expectedTopic,
      ),

    expectedSubjectTermsAreNonEmpty:
      expectedSubjectTermsAreNonEmpty(
        material.expectedSubjectTerms,
      ),

    expectedSubjectTermsReachPlan:
      hasExpectedSubjectTerms(
        material.expectedSubjectTerms,
        material.planExplanationText,
      ),

    userPromptContainsOriginalQuestion:
      userPromptContainsOriginalQuestion(
        material.userPrompt,
        material.originalQuestion,
      ),

    finalDecisionExists:
      finalDecisionExists(
        material.finalDecision,
      ),

    finalDecisionAppearsExactlyOnce:
      finalDecisionAppearsExactlyOnce(
        material.userPrompt,
        material.finalDecision,
      ),

    engineDecisionLocked:
      material.planEngineDecisionLocked === true
      && material.payloadEngineDecisionLocked === true,

    gptMayRejudgeIsFalse:
      material.planGptMayRejudge === false
      && material.payloadGptMayRejudge === false,

    planHasNoInternalTerms:
      !containsForbiddenInternalTerm(
        material.planText,
      ),

    payloadHasNoInternalTerms:
      !containsForbiddenInternalTerm(
        material.payloadText,
      ),

    promptHasNoInternalTerms:
      !containsForbiddenInternalTerm(
        material.userPrompt,
      ),

    planHasNoTechnicalSyntax:
      !containsTechnicalSyntax(
        material.planText,
      ),

    payloadHasNoTechnicalSyntax:
      !containsTechnicalSyntax(
        material.payloadText,
      ),

    promptHasNoTechnicalSyntax:
      !containsTechnicalSyntax(
        material.userPrompt,
      ),

    promptHasFinalDecisionSectionTitle:
      promptHasFinalDecisionSectionTitle(
        material.prompt,
      ),

    promptRequiresVerbatimFinalDecisionLastParagraph:
      promptRequiresVerbatimFinalDecisionLastParagraph(
        material.prompt,
      ),

    promptRequiresFinalDecisionExactlyOnce:
      promptRequiresFinalDecisionExactlyOnce(
        material.prompt,
      ),

    promptForbidsFinalDecisionPrefix:
      promptForbidsFinalDecisionPrefix(
        material.prompt,
      ),

    promptForbidsRepeatingFinalDecisionInBody:
      promptForbidsRepeatingFinalDecisionInBody(
        material.prompt,
      ),

    promptRequiresSentenceSourceTraceability:
      promptRequiresSentenceSourceTraceability(
        material.prompt,
      ),

    promptForbidsMoreSpecificClaimsThanSource:
      promptForbidsMoreSpecificClaimsThanSource(
        material.prompt,
      ),

    promptForbidsUnsupportedDomainExpansion:
      promptForbidsUnsupportedDomainExpansion(
        material.prompt,
      ),

    promptOmitsUntraceableClaims:
      promptOmitsUntraceableClaims(
        material.prompt,
      ),
  };
}


function evaluateCrossFixtureChecks(
  cases: ReadonlyArray<{
    originalQuestion: string;

    expectedTopic: string;

    userPrompt: string;

    passed: boolean;
  }>,
): Record<
  string,
  boolean
> {
  return {
    hasExactEightCases:
      hasExactTopicCoverageCaseCount(
        cases,
      ),

    expectedTopicsAreDistinct:
      valuesAreAllDistinct(
        cases.map(
          (item) =>
            item.expectedTopic,
        ),
      ),

    originalQuestionsAreDistinct:
      valuesAreAllDistinct(
        cases.map(
          (item) =>
            normalize(
              item.originalQuestion,
            ),
        ),
      ),

    userPromptsAreDistinct:
      valuesAreAllDistinct(
        cases.map(
          (item) =>
            normalize(
              item.userPrompt,
            ),
        ),
      ),

    allCasesPassed:
      cases.length > 0
      && cases.every(
        (item) =>
          item.passed,
      ),
  };
}


function buildCaseMaterial(
  name: string,
  originalQuestion: string,
  expectedTopic: QuestionTopic,
  expectedSubjectTerms:
    readonly string[],
): TopicCoverageCaseMaterial {
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

  return {
    name,

    originalQuestion,

    expectedTopic,

    actualTopic:
      input.question.topic,

    expectedSubjectTerms: [
      ...expectedSubjectTerms,
    ],

    verdict:
      result.verdict,

    finalDecision:
      result.finalDecisionSentence,

    userPrompt:
      prompt.userPrompt,

    prompt,

    planText,

    payloadText,

    planExplanationText:
      planText,

    inputOriginalQuestion:
      input.question.originalQuestion,

    planOriginalQuestion:
      plan.originalQuestion,

    payloadOriginalQuestion:
      payload.originalQuestion,

    inputTopic:
      input.question.topic,

    planTopic:
      plan.topic,

    payloadTopic:
      payload.topic,

    planEngineDecisionLocked:
      plan.engineDecisionLocked,

    payloadEngineDecisionLocked:
      payload.engineDecisionLocked,

    planGptMayRejudge:
      plan.gptMayRejudge,

    payloadGptMayRejudge:
      payload.gptMayRejudge,
  };
}


function toCaseResult(
  material: TopicCoverageCaseMaterial,
): ConsultingAnswerTopicCoverageCaseResult {
  const checks =
    evaluateCaseChecks(
      material,
    );

  return {
    name:
      material.name,

    originalQuestion:
      material.originalQuestion,

    expectedTopic:
      material.expectedTopic,

    actualTopic:
      material.actualTopic,

    expectedSubjectTerms:
      material.expectedSubjectTerms,

    verdict:
      material.verdict,

    finalDecision:
      material.finalDecision,

    checks,

    passed:
      Object.values(checks)
        .every(Boolean),
  };
}


function evaluateNegativeChecks(
  materials: readonly TopicCoverageCaseMaterial[],
  caseResults: readonly ConsultingAnswerTopicCoverageCaseResult[],
): Record<
  string,
  boolean
> {
  const firstMaterial =
    materials[0];

  const firstCase =
    caseResults[0];

  if (
    !firstMaterial
    || !firstCase
  ) {
    return {
      wrongExpectedTopicFails:
        false,

      missingSubjectTermFails:
        false,

      emptySubjectTermsFail:
        false,

      missingOriginalQuestionInPromptFails:
        false,

      finalDecisionMissingFromPromptFails:
        false,

      finalDecisionRepeatedInPromptFails:
        false,

      identicalPromptsFailCrossCheck:
        false,

      missingCaseFailsEightCaseContract:
        false,

      duplicateCaseFailsUniqueTopicContract:
        false,
    };
  }

  const otherExpectedTopic =
    firstMaterial.expectedTopic === "job"
      ? "health"
      : "job";

  const wrongTopicChecks =
    evaluateCaseChecks({
      ...firstMaterial,
      expectedTopic:
        otherExpectedTopic,
    });

  const explanationMissingOneSubjectTerm =
    firstMaterial.expectedSubjectTerms[0]
    ?? "";

  const promptWithoutOriginalQuestion =
    firstMaterial.userPrompt.replaceAll(
      firstMaterial.originalQuestion,
      "",
    );

  const promptWithoutFinalDecision =
    firstMaterial.userPrompt.replaceAll(
      firstMaterial.finalDecision,
      "",
    );

  const promptWithRepeatedFinalDecision =
    [
      firstMaterial.userPrompt,
      firstMaterial.finalDecision,
    ].join(
      "\n",
    );

  const identicalPromptCases =
    caseResults.map(
      (item, index) => ({
        originalQuestion:
          materials[index]
            ?.originalQuestion
          ?? item.originalQuestion,

        expectedTopic:
          item.expectedTopic,

        userPrompt:
          firstMaterial.userPrompt,

        passed:
          item.passed,
      }),
    );

  const missingCase =
    caseResults.slice(
      0,
      -1,
    ).map(
      (item, index) => ({
        originalQuestion:
          materials[index]
            ?.originalQuestion
          ?? item.originalQuestion,

        expectedTopic:
          item.expectedTopic,

        userPrompt:
          materials[index]
            ?.userPrompt
          ?? "",

        passed:
          item.passed,
      }),
    );

  const duplicateCase = [
    ...caseResults.map(
      (item, index) => ({
        originalQuestion:
          materials[index]
            ?.originalQuestion
          ?? item.originalQuestion,

        expectedTopic:
          item.expectedTopic,

        userPrompt:
          materials[index]
            ?.userPrompt
          ?? "",

        passed:
          item.passed,
      }),
    ),
    {
      originalQuestion:
        firstCase.originalQuestion,

      expectedTopic:
        firstCase.expectedTopic,

      userPrompt:
        firstMaterial.userPrompt,

      passed:
        firstCase.passed,
    },
  ];

  return {
    wrongExpectedTopicFails:
      wrongTopicChecks.inputTopicMatchesExpected === false
      && wrongTopicChecks.planTopicMatchesExpected === false
      && wrongTopicChecks.payloadTopicMatchesExpected === false,

    missingSubjectTermFails:
      hasExpectedSubjectTerms(
        firstMaterial.expectedSubjectTerms,
        explanationMissingOneSubjectTerm,
      ) === false,

    emptySubjectTermsFail:
      expectedSubjectTermsAreNonEmpty(
        [],
      ) === false
      && hasExpectedSubjectTerms(
        [],
        firstMaterial.planExplanationText,
      ) === false,

    missingOriginalQuestionInPromptFails:
      userPromptContainsOriginalQuestion(
        promptWithoutOriginalQuestion,
        firstMaterial.originalQuestion,
      ) === false,

    finalDecisionMissingFromPromptFails:
      finalDecisionAppearsExactlyOnce(
        promptWithoutFinalDecision,
        firstMaterial.finalDecision,
      ) === false,

    finalDecisionRepeatedInPromptFails:
      finalDecisionAppearsExactlyOnce(
        promptWithRepeatedFinalDecision,
        firstMaterial.finalDecision,
      ) === false,

    identicalPromptsFailCrossCheck:
      evaluateCrossFixtureChecks(
        identicalPromptCases,
      ).userPromptsAreDistinct === false,

    missingCaseFailsEightCaseContract:
      evaluateCrossFixtureChecks(
        missingCase,
      ).hasExactEightCases === false,

    duplicateCaseFailsUniqueTopicContract:
      evaluateCrossFixtureChecks(
        duplicateCase,
      ).expectedTopicsAreDistinct === false,
  };
}


export function verifyConsultingAnswerTopicCoverage():
  ConsultingAnswerTopicCoverageVerificationResult {
  const materials =
    TOPIC_COVERAGE_FIXTURES.map(
      (fixture) =>
        buildCaseMaterial(
          fixture.name,
          fixture.question,
          fixture.expectedTopic,
          fixture.expectedSubjectTerms,
        ),
    );

  const cases =
    materials.map(
      (material) =>
        toCaseResult(
          material,
        ),
    );

  const crossFixtureChecks =
    evaluateCrossFixtureChecks(
      materials.map(
        (material, index) => ({
          originalQuestion:
            material.originalQuestion,

          expectedTopic:
            material.expectedTopic,

          userPrompt:
            material.userPrompt,

          passed:
            cases[index]?.passed === true,
        }),
      ),
    );

  const negativeChecks =
    evaluateNegativeChecks(
      materials,
      cases,
    );

  const passed =
    cases.every(
      (item) =>
        item.passed,
    )
    && Object.values(
      crossFixtureChecks,
    ).every(Boolean)
    && Object.values(
      negativeChecks,
    ).every(Boolean);

  return {
    cases,
    crossFixtureChecks,
    negativeChecks,
    passed,
    limitations:
      TOPIC_COVERAGE_LIMITATIONS,
  };
}
