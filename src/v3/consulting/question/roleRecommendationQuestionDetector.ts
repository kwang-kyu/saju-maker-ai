import type {
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntent,
  QuestionMotive,
  QuestionTopic,
} from "./questionReader";

const ROLE_RECOMMENDATION_EXCLUSION_PATTERNS:
  readonly RegExp[] = [
    /그\s*(역할|배역)\s*(을\s*)?맡/,
    /(역할|배역)\s*(을\s*)?맡아\s*도/,
    /(역할|배역).*(맡아|맡을|맡으)/,
    /배우\s*(를\s*)?(시작|해도|전향)/,
    /연기\s*(를\s*)?(시작|해도)/,
    /언제\s*(연기|배우)/,
    /(시작|전향)\s*(해도|할\s*까)/,
    /(회사|직장|조직|팀|업무).*(역할|배역)/,
  ];

const EXPLICIT_CHARACTER_ARCHETYPE_TERM_PATTERN =
  /(배역|캐릭터|주인공|악역|조연|단역)/;

const ROLE_RECOMMENDATION_EXPRESSION_PATTERNS:
  readonly RegExp[] = [
    /어떤\s*(역할|배역|캐릭터|인물)/,
    /무슨\s*(역할|배역|캐릭터|인물)/,
    /어느\s*(역할|배역|캐릭터|인물)/,
    /(역할|배역|캐릭터)\s*(이|가)\s*(어울|맞|좋)/,
    /(주인공|악역|조연|단역).*(맞|어울|어느|어떤|무슨)/,
    /(어떤|무슨|어느).*(주인공|악역|조연|단역)/,
    /캐릭터로\s*표현/,
    /성격.*(캐릭터|역할|인물)/,
    /(인물|캐릭터).*(나온다면|한다면|했을\s*때)/,
    /(나온다면|한다면|했을\s*때).*(어떤|무슨).*(역할|배역|캐릭터|인물)/,
    /(역할|배역).*(나온다면|한다면|하면)/,
  ];

const EXPLICIT_CHARACTER_ARCHETYPE_EXPRESSION_PATTERNS:
  readonly RegExp[] = [
    /어떤\s*(배역|캐릭터|인물)/,
    /무슨\s*(배역|캐릭터|인물)/,
    /어느\s*(배역|캐릭터|인물)/,
    /(배역|캐릭터)\s*(이|가)\s*(어울|맞|좋)/,
    /(주인공|악역|조연|단역).*(맞|어울|어느|어떤|무슨)/,
    /(어떤|무슨|어느).*(주인공|악역|조연|단역)/,
    /캐릭터로\s*표현/,
    /성격.*(캐릭터|인물)/,
    /(인물|캐릭터).*(나온다면|한다면|했을\s*때)/,
    /(나온다면|한다면|했을\s*때).*(어떤|무슨).*(배역|캐릭터|인물)/,
    /(배역).*(나온다면|한다면|하면)/,
  ];

const PERFORMANCE_OR_NARRATIVE_CONTEXT_PATTERNS:
  readonly RegExp[] = [
    /(영화|드라마|연극|무대|공연)/,
    /(배우|연기)/,
    /(작품|이야기|소설|웹툰)/,
    /속\s*인물/,
  ];

function matchesAnyPattern(
  normalizedQuestion:
    string,
  patterns:
    readonly RegExp[],
): boolean {
  return patterns.some(
    (pattern) =>
      pattern.test(
        normalizedQuestion,
      ),
  );
}

export function hasRoleRecommendationExpression(
  normalizedQuestion:
    string,
): boolean {
  return matchesAnyPattern(
    normalizedQuestion,
    ROLE_RECOMMENDATION_EXPRESSION_PATTERNS,
  );
}

export function hasPerformanceOrNarrativeContext(
  normalizedQuestion:
    string,
): boolean {
  if (
    EXPLICIT_CHARACTER_ARCHETYPE_TERM_PATTERN.test(
      normalizedQuestion,
    )
  ) {
    return true;
  }

  return matchesAnyPattern(
    normalizedQuestion,
    PERFORMANCE_OR_NARRATIVE_CONTEXT_PATTERNS,
  );
}

export function isExplicitCharacterArchetypeQuestion(
  normalizedQuestion:
    string,
): boolean {
  const hasExplicitCharacterTerm =
    EXPLICIT_CHARACTER_ARCHETYPE_TERM_PATTERN.test(
      normalizedQuestion,
    );

  const hasCharacterPersonExpression =
    /(캐릭터로\s*표현|성격.*인물|인물.*(나온다면|한다면|했을\s*때)|(나온다면|한다면|했을\s*때).*인물|어떤\s*인물|무슨\s*인물|어느\s*인물)/.test(
      normalizedQuestion,
    );

  if (
    !hasExplicitCharacterTerm
    && !hasCharacterPersonExpression
  ) {
    return false;
  }

  return matchesAnyPattern(
    normalizedQuestion,
    EXPLICIT_CHARACTER_ARCHETYPE_EXPRESSION_PATTERNS,
  );
}

export function isRoleRecommendationQuestion(
  normalizedQuestion:
    string,
): boolean {
  if (
    matchesAnyPattern(
      normalizedQuestion,
      ROLE_RECOMMENDATION_EXCLUSION_PATTERNS,
    )
  ) {
    return false;
  }

  if (
    isExplicitCharacterArchetypeQuestion(
      normalizedQuestion,
    )
  ) {
    return true;
  }

  return (
    hasRoleRecommendationExpression(
      normalizedQuestion,
    )
    && hasPerformanceOrNarrativeContext(
      normalizedQuestion,
    )
  );
}

export function buildRoleRecommendationDecisionQuestion():
  string {
  return "이 사람의 사주 성격에 가장 잘 맞는 역할·배역은 무엇인가";
}

export function buildRoleRecommendationAsksWhat(
  topic:
    QuestionTopic,
): string {
  const topicText: Partial<
    Record<
      QuestionTopic,
      string
    >
  > = {
    job:
      "직업과 활동 영역에서 자신의 성격에 맞는 역할·배역이 무엇인지",

    lifeDirection:
      "삶의 방향을 캐릭터·역할로 표현했을 때 어떤 인물상에 가까운지",

    general:
      "자신의 성격에 맞는 역할·배역·캐릭터가 무엇인지",
  };

  const subject =
    topicText[topic]
    ?? topicText.general!;

  return `${subject}를 묻고 있다.`;
}

export function buildRoleRecommendationAsksWhy():
  string {
  return "자신의 반복되는 성향과 삶의 원인을 이해하려는 질문이다.";
}

export type RoleRecommendationNormalizableQuestion = {
  normalizedQuestion:
    string;

  topic:
    QuestionTopic;

  intent:
    QuestionIntent;

  motive:
    QuestionMotive;

  decisionTarget:
    DecisionTarget;

  analysisMode:
    QuestionAnalysisMode;

  asksWhat:
    string;

  asksWhy:
    string;

  decisionQuestion:
    string;
};

export function applyRoleRecommendationNormalization<
  T extends RoleRecommendationNormalizableQuestion,
>(
  result:
    T,
): T {
  if (
    !isRoleRecommendationQuestion(
      result.normalizedQuestion,
    )
  ) {
    return result;
  }

  return {
    ...result,

    analysisMode:
      "interpretation",

    decisionTarget:
      "none",

    motive:
      "selfUnderstanding",

    intent:
      "reason",

    asksWhat:
      buildRoleRecommendationAsksWhat(
        result.topic,
      ),

    asksWhy:
      buildRoleRecommendationAsksWhy(),

    decisionQuestion:
      buildRoleRecommendationDecisionQuestion(),
  };
}
