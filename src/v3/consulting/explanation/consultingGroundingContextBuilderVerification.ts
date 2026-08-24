import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture.js";
import {
  buildCounterpartSajuCalculation,
} from "../decision/counterpartSajuCalculationBuilder.js";
import {
  buildConsultingGroundingContext,
} from "./consultingGroundingContextBuilder.js";

export type ConsultingGroundingContextBuilderVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export function verifyConsultingGroundingContextBuilder():
  ConsultingGroundingContextBuilderVerificationResult {
  const regressionInput =
    buildDecisionEngineRegressionInput();

  const dateOnlyCounterpartSaju =
    buildCounterpartSajuCalculation({
      birthDate:
        "1967-04-10",

      calendarType:
        "solar",

      gender:
        "male",
    });

  const fullCounterpartSaju =
    buildCounterpartSajuCalculation({
      birthDate:
        "1967-04-10",

      birthTime:
        "14:30",

      calendarType:
        "solar",

      gender:
        "female",
    });

  const question =
    "새로 만난 사람과 결혼 궁합이 맞는지 알고 싶습니다.";

  const withoutCounterpartContext =
    buildConsultingGroundingContext({
      humanContext:
        regressionInput
          .humanContext,

      lifeContext:
        regressionInput
          .lifeContext,

      question,
    });

  const dateOnlyContext =
    buildConsultingGroundingContext({
      humanContext:
        regressionInput
          .humanContext,

      lifeContext:
        regressionInput
          .lifeContext,

      question,

      counterpartSaju:
        dateOnlyCounterpartSaju,
    });

  const fullCounterpartContext =
    buildConsultingGroundingContext({
      humanContext:
        regressionInput
          .humanContext,

      lifeContext:
        regressionInput
          .lifeContext,

      question,

      counterpartSaju:
        fullCounterpartSaju,
    });

  const serializedCounterpartSource =
    JSON.stringify(
      dateOnlyContext
        .counterpartSource,
    );

  const checks = {
    withoutCounterpartSourceIsNull:
      withoutCounterpartContext
        .counterpartSource
      === null,

    withoutCounterpartHasNoLegacyField:
      !(
        "counterpartSaju"
          in withoutCounterpartContext
      ),

    dateOnlySourceIncludesPrecision:
      dateOnlyContext
        .counterpartSource
        ?.precision
      === "dateOnly",

    dateOnlySourceIncludesBirthDate:
      dateOnlyContext
        .counterpartSource
        ?.birthDate
      === dateOnlyCounterpartSaju
        .source
        .birthDate,

    dateOnlySourceIncludesBirthTime:
      dateOnlyContext
        .counterpartSource
        ?.birthTime
      === null,

    dateOnlySourceIncludesCalendarType:
      dateOnlyContext
        .counterpartSource
        ?.calendarType
      === "solar",

    dateOnlySourceIncludesGender:
      dateOnlyContext
        .counterpartSource
        ?.gender
      === "male",

    fullSourceIncludesPrecision:
      fullCounterpartContext
        .counterpartSource
        ?.precision
      === "full",

    fullSourceIncludesBirthTime:
      fullCounterpartContext
        .counterpartSource
        ?.birthTime
      === "14:30",

    fullSourceIncludesGender:
      fullCounterpartContext
        .counterpartSource
        ?.gender
      === "female",

    dateOnlyContextHasNoLegacyField:
      !(
        "counterpartSaju"
          in dateOnlyContext
      ),

    serializedCounterpartSourceExcludesCalculated:
      !serializedCounterpartSource
        .includes(
          "\"calculated\"",
        ),

    serializedCounterpartSourceExcludesDayMaster:
      !serializedCounterpartSource
        .includes(
          "\"dayMaster\"",
        ),

    serializedCounterpartSourceExcludesStrongestElement:
      !serializedCounterpartSource
        .includes(
          "\"strongestElement\"",
        ),

    serializedCounterpartSourceExcludesWeakestElement:
      !serializedCounterpartSource
        .includes(
          "\"weakestElement\"",
        ),

    serializedCounterpartSourceExcludesYearGanZhi:
      !serializedCounterpartSource
        .includes(
          "\"yearGanZhi\"",
        ),

    serializedCounterpartSourceExcludesMonthGanZhi:
      !serializedCounterpartSource
        .includes(
          "\"monthGanZhi\"",
        ),

    serializedCounterpartSourceExcludesDayGanZhi:
      !serializedCounterpartSource
        .includes(
          "\"dayGanZhi\"",
        ),

    serializedCounterpartSourceExcludesTimeGanZhi:
      !serializedCounterpartSource
        .includes(
          "\"timeGanZhi\"",
        ),

    serializedCounterpartSourceExcludesElementCounts:
      !serializedCounterpartSource
        .includes(
          "\"wood\"",
        )
      && !serializedCounterpartSource
        .includes(
          "\"fire\"",
        )
      && !serializedCounterpartSource
        .includes(
          "\"earth\"",
        )
      && !serializedCounterpartSource
        .includes(
          "\"metal\"",
        )
      && !serializedCounterpartSource
        .includes(
          "\"water\"",
        ),

    counterpartSourceHasOnlyAllowedKeys:
      Object
        .keys(
          dateOnlyContext
            .counterpartSource
            ?? {},
        )
        .every(
          (key) =>
            key
            === "precision"
            || key
            === "birthDate"
            || key
            === "birthTime"
            || key
            === "calendarType"
            || key
            === "gender",
        ),
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
