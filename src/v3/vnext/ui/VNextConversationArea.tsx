import {
  useState,
} from "react";

import type {
  VNextConsultingSessionState,
  VNextConsultingTurn,
} from "./vNextConsultingState.js";
import {
  normalizeConsultingDisplayText,
} from "./consultingDisplayText.js";
import {
  isConsultingAccessAuthErrorCode,
} from "../gpt/responseGateway.js";
import {
  isConsultingAccessAuthRetryAllowed,
} from "./vNextConsultingController.js";
import {
  shouldShowVNextUatInviteRedeem,
  VNextUatInviteRedeemPanel,
} from "./VNextUatInviteRedeemPanel.js";

export type VNextConversationAreaProps = {
  state: VNextConsultingSessionState;
  isBusy: boolean;
  isStreaming: boolean;
  authenticated?: boolean;
  accessToken?: string | null;
  onRetry?: () => void;
};

function renderAssistantMessages(
  turn: VNextConsultingTurn,
) {
  return turn.messages
    .filter((message) => message.role === "assistant")
    .map((message) => (
      <div
        className="vnext-conversation-assistant"
        key={message.id}
      >
        <span className="vnext-conversation-role">
          천운문
        </span>

        <div className="vnext-conversation-bubble vnext-conversation-bubble--assistant">
          <p>
            {normalizeConsultingDisplayText(message.text)}
          </p>
        </div>
      </div>
    ));
}

function renderCompletedTurn(
  turn: VNextConsultingTurn,
) {
  return (
    <article
      className="vnext-conversation-turn"
      key={turn.id}
      aria-label="완료된 상담 턴"
    >
      <div className="vnext-conversation-user">
        <span className="vnext-conversation-role">
          내 질문
        </span>

        <div className="vnext-conversation-bubble vnext-conversation-bubble--user">
          <p>
            {turn.question}
          </p>
        </div>
      </div>

      {renderAssistantMessages(turn)}
    </article>
  );
}

function renderActiveTurn(
  state: VNextConsultingSessionState,
  isBusy: boolean,
  isStreaming: boolean,
) {
  if (!state.activeQuestion) {
    return null;
  }

  const showPendingAssistant = isBusy && !isStreaming;
  const showStreamingAssistant = isStreaming;

  return (
    <article
      className="vnext-conversation-turn vnext-conversation-turn--active"
      aria-label="진행 중인 상담 턴"
    >
      <div className="vnext-conversation-user">
        <span className="vnext-conversation-role">
          내 질문
        </span>

        <div className="vnext-conversation-bubble vnext-conversation-bubble--user">
          <p>
            {state.activeQuestion}
          </p>
        </div>
      </div>

      {showPendingAssistant ? (
        <div className="vnext-conversation-assistant">
          <span className="vnext-conversation-role">
            천운문
          </span>

          <div className="vnext-conversation-bubble vnext-conversation-bubble--assistant vnext-conversation-bubble--pending">
            <p className="vnext-conversation-pending-text">
              답변을 준비하고 있습니다.
            </p>
          </div>
        </div>
      ) : null}

      {showStreamingAssistant ? (
        <div className="vnext-conversation-assistant">
          <span className="vnext-conversation-role">
            천운문
          </span>

          <div className="vnext-conversation-bubble vnext-conversation-bubble--assistant vnext-conversation-bubble--streaming">
            <p>
              {normalizeConsultingDisplayText(state.streamingText ?? "")}
              <span
                className="vnext-conversation-stream-cursor"
                aria-hidden="true"
              />
            </p>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function VNextConversationArea({
  state,
  isBusy,
  isStreaming,
  authenticated = false,
  accessToken = null,
  onRetry,
}: VNextConversationAreaProps) {
  const [
    inviteRedeemed,
    setInviteRedeemed,
  ] = useState(false);

  const hasTurns = state.turns.length > 0;
  const showActiveTurn = Boolean(state.activeQuestion)
    && (isBusy || isStreaming || Boolean(state.errorMessage));
  const showEmptyState = !hasTurns
    && !showActiveTurn
    && !state.errorMessage;
  const retryDisabled = isBusy || isStreaming;
  // Access/auth: retry only when policy allows (subscriptionUnavailable).
  // Ordinary remote errors (no access/auth code): keep existing retry CTA.
  // After UAT invite redeem success, allow retry without resetting session.
  const showRetryCta = inviteRedeemed
    || !isConsultingAccessAuthErrorCode(state.errorCode)
    || isConsultingAccessAuthRetryAllowed(state.errorCode);
  const showInviteRedeem = Boolean(state.errorMessage)
    && shouldShowVNextUatInviteRedeem(state.errorCode)
    && authenticated;

  return (
    <section
      className="vnext-conversation-area"
      aria-label="상담 대화"
    >
      <div className="vnext-conversation-turns">
        {state.turns.map((turn) =>
          renderCompletedTurn(turn),
        )}

        {showActiveTurn ? (
          renderActiveTurn(
            state,
            isBusy,
            isStreaming,
          )
        ) : null}
      </div>

      {showEmptyState ? (
        <div className="vnext-conversation-empty">
          <p className="vnext-conversation-empty-title">
            상담을 시작해 주세요
          </p>

          <p className="vnext-conversation-empty-description">
            아래에 질문을 입력하면 천운문의 답변이 이곳에 표시됩니다.
          </p>
        </div>
      ) : null}

      {state.errorMessage ? (
        <>
          <p
            className="vnext-consulting-error"
            role="alert"
          >
            {state.errorMessage}
          </p>

          {showInviteRedeem ? (
            <VNextUatInviteRedeemPanel
              accessToken={accessToken}
              authenticated={authenticated}
              disabled={retryDisabled}
              onRedeemed={() => {
                setInviteRedeemed(true);
              }}
            />
          ) : null}

          {showRetryCta ? (
            <button
              type="button"
              className="vnext-consulting-auth-button"
              onClick={onRetry}
              disabled={retryDisabled || !onRetry}
            >
              다시 시도
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
