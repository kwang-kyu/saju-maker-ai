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
} from "./decisionExplanationPlan.js";

import type {
  DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

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

export type DecisionExplanationPlanVerificationCase = {
  name:
    string;

  question:
    string;

  focus:
    DecisionExplanationFocus
    | null;

  explanationKind:
    DecisionExplanationPlan["explanationKind"];

  stepTitles:
    string[];

  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export type DecisionExplanationPlanVerificationResult = {
  cases:
    DecisionExplanationPlanVerificationCase[];

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

function hasStep(
  plan:
    DecisionExplanationPlan,
  step:
    DecisionExplanationPlan["blocks"][number]["step"],
): boolean {
  return plan.blocks.some(
    (block) =>
      block.step
      === step,
  );
}

function findBlock(
  plan:
    DecisionExplanationPlan,
  step:
    DecisionExplanationPlan["blocks"][number]["step"],
) {
  return plan.blocks.find(
    (block) =>
      block.step
      === step,
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

  return {
    decisionResult,
    decisionSnapshot,
    plan,
  };
}

function buildCase(
  name:
    string,
  questionText:
    string,
  _expectedFocus:
    DecisionExplanationFocus
    | null,
  checksBuilder: (
    artifacts:
      ReturnType<
        typeof buildArtifacts
      >,
  ) => Record<
    string,
    boolean
  >,
): DecisionExplanationPlanVerificationCase {
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

    stepTitles:
      artifacts.plan.blocks.map(
        (block) =>
          block.title,
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

function verifyCompatibility():
  DecisionExplanationPlanVerificationCase {
  return buildCase(
    "A-compatibility-omits-business-start-steps",
    "우리 둘의 궁합은 어떤가요?",
    "compatibility",
    (
      artifacts,
    ) => {
      const {
        plan,
        decisionResult,
        decisionSnapshot,
      } = artifacts;

      const titles =
        plan.blocks.map(
          (block) =>
            block.title,
        );

      return {
        focusIsCompatibility:
          plan.explanationFocus
          === "compatibility",

        hasDirectCompatibilityAnswer:
          findBlock(
            plan,
            "directAnswer",
          )?.title
          === "직접 궁합 판단",

        hasFitOrConflict:
          findBlock(
            plan,
            "alignment",
          )?.title
          === "상대와의 맞음/충돌",

        hasNeededEvidence:
          findBlock(
            plan,
            "evidence",
          )?.title
          === "필요한 근거",

        hasCaution:
          findBlock(
            plan,
            "risks",
          )?.title
          === "주의점",

        hasRelationshipDirection:
          findBlock(
            plan,
            "recommendedDirection",
          )?.title
          === "관계 방향",

        omitsGenericLifeContext:
          !hasStep(
            plan,
            "humanContext",
          ),

        omitsReaderBusinessEffect:
          !hasStep(
            plan,
            "readerDecisionEffect",
          ),

        omitsProhibitedBusinessDirection:
          !hasStep(
            plan,
            "prohibitedDirection",
          ),

        omitsBusinessStartTitles:
          BUSINESS_START_TITLES.every(
            (title) =>
              !titles.includes(
                title,
              ),
          ),

        keepsFinalDecision:
          findBlock(
            plan,
            "finalDecision",
          )?.content
          === decisionResult.finalDecisionSentence,

        decisionResultUnchanged:
          snapshotDecisionResult(
            decisionResult,
          )
          === decisionSnapshot,
      };
    },
  );
}

function verifyContinuation():
  DecisionExplanationPlanVerificationCase {
  return buildCase(
    "B-continuation-uses-continuation-steps",
    "오래된 친구와 관계를 계속 이어가야 할까요?",
    "continuation",
    (
      artifacts,
    ) => {
      const {
        plan,
        decisionResult,
      } = artifacts;

      return {
        focusIsContinuation:
          plan.explanationFocus
          === "continuation",

        hasKeepOrNotAnswer:
          findBlock(
            plan,
            "directAnswer",
          )?.title
          === "계속 유지하는 것이 맞는지",

        hasKeepEvidence:
          findBlock(
            plan,
            "evidence",
          )?.title
          === "유지의 근거",

        hasKeepConditions:
          findBlock(
            plan,
            "conditions",
          )?.title
          === "유지할 조건",

        hasLeaveSignals:
          findBlock(
            plan,
            "risks",
          )?.title
          === "변경·이탈을 고려해야 하는 신호",

        omitsGenericLifeContext:
          !hasStep(
            plan,
            "humanContext",
          ),

        omitsBusinessStartTitles:
          BUSINESS_START_TITLES.every(
            (title) =>
              !plan.blocks.some(
                (block) =>
                  block.title
                  === title,
              ),
          ),

        keepsFinalDecision:
          findBlock(
            plan,
            "finalDecision",
          )?.content
          === decisionResult.finalDecisionSentence,
      };
    },
  );
}

function verifyTermination():
  DecisionExplanationPlanVerificationCase {
  return buildCase(
    "termination-uses-leave-or-move-steps",
    "현재 직장을 옮겨 이직해도 될까요?",
    "termination",
    (
      artifacts,
    ) => {
      const {
        plan,
      } = artifacts;

      return {
        focusIsTermination:
          plan.explanationFocus
          === "termination",

        hasLeaveAnswer:
          findBlock(
            plan,
            "directAnswer",
          )?.title
          === "현재 상태에서 벗어나는 것이 맞는지",

        hasMoveEvidence:
          findBlock(
            plan,
            "evidence",
          )?.title
          === "이동·변경의 근거",

        hasExecutionConditions:
          findBlock(
            plan,
            "conditions",
          )?.title
          === "실행 조건",

        hasRisks:
          findBlock(
            plan,
            "risks",
          )?.title
          === "위험",

        hasAvoidedMethod:
          findBlock(
            plan,
            "prohibitedDirection",
          )?.title
          === "피해야 할 방식",
      };
    },
  );
}

function verifyBusinessStart():
  DecisionExplanationPlanVerificationCase {
  return buildCase(
    "C-business-start-uses-business-steps",
    "통닭집 창업을 해도 될까요?",
    "businessStart",
    (
      artifacts,
    ) => {
      const {
        plan,
        decisionResult,
      } = artifacts;

      return {
        focusIsBusinessStart:
          plan.explanationFocus
          === "businessStart",

        hasBusinessFit:
          findBlock(
            plan,
            "directAnswer",
          )?.title
          === "사업 방향의 적합성",

        hasCurrentTiming:
          findBlock(
            plan,
            "alignment",
          )?.title
          === "현재 시점의 적합성",

        hasSuccessConditions:
          findBlock(
            plan,
            "conditions",
          )?.title
          === "성공을 위해 필요한 조건",

        hasBusinessRisks:
          findBlock(
            plan,
            "risks",
          )?.title
          === "사업상 위험",

        hasRecommendedExecution:
          findBlock(
            plan,
            "recommendedDirection",
          )?.title
          === "권장 실행 방향",

        keepsReaderEffect:
          hasStep(
            plan,
            "readerDecisionEffect",
          ),

        keepsFinalDecision:
          findBlock(
            plan,
            "finalDecision",
          )?.content
          === decisionResult.finalDecisionSentence,
      };
    },
  );
}

function verifyRealEstateBuy():
  DecisionExplanationPlanVerificationCase {
  return buildCase(
    "D-real-estate-buy-uses-purchase-steps",
    "대출 부담이 있는데 상가를 매수해도 될까요?",
    "realEstateBuy",
    (
      artifacts,
    ) => {
      const {
        plan,
        decisionResult,
      } = artifacts;

      const hasCashFlowEvidence =
        decisionResult.evidence.some(
          (item) =>
            item.source
            === "currentContext",
        );

      return {
        focusIsRealEstateBuy:
          plan.explanationFocus
          === "realEstateBuy",

        hasPurchaseAnswer:
          findBlock(
            plan,
            "directAnswer",
          )?.title
          === "매수 판단",

        hasCurrentTiming:
          findBlock(
            plan,
            "alignment",
          )?.title
          === "현재 시점",

        emphasizesCashFlowOnlyWhenPresent:
          hasCashFlowEvidence
          && findBlock(
            plan,
            "evidence",
          )?.title
          === "자금·현금흐름을 포함한 매수 근거",

        hasRisks:
          findBlock(
            plan,
            "risks",
          )?.title
          === "위험",

        hasExecutionConditions:
          findBlock(
            plan,
            "conditions",
          )?.title
          === "실행 조건",

        omitsBusinessStartTitles:
          BUSINESS_START_TITLES.every(
            (title) =>
              !plan.blocks.some(
                (block) =>
                  block.title
                  === title,
              ),
          ),
      };
    },
  );
}

function verifyRealEstateBuyWithoutCashFlow():
  DecisionExplanationPlanVerificationCase {
  return buildCase(
    "D-real-estate-buy-omits-invented-cash-flow",
    "지금 상가를 매수해도 될까요?",
    "realEstateBuy",
    (
      artifacts,
    ) => {
      const {
        plan,
        decisionResult,
      } = artifacts;

      const hasCashFlowEvidence =
        decisionResult.evidence.some(
          (item) =>
            item.source
            === "currentContext",
        );

      return {
        focusIsRealEstateBuy:
          plan.explanationFocus
          === "realEstateBuy",

        doesNotInventCashFlowTitle:
          hasCashFlowEvidence
          || findBlock(
            plan,
            "evidence",
          )?.title
          === "매수 판단 근거",
      };
    },
  );
}

function verifyGeneralJudgement():
  DecisionExplanationPlanVerificationCase {
  return buildCase(
    "E-general-judgement-answers-directly",
    "여유자금으로 ETF에 투자해도 될까요?",
    "generalJudgement",
    (
      artifacts,
    ) => {
      const {
        plan,
        decisionResult,
      } = artifacts;

      const directAnswer =
        findBlock(
          plan,
          "directAnswer",
        );

      return {
        focusIsGeneralJudgement:
          plan.explanationFocus
          === "generalJudgement",

        hasDirectAnswer:
          directAnswer?.title
          === "질문에 대한 결론"
          && (
            directAnswer?.content.includes(
              "여유자금으로 ETF에 투자해도 될까요?",
            )
            ?? false
          ),

        hasNeededEvidence:
          findBlock(
            plan,
            "evidence",
          )?.title
          === "필요한 근거",

        hasConditions:
          findBlock(
            plan,
            "conditions",
          )?.title
          === "조건",

        hasRisks:
          findBlock(
            plan,
            "risks",
          )?.title
          === "위험",

        hasFinalDecision:
          findBlock(
            plan,
            "finalDecision",
          )?.content
          === decisionResult.finalDecisionSentence,

        omitsGenericLifeContext:
          !hasStep(
            plan,
            "humanContext",
          ),

        omitsBusinessStartTitles:
          BUSINESS_START_TITLES.every(
            (title) =>
              !plan.blocks.some(
                (block) =>
                  block.title
                  === title,
              ),
          ),
      };
    },
  );
}

function verifyRoleRecommendation():
  DecisionExplanationPlanVerificationCase {
  return buildCase(
    "F-role-recommendation-keeps-existing-plan",
    ROLE_QUESTION,
    null,
    (
      artifacts,
    ) => {
      const {
        plan,
        decisionResult,
      } = artifacts;

      return {
        explanationKindIsRoleRecommendation:
          plan.explanationKind
          === "roleRecommendation",

        focusIsNotDecisionType:
          plan.explanationFocus
          === undefined,

        hasRoleDirectAnswer:
          hasStep(
            plan,
            "directAnswer",
          ),

        hasRoleEvidence:
          hasStep(
            plan,
            "evidence",
          ),

        hasFinalRecommendation:
          findBlock(
            plan,
            "finalDecision",
          )?.title
          === "최종 추천"
          && findBlock(
            plan,
            "finalDecision",
          )?.content
          === decisionResult.finalDecisionSentence,

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
  DecisionExplanationPlanVerificationCase {
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

  const checks = {
    explanationKindIsLifeFlow:
      plan.explanationKind
      === "lifeFlowInterpretation",

    focusIsNotDecisionType:
      plan.explanationFocus
      === undefined,

    hasPeriodAnswer:
      findBlock(
        plan,
        "directAnswer",
      )?.title
      === "질문한 기간",

    hasOverallTheme:
      findBlock(
        plan,
        "humanContext",
      )?.title
      === "전체 흐름의 핵심 한 줄",

    hasFinalSummary:
      findBlock(
        plan,
        "finalDecision",
      )?.title
      === "최종 요약"
      && findBlock(
        plan,
        "finalDecision",
      )?.content
      === explanationInput.finalDecisionSentence,

    assessmentPathUsed:
      explanationInput
        .lifeFlowInterpretationAssessment
        ?.available
      === true,
  };

  return {
    name:
      "F-life-flow-keeps-existing-plan",

    question:
      LIFE_FLOW_QUESTION,

    focus:
      plan.explanationFocus
      ?? null,

    explanationKind:
      plan.explanationKind,

    stepTitles:
      plan.blocks.map(
        (block) =>
          block.title,
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

function verifyFinalDecisionAndDecisionResult():
  DecisionExplanationPlanVerificationCase {
  return buildCase(
    "G-H-final-decision-and-decision-result-stay-locked",
    "지금 새로운 사업을 시작해도 될까요?",
    "businessStart",
    (
      artifacts,
    ) => {
      const {
        plan,
        decisionResult,
        decisionSnapshot,
      } = artifacts;

      const explanation =
        readDecisionResult(
          decisionResult,
        );

      return {
        keepsFinalDecisionStep:
          findBlock(
            plan,
            "finalDecision",
          )?.content
          === decisionResult.finalDecisionSentence,

        planVerdictMatchesResult:
          plan.verdict
          === decisionResult.verdict,

        planUsesEngineEvidence:
          explanation.evidence.every(
            (item) =>
              decisionResult.evidence.some(
                (source) =>
                  source.description
                  === item.description,
              ),
          ),

        planUsesEngineConditions:
          explanation.conditions.every(
            (item) =>
              decisionResult.conditions.some(
                (source) =>
                  source.description
                  === item.description,
              ),
          ),

        planUsesEngineRisks:
          explanation.risks.every(
            (item) =>
              decisionResult.risks.some(
                (source) =>
                  source.description
                  === item.description,
              ),
          ),

        decisionResultUnchanged:
          snapshotDecisionResult(
            decisionResult,
          )
          === decisionSnapshot,
      };
    },
  );
}

export function verifyDecisionExplanationPlan():
  DecisionExplanationPlanVerificationResult {
  const cases = [
    verifyCompatibility(),
    verifyContinuation(),
    verifyTermination(),
    verifyBusinessStart(),
    verifyRealEstateBuy(),
    verifyRealEstateBuyWithoutCashFlow(),
    verifyGeneralJudgement(),
    verifyRoleRecommendation(),
    verifyLifeFlowInterpretation(),
    verifyFinalDecisionAndDecisionResult(),
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
