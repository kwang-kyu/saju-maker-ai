import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture.js";

import {
  runDecisionEngine,
} from "../decision/decisionEngine.js";

import {
  buildQuestionContext,
} from "../question/questionContextBuilder.js";

import {
  readQuestion,
} from "../question/questionReader.js";

import {
  readDecisionResult,
  type DecisionExplanationInput,
} from "./decisionResultReader.js";

import type {
  LifeFlowInterpretationAssessment,
} from "../decision/lifeFlowInterpretationAssessment.js";

import {
  buildDecisionExplanationPlan,
} from "./decisionExplanationPlan.js";

import type {
  DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

import {
  buildDecisionExplanationPayload,
} from "./decisionExplanationPayload.js";

import {
  buildConsultingPrompt,
  type ConsultingPrompt,
} from "./consultingPromptBuilder.js";

import {
  verifyRoleRecommendationExplanation,
} from "./roleRecommendationExplanationVerification.js";

import {
  verifyConsultingAnswerQuality,
} from "./consultingAnswerQualityVerification.js";

import {
  verifyReaderDecisionExplanationIntegration,
} from "./readerDecisionExplanationIntegrationVerification.js";

const ROLE_QUESTION =
  "내가 연극을 하면 어떤 역할이 어울릴까요?";

const LIFE_FLOW_QUESTION =
  "올해 총운을 봐주세요";

const BUSINESS_START_PROMPT_MARKERS = [
  "사업을 시작하는 것이 맞는지 중심으로 답한다",
  "현재 시점, 성공 조건, 사업 위험, 실행 방향을 필요한 만큼 설명한다",
] as const;

export type ConsultingPromptBuilderVerificationCase = {
  name:
    string;

  question:
    string;

  focus:
    DecisionExplanationFocus
    | null;

  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export type ConsultingPromptBuilderVerificationResult = {
  cases:
    ConsultingPromptBuilderVerificationCase[];

  passed:
    boolean;
};

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

function combinedPromptText(
  prompt:
    ConsultingPrompt,
): string {
  return [
    prompt.systemPrompt,
    prompt.userPrompt,
  ].join(
    "\n",
  );
}

function buildArtifacts(
  questionText:
    string,
): {
  focus:
    DecisionExplanationFocus
    | null;

  prompt:
    ConsultingPrompt;

  finalDecision:
    string;

  verdictLabelPresent:
    boolean;
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

  const prompt =
    buildConsultingPrompt(
      payload,
      undefined,
      questionContext,
    );

  return {
    focus:
      plan.explanationFocus
      ?? null,

    prompt,

    finalDecision:
      payload.finalDecision,

    verdictLabelPresent:
      prompt.userPrompt.includes(
        "확정된 판단",
      ),
  };
}

function buildCase(
  name:
    string,
  questionText:
    string,
  expectedFocus:
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
): ConsultingPromptBuilderVerificationCase {
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
      artifacts.focus,

    checks,

    passed:
      artifacts.focus
      === expectedFocus
      && Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyCompatibility():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "A-B-compatibility-prompt-does-not-force-business-or-strength-first",
    "우리 둘의 궁합은 어떤가요?",
    "compatibility",
    (
      artifacts,
    ) => {
      const combined =
        combinedPromptText(
          artifacts.prompt,
        );

      return {
        usesCompatibilityFocus:
          artifacts.focus
          === "compatibility",

        answersCompatibilityDirectly:
          artifacts.prompt.systemPrompt.includes(
            "두 사람의 궁합에 직접 답한다",
          ),

        explainsFitAndConflict:
          artifacts.prompt.systemPrompt.includes(
            "잘 맞는 부분과 충돌하는 부분을 필요한 근거와 함께 설명한다",
          ),

        doesNotForceBusinessStartExplanation:
          BUSINESS_START_PROMPT_MARKERS.every(
            (marker) =>
              !artifacts.prompt.systemPrompt.includes(
                marker,
              ),
          ),

        doesNotForceStrengthThenWeakness:
          !combined.includes(
            "먼저 이 사람에게서 현재 질문과 관련된 강점과 취약점",
          )
          && !combined.includes(
            "먼저 강점과 취약점",
          ),
      };
    },
  );
}

function verifyContinuation():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "D-continuation-prompt-centers-keep-or-change",
    "오래된 친구와 관계를 계속 이어가야 할까요?",
    "continuation",
    (
      artifacts,
    ) => ({
      usesContinuationFocus:
        artifacts.focus
        === "continuation",

      centersKeepDecision:
        artifacts.prompt.systemPrompt.includes(
          "계속 유지하는 것이 맞는지 중심으로 답한다",
        ),

      explainsKeepReasonsAndConditions:
        artifacts.prompt.systemPrompt.includes(
          "유지해야 할 이유와 조건을 설명한다",
        ),

      explainsLeaveSignalsOnlyWhenPresent:
        artifacts.prompt.systemPrompt.includes(
          "변화 또는 이탈 신호가 있을 때만 설명한다",
        ),
    }),
  );
}

function verifyTermination():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "termination-prompt-centers-leave-or-move",
    "현재 직장을 옮겨 이직해도 될까요?",
    "termination",
    (
      artifacts,
    ) => ({
      usesTerminationFocus:
        artifacts.focus
        === "termination",

      answersLeaveOrMoveDirectly:
        artifacts.prompt.systemPrompt.includes(
          "계속할지 떠날지 또는 변경할지에 직접 답한다",
        ),

      centersEvidenceConditionsRisks:
        artifacts.prompt.systemPrompt.includes(
          "필요한 근거와 실행 조건, 위험을 중심으로 설명한다",
        ),
    }),
  );
}

function verifyBusinessStart():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "C-business-start-prompt-centers-business-decision",
    "지금 통닭집을 시작하면 성공할까요?",
    "businessStart",
    (
      artifacts,
    ) => ({
      usesBusinessStartFocus:
        artifacts.focus
        === "businessStart",

      centersBusinessStartDecision:
        artifacts.prompt.systemPrompt.includes(
          "사업을 시작하는 것이 맞는지 중심으로 답한다",
        ),

      usesNeededBusinessMaterials:
        artifacts.prompt.systemPrompt.includes(
          "현재 시점, 성공 조건, 사업 위험, 실행 방향을 필요한 만큼 설명한다",
        ),

      avoidsGenericSajuRepetition:
        artifacts.prompt.systemPrompt.includes(
          "일반적인 사주 성향 설명을 길게 반복하지 않는다",
        ),
    }),
  );
}

function verifyRealEstateBuy():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "E-real-estate-buy-prompt-centers-purchase-decision",
    "대출 부담이 있는데 상가를 매수해도 될까요?",
    "realEstateBuy",
    (
      artifacts,
    ) => ({
      usesRealEstateBuyFocus:
        artifacts.focus
        === "realEstateBuy",

      centersPurchaseAndTiming:
        artifacts.prompt.systemPrompt.includes(
          "매수 여부와 현재 시점에 집중한다",
        ),

      usesCashFlowOnlyWhenEvidenceExists:
        artifacts.prompt.systemPrompt.includes(
          "자금과 현금흐름은 실제 근거 자료가 있을 때만 설명한다",
        ),

      avoidsGenericLifeRepetition:
        artifacts.prompt.systemPrompt.includes(
          "일반적인 인생 설명을 반복하지 않는다",
        ),
    }),
  );
}

function verifyGeneralJudgement():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "F-general-judgement-prompt-centers-the-question",
    "여유자금으로 ETF에 투자해도 될까요?",
    "generalJudgement",
    (
      artifacts,
    ) => ({
      usesGeneralJudgementFocus:
        artifacts.focus
        === "generalJudgement",

      answersTheQuestionDirectly:
        artifacts.prompt.systemPrompt.includes(
          "질문 자체에 직접 답한다",
        ),

      usesNeededEvidenceOnly:
        artifacts.prompt.systemPrompt.includes(
          "필요한 근거와 조건, 위험만 사용한다",
        ),

      doesNotForceUnrelatedReaderExplanation:
        artifacts.prompt.systemPrompt.includes(
          "질문과 관계없는 설명을 억지로 붙이지 않는다",
        ),
    }),
  );
}

function verifyFinalDecisionIsNotDuplicated():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "G-final-decision-is-not-forced-twice",
    "새로운 사업을 지금 시작해도 될까요?",
    "businessStart",
    (
      artifacts,
    ) => ({
      userPromptMentionsFinalDecisionOnce:
        countOccurrences(
          artifacts.prompt.userPrompt,
          "최종 결론",
        ) === 1,

      userPromptKeepsSingleSectionTitle:
        artifacts.prompt.userPrompt.includes(
          "엔진이 확정한 최종 결론",
        ),

      userPromptOmitsOldLastParagraphRules:
        !artifacts.prompt.userPrompt.includes(
          "최종 결론 작성 규칙",
        )
        && !artifacts.prompt.userPrompt.includes(
          "위 최종 결론을 답변의 마지막 단락에",
        )
        && !artifacts.prompt.userPrompt.includes(
          "최종 결론은 답변 전체에 정확히 1회만 작성하세요",
        ),

      systemPromptOmitsLastParagraphCopyRule:
        !artifacts.prompt.systemPrompt.includes(
          "답변의 마지막 단락에는 제공된 엔진 확정 최종 결론을 한 글자도 변경하지 않고 그대로 작성한다",
        ),

      explanationOrderIsNotNumberedOutline:
        artifacts.prompt.userPrompt.includes(
          "그대로 번호 매겨 출력해야 하는 목차가 아닙니다",
        )
        && !artifacts.prompt.systemPrompt.includes(
          "번호가 매겨진 explanationOrder를 그대로 나열",
        ),
    }),
  );
}

function verifyEngineDecisionIsLocked():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "H-prompt-does-not-change-engine-verdict-or-final-decision",
    "새로운 사업을 지금 시작해도 될까요?",
    "businessStart",
    (
      artifacts,
    ) => ({
      systemPromptForbidsVerdictChange:
        artifacts.prompt.systemPrompt.includes(
          "엔진의 verdict를 변경하지 않는다",
        ),

      systemPromptForbidsFinalDecisionChange:
        artifacts.prompt.systemPrompt.includes(
          "엔진이 확정한 최종 결론 원문을 변경하거나 약화하지 않는다",
        ),

      systemPromptExplainsInsteadOfRejudging:
        artifacts.prompt.systemPrompt.includes(
          "GPT는 판단을 새로 만들지 않고 엔진 판단을 사람이 이해할 수 있게 설명한다",
        ),

      userPromptIncludesCanonicalFinalDecision:
        artifacts.prompt.userPrompt.includes(
          artifacts.finalDecision,
        ),

      userPromptIncludesLockedVerdictSection:
        artifacts.verdictLabelPresent,
    }),
  );
}

function verifyRoleRecommendationKept():
  ConsultingPromptBuilderVerificationCase {
  const existing =
    verifyRoleRecommendationExplanation();

  const artifacts =
    buildArtifacts(
      ROLE_QUESTION,
    );

  return {
    name:
      "I-existing-role-recommendation-prompt-is-kept",

    question:
      ROLE_QUESTION,

    focus:
      artifacts.focus,

    checks: {
      existingRoleRecommendationVerificationPasses:
        existing.passed,

      promptStillIncludesRoleRules:
        artifacts.prompt.systemPrompt.includes(
          "evidence에 없는 배역",
        )
        && artifacts.prompt.systemPrompt.includes(
          "세 가지 배역 후보",
        ),

      promptDoesNotApplyDecisionFocusRules:
        !artifacts.prompt.systemPrompt.includes(
          "사업을 시작하는 것이 맞는지 중심으로 답한다",
        )
        && !artifacts.prompt.systemPrompt.includes(
          "두 사람의 궁합에 직접 답한다",
        ),
    },

    passed:
      existing.passed
      && artifacts.focus
      === null
      && artifacts.prompt.systemPrompt.includes(
        "evidence에 없는 배역",
      )
      && artifacts.prompt.systemPrompt.includes(
        "세 가지 배역 후보",
      )
      && !artifacts.prompt.systemPrompt.includes(
        "사업을 시작하는 것이 맞는지 중심으로 답한다",
      )
      && !artifacts.prompt.systemPrompt.includes(
        "두 사람의 궁합에 직접 답한다",
      ),
  };
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
        LIFE_FLOW_QUESTION,
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

function verifyLifeFlowInterpretationKept():
  ConsultingPromptBuilderVerificationCase {
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

  const explanationInput:
    DecisionExplanationInput = {
      ...readDecisionResult(
        runDecisionEngine({
          ...input,
          question,
          questionContext,
        }),
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

  const prompt =
    buildConsultingPrompt(
      buildDecisionExplanationPayload(
        plan,
      ),
      undefined,
      questionContext,
    );

  const checks = {
    promptStillIncludesLifeFlowRules:
      prompt.systemPrompt.includes(
        "제공된 Evidence와 계산된 대운·세운·월운·일운 Fact만 설명한다",
      ),

    promptStillForbidsActionFollowUp:
      prompt.systemPrompt.includes(
        "실제로 결정하려는 행동은 무엇인가요?",
      ),

    promptDoesNotApplyDecisionFocusRules:
      !prompt.systemPrompt.includes(
        "사업을 시작하는 것이 맞는지 중심으로 답한다",
      )
      && !prompt.systemPrompt.includes(
        "질문 자체에 직접 답한다",
      ),
  };

  return {
    name:
      "J-existing-life-flow-interpretation-prompt-is-kept",

    question:
      LIFE_FLOW_QUESTION,

    focus:
      plan.explanationFocus
      ?? null,

    checks,

    passed:
      plan.explanationKind
      === "lifeFlowInterpretation"
      && plan.explanationFocus
      === undefined
      && Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyExistingAnswerQualityKept():
  ConsultingPromptBuilderVerificationCase {
  const quality =
    verifyConsultingAnswerQuality();

  return {
    name:
      "K-existing-consulting-answer-quality-is-kept",

    question:
      "여유자금으로 ETF에 투자해도 될까요?",

    focus:
      "generalJudgement",

    checks: {
      existingAnswerQualityVerificationPasses:
        quality.passed,
    },

    passed:
      quality.passed,
  };
}

function verifyIntegrationFinalDecisionOnceIsResolved():
  ConsultingPromptBuilderVerificationCase {
  const integration =
    verifyReaderDecisionExplanationIntegration();

  const promptIncludesFinalDecisionOnce =
    integration.cases.every(
      (verificationCase) =>
        verificationCase.checks
          .promptIncludesFinalDecisionOnce
        === true,
    );

  return {
    name:
      "L-reader-decision-explanation-integration-final-decision-once-is-resolved",

    question:
      "새로운 사업을 지금 시작해도 될까요?",

    focus:
      "businessStart",

    checks: {
      integrationPassed:
        integration.passed,

      promptIncludesFinalDecisionOnce,
    },

    passed:
      integration.passed
      && promptIncludesFinalDecisionOnce,
  };
}

export function verifyConsultingPromptBuilder():
  ConsultingPromptBuilderVerificationResult {
  const cases = [
    verifyCompatibility(),
    verifyContinuation(),
    verifyTermination(),
    verifyBusinessStart(),
    verifyRealEstateBuy(),
    verifyGeneralJudgement(),
    verifyFinalDecisionIsNotDuplicated(),
    verifyEngineDecisionIsLocked(),
    verifyRoleRecommendationKept(),
    verifyLifeFlowInterpretationKept(),
    verifyExistingAnswerQualityKept(),
    verifyIntegrationFinalDecisionOnceIsResolved(),
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
