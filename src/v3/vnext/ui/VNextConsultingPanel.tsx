import type {
  VNextConsultingSessionState,
} from "./vNextConsultingState.js";
import {
  VNextAnalysisProgressBar,
} from "./VNextAnalysisProgressBar.js";
import {
  normalizeConsultingDisplayText,
} from "./consultingDisplayText.js";

export type VNextConsultingPanelProps = {
  state: VNextConsultingSessionState;
  loadingLabel: string | null;
  isBusy: boolean;
  isStreaming: boolean;
  followUpQuestion?: string;
  onFollowUpQuestionChange?: (value: string) => void;
  onFollowUpSubmit?: () => void;
  followUpErrorMessage?: string;
  hideFollowUpComposer?: boolean;
  emptyStateVariant?: "legacy" | "shell";
};

export function VNextConsultingPanel({
  state,
  loadingLabel,
  isBusy,
  isStreaming,
  followUpQuestion = "",
  onFollowUpQuestionChange,
  onFollowUpSubmit,
  followUpErrorMessage,
  hideFollowUpComposer = false,
  emptyStateVariant = "legacy",
}: VNextConsultingPanelProps) {
  const hasTurns = state.turns.length > 0;
  const showActiveQuestion = Boolean(state.activeQuestion)
    && (isBusy || isStreaming);
  const showClarificationFollowUp = !hideFollowUpComposer
    && state.awaitingClarification
    && !isBusy
    && !isStreaming;
  const showGeneralFollowUp = !hideFollowUpComposer
    && hasTurns
    && !state.awaitingClarification
    && !isBusy
    && !isStreaming
    && state.phase !== "error";

  return (
    <div className="v3-consulting-conversation vnext-consulting-panel">
      <div className="v3-consulting-conversation-status">
        <span>
          vNext 상담
        </span>

        <strong>
          {state.phase === "analyzing"
            ? "질문 확인 중"
            : state.phase === "generating"
              ? "상담 정리 중"
              : state.phase === "streaming"
                ? "답변 표시 중"
                : state.awaitingClarification
                  ? "추가 정보 확인 중"
                  : state.phase === "error"
                    ? "처리 오류"
                    : hasTurns
                      ? "상담 완료"
                      : "대기 중"}
        </strong>
      </div>

      {isBusy && loadingLabel ? (
        <div className="v3-consulting-loading">
          <VNextAnalysisProgressBar
            progressStep={state.progressStep}
            className="vnext-analysis-progress vnext-analysis-progress--panel"
          />

          <p className="v3-consulting-loading-title">
            {loadingLabel}
          </p>
        </div>
      ) : null}

      {state.errorMessage ? (
        <p
          className="v3-consulting-error"
          role="alert"
        >
          {state.errorMessage}
        </p>
      ) : null}

      <div className="v3-consulting-conversation-turns">
        {state.turns.flatMap((turn) =>
          turn.messages.map((message) => (
            <article
              className="v3-consulting-conversation-turn"
              key={message.id}
            >
              {message.role === "user" ? (
                <div className="v3-consulting-conversation-user">
                  <span className="v3-consulting-conversation-label">
                    내 질문
                  </span>

                  <p>
                    {normalizeConsultingDisplayText(message.text)}
                  </p>
                </div>
              ) : (
                <div className="v3-consulting-conversation-assistant">
                  <span className="v3-consulting-conversation-label">
                    천운문
                  </span>

                  <p>
                    {normalizeConsultingDisplayText(message.text)}
                  </p>
                </div>
              )}
            </article>
          )),
        )}

        {showActiveQuestion ? (
          <article className="v3-consulting-conversation-turn">
            <div className="v3-consulting-conversation-user">
              <span className="v3-consulting-conversation-label">
                내 질문
              </span>

              <p>
                {state.activeQuestion}
              </p>
            </div>

            {isStreaming && state.streamingText ? (
              <div className="v3-consulting-conversation-assistant">
                <span className="v3-consulting-conversation-label">
                  천운문
                </span>

                <p>
                  {normalizeConsultingDisplayText(state.streamingText)}
                </p>
              </div>
            ) : null}
          </article>
        ) : null}
      </div>

      {!hasTurns
      && !isBusy
      && !isStreaming
      && !state.errorMessage ? (
        <div className="v3-consulting-empty">
          <div className="v3-consulting-empty-inner">
            <p className="v3-consulting-empty-title">
              {emptyStateVariant === "shell"
                ? "상담 결과"
                : "vNext 상담을 시작해 주세요"}
            </p>

            <p className="v3-consulting-empty-description">
              {emptyStateVariant === "shell"
                ? "질문을 입력하고 상담을 시작하면 답변이 이곳에 표시됩니다."
                : "왼쪽 정보를 입력하고 질문을 제출하면 vNext 파이프라인 결과가 이곳에 표시됩니다."}
            </p>
          </div>
        </div>
      ) : null}

      {showClarificationFollowUp ? (
        <form
          className="v3-consulting-follow-up"
          onSubmit={(event) => {
            event.preventDefault();
            onFollowUpSubmit?.();
          }}
        >
          <label
            className="v3-consulting-label"
            htmlFor="vnext-clarification-input"
          >
            현재 질문에 답하기
          </label>

          <textarea
            id="vnext-clarification-input"
            className="v3-consulting-textarea"
            value={followUpQuestion}
            onChange={(event) =>
              onFollowUpQuestionChange?.(
                event.target.value,
              )
            }
            placeholder="천운문이 요청한 내용을 입력해 주세요."
            required
          />

          <button
            className="v3-consulting-submit"
            type="submit"
            disabled={
              followUpQuestion.trim().length === 0
            }
          >
            답변 보내기
          </button>
        </form>
      ) : null}

      {showGeneralFollowUp ? (
        <form
          className="v3-consulting-follow-up"
          onSubmit={(event) => {
            event.preventDefault();
            onFollowUpSubmit?.();
          }}
        >
          <p className="v3-consulting-help">
            궁금한 내용을 계속 질문해보세요.
          </p>

          <label
            className="v3-consulting-label"
            htmlFor="vnext-follow-up-input"
          >
            추가 질문
          </label>

          <textarea
            id="vnext-follow-up-input"
            className="v3-consulting-textarea"
            value={followUpQuestion}
            onChange={(event) =>
              onFollowUpQuestionChange?.(
                event.target.value,
              )
            }
            placeholder="예: 그러면 10월 중순은?"
            required
          />

          <button
            className="v3-consulting-submit"
            type="submit"
            disabled={
              followUpQuestion.trim().length === 0
            }
          >
            전송
          </button>
        </form>
      ) : null}

      {followUpErrorMessage ? (
        <p
          className="v3-consulting-error"
          role="alert"
        >
          {followUpErrorMessage}
        </p>
      ) : null}
    </div>
  );
}
