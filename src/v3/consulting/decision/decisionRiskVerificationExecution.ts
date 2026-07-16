import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture";
import {
  verifyCompatibilityRiskSensitivity,
  verifyLifeContextRiskSensitivity,
} from "./decisionRiskVerification";

const decisionInput =
  buildDecisionEngineRegressionInput();

const lifeContextResult =
  verifyLifeContextRiskSensitivity(
    decisionInput,
  );

const compatibilityResult =
  verifyCompatibilityRiskSensitivity(
    decisionInput,
  );

const results = {
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
  !lifeContextResult.passed ||
  !compatibilityResult.passed
) {
  process.exitCode = 1;
}