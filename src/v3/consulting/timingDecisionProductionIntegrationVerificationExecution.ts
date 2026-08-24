import {
    verifyTimingDecisionProductionIntegration,
  } from "./timingDecisionProductionIntegrationVerification.js";
  
  /**
   * 실제 상담 실행 경로에서
   *
   * Question
   * → Target Period Luck Flow
   * → Timing Assessment
   * → Decision Conditions
   * → Decision Result
   *
   * 연결이 유지되는지 검증한다.
   */
  const result =
    verifyTimingDecisionProductionIntegration();
  
  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );
  
  if (!result.passed) {
    process.exitCode = 1;
  }