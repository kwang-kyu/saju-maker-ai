import {
  parseConsultingSessionOwnerId,
} from "../consultingSessionOwnerId.js";
import {
  isUatPremiumGrantAdminAllowlisted,
  parseUatPremiumGrantAdminOwnerIds,
} from "./uatPremiumGrantAdminAllowlist.js";

export type UatPremiumGrantAdminAllowlistVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

const ADMIN_ID =
  parseConsultingSessionOwnerId(
    "11111111-1111-4111-8111-111111111111",
  );

const OTHER_ID =
  parseConsultingSessionOwnerId(
    "22222222-2222-4222-8222-222222222222",
  );

export function verifyUatPremiumGrantAdminAllowlist():
  UatPremiumGrantAdminAllowlistVerificationResult {
  const emptyUndefined =
    parseUatPremiumGrantAdminOwnerIds(
      undefined,
    );

  const emptyString =
    parseUatPremiumGrantAdminOwnerIds(
      "",
    );

  const whitespaceOnly =
    parseUatPremiumGrantAdminOwnerIds(
      "  ,  , ",
    );

  const single =
    parseUatPremiumGrantAdminOwnerIds(
      ADMIN_ID.value,
    );

  const commaSeparated =
    parseUatPremiumGrantAdminOwnerIds(
      ` ${ADMIN_ID.value} , ${OTHER_ID.value} `,
    );

  const withInvalid =
    parseUatPremiumGrantAdminOwnerIds(
      `${ADMIN_ID.value},not-a-uuid,${OTHER_ID.value},123,`,
    );

  const withDuplicates =
    parseUatPremiumGrantAdminOwnerIds(
      `${ADMIN_ID.value},${ADMIN_ID.value},${OTHER_ID.value}`,
    );

  const allowlisted =
    isUatPremiumGrantAdminAllowlisted(
      ADMIN_ID,
      {
        V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
          ADMIN_ID.value,
      },
    );

  const notAllowlisted =
    isUatPremiumGrantAdminAllowlisted(
      OTHER_ID,
      {
        V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
          ADMIN_ID.value,
      },
    );

  const missingEnv =
    isUatPremiumGrantAdminAllowlisted(
      ADMIN_ID,
      undefined,
    );

  const emptyEnv =
    isUatPremiumGrantAdminAllowlisted(
      ADMIN_ID,
      {
        V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS:
          "",
      },
    );

  const checks:
    Record<
      string,
      boolean
    > = {
      emptyUndefinedYieldsEmptySet:
        emptyUndefined.size
        === 0,

      emptyStringYieldsEmptySet:
        emptyString.size
        === 0,

      whitespaceOnlyYieldsEmptySet:
        whitespaceOnly.size
        === 0,

      singleUuidParsed:
        single.size
        === 1
        && single.has(
          ADMIN_ID.value,
        ),

      commaSeparatedUuidsParsed:
        commaSeparated.size
        === 2
        && commaSeparated.has(
          ADMIN_ID.value,
        )
        && commaSeparated.has(
          OTHER_ID.value,
        ),

      invalidUuidIgnored:
        withInvalid.size
        === 2
        && withInvalid.has(
          ADMIN_ID.value,
        )
        && withInvalid.has(
          OTHER_ID.value,
        )
        && !withInvalid.has(
          "not-a-uuid",
        ),

      duplicateUuidCollapsed:
        withDuplicates.size
        === 2
        && withDuplicates.has(
          ADMIN_ID.value,
        )
        && withDuplicates.has(
          OTHER_ID.value,
        ),

      allowlistedOwnerAccepted:
        allowlisted
        === true,

      nonAllowlistedOwnerRejected:
        notAllowlisted
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
