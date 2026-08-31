import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "./decisionEngine.js";
import type {
  DecisionResult,
} from "./decisionTypes.js";
import type {
  ConclusionNature,
} from "../question/questionReader.js";

const EXECUTION_STYLE_PATTERNS:
  readonly RegExp[] = [
    /진행(?:하는|할|하지| 여부)/,
    /보류(?:하는|한다|한다\.)/,
    /중단(?:하는|한다)/,
    /기다리(?:는|기)/,
    /실행(?:하는|하기| 여부)/,
    /바로 시작/,
    /조건을 갖춘 뒤(?: 진행| 움직)/,
    /선택을 조금 더 보류/,
    /시기를 늦추/,
    /결정을 유보/,
    /진행하지 않/,
    /결정 대상과 시기/,
  ];

const RECOMMENDATION_CASES:
  readonly {
    question:
      string;

    expectedConclusionNature:
      ConclusionNature;

    expectCoreDecisionOnly:
      boolean;
  }[] = [
    {
      question:
        "어떤 직업이 맞나요?",

      expectedConclusionNature:
        "recommendation",

      expectCoreDecisionOnly:
        true,
    },
    {
      question:
        "어떤 일이 적성에 맞나요?",

      expectedConclusionNature:
        "recommendation",

      expectCoreDecisionOnly:
        true,
    },
    {
      question:
        "연극에서 어떤 역할이 맞나요?",

      expectedConclusionNature:
        "recommendation",

      expectCoreDecisionOnly:
        false,
    },
    {
      question:
        "나에게 맞는 일은 무엇인가요?",

      expectedConclusionNature:
        "recommendation",

      expectCoreDecisionOnly:
        true,
    },
  ];

const DECISION_PRESERVATION_CASES:
  readonly {
    question:
      string;

    expectedConclusionNature:
      ConclusionNature;
  }[] = [
    {
      question:
        "지금 사업을 계속할까요?",

      expectedConclusionNature:
        "decision",
    },
  ];

const INTERPRETATION_PRESERVATION_CASES:
  readonly {
    question:
      string;

    expectedConclusionNature:
      ConclusionNature;
  }[] = [
    {
      question:
        "나는 어떤 성향인가요?",

      expectedConclusionNature:
        "interpretation",
    },
  ];

export type RecommendationCaseSnapshot = {
  question:
    string;

  conclusionNature:
    ConclusionNature;

  verdict:
    DecisionResult["verdict"];

  coreDecision:
    string;

  recommendedDirection:
    string;

  prohibitedDirection:
    string;

  finalDecisionSentence:
    string;

  finalDecisionIsExecutionStyle:
    boolean;

  finalDecisionMatchesLegacyAssembly:
    boolean;

  roleRecommendationAssessmentAvailable:
    boolean | null;
};

export type RecommendationConclusionNatureVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  recommendationSnapshots:
    RecommendationCaseSnapshot[];

  decisionPreservationSnapshots:
    RecommendationCaseSnapshot[];

  interpretationPreservationSnapshots:
    RecommendationCaseSnapshot[];

  passed:
    boolean;
};

function isExecutionStyleSentence(
  sentence:
    string,
): boolean {
  return EXECUTION_STYLE_PATTERNS.some(
    (pattern) =>
      pattern.test(
        sentence,
      ),
  );
}

function buildCaseSnapshot(
  questionText:
    string,
  expectedConclusionNature:
    ConclusionNature,
  options: {
    expectLegacyAssembly:
      boolean;

    expectNonExecutionFinalDecision:
      boolean;

    expectCoreDecisionOnly:
      boolean;
  },
): {
  snapshot:
    RecommendationCaseSnapshot;

  checks:
    Record<
      string,
      boolean
    >;
} {
  const input =
    buildDecisionEngineRegressionInput({
      questionText,
    });

  const result =
    runDecisionEngine(input);

  const conclusionNature =
    input
      .question
      .conclusionNature;

  const legacyAssembly =
    [
      result.coreDecision,
      result.recommendedDirection,
    ].join(" ");

  const finalDecisionMatchesLegacyAssembly =
    result
      .finalDecisionSentence
    === legacyAssembly;

  const id =
    questionText
      .replace(
        /[^\p{L}\p{N}]+/gu,
        "_",
      )
      .slice(
        0,
        40,
      );

  const checks: Record<
    string,
    boolean
  > = {
    [`${id}_usesExpectedConclusionNature`]:
      conclusionNature
      === expectedConclusionNature,

    [`${id}_finalDecisionIsNotExecutionStyle`]:
      options
        .expectNonExecutionFinalDecision
        ? !isExecutionStyleSentence(
          result
            .finalDecisionSentence,
        )
        : true,

    [`${id}_finalDecisionUsesCoreDecisionOnly`]:
      options
        .expectCoreDecisionOnly
        ? result
          .finalDecisionSentence
        === result
          .coreDecision
        : result
          .finalDecisionSentence
        !== result
          .coreDecision,

    [`${id}_preservesLegacyAssembly`]:
      options
        .expectLegacyAssembly
        ? finalDecisionMatchesLegacyAssembly
        : !finalDecisionMatchesLegacyAssembly,
  };

  return {
    snapshot: {
      question:
        questionText,

      conclusionNature,

      verdict:
        result.verdict,

      coreDecision:
        result.coreDecision,

      recommendedDirection:
        result.recommendedDirection,

      prohibitedDirection:
        result.prohibitedDirection,

      finalDecisionSentence:
        result.finalDecisionSentence,

      finalDecisionIsExecutionStyle:
        isExecutionStyleSentence(
          result
            .finalDecisionSentence,
        ),

      finalDecisionMatchesLegacyAssembly,

      roleRecommendationAssessmentAvailable:
        result
          .roleRecommendationAssessment
          ?.available
        ?? null,
    },

    checks,
  };
}

export function verifyRecommendationConclusionNature():
  RecommendationConclusionNatureVerificationResult {
  const checks: Record<
    string,
    boolean
  > = {};

  const recommendationSnapshots:
    RecommendationCaseSnapshot[] = [];

  for (const testCase of RECOMMENDATION_CASES) {
    const {
      snapshot,
      checks:
        caseChecks,
    } = buildCaseSnapshot(
      testCase.question,

      testCase
        .expectedConclusionNature,

      {
        expectLegacyAssembly:
          false,

        expectNonExecutionFinalDecision:
          true,

        expectCoreDecisionOnly:
          testCase
            .expectCoreDecisionOnly,
      },
    );

    recommendationSnapshots.push(
      snapshot,
    );

    Object.assign(
      checks,
      caseChecks,
    );
  }

  const decisionPreservationSnapshots:
    RecommendationCaseSnapshot[] = [];

  for (const testCase of DECISION_PRESERVATION_CASES) {
    const {
      snapshot,
      checks:
        caseChecks,
    } = buildCaseSnapshot(
      testCase.question,

      testCase
        .expectedConclusionNature,

      {
        expectLegacyAssembly:
          true,

        expectNonExecutionFinalDecision:
          false,

        expectCoreDecisionOnly:
          false,
      },
    );

    decisionPreservationSnapshots.push(
      snapshot,
    );

    Object.assign(
      checks,
      caseChecks,
    );
  }

  const interpretationPreservationSnapshots:
    RecommendationCaseSnapshot[] = [];

  for (const testCase of INTERPRETATION_PRESERVATION_CASES) {
    const {
      snapshot,
      checks:
        caseChecks,
    } = buildCaseSnapshot(
      testCase.question,

      testCase
        .expectedConclusionNature,

      {
        expectLegacyAssembly:
          false,

        expectNonExecutionFinalDecision:
          true,

        expectCoreDecisionOnly:
          true,
      },
    );

    interpretationPreservationSnapshots.push(
      snapshot,
    );

    Object.assign(
      checks,
      caseChecks,
    );
  }

  return {
    checks,

    recommendationSnapshots,

    decisionPreservationSnapshots,

    interpretationPreservationSnapshots,

    passed:
      Object
        .values(
          checks,
        )
        .every(Boolean),
  };
}
