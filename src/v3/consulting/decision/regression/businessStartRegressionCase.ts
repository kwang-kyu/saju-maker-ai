import type {
    DecisionEngineRegressionCase,
  } from "./decisionEngineRegressionRunner.js";
  import {
    BUSINESS_START_EXPECTED_RESULT,
  } from "./decisionEngineRegressionExpectedResult.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture.js";
  
  export const BUSINESS_START_REGRESSION_CASE:
    DecisionEngineRegressionCase = {
    id: "business-start",
  
    description:
      "대상 기간 운 근거가 없는 직접 Engine 입력에서, 성장 국면의 성취형·돌파형 사람이 높은 현실 책임을 가진 상태로 통닭집 창업의 즉시 실행 시기를 물을 때 실행을 유보하는 회귀 사례",
  
    input:
      buildDecisionEngineRegressionInput(),
  
    expectedResult:
      BUSINESS_START_EXPECTED_RESULT,
  };