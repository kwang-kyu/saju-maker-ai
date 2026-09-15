import {
  buildInitialConsultingExecution,
} from "./initialConsultingExecutionBuilder.js";
import {
  createSourceRequest,
} from "./initialConsultingSessionBuilderVerification.js";
import {
  runConsultingTurn,
} from "./consultingRunner.js";
import {
  buildConsultingOpenAIRequest,
} from "./openai/consultingOpenAIAdapter.js";
import type {
  ConsultingOpenAIRequest,
} from "./openai/consultingOpenAIAdapter.js";
import {
  expandAllMeaningCells,
} from "./questionMeaningRegressionFixtures.js";
import type {
  ExpandedQuestionMeaningCase,
} from "./questionMeaningRegressionFixtures.js";
import type {
  HumanDestinyContext,
} from "../types/humanDestinyContext.js";
import {
  readQuestion,
} from "./question/questionReader.js";
import type {
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntent,
  QuestionIntentOrLegacy,
  QuestionTimingType,
  QuestionTopic,
} from "./question/questionReader.js";

type ClassificationExpectation = {
  topic:
    QuestionTopic;

  intent:
    QuestionIntentOrLegacy;

  decisionTarget:
    DecisionTarget;

  timingType?:
    QuestionTimingType;

  analysisMode?:
    QuestionAnalysisMode;
};

export type QuestionSpecificFinalAnswerInputCase = {
  id:
    string;

  question:
    string;

  expected:
    ClassificationExpectation;

  /**
   * OpenAI Request userPrompt에 반드시 남아 있어야 하는
   * 질문 고유 표현(의미 앵커)이다.
   */
  meaningAnchorTokens:
    readonly string[];

  /**
   * topic|intent|decisionTarget|timingType|analysisMode가
   * 같아도 OpenAI Request가 붕괴하지 않아야 하는 그룹이다.
   */
  classificationSignatureGroup:
    string;
};

export type QuestionSpecificFinalAnswerInputCaseResult = {
  id:
    string;

  question:
    string;

  classificationSignatureGroup:
    string;

  classificationSignature:
    string;

  actual: {
    readerOriginalQuestion:
      string;

    planOriginalQuestion:
      string;

    payloadOriginalQuestion:
      string;

    normalizedQuestion:
      string;

    topic:
      QuestionTopic;

    intent:
      QuestionIntent;

    decisionTarget:
      DecisionTarget;

    timingType:
      QuestionTimingType;

    analysisMode:
      QuestionAnalysisMode;

    openAIModel:
      string;
  };

  checks:
    Readonly<Record<string, boolean>>;

  passed:
    boolean;
};

export type QuestionSpecificFinalAnswerInputRegressionVerificationResult = {
  cases:
    QuestionSpecificFinalAnswerInputCaseResult[];

  checks:
    Readonly<Record<string, boolean>>;

  passed:
    boolean;
};

const EXISTING_QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES:
  readonly QuestionSpecificFinalAnswerInputCase[] = [
    {
      id:
        "generic-business-start",

      question:
        "사업을 시작해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "start",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      meaningAnchorTokens: [
        "사업",
        "시작",
      ],

      classificationSignatureGroup:
        "business-possibility-start",
    },
    {
      id:
        "chicken-shop-opening",

      question:
        "통닭집을 개업해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "start",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      meaningAnchorTokens: [
        "통닭집",
        "개업",
      ],

      classificationSignatureGroup:
        "business-possibility-start",
    },
    {
      id:
        "cafe-opening",

      question:
        "카페를 창업해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "start",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      meaningAnchorTokens: [
        "카페",
        "창업",
      ],

      classificationSignatureGroup:
        "business-possibility-start",
    },
    {
      id:
        "business-partnership-start",

      question:
        "지금 동업을 시작해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "partner",

        timingType:
          "executionTiming",

        analysisMode:
          "compatibility",
      },

      meaningAnchorTokens: [
        "동업",
        "시작",
      ],

      classificationSignatureGroup:
        "business-possibility-partner",
    },
    {
      id:
        "youtube-production-partner",

      question:
        "유튜브 영상 제작을 이 사람과 같이 해도 맞을까요?",

      expected: {
        topic:
          "job",

        intent:
          "possibility",

        decisionTarget:
          "partner",

        timingType:
          "unknown",

        analysisMode:
          "compatibility",
      },

      meaningAnchorTokens: [
        "유튜브",
        "영상 제작",
        "이 사람",
      ],

      classificationSignatureGroup:
        "job-possibility-partner",
    },
    {
      id:
        "job-change-judgement",

      question:
        "다른 회사로 이직하는 게 좋을까요?",

      expected: {
        topic:
          "job",

        intent:
          "generalJudgement",

        decisionTarget:
          "changeJob",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      meaningAnchorTokens: [
        "이직",
        "다른 회사",
        "좋을까",
      ],

      classificationSignatureGroup:
        "job-generalJudgement-changeJob",
    },
    {
      id:
        "theater-role-selection",

      question:
        "연극을 한다면 어떤 역할이 좋을까요?",

      expected: {
        topic:
          "job",

        intent:
          "reason",

        decisionTarget:
          "none",

        timingType:
          "unknown",

        analysisMode:
          "interpretation",
      },

      meaningAnchorTokens: [
        "연극",
        "역할",
      ],

      classificationSignatureGroup:
        "job-reason-role",
    },
  ];

export const QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES:
  readonly QuestionSpecificFinalAnswerInputCase[] =
    EXISTING_QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES;

const EXISTING_INLINE_QUESTIONS =
  new Set(
    EXISTING_QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES.map(
      (verificationCase) =>
        verificationCase
          .question
          .trim(),
    ),
  );

/**
 * Reader가 fixture expected와 다른 signature를 내는 group.
 * Final Answer Input Regression에 억지로 포함하지 않는다.
 */
const EXCLUDED_FIXTURE_DISTINCT_MEANING_GROUPS:
  ReadonlySet<
    string
  > = new Set([
    "money-invest-risk",
  ]);

function mapExpandedCaseToFinalAnswerInputCase(
  expandedCase:
    ExpandedQuestionMeaningCase,
): QuestionSpecificFinalAnswerInputCase {
  return {
    id:
      `fixture:${expandedCase.id}`,

    question:
      expandedCase.question,

    expected:
      expandedCase.expected,

    meaningAnchorTokens:
      expandedCase.meaningAnchorTokens,

    classificationSignatureGroup:
      expandedCase
        .classificationSignatureGroup,
  };
}

function fixtureExpectationMatchesReader(
  humanContext:
    HumanDestinyContext,
  expandedCase:
    ExpandedQuestionMeaningCase,
): boolean {
  const result =
    readQuestion(
      humanContext,
      expandedCase
        .question,
    );

  const expected =
    expandedCase.expected;

  const classificationMatched =
    result.topic
      === expected.topic
    && result.intent
      === expected.intent
    && result.decisionTarget
      === expected.decisionTarget
    && result.timingType
      === (
        expected.timingType
        ?? result.timingType
      )
    && result.analysisMode
      === (
        expected.analysisMode
        ?? result.analysisMode
      );

  if (
    !classificationMatched
  ) {
    return false;
  }

  return textIncludesAllMeaningAnchors(
    result
      .normalizedQuestion,
    expandedCase
      .meaningAnchorTokens,
  );
}

function countExistingInlineInSignatureGroup(
  classificationSignatureGroup:
    string,
): number {
  return EXISTING_QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES.filter(
    (verificationCase) =>
      verificationCase
        .classificationSignatureGroup
      === classificationSignatureGroup,
  ).length;
}

type FinalAnswerInputRegressionRunContext = {
  sajuFacts:
    ReturnType<
      typeof buildInitialConsultingExecution
    >["humanDestinyPipeline"]["sajuFactsPipeline"];

  readerEvidence:
    ReturnType<
      typeof buildInitialConsultingExecution
    >["humanDestinyPipeline"]["evidenceBundle"];

  humanContext:
    HumanDestinyContext;

  lifeContext:
    ReturnType<
      typeof buildInitialConsultingExecution
    >["lifeContext"];
};

function fixtureCasePassesFinalAnswerInputRegression(
  runContext:
    FinalAnswerInputRegressionRunContext,
  verificationCase:
    QuestionSpecificFinalAnswerInputCase,
): boolean {
  const runResult =
    runConsultingTurn({
      sajuFacts:
        runContext
          .sajuFacts,

      readerEvidence:
        runContext
          .readerEvidence,

      humanContext:
        runContext
          .humanContext,

      lifeContext:
        runContext
          .lifeContext,

      question:
        verificationCase
          .question,
    });

  const openAIRequest =
    buildConsultingOpenAIRequest(
      runResult
        .prompt,
    );

  return verifyQuestionSpecificFinalAnswerInputCase(
    runResult,
    openAIRequest,
    verificationCase,
  ).passed;
}

/**
 * Shared Fixture에서 Final Answer Input Regression에 연결할 case만 선별한다.
 *
 * - inline case와 동일한 question은 제외
 * - Type B target variant는 항상 후보
 * - target variant가 있는 cell의 canonical도 후보
 * - classificationSignatureGroup에 inline+fixture 합계 2건 이상만 연결
 * - QuestionReader·anchor·consulting pipeline·OpenAI Request와 호환되는 case만 최종 연결
 */
function buildFixtureQuestionSpecificFinalAnswerInputCases(
  runContext:
    FinalAnswerInputRegressionRunContext,
): QuestionSpecificFinalAnswerInputCase[] {
  const allExpandedCases =
    expandAllMeaningCells();

  const readerCompatibleCases =
    allExpandedCases
      .filter(
        (expandedCase) => {
          if (
            EXISTING_INLINE_QUESTIONS.has(
              expandedCase
                .question
                .trim(),
            )
          ) {
            return false;
          }

          if (
            EXCLUDED_FIXTURE_DISTINCT_MEANING_GROUPS.has(
              expandedCase
                .distinctMeaningGroup,
            )
          ) {
            return false;
          }

          if (
            expandedCase
              .variationKind
            === "target"
          ) {
            return true;
          }

          if (
            expandedCase
              .variationKind
            === "canonical"
          ) {
            const cellCases =
              allExpandedCases.filter(
                (item) =>
                  item.cellId
                  === expandedCase
                    .cellId,
              );

            return cellCases.some(
              (item) =>
                item.variationKind
                === "target",
            );
          }

          return false;
        },
      )
      .filter(
        (expandedCase) =>
          fixtureExpectationMatchesReader(
            runContext
              .humanContext,
            expandedCase,
          ),
      );

  const pipelineCompatibleCases =
    readerCompatibleCases
      .map(
        mapExpandedCaseToFinalAnswerInputCase,
      )
      .filter(
        (verificationCase) =>
          fixtureCasePassesFinalAnswerInputRegression(
            runContext,
            verificationCase,
          ),
      );

  const fixtureCountBySignatureGroup =
    new Map<
      string,
      number
    >();

  for (
    const verificationCase
    of pipelineCompatibleCases
  ) {
    const group =
      verificationCase
        .classificationSignatureGroup;

    fixtureCountBySignatureGroup.set(
      group,
      (
        fixtureCountBySignatureGroup.get(
          group,
        )
        ?? 0
      )
      + 1,
    );
  }

  return pipelineCompatibleCases
    .filter(
      (verificationCase) => {
        const group =
          verificationCase
            .classificationSignatureGroup;

        const totalInGroup =
          countExistingInlineInSignatureGroup(
            group,
          )
          + (
            fixtureCountBySignatureGroup.get(
              group,
            )
            ?? 0
          );

        return (
          totalInGroup
          >= 2
        );
      },
    );
}

function buildQuestionSpecificFinalAnswerInputCases(
  runContext:
    FinalAnswerInputRegressionRunContext,
): readonly QuestionSpecificFinalAnswerInputCase[] {
  return [
    ...EXISTING_QUESTION_SPECIFIC_FINAL_ANSWER_INPUT_CASES,

    ...buildFixtureQuestionSpecificFinalAnswerInputCases(
      runContext,
    ),
  ];
}

function buildClassificationSignature(
  values: {
    topic:
      QuestionTopic;

    intent:
      QuestionIntentOrLegacy;

    decisionTarget:
      DecisionTarget;

    timingType:
      QuestionTimingType;

    analysisMode:
      QuestionAnalysisMode;
  },
): string {
  return [
    values.topic,
    values.intent,
    values.decisionTarget,
    values.timingType,
    values.analysisMode,
  ].join(
    "|",
  );
}

export function textIncludesAllMeaningAnchors(
  text:
    string,
  meaningAnchorTokens:
    readonly string[],
): boolean {
  const normalizedText =
    text.toLowerCase();

  return meaningAnchorTokens.every(
    (token) =>
      normalizedText.includes(
        token.toLowerCase(),
      ),
  );
}

function verifyQuestionSpecificFinalAnswerInputCase(
  runResult:
    ReturnType<
      typeof runConsultingTurn
    >,
  openAIRequest:
    ConsultingOpenAIRequest,
  verificationCase:
    QuestionSpecificFinalAnswerInputCase,
): QuestionSpecificFinalAnswerInputCaseResult {
  const consultingPrompt =
    runResult
      .prompt;

  const openAIUserPrompt =
    openAIRequest
      .userPrompt;

  const readerResult =
    runResult
      .questionReaderResult;

  const actualClassification = {
    topic:
      readerResult.topic,

    intent:
      readerResult.intent,

    decisionTarget:
      readerResult.decisionTarget,

    timingType:
      readerResult.timingType,

    analysisMode:
      readerResult.analysisMode,
  };

  const checks = {
    readerOriginalQuestionPreserved:
      readerResult
        .originalQuestion
      === verificationCase
        .question,

    planOriginalQuestionPreserved:
      runResult
        .explanationPlan
        .originalQuestion
      === verificationCase
        .question,

    payloadOriginalQuestionPreserved:
      runResult
        .explanationPayload
        .originalQuestion
      === verificationCase
        .question,

    openAIUserPromptIncludesOriginalQuestion:
      openAIUserPrompt.includes(
        verificationCase
          .question,
      ),

    normalizedQuestionPreservesMeaningAnchors:
      textIncludesAllMeaningAnchors(
        readerResult
          .normalizedQuestion,
        verificationCase
          .meaningAnchorTokens,
      ),

    openAIUserPromptPreservesMeaningAnchors:
      textIncludesAllMeaningAnchors(
        openAIUserPrompt,
        verificationCase
          .meaningAnchorTokens,
      ),

    openAIModelIsConfigured:
      openAIRequest
        .model
      === "gpt-5.5",

    openAISystemPromptMatchesConsultingPrompt:
      openAIRequest
        .systemPrompt
      === consultingPrompt
        .systemPrompt,

    openAIUserPromptMatchesConsultingPrompt:
      openAIUserPrompt
      === consultingPrompt
        .userPrompt,

    topicMatched:
      actualClassification
        .topic
      === verificationCase
        .expected
        .topic,

    intentMatched:
      actualClassification
        .intent
      === verificationCase
        .expected
        .intent,

    decisionTargetMatched:
      actualClassification
        .decisionTarget
      === verificationCase
        .expected
        .decisionTarget,

    timingTypeMatched:
      actualClassification
        .timingType
      === (
        verificationCase
          .expected
          .timingType
        ?? actualClassification
          .timingType
      ),

    analysisModeMatched:
      actualClassification
        .analysisMode
      === (
        verificationCase
          .expected
          .analysisMode
        ?? actualClassification
          .analysisMode
      ),

    openAIUserPromptExcludesRawTopic:
      !openAIUserPrompt.includes(
        `topic: ${
          actualClassification
            .topic
        }`,
      ),

    openAIUserPromptExcludesRawDecisionTarget:
      !openAIUserPrompt.includes(
        `decisionTarget: ${
          actualClassification
            .decisionTarget
        }`,
      ),
  };

  return {
    id:
      verificationCase.id,

    question:
      verificationCase
        .question,

    classificationSignatureGroup:
      verificationCase
        .classificationSignatureGroup,

    classificationSignature:
      buildClassificationSignature(
        actualClassification,
      ),

    actual: {
      readerOriginalQuestion:
        readerResult
          .originalQuestion,

      planOriginalQuestion:
        runResult
          .explanationPlan
          .originalQuestion,

      payloadOriginalQuestion:
        runResult
          .explanationPayload
          .originalQuestion,

      normalizedQuestion:
        readerResult
          .normalizedQuestion,

      ...actualClassification,

      openAIModel:
        openAIRequest
          .model,
    },

    checks,

    passed:
      Object.values(
        checks,
      )
        .every(Boolean),
  };
}

type QuestionSpecificFinalAnswerInputCaseWithOpenAIUserPrompt =
  QuestionSpecificFinalAnswerInputCaseResult & {
    openAIUserPrompt:
      string;
  };

function buildSameSignatureGroupOpenAIChecks(
  caseResults:
    readonly QuestionSpecificFinalAnswerInputCaseWithOpenAIUserPrompt[],
): Record<
  string,
  boolean
> {
  const groupToCases =
    new Map<
      string,
      QuestionSpecificFinalAnswerInputCaseWithOpenAIUserPrompt[]
    >();

  for (
    const caseResult
    of caseResults
  ) {
    const groupCases =
      groupToCases.get(
        caseResult
          .classificationSignatureGroup,
      )
      ?? [] as QuestionSpecificFinalAnswerInputCaseWithOpenAIUserPrompt[];

    groupCases.push(
      caseResult,
    );

    groupToCases.set(
      caseResult
        .classificationSignatureGroup,
      groupCases,
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

    const signatures =
      new Set(
        groupedCases.map(
          (caseResult) =>
            caseResult
              .classificationSignature,
        ),
      );

    checks[
      `sameSignatureGroup_${group}_hasExpectedSharedSignature`
    ] =
      signatures.size
      === 1;

    const originalQuestions =
      groupedCases.map(
        (caseResult) =>
          caseResult
            .question,
      );

    const normalizedQuestions =
      groupedCases.map(
        (caseResult) =>
          caseResult
            .actual
            .normalizedQuestion,
      );

    const openAIUserPrompts =
      groupedCases.map(
        (caseResult) =>
          caseResult
            .openAIUserPrompt,
      );

    checks[
      `sameSignatureGroup_${group}_originalQuestionsStayDistinct`
    ] =
      new Set(
        originalQuestions,
      ).size
      === originalQuestions
        .length;

    checks[
      `sameSignatureGroup_${group}_normalizedQuestionsStayDistinct`
    ] =
      new Set(
        normalizedQuestions,
      ).size
      === normalizedQuestions
        .length;

    checks[
      `sameSignatureGroup_${group}_openAIUserPromptsDoNotCollapse`
    ] =
      new Set(
        openAIUserPrompts,
      ).size
      === openAIUserPrompts.length;

    for (
      const caseResult
      of groupedCases
    ) {
      checks[
        `sameSignatureGroup_${group}_${caseResult.id}_openAIUserPromptIncludesOriginalQuestion`
      ] =
        caseResult
          .checks
          .openAIUserPromptIncludesOriginalQuestion
        === true;

      checks[
        `sameSignatureGroup_${group}_${caseResult.id}_openAIUserPromptPreservesMeaningAnchors`
      ] =
        caseResult
          .checks
          .openAIUserPromptPreservesMeaningAnchors
        === true;
    }
  }

  return checks;
}

export function verifyQuestionSpecificFinalAnswerInputRegression():
  QuestionSpecificFinalAnswerInputRegressionVerificationResult {
  const sourceRequest =
    createSourceRequest();

  const initialExecution =
    buildInitialConsultingExecution(
      sourceRequest,
    );

  const humanDestinyPipeline =
    initialExecution
      .humanDestinyPipeline;

  const runContext:
    FinalAnswerInputRegressionRunContext = {
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
  };

  const regressionCases =
    buildQuestionSpecificFinalAnswerInputCases(
      runContext,
    );

  const caseResults =
    regressionCases.map(
      (verificationCase) => {
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

        const openAIRequest =
          buildConsultingOpenAIRequest(
            runResult
              .prompt,
          );

        return {
          ...verifyQuestionSpecificFinalAnswerInputCase(
            runResult,
            openAIRequest,
            verificationCase,
          ),

          openAIUserPrompt:
            openAIRequest
              .userPrompt,
        };
      },
    );

  const openAIUserPrompts =
    caseResults.map(
      (caseResult) =>
        caseResult
          .openAIUserPrompt,
    );

  const originalQuestions =
    caseResults.map(
      (caseResult) =>
        caseResult
          .question,
    );

  const normalizedQuestions =
    caseResults.map(
      (caseResult) =>
        caseResult
          .actual
          .normalizedQuestion,
    );

  const sameSignatureGroupChecks =
    buildSameSignatureGroupOpenAIChecks(
      caseResults,
    );

  const checks = {
    allCasesPassed:
      caseResults.every(
        (caseResult) =>
          caseResult
            .passed,
      ),

    allOriginalQuestionsAreUnique:
      new Set(
        originalQuestions,
      ).size
      === originalQuestions
        .length,

    allNormalizedQuestionsAreUnique:
      new Set(
        normalizedQuestions,
      ).size
      === normalizedQuestions
        .length,

    allOpenAIUserPromptsAreUnique:
      new Set(
        openAIUserPrompts,
      ).size
      === openAIUserPrompts.length,

    allOpenAIUserPromptsIncludeTheirOriginalQuestion:
      caseResults.every(
        (caseResult) =>
          caseResult
            .checks
            .openAIUserPromptIncludesOriginalQuestion
          === true,
      ),

    originalQuestionPreservedThroughPipelineToOpenAIRequest:
      caseResults.every(
        (caseResult) =>
          caseResult
            .checks
            .readerOriginalQuestionPreserved
          === true
          && caseResult
            .checks
            .planOriginalQuestionPreserved
          === true
          && caseResult
            .checks
            .payloadOriginalQuestionPreserved
          === true
          && caseResult
            .checks
            .openAIUserPromptIncludesOriginalQuestion
          === true,
      ),

    meaningAnchorsPreservedInOpenAIUserPrompt:
      caseResults.every(
        (caseResult) =>
          caseResult
            .checks
            .openAIUserPromptPreservesMeaningAnchors
          === true,
      ),

    openAIAdapterPreservesConsultingPrompt:
      caseResults.every(
        (caseResult) =>
          caseResult
            .checks
            .openAIUserPromptMatchesConsultingPrompt
          === true
          && caseResult
            .checks
            .openAISystemPromptMatchesConsultingPrompt
          === true,
      ),

    businessStartGroupDoesNotCollapseAtOpenAIRequest:
      sameSignatureGroupChecks[
        "sameSignatureGroup_business-possibility-start_openAIUserPromptsDoNotCollapse"
      ]
      === true,

    ...sameSignatureGroupChecks,
  };

  return {
    cases:
      caseResults.map(
        ({
          openAIUserPrompt:
            _openAIUserPrompt,

          ...caseResult
        }) =>
          caseResult,
      ),

    checks,

    passed:
      Object.values(
        checks,
      )
        .every(Boolean),
  };
}
