/**
 * Client helper for UAT invite redeem.
 * Sends only the invite code; never embeds the expected code.
 */

export type UatInviteRedeemClientSuccess = {
  ok: true;
  userId: string;
  plan: "premium";
  status: "active";
};

export type UatInviteRedeemClientFailure = {
  ok: false;
  error: string;
};

export type UatInviteRedeemClientResult =
  | UatInviteRedeemClientSuccess
  | UatInviteRedeemClientFailure;

const REDEEM_INVITE_PATH =
  "/api/v3/uat/redeem-invite";

export async function redeemUatInviteCode(
  input: {
    code: string;
    accessToken: string;
  },
): Promise<UatInviteRedeemClientResult> {
  const response =
    await fetch(
      REDEEM_INVITE_PATH,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${input.accessToken}`,
        },

        body:
          JSON.stringify({
            code:
              input.code,
          }),
      },
    );

  let payload:
    unknown =
      null;

  try {
    payload =
      await response
        .json();
  } catch {
    payload =
      null;
  }

  if (
    response.ok
    && typeof payload
      === "object"
    && payload
      !== null
    && "ok" in payload
    && (payload as { ok: unknown }).ok
      === true
  ) {
    const body =
      payload as UatInviteRedeemClientSuccess;

    return {
      ok:
        true,

      userId:
        body.userId,

      plan:
        "premium",

      status:
        "active",
    };
  }

  const errorCode =
    typeof payload
      === "object"
    && payload
      !== null
    && "error" in payload
    && typeof (payload as { error: unknown }).error
      === "string"
      ? (payload as { error: string }).error
      : "subscriptionUpdateFailed";

  return {
    ok:
      false,

    error:
      errorCode,
  };
}
