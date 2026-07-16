import {
    buildDecisionEngineRegressionInput,
  } from "./regression/decisionEngineRegressionFixture";
  import {
    verifyCompatibilityConditionSensitivity,
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
  
  const compatibilityResult =
    verifyCompatibilityConditionSensitivity(
      decisionInput,
    );
  
  const results = {
    readiness: readinessResult,
    lifeContext: lifeContextResult,
    compatibility: compatibilityResult,
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
    !lifeContextResult.passed ||
    !compatibilityResult.passed
  ) {
    process.exitCode = 1;
  }

  