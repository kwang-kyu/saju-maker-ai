/**
 * Production UAT invite code allowlist (single expected code).
 *
 * Server-only. Reads V3_UAT_INVITE_CODE.
 * Must never be mixed with Preview consulting entitlement allowlist
 * or admin grant allowlist.
 * Must never be imported into client bundle paths.
 */

export const UAT_INVITE_CODE_ENV =
  "V3_UAT_INVITE_CODE" as const;

export type UatInviteCodeEnvironment = {
  V3_UAT_INVITE_CODE?:
    string;
};

/**
 * Parses the configured invite code.
 * Undefined / whitespace-only → null (fail-closed).
 * Leading/trailing whitespace is trimmed for consistency
 * with other v3 env parsers.
 */
export function parseUatInviteCode(
  raw:
    string | undefined,
): string | null {
  if (
    raw
    === undefined
  ) {
    return null;
  }

  const trimmed =
    raw
      .trim();

  if (
    trimmed.length
    === 0
  ) {
    return null;
  }

  return trimmed;
}

/**
 * True when the submitted code matches V3_UAT_INVITE_CODE
 * after trim (exact, case-sensitive).
 *
 * Missing / empty env → false (fail-closed).
 * Never logs or returns the code value.
 */
export function isValidUatInviteCode(
  submitted:
    unknown,
  environment:
    UatInviteCodeEnvironment | undefined,
): boolean {
  if (
    environment
    === undefined
  ) {
    return false;
  }

  const expected =
    parseUatInviteCode(
      environment
        .V3_UAT_INVITE_CODE,
    );

  if (
    expected
    === null
  ) {
    return false;
  }

  if (
    typeof submitted
    !== "string"
  ) {
    return false;
  }

  const actual =
    submitted
      .trim();

  if (
    actual.length
    === 0
  ) {
    return false;
  }

  return actual
    === expected;
}
