import {
    buildV3SajuCalculation,
  } from "../../builders/v3SajuCalculationBuilder.js";

  export type CounterpartCalendarType =
    | "solar"
    | "lunar";

  export type CounterpartSajuCalculationPrecision =
    | "dateOnly"
    | "full";

  export type CounterpartSajuCalculation = {
    precision:
      CounterpartSajuCalculationPrecision;

    source: {
      birthDate:
        string;

      birthTime:
        string | null;

      calendarType:
        CounterpartCalendarType;

      gender:
        string;
    };

    calculated: {
      solarDateIso:
        string;

      lunarDate:
        string;

      yearGanZhi:
        string;

      monthGanZhi:
        string;

      dayGanZhi:
        string;

      timeGanZhi:
        string | null;

      dayMaster:
        string;

      wood:
        number;

      fire:
        number;

      earth:
        number;

      metal:
        number;

      water:
        number;

      strongestElement:
        string;

      weakestElement:
        string;
    };
  };

  export type BuildCounterpartSajuCalculationInput = {
    birthDate:
      string;

    birthTime?:
      string | null;

    calendarType:
      string;

    gender:
      string;
  };

  function requireNonEmptyValue(
    value:
      string,
    fieldName:
      string,
  ): string {
    const normalizedValue =
      value.trim();

    if (
      normalizedValue.length
      === 0
    ) {
      throw new Error(
        `${fieldName} must not be empty.`,
      );
    }

    return normalizedValue;
  }

  function normalizeCalendarType(
    value:
      string,
  ): CounterpartCalendarType {
    const normalizedValue =
      requireNonEmptyValue(
        value,
        "counterpart.calendarType",
      )
        .toLocaleLowerCase()
        .replace(
          /\s+/g,
          "",
        );

    if (
      normalizedValue
      === "solar"
      || normalizedValue
        === "양력"
    ) {
      return "solar";
    }

    if (
      normalizedValue
      === "lunar"
      || normalizedValue
        === "음력"
    ) {
      return "lunar";
    }

    throw new Error(
      "counterpart.calendarType must be solar or lunar.",
    );
  }

  function normalizeOptionalBirthTime(
    value:
      string | null | undefined,
  ): string | null {
    if (
      value
      === undefined
      || value
      === null
      || value
        .trim()
        .length
      === 0
    ) {
      return null;
    }

    return value.trim();
  }

  /**
   * 확인된 상대방 출생정보로 원국을 계산한다.
   *
   * 출생시간이 없으면 날짜 계산을 위한 내부 기준시각만 사용하고,
   * 결과의 birthTime과 timeGanZhi는 반드시 null로 유지한다.
   * 따라서 확인되지 않은 시주가 상대방 근거로 전달되지 않는다.
   */
  export function buildCounterpartSajuCalculation(
    input:
      BuildCounterpartSajuCalculationInput,
  ): CounterpartSajuCalculation {
    const birthDate =
      requireNonEmptyValue(
        input.birthDate,
        "counterpart.birthDate",
      );

    const calendarType =
      normalizeCalendarType(
        input.calendarType,
      );

    const gender =
      requireNonEmptyValue(
        input.gender,
        "counterpart.gender",
      );

    const birthTime =
      normalizeOptionalBirthTime(
        input.birthTime,
      );

    const precision:
      CounterpartSajuCalculationPrecision =
        birthTime
          ? "full"
          : "dateOnly";

    const calculated =
      buildV3SajuCalculation({
        name:
          "counterpart",

        birthDate,

        birthTime:
          birthTime
          ?? "12:00",

        gender,

        calendarType,
      });

    return {
      precision,

      source: {
        birthDate,

        birthTime,

        calendarType,

        gender,
      },

      calculated: {
        solarDateIso:
          calculated
            .solarDateIso,

        lunarDate:
          calculated
            .lunarDate,

        yearGanZhi:
          calculated
            .yearGanZhi,

        monthGanZhi:
          calculated
            .monthGanZhi,

        dayGanZhi:
          calculated
            .dayGanZhi,

        timeGanZhi:
          birthTime
            ? calculated
                .timeGanZhi
            : null,

        dayMaster:
          calculated
            .dayMaster,

        wood:
          calculated
            .wood,

        fire:
          calculated
            .fire,

        earth:
          calculated
            .earth,

        metal:
          calculated
            .metal,

        water:
          calculated
            .water,

        strongestElement:
          calculated
            .strongestElement,

        weakestElement:
          calculated
            .weakestElement,
      },
    };
  }
