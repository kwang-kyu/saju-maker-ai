/**
 * Production UAT Premium Grant admin allowlist.
 *
 * Server-only. Reads V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS.
 * Must never be mixed with Preview consulting entitlement allowlist.
 * Must never be imported into client bundle paths.
 */

import type {
  ConsultingSessionOwnerId,
} from "../consultingSessionOwnerId.js";

export const UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS_ENV =
  "V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS" as const;

export type UatPremiumGrantAdminEnvironment = {
  V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS?:
    string;
};

const CANONICAL_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parses comma-separated admin owner UUIDs.
 * Empty / whitespace-only / invalid UUID entries are ignored.
 * Duplicates collapse via Set. Values are lowercased.
 */
export function parseUatPremiumGrantAdminOwnerIds(
  raw:
    string | undefined,
): ReadonlySet<string> {
  if (
    raw
    === undefined
  ) {
    return new Set();
  }

  const ids =
    raw
      .split(
        ",",
      )
      .map(
        (
          entry,
        ) =>
          entry
            .trim()
            .toLowerCase(),
      )
      .filter(
        (
          entry,
        ) =>
          entry.length
          > 0
          && CANONICAL_UUID_PATTERN
            .test(
              entry,
            ),
      );

  return new Set(
    ids,
  );
}

/**
 * True when the authenticated ownerId is in
 * V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS.
 *
 * Missing / empty env → false (fail-closed).
 */
export function isUatPremiumGrantAdminAllowlisted(
  ownerId:
    ConsultingSessionOwnerId,
  environment:
    UatPremiumGrantAdminEnvironment | undefined,
): boolean {
  if (
    environment
    === undefined
  ) {
    return false;
  }

  const allowlist =
    parseUatPremiumGrantAdminOwnerIds(
      environment
        .V3_UAT_PREMIUM_GRANT_ADMIN_OWNER_IDS,
    );

  return allowlist.has(
    ownerId.value,
  );
}
