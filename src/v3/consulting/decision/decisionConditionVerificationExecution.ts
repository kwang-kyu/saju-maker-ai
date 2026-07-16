import {
    buildDecisionEngineRegressionInput,
  } from "./regression/decisionEngineRegressionFixture";
  import {
    verifyLifeContextConditionSensitivity,
    verifyReadinessConditionSensitivity,
  } from "./decisionEngineVerification";
  
  const decisionInput =
    buildDecisionEngineRegressionInput();
  
  const readinessResult =
    verifyReadinessConditionSensitivity(
      decisionInput,
    );
  
  const lifeContextResult =
    verifyLifeContextConditionSensitivity(
      decisionInput,
    );
  
  const results = {
    readiness: readinessResult,
    lifeContext: lifeContextResult,
  };
  
  console.log(
    JSON.stringify(
      results,
      null,
      2,
    ),
  );
  
  if (
    !readinessResult.passed ||
    !lifeContextResult.passed
  ) {
    process.exitCode = 1;
  }