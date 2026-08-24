import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture.js";
import {
  verifyCompatibilityRiskSensitivity,
  verifyContextAlignmentRiskSensitivity,
  verifyLifeContextRiskSensitivity,
  verifyRepeatedPatternRiskSensitivity,
  verifyUrgencyRiskSensitivity,
} from "./decisionRiskVerification.js";

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

const urgencyResult =
  verifyUrgencyRiskSensitivity(
    decisionInput,
  );

  const repeatedPatternResult =
  verifyRepeatedPatternRiskSensitivity(
    decisionInput,
  );
const results = {
  lifeContext: lifeContextResult,
  compatibility: compatibilityResult,
  contextAlignment: contextAlignmentResult,
  urgency: urgencyResult,
  repeatedPattern: repeatedPatternResult,
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
  !contextAlignmentResult.passed ||
  !urgencyResult.passed
) {
  process.exitCode = 1;
}