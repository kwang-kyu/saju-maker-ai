import type {
  DecisionCondition,
  DecisionEvidence,
} from "./decisionTypes.js";
import type {
  ReaderDecisionAssessment,
  ReaderDecisionConstraintLevel,
  ReaderDecisionSupportLevel,
} from "./readerDecisionAssessment.js";
import type {
  ReaderDecisionSource,
} from "./readerDecisionSelectionBuilder.js";
import type {
  QuestionTopic,
} from "../question/questionReader.js";
import type {
  DecisionEngineInput,
} from "./decisionTypes.js";

export type PredictionConclusionSource = {
  topicLabel:
    string;

  primaryStructureDescriptions:
    string[];

  strongSupportDescriptions:
    string[];

  limitationDescriptions:
    string[];

  conditionDescriptions:
    string[];

  hasSpecificTopicEvidence:
    boolean;

  supportLevel:
    ReaderDecisionSupportLevel;

  constraintLevel:
    ReaderDecisionConstraintLevel;
};

const TOPIC_PREDICTION_LABELS:
  Partial<
    Record<
      QuestionTopic,
      string
    >
  > = {
  money:
    "재물",

  business:
    "사업",

  job:
    "직장",

  marriage:
    "결혼",

  family:
    "가족",

  legal:
    "관재",

  relationship:
    "관계",

  love:
    "연애",

  health:
    "건강",

  realEstate:
    "부동산",

  lifeFlow:
    "운",

  lifeDirection:
    "인생",

  general:
    "질문",
};

const TOPIC_PRIMARY_SOURCES:
  Partial<
    Record<
      QuestionTopic,
      readonly ReaderDecisionSource[]
    >
  > = {
  money: [
    "money",
  ],

  business: [
    "capacity",
    "money",
    "career",
  ],

  job: [
    "career",
  ],

  marriage: [
    "relationship",
  ],

  relationship: [
    "relationship",
  ],

  love: [
    "relationship",
  ],

  health: [
    "health",
  ],

  lifeFlow: [
    "destiny",
  ],

  lifeDirection: [
    "destiny",
    "career",
  ],
};

function normalizeText(
  value:
    string,
): string {
  return value
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function uniqueTexts(
  values:
    readonly string[],
): string[] {
  const seen =
    new Set<string>();

  const result:
    string[] = [];

  for (const value of values) {
    const normalized =
      normalizeText(
        value,
      );

    if (
      !normalized
      || seen.has(
        normalized,
      )
    ) {
      continue;
    }

    seen.add(
      normalized,
    );

    result.push(
      normalized,
    );
  }

  return result;
}

function isPrimaryReaderSource(
  source:
    DecisionEvidence["source"],
  primarySources:
    readonly ReaderDecisionSource[],
): boolean {
  return (
    primarySources as readonly string[]
  ).includes(
    source,
  );
}

function extractSummaryDescriptions(
  evidence:
    readonly DecisionEvidence[],
  primarySources:
    readonly ReaderDecisionSource[],
): string[] {
  return uniqueTexts(
    evidence
      .filter(
        (
          item,
        ) =>
          isPrimaryReaderSource(
            item.source,
            primarySources,
          )
          && item
            .key
            .endsWith(
              "-summary",
            ),
      )
      .map(
        (
          item,
        ) =>
          item.description,
      ),
  );
}

function extractStrongSupportDescriptions(
  evidence:
    readonly DecisionEvidence[],
  primarySources:
    readonly ReaderDecisionSource[],
): string[] {
  return uniqueTexts(
    evidence
      .filter(
        (
          item,
        ) =>
          isPrimaryReaderSource(
            item.source,
            primarySources,
          )
          && !item
            .key
            .endsWith(
              "-summary",
            ),
      )
      .map(
        (
          item,
        ) =>
          item.description,
      ),
  )
    .slice(
      0,
      2,
    );
}

function extractAssessmentLimitations(
  assessment:
    ReaderDecisionAssessment,
): string[] {
  return uniqueTexts(
    assessment
      .limitations
      .flatMap(
        (
          item,
        ) =>
          item
            .limitationDescriptions,
      ),
  )
    .slice(
      0,
      2,
    );
}

function extractAssessmentConditions(
  assessment:
    ReaderDecisionAssessment,
): string[] {
  return uniqueTexts(
    assessment
      .items
      .flatMap(
        (
          item,
        ) =>
          item
            .conditionDescriptions,
      ),
  )
    .slice(
      0,
      2,
    );
}

function pickEscalationConditions(
  conditions:
    readonly DecisionCondition[],
): string[] {
  return uniqueTexts(
    conditions
      .filter(
        (
          condition,
        ) =>
          condition.required
          && !condition.satisfied,
      )
      .map(
        (
          condition,
        ) =>
          condition.description,
      ),
  )
    .slice(
      0,
      2,
    );
}

/**
 * Decision Engine이 이미 계산한 Reader Assessment·Evidence·Conditions에서
 * prediction형 결론에 사용할 기존 근거만 추출한다.
 */
export function buildPredictionConclusionSource(
  input:
    DecisionEngineInput,
  readerAssessment:
    ReaderDecisionAssessment,
  readerEvidence:
    readonly DecisionEvidence[],
  conditions:
    readonly DecisionCondition[],
): PredictionConclusionSource {
  const topic =
    input
      .question
      .topic;

  const topicLabel =
    TOPIC_PREDICTION_LABELS[
      topic
    ]
    ?? topic;

  const primarySources =
    TOPIC_PRIMARY_SOURCES[
      topic
    ]
    ?? [];

  const primaryStructureDescriptions =
    extractSummaryDescriptions(
      readerEvidence,
      primarySources,
    );

  const strongSupportDescriptions =
    extractStrongSupportDescriptions(
      readerEvidence,
      primarySources,
    );

  const limitationDescriptions =
    extractAssessmentLimitations(
      readerAssessment,
    );

  const conditionDescriptions =
    uniqueTexts(
      [
        ...extractAssessmentConditions(
          readerAssessment,
        ),

        ...pickEscalationConditions(
          conditions,
        ),
      ],
    )
      .slice(
        0,
        2,
      );

  const hasPrimaryReaderEvidence =
    primaryStructureDescriptions.length
      > 0
    || strongSupportDescriptions.length
      > 0;

  const hasSpecificTopicEvidence =
    primarySources.length
      > 0
    && hasPrimaryReaderEvidence
    && readerAssessment
      .assessedJudgementCount
      > 0
    && readerAssessment
      .supportLevel
    !== "insufficient";

  return {
    topicLabel,

    primaryStructureDescriptions,

    strongSupportDescriptions,

    limitationDescriptions,

    conditionDescriptions,

    hasSpecificTopicEvidence,

    supportLevel:
      readerAssessment
        .supportLevel,

    constraintLevel:
      readerAssessment
        .constraintLevel,
  };
}
