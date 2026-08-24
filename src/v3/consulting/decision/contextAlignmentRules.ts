import type {
    ContextAlignment,
    DecisionEvidenceSource,
  } from "./decisionTypes.js";
  import type {
    DecisionTarget,
    QuestionIntent,
    QuestionTopic,
  } from "../question/questionReader.js";
  
  export type ContextAlignmentRule = {
    topic: QuestionTopic;
    decisionTarget: DecisionTarget;
    intent: QuestionIntent;
  
    recommendedAlignment: ContextAlignment;
    score: number;
  
    evidenceSource: DecisionEvidenceSource;
  
    description: string;
  };
  
  export const contextAlignmentRules: ContextAlignmentRule[] = [];