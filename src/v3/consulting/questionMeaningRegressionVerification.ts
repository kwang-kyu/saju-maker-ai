import {
  buildDecisionEngineRegressionInput,
} from "./decision/regression/decisionEngineRegressionFixture.js";
import {
  expandAllMeaningCells,
} from "./questionMeaningRegressionFixtures.js";
import type {
  ExpandedQuestionMeaningCase,
} from "./questionMeaningRegressionFixtures.js";
import {
  readQuestion,
} from "./question/questionReader.js";
import type {
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntentOrLegacy,
  QuestionReaderResult,
  QuestionTimingType,
  QuestionTopic,
} from "./question/questionReader.js";

type QuestionMeaningExpectation = {
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

type QuestionMeaningRegressionCase = {
  id:
    string;

  question:
    string;

  expected:
    QuestionMeaningExpectation;

  /**
   * normalizedQuestion에 반드시 남아 있어야 하는
   * 질문 고유 표현(의미 앵커)이다.
   */
  meaningAnchorTokens:
    readonly string[];

  /**
   * 서로 다른 group은 Reader 의미 signature가
   * 달라야 한다.
   */
  distinctMeaningGroup:
    string;
};

export type QuestionMeaningRegressionCaseResult = {
  id:
    string;

  question:
    string;

  distinctMeaningGroup:
    string;

  meaningSignature:
    string;

  actual:
    Pick<
      QuestionReaderResult,
      | "originalQuestion"
      | "normalizedQuestion"
      | "topic"
      | "intent"
      | "decisionTarget"
      | "timingType"
      | "analysisMode"
      | "asksWhat"
      | "decisionQuestion"
      | "humanContextReceived"
    >;

  checks:
    Readonly<Record<string, boolean>>;

  passed:
    boolean;
};

export type QuestionMeaningRegressionVerificationResult = {
  cases:
    QuestionMeaningRegressionCaseResult[];

  checks:
    Readonly<Record<string, boolean>>;

  passed:
    boolean;
};

const QUESTION_MEANING_REGRESSION_CASES:
  readonly QuestionMeaningRegressionCase[] = [
    {
      id:
        "business-start-feasibility",

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
        "해도 될까",
      ],

      distinctMeaningGroup:
        "business-start",
    },
    {
      id:
        "business-start-now",

      question:
        "지금 사업을 시작해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "start",

        timingType:
          "executionTiming",

        analysisMode:
          "decision",
      },

      meaningAnchorTokens: [
        "지금",
        "사업",
        "시작",
      ],

      distinctMeaningGroup:
        "business-start-now",
    },
    {
      id:
        "business-timing-search",

      question:
        "사업은 언제 시작하는 것이 좋을까요?",

      expected: {
        topic:
          "business",

        intent:
          "timing",

        decisionTarget:
          "start",

        timingType:
          "bestTiming",

        analysisMode:
          "decision",
      },

      meaningAnchorTokens: [
        "언제",
        "사업",
        "시작",
      ],

      distinctMeaningGroup:
        "business-timing",
    },
    {
      id:
        "business-fit-recommendation",

      question:
        "어떤 사업이 저에게 맞을까요?",

      expected: {
        topic:
          "business",

        intent:
          "possibility",

        decisionTarget:
          "none",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      meaningAnchorTokens: [
        "어떤",
        "사업",
        "맞을까",
      ],

      distinctMeaningGroup:
        "business-fit-recommendation",
    },
    {
      id:
        "business-option-comparison",

      question:
        "A사업과 B사업 중 무엇이 더 맞을까요?",

      expected: {
        topic:
          "business",

        intent:
          "comparison",

        decisionTarget:
          "none",

        timingType:
          "unknown",

        analysisMode:
          "selection",
      },

      meaningAnchorTokens: [
        "a사업",
        "b사업",
        "무엇이 더",
      ],

      distinctMeaningGroup:
        "business-option-comparison",
    },
    {
      id:
        "business-continuation",

      question:
        "지금 하던 사업을 계속해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "continuation",

        decisionTarget:
          "continue",

        timingType:
          "executionTiming",

        analysisMode:
          "decision",
      },

      meaningAnchorTokens: [
        "계속",
        "사업",
      ],

      distinctMeaningGroup:
        "business-continuation",
    },
    {
      id:
        "business-specific-opening",

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

      distinctMeaningGroup:
        "business-start",
    },
    {
      id:
        "business-partner-compatibility",

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

      distinctMeaningGroup:
        "business-partner-compatibility",
    },
    {
      id:
        "business-year-timing",

      question:
        "올해 사업 시작해도 될까요?",

      expected: {
        topic:
          "business",

        intent:
          "timing",

        decisionTarget:
          "start",

        timingType:
          "bestTiming",

        analysisMode:
          "decision",
      },

      meaningAnchorTokens: [
        "올해",
        "사업",
        "시작",
      ],

      distinctMeaningGroup:
        "business-timing",
    },
    {
      id:
        "job-change-possibility",

      question:
        "다른 회사로 이직하는 게 가능할까요?",

      expected: {
        topic:
          "job",

        intent:
          "possibility",

        decisionTarget:
          "changeJob",

        timingType:
          "unknown",

        analysisMode:
          "decision",
      },

      meaningAnchorTokens: [
        "이직",
        "가능",
      ],

      distinctMeaningGroup:
        "job-change-possibility",
    },
  ];

const EXISTING_INLINE_QUESTIONS =
  new Set(
    QUESTION_MEANING_REGRESSION_CASES.map(
      (verificationCase) =>
        verificationCase
          .question
          .trim(),
    ),
  );

const EXISTING_INLINE_DISTINCT_MEANING_GROUPS =
  new Set(
    QUESTION_MEANING_REGRESSION_CASES.map(
      (verificationCase) =>
        verificationCase
          .distinctMeaningGroup,
    ),
  );

function mapExpandedCaseToRegressionCase(
  expandedCase:
    ExpandedQuestionMeaningCase,
): QuestionMeaningRegressionCase {
  return {
    id:
      `fixture:${expandedCase.id}`,

    question:
      expandedCase.question,

    expected:
      expandedCase.expected,

    meaningAnchorTokens:
      expandedCase.meaningAnchorTokens,

    distinctMeaningGroup:
      expandedCase.distinctMeaningGroup,
  };
}

/**
 * Reader가 fixture expected와 다른 signature를 내는 group.
 * distinctMeaningGroup boundary 검증 collapse를 피하기 위해 fixture 연결에서 제외한다.
 */
const EXCLUDED_FIXTURE_DISTINCT_MEANING_GROUPS:
  ReadonlySet<
    string
  > = new Set([
    "money-invest-risk",
  ]);

function fixtureExpectationMatchesReader(
  humanContext:
    ReturnType<
      typeof buildDecisionEngineRegressionInput
    >["humanContext"],
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

  return normalizedQuestionPreservesAnchors(
    result
      .normalizedQuestion,
    expandedCase
      .meaningAnchorTokens,
  );
}

/**
 * Shared Fixture에서 Meaning Regression에 연결할 case만 선별한다.
 *
 * - inline case와 동일한 question은 제외
 * - Type A paraphrase는 항상 후보
 * - inline에 없는 distinctMeaningGroup은 canonical·variation 전체 후보
 * - inline에 이미 있는 group은 paraphrase만 후보
 * - QuestionReader·anchor·boundary와 호환되는 case만 최종 연결
 */
function buildFixtureQuestionMeaningRegressionCases(
  humanContext:
    ReturnType<
      typeof buildDecisionEngineRegressionInput
    >["humanContext"],
): QuestionMeaningRegressionCase[] {
  return expandAllMeaningCells()
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
          === "paraphrase"
        ) {
          return true;
        }

        if (
          !EXISTING_INLINE_DISTINCT_MEANING_GROUPS.has(
            expandedCase
              .distinctMeaningGroup,
          )
        ) {
          return true;
        }

        return false;
      },
    )
    .filter(
      (expandedCase) =>
        fixtureExpectationMatchesReader(
          humanContext,
          expandedCase,
        ),
    )
    .map(
      mapExpandedCaseToRegressionCase,
    );
}

function buildQuestionMeaningRegressionCases(
  humanContext:
    ReturnType<
      typeof buildDecisionEngineRegressionInput
    >["humanContext"],
): readonly QuestionMeaningRegressionCase[] {
  return [
    ...QUESTION_MEANING_REGRESSION_CASES,
    ...buildFixtureQuestionMeaningRegressionCases(
      humanContext,
    ),
  ];
}

function buildMeaningSignature(
  result:
    Pick<
      QuestionReaderResult,
      | "topic"
      | "intent"
      | "decisionTarget"
      | "timingType"
      | "analysisMode"
    >,
): string {
  return [
    result.topic,
    result.intent,
    result.decisionTarget,
    result.timingType,
    result.analysisMode,
  ].join(
    "|",
  );
}

function normalizedQuestionPreservesAnchors(
  normalizedQuestion:
    string,
  meaningAnchorTokens:
    readonly string[],
): boolean {
  const normalizedQuestionLower =
    normalizedQuestion.toLowerCase();

  return meaningAnchorTokens.every(
    (token) =>
      normalizedQuestionLower.includes(
        token.toLowerCase(),
      ),
  );
}

function verifyQuestionMeaningCase(
  humanContext:
    ReturnType<
      typeof buildDecisionEngineRegressionInput
    >["humanContext"],
  verificationCase:
    QuestionMeaningRegressionCase,
): QuestionMeaningRegressionCaseResult {
  const result =
    readQuestion(
      humanContext,
      verificationCase
        .question,
    );

  const checks = {
    originalQuestionPreserved:
      result
        .originalQuestion
      === verificationCase
        .question
        .trim(),

    normalizedQuestionIsNonEmpty:
      result
        .normalizedQuestion
        .length
      > 0,

    normalizedQuestionPreservesMeaningAnchors:
      normalizedQuestionPreservesAnchors(
        result
          .normalizedQuestion,
        verificationCase
          .meaningAnchorTokens,
      ),

    humanContextReceived:
      result
        .humanContextReceived
      === true,

    topicMatched:
      result.topic
      === verificationCase
        .expected
        .topic,

    intentMatched:
      result.intent
      === verificationCase
        .expected
        .intent,

    decisionTargetMatched:
      result.decisionTarget
      === verificationCase
        .expected
        .decisionTarget,

    timingTypeMatched:
      result.timingType
      === (
        verificationCase
          .expected
          .timingType
        ?? result.timingType
      ),

    analysisModeMatched:
      result.analysisMode
      === (
        verificationCase
          .expected
          .analysisMode
        ?? result.analysisMode
      ),

    asksWhatIsNonEmpty:
      result
        .asksWhat
        .length
      > 0,

    decisionQuestionIsNonEmpty:
      result
        .decisionQuestion
        .length
      > 0,
  };

  return {
    id:
      verificationCase.id,

    question:
      verificationCase
        .question,

    distinctMeaningGroup:
      verificationCase
        .distinctMeaningGroup,

    meaningSignature:
      buildMeaningSignature(
        result,
      ),

    actual: {
      originalQuestion:
        result
          .originalQuestion,

      normalizedQuestion:
        result
          .normalizedQuestion,

      topic:
        result.topic,

      intent:
        result.intent,

      decisionTarget:
        result.decisionTarget,

      timingType:
        result.timingType,

      analysisMode:
        result.analysisMode,

      asksWhat:
        result.asksWhat,

      decisionQuestion:
        result.decisionQuestion,

      humanContextReceived:
        result
          .humanContextReceived,
    },

    checks,

    passed:
      Object.values(
        checks,
      )
        .every(Boolean),
  };
}

function buildDistinctMeaningGroupChecks(
  cases:
    readonly QuestionMeaningRegressionCaseResult[],
): Record<
  string,
  boolean
> {
  const groupToSignatures =
    new Map<
      string,
      Set<string>
    >();

  for (
    const caseResult
    of cases
  ) {
    const signatures =
      groupToSignatures.get(
        caseResult
          .distinctMeaningGroup,
      )
      ?? new Set<
        string
      >();

    signatures.add(
      caseResult
        .meaningSignature,
    );

    groupToSignatures.set(
      caseResult
        .distinctMeaningGroup,
      signatures,
    );
  }

  const checks:
    Record<
      string,
      boolean
    > = {};

  const groups =
    Array.from(
      groupToSignatures
        .entries(),
    );

  for (
    let leftIndex =
      0;
    leftIndex
    < groups.length;
    leftIndex += 1
  ) {
    for (
      let rightIndex =
        leftIndex
        + 1;
      rightIndex
      < groups.length;
      rightIndex += 1
    ) {
      const [
        leftGroup,
        leftSignatures,
      ] = groups[
        leftIndex
      ];

      const [
        rightGroup,
        rightSignatures,
      ] = groups[
        rightIndex
      ];

      const overlaps =
        Array.from(
          leftSignatures,
        ).some(
          (signature) =>
            rightSignatures
              .has(
                signature,
              ),
        );

      checks[
        `distinctMeaningGroups_${leftGroup}_and_${rightGroup}_doNotCollapse`
      ] =
        !overlaps;
    }
  }

  return checks;
}

export function verifyQuestionMeaningRegression():
  QuestionMeaningRegressionVerificationResult {
  const humanContext =
    buildDecisionEngineRegressionInput()
      .humanContext;

  const regressionCases =
    buildQuestionMeaningRegressionCases(
      humanContext,
    );

  const cases =
    regressionCases.map(
      (verificationCase) =>
        verifyQuestionMeaningCase(
          humanContext,
          verificationCase,
        ),
    );

  const originalQuestions =
    cases.map(
      (caseResult) =>
        caseResult
          .actual
          .originalQuestion,
    );

  const normalizedQuestions =
    cases.map(
      (caseResult) =>
        caseResult
          .actual
          .normalizedQuestion,
    );

  const checks = {
    allCasesPassed:
      cases.every(
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

    distinctMeaningGroupsDoNotCollapse:
      Object.values(
        buildDistinctMeaningGroupChecks(
          cases,
        ),
      ).every(Boolean),

    ...buildDistinctMeaningGroupChecks(
      cases,
    ),
  };

  return {
    cases,

    checks,

    passed:
      Object.values(
        checks,
      )
        .every(Boolean),
  };
}
