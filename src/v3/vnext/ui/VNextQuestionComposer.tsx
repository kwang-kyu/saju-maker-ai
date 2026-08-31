import type {
  FormEvent,
} from "react";

import type {
  VNextConsultingSessionState,
} from "./vNextConsultingState.js";

export type VNextQuestionComposerMode =
  | "initial"
  | "followUp"
  | "clarification";

export type VNextQuestionComposerProps = {
  mode: VNextQuestionComposerMode;
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  loadingLabel: string | null;
  isBusy: boolean;
  isStreaming: boolean;
  errorMessage?: string;
  state: VNextConsultingSessionState;
  variant?: "default" | "inline";
};

function resolveComposerCopy(
  mode: VNextQuestionComposerMode,
  hasTurns: boolean,
): {
  title: string | null;
  description: string | null;
  label: string;
  placeholder: string;
  submitLabel: string;
} {
  if (mode === "clarification") {
    return {
      title: null,
      description: "천운문이 요청한 내용을 입력해 주세요.",
      label: "추가 정보",
      placeholder: "천운문이 요청한 내용을 입력해 주세요.",
      submitLabel: "답변 보내기",
    };
  }

  if (mode === "followUp" || hasTurns) {
    return {
      title: null,
      description: null,
      label: "추가 질문",
      placeholder: "예: 그러면 10월 중순은?",
      submitLabel: "전송",
    };
  }

  return {
    title: "지금 판단할 질문",
    description:
      "결정 대상, 시기, 자금이나 책임 조건을 구체적으로 적을수록 "
      + "현실 판단이 분명해집니다.",
    label: "상담 질문",
    placeholder:
      "예: 대출 부담이 있고 생활비를 유지해야 하는데, "
      + "올해 상가를 매수해도 될까요?",
    submitLabel: "상담 시작",
  };
}

export function resolveVNextQuestionComposerMode(
  state: VNextConsultingSessionState,
  isBusy: boolean,
  isStreaming: boolean,
): VNextQuestionComposerMode | null {
  if (isBusy || isStreaming) {
    return null;
  }

  if (state.awaitingClarification) {
    return "clarification";
  }

  if (state.turns.length > 0) {
    return "followUp";
  }

  if (state.phase === "error") {
    return "initial";
  }

  return "initial";
}

export function VNextQuestionComposer({
  mode,
  question,
  onQuestionChange,
  onSubmit,
  disabled,
  loadingLabel,
  isBusy,
  isStreaming,
  errorMessage,
  state,
  variant = "default",
}: VNextQuestionComposerProps) {
  const copy = resolveComposerCopy(
    mode,
    state.turns.length > 0,
  );
  const isInline = variant === "inline";

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      disabled
      || question.trim().length === 0
    ) {
      return;
    }

    onSubmit();
  }

  return (
    <section
      className={[
        "vnext-consulting-composer",
        isInline
          ? "vnext-consulting-composer--inline"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!isInline && copy.title ? (
        <div className="vnext-consulting-composer-heading">
          <h2 className="vnext-consulting-composer-title">
            {copy.title}
          </h2>

          {copy.description ? (
            <p className="vnext-consulting-composer-description">
              {copy.description}
            </p>
          ) : null}
        </div>
      ) : null}

      {isInline && copy.description ? (
        <p className="vnext-consulting-composer-inline-hint">
          {copy.description}
        </p>
      ) : null}

      <form
        className="vnext-consulting-composer-form"
        onSubmit={handleSubmit}
      >
        <label
          className="vnext-consulting-composer-label"
          htmlFor="vnext-consulting-question"
        >
          {copy.label}
        </label>

        <textarea
          id="vnext-consulting-question"
          className="vnext-consulting-composer-textarea"
          value={question}
          onChange={(event) =>
            onQuestionChange(
              event.target.value,
            )
          }
          placeholder={copy.placeholder}
          rows={isInline ? 3 : 4}
          required
        />

        <button
          className="vnext-consulting-composer-submit"
          type="submit"
          disabled={
            disabled
            || question.trim().length === 0
          }
        >
          {isBusy || isStreaming
            ? loadingLabel
              ?? "상담을 처리하고 있습니다"
            : copy.submitLabel}
        </button>
      </form>

      {errorMessage ? (
        <p
          className="vnext-consulting-error"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
