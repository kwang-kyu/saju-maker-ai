import type {
    MasterProfileExplanation,
  } from "../../masterReader/readers/masterProfileExplanationBuilder";
  import type {
    QuestionTopic,
  } from "../question/questionReader";
  import type {
    DecisionEngineInput,
    DecisionEvidence,
    DecisionEvidenceSource,
  } from "./decisionTypes";
  
  type ReaderEvidenceSource = Extract<
    DecisionEvidenceSource,
    | "capacity"
    | "money"
    | "career"
    | "relationship"
    | "health"
    | "blessing"
    | "destiny"
  >;
  
  type ReaderExplanation = {
    summary: string;
  
    evidence: string[];
  };
  
  const TOPIC_READER_SOURCES: Record<
    QuestionTopic,
    ReaderEvidenceSource[]
  > = {
    business: [
      "capacity",
      "money",
      "career",
      "relationship",
      "destiny",
    ],
  
    money: [
      "money",
      "capacity",
      "destiny",
    ],
  
    job: [
      "career",
      "capacity",
      "destiny",
    ],
  
    realEstate: [
      "money",
      "capacity",
      "career",
      "destiny",
    ],
  
    relationship: [
      "relationship",
      "capacity",
      "destiny",
    ],
  
    love: [
      "relationship",
      "blessing",
      "destiny",
    ],
  
    marriage: [
      "relationship",
      "capacity",
      "destiny",
    ],
  
    family: [
      "relationship",
      "health",
      "destiny",
    ],
  
    health: [
      "health",
      "capacity",
    ],
  
    legal: [
      "relationship",
      "capacity",
      "destiny",
    ],
  
    lifeFlow: [
      "blessing",
      "destiny",
      "capacity",
    ],
  
    lifeDirection: [
      "destiny",
      "career",
      "capacity",
      "blessing",
    ],
  
    general: [
      "destiny",
      "capacity",
      "money",
      "career",
      "relationship",
      "health",
      "blessing",
    ],
  };
  
  function getReaderExplanation(
    explanation: MasterProfileExplanation,
    source: ReaderEvidenceSource,
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
    source: ReaderEvidenceSource,
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
    source: ReaderEvidenceSource,
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
    source: ReaderEvidenceSource,
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
      TOPIC_READER_SOURCES[
        input.question.topic
      ];
  
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