import {
    buildConsultingClarification,
    type ConsultingClarificationBuilderInput,
  } from "./consultingClarificationBuilder";
  import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest";

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
          "1967년 4월 10일 양띠 여성과 동업은 어떨까요?",
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

      const missingInformation =
      clarification
        ?.items
        .map(
          (item) =>
            `${item.key}: ${item.description}`,
        )
        .join("\n")
      ?? "";

    const clarificationQuestions =
      clarification
        ?.items
        .map(
          (item) =>
            item.question,
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

      clarificationIsBuilt:
        clarification
        !== null,

      decisionTurnIsPreserved:
        clarification
          ?.decisionTurnId
        === "turn-initial-001",

      debtRepaymentCapacityIsMissing:
        missingInformation
          .includes(
            "debtRepaymentCapacity",
          ),

      debtQuestionIsSpecific:
        clarificationQuestions
          .includes(
            "대출 잔액",
          )
        && clarificationQuestions
          .includes(
            "월 상환액",
          )
        && clarificationQuestions
          .includes(
            "월소득",
          ),

      decisionDeadlineIsMissing:
        missingInformation
          .includes(
            "decisionDeadline",
          ),

      deadlineQuestionIsSpecific:
        clarificationQuestions
          .includes(
            "마감 시점",
          ),

          clarificationQuestionsAreUnique:
          clarification
          !== null
          && uniqueQuestions.size
          === clarification.items.length,

        clarificationQuestionsAreNotEmpty:
          clarification
          !== null
          && clarification.items.length
          > 0,

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
    };

    return {
      checks,

      clarification,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
