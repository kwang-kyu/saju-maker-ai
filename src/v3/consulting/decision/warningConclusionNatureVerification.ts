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
    /진행(?:하는|하지 않는) 쪽/,
    /보류(?:하는|한다|한다\.)/,
    /중단(?:하는|한다)/,
    /기다리(?:는|기)/,
    /실행(?:하는|하기| 여부)/,
    /바로 시작/,
    /바로 실행/,
    /조건을 갖춘 뒤(?: 진행| 움직)/,
    /선택을 조금 더 보류/,
    /시기를 늦추/,
    /결정을 유보/,
    /진행하지 않/,
    /결정 대상과 시기/,
    /다시 판단(?:한다|할)/,
  ];

const WARNING_AWARENESS_PATTERNS:
  readonly RegExp[] = [
    /주의/,
    /경계/,
    /위험/,
    /조심/,
    /패턴/,
    /조건/,
    /부담/,
    /신호/,
  ];

const WARNING_CASES:
  readonly {
    question:
      string;

    expectedConclusionNature:
      ConclusionNature;
  }[] = [
    {
      question:
        "무엇을 조심해야 하나요?",

      expectedConclusionNature:
        "warning",
    },
    {
      question:
        "앞으로 주의할 점은 무엇인가요?",

      expectedConclusionNature:
        "warning",
    },
    {
      question:
        "어떤 위험이 있나요?",

      expectedConclusionNature:
        "warning",
    },
    {
      question:
        "내가 특히 조심해야 할 부분이 있나요?",

      expectedConclusionNature:
        "warning",
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
    {
      question:
        "지금 주식에 투자해도 될까요?",

      expectedConclusionNature:
        "decision",
    },
    {
      question:
        "직장을 그만둘까요?",

      expectedConclusionNature:
        "decision",
    },
    {
      question:
        "지금 이 사람과 결혼해도 될까요?",

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
    {
      question:
        "왜 일이 잘 안 풀리나요?",

      expectedConclusionNature:
        "interpretation",
    },
  ];

const RECOMMENDATION_PRESERVATION_CASES:
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
        "연극에서 어떤 역할이 맞나요?",

      expectedConclusionNature:
        "recommendation",

      expectCoreDecisionOnly:
        false,
    },
  ];

export type WarningCaseSnapshot = {
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

  finalDecisionIsWarningAwarenessStyle:
    boolean;

  finalDecisionMatchesLegacyAssembly:
    boolean;

  riskCount:
    number;
};

export type WarningConclusionNatureVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  warningSnapshots:
    WarningCaseSnapshot[];

  decisionPreservationSnapshots:
    WarningCaseSnapshot[];

  interpretationPreservationSnapshots:
    WarningCaseSnapshot[];

  recommendationPreservationSnapshots:
    WarningCaseSnapshot[];

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

function isWarningAwarenessStyleSentence(
  sentence:
    string,
): boolean {
  return WARNING_AWARENESS_PATTERNS.some(
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

    expectWarningAwarenessStyle:
      boolean;
  },
): {
  snapshot:
    WarningCaseSnapshot;

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

    [`${id}_finalDecisionIsWarningAwarenessStyle`]:
      options
        .expectWarningAwarenessStyle
        ? isWarningAwarenessStyleSentence(
          result
            .finalDecisionSentence,
        )
        : true,
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

      finalDecisionIsWarningAwarenessStyle:
        isWarningAwarenessStyleSentence(
          result
            .finalDecisionSentence,
        ),

      finalDecisionMatchesLegacyAssembly,

      riskCount:
        result
          .risks
          .length,
    },

    checks,
  };
}

function runCaseGroup(
  cases:
    readonly {
      question:
        string;

      expectedConclusionNature:
        ConclusionNature;
    }[],
  options: {
    expectLegacyAssembly:
      boolean;

    expectNonExecutionFinalDecision:
      boolean;

    expectCoreDecisionOnly:
      boolean;

    expectWarningAwarenessStyle:
      boolean;
  },
): {
  snapshots:
    WarningCaseSnapshot[];

  checks:
    Record<
      string,
      boolean
    >;
} {
  const snapshots:
    WarningCaseSnapshot[] = [];

  const checks: Record<
    string,
    boolean
  > = {};

  for (const testCase of cases) {
    const {
      snapshot,
      checks:
        caseChecks,
    } = buildCaseSnapshot(
      testCase.question,

      testCase
        .expectedConclusionNature,

      options,
    );

    snapshots.push(
      snapshot,
    );

    Object.assign(
      checks,
      caseChecks,
    );
  }

  return {
    snapshots,
    checks,
  };
}

export function verifyWarningConclusionNature():
  WarningConclusionNatureVerificationResult {
  const checks: Record<
    string,
    boolean
  > = {};

  const {
    snapshots:
      warningSnapshots,
    checks:
      warningChecks,
  } = runCaseGroup(
    WARNING_CASES,

    {
      expectLegacyAssembly:
        false,

      expectNonExecutionFinalDecision:
        true,

      expectCoreDecisionOnly:
        true,

      expectWarningAwarenessStyle:
        true,
    },
  );

  Object.assign(
    checks,
    warningChecks,
  );

  const {
    snapshots:
      decisionPreservationSnapshots,
    checks:
      decisionChecks,
  } = runCaseGroup(
    DECISION_PRESERVATION_CASES,

    {
      expectLegacyAssembly:
        true,

      expectNonExecutionFinalDecision:
        false,

      expectCoreDecisionOnly:
        false,

      expectWarningAwarenessStyle:
        false,
    },
  );

  Object.assign(
    checks,
    decisionChecks,
  );

  const {
    snapshots:
      interpretationPreservationSnapshots,
    checks:
      interpretationChecks,
  } = runCaseGroup(
    INTERPRETATION_PRESERVATION_CASES,

    {
      expectLegacyAssembly:
        false,

      expectNonExecutionFinalDecision:
        true,

      expectCoreDecisionOnly:
        true,

      expectWarningAwarenessStyle:
        false,
    },
  );

  Object.assign(
    checks,
    interpretationChecks,
  );

  const recommendationPreservationSnapshots:
    WarningCaseSnapshot[] = [];

  for (const testCase of RECOMMENDATION_PRESERVATION_CASES) {
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

        expectWarningAwarenessStyle:
          false,
      },
    );

    recommendationPreservationSnapshots.push(
      snapshot,
    );

    Object.assign(
      checks,
      caseChecks,
    );
  }

  return {
    checks,

    warningSnapshots,

    decisionPreservationSnapshots,

    interpretationPreservationSnapshots,

    recommendationPreservationSnapshots,

    passed:
      Object
        .values(
          checks,
        )
        .every(Boolean),
  };
}
