export type ExtractedPersonRole =
  | "self"
  | "partner"
  | "spouse"
  | "lover"
  | "businessPartner"
  | "family"
  | "employee"
  | "unknown";

export type ExtractedGender =
  | "male"
  | "female"
  | "unknown";

export type ExtractedBirthInfo = {
  year?: number;
  month?: number;
  day?: number;
  birthTime?: string;
  gender: ExtractedGender;
};

export type ExtractedPerson = {
  role: ExtractedPersonRole;
  relationshipKeyword?: string;
  birthInfo: ExtractedBirthInfo;
  sourceText: string;
};

export type QuestionEntityExtractionResult = {
  question: string;
  hasOtherPerson: boolean;
  personCount: number;
  persons: ExtractedPerson[];
};

const KOREAN_BIRTH_TIMES = [
  "자시",
  "축시",
  "인시",
  "묘시",
  "진시",
  "사시",
  "오시",
  "미시",
  "신시",
  "유시",
  "술시",
  "해시",
] as const;

const RELATIONSHIP_RULES: Array<{
  role: ExtractedPersonRole;
  keywords: string[];
}> = [
  {
    role: "businessPartner",
    keywords: [
      "동업",
      "사업파트너",
      "공동사업",
      "같이 사업",
    ],
  },
  {
    role: "spouse",
    keywords: [
      "남편",
      "아내",
      "배우자",
      "부부",
      "결혼",
    ],
  },
  {
    role: "lover",
    keywords: [
      "남자친구",
      "여자친구",
      "연인",
      "애인",
      "재혼",
    ],
  },
  {
    role: "family",
    keywords: [
      "딸",
      "아들",
      "자녀",
      "부모",
      "어머니",
      "아버지",
      "형",
      "누나",
      "언니",
      "오빠",
      "동생",
    ],
  },
  {
    role: "employee",
    keywords: [
      "직원",
      "종업원",
      "매니저",
      "점장",
    ],
  },
  {
    role: "partner",
    keywords: [
      "상대",
      "이 사람",
      "그 사람",
      "여성",
      "남성",
      "여자",
      "남자",
    ],
  },
];

function normalizeQuestion(
  question: string,
): string {
  return question
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function extractBirthDate(
  question: string,
): {
  year?: number;
  month?: number;
  day?: number;
} {
  const datePattern =
    /(?:19|20)?(\d{2})년?\s*(\d{1,2})월\s*(\d{1,2})일?/;

  const fullDatePattern =
    /((?:19|20)\d{2})년?\s*(\d{1,2})월\s*(\d{1,2})일?/;

  const fullMatch =
    question.match(
      fullDatePattern,
    );

  if (fullMatch) {
    return {
      year:
        Number(
          fullMatch[1],
        ),

      month:
        Number(
          fullMatch[2],
        ),

      day:
        Number(
          fullMatch[3],
        ),
    };
  }

  const shortMatch =
    question.match(
      datePattern,
    );

  if (!shortMatch) {
    return {};
  }

  const shortYear =
    Number(
      shortMatch[1],
    );

  return {
    year:
      shortYear >= 30
        ? 1900 + shortYear
        : 2000 + shortYear,

    month:
      Number(
        shortMatch[2],
      ),

    day:
      Number(
        shortMatch[3],
      ),
  };
}

/**
 * 24시간제 시각을 사주 12시진으로 변환한다.
 *
 * 기준
 *
 * 23:00~00:59 → 자시
 * 01:00~02:59 → 축시
 * 03:00~04:59 → 인시
 * 05:00~06:59 → 묘시
 * 07:00~08:59 → 진시
 * 09:00~10:59 → 사시
 * 11:00~12:59 → 오시
 * 13:00~14:59 → 미시
 * 15:00~16:59 → 신시
 * 17:00~18:59 → 유시
 * 19:00~20:59 → 술시
 * 21:00~22:59 → 해시
 */
function convertHourToKoreanBirthTime(
  hour: number,
): string | undefined {
  if (
    !Number.isInteger(
      hour,
    )
    || hour < 0
    || hour > 23
  ) {
    return undefined;
  }

  if (
    hour === 23
    || hour === 0
  ) {
    return "자시";
  }

  if (hour <= 2) {
    return "축시";
  }

  if (hour <= 4) {
    return "인시";
  }

  if (hour <= 6) {
    return "묘시";
  }

  if (hour <= 8) {
    return "진시";
  }

  if (hour <= 10) {
    return "사시";
  }

  if (hour <= 12) {
    return "오시";
  }

  if (hour <= 14) {
    return "미시";
  }

  if (hour <= 16) {
    return "신시";
  }

  if (hour <= 18) {
    return "유시";
  }

  if (hour <= 20) {
    return "술시";
  }

  return "해시";
}

/**
 * 질문 속 출생시간을 추출한 뒤
 * 기존 사주 엔진이 사용하는 12시진 형식으로 정규화한다.
 *
 * 예
 *
 * "신시 출생"       → 신시
 * "오후 3시 30분"  → 신시
 * "15:30 출생"     → 신시
 * "15시 30분 출생" → 신시
 * "오전 3시"       → 인시
 * "03:30"          → 인시
 */
function extractBirthTime(
  question: string,
): string | undefined {
  /*
   * 사용자가 자시·축시·인시 등
   * 시진을 직접 입력한 경우에는
   * 그 값을 가장 우선해서 사용한다.
   */
  const directKoreanBirthTime =
    KOREAN_BIRTH_TIMES.find(
      (
        birthTime,
      ) =>
        question.includes(
          birthTime,
        ),
    );

  if (
    directKoreanBirthTime
  ) {
    return directKoreanBirthTime;
  }

  /*
   * 오전 / 오후 표현
   *
   * 오전 3시 30분 → 인시
   * 오후 3시 30분 → 신시
   * 오전 12시     → 자시
   * 오후 12시     → 오시
   */
  const meridiemMatch =
    question.match(
      /(오전|오후)\s*(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/,
    );

  if (meridiemMatch) {
    const meridiem =
      meridiemMatch[1];

    let hour =
      Number(
        meridiemMatch[2],
      );

    const minute =
      Number(
        meridiemMatch[3]
        ?? 0,
      );

    if (
      hour < 1
      || hour > 12
      || minute < 0
      || minute > 59
    ) {
      return undefined;
    }

    if (
      meridiem === "오전"
      && hour === 12
    ) {
      hour = 0;
    }

    if (
      meridiem === "오후"
      && hour < 12
    ) {
      hour += 12;
    }

    return (
      convertHourToKoreanBirthTime(
        hour,
      )
    );
  }

  /*
   * HH:mm 형식
   *
   * 15:30 → 신시
   * 03:20 → 인시
   * 23:40 → 자시
   */
  const colonTimeMatch =
    question.match(
      /(?:^|[^\d])([01]?\d|2[0-3]):([0-5]\d)(?=$|[^\d])/,
    );

  if (colonTimeMatch) {
    const hour =
      Number(
        colonTimeMatch[1],
      );

    const minute =
      Number(
        colonTimeMatch[2],
      );

    if (
      minute < 0
      || minute > 59
    ) {
      return undefined;
    }

    return (
      convertHourToKoreanBirthTime(
        hour,
      )
    );
  }

  /*
   * 24시간제 한글 시각
   *
   * 15시 30분 → 신시
   * 3시 20분  → 인시
   * 23시      → 자시
   */
  const numericTimeMatch =
    question.match(
      /(?:^|[^\d])([01]?\d|2[0-3])\s*시(?:\s*(\d{1,2})\s*분)?/,
    );

  if (numericTimeMatch) {
    const hour =
      Number(
        numericTimeMatch[1],
      );

    const minute =
      Number(
        numericTimeMatch[2]
        ?? 0,
      );

    if (
      minute < 0
      || minute > 59
    ) {
      return undefined;
    }

    return (
      convertHourToKoreanBirthTime(
        hour,
      )
    );
  }

  return undefined;
}

function extractGender(
  question: string,
): ExtractedGender {
  if (
    question.includes(
      "여성",
    )
    || question.includes(
      "여자",
    )
    || question.includes(
      "여자분",
    )
    || question.includes(
      "아내",
    )
    || question.includes(
      "여자친구",
    )
  ) {
    return "female";
  }

  if (
    question.includes(
      "남성",
    )
    || question.includes(
      "남자",
    )
    || question.includes(
      "남자분",
    )
    || question.includes(
      "남편",
    )
    || question.includes(
      "남자친구",
    )
  ) {
    return "male";
  }

  return "unknown";
}

function detectRelationship(
  question: string,
): {
  role: ExtractedPersonRole;
  keyword?: string;
} {
  for (
    const rule
    of RELATIONSHIP_RULES
  ) {
    const matchedKeyword =
      rule.keywords.find(
        (
          keyword,
        ) =>
          question.includes(
            keyword,
          ),
      );

    if (matchedKeyword) {
      return {
        role:
          rule.role,

        keyword:
          matchedKeyword,
      };
    }
  }

  return {
    role:
      "unknown",
  };
}

function hasBirthInformation(
  birthInfo:
    ExtractedBirthInfo,
): boolean {
  return Boolean(
    birthInfo.year
    || birthInfo.month
    || birthInfo.day
    || birthInfo.birthTime,
  );
}

export function extractQuestionEntities(
  question: string,
): QuestionEntityExtractionResult {
  const normalizedQuestion =
    normalizeQuestion(
      question,
    );

  const birthDate =
    extractBirthDate(
      normalizedQuestion,
    );

  const birthTime =
    extractBirthTime(
      normalizedQuestion,
    );

  const gender =
    extractGender(
      normalizedQuestion,
    );

  const relationship =
    detectRelationship(
      normalizedQuestion,
    );

  const birthInfo:
    ExtractedBirthInfo = {
      ...birthDate,

      birthTime,

      gender,
    };

  const hasRelationshipPerson =
    relationship.role
    !== "unknown";

  const hasOtherPerson =
    hasBirthInformation(
      birthInfo,
    )
    || hasRelationshipPerson;

  const persons:
    ExtractedPerson[] = [
      {
        role:
          "self",

        birthInfo: {
          gender:
            "unknown",
        },

        sourceText:
          "현재 상담 사용자",
      },
    ];

  if (hasOtherPerson) {
    persons.push({
      role:
        relationship.role
        === "unknown"
          ? "partner"
          : relationship.role,

      relationshipKeyword:
        relationship.keyword,

      birthInfo,

      sourceText:
        normalizedQuestion,
    });
  }

  return {
    question:
      normalizedQuestion,

    hasOtherPerson,

    personCount:
      persons.length,

    persons,
  };
}