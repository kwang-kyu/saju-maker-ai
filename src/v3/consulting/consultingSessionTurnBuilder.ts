import {
    readHumanLifeContext,
  } from "../readers/humanLifeContextReader.js";

  import type {
    HumanLifeContext,
  } from "../types/humanLifeContext.js";

  import type {
    ConsultingClarificationFact,
  } from "./consultingInput.js";

  import {
    buildConsultingClarification,
  } from "./consultingClarificationBuilder.js";
  import {
    runConsultingTurn,
    type ConsultingTurnRunResult,
  } from "./consultingRunner.js";
  import type {
    ConsultingClarificationRequest,
    ConsultingConfirmedField,
    ConsultingLifeContextRevision,
    ConsultingSession,
    ConsultingTurn,
    ConsultingTurnKind,
  } from "./consultingSession.js";
  import type {
    V3HumanLifeContextRequest,
  } from "./v3ConsultingRequest.js";
  import type {
    CounterpartSajuCalculation,
  } from "./decision/counterpartSajuCalculationBuilder.js";
  import type {
    QuestionReaderResult,
  } from "./question/questionReader.js";

  export type ConsultingConversationHistoryEntry = {
    turnId:
      string;

    sequence:
      number;

    question:
      string;

    assistantAnswer:
      string;
  };

  export type ConsultingSessionTurnPreparation = {
    sessionId:
      string;

    baseUpdatedAt:
      string;

    baseTurnId:
      string;

    baseTurnCount:
      number;

    kind:
      Exclude<
        ConsultingTurnKind,
        "initial"
      >;

      question:
      string;

      decisionQuestion:
      string;

    counterpartSaju:
      CounterpartSajuCalculation | undefined;

    lifeContextRevision:
      number;

    lifeContextChanged:
      boolean;

    effectiveLifeContextInput:
      V3HumanLifeContextRequest;

      effectiveLifeContext:
    HumanLifeContext;

    newLifeContextRevision:
      ConsultingLifeContextRevision | null;

    turnResult:
      ConsultingTurnRunResult;

    /**
     * 이전 대화는 GPT 설명의 문맥 일관성을 위해서만 반환한다.
     *
     * Decision Engine 입력에는 전달하지 않으므로
     * 이전 GPT 답변이 새 판정을 만들거나 변경할 수 없다.
     */
    conversationHistory:
      ConsultingConversationHistoryEntry[];
  };

  export type PrepareConsultingSessionTurnInput = {
    session:
      ConsultingSession;

    kind:
      Exclude<
        ConsultingTurnKind,
        "initial"
      >;

      question:
      string;

          /**
     * GPT 의미 해석기가 원문 질문의 의미만 구조화한 결과다.
     *
     * 사주 판단이나 결론을 포함하지 않으며,
     * 값이 없으면 기존 내부 Reader를 사용한다.
     */
    questionInterpretation?:
    QuestionReaderResult;

    /**
     * clarification 답변 조각 대신 Decision Engine이 다시 판단할
     * 원래 결정 질문을 서버 내부에서 전달할 때만 사용한다.
     */
    decisionQuestion?:
      string;

    /**
     * 같은 원래 판단에 연결된 검증 완료 사실만 전달한다.
     */
    clarificationFacts?:
  readonly ConsultingClarificationFact[];

counterpartSaju?:
  CounterpartSajuCalculation;

preparedAt:
      string;

    /**
     * 현재 현실이 명시적으로 달라졌을 때만 전달한다.
     *
     * 일부 필드만 전달할 수 있으며,
     * 최신 현실 원천 입력과 병합한 결과가 실제로 달라질 때만
     * Human Life Context revision을 증가시킨다.
     */
    lifeContextUpdate?:
      V3HumanLifeContextRequest;
  };

  export type ConsultingConfirmedFactInput = {
    key:
      string;

    description:
      string;
      fields?:
      readonly ConsultingConfirmedField[];
  };

  export type BuildConsultingSessionTurnInput = {
    session:
      ConsultingSession;

    preparation:
      ConsultingSessionTurnPreparation;

    turnId:
      string;

    createdAt:
      string;

    assistantAnswer:
      string;

      confirmedFacts?:
      readonly ConsultingConfirmedFactInput[];

    /**
     * clarification 답변을 누적한 뒤에도 필수 필드가 남아 있을 때,
     * 완료된 항목과 필드를 제거한 요청만 전달한다.
     *
     * undefined는 override가 없음을 뜻하며
     * 새로 생성한 clarification을 사용한다.
     * null은 필수 항목이 모두 완료되어
     * clarification을 다시 만들지 않음을 뜻한다.
     */
    pendingClarificationOverride?:
      ConsultingClarificationRequest | null;
    };

  const LIFE_CONTEXT_KEYS = [
    "maritalStatus",
    "hasChildren",
    "occupationStatus",
    "hasActiveBusiness",
    "financialResponsibility",
  ] as const satisfies readonly (
    keyof V3HumanLifeContextRequest
  )[];

  function requireNonEmptyValue(
    value:
      string,
    fieldName:
      string,
  ): void {
    if (
      value.trim().length
      === 0
    ) {
      throw new Error(
        `${fieldName} must not be empty.`,
      );
    }
  }

  function getLatestLifeContextRevision(
    session:
      ConsultingSession,
  ): ConsultingLifeContextRevision {
    const latestRevision =
      session.lifeContextHistory[
        session.lifeContextHistory.length - 1
      ];

    if (!latestRevision) {
      throw new Error(
        "Consulting session must contain a life context revision.",
      );
    }

    return latestRevision;
  }

  function getLatestTurn(
    session:
      ConsultingSession,
  ): ConsultingTurn {
    const latestTurn =
      session.turns[
        session.turns.length - 1
      ];

    if (!latestTurn) {
      throw new Error(
        "Consulting session must contain a consulting turn.",
      );
    }

    return latestTurn;
  }

  function mergeLifeContextInput(
    current:
      V3HumanLifeContextRequest,
    update:
      V3HumanLifeContextRequest | undefined,
  ): V3HumanLifeContextRequest {
    if (!update) {
      return {
        ...current,
      };
    }

    const merged:
      V3HumanLifeContextRequest = {
        ...current,
      };

    for (
      const key
      of LIFE_CONTEXT_KEYS
    ) {
      const updatedValue =
        update[key];

      if (
        updatedValue
        !== undefined
      ) {
        Object.assign(
          merged,
          {
            [key]:
              updatedValue,
          },
        );
      }
    }

    return merged;
  }

  function lifeContextInputsAreEqual(
    left:
      V3HumanLifeContextRequest,
    right:
      V3HumanLifeContextRequest,
  ): boolean {
    return LIFE_CONTEXT_KEYS.every(
      (key) =>
        left[key]
        === right[key],
    );
  }

  function buildReferenceDate(
    referenceDateIso:
      string,
  ): Date {
    const match =
      /^(\d{4})-(\d{2})-(\d{2})$/.exec(
        referenceDateIso,
      );

    if (!match) {
      throw new Error(
        "Session referenceDate must use YYYY-MM-DD format.",
      );
    }

    const year =
      Number(match[1]);

    const month =
      Number(match[2]);

    const day =
      Number(match[3]);

    const referenceDate =
      new Date(
        year,
        month - 1,
        day,
      );

    if (
      Number.isNaN(
        referenceDate.getTime(),
      )
      || referenceDate.getFullYear()
        !== year
      || referenceDate.getMonth() + 1
        !== month
      || referenceDate.getDate()
        !== day
    ) {
      throw new Error(
        "Session referenceDate must be a valid date.",
      );
    }

    return referenceDate;
  }

  function buildConversationHistory(
    session:
      ConsultingSession,
  ): ConsultingConversationHistoryEntry[] {
    return session.turns.map(
      (turn) => ({
        turnId:
          turn.id,

        sequence:
          turn.sequence,

        question:
          turn.question,

        assistantAnswer:
          turn.assistantAnswer,
      }),
    );
  }

  function buildConfirmedFacts(
    input:
      BuildConsultingSessionTurnInput,
  ) {
    const additions =
      input.confirmedFacts
      ?? [];
      const decisionTurnId =
      input.preparation.kind
      === "clarification"
        ? input.session
            .pendingClarification
            ?.decisionTurnId
          ?? input.turnId
        : input.turnId;

    return additions.map(
      (fact) => {
        requireNonEmptyValue(
          fact.key,
          "confirmedFact.key",
        );

        requireNonEmptyValue(
          fact.description,
          "confirmedFact.description",
        );

        return {
          key:
            fact.key,

          description:
            fact.description,

            fields:
            fact.fields
              ? [...fact.fields]
              : [],

            decisionTurnId,

          sourceTurnId:
            input.turnId,

          confirmedAt:
            input.createdAt,
        };
      },
    );
  }

  /**
   * 저장된 사람 분석과 최신 현실을 사용해
   * 후속 질문 한 번의 전체 판단 경로를 실행한다.
   *
   * Calculator·Fact·Evidence·Master Reader·Human Context는
   * 다시 만들지 않는다.
   *
   * 이전 GPT 답변은 conversationHistory로만 분리해 반환하며,
   * Question Reader와 Decision Engine의 입력에는 포함하지 않는다.
   */
  export function prepareConsultingSessionTurn(
    input:
      PrepareConsultingSessionTurnInput,
  ): ConsultingSessionTurnPreparation {
    if (
      input.session.status
      === "closed"
    ) {
      throw new Error(
        "Closed consulting session cannot accept a new turn.",
      );
    }

    requireNonEmptyValue(
      input.question,
      "question",
    );

    const decisionQuestion =
      input.decisionQuestion
      ?? input.question;

    requireNonEmptyValue(
      decisionQuestion,
      "decisionQuestion",
    );

    requireNonEmptyValue(
      input.preparedAt,
      "preparedAt",
    );

    if (
      input.kind
      === "clarification"
      && input.session
        .pendingClarification
        === null
    ) {
      throw new Error(
        "Clarification turn requires a pending clarification request.",
      );
    }

    const latestLifeContextRevision =
      getLatestLifeContextRevision(
        input.session,
      );

    const latestTurn =
      getLatestTurn(
        input.session,
      );

    const effectiveLifeContextInput =
      mergeLifeContextInput(
        latestLifeContextRevision
          .sourceInput,
        input.lifeContextUpdate,
      );

    const lifeContextChanged =
      !lifeContextInputsAreEqual(
        latestLifeContextRevision
          .sourceInput,
        effectiveLifeContextInput,
      );

    const nextLifeContextRevision =
      lifeContextChanged
        ? latestLifeContextRevision
            .revision + 1
        : latestLifeContextRevision
            .revision;

    const effectiveLifeContext =
      lifeContextChanged
        ? readHumanLifeContext({
            ...effectiveLifeContextInput,

            birthDate:
              input.session
                .sajuFacts
                .calculatedSaju
                .solarDateIso,

            referenceDate:
              buildReferenceDate(
                input.session
                  .sajuInput
                  .referenceDate,
              ),
          })
        : latestLifeContextRevision
            .lifeContext;

    const newLifeContextRevision:
      ConsultingLifeContextRevision | null =
        lifeContextChanged
          ? {
              revision:
                nextLifeContextRevision,

              sourceInput:
                effectiveLifeContextInput,

              lifeContext:
                effectiveLifeContext,

              updatedAt:
                input.preparedAt,
            }
          : null;

          const turnResult =
          runConsultingTurn({
            sajuFacts:
              input.session
                .sajuFacts,

            readerEvidence:
              input.session
                .readerEvidence,

                questionInterpretation:
                input
                .questionInterpretation,

            humanContext:
              input.session
                .humanContext,

            lifeContext:
              effectiveLifeContext,

              question:
              decisionQuestion,

            clarificationFacts:
              input.clarificationFacts,
              counterpartSaju:
              input.counterpartSaju,
          });

          if (
            turnResult
              .questionReaderResult
              .originalQuestion
            !== decisionQuestion
          ) {
      throw new Error(
        "Consulting turn execution does not match the source question.",
      );
    }

    return {
      sessionId:
        input.session.id,

      baseUpdatedAt:
        input.session.updatedAt,

      baseTurnId:
        latestTurn.id,

      baseTurnCount:
        input.session.turns.length,

      kind:
        input.kind,

        question:
        input.question,

        decisionQuestion,

        counterpartSaju:
          input.counterpartSaju,

        lifeContextRevision:
        nextLifeContextRevision,

      lifeContextChanged,

      effectiveLifeContextInput,

      effectiveLifeContext,

      newLifeContextRevision,

      turnResult,

      conversationHistory:
        buildConversationHistory(
          input.session,
        ),
    };
  }

  /**
   * 준비된 후속 상담 실행 결과와 GPT 설명을
   * 기존 연속 상담 세션의 새 턴으로 저장한다.
   *
   * 준비 이후 세션이 달라졌다면 오래된 실행 결과를 붙이지 않으며,
   * 기존 턴·판정·사람 분석은 변경하지 않는다.
   */
  export function buildConsultingSessionTurn(
    input:
      BuildConsultingSessionTurnInput,
  ): ConsultingSession {
    requireNonEmptyValue(
      input.turnId,
      "turnId",
    );

    requireNonEmptyValue(
      input.createdAt,
      "createdAt",
    );

    requireNonEmptyValue(
      input.assistantAnswer,
      "assistantAnswer",
    );

    if (
      input.session.id
      !== input.preparation
        .sessionId
    ) {
      throw new Error(
        "Consulting turn preparation belongs to a different session.",
      );
    }

    const latestTurn =
      getLatestTurn(
        input.session,
      );

    if (
      input.session.updatedAt
        !== input.preparation
          .baseUpdatedAt
      || input.session.turns.length
        !== input.preparation
          .baseTurnCount
      || latestTurn.id
        !== input.preparation
          .baseTurnId
    ) {
      throw new Error(
        "Consulting session changed after turn preparation.",
      );
    }

    if (
      input.session.turns.some(
        (turn) =>
          turn.id
          === input.turnId,
      )
    ) {
      throw new Error(
        "Consulting turn id must be unique within the session.",
      );
    }

    const turnResult =
      input.preparation
        .turnResult;

        if (
          turnResult
            .questionReaderResult
            .originalQuestion
          !== input.preparation
            .decisionQuestion
        ) {
      throw new Error(
        "Prepared consulting result does not match the source question.",
      );
    }

    const clarificationDecisionTurnId =
    input.preparation.kind
    === "clarification"
      ? input.session
          .pendingClarification
          ?.decisionTurnId
        ?? input.turnId
      : input.turnId;

      const generatedClarification =
      buildConsultingClarification({
        decisionTurnId:
          clarificationDecisionTurnId,

        lifeContext:
          input.preparation
            .newLifeContextRevision
            ?.lifeContext
          ?? getLatestLifeContextRevision(
            input.session,
          ).lifeContext,

        questionContext:
          turnResult
            .questionContext,

        decisionResult:
          turnResult
            .decisionResult,
      });

    if (
      input.pendingClarificationOverride
      && input.preparation.kind
        !== "clarification"
    ) {
      throw new Error(
        "Pending clarification override is only allowed for a clarification turn.",
      );
    }

    if (
      input.pendingClarificationOverride
      && input
        .pendingClarificationOverride
        .decisionTurnId
        !== clarificationDecisionTurnId
    ) {
      throw new Error(
        "Pending clarification override belongs to a different decision turn.",
      );
    }

    const pendingClarification =
      input.pendingClarificationOverride
      === undefined
        ? generatedClarification
        : input.pendingClarificationOverride;

    const newTurn:
      ConsultingTurn = {
        id:
          input.turnId,

        sequence:
          input.session
            .turns
            .length + 1,

        kind:
          input.preparation
            .kind,

            question:
            input.preparation
              .question,

          decisionQuestion:
            input.preparation
              .decisionQuestion,

          lifeContextRevision:
          input.preparation
            .lifeContextRevision,

        questionReaderResult:
          turnResult
            .questionReaderResult,

        questionContext:
          turnResult
            .questionContext,

        decisionResult:
          turnResult
            .decisionResult,

        assistantAnswer:
          input.assistantAnswer,

        createdAt:
          input.createdAt,
      };

    const confirmedFactAdditions =
      buildConfirmedFacts(
        input,
      );

    return {
      ...input.session,

      status:
        pendingClarification
          ? "awaitingClarification"
          : "active",

      updatedAt:
        input.createdAt,

      lifeContextHistory:
        input.preparation
          .newLifeContextRevision
          ? [
              ...input.session
                .lifeContextHistory,

              input.preparation
                .newLifeContextRevision,
            ]
          : input.session
              .lifeContextHistory,

      turns: [
        ...input.session
          .turns,

        newTurn,
      ],

      confirmedFacts: [
        ...input.session
          .confirmedFacts,

        ...confirmedFactAdditions,
      ],

      pendingClarification,
    };
  }
