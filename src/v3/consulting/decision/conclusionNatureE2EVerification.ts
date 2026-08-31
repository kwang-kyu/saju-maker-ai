import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "./decisionEngine.js";
import {
  buildCareerRecommendationSource,
} from "./careerRecommendationSourceBuilder.js";
import {
  buildWarningConclusionSource,
} from "./warningConclusionSourceBuilder.js";
import type {
  DecisionResult,
} from "./decisionTypes.js";
import type {
  ConclusionNature,
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntent,
} from "../question/questionReader.js";

export type ConclusionNatureE2EQuestionGroup =
  | "decision"
  | "interpretation"
  | "recommendation"
  | "warning"
  | "prediction"
  | "existence";

export type ConclusionNatureE2EMandatoryCase = {
  id: string;
  group: ConclusionNatureE2EQuestionGroup;
  question: string;
  expectedConclusionNature: ConclusionNature;
};

/**
 * 필수 질문군 A~F.
 * 기존 개별 verification / regression fixture와 동일한 질문·fixture 경로를 사용한다.
 */
export const CONCLUSION_NATURE_E2E_MANDATORY_CASES:
  readonly ConclusionNatureE2EMandatoryCase[] = [
    {
      id: "A_decision",
      group: "decision",
      question: "지금 사업을 계속할까요?",
      expectedConclusionNature: "decision",
    },
    {
      id: "B_interpretation",
      group: "interpretation",
      question: "나는 어떤 성향인가요?",
      expectedConclusionNature: "interpretation",
    },
    {
      id: "C_recommendation",
      group: "recommendation",
      question: "어떤 직업이 맞나요?",
      expectedConclusionNature: "recommendation",
    },
    {
      id: "D_warning",
      group: "warning",
      question: "무엇을 조심해야 하나요?",
      expectedConclusionNature: "warning",
    },
    {
      id: "E_prediction",
      group: "prediction",
      question: "앞으로 돈이 들어올까요?",
      expectedConclusionNature: "prediction",
    },
    {
      id: "F_existence",
      group: "existence",
      question: "재물운이 있나요?",
      expectedConclusionNature: "existence",
    },
  ];

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

const PREDICTION_FLOW_PATTERNS:
  readonly RegExp[] = [
    /가능/,
    /흐름/,
    /변화/,
    /조건/,
    /시기/,
    /앞으로/,
    /미래/,
    /들어올/,
    /늘어날/,
    /줄어들/,
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

export type ConclusionNatureE2ECaseChecks = {
  usesExpectedConclusionNature:
    boolean;

  usesLegacyDecisionAssembly?:
    boolean;

  finalDecisionEqualsCoreDecision?:
    boolean;

  finalDecisionIsNotExecutionStyle?:
    boolean;

  warningEvidenceAvailable?:
    boolean;

  careerRecommendationSourceUsed?:
    boolean;

  existenceEvidenceConnected?:
    boolean;

  predictionFlowStyle?:
    boolean;
};

export type ConclusionNatureE2ECaseResult = {
  id: string;
  group: ConclusionNatureE2EQuestionGroup;
  question: string;

  intent: QuestionIntent;
  analysisMode: QuestionAnalysisMode;
  decisionTarget: DecisionTarget;
  conclusionNature: ConclusionNature;
  expectedConclusionNature: ConclusionNature;

  verdict: DecisionResult["verdict"];

  evidenceKeys: string[];
  evidenceSources: string[];

  coreDecision: string;
  recommendedDirection: string;
  prohibitedDirection: string;
  finalDecisionSentence: string;

  riskCount: number;
  conditionCount: number;

  checks: ConclusionNatureE2ECaseChecks;
};

export type ConclusionNatureE2ENextStepCandidate = {
  caseId: string;
  group: ConclusionNatureE2EQuestionGroup;
  issue: string;
  detail: string;
};

export type ConclusionNatureE2EVerificationResult = {
  cases: ConclusionNatureE2ECaseResult[];

  checks:
    Record<
      string,
      boolean
    >;

  nextStepCandidates:
    ConclusionNatureE2ENextStepCandidate[];

  passed: boolean;
};

function isExecutionStyleSentence(
  sentence: string,
): boolean {
  return EXECUTION_STYLE_PATTERNS.some(
    (pattern) =>
      pattern.test(sentence),
  );
}

function isWarningAwarenessStyleSentence(
  sentence: string,
): boolean {
  return WARNING_AWARENESS_PATTERNS.some(
    (pattern) =>
      pattern.test(sentence),
  );
}

function isPredictionFlowStyleSentence(
  sentence: string,
): boolean {
  return PREDICTION_FLOW_PATTERNS.some(
    (pattern) =>
      pattern.test(sentence),
  );
}

function isExistenceAwarenessStyleSentence(
  sentence: string,
): boolean {
  return EXISTENCE_AWARENESS_PATTERNS.some(
    (pattern) =>
      pattern.test(sentence),
  );
}

function buildCaseResult(
  testCase:
    ConclusionNatureE2EMandatoryCase,
): ConclusionNatureE2ECaseResult {
  const input =
    buildDecisionEngineRegressionInput({
      questionText:
        testCase.question,
    });

  const result =
    runDecisionEngine(input);

  const question =
    input.question;

  const legacyAssembly =
    [
      result.coreDecision,
      result.recommendedDirection,
    ].join(" ");

  const finalDecisionEqualsCoreDecision =
    result.finalDecisionSentence
    === result.coreDecision;

  const finalDecisionIsNotExecutionStyle =
    !isExecutionStyleSentence(
      result.finalDecisionSentence,
    );

  const usesLegacyDecisionAssembly =
    result.finalDecisionSentence
    === legacyAssembly;

  const careerRecommendationSource =
    question.conclusionNature
    === "recommendation"
      ? buildCareerRecommendationSource(
        input.humanContext,
      )
      : null;

  const warningConclusionSource =
    question.conclusionNature
    === "warning"
      ? buildWarningConclusionSource(
        result.risks,
        result.conditions,
      )
      : null;

  const hasMoneyEvidence =
    result.evidence.some(
      (item) =>
        item.source === "money"
        || item.key.startsWith("money-"),
    );

  const checks: ConclusionNatureE2ECaseChecks = {
    usesExpectedConclusionNature:
      question.conclusionNature
      === testCase.expectedConclusionNature,
  };

  switch (testCase.group) {
    case "decision":
      checks.usesLegacyDecisionAssembly =
        usesLegacyDecisionAssembly;
      break;

    case "interpretation":
      checks.finalDecisionEqualsCoreDecision =
        finalDecisionEqualsCoreDecision;
      checks.finalDecisionIsNotExecutionStyle =
        finalDecisionIsNotExecutionStyle;
      break;

    case "recommendation":
      checks.finalDecisionEqualsCoreDecision =
        finalDecisionEqualsCoreDecision;
      checks.finalDecisionIsNotExecutionStyle =
        finalDecisionIsNotExecutionStyle;
      checks.careerRecommendationSourceUsed =
        careerRecommendationSource
          ?.hasSpecificRoleEvidence
        === true
        || result
          .roleRecommendationAssessment
          ?.available
        === true;
      break;

    case "warning":
      checks.finalDecisionEqualsCoreDecision =
        finalDecisionEqualsCoreDecision;
      checks.finalDecisionIsNotExecutionStyle =
        finalDecisionIsNotExecutionStyle;
      checks.warningEvidenceAvailable =
        warningConclusionSource
          ?.hasSpecificRiskEvidence
        === true
        || result.risks.length > 0
        || result.conditions.length > 0
        || isWarningAwarenessStyleSentence(
          result.finalDecisionSentence,
        );
      break;

    case "prediction":
      if (
        question.intent
        === "prediction"
      ) {
        checks.finalDecisionEqualsCoreDecision =
          finalDecisionEqualsCoreDecision;
        checks.finalDecisionIsNotExecutionStyle =
          finalDecisionIsNotExecutionStyle;
        checks.predictionFlowStyle =
          isPredictionFlowStyleSentence(
            result.finalDecisionSentence,
          );
      }
      break;

    case "existence":
      checks.finalDecisionEqualsCoreDecision =
        finalDecisionEqualsCoreDecision;
      checks.finalDecisionIsNotExecutionStyle =
        finalDecisionIsNotExecutionStyle;
      checks.existenceEvidenceConnected =
        hasMoneyEvidence
        && isExistenceAwarenessStyleSentence(
          result.finalDecisionSentence,
        )
        || /확정(?:하기|할)? 어렵/.test(
          result.finalDecisionSentence,
        );
      break;
  }

  return {
    id: testCase.id,
    group: testCase.group,
    question: testCase.question,

    intent: question.intent,
    analysisMode: question.analysisMode,
    decisionTarget: question.decisionTarget,
    conclusionNature:
      question.conclusionNature,
    expectedConclusionNature:
      testCase.expectedConclusionNature,

    verdict: result.verdict,

    evidenceKeys:
      result.evidence.map(
        (item) =>
          item.key,
      ),
    evidenceSources: [
      ...new Set(
        result.evidence.map(
          (item) =>
            item.source,
        ),
      ),
    ],

    coreDecision:
      result.coreDecision,
    recommendedDirection:
      result.recommendedDirection,
    prohibitedDirection:
      result.prohibitedDirection,
    finalDecisionSentence:
      result.finalDecisionSentence,

    riskCount:
      result.risks.length,
    conditionCount:
      result.conditions.length,

    checks,
  };
}

function flattenChecks(
  cases:
    readonly ConclusionNatureE2ECaseResult[],
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
      if (
        value
        === undefined
      ) {
        continue;
      }

      checks[
        `${caseResult.id}_${key}`
      ] = value;
    }
  }

  return checks;
}

function collectNextStepCandidates(
  cases:
    readonly ConclusionNatureE2ECaseResult[],
): ConclusionNatureE2ENextStepCandidate[] {
  const candidates:
    ConclusionNatureE2ENextStepCandidate[] = [];

  for (const caseResult of cases) {
    const {
      checks,
    } = caseResult;

    if (
      !checks.usesExpectedConclusionNature
    ) {
      candidates.push({
        caseId:
          caseResult.id,
        group:
          caseResult.group,
        issue:
          "conclusionNatureMismatch",
        detail:
          `expected ${caseResult.expectedConclusionNature}, got ${caseResult.conclusionNature} (intent=${caseResult.intent})`,
      });
    }

    if (
      checks.usesLegacyDecisionAssembly
      === false
    ) {
      candidates.push({
        caseId:
          caseResult.id,
        group:
          caseResult.group,
        issue:
          "legacyDecisionAssemblyBroken",
        detail:
          "decision finalDecisionSentence !== coreDecision + recommendedDirection",
      });
    }

    if (
      checks.finalDecisionEqualsCoreDecision
      === false
    ) {
      candidates.push({
        caseId:
          caseResult.id,
        group:
          caseResult.group,
        issue:
          "decisionPathLeak",
        detail:
          "finalDecisionSentence !== coreDecision; execution assembly may have leaked",
      });
    }

    if (
      checks.finalDecisionIsNotExecutionStyle
      === false
    ) {
      candidates.push({
        caseId:
          caseResult.id,
        group:
          caseResult.group,
        issue:
          "executionStylePollution",
        detail:
          "non-decision finalDecisionSentence contains execution-style phrasing",
      });
    }

    if (
      checks.warningEvidenceAvailable
      === false
    ) {
      candidates.push({
        caseId:
          caseResult.id,
        group:
          caseResult.group,
        issue:
          "warningEvidenceDisconnected",
        detail:
          "warning conclusion lacks Engine risk/condition evidence connection",
      });
    }

    if (
      checks.careerRecommendationSourceUsed
      === false
      && caseResult.group
      === "recommendation"
    ) {
      candidates.push({
        caseId:
          caseResult.id,
        group:
          caseResult.group,
        issue:
          "recommendationSourceWeak",
        detail:
          "career recommendation source not connected; conclusion may be generic fallback",
      });
    }

    if (
      checks.existenceEvidenceConnected
      === false
    ) {
      candidates.push({
        caseId:
          caseResult.id,
        group:
          caseResult.group,
        issue:
          "existenceEvidenceDisconnected",
        detail:
          "existence conclusion not connected to topic-specific Reader/Evidence",
      });
    }

    if (
      checks.predictionFlowStyle
      === false
      && caseResult.intent
      === "prediction"
    ) {
      candidates.push({
        caseId:
          caseResult.id,
        group:
          caseResult.group,
        issue:
          "predictionFlowStyleMissing",
        detail:
          "prediction conclusion lacks flow/possibility/change phrasing",
      });
    }

    if (
      caseResult.group
      === "prediction"
      && caseResult.intent
      !== "prediction"
    ) {
      candidates.push({
        caseId:
          caseResult.id,
        group:
          caseResult.group,
        issue:
          "questionReaderIntentNotPrediction",
        detail:
          `QuestionReader classified intent=${caseResult.intent}; prediction-specific checks skipped (not forced)`,
      });
    }
  }

  return candidates;
}

/**
 * ConclusionNature 6유형 통합 E2E 검증.
 *
 * QuestionReader → QuestionContext → DecisionEngine → CoreDecisionBuilder
 * → DecisionResultBuilder 전체 파이프라인에서
 * 결론 성격별 finalDecisionSentence 분리를 검증한다.
 *
 * 판단 규칙을 변경하지 않으며, 발견된 이슈는 nextStepCandidates에 기록한다.
 */
export function verifyConclusionNatureE2E():
  ConclusionNatureE2EVerificationResult {
  const cases =
    CONCLUSION_NATURE_E2E_MANDATORY_CASES.map(
      buildCaseResult,
    );

  const checks =
    flattenChecks(cases);

  const nextStepCandidates =
    collectNextStepCandidates(
      cases,
    );

  return {
    cases,
    checks,
    nextStepCandidates,
    passed:
      Object
        .values(checks)
        .every(Boolean),
  };
}
