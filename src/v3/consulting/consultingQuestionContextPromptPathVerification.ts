import {
  buildDecisionEngineRegressionInput,
} from "./decision/regression/decisionEngineRegressionFixture.js";

import {
  runConsultingTurn,
  type ConsultingTurnRunResult,
} from "./consultingRunner.js";

import {
  buildInitialConsultingExecution,
} from "./initialConsultingExecutionBuilder.js";

import {
  createSourceRequest,
} from "./initialConsultingSessionBuilderVerification.js";

const ROLE_QUESTION =
  "내가 연극을 하면 어떤 역할이 어울릴까요?";

const LIFE_FLOW_QUESTION =
  "올해 총운을 봐주세요";

const COMPATIBILITY_QUESTION =
  "아내와의 궁합이 어떤가요?";

const REALITY_QUESTION =
  "대출 부담이 있는데 상가를 매수해도 될까요?";

export type ConsultingQuestionContextPromptPathVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

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

function runRegressionTurn(
  question:
    string,
): ConsultingTurnRunResult {
  const regressionInput =
    buildDecisionEngineRegressionInput({
      questionText:
        question,
    });

  return runConsultingTurn({
    humanContext:
      regressionInput.humanContext,

    lifeContext:
      regressionInput.lifeContext,

    question,
  });
}

function promptReflectsGeneratedQuestionContext(
  turnResult:
    ConsultingTurnRunResult,
): Record<
  string,
  boolean
> {
  const questionContext =
    turnResult.questionContext;

  const promptText =
    turnResult.prompt.userPrompt;

  const question =
    questionContext.question;

  const actionObjectDescription =
    questionContext
      .actionObject
      .description
      ?.trim();

  const realityLines =
    questionContext
      .reality
      .constraints
      .map(
        (constraint) =>
          constraint.description.trim(),
      )
      .filter(
        (description) =>
          description.length
          > 0,
      );

  return {
    promptIncludesQuestionContextSection:
      promptText.includes(
        "질문에서 실제로 알고 싶은 내용",
      ),

    promptIncludesAsksWhat:
      question.asksWhat.trim().length
      > 0
      && promptText.includes(
        `알고 싶은 점: ${question.asksWhat}`,
      ),

    promptIncludesAsksWhy:
      promptText.includes(
        `이유의 초점: ${question.asksWhy}`,
      ),

    promptIncludesDecisionQuestion:
      promptText.includes(
        `결정할 질문: ${question.decisionQuestion}`,
      ),

    promptIncludesAnalysisMode:
      promptText.includes(
        "분석의 초점:",
      ),

    promptIncludesActionObject:
      promptText.includes(
        "대상:",
      )
      && (
        !actionObjectDescription
        || promptText.includes(
          actionObjectDescription,
        )
      ),

    promptIncludesCounterpartWhenNeeded:
      !questionContext.counterpart.exists
      || promptText.includes(
        "상대:",
      ),

    promptIncludesRealityWhenNeeded:
      realityLines.length
      === 0
      || (
        promptText.includes(
          "현실에서 확인된 조건",
        )
        && realityLines.every(
          (line) =>
            promptText.includes(
              line,
            ),
        )
      ),
  };
}

function buildGroundingOmissionChecks(
  turnResult:
    ConsultingTurnRunResult,
): Record<
  string,
  boolean
> {
  const groundingContext =
    turnResult.groundingContext;

  const serializedGrounding =
    JSON.stringify(
      groundingContext,
    );

  return {
    groundingHasNoQuestionContextField:
      !(
        "questionContext"
          in groundingContext
      ),

    groundingJsonOmitsQuestionContextKey:
      !serializedGrounding.includes(
        '"questionContext"',
      ),

    groundingJsonOmitsAsksWhatKey:
      !serializedGrounding.includes(
        '"asksWhat"',
      ),

    groundingJsonOmitsAsksWhyKey:
      !serializedGrounding.includes(
        '"asksWhy"',
      ),

    groundingJsonOmitsAnalysisModeKey:
      !serializedGrounding.includes(
        '"analysisMode"',
      ),
  };
}

function engineDecisionContractIsKept(
  turnResult:
    ConsultingTurnRunResult,
): Record<
  string,
  boolean
> {
  const finalDecision =
    turnResult
      .explanationPayload
      .finalDecision;

  return {
    promptIncludesVerdictSection:
      turnResult
        .prompt
        .userPrompt
        .includes(
          "확정된 판단",
        ),

    promptIncludesFinalDecisionOnce:
      countOccurrences(
        turnResult.prompt.userPrompt,
        "엔진이 확정한 최종 결론",
      )
      === 1
      && finalDecision.trim().length
      > 0
      && countOccurrences(
        turnResult.prompt.userPrompt,
        finalDecision,
      )
      === 1,

    systemPromptLocksEngineVerdict:
      turnResult
        .prompt
        .systemPrompt
        .includes(
          "엔진의 verdict를 변경하지 않는다.",
        ),

    systemPromptForbidsNewSajuJudgement:
      turnResult
        .prompt
        .systemPrompt
        .includes(
          "엔진에 없는 사주 판단이나 미래 예측을 새로 만들지 않는다.",
        ),
  };
}

/**
 * runConsultingTurn이 이미 생성한 QuestionContext를
 * Prompt에 전달하고, Grounding에는 넣지 않는지 검증한다.
 *
 * 가장 작은 실행 케이스는 기존 초기 상담 경로의
 * runConsultingTurn이다.
 */
export function verifyConsultingQuestionContextPromptPath():
  ConsultingQuestionContextPromptPathVerificationResult {
  const regressionInput =
    buildDecisionEngineRegressionInput();

  const originalQuestion =
    regressionInput
      .question
      .originalQuestion;

  const businessTurn =
    runConsultingTurn({
      humanContext:
        regressionInput.humanContext,

      lifeContext:
        regressionInput.lifeContext,

      question:
        originalQuestion,
    });

  const compatibilityTurn =
    runRegressionTurn(
      COMPATIBILITY_QUESTION,
    );

  const realityTurn =
    runRegressionTurn(
      REALITY_QUESTION,
    );

  const roleTurn =
    runRegressionTurn(
      ROLE_QUESTION,
    );

  const lifeFlowSourceRequest = {
    ...createSourceRequest(),

    question:
      LIFE_FLOW_QUESTION,
  };

  const lifeFlowTurn =
    buildInitialConsultingExecution(
      lifeFlowSourceRequest,
    ).turnResult;

  const businessPromptReflection =
    promptReflectsGeneratedQuestionContext(
      businessTurn,
    );

  const compatibilityPromptReflection =
    promptReflectsGeneratedQuestionContext(
      compatibilityTurn,
    );

  const realityPromptReflection =
    promptReflectsGeneratedQuestionContext(
      realityTurn,
    );

  const rolePromptReflection =
    promptReflectsGeneratedQuestionContext(
      roleTurn,
    );

  const lifeFlowPromptReflection =
    promptReflectsGeneratedQuestionContext(
      lifeFlowTurn,
    );

  const checks = {
    runConsultingTurnPassesQuestionContextToPrompt:
      businessPromptReflection
        .promptIncludesQuestionContextSection
      && businessPromptReflection
        .promptIncludesAsksWhat,

    promptIncludesQuestionContextSection:
      businessPromptReflection
        .promptIncludesQuestionContextSection,

    promptIncludesActualAsksWhat:
      businessPromptReflection
        .promptIncludesAsksWhat,

    promptIncludesAsksWhyAndDecisionQuestionAndAnalysisMode:
      businessPromptReflection
        .promptIncludesAsksWhy
      && businessPromptReflection
        .promptIncludesDecisionQuestion
      && businessPromptReflection
        .promptIncludesAnalysisMode,

    promptIncludesActionObjectWhenNeeded:
      businessPromptReflection
        .promptIncludesActionObject,

    promptIncludesCounterpartWhenNeeded:
      compatibilityTurn
        .questionContext
        .counterpart
        .exists
      && compatibilityPromptReflection
        .promptIncludesCounterpartWhenNeeded,

    promptIncludesRealityConstraintsWhenNeeded:
      realityTurn
        .questionContext
        .reality
        .constraints
        .length
      > 0
      && realityPromptReflection
        .promptIncludesRealityWhenNeeded,

    groundingOmitsQuestionContext:
      Object.values(
        buildGroundingOmissionChecks(
          businessTurn,
        ),
      ).every(
        Boolean,
      )
      && Object.values(
        buildGroundingOmissionChecks(
          compatibilityTurn,
        ),
      ).every(
        Boolean,
      )
      && Object.values(
        buildGroundingOmissionChecks(
          realityTurn,
        ),
      ).every(
        Boolean,
      )
      && Object.values(
        buildGroundingOmissionChecks(
          roleTurn,
        ),
      ).every(
        Boolean,
      )
      && Object.values(
        buildGroundingOmissionChecks(
          lifeFlowTurn,
        ),
      ).every(
        Boolean,
      ),

    rolePromptKeepsDedicatedRules:
      roleTurn
        .explanationPayload
        .explanationKind
      === "roleRecommendation"
      && rolePromptReflection
        .promptIncludesQuestionContextSection
      && roleTurn
        .prompt
        .systemPrompt
        .includes(
          "evidence에 없는 배역",
        )
      && roleTurn
        .prompt
        .systemPrompt
        .includes(
          "세 가지 배역 후보",
        )
      && !roleTurn
        .prompt
        .systemPrompt
        .includes(
          "사업을 시작하는 것이 맞는지 중심으로 답한다",
        )
      && !roleTurn
        .prompt
        .systemPrompt
        .includes(
          "두 사람의 궁합에 직접 답한다",
        ),

    lifeFlowPromptKeepsDedicatedRules:
      lifeFlowTurn
        .explanationPayload
        .explanationKind
      === "lifeFlowInterpretation"
      && lifeFlowPromptReflection
        .promptIncludesQuestionContextSection
      && lifeFlowTurn
        .prompt
        .systemPrompt
        .includes(
          "제공된 Evidence와 계산된 대운·세운·월운·일운 Fact만 설명한다",
        )
      && lifeFlowTurn
        .prompt
        .systemPrompt
        .includes(
          "실제로 결정하려는 행동은 무엇인가요?",
        )
      && !lifeFlowTurn
        .prompt
        .systemPrompt
        .includes(
          "사업을 시작하는 것이 맞는지 중심으로 답한다",
        )
      && !lifeFlowTurn
        .prompt
        .systemPrompt
        .includes(
          "질문 자체에 직접 답한다",
        ),

    engineVerdictAndFinalDecisionContractIsKept:
      Object.values(
        engineDecisionContractIsKept(
          businessTurn,
        ),
      ).every(
        Boolean,
      )
      && Object.values(
        engineDecisionContractIsKept(
          roleTurn,
        ),
      ).every(
        Boolean,
      )
      && Object.values(
        engineDecisionContractIsKept(
          lifeFlowTurn,
        ),
      ).every(
        Boolean,
      ),
  };

  return {
    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}
