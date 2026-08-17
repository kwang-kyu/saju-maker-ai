import type {
  LifeFlowHalf,
  LifeFlowScope,
  LifeFlowTarget,
} from "./lifeFlowTarget";
import {
  hasOverallFortuneExpression,
  hasPeriodExpression,
  hasFortuneExpression,
  hasInterpretationRequest,
} from "./lifeFlowInterpretationQuestionDetector";

type ParsedDate = {
  year:
    number;

  month:
    number;

  day:
    number;
};

function isLeapYear(
  year:
    number,
): boolean {
  return (
    year % 400 === 0
    || (
      year % 4 === 0
      && year % 100 !== 0
    )
  );
}

function getDaysInMonth(
  year:
    number,
  month:
    number,
): number {
  const days = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return days[month - 1] ?? 0;
}

function parseIsoDate(
  value:
    string,
  fieldName:
    string,
): ParsedDate {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value,
    );

  if (!match) {
    throw new Error(
      `${fieldName} must use YYYY-MM-DD format.`,
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const daysInMonth =
    getDaysInMonth(
      year,
      month,
    );

  if (
    year < 1
    || month < 1
    || month > 12
    || day < 1
    || day > daysInMonth
  ) {
    throw new Error(
      `${fieldName} must be a valid calendar date.`,
    );
  }

  return {
    year,
    month,
    day,
  };
}

function formatIsoDate(
  date:
    ParsedDate,
): string {
  return [
    String(date.year),
    String(date.month).padStart(2, "0"),
    String(date.day).padStart(2, "0"),
  ].join("-");
}

function addDays(
  date:
    ParsedDate,
  days:
    number,
): ParsedDate {
  const utc =
    Date.UTC(
      date.year,
      date.month - 1,
      date.day + days,
    );

  const next =
    new Date(utc);

  return {
    year:
      next.getUTCFullYear(),

    month:
      next.getUTCMonth() + 1,

    day:
      next.getUTCDate(),
  };
}

function addMonths(
  date:
    ParsedDate,
  months:
    number,
): ParsedDate {
  const totalMonths =
    date.year * 12
    + (date.month - 1)
    + months;

  const year =
    Math.floor(
      totalMonths / 12,
    );

  const month =
    (totalMonths % 12) + 1;

  const day =
    Math.min(
      date.day,
      getDaysInMonth(
        year,
        month,
      ),
    );

  return {
    year,
    month,
    day,
  };
}

function hasExplicitDayDate(
  normalizedQuestion:
    string,
): boolean {
  if (
    /(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/.test(
      normalizedQuestion,
    )
  ) {
    return true;
  }

  if (
    /(\d{1,2})\s*월\s*(\d{1,2})\s*일/.test(
      normalizedQuestion,
    )
  ) {
    return true;
  }

  if (
    /(\d{4})-(\d{2})-(\d{2})/.test(
      normalizedQuestion,
    )
  ) {
    return true;
  }

  if (
    /(\d{4})\.(\d{2})\.(\d{2})/.test(
      normalizedQuestion,
    )
  ) {
    return true;
  }

  return false;
}

function detectScope(
  normalizedQuestion:
    string,
): LifeFlowScope | null {
  if (
    hasExplicitDayDate(
      normalizedQuestion,
    )
  ) {
    return "day";
  }

  if (
    /(?:오늘|내일|모레)\s*(?:의\s*)?(?:운|운세|일운)/.test(
      normalizedQuestion,
    )
    || /(?:오늘|내일|모레)/.test(
      normalizedQuestion,
    )
    && hasFortuneExpression(
      normalizedQuestion,
    )
  ) {
    return "day";
  }

  if (
    /(?:상반기|하반기)/.test(
      normalizedQuestion,
    )
  ) {
    return "halfYear";
  }

  if (
    /(?:이번\s*달|이번달|다음\s*달|지난달|\d{1,2}\s*월|\d{4}\s*년\s*\d{1,2}\s*월|달운|월운)/.test(
      normalizedQuestion,
    )
  ) {
    return "month";
  }

  if (
    /(?:올해|금년|내년|작년|\d{4}\s*년|연운|세운|년\s*운)/.test(
      normalizedQuestion,
    )
    && !/(?:\d{1,2}\s*월)/.test(
      normalizedQuestion,
    )
  ) {
    return "year";
  }

  if (
    hasOverallFortuneExpression(
      normalizedQuestion,
    )
  ) {
    return "overall";
  }

  if (
    hasFortuneExpression(
      normalizedQuestion,
    )
    && !hasPeriodExpression(
      normalizedQuestion,
    )
  ) {
    return "overall";
  }

  return null;
}

function resolveRelativeDay(
  reference:
    ParsedDate,
  normalizedQuestion:
    string,
): ParsedDate {
  if (
    normalizedQuestion.includes(
      "내일",
    )
  ) {
    return addDays(
      reference,
      1,
    );
  }

  if (
    normalizedQuestion.includes(
      "모레",
    )
  ) {
    return addDays(
      reference,
      2,
    );
  }

  return reference;
}

function resolveExplicitDayDate(
  reference:
    ParsedDate,
  normalizedQuestion:
    string,
): {
  date:
    ParsedDate;

  yearExplicit:
    boolean;

  evidence:
    string[];
} {
  const koreanWithYearMatch =
    normalizedQuestion.match(
      /(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/,
    );

  if (koreanWithYearMatch) {
    const year =
      Number(
        koreanWithYearMatch[1],
      );
    const month =
      Number(
        koreanWithYearMatch[2],
      );
    const day =
      Number(
        koreanWithYearMatch[3],
      );

    parseIsoDate(
      formatIsoDate({
        year,
        month,
        day,
      }),
      "explicitDayDate",
    );

    return {
      date: {
        year,
        month,
        day,
      },

      yearExplicit:
        true,

      evidence: [
        `${year}년 ${month}월 ${day}일을 질문에서 명시했다.`,
      ],
    };
  }

  const koreanMonthDayMatch =
    normalizedQuestion.match(
      /(\d{1,2})\s*월\s*(\d{1,2})\s*일/,
    );

  if (koreanMonthDayMatch) {
    const month =
      Number(
        koreanMonthDayMatch[1],
      );
    const day =
      Number(
        koreanMonthDayMatch[2],
      );
    const year =
      reference.year;

    parseIsoDate(
      formatIsoDate({
        year,
        month,
        day,
      }),
      "explicitDayDate",
    );

    return {
      date: {
        year,
        month,
        day,
      },

      yearExplicit:
        false,

      evidence: [
        `연도가 없는 ${month}월 ${day}일 질문에 referenceDate ${formatIsoDate(reference)} 기준 ${year}년을 적용했다.`,
      ],
    };
  }

  const isoMatch =
    normalizedQuestion.match(
      /(\d{4})-(\d{2})-(\d{2})/,
    );

  if (isoMatch) {
    const date =
      parseIsoDate(
        `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`,
        "explicitDayDate",
      );

    return {
      date,

      yearExplicit:
        true,

      evidence: [
        `${formatIsoDate(date)} ISO 날짜를 질문에서 명시했다.`,
      ],
    };
  }

  const dotMatch =
    normalizedQuestion.match(
      /(\d{4})\.(\d{2})\.(\d{2})/,
    );

  if (dotMatch) {
    const date =
      parseIsoDate(
        `${dotMatch[1]}-${dotMatch[2]}-${dotMatch[3]}`,
        "explicitDayDate",
      );

    return {
      date,

      yearExplicit:
        true,

      evidence: [
        `${formatIsoDate(date)} 날짜를 질문에서 명시했다.`,
      ],
    };
  }

  throw new Error(
    "Explicit day date could not be resolved.",
  );
}

function resolveTargetYear(
  reference:
    ParsedDate,
  normalizedQuestion:
    string,
): {
  year:
    number;

  yearExplicit:
    boolean;

  evidence:
    string[];
} {
  const explicitYearMatch =
    normalizedQuestion.match(
      /(\d{4})\s*년/,
    );

  if (explicitYearMatch) {
    return {
      year:
        Number(
          explicitYearMatch[1],
        ),

      yearExplicit:
        true,

      evidence: [
        `${explicitYearMatch[1]}년을 질문에서 명시했다.`,
      ],
    };
  }

  if (
    normalizedQuestion.includes(
      "내년",
    )
  ) {
    return {
      year:
        reference.year + 1,

      yearExplicit:
        false,

      evidence: [
        `내년을 referenceDate ${formatIsoDate(reference)} 기준 ${reference.year + 1}년으로 해석했다.`,
      ],
    };
  }

  if (
    normalizedQuestion.includes(
      "작년",
    )
  ) {
    return {
      year:
        reference.year - 1,

      yearExplicit:
        false,

      evidence: [
        `작년을 referenceDate ${formatIsoDate(reference)} 기준 ${reference.year - 1}년으로 해석했다.`,
      ],
    };
  }

  return {
    year:
      reference.year,

    yearExplicit:
      false,

    evidence: [
      `연도가 명시되지 않아 referenceDate ${formatIsoDate(reference)}의 ${reference.year}년을 적용했다.`,
    ],
  };
}

function resolveTargetYearMonth(
  reference:
    ParsedDate,
  normalizedQuestion:
    string,
): {
  year:
    number;

  month:
    number;

  yearExplicit:
    boolean;

  evidence:
    string[];
} {
  const explicitYearMonthMatch =
    normalizedQuestion.match(
      /(\d{4})\s*년\s*(\d{1,2})\s*월/,
    );

  if (explicitYearMonthMatch) {
    const year =
      Number(
        explicitYearMonthMatch[1],
      );
    const month =
      Number(
        explicitYearMonthMatch[2],
      );

    if (
      month < 1
      || month > 12
    ) {
      throw new Error(
        "Target month must be between 1 and 12.",
      );
    }

    return {
      year,
      month,

      yearExplicit:
        true,

      evidence: [
        `${year}년 ${month}월을 질문에서 명시했다.`,
      ],
    };
  }

  const explicitMonthMatch =
    normalizedQuestion.match(
      /(\d{1,2})\s*월/,
    );

  if (
    explicitMonthMatch
    && !/(\d{1,2})\s*월\s*(\d{1,2})\s*일/.test(
      normalizedQuestion,
    )
  ) {
    const month =
      Number(
        explicitMonthMatch[1],
      );

    if (
      month < 1
      || month > 12
    ) {
      throw new Error(
        "Target month must be between 1 and 12.",
      );
    }

    return {
      year:
        reference.year,

      month,

      yearExplicit:
        false,

      evidence: [
        `${month}월을 질문에서 명시했다.`,
        `연도가 없는 ${month}월 질문에 referenceDate ${formatIsoDate(reference)} 기준 ${reference.year}년을 적용했다.`,
      ],
    };
  }

  if (
    normalizedQuestion.includes(
      "다음 달",
    )
  ) {
    const nextMonth =
      addMonths(
        reference,
        1,
      );

    return {
      year:
        nextMonth.year,

      month:
        nextMonth.month,

      yearExplicit:
        false,

      evidence: [
        `다음 달을 referenceDate ${formatIsoDate(reference)} 기준 ${nextMonth.year}년 ${nextMonth.month}월로 해석했다.`,
      ],
    };
  }

  if (
    normalizedQuestion.includes(
      "지난달",
    )
  ) {
    const previousMonth =
      addMonths(
        reference,
        -1,
      );

    return {
      year:
        previousMonth.year,

      month:
        previousMonth.month,

      yearExplicit:
        false,

      evidence: [
        `지난달을 referenceDate ${formatIsoDate(reference)} 기준 ${previousMonth.year}년 ${previousMonth.month}월로 해석했다.`,
      ],
    };
  }

  if (
    /(?:이번\s*달|이번달)/.test(
      normalizedQuestion,
    )
  ) {
    return {
      year:
        reference.year,

      month:
        reference.month,

      yearExplicit:
        false,

      evidence: [
        `이번 달을 referenceDate ${formatIsoDate(reference)} 기준 ${reference.year}년 ${reference.month}월로 해석했다.`,
      ],
    };
  }

  return {
    year:
      reference.year,

    month:
      reference.month,

    yearExplicit:
      false,

    evidence: [
      `월이 명시되지 않아 referenceDate ${formatIsoDate(reference)}의 ${reference.year}년 ${reference.month}월을 적용했다.`,
    ],
  };
}

function resolveHalf(
  normalizedQuestion:
    string,
): LifeFlowHalf {
  if (
    normalizedQuestion.includes(
      "하반기",
    )
  ) {
    return "second";
  }

  return "first";
}

function buildYearRange(
  year:
    number,
): {
  startDate:
    string;

  endDate:
    string;
} {
  return {
    startDate:
      `${year}-01-01`,

    endDate:
      `${year}-12-31`,
  };
}

function buildHalfYearRange(
  year:
    number,
  half:
    LifeFlowHalf,
): {
  startDate:
    string;

  endDate:
    string;
} {
  if (half === "first") {
    return {
      startDate:
        `${year}-01-01`,

      endDate:
        `${year}-06-30`,
    };
  }

  return {
    startDate:
      `${year}-07-01`,

    endDate:
      `${year}-12-31`,
  };
}

function buildMonthRange(
  year:
    number,
  month:
    number,
): {
  startDate:
    string;

  endDate:
    string;
} {
  const lastDay =
    getDaysInMonth(
      year,
      month,
    );

  return {
    startDate:
      `${year}-${String(month).padStart(2, "0")}-01`,

    endDate:
      `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

/**
 * 상담 referenceDate를 기준으로 질문 속 기간을 구조화한다.
 *
 * 시스템 현재시각을 사용하지 않으며,
 * 잘못된 날짜는 조용히 보정하지 않는다.
 */
export function resolveLifeFlowTarget(
  normalizedQuestion:
    string,
  referenceDateIso:
    string,
): LifeFlowTarget {
  const reference =
    parseIsoDate(
      referenceDateIso,
      "referenceDate",
    );

  const scope =
    detectScope(
      normalizedQuestion,
    );

  const evidence: string[] = [
    `referenceDate ${referenceDateIso}를 기준으로 기간을 해석했다.`,
  ];

  if (
    scope === null
  ) {
    if (
      hasFortuneExpression(
        normalizedQuestion,
      )
      || hasInterpretationRequest(
        normalizedQuestion,
      )
    ) {
      return {
        scope:
          "overall",

        referenceDate:
          referenceDateIso,

        targetYear:
          null,

        targetMonth:
          null,

        targetDay:
          null,

        half:
          null,

        startDate:
          referenceDateIso,

        endDate:
          referenceDateIso,

        yearExplicit:
          false,

        evidence,

        ambiguity: {
          needsClarification:
            true,

          reason:
            "어느 연도 또는 기간의 운을 볼지 확인되지 않았다.",
        },

        limitations:
          [],
      };
    }

    throw new Error(
      "Life flow target scope could not be resolved.",
    );
  }

  if (scope === "overall") {
    return {
      scope,

      referenceDate:
        referenceDateIso,

      targetYear:
        null,

      targetMonth:
        null,

      targetDay:
        null,

      half:
        null,

      startDate:
        referenceDateIso,

      endDate:
        referenceDateIso,

      yearExplicit:
        false,

      evidence: [
        ...evidence,
        "총운·전체 운 해석으로 overall scope를 적용했다.",
      ],

      limitations:
        [],
    };
  }

  if (scope === "day") {
    let targetDayDate:
      ParsedDate;
    let yearExplicit =
      false;
    const dayEvidence:
      string[] = [];

    if (
      hasExplicitDayDate(
        normalizedQuestion,
      )
    ) {
      const explicitDay =
        resolveExplicitDayDate(
          reference,
          normalizedQuestion,
        );

      targetDayDate =
        explicitDay.date;

      yearExplicit =
        explicitDay.yearExplicit;

      dayEvidence.push(
        ...explicitDay.evidence,
      );
    } else {
      targetDayDate =
        resolveRelativeDay(
          reference,
          normalizedQuestion,
        );

      dayEvidence.push(
        `${formatIsoDate(targetDayDate)} 일운 해석 대상으로 적용했다.`,
      );
    }

    const startDate =
      formatIsoDate(
        targetDayDate,
      );

    return {
      scope,

      referenceDate:
        referenceDateIso,

      targetYear:
        targetDayDate.year,

      targetMonth:
        targetDayDate.month,

      targetDay:
        targetDayDate.day,

      half:
        null,

      startDate,

      endDate:
        startDate,

      yearExplicit,

      evidence: [
        ...evidence,
        ...dayEvidence,
      ],

      limitations:
        [],
    };
  }

  const {
    year: targetYear,
    yearExplicit,
    evidence: yearEvidence,
  } = resolveTargetYear(
    reference,
    normalizedQuestion,
  );

  evidence.push(
    ...yearEvidence,
  );

  if (scope === "year") {
    const range =
      buildYearRange(
        targetYear,
      );

    return {
      scope,

      referenceDate:
        referenceDateIso,

      targetYear,

      targetMonth:
        null,

      targetDay:
        null,

      half:
        null,

      startDate:
        range.startDate,

      endDate:
        range.endDate,

      yearExplicit,

      evidence: [
        ...evidence,
        `${targetYear}년 연운 해석 대상으로 적용했다.`,
      ],

      limitations:
        [],
    };
  }

  if (scope === "halfYear") {
    const half =
      resolveHalf(
        normalizedQuestion,
      );

    const range =
      buildHalfYearRange(
        targetYear,
        half,
      );

    return {
      scope,

      referenceDate:
        referenceDateIso,

      targetYear,

      targetMonth:
        null,

      targetDay:
        null,

      half,

      startDate:
        range.startDate,

      endDate:
        range.endDate,

      yearExplicit,

      evidence: [
        ...evidence,
        `${targetYear}년 ${half === "first" ? "상반기" : "하반기"} 운 해석 대상으로 적용했다.`,
      ],

      limitations:
        [],
    };
  }

  if (scope === "month") {
    const {
      year: monthTargetYear,
      month: targetMonth,
      yearExplicit: monthYearExplicit,
      evidence: yearMonthEvidence,
    } = resolveTargetYearMonth(
      reference,
      normalizedQuestion,
    );

    evidence.push(
      ...yearMonthEvidence,
    );

    const range =
      buildMonthRange(
        monthTargetYear,
        targetMonth,
      );

    parseIsoDate(
      range.startDate,
      "startDate",
    );

    parseIsoDate(
      range.endDate,
      "endDate",
    );

    return {
      scope,

      referenceDate:
        referenceDateIso,

      targetYear:
        monthTargetYear,

      targetMonth,

      targetDay:
        null,

      half:
        null,

      startDate:
        range.startDate,

      endDate:
        range.endDate,

      yearExplicit:
        monthYearExplicit,

      evidence: [
        ...evidence,
        `${monthTargetYear}년 ${targetMonth}월 월운 해석 대상으로 적용했다.`,
      ],

      limitations:
        [],
    };
  }

  throw new Error(
    "Life flow target scope could not be resolved.",
  );
}
