import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder.js";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification.js";

  import {
    runConsultingTurn,
  } from "./consultingRunner.js";

  type QuestionSpecificPromptCase = {
    id:
      string;

    question:
      string;

    expectedTopic:
      ReturnType<
        typeof runConsultingTurn
      >["questionReaderResult"]["topic"];

    expectedDecisionTarget:
      ReturnType<
        typeof runConsultingTurn
      >["questionReaderResult"]["decisionTarget"];

    expectedPromptPhrases:
      readonly string[];
  };

  export type QuestionSpecificPromptDiversityVerificationResult = {
    cases: Array<{
      id:
        string;

      question:
        string;

      actualTopic:
        ReturnType<
          typeof runConsultingTurn
        >["questionReaderResult"]["topic"];

      actualDecisionTarget:
        ReturnType<
          typeof runConsultingTurn
        >["questionReaderResult"]["decisionTarget"];

      checks:
        Readonly<Record<string, boolean>>;

      passed:
        boolean;
    }>;

    checks:
      Readonly<Record<string, boolean>>;

    passed:
      boolean;
  };

  const QUESTION_SPECIFIC_PROMPT_CASES:
    readonly QuestionSpecificPromptCase[] = [
      {
        id:
          "chicken-shop-opening",

        question:
          "통닭집을 개업해도 될까요?",

        expectedTopic:
          "business",

        expectedDecisionTarget:
          "start",

        expectedPromptPhrases: [
          "통닭집을 개업해도 될까요?",
          "상담 영역: 사업과 창업",
          "결정할 대상: 새로 시작할지 결정",
        ],
      },
      {
        id:
          "theater-role-selection",

        question:
          "연극을 한다면 어떤 역할이 좋을까요?",

        expectedTopic:
          "job",

        expectedDecisionTarget:
          "none",

        expectedPromptPhrases: [
          "연극을 한다면 어떤 역할이 좋을까요?",
          "상담 영역: 직업과 활동 방향",
          "결정할 대상: 성격에 맞는 역할·배역 해석",
        ],
      },
      {
        id:
          "youtube-production-partner",

        question:
          "유튜브 영상 제작을 이 사람과 같이 해도 맞을까요?",

        expectedTopic:
          "job",

        expectedDecisionTarget:
          "partner",

        expectedPromptPhrases: [
          "유튜브 영상 제작을 이 사람과 같이 해도 맞을까요?",
          "상담 영역: 직업과 활동 방향",
          "결정할 대상: 함께할 사람이나 동업 관계를 결정",
        ],
      },
    ];

  export function verifyQuestionSpecificPromptDiversity():
    QuestionSpecificPromptDiversityVerificationResult {
        const sourceRequest =
      createSourceRequest();

    const initialExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    const humanDestinyPipeline =
      initialExecution
        .humanDestinyPipeline;

    const caseResults =
      QUESTION_SPECIFIC_PROMPT_CASES.map(
        (verificationCase) => {
          const runResult =
          runConsultingTurn({
            sajuFacts:
              humanDestinyPipeline
                .sajuFactsPipeline,

            readerEvidence:
              humanDestinyPipeline
                .evidenceBundle,

            humanContext:
              humanDestinyPipeline
                .humanContext,

            lifeContext:
              initialExecution
                .lifeContext,

            question:
              verificationCase
                .question,
          });

          const prompt =
            runResult
              .prompt
              .userPrompt;

          const checks = {
            groundingIsSourceLocked:
            runResult
              .groundingContext
              .sourceLocked
            === true,

          groundingPreservesOriginalQuestion:
            runResult
              .groundingContext
              .originalQuestion
            === verificationCase
              .question,

          groundingIncludesCalculatedSajuFacts:
            runResult
              .groundingContext
              .sajuFacts
            !== null,

          groundingIncludesMasterReaderEvidence:
            runResult
              .groundingContext
              .readerEvidence
            !== null,

          groundingUsesCalculatedHumanIdentity:
            runResult
              .groundingContext
              .humanIdentity
            === humanDestinyPipeline
              .humanContext
              .identity,

          groundingUsesCurrentLuckPhase:
            runResult
              .groundingContext
              .currentLuckPhase
            === humanDestinyPipeline
              .humanContext
              .currentPhase,

          groundingUsesCurrentLifeReality:
            runResult
              .groundingContext
              .currentLifeReality
            === initialExecution
              .lifeContext,

          promptIncludesCompleteGroundingContext:
            prompt.includes(
              JSON.stringify(
                runResult
                  .groundingContext,
                null,
                2,
              ),
            ),
            originalQuestionPreservedByReader:
              runResult
                .questionReaderResult
                .originalQuestion
              === verificationCase
                .question,

            originalQuestionPreservedByPlan:
              runResult
                .explanationPlan
                .originalQuestion
              === verificationCase
                .question,

            originalQuestionPreservedByPayload:
              runResult
                .explanationPayload
                .originalQuestion
              === verificationCase
                .question,

            originalQuestionIncludedInPrompt:
              prompt.includes(
                verificationCase
                  .question,
              ),

            topicIsQuestionSpecific:
              runResult
                .questionReaderResult
                .topic
              === verificationCase
                .expectedTopic,

            decisionTargetIsQuestionSpecific:
              runResult
                .questionReaderResult
                .decisionTarget
              === verificationCase
                .expectedDecisionTarget,

            promptIncludesQuestionSpecificPhrases:
              verificationCase
                .expectedPromptPhrases
                .every(
                  (phrase) =>
                    prompt.includes(
                      phrase,
                    ),
                ),

            promptExcludesRawTopic:
              !prompt.includes(
                `topic: ${
                  runResult
                    .questionReaderResult
                    .topic
                }`,
              ),

            promptExcludesRawDecisionTarget:
              !prompt.includes(
                `decisionTarget: ${
                  runResult
                    .questionReaderResult
                    .decisionTarget
                }`,
              ),

            promptExcludesMarkdownHeading:
              !prompt.includes(
                "###",
              ),

            promptExcludesMarkdownBold:
              !prompt.includes(
                "**",
              ),
          };

          return {
            id:
              verificationCase.id,

            question:
              verificationCase
                .question,

            actualTopic:
              runResult
                .questionReaderResult
                .topic,

            actualDecisionTarget:
              runResult
                .questionReaderResult
                .decisionTarget,

            prompt,

            groundingContext:
            runResult
              .groundingContext,

            checks,

            passed:
              Object.values(
                checks,
              )
                .every(Boolean),
          };
        },
      );

    const prompts =
      caseResults.map(
        (result) =>
          result.prompt,
      );

    const checks = {
        allCasesUseSameSajuFacts:
        new Set(
          caseResults.map(
            (result) =>
              JSON.stringify(
                result
                  .groundingContext
                  .sajuFacts,
              ),
          ),
        ).size
        === 1,

      allCasesUseSameReaderEvidence:
        new Set(
          caseResults.map(
            (result) =>
              JSON.stringify(
                result
                  .groundingContext
                  .readerEvidence,
              ),
          ),
        ).size
        === 1,

      allCasesUseSameHumanIdentity:
        caseResults.every(
          (result) =>
            result
              .groundingContext
              .humanIdentity
            === humanDestinyPipeline
              .humanContext
              .identity,
        ),

      allCasesUseSameLifeReality:
        caseResults.every(
          (result) =>
            result
              .groundingContext
              .currentLifeReality
            === initialExecution
              .lifeContext,
        ),
      allQuestionsProduceDifferentPrompts:
        new Set(
          prompts,
        ).size
        === QUESTION_SPECIFIC_PROMPT_CASES
          .length,

      noPromptIsEmpty:
        prompts.every(
          (prompt) =>
            prompt
              .trim()
              .length
            > 0,
        ),

      allTopicsAreSupported:
        caseResults.every(
          (result) =>
            result.actualTopic
            !== "general",
        ),

      allDecisionTargetsAreSupported:
        caseResults.every(
          (result) =>
            result
              .actualDecisionTarget
            !== "none"
            || result
              .id
            === "theater-role-selection",
        ),

      allCasesPassed:
        caseResults.every(
          (result) =>
            result.passed,
        ),
    };

    return {
      cases:
        caseResults.map(
            ({
                prompt:
                  _prompt,

                groundingContext:
                  _groundingContext,

                ...result
              }) =>
                result,
        ),

      checks,

      passed:
        Object.values(
          checks,
        )
          .every(Boolean),
    };
  }
