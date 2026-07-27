import {
    readHumanLifeContext,
  } from "../readers/humanLifeContextReader";

  import {
    buildConsultingClarification,
  } from "./consultingClarificationBuilder";
  import {
    runConsultingTurn,
    type ConsultingTurnRunResult,
  } from "./consultingRunner";
  import type {
    ConsultingLifeContextRevision,
    ConsultingSession,
    ConsultingTurn,
    ConsultingTurnKind,
  } from "./consultingSession";
  import type {
    V3HumanLifeContextRequest,
  } from "./v3ConsultingRequest";

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

    lifeContextRevision:
      number;

    lifeContextChanged:
      boolean;

    effectiveLifeContextInput:
      V3HumanLifeContextRequest;

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
        humanContext:
          input.session
            .humanContext,

        lifeContext:
          effectiveLifeContext,

        question:
          input.question,
      });

    if (
      turnResult
        .questionReaderResult
        .originalQuestion
      !== input.question
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

      lifeContextRevision:
        nextLifeContextRevision,

      lifeContextChanged,

      effectiveLifeContextInput,

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
        .question
    ) {
      throw new Error(
        "Prepared consulting result does not match the source question.",
      );
    }

    const pendingClarification =
      buildConsultingClarification({
        decisionTurnId:
          input.turnId,

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
      turnResult
        .decisionResult
        .verdict
      === "insufficientEvidence"
      && pendingClarification
        === null
    ) {
      throw new Error(
        "Insufficient evidence requires a clarification request.",
      );
    }

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