import type {
    QuestionTopic,
  } from "../question/questionReader";
  
  export type ReaderDecisionSource =
    | "capacity"
    | "money"
    | "career"
    | "relationship"
    | "health"
    | "blessing"
    | "destiny";
  
  const TOPIC_READER_SOURCES: Record<
    QuestionTopic,
    ReaderDecisionSource[]
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
  
  export function selectReaderDecisionSources(
    topic: QuestionTopic,
  ): ReaderDecisionSource[] {
    return [
      ...TOPIC_READER_SOURCES[
        topic
      ],
    ];
  }