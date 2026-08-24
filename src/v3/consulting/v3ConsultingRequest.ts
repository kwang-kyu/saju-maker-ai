import type {
    SajuFactsPipelineInput,
  } from "../builders/sajuFactsPipelineBuilder.js";

  import type {
    HumanLifeContextReaderInput,
  } from "../readers/humanLifeContextReader.js";

  export type V3ConsultingCalendarType =
    | "solar"
    | "lunar";

  export type V3ConsultingSajuRequest =
    Omit<
      SajuFactsPipelineInput,
      "calendarType"
    > & {
      calendarType:
        V3ConsultingCalendarType;
    };

  export type V3HumanLifeContextRequest =
    Omit<
      HumanLifeContextReaderInput,
      "birthDate" | "referenceDate"
    >;

  export type V3ConsultingRequest = {
    sajuInput:
      V3ConsultingSajuRequest;

    humanLifeContextInput:
      V3HumanLifeContextRequest;

    question:
      string;
  };

  const ROOT_REQUEST_KEYS = [
    "sajuInput",
    "humanLifeContextInput",
    "question",
  ] as const;

  const SAJU_INPUT_KEYS = [
    "name",
    "birthDate",
    "birthTime",
    "gender",
    "calendarType",
    "referenceDate",
    "luckStartMethod",
  ] as const;

  const HUMAN_LIFE_CONTEXT_KEYS = [
    "maritalStatus",
    "hasChildren",
    "occupationStatus",
    "hasActiveBusiness",
    "financialResponsibility",
  ] as const;

  const GENDERS = [
    "male",
    "female",
  ] as const;

  const CALENDAR_TYPES = [
    "solar",
    "lunar",
  ] as const;

  const LUCK_START_METHODS = [
    "minuteBased",
  ] as const;

  const MARITAL_STATUSES = [
    "single",
    "married",
    "divorced",
    "widowed",
    "unknown",
  ] as const;

  const OCCUPATION_STATUSES = [
    "student",
    "employed",
    "selfEmployed",
    "businessOwner",
    "unemployed",
    "retired",
    "unknown",
  ] as const;

  const FINANCIAL_RESPONSIBILITIES = [
    "low",
    "medium",
    "high",
    "unknown",
  ] as const;

  type ParsedDate = {
    year: number;

    month: number;

    day: number;
  };

  function isRecord(
    value: unknown,
  ): value is Record<string, unknown> {
    return (
      typeof value === "object"
      && value !== null
      && !Array.isArray(value)
    );
  }

  function hasOnlyAllowedKeys(
    value: Record<string, unknown>,
    allowedKeys:
      readonly string[],
  ): boolean {
    return Object.keys(value).every(
      (key) =>
        allowedKeys.includes(key),
    );
  }

  function isNonEmptyString(
    value: unknown,
  ): value is string {
    return (
      typeof value === "string"
      && value.trim().length > 0
    );
  }

  function isAllowedValue<
    T extends string,
  >(
    value: unknown,
    allowedValues:
      readonly T[],
  ): value is T {
    return (
      typeof value === "string"
      && allowedValues.some(
        (allowedValue) =>
          allowedValue === value,
      )
    );
  }

  function isOptionalAllowedValue<
    T extends string,
  >(
    value: unknown,
    allowedValues:
      readonly T[],
  ): boolean {
    return (
      value === undefined
      || isAllowedValue(
        value,
        allowedValues,
      )
    );
  }

  function isOptionalNullableBoolean(
    value: unknown,
  ): boolean {
    return (
      value === undefined
      || value === null
      || typeof value === "boolean"
    );
  }

  function parseIsoDate(
    value: unknown,
  ): ParsedDate | null {
    if (typeof value !== "string") {
      return null;
    }

    const match =
      /^(\d{4})-(\d{2})-(\d{2})$/.exec(
        value,
      );

    if (!match) {
      return null;
    }

    return {
      year:
        Number(match[1]),

      month:
        Number(match[2]),

      day:
        Number(match[3]),
    };
  }

  function isValidSolarDate(
    value: unknown,
  ): value is string {
    const parsed =
      parseIsoDate(value);

    if (!parsed) {
      return false;
    }

    const date =
      new Date(
        Date.UTC(
          parsed.year,
          parsed.month - 1,
          parsed.day,
        ),
      );

    return (
      date.getUTCFullYear()
        === parsed.year
      && date.getUTCMonth() + 1
        === parsed.month
      && date.getUTCDate()
        === parsed.day
    );
  }

  function isValidLunarDate(
    value: unknown,
  ): value is string {
    const parsed =
      parseIsoDate(value);

    if (!parsed) {
      return false;
    }

    return (
      parsed.year >= 1900
      && parsed.month >= 1
      && parsed.month <= 12
      && parsed.day >= 1
      && parsed.day <= 30
    );
  }

  function isValidBirthDate(
    value: unknown,
    calendarType:
      V3ConsultingCalendarType,
  ): value is string {
    return calendarType === "solar"
      ? isValidSolarDate(value)
      : isValidLunarDate(value);
  }

  function isValidBirthTime(
    value: unknown,
  ): value is string {
    return (
      typeof value === "string"
      && /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.test(
        value,
      )
    );
  }

  function isSolarBirthDateNotAfterReferenceDate(
    birthDate: string,
    referenceDate: string,
  ): boolean {
    return birthDate <= referenceDate;
  }

  function isV3ConsultingSajuRequest(
    value: unknown,
  ): value is V3ConsultingSajuRequest {
    if (
      !isRecord(value)
      || !hasOnlyAllowedKeys(
        value,
        SAJU_INPUT_KEYS,
      )
    ) {
      return false;
    }

    if (
      !isAllowedValue(
        value.calendarType,
        CALENDAR_TYPES,
      )
    ) {
      return false;
    }

    if (
      !isNonEmptyString(value.name)
      || !isValidBirthDate(
        value.birthDate,
        value.calendarType,
      )
      || !isValidBirthTime(
        value.birthTime,
      )
      || !isAllowedValue(
        value.gender,
        GENDERS,
      )
      || !isValidSolarDate(
        value.referenceDate,
      )
      || !isAllowedValue(
        value.luckStartMethod,
        LUCK_START_METHODS,
      )
    ) {
      return false;
    }

    if (
      value.calendarType === "solar"
      && !isSolarBirthDateNotAfterReferenceDate(
        value.birthDate,
        value.referenceDate,
      )
    ) {
      return false;
    }

    return true;
  }

  export function isV3HumanLifeContextRequest(
    value: unknown,
  ): value is V3HumanLifeContextRequest {
    if (
      !isRecord(value)
      || !hasOnlyAllowedKeys(
        value,
        HUMAN_LIFE_CONTEXT_KEYS,
      )
    ) {
      return false;
    }

    return (
      isOptionalAllowedValue(
        value.maritalStatus,
        MARITAL_STATUSES,
      )
      && isOptionalNullableBoolean(
        value.hasChildren,
      )
      && isOptionalAllowedValue(
        value.occupationStatus,
        OCCUPATION_STATUSES,
      )
      && isOptionalNullableBoolean(
        value.hasActiveBusiness,
      )
      && isOptionalAllowedValue(
        value.financialResponsibility,
        FINANCIAL_RESPONSIBILITIES,
      )
    );
  }

  /**
   * HTTP로 들어온 값을 천운문 v3의 원천 상담 요청으로 검증한다.
   *
   * 외부 요청은 생년월일시와 현실 정보, 질문만 전달한다.
   * Calculator·Fact·Evidence·Reader 결과는 API 내부에서만 생성한다.
   */
  export function isV3ConsultingRequest(
    value: unknown,
  ): value is V3ConsultingRequest {
    if (
      !isRecord(value)
      || !hasOnlyAllowedKeys(
        value,
        ROOT_REQUEST_KEYS,
      )
    ) {
      return false;
    }

    return (
      isV3ConsultingSajuRequest(
        value.sajuInput,
      )
      && isV3HumanLifeContextRequest(
        value.humanLifeContextInput,
      )
      && isNonEmptyString(
        value.question,
      )
    );
  }
