import type {
    DecisionEngineInput,
    DecisionResult,
  } from "../decisionTypes";
  import {
    verifyDecisionEngineRegression,
    type DecisionEngineRegressionVerificationResult,
  } from "./decisionResultRegressionVerification";
  
  export type DecisionEngineRegressionCase = {
    id: string;
    description: string;
  
    input: DecisionEngineInput;
    expectedResult: DecisionResult;
  };
  
  export type DecisionEngineRegressionRunnerResult = {
    id: string;
    description: string;
  
    verification:
      DecisionEngineRegressionVerificationResult;
  
    passed: boolean;
  };
  
  /**
   * 하나의 확정된 Regression Case를 실행한다.
   *
   * Runner는 새로운 판단 기준을 생성하지 않는다.
   * Fixture가 제공한 입력과 기대 결과를
   * 기존 Regression Verification에 전달하고
   * 실행 결과만 반환한다.
   */
  export function runDecisionEngineRegression(
    regressionCase: DecisionEngineRegressionCase,
  ): DecisionEngineRegressionRunnerResult {
    const verification =
      verifyDecisionEngineRegression(
        regressionCase.input,
        regressionCase.expectedResult,
      );
  
      return {
        id: regressionCase.id,
        description: regressionCase.description,
      
        verification,
      
        passed: verification.passed,
      };
  }