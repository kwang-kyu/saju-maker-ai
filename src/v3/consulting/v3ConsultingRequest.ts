import type {
    HumanLifePhaseReaderInput,
  } from "../masterReader/types/humanLifePhaseEvidence";
  import type {
    MasterReaderInput,
  } from "../masterReader/types/masterReaderInput";
  import type {
    HumanLifeContextReaderInput,
  } from "../readers/humanLifeContextReader";

  export type V3HumanLifeContextRequest =
    Omit<
      HumanLifeContextReaderInput,
      "referenceDate"
    >;

  export type V3ConsultingRequest = {
    masterReaderInput:
      MasterReaderInput;

    lifePhaseInput:
      HumanLifePhaseReaderInput;

    humanLifeContextInput:
      V3HumanLifeContextRequest;

    question:
      string;
  };

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

  function isRecord(
    value: unknown,
  ): value is Record<string, unknown> {
    return (
      typeof value === "object"
      && value !== null
      && !Array.isArray(value)
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

  function isAllowedValue(
    value: unknown,
    allowedValues:
      readonly string[],
  ): boolean {
    return (
      typeof value === "string"
      && allowedValues.some(
        (allowedValue) =>
          allowedValue === value,
      )
    );
  }

  function isOptionalAllowedValue(
    value: unknown,
    allowedValues:
      readonly string[],
  ): boolean {
    return (
      value === undefined
      || isAllowedValue(
        value,
        allowedValues,
      )
    );
  }

  function isV3HumanLifeContextRequest(
    value: unknown,
  ): value is V3HumanLifeContextRequest {
    if (!isRecord(value)) {
      return false;
    }

    if (
      !("birthDate" in value)
      || (
        value.birthDate !== null
        && typeof value.birthDate
          !== "string"
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
      && !("referenceDate" in value)
    );
  }

  /**
   * HTTP를 통해 들어온 알 수 없는 값을
   * 천운문 v3 상담 요청의 전송 계약으로 검증한다.
   *
   * Master Reader와 Life Phase의 세부 도메인 검증은
   * 각 Reader가 담당하며, 여기서는 API 요청 봉투와
   * Human Life Context의 현실 입력을 검증한다.
   */
  export function isV3ConsultingRequest(
    value: unknown,
  ): value is V3ConsultingRequest {
    if (!isRecord(value)) {
      return false;
    }

    return (
      isRecord(
        value.masterReaderInput,
      )
      && isRecord(
        value.lifePhaseInput,
      )
      && isV3HumanLifeContextRequest(
        value.humanLifeContextInput,
      )
      && typeof value.question
        === "string"
      && value.question.trim()
        .length > 0
    );
  }