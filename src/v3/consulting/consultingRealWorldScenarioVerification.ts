import {
    buildDecisionEngineRegressionInput,
  } from "./decision/regression/decisionEngineRegressionFixture.js";

  import {
    runConsultingTurn,
  } from "./consultingRunner.js";

  export type RealWorldScenarioVerificationCase = {
    id:
      string;

    question:
      string;

    expectedTopic?:
      string;

    expectedIntent?:
      string;

    expectedDecisionTarget?:
      string;
  };

  export type RealWorldScenarioVerificationResult = {
    cases: {
      id:
        string;

      question:
        string;

      topic:
        string;

      intent:
        string;

      decisionTarget:
        string;

      coreDecision:
        string;

      finalDecisionSentence:
        string;

      promptContainsOriginalQuestion:
        boolean;

      promptContainsCoreDecision:
        boolean;

      originalQuestionPreserved:
        boolean;

      passed:
        boolean;
    }[];

    checks: Record<
      string,
      boolean
    >;

    passed:
      boolean;
  };

  /**
   * 실제 사용자가 천운문에 물을 법한 질문을
   * 전체 상담 경로에 통과시킨다.
   *
   * 목적:
   *
   * 1. 원문 질문이 보존되는지
   * 2. 질문마다 topic / intent / decisionTarget이 달라지는지
   * 3. coreDecision이 질문 의미에 맞게 생성되는지
   * 4. Decision → Explanation → Payload → Prompt까지
   *    직접 결론이 손실되지 않는지
   * 5. 서로 다른 질문이 동일한 정형 답변으로
   *    붕괴하지 않는지
   *
   * 이 검증은 특정 답변 문구를 정답으로 강제하지 않는다.
   * 질문 의미와 전달 경로가 보존되는지를 검증한다.
   */
  export function verifyConsultingRealWorldScenarios():
    RealWorldScenarioVerificationResult {
    const regressionInput =
      buildDecisionEngineRegressionInput();

    const scenarios:
      RealWorldScenarioVerificationCase[] = [
        {
          id:
            "business-success",

          question:
            "지금 새 사업을 시작하면 성공할까요?",
        },

        {
          id:
            "money-arrival",

          question:
            "이번 달에 약속한 돈이 들어올까요?",
        },

        {
          id:
            "business-partner",

          question:
            "이 사람과 동업하면 잘될까요?",
        },

        {
          id:
            "real-estate-buy",

          question:
            "지금 부동산을 사는 게 맞을까요?",
        },

        {
          id:
            "job-change",

          question:
            "올해 안에 이직하는 게 좋을까요?",
        },
      ];

    const cases =
      scenarios.map(
        (
          scenario,
        ) => {
          const turnResult =
            runConsultingTurn({
              humanContext:
                regressionInput.humanContext,

              lifeContext:
                regressionInput.lifeContext,

              question:
                scenario.question,
            });

          const {
            questionReaderResult,
            decisionResult,
            prompt,
          } = turnResult;

          const originalQuestionPreserved =
            questionReaderResult
              .originalQuestion
            === scenario.question;

          const promptContainsOriginalQuestion =
            prompt
              .userPrompt
              .includes(
                scenario.question,
              );

          const promptContainsCoreDecision =
            decisionResult
              .coreDecision
              .trim()
              .length > 0
            && prompt
              .userPrompt
              .includes(
                decisionResult
                  .coreDecision,
              );

          const finalDecisionExists =
            decisionResult
              .finalDecisionSentence
              .trim()
              .length > 0;

          return {
            id:
              scenario.id,

            question:
              scenario.question,

            topic:
              questionReaderResult
                .topic,

            intent:
              questionReaderResult
                .intent,

            decisionTarget:
              questionReaderResult
                .decisionTarget,

            coreDecision:
              decisionResult
                .coreDecision,

            finalDecisionSentence:
              decisionResult
                .finalDecisionSentence,

            promptContainsOriginalQuestion,

            promptContainsCoreDecision,

            originalQuestionPreserved,

            passed:
              originalQuestionPreserved
              && promptContainsOriginalQuestion
              && promptContainsCoreDecision
              && finalDecisionExists,
          };
        },
      );

    const uniqueCoreDecisions =
      new Set(
        cases.map(
          (item) =>
            item.coreDecision,
        ),
      );

    const uniqueQuestionSemantics =
      new Set(
        cases.map(
          (item) =>
            [
              item.topic,
              item.intent,
              item.decisionTarget,
            ].join("|"),
        ),
      );

    const checks = {
      allOriginalQuestionsArePreserved:
        cases.every(
          (item) =>
            item.originalQuestionPreserved,
        ),

      allPromptsContainOriginalQuestion:
        cases.every(
          (item) =>
            item.promptContainsOriginalQuestion,
        ),

      allPromptsContainCoreDecision:
        cases.every(
          (item) =>
            item.promptContainsCoreDecision,
        ),

      allCasesProduceFinalDecision:
        cases.every(
          (item) =>
            item.finalDecisionSentence
              .trim()
              .length > 0,
        ),

        realEstateBuyUsesBuyDecisionTarget:
        cases.some(
          (item) =>
            item.id
            === "real-estate-buy"
            && item.topic
              === "realEstate"
            && item.decisionTarget
              === "buy",
        ),

        moneyArrivalDoesNotUseExecutionDirection:
        cases.some(
          (item) =>
            item.id
            === "money-arrival"
            && !item.finalDecisionSentence
              .includes(
                "제한적으로 진행",
              )
            && !item.finalDecisionSentence
              .includes(
                "바로 실행",
              ),
        ),

      questionsProduceDifferentSemantics:
        uniqueQuestionSemantics.size
        > 1,

      questionsDoNotCollapseToSingleCoreDecision:
        uniqueCoreDecisions.size
        > 1,

      everyScenarioPasses:
        cases.every(
          (item) =>
            item.passed,
        ),
    };

    return {
      cases,

      checks,

      passed:
        Object.values(
          checks,
        ).every(
          Boolean,
        ),
    };
  }
