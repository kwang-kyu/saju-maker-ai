import {
    buildConsultingClarificationAnswer,
  } from "./consultingClarificationAnswerBuilder";
  import {
    buildConsultingClarification,
  } from "./consultingClarificationBuilder";
  import {
    rebuildPendingConsultingClarification,
  } from "./consultingClarificationProgressResolver";
  import {
    interpretConsultingClarificationResponse,
  } from "./consultingClarificationResponseInterpreter";
  import type {
    ConsultingClarificationResponseRequestFunction,
  } from "./consultingClarificationResponseInterpreter";
  import type {
    ConsultingClarificationFact,
  } from "./consultingInput";
  import type {
    ConsultingClarificationRequest,
    ConsultingConfirmedFact,
    ConsultingSession,
  } from "./consultingSession";
  import {
    requestConsultingSessionAnswer,
  } from "./consultingSessionAnswerRequester";
  import type {
    ConsultingAnswerRequestFunction,
  } from "./consultingSessionAnswerRequester";
  import {
    buildConsultingSessionTurn,
    prepareConsultingSessionTurn,
  } from "./consultingSessionTurnBuilder";
  import type {
    BuildConsultingSessionTurnInput,
    PrepareConsultingSessionTurnInput,
  } from "./consultingSessionTurnBuilder";
  import {
    buildCounterpartSajuCalculation,
  } from "./decision/counterpartSajuCalculationBuilder";

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

  async function resolveConfirmedFacts(
    input:
      ExecuteConsultingSessionTurnInput,
  ): Promise<
    BuildConsultingSessionTurnInput["confirmedFacts"]
  > {
    if (
      input.confirmedFacts
      && input.confirmedFacts.length
      > 0
    ) {
      return input.confirmedFacts;
    }

    if (
      input.preparationInput.kind
      !== "clarification"
    ) {
      return undefined;
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
      return undefined;
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

    if (
      interpretation
        .confirmedFacts
        .length
      === 0
    ) {
      return undefined;
    }

    return interpretation
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
      );
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
    const pendingClarificationOverride =
      rebuildPendingConsultingClarification({
        clarification:
          pendingClarification,

        confirmedFacts:
          accumulatedFacts,
      });

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

      pendingClarificationOverride,
    };
  }

  /**
   * 후속 연속 상담 한 턴을 처음부터 끝까지 실행한다.
   *
   * 1. clarification 답변이면 대기 중인 항목과 비교해
   *    명시적으로 확인된 사실만 추출한다.
   * 2. 같은 원래 판단에 연결된 사실만 누적한다.
   * 3. clarification 답변 조각은 턴 원문으로 저장하되,
   *    Decision Engine에는 원래 결정 질문과 누적 사실을 전달한다.
   * 4. 추가정보가 남아 있으면 완료된 필드를 제외한 질문만 반환한다.
   * 5. 판단 근거가 충분한 경우에만 GPT 설명을 요청한다.
   * 6. 확인된 사실, 답변과 Decision Result를 같은 턴에 저장한다.
   */
  export async function executeConsultingSessionTurn(
    input:
      ExecuteConsultingSessionTurnInput,
  ): Promise<ConsultingSession> {
    const confirmedFacts =
      await resolveConfirmedFacts(
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
      input.preparationInput.kind
      === "clarification"
        ? clarificationExecutionContext
            .pendingClarificationOverride
        : buildConsultingClarification({
            decisionTurnId:
              input.turnId,

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
          });

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

    return buildConsultingSessionTurn({
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

      pendingClarificationOverride:
        clarificationExecutionContext
          .pendingClarificationOverride
        ?? undefined,
    });
  }
