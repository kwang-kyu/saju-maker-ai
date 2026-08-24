import {
    buildDecisionEngineRegressionInput,
  } from "./regression/decisionEngineRegressionFixture.js";
  import {
    verifyTimingAssessment,
  } from "./timingAssessmentVerification.js";
  
  /**
   * TimingAssessment 단독 검증 실행.
   *
   * 빈 객체를 HumanDestinyContext로 강제 캐스팅하지 않고,
   * Decision Engine regression fixture가 구성한
   * HumanDestinyContext를 그대로 사용한다.
   */
  const regressionInput =
    buildDecisionEngineRegressionInput();
  
  const result =
    verifyTimingAssessment(
      regressionInput.humanContext,
    );
  
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