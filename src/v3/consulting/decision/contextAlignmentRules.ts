import type {
    ContextAlignment,
    DecisionEvidenceSource,
  } from "./decisionTypes";
  import type {
    DecisionTarget,
    QuestionIntent,
    QuestionTopic,
  } from "../question/questionReader";
  
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