import {
  buildAsksWhat,
  buildDecisionQuestion,
} from "./questionReader.js";
import type {
  DecisionTarget,
  QuestionIntent,
  QuestionTopic,
} from "./questionReader.js";

const RELATIONSHIP_DOMAIN_TOPICS:
  readonly QuestionTopic[] = [
    "relationship",
    "love",
    "marriage",
    "family",
  ];

const PAST_SEPARATION_PATTERNS:
  readonly RegExp[] = [
    /헤어진/,
    /헤어졌/,
    /이미\s*헤어/,
    /멀어진/,
    /관계(?:가)?\s*끊어진/,
    /결별(?:한|됐|되)/,
    /이별(?:한|됐|되)/,
    /(?:신뢰(?:가)?\s*)?깨진\s*관계/,
    /틀어진\s*관계/,
    /손상(?:된|된)\s*관계/,
    /전\s*(?:남편|아내|연인|애인|친구|파트너|배우자)/,
  ];

const RECONNECTION_PATTERNS:
  readonly RegExp[] = [
    /다시\s*(?:연락|만나)/,
    /(?:연락|만나)(?:해도|할\s*까)/,
    /(?:연락|만나)\s*(?:하는|하려)/,
    /화해(?:해도|할\s*까)?/,
    /재회/,
    /관계(?:를)?\s*회복/,
  ];

const PERMISSION_POSSIBILITY_PATTERNS:
  readonly RegExp[] = [
    /(?:해도|해도될|도)\s*될(?:까|까요)?/,
    /(?:가능|할\s*수\s*있)(?:할까|한가)/,
    /될(?:까|까요)/,
    /(?:연락|만나|화해|회복).*(?:맞을까|괜찮을까)/,
    /(?:맞을까|괜찮을까).*(?:연락|만나|화해|회복|다시)/,
  ];

const FORWARD_SEPARATION_PATTERNS:
  readonly RegExp[] = [
    /헤어(?:져|지|질|져야)/,
    /헤어지(?:는|ㄹ)/,
    /관계(?:를)?\s*정리(?:해야|할|하는)/,
    /(?:이혼|결별|이별)(?:해야|할|하는)/,
    /(?:그만|끊)(?:어야|을)/,
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

function isRelationshipDomainTopic(
  topic:
    QuestionTopic,
): boolean {
  return RELATIONSHIP_DOMAIN_TOPICS.includes(
    topic,
  );
}

export function hasPastSeparationSignal(
  normalizedQuestion:
    string,
): boolean {
  return matchesAnyPattern(
    normalizedQuestion,
    PAST_SEPARATION_PATTERNS,
  );
}

export function hasReconnectionSignal(
  normalizedQuestion:
    string,
): boolean {
  return matchesAnyPattern(
    normalizedQuestion,
    RECONNECTION_PATTERNS,
  );
}

export function hasPermissionPossibilitySignal(
  normalizedQuestion:
    string,
): boolean {
  return matchesAnyPattern(
    normalizedQuestion,
    PERMISSION_POSSIBILITY_PATTERNS,
  );
}

export function hasForwardSeparationSignal(
  normalizedQuestion:
    string,
): boolean {
  return matchesAnyPattern(
    normalizedQuestion,
    FORWARD_SEPARATION_PATTERNS,
  );
}

export function shouldNormalizeToRelationshipReconcile(
  topic:
    QuestionTopic,
  normalizedQuestion:
    string,
): boolean {
  if (
    !isRelationshipDomainTopic(
      topic,
    )
  ) {
    return false;
  }

  if (
    hasForwardSeparationSignal(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  if (
    !hasPastSeparationSignal(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  if (
    !hasReconnectionSignal(
      normalizedQuestion,
    )
  ) {
    return false;
  }

  return hasPermissionPossibilitySignal(
    normalizedQuestion,
  );
}

export type RelationshipReconcileNormalizableQuestion = {
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

export function applyRelationshipReconcileNormalization<
  T extends RelationshipReconcileNormalizableQuestion,
>(
  result:
    T,
): T {
  if (
    !shouldNormalizeToRelationshipReconcile(
      result.topic,
      result.normalizedQuestion,
    )
  ) {
    return result;
  }

  const intent:
    QuestionIntent =
    "possibility";

  const decisionTarget:
    DecisionTarget =
    "reconcile";

  return {
    ...result,

    intent,

    decisionTarget,

    asksWhat:
      buildAsksWhat(
        result.topic,
        intent,
      ),

    decisionQuestion:
      buildDecisionQuestion(
        decisionTarget,
        result.topic,
      ),
  };
}
