import {
  buildAsksWhat,
  buildDecisionQuestion,
} from "./questionReader.js";
import type {
  DecisionTarget,
  QuestionIntent,
  QuestionTopic,
} from "./questionReader.js";
import {
  shouldNormalizeToRelationshipReconcile,
} from "./relationshipReconcileDisambiguation.js";

const RELATIONSHIP_DOMAIN_TOPICS:
  readonly QuestionTopic[] = [
    "relationship",
    "love",
    "marriage",
    "family",
  ];

const FORWARD_RELATIONSHIP_SEPARATION_PATTERNS:
  readonly RegExp[] = [
    /관계(?:를)?\s*정리(?:하는|할|해야)?/,
    /관계(?:를)?\s*끊(?:는|을|어야)?/,
    /더\s*이상\s*만나지\s*않/,
    /그만\s*만나(?:야|는|ㄹ)?/,
    /(?:이별|결별)(?:하는|할|해야)?/,
    /헤어(?:져|지)(?:야|는|ㄹ)/,
    /결혼\s*생활(?:을)?\s*정리(?:하는|할|해야)?/,
    /이혼(?:하는|할|해야)/,
  ];

const IMPLICIT_RELATIONSHIP_SEPARATION_PATTERNS:
  readonly RegExp[] = [
    /관계(?:를)?\s*(?:정리|끊)/,
    /더\s*이상\s*만나지\s*않/,
    /그만\s*만나/,
    /(?:이별|결별)/,
    /결혼\s*생활(?:을)?\s*정리/,
  ];

/**
 * STEP 20-12-2: 명시적 comparison / option-fit frame 마커.
 * questionReader COMPARISON_OR_OPTION_FIT_DECISION_MARKERS와 동일 집합.
 * frame이 있으면 bare "이별" separation이 comparison speech-act를
 * evaluation+separate로 덮어쓰지 않도록 한다.
 */
const COMPARISON_OR_OPTION_FIT_FRAME_MARKERS:
  readonly string[] = [
    "어느 쪽",
    "어느쪽",
    "무엇이 더",
    "누가 더",
    "비교",
    "둘 중",
    "둘중",
    "중 어디",
    "중에 어디",
    "중 무엇",
    "중 어떤",
    "어느 것을",
    "어떤 것이",
    "적합",
    "추천",
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

function hasExplicitComparisonOrOptionFitFrame(
  normalizedQuestion:
    string,
): boolean {
  return COMPARISON_OR_OPTION_FIT_FRAME_MARKERS.some(
    (marker) =>
      normalizedQuestion.includes(
        marker,
      ),
  );
}

function isRelationshipDomainTopic(
  topic:
    QuestionTopic,
): boolean {
  return RELATIONSHIP_DOMAIN_TOPICS.includes(
    topic,
  );
}

export function hasForwardRelationshipSeparationSignal(
  normalizedQuestion:
    string,
): boolean {
  return matchesAnyPattern(
    normalizedQuestion,
    FORWARD_RELATIONSHIP_SEPARATION_PATTERNS,
  );
}

export function hasImplicitRelationshipSeparationContext(
  normalizedQuestion:
    string,
): boolean {
  return matchesAnyPattern(
    normalizedQuestion,
    IMPLICIT_RELATIONSHIP_SEPARATION_PATTERNS,
  );
}

export function shouldNormalizeToRelationshipSeparation(
  topic:
    QuestionTopic,
  normalizedQuestion:
    string,
): boolean {
  if (
    shouldNormalizeToRelationshipReconcile(
      topic,
      normalizedQuestion,
    )
  ) {
    return false;
  }

  // STEP 20-12-2: comparison/option-fit frame이 명시적이면
  // bare separation signal로 speech-act를 덮어쓰지 않는다.
  // pure separation(프레임 없음)은 기존과 동일하게 정규화한다.
  if (
    hasExplicitComparisonOrOptionFitFrame(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  if (
    !hasForwardRelationshipSeparationSignal(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  if (
    isRelationshipDomainTopic(
      topic,
    )
  ) {
    return true;
  }

  return hasImplicitRelationshipSeparationContext(
    normalizedQuestion,
  );
}

export type RelationshipSeparationNormalizableQuestion = {
  normalizedQuestion:
    string;

  topic:
    QuestionTopic;

  intent:
    QuestionIntent;

  decisionTarget:
    DecisionTarget;

  asksWhat:
    string;

  decisionQuestion:
    string;
};

export function applyRelationshipSeparationNormalization<
  T extends RelationshipSeparationNormalizableQuestion,
>(
  result:
    T,
): T {
  if (
    !shouldNormalizeToRelationshipSeparation(
      result.topic,
      result.normalizedQuestion,
    )
  ) {
    return result;
  }

  const intent:
    QuestionIntent =
    "evaluation";

  const decisionTarget:
    DecisionTarget =
    "separate";

  const topic:
    QuestionTopic =
    result.topic
      === "general"
    && hasImplicitRelationshipSeparationContext(
      result.normalizedQuestion,
    )
      ? "relationship"
      : result.topic;

  return {
    ...result,

    topic,

    intent,

    decisionTarget,

    asksWhat:
      buildAsksWhat(
        topic,
        intent,
      ),

    decisionQuestion:
      buildDecisionQuestion(
        decisionTarget,
        topic,
      ),
  };
}
