import {
  buildInitialConsultingExecution,
} from "../initialConsultingExecutionBuilder.js";
import {
  createSourceRequest,
} from "../initialConsultingSessionBuilderVerification.js";
import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture.js";
import {
  buildCounterpartSajuCalculation,
} from "../decision/counterpartSajuCalculationBuilder.js";
import {
  buildConsultingGroundingContext,
} from "./consultingGroundingContextBuilder.js";

const FORBIDDEN_READER_JSON_KEYS = [
  "humanIdentity",
  "readerEvidence",
  "masterReaderInput",
  "lifePhaseInput",
  "humanSummary",
  "identitySummary",
  "lifeDriver",
  "survivalStyle",
  "repeatedPattern",
  "capacity",
  "money",
  "career",
  "relationship",
  "health",
  "blessing",
  "destiny",
] as const;

const FORBIDDEN_DECISION_JSON_KEYS = [
  "verdict",
  "finalDecision",
  "conditions",
  "risks",
  "recommendedDirection",
  "prohibitedDirection",
  "questionContext",
  "explanationFocus",
  "explanationOrder",
] as const;

function serializedExcludesQuotedKeys(
  serialized:
    string,
  keys:
    readonly string[],
): boolean {
  return keys.every(
    (key) =>
      !serialized.includes(
        `"${key}"`,
      ),
  );
}

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

  const fullExecution =
    buildInitialConsultingExecution(
      createSourceRequest(),
    );

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

  const fullDumpInputContext =
    buildConsultingGroundingContext({
      sajuFacts:
        fullExecution
          .humanDestinyPipeline
          .sajuFactsPipeline,

      readerEvidence:
        fullExecution
          .humanDestinyPipeline
          .evidenceBundle,

      humanContext:
        fullExecution
          .humanDestinyPipeline
          .humanContext,

      lifeContext:
        fullExecution
          .lifeContext,

      question,

      counterpartSaju:
        dateOnlyCounterpartSaju,
    });

  const serializedFullDumpInputContext =
    JSON.stringify(
      fullDumpInputContext,
    );

  const fullDumpInputContextKeys =
    Object.keys(
      fullDumpInputContext,
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

    sourceLockedIsPreserved:
      fullDumpInputContext
        .sourceLocked
      === true,

    fullInputKeepsMinimumSajuFacts:
      fullDumpInputContext
        .sajuFacts
      === fullExecution
        .humanDestinyPipeline
        .sajuFactsPipeline
        .facts,

    fullInputKeepsCurrentLuckPhase:
      fullDumpInputContext
        .currentLuckPhase
      === fullExecution
        .humanDestinyPipeline
        .humanContext
        .currentPhase,

    fullInputKeepsCurrentLifeReality:
      fullDumpInputContext
        .currentLifeReality
      === fullExecution
        .lifeContext,

    fullInputKeepsCounterpartSource:
      fullDumpInputContext
        .counterpartSource
        ?.precision
      === "dateOnly"
      && fullDumpInputContext
        .counterpartSource
        ?.birthDate
      === dateOnlyCounterpartSaju
        .source
        .birthDate,

    groundingOmitsHumanIdentityField:
      !(
        "humanIdentity"
          in fullDumpInputContext
      ),

    groundingOmitsReaderEvidenceField:
      !(
        "readerEvidence"
          in fullDumpInputContext
      ),

    groundingOmitsDecisionFields:
      FORBIDDEN_DECISION_JSON_KEYS
        .every(
          (key) =>
            !(
              key
                in fullDumpInputContext
            ),
        ),

    serializedFullContextExcludesCalculated:
      !serializedFullDumpInputContext
        .includes(
          "\"calculated\"",
        ),

    serializedFullContextExcludesHumanIdentityExplanation:
      serializedExcludesQuotedKeys(
        serializedFullDumpInputContext,
        [
          "humanIdentity",
          "humanSummary",
          "identitySummary",
        ],
      ),

    serializedFullContextExcludesReaderEvidence:
      serializedExcludesQuotedKeys(
        serializedFullDumpInputContext,
        [
          "readerEvidence",
          "masterReaderInput",
          "lifePhaseInput",
        ],
      ),

    serializedFullContextExcludesMasterReaderDomains:
      serializedExcludesQuotedKeys(
        serializedFullDumpInputContext,
        [
          "lifeDriver",
          "survivalStyle",
          "repeatedPattern",
          "capacity",
          "money",
          "career",
          "relationship",
          "health",
          "blessing",
          "destiny",
        ],
      ),

    serializedFullContextExcludesAllForbiddenReaderKeys:
      serializedExcludesQuotedKeys(
        serializedFullDumpInputContext,
        FORBIDDEN_READER_JSON_KEYS,
      ),

    groundingKeysArePersonLevelFactsOnly:
      fullDumpInputContextKeys
        .every(
          (key) =>
            key
            === "sourceLocked"
            || key
            === "originalQuestion"
            || key
            === "sajuFacts"
            || key
            === "counterpartSource"
            || key
            === "currentLuckPhase"
            || key
            === "currentLifeReality",
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
