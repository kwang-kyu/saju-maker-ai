import {
  useState,
} from "react";

import {
  redeemUatInviteCode,
} from "./vNextUatInviteRedeemClient.js";

export type VNextUatInviteRedeemPanelProps = {
  accessToken: string | null;
  authenticated: boolean;
  disabled?: boolean;
  onRedeemed?: () => void;
};

const REDEEM_ERROR_MESSAGES: Record<string, string> = {
  authenticationRequired:
    "로그인이 필요합니다. 로그인 후 다시 이용해 주세요.",
  invalidInviteCode:
    "초대코드가 올바르지 않습니다.",
  subscriptionUpdateFailed:
    "권한 활성화에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  methodNotAllowed:
    "권한 활성화에 실패했습니다. 잠시 후 다시 시도해 주세요.",
};

function resolveRedeemErrorMessage(
  errorCode: string,
): string {
  return REDEEM_ERROR_MESSAGES[errorCode]
    ?? "권한 활성화에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

/**
 * Minimal UAT invite-code redeem UI for Premium entitlement errors.
 * Does not embed the invite code; validation is server-side only.
 */
export function VNextUatInviteRedeemPanel({
  accessToken,
  authenticated,
  disabled = false,
  onRedeemed,
}: VNextUatInviteRedeemPanelProps) {
  const [
    inviteCode,
    setInviteCode,
  ] = useState("");
  const [
    isRedeeming,
    setIsRedeeming,
  ] = useState(false);
  const [
    redeemError,
    setRedeemError,
  ] = useState("");
  const [
    redeemSuccess,
    setRedeemSuccess,
  ] = useState(false);

  if (!authenticated) {
    return null;
  }

  async function handleRedeem() {
    if (
      !authenticated
      || !accessToken
      || isRedeeming
      || disabled
    ) {
      return;
    }

    const code =
      inviteCode.trim();

    if (
      code.length
      === 0
    ) {
      return;
    }

    setRedeemError("");
    setIsRedeeming(true);

    try {
      const result =
        await redeemUatInviteCode({
          code,
          accessToken,
        });

      if (
        !result.ok
      ) {
        setRedeemError(
          resolveRedeemErrorMessage(
            result.error,
          ),
        );
        return;
      }

      setRedeemSuccess(true);
      setInviteCode("");
      onRedeemed?.();
    } catch {
      setRedeemError(
        resolveRedeemErrorMessage(
          "subscriptionUpdateFailed",
        ),
      );
    } finally {
      setIsRedeeming(false);
    }
  }

  return (
    <div className="vnext-uat-invite-redeem">
      {redeemSuccess ? (
        <p
          className="vnext-uat-invite-redeem-success"
          role="status"
        >
          Premium 테스트 권한이 활성화되었습니다. 다시 질문을 제출해 주세요.
        </p>
      ) : (
        <>
          <p className="vnext-uat-invite-redeem-prompt">
            지인 테스트용 초대코드가 있으신가요?
          </p>

          <label className="vnext-uat-invite-redeem-label">
            <span className="vnext-uat-invite-redeem-label-text">
              초대코드 입력
            </span>

            <input
              type="text"
              className="vnext-uat-invite-redeem-input"
              value={inviteCode}
              onChange={(event) => {
                setInviteCode(event.target.value);
                if (redeemError) {
                  setRedeemError("");
                }
              }}
              disabled={isRedeeming || disabled}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <button
            type="button"
            className="vnext-consulting-auth-button"
            onClick={() => {
              void handleRedeem();
            }}
            disabled={
              isRedeeming
              || disabled
              || !accessToken
              || inviteCode.trim().length === 0
            }
          >
            {isRedeeming
              ? "활성화 중…"
              : "테스트 권한 활성화"}
          </button>
        </>
      )}

      {redeemError ? (
        <p
          className="vnext-consulting-error"
          role="alert"
        >
          {redeemError}
        </p>
      ) : null}
    </div>
  );
}

export function shouldShowVNextUatInviteRedeem(
  errorCode: string | null | undefined,
): boolean {
  return errorCode === "subscriptionRequired"
    || errorCode === "paymentRequired"
    || errorCode === "inactive";
}
