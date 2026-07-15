import type {
    DecisionEngineInput,
    DecisionResult,
  } from "../decisionTypes";
  
  export type DecisionRegressionCase = {
    name: string;
  
    input: DecisionEngineInput;
  
    expected: DecisionResult;
  };