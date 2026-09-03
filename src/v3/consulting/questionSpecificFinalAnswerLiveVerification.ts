import {
  runConsultingTurn,
} from "./consultingRunner.js";
import {
  buildInitialConsultingExecution,
} from "./initialConsultingExecutionBuilder.js";
import {
  createSourceRequest,
} from "./initialConsultingSessionBuilderVerification.js";
import {
  buildConsultingOpenAIRequest,
} from "./openai/consultingOpenAIAdapter.js";
import {
  containsForbiddenInternalTerm,
  hasExpectedSubjectTerms,
  normalize,
} from "./explanation/consultingAnswerQualityVerification.js";
import {
  containsTechnicalSyntaxOrMarkdown,
  liveAnswersAreNotAllIdentical,
} from "./explanation/consultingLiveAnswerQualityVerification.js";
import {
  QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES,
  textIncludesAllMeaningAnchors,
  verifyQuestionSpecificFinalAnswerInputRegression,
  type QuestionSpecificFinalAnswerInputCase,
  type QuestionSpecificFinalAnswerInputCaseResult,
} from "./questionSpecificFinalAnswerInputRegressionVerification.js";


export type QuestionSpecificFinalAnswerLiveCaseInput = {
  id:
    string;

  originalQuestion:
    string;

  classificationSignatureGroup:
    string;

  meaningAnchorTokens:
    readonly string[];

  finalDecision:
    string;

  answer:
    string;
};


export type QuestionSpecificFinalAnswerLiveCaseResult = {
  id:
    string;

  originalQuestion:
    string;

  classificationSignatureGroup:
    string;

  meaningAnchorTokens:
    readonly string[];

  finalDecision:
    string;

  answer:
    string;

  answerCharacterLength:
    number;

  checks:
    Record<string, boolean>;

  passed:
    boolean;
};


export type QuestionSpecificFinalAnswerLiveVerificationResult = {
  cases:
    QuestionSpecificFinalAnswerLiveCaseResult[];

  crossFixtureChecks:
    Record<
      string,
      boolean
    >;

  deterministicInputRegressionPassed:
    boolean;

  passed:
    boolean;

  limitations:
    readonly string[];
};


export type QuestionSpecificFinalAnswerLiveNegativeVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};


const LIVE_FINAL_ANSWER_MEANING_LIMITATIONS = [
  "문자열·의미 앵커 검사는 GPT가 Evidence 밖의 의미를 새로 만들었는지 완전히 증명하지 못한다.",
  "동일 classification signature 질문의 답변 차별성은 정규화 문자열 비교로만 확인하며, 의미적 동치 여부는 별도 평가가 필요하다.",
  "실제 GPT 답변의 verdict 변경·근거 발명 여부는 Semantic Gate 등 별도 Live Verification이 필요하다.",
  "이 검증은 Engine Decision을 변경하지 않고, 전달된 질문별 의미가 최종 상담문에 유지되는지만 점검한다.",
] as const;


/**
 * 실제 GPT 최종 상담문에서 질문별 의미가 유지되는지 점검하는
 * 수동 Live Verification.
 *
 * 기본 회귀·build에서는 실행하지 않는다.
 * OpenAI 호출은 이 파일의 live 함수를 수동으로 실행할 때만 발생한다.
 *
 * Decision Engine, Question Reader, Prompt 생산 규칙을
 * 변경하지 않는다.
 */


function isOriginalQuestionAddressedByAnchors(
  answer:
    string,
  meaningAnchorTokens:
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
   * 원문 전체 복사는 요구하지 않는다.
   * meaningAnchorTokens 중 하나라도 있으면
   * 이 질문이 다뤄진 것으로 기록한다.
   * 전체 앵커 존재 여부는
   * meaningAnchorsPreservedInAnswer에 따로 기록한다.
   */
  return meaningAnchorTokens.some(
    (token) =>
      answer.includes(
        token,
      ),
  );
}


export function inspectQuestionSpecificFinalAnswerLive(
  input:
    QuestionSpecificFinalAnswerLiveCaseInput,
): QuestionSpecificFinalAnswerLiveCaseResult {
  const meaningAnchorTokens = [
    ...input.meaningAnchorTokens,
  ];

  const answer =
    input.answer;

  const checks = {
    answerIsNotEmpty:
      normalize(
        answer,
      ).length > 0,

    meaningAnchorsPreservedInAnswer:
      textIncludesAllMeaningAnchors(
        answer,
        meaningAnchorTokens,
      ),

    subjectMaterialPreservedInAnswer:
      hasExpectedSubjectTerms(
        meaningAnchorTokens,
        answer,
      ),

    originalQuestionIsAddressed:
      isOriginalQuestionAddressedByAnchors(
        answer,
        meaningAnchorTokens,
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
      input.finalDecision.trim().length
        === 0
      || (
        answer.split(
          input.finalDecision,
        ).length - 1
      ) === 1,
  };

  return {
    id:
      input.id,

    originalQuestion:
      input.originalQuestion,

    classificationSignatureGroup:
      input.classificationSignatureGroup,

    meaningAnchorTokens,

    finalDecision:
      input.finalDecision,

    answer,

    answerCharacterLength:
      answer.length,

    checks,

    passed:
      Object.values(
        checks,
      )
        .every(Boolean),
  };
}


function buildSyntheticAnswer(
  meaningAnchorTokens:
    readonly string[],
  finalDecision:
    string,
  extra = "",
): string {
  return [
    meaningAnchorTokens.join(
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
    QuestionSpecificFinalAnswerInputCaseResult,
  verificationCase:
    QuestionSpecificFinalAnswerInputCase,
): QuestionSpecificFinalAnswerLiveCaseInput {
  return {
    id:
      materialCase.id,

    originalQuestion:
      materialCase.question,

    classificationSignatureGroup:
      verificationCase
        .classificationSignatureGroup,

    meaningAnchorTokens:
      verificationCase
        .meaningAnchorTokens,

    finalDecision:
      "지금은 바로 실행하기보다 준비하며 기다리는 편이 좋습니다.",

    answer: "",
  };
}


export function verifyQuestionSpecificFinalAnswerLiveNegativeChecks(
  materialCases:
    readonly QuestionSpecificFinalAnswerInputCaseResult[] =
      verifyQuestionSpecificFinalAnswerInputRegression()
        .cases,
): QuestionSpecificFinalAnswerLiveNegativeVerificationResult {
  const sampleCase =
    materialCases[0];

  const secondCase =
    materialCases[1];

  const thirdCase =
    materialCases[2];

  if (
    !sampleCase
    || !secondCase
    || !thirdCase
  ) {
    return {
      checks: {
        threeFixtureCasesAreAvailable:
          false,
      },

      passed: false,
    };
  }

  const sampleVerificationCase =
    QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES
      .find(
        (item) =>
          item.id
          === sampleCase.id,
      );

  const secondVerificationCase =
    QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES
      .find(
        (item) =>
          item.id
          === secondCase.id,
      );

  const thirdVerificationCase =
    QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES
      .find(
        (item) =>
          item.id
          === thirdCase.id,
      );

  if (
    !sampleVerificationCase
    || !secondVerificationCase
    || !thirdVerificationCase
  ) {
    return {
      checks: {
        verificationFixturesAreAvailable:
          false,
      },

      passed: false,
    };
  }

  const sample =
    buildNegativeCheckSample(
      sampleCase,
      sampleVerificationCase,
    );

  const completeAnchors =
    sample.meaningAnchorTokens;

  const missingOneAnchor =
    completeAnchors.slice(
      1,
    );

  const emptyAnswerResult =
    inspectQuestionSpecificFinalAnswerLive(
      sample,
    );

  const missingAnchorResult =
    inspectQuestionSpecificFinalAnswerLive({
      ...sample,

      answer:
        buildSyntheticAnswer(
          missingOneAnchor,
          sample.finalDecision,
        ),
    });

  const internalTermResult =
    inspectQuestionSpecificFinalAnswerLive({
      ...sample,

      answer:
        buildSyntheticAnswer(
          completeAnchors,
          sample.finalDecision,
          "DecisionEngine",
        ),
    });

  const markdownResult =
    inspectQuestionSpecificFinalAnswerLive({
      ...sample,

      answer:
        buildSyntheticAnswer(
          completeAnchors,
          sample.finalDecision,
          "**중요** # 제목",
        ),
    });

  const genericCollapsedBusinessAnswer =
    "사업 시작 여부를 현재 조건에 맞게 설명합니다. 지금은 바로 실행하기보다 준비하며 기다리는 편이 좋습니다.";

  const chickenSpecificAnchorMissingResult =
    inspectQuestionSpecificFinalAnswerLive({
      id:
        secondVerificationCase.id,

      originalQuestion:
        secondVerificationCase
          .question,

      classificationSignatureGroup:
        secondVerificationCase
          .classificationSignatureGroup,

      meaningAnchorTokens:
        secondVerificationCase
          .meaningAnchorTokens,

      finalDecision:
        sample.finalDecision,

      answer:
        genericCollapsedBusinessAnswer,
    });

  const identicalAnswers = [
    "서로 다른 질문에도 같은 일반론 상담문을 반복합니다.",
    "서로 다른 질문에도 같은 일반론 상담문을 반복합니다.",
    "서로 다른 질문에도 같은 일반론 상담문을 반복합니다.",
    "서로 다른 질문에도 같은 일반론 상담문을 반복합니다.",
    "서로 다른 질문에도 같은 일반론 상담문을 반복합니다.",
    "서로 다른 질문에도 같은 일반론 상담문을 반복합니다.",
    "서로 다른 질문에도 같은 일반론 상담문을 반복합니다.",
  ];

  const checks = {
    threeFixtureCasesAreAvailable:
      true,

    verificationFixturesAreAvailable:
      true,

    emptyAnswerIsRejected:
      emptyAnswerResult
        .checks
        .answerIsNotEmpty
      === false
      && emptyAnswerResult.passed
        === false,

    anchorCheckRejectsMissingToken:
      missingAnchorResult
        .checks
        .meaningAnchorsPreservedInAnswer
      === false
      && missingAnchorResult.passed
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

    genericBusinessAnswerRejectsChickenSpecificAnchors:
      chickenSpecificAnchorMissingResult
        .checks
        .meaningAnchorsPreservedInAnswer
      === false
      && chickenSpecificAnchorMissingResult.passed
        === false,

    identicalAnswersCheckRejectsAllSameAnswers:
      liveAnswersAreNotAllIdentical(
        identicalAnswers,
      ) === false,
  };

  return {
    checks,

    passed:
      Object.values(
        checks,
      )
        .every(Boolean),
  };
}


function describeFailedInputRegression(
  failedCases:
    readonly QuestionSpecificFinalAnswerInputCaseResult[],
  failedChecks:
    readonly string[],
): string {
  const caseSummary =
    failedCases
      .map(
        (item) => {
          const failedCaseChecks =
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

          return `${item.id}: ${failedCaseChecks.join(", ")}`;
        },
      )
      .join("; ");

  const crossSummary =
    failedChecks.join(
      ", ",
    );

  return [
    caseSummary,
    crossSummary
      ? `crossChecks: ${crossSummary}`
      : "",
  ]
    .filter(Boolean)
    .join(" | ");
}


function buildSameSignatureGroupLiveChecks(
  caseResults:
    readonly QuestionSpecificFinalAnswerLiveCaseResult[],
): Record<
  string,
  boolean
> {
  const groupToCases =
    new Map<
      string,
      QuestionSpecificFinalAnswerLiveCaseResult[]
    >();

  for (
    const caseResult
    of caseResults
  ) {
    const groupedCases =
      groupToCases.get(
        caseResult
          .classificationSignatureGroup,
      )
      ?? [];

    groupedCases.push(
      caseResult,
    );

    groupToCases.set(
      caseResult
        .classificationSignatureGroup,
      groupedCases,
    );
  }

  const checks:
    Record<
      string,
      boolean
    > = {};

  for (
    const [
      group,
      groupedCases,
    ] of groupToCases
  ) {
    if (
      groupedCases.length
      <= 1
    ) {
      continue;
    }

    const normalizedAnswers =
      groupedCases.map(
        (caseResult) =>
          normalize(
            caseResult.answer,
          ),
      );

    checks[
      `sameSignatureGroup_${group}_answersDoNotCollapse`
    ] =
      new Set(
        normalizedAnswers,
      ).size
      === normalizedAnswers.length;

    for (
      const caseResult
      of groupedCases
    ) {
      checks[
        `sameSignatureGroup_${group}_${caseResult.id}_meaningAnchorsPreserved`
      ] =
        caseResult
          .checks
          .meaningAnchorsPreservedInAnswer
        === true;

      checks[
        `sameSignatureGroup_${group}_${caseResult.id}_subjectMaterialPreserved`
      ] =
        caseResult
          .checks
          .subjectMaterialPreservedInAnswer
        === true;
    }
  }

  return checks;
}


function buildLiveCrossFixtureChecks(
  caseResults:
    readonly QuestionSpecificFinalAnswerLiveCaseResult[],
  negativeChecks:
    Record<
      string,
      boolean
    >,
): Record<
  string,
  boolean
> {
  const sameSignatureGroupChecks =
    buildSameSignatureGroupLiveChecks(
      caseResults,
    );

  return {
    ...negativeChecks,

    ...sameSignatureGroupChecks,

    actualAnswersAreNotAllIdentical:
      caseResults.length
      === QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES.length
      && liveAnswersAreNotAllIdentical(
        caseResults.map(
          (item) =>
            item.answer,
        ),
      ),

    allMeaningAnchorsPreservedAcrossCases:
      caseResults.every(
        (item) =>
          item.checks
            .meaningAnchorsPreservedInAnswer
          === true,
      ),

    allSubjectMaterialPreservedAcrossCases:
      caseResults.every(
        (item) =>
          item.checks
            .subjectMaterialPreservedInAnswer
          === true,
      ),
  };
}


/**
 * 동일한 7개 fixture 질문을 실제 OpenAI Client에 전달하고
 * 반환된 최종 상담문에서 질문별 의미가 유지되는지 점검한다.
 *
 * 총 API 호출은 fixture당 1회, 합계 7회이며
 * 재시도·병렬 호출을 하지 않는다.
 */
export async function verifyQuestionSpecificFinalAnswerLive():
  Promise<
    QuestionSpecificFinalAnswerLiveVerificationResult
  > {
  const inputRegression =
    verifyQuestionSpecificFinalAnswerInputRegression();

  if (
    !inputRegression.passed
  ) {
    const failedCases =
      inputRegression.cases.filter(
        (item) =>
          !item.passed,
      );

    const failedCrossChecks =
      Object.entries(
        inputRegression.checks,
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
      "Deterministic question-specific final answer input regression failed, so OpenAI was not called. "
      + describeFailedInputRegression(
        failedCases,
        failedCrossChecks,
      ),
    );
  }

  const negativeVerification =
    verifyQuestionSpecificFinalAnswerLiveNegativeChecks(
      inputRegression.cases,
    );

  const sourceRequest =
    createSourceRequest();

  const initialExecution =
    buildInitialConsultingExecution(
      sourceRequest,
    );

  const humanDestinyPipeline =
    initialExecution
      .humanDestinyPipeline;

  const {
    requestConsultingAnswer,
  } = await import(
    "./openai/consultingOpenAIClient.js"
  );

  const cases:
    QuestionSpecificFinalAnswerLiveCaseResult[] = [];

  for (
    const verificationCase
    of QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES
  ) {
    const runResult =
      runConsultingTurn({
        sajuFacts:
          humanDestinyPipeline
            .sajuFactsPipeline,

        readerEvidence:
          humanDestinyPipeline
            .evidenceBundle,

        humanContext:
          humanDestinyPipeline
            .humanContext,

        lifeContext:
          initialExecution
            .lifeContext,

        question:
          verificationCase
            .question,
      });

    const request =
      buildConsultingOpenAIRequest(
        runResult
          .prompt,
      );

    const answer =
      await requestConsultingAnswer(
        request,
      );

    cases.push(
      inspectQuestionSpecificFinalAnswerLive({
        id:
          verificationCase.id,

        originalQuestion:
          verificationCase
            .question,

        classificationSignatureGroup:
          verificationCase
            .classificationSignatureGroup,

        meaningAnchorTokens:
          verificationCase
            .meaningAnchorTokens,

        finalDecision:
          runResult
            .decisionResult
            .finalDecisionSentence,

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

    deterministicInputRegressionPassed:
      true,

    passed,

    limitations:
      LIVE_FINAL_ANSWER_MEANING_LIMITATIONS,
  };
}
