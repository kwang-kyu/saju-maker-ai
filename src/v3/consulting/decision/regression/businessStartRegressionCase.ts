import {
    BUSINESS_START_EXPECTED_RESULT,
  } from "./decisionEngineRegressionExpectedResult";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture";
  import type {
    DecisionEngineInput,
    DecisionResult,
  } from "../decisionTypes";
  
  export type DecisionRegressionCase = {
    name: string;
  
    input: DecisionEngineInput;
  
    expected: DecisionResult;
  };
  
  export const BUSINESS_START_REGRESSION_CASE:
    DecisionRegressionCase = {
    name: "business-start",
  
    input:
      buildDecisionEngineRegressionInput(),
  
    expected:
      BUSINESS_START_EXPECTED_RESULT,
  };