import {
  parseUatInviteCode,
  isValidUatInviteCode,
} from "./uatInviteCodeAllowlist.js";

export type UatInviteCodeAllowlistVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

const VALID_CODE =
  "uat-friends-invite-2026";

export function verifyUatInviteCodeAllowlist():
  UatInviteCodeAllowlistVerificationResult {
  const emptyUndefined =
    parseUatInviteCode(
      undefined,
    );

  const emptyString =
    parseUatInviteCode(
      "",
    );

  const whitespaceOnly =
    parseUatInviteCode(
      "   ",
    );

  const trimmed =
    parseUatInviteCode(
      `  ${VALID_CODE}  `,
    );

  const exact =
    parseUatInviteCode(
      VALID_CODE,
    );

  const validExact =
    isValidUatInviteCode(
      VALID_CODE,
      {
        V3_UAT_INVITE_CODE:
          VALID_CODE,
      },
    );

  const validTrimmedSubmitted =
    isValidUatInviteCode(
      `  ${VALID_CODE}  `,
      {
        V3_UAT_INVITE_CODE:
          VALID_CODE,
      },
    );

  const validTrimmedEnv =
    isValidUatInviteCode(
      VALID_CODE,
      {
        V3_UAT_INVITE_CODE:
          `  ${VALID_CODE}  `,
      },
    );

  const invalidWrong =
    isValidUatInviteCode(
      "wrong-code",
      {
        V3_UAT_INVITE_CODE:
          VALID_CODE,
      },
    );

  const invalidCase =
    isValidUatInviteCode(
      VALID_CODE.toUpperCase(),
      {
        V3_UAT_INVITE_CODE:
          VALID_CODE,
      },
    );

  const invalidEmpty =
    isValidUatInviteCode(
      "   ",
      {
        V3_UAT_INVITE_CODE:
          VALID_CODE,
      },
    );

  const invalidNonString =
    isValidUatInviteCode(
      123,
      {
        V3_UAT_INVITE_CODE:
          VALID_CODE,
      },
    );

  const missingEnv =
    isValidUatInviteCode(
      VALID_CODE,
      undefined,
    );

  const emptyEnv =
    isValidUatInviteCode(
      VALID_CODE,
      {
        V3_UAT_INVITE_CODE:
          "",
      },
    );

  const checks:
    Record<
      string,
      boolean
    > = {
      emptyUndefinedYieldsNull:
        emptyUndefined
        === null,

      emptyStringYieldsNull:
        emptyString
        === null,

      whitespaceOnlyYieldsNull:
        whitespaceOnly
        === null,

      trimmedParsed:
        trimmed
        === VALID_CODE,

      exactParsed:
        exact
        === VALID_CODE,

      validExactAccepted:
        validExact
        === true,

      validTrimmedSubmittedAccepted:
        validTrimmedSubmitted
        === true,

      validTrimmedEnvAccepted:
        validTrimmedEnv
        === true,

      invalidWrongRejected:
        invalidWrong
        === false,

      invalidCaseRejected:
        invalidCase
        === false,

      invalidEmptyRejected:
        invalidEmpty
        === false,

      invalidNonStringRejected:
        invalidNonString
        === false,

      missingEnvRejected:
        missingEnv
        === false,

      emptyEnvRejected:
        emptyEnv
        === false,
    };

  return {
    checks,

    passed:
      Object
        .values(
          checks,
        )
        .every(
          (
            value,
          ) =>
            value
            === true,
        ),
  };
}
