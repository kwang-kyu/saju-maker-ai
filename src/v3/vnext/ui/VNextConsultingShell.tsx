import {
  useCallback,
  useState,
} from "react";

import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  buildVNextRequestFromBirthContext,
  createVNextBirthContext,
} from "../entry/vNextBirthContext.js";
import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  VNextBirthProfileSummary,
} from "./VNextBirthProfileSummary.js";
import {
  VNextConsultingHeader,
} from "./VNextConsultingHeader.js";
import {
  VNextConsultingStatus,
} from "./VNextConsultingStatus.js";
import type {
  VNextConsultingSessionState,
} from "./vNextConsultingState.js";
import {
  canSubmitVNextQuestion,
  shouldShowVNextQuestionComposer,
  shouldUseInitialQuestionSubmit,
} from "./vNextConsultingShellHelpers.js";
import {
  VNextConversationArea,
} from "./VNextConversationArea.js";
import {
  resolveVNextQuestionComposerMode,
  VNextQuestionComposer,
} from "./VNextQuestionComposer.js";

import "./vNextConsultingShell.css";

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function readErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
    && error.message.trim()
  ) {
    return error.message;
  }

  return "천운문 v3 상담 요청을 처리하지 못했습니다.";
}

export type VNextConsultingShellProps = {
  birthProfile: VNextBirthProfile;
  authenticated: boolean;
  authLoading: boolean;
  authError: unknown;
  onSignIn: () => void;
  onSignOut: () => void;
  state: VNextConsultingSessionState;
  loadingLabel: string | null;
  isBusy: boolean;
  isStreaming: boolean;
  submitQuestion: (request: V3ConsultingRequest) => Promise<void>;
  submitFollowUpQuestion: (
    question: string,
    request: V3ConsultingRequest,
  ) => Promise<void>;
  onNewConsultation?: () => void;
  onEditBirthInfo?: () => void;
};

export function VNextConsultingShell({
  birthProfile,
  authenticated,
  authLoading,
  authError,
  onSignIn,
  onSignOut,
  state,
  loadingLabel,
  isBusy,
  isStreaming,
  submitQuestion,
  submitFollowUpQuestion,
  onNewConsultation,
  onEditBirthInfo,
}: VNextConsultingShellProps) {
  const [
    question,
    setQuestion,
  ] = useState("");
  const [
    submitError,
    setSubmitError,
  ] = useState("");
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const buildRequest = useCallback(
    (questionText: string) =>
      buildVNextRequestFromBirthContext(
        createVNextBirthContext(birthProfile),
        questionText,
        getTodayIsoDate(),
      ),
    [birthProfile],
  );

  const composerMode = resolveVNextQuestionComposerMode(
    state,
    isBusy,
    isStreaming,
  );
  const showComposer = shouldShowVNextQuestionComposer(
    state,
    isBusy,
    isStreaming,
  );
  const composerVariant = state.turns.length > 0
    ? "inline"
    : "default";

  async function handleSubmitQuestion() {
    const normalizedQuestion = question.trim();
    const canSubmit = canSubmitVNextQuestion({
      question: normalizedQuestion,
      state,
      isSubmitting,
      isBusy,
      isStreaming,
      authenticated,
    });

    if (!canSubmit) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const request = buildRequest(normalizedQuestion);

      if (shouldUseInitialQuestionSubmit(state)) {
        await submitQuestion(request);
      } else {
        await submitFollowUpQuestion(
          normalizedQuestion,
          request,
        );
      }

      setQuestion("");
    } catch (error) {
      setSubmitError(
        readErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRetry() {
    const retryQuestion = state.activeQuestion?.trim() ?? "";
    const canSubmit = canSubmitVNextQuestion({
      question: retryQuestion,
      state,
      isSubmitting,
      isBusy,
      isStreaming,
      authenticated,
    });

    if (!canSubmit) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const request = buildRequest(retryQuestion);

      if (shouldUseInitialQuestionSubmit(state)) {
        await submitQuestion(request);
      } else {
        await submitFollowUpQuestion(
          retryQuestion,
          request,
        );
      }
    } catch (error) {
      setSubmitError(
        readErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="vnext-consulting-shell">
      <VNextConsultingHeader
        authenticated={authenticated}
        authLoading={authLoading}
        authErrorMessage={
          authError
            ? readErrorMessage(authError)
            : undefined
        }
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        state={state}
        isBusy={isBusy}
        isStreaming={isStreaming}
        loadingLabel={loadingLabel}
        onNewConsultation={onNewConsultation}
      />

      <main className="vnext-consulting-main">
        <VNextBirthProfileSummary
          profile={birthProfile}
          onEditBirthInfo={onEditBirthInfo}
        />

        <section className="vnext-consulting-conversation-section">
          {(isBusy || isStreaming) ? (
            <VNextConsultingStatus
              state={state}
              isBusy={isBusy}
              isStreaming={isStreaming}
              loadingLabel={loadingLabel}
              compact
            />
          ) : null}

          <VNextConversationArea
            state={state}
            isBusy={isBusy}
            isStreaming={isStreaming}
            onRetry={() => {
              void handleRetry();
            }}
          />
        </section>

        {showComposer && composerMode ? (
          <VNextQuestionComposer
            mode={composerMode}
            question={question}
            onQuestionChange={setQuestion}
            onSubmit={() => {
              void handleSubmitQuestion();
            }}
            disabled={
              isSubmitting
              || isBusy
              || isStreaming
              || authLoading
              || !authenticated
            }
            loadingLabel={loadingLabel}
            isBusy={isBusy}
            isStreaming={isStreaming}
            errorMessage={submitError}
            state={state}
            variant={composerVariant}
          />
        ) : null}
      </main>
    </div>
  );
}
