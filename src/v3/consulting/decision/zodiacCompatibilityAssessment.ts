export type ZodiacEarthlyBranch =
  | "子"
  | "丑"
  | "寅"
  | "卯"
  | "辰"
  | "巳"
  | "午"
  | "未"
  | "申"
  | "酉"
  | "戌"
  | "亥";

export type ZodiacCompatibilityRelation =
  | "sixHarmony"
  | "threeHarmony"
  | "clash"
  | "harm"
  | "same"
  | "neutral"
  | "unknown";

export type ZodiacCompatibilityLevel =
  | "supportive"
  | "similar"
  | "neutral"
  | "caution"
  | "conflicted"
  | "unknown";

export type ZodiacCompatibilityAssessment = {
  available:
    boolean;

  selfBranch:
    ZodiacEarthlyBranch | null;

  counterpartBranch:
    ZodiacEarthlyBranch | null;

  selfZodiac:
    string | null;

  counterpartZodiac:
    string | null;

  relation:
    ZodiacCompatibilityRelation;

  level:
    ZodiacCompatibilityLevel;

    calculationBasis:
    "yearBranchPair" | null;

  analysisScope:
    "zodiacOnly" | null;
};

const BRANCHES:
  readonly ZodiacEarthlyBranch[] = [
    "子",
    "丑",
    "寅",
    "卯",
    "辰",
    "巳",
    "午",
    "未",
    "申",
    "酉",
    "戌",
    "亥",
  ];

const ZODIAC_LABELS:
  Record<
    ZodiacEarthlyBranch,
    string
  > = {
    子:
      "쥐띠",

    丑:
      "소띠",

    寅:
      "호랑이띠",

    卯:
      "토끼띠",

    辰:
      "용띠",

    巳:
      "뱀띠",

    午:
      "말띠",

    未:
      "양띠",

    申:
      "원숭이띠",

    酉:
      "닭띠",

    戌:
      "개띠",

    亥:
      "돼지띠",
  };

const ZODIAC_ALIASES:
  Readonly<
    Record<
      ZodiacEarthlyBranch,
      readonly string[]
    >
  > = {
    子: [
      "子",
      "쥐",
      "쥐띠",
      "rat",
      "mouse",
    ],

    丑: [
      "丑",
      "소",
      "소띠",
      "ox",
      "cow",
    ],

    寅: [
      "寅",
      "호랑이",
      "호랑이띠",
      "범",
      "범띠",
      "tiger",
    ],

    卯: [
      "卯",
      "토끼",
      "토끼띠",
      "rabbit",
      "hare",
    ],

    辰: [
      "辰",
      "용",
      "용띠",
      "dragon",
    ],

    巳: [
      "巳",
      "뱀",
      "뱀띠",
      "snake",
    ],

    午: [
      "午",
      "말",
      "말띠",
      "horse",
    ],

    未: [
      "未",
      "양",
      "양띠",
      "염소",
      "염소띠",
      "goat",
      "sheep",
    ],

    申: [
      "申",
      "원숭이",
      "원숭이띠",
      "잔나비",
      "잔나비띠",
      "monkey",
    ],

    酉: [
      "酉",
      "닭",
      "닭띠",
      "rooster",
      "chicken",
    ],

    戌: [
      "戌",
      "개",
      "개띠",
      "dog",
    ],

    亥: [
      "亥",
      "돼지",
      "돼지띠",
      "pig",
      "boar",
    ],
  };

const SIX_HARMONY_PAIRS:
  readonly string[] = [
    "子丑",
    "寅亥",
    "卯戌",
    "辰酉",
    "巳申",
    "午未",
  ];

const CLASH_PAIRS:
  readonly string[] = [
    "子午",
    "丑未",
    "寅申",
    "卯酉",
    "辰戌",
    "巳亥",
  ];

const HARM_PAIRS:
  readonly string[] = [
    "子未",
    "丑午",
    "寅巳",
    "卯辰",
    "申亥",
    "酉戌",
  ];

const THREE_HARMONY_GROUPS:
  readonly string[] = [
    "申子辰",
    "亥卯未",
    "寅午戌",
    "巳酉丑",
  ];

function normalizeAlias(
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

function resolveBranchFromAlias(
  value:
    string | undefined,
): ZodiacEarthlyBranch | null {
  if (
    !value
  ) {
    return null;
  }

  const normalizedValue =
    normalizeAlias(
      value,
    );

  for (
    const branch
    of BRANCHES
  ) {
    if (
      ZODIAC_ALIASES[
        branch
      ].some(
        (alias) =>
          normalizeAlias(
            alias,
          )
          === normalizedValue,
      )
    ) {
      return branch;
    }
  }

  return null;
}

function resolveBranchFromYearGanZhi(
  yearGanZhi:
    string | undefined,
): ZodiacEarthlyBranch | null {
  if (
    !yearGanZhi
  ) {
    return null;
  }

  return BRANCHES.find(
    (branch) =>
      yearGanZhi.includes(
        branch,
      ),
  )
  ?? null;
}

function pairMatches(
  pairs:
    readonly string[],
  left:
    ZodiacEarthlyBranch,
  right:
    ZodiacEarthlyBranch,
): boolean {
  return pairs.some(
    (pair) =>
      pair.includes(
        left,
      )
      && pair.includes(
        right,
      ),
  );
}

function resolveRelation(
  selfBranch:
    ZodiacEarthlyBranch,
  counterpartBranch:
    ZodiacEarthlyBranch,
): ZodiacCompatibilityRelation {
  if (
    selfBranch
    === counterpartBranch
  ) {
    return "same";
  }

  if (
    pairMatches(
      SIX_HARMONY_PAIRS,
      selfBranch,
      counterpartBranch,
    )
  ) {
    return "sixHarmony";
  }

  if (
    THREE_HARMONY_GROUPS.some(
      (group) =>
        group.includes(
          selfBranch,
        )
        && group.includes(
          counterpartBranch,
        ),
    )
  ) {
    return "threeHarmony";
  }

  if (
    pairMatches(
      CLASH_PAIRS,
      selfBranch,
      counterpartBranch,
    )
  ) {
    return "clash";
  }

  if (
    pairMatches(
      HARM_PAIRS,
      selfBranch,
      counterpartBranch,
    )
  ) {
    return "harm";
  }

  return "neutral";
}

function resolveLevel(
  relation:
    ZodiacCompatibilityRelation,
): ZodiacCompatibilityLevel {
  switch (
    relation
  ) {
    case "sixHarmony":
    case "threeHarmony":
      return "supportive";

    case "same":
      return "similar";

    case "harm":
      return "caution";

    case "clash":
      return "conflicted";

    case "neutral":
      return "neutral";

    case "unknown":
      return "unknown";
  }
}



export function assessZodiacCompatibility(
  input: {
    selfYearGanZhi?:
      string;

    counterpartZodiac?:
      string;
  },
): ZodiacCompatibilityAssessment {
  const selfBranch =
    resolveBranchFromYearGanZhi(
      input.selfYearGanZhi,
    );

  const counterpartBranch =
    resolveBranchFromAlias(
      input.counterpartZodiac,
    );

  if (
    selfBranch
    === null
    || counterpartBranch
    === null
  ) {
    return {
      available:
        false,

      selfBranch,

      counterpartBranch,

      selfZodiac:
        selfBranch
          ? ZODIAC_LABELS[
              selfBranch
            ]
          : null,

      counterpartZodiac:
        counterpartBranch
          ? ZODIAC_LABELS[
              counterpartBranch
            ]
          : null,

      relation:
        "unknown",

      level:
        "unknown",

        calculationBasis:
        null,

      analysisScope:
        null,
    };
  }

  const relation =
    resolveRelation(
      selfBranch,
      counterpartBranch,
    );

  const selfZodiac =
    ZODIAC_LABELS[
      selfBranch
    ];

  const counterpartZodiac =
    ZODIAC_LABELS[
      counterpartBranch
    ];

  return {
    available:
      true,

    selfBranch,

    counterpartBranch,

    selfZodiac,

    counterpartZodiac,

    relation,

    level:
      resolveLevel(
        relation,
      ),

      calculationBasis:
      "yearBranchPair",

    analysisScope:
      "zodiacOnly",
  };
}
