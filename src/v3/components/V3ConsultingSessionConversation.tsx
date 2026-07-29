import {
    useState,
    type FormEvent,
  } from "react";

  import {
    requestV3ConsultingSessionTurn,
  } from "../services/v3ConsultingSessionApiClient";
  import type {
    V3ConsultingPendingClarification,
    V3ConsultingSessionTurnResponse,
    V3InitialConsultingSessionResponse,
  } from "../services/v3ConsultingSessionApiClient";

  export type V3ConsultingConversationTurn = {
    id:
      string;

    sequence:
      number;

    kind:
      V3ConsultingSessionTurnResponse[
        "turn"
      ][
        "kind"
      ];

    question:
      string;

    assistantAnswer:
      string;

    createdAt:
      string;
  };

  export type V3ConsultingSessionConversationProps = {
    accessToken:
      string;

    initialSession:
      V3InitialConsultingSessionResponse;
  };

  function readErrorMessage(
    error:
      unknown,
  ): string {
    if (
      error
      instanceof Error
      && error.message
        .trim()
    ) {
      return error.message;
    }

    return "후속 상담 질문을 처리하지 못했습니다.";
  }

  function buildInitialTurn(
    session:
      V3InitialConsultingSessionResponse,
  ): V3ConsultingConversationTurn {
    return {
      id:
        session.initialTurnId,

      sequence:
        session.initialTurnSequence,

      kind:
        "initial",

      question:
        session.question,

      assistantAnswer:
        session.assistantAnswer,

      createdAt:
        session.createdAt,
    };
  }

  export function V3ConsultingSessionConversation({
    accessToken,
    initialSession,
  }: V3ConsultingSessionConversationProps) {
    const [
      turns,
      setTurns,
    ] = useState<V3ConsultingConversationTurn[]>([
      buildInitialTurn(
        initialSession,
      ),
    ]);

    const [
      sessionStatus,
      setSessionStatus,
    ] = useState(
      initialSession.status,
    );

    const [
      pendingClarification,
      setPendingClarification,
    ] = useState<V3ConsultingPendingClarification | null>(
      initialSession.pendingClarification,
    );

    const [
      followUpQuestion,
      setFollowUpQuestion,
    ] = useState("");

    const [
      errorMessage,
      setErrorMessage,
    ] = useState("");

    const [
      isSubmitting,
      setIsSubmitting,
    ] = useState(false);

    async function handleFollowUpSubmit(
      event:
        FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();

      const normalizedQuestion =
        followUpQuestion.trim();

      if (
        isSubmitting
        || normalizedQuestion.length
        === 0
      ) {
        return;
      }

      setIsSubmitting(
        true,
      );

      setErrorMessage(
        "",
      );

      try {
        const response =
          await requestV3ConsultingSessionTurn({
            accessToken,

            request: {
              sessionId:
                initialSession.sessionId,

              kind:
                sessionStatus
                === "awaitingClarification"
                  ? "clarification"
                  : "followUp",

              question:
                normalizedQuestion,
            },
          });

        setTurns(
          (currentTurns) => [
            ...currentTurns,

            response.turn,
          ],
        );

        setSessionStatus(
          response.status,
        );

        setPendingClarification(
          response.pendingClarification,
        );

        setFollowUpQuestion(
          "",
        );
      } catch (
        error
      ) {
        setErrorMessage(
          readErrorMessage(
            error,
          ),
        );
      } finally {
        setIsSubmitting(
          false,
        );
      }
    }

    return (
      <div className="v3-consulting-conversation">
        <div className="v3-consulting-conversation-status">
          <span>
            상담 세션
          </span>

          <strong>
            {sessionStatus
            === "awaitingClarification"
              ? "추가 현실 정보 확인 중"
              : sessionStatus
                === "closed"
                ? "상담 종료"
                : "상담 진행 중"}
          </strong>
        </div>

        <div className="v3-consulting-conversation-turns">
          {turns.map(
            (turn) => (
              <article
                className="v3-consulting-conversation-turn"
                key={turn.id}
              >
                <div className="v3-consulting-conversation-user">
                  <span className="v3-consulting-conversation-label">
                    질문 {turn.sequence}
                  </span>

                  <p>
                    {turn.question}
                  </p>
                </div>

                <div className="v3-consulting-conversation-assistant">
                  <span className="v3-consulting-conversation-label">
                    천운문
                  </span>

                  <p>
                    {turn.assistantAnswer}
                  </p>
                </div>
              </article>
            ),
          )}
        </div>

        {pendingClarification ? (
          <section className="v3-consulting-clarification">
            <h3>
              판단을 위해 확인이 필요한 현실 정보
            </h3>

            <ul>
              {pendingClarification
                .missingInformation
                .map(
                  (information) => (
                    <li key={information}>
                      {information}
                    </li>
                  ),
                )}
            </ul>

            <div className="v3-consulting-clarification-questions">
              {pendingClarification
                .questions
                .map(
                  (clarificationQuestion) => (
                    <p key={clarificationQuestion}>
                      {clarificationQuestion}
                    </p>
                  ),
                )}
            </div>
          </section>
        ) : null}

        {errorMessage ? (
          <p
            className="v3-consulting-error"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        {sessionStatus
        !== "closed" ? (
          <form
            className="v3-consulting-follow-up"
            onSubmit={handleFollowUpSubmit}
          >
            <label
              className="v3-consulting-label"
              htmlFor="v3-follow-up-question"
            >
              이어서 질문하기
            </label>

            <textarea
              id="v3-follow-up-question"
              className="v3-consulting-textarea"
              value={followUpQuestion}
              onChange={(event) =>
                setFollowUpQuestion(
                  event.target.value,
                )
              }
              placeholder={
                sessionStatus
                === "awaitingClarification"
                  ? "위에서 요청한 현실 정보를 구체적으로 알려주세요."
                  : "현재 답변에서 더 확인하고 싶은 내용을 질문해 주세요."
              }
              disabled={isSubmitting}
              required
            />

            <button
              className="v3-consulting-submit"
              type="submit"
              disabled={
                isSubmitting
                || followUpQuestion
                  .trim()
                  .length
                === 0
              }
            >
              {isSubmitting
                ? "후속 질문을 판단하고 있습니다"
                : "후속 질문 보내기"}
            </button>
          </form>
        ) : (
          <p className="v3-consulting-conversation-closed">
            현재 상담 세션이 종료되었습니다.
          </p>
        )}
      </div>
    );
  }
