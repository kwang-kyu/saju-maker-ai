import {
    ConsultingSessionOwnerId,
    InvalidConsultingSessionOwnerIdError,
    parseConsultingSessionOwnerId,
  } from "./consultingSessionOwnerId";

  export type ConsultingSessionOwnerIdVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;

    passed:
      boolean;
  };

  function captureError(
    action:
      () => unknown,
  ): unknown {
    try {
      action();

      return null;
    } catch (
      error
    ) {
      return error;
    }
  }

  export function verifyConsultingSessionOwnerId():
    ConsultingSessionOwnerIdVerificationResult {
    const canonicalValue =
      "550e8400-e29b-41d4-a716-446655440000";

    const parsedValue =
      parseConsultingSessionOwnerId(
        canonicalValue,
      );

    const normalizedValue =
      parseConsultingSessionOwnerId(
        " 550E8400-E29B-41D4-A716-446655440000 ",
      );

    const emptyError =
      captureError(
        () =>
          parseConsultingSessionOwnerId(
            " ",
          ),
      );

    const malformedError =
      captureError(
        () =>
          parseConsultingSessionOwnerId(
            "550e8400-e29b-41d4-a716",
          ),
      );

    const nonHexError =
      captureError(
        () =>
          parseConsultingSessionOwnerId(
            "550e8400-e29b-41d4-a716-44665544zzzz",
          ),
      );

    const extraCharacterError =
      captureError(
        () =>
          parseConsultingSessionOwnerId(
            "550e8400-e29b-41d4-a716-4466554400000",
          ),
      );

    const checks = {
      canonicalUuidIsAccepted:
        parsedValue
        instanceof ConsultingSessionOwnerId,

      canonicalValueIsPreserved:
        parsedValue
          .value
        === canonicalValue,

      toStringReturnsCanonicalValue:
        parsedValue
          .toString()
        === canonicalValue,

      uppercaseUuidIsNormalized:
        normalizedValue
          .value
        === canonicalValue,

      surroundingWhitespaceIsRemoved:
        normalizedValue
          .toString()
        === canonicalValue,

      emptyValueIsRejected:
        emptyError
        instanceof InvalidConsultingSessionOwnerIdError,

      malformedUuidIsRejected:
        malformedError
        instanceof InvalidConsultingSessionOwnerIdError,

      nonHexUuidIsRejected:
        nonHexError
        instanceof InvalidConsultingSessionOwnerIdError,

      extraCharacterIsRejected:
        extraCharacterError
        instanceof InvalidConsultingSessionOwnerIdError,
    };

    return {
      checks,

      passed:
        Object
          .values(
            checks,
          )
          .every(
            Boolean,
          ),
    };
  }
