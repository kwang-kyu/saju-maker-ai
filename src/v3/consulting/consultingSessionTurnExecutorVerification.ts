import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import {
    buildInitialConsultingSession,
  } from "./initialConsultingSessionBuilder";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification";
  import {
    rebuildPendingConsultingClarification,
  } from "./consultingClarificationProgressResolver";
  import {
    executeConsultingSessionTurn,
  } from "./consultingSessionTurnExecutor";
  import {
    prepareConsultingSessionTurn,
  } from "./consultingSessionTurnBuilder";
  import type {
    ConsultingClarificationFact,
  } from "./consultingInput";
  import {
    buildConsultingSessionOpenAIRequest,
  } from "./consultingSessionOpenAIRequestBuilder";
  import type {
    ConsultingClarificationRequest,
    ConsultingConfirmedFact,
    ConsultingSession,
  } from "./consultingSession";
  import {
    assessCompatibility,
  } from "./decision/compatibilityAssessment";
  import {
    buildCounterpartSajuCalculation,
  } from "./decision/counterpartSajuCalculationBuilder";
  import type {
    ConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter";

  export type ConsultingSessionTurnExecutorVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;

    completedClarification: {
      verdict:
        string;

      status:
        string;

      pendingClarificationIsNull:
        boolean;

      requestAnswerCallCount:
        number;

      assistantAnswerIsStored:
        boolean;

      contextAlignment:
        string;

      actionReadiness:
        string;

      compatibilityEvidenceLevel:
        string;

      compatibilityAnalysisScope:
        string;

      additionalCounterpartDataRequired:
        boolean;

      fullCompatibilityAvailable:
        boolean | null;

      fullCompatibilityOverallLevel:
        string | null;

      fullCompatibilitySupportScore:
        number | null;

      fullCompatibilityCautionScore:
        number | null;
    };
  };

  async function actionRejects(
    action:
      () => Promise<unknown>,
  ): Promise<boolean> {
    try {
      await action();

      return false;
    } catch {
      return true;
    }
  }

  function snapshotConsultingSession(
    session:
      ConsultingSession,
  ): string {
    return JSON.stringify({
      status:
        session.status,

      updatedAt:
        session.updatedAt,

      turnIds:
        session.turns.map(
          (turn) =>
            turn.id,
        ),

      confirmedFacts:
        session.confirmedFacts,

      pendingClarification:
        session.pendingClarification,
    });
  }

  function toClarificationFacts(
    facts:
      readonly ConsultingConfirmedFact[],
    decisionTurnId:
      string,
  ): ConsultingClarificationFact[] {
    return facts
      .filter(
        (fact) =>
          fact.decisionTurnId
          === decisionTurnId,
      )
      .map(
        (fact) => ({
          key:
            fact.key,

          description:
            fact.description,

          fields:
            fact.fields.map(
              (field) => ({
                key:
                  field.key,

                value:
                  field.value,

                evidence: [
                  ...field.evidence,
                ],
              }),
            ),
        }),
      );
  }

  function getClarificationFieldValue(
    facts:
      readonly ConsultingClarificationFact[],
    itemKey:
      string,
    fieldKey:
      string,
  ): string | undefined {
    for (
      const fact
      of facts
    ) {
      if (
        fact.key
        !== itemKey
      ) {
        continue;
      }

      const field =
        fact
          .fields
          .find(
            (candidate) =>
              candidate.key
              === fieldKey
              && candidate
                .value
                .trim()
                .length
              > 0,
          );

      if (
        field
      ) {
        return field.value;
      }
    }

    return undefined;
  }

  function evaluatePartialClarificationSkipsOpenAI(
    requestAnswerCount:
      number,
  ): boolean {
    return requestAnswerCount
      === 0;
  }

  function evaluateCompletedClarificationAnswerRequestCount(
    requestAnswerCount:
      number,
  ): boolean {
    return requestAnswerCount
      === 1;
  }

  function evaluateCompletedClarificationClearsPending(
    pendingClarification:
      ConsultingClarificationRequest | null,
  ): boolean {
    return pendingClarification
      === null;
  }

  function evaluateCompletedClarificationVerdictIsNotInsufficient(
    verdict:
      string,
  ): boolean {
    return verdict
      !== "insufficientEvidence";
  }

  function evaluateCompletedClarificationBecomesActive(
    status:
      string,
  ): boolean {
    return status
      === "active";
  }

  function evaluateCompletedClarificationCompletion(
    input: {
      verdict:
        string;

      status:
        string;

      pendingClarification:
        ConsultingClarificationRequest | null;

      requestAnswerCallCount:
        number;
    },
  ): boolean {
    return (
      evaluateCompletedClarificationVerdictIsNotInsufficient(
        input.verdict,
      )
      && evaluateCompletedClarificationBecomesActive(
        input.status,
      )
      && evaluateCompletedClarificationClearsPending(
        input.pendingClarification,
      )
      && evaluateCompletedClarificationAnswerRequestCount(
        input.requestAnswerCallCount,
      )
    );
  }

  function evaluateAssistantAnswerIsNotClarificationQuestion(
    assistantAnswer:
      string,
    clarificationPhrases:
      readonly string[],
  ): boolean {
    return clarificationPhrases
      .every(
        (phrase) =>
          !assistantAnswer.includes(
            phrase,
          ),
      );
  }

  function evaluateDecisionQuestionIsOriginal(
    decisionQuestion:
      string | undefined,
    originalDecisionQuestion:
      string,
    responseFragment:
      string,
  ): boolean {
    return (
      decisionQuestion
      === originalDecisionQuestion
      && decisionQuestion
      !== responseFragment
    );
  }

  function evaluateConfirmedFactSourceTurnId(
    sourceTurnId:
      string,
    expectedSourceTurnId:
      string,
  ): boolean {
    return sourceTurnId
      === expectedSourceTurnId;
  }

  export async function verifyConsultingSessionTurnExecutor():
    Promise<ConsultingSessionTurnExecutorVerificationResult> {
    const sourceRequest =
      createSourceRequest();

    const initialExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );

    const initialAssistantAnswer =
      "현재 정보만으로 상가 매수를 확정할 수 없습니다. 대출 상환능력과 실제 결정기한을 먼저 확인해야 합니다.";

    const initialSession =
      buildInitialConsultingSession({
        sessionId:
          "session-turn-executor-001",

        initialTurnId:
          "turn-executor-001",

        createdAt:
          "2026-07-28T08:00:00+09:00",

        request:
          sourceRequest,

        execution:
          initialExecution,

        assistantAnswer:
          initialAssistantAnswer,
      });

    const initialTurnCount =
      initialSession
        .turns
        .length;

    const initialLifeContextRevisionCount =
      initialSession
        .lifeContextHistory
        .length;

        const followUpQuestion =
      "지금 새로운 사업을 시작해도 될까요?";

    const preparationInput = {
      session:
        initialSession,

        kind:
        "followUp" as const,

      question:
        followUpQuestion,

      preparedAt:
        "2026-07-28T08:10:00+09:00",
    };

    const expectedPreparation =
      prepareConsultingSessionTurn(
        preparationInput,
      );

    const expectedAssistantAnswer =
      "현재 엔진 판정에 따라 기존 현금흐름을 보호하고 매수 규모를 제한하는 조건에서만 진행 방향을 검토할 수 있습니다.";

    const capturedRequests:
      ConsultingOpenAIRequest[] =
        [];

    const nextSession =
      await executeConsultingSessionTurn({
        preparationInput,

        turnId:
          "turn-executor-002",

        createdAt:
          "2026-07-28T08:11:00+09:00",

        confirmedFacts: [
          {
            key:
              "loanBalance",

            description:
              "대출 잔액 2억 원",
          },
          {
            key:
              "stableMonthlyIncome",

            description:
              "안정적인 월소득 900만 원",
          },
        ],

        requestAnswer:
          async (
            request,
          ) => {
            capturedRequests.push(
              request,
            );

            return expectedAssistantAnswer;
          },
      });

    const deliveredRequest =
      capturedRequests[0];

    const newTurn =
      nextSession
        .turns[
          nextSession
            .turns
            .length
          - 1
        ];

    const originalInitialTurn =
      initialSession
        .turns[0];

    const preservedInitialTurn =
      nextSession
        .turns[0];

    const expectedDecision =
      expectedPreparation
        .turnResult
        .decisionResult;

    const emptyAnswerRejected =
      await actionRejects(
        () =>
          executeConsultingSessionTurn({
            preparationInput,

            turnId:
              "turn-executor-empty-answer",

            createdAt:
              "2026-07-28T08:12:00+09:00",

            requestAnswer:
              async () =>
                "   ",
          }),
      );

    const injectedClientFailure =
      new Error(
        "Injected turn executor client failure.",
      );

    let propagatedFailure:
      unknown =
        null;

    try {
      await executeConsultingSessionTurn({
        preparationInput,

        turnId:
          "turn-executor-client-failure",

        createdAt:
          "2026-07-28T08:13:00+09:00",

        requestAnswer:
          async () => {
            throw injectedClientFailure;
          },
      });
    } catch (
      error
    ) {
      propagatedFailure =
        error;
    }

    const duplicateTurnIdRejected =
      await actionRejects(
        () =>
          executeConsultingSessionTurn({
            preparationInput,

            turnId:
              initialSession
                .turns[0]
                .id,

            createdAt:
              "2026-07-28T08:14:00+09:00",

            requestAnswer:
              async () =>
                expectedAssistantAnswer,
          }),
      );

      const incompleteCompatibilityQuestion =
      "1967년 4월 10일 생과 동업은 어떤가요?";

    let incompleteCompatibilityRequestCount =
      0;

    const clarificationSession =
      await executeConsultingSessionTurn({
        preparationInput: {
          session:
            initialSession,

            kind:
            "followUp",

          question:
            incompleteCompatibilityQuestion,

          preparedAt:
            "2026-07-28T08:15:00+09:00",
        },

        turnId:
          "turn-executor-compatibility-clarification",

        createdAt:
          "2026-07-28T08:16:00+09:00",

        requestAnswer:
          async () => {
            incompleteCompatibilityRequestCount +=
              1;

            return "호출되면 안 되는 정형화된 GPT 답변";
          },
      });

    const clarificationTurn =
      clarificationSession
        .turns[
          clarificationSession
            .turns
            .length
          - 1
        ];

    const originalPendingClarification =
      clarificationSession
        .pendingClarification;

    const originalDecisionTurnId =
      originalPendingClarification
        ?.decisionTurnId
      ?? clarificationTurn
        .id;

    const originalClarificationPhrases =
      originalPendingClarification
        ?.items
        .flatMap(
          (item) => [
            item.question,
            item.description,
          ],
        )
      ?? [];

    const clarificationSessionSnapshot =
      snapshotConsultingSession(
        clarificationSession,
      );

    const partialClarificationQuestion =
      "양력입니다.";

    const partialClarificationTurnId =
      "turn-executor-partial-clarification";

    const partialClarificationCreatedAt =
      "2026-07-28T08:17:00+09:00";

    const partialConfirmedFacts = [
      {
        key:
          "counterpartBirthData",

        description:
          "상대방의 양력·음력 여부는 양력이다.",

        fields: [
          {
            key:
              "calendarType",

            value:
              "solar",

            evidence: [
              "양력입니다",
            ],
          },
        ],
      },
    ];

    let partialClarificationRequestCount =
      0;

    const rejectInjectedClarificationInterpretation =
      async () => {
        throw new Error(
          "Clarification interpreter must not be called when confirmed facts are injected.",
        );
      };

    const partialClarificationSession =
      await executeConsultingSessionTurn({
        preparationInput: {
          session:
            clarificationSession,

          kind:
            "clarification",

          question:
            partialClarificationQuestion,

          preparedAt:
            "2026-07-28T08:17:00+09:00",
        },

        turnId:
          partialClarificationTurnId,

        createdAt:
          partialClarificationCreatedAt,

        confirmedFacts:
          partialConfirmedFacts,

        requestClarificationInterpretation:
          rejectInjectedClarificationInterpretation,

        requestAnswer:
          async () => {
            partialClarificationRequestCount +=
              1;

            return "호출되면 안 되는 부분 clarification GPT 답변";
          },
      });

    const partialClarificationTurn =
      partialClarificationSession
        .turns[
          partialClarificationSession
            .turns
            .length
          - 1
        ];

    const partialPendingQuestions =
      (
        partialClarificationSession
          .pendingClarification
          ?.items
          .map(
            (item) =>
              item.question,
          )
        ?? []
      )
        .join(
          "\n",
        );

    const partialSessionSnapshot =
      snapshotConsultingSession(
        partialClarificationSession,
      );

    const completedClarificationQuestion =
      "상대방은 여성이고 출생시간은 오후 2시 30분입니다.";

    const completedClarificationTurnId =
      "turn-executor-completed-clarification";

    const completedClarificationCreatedAt =
      "2026-07-28T08:18:00+09:00";

    const completedAssistantAnswer =
      "확인된 상대 사주와 현재 조건을 기준으로 동업 방향을 설명합니다.";

    const completedConfirmedFacts = [
      {
        key:
          "counterpartBirthData",

        description:
          "상대방은 1967년 4월 10일생 여성이고 출생시간은 14:30이다.",

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
              "gender",

            value:
              "female",

            evidence: [
              "상대방은 여성",
            ],
          },
          {
            key:
              "birthTime",

            value:
              "14:30",

            evidence: [
              "오후 2시 30분",
            ],
          },
        ],
      },
      {
        key:
          "financialExecutionCapacity",

        description:
          "자기자금 5천만 원, 추가 대출 없이 비상자금 1천만 원을 유지한다.",

        fields: [
          {
            key:
              "selfFunds",

            value:
              "50000000",

            evidence: [
              "자기자금 5천만 원",
            ],
          },
          {
            key:
              "plannedDebt",

            value:
              "0",

            evidence: [
              "추가 대출 없이",
            ],
          },
          {
            key:
              "reserveFunds",

            value:
              "10000000",

            evidence: [
              "비상자금 1천만 원",
            ],
          },
        ],
      },
      {
        key:
          "decisionDeadline",

        description:
          "실제 결정 마감은 두 달 뒤다.",

        fields: [
          {
            key:
              "deadline",

            value:
              "두 달 뒤",

            evidence: [
              "두 달 뒤",
            ],
          },
        ],
      },
    ];

    const completedClarificationRequests:
      ConsultingOpenAIRequest[] =
        [];

    const expectedCompletedClarificationFacts =
      toClarificationFacts(
        [
          ...partialClarificationSession
            .confirmedFacts,

          ...completedConfirmedFacts.map(
            (fact) => ({
              key:
                fact.key,

              description:
                fact.description,

              fields:
                fact.fields.map(
                  (field) => ({
                    key:
                      field.key,

                    value:
                      field.value,

                    evidence: [
                      ...field.evidence,
                    ],
                  }),
                ),

              decisionTurnId:
                originalDecisionTurnId,

              sourceTurnId:
                completedClarificationTurnId,

              confirmedAt:
                completedClarificationCreatedAt,
            }),
          ),
        ],
        originalDecisionTurnId,
      );

    const expectedCompletedBirthDate =
      getClarificationFieldValue(
        expectedCompletedClarificationFacts,
        "counterpartBirthData",
        "birthDate",
      );

    const expectedCompletedCalendarType =
      getClarificationFieldValue(
        expectedCompletedClarificationFacts,
        "counterpartBirthData",
        "calendarType",
      );

    const expectedCompletedGender =
      getClarificationFieldValue(
        expectedCompletedClarificationFacts,
        "counterpartBirthData",
        "gender",
      );

    const expectedCompletedBirthTime =
      getClarificationFieldValue(
        expectedCompletedClarificationFacts,
        "counterpartBirthData",
        "birthTime",
      );

    const expectedCompletedCounterpartSaju =
      expectedCompletedBirthDate
      && expectedCompletedCalendarType
      && expectedCompletedGender
        ? buildCounterpartSajuCalculation({
            birthDate:
              expectedCompletedBirthDate,

            birthTime:
              expectedCompletedBirthTime,

            calendarType:
              expectedCompletedCalendarType,

            gender:
              expectedCompletedGender,
          })
        : undefined;

    const originalDecisionTurn =
      clarificationSession
        .turns
        .find(
          (turn) =>
            turn.id
            === originalDecisionTurnId,
        )
      ?? clarificationTurn;

    const expectedCompletedPreparation =
      prepareConsultingSessionTurn({
        session:
          partialClarificationSession,

        kind:
          "clarification",

        question:
          completedClarificationQuestion,

        preparedAt:
          "2026-07-28T08:18:00+09:00",

        decisionQuestion:
          originalDecisionTurn
            .decisionQuestion
          ?? originalDecisionTurn
            .question,

        questionInterpretation:
          originalDecisionTurn
            .questionReaderResult,

        clarificationFacts:
          expectedCompletedClarificationFacts,

        counterpartSaju:
          expectedCompletedCounterpartSaju,
      });

    const completedCompatibilityAssessment =
      assessCompatibility(
        expectedCompletedPreparation
          .turnResult
          .questionContext,

        partialClarificationSession
          .sajuFacts
          .calculatedSaju
          .yearGanZhi,

        expectedCompletedCounterpartSaju,

        partialClarificationSession
          .sajuFacts
          .facts,
      );

    const expectedCompletedRequest =
      buildConsultingSessionOpenAIRequest(
        expectedCompletedPreparation,
      );

    const completedClarificationSession =
      await executeConsultingSessionTurn({
        preparationInput: {
          session:
            partialClarificationSession,

          kind:
            "clarification",

          question:
            completedClarificationQuestion,

          preparedAt:
            "2026-07-28T08:18:00+09:00",
        },

        turnId:
          completedClarificationTurnId,

        createdAt:
          completedClarificationCreatedAt,

        confirmedFacts:
          completedConfirmedFacts,

        requestClarificationInterpretation:
          rejectInjectedClarificationInterpretation,

        requestAnswer:
          async (
            request,
          ) => {
            completedClarificationRequests.push(
              request,
            );

            return completedAssistantAnswer;
          },
      });

    const completedClarificationTurn =
      completedClarificationSession
        .turns[
          completedClarificationSession
            .turns
            .length
          - 1
        ];

    const completedTurnKinds =
      completedClarificationSession
        .turns
        .map(
          (turn) =>
            turn.kind,
        );

    const calendarTypeFact =
      partialClarificationSession
        .confirmedFacts
        .find(
          (fact) =>
            fact.key
            === "counterpartBirthData"
            && fact
              .fields
              .some(
                (field) =>
                  field.key
                  === "calendarType",
              ),
        );

    const genderFact =
      completedClarificationSession
        .confirmedFacts
        .find(
          (fact) =>
            fact.key
            === "counterpartBirthData"
            && fact
              .fields
              .some(
                (field) =>
                  field.key
                  === "gender",
              ),
        );

    const checks = {
      openAIRequestIsSentExactlyOnce:
        capturedRequests
          .length
        === 1,

      requestUsesConfiguredModel:
        deliveredRequest !== undefined
        && deliveredRequest
          .model
        === "gpt-5.5",

      currentDecisionPromptIsDelivered:
        deliveredRequest !== undefined
        && deliveredRequest
          .userPrompt
          .includes(
            expectedPreparation
              .turnResult
              .prompt
              .userPrompt,
          ),

      previousConversationIsDeliveredAsContext:
        deliveredRequest !== undefined
        && deliveredRequest
          .userPrompt
          .includes(
            initialAssistantAnswer,
          )
        && deliveredRequest
          .userPrompt
          .includes(
            initialSession
              .turns[0]
              .question,
          ),

      previousConversationCannotBecomeEvidence:
        deliveredRequest !== undefined
        && deliveredRequest
          .systemPrompt
          .includes(
            "이전 사용자 질문과 GPT 답변을 새로운 판단 근거로 사용하지 않는다.",
          ),

      originalSessionIsNotMutated:
        initialSession
          .turns
          .length
        === initialTurnCount
        && initialSession
          .lifeContextHistory
          .length
        === initialLifeContextRevisionCount,

      originalSajuFactsAreReused:
        nextSession
          .sajuFacts
        === initialSession
          .sajuFacts,

      originalReaderEvidenceIsReused:
        nextSession
          .readerEvidence
        === initialSession
          .readerEvidence,

      originalHumanContextIsReused:
        nextSession
          .humanContext
        === initialSession
          .humanContext,

      previousTurnIsPreserved:
        preservedInitialTurn
        === originalInitialTurn,

      exactlyOneNewTurnIsAdded:
        nextSession
          .turns
          .length
        === initialTurnCount
        + 1,

      newTurnUsesContinuousSequence:
        newTurn
          .sequence
        === originalInitialTurn
          .sequence
        + 1,

      newTurnStoresFollowUpQuestion:
        newTurn
          .question
        === followUpQuestion,

      newTurnStoresAssistantAnswer:
        newTurn
          .assistantAnswer
        === expectedAssistantAnswer,

      newTurnStoresCurrentDecisionResult:
        JSON.stringify(
          newTurn
            .decisionResult,
        )
        === JSON.stringify(
          expectedDecision,
        ),

      newTurnStoresCurrentQuestionReaderResult:
        JSON.stringify(
          newTurn
            .questionReaderResult,
        )
        === JSON.stringify(
          expectedPreparation
            .turnResult
            .questionReaderResult,
        ),

      newTurnStoresCurrentQuestionContext:
        JSON.stringify(
          newTurn
            .questionContext,
        )
        === JSON.stringify(
          expectedPreparation
            .turnResult
            .questionContext,
        ),

      unchangedRealityKeepsRevision:
        nextSession
          .lifeContextHistory
          .length
        === initialLifeContextRevisionCount
        && newTurn
          .lifeContextRevision
        === initialSession
          .lifeContextHistory[
            initialLifeContextRevisionCount
            - 1
          ]
          .revision,

      confirmedFactsAreStored:
        nextSession
          .confirmedFacts
          .length
        === 2,

      confirmedFactsAreLinkedToNewTurn:
        nextSession
          .confirmedFacts
          .every(
            (fact) =>
              fact.sourceTurnId
              === newTurn.id
              && fact.confirmedAt
              === newTurn.createdAt,
          ),

      emptyAssistantAnswerIsRejected:
        emptyAnswerRejected,

      clientFailureIsPropagated:
        propagatedFailure
        === injectedClientFailure,

      failedRequestsDoNotMutateOriginalSession:
        initialSession
          .turns
          .length
        === initialTurnCount
        && initialSession
          .confirmedFacts
          .length
        === 0,

      duplicateTurnIdIsRejected:
        duplicateTurnIdRejected,
        insufficientCompatibilitySkipsOpenAI:
        incompleteCompatibilityRequestCount
        === 0,

      insufficientCompatibilityKeepsVerdict:
        clarificationTurn
          .decisionResult
          .verdict
        === "insufficientEvidence",

      clarificationAnswerUsesOriginalQuestion:
        clarificationTurn
          .assistantAnswer
          .includes(
            incompleteCompatibilityQuestion,
          ),

      providedBirthDateIsAcknowledged:
        clarificationTurn
          .assistantAnswer
          .includes(
            "말씀하신 생년월일은 확인했습니다.",
          ),

      missingBirthDetailsAreRequested:
        clarificationTurn
          .assistantAnswer
          .includes(
            "양력·음력 여부",
          )
        && clarificationTurn
          .assistantAnswer
          .includes(
            "성별",
          )
        && clarificationTurn
          .assistantAnswer
          .includes(
            "출생시간",
          ),

      genericGPTAnswerIsNotStored:
        !clarificationTurn
          .assistantAnswer
          .includes(
            "호출되면 안 되는 정형화된 GPT 답변",
          ),

      clarificationRemainsPending:
        clarificationSession
          .status
        === "awaitingClarification"
        && clarificationSession
          .pendingClarification
        !== null,

      partialClarificationUsesClarificationKind:
        partialClarificationTurn
          .kind
        === "clarification",

      partialClarificationKeepsOriginalDecisionQuestion:
        evaluateDecisionQuestionIsOriginal(
          partialClarificationTurn
            .decisionQuestion,
          incompleteCompatibilityQuestion,
          partialClarificationQuestion,
        ),

      partialClarificationSkipsOpenAI:
        evaluatePartialClarificationSkipsOpenAI(
          partialClarificationRequestCount,
        ),

      partialClarificationRemainsAwaiting:
        partialClarificationSession
          .status
        === "awaitingClarification"
        && partialClarificationSession
          .pendingClarification
        !== null,

      partialClarificationKeepsOnlyRemainingItems:
        !partialPendingQuestions.includes(
          "양력·음력",
        )
        && !partialPendingQuestions.includes(
          "양력 또는 음력",
        )
        && partialPendingQuestions.includes(
          "성별",
        ),

      partialClarificationKeepsDecisionTurnId:
        partialClarificationSession
          .pendingClarification
          ?.decisionTurnId
        === originalDecisionTurnId,

      partialClarificationAddsExactlyOneTurn:
        partialClarificationSession
          .turns
          .length
        === clarificationSession
          .turns
          .length
        + 1,

      partialClarificationFactIsLinkedToTurn:
        calendarTypeFact
          !== undefined
        && evaluateConfirmedFactSourceTurnId(
          calendarTypeFact
            .sourceTurnId,
          partialClarificationTurnId,
        )
        && calendarTypeFact
          .decisionTurnId
        === originalDecisionTurnId
        && calendarTypeFact
          .confirmedAt
        === partialClarificationCreatedAt,

      completedClarificationUsesClarificationKind:
        completedClarificationTurn
          .kind
        === "clarification",

      completedClarificationRequestsAnswerExactlyOnce:
        evaluateCompletedClarificationAnswerRequestCount(
          completedClarificationRequests
            .length,
        ),

      completedClarificationRequestMatchesOpenAIBuilder:
        completedClarificationRequests
          .length
        === 1
        && JSON.stringify(
          completedClarificationRequests[0],
        )
        === JSON.stringify(
          expectedCompletedRequest,
        ),

      completedClarificationStoresAssistantAnswer:
        completedClarificationTurn
          .assistantAnswer
        === completedAssistantAnswer,

      completedClarificationUsesOriginalDecisionQuestion:
        evaluateDecisionQuestionIsOriginal(
          completedClarificationTurn
            .decisionQuestion,
          incompleteCompatibilityQuestion,
          completedClarificationQuestion,
        ),

      completedClarificationStoresCurrentDecision:
        JSON.stringify(
          completedClarificationTurn
            .decisionResult,
        )
        === JSON.stringify(
          expectedCompletedPreparation
            .turnResult
            .decisionResult,
        ),

      completedClarificationUsesAccumulatedFacts:
        (
          completedClarificationTurn
            .questionContext
            .clarificationFacts
            ?.some(
              (fact) =>
                fact
                  .fields
                  .some(
                    (field) =>
                      field.key
                      === "calendarType"
                      && field.value
                      === "solar",
                  ),
            )
          ?? false
        )
        && (
          completedClarificationTurn
            .questionContext
            .clarificationFacts
            ?.some(
              (fact) =>
                fact
                  .fields
                  .some(
                    (field) =>
                      field.key
                      === "gender"
                      && field.value
                      === "female",
                  ),
            )
          ?? false
        ),

      completedClarificationHasCounterpartBirthData:
        completedClarificationTurn
          .questionContext
          .counterpart
          .birthDataProvided,

      completedClarificationHasCompatibilityEvidence:
        completedClarificationTurn
          .decisionResult
          .evidence
          .some(
            (evidence) =>
              evidence.source
              === "compatibility",
          ),

      completedClarificationVerdictIsNotInsufficient:
        evaluateCompletedClarificationVerdictIsNotInsufficient(
          completedClarificationTurn
            .decisionResult
            .verdict,
        ),

      completedClarificationBecomesActive:
        evaluateCompletedClarificationBecomesActive(
          completedClarificationSession
            .status,
        ),

      completedClarificationRequiredFieldsAreComplete:
        originalPendingClarification
        !== null
        && rebuildPendingConsultingClarification({
          clarification:
            originalPendingClarification,

          confirmedFacts:
            completedClarificationSession
              .confirmedFacts,
        })
        === null,

      completedClarificationClearsPending:
        evaluateCompletedClarificationClearsPending(
          completedClarificationSession
            .pendingClarification,
        ),

      completedClarificationDoesNotRegenerateQuestions:
        evaluateAssistantAnswerIsNotClarificationQuestion(
          completedClarificationTurn
            .assistantAnswer,
          originalClarificationPhrases,
        )
        && !completedClarificationTurn
          .assistantAnswer
          .includes(
            "양력·음력 여부",
          )
        && !completedClarificationTurn
          .assistantAnswer
          .includes(
            "상대방의 성별",
          ),

      completedClarificationDoesNotReaskCompletedFields:
        !completedClarificationTurn
          .assistantAnswer
          .includes(
            "양력·음력",
          )
        && !completedClarificationTurn
          .assistantAnswer
          .includes(
            "상대방 성별",
          ),

      clarificationFactsAccumulateAcrossTurns:
        completedClarificationSession
          .confirmedFacts
          .length
        === partialClarificationSession
          .confirmedFacts
          .length
        + completedConfirmedFacts
          .length
        && calendarTypeFact
          !== undefined
        && genderFact
          !== undefined
        && evaluateConfirmedFactSourceTurnId(
          calendarTypeFact
            .sourceTurnId,
          partialClarificationTurnId,
        )
        && evaluateConfirmedFactSourceTurnId(
          genderFact
            .sourceTurnId,
          completedClarificationTurnId,
        )
        && calendarTypeFact
          .decisionTurnId
        === originalDecisionTurnId
        && genderFact
          .decisionTurnId
        === originalDecisionTurnId,

      clarificationTurnSequenceIsContinuous:
        partialClarificationTurn
          .sequence
        === clarificationTurn
          .sequence
        + 1
        && completedClarificationTurn
          .sequence
        === partialClarificationTurn
          .sequence
        + 1,

      completedClarificationTurnKindOrder:
        completedTurnKinds
          .join(
            ",",
          )
        === [
          "initial",
          "followUp",
          "clarification",
          "clarification",
        ].join(
          ",",
        ),

      clarificationSessionsAreNotMutated:
        snapshotConsultingSession(
          clarificationSession,
        )
        === clarificationSessionSnapshot
        && snapshotConsultingSession(
          partialClarificationSession,
        )
        === partialSessionSnapshot,

      completedPendingRegenerationFails:
        evaluateCompletedClarificationClearsPending(
          originalPendingClarification,
        )
        === false,

      completedInsufficientVerdictFails:
        evaluateCompletedClarificationCompletion({
          verdict:
            "insufficientEvidence",

          status:
            "active",

          pendingClarification:
            null,

          requestAnswerCallCount:
            1,
        })
        === false,

      completedAwaitingStatusFails:
        evaluateCompletedClarificationCompletion({
          verdict:
            "conditionallyRecommended",

          status:
            "awaitingClarification",

          pendingClarification:
            null,

          requestAnswerCallCount:
            1,
        })
        === false,

      completedPendingObjectFails:
        evaluateCompletedClarificationCompletion({
          verdict:
            "conditionallyRecommended",

          status:
            "active",

          pendingClarification: {
            decisionTurnId:
              "turn-negative-control",

            items: [
              {
                key:
                  "negativeControl",

                description:
                  "완료되지 않은 확인 항목",

                question:
                  "추가 정보를 알려주세요.",
              },
            ],
          },

          requestAnswerCallCount:
            1,
        })
        === false,

      completedAnswerCountZeroFails:
        evaluateCompletedClarificationCompletion({
          verdict:
            "conditionallyRecommended",

          status:
            "active",

          pendingClarification:
            null,

          requestAnswerCallCount:
            0,
        })
        === false,

      completedAnswerCountTwoFails:
        evaluateCompletedClarificationCompletion({
          verdict:
            "conditionallyRecommended",

          status:
            "active",

          pendingClarification:
            null,

          requestAnswerCallCount:
            2,
        })
        === false,

      completedCorrectCompletionPasses:
        evaluateCompletedClarificationCompletion({
          verdict:
            "conditionallyRecommended",

          status:
            "active",

          pendingClarification:
            null,

          requestAnswerCallCount:
            1,
        }),

      partialAnswerRequestedFails:
        evaluatePartialClarificationSkipsOpenAI(
          1,
        )
        === false,

      assistantAnswerIsClarificationQuestionFails:
        evaluateAssistantAnswerIsNotClarificationQuestion(
          originalClarificationPhrases[0]
          ?? "상대방의 양력·음력 여부, 성별만 알려주세요.",
          originalClarificationPhrases
            .length
          > 0
            ? originalClarificationPhrases
            : [
                "양력·음력 여부",
              ],
        )
        === false,

      decisionQuestionReplacedByResponseFails:
        evaluateDecisionQuestionIsOriginal(
          partialClarificationQuestion,
          incompleteCompatibilityQuestion,
          partialClarificationQuestion,
        )
        === false,

      wrongConfirmedFactSourceTurnIdFails:
        evaluateConfirmedFactSourceTurnId(
          "turn-unrelated-source",
          partialClarificationTurnId,
        )
        === false,
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

      completedClarification: {
        verdict:
          completedClarificationTurn
            .decisionResult
            .verdict,

        status:
          completedClarificationSession
            .status,

        pendingClarificationIsNull:
          completedClarificationSession
            .pendingClarification
          === null,

        requestAnswerCallCount:
          completedClarificationRequests
            .length,

        assistantAnswerIsStored:
          completedClarificationTurn
            .assistantAnswer
          === completedAssistantAnswer,

        contextAlignment:
          completedClarificationTurn
            .decisionResult
            .contextAlignment,

        actionReadiness:
          completedClarificationTurn
            .decisionResult
            .actionReadiness,

        compatibilityEvidenceLevel:
          completedCompatibilityAssessment
            .evidenceLevel,

        compatibilityAnalysisScope:
          completedCompatibilityAssessment
            .analysisScope,

        additionalCounterpartDataRequired:
          completedCompatibilityAssessment
            .additionalCounterpartDataRequired,

        fullCompatibilityAvailable:
          completedCompatibilityAssessment
            .fullCompatibilityAssessment
            ?.available
          ?? null,

        fullCompatibilityOverallLevel:
          completedCompatibilityAssessment
            .fullCompatibilityAssessment
            ?.overallLevel
          ?? null,

        fullCompatibilitySupportScore:
          completedCompatibilityAssessment
            .fullCompatibilityAssessment
            ?.supportScore
          ?? null,

        fullCompatibilityCautionScore:
          completedCompatibilityAssessment
            .fullCompatibilityAssessment
            ?.cautionScore
          ?? null,
      },
    };
  }
