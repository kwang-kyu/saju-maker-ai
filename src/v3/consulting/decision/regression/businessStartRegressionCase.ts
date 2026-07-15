import type {
    DecisionEngineRegressionCase,
  } from "./decisionEngineRegressionRunner";
  import {
    BUSINESS_START_EXPECTED_RESULT,
  } from "./decisionEngineRegressionExpectedResult";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture";
  
  export const BUSINESS_START_REGRESSION_CASE:
    DecisionEngineRegressionCase = {
    id: "business-start",
  
    description:
      "성장 국면의 성취형·돌파형 사람이 높은 현실 책임을 가진 상태에서 통닭집 창업을 질문하는 회귀 사례",
  
    input:
      buildDecisionEngineRegressionInput(),
  
    expectedResult:
      BUSINESS_START_EXPECTED_RESULT,
  };