import {
  buildConsultingOpenAIRequest,
} from "../openai/consultingOpenAIAdapter";

import {
  containsForbiddenInternalTerm,
  containsTechnicalSyntax,
  countOccurrences,
  hasExpectedSubjectTerms,
  normalize,
  verifyConsultingAnswerQuality,
  type ConsultingAnswerQualityCaseResult,
} from "./consultingAnswerQualityVerification";


export type ConsultingLiveAnswerQualityCaseInput = {
  name: string;

  originalQuestion: string;

  verdict: string;

  finalDecision: string;

  expectedSubjectTerms:
    readonly string[];

  answer: string;
};


export type ConsultingLiveAnswerQualityCaseResult = {
  name: string;

  originalQuestion: string;

  verdict: string;

  finalDecision: string;

  expectedSubjectTerms:
    readonly string[];

  answer: string;

  answerCharacterLength:
    number;

  checks: Record<string, boolean>;

  passed: boolean;
};


export type ConsultingLiveAnswerQualityVerificationResult = {
  cases:
    ConsultingLiveAnswerQualityCaseResult[];

  crossFixtureChecks: Record<
    string,
    boolean
  >;

  deterministicChecksPassed:
    boolean;

  passed: boolean;

  limitations:
    readonly string[];
};


export type ConsultingLiveAnswerQualityNegativeVerificationResult = {
  checks: Record<
    string,
    boolean
  >;

  passed: boolean;
};


const LIVE_ANSWER_QUALITY_LIMITATIONS = [
  "문자열 기반 검사는 GPT가 Evidence 밖의 의미를 새로 만들었는지 완전히 증명하지 못한다.",
  "실제 답변의 의미상 verdict 변경과 근거 발명 여부는 별도 의미 평가가 필요하다.",
] as const;


/**
 * 실제 GPT 상담문을 점검하는 수동 Live Quality Verification.
 *
 * 기본 회귀·build에서는 실행하지 않는다.
 * OpenAI 호출은 이 파일의 live 함수를 수동으로 실행할 때만 발생한다.
 *
 * Decision Engine, Prompt 생산 규칙, Evidence 선택 로직을
 * 변경하지 않는다.
 */


export function containsMarkdownSyntax(
  text: string,
): boolean {
  return (
    text.includes("#")
    || text.includes("**")
    || text.includes("`")
  );
}


export function containsTechnicalSyntaxOrMarkdown(
  text: string,
): boolean {
  return (
    containsTechnicalSyntax(
      text,
    )
    || containsMarkdownSyntax(
      text,
    )
  );
}


export function liveAnswersAreNotAllIdentical(
  answers: readonly string[],
): boolean {
  if (
    answers.length
    <= 1
  ) {
    return false;
  }

  return (
    new Set(
      answers.map(
        (item) =>
          normalize(
            item,
          ),
      ),
    ).size > 1
  );
}


function isOriginalQuestionAddressed(
  answer: string,
  expectedSubjectTerms:
    readonly string[],
): boolean {
  if (
    normalize(
      answer,
    ).length === 0
  ) {
    return false;
  }

  /**
   * 원문 전체를 복사했는지는 요구하지 않는다.
   * 질문 대상 용어가 하나라도 있으면
   * 이 질문이 다뤄진 것으로 기록한다.
   * 모든 대상 용어 존재 여부는
   * allExpectedSubjectTermsArePresent에 따로 기록한다.
   */
  return expectedSubjectTerms.some(
    (term) =>
      answer.includes(
        term,
      ),
  );
}


export function inspectConsultingLiveAnswer(
  input:
    ConsultingLiveAnswerQualityCaseInput,
): ConsultingLiveAnswerQualityCaseResult {
  const expectedSubjectTerms = [
    ...input.expectedSubjectTerms,
  ];

  const answer =
    input.answer;

  const checks = {
    answerIsNotEmpty:
      normalize(
        answer,
      ).length > 0,

    allExpectedSubjectTermsArePresent:
      hasExpectedSubjectTerms(
        expectedSubjectTerms,
        answer,
      ),

    forbiddenInternalTermsAreAbsent:
      !containsForbiddenInternalTerm(
        answer,
      ),

    technicalSyntaxAndMarkdownAreAbsent:
      !containsTechnicalSyntaxOrMarkdown(
        answer,
      ),

    engineFinalDecisionAppearsExactlyOnce:
      countOccurrences(
        answer,
        input.finalDecision,
      ) === 1,

    originalQuestionIsAddressed:
      isOriginalQuestionAddressed(
        answer,
        expectedSubjectTerms,
      ),
  };

  return {
    name:
      input.name,

    originalQuestion:
      input.originalQuestion,

    verdict:
      input.verdict,

    finalDecision:
      input.finalDecision,

    expectedSubjectTerms,

    answer,

    answerCharacterLength:
      answer.length,

    checks,

    passed:
      Object.values(checks)
        .every(Boolean),
  };
}


function buildSyntheticAnswer(
  expectedSubjectTerms:
    readonly string[],
  finalDecision: string,
  extra = "",
): string {
  return [
    expectedSubjectTerms.join(
      " ",
    ),
    "여부를 현재 조건에 맞게 설명합니다.",
    finalDecision,
    extra,
  ]
    .filter(
      (item) =>
        item.trim()
          .length > 0,
    )
    .join(
      " ",
    );
}


function buildNegativeCheckSample(
  materialCase:
    ConsultingAnswerQualityCaseResult,
): ConsultingLiveAnswerQualityCaseInput {
  return {
    name:
      materialCase.name,

    originalQuestion:
      materialCase.originalQuestion,

    verdict:
      materialCase.verdict,

    finalDecision:
      materialCase.finalDecision,

    expectedSubjectTerms:
      materialCase.expectedSubjectTerms,

    answer: "",
  };
}


export function verifyConsultingLiveAnswerQualityNegativeChecks(
  materialCases:
    readonly ConsultingAnswerQualityCaseResult[] =
      verifyConsultingAnswerQuality()
        .cases,
): ConsultingLiveAnswerQualityNegativeVerificationResult {
  const sampleCase =
    materialCases[0];

  const secondCase =
    materialCases[1];

  const thirdCase =
    materialCases[2];

  const fourthCase =
    materialCases[3];

  if (
    !sampleCase
    || !secondCase
    || !thirdCase
    || !fourthCase
  ) {
    return {
      checks: {
        fourFixtureCasesAreAvailable:
          false,
      },

      passed: false,
    };
  }

  const sample =
    buildNegativeCheckSample(
      sampleCase,
    );

  const completeTerms =
    sample.expectedSubjectTerms;

  const missingOneSubjectTerms =
    completeTerms.slice(
      1,
    );

  const missingSubjectResult =
    inspectConsultingLiveAnswer({
      ...sample,

      answer:
        buildSyntheticAnswer(
          missingOneSubjectTerms,
          sample.finalDecision,
        ),
    });

  const internalTermResult =
    inspectConsultingLiveAnswer({
      ...sample,

      answer:
        buildSyntheticAnswer(
          completeTerms,
          sample.finalDecision,
          "DecisionEngine",
        ),
    });

  const markdownResult =
    inspectConsultingLiveAnswer({
      ...sample,

      answer:
        buildSyntheticAnswer(
          completeTerms,
          sample.finalDecision,
          "**중요** # 제목",
        ),
    });

  const jsonResult =
    inspectConsultingLiveAnswer({
      ...sample,

      answer:
        buildSyntheticAnswer(
          completeTerms,
          sample.finalDecision,
          '{ "key": "value" }',
        ),
    });

  const missingFinalDecisionResult =
    inspectConsultingLiveAnswer({
      ...sample,

      answer:
        buildSyntheticAnswer(
          completeTerms,
          "",
        ),
    });

  const duplicateFinalDecisionResult =
    inspectConsultingLiveAnswer({
      ...sample,

      answer:
        buildSyntheticAnswer(
          completeTerms,
          `${sample.finalDecision} ${sample.finalDecision}`,
        ),
    });

  const identicalAnswers = [
    "서로 다른 질문에도 같은 상담문을 반복합니다.",
    "서로 다른 질문에도 같은 상담문을 반복합니다.",
    "서로 다른 질문에도 같은 상담문을 반복합니다.",
    "서로 다른 질문에도 같은 상담문을 반복합니다.",
  ];

  const checks = {
    fourFixtureCasesAreAvailable:
      true,

    subjectCheckRejectsMissingTerm:
      missingSubjectResult
        .checks
        .allExpectedSubjectTermsArePresent
      === false
      && missingSubjectResult.passed
        === false,

    internalTermCheckRejectsForbiddenTerm:
      internalTermResult
        .checks
        .forbiddenInternalTermsAreAbsent
      === false
      && internalTermResult.passed
        === false,

    markdownCheckRejectsMarkdownSyntax:
      markdownResult
        .checks
        .technicalSyntaxAndMarkdownAreAbsent
      === false
      && markdownResult.passed
        === false,

    jsonCheckRejectsTechnicalSyntax:
      jsonResult
        .checks
        .technicalSyntaxAndMarkdownAreAbsent
      === false
      && jsonResult.passed
        === false,

    finalDecisionCheckRejectsMissingDecision:
      missingFinalDecisionResult
        .checks
        .engineFinalDecisionAppearsExactlyOnce
      === false
      && missingFinalDecisionResult.passed
        === false,

    finalDecisionCheckRejectsDuplicateDecision:
      duplicateFinalDecisionResult
        .checks
        .engineFinalDecisionAppearsExactlyOnce
      === false
      && duplicateFinalDecisionResult.passed
        === false,

    identicalAnswersCheckRejectsAllSameAnswers:
      liveAnswersAreNotAllIdentical(
        identicalAnswers,
      ) === false,
  };

  return {
    checks,

    passed:
      Object.values(checks)
        .every(Boolean),
  };
}


function describeFailedMaterialVerification(
  failedCases:
    readonly ConsultingAnswerQualityCaseResult[],
  failedCrossFixtureChecks:
    readonly string[],
): string {
  const caseSummary =
    failedCases
      .map(
        (item) => {
          const failedChecks =
            Object.entries(
              item.checks,
            )
              .filter(
                ([, value]) =>
                  value === false,
              )
              .map(
                ([key]) =>
                  key,
              );

          return `${item.name}: ${failedChecks.join(", ")}`;
        },
      )
      .join("; ");

  const crossSummary =
    failedCrossFixtureChecks.join(
      ", ",
    );

  return [
    caseSummary,
    crossSummary
      ? `crossFixtureChecks: ${crossSummary}`
      : "",
  ]
    .filter(Boolean)
    .join(" | ");
}


function buildLiveCrossFixtureChecks(
  caseResults:
    readonly ConsultingLiveAnswerQualityCaseResult[],
  negativeChecks: Record<
    string,
    boolean
  >,
): Record<string, boolean> {
  return {
    ...negativeChecks,

    actualAnswersAreNotAllIdentical:
      caseResults.length === 4
      && liveAnswersAreNotAllIdentical(
        caseResults.map(
          (item) =>
            item.answer,
        ),
      ),
  };
}


/**
 * 동일한 4개 fixture Prompt를 실제 OpenAI Client에 전달하고
 * 반환된 상담문을 점검한다.
 *
 * 총 API 호출은 fixture당 1회, 합계 4회이며
 * 재시도·병렬 호출을 하지 않는다.
 */
export async function verifyConsultingLiveAnswerQuality():
  Promise<
    ConsultingLiveAnswerQualityVerificationResult
  > {
  const material =
    verifyConsultingAnswerQuality();

  if (
    !material.passed
  ) {
    const failedCases =
      material.cases.filter(
        (item) =>
          !item.passed,
      );

    const failedCrossFixtureChecks =
      Object.entries(
        material.crossFixtureChecks,
      )
        .filter(
          ([, value]) =>
            value === false,
        )
        .map(
          ([key]) =>
            key,
        );

    throw new Error(
      "Deterministic consulting answer quality material verification failed, so OpenAI was not called. "
      + describeFailedMaterialVerification(
        failedCases,
        failedCrossFixtureChecks,
      ),
    );
  }

  const negativeVerification =
    verifyConsultingLiveAnswerQualityNegativeChecks(
      material.cases,
    );

  const {
    requestConsultingAnswer,
  } = await import(
    "../openai/consultingOpenAIClient"
  );

  const cases:
    ConsultingLiveAnswerQualityCaseResult[] = [];

  for (
    const item of material.cases
  ) {
    const request =
      buildConsultingOpenAIRequest(
        item.prompt,
      );

    const answer =
      await requestConsultingAnswer(
        request,
      );

    cases.push(
      inspectConsultingLiveAnswer({
        name:
          item.name,

        originalQuestion:
          item.originalQuestion,

        verdict:
          item.verdict,

        finalDecision:
          item.finalDecision,

        expectedSubjectTerms:
          item.expectedSubjectTerms,

        answer,
      }),
    );
  }

  const crossFixtureChecks =
    buildLiveCrossFixtureChecks(
      cases,
      negativeVerification.checks,
    );

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

    deterministicChecksPassed:
      true,

    passed,

    limitations:
      LIVE_ANSWER_QUALITY_LIMITATIONS,
  };
}
