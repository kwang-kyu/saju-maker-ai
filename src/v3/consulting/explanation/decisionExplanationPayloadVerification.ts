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
} from "../question/questionReader.js";

import type {
  LifeFlowInterpretationAssessment,
} from "../decision/lifeFlowInterpretationAssessment.js";

import {
  readDecisionResult,
  type DecisionExplanationInput,
} from "./decisionResultReader.js";

import {
  buildDecisionExplanationPlan,
  type DecisionExplanationPlan,
  type ExplanationStep,
} from "./decisionExplanationPlan.js";

import type {
  DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

import {
  buildDecisionExplanationPayload,
  type DecisionExplanationPayload,
} from "./decisionExplanationPayload.js";

import {
  verifyReaderDecisionExplanationIntegration,
} from "./readerDecisionExplanationIntegrationVerification.js";

const BUSINESS_START_TITLES = [
  "사업 방향의 적합성",
  "현재 시점의 적합성",
  "성공을 위해 필요한 조건",
  "사업상 위험",
  "권장 실행 방향",
] as const;

const ROLE_QUESTION =
  "내가 연극을 하면 어떤 역할이 어울릴까요?";

const LIFE_FLOW_QUESTION =
  "올해 총운을 봐주세요";

const MAPPED_OPTIONAL_STEPS = [
  "readerDecisionEffect",
  "conditions",
  "risks",
  "recommendedDirection",
  "prohibitedDirection",
] as const satisfies readonly ExplanationStep[];

export type DecisionExplanationPayloadVerificationCase = {
  name:
    string;

  question:
    string;

  focus:
    DecisionExplanationFocus
    | null;

  explanationKind:
    DecisionExplanationPlan["explanationKind"];

  selectedSteps:
    ExplanationStep[];

  payloadTitles:
    string[];

  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export type DecisionExplanationPayloadVerificationResult = {
  cases:
    DecisionExplanationPayloadVerificationCase[];

  passed:
    boolean;
};

function snapshotDecisionResult(
  result:
    DecisionResult,
): string {
  return JSON.stringify({
    verdict:
      result.verdict,

    confidence:
      result.confidence,

    coreDecision:
      result.coreDecision,

    decisionReason:
      result.decisionReason,

    evidence:
      result.evidence,

    conditions:
      result.conditions,

    risks:
      result.risks,

    recommendedDirection:
      result.recommendedDirection,

    prohibitedDirection:
      result.prohibitedDirection,

    finalDecisionSentence:
      result.finalDecisionSentence,
  });
}

function findPlanBlock(
  plan:
    DecisionExplanationPlan,
  step:
    ExplanationStep,
) {
  return plan.blocks.find(
    (block) =>
      block.step
      === step,
  );
}

function selectedRequiredOrder(
  plan:
    DecisionExplanationPlan,
): DecisionExplanationPayload["explanationOrder"] {
  return plan.blocks
    .filter(
      (block) =>
        block.required
        && block.step
          !== "finalDecision",
    )
    .map(
      (block) => ({
        title:
          block.title,

        content:
          block.content,
      }),
    );
}

function selectedRequiredSteps(
  plan:
    DecisionExplanationPlan,
): ExplanationStep[] {
  return [
    ...plan.blocks
      .filter(
        (block) =>
          block.required
          && block.step
            !== "finalDecision",
      )
      .map(
        (block) =>
          block.step,
      ),
    ...(
      findPlanBlock(
        plan,
        "finalDecision",
      )
        ? [
            "finalDecision" as const,
          ]
        : []
    ),
  ];
}

function payloadHasTitle(
  payload:
    DecisionExplanationPayload,
  title:
    string,
): boolean {
  return payload.explanationOrder.some(
    (item) =>
      item.title
      === title,
  );
}

function payloadOmitsTitles(
  payload:
    DecisionExplanationPayload,
  titles:
    readonly string[],
): boolean {
  return titles.every(
    (title) =>
      !payloadHasTitle(
        payload,
        title,
      ),
  );
}

function payloadMatchesSelectedRequiredBlocks(
  plan:
    DecisionExplanationPlan,
  payload:
    DecisionExplanationPayload,
): boolean {
  return (
    JSON.stringify(
      payload.explanationOrder,
    )
    === JSON.stringify(
      selectedRequiredOrder(
        plan,
      ),
    )
  );
}

function mappedStepsFollowRequiredFilter(
  plan:
    DecisionExplanationPlan,
  payload:
    DecisionExplanationPayload,
): boolean {
  return MAPPED_OPTIONAL_STEPS.every(
    (step) => {
      const matchingBlocks =
        plan.blocks.filter(
          (block) =>
            block.step
            === step,
        );

      if (
        matchingBlocks.length
        === 0
      ) {
        return true;
      }

      return matchingBlocks.every(
        (block) => {
          const inPayload =
            payload.explanationOrder.some(
              (item) =>
                item.title
                === block.title
                && item.content
                  === block.content,
            );

          return block.required
            ? inPayload
            : !inPayload;
        },
      );
    },
  );
}

function payloadKeepsFinalDecisionContract(
  plan:
    DecisionExplanationPlan,
  payload:
    DecisionExplanationPayload,
  decisionResult:
    DecisionResult,
): boolean {
  const finalDecisionBlock =
    findPlanBlock(
      plan,
      "finalDecision",
    );

  return (
    payload.finalDecision
    === (
      finalDecisionBlock?.content
      ?? ""
    )
    && payload.finalDecision
      === decisionResult.finalDecisionSentence
    && !payloadHasTitle(
      payload,
      "최종 판단",
    )
    && !payloadHasTitle(
      payload,
      "최종 추천",
    )
    && !payloadHasTitle(
      payload,
      "최종 요약",
    )
  );
}

function buildArtifacts(
  questionText:
    string,
): {
  decisionResult:
    DecisionResult;

  decisionSnapshot:
    string;

  plan:
    DecisionExplanationPlan;

  payload:
    DecisionExplanationPayload;
} {
  const input =
    buildDecisionEngineRegressionInput({
      questionText,
    });

  const question =
    readQuestion(
      input.humanContext,
      questionText,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const decisionResult =
    runDecisionEngine({
      ...input,
      question,
      questionContext,
    });

  const decisionSnapshot =
    snapshotDecisionResult(
      decisionResult,
    );

  const plan =
    buildDecisionExplanationPlan(
      readDecisionResult(
        decisionResult,
      ),
      question.originalQuestion,
      questionContext,
    );

  const payload =
    buildDecisionExplanationPayload(
      plan,
    );

  return {
    decisionResult,
    decisionSnapshot,
    plan,
    payload,
  };
}

function buildCase(
  name:
    string,
  questionText:
    string,
  checksBuilder: (
    artifacts:
      ReturnType<
        typeof buildArtifacts
      >,
  ) => Record<
    string,
    boolean
  >,
): DecisionExplanationPayloadVerificationCase {
  const artifacts =
    buildArtifacts(
      questionText,
    );

  const checks =
    checksBuilder(
      artifacts,
    );

  return {
    name,

    question:
      questionText,

    focus:
      artifacts.plan.explanationFocus
      ?? null,

    explanationKind:
      artifacts.plan.explanationKind,

    selectedSteps:
      selectedRequiredSteps(
        artifacts.plan,
      ),

    payloadTitles:
      artifacts.payload.explanationOrder.map(
        (item) =>
          item.title,
      ),

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function commonPayloadContractChecks(
  artifacts:
    ReturnType<
      typeof buildArtifacts
    >,
): Record<
  string,
  boolean
> {
  const {
    plan,
    payload,
    decisionResult,
    decisionSnapshot,
  } = artifacts;

  return {
    payloadMatchesSelectedRequiredBlocks:
      payloadMatchesSelectedRequiredBlocks(
        plan,
        payload,
      ),

    mappedStepsFollowRequiredFilter:
      mappedStepsFollowRequiredFilter(
        plan,
        payload,
      ),

    payloadOmitsUnrequiredBlocks:
      plan.blocks
        .filter(
          (block) =>
            !block.required,
        )
        .every(
          (block) =>
            !payload.explanationOrder.some(
              (item) =>
                item.title
                === block.title
                && item.content
                  === block.content,
            ),
        ),

    payloadDoesNotExposeExplanationFocus:
      !(
        "explanationFocus"
        in payload
      ),

    keepsFinalDecision:
      payloadKeepsFinalDecisionContract(
        plan,
        payload,
        decisionResult,
      ),

    decisionResultUnchanged:
      snapshotDecisionResult(
        decisionResult,
      )
      === decisionSnapshot,
  };
}

function verifyCompatibility():
  DecisionExplanationPayloadVerificationCase {
  return buildCase(
    "A-compatibility-payload-omits-business-start-blocks",
    "우리 둘의 궁합은 어떤가요?",
    (
      artifacts,
    ) => {
      const {
        plan,
        payload,
      } = artifacts;

      return {
        ...commonPayloadContractChecks(
          artifacts,
        ),

        focusIsCompatibility:
          plan.explanationFocus
          === "compatibility",

        hasDirectCompatibilityAnswer:
          payloadHasTitle(
            payload,
            "직접 궁합 판단",
          ),

        hasFitOrConflict:
          payloadHasTitle(
            payload,
            "상대와의 맞음/충돌",
          ),

        hasNeededEvidence:
          payloadHasTitle(
            payload,
            "필요한 근거",
          ),

        hasCaution:
          payloadHasTitle(
            payload,
            "주의점",
          ),

        hasRelationshipDirection:
          payloadHasTitle(
            payload,
            "관계 방향",
          ),

        omitsGenericLifeContext:
          findPlanBlock(
            plan,
            "humanContext",
          )
          === undefined
          && !payloadHasTitle(
            payload,
            "이 사람에게서 중요한 특성",
          ),

        omitsReaderBusinessEffect:
          findPlanBlock(
            plan,
            "readerDecisionEffect",
          )
          === undefined
          && !payloadHasTitle(
            payload,
            "사람의 구조가 판단에 미친 영향",
          ),

        omitsProhibitedBusinessDirection:
          findPlanBlock(
            plan,
            "prohibitedDirection",
          )
          === undefined
          && !payloadHasTitle(
            payload,
            "피해야 할 진행 방식",
          ),

        omitsBusinessStartTitles:
          payloadOmitsTitles(
            payload,
            BUSINESS_START_TITLES,
          ),
      };
    },
  );
}

function verifyContinuation():
  DecisionExplanationPayloadVerificationCase {
  return buildCase(
    "B-continuation-payload-omits-business-start-blocks",
    "오래된 친구와 관계를 계속 이어가야 할까요?",
    (
      artifacts,
    ) => {
      const {
        plan,
        payload,
      } = artifacts;

      return {
        ...commonPayloadContractChecks(
          artifacts,
        ),

        focusIsContinuation:
          plan.explanationFocus
          === "continuation",

        hasKeepOrNotAnswer:
          payloadHasTitle(
            payload,
            "계속 유지하는 것이 맞는지",
          ),

        hasKeepEvidence:
          payloadHasTitle(
            payload,
            "유지의 근거",
          ),

        hasKeepConditions:
          payloadHasTitle(
            payload,
            "유지할 조건",
          ),

        hasLeaveSignals:
          payloadHasTitle(
            payload,
            "변경·이탈을 고려해야 하는 신호",
          ),

        omitsGenericLifeContext:
          findPlanBlock(
            plan,
            "humanContext",
          )
          === undefined
          && !payloadHasTitle(
            payload,
            "이 사람에게서 중요한 특성",
          ),

        omitsBusinessStartTitles:
          payloadOmitsTitles(
            payload,
            BUSINESS_START_TITLES,
          ),
      };
    },
  );
}

function verifyBusinessStart():
  DecisionExplanationPayloadVerificationCase {
  return buildCase(
    "C-business-start-payload-keeps-business-blocks",
    "지금 통닭집을 시작하면 성공할까요?",
    (
      artifacts,
    ) => {
      const {
        plan,
        payload,
      } = artifacts;

      const readerBlock =
        findPlanBlock(
          plan,
          "readerDecisionEffect",
        );

      return {
        ...commonPayloadContractChecks(
          artifacts,
        ),

        focusIsBusinessStart:
          plan.explanationFocus
          === "businessStart",

        hasBusinessFit:
          payloadHasTitle(
            payload,
            "사업 방향의 적합성",
          ),

        hasCurrentTiming:
          payloadHasTitle(
            payload,
            "현재 시점의 적합성",
          ),

        hasSuccessConditions:
          payloadHasTitle(
            payload,
            "성공을 위해 필요한 조건",
          ),

        hasBusinessRisks:
          payloadHasTitle(
            payload,
            "사업상 위험",
          ),

        hasRecommendedExecution:
          payloadHasTitle(
            payload,
            "권장 실행 방향",
          ),

        omitsUnrequiredReaderDecisionEffect:
          readerBlock?.required
          === false
          && !payloadHasTitle(
            payload,
            readerBlock.title,
          ),
      };
    },
  );
}

function verifyRealEstateBuy():
  DecisionExplanationPayloadVerificationCase {
  return buildCase(
    "D-real-estate-buy-payload-keeps-purchase-blocks",
    "대출 부담이 있는데 상가를 매수해도 될까요?",
    (
      artifacts,
    ) => {
      const {
        plan,
        payload,
        decisionResult,
      } = artifacts;

      const hasCashFlowEvidence =
        decisionResult.evidence.some(
          (item) =>
            item.source
            === "currentContext",
        );

      return {
        ...commonPayloadContractChecks(
          artifacts,
        ),

        focusIsRealEstateBuy:
          plan.explanationFocus
          === "realEstateBuy",

        hasPurchaseAnswer:
          payloadHasTitle(
            payload,
            "매수 판단",
          ),

        hasCurrentTiming:
          payloadHasTitle(
            payload,
            "현재 시점",
          ),

        emphasizesCashFlowOnlyWhenPresent:
          hasCashFlowEvidence
          && payloadHasTitle(
            payload,
            "자금·현금흐름을 포함한 매수 근거",
          ),

        hasRisks:
          payloadHasTitle(
            payload,
            "위험",
          ),

        hasExecutionConditions:
          payloadHasTitle(
            payload,
            "실행 조건",
          ),

        omitsBusinessStartTitles:
          payloadOmitsTitles(
            payload,
            BUSINESS_START_TITLES,
          ),
      };
    },
  );
}

function verifyGeneralJudgement():
  DecisionExplanationPayloadVerificationCase {
  return buildCase(
    "E-general-judgement-payload-keeps-core-answer-blocks",
    "여유자금으로 ETF에 투자해도 될까요?",
    (
      artifacts,
    ) => {
      const {
        plan,
        payload,
      } = artifacts;

      const directAnswer =
        payload.explanationOrder.find(
          (item) =>
            item.title
            === "질문에 대한 결론",
        );

      return {
        ...commonPayloadContractChecks(
          artifacts,
        ),

        focusIsGeneralJudgement:
          plan.explanationFocus
          === "generalJudgement",

        hasDirectAnswer:
          (
            directAnswer?.content.includes(
              "여유자금으로 ETF에 투자해도 될까요?",
            )
            ?? false
          ),

        hasNeededEvidence:
          payloadHasTitle(
            payload,
            "필요한 근거",
          ),

        hasConditions:
          payloadHasTitle(
            payload,
            "조건",
          ),

        hasRisks:
          payloadHasTitle(
            payload,
            "위험",
          ),

        omitsGenericLifeContext:
          findPlanBlock(
            plan,
            "humanContext",
          )
          === undefined
          && !payloadHasTitle(
            payload,
            "이 사람에게서 중요한 특성",
          ),

        omitsBusinessStartTitles:
          payloadOmitsTitles(
            payload,
            BUSINESS_START_TITLES,
          ),
      };
    },
  );
}

function verifyRoleRecommendation():
  DecisionExplanationPayloadVerificationCase {
  return buildCase(
    "F-role-recommendation-payload-keeps-existing-blocks",
    ROLE_QUESTION,
    (
      artifacts,
    ) => {
      const {
        plan,
        payload,
        decisionResult,
      } = artifacts;

      return {
        ...commonPayloadContractChecks(
          artifacts,
        ),

        explanationKindIsRoleRecommendation:
          plan.explanationKind
          === "roleRecommendation"
          && payload.explanationKind
            === "roleRecommendation",

        focusIsNotDecisionType:
          plan.explanationFocus
          === undefined,

        hasRoleDirectAnswer:
          payloadHasTitle(
            payload,
            "성격 한 줄 제목",
          ),

        hasPrimaryRole:
          payloadHasTitle(
            payload,
            "가장 어울리는 대표 배역",
          ),

        hasRoleEvidence:
          payloadHasTitle(
            payload,
            "배역별 사주·Reader 근거",
          ),

        hasPerformanceSection:
          payloadHasTitle(
            payload,
            "대사·표정·움직임·장면에서의 표현 방식",
          ),

        omitsConditionAndRiskBlocks:
          findPlanBlock(
            plan,
            "conditions",
          )
          === undefined
          && findPlanBlock(
            plan,
            "risks",
          )
          === undefined
          && !payloadHasTitle(
            payload,
            "진행 전에 갖춰야 할 조건",
          )
          && !payloadHasTitle(
            payload,
            "이번 선택에서 주의할 위험",
          ),

        assessmentAvailable:
          decisionResult
            .roleRecommendationAssessment
            ?.available
          === true,
      };
    },
  );
}

function buildAvailableLifeFlowAssessment():
  LifeFlowInterpretationAssessment {
  return {
    available:
      true,

    target: {
      scope:
        "overall",

      referenceDate:
        "2025-08-16",

      targetYear:
        2025,

      targetMonth:
        null,

      targetDay:
        null,

      half:
        null,

      startDate:
        "2025-01-01",

      endDate:
        "2025-12-31",

      yearExplicit:
        true,

      evidence: [
        "올해 총운을 봐주세요",
      ],

      limitations:
        [],
    },

    overallTheme:
      "전체 흐름의 핵심 한 줄",

    supportiveSignals: [
      "유리하게 나타나는 부분",
    ],

    tensionSignals: [
      "주의할 흐름",
    ],

    phaseInterpretation:
      "국면 해석",

    periodSegments:
      [],

    periodInteractions:
      [],

    signalContributions:
      [],

    cautions:
      [],

    limitations:
      [],

    evidenceKeys:
      [],

    sourceLocked:
      true,
  };
}

function verifyLifeFlowInterpretation():
  DecisionExplanationPayloadVerificationCase {
  const input =
    buildDecisionEngineRegressionInput({
      questionText:
        LIFE_FLOW_QUESTION,
    });

  const question =
    readQuestion(
      input.humanContext,
      LIFE_FLOW_QUESTION,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const decisionResult =
    runDecisionEngine({
      ...input,
      question,
      questionContext,
    });

  const decisionSnapshot =
    snapshotDecisionResult(
      decisionResult,
    );

  const explanationInput:
    DecisionExplanationInput = {
      ...readDecisionResult(
        decisionResult,
      ),

      lifeFlowInterpretationAssessment:
        buildAvailableLifeFlowAssessment(),
    };

  const plan =
    buildDecisionExplanationPlan(
      explanationInput,
      question.originalQuestion,
      questionContext,
    );

  const payload =
    buildDecisionExplanationPayload(
      plan,
    );

  const artifacts = {
    decisionResult,
    decisionSnapshot,
    plan,
    payload,
  };

  const checks = {
    ...commonPayloadContractChecks(
      artifacts,
    ),

    explanationKindIsLifeFlow:
      plan.explanationKind
      === "lifeFlowInterpretation"
      && payload.explanationKind
        === "lifeFlowInterpretation",

    focusIsNotDecisionType:
      plan.explanationFocus
      === undefined,

    hasPeriodAnswer:
      payloadHasTitle(
        payload,
        "질문한 기간",
      ),

    hasOverallTheme:
      payloadHasTitle(
        payload,
        "전체 흐름의 핵심 한 줄",
      ),

    omitsUnrequiredMonthDayEvidence:
      findPlanBlock(
        plan,
        "readerDecisionEffect",
      )?.required
      === false
      && !payloadHasTitle(
        payload,
        "월운·일운 근거",
      ),

    assessmentPathUsed:
      explanationInput
        .lifeFlowInterpretationAssessment
        ?.available
      === true,
  };

  return {
    name:
      "G-life-flow-payload-keeps-existing-blocks",

    question:
      LIFE_FLOW_QUESTION,

    focus:
      plan.explanationFocus
      ?? null,

    explanationKind:
      plan.explanationKind,

    selectedSteps:
      selectedRequiredSteps(
        plan,
      ),

    payloadTitles:
      payload.explanationOrder.map(
        (item) =>
          item.title,
      ),

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyDecisionResultAndFinalDecision():
  DecisionExplanationPayloadVerificationCase {
  return buildCase(
    "H-I-decision-result-and-final-decision-stay-locked",
    "지금 새로운 사업을 시작해도 될까요?",
    (
      artifacts,
    ) => {
      const {
        plan,
        payload,
        decisionResult,
        decisionSnapshot,
      } = artifacts;

      const explanation =
        readDecisionResult(
          decisionResult,
        );

      return {
        ...commonPayloadContractChecks(
          artifacts,
        ),

        payloadVerdictMatchesResult:
          payload.verdict
          === decisionResult.verdict,

        payloadUsesEngineEvidence:
          explanation.evidence.every(
            (item) =>
              decisionResult.evidence.some(
                (source) =>
                  source.description
                  === item.description,
              ),
          ),

        payloadUsesEngineConditions:
          explanation.conditions.every(
            (item) =>
              decisionResult.conditions.some(
                (source) =>
                  source.description
                  === item.description,
              ),
          ),

        payloadUsesEngineRisks:
          explanation.risks.every(
            (item) =>
              decisionResult.risks.some(
                (source) =>
                  source.description
                  === item.description,
              ),
          ),

        payloadUsesRecommendedDirection:
          payload.explanationOrder.some(
            (item) =>
              item.content
              === decisionResult.recommendedDirection,
          ),

        payloadUsesProhibitedDirection:
          payload.explanationOrder.some(
            (item) =>
              item.content
              === decisionResult.prohibitedDirection,
          ),

        payloadFinalDecisionMatchesSentence:
          payload.finalDecision
          === decisionResult.finalDecisionSentence,

        decisionResultUnchangedAfterPayload:
          snapshotDecisionResult(
            decisionResult,
          )
          === decisionSnapshot
          && snapshotDecisionResult(
            decisionResult,
          )
          === snapshotDecisionResult({
            ...decisionResult,
          }),

        planSelectedStepsReachPayload:
          payloadMatchesSelectedRequiredBlocks(
            plan,
            payload,
          ),
      };
    },
  );
}

function countOccurrences(
  value:
    string,
  target:
    string,
): number {
  return value
    .split(
      target,
    )
    .length - 1;
}

function verifyExistingIntegrationFailureCause():
  DecisionExplanationPayloadVerificationCase {
  const integration =
    verifyReaderDecisionExplanationIntegration();

  const failedCheckNames =
    integration.cases.flatMap(
      (verificationCase) =>
        Object.entries(
          verificationCase.checks,
        )
          .filter(
            ([, value]) =>
              value
              === false,
          )
          .map(
            ([name]) =>
              name,
          ),
    );

  const uniqueFailedCheckNames =
    [
      ...new Set(
        failedCheckNames,
      ),
    ];

  const payloadContractHolds =
    integration.cases.every(
      (verificationCase) =>
        verificationCase.checks
          .payloadExcludesFinalDecisionFromOrder
        === true
        && verificationCase.checks
          .promptIncludesCanonicalFinalDecision
        === true,
    );

  const promptNoLongerRepeatsFinalDecisionPhrase =
    integration.cases.every(
      (verificationCase) => {
        const payloadPhraseCount =
          countOccurrences(
            [
              verificationCase.payload.finalDecision,
              ...verificationCase.payload.explanationOrder.map(
                (item) =>
                  `${item.title}\n${item.content}`,
              ),
            ].join(
              "\n",
            ),
            "최종 결론",
          );

        const promptPhraseCount =
          countOccurrences(
            verificationCase.prompt.userPrompt,
            "최종 결론",
          );

        return (
          verificationCase.checks
            .promptIncludesFinalDecisionOnce
          === true
          && payloadPhraseCount
          === 0
          && promptPhraseCount
          === 1
          && !verificationCase.prompt.userPrompt.includes(
            "최종 결론 작성 규칙",
          )
        );
      },
    );

  const representative =
    integration.cases[0];

  const checks = {
    promptIncludesFinalDecisionOnceIsResolved:
      uniqueFailedCheckNames.length
      === 0
      && integration.cases.every(
        (verificationCase) =>
          verificationCase.checks
            .promptIncludesFinalDecisionOnce
          === true,
      ),

    payloadFinalDecisionContractStillHolds:
      payloadContractHolds,

    promptTemplateNoLongerRepeatsFinalDecisionPhrase:
      promptNoLongerRepeatsFinalDecisionPhrase,

    integrationPromptFailureIsResolved:
      integration.passed
      && payloadContractHolds
      && promptNoLongerRepeatsFinalDecisionPhrase,
  };

  return {
    name:
      "J-existing-integration-prompt-failure-is-resolved",

    question:
      representative?.payload.originalQuestion
      ?? "새로운 사업을 지금 시작해도 될까요?",

    focus:
      representative?.plan.explanationFocus
      ?? null,

    explanationKind:
      representative?.plan.explanationKind,

    selectedSteps:
      representative
        ? selectedRequiredSteps(
            representative.plan,
          )
        : [],

    payloadTitles:
      representative?.payload.explanationOrder.map(
        (item) =>
          item.title,
      )
      ?? [],

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

export function verifyDecisionExplanationPayload():
  DecisionExplanationPayloadVerificationResult {
  const cases = [
    verifyCompatibility(),
    verifyContinuation(),
    verifyBusinessStart(),
    verifyRealEstateBuy(),
    verifyGeneralJudgement(),
    verifyRoleRecommendation(),
    verifyLifeFlowInterpretation(),
    verifyDecisionResultAndFinalDecision(),
    verifyExistingIntegrationFailureCause(),
  ];

  return {
    cases,

    passed:
      cases.every(
        (verificationCase) =>
          verificationCase.passed,
      ),
  };
}
