import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture";
import {
  runDecisionEngine,
} from "../decision/decisionEngine";
import {
  assessRoleRecommendation,
} from "../decision/roleRecommendationAssessment";
import {
  buildQuestionContext,
} from "../question/questionContextBuilder";
import {
  readQuestion,
} from "../question/questionReader";
import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext";
import {
  readDecisionResult,
} from "./decisionResultReader";
import {
  buildDecisionExplanationPlan,
} from "./decisionExplanationPlan";
import type {
  DecisionExplanationPlan,
} from "./decisionExplanationPlan";
import {
  buildDecisionExplanationPayload,
} from "./decisionExplanationPayload";
import {
  buildConsultingPrompt,
} from "./consultingPromptBuilder";

const ROLE_QUESTION =
  "내가 연극을 하면 어떤 역할이 어울릴까요?";

const FORBIDDEN_PHRASES =
  [
    "당장 정하지 말고",
    "준비한 뒤",
    "조건을 갖춘 뒤",
    "보류",
  ];

const FORBIDDEN_ROLE_EXPLANATION_BLOCK_TITLES =
  [
    "진행 전에 갖춰야 할 조건",
    "이번 선택에서 주의할 위험",
  ];

function cloneHumanContextWithProfile(
  base:
    HumanDestinyContext,
  profilePatch:
    Partial<
      HumanDestinyContext["identity"]["profile"]
    >,
  humanSummaryPatch?:
    Partial<
      HumanDestinyContext["identity"]["humanSummary"]
    >,
): HumanDestinyContext {
  return {
    ...base,

    identity: {
      ...base.identity,

      profile: {
        ...base.identity.profile,
        ...profilePatch,
      },

      humanSummary: {
        ...base.identity.humanSummary,
        ...humanSummaryPatch,
      },
    },
  };
}

function buildRoleRecommendationExplanationArtifacts(
  humanContext:
    HumanDestinyContext,
  questionText:
    string = ROLE_QUESTION,
): {
  plan:
    DecisionExplanationPlan;

  payload:
    ReturnType<
      typeof buildDecisionExplanationPayload
    >;

  prompt:
    ReturnType<
      typeof buildConsultingPrompt
    >;
} {
  const regressionInput =
    buildDecisionEngineRegressionInput({
      questionText,
    });

  const question =
    readQuestion(
      humanContext,
      questionText,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const decisionResult =
    runDecisionEngine({
      ...regressionInput,
      humanContext,
      question,
      questionContext,
    });

  const explanation =
    readDecisionResult(
      decisionResult,
    );

  const plan =
    buildDecisionExplanationPlan(
      explanation,
      question
        .originalQuestion,
    );

  const payload =
    buildDecisionExplanationPayload(
      plan,
    );

  const prompt =
    buildConsultingPrompt(
      payload,
    );

  return {
    plan,
    payload,
    prompt,
  };
}

function hasProhibitedDirectionBlock(
  plan:
    DecisionExplanationPlan,
): boolean {
  return plan
    .blocks
    .some(
      (block) =>
        block.step
        === "prohibitedDirection",
    );
}

function hasEmptyRequiredBlock(
  plan:
    DecisionExplanationPlan,
): boolean {
  return plan
    .blocks
    .some(
      (block) =>
        block.required
        && block
          .content
          .trim()
          .length
        === 0,
    );
}

export type RoleRecommendationExplanationVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export function verifyRoleRecommendationExplanation():
  RoleRecommendationExplanationVerificationResult {
  const regressionInput =
    buildDecisionEngineRegressionInput({
      questionText:
        ROLE_QUESTION,
    });

  const {
    plan,
    payload,
    prompt,
  } = buildRoleRecommendationExplanationArtifacts(
    regressionInput
      .humanContext,
  );

  const userFacingPromptText =
    [
      prompt.userPrompt,
      ...payload
        .explanationOrder
        .map(
          (section) =>
            section.content,
        ),
      payload
        .finalDecision,
    ].join("\n");

  const includesThreeCandidateSections =
    payload
      .explanationOrder
      .some(
        (section) =>
          section.title
          === "가장 어울리는 대표 배역",
      )
    && payload
      .explanationOrder
      .some(
        (section) =>
          section.title
          === "추가 배역 1",
      )
    && payload
      .explanationOrder
      .some(
        (section) =>
          section.title
          === "추가 배역 2",
      );

  const emptyAvoidedPatternsContext =
    cloneHumanContextWithProfile(
      regressionInput
        .humanContext,
      {
        lifeDriver: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .lifeDriver,

          conflicting:
            [],
        },

        survivalStyle: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .survivalStyle,

          conflicting:
            [],
        },

        repeatedPattern: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .repeatedPattern,

          conflicting:
            [],
        },
      },
      {
        cautions:
          [],
      },
    );

  const emptyAvoidedPatternsAssessment =
    assessRoleRecommendation(
      emptyAvoidedPatternsContext,
    );

  const emptyAvoidedPatternsArtifacts =
    buildRoleRecommendationExplanationArtifacts(
      emptyAvoidedPatternsContext,
    );

  const explicitCaution =
    "과도한 자기 확신";

  const explicitCautionContext: HumanDestinyContext =
    {
      ...regressionInput
        .humanContext,

      identity: {
        ...regressionInput
          .humanContext
          .identity,

        humanSummary: {
          ...regressionInput
            .humanContext
            .identity
            .humanSummary,

          cautions:
            [
              explicitCaution,
            ],
        },
      },
    };

  const explicitCautionAssessment =
    assessRoleRecommendation(
      explicitCautionContext,
    );

  const explicitCautionArtifacts =
    buildRoleRecommendationExplanationArtifacts(
      explicitCautionContext,
    );

  const conflictingDriverContext =
    cloneHumanContextWithProfile(
      regressionInput
        .humanContext,
      {
        lifeDriver: {
          ...regressionInput
            .humanContext
            .identity
            .profile
            .lifeDriver,

          conflicting:
            [
              {
                ...regressionInput
                  .humanContext
                  .identity
                  .profile
                  .lifeDriver
                  .primary,

                driver:
                  "freedom",

                interpretation:
                  {
                    mode:
                      "자유 추구형",

                    operatingStyle:
                      "규칙보다 자율을 우선한다.",

                    strengthExpression:
                      "압박이 커질수록 독립 선택이 강해진다.",

                    riskPattern:
                      "책임 구조와 충돌할 수 있다.",

                    suitableConditions:
                      [],
                  },
              },
            ],
        },
      },
    );

  const conflictingAssessment =
    assessRoleRecommendation(
      conflictingDriverContext,
    );

  const conflictingArtifacts =
    buildRoleRecommendationExplanationArtifacts(
      conflictingDriverContext,
    );

  const checks = {
    explanationKindIsRoleRecommendation:
      payload
        .explanationKind
      === "roleRecommendation",

    promptIncludesRoleRecommendationRules:
      prompt
        .systemPrompt
        .includes(
          "evidence에 없는 배역",
        ),

    promptIncludesThreeCandidateGuidance:
      prompt
        .systemPrompt
        .includes(
          "세 가지 배역 후보",
        ),

    payloadIncludesPrimaryRoleSection:
      includesThreeCandidateSections,

    payloadIncludesPerformanceSection:
      payload
        .explanationOrder
        .some(
          (section) =>
            section.title
            === "대사·표정·움직임·장면에서의 표현 방식",
        ),

    combinedPromptHasNoForbiddenDeferralPhrases:
      FORBIDDEN_PHRASES.every(
        (phrase) =>
          !userFacingPromptText
            .includes(
              phrase,
            ),
      ),

    userPromptUsesRoleInterpretationLabel:
      prompt
        .userPrompt
        .includes(
          "성격에 맞는 역할·배역 해석",
        ),

    emptyAvoidedPatternsHaveNoProhibitedDirectionBlock:
      emptyAvoidedPatternsAssessment
        .avoidedRolePatterns
        .length
      === 0
      && !hasProhibitedDirectionBlock(
        emptyAvoidedPatternsArtifacts
          .plan,
      ),

    noEmptyRequiredExplanationBlocks:
      !hasEmptyRequiredBlock(
        plan,
      )
      && !hasEmptyRequiredBlock(
        emptyAvoidedPatternsArtifacts
          .plan,
      ),

    promptDoesNotRequireUnsuitableRoleGeneration:
      !prompt
        .systemPrompt
        .includes(
          "잘 맞지 않을 역할 유형도",
        )
      && prompt
        .systemPrompt
        .includes(
          "잘 살리지 못할 가능성이 있는 역할 유형",
        ),

    promptForbidsGuessingWithoutAvoidanceEvidence:
      prompt
        .systemPrompt
        .includes(
          "회피 배역 근거가 제공되지 않으면",
        )
      && prompt
        .systemPrompt
        .includes(
          "부적합 배역을 새로 만들거나 추측하지 않는다",
        ),

    explicitCautionHasProhibitedDirectionBlock:
      explicitCautionAssessment
        .avoidedRolePatterns
        .length
      > 0
      && hasProhibitedDirectionBlock(
        explicitCautionArtifacts
          .plan,
      ),

    conflictingSignalsHaveProhibitedDirectionBlock:
      conflictingAssessment
        .avoidedRolePatterns
        .length
      > 0
      && hasProhibitedDirectionBlock(
        conflictingArtifacts
          .plan,
      ),

    roleRecommendationExplanationHasNoConditionOrRiskBlocks:
      !plan
        .blocks
        .some(
          (block) =>
            block.step
            === "conditions"
            || block.step
            === "risks",
        )
      && FORBIDDEN_ROLE_EXPLANATION_BLOCK_TITLES
        .every(
          (title) =>
            !payload
              .explanationOrder
              .some(
                (section) =>
                  section.title
                  === title,
              ),
        ),
  };

  return {
    checks,

    passed:
      Object
        .values(
          checks,
        )
        .every(Boolean),
  };
}
