import {
  buildV3LuckFlowCalculation,
  buildV3TargetIlun,
  buildV3WolunSegments,
} from "../../builders/luckFlowCalculationBuilder.js";
import {
  buildSajuFactsPipeline,
} from "../../builders/sajuFactsPipelineBuilder.js";
import {
  assessLifeFlowInterpretation,
} from "../decision/lifeFlowInterpretationAssessment.js";
import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture.js";
import {
  buildQuestionContext,
} from "./questionContextBuilder.js";
import {
  readQuestion,
} from "./questionReader.js";
import {
  isLifeFlowInterpretationQuestion,
} from "./lifeFlowInterpretationQuestionDetector.js";
import {
  resolveLifeFlowTarget,
} from "./lifeFlowTargetResolver.js";
import {
  buildConsultingClarification,
} from "../consultingClarificationBuilder.js";
import {
  runDecisionEngine,
} from "../decision/decisionEngine.js";
import {
  verifyLifeFlowInterpretationAssessment,
} from "../decision/lifeFlowInterpretationAssessmentVerification.js";
import {
  buildTargetPeriodLuckFlowForQuestion,
} from "../decision/targetPeriodLuckFlowBuilder.js";

const REFERENCE_DATE =
  "2025-08-16";

function recordCheck(
  checks:
    Record<string, boolean>,
  failures:
    string[],
  name:
    string,
  passed:
    boolean,
  actual:
    string,
): void {
  checks[name] =
    passed;

  if (
    !passed
  ) {
    failures.push(
      `${name}: ${actual}`,
    );
  }
}

function tryResolveLifeFlowTarget(
  normalizedQuestion:
    string,
  referenceDateIso:
    string,
): {
  ok:
    boolean;

  target?:
    ReturnType<
      typeof resolveLifeFlowTarget
    >;

  error?:
    string;
} {
  try {
    return {
      ok: true,

      target:
        resolveLifeFlowTarget(
          normalizedQuestion,
          referenceDateIso,
        ),
    };
  } catch (error) {
    return {
      ok: false,

      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}

const POSITIVE_QUESTIONS = [
  "나의 총운은 어떨까요?",
  "내 전체적인 운은 어떤가요?",
  "올해 총운을 봐주세요",
  "상반기운은 어떨까요?",
  "하반기 운세를 알려주세요",
  "2026년 12월 운세는 어떨까요?",
  "8월 달운세는 어떨까요?",
  "오늘의 운세는 어떨까요?",
  "내일 운은 어떤가요?",
] as const;

const NEGATIVE_QUESTIONS = [
  "8월에 가게를 열어도 될까요?",
  "올해 투자해도 될까요?",
  "언제 이직해야 하나요?",
  "이 사람과 결혼해야 하나요?",
] as const;

function buildPipeline() {
  return buildSajuFactsPipeline({
    name: "테스트",

    birthDate: "1990-05-15",

    birthTime: "14:30",

    gender: "male",

    calendarType: "solar",

    referenceDate:
      REFERENCE_DATE,

    luckStartMethod:
      "minuteBased",
  });
}

export function verifyLifeFlowInterpretationPath(): {
  passed: boolean;

  checks: Record<string, boolean>;

  failures: string[];
} {
  const failures: string[] = [];
  const checks: Record<string, boolean> = {};

  const regressionInput =
    buildDecisionEngineRegressionInput();

  const pipeline =
    buildPipeline();

  for (
    const question
    of POSITIVE_QUESTIONS
  ) {
    const normalized =
      question
        .trim()
        .replace(
          /\s+/g,
          " ",
        )
        .toLowerCase();

    const detected =
      isLifeFlowInterpretationQuestion(
        normalized,
      );

    checks[
      `detect:${question}`
    ] = detected;

    if (
      !detected
    ) {
      failures.push(
        `Positive question not detected: ${question}`,
      );
      continue;
    }

    const readerResult =
      readQuestion(
        regressionInput
          .humanContext,
        question,
      );

    const questionContext =
      buildQuestionContext(
        readerResult,
      );

    checks[
      `topic:${question}`
    ] =
      readerResult.topic
      === "lifeFlow";

    checks[
      `mode:${question}`
    ] =
      readerResult.analysisMode
      === "interpretation";

    checks[
      `target:${question}`
    ] =
      readerResult.decisionTarget
      === "none";

    checks[
      `req:${question}`
    ] =
      questionContext
        .requirements
        .lifeFlowInterpretationAnalysisRequired;

    const targetBuild =
      buildTargetPeriodLuckFlowForQuestion({
        sajuFacts:
          pipeline,

        normalizedQuestion:
          readerResult
            .normalizedQuestion,
      });

    const decisionResult =
      runDecisionEngine({
        ...regressionInput,

        selfSajuFacts:
          pipeline.facts,

        question:
          readerResult,

        questionContext,

        lifeFlowTarget:
          targetBuild
            ?.target,

        targetPeriodLuckFlow:
          targetBuild
            ?.fact
          ?? undefined,
      });

    checks[
      `verdict:${question}`
    ] =
      decisionResult.verdict
      === "interpreted";

    checks[
      `noConditions:${question}`
    ] =
      decisionResult
        .conditions
        .length
      === 0;

    checks[
      `noRisks:${question}`
    ] =
      decisionResult
        .risks
        .length
      === 0;

    const clarification =
      buildConsultingClarification({
        decisionTurnId:
          "test-turn",

        lifeContext:
          regressionInput
            .lifeContext,

        questionContext,

        decisionResult,
      });

    checks[
      `noConcreteTargetClarification:${question}`
    ] =
      !(
        clarification
          ?.items
          .some(
            (item) =>
              item.key
              === "concreteDecisionTarget",
          )
        ?? false
      );

    if (
      readerResult.topic
      !== "lifeFlow"
      || readerResult.analysisMode
      !== "interpretation"
      || decisionResult.verdict
      !== "interpreted"
    ) {
      failures.push(
        `Positive path failed for: ${question}`,
      );
    }
  }

  for (
    const question
    of NEGATIVE_QUESTIONS
  ) {
    const normalized =
      question
        .trim()
        .replace(
          /\s+/g,
          " ",
        )
        .toLowerCase();

    const detected =
      isLifeFlowInterpretationQuestion(
        normalized,
      );

    checks[
      `negative-not-detected:${question}`
    ] = !detected;

    if (
      detected
    ) {
      failures.push(
        `Negative question incorrectly detected as life flow: ${question}`,
      );
    }
  }

  const febSegments =
    buildV3WolunSegments(
      2026,
      2,
    );

  checks[
    "solarTermMonthHasMultipleSegments"
  ] =
    febSegments.length
    >= 2;

  const decTarget =
    resolveLifeFlowTarget(
      "2026년 12월 운세는 어떨까요?",
      REFERENCE_DATE,
    );

  checks[
    "explicitYearMonthTarget"
  ] =
    decTarget.scope
    === "month"
    && decTarget.targetYear
    === 2026
    && decTarget.targetMonth
    === 12;

  const monthOnlyTarget =
    resolveLifeFlowTarget(
      "12월 운세는 어떨까요?",
      REFERENCE_DATE,
    );

  checks[
    "implicitYearFromReference"
  ] =
    monthOnlyTarget.targetYear
    === 2025
    && monthOnlyTarget.yearExplicit
    === false;

  const calcA =
    buildV3LuckFlowCalculation({
      solarBirthDate:
        "1990-05-15",

      birthTime: "14:30",

      gender: "male",

      referenceDate:
        "2026-12-01",

      luckStartMethod:
        "minuteBased",
    });

  const calcB =
    buildV3LuckFlowCalculation({
      solarBirthDate:
        "1990-05-15",

      birthTime: "14:30",

      gender: "male",

      referenceDate:
        "2026-12-01",

      luckStartMethod:
        "minuteBased",
    });

  checks[
    "deterministicCalculation"
  ] =
    calcA.currentSeun.ganZhi
    === calcB.currentSeun.ganZhi;

  const monthFlowA =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipeline,

      normalizedQuestion:
        "2026년 12월 운세는 어떨까요?",
    });

  const monthFlowB =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipeline,

      normalizedQuestion:
        "2026년 11월 운세는 어떨까요?",
    });

  checks[
    "differentMonthDifferentFact"
  ] =
    monthFlowA
      ?.fact
      ?.wolunSegments[0]
      ?.ganZhi
    !== monthFlowB
      ?.fact
      ?.wolunSegments[0]
      ?.ganZhi;

  const dayFlow =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipeline,

      normalizedQuestion:
        "오늘의 운세는 어떨까요?",
    });

  checks[
    "dayScopeHasIlun"
  ] =
    dayFlow
      ?.fact
      ?.targetIlun
    !== null;

  let invalidDateRejected =
    false;

  try {
    resolveLifeFlowTarget(
      "2026년 13월 운세는 어떨까요?",
      REFERENCE_DATE,
    );
  } catch {
    invalidDateRejected =
      true;
  }

  checks[
    "invalidDateRejected"
  ] =
    invalidDateRejected;

  const koreanDayTarget =
    resolveLifeFlowTarget(
      "2026년 12월 15일 운세",
      REFERENCE_DATE,
    );

  recordCheck(
    checks,
    failures,
    "explicitKoreanDateResolvesDayScope",
    koreanDayTarget.scope
      === "day"
      && koreanDayTarget.targetYear
      === 2026
      && koreanDayTarget.targetMonth
      === 12
      && koreanDayTarget.targetDay
      === 15
      && koreanDayTarget.startDate
      === "2026-12-15"
      && koreanDayTarget.endDate
      === "2026-12-15",
    `scope=${koreanDayTarget.scope}, start=${koreanDayTarget.startDate}, end=${koreanDayTarget.endDate}, year=${koreanDayTarget.targetYear}, month=${koreanDayTarget.targetMonth}, day=${koreanDayTarget.targetDay}`,
  );

  const isoDayTarget =
    resolveLifeFlowTarget(
      "2026-12-15 운세",
      REFERENCE_DATE,
    );

  recordCheck(
    checks,
    failures,
    "explicitIsoDateResolvesDayScope",
    isoDayTarget.scope
      === "day"
      && isoDayTarget.startDate
      === "2026-12-15"
      && isoDayTarget.endDate
      === "2026-12-15",
    `scope=${isoDayTarget.scope}, start=${isoDayTarget.startDate}, end=${isoDayTarget.endDate}`,
  );

  const dotDayTarget =
    resolveLifeFlowTarget(
      "2026.12.15 운세",
      REFERENCE_DATE,
    );

  recordCheck(
    checks,
    failures,
    "explicitDotDateResolvesDayScope",
    dotDayTarget.scope
      === "day"
      && dotDayTarget.startDate
      === "2026-12-15"
      && dotDayTarget.endDate
      === "2026-12-15",
    `scope=${dotDayTarget.scope}, start=${dotDayTarget.startDate}, end=${dotDayTarget.endDate}`,
  );

  const omittedYearDayTarget =
    resolveLifeFlowTarget(
      "12월 15일 운세",
      REFERENCE_DATE,
    );

  recordCheck(
    checks,
    failures,
    "omittedYearDayUsesReferenceYear",
    omittedYearDayTarget.scope
      === "day"
      && omittedYearDayTarget.targetYear
      === 2025
      && omittedYearDayTarget.startDate
      === "2025-12-15"
      && omittedYearDayTarget.evidence.some(
        (item) =>
          item.includes("2025년"),
      ),
    `scope=${omittedYearDayTarget.scope}, year=${omittedYearDayTarget.targetYear}, start=${omittedYearDayTarget.startDate}, evidence=${omittedYearDayTarget.evidence.join(" | ")}`,
  );

  const invalidExplicitDay =
    tryResolveLifeFlowTarget(
      "2026년 2월 30일 운세",
      REFERENCE_DATE,
    );

  recordCheck(
    checks,
    failures,
    "invalidExplicitDateIsRejected",
    !invalidExplicitDay.ok,
    invalidExplicitDay.error
      ?? "no error thrown",
  );

  const decemberNextMonthTarget =
    resolveLifeFlowTarget(
      "다음 달 운세는 어떨까요?",
      "2026-12-15",
    );

  recordCheck(
    checks,
    failures,
    "decemberNextMonthRollsToNextYear",
    decemberNextMonthTarget.scope
      === "month"
      && decemberNextMonthTarget.targetYear
      === 2027
      && decemberNextMonthTarget.targetMonth
      === 1
      && decemberNextMonthTarget.startDate
      === "2027-01-01"
      && decemberNextMonthTarget.endDate
      === "2027-01-31",
    `scope=${decemberNextMonthTarget.scope}, year=${decemberNextMonthTarget.targetYear}, month=${decemberNextMonthTarget.targetMonth}, start=${decemberNextMonthTarget.startDate}, end=${decemberNextMonthTarget.endDate}`,
  );

  const firstHalfFlow =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipeline,

      normalizedQuestion:
        "상반기운은 어떨까요?",
    });

  const firstHalfMonths =
    new Set(
      firstHalfFlow
        ?.fact
        ?.wolunSegments
        .map(
          (segment) =>
            segment.targetMonth,
        )
        ?? [],
    );

  recordCheck(
    checks,
    failures,
    "firstHalfBuildsAllMonthlySegments",
    [1, 2, 3, 4, 5, 6].every(
      (month) =>
        firstHalfMonths.has(month),
    )
    && (
      firstHalfFlow
        ?.fact
        ?.wolunSegments
        .length
      ?? 0
    ) >= 6,
    `months=${Array.from(firstHalfMonths).sort().join(",")}, segmentCount=${firstHalfFlow?.fact?.wolunSegments.length ?? 0}`,
  );

  const secondHalfFlow =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipeline,

      normalizedQuestion:
        "하반기 운세를 알려주세요",
    });

  const secondHalfMonths =
    new Set(
      secondHalfFlow
        ?.fact
        ?.wolunSegments
        .map(
          (segment) =>
            segment.targetMonth,
        )
        ?? [],
    );

  recordCheck(
    checks,
    failures,
    "secondHalfBuildsAllMonthlySegments",
    [7, 8, 9, 10, 11, 12].every(
      (month) =>
        secondHalfMonths.has(month),
    )
    && (
      secondHalfFlow
        ?.fact
        ?.wolunSegments
        .length
      ?? 0
    ) >= 6,
    `months=${Array.from(secondHalfMonths).sort().join(",")}, segmentCount=${secondHalfFlow?.fact?.wolunSegments.length ?? 0}`,
  );

  const halfYearAssessment =
    assessLifeFlowInterpretation({
      humanContext:
        regressionInput.humanContext,

      selfSajuFacts:
        pipeline.facts,

      target:
        secondHalfFlow
          ?.target
        ?? resolveLifeFlowTarget(
          "하반기 운세를 알려주세요",
          REFERENCE_DATE,
        ),

      targetPeriodLuckFlow:
        secondHalfFlow
          ?.fact
        ?? null,
    });

  const halfYearGanZhiMonths =
    new Set(
      secondHalfFlow
        ?.fact
        ?.wolunSegments
        .map(
          (segment) =>
            `${segment.targetMonth}:${segment.ganZhi}`,
        )
        ?? [],
    );

  recordCheck(
    checks,
    failures,
    "halfYearEvidenceContainsMultipleMonthGanZhi",
    halfYearGanZhiMonths.size
      >= 3
      && halfYearAssessment.periodSegments.length
      >= 3,
    `distinctMonthGanZhi=${halfYearGanZhiMonths.size}, periodSegments=${halfYearAssessment.periodSegments.length}`,
  );

  let targetBeforeBirthRejected =
    false;
  let targetBeforeBirthError =
    "";

  try {
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipeline,

      normalizedQuestion:
        "1990-05-14 운세는 어떨까요?",
    });
  } catch (error) {
    targetBeforeBirthRejected =
      true;

    targetBeforeBirthError =
      error instanceof Error
        ? error.message
        : String(error);
  }

  recordCheck(
    checks,
    failures,
    "targetBeforeBirthIsRejected",
    targetBeforeBirthRejected
      && targetBeforeBirthError.includes(
        "solarBirthDate",
      ),
    targetBeforeBirthError
      || "no error thrown",
  );

  let invalidGenderRejected =
    false;
  let invalidGenderError =
    "";

  try {
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts: {
        ...pipeline,

        calculatedSaju: {
          ...pipeline.calculatedSaju,

          gender:
            "unknown",
        },
      },

      normalizedQuestion:
        "오늘의 운세는 어떨까요?",
    });
  } catch (error) {
    invalidGenderRejected =
      true;

    invalidGenderError =
      error instanceof Error
        ? error.message
        : String(error);
  }

  recordCheck(
    checks,
    failures,
    "invalidCalculatedGenderIsRejected",
    invalidGenderRejected
      && invalidGenderError.includes(
        "male or female",
      ),
    invalidGenderError
      || "no error thrown",
  );

  const resolverTarget =
    resolveLifeFlowTarget(
      "2026년 12월 운세는 어떨까요?",
      REFERENCE_DATE,
    );
  const resolverLimitationsBefore =
    resolverTarget.limitations.length;

  buildTargetPeriodLuckFlowForQuestion({
    sajuFacts:
      pipeline,

    normalizedQuestion:
      "2026년 12월 운세는 어떨까요?",
  });

  recordCheck(
    checks,
    failures,
    "targetResolverResultIsNotMutated",
    resolverTarget.limitations.length
      === resolverLimitationsBefore,
    `before=${resolverLimitationsBefore}, after=${resolverTarget.limitations.length}`,
  );

  const overallQuestion =
    "나의 총운은 어떨까요?";

  const overallReader =
    readQuestion(
      regressionInput.humanContext,
      overallQuestion,
    );

  const overallQuestionContext =
    buildQuestionContext(
      overallReader,
    );

  const overallTargetBuild =
    buildTargetPeriodLuckFlowForQuestion({
      sajuFacts:
        pipeline,

      normalizedQuestion:
        overallReader.normalizedQuestion,
    });

  const overallTarget =
    overallTargetBuild
      ?.target
    ?? resolveLifeFlowTarget(
      overallReader.normalizedQuestion,
      REFERENCE_DATE,
    );

  const overallDecision =
    runDecisionEngine({
      ...regressionInput,

      selfSajuFacts:
        pipeline.facts,

      question:
        overallReader,

      questionContext:
        overallQuestionContext,

      lifeFlowTarget:
        overallTarget,

      targetPeriodLuckFlow:
        overallTargetBuild
          ?.fact
        ?? undefined,
    });

  const overallClarification =
    buildConsultingClarification({
      decisionTurnId:
        "test-turn",

      lifeContext:
        regressionInput.lifeContext,

      questionContext:
        overallQuestionContext,

      decisionResult:
        overallDecision,
    });

  recordCheck(
    checks,
    failures,
    "overallScopeUsesReferenceFlowWithoutDecisionClarification",
    overallTarget.scope
      === "overall"
      && !overallTarget.ambiguity
        ?.needsClarification
      && overallDecision.verdict
      === "interpreted"
      && !overallClarification
        ?.items.some(
          (item) =>
            item.key
            === "concreteDecisionTarget",
        ),
    `scope=${overallTarget.scope}, needsClarification=${overallTarget.ambiguity?.needsClarification ?? false}, verdict=${overallDecision.verdict}, clarificationItems=${overallClarification?.items.map((item) => item.key).join(",") ?? "none"}`,
  );

  const expectedIlun =
    buildV3TargetIlun(
      REFERENCE_DATE,
    );

  recordCheck(
    checks,
    failures,
    "todayScopeBuildsExactIlun",
    dayFlow
      ?.fact
      ?.targetIlun
      ?.ganZhi
      === expectedIlun.ganZhi
      && dayFlow
        ?.fact
        ?.targetIlun
        ?.targetDate
      === REFERENCE_DATE,
    `expected=${expectedIlun.ganZhi}@${expectedIlun.targetDate}, actual=${dayFlow?.fact?.targetIlun?.ganZhi ?? "null"}@${dayFlow?.fact?.targetIlun?.targetDate ?? "null"}`,
  );

  const assessmentVerification =
    verifyLifeFlowInterpretationAssessment();

  Object.assign(
    checks,
    assessmentVerification.checks,
  );

  failures.push(
    ...assessmentVerification.failures,
  );

  const passed =
    failures.length
    === 0
    && Object.values(
      checks,
    ).every(Boolean);

  return {
    passed,
    checks,
    failures,
  };
}
