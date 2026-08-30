import OpenAI from "openai";

import {
  getConsultingClarificationFieldDefinition,
} from "./consultingClarificationFieldDefinitions.js";
import type {
  ConsultingClarificationRequest,
  ConsultingConfirmedField,
} from "./consultingSession.js";

export type InterpretedClarificationFact = {
  key: string;

  description: string;

  fields:
    ConsultingConfirmedField[];

  confidence: number;
};

export type InterpretedClarificationObservation = {
  key: string;

  description: string;

  rawValue: string;

  evidence: string[];
};

export type ClarificationItemResponseStatus =
  | "answered"
  | "unavailable"
  | "redirected";

export type InterpretedClarificationItemState = {
  key: string;

  status:
    ClarificationItemResponseStatus;
};

export type ConsultingClarificationResponseInterpretation = {
  confirmedFacts:
    InterpretedClarificationFact[];

  observations:
    InterpretedClarificationObservation[];

  itemStates:
    InterpretedClarificationItemState[];

  hasUnresolvedResponse:
    boolean;
};

export type ConsultingClarificationResponseInterpreterInput = {
  clarification:
    ConsultingClarificationRequest;

  response:
    string;
};

export type ConsultingClarificationResponseModelRequest = {
  systemPrompt: string;

  userPrompt: string;

  allowedKeys:
    [string, ...string[]];
};

export type ConsultingClarificationResponseRequestFunction = (
  request:
    ConsultingClarificationResponseModelRequest,
) => Promise<string>;

type ClarificationModelResponse = {
  matches:
    InterpretedClarificationFact[];
};

export class InvalidConsultingClarificationResponseError
  extends Error {
  readonly field:
    string;

  constructor(
    field:
      string,
    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      "InvalidConsultingClarificationResponseError";

    this.field =
      field;
  }
}

function requireNonEmptyString(
  value:
    unknown,
  field:
    string,
): string {
  if (
    typeof value
    !== "string"
  ) {
    throw new InvalidConsultingClarificationResponseError(
      field,
      `${field} must be a string.`,
    );
  }

  const normalizedValue =
    value.trim();

  if (
    normalizedValue.length
    === 0
  ) {
    throw new InvalidConsultingClarificationResponseError(
      field,
      `${field} must not be empty.`,
    );
  }

  return normalizedValue;
}

function requireConfidence(
  value:
    unknown,
  field:
    string,
): number {
  if (
    typeof value
    !== "number"
    || !Number.isFinite(
      value,
    )
    || value < 0
    || value > 1
  ) {
    throw new InvalidConsultingClarificationResponseError(
      field,
      `${field} must be between zero and one.`,
    );
  }

  return value;
}

const COUNTERPART_BIRTH_DATA_ITEM_KEY =
  "counterpartBirthData";

const ZODIAC_SIGN_LABELS =
  [
    "쥐띠",
    "소띠",
    "호랑이띠",
    "토끼띠",
    "용띠",
    "뱀띠",
    "말띠",
    "양띠",
    "원숭이띠",
    "닭띠",
    "개띠",
    "돼지띠",
  ] as const;

const ZODIAC_SIGN_ALIASES:
  Readonly<
    Record<
      typeof ZODIAC_SIGN_LABELS[
        number
      ],
      readonly string[]
    >
  > = {
    쥐띠: [
      "쥐",
      "쥐띠",
    ],

    소띠: [
      "소",
      "소띠",
    ],

    호랑이띠: [
      "호랑이",
      "호랑이띠",
      "범",
      "범띠",
    ],

    토끼띠: [
      "토끼",
      "토끼띠",
    ],

    용띠: [
      "용",
      "용띠",
    ],

    뱀띠: [
      "뱀",
      "뱀띠",
    ],

    말띠: [
      "말",
      "말띠",
    ],

    양띠: [
      "양",
      "양띠",
      "염소",
      "염소띠",
    ],

    원숭이띠: [
      "원숭이",
      "원숭이띠",
    ],

    닭띠: [
      "닭",
      "닭띠",
    ],

    개띠: [
      "개",
      "개띠",
    ],

    돼지띠: [
      "돼지",
      "돼지띠",
    ],
  };

function normalizeComparableToken(
  value:
    string,
): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(
      /\s+/g,
      "",
    );
}

const INCOMPLETE_BIRTH_DATE_PATTERN =
  /(\d{4})\s*년\s*(\d{1,2})\s*월(?!\s*\d{1,2}\s*일)/g;

const INCOMPLETE_BIRTH_DATE_OBSERVATION_KEY =
  "incompleteBirthDate";

/**
 * 사용자 답변에서 confirmedFacts와 별도로
 * 관찰만 추출한다.
 *
 * 연·월만 있는 날짜는 birthDate로 변환하지 않는다.
 */
export function extractClarificationObservations(
  response:
    string,
): InterpretedClarificationObservation[] {
  const observations:
    InterpretedClarificationObservation[] =
      [];

  const seenIdentities =
    new Set<string>();

  const pattern =
    new RegExp(
      INCOMPLETE_BIRTH_DATE_PATTERN.source,
      INCOMPLETE_BIRTH_DATE_PATTERN.flags,
    );

  let match:
    RegExpExecArray | null =
      pattern.exec(
        response,
      );

  while (
    match
  ) {
    const rawValue =
      match[0];

    const identity =
      [
        INCOMPLETE_BIRTH_DATE_OBSERVATION_KEY,

        normalizeComparableToken(
          rawValue,
        ),
      ].join(
        ":",
      );

    if (
      !seenIdentities.has(
        identity,
      )
    ) {
      seenIdentities.add(
        identity,
      );

      observations.push(
        {
          key:
            INCOMPLETE_BIRTH_DATE_OBSERVATION_KEY,

          description:
            "출생 연월만 언급되었고 일은 확인되지 않았다.",

          rawValue,

          evidence: [
            rawValue,
          ],
        },
      );
    }

    match =
      pattern.exec(
        response,
      );
  }

  return observations;
}

const UNAVAILABLE_CLARIFICATION_RESPONSE_PATTERNS =
  [
    /아직\s*정하지/,
    /정하지\s*않았/,
    /정해지지\s*않/,
    /답할\s*수\s*없/,
    /지금은\s*답할/,
    /아직\s*결정하지/,
    /아직\s*구체적으로/,
    /구체적으로\s*정하지/,
    /아직\s*모르/,
    /지금은\s*모르/,
    /말할\s*수\s*없/,
    /알려줄\s*수\s*없/,
    /정해\s*놓지/,
    /아직\s*안\s*정/,
    /아직\s*못\s*정/,
  ] as const;

const REDIRECTED_CLARIFICATION_RESPONSE_PATTERNS =
  [
    /자체가[\s\S]{0,24}맞는지/,
    /그게\s*아니라/,
    /궁금한\s*(건|것은|게|거)/,
    /알고\s*싶은\s*(건|것은|게|거)/,
    /맞는지가\s*궁금/,
    /수익을\s*만들\s*수\s*있는지/,
    /원래\s*질문이\s*아니라/,
    /자금(?:\s*규모)?(?:이|가|은|는)?\s*아니라/,
    /다른\s*(판단|것|걸)\s*(을\s*)?(알고\s*싶|원하)/,
  ] as const;

const CLARIFICATION_ITEM_TOPIC_PATTERNS:
  Record<
    string,
    readonly RegExp[]
  > = {
    financialExecutionCapacity: [
      /자금/,
      /자기자금/,
      /대출/,
      /비상금/,
    ],
    decisionDeadline: [
      /기한/,
      /마감/,
      /언제까지/,
      /예정일/,
    ],
  };

function matchesAnyPattern(
  value:
    string,
  patterns:
    readonly RegExp[],
): boolean {
  return patterns.some(
    (pattern) =>
      pattern.test(
        value,
      ),
  );
}

function isUnavailableClarificationResponse(
  response:
    string,
): boolean {
  return matchesAnyPattern(
    response,
    UNAVAILABLE_CLARIFICATION_RESPONSE_PATTERNS,
  );
}

function isRedirectedClarificationResponse(
  response:
    string,
): boolean {
  return matchesAnyPattern(
    response,
    REDIRECTED_CLARIFICATION_RESPONSE_PATTERNS,
  );
}

function resolveSpecificClarificationItemStatus(
  itemKey:
    string,
  response:
    string,
): ClarificationItemResponseStatus | null {
  if (
    itemKey
    === "concreteDecisionTarget"
  ) {
    if (
      isRedirectedClarificationResponse(
        response,
      )
    ) {
      return "redirected";
    }

    return null;
  }

  const topicPatterns =
    CLARIFICATION_ITEM_TOPIC_PATTERNS[
      itemKey
    ];

  if (
    !topicPatterns
    || !matchesAnyPattern(
      response,
      topicPatterns,
    )
  ) {
    return null;
  }

  if (
    isUnavailableClarificationResponse(
      response,
    )
  ) {
    return "unavailable";
  }

  if (
    isRedirectedClarificationResponse(
      response,
    )
  ) {
    return "redirected";
  }

  return null;
}

/**
 * confirmedFacts와 별도로
 * 이번 답변이 값 제공 / 답할 수 없음 / 전제 수정인지 구분한다.
 *
 * 실제로 언급된 항목만 unavailable / redirected로 두고,
 * GPT matches가 있어도 원문이 명백히 거절·전제 수정이면
 * answered로 덮어쓰지 않는다.
 * 값이 불명확한 답변은 상태를 만들지 않아 기존 재질문 경로를 유지한다.
 */
export function resolveClarificationItemStates(
  clarification:
    ConsultingClarificationRequest,
  response:
    string,
  confirmedFacts:
    readonly InterpretedClarificationFact[],
): InterpretedClarificationItemState[] {
  const itemStates:
    InterpretedClarificationItemState[] =
      [];

  const settledKeys =
    new Set<
      string
    >();

  for (
    const item
    of clarification.items
  ) {
    const specificStatus =
      resolveSpecificClarificationItemStatus(
        item.key,
        response,
      );

    if (
      specificStatus
      === "unavailable"
      || specificStatus
      === "redirected"
    ) {
      itemStates.push(
        {
          key:
            item.key,

          status:
            specificStatus,
        },
      );

      settledKeys.add(
        item.key,
      );
    }
  }

  const askedItem =
    clarification
      .items[0];

  if (
    askedItem
    && settledKeys.size
    === 0
  ) {
    if (
      isRedirectedClarificationResponse(
        response,
      )
    ) {
      itemStates.push(
        {
          key:
            askedItem.key,

          status:
            "redirected",
        },
      );

      settledKeys.add(
        askedItem.key,
      );
    } else if (
      isUnavailableClarificationResponse(
        response,
      )
    ) {
      itemStates.push(
        {
          key:
            askedItem.key,

          status:
            "unavailable",
        },
      );

      settledKeys.add(
        askedItem.key,
      );
    }
  }

  for (
    const fact
    of confirmedFacts
  ) {
    if (
      settledKeys.has(
        fact.key,
      )
    ) {
      continue;
    }

    itemStates.push(
      {
        key:
          fact.key,

        status:
          "answered",
      },
    );

    settledKeys.add(
      fact.key,
    );
  }

  return itemStates;
}

function isValidNormalizedBirthDate(
  birthDate:
    string,
): boolean {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      birthDate,
    );

  if (!match) {
    return false;
  }

  const year =
    Number(
      match[1],
    );

  const month =
    Number(
      match[2],
    );

  const day =
    Number(
      match[3],
    );

  if (
    year
    < 1900
    || month
    < 1
    || month
    > 12
    || day
    < 1
    || day
    > 31
  ) {
    return false;
  }

  const date =
    new Date(
      year,
      month - 1,
      day,
    );

  return (
    date.getFullYear()
      === year
    && date.getMonth()
      === month - 1
    && date.getDate()
      === day
  );
}

function formatBirthDateParts(
  year:
    number,
  month:
    number,
  day:
    number,
): string | null {
  if (
    !Number.isFinite(
      year,
    )
    || !Number.isFinite(
      month,
    )
    || !Number.isFinite(
      day,
    )
  ) {
    return null;
  }

  const normalizedBirthDate =
    [
      String(
        year,
      ).padStart(
        4,
        "0",
      ),
      String(
        month,
      ).padStart(
        2,
        "0",
      ),
      String(
        day,
      ).padStart(
        2,
        "0",
      ),
    ].join(
      "-",
    );

  if (
    !isValidNormalizedBirthDate(
      normalizedBirthDate,
    )
  ) {
    return null;
  }

  return normalizedBirthDate;
}

function normalizeCounterpartBirthDate(
  value:
    string,
): string | null {
  const trimmedValue =
    value.trim();

  const isoMatch =
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(
      trimmedValue,
    );

  if (
    isoMatch
  ) {
    return formatBirthDateParts(
      Number(
        isoMatch[1],
      ),
      Number(
        isoMatch[2],
      ),
      Number(
        isoMatch[3],
      ),
    );
  }

  const koreanMatch =
    trimmedValue.match(
      /(\d{4})\s*(?:년|[.\-/])\s*(?:(?:음력|양력)\s*)?(\d{1,2})\s*(?:월|[.\-/])\s*(\d{1,2})\s*일/,
    );

  if (
    koreanMatch
  ) {
    return formatBirthDateParts(
      Number(
        koreanMatch[1],
      ),
      Number(
        koreanMatch[2],
      ),
      Number(
        koreanMatch[3],
      ),
    );
  }

  const compactKoreanMatch =
    trimmedValue.match(
      /(\d{4})\s*(?:년|[.\-/])\s*(?:(?:음력|양력)\s*)?(\d{1,2})\s*(?:월|[.\-/])\s*(\d{1,2})(?:\s*일)?(?:생)?/,
    );

  if (
    compactKoreanMatch
  ) {
    return formatBirthDateParts(
      Number(
        compactKoreanMatch[1],
      ),
      Number(
        compactKoreanMatch[2],
      ),
      Number(
        compactKoreanMatch[3],
      ),
    );
  }

  return null;
}

function normalizeCounterpartCalendarType(
  value:
    string,
): "solar"
  | "lunar"
  | null {
  const normalizedValue =
    normalizeComparableToken(
      value,
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

  return null;
}

function normalizeCounterpartGender(
  value:
    string,
): "male"
  | "female"
  | null {
  const normalizedValue =
    normalizeComparableToken(
      value,
    );

  if (
    normalizedValue
    === "male"
    || normalizedValue
      === "남성"
    || normalizedValue
      === "남자"
  ) {
    return "male";
  }

  if (
    normalizedValue
    === "female"
    || normalizedValue
      === "여성"
    || normalizedValue
      === "여자"
  ) {
    return "female";
  }

  return null;
}

function normalizeCounterpartBirthTime(
  value:
    string,
): string | null {
  const trimmedValue =
    value.trim();
    const zodiacTimeMap: Record<
  string,
  string
> = {
  자시: "23:00",
  축시: "01:00",
  인시: "03:00",
  묘시: "05:00",
  진시: "07:00",
  사시: "09:00",
  오시: "11:00",
  미시: "13:00",
  신시: "15:00",
  유시: "17:00",
  술시: "19:00",
  해시: "21:00",
};

const zodiacTime =
  zodiacTimeMap[
    trimmedValue
  ];

if (
  zodiacTime
) {
  return zodiacTime;
}

  const directMatch =
    /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(
      trimmedValue,
    );

  if (
    directMatch
  ) {
    return [
      directMatch[1]
        .padStart(
          2,
          "0",
        ),
      directMatch[2],
    ].join(
      ":",
    );
  }
  const zodiacHourMap:
  Record<string, string> = {
    자시: "00:00",
    子時: "00:00",
    축시: "02:00",
    丑時: "02:00",
    인시: "04:00",
    寅時: "04:00",
    묘시: "06:00",
    卯時: "06:00",
    진시: "08:00",
    辰時: "08:00",
    사시: "10:00",
    巳時: "10:00",
    오시: "12:00",
    午時: "12:00",
    미시: "14:00",
    未時: "14:00",
    신시: "16:00",
    申時: "16:00",
    유시: "18:00",
    酉時: "18:00",
    술시: "20:00",
    戌時: "20:00",
    해시: "22:00",
    亥時: "22:00",
  };

const zodiacHour =
  zodiacHourMap[
    trimmedValue
  ];

if (
  zodiacHour
) {
  return zodiacHour;
}

  const koreanMatch =
    trimmedValue.match(
      /(오전|오후)?\s*(\d{1,2})\s*(?:시|:)\s*(\d{1,2})?\s*분?/,
    );

  if (
    !koreanMatch
  ) {
    return null;
  }

  let hour =
    Number(
      koreanMatch[2],
    );

  const minute =
    Number(
      koreanMatch[3]
      ?? "0",
    );

  if (
    !Number.isFinite(
      hour,
    )
    || !Number.isFinite(
      minute,
    )
    || hour
    < 0
    || hour
    > 23
    || minute
    < 0
    || minute
    > 59
  ) {
    return null;
  }

  const meridiem =
    koreanMatch[1];

  if (
    meridiem
    === "오후"
    && hour
    < 12
  ) {
    hour += 12;
  }

  if (
    meridiem
    === "오전"
    && hour
    === 12
  ) {
    hour = 0;
  }

  if (
    hour
    > 23
    || minute
    > 59
  ) {
    return null;
  }

  return [
    String(
      hour,
    ).padStart(
      2,
      "0",
    ),
    String(
      minute,
    ).padStart(
      2,
      "0",
    ),
  ].join(
    ":",
  );
}

function normalizeCounterpartZodiacSign(
  value:
    string,
): string | null {
  const normalizedValue =
    normalizeComparableToken(
      value,
    );

  for (
    const label
    of ZODIAC_SIGN_LABELS
  ) {
    if (
      ZODIAC_SIGN_ALIASES[
        label
      ].some(
        (alias) =>
          normalizeComparableToken(
            alias,
          )
          === normalizedValue,
      )
    ) {
      return label;
    }
  }

  return null;
}

function normalizeCounterpartBirthDataFieldValue(
  fieldKey:
    string,
  rawValue:
    string,
): string | null {
  switch (
    fieldKey
  ) {
    case "birthDate":
      return normalizeCounterpartBirthDate(
        rawValue,
      );

    case "calendarType":
      return normalizeCounterpartCalendarType(
        rawValue,
      );

    case "gender":
      return normalizeCounterpartGender(
        rawValue,
      );

    case "birthTime":
      return normalizeCounterpartBirthTime(
        rawValue,
      );

    case "zodiacSign":
      return normalizeCounterpartZodiacSign(
        rawValue,
      );

    default:
      return null;
  }
}

function requireExactEvidence(
  value:
    unknown,
  field:
    string,
  originalResponse:
    string,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    throw new InvalidConsultingClarificationResponseError(
      field,
      `${field} must be an array.`,
    );
  }

  const evidence =
    Array.from(
      new Set(
        value.map(
          (
            item,
            index,
          ) =>
            requireNonEmptyString(
              item,
              `${field}[${index}]`,
            ),
        ),
      ),
    );

  if (
    evidence.length
    === 0
  ) {
    throw new InvalidConsultingClarificationResponseError(
      field,
      `${field} must contain explicit user evidence.`,
    );
  }

  if (
    evidence.some(
      (item) =>
        !originalResponse.includes(
          item,
        ),
    )
  ) {
    throw new InvalidConsultingClarificationResponseError(
      field,
      `${field} must quote the user's response exactly.`,
    );
  }

  return evidence;
}

function parseConfirmedFields(
  value:
    unknown,
  itemKey:
    string,
  matchIndex:
    number,
  originalResponse:
    string,
): ConsultingConfirmedField[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    throw new InvalidConsultingClarificationResponseError(
      `matches[${matchIndex}].fields`,
      "Clarification fields must be an array.",
    );
  }

  if (
    value.length
    === 0
  ) {
    throw new InvalidConsultingClarificationResponseError(
      `matches[${matchIndex}].fields`,
      "At least one explicitly answered field is required.",
    );
  }

  const definition =
    getConsultingClarificationFieldDefinition(
      itemKey,
    );

  const allowedFieldKeys =
    new Set(
      definition
        .fields
        .map(
          (field) =>
            field.key,
        ),
    );

  const registeredFieldKeys =
    new Set<string>();

  const confirmedFields:
    ConsultingConfirmedField[] =
      [];

  for (
    let fieldIndex =
      0;
    fieldIndex
    < value.length;
    fieldIndex += 1
  ) {
    const fieldValue =
      value[
        fieldIndex
      ];
      if (
        typeof fieldValue
        !== "object"
        || fieldValue
        === null
        || Array.isArray(
          fieldValue,
        )
      ) {
        throw new InvalidConsultingClarificationResponseError(
          `matches[${matchIndex}].fields[${fieldIndex}]`,
          "Clarification field must be an object.",
        );
      }

      const fieldRecord =
        fieldValue as Record<
          string,
          unknown
        >;

      const key =
        requireNonEmptyString(
          fieldRecord.key,
          `matches[${matchIndex}].fields[${fieldIndex}].key`,
        );

      if (
        !allowedFieldKeys.has(
          key,
        )
      ) {
        throw new InvalidConsultingClarificationResponseError(
          `matches[${matchIndex}].fields[${fieldIndex}].key`,
          "The model returned a field that is not defined for the clarification item.",
        );
      }

      if (
        registeredFieldKeys.has(
          key,
        )
      ) {
        throw new InvalidConsultingClarificationResponseError(
          `matches[${matchIndex}].fields[${fieldIndex}].key`,
          "The model returned the same clarification field more than once.",
        );
      }

      registeredFieldKeys.add(
        key,
      );

      const rawValue =
        requireNonEmptyString(
          fieldRecord.value,
          `matches[${matchIndex}].fields[${fieldIndex}].value`,
        );

      const evidence =
        requireExactEvidence(
          fieldRecord.evidence,
          `matches[${matchIndex}].fields[${fieldIndex}].evidence`,
          originalResponse,
        );

      const normalizedValue =
        itemKey
        === COUNTERPART_BIRTH_DATA_ITEM_KEY
          ? normalizeCounterpartBirthDataFieldValue(
              key,
              rawValue,
            )
          : rawValue;

      if (
        normalizedValue
        === null
      ) {
        continue;
      }

      confirmedFields.push(
        {
          key,

          value:
            normalizedValue,

          evidence,
        },
      );
    }

  return confirmedFields;
}

function parseModelResponse(
  responseText:
    string,
  originalResponse:
    string,
  allowedKeys:
    ReadonlySet<string>,
): ClarificationModelResponse {
  const normalizedResponseText =
    requireNonEmptyString(
      responseText,
      "modelResponse",
    );

  let parsedValue:
    unknown;

  try {
    parsedValue =
      JSON.parse(
        normalizedResponseText,
      );
  } catch {
    throw new InvalidConsultingClarificationResponseError(
      "modelResponse",
      "Clarification response is not valid JSON.",
    );
  }

  if (
    typeof parsedValue
    !== "object"
    || parsedValue
    === null
    || Array.isArray(
      parsedValue,
    )
  ) {
    throw new InvalidConsultingClarificationResponseError(
      "modelResponse",
      "Clarification response must be an object.",
    );
  }

  const record =
    parsedValue as Record<
      string,
      unknown
    >;

  if (
    !Array.isArray(
      record.matches,
    )
  ) {
    throw new InvalidConsultingClarificationResponseError(
      "matches",
      "matches must be an array.",
    );
  }

  const registeredKeys =
    new Set<string>();

  const matches =
    record.matches.map(
      (
        value,
        index,
      ) => {
        if (
          typeof value
          !== "object"
          || value
          === null
          || Array.isArray(
            value,
          )
        ) {
          throw new InvalidConsultingClarificationResponseError(
            `matches[${index}]`,
            `matches[${index}] must be an object.`,
          );
        }

        const match =
          value as Record<
            string,
            unknown
          >;

        const key =
          requireNonEmptyString(
            match.key,
            `matches[${index}].key`,
          );

        if (
          !allowedKeys.has(
            key,
          )
        ) {
          throw new InvalidConsultingClarificationResponseError(
            `matches[${index}].key`,
            "The model returned a key that is not awaiting clarification.",
          );
        }

        if (
          registeredKeys.has(
            key,
          )
        ) {
          throw new InvalidConsultingClarificationResponseError(
            `matches[${index}].key`,
            "The model returned the same clarification key more than once.",
          );
        }

        registeredKeys.add(
          key,
        );

        return {
          key,

          description:
            requireNonEmptyString(
              match.description,
              `matches[${index}].description`,
            ),

          fields:
            parseConfirmedFields(
              match.fields,
              key,
              index,
              originalResponse,
            ),

          confidence:
            requireConfidence(
              match.confidence,
              `matches[${index}].confidence`,
            ),
        };
      },
    );

  return {
    matches,
  };
}

function buildAllowedKeys(
  clarification:
    ConsultingClarificationRequest,
): [string, ...string[]] {
  const keys =
    clarification
      .items
      .map(
        (item) =>
          item.key,
      );

  const [
    first,
    ...rest
  ] = keys;

  if (!first) {
    throw new InvalidConsultingClarificationResponseError(
      "clarification.items",
      "At least one clarification item is required.",
    );
  }

  if (
    new Set(
      keys,
    ).size
    !== keys.length
  ) {
    throw new InvalidConsultingClarificationResponseError(
      "clarification.items",
      "Clarification item keys must be unique.",
    );
  }

  return [
    first,
    ...rest,
  ];
}

async function requestClarificationInterpretation(
  request:
    ConsultingClarificationResponseModelRequest,
): Promise<string> {
  const client =
    new OpenAI({
      apiKey:
        process.env
          .OPENAI_API_KEY,
    });

  const response =
    await client.responses.create({
      model:
        process.env
          .OPENAI_QUESTION_INTERPRETER_MODEL
          ?.trim()
        || "gpt-5.5",

      input: [
        {
          role:
            "system",

          content:
            request.systemPrompt,
        },
        {
          role:
            "user",

          content:
            request.userPrompt,
        },
      ],

      text: {
        format: {
          type:
            "json_schema",

          name:
            "consulting_clarification_response",

          strict:
            true,

          schema: {
            type:
              "object",

            additionalProperties:
              false,

            properties: {
              matches: {
                type:
                  "array",

                items: {
                  type:
                    "object",

                  additionalProperties:
                    false,

                  properties: {
                    key: {
                      type:
                        "string",

                      enum:
                        request.allowedKeys,
                    },

                    description: {
                      type:
                        "string",
                    },

                    fields: {
                      type:
                        "array",

                      minItems:
                        1,

                      items: {
                        type:
                          "object",

                        additionalProperties:
                          false,

                        properties: {
                          key: {
                            type:
                              "string",
                          },

                          value: {
                            type:
                              "string",
                          },

                          evidence: {
                            type:
                              "array",

                            minItems:
                              1,

                            items: {
                              type:
                                "string",
                            },
                          },
                        },

                        required: [
                          "key",
                          "value",
                          "evidence",
                        ],
                      },
                    },

                    confidence: {
                      type:
                        "number",

                      minimum:
                        0,

                      maximum:
                        1,
                    },
                  },

                  required: [
                    "key",
                    "description",
                    "fields",
                    "confidence",
                  ],
                },
              },
            },

            required: [
              "matches",
            ],
          },
        },
      },
    });

  return response.output_text
    ?? "";
}

export async function interpretConsultingClarificationResponse(
  input:
    ConsultingClarificationResponseInterpreterInput,
  requestInterpretation:
    ConsultingClarificationResponseRequestFunction =
      requestClarificationInterpretation,
): Promise<ConsultingClarificationResponseInterpretation> {
  const originalResponse =
    requireNonEmptyString(
      input.response,
      "response",
    );

  const allowedKeys =
    buildAllowedKeys(
      input.clarification,
    );

  const clarificationItems =
    input
      .clarification
      .items
      .map(
        (item) => {
          const definition =
            getConsultingClarificationFieldDefinition(
              item.key,
            );

          return {
            key:
              item.key,

            description:
              item.description,

            question:
              item.question,

            fields:
              definition.fields,
          };
        },
      );

  const responseText =
    await requestInterpretation({
      allowedKeys,

      systemPrompt: `
당신은 천운문 v3의 추가정보 응답 추출기이다.

권한 제한

- 사용자의 답변을 제공된 확인 항목과 세부 필드에 연결하는 일만 한다.
- 사주, 운세, 성공 가능성, verdict, 조건 또는 위험을 판단하지 않는다.
- 사용자 답변에 없는 사실을 추측하거나 보완하지 않는다.
- 답변에 명시된 세부 필드만 반환한다.
- 아직 답하지 않은 필드는 만들지 않는다.
- 단순 숫자는 의미가 명확한 필드에만 연결한다.
- 어떤 항목 또는 필드의 답인지 불명확하면 matches에 넣지 않는다.
- 하나의 답변이 여러 필드에 명확히 답했다면 각각 추출할 수 있다.
- evidence에는 사용자 답변의 표현을 글자 그대로 인용한다.
- value에는 사용자가 밝힌 값을 의미가 달라지지 않게 정규화한다.
- counterpartBirthData 필드는 아래 표준 형식으로 정규화한다.
  - birthDate: YYYY-MM-DD
  - calendarType: solar 또는 lunar
  - gender: male 또는 female
  - birthTime: HH:mm
  - zodiacSign: 쥐띠, 소띠, 호랑이띠, 토끼띠, 용띠, 뱀띠, 말띠, 양띠, 원숭이띠, 닭띠, 개띠, 돼지띠
- 연·월·일이 모두 없는 birthDate, 표준 형식으로 정규화할 수 없는 값, 출생시간이 명시되지 않은 birthTime은 반환하지 않는다.
- description에는 이번 답변에서 확인된 사실만 간결하게 정리한다.
- confidence가 충분하지 않은 항목은 matches에서 제외한다.
`.trim(),

      userPrompt: [
        "대기 중인 확인 항목과 세부 필드:",
        JSON.stringify(
          clarificationItems,
          null,
          2,
        ),
        "",
        "사용자의 추가 답변:",
        originalResponse,
      ].join(
        "\n",
      ),
    });

  const parsedResponse =
    parseModelResponse(
      responseText,
      originalResponse,
      new Set(
        allowedKeys,
      ),
    );

  const confirmedFacts =
    parsedResponse
      .matches
      .filter(
        (match) =>
          match.fields.length
          > 0,
      )
      .filter(
        (match) =>
          match.confidence
          >= 0.85,
      );

  const observations =
    extractClarificationObservations(
      originalResponse,
    );

  const itemStates =
    resolveClarificationItemStates(
      input.clarification,
      originalResponse,
      confirmedFacts,
    );

  return {
    confirmedFacts,

    observations,

    itemStates,

    hasUnresolvedResponse:
      confirmedFacts.length
      === 0
      && !itemStates.some(
        (state) =>
          state.status
          === "unavailable"
          || state.status
          === "redirected",
      ),
  };
}
