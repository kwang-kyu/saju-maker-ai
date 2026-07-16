import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture";
import {
  verifyCompatibilityRiskSensitivity,
  verifyContextAlignmentRiskSensitivity,
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

const contextAlignmentResult =
  verifyContextAlignmentRiskSensitivity(
    decisionInput,
  );

const results = {
  lifeContext: lifeContextResult,
  compatibility: compatibilityResult,
  contextAlignment: contextAlignmentResult,
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
  !compatibilityResult.passed ||
  !contextAlignmentResult.passed
) {
  process.exitCode = 1;
}