export type ExtractedPersonRole =
  | "self"
  | "partner"
  | "spouse"
  | "lover"
  | "businessPartner"
  | "family"
  | "employee"
  | "unknown";

export type ExtractedGender = "male" | "female" | "unknown";

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
];

const RELATIONSHIP_RULES: Array<{
  role: ExtractedPersonRole;
  keywords: string[];
}> = [
  {
    role: "businessPartner",
    keywords: ["동업", "사업파트너", "공동사업", "같이 사업"],
  },
  {
    role: "spouse",
    keywords: ["남편", "아내", "배우자", "부부", "결혼"],
  },
  {
    role: "lover",
    keywords: ["남자친구", "여자친구", "연인", "애인", "재혼"],
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
    keywords: ["직원", "종업원", "매니저", "점장"],
  },
  {
    role: "partner",
    keywords: ["상대", "이 사람", "그 사람", "여성", "남성", "여자", "남자"],
  },
];

function normalizeQuestion(question: string): string {
  return question.replace(/\s+/g, " ").trim();
}

function extractBirthDate(question: string): {
  year?: number;
  month?: number;
  day?: number;
} {
  const datePattern =
    /(?:19|20)?(\d{2})년?\s*(\d{1,2})월\s*(\d{1,2})일?/;

  const fullDatePattern =
    /((?:19|20)\d{2})년?\s*(\d{1,2})월\s*(\d{1,2})일?/;

  const fullMatch = question.match(fullDatePattern);

  if (fullMatch) {
    return {
      year: Number(fullMatch[1]),
      month: Number(fullMatch[2]),
      day: Number(fullMatch[3]),
    };
  }

  const shortMatch = question.match(datePattern);

  if (!shortMatch) {
    return {};
  }

  const shortYear = Number(shortMatch[1]);

  return {
    year: shortYear >= 30 ? 1900 + shortYear : 2000 + shortYear,
    month: Number(shortMatch[2]),
    day: Number(shortMatch[3]),
  };
}

function extractBirthTime(question: string): string | undefined {
  return KOREAN_BIRTH_TIMES.find((birthTime) =>
    question.includes(birthTime)
  );
}

function extractGender(question: string): ExtractedGender {
  if (
    question.includes("여성") ||
    question.includes("여자") ||
    question.includes("여자분") ||
    question.includes("아내") ||
    question.includes("여자친구")
  ) {
    return "female";
  }

  if (
    question.includes("남성") ||
    question.includes("남자") ||
    question.includes("남자분") ||
    question.includes("남편") ||
    question.includes("남자친구")
  ) {
    return "male";
  }

  return "unknown";
}

function detectRelationship(question: string): {
  role: ExtractedPersonRole;
  keyword?: string;
} {
  for (const rule of RELATIONSHIP_RULES) {
    const matchedKeyword = rule.keywords.find((keyword) =>
      question.includes(keyword)
    );

    if (matchedKeyword) {
      return {
        role: rule.role,
        keyword: matchedKeyword,
      };
    }
  }

  return {
    role: "unknown",
  };
}

function hasBirthInformation(
  birthInfo: ExtractedBirthInfo
): boolean {
  return Boolean(
    birthInfo.year ||
      birthInfo.month ||
      birthInfo.day ||
      birthInfo.birthTime
  );
}

export function extractQuestionEntities(
  question: string
): QuestionEntityExtractionResult {
  const normalizedQuestion = normalizeQuestion(question);
  const birthDate = extractBirthDate(normalizedQuestion);
  const birthTime = extractBirthTime(normalizedQuestion);
  const gender = extractGender(normalizedQuestion);
  const relationship = detectRelationship(normalizedQuestion);

  const birthInfo: ExtractedBirthInfo = {
    ...birthDate,
    birthTime,
    gender,
  };

  const hasRelationshipPerson =
    relationship.role !== "unknown";

  const hasOtherPerson =
    hasBirthInformation(birthInfo) || hasRelationshipPerson;

  const persons: ExtractedPerson[] = [
    {
      role: "self",
      birthInfo: {
        gender: "unknown",
      },
      sourceText: "현재 상담 사용자",
    },
  ];

  if (hasOtherPerson) {
    persons.push({
      role:
        relationship.role === "unknown"
          ? "partner"
          : relationship.role,
      relationshipKeyword: relationship.keyword,
      birthInfo,
      sourceText: normalizedQuestion,
    });
  }

  return {
    question: normalizedQuestion,
    hasOtherPerson,
    personCount: persons.length,
    persons,
  };
}