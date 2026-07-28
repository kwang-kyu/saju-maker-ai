export class InvalidConsultingSessionOwnerIdError
  extends Error {
  readonly value:
    string;

  constructor(
    value:
      string,
  ) {
    super(
      "Consulting session owner id must be a canonical UUID.",
    );

    this.name =
      "InvalidConsultingSessionOwnerIdError";

    this.value =
      value;
  }
}

const CANONICAL_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 검증을 통과한 Supabase Auth user.id Value Object다.
 *
 * 생성자가 private이므로 parse()를 통과하지 않은 문자열로
 * 세션 소유자 ID를 만들 수 없다.
 */
export class ConsultingSessionOwnerId {
  readonly value:
    string;

  private constructor(
    value:
      string,
  ) {
    this.value =
      value;
  }

  static parse(
    value:
      string,
  ): ConsultingSessionOwnerId {
    const normalizedValue =
      value
        .trim()
        .toLowerCase();

    if (
      !CANONICAL_UUID_PATTERN
        .test(
          normalizedValue,
        )
    ) {
      throw new InvalidConsultingSessionOwnerIdError(
        value,
      );
    }

    return new ConsultingSessionOwnerId(
      normalizedValue,
    );
  }

  toString():
    string {
    return this.value;
  }
}

/**
 * Supabase Auth user.id를 세션 소유자 ID로 검증한다.
 */
export function parseConsultingSessionOwnerId(
  value:
    string,
): ConsultingSessionOwnerId {
  return ConsultingSessionOwnerId.parse(
    value,
  );
}
