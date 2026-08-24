import {
    buildConsultingClarification,
    type ConsultingClarificationBuilderInput,
  } from "./consultingClarificationBuilder.js";
  import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder.js";
  import type {
    QuestionReaderResult,
  } from "./question/questionReader.js";
  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest.js";

  export type ConsultingClarificationBuilderVerificationResult = {
    checks: Record<
      string,
      boolean
    >;

    clarification:
      ReturnType<
        typeof buildConsultingClarification
      >;

    passed:
      boolean;
  };

  function createSourceRequest():
    V3ConsultingRequest {
    return {
      sajuInput: {
        name:
          "김천운",

        birthDate:
          "1984-03-15",

        birthTime:
          "14:30",

        gender:
          "male",

        calendarType:
          "solar",

        referenceDate:
          "2026-07-26",

        luckStartMethod:
          "minuteBased",
      },

      humanLifeContextInput: {
        maritalStatus:
          "married",

        hasChildren:
          true,

        occupationStatus:
          "employed",

        hasActiveBusiness:
          false,

        financialResponsibility:
          "high",
      },

      question:
        "대출 부담이 있는데 상가를 매수해도 될까요?",
    };
  }

  export function verifyConsultingClarificationBuilder():
    ConsultingClarificationBuilderVerificationResult {
    const request =
      createSourceRequest();

    const execution =
      buildInitialConsultingExecution(
        request,
      );

    const clarificationInput:
      ConsultingClarificationBuilderInput = {
        decisionTurnId:
          "turn-initial-001",

        lifeContext:
          execution.lifeContext,

        questionContext:
          execution
            .turnResult
            .questionContext,

        decisionResult:
          execution
            .turnResult
            .decisionResult,
      };

    const clarification =
      buildConsultingClarification(
        clarificationInput,
      );

    const nonInsufficientClarification =
      buildConsultingClarification({
        ...clarificationInput,

        decisionResult: {
          ...clarificationInput
            .decisionResult,

          verdict:
            "recommended",
        },
      });

      const compatibilityRequest:
      V3ConsultingRequest = {
        ...request,

        question:
          "1967년 4월 10일 양띠 여성과 궁합은 어떨까요?",
      };

    const compatibilityExecution =
      buildInitialConsultingExecution(
        compatibilityRequest,
      );

    const compatibilityClarification =
      buildConsultingClarification({
        decisionTurnId:
          "turn-compatibility-001",

        lifeContext:
          compatibilityExecution
            .lifeContext,

        questionContext:
          compatibilityExecution
            .turnResult
            .questionContext,

        decisionResult: {
          ...compatibilityExecution
            .turnResult
            .decisionResult,

          verdict:
            "insufficientEvidence",
        },
      });

    const counterpartBirthDataQuestion =
      compatibilityClarification
        ?.items
        .find(
          (item) =>
            item.key
            === "counterpartBirthData",
        )
        ?.question
      ?? "";

    function buildForcedInsufficientClarification(
      question:
        string,
      decisionTurnId:
        string,
      questionInterpretation?:
        QuestionReaderResult,
    ) {
      const forcedRequest:
        V3ConsultingRequest = {
          ...request,

          question,
        };

      const forcedExecution =
        buildInitialConsultingExecution(
          forcedRequest,
          questionInterpretation,
        );

      return {
        execution:
          forcedExecution,

        clarification:
          buildConsultingClarification({
            decisionTurnId,

            lifeContext:
              forcedExecution
                .lifeContext,

            questionContext:
              forcedExecution
                .turnResult
                .questionContext,

            decisionResult: {
              ...forcedExecution
                .turnResult
                .decisionResult,

              verdict:
                "insufficientEvidence",
            },
          }),
      };
    }

    function buildProductionCompatibilityInterpretation(
      originalQuestion:
        string,
    ):
      QuestionReaderResult {
      const ruleBasedExecution =
        buildInitialConsultingExecution({
          ...request,

          question:
            originalQuestion,
        });

      return {
        ...ruleBasedExecution
          .turnResult
          .questionReaderResult,

        decisionTarget:
          "none",

        analysisMode:
          "compatibility",
      };
    }

    const newlyMetCompatibilityQuestion =
      "지금 새로 만난 사람과 궁합이 맞나요?";

    const ourCompatibilityQuestion =
      "우리 둘의 궁합은 어떤가요?";

    const compatibilityRelationshipClarification =
      buildForcedInsufficientClarification(
        newlyMetCompatibilityQuestion,
        "turn-compatibility-relationship-001",
      ).clarification;

    const productionNewlyMetCompatibility =
      buildForcedInsufficientClarification(
        newlyMetCompatibilityQuestion,
        "turn-production-newly-met-compatibility-001",
        buildProductionCompatibilityInterpretation(
          newlyMetCompatibilityQuestion,
        ),
      );

    const productionOurCompatibility =
      buildForcedInsufficientClarification(
        ourCompatibilityQuestion,
        "turn-production-our-compatibility-001",
        buildProductionCompatibilityInterpretation(
          ourCompatibilityQuestion,
        ),
      );

    const boyfriendClarification =
      buildForcedInsufficientClarification(
        "남자친구와 계속 만나야 할까요?",
        "turn-boyfriend-001",
      ).clarification;

    const marriageClarification =
      buildForcedInsufficientClarification(
        "현재 연인과 결혼을 결정해도 될까요?",
        "turn-marriage-001",
      ).clarification;

    const internetAdClarification =
      buildForcedInsufficientClarification(
        "인터넷 광고 사업을 하려고 하는데 어떨까요?",
        "turn-internet-ad-001",
      ).clarification;

    const compatibilityRelationshipExecution =
      buildInitialConsultingExecution({
        ...request,

        question:
          "지금 새로 만난 사람과 궁합이 맞나요?",
      });

    const decisionModeCompatibilityClarification =
      buildConsultingClarification({
        decisionTurnId:
          "turn-compatibility-decision-mode-001",

        lifeContext:
          compatibilityRelationshipExecution
            .lifeContext,

        questionContext: {
          ...compatibilityRelationshipExecution
            .turnResult
            .questionContext,

          question: {
            ...compatibilityRelationshipExecution
              .turnResult
              .questionContext
              .question,

            analysisMode:
              "decision",
          },
        },

        decisionResult: {
          ...compatibilityRelationshipExecution
            .turnResult
            .decisionResult,

          verdict:
            "insufficientEvidence",
        },
      });

    function buildClarificationAllowingEmpty(
      input:
        ConsultingClarificationBuilderInput,
    ) {
      try {
        return buildConsultingClarification(
          input,
        );
      } catch (
        error
      ) {
        if (
          error instanceof Error
          && error.message.includes(
            "no clarification item was built",
          )
        ) {
          return null;
        }

        throw error;
      }
    }

    const clarificationFactsBirthDataClarification =
      buildClarificationAllowingEmpty({
        decisionTurnId:
          "turn-clarification-facts-birth-001",

        lifeContext:
          compatibilityRelationshipExecution
            .lifeContext,

        questionContext: {
          ...compatibilityRelationshipExecution
            .turnResult
            .questionContext,

          question: {
            ...compatibilityRelationshipExecution
              .turnResult
              .questionContext
              .question,

            counterpartFacts: {
              birthDate:
                null,

              birthTime:
                null,

              calendarType:
                null,

              gender:
                null,

              zodiac:
                null,

              relationship:
                null,

              evidence: [],
            },
          },

          clarificationFacts: [
            {
              key:
                "counterpartBirthData",

              description:
                "상대방은 1967년 4월 10일 양력 출생 여성이다.",

              fields: [
                {
                  key:
                    "birthDate",

                  value:
                    "1967-04-10",

                  evidence: [
                    "1967년 4월 10일",
                  ],
                },
                {
                  key:
                    "calendarType",

                  value:
                    "solar",

                  evidence: [
                    "양력",
                  ],
                },
                {
                  key:
                    "gender",

                  value:
                    "female",

                  evidence: [
                    "여성",
                  ],
                },
              ],
            },
          ],
        },

        decisionResult: {
          ...compatibilityRelationshipExecution
            .turnResult
            .decisionResult,

          verdict:
            "insufficientEvidence",
        },
      });

      const missingInformation =
      clarification
        ?.items
        .map(
          (item) =>
            `${item.key}: ${item.description}`,
        )
        .join("\n")
      ?? "";

    const uniqueQuestions =
      new Set(
        clarification
          ?.items
          .map(
            (item) =>
              item.question,
          )
        ?? [],
      );

    const checks = {
      sajuFactsArePreserved:
        execution
          .humanDestinyPipeline
          .sajuFactsPipeline
          .facts
        !== null,

      calculatedSajuIsPreserved:
        execution
          .humanDestinyPipeline
          .sajuFactsPipeline
          .calculatedSaju
          .solarDateIso
        === "1984-03-15",

      readerEvidenceIsPreserved:
        execution
          .humanDestinyPipeline
          .evidenceBundle
          .masterReaderInput
        !== null,

      humanContextIsPreserved:
        execution
          .humanDestinyPipeline
          .humanContext
          .identity
        !== null,

      decisionResultIsPreserved:
        execution
          .turnResult
          .decisionResult
          .humanContextUsed
        === true
        && execution
          .turnResult
          .decisionResult
          .questionContextUsed
        === true,

      verdictRequiresClarification:
        execution
          .turnResult
          .decisionResult
          .verdict
        === "insufficientEvidence",

      clarificationIsNotAutoBuiltForBusinessMoney:
        clarification
        === null,

      debtRepaymentCapacityIsNotAutoRegistered:
        !missingInformation
          .includes(
            "debtRepaymentCapacity",
          ),

      financialExecutionCapacityIsNotAutoRegistered:
        !missingInformation
          .includes(
            "financialExecutionCapacity",
          ),

      decisionDeadlineIsNotAutoRegistered:
        !missingInformation
          .includes(
            "decisionDeadline",
          ),

      clarificationItemsAreAtMostOne:
        (
          clarification
            ?.items
            .length
          ?? 0
        ) <= 1,

          clarificationQuestionsAreUnique:
          clarification
          === null
          || uniqueQuestions.size
          === clarification.items.length,

          compatibilityFactsArePreserved:
          compatibilityExecution
            .turnResult
            .questionReaderResult
            .counterpartFacts
            .birthDate
          === "1967-04-10"
          && compatibilityExecution
            .turnResult
            .questionReaderResult
            .counterpartFacts
            .gender
          === "female"
          && compatibilityExecution
            .turnResult
            .questionReaderResult
            .counterpartFacts
            .zodiac
          === "양띠",

        onlyMissingCalendarTypeIsRequested:
          counterpartBirthDataQuestion
            .includes(
              "양력·음력 여부",
            ),

        providedCounterpartFactsAreNotRequestedAgain:
          !counterpartBirthDataQuestion
            .includes(
              "생년월일",
            )
          && !counterpartBirthDataQuestion
            .includes(
              "성별",
            )
          && !counterpartBirthDataQuestion
            .includes(
              "출생시간",
            ),

      nonInsufficientVerdictAsksNothing:
        nonInsufficientClarification
        === null,

      compatibilityRelationshipFirstItemIsCounterpartBirthData:
        compatibilityRelationshipClarification
          ?.items[0]
          ?.key
        === "counterpartBirthData",

      compatibilityRelationshipDoesNotAskConcreteDecisionTarget:
        compatibilityRelationshipClarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "concreteDecisionTarget",
          )
        === true,

      compatibilityRelationshipDoesNotAskCurrentRelationshipSituation:
        compatibilityRelationshipClarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "currentRelationshipSituation",
          )
        === true,

      compatibilityRelationshipDoesNotAskCounterpartIdentity:
        compatibilityRelationshipClarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "counterpartIdentity",
          )
        === true,

      productionNewlyMetUsesNoneDecisionTarget:
        productionNewlyMetCompatibility
          .execution
          .turnResult
          .questionContext
          .question
          .decisionTarget
        === "none",

      productionNewlyMetUsesCompatibilityAnalysisMode:
        productionNewlyMetCompatibility
          .execution
          .turnResult
          .questionContext
          .question
          .analysisMode
        === "compatibility"
        && productionNewlyMetCompatibility
          .execution
          .turnResult
          .questionContext
          .requirements
          .compatibilityAnalysisRequired
        === true,

      productionNewlyMetFirstItemIsCounterpartBirthData:
        productionNewlyMetCompatibility
          .clarification
          ?.items[0]
          ?.key
        === "counterpartBirthData",

      productionNewlyMetDoesNotAskConcreteDecisionTarget:
        productionNewlyMetCompatibility
          .clarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "concreteDecisionTarget",
          )
        === true,

      productionNewlyMetDoesNotAskDecisionDeadline:
        productionNewlyMetCompatibility
          .clarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "decisionDeadline",
          )
        === true,

      productionOurCompatibilityUsesNoneDecisionTarget:
        productionOurCompatibility
          .execution
          .turnResult
          .questionContext
          .question
          .decisionTarget
        === "none",

      productionOurCompatibilityUsesCompatibilityAnalysisMode:
        productionOurCompatibility
          .execution
          .turnResult
          .questionContext
          .question
          .analysisMode
        === "compatibility",

      productionOurCompatibilityFirstItemIsCounterpartBirthData:
        productionOurCompatibility
          .clarification
          ?.items[0]
          ?.key
        === "counterpartBirthData",

      productionOurCompatibilityDoesNotAskConcreteDecisionTarget:
        productionOurCompatibility
          .clarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "concreteDecisionTarget",
          )
        === true,

      productionOurCompatibilityDoesNotAskDecisionDeadline:
        productionOurCompatibility
          .clarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "decisionDeadline",
          )
        === true,

      compatibilityRelationshipDoesNotAskDecisionDeadline:
        compatibilityRelationshipClarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "decisionDeadline",
          )
        === true,

      decisionModeCompatibilityDoesNotAskDecisionDeadline:
        decisionModeCompatibilityClarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "decisionDeadline",
          )
        === true,

      boyfriendDoesNotAutoAskDecisionDeadline:
        boyfriendClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "decisionDeadline",
          )
        !== true,

      marriageDoesNotAutoAskDecisionDeadline:
        marriageClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "decisionDeadline",
          )
        !== true,

      internetAdDoesNotAutoAskDecisionDeadline:
        internetAdClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "decisionDeadline",
          )
        !== true,

      boyfriendDoesNotAutoAskCounterpartIdentity:
        boyfriendClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "counterpartIdentity",
          )
        !== true,

      boyfriendDoesNotAutoAskCurrentRelationshipSituation:
        boyfriendClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "currentRelationshipSituation",
          )
        !== true,

      marriageDoesNotAutoAskCounterpartIdentity:
        marriageClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "counterpartIdentity",
          )
        !== true,

      marriageDoesNotAutoAskCurrentRelationshipSituation:
        marriageClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "currentRelationshipSituation",
          )
        !== true,

      internetAdDoesNotAutoAskFinancialExecutionCapacity:
        internetAdClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "financialExecutionCapacity",
          )
        !== true,

      decisionModeCompatibilityDoesNotAskCurrentRelationshipSituation:
        decisionModeCompatibilityClarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "currentRelationshipSituation",
          )
        === true,

      decisionModeCompatibilityDoesNotAskCounterpartIdentity:
        decisionModeCompatibilityClarification
          ?.items
          .every(
            (item) =>
              item.key
              !== "counterpartIdentity",
          )
        === true,

      decisionModeCompatibilityStillAsksCounterpartBirthData:
        decisionModeCompatibilityClarification
          ?.items
          .some(
            (item) =>
              item.key
              === "counterpartBirthData",
          )
        === true,

      clarificationFactsBirthDataDoesNotReaskCounterpartBirthData:
        clarificationFactsBirthDataClarification
        === null
        || clarificationFactsBirthDataClarification
          .items
          .every(
            (item) =>
              item.key
              !== "counterpartBirthData",
          )
        === true,
    };

    return {
      checks,

      clarification,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
