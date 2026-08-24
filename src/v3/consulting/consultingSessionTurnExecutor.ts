  import {
    buildConsultingClarificationAnswer,
  } from "./consultingClarificationAnswerBuilder.js";
  import {
    buildConsultingClarification,
  } from "./consultingClarificationBuilder.js";
  import {
    extractClarificationObservations,
    interpretConsultingClarificationResponse,
  } from "./consultingClarificationResponseInterpreter.js";
  import type {
    ConsultingClarificationResponseRequestFunction,
    InterpretedClarificationItemState,
    InterpretedClarificationObservation,
  } from "./consultingClarificationResponseInterpreter.js";
  import type {
    ConsultingClarificationFact,
  } from "./consultingInput.js";
  import type {
    ConsultingClarificationObservation,
    ConsultingClarificationRequest,
    ConsultingConfirmedFact,
    ConsultingSession,
  } from "./consultingSession.js";
  import {
    requestConsultingSessionAnswer,
  } from "./consultingSessionAnswerRequester.js";
  import type {
    ConsultingAnswerRequestFunction,
  } from "./consultingSessionAnswerRequester.js";
  import {
    buildConsultingSessionTurn,
    prepareConsultingSessionTurn,
  } from "./consultingSessionTurnBuilder.js";
  import type {
    BuildConsultingSessionTurnInput,
    PrepareConsultingSessionTurnInput,
  } from "./consultingSessionTurnBuilder.js";
  import {
    buildCounterpartSajuCalculation,
  } from "./decision/counterpartSajuCalculationBuilder.js";

  export type ExecuteConsultingSessionTurnInput = {
    preparationInput:
      PrepareConsultingSessionTurnInput;

    turnId:
      BuildConsultingSessionTurnInput["turnId"];

    createdAt:
      BuildConsultingSessionTurnInput["createdAt"];

    /**
     * 서버 내부에서 이미 검증된 사실을 직접 전달할 때만 사용한다.
     * 외부 API 요청에서는 이 값을 받지 않는다.
     */
    confirmedFacts?:
      BuildConsultingSessionTurnInput["confirmedFacts"];

    requestAnswer?:
      ConsultingAnswerRequestFunction;

    requestClarificationInterpretation?:
      ConsultingClarificationResponseRequestFunction;
  };

  type ClarificationExecutionContext = {
    preparationInput:
      PrepareConsultingSessionTurnInput;

    pendingClarificationOverride:
      ConsultingClarificationRequest | null | undefined;
  };

  type ResolvedClarificationInterpretation = {
    confirmedFacts:
      BuildConsultingSessionTurnInput["confirmedFacts"];

    itemStates:
      InterpretedClarificationItemState[];
  };

  async function resolveClarificationInterpretation(
    input:
      ExecuteConsultingSessionTurnInput,
  ): Promise<ResolvedClarificationInterpretation> {
    if (
      input.confirmedFacts
      && input.confirmedFacts.length
      > 0
    ) {
      return {
        confirmedFacts:
          input.confirmedFacts,

        itemStates:
          input.confirmedFacts.map(
            (fact) => ({
              key:
                fact.key,

              status:
                "answered" as const,
            }),
          ),
      };
    }

    if (
      input.preparationInput.kind
      !== "clarification"
    ) {
      return {
        confirmedFacts:
          undefined,

        itemStates:
          [],
      };
    }

    const pendingClarification =
      input
        .preparationInput
        .session
        .pendingClarification;

    if (
      pendingClarification
      === null
    ) {
      return {
        confirmedFacts:
          undefined,

        itemStates:
          [],
      };
    }

    const interpretation =
      await interpretConsultingClarificationResponse(
        {
          clarification:
            pendingClarification,

          response:
            input
              .preparationInput
              .question,
        },
        input
          .requestClarificationInterpretation,
      );

    return {
      confirmedFacts:
        interpretation
          .confirmedFacts
          .length
        === 0
          ? undefined
          : interpretation
              .confirmedFacts
              .map(
                (fact) => ({
                  key:
                    fact.key,

                  description:
                    fact.description,

                  fields:
                    fact.fields,
                }),
              ),

      itemStates:
        interpretation.itemStates,
    };
  }

  function normalizeObservationIdentity(
    key:
      string,
    rawValue:
      string,
  ): string {
    return [
      key,

      rawValue
        .trim()
        .toLocaleLowerCase()
        .replace(
          /\s+/g,
          "",
        ),
    ].join(
      ":",
    );
  }

  function resolvePreservedObservations(
    input:
      ExecuteConsultingSessionTurnInput,
  ): InterpretedClarificationObservation[] {
    if (
      input.preparationInput.kind
      !== "clarification"
    ) {
      return [];
    }

    return extractClarificationObservations(
      input
        .preparationInput
        .question,
    );
  }

  function mergeClarificationObservations(
    existing:
      readonly ConsultingClarificationObservation[],
    incoming:
      readonly InterpretedClarificationObservation[],
    sourceTurnId:
      string,
    observedAt:
      string,
  ): ConsultingClarificationObservation[] {
    const merged:
      ConsultingClarificationObservation[] =
        existing.map(
          (observation) => ({
            key:
              observation.key,

            description:
              observation.description,

            rawValue:
              observation.rawValue,

            evidence: [
              ...observation.evidence,
            ],

            sourceTurnId:
              observation.sourceTurnId,

            observedAt:
              observation.observedAt,
          }),
        );

    const seenIdentities =
      new Set(
        merged.map(
          (observation) =>
            normalizeObservationIdentity(
              observation.key,
              observation.rawValue,
            ),
        ),
      );

    for (
      const observation
      of incoming
    ) {
      const identity =
        normalizeObservationIdentity(
          observation.key,
          observation.rawValue,
        );

      if (
        seenIdentities.has(
          identity,
        )
      ) {
        continue;
      }

      seenIdentities.add(
        identity,
      );

      merged.push(
        {
          key:
            observation.key,

          description:
            observation.description,

          rawValue:
            observation.rawValue,

          evidence: [
            ...observation.evidence,
          ],

          sourceTurnId,

          observedAt,
        },
      );
    }

    return merged;
  }

  function attachClarificationObservations(
    session:
      ConsultingSession,
    preservedObservations:
      readonly InterpretedClarificationObservation[],
    sourceTurnId:
      string,
    observedAt:
      string,
  ): ConsultingSession {
    const mergedObservations =
      mergeClarificationObservations(
        session
          .clarificationObservations
        ?? [],
        preservedObservations,
        sourceTurnId,
        observedAt,
      );

    if (
      mergedObservations.length
      === 0
    ) {
      return session;
    }

    return {
      ...session,

      clarificationObservations:
        mergedObservations,
    };
  }

  function buildConfirmedFactAdditions(
    input:
      ExecuteConsultingSessionTurnInput,
    confirmedFacts:
      BuildConsultingSessionTurnInput["confirmedFacts"],
    decisionTurnId:
      string,
  ): ConsultingConfirmedFact[] {
    return (
      confirmedFacts
      ?? []
    ).map(
      (fact) => ({
        key:
          fact.key,

        description:
          fact.description,

        fields:
          (
            fact.fields
            ?? []
          ).map(
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

        decisionTurnId,

        sourceTurnId:
          input.turnId,

        confirmedAt:
          input.createdAt,
      }),
    );
  }

  function buildClarificationFacts(
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
    clarificationFacts:
      readonly ConsultingClarificationFact[],
    itemKey:
      string,
    fieldKey:
      string,
  ): string | undefined {
    for (
      const fact
      of clarificationFacts
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

  function buildConfirmedCounterpartSaju(
    clarificationFacts:
      readonly ConsultingClarificationFact[],
  ) {
    const itemKey =
      "counterpartBirthData";

    const birthDate =
      getClarificationFieldValue(
        clarificationFacts,
        itemKey,
        "birthDate",
      );

    const calendarType =
      getClarificationFieldValue(
        clarificationFacts,
        itemKey,
        "calendarType",
      );

    const gender =
      getClarificationFieldValue(
        clarificationFacts,
        itemKey,
        "gender",
      );

    if (
      !birthDate
      || !calendarType
      || !gender
    ) {
      return undefined;
    }

    const birthTime =
      getClarificationFieldValue(
        clarificationFacts,
        itemKey,
        "birthTime",
      );

    return buildCounterpartSajuCalculation({
      birthDate,

      birthTime,

      calendarType,

      gender,
    });
  }
  function resolveClarificationExecutionContext(
    input:
      ExecuteConsultingSessionTurnInput,
    confirmedFacts:
      BuildConsultingSessionTurnInput["confirmedFacts"],
  ): ClarificationExecutionContext {
    if (
      input.preparationInput.kind
      !== "clarification"
    ) {
      return {
        preparationInput:
          input.preparationInput,

        pendingClarificationOverride:
          undefined,
      };
    }

    const session =
      input
        .preparationInput
        .session;

    const pendingClarification =
      session
        .pendingClarification;

    if (
      pendingClarification
      === null
    ) {
      throw new Error(
        "Clarification execution requires a pending clarification request.",
      );
    }

    const decisionTurnId =
      pendingClarification
        .decisionTurnId;

    const decisionTurn =
      session
        .turns
        .find(
          (turn) =>
            turn.id
            === decisionTurnId,
        );

    if (
      !decisionTurn
    ) {
      throw new Error(
        "Original clarification decision turn was not found.",
      );
    }

    const confirmedFactAdditions =
      buildConfirmedFactAdditions(
        input,
        confirmedFacts,
        decisionTurnId,
      );

    const accumulatedFacts:
      ConsultingConfirmedFact[] = [
        ...session
          .confirmedFacts,

        ...confirmedFactAdditions,
      ];

    const clarificationFacts =
      buildClarificationFacts(
        accumulatedFacts,
        decisionTurnId,
      );

    const counterpartSaju =
      buildConfirmedCounterpartSaju(
        clarificationFacts,
      );

    return {
      preparationInput: {
        ...input
          .preparationInput,

        decisionQuestion:
          decisionTurn
            .decisionQuestion
          ?? decisionTurn
            .question,

            questionInterpretation:
            decisionTurn
              .questionReaderResult,

            clarificationFacts,

            counterpartSaju,
      },

      pendingClarificationOverride:
        undefined,
    };
  }

  function resolveClarificationDecisionTurnId(
    input:
      ExecuteConsultingSessionTurnInput,
  ):
    string {
    if (
      input.preparationInput.kind
      !== "clarification"
    ) {
      return input.turnId;
    }

    const decisionTurnId =
      input
        .preparationInput
        .session
        .pendingClarification
        ?.decisionTurnId
        .trim()
      ?? "";

    if (
      decisionTurnId.length
      === 0
    ) {
      throw new Error(
        "Clarification execution requires a pending clarification request.",
      );
    }

    return decisionTurnId;
  }

  /**
   * 후속 연속 상담 한 턴을 처음부터 끝까지 실행한다.
   *
   * 1. clarification 답변이면 대기 중인 항목과 비교해
   *    명시적으로 확인된 사실만 추출한다.
   * 2. 같은 원래 판단에 연결된 사실만 누적한다.
   * 3. clarification 답변 조각은 턴 원문으로 저장하되,
   *    Decision Engine에는 원래 결정 질문과 누적 사실을 전달한다.
   * 4. Decision을 재실행한 뒤 새 DecisionResult와
   *    questionContext로 clarification을 다시 평가한다.
   * 5. 기존 pending 목록의 다음 item을 자동으로 고르지 않는다.
   * 6. 판단 근거가 충분하거나 추가 질문이 없으면 GPT 설명을 요청한다.
   * 7. 확인된 사실, 답변과 Decision Result를 같은 턴에 저장한다.
   */
  export async function executeConsultingSessionTurn(
    input:
      ExecuteConsultingSessionTurnInput,
  ): Promise<ConsultingSession> {
    const clarificationInterpretation =
      await resolveClarificationInterpretation(
        input,
      );

    const confirmedFacts =
      clarificationInterpretation
        .confirmedFacts;

    const preservedObservations =
      resolvePreservedObservations(
        input,
      );

    const clarificationExecutionContext =
      resolveClarificationExecutionContext(
        input,
        confirmedFacts,
      );

    const preparation =
      prepareConsultingSessionTurn(
        clarificationExecutionContext
          .preparationInput,
      );

    const clarification =
      buildConsultingClarification({
        decisionTurnId:
          resolveClarificationDecisionTurnId(
            input,
          ),

        lifeContext:
          preparation
            .effectiveLifeContext,

        questionContext:
          preparation
            .turnResult
            .questionContext,

        decisionResult:
          preparation
            .turnResult
            .decisionResult,

        clarificationFacts:
          clarificationExecutionContext
            .preparationInput
            .clarificationFacts,

        itemStates:
          clarificationInterpretation
            .itemStates,
      });

    const pendingClarificationOverride =
      input.preparationInput.kind
      === "clarification"
        ? clarification
        : undefined;

    const assistantAnswer =
      clarification
        ? buildConsultingClarificationAnswer({
            originalQuestion:
              preparation
                .decisionQuestion,

            clarification,
          })
        : await requestConsultingSessionAnswer(
            preparation,
            input.requestAnswer,
          );

    const nextSession =
      buildConsultingSessionTurn({
        session:
          input
            .preparationInput
            .session,

        preparation,

        turnId:
          input.turnId,

        createdAt:
          input.createdAt,

        assistantAnswer,

        confirmedFacts,

        pendingClarificationOverride,
      });

    return attachClarificationObservations(
      nextSession,
      preservedObservations,
      input.turnId,
      input.createdAt,
    );
  }
