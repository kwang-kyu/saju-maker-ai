import type {
    SajuTargetPeriodLuckFlowFact,
    SajuWolunSegmentFact,
  } from "../../types/luckFlowFact.js";
  import type {
    SajuFacts,
  } from "../../types/sajuFacts.js";
  import type {
    QuestionContext,
  } from "../question/questionContext.js";
  import type {
    LifeFlowTarget,
  } from "../question/lifeFlowTarget.js";
  import {
    assessLifeFlowPeriodInteractions,
    buildPeriodFlowPillarsFromFact,
    interactionStrengthWeight,
    type LifeFlowPeriodInteraction,
  } from "./lifeFlowPeriodInteractionAssessment.js";

  export type TimingSearchWindowDirection =
    | "supportive"
    | "mixed"
    | "tension"
    | "indeterminate";

  export type TimingSearchWindow = {
    targetYear:
      number;

    targetMonth:
      number;

    startDate:
      string;

    endDate:
      string;

    ganZhi:
      string;

    tenGod:
      SajuWolunSegmentFact["tenGod"];

    element:
      SajuWolunSegmentFact["element"];

    score:
      number;

    supportiveScore:
      number;

    tensionScore:
      number;

    direction:
      TimingSearchWindowDirection;

    supportiveReasons:
      string[];

    cautionReasons:
      string[];

    evidenceKeys:
      string[];
  };

  export type TimingSearchAssessment = {
    required:
      boolean;

    available:
      boolean;

    searchedFromDate:
      string | null;

    searchedToDate:
      string | null;

    candidateWindows:
      TimingSearchWindow[];

    recommendedWindows:
      TimingSearchWindow[];

    cautionWindows:
      TimingSearchWindow[];

    limitations:
      string[];
  };

  export type TimingSearchAssessmentInput = {
    questionContext:
      QuestionContext;

    selfSajuFacts:
      SajuFacts | null;

    lifeFlowTarget?:
      LifeFlowTarget;

    targetPeriodLuckFlow?:
      SajuTargetPeriodLuckFlowFact;
  };

  function resolveInteractionScore(
    interaction:
      LifeFlowPeriodInteraction,
  ): {
    supportive:
      number;

    tension:
      number;
  } {
    const weight =
      interactionStrengthWeight(
        interaction.strength,
      );

    switch (
      interaction.type
    ) {
      case "combination":
        return {
          supportive:
            weight,

          tension:
            0,
        };

      case "clash":
      case "punishment":
      case "break":
      case "harm":
        return {
          supportive:
            0,

          tension:
            weight,
        };

      case "mixed":
        return {
          supportive:
            0,

          tension:
            0,
        };
    }
  }

  function resolveWindowDirection(
    supportiveScore:
      number,
    tensionScore:
      number,
  ): TimingSearchWindowDirection {
    if (
      supportiveScore === 0
      && tensionScore === 0
    ) {
      return "indeterminate";
    }

    if (
      supportiveScore > 0
      && tensionScore === 0
    ) {
      return "supportive";
    }

    if (
      tensionScore > 0
      && supportiveScore === 0
    ) {
      return "tension";
    }

    return "mixed";
  }

  function buildMonthTarget(
    baseTarget:
      LifeFlowTarget,
    segment:
      SajuWolunSegmentFact,
  ): LifeFlowTarget {
    return {
      scope:
        "month",

      referenceDate:
        baseTarget.referenceDate,

      targetYear:
        segment.targetYear,

      targetMonth:
        segment.targetMonth,

      targetDay:
        null,

      half:
        null,

      startDate:
        segment.startDate,

      endDate:
        segment.endDate,

      yearExplicit:
        baseTarget.yearExplicit,

      evidence: [
        ...baseTarget.evidence,
        `${segment.targetYear}년 ${segment.targetMonth}월을 시기 탐색 후보로 평가했다.`,
      ],

      limitations: [
        ...baseTarget.limitations,
      ],
    };
  }

  function buildMonthFact(
    baseFact:
      SajuTargetPeriodLuckFlowFact,
    segment:
      SajuWolunSegmentFact,
  ): SajuTargetPeriodLuckFlowFact {
    return {
      ...baseFact,

      targetStartDate:
        segment.startDate,

      targetEndDate:
        segment.endDate,

      wolunSegments: [
        segment,
      ],

      targetIlun:
        null,
    };
  }

  function buildWindowAssessment(
    selfSajuFacts:
      SajuFacts,
    baseTarget:
      LifeFlowTarget,
    baseFact:
      SajuTargetPeriodLuckFlowFact,
    segment:
      SajuWolunSegmentFact,
  ): TimingSearchWindow {
    const monthTarget =
      buildMonthTarget(
        baseTarget,
        segment,
      );

    const monthFact =
      buildMonthFact(
        baseFact,
        segment,
      );

    const periodPillars =
      buildPeriodFlowPillarsFromFact(
        monthFact,
        monthTarget,
      );

    const monthlyPillars =
      periodPillars.filter(
        (pillar) =>
          pillar.targetFlow
          === "wolun",
      );

    const interactions =
      assessLifeFlowPeriodInteractions(
        selfSajuFacts.pillars,
        monthlyPillars,
      );

    let supportiveScore =
      0;

    let tensionScore =
      0;

    const supportiveReasons:
      string[] = [];

    const cautionReasons:
      string[] = [];

    const evidenceKeys:
      string[] = [];

    for (
      const interaction
      of interactions
    ) {
      const score =
        resolveInteractionScore(
          interaction,
        );

      supportiveScore +=
        score.supportive;

      tensionScore +=
        score.tension;

      evidenceKeys.push(
        `${interaction.targetFlowKey}:${interaction.natalPillarPosition}:${interaction.type}`,
      );

      if (
        score.supportive
        > 0
      ) {
        supportiveReasons.push(
          interaction.description,
        );
      }

      if (
        score.tension
        > 0
      ) {
        cautionReasons.push(
          interaction.description,
        );
      }
    }

    const score =
      supportiveScore
      - tensionScore;

    return {
      targetYear:
        segment.targetYear,

      targetMonth:
        segment.targetMonth,

      startDate:
        segment.startDate,

      endDate:
        segment.endDate,

      ganZhi:
        segment.ganZhi,

      tenGod:
        segment.tenGod,

      element:
        segment.element,

      score,

      supportiveScore,

      tensionScore,

      direction:
        resolveWindowDirection(
          supportiveScore,
          tensionScore,
        ),

      supportiveReasons:
        Array.from(
          new Set(
            supportiveReasons,
          ),
        ),

      cautionReasons:
        Array.from(
          new Set(
            cautionReasons,
          ),
        ),

      evidenceKeys:
        Array.from(
          new Set(
            evidenceKeys,
          ),
        ),
    };
  }

  function windowOccursOnOrAfter(
    segment:
      SajuWolunSegmentFact,
    referenceDate:
      string,
  ): boolean {
    return (
      segment.endDate
      >= referenceDate
    );
  }

  function sortRecommendedWindows(
    windows:
      readonly TimingSearchWindow[],
  ): TimingSearchWindow[] {
    return [
      ...windows,
    ].sort(
      (
        left,
        right,
      ) => {
        if (
          right.score
          !== left.score
        ) {
          return (
            right.score
            - left.score
          );
        }

        if (
          right.supportiveScore
          !== left.supportiveScore
        ) {
          return (
            right.supportiveScore
            - left.supportiveScore
          );
        }

        return (
          left.targetMonth
          - right.targetMonth
        );
      },
    );
  }

  function sortCautionWindows(
    windows:
      readonly TimingSearchWindow[],
  ): TimingSearchWindow[] {
    return [
      ...windows,
    ].sort(
      (
        left,
        right,
      ) => {
        if (
          left.score
          !== right.score
        ) {
          return (
            left.score
            - right.score
          );
        }

        if (
          right.tensionScore
          !== left.tensionScore
        ) {
          return (
            right.tensionScore
            - left.tensionScore
          );
        }

        return (
          left.targetMonth
          - right.targetMonth
        );
      },
    );
  }

  export function assessTimingSearch(
    input:
      TimingSearchAssessmentInput,
  ): TimingSearchAssessment {
    const required =
      input
        .questionContext
        .requirements
        .timingSearchRequired;

    if (!required) {
      return {
        required:
          false,

        available:
          false,

        searchedFromDate:
          null,

        searchedToDate:
          null,

        candidateWindows:
          [],

        recommendedWindows:
          [],

        cautionWindows:
          [],

        limitations:
          [],
      };
    }

    if (
      !input.selfSajuFacts
      || !input.lifeFlowTarget
      || !input.targetPeriodLuckFlow
    ) {
      return {
        required:
          true,

        available:
          false,

        searchedFromDate:
          input.lifeFlowTarget
            ?.referenceDate
          ?? null,

        searchedToDate:
          input.lifeFlowTarget
            ?.endDate
          ?? null,

        candidateWindows:
          [],

        recommendedWindows:
          [],

        cautionWindows:
          [],

        limitations: [
          "시기 탐색에 필요한 원국 또는 대상 기간 운 자료가 충분하지 않다.",
        ],
      };
    }

    const referenceDate =
      input
        .lifeFlowTarget
        .referenceDate;

    const candidateSegments =
      input
        .targetPeriodLuckFlow
        .wolunSegments
        .filter(
          (segment) =>
            windowOccursOnOrAfter(
              segment,
              referenceDate,
            ),
        );

    if (
      candidateSegments.length
      === 0
    ) {
      return {
        required:
          true,

        available:
          false,

        searchedFromDate:
          referenceDate,

        searchedToDate:
          input
            .lifeFlowTarget
            .endDate,

        candidateWindows:
          [],

        recommendedWindows:
          [],

        cautionWindows:
          [],

        limitations: [
          "대상 기간 안에서 비교할 월운 구간을 찾지 못했다.",
        ],
      };
    }

    const candidateWindows =
      candidateSegments.map(
        (segment) =>
          buildWindowAssessment(
            input.selfSajuFacts!,
            input.lifeFlowTarget!,
            input.targetPeriodLuckFlow!,
            segment,
          ),
      );

    const recommendedWindows =
      sortRecommendedWindows(
        candidateWindows.filter(
          (window) =>
            window.score > 0,
        ),
      ).slice(
        0,
        3,
      );

    const cautionWindows =
      sortCautionWindows(
        candidateWindows.filter(
          (window) =>
            window.score < 0,
        ),
      ).slice(
        0,
        3,
      );

    const limitations:
      string[] = [];

    if (
      recommendedWindows.length
      === 0
    ) {
      limitations.push(
        "비교 대상 월 가운데 뚜렷하게 우세한 월이 확인되지 않아 특정 월을 확정 추천하지 않았다.",
      );
    }

    return {
      required:
        true,

      available:
        true,

      searchedFromDate:
        referenceDate,

      searchedToDate:
        input
          .lifeFlowTarget
          .endDate,

      candidateWindows,

      recommendedWindows,

      cautionWindows,

      limitations,
    };
  }
