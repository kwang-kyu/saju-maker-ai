import {
    rebuildPendingConsultingClarification,
    resolveConsultingClarificationProgress,
  } from "./consultingClarificationProgressResolver.js";
  import type {
    ConsultingClarificationRequest,
    ConsultingConfirmedFact,
  } from "./consultingSession.js";

  export type ConsultingClarificationProgressResolverVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  const CLARIFICATION:
    ConsultingClarificationRequest = {
      decisionTurnId:
        "turn-original-decision",

      items: [
        {
          key:
            "counterpartBirthData",

          description:
            "궁합 판단에 필요한 상대방의 출생정보가 확인되지 않았다.",

          question:
            "상대방의 생년월일, 양력·음력 여부와 성별을 알려주세요.",
        },
        {
          key:
            "financialExecutionCapacity",

          description:
            "실행에 사용할 자기자금과 차입 범위가 확인되지 않았다.",

          question:
            "자기자금, 추가 대출 예정액과 비상자금을 알려주세요.",
        },
      ],
    };

  function buildFact(
    input: {
      key:
        string;

      fieldKey:
        string;

      value:
        string;

      evidence:
        string;

      decisionTurnId?:
        string;

      sourceTurnId:
        string;

      confirmedAt:
        string;
    },
  ): ConsultingConfirmedFact {
    return {
      key:
        input.key,

      description:
        `${input.fieldKey} 확인`,

      fields: [
        {
          key:
            input.fieldKey,

          value:
            input.value,

          evidence: [
            input.evidence,
          ],
        },
      ],

      decisionTurnId:
        input.decisionTurnId
        ?? CLARIFICATION
          .decisionTurnId,

      sourceTurnId:
        input.sourceTurnId,

      confirmedAt:
        input.confirmedAt,
    };
  }

  export function verifyConsultingClarificationProgressResolver():
    ConsultingClarificationProgressResolverVerificationResult {
    const partialFacts:
      ConsultingConfirmedFact[] = [
        buildFact({
          key:
            "counterpartBirthData",

          fieldKey:
            "birthDate",

          value:
            "1967-04-10",

          evidence:
            "1967년 4월 10일생",

          sourceTurnId:
            "turn-response-001",

          confirmedAt:
            "2026-08-03T08:00:00.000Z",
        }),
        buildFact({
          key:
            "counterpartBirthData",

          fieldKey:
            "calendarType",

          value:
            "solar",

          evidence:
            "양력입니다",

          sourceTurnId:
            "turn-response-002",

          confirmedAt:
            "2026-08-03T08:01:00.000Z",
        }),
        buildFact({
          key:
            "counterpartBirthData",

          fieldKey:
            "gender",

          value:
            "male",

          evidence:
            "남성입니다",

          sourceTurnId:
            "turn-response-003",

          confirmedAt:
            "2026-08-03T08:02:00.000Z",
        }),
        buildFact({
          key:
            "financialExecutionCapacity",

          fieldKey:
            "selfFunds",

          value:
            "50000000",

          evidence:
            "자기자금은 5천만 원",

          sourceTurnId:
            "turn-response-004",

          confirmedAt:
            "2026-08-03T08:03:00.000Z",
        }),
        buildFact({
          key:
            "financialExecutionCapacity",

          fieldKey:
            "plannedDebt",

          value:
            "0",

          evidence:
            "추가 대출은 없습니다",

          sourceTurnId:
            "turn-response-005",

          confirmedAt:
            "2026-08-03T08:04:00.000Z",
        }),
        buildFact({
          key:
            "financialExecutionCapacity",

          fieldKey:
            "selfFunds",

          value:
            "90000000",

          evidence:
            "다른 상담의 자기자금은 9천만 원",

          decisionTurnId:
            "turn-unrelated-decision",

          sourceTurnId:
            "turn-unrelated-response",

          confirmedAt:
            "2026-08-03T08:05:00.000Z",
        }),
      ];

    const finalRequiredFact =
      buildFact({
        key:
          "financialExecutionCapacity",

        fieldKey:
          "reserveFunds",

        value:
          "10000000",

        evidence:
          "비상자금은 1천만 원을 남깁니다",

        sourceTurnId:
          "turn-response-006",

        confirmedAt:
          "2026-08-03T08:06:00.000Z",
      });

    const completedFacts:
      ConsultingConfirmedFact[] = [
        ...partialFacts,
        finalRequiredFact,
      ];

    const partialProgress =
      resolveConsultingClarificationProgress({
        clarification:
          CLARIFICATION,

        confirmedFacts:
          partialFacts,
      });

    const counterpartProgress =
      partialProgress
        .items
        .find(
          (item) =>
            item.item.key
            === "counterpartBirthData",
        );

    const financialProgress =
      partialProgress
        .items
        .find(
          (item) =>
            item.item.key
            === "financialExecutionCapacity",
        );

    const completedProgress =
      resolveConsultingClarificationProgress({
        clarification:
          CLARIFICATION,

        confirmedFacts:
          completedFacts,
      });

    const completedFinancialProgress =
      completedProgress
        .items
        .find(
          (item) =>
            item.item.key
            === "financialExecutionCapacity",
        );

    const pendingClarification =
      rebuildPendingConsultingClarification({
        clarification:
          CLARIFICATION,

        confirmedFacts:
          partialFacts,
      });

    const completedPendingClarification =
      rebuildPendingConsultingClarification({
        clarification:
          CLARIFICATION,

        confirmedFacts:
          completedFacts,
      });

    const pendingFinancialItem =
      pendingClarification
        ?.items[0];

    const pendingQuestion =
      pendingFinancialItem
        ?.question
      ?? "";

      const fullBirthDataPath =
  counterpartProgress
    ?.completionPaths
    .find(
      (path) =>
        path.key
        === "fullBirthData",
    );

const zodiacOnlyPathFromFullBirthData =
  counterpartProgress
    ?.completionPaths
    .find(
      (path) =>
        path.key
        === "zodiacOnly",
    );

const zodiacOnlyFact =
  buildFact({
    key:
      "counterpartBirthData",

    fieldKey:
      "zodiacSign",

    value:
      "horse",

    evidence:
      "말띠입니다",

    sourceTurnId:
      "turn-zodiac-response",

    confirmedAt:
      "2026-08-03T08:07:00.000Z",
  });

const zodiacOnlyProgress =
  resolveConsultingClarificationProgress({
    clarification:
      CLARIFICATION,

    confirmedFacts: [
      zodiacOnlyFact,
    ],
  });

const zodiacCounterpartProgress =
  zodiacOnlyProgress
    .items
    .find(
      (item) =>
        item.item.key
        === "counterpartBirthData",
    );

const zodiacOnlyCompletionPath =
  zodiacCounterpartProgress
    ?.completionPaths
    .find(
      (path) =>
        path.key
        === "zodiacOnly",
    );

const fullBirthDataPathFromZodiac =
  zodiacCounterpartProgress
    ?.completionPaths
    .find(
      (path) =>
        path.key
        === "fullBirthData",
    );

const zodiacPendingClarification =
  rebuildPendingConsultingClarification({
    clarification:
      CLARIFICATION,

    confirmedFacts: [
      zodiacOnlyFact,
    ],
  });

const emptyPendingClarification =
  rebuildPendingConsultingClarification({
    clarification:
      CLARIFICATION,

    confirmedFacts:
      [],
  });

const emptyCounterpartQuestion =
  emptyPendingClarification
    ?.items
    .find(
      (item) =>
        item.key
        === "counterpartBirthData",
    )
    ?.question
  ?? "";

    const leftoverCompatibilityClarification:
      ConsultingClarificationRequest = {
        decisionTurnId:
          "turn-compatibility-relationship",

        items: [
          {
            key:
              "counterpartBirthData",

            description:
              "궁합 판단에 필요한 상대방의 출생정보가 확인되지 않았다.",

            question:
              "상대방의 생년월일, 양력·음력 여부와 성별을 알려주세요.",
          },
          {
            key:
              "counterpartIdentity",

            description:
              "관계 판단의 상대방과 현재 관계 상태가 확인되지 않았다.",

            question:
              "상대방과의 관계, 현재 관계 상태, 지금 가장 고민되는 갈등은 무엇인가요?",
          },
          {
            key:
              "currentRelationshipSituation",

            description:
              "현재 관계에서 실제로 발생한 사건과 상대방의 입장이 충분히 확인되지 않았다.",

            question:
              "최근 관계가 달라진 구체적인 사건, 상대방의 현재 입장, 본인이 원하는 결과를 알려주세요.",
          },
          {
            key:
              "decisionDeadline",

            description:
              "결정을 내려야 하는 현실적인 기한이 확인되지 않았다.",

            question:
              "이 결정을 내려야 하는 실제 마감 시점이나 예정일이 있나요?",
          },
        ],
      };

    const leftoverFullBirthFacts:
      ConsultingConfirmedFact[] = [
        buildFact({
          key:
            "counterpartBirthData",

          fieldKey:
            "birthDate",

          value:
            "1990-05-12",

          evidence:
            "1990년 5월 12일생",

          decisionTurnId:
            leftoverCompatibilityClarification
              .decisionTurnId,

          sourceTurnId:
            "turn-compat-full-birth-date",

          confirmedAt:
            "2026-08-23T12:00:00.000Z",
        }),
        buildFact({
          key:
            "counterpartBirthData",

          fieldKey:
            "calendarType",

          value:
            "solar",

          evidence:
            "양력입니다",

          decisionTurnId:
            leftoverCompatibilityClarification
              .decisionTurnId,

          sourceTurnId:
            "turn-compat-full-calendar",

          confirmedAt:
            "2026-08-23T12:01:00.000Z",
        }),
        buildFact({
          key:
            "counterpartBirthData",

          fieldKey:
            "gender",

          value:
            "female",

          evidence:
            "여성입니다",

          decisionTurnId:
            leftoverCompatibilityClarification
              .decisionTurnId,

          sourceTurnId:
            "turn-compat-full-gender",

          confirmedAt:
            "2026-08-23T12:02:00.000Z",
        }),
      ];

    const leftoverPartialBirthFacts:
      ConsultingConfirmedFact[] = [
        leftoverFullBirthFacts[0]!,
      ];

    const leftoverZodiacFact =
      buildFact({
        key:
          "counterpartBirthData",

        fieldKey:
          "zodiacSign",

        value:
          "horse",

        evidence:
          "말띠입니다",

        decisionTurnId:
          leftoverCompatibilityClarification
            .decisionTurnId,

        sourceTurnId:
          "turn-compat-zodiac",

        confirmedAt:
          "2026-08-23T12:03:00.000Z",
      });

    const leftoverCompatibilityFullBirthPending =
      rebuildPendingConsultingClarification({
        clarification:
          leftoverCompatibilityClarification,

        confirmedFacts:
          leftoverFullBirthFacts,

        compatibilityAnalysisRequired:
          true,

        analysisMode:
          "compatibility",
      });

    const leftoverCompatibilityPartialPending =
      rebuildPendingConsultingClarification({
        clarification:
          leftoverCompatibilityClarification,

        confirmedFacts:
          leftoverPartialBirthFacts,

        compatibilityAnalysisRequired:
          true,

        analysisMode:
          "compatibility",
      });

    const leftoverCompatibilityZodiacPending =
      rebuildPendingConsultingClarification({
        clarification:
          leftoverCompatibilityClarification,

        confirmedFacts: [
          leftoverZodiacFact,
        ],

        compatibilityAnalysisRequired:
          true,

        analysisMode:
          "compatibility",
      });

    const leftoverGeneralRelationshipPending =
      rebuildPendingConsultingClarification({
        clarification:
          leftoverCompatibilityClarification,

        confirmedFacts:
          leftoverFullBirthFacts,
      });

    const leftoverMarriageDecisionPending =
      rebuildPendingConsultingClarification({
        clarification:
          leftoverCompatibilityClarification,

        confirmedFacts:
          leftoverFullBirthFacts,

        compatibilityAnalysisRequired:
          true,

        analysisMode:
          "decision",
      });

    const leftoverDecisionModeCompatibilityMatchingPending =
      rebuildPendingConsultingClarification({
        clarification:
          leftoverCompatibilityClarification,

        confirmedFacts:
          leftoverFullBirthFacts,

        compatibilityAnalysisRequired:
          true,

        analysisMode:
          "decision",

        compatibilityMatchingQuestion:
          true,
      });

    const unavailableFinancialProgress =
      resolveConsultingClarificationProgress({
        clarification:
          CLARIFICATION,

        confirmedFacts:
          [],

        itemStates: [
          {
            key:
              "financialExecutionCapacity",

            status:
              "unavailable",
          },
        ],
      });

    const unavailableFinancialPending =
      rebuildPendingConsultingClarification({
        clarification:
          CLARIFICATION,

        confirmedFacts:
          [],

        itemStates: [
          {
            key:
              "financialExecutionCapacity",

            status:
              "unavailable",
          },
        ],
      });

    const redirectedFinancialPending =
      rebuildPendingConsultingClarification({
        clarification:
          CLARIFICATION,

        confirmedFacts:
          [],

        itemStates: [
          {
            key:
              "financialExecutionCapacity",

            status:
              "redirected",
          },
        ],
      });

    const allUnavailablePending =
      rebuildPendingConsultingClarification({
        clarification:
          CLARIFICATION,

        confirmedFacts:
          [],

        itemStates: [
          {
            key:
              "counterpartBirthData",

            status:
              "unavailable",
          },
          {
            key:
              "financialExecutionCapacity",

            status:
              "redirected",
          },
        ],
      });

    const actualAmountDoesNotSettlePending =
      rebuildPendingConsultingClarification({
        clarification:
          CLARIFICATION,

        confirmedFacts:
          [],

        itemStates:
          [],
      });

      const checks = {
      factsAreGroupedByOriginalDecision:
        financialProgress
          ?.confirmedFields
          .find(
            (field) =>
              field.key
              === "selfFunds",
          )
          ?.value
        === "50000000",

      fieldsAreAccumulatedAcrossTurns:
        counterpartProgress
          ?.confirmedFields
          .length
        === 3
        && financialProgress
          ?.confirmedFields
          .length
        === 2,

      optionalBirthTimeDoesNotBlockCompletion:
        counterpartProgress
          ?.completed
        === true
        && counterpartProgress
          .missingRequiredFieldKeys
          .length
        === 0,

      partialItemRemainsIncomplete:
        financialProgress
          ?.completed
        === false,

      onlyMissingRequiredFieldIsReported:
        financialProgress
          ?.missingRequiredFieldKeys
          .length
        === 1
        && financialProgress
          .missingRequiredFieldKeys[0]
        === "reserveFunds",

      completedAndIncompleteItemsAreSeparated:
        partialProgress
          .completedItemKeys
          .includes(
            "counterpartBirthData",
          )
        && partialProgress
          .incompleteItemKeys
          .length
        === 1
        && partialProgress
          .incompleteItemKeys[0]
        === "financialExecutionCapacity",

      partialProgressIsNotComplete:
        !partialProgress.completed,

      finalRequiredFieldCompletesItem:
        completedFinancialProgress
          ?.completed
        === true,

      allItemsCompleteProgress:
        completedProgress.completed
        && completedProgress
          .incompleteItemKeys
          .length
        === 0,

      completedItemIsRemovedFromPending:
        pendingClarification
          ?.items
          .length
        === 1
        && pendingFinancialItem
          ?.key
        === "financialExecutionCapacity",

      pendingKeepsOriginalDecisionTurn:
        pendingClarification
          ?.decisionTurnId
        === CLARIFICATION
          .decisionTurnId,

      pendingKeepsIncompleteItemDescription:
        pendingFinancialItem
          ?.description
        === CLARIFICATION
          .items[1]
          .description,

      pendingQuestionIncludesOnlyMissingField:
        pendingQuestion
          .includes(
            "반드시 남겨둘 비상자금",
          )
        && !pendingQuestion
          .includes(
            "투입할 자기자금",
          )
        && !pendingQuestion
          .includes(
            "추가 대출 예정액",
          ),

      pendingQuestionDoesNotRepeatCompletedItem:
        !pendingQuestion
          .includes(
            "상대방 생년월일",
          )
        && !pendingQuestion
          .includes(
            "양력 또는 음력",
          )
        && !pendingQuestion
          .includes(
            "상대방 성별",
          ),

          allRequiredFieldsCompleteClearsPending:
          completedPendingClarification
          === null,

        fullBirthDataCompletesFormalPath:
          fullBirthDataPath
            ?.completed
          === true,

        fullBirthDataDoesNotRequireZodiac:
          zodiacOnlyPathFromFullBirthData
            ?.completed
          === false
          && zodiacOnlyPathFromFullBirthData
            .missingFieldKeys
            .includes(
              "zodiacSign",
            ),

        zodiacOnlyCompletesCounterpartItem:
          zodiacCounterpartProgress
            ?.completed
          === true
          && zodiacOnlyCompletionPath
            ?.completed
          === true,

        zodiacOnlyDoesNotPretendFormalBirthDataExists:
          fullBirthDataPathFromZodiac
            ?.completed
          === false,

        zodiacCompletionRemovesCounterpartFromPending:
          zodiacPendingClarification
            ?.items
            .every(
              (item) =>
                item.key
                !== "counterpartBirthData",
            )
          ?? true,

        emptyCounterpartQuestionOffersBothPaths:
          emptyCounterpartQuestion
            .includes(
              "생년월일 기준 정식 궁합",
            )
          && emptyCounterpartQuestion
            .includes(
              "상대방 생년월일",
            )
          && emptyCounterpartQuestion
            .includes(
              "양력 또는 음력",
            )
          && emptyCounterpartQuestion
            .includes(
              "상대방 성별",
            )
          && emptyCounterpartQuestion
            .includes(
              "띠 기준 간이 궁합",
            )
          && emptyCounterpartQuestion
            .includes(
              "상대방의 띠",
            ),

        optionalBirthTimeIsNotAskedAsRequired:
          !emptyCounterpartQuestion
            .includes(
              "상대방 출생시간",
            ),

        leftoverCompatibilityRelationshipItemsAreNotRevived:
          leftoverCompatibilityFullBirthPending
          === null,

        leftoverCompatibilityDoesNotAskDecisionDeadline:
          leftoverCompatibilityFullBirthPending
          === null
          && leftoverCompatibilityZodiacPending
          === null
          && leftoverDecisionModeCompatibilityMatchingPending
          === null,

        leftoverCompatibilityPartialBirthAsksOnlyBirthFields:
          leftoverCompatibilityPartialPending
            ?.items
            .length
          === 1
          && leftoverCompatibilityPartialPending
            .items[0]
            .key
          === "counterpartBirthData"
          && leftoverCompatibilityPartialPending
            .items
            .every(
              (item) =>
                item.key
                !== "currentRelationshipSituation"
                && item.key
                !== "counterpartIdentity",
            )
          === true,

        leftoverCompatibilityZodiacOnlyClearsRelationshipPending:
          leftoverCompatibilityZodiacPending
          === null,

        leftoverGeneralRelationshipItemsStayWithoutCompatibilityGuard:
          leftoverGeneralRelationshipPending
            ?.items
            .some(
              (item) =>
                item.key
                === "currentRelationshipSituation",
            )
          === true
          && leftoverGeneralRelationshipPending
            .items
            .some(
              (item) =>
                item.key
                === "counterpartIdentity",
            )
          === true,

        leftoverMarriageDecisionKeepsRelationshipItems:
          leftoverMarriageDecisionPending
            ?.items
            .some(
              (item) =>
                item.key
                === "currentRelationshipSituation",
            )
          === true
          && leftoverMarriageDecisionPending
            .items
            .some(
              (item) =>
                item.key
                === "counterpartIdentity",
            )
          === true,

        leftoverMarriageDecisionKeepsDecisionDeadline:
          leftoverMarriageDecisionPending
            ?.items
            .some(
              (item) =>
                item.key
                === "decisionDeadline",
            )
          === true,

        leftoverGeneralRelationshipKeepsDecisionDeadline:
          leftoverGeneralRelationshipPending
            ?.items
            .some(
              (item) =>
                item.key
                === "decisionDeadline",
            )
          === true,

        leftoverDecisionModeCompatibilityMatchingClearsRelationshipPending:
          leftoverDecisionModeCompatibilityMatchingPending
          === null,

        unavailableFinancialItemIsNotIncomplete:
          unavailableFinancialProgress
            .incompleteItemKeys
            .includes(
              "financialExecutionCapacity",
            )
          === false
          && unavailableFinancialProgress
            .items
            .find(
              (item) =>
                item.item.key
                === "financialExecutionCapacity",
            )
            ?.completed
          === true,

        unavailableFinancialItemIsNotReasked:
          unavailableFinancialPending
            ?.items
            .every(
              (item) =>
                item.key
                !== "financialExecutionCapacity",
            )
          === true,

        unavailableFinancialMovesToNextPendingItem:
          unavailableFinancialPending
            ?.items
            .length
          === 1
          && unavailableFinancialPending
            .items[0]
            .key
          === "counterpartBirthData",

        redirectedFinancialItemIsNotReasked:
          redirectedFinancialPending
            ?.items
            .every(
              (item) =>
                item.key
                !== "financialExecutionCapacity",
            )
          === true,

        allUnavailableOrRedirectedClearsPending:
          allUnavailablePending
          === null,

        emptyItemStatesKeepExistingReaskPath:
          actualAmountDoesNotSettlePending
            ?.items
            .some(
              (item) =>
                item.key
                === "financialExecutionCapacity",
            )
          === true,
        };

    return {
      checks,

      passed:
        Object
          .values(
            checks,
          )
          .every(
            Boolean,
          ),
    };
  }
