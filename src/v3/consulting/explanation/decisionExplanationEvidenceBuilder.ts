import type {
  DecisionExplanationEvidence,
} from "./decisionResultReader.js";
import type {
  QuestionTopic,
} from "../question/questionReader.js";
import {
  selectReaderDecisionSources,
  type ReaderDecisionSource,
} from "../decision/readerDecisionSelectionBuilder.js";

const READER_SOURCES:
  readonly ReaderDecisionSource[] = [
    "capacity",
    "money",
    "career",
    "relationship",
    "health",
    "blessing",
    "destiny",
  ];

export type BuildDecisionExplanationEvidenceInput = {
  evidence:
    readonly DecisionExplanationEvidence[];

  topic:
    QuestionTopic;

  readerEffectSources:
    readonly ReaderDecisionSource[];
};

function isReaderDecisionSource(
  source:
    DecisionExplanationEvidence["source"],
): source is ReaderDecisionSource {
  return READER_SOURCES.some(
    (item) =>
      item === source,
  );
}

function isFoundationalSupportingEvidence(
  evidence:
    DecisionExplanationEvidence,
): boolean {
  switch (evidence.source) {
    case "survivalStyle":
    case "repeatedPattern":
    case "questionIntent":
      return true;
    default:
      return false;
  }
}

function uniqueReaderSources(
  sources:
    readonly ReaderDecisionSource[],
): ReaderDecisionSource[] {
  const selected:
    ReaderDecisionSource[] = [];

  for (const source of sources) {
    if (
      selected.includes(
        source,
      )
    ) {
      continue;
    }

    selected.push(
      source,
    );
  }

  return selected;
}

function selectExplanationReaderSources(
  topic:
    QuestionTopic,
  readerEffectSources:
    readonly ReaderDecisionSource[],
): ReaderDecisionSource[] {
  if (
    readerEffectSources.length
    > 0
  ) {
    return uniqueReaderSources(
      readerEffectSources,
    );
  }

  return selectReaderDecisionSources(
    topic,
  ).slice(
    0,
    2,
  );
}

function shouldIncludeEvidence(
  item:
    DecisionExplanationEvidence,
  selectedReaderSources:
    readonly ReaderDecisionSource[],
): boolean {
  if (
    item.description.trim()
      .length === 0
  ) {
    return false;
  }

  if (
    isReaderDecisionSource(
      item.source,
    )
  ) {
    return (
      item.importance
        === "core"
      && selectedReaderSources.includes(
        item.source,
      )
    );
  }

  return (
    item.importance === "core"
    || isFoundationalSupportingEvidence(
      item,
    )
  );
}

export function buildDecisionExplanationEvidence(
  input:
    BuildDecisionExplanationEvidenceInput,
): string {
  const selectedReaderSources =
    selectExplanationReaderSources(
      input.topic,
      input.readerEffectSources,
    );

  const usedDescriptions =
    new Set<string>();

  const lines:
    string[] = [];

  for (const item of input.evidence) {
    if (
      !shouldIncludeEvidence(
        item,
        selectedReaderSources,
      )
    ) {
      continue;
    }

    if (
      usedDescriptions.has(
        item.description,
      )
    ) {
      continue;
    }

    usedDescriptions.add(
      item.description,
    );
    lines.push(
      item.description,
    );
  }

  return lines.join(
    "\n",
  );
}
