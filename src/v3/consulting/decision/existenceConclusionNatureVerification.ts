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

const EXISTENCE_AWARENESS_PATTERNS:
  readonly RegExp[] = [
    /근거/,
    /신호/,
    /구조/,
    /확인/,
    /조건/,
    /운/,
    /존재/,
  ];

const EXISTENCE_CASES:
  readonly {
    question:
      string;

    expectedConclusionNature:
      ConclusionNature;

    expectEvidenceBasedConclusion:
      boolean;
  }[] = [
    {
      question:
        "재물운이 있나요?",

      expectedConclusionNature:
        "existence",

      expectEvidenceBasedConclusion:
        true,
    },
    {
      question:
        "사업운이 있나요?",

      expectedConclusionNature:
        "existence",

      expectEvidenceBasedConclusion:
        true,
    },
    {
      question:
        "직장운이 있나요?",

      expectedConclusionNature:
        "existence",

      expectEvidenceBasedConclusion:
        true,
    },
    {
      question:
        "배우자운이 있나요?",

      expectedConclusionNature:
        "existence",

      expectEvidenceBasedConclusion:
        true,
    },
    {
      question:
        "자식운이 있나요?",

      expectedConclusionNature:
        "existence",

      expectEvidenceBasedConclusion:
        false,
    },
    {
      question:
        "내가 관재수가 있나요?",

      expectedConclusionNature:
        "existence",

      expectEvidenceBasedConclusion:
        false,
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

const RECOMMENDATION_PRESERVATION_CASES:
  readonly {
    question:
      string;

    expectedConclusionNature:
      ConclusionNature;
  }[] = [
    {
      question:
        "어떤 직업이 맞나요?",

      expectedConclusionNature:
        "recommendation",
    },
  ];

const WARNING_PRESERVATION_CASES:
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
  ];

const PREDICTION_PRESERVATION_CASES:
  readonly {
    question:
      string;

    expectedConclusionNature:
      ConclusionNature;
  }[] = [
    {
      question:
        "앞으로 돈이 들어올까요?",

      expectedConclusionNature:
        "prediction",
    },
  ];

export type ExistenceCaseSnapshot = {
  question:
    string;

  conclusionNature:
    ConclusionNature;

  topic:
    DecisionResult["topic"];

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

  finalDecisionIsExistenceAwarenessStyle:
    boolean;

  finalDecisionMatchesLegacyAssembly:
    boolean;

  finalDecisionIsGenericFallback:
    boolean;

  evidenceCount:
    number;
};

export type ExistenceConclusionNatureVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  existenceSnapshots:
    ExistenceCaseSnapshot[];

  decisionPreservationSnapshots:
    ExistenceCaseSnapshot[];

  interpretationPreservationSnapshots:
    ExistenceCaseSnapshot[];

  recommendationPreservationSnapshots:
    ExistenceCaseSnapshot[];

  warningPreservationSnapshots:
    ExistenceCaseSnapshot[];

  predictionPreservationSnapshots:
    ExistenceCaseSnapshot[];

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

function isExistenceAwarenessStyleSentence(
  sentence:
    string,
): boolean {
  return EXISTENCE_AWARENESS_PATTERNS.some(
    (pattern) =>
      pattern.test(
        sentence,
      ),
  );
}

function isGenericExistenceFallback(
  sentence:
    string,
): boolean {
  return sentence
    === "현재 정보만으로 관련 운이나 구조의 존재 여부를 확정하기 어렵다.";
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

    expectExistenceAwarenessStyle:
      boolean;

    expectEvidenceBasedConclusion?:
      boolean;
  },
): {
  snapshot:
    ExistenceCaseSnapshot;

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

    [`${id}_finalDecisionIsExistenceAwarenessStyle`]:
      options
        .expectExistenceAwarenessStyle
        ? isExistenceAwarenessStyleSentence(
          result
            .finalDecisionSentence,
        )
        : true,
  };

  if (
    options
      .expectEvidenceBasedConclusion
    !== undefined
  ) {
    checks[
      `${id}_usesExpectedEvidencePath`
    ] =
      options
        .expectEvidenceBasedConclusion
        ? !isGenericExistenceFallback(
          result
            .coreDecision,
        )
        : isGenericExistenceFallback(
          result
            .coreDecision,
        )
        || /확정하기 어렵/.test(
          result
            .coreDecision,
        );
  }

  return {
    snapshot: {
      question:
        questionText,

      conclusionNature,

      topic:
        result.topic,

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

      finalDecisionIsExistenceAwarenessStyle:
        isExistenceAwarenessStyleSentence(
          result
            .finalDecisionSentence,
        ),

      finalDecisionMatchesLegacyAssembly,

      finalDecisionIsGenericFallback:
        isGenericExistenceFallback(
          result
            .finalDecisionSentence,
        ),

      evidenceCount:
        result
          .evidence
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

      expectEvidenceBasedConclusion?:
        boolean;
    }[],
  options: {
    expectLegacyAssembly:
      boolean;

    expectNonExecutionFinalDecision:
      boolean;

    expectCoreDecisionOnly:
      boolean;

    expectExistenceAwarenessStyle:
      boolean;
  },
): {
  snapshots:
    ExistenceCaseSnapshot[];

  checks:
    Record<
      string,
      boolean
    >;
} {
  const snapshots:
    ExistenceCaseSnapshot[] = [];

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

      {
        ...options,

        expectEvidenceBasedConclusion:
          testCase
            .expectEvidenceBasedConclusion,
      },
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

export function verifyExistenceConclusionNature():
  ExistenceConclusionNatureVerificationResult {
  const checks: Record<
    string,
    boolean
  > = {};

  const {
    snapshots:
      existenceSnapshots,
    checks:
      existenceChecks,
  } = runCaseGroup(
    EXISTENCE_CASES,

    {
      expectLegacyAssembly:
        false,

      expectNonExecutionFinalDecision:
        true,

      expectCoreDecisionOnly:
        true,

      expectExistenceAwarenessStyle:
        true,
    },
  );

  Object.assign(
    checks,
    existenceChecks,
  );

  const existenceEvidenceBasedCount =
    existenceSnapshots
      .filter(
        (
          snapshot,
        ) =>
          !snapshot
            .finalDecisionIsGenericFallback,
      )
      .length;

  checks.existenceEvidenceBasedConclusionsDiffer =
    existenceEvidenceBasedCount
    >= 3;

  checks.existenceFallbackCasesRemainConservative =
    existenceSnapshots
      .filter(
        (
          _snapshot,
          index,
        ) =>
          EXISTENCE_CASES[
            index
          ]
            ?.expectEvidenceBasedConclusion
          === false,
      )
      .every(
        (
          snapshot,
        ) =>
          /확정(?:하기|할)? 어렵/.test(
            snapshot
              .coreDecision,
          ),
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

      expectExistenceAwarenessStyle:
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

      expectExistenceAwarenessStyle:
        false,
    },
  );

  Object.assign(
    checks,
    interpretationChecks,
  );

  const {
    snapshots:
      recommendationPreservationSnapshots,
    checks:
      recommendationChecks,
  } = runCaseGroup(
    RECOMMENDATION_PRESERVATION_CASES,

    {
      expectLegacyAssembly:
        false,

      expectNonExecutionFinalDecision:
        true,

      expectCoreDecisionOnly:
        true,

      expectExistenceAwarenessStyle:
        false,
    },
  );

  Object.assign(
    checks,
    recommendationChecks,
  );

  const {
    snapshots:
      warningPreservationSnapshots,
    checks:
      warningChecks,
  } = runCaseGroup(
    WARNING_PRESERVATION_CASES,

    {
      expectLegacyAssembly:
        false,

      expectNonExecutionFinalDecision:
        true,

      expectCoreDecisionOnly:
        true,

      expectExistenceAwarenessStyle:
        false,
    },
  );

  Object.assign(
    checks,
    warningChecks,
  );

  const {
    snapshots:
      predictionPreservationSnapshots,
    checks:
      predictionChecks,
  } = runCaseGroup(
    PREDICTION_PRESERVATION_CASES,

    {
      expectLegacyAssembly:
        false,

      expectNonExecutionFinalDecision:
        true,

      expectCoreDecisionOnly:
        true,

      expectExistenceAwarenessStyle:
        false,
    },
  );

  Object.assign(
    checks,
    predictionChecks,
  );

  return {
    checks,

    existenceSnapshots,

    decisionPreservationSnapshots,

    interpretationPreservationSnapshots,

    recommendationPreservationSnapshots,

    warningPreservationSnapshots,

    predictionPreservationSnapshots,

    passed:
      Object
        .values(
          checks,
        )
        .every(Boolean),
  };
}
