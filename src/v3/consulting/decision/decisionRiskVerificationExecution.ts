import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture";
import {
  verifyLifeContextRiskSensitivity,
} from "./decisionRiskVerification";

const decisionInput =
  buildDecisionEngineRegressionInput();

const lifeContextResult =
  verifyLifeContextRiskSensitivity(
    decisionInput,
  );

const results = {
  lifeContext: lifeContextResult,
};

console.log(
  JSON.stringify(
    results,
    null,
    2,
  ),
);

if (!lifeContextResult.passed) {
  process.exitCode = 1;
}
