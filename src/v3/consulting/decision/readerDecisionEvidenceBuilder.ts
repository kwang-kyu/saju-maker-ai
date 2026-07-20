import type {
    MasterProfileExplanation,
  } from "../../masterReader/readers/masterProfileExplanationBuilder";
  import type {
    DecisionEngineInput,
    DecisionEvidence,
  } from "./decisionTypes";
  import {
    selectReaderDecisionSources,
    type ReaderDecisionSource,
  } from "./readerDecisionSelectionBuilder";
  
  type ReaderExplanation = {
    summary: string;
  
    evidence: string[];
  };
  
  function getReaderExplanation(
    explanation: MasterProfileExplanation,
    source: ReaderDecisionSource,
  ): ReaderExplanation {
    switch (source) {
      case "capacity":
        return explanation.capacity;
  
      case "money":
        return explanation.money;
  
      case "career":
        return explanation.career;
  
      case "relationship":
        return explanation.relationship;
  
      case "health":
        return explanation.health;
  
      case "blessing":
        return explanation.blessing;
  
      case "destiny":
        return explanation.destiny;
    }
  }
  
  function buildSummaryEvidence(
    source: ReaderDecisionSource,
    explanation: ReaderExplanation,
  ): DecisionEvidence[] {
    const summary =
      explanation.summary.trim();
  
    if (!summary) {
      return [];
    }
  
    return [
      {
        source,
  
        key: `${source}-summary`,
  
        description: summary,
  
        weight: 4,
      },
    ];
  }
  
  function buildCoreEvidence(
    source: ReaderDecisionSource,
    explanation: ReaderExplanation,
  ): DecisionEvidence[] {
    return explanation.evidence.flatMap(
      (
        description,
        index,
      ): DecisionEvidence[] => {
        const normalizedDescription =
          description.trim();
  
        if (!normalizedDescription) {
          return [];
        }
  
        return [
          {
            source,
  
            key:
              `${source}-evidence-${index + 1}`,
  
            description:
              normalizedDescription,
  
            weight: 3,
          },
        ];
      },
    );
  }
  
  function buildReaderEvidence(
    source: ReaderDecisionSource,
    explanation: MasterProfileExplanation,
  ): DecisionEvidence[] {
    const readerExplanation =
      getReaderExplanation(
        explanation,
        source,
      );
  
    return [
      ...buildSummaryEvidence(
        source,
        readerExplanation,
      ),
  
      ...buildCoreEvidence(
        source,
        readerExplanation,
      ),
    ];
  }
  
  export function buildReaderDecisionEvidence(
    input: DecisionEngineInput,
  ): DecisionEvidence[] {
    const sources =
      selectReaderDecisionSources(
        input.question.topic,
      );
  
    const explanation =
      input.humanContext
        .identity
        .explanation;
  
    return sources.flatMap(
      (source) =>
        buildReaderEvidence(
          source,
          explanation,
        ),
    );
  }